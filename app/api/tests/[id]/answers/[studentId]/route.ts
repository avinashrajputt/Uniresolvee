import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const answers = await prisma.answer.findMany({
      where: {
        testId: params.id,
        studentId: params.studentId,
      },
      include: {
        question: true,
      },
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    );
  }
}
