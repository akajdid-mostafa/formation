// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { validateCredentials, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
    const { email, password } = await request.json();

    try {
        // Validate credentials
        const user = await validateCredentials(email, password);

        // Generate a token
        const token = generateToken(user);

        // Set the token in an HTTP-only cookie
        const response = NextResponse.json({ message: 'Login successful' });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure cookies are only sent over HTTPS in production
            sameSite: 'strict', // Prevent CSRF attacks
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/', // Accessible across the entire site
        });

        return response;
    } catch (error) {
        console.error('Login failed:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 401 });
    }
}