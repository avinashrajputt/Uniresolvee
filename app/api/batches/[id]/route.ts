import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = params.id;
    const body = await request.json();
    const { name, description, students } = body;

    console.log('Updating batch:', batchId, {
      name,
      description,
      studentCount: students?.length,
    });

    if (!name || !students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Name and students array are required' },
        { status: 400 }
      );
    }

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { students: true },
    });

    if (!existingBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Validate students data
    const validStudents = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (!student.name?.trim()) {
        errors.push(`Student ${i + 1}: Name is required`);
        continue;
      }

      if (!student.email?.trim()) {
        errors.push(`Student ${i + 1}: Email is required`);
        continue;
      }

      if (!student.regNo || isNaN(parseInt(student.regNo))) {
        errors.push(`Student ${i + 1}: Valid registration number is required`);
        continue;
      }

      // Check for conflicts only for new students (no ID)
      if (!student.id) {
        // Check regNo conflict
        const existingByRegNo = await prisma.student.findFirst({
          where: {
            regNo: parseInt(student.regNo),
            batchId: { not: batchId },
          },
        });

        if (existingByRegNo) {
          errors.push(
            `Registration number ${student.regNo} already exists in another batch`
          );
          continue;
        }

        // Check email conflict
        const existingByEmail = await prisma.student.findFirst({
          where: {
            email: student.email.toLowerCase().trim(),
            batchId: { not: batchId },
          },
        });

        if (existingByEmail) {
          errors.push(`Email ${student.email} already exists in another batch`);
          continue;
        }
      }

      validStudents.push({
        id: student.id || null,
        name: student.name.trim(),
        email: student.email.toLowerCase().trim(),
        regNo: parseInt(student.regNo),
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      );
    }

    // Update batch details first
    await prisma.batch.update({
      where: { id: batchId },
      data: {
        name: name.trim(),
        description: description?.trim() || '',
      },
    });

    // Handle students separately to avoid transaction complexity
    const currentStudentIds = existingBatch.students.map((s) => s.id);
    const providedStudentIds = validStudents
      .filter((s) => s.id)
      .map((s) => s.id);

    // Delete removed students
    const studentsToDelete = currentStudentIds.filter(
      (id) => !providedStudentIds.includes(id)
    );
    if (studentsToDelete.length > 0) {
      await prisma.student.deleteMany({
        where: {
          id: { in: studentsToDelete },
          batchId: batchId,
        },
      });
    }

    // Update existing students and create new ones
    for (const student of validStudents) {
      if (student.id) {
        // Update existing student
        await prisma.student.update({
          where: { id: student.id },
          data: {
            name: student.name,
            email: student.email,
            regNo: student.regNo,
          },
        });
      } else {
        // Create new student
        await prisma.student.create({
          data: {
            name: student.name,
            email: student.email,
            regNo: student.regNo,
            batchId: batchId,
          },
        });
      }
    }

    // Fetch and return the updated batch
    const updatedBatch = await prisma.batch.findUnique({
      where: { id: batchId },
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

    console.log('Successfully updated batch:', updatedBatch?.id);
    return NextResponse.json(updatedBatch);
  } catch (error) {
    console.error('Error updating batch:', error);

    // Handle Prisma unique constraint errors
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

    return NextResponse.json(
      { error: 'Failed to update batch. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = params.id;

    // Check if batch exists and has tests
    const existingBatch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        _count: {
          select: {
            tests: true,
          },
        },
      },
    });

    if (!existingBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check if batch has tests
    if (existingBatch._count.tests > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete batch with existing tests. Please delete all tests first.',
        },
        { status: 400 }
      );
    }

    // Delete batch (students will be deleted automatically due to cascade)
    await prisma.batch.delete({
      where: { id: batchId },
    });

    return NextResponse.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete batch. Please try again.' },
      { status: 500 }
    );
  }
}
