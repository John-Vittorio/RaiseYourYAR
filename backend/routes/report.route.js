import express from "express"
const router = express.Router();

import { getResource } from "../controllers/report.controller.js";

/* Dummy Route */
router.get("/", getResource);

export default router