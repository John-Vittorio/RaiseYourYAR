import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from 'cors';
import mongoose from "mongoose";

// Route imports
import reportRoutes from "./routes/report.route.js";
import authRoutes from "./routes/auth.route.js";
import teachingRoutes from "./routes/teaching.route.js";
import researchRoutes from "./routes/research.route.js";
import serviceRoutes from "./routes/service.route.js";
import facultyRoutes from "./routes/faculty.route.js";
import orcidRoutes from "./routes/orcid.route.js";  // Fixed from orchid to orcid

dotenv.config();

const app = express();
import { MongoClient, ObjectId } from 'mongodb';

/* Middleware */
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5001',
        'http://localhost:5000',
        'https://yearlyactivityreport.netlify.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/* Model Imports Section */
import "./models/faculty.model.js";
import "./models/Report.model.js";
import "./models/research.model.js";
import "./models/service.model.js";
import "./models/teaching.model.js";

/* Connect to Database First THEN Start Server */
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/reports", reportRoutes);
    app.use("/api/teaching", teachingRoutes);
    app.use("/api/research", researchRoutes);
    app.use("/api/service", serviceRoutes);
    app.use("/api/faculty", facultyRoutes);
    app.use("/api/orcid", orcidRoutes);  // Fixed from /api/orchid to /api/orcid

    app.listen(PORT, () => {
        console.log("Server started at http://localhost:", PORT);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});