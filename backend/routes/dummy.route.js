import express from "express";
const router = express.Router();

import { response } from "../controllers/dummy.controller.js";
router.get("/random", response)

export default router;