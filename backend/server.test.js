import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import { createApp } from "./server.js";

async function withServer(database, run) {
    const server = createApp(database).listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();

    try {
        await run(`http://127.0.0.1:${address.port}`);
    } finally {
        server.close();
        await once(server, "close");
    }
}

function validFamily(overrides = {}) {
    return {
        adults: 2,
        children: ["7"],
        phone: "",
        ...overrides,
    };
}

test("valid registration uses the existing INSERT and column contract", async () => {
    let query;
    const database = {
        async query(sql, values) {
            query = { sql, values };
        },
    };

    await withServer(database, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/families`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(validFamily()),
        });

        assert.equal(response.status, 201);
        assert.deepEqual(query.values, ["", "", "", "", "", "", '["7"]', 2]);
        assert.match(query.sql, /INSERT INTO families/);
    });
});

test("invalid registration is rejected before the database is called", async () => {
    let queryCount = 0;
    const database = {
        async query() {
            queryCount += 1;
        },
    };

    await withServer(database, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/families`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(validFamily({ children: [""] })),
        });
        const body = await response.json();

        assert.equal(response.status, 400);
        assert.match(body.message, /возраст/i);
        assert.equal(queryCount, 0);
    });
});

test("matching idempotency keys coalesce duplicate requests", async () => {
    let queryCount = 0;
    const database = {
        async query() {
            queryCount += 1;
            await new Promise((resolve) => setTimeout(resolve, 30));
        },
    };

    await withServer(database, async (baseUrl) => {
        const makeRequest = () => fetch(`${baseUrl}/api/families`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Idempotency-Key": "same-attempt",
            },
            body: JSON.stringify(validFamily()),
        });
        const responses = await Promise.all([makeRequest(), makeRequest()]);

        assert.deepEqual(responses.map((response) => response.status), [201, 201]);
        assert.equal(queryCount, 1);
    });
});

test("an idempotency key cannot be reused for a different family payload", async () => {
    let queryCount = 0;
    const database = {
        async query() {
            queryCount += 1;
        },
    };

    await withServer(database, async (baseUrl) => {
        const send = (family) => fetch(`${baseUrl}/api/families`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Idempotency-Key": "one-attempt",
            },
            body: JSON.stringify(family),
        });
        const firstResponse = await send(validFamily());
        const secondResponse = await send(validFamily({ adults: 3 }));

        assert.equal(firstResponse.status, 201);
        assert.equal(secondResponse.status, 409);
        assert.equal(queryCount, 1);
    });
});

test("database schema errors return a useful safe message", async () => {
    const database = {
        async query() {
            throw Object.assign(new Error("relation families does not exist"), {
                code: "42P01",
            });
        },
    };

    await withServer(database, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/families`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(validFamily()),
        });
        const body = await response.json();

        assert.equal(response.status, 500);
        assert.match(body.message, /конфигурация базы данных/i);
        assert.ok(body.requestId);
        assert.doesNotMatch(body.message, /relation families/);
    });
});