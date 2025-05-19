import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from 'cors';
import mongoose from "mongoose";

// Force refresh environment variables
dotenv.config({ override: true });

// Route imports
import reportRoutes from "./routes/report.route.js";
import authRoutes from "./routes/auth.route.js";
import teachingRoutes from "./routes/teaching.route.js";
import researchRoutes from "./routes/research.route.js";
import serviceRoutes from "./routes/service.route.js";
import facultyRoutes from "./routes/faculty.route.js";

const app = express();

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

// Print environment for debugging (hiding sensitive info)
console.log('Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
const mongoUri = process.env.MONGO_URI || 'Not set';
console.log('MONGO_URI:', mongoUri.includes('@') 
    ? `${mongoUri.substring(0, mongoUri.indexOf('@') + 1)}[CREDENTIALS_HIDDEN]` 
    : 'Connection string not properly formatted');

let server;

connectDB()
    .then((connection) => {
        console.log(`MongoDB connected successfully to: ${connection.connection.host}`);
        
        // Routes
        app.use("/api/auth", authRoutes);
        app.use("/api/reports", reportRoutes);
        app.use("/api/teaching", teachingRoutes);
        app.use("/api/research", researchRoutes);
        app.use("/api/service", serviceRoutes);
        app.use("/api/faculty", facultyRoutes);

        // Basic route for connection testing
        app.get("/api/status", (req, res) => {
            res.json({ 
                status: "OK", 
                mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Not Connected",
                database: mongoose.connection.db?.databaseName || "Unknown"
            });
        });

        server = app.listen(PORT, () => {
            console.log(`Server started at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

// Handle graceful shutdown
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    if (server) {
        server.close(() => {
            console.log('Server closed');
            mongoose.connection.close(false, () => {
                console.log('MongoDB connection closed');
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
}