import express from 'express';
import { staffRegister, staffLogin, getAllSchools } from "../controllers/staffController";

const router = express.Router();

router.post('/register', staffRegister);
router.post('/login', staffLogin);
router.get('/get-school-code', getAllSchools);

export default router;