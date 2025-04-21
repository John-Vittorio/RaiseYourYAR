import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
const app = express();

/* Middleware */
/* This middleware allows us to accept and parse JSON data from req.body. */
app.use(express.json());

/* Important Note: Make sure to import all models */
/* Model Imports Section */

/* Provides access to the variables in the .env file. */
dotenv.config();

app.get("/report", (req, res) => {
    res.send("Report Endpoint Active")
})

/* 
POST Handler
*/

app.listen(5000, () => {
    connectDB();
    console.log("Server started at http://localhost:5000")
})