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

const requireAuth = (req, res, next) => {
    const password = req.headers['admin-password'];
    if (password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};