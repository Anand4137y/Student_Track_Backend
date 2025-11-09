import express from 'express';
import { staffRegister, staffLogin } from "../controllers/staffController";

const router = express.Router();

router.post('/register', staffRegister);
router.post('/login', staffLogin);

export default router;