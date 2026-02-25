import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { grades } = body;

    console.log('Saving manual grades for test:', id);
    console.log('Grades to save:', grades);

    if (!Array.isArray(grades)) {
      return NextResponse.json(
        { error: 'Grades must be an array' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Update grades one by one with error handling
    for (const grade of grades) {
      try {
        if (!grade.answerId) {
          console.log('Skipping grade without answerId:', grade);
          continue;
        }

        console.log(
          `Updating answer ${grade.answerId} with marks: ${grade.marksScored}`
        );

        const updatedAnswer = await prisma.answer.update({
          where: { id: grade.answerId },
          data: {
            marksScored: parseInt(grade.marksScored) || 0,
            remarks: grade.remarks || '',
            updatedAt: new Date(),
          },
        });

        console.log(`Successfully updated answer ${grade.answerId}`);
        updatedCount++;
      } catch (updateError: any) {
        console.error(
          `Failed to update answer ${grade.answerId}:`,
          updateError
        );
        errors.push(`Answer ${grade.answerId}: ${updateError.message}`);
      }
    }

    console.log(
      `Manual grading completed: ${updatedCount}/${grades.length} grades saved`
    );

    return NextResponse.json({
      success: true,
      updatedCount,
      totalGrades: grades.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error saving grades:', error);
    return NextResponse.json(
      { error: `Failed to save grades: ${error.message}` },
      { status: 500 }
    );
  }
}
