require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ONLINE MYSQL CONNECTION (Render Env Variables)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

// Connect DB
db.connect(err => {
  if (err) {
    console.error("MySQL error:", err);
    return;
  }
  console.log("MySQL Connected");
});

// ROOT TEST
app.get("/", (req, res) => {
  res.send("API Server Running");
});

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing fields" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users(name,email,password) VALUES(?,?,?)",
      [name, email, hash],
      (err) => {
        if (err) return res.json(err);
        res.json({ success: true });
      }
    );
  } catch (e) {
    res.json({ success: false });
  }
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {
      if (err) return res.json(err);

      if (result.length === 0)
        return res.json({ success: false, message: "User not found" });

      const match = await bcrypt.compare(password, result[0].password);

      if (!match)
        return res.json({ success: false, message: "Wrong password" });

      res.json({ success: true });
    }
  );
});

// PORT FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
