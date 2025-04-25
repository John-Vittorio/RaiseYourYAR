import express from "express"
const router = express.Router();

import { getReport, postReport } from "../controllers/report.controller.js";

/* Dummy Route */
router.get("/", getReport);

router.post("/", postReport)

export default router