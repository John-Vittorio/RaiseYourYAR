// routes/orcid.route.js
import express from 'express';
import { handleOrcidCallback } from '../controllers/orcid.controller.js';

const router = express.Router();

// Callback route for ORCID OAuth
router.get('/callback', handleOrcidCallback);

export default router;
