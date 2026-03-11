import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const tests = await prisma.test.findMany({
      where: {
        userId: userId,
      },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Fetched tests for user:', userId, 'Count:', tests.length);
    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    console.log('Creating test with data:', body);

    const { name, description, batchId, active, maximumMarks, questions } =
      body;

    // Validate required fields
    if (!name || !batchId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, batchId, and questions array',
        },
        { status: 400 }
      );
    }

    // Validate questions
    const validQuestions = questions.filter((q) => q.text && q.marks > 0);
    if (validQuestions.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid question is required' },
        { status: 400 }
      );
    }

    // Verify user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Verify batch exists and belongs to user
    const batch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        userId: userId,
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found or access denied' },
        { status: 404 }
      );
    }

    console.log('Creating test for batch:', batch.name);

    const test = await prisma.test.create({
      data: {
        name,
        description: description || '',
        userId: userId,
        batchId,
        active: active || false,
        maximumMarks: maximumMarks || 0,
        questions: {
          create: validQuestions.map((question: any, index: number) => ({
            text: question.text,
            marks: question.marks,
            orderForAi: question.orderForAi || `Q${index + 1}`,
          })),
        },
      },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: true,
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
    });

    console.log('Test created successfully:', test.id);
    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Error creating test:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A test with this name already exists' },
        { status: 400 }
      );
    }

    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'Failed to create test';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
