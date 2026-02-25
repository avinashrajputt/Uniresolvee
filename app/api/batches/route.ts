import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const { name, description, students } = body;

    console.log('Creating batch for user:', userId, {
      name,
      description,
      studentCount: students?.length,
    });

    if (!name) {
      return NextResponse.json(
        { error: 'Batch name is required' },
        { status: 400 }
      );
    }

    if (!students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Students array is required' },
        { status: 400 }
      );
    }

    // Validate students
    const validStudents = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (!student.name || !student.email || !student.regNo) {
        errors.push(
          `Student ${i + 1}: Missing required fields (name, email, regNo)`
        );
        continue;
      }

      validStudents.push({
        name: student.name.trim(),
        email: student.email.toLowerCase().trim(),
        regNo: parseInt(student.regNo),
      });
    }

    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return NextResponse.json(
        {
          error: 'Some students have validation errors',
          details: errors,
        },
        { status: 400 }
      );
    }

    // First, verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Create batch with students
    const result = await prisma.batch.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        userId: userId,
        students: {
          create: validStudents,
        },
      },
      include: {
        students: true,
        _count: {
          select: {
            students: true,
            tests: true,
          },
        },
      },
    });

    console.log('Successfully created batch:', result.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating batch:', error);

    // Handle Prisma errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('regNo')) {
        return NextResponse.json(
          { error: 'A student with this registration number already exists' },
          { status: 400 }
        );
      }
      if (target?.includes('email')) {
        return NextResponse.json(
          { error: 'A student with this email already exists' },
          { status: 400 }
        );
      }
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Database constraint error. Please check your user session.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create batch. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const batches = await prisma.batch.findMany({
      where: {
        userId: userId,
      },
      include: {
        students: true,
        _count: {
          select: {
            students: true,
            tests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(batches, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}
