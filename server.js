import express from 'express';
import mariadb from 'mariadb';
import cors from 'cors';

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = "admin123";

app.use(cors());
app.use(express.json());

// Serve files from the public directory
app.use(express.static('public'));

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'shashwat3110',
    database: 'visitor_log',
    connectionLimit: 5
});

async function initDB() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to MariaDB successfully!");

        await conn.query(`
            CREATE TABLE IF NOT EXISTS visitors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                phone VARCHAR(20),
                host_name VARCHAR(255),
                purpose TEXT,
                entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                exit_time DATETIME
            )
        `);
    } catch (err) {
        console.error("Error connecting to database:", err);
    } finally {
        if (conn) conn.release();
    }
}
initDB();

const requireAuth = (req, res, next) => {
    const password = req.headers['admin-password'];
    if (password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

app.post('/api/visit', async (req, res) => {
    const { name, phone, host_name, purpose } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();

        const sql = `INSERT INTO visitors (name, phone, host_name, purpose, entry_time)
                     VALUES (?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL '05:30' HOUR_MINUTE))`;

        const result = await conn.query(sql, [name, phone, host_name, purpose]);

        res.json({ message: "Visitor Logged Successfully!", id: result.insertId.toString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/exit/:id', async (req, res) => {
    const id = req.params.id;
    let conn;
    try {
        conn = await pool.getConnection();

        const sql = `UPDATE visitors SET exit_time = DATE_ADD(UTC_TIMESTAMP(), INTERVAL '05:30' HOUR_MINUTE) WHERE id = ?`;

        await conn.query(sql, [id]);
        res.json({ message: "Visitor Signed Out" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/visitors', requireAuth, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM visitors ORDER BY entry_time DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});