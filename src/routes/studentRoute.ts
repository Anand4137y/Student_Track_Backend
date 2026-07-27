import express from "express";
import upload from "../middleware/upload";
import { createStudent, reportStudent } from "../controllers/studentController";
import { authMiddleware } from "../middleware/extractIdFromJwt";

const router = express.Router();

router.post('/create', authMiddleware, createStudent);
router.post('/report', authMiddleware, reportStudent);

export default router;