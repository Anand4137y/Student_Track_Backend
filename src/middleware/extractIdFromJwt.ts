import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        schoolId?: string;
        role: string
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ status: false, message: "Unauthorized: No token provided" });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not defined on the server.');
            // We send a generic error to the client for security
            return res.status(500).json({ status: false, message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, secret) as { userId: string; schoolId?: string, role: string };

        // Attach the user payload to the request object 
        req.user = {
            userId: decoded.userId,
            schoolId: decoded.schoolId,
            role: decoded.role
        };

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(401).json({ status: false, message: "Unauthorized: Invalid token" });
    }
};