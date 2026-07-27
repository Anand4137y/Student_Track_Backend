import { Request, Response } from "express";
import Student from "../models/Student";
import School from "../models/School";
import Staff from "../models/Staff"
import mongoose from "mongoose";
import ReportedStudent from "../models/reportedStudent.model";

interface AuthRequest extends Request {
    user?: {
        userId: string;
        schoolId?: string;
        role?: string;
    };
}

export const createStudent = async (req: AuthRequest, res: Response) => {
    try {
        const {
            name,
            gender,
            dob,
            rollNumber,
            admissionNumber,
            class: className,
            section,
            parentName,
            parentPhone,
            address,
        } = req.body;

        const assignedTeacher = (req as any).user?.userId;
    
        if (!req.user) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const { userId, schoolId } = req.user;
        // Check if staff member has approved permission
        const staff = await Staff.findById(userId);
    
        if (!staff) {
            return res.status(404).json({ status: false, message: "Staff member not found" });
        }

        if (staff.permission !== "approved") {
            return res.status(403).json({ 
                status: false, 
                message: `Permission ${staff.permission}. You need to be approved by admin to create students.` 
            });
        }

        const school = await School.findOne({
            _id: schoolId,
            isDeleted: false,
            isEnabled: true
        });
        

        if (!school) return res.status(404).json({ status: false, message: "School not found" });

        // validate required
        if (!name || !gender || !dob || !admissionNumber || !rollNumber || !className || !section) {
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }


        // check duplicate admissionNumber
        const existing = await Student.findOne({ admissionNumber });
        if (existing) return res.status(400).json({ status: false, message: "Student with this admission number already exists" });

        // const imagePath = req.file ? req.file.path : null;

        const student = await Student.create({
            name,
            gender,
            dob: new Date(dob),
            rollNumber,
            admissionNumber,
            class: className,
            section,
            parentName,
            parentPhone,
            address,
            school: school?._id,
            assignedTeacher: assignedTeacher ? new mongoose.Types.ObjectId(assignedTeacher) : undefined,
            // image: imagePath,
        });
        return res.status(201).json({ status: true, message: "Student created successfully", data: student });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

export const reportStudent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const schoolId = req.user?.schoolId;
        const userId = req.user?.userId;
        const { studentId } = req.query;
        const { name, className, section, rollNumber, reason, reportType, image, phone, place } = req.body;

        // Check if staff member has approved permission
        const staff = await Staff.findById(userId);
        if (!staff) {
            return res.status(404).json({ status: false, message: "Staff member not found" });
        }

        if (staff.permission !== "approved") {
            return res.status(403).json({ 
                status: false, 
                message: `Permission ${staff.permission}. You need to be approved by admin to report students.` 
            });
        }

        let student = null;

        if (studentId) {
            student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ status: false, message: "Student not found" });
            }

            // Check for existing PENDING report for the same date
            const existingReport = await ReportedStudent.findOne({
                student: studentId,
                school: schoolId,
                status: { $in: ["pending", "reviewed"] }, // Not yet resolved
                date: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
                    $lt: new Date(new Date().setHours(23, 59, 59, 999)) // End of today
                }
            });

            if (existingReport) {
                return res.status(400).json({
                    status: false,
                    message: "Student already has an active report for today"
                });
            }

            if (student.isReported) {
                return res.status(400).json({ status: false, message: "Student has already been reported" });
            }

            // update student stats
            student.reportedCount += 1;
            student.isReported = true;
            await student.save();

            const report = await ReportedStudent.create({
                student: student._id,
                school: schoolId,
                reportedBy: userId,
                reason: reason ? reason : null,
                reportType,
                status: "pending",
                name: student?.name,
                className: student?.class,
                section: student?.section,
                rollNumber: student?.rollNumber,
                image: image || student?.image,
                phone: student?.parentPhone,
            });

            return res.status(201).json({
                status: true,
                message: "Student reported successfully",
                data: report
            });
        } else {
            if (!name || !className || !section || !rollNumber || !phone) {
                return res.status(400).json({ status: false, message: "Missing required fields" });
            }

            const tempReport = await ReportedStudent.create({
                name,
                className: className,
                school: schoolId,
                reportedBy: userId,
                section,
                rollNumber,
                reason: reason ? reason : null,
                reportType,
                status: "pending",
                phone,
            });

            return res.status(201).json({
                status: true,
                message: "Student reported successfully",
                data: tempReport
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}