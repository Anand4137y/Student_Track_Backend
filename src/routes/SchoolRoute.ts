import express from 'express';
import { SchoolRegister, schoolLogin } from '../controllers/schoolControllers';


const router = express.Router();

// Accept POST at the base path so the full URL is: POST /api/school/
router.post('/create', SchoolRegister);
router.post('/login', schoolLogin);

export default router;