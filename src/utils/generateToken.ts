import jwt from 'jsonwebtoken';

type TokenPayload = {
    userId: string;
    schoolId?: string | null;
    role?: string
};

export const generateToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error('JWT_SECRET is not defined in the environment variables.');
        throw new Error('JWT secret is not configured on the server.');
    }

    try {
        return jwt.sign(payload, secret, { expiresIn: '7d' });
    } catch (error) {
        console.error('Error while signing JWT token:', error);
        throw new Error('Could not sign the token.');
    }
};
