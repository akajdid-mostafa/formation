import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET professor by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const professorId = parseInt(id, 10);

    if (isNaN(professorId)) {
      return NextResponse.json(
        { error: 'Invalid professor ID' },
        { status: 400 }
      );
    }

    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
      include: { formations: true },
    });

    if (!professor) {
      return NextResponse.json(
        { error: 'Professor not found' },
        { status: 404 }
      );
    }

    const formattedProfessor = {
      ...professor,
      certificates: professor.certificates || [],
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
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const professorId = parseInt(id, 10);

    if (isNaN(professorId)) {
      return NextResponse.json(
        { error: 'Invalid professor ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const updatedData = {
      ...data,
      certificates: data.certificates || [],
    };

    const updatedProfessor = await prisma.professor.update({
      where: { id: professorId },
      data: updatedData,
      include: { formations: true },
    });

    return NextResponse.json(updatedProfessor);
  } catch (error) {
    console.error('Error updating professor:', error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Professor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE professor by ID
export async function DELETE(request, { params }) {
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