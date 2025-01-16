import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to validate formation ID
const validateFormationId = (id) => {
  const formationId = parseInt(id, 10);
  if (isNaN(formationId)) {
    return NextResponse.json(
      { error: 'Invalid formation ID' },
      { status: 400 }
    );
  }
  return formationId;
};

// GET formation by ID
const getFormation = async (formationId) => {
  const formation = await prisma.formation.findUnique({
    where: { id: formationId },
    include: { professors: true },
  });

  return formation
    ? NextResponse.json(formation)
    : NextResponse.json({ error: 'Formation not found' }, { status: 404 });
};

// PUT (update) formation by ID
const updateFormation = async (formationId, data) => {
  const updatedFormation = await prisma.formation.update({
    where: { id: formationId },
    data: {
      title: data.title,
      images: data.images || [], // Update images
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      duration: parseInt(data.duration, 10),
      location: data.location,
      classSize: parseInt(data.classSize, 10),
      prerequisites: data.prerequisites,
      description: data.description,
      detail: data.detail,
      professors: {
        set: [], // Clear existing relations
        connect: data.professorIds.map((id) => ({ id })), // Reconnect professors
      },
    },
    include: { professors: true },
  });

  return NextResponse.json(updatedFormation);
};

// DELETE formation by ID
const deleteFormation = async (formationId) => {
  await prisma.formation.delete({
    where: { id: formationId },
  });

  return NextResponse.json({ message: 'Formation deleted successfully' });
};

// Main handler function
export async function GET(request, { params }) {
  try {
    const formationId = validateFormationId(params.id);
    if (formationId instanceof NextResponse) return formationId; // Return error response if invalid
    return await getFormation(formationId);
  } catch (error) {
    console.error('Error fetching formation:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const formationId = validateFormationId(params.id);
    if (formationId instanceof NextResponse) return formationId; // Return error response if invalid

    const data = await request.json();
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    return await updateFormation(formationId, data);
  } catch (error) {
    console.error('Error updating formation:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const formationId = validateFormationId(params.id);
    if (formationId instanceof NextResponse) return formationId; // Return error response if invalid

    return await deleteFormation(formationId);
  } catch (error) {
    console.error('Error deleting formation:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}