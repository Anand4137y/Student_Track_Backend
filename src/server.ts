import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/db';
import schoolRoute from "./routes/SchoolRoute";
import staffRoute from "./routes/staffRoute";
import adminRoute from './routes/adminRoute';
import cors from 'cors';
dotenv.config();

// Connect to database
connectDb();


const app = express();
app.use(cors())
app.use(express.json());
const port = process.env.PORT || 3000;

// ROUTES 
app.get('/', (req: Request, res: Response) => {
    res.send("Hellow bacck to backend....")
})
app.use('/api/school', schoolRoute);
app.use('/api/staff', staffRoute);
app.use('/api/admin', adminRoute);


app.listen(port, () => {
    console.log(`Server running on ${port}`);
})