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
  database: process.env.DB_NAME,
  port: 3306
});

db.connect(err => {
  if (err) return console.log(err);
  console.log("MySQL Connected");
});

app.get("/", (req,res)=>{
  res.send("API Server Running");
});

app.post("/register", (req,res)=>{
  const {name,email,password}=req.body;

  if(!name||!email||!password)
    return res.json({success:false});

  db.query("SELECT id FROM users WHERE email=?",[email], async(err,r)=>{
    if(r.length>0)
      return res.json({success:false,message:"Email exists"});

    const hash = await bcrypt.hash(password,10);

    db.query(
      "INSERT INTO users(name,email,password) VALUES(?,?,?)",
      [name,email,hash],
      ()=>{
        res.json({success:true});
      }
    );
  });
});

app.post("/login",(req,res)=>{
  const {email,password}=req.body;

  db.query("SELECT * FROM users WHERE email=?",[email],async(err,r)=>{
    if(r.length===0)
      return res.json({success:false});

    const ok = await bcrypt.compare(password,r[0].password);

    if(!ok) return res.json({success:false});

    res.json({success:true});
  });
});

app.listen(process.env.PORT||3000,()=>{
  console.log("Server running");
});
