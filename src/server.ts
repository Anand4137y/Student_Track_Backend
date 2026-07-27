import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/db';
import schoolRoute from "./routes/SchoolRoute";
import staffRoute from "./routes/staffRoute";
import adminRoute from './routes/adminRoute';
import studentRoute from "./routes/studentRoute";
import commonRoute from './routes/commonRoute';

import cors from 'cors';
dotenv.config();

// Connect to database
connectDb();
 

const app = express(); 
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002' ],
    credentials: true,
}))
app.use(express.json());
const port = process.env.PORT || 3000;

// Routes
app.use('/api/school', schoolRoute);
app.use('/api/staff', staffRoute);
app.use('/api/admin', adminRoute);
app.use('/api/student', studentRoute);
app.use('/api/common', commonRoute)

app.listen(port, () => {
    console.log(`Server running on ${port}`);
})