import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET professor by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const professorId = parseInt(params.id, 10); // Convert id to a number

    if (isNaN(professorId)) {
      return NextResponse.json(
        { error: 'Invalid professor ID' },
        { status: 400 }
      );
    }

    const professor = await prisma.professor.findUnique({
      where: { id: professorId }, // Fetch professor by ID
      include: { formations: true }, // Include related formations
    });

    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // Ensure certificates is treated as an array of strings
    const formattedProfessor = {
      ...professor,
      certificates: professor.certificates || [], // Default to an empty array if null
    };

    return NextResponse.json(formattedProfessor);
  } catch (error) {
    console.error('Error fetching professor:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}



// PUT (update) professor by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Destructure `params` to get the `id`
    const { id } = params;

    // Parse the `id` to a number
    const professorId = parseInt(id, 10);

    // Validate the professor ID
    if (isNaN(professorId)) {
      return NextResponse.json(
        { error: 'Invalid professor ID' },
        { status: 400 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // Validate the request body
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Ensure certificates is treated as an array of strings
    const updatedData = {
      ...data,
      certificates: data.certificates || [], // Default to an empty array if null
    };

    // Update the professor in the database
    const updatedProfessor = await prisma.professor.update({
      where: { id: professorId }, // Update professor by ID
      data: updatedData,
      include: { formations: true }, // Include related formations
    });

    return NextResponse.json(updatedProfessor);
  } catch (error) {
    console.error('Error updating professor:', error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Professor not found' },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE professor by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const professorId = parseInt(id, 10);

    if (isNaN(professorId)) {
      return NextResponse.json(
        { error: 'Invalid professor ID' },
        { status: 400 }
      );
    }

    await prisma.professor.delete({
      where: { id: professorId },
    });

    return NextResponse.json({ message: 'Professor deleted successfully' });
  } catch (error) {
    console.error('Error deleting professor:', error);
    return NextResponse.json(
      { error: 'Professor not found' },
      { status: 404 }
    );
  }
}