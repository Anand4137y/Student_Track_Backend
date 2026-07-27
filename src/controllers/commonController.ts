import { Request, Response } from "express";
import Staff from '../models/Staff';
import School from '../models/School';
import ReportedStudent from '../models/reportedStudent.model';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        schoolId?: string;
        role?: string;
    };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {

        const { userId, schoolId, role } = req.user || {};
        
        let profile: any = null;
        if (role === 'school') {
            profile = await School.findById(userId).populate({ path: 'staff', select: '-password -role'})

        } else {
            profile = await Staff.findById(userId).populate({ path: 'school', select: '-password -role'});
        }

        

        return res.status(200).json({ status: true, data: profile, role });

    } catch (error) {
        console.error('Error in getProfile:', error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
} 

export const getReportedStudents = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, schoolId } = req.user || {};
        const { page = 1, limit = 10 } = req.query;

        if (!schoolId) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.max(1, parseInt(limit as string) || 10);
        const skip = (pageNum - 1) * limitNum;

        // Get total count of reported students for the school
        const totalCount = await ReportedStudent.countDocuments({ school: schoolId });

        // Get paginated reported students for the school and populate reportedBy details
        const reportedStudents = await ReportedStudent.find({ school: schoolId })
            .populate({
                path: 'reportedBy',
                select: 'name email role phone -_id'
            })
            .populate({
                path: 'student',
                select: 'name class section rollNumber admissionNumber -_id'
            })
            .sort({ date: -1 }) // Sort by most recent first
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalCount / limitNum);

        return res.status(200).json({
            status: true,
            message: "Reported students fetched successfully",
            data: reportedStudents,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error in getReportedStudents:', error);
        return res.status(500).json({ status: false, message: "Internal server error"});
    }
}