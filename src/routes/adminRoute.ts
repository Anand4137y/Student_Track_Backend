import express from 'express';
import { registerAdmin, adminLogin, getAllSchoolRequests, approveOrRejectSchoolRequest, getAllApprovedSchools, getAllReportedStudents, updateReportedStudentStatus } from "../controllers/adminController";
import { authMiddleware } from '../middleware/extractIdFromJwt';

const router = express.Router();

router.post('/signUp', registerAdmin);
router.post('/login', adminLogin);
router.get('/allRequests', authMiddleware, getAllSchoolRequests);
router.patch('/approveOrRejectSchool/:id', authMiddleware, approveOrRejectSchoolRequest);
router.get('/all-schools', authMiddleware, getAllApprovedSchools)
router.get('/all-student-reports', authMiddleware, getAllReportedStudents );
router.patch('/update-student-status', authMiddleware, updateReportedStudentStatus);

export default router; 