import express from 'express';
import { registerAdmin, adminLogin, getAllSchoolRequests } from "../controllers/adminController";

const router = express.Router();

router.post('/signUp', registerAdmin);
router.post('/login', adminLogin);
router.get('/allRequests', getAllSchoolRequests);

export default router;