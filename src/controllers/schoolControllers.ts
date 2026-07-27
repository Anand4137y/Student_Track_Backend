import { Request, Response } from "express"
import School from "../models/School";
import Staff from "../models/Staff";
import Student from "../models/Student";
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        schoolId?: string;
    };
}

export const SchoolRegister = async (req: Request, res: Response) => {
    try {
        const { schoolName, email, password, address, phone, city, state, pinCode, schoolCode, district } = req.body;

        // check if school exists
        const isSchoolExist = await School.findOne({
            schoolCode
        });

        if (isSchoolExist) return res.status(400).json({ status: false, message: "School already exists" });

        // check if email exists
        const isEmailExits = await School.findOne({ email });

        if (isEmailExits) return res.status(400).json({ status: false, message: "Email already exists" });
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

        return res.status(201).json({ status: true, message: "School Registered Successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

export const schoolLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // CHECK IF SCHOOL EXISTS 
        const school = await School.findOne({
            email,
            isEnabled: true,
            isDeleted: false
        });

        if (!school) return res.status(400).json({ status: false, message: "No school Found with this email" });

        // CHECK IF PASSWORD MATCH 
        const isPasswordMatch = await bcrypt.compare(password, school?.password);
        if (!isPasswordMatch) return res.status(400).json({ status: false, message: "Password doesn't match" });

        const token = generateToken({ userId: school._id!.toString(), schoolId: school._id!.toString(), role: school.role });

        return res.status(200).json({ status: true, message: "Login Successfully", data: school, token });

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

export const updateStaffPermission = async (req: AuthRequest, res: Response) => {
    try {
        const { staffId } = req.params;
        const { permission } = req.body;
        const schoolId = req.user?.schoolId;

        if (!schoolId) {
            return res.status(401).json({ status: false, message: "Unauthorized: No school ID in token" });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) return res.status(404).json({ status: false, message: "Staff not found" });

        // Ensure the staff belongs to the logged-in school
        if (staff.school.toString() !== schoolId) {
            return res.status(403).json({ status: false, message: "Unauthorized: Staff does not belong to your school" });
        }

        staff.permission = permission;
        await staff.save();

        return res.status(200).json({ status: true, message: "Staff permission updated successfully", data: staff });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

export const getAllTeachersList = async (req: AuthRequest, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        const { page = 1, limit = 10, search, permission } = req.query;

        if (!schoolId) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized: No school ID in token"
            });
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // ✅ Base filter
        const filter: any = {
            school: schoolId,
            role: "teacher" // optional but recommended
        };

        // ✅ Permission filter
        if (permission) {
            filter.permission = permission;
        }

        // ✅ Search filter
        if (search) {
            filter.name = { $regex: search as string, $options: "i" };
        }

        filter.isActive = true;

        // ✅ Count with SAME filter
        const totalTeachers = await Staff.countDocuments(filter);

        // ✅ Find with SAME filter
        const teachers = await Staff.find(filter)
            .skip(skip)
            .limit(limitNumber)
            .select("-password") // security best practice
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: true,
            data: teachers,
            pagination: {
                total: totalTeachers,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalTeachers / limitNumber)
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

export const getAllStudents = async (req: AuthRequest, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        const { page, limit = 10, search } = req.query;
console.log(req?.user)
        if (!schoolId) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized: No school ID in token"
            });
        }

        // CHECK IF SCHOOL EXISTS 
        const school = await School.findOne({
            _id: schoolId
            // isEnabled: true,
            // isDeleted: false
        });
        console.log(school)

        if (!school) {
            return res.status(404).json({
                status: false,
                message: "School not found"
            });
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const filter: any = {
            school: schoolId,
            status: "active"
        };

        if (search) {
            filter.name = { $regex: search as string, $options: "i" }
        }


        const students = await Student.find(filter)
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        const totalStudents = await Student.countDocuments(filter);

        return res.status(200).json({
            status: true,
            data: students,
            pagination: {
                total: totalStudents,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalStudents / limitNumber)
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
}