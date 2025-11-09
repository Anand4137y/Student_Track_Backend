import { Request, Response } from "express"
import School from "../models/School";
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken';

export const SchoolRegister = async (req: Request, res: Response) => {
     try {
        const { schoolName, email, password, address, phone, city, state, pinCode, schoolCode, district } = req.body;

        // check if school exists
        const isSchoolExist = await School.findOne({schoolCode});

        if (isSchoolExist) return res.status(400).json({status: false, message: "School already exists"});

        // check if email exists
        const isEmailExits = await School.findOne({email});

        if (isEmailExits) return res.status(400).json({ status: false, message: "Email already exists"});

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSchool = await School.create({
            schoolName,
            email,
            password: hashedPassword,
            address,
            phone,
            city,
            state,
            pinCode,
            schoolCode,
            district
        })
        return res.status(201).json({ status: true, message: "School Registered Successfully", data: newSchool});

     } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error"});
     }
}

export const schoolLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // CHECK IF SCHOOL EXISTS 
        const school = await School.findOne({email});

        if(!school) return res.status(400).json({ status: false, message: "No school Found with this email"});

        // CHECK IF PASSWORD MATCH 
        const isPasswordMatch = await bcrypt.compare(password, school?.password);
        if (!isPasswordMatch) return res.status(400).json({ status: false, message: "Password doesn't match"});

        const token = generateToken(school?.id);

        return res.status(200).json({ status: true, message: "Login Successfully", data: school, token});
        
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error"});
    }
}