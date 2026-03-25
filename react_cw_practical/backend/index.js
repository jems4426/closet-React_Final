console.log("Starting backend...");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "react_form_db",
  password: "6355560059",
  port: 5432,
});

// Test DB connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ DB connected");
  }
});

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3)",
      [name, email, password]
    );
    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ error: "User already exists" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND password=$2",
    [email, password]
  );

  if (result.rows.length > 0) {
    res.json({ success: true, user: result.rows[0] });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


// START SERVER
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
