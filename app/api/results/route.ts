import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching test results...');

    // Get all answers with their associated data
    const answers = await prisma.answer.findMany({
      include: {
        student: true,
        test: {
          include: {
            batch: true,
          },
        },
        question: true,
      },
    });

    console.log(`Found ${answers.length} answers`);

    // Group answers by student and test
    const resultMap = new Map<
      string,
      {
        studentId: string;
        testId: string;
        student: any;
        test: any;
        totalMarks: number;
        marksObtained: number;
        answers: any[];
      }
    >();

    answers.forEach((answer) => {
      const key = `${answer.studentId}-${answer.testId}`;

      if (!resultMap.has(key)) {
        resultMap.set(key, {
          studentId: answer.studentId,
          testId: answer.testId,
          student: answer.student,
          test: answer.test,
          totalMarks: 0,
          marksObtained: 0,
          answers: [],
        });
      }

      const result = resultMap.get(key)!;
      result.totalMarks += answer.question.marks;
      result.marksObtained += answer.marksScored || 0;
      result.answers.push(answer);
    });

    // Convert to array and calculate percentages
    const results = Array.from(resultMap.values()).map((result, index) => ({
      id: `result-${index}`,
      student: result.student,
      test: result.test,
      totalMarks: result.totalMarks,
      marksObtained: result.marksObtained,
      percentage:
        result.totalMarks > 0
          ? (result.marksObtained / result.totalMarks) * 100
          : 0,
      answers: result.answers,
    }));

    console.log(`Calculated ${results.length} results`);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}