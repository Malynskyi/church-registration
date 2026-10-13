import express from "express";
import cors from "cors";
import { createHash, randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

import { pool } from "./db.js";

const IDEMPOTENCY_TTL_MS = 15 * 60 * 1000;
const INSERT_FAMILY_SQL = `
  INSERT INTO families (
    father_first_name,
    father_last_name,
    father_phone,
    mother_first_name,
    mother_last_name,
    mother_phone,
    children,
    adults
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
`;

function validateFamily(family) {
    if (!family || typeof family !== "object" || Array.isArray(family)) {
        return "Некорректные данные регистрации.";
    }

    const adults = family.adults === undefined ? 1 : Number(family.adults);
    if (!Number.isInteger(adults) || adults < 1) {
        return "Укажите корректное количество взрослых.";
    }

    if (!Array.isArray(family.children)) {
        return "Укажите список детей, даже если детей нет.";
    }

    const hasInvalidAge = family.children.some((age) => {
        if (age === null || age === undefined || String(age).trim() === "") {
            return true;
        }

        const numericAge = Number(age);
        return !Number.isInteger(numericAge) || numericAge < 0 || numericAge > 18;
    });

    if (hasInvalidAge) {
        return "Укажите возраст каждого ребенка числом от 0 до 18.";
    }

    if (family.phone !== undefined && typeof family.phone !== "string") {
        return "Некорректный формат номера телефона.";
    }

    return null;
}

function getDatabaseError(error) {
    if (error.code === "23505") {
        return {
            status: 409,
            message: "Регистрация не сохранена из-за ограничения базы данных. Обратитесь к организатору.",
        };
    }

    if (["22P02", "22003"].includes(error.code)) {
        return {
            status: 400,
            message: "Некорректные значения в регистрации. Проверьте количество взрослых и возраст детей.",
        };
    }

    if (["42P01", "42703"].includes(error.code)) {
        return {
            status: 500,
            message: "Не удалось сохранить регистрацию: серверная конфигурация базы данных требует проверки.",
        };
    }

    if (error.code?.startsWith("08") || ["28P01", "3D000"].includes(error.code)) {
        return {
            status: 503,
            message: "База данных временно недоступна. Попробуйте позже.",
        };
    }

    return {
        status: 500,
        message: "Не удалось сохранить регистрацию. Попробуйте позже и сообщите код ошибки организатору.",
    };
}

export function createApp(database = pool) {
    const app = express();
    const idempotencyCache = new Map();

    app.use(cors());
    app.use(express.json());

    app.get("/", (req, res) => {
        res.send("Backend работает 🚀");
    });

    app.post("/api/families", async (req, res) => {
        const requestId = randomUUID();
        const family = req.body;
        const validationError = validateFamily(family);
        if (validationError) {
            return res.status(400).json({ message: validationError, requestId });
        }

        const idempotencyKey = req.get("Idempotency-Key");
        if (idempotencyKey && idempotencyKey.length > 128) {
            return res.status(400).json({
                message: "Некорректный ключ запроса. Обновите страницу и попробуйте ещё раз.",
                requestId,
            });
        }

        const normalizedFamily = {
            adults: family.adults === undefined ? 1 : Number(family.adults),
            children: family.children,
            phone: family.phone || "",
        };
        const fingerprint = createHash("sha256")
            .update(JSON.stringify(normalizedFamily))
            .digest("hex");
        const now = Date.now();
        for (const [key, entry] of idempotencyCache) {
            if (!entry.promise && entry.expiresAt <= now) {
                idempotencyCache.delete(key);
            }
        }

        const insertFamily = async () => {
            await database.query(INSERT_FAMILY_SQL, [
                "",
                "",
                normalizedFamily.phone,
                "",
                "",
                "",
                JSON.stringify(normalizedFamily.children),
                normalizedFamily.adults,
            ]);

            return {
                status: 201,
                body: { message: "Спасибо! Ваша семья успешно зарегистрирована." },
            };
        };

        let cacheEntry;
        try {
            let result;
            if (idempotencyKey) {
                cacheEntry = idempotencyCache.get(idempotencyKey);
                if (cacheEntry && cacheEntry.fingerprint !== fingerprint) {
                    return res.status(409).json({
                        message: "Ключ уже использован для другой регистрации. Обновите страницу и попробуйте ещё раз.",
                        requestId,
                    });
                }

                if (cacheEntry) {
                    result = cacheEntry.result || await cacheEntry.promise;
                } else {
                    cacheEntry = { fingerprint, promise: null, result: null, expiresAt: 0 };
                    cacheEntry.promise = insertFamily();
                    idempotencyCache.set(idempotencyKey, cacheEntry);
                    try {
                        result = await cacheEntry.promise;
                        cacheEntry.result = result;
                        cacheEntry.promise = null;
                        cacheEntry.expiresAt = Date.now() + IDEMPOTENCY_TTL_MS;
                    } catch (error) {
                        if (idempotencyCache.get(idempotencyKey) === cacheEntry) {
                            idempotencyCache.delete(idempotencyKey);
                        }
                        throw error;
                    }
                }
            } else {
                result = await insertFamily();
            }

            return res.status(result.status).json(result.body);
        } catch (error) {
            console.error(`POST ERROR [${requestId}]:`, error);
            const response = getDatabaseError(error);
            return res.status(response.status).json({
                message: response.message,
                requestId,
            });
        }
    });

    app.get("/api/families", async (req, res) => {
        try {
            const result = await database.query(
                "SELECT * FROM families ORDER BY id DESC"
            );

            res.json(result.rows);
        } catch (error) {
            console.error("GET FAMILIES ERROR:", error);
            res.status(500).json({
                message: "Не удалось загрузить регистрации. Попробуйте позже.",
            });
        }
    });

    app.delete("/api/families/:id", async (req, res) => {
        try {
            await database.query(
                "DELETE FROM families WHERE id = $1",
                [req.params.id]
            );

            res.json({ message: "Семья удалена" });
        } catch (error) {
            console.error("DELETE FAMILY ERROR:", error);
            res.status(500).json({
                message: "Не удалось удалить регистрацию.",
            });
        }
    });

    app.use((error, req, res, next) => {
        if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
            return res.status(400).json({
                message: "Некорректный формат запроса. Обновите страницу и попробуйте ещё раз.",
            });
        }

        return next(error);
    });

    return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const app = createApp();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Сервер запущен на порту ${port}`);
    });
}