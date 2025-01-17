import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';
const prisma = new PrismaClient();

// Verify a JWT token
export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded; // Return the decoded user data
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Validate user credentials
export async function validateCredentials(email: string, password: string) {
    console.log('Validating credentials for:', email); // Debugging
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        console.log('User found:', user); // Debugging
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            return { id: user.id, email: user.email };
        } else {
            console.error('Invalid password'); // Debugging
        }
    } else {
        console.error('User not found'); // Debugging
    }
    throw new Error('Invalid credentials');
}

// Generate a JWT token
export function generateToken(user: any) {
    return jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });
}