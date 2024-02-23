import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as fs from 'fs';
import path from "path";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/admin', function (req, res) {
//   db.all("SELECT * FROM users", [], (err: any, rows: any) => {
//     console.log(err, rows)
//         res.json(rows)
//       })
//       return 
// })

app.get('/login', function (req, res) {
      res.sendFile('views/login.html', {root: __dirname })
})

app.get('/register', function (req, res) {
      res.sendFile('views/register.html', {root: __dirname })
})

app.get("*", (req: Request, res: Response) => {
  res.redirect("/login");
});
    
app.post("/api/login", (req: Request, res: Response) => {
  const { email, password } = req.body
  
  if (!email || !password) return res.status(400).json({ message: "missing info" })

  return db.all("SELECT (password) FROM users WHERE email= (?) LIMIT 1", [email], (err: any, rows: any) => {
   
    if (err) return res.status(500).json({ message: "Unexpected Error" })
    if (rows.length === 0 ) return res.status(500).json({ message: "Incorrect email and/or password" }) 
    if (rows[0].password !== password) return res.status(500).json({ message: "Incorrect password" }) 
    return res.status(200).json({message: "Login Successful"})
    })
   
});

app.post("/api/register", (req: Request, res: Response) => {
  const { firstname, lastname, password, confirm_password } = req.body

  if (!firstname || !lastname || !password || !confirm_password) return res.status(400).json({ message: "missing info" })
  if (password !== confirm_password) return res.status(400).json({ message: "Passwords aren't similar" })

  return db.run("INSERT INTO users (email, firstname, lastname, password) VALUES (?,?,?,?)", [`${firstname}_${lastname}@matchmo.com`,firstname, lastname, password], (err: any) => {
    if (err) {
      return res.status(500).json({ message: "There seems to be an unexpected problem" })
    }
    return res.status(200).json({message: "Created Successfully"})
  })

});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});