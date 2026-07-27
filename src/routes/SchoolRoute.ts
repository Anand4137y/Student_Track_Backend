import express from 'express';
import { SchoolRegister, getAllStudents, getAllTeachersList, schoolLogin, updateStaffPermission } from '../controllers/schoolControllers';
import { authMiddleware } from "../middleware/extractIdFromJwt";


const router = express.Router();

// Accept POST at the base path so the full URL is: POST /api/school/
router.post('/create', SchoolRegister);
router.post('/login', schoolLogin);
router.patch('/staff-permission/:staffId', authMiddleware, updateStaffPermission);
router.get('/all-teacher', authMiddleware, getAllTeachersList);
router.get('/all-students', authMiddleware, getAllStudents);

export default router;