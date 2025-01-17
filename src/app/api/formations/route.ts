import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';



export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log('Received data:', data); // Log the incoming data

    // Validate required fields
    if (!data.title || !data.startDate || !data.endDate || !data.professorIds) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the formation
    const formation = await prisma.formation.create({
      data: {
        title: data.title,
        images: data.images || [], // Ensure images are included
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration: data.duration,
        location: data.location,
        classSize: parseInt(data.classSize, 10),
        prerequisites: data.prerequisites,
        description: data.description,
        detail: data.detail,
        professors: {
          connect: data.professorIds.map((id: number) => ({ id })), // Use "professors" (plural)
        },
      },
      include: { professors: true }, // Use "professors" (plural)
    });

    console.log('Formation created:', formation); // Log the created formation

    return NextResponse.json(formation, { status: 201 });
  } catch (error) {
    console.error('Error creating formation:', error); // Log the error
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}




export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const formationId = parseInt(id, 10); // Convert id to a number

    if (isNaN(formationId)) {
      return NextResponse.json(
        { error: 'Invalid formation ID' },
        { status: 400 }
      );
    }

    const formation = await prisma.formation.findUnique({
      where: { id: formationId }, // id is a number
      include: { professors: true }, // Use "professors" (plural)
    });

    return formation
      ? NextResponse.json(formation)
      : NextResponse.json({ error: 'Formation not found' }, { status: 404 });
  }

  const formations = await prisma.formation.findMany({
    include: { professors: true }, // Use "professors" (plural)
  });

  return NextResponse.json(formations);
}



export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const data = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Missing formation ID' }, { status: 400 });
  }

  try {
    const formationId = parseInt(id, 10); // Convert id to a number

    if (isNaN(formationId)) {
      return NextResponse.json(
        { error: 'Invalid formation ID' },
        { status: 400 }
      );
    }

    const updatedFormation = await prisma.formation.update({
      where: { id: formationId }, // id is a number
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration: data.duration,
        location: data.location,
        classSize: parseInt(data.classSize, 10),
        prerequisites: data.prerequisites,
        description: data.description,
        detail: data.detail,
        professors: {
          set: [], // Clear existing relations
          connect: data.professorIds.map((id: number) => ({ id })), // Use "professors" (plural)
        },
      },
      include: { professors: true }, // Use "professors" (plural)
    });

    return NextResponse.json(updatedFormation);
  } catch (error) {
    console.error('Error updating formation:', error);
    return NextResponse.json({ error: 'Formation not found' }, { status: 404 });
  }
}



export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing formation ID' }, { status: 400 });
  }

  try {
    const formationId = parseInt(id, 10); // Convert id to a number

    if (isNaN(formationId)) {
      return NextResponse.json(
        { error: 'Invalid formation ID' },
        { status: 400 }
      );
    }

    await prisma.formation.delete({
      where: { id: formationId }, // id is a number
    });
    return NextResponse.json({ message: 'Formation deleted successfully' });
  } catch (error) {
    console.error('Error deleting formation:', error);
    return NextResponse.json({ error: 'Formation not found' }, { status: 404 });
  }
}