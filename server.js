require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users(name,email,password) VALUES(?,?,?)",
    [name, email, hash],
    (err) => {
      if (err) return res.json(err);
      res.json({ success: true });
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {
      if (result.length === 0) return res.json("User not found");

      const match = await bcrypt.compare(password, result[0].password);

      if (!match) return res.json("Wrong password");

      res.json({ success: true });
    }
  );
});

app.listen(process.env.PORT, () => {
  console.log("Server running");
});
