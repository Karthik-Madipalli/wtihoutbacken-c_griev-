// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(".")); // serve your html/css/js

// adjust with your credentials
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "c_girevance",
  password: "bhanu@123",
  port: 5432
});

// ---------- AUTH (students + staff) ----------

// signup for student
app.post("/api/signup/student", async (req, res) => {
  const { roll, mail, name, pswd, mobile } = req.body;
  try {
    const q = `
      INSERT INTO students (roll, mail, name, pswd, mobile)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING roll
    `;
    const result = await pool.query(q, [roll, mail, name, pswd, mobile]);
    res.json({ success: true, roll: result.rows[0].roll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Signup failed" });
  }
});

// login (both student and staff)
app.post("/api/login", async (req, res) => {
  const { role, username, password } = req.body;
  try {
    let q, params;
    if (role === "student") {
      q = "SELECT roll, name FROM students WHERE roll = $1 AND pswd = $2";
      params = [username, password];
    } else {
      q = "SELECT emp_id, name FROM staff WHERE emp_id = $1 AND pswd = $2";
      params = [username, password];
    }
    const result = await pool.query(q, params);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Login error" });
  }
});

// ---------- COMPLAINTS ----------

// register complaint
app.post("/api/complaints", async (req, res) => {
  const { title, description, category_id } = req.body;
  try {
    const q = `
      INSERT INTO complaint (title, description, timestamp, status, category_id)
      VALUES ($1, $2, NOW(), 'pending', $3)
      RETURNING comp_id
    `;
    const result = await pool.query(q, [title, description, category_id]);
    res.json({ success: true, comp_id: result.rows[0].comp_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to register complaint" });
  }
});

// get status of a complaint by id
app.get("/api/complaints/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const q = "SELECT comp_id, title, status FROM complaint WHERE comp_id = $1";
    const result = await pool.query(q, [id]);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Not Found" });
    }
    res.json({ success: true, complaint: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching complaint" });
  }
});

// load all complaints for staff
app.get("/api/complaints", async (req, res) => {
  try {
    const q = "SELECT comp_id, title, description, status FROM complaint ORDER BY timestamp DESC";
    const result = await pool.query(q);
    res.json({ success: true, complaints: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error loading complaints" });
  }
});

// update status by staff
app.put("/api/complaints/:id/status", async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  try {
    const q = "UPDATE complaint SET status = $1 WHERE comp_id = $2";
    await pool.query(q, [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
