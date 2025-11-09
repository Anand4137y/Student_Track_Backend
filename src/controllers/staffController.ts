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

        // Add the staff id to the school's staff array
        try {
            await School.findByIdAndUpdate(isSchool._id, { $push: { staff: staff._id } });
        } catch (err) {
            // If updating the school fails, delete the created staff to avoid orphaned records
            await Staff.findByIdAndDelete(staff._id);
            return res.status(500).json({ status: false, message: "Failed to link staff to school" });
        }

        return res.status(201).json({ status: true, message: "Staff Registered Successfully", data: staff});

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
        const isMatch = await bcrypt.compare(password, isUser.password);
        if (!isMatch) return res.status(400).json({ status: false, message: "Password doesn't match"});

    const token = generateToken({ userId: isUser._id!.toString(), schoolId: isUser.school ? isUser.school.toString() : null });

    return res.status(200).json({ status: true, message: "Login Successfully", data: isUser, token });

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Staff Login Error"});
    }
}