'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Upload, AlertCircle, Users, GraduationCap, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Student {
  name: string;
  email: string;
  regNo: number;
}

interface Batch {
  id: string;
  name: string;
  description?: string;
  students: any[];
  createdAt: string;
  _count: {
    students: number;
    tests: number;
  };
}

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBatchCreated: (batch: Batch) => void;
}

export function CreateBatchDialog({
  open,
  onOpenChange,
  onBatchCreated,
}: CreateBatchDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedErrors, setDetailedErrors] = useState<string[]>([]);

  const addStudent = () => {
    setStudents([...students, { name: '', email: '', regNo: 0 }]);
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = (
    index: number,
    field: keyof Student,
    value: string | number
  ) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setStudents(updatedStudents);
  };

  const validateStudents = () => {
    const errors: string[] = [];

    students.forEach((student, index) => {
      if (!student.name.trim()) {
        errors.push(`Student ${index + 1}: Name is required`);
      }
      if (!student.email.trim()) {
        errors.push(`Student ${index + 1}: Email is required`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        errors.push(`Student ${index + 1}: Invalid email format`);
      }
      if (!student.regNo || student.regNo === 0) {
        errors.push(`Student ${index + 1}: Registration number is required`);
      }

      // Only check for duplicates within this batch (not globally)
      const duplicateInBatch = students.find(
        (s, i) =>
          i !== index && s.regNo === student.regNo && student.regNo !== 0
      );

      if (duplicateInBatch) {
        errors.push(
          `Student ${index + 1}: Registration number ${
            student.regNo
          } is used by another student in this batch`
        );
      }

      const duplicateEmailInBatch = students.find(
        (s, i) =>
          i !== index &&
          s.email.toLowerCase() === student.email.toLowerCase() &&
          student.email.trim() !== ''
      );

      if (duplicateEmailInBatch) {
        errors.push(
          `Student ${index + 1}: Email ${
            student.email
          } is used by another student in this batch`
        );
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    setError(null);
    setDetailedErrors([]);

    if (!name.trim()) {
      setError('Batch name is required');
      return;
    }

    const validationErrors = validateStudents();
    if (validationErrors.length > 0) {
      setError('Please fix the following errors:');
      setDetailedErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          students: students.map((s) => ({
            name: s.name.trim(),
            email: s.email.trim().toLowerCase(),
            regNo: Number(s.regNo),
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onBatchCreated(data);
        resetForm();
        onOpenChange(false);
      } else {
        setError(data.error || 'Failed to create batch');
        if (data.details && Array.isArray(data.details)) {
          setDetailedErrors(data.details);
        }
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      setError('Failed to create batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setStudents([]);
    setError(null);
    setDetailedErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-indigo-500/20'>
        <DialogHeader className='space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg'>
              <GraduationCap className='h-6 w-6 text-white' />
            </div>
            <div>
              <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                Create New Batch
              </DialogTitle>
              <DialogDescription className='text-base mt-1'>
                Create a new batch and add students. Registration numbers can be duplicate across different batches.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Batch Details */}
          <Card className='border-0 shadow-xl bg-white dark:bg-gray-800/50'>
            <CardHeader className='border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-2 rounded-full bg-indigo-500'></div>
                <CardTitle className='text-xl font-bold text-gray-900 dark:text-gray-100'>Batch Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-5 pt-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Batch Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='e.g., Computer Science 2024'
                    className='h-11 border-2 focus:border-indigo-500 focus:ring-indigo-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Description
                  </Label>
                  <Input
                    id='description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='Optional description'
                    className='h-11 border-2 focus:border-indigo-500 focus:ring-indigo-500'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students */}
          <Card className='border-0 shadow-xl bg-white dark:bg-gray-800/50'>
            <CardHeader className='border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  <CardTitle className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                    Students
                  </CardTitle>
                  <Badge variant='secondary' className='ml-2'>
                    {students.length} {students.length === 1 ? 'Student' : 'Students'}
                  </Badge>
                </div>
                <Button
                  type='button'
                  size='sm'
                  onClick={addStudent}
                  className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent className='pt-6'>
              {students.length > 0 ? (
                <div className='border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700'>
                        <TableHead className='font-bold text-gray-900 dark:text-gray-100'>Name <span className='text-red-500'>*</span></TableHead>
                        <TableHead className='font-bold text-gray-900 dark:text-gray-100'>Email <span className='text-red-500'>*</span></TableHead>
                        <TableHead className='font-bold text-gray-900 dark:text-gray-100'>Reg No <span className='text-red-500'>*</span></TableHead>
                        <TableHead className='w-[50px]'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, index) => (
                        <TableRow key={index} className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150'>
                          <TableCell className='py-3'>
                            <Input
                              value={student.name}
                              onChange={(e) =>
                                updateStudent(index, 'name', e.target.value)
                              }
                              placeholder='Student name'
                              className='border-2 focus:border-green-500 focus:ring-green-500'
                            />
                          </TableCell>
                          <TableCell className='py-3'>
                            <Input
                              value={student.email}
                              onChange={(e) =>
                                updateStudent(index, 'email', e.target.value)
                              }
                              placeholder='email@example.com'
                              type='email'
                              className='border-2 focus:border-green-500 focus:ring-green-500'
                            />
                          </TableCell>
                          <TableCell className='py-3'>
                            <Input
                              value={student.regNo || ''}
                              onChange={(e) =>
                                updateStudent(
                                  index,
                                  'regNo',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder='Registration number'
                              type='number'
                              className='border-2 focus:border-green-500 focus:ring-green-500'
                            />
                          </TableCell>
                          <TableCell className='py-3'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => removeStudent(index)}
                              className='hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='text-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600'>
                  <Users className='h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3' />
                  <p className='text-gray-600 dark:text-gray-400 font-medium'>No students added yet</p>
                  <p className='text-sm text-gray-500 dark:text-gray-500 mt-1'>Click &quot;Add Student&quot; to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant='destructive' className='border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-lg'>
              <AlertCircle className='h-5 w-5' />
              <AlertDescription className='ml-2'>
                <p className='font-semibold text-base'>{error}</p>
                {detailedErrors.length > 0 && (
                  <ul className='mt-3 space-y-1'>
                    {detailedErrors.map((err, index) => (
                      <li key={index} className='text-sm flex items-center gap-2'>
                        <div className='h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400'></div>
                        {err}
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-2'>
            <Button 
              variant='outline' 
              onClick={() => onOpenChange(false)}
              className='px-6 border-2 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className='px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating Batch...
                </>
              ) : (
                <>
                  <CheckCircle2 className='mr-2 h-4 w-4' />
                  Create Batch
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
