import express from 'express';
import { getProfile, getReportedStudents } from '../controllers/commonController';
import { authMiddleware } from '../middleware/extractIdFromJwt';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.get('/reported-students', authMiddleware, getReportedStudents)

export default router;