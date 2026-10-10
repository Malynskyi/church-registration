import express from "express";
import cors from "cors";

import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend работает 🚀");
});

app.post("/api/families", async (req, res) => {
    try {
        const family = req.body;

        await pool.query(
            `
      INSERT INTO families (
        father_first_name,
        father_last_name,
        father_phone,
        mother_first_name,
        mother_last_name,
        mother_phone,
        children
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
            [
                family.father.firstName,
                family.father.lastName,
                family.father.phone,

                family.mother.firstName,
                family.mother.lastName,
                family.mother.phone,

                JSON.stringify(family.children),
            ]
        );

        res.status(201).json({
            message:
                "Спасибо! Ваша семья успешно зарегистрирована.",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Ошибка сервера",
        });
    }
});

app.get("/api/families", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM families ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Ошибка сервера",
        });
    }
});


app.delete("/api/families/:id", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM families WHERE id = $1",
            [req.params.id]
        );

        res.json({
            message: "Семья удалена",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Ошибка сервера",
        });
    }
});

app.delete("/api/families/:id", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM families WHERE id = $1",
            [req.params.id]
        );

        res.json({
            message: "Семья удалена",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Ошибка сервера",
        });
    }
});

app.listen(3000, () => {
    console.log("Сервер запущен на порту 3000");
});