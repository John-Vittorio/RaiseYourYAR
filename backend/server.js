import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import reportRoutes from "./routes/report.route.js";
import authRoutes from "./routes/auth.route.js";
import cors from 'cors';

/* Middleware */
const app = express();
app.use(express.json());
app.use(cors());

/* Provides access to the variables in the .env file. */
dotenv.config();
const PORT = process.env.PORT || 5000;

/* Important Note: Make sure to import all models */
/* Model Imports Section */
import "./models/faculty.model.js";
import "./models/Report.model.js";
import "./models/research.model.js";
import "./models/service.model.js";
import "./models/teaching.model.js";

/* Routes */
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

/* Server Start */
app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:", PORT);
});