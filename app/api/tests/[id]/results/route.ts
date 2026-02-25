import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: params.id },
      include: {
        questions: true,
        answers: {
          include: {
            student: true,
            question: true,
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Group answers by student
    const studentResults = new Map();

    test.answers.forEach((answer) => {
      const studentId = answer.student.id;
      if (!studentResults.has(studentId)) {
        studentResults.set(studentId, {
          id: studentId,
          student: answer.student,
          totalMarks: 0,
          maxMarks: test.maximumMarks,
          answers: [],
        });
      }

      const result = studentResults.get(studentId);
      result.totalMarks += answer.marksScored;
      result.answers.push(answer);
    });

    // Convert to array and calculate percentages
    const results = Array.from(studentResults.values()).map((result) => ({
      ...result,
      percentage: (result.totalMarks / result.maxMarks) * 100,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
