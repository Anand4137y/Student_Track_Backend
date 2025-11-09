import jwt from 'jsonwebtoken';

type TokenPayload = {
    userId: string;
    schoolId?: string | null;
};

export const generateToken = (payload: TokenPayload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    return token;
};
