import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all professors
export async function GET() {
  try {
    const professors = await prisma.professor.findMany({
      include: { formations: true }, // Include related formations
    });

    return NextResponse.json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST a new professor
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.firstName ||
      !data.lastName ||
      !data.image ||
      !data.profile ||
      !data.certificates ||
      !Array.isArray(data.certificates) // Ensure certificates is an array
    ) {
      return NextResponse.json(
        { error: 'Missing required fields or certificates is not an array' },
        { status: 400 }
      );
    }

    // Create the professor
    const professor = await prisma.professor.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
        profile: data.profile,
        certificates: data.certificates, // Now expects an array of strings
      },
    });

    return NextResponse.json(professor, { status: 201 });
  } catch (error) {
    console.error('Error creating professor:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE all professors
export async function DELETE() {
  try {
    // Delete all professors
    await prisma.professor.deleteMany();

    return NextResponse.json({ message: 'All professors deleted successfully' });
  } catch (error) {
    console.error('Error deleting professors:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}