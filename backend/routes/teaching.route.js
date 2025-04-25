import express from 'express';
const router = express.Router();

import { getTeaching, postTeaching } from '../controllers/teaching.controller.js';

router.get("/", getTeaching);
router.post("/", postTeaching);

/* Create parameter ID routes, e.g. /:id to pass ID params. */

export default router;