import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
const app = express();
import reportRoutes from "./routes/report.route.js"

/* Middleware */
/* This middleware allows us to accept and parse JSON data from req.body. */
app.use(express.json());

/* Important Note: Make sure to import all models */
/* Model Imports Section */

/* Provides access to the variables in the .env file. */
dotenv.config();
const PORT = process.env.PORT || 5000

app.use("/api/reports", reportRoutes)

/* 
POST Handler
*/

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:", PORT)
})