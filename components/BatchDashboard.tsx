'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateBatchDialog } from './CreateBatchDialog';
import { ViewBatchDialog } from './ViewBatchDialog';

interface Student {
  id: string;
  regNo: number;
  name: string;
  email: string;
}

interface Batch {
  id: string;
  name: string;
  description?: string;
  students: Student[];
  createdAt: string;
  _count: {
    students: number;
    tests: number;
  };
}

export default function BatchDashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const response = await fetch('/api/batches', {
        cache: 'no-store'
      });
      const data = await response.json();
      setBatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBatchCreated = useCallback((newBatch: Batch) => {
    setBatches((prev) => [...prev, newBatch]);
    setIsCreateDialogOpen(false);
  }, []);

  const handleBatchClick = useCallback((batch: Batch) => {
    setSelectedBatch(batch);
    setIsViewDialogOpen(true);
  }, []);

  // Calculate stats safely with useMemo
  const totalStudents = useMemo(() => batches.reduce(
    (sum, batch) => sum + (batch._count?.students || 0),
    0
  ), [batches]);
  
  const totalTests = useMemo(() => batches.reduce(
    (sum, batch) => sum + (batch._count?.tests || 0),
    0
  ), [batches]);

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4'></div>
          <p className='text-lg font-medium text-gray-700 dark:text-gray-300'>Loading batches...</p>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
            Batches Management
          </h1>
          <p className='text-lg text-gray-600 dark:text-gray-400 mt-2'>
            Manage your student batches and track their progress
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          size='lg'
          className='h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200'
        >
          <Plus className='mr-2 h-5 w-5' />
          Create New Batch
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-6 md:grid-cols-3'>
        <Card className='border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border dark:border-blue-800/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-blue-700 dark:text-blue-300 text-sm font-medium'>
                  Total Batches
                </p>
                <p className='text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1'>
                  {batches.length}
                </p>
                <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                  Student groups
                </p>
              </div>
              <div className='h-14 w-14 bg-blue-200 dark:bg-blue-800/50 rounded-xl flex items-center justify-center shadow-inner'>
                <GraduationCap className='h-7 w-7 text-blue-700 dark:text-blue-300' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 dark:border dark:border-green-800/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-700 dark:text-green-300 text-sm font-medium'>
                  Total Students
                </p>
                <p className='text-3xl font-bold text-green-900 dark:text-green-100 mt-1'>
                  {totalStudents}
                </p>
                <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
                  Across all batches
                </p>
              </div>
              <div className='h-14 w-14 bg-green-200 dark:bg-green-800/50 rounded-xl flex items-center justify-center shadow-inner'>
                <Users className='h-7 w-7 text-green-700 dark:text-green-300' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 dark:border dark:border-purple-800/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-purple-700 dark:text-purple-300 text-sm font-medium'>
                  Active Tests
                </p>
                <p className='text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1'>
                  {totalTests}
                </p>
                <p className='text-xs text-purple-600 dark:text-purple-400 mt-1'>
                  Total assessments
                </p>
              </div>
              <div className='h-14 w-14 bg-purple-200 dark:bg-purple-800/50 rounded-xl flex items-center justify-center shadow-inner'>
                <BookOpen className='h-7 w-7 text-purple-700 dark:text-purple-300' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches Grid */}
      <div>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-white'>
            Your Batches
          </h2>
          {batches.length > 0 && (
            <Badge variant='secondary' className='text-sm px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'>
              {batches.length} {batches.length === 1 ? 'Batch' : 'Batches'}
            </Badge>
          )}
        </div>

        {batches.length === 0 ? (
          <Card className='border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50'>
            <CardContent className='text-center py-20 px-8'>
              <div className='w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6'>
                <GraduationCap className='h-12 w-12 text-indigo-600 dark:text-indigo-400' />
              </div>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3'>
                No Batches Yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-base leading-relaxed'>
                Get started by creating your first batch. Add students and organize them for easy test management.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                size='lg'
                className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-8'
              >
                <Plus className='mr-2 h-5 w-5' />
                Create Your First Batch
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {batches.map((batch) => (
              <Card
                key={batch.id}
                onClick={() => handleBatchClick(batch)}
                className='group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2 cursor-pointer bg-white dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden relative'
              >
                {/* Gradient Border Effect */}
                <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all duration-300 pointer-events-none'></div>
                
                <CardHeader className='pb-3 relative'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md'>
                          <GraduationCap className='h-5 w-5 text-white' />
                        </div>
                        <CardTitle className='text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'>
                          {batch.name}
                        </CardTitle>
                      </div>
                      {batch.description && (
                        <CardDescription className='mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                          {batch.description}
                        </CardDescription>
                      )}
                    </div>
                    <ChevronRight className='h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all' />
                  </div>
                </CardHeader>

                <CardContent className='space-y-4 relative'>
                  {/* Stats */}
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2 flex-1'>
                      <div className='h-9 w-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                        <Users className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                      </div>
                      <div>
                        <p className='text-base font-bold text-gray-900 dark:text-gray-100'>
                          {batch._count?.students || 0}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Students
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 flex-1'>
                      <div className='h-9 w-9 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center'>
                        <BookOpen className='h-4 w-4 text-green-600 dark:text-green-400' />
                      </div>
                      <div>
                        <p className='text-base font-bold text-gray-900 dark:text-gray-100'>
                          {batch._count?.tests || 0}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Tests
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Students */}
                  {batch.students && batch.students.length > 0 ? (
                    <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700'>
                      <p className='text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1'>
                        <Users className='h-3 w-3' />
                        Recent Students
                      </p>
                      <div className='space-y-2'>
                        {batch.students.slice(0, 3).map((student) => (
                          <div
                            key={student.id}
                            className='flex items-center justify-between text-sm bg-white dark:bg-gray-800 rounded px-2 py-1.5'
                          >
                            <span className='font-medium text-gray-900 dark:text-gray-100 truncate'>
                              {student.name}
                            </span>
                            <Badge
                              variant='outline'
                              className='text-xs border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30'
                            >
                              #{student.regNo}
                            </Badge>
                          </div>
                        ))}
                        {batch.students.length > 3 && (
                          <p className='text-xs text-indigo-600 dark:text-indigo-400 font-semibold text-center pt-1'>
                            +{batch.students.length - 3} more students
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        No students yet
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className='flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700'>
                    <div className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
                      <Calendar className='h-3.5 w-3.5' />
                      {batch.createdAt
                        ? formatDate(batch.createdAt)
                        : 'Unknown date'}
                    </div>
                    <Badge
                      className={`text-xs font-semibold ${
                        batch._count?.students > 0 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' 
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {batch._count?.students > 0 ? '✓ Active' : '○ Empty'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateBatchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onBatchCreated={handleBatchCreated}
      />

      <ViewBatchDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        batch={selectedBatch}
      />
    </div>
  );
}
