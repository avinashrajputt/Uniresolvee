import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;
    const body = await request.json();
    const { studentId, answers } = body;

    // Save final answers
    for (const answerData of answers) {
      await prisma.answer.upsert(
        where: {
          studentId_testId_questionId: {
            studentId,
            testId,
            questionId: answerData.questionId,
          },
        },
        update: {
          answer: answerData.answer,
          updatedAt: new Date(),
        },
        create: {
          studentId,
          testId,
          questionId: answerData.questionId,
          answer: answerData.answer,
          marksScored: 0,
          remarks: '',
        },
      });
    }

    // Here you could add auto-grading logic using OpenAI
    // For now, we'll leave answers ungraded (marksScored: 0)

    return NextResponse.json({
      success: true,
      message: 'Test submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
