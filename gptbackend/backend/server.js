const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
 user: "postgres",
 host: "localhost",
 database: "campus_g",
 password: "bhanu@123",
 port: 5432
});

/* STUDENT SIGNUP */
app.post("/signup", async (req,res)=>{
 try{
    console.log(req.body);
   const { roll, name, mail, pswd, mobile } = req.body;

   await pool.query(
    "INSERT INTO students VALUES($1,$2,$3,$4,$5)",
    [roll,mail,name,pswd,mobile]
   );

   res.json({success:true});
 }
 catch(err){
   console.error(err.message);
   res.status(500).json({error:err.message});
 }
});


/* STUDENT LOGIN */
app.post("/login", async(req,res)=>{
 const { roll, pswd } = req.body;

 const result = await pool.query(
 "SELECT * FROM students WHERE roll=$1 AND pswd=$2",
 [roll,pswd]
 );

 if(result.rows.length>0)
   res.json({success:true});
 else
   res.json({success:false});
});

/* REGISTER COMPLAINT */
app.post("/complaint", async(req,res)=>{
 const { title, description, category_id, roll } = req.body;

 const r = await pool.query(
 "INSERT INTO complaint(title,description,category_id,roll) VALUES($1,$2,$3,$4) RETURNING comp_id",
 [title,description,category_id,roll]
 );

 res.json({id:r.rows[0].comp_id});
});

/* STAFF VIEW */
app.get("/complaints/:cat", async(req,res)=>{
 const data = await pool.query(
 "SELECT * FROM complaint WHERE category_id=$1",
 [req.params.cat]
 );

 res.json(data.rows);
});

app.listen(3000,()=>console.log("Server running"));
