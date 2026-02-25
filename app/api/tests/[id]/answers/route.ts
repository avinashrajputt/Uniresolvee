import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { studentId, answers } = body;

    console.log('Saving answers for test:', id, 'student:', studentId);
    console.log('Answers to save:', answers);

    if (!studentId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing studentId or answers array' },
        { status: 400 }
      );
    }

    // Validate the test exists
    const test = await prisma.test.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Delete existing answers for this student and test
    await prisma.answer.deleteMany({
      where: {
        testId: id,
        studentId: studentId,
      },
    });

    console.log('Deleted existing answers');

    // Filter valid answers and prepare for batch creation
    const validAnswers = answers
      .filter(
        (answer) =>
          answer.questionId &&
          answer.answer &&
          typeof answer.answer === 'string'
      )
      .map((answer) => ({
        testId: id,
        studentId: studentId,
        questionId: answer.questionId,
        answer: answer.answer.trim(),
        marksScored: 0,
        remarks: '',
      }));

    console.log('Creating answers:', validAnswers);

    if (validAnswers.length === 0) {
      return NextResponse.json(
        { error: 'No valid answers to save' },
        { status: 400 }
      );
    }

    // Create all answers in batch
    const result = await prisma.answer.createMany({
      data: validAnswers,
    });

    console.log('Created answers:', result.count);

    return NextResponse.json({
      message: `Saved ${result.count} answers successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error saving answers:', error);
    return NextResponse.json(
      { error: 'Failed to save answers' },
      { status: 500 }
    );
  }
}