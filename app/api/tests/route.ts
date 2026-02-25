import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tests = await prisma.test.findMany({
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

    console.log('Fetched tests:', tests.length); // Debug log
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

    // Get or create a user
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found, creating one...');
      user = await prisma.user.create({
        data: {
          email: 'admin@markmate.com',
          firstname: 'Admin',
          lastname: 'User',
          provider: 'credentials',
        },
      });
    }

    // Verify batch exists and belongs to user
    const batch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        userId: user.id,
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
        userId: user.id,
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

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A test with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create test' },
      { status: 500 }
    );
  }
}
