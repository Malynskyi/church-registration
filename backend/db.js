import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
    user: "dimamalynskyi",
    host: "localhost",
    database: "church_registration",
    port: 5432,
});

pool.query("SELECT NOW()")
    .then(() => console.log("✅ PostgreSQL подключен"))
    .catch((err) => console.error(err));