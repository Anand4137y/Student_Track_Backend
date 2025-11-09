import { Request, Response } from "express";
import Staff from '../models/Staff';
import School from "../models/School";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";


export const staffRegister = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, schoolCode} = req.body

        // CHECK IF EMAIL EXISTS
        const isEmailExist = await Staff.findOne({email});
        if(isEmailExist) return res.status(400).json({ status: false, message: "Email already exists"});

        // CHECK IF SCHOOL EXISTS 
        const isSchool = await School.findOne({schoolCode});
        if (!isSchool) return res.status(404).json({ status: false, message: "Invalid School Code"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const staff = await Staff.create({
            name,
            email,
            password: hashedPassword,
            phone,
            school: isSchool._id,
        })

        return res.status(200).json({ status: true, message: "Staff Registered Successfully", data: staff});

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal StaffRegister Error"});
    }
}

export const staffLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        // CHECK IF EMAIL EXISTS
        const isUser = await Staff.findOne({email});
        if (!isUser) return res.status(404).json({ status: false, message: "Email doesn't exist"});

        // COMPARE PASSWORD IF MATCH5
        const isMatch = bcrypt.compare(password, isUser?.password);
        if (!isMatch) return res.status(404).json({ status: false, message: "Password doesn't match"});

        const token = generateToken(isUser?.id);

        return res.status(200).json({ status: true, message: "Login Successfully", data: isUser, token});

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Staff Login Error"});
    }
}