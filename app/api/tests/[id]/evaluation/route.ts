import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const answers = await prisma.answer.findMany({
      where: { testId: id },
      include: {
        question: true,
        student: true,
      },
    });

    // Sort by student name (assuming the field is 'name' instead of 'firstname')
    const sortedAnswers = answers.sort((a, b) => {
      const nameA = a.student.name.toLowerCase();
      const nameB = b.student.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return NextResponse.json(sortedAnswers);
  } catch (error) {
    console.error('Error fetching evaluation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation data' },
      { status: 500 }
    );
  }
}