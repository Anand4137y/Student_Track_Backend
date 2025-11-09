import { Request, Response } from "express";
import Admin from "../models/Admin";
import bcrypt from 'bcrypt';
import School from "../models/School";
import { generateToken } from "../utils/generateToken";

export const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const adminUser = await Admin.findOne({ email });
        if (adminUser) return res.status(400).json({ status: false, message: "email already exist"});

        const hashPass = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashPass,
        })

        return res.status(200).json({ status: true, message: "Admin Registered Successfully", data: newAdmin});
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error"});
    }
}

export const adminLogin = async (req: Request, res: Response) => {  
    try {
         const { email, password } = req.body;
         const user: any = await Admin.findOne({email});
         if (!user) return res.status(400).json({ status: false, message: "No admin found with this email"});

         const isPassMatch = await bcrypt.compare(password, user?.password);
         if (!isPassMatch) return res.status(400).json({ status: false, message: "password or Email doesn't match"});
         const token = generateToken(user._id.toString());

         return res.status(200).json({ status: true, message: "Login Successfully", data: user, token});
         
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error"});
    }
}

//  API TO SEE ALL SCHOOL REQUESTD

export const getAllSchoolRequests = async (req: Request, res: Response) => {
    try {
        const schoolRequests = await School.find({ permission: "requested"}).sort({ createdAt: -1});

        return res.status(200).json({ status: true, data: schoolRequests});
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error"});
    }
}