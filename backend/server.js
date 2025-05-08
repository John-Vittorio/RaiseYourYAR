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

dotenv.config();

const app = express();
const { MongoClient, ObjectId } = require('mongodb');


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

    app.listen(PORT, () => {
        console.log("Server started at http://localhost:", PORT);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// This endpoint directly connects to MongoDB to delete a report
app.delete('/api/delete/:reportId', async (req, res) => {
    console.log('==== DIRECT DELETE ENDPOINT ACCESSED ====');
    
    try {
      // Extract token from authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      console.log('Received token');
      
      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified, user ID:', decoded.id);
      } catch (error) {
        console.log('Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Get report ID from params
      const { reportId } = req.params;
      console.log('Report ID to delete:', reportId);
      
      // Validate ObjectId
      if (!ObjectId.isValid(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID format' });
      }
      
      // Get MongoDB URI from environment variables
      const MONGO_URI = process.env.MONGO_URI;
      
      if (!MONGO_URI) {
        return res.status(500).json({ message: 'MongoDB URI not configured' });
      }
      
      console.log('Connecting to MongoDB directly...');
      
      // Connect directly to MongoDB (bypassing Mongoose)
      const client = new MongoClient(MONGO_URI);
      await client.connect();
      console.log('Connected to MongoDB');
      
      // Get the database and collection
      const db = client.db();
      const reportsCollection = db.collection('reports');
      
      // First fetch the report to check ownership and status
      const report = await reportsCollection.findOne({ 
        _id: new ObjectId(reportId) 
      });
      
      if (!report) {
        await client.close();
        return res.status(404).json({ message: 'Report not found' });
      }
      
      console.log('Found report:', {
        id: report._id,
        faculty: report.facultyId,
        status: report.status
      });
      
      // Check if user owns this report
      const reportFacultyId = report.facultyId.toString();
      const userId = decoded.id;
      
      console.log('User ID:', userId);
      console.log('Report faculty ID:', reportFacultyId);
      
      if (reportFacultyId !== userId) {
        console.log('User does not own this report');
        await client.close();
        return res.status(403).json({ message: 'You can only delete your own reports' });
      }
      
      // Check if report is a draft
      if (report.status !== 'draft') {
        console.log('Report is not a draft');
        await client.close();
        return res.status(403).json({ message: 'Only draft reports can be deleted' });
      }
      
      console.log('Authorization checks passed, deleting report...');
      
      // Delete report from database
      const result = await reportsCollection.deleteOne({ 
        _id: new ObjectId(reportId) 
      });
      
      await client.close();
      
      if (result.deletedCount === 0) {
        console.log('Delete operation failed - no documents deleted');
        return res.status(500).json({ message: 'Failed to delete report' });
      }
      
      console.log('Delete operation successful!', result);
      res.json({ message: 'Report deleted successfully', success: true });
      
    } catch (error) {
      console.error('Server error in direct delete endpoint:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });