import express from 'express';
import mariadb from 'mariadb';
import cors from 'cors';

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = "admin123";

app.use(cors());
app.use(express.json());

// --- SERVE FRONTEND FILES ---
// This tells the server to look in the "public" folder for index.html, style.css, etc.
app.use(express.static('public'));

// --- 1. DATABASE CONNECTION SETUP ---
// This creates a "Pool" of connections to your MariaDB server
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'shashwat3110',
    database: 'visitor_log',
    connectionLimit: 5
});

// --- 2. INITIALIZE TABLE (Run once on start) ---
async function initDB() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to MariaDB successfully!");

        // SQL for MariaDB
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
        if (conn) conn.release(); // Release connection back to pool
    }
}
initDB();

// --- MIDDLEWARE ---
const requireAuth = (req, res, next) => {
    const password = req.headers['admin-password'];
    if (password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// --- ROUTES ---

// Route 1: Log Visitor
app.post('/api/visit', async (req, res) => {
    const { name, phone, host_name, purpose } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();

        // Use DATE_ADD(UTC_TIMESTAMP(), ...) to force IST (+5:30)
        const sql = `INSERT INTO visitors (name, phone, host_name, purpose, entry_time)
                     VALUES (?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL '05:30' HOUR_MINUTE))`;

        const result = await conn.query(sql, [name, phone, host_name, purpose]);

        // result.insertId is a BigInt in MariaDB, convert to string for JSON
        res.json({ message: "Visitor Logged Successfully!", id: result.insertId.toString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// Route 2: Sign Out Visitor
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

// Route 3: Get All Visitors (Protected)
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

// Route 4: Delete All (Protected)
app.delete('/api/visitors', requireAuth, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("TRUNCATE TABLE visitors");
        res.json({ message: "All records deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});