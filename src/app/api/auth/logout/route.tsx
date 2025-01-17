// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const response = NextResponse.json({ message: 'Logout successful' });
    response.cookies.delete('token'); // Clear the token cookie
    return response;
}