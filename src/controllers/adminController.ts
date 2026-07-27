import { Request, Response } from "express";
import Admin from "../models/Admin";
import bcrypt from 'bcrypt';
import School from "../models/School";
import { generateToken } from "../utils/generateToken";
import ReportedStudent from "../models/reportedStudent.model";
import Student from "../models/Student";

export const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const adminUser = await Admin.findOne({ email });
        if (adminUser) return res.status(400).json({ status: false, message: "email already exist" });

        const hashPass = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashPass,
        })

        return res.status(200).json({ status: true, message: "Admin Registered Successfully", data: newAdmin });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user: any = await Admin.findOne({ email });
        if (!user) return res.status(400).json({ status: false, message: "No admin found with this email" });

        const isPassMatch = await bcrypt.compare(password, user?.password);
        if (!isPassMatch) return res.status(400).json({ status: false, message: "password or Email doesn't match" });
        const token = generateToken({ userId: user._id.toString() });
        console.log(user)

        return res.status(200).json({ status: true, message: "Login Successfully", data: user, token });

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

//  API TO SEE ALL SCHOOL REQUESTD
export const getAllSchoolRequests = async (req: Request, res: Response) => {
    try {
        const schoolRequests = await School.find({
            permission: "requested",
            isDeleted: false,
            isEnabled: false
        }).sort({ createdAt: -1 });

        return res.status(200).json({ status: true, data: schoolRequests });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

// Approve or Reject School Request
export const approveOrRejectSchoolRequest = async (req: Request, res: Response) => {
    try {
        const { permission } = req.body;
        const { id: schoolId } = req.params; // Correctly get 'id' from params and rename it to schoolId

        // Add validation for the 'permission' input
        if (permission !== 'approved' && permission !== 'rejected') {
            return res.status(400).json({ status: false, message: "Invalid permission value. Must be 'approved' or 'rejected'." });
        }

        const school = await School.findOne({
            _id: schoolId,
            permission: "requested", // It's good practice to ensure we're only modifying pending requests
            isEnabled: false,
            isDeleted: false
        })

        if (!school) return res.status(404).json({ status: false, message: "No pending school request found" });

        school.permission = permission;
        school.isEnabled = permission === "approved" ? true : false;
        await school.save();

        return res.status(200).json({ status: true, message: `School request has been ${permission} successfully` });


    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

// Get All Approved Schools
export const getAllApprovedSchools = async (req: Request, res: Response) => {
    try {
        const approvedSchools = await School.find({
            isEnabled: true,
            isDeleted: false,
            permission: "approved"
        })

        return res.status(200).json({ status: true, data: approvedSchools });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

// Get All Reported Students
export const getAllReportedStudents = async (req: Request, res: Response) => {
    try {
        const { page, limit, status } = req.query;

        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const filter: any = {};

        if(status) {
            filter.status = status;
        }

        const total = await ReportedStudent.countDocuments(filter);
        const reportedStudents = await ReportedStudent.find(filter)
            .skip(skip)
            .limit(limitNumber)
            .populate('student')
            .populate('school', 'schoolName phone')
            .populate('reportedBy')
            .sort({ createdAt: -1 });

        const data = {
            reportedStudents,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
                total
            }
        }

        return res.status(200).json({ status: true, data: data });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

// update Reported Student Status and Remarks
export const updateReportedStudentStatus = async (req: Request, res: Response) => {
    try {
        const { id, student_id } = req.query;
        const { status, remarks } = req.body;

        if (student_id) {
            const student = await Student.findById(student_id);
            if (!student) return res.status(404).json({ status: false, message: "Student not found" });
            student.isReported = false;
            await student.save();
        }

        const report = await ReportedStudent.findById(id);
        if (!report) return res.status(404).json({ status: false, message: "No report found" });

        report.status = status
        if (remarks) report.remarks = remarks;
        await report.save();

        return res.status(200).json({ status: true, message: "Report updated successfully", data: report });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}