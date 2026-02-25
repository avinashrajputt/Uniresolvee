'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  FileText,
  Users,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  TrendingUp,
  Trophy,
  Award,
  Download,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateTestDialog } from '@/components/CreateTestDialog';
import TestEvaluation from './TestEvaluation';

interface Test {
  id: string;
  name: string;
  description: string;
  active: boolean;
  maximumMarks: number;
  createdAt: string;
  batch: {
    id: string;
    name: string;
  };
  _count: {
    questions: number;
    answers: number;
  };
}

interface StudentResult {
  studentId: string;
  studentName: string;
  regNo: number;
  email: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  answersCount: number;
  gradedCount: number;
  feedback: string;
}

interface TestAnalysis {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  averageFeedbackLength: number;
  commonIssues: string[];
}

export default function TestDashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [evaluatingTestId, setEvaluatingTestId] = useState<string | null>(null);
  const [viewResultsTestId, setViewResultsTestId] = useState<string | null>(null);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [testAnalysis, setTestAnalysis] = useState<TestAnalysis | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [editingMarks, setEditingMarks] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests');
      const data = await response.json();
      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCreated = (newTest: Test) => {
    setTests((prev) => [...prev, newTest]);
    setIsCreateDialogOpen(false);
  };

  const toggleTestStatus = async (testId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      });

      setTests((prev) =>
        prev.map((test) =>
          test.id === testId ? { ...test, active: !currentStatus } : test
        )
      );
    } catch (error) {
      console.error('Failed to update test status:', error);
    }
  };

  const fetchTestResults = async (testId: string) => {
    setResultsLoading(true);
    try {
      const response = await fetch(`/api/tests/${testId}/evaluation`);
      if (response.ok) {
        const answers = await response.json();
        
        // Process answers to get student results
        const resultsMap = new Map<string, StudentResult>();
        const feedbackList: string[] = [];
        
        answers.forEach((answer: any) => {
          const key = answer.student.id;
          if (!resultsMap.has(key)) {
            resultsMap.set(key, {
              studentId: answer.student.id,
              studentName: answer.student.name,
              regNo: answer.student.regNo,
              email: answer.student.email,
              totalMarks: 0,
              marksObtained: 0,
              percentage: 0,
              answersCount: 0,
              gradedCount: 0,
              feedback: '',
            });
          }
          
          const result = resultsMap.get(key)!;
          result.totalMarks += answer.question.marks;
          result.marksObtained += answer.marksScored || 0;
          result.answersCount += 1;
          if (answer.marksScored > 0 || answer.remarks) {
            result.gradedCount += 1;
            if (answer.remarks) feedbackList.push(answer.remarks);
          }
          result.feedback = answer.remarks || result.feedback;
          result.percentage = result.totalMarks > 0 ? (result.marksObtained / result.totalMarks) * 100 : 0;
        });

        const results = Array.from(resultsMap.values()).sort((a, b) => 
          b.percentage - a.percentage
        );
        setStudentResults(results);

        // Calculate analysis
        if (results.length > 0) {
          const scores = results.map(r => r.percentage);
          const analysis: TestAnalysis = {
            totalSubmissions: results.length,
            averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            passRate: (results.filter(r => r.percentage >= 50).length / results.length) * 100,
            averageFeedbackLength: feedbackList.reduce((sum, f) => sum + f.length, 0) / Math.max(feedbackList.length, 1),
            commonIssues: [],
          };
          
          // Extract common issues from feedback
          const issuePatterns = ['unclear', 'incomplete', 'incorrect', 'missing', 'weak', 'poor', 'needs improvement'];
          const issueCounts: Record<string, number> = {};
          feedbackList.forEach(feedback => {
            issuePatterns.forEach(pattern => {
              if (feedback.toLowerCase().includes(pattern)) {
                issueCounts[pattern] = (issueCounts[pattern] || 0) + 1;
              }
            });
          });
          
          analysis.commonIssues = Object.entries(issueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([issue]) => issue);

          setTestAnalysis(analysis);
        }
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setResultsLoading(false);
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-500' };
    if (percentage >= 70) return { grade: 'B+', color: 'bg-blue-500' };
    if (percentage >= 60) return { grade: 'B', color: 'bg-blue-400' };
    if (percentage >= 50) return { grade: 'C', color: 'bg-yellow-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

  const totalQuestions = tests.reduce(
    (sum, test) => sum + (test._count?.questions || 0),
    0
  );
  const activeTests = tests.filter((test) => test.active).length;

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4'></div>
          <p className='text-lg font-medium text-gray-700 dark:text-gray-300'>Loading tests...</p>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // If evaluating a test, show the evaluation interface
  if (evaluatingTestId) {
    return (
      <TestEvaluation
        testId={evaluatingTestId}
        onBack={() => setEvaluatingTestId(null)}
      />
    );
  }

  // If viewing results for a test
  if (viewResultsTestId) {
    const test = tests.find(t => t.id === viewResultsTestId);
    return (
      <div className='space-y-6'>
        <Card className='border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-3 text-2xl'>
                  <div className='h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center'>
                    <BarChart3 className='h-6 w-6 text-white' />
                  </div>
                  {test?.name} - Results & Analysis
                </CardTitle>
                <CardDescription className='mt-2 text-base'>
                  Batch: <span className='font-semibold text-indigo-600 dark:text-indigo-400'>{test?.batch.name}</span> • 
                  Submissions: <span className='font-semibold text-purple-600 dark:text-purple-400'>{test?._count.answers || 0}</span>
                </CardDescription>
              </div>
              <Button 
                onClick={() => setViewResultsTestId(null)} 
                variant='outline'
                className='border-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
              >
                ← Back to Tests
              </Button>
            </div>
          </CardHeader>
        </Card>

        {resultsLoading ? (
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4'></div>
              <p className='text-gray-600 dark:text-gray-400'>Loading results...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Analysis Cards */}
            {testAnalysis && (
              <div className='grid gap-4 md:grid-cols-5'>
                <Card className='border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-blue-700 dark:text-blue-300'>Total Submissions</CardTitle>
                    <Users className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold text-blue-900 dark:text-blue-100'>{testAnalysis.totalSubmissions}</div>
                    <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>Students evaluated</p>
                  </CardContent>
                </Card>
                <Card className='border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-green-700 dark:text-green-300'>Average Score</CardTitle>
                    <TrendingUp className='h-5 w-5 text-green-600 dark:text-green-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold text-green-900 dark:text-green-100'>{testAnalysis.averageScore.toFixed(1)}%</div>
                    <p className='text-xs text-green-600 dark:text-green-400 mt-1'>Class average</p>
                  </CardContent>
                </Card>
                <Card className='border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20 hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-yellow-700 dark:text-yellow-300'>Highest Score</CardTitle>
                    <Trophy className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold text-yellow-900 dark:text-yellow-100'>{testAnalysis.highestScore.toFixed(1)}%</div>
                    <p className='text-xs text-yellow-600 dark:text-yellow-400 mt-1'>Top performer</p>
                  </CardContent>
                </Card>
                <Card className='border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-purple-700 dark:text-purple-300'>Pass Rate (≥50%)</CardTitle>
                    <Award className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold text-purple-900 dark:text-purple-100'>{testAnalysis.passRate.toFixed(1)}%</div>
                    <p className='text-xs text-purple-600 dark:text-purple-400 mt-1'>Students passed</p>
                  </CardContent>
                </Card>
                <Card className='border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20 hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-red-700 dark:text-red-300'>Lowest Score</CardTitle>
                    <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold text-red-900 dark:text-red-100'>{testAnalysis.lowestScore.toFixed(1)}%</div>
                    <p className='text-xs text-red-600 dark:text-red-400 mt-1'>Needs attention</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Common Issues */}
            {testAnalysis && testAnalysis.commonIssues.length > 0 && (
              <Card className='border-2 border-blue-200 dark:border-blue-800 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <div className='h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                      <AlertCircle className='h-5 w-5 text-white' />
                    </div>
                    🤖 AI Analysis: Common Issues Identified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {testAnalysis.commonIssues.map((issue, idx) => (
                      <div key={idx} className='flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800'>
                        <div className='h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold'>
                          {idx + 1}
                        </div>
                        <div>
                          <span className='font-semibold capitalize text-gray-900 dark:text-gray-100'>{issue}:</span>
                          <span className='text-gray-600 dark:text-gray-400 ml-2'>
                            Mentioned in AI feedback across multiple students
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className='mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
                      <p className='text-sm text-gray-700 dark:text-gray-300'>
                        💡 <span className='font-semibold'>Recommendation:</span> Consider reviewing the test questions or providing more guidance on these areas in future classes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Results Table */}
            <Card className='border-0 shadow-xl'>
              <CardHeader className='border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
                <CardTitle className='text-xl'>Student Performance Details</CardTitle>
                <CardDescription className='text-base'>
                  View marks, feedback, and edit grades as needed
                </CardDescription>
              </CardHeader>
              <CardContent className='p-6'>
                {studentResults.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <AlertCircle className='h-10 w-10 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                      No Results Yet
                    </h3>
                    <p className='text-gray-600 dark:text-gray-400'>
                      Upload answers and run auto-grading first to see student results.
                    </p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-gray-50 dark:bg-gray-900/50'>
                          <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Student</TableHead>
                          <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Reg No</TableHead>
                          <TableHead className='text-center font-semibold text-gray-700 dark:text-gray-300'>Marks</TableHead>
                          <TableHead className='text-center font-semibold text-gray-700 dark:text-gray-300'>Percentage</TableHead>
                          <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Grade</TableHead>
                          <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Progress</TableHead>
                          <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>AI Feedback</TableHead>
                          <TableHead className='text-center font-semibold text-gray-700 dark:text-gray-300'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentResults.map((result, index) => {
                          const gradeInfo = getGrade(result.percentage);
                          return (
                            <TableRow 
                              key={result.studentId}
                              className='hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors'
                            >
                              <TableCell className='font-medium'>
                                <div className='flex items-center gap-3'>
                                  <div className='h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold'>
                                    {result.studentName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className='font-semibold text-gray-900 dark:text-gray-100'>
                                      {result.studentName}
                                    </div>
                                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                                      {result.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant='outline' className='font-mono'>
                                  #{result.regNo}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-center'>
                                <div className='inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg'>
                                  <span className='font-mono font-bold text-indigo-900 dark:text-indigo-100'>
                                    {result.marksObtained}
                                  </span>
                                  <span className='text-gray-500 dark:text-gray-400'>/</span>
                                  <span className='font-mono text-gray-600 dark:text-gray-400'>
                                    {result.totalMarks}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className='text-center'>
                                <span className='font-bold text-xl text-gray-900 dark:text-gray-100'>
                                  {result.percentage.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${gradeInfo.color} text-white font-bold px-3 py-1 text-sm`}>
                                  {gradeInfo.grade}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  <Progress 
                                    value={result.percentage} 
                                    className='h-2.5 w-32'
                                  />
                                  <span className='text-xs text-gray-600 dark:text-gray-400 font-medium'>
                                    {result.percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className='max-w-xs'>
                                {result.feedback ? (
                                  <div className='text-xs bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700'>
                                    <p className='line-clamp-2 text-gray-700 dark:text-gray-300'>
                                      {result.feedback}
                                    </p>
                                  </div>
                                ) : (
                                  <span className='text-xs text-gray-400 dark:text-gray-500 italic'>
                                    No feedback yet
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className='text-center'>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant='ghost' 
                                      size='sm' 
                                      className='h-9 w-9 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                                    >
                                      <MoreHorizontal className='h-5 w-5' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align='end' className='w-52'>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingMarkId(result.studentId);
                                        setEditingMarks({ [result.studentId]: result.marksObtained });
                                      }}
                                      className='cursor-pointer'
                                    >
                                      <Edit className='mr-2 h-4 w-4 text-blue-600' />
                                      <span className='font-medium'>Edit Marks</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        alert(`Student: ${result.studentName}\nEmail: ${result.email}\n\nFeedback:\n${result.feedback || 'No feedback provided'}`);
                                      }}
                                      className='cursor-pointer'
                                    >
                                      <Eye className='mr-2 h-4 w-4 text-green-600' />
                                      <span className='font-medium'>View Full Feedback</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
            Tests Management
          </h1>
          <p className='text-lg text-gray-600 dark:text-gray-400 mt-2'>
            Create and manage tests for your batches with AI-powered evaluation
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          size='lg'
          className='h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200'
        >
          <Plus className='mr-2 h-5 w-5' />
          Create Test
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-6 md:grid-cols-4'>
        <Card className='border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:border dark:border-indigo-800/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-indigo-700 dark:text-indigo-300 text-sm font-medium'>
                  Total Tests
                </p>
                <p className='text-3xl font-bold text-indigo-900 dark:text-indigo-100 mt-1'>
                  {tests.length}
                </p>
                <p className='text-xs text-indigo-600 dark:text-indigo-400 mt-1'>
                  All assessments
                </p>
              </div>
              <div className='h-14 w-14 bg-indigo-200 dark:bg-indigo-800/50 rounded-xl flex items-center justify-center shadow-inner'>
                <FileText className='h-7 w-7 text-indigo-700 dark:text-indigo-300' />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className='border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 dark:border dark:border-green-800/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-700 dark:text-green-300 text-sm font-medium'>
                  Active Tests
                </p>
                <p className='text-3xl font-bold text-green-900 dark:text-green-100 mt-1'>
                  {activeTests}
                </p>
                <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
                  Currently running
                </p>
              </div>
              <div className='h-14 w-14 bg-green-200 dark:bg-green-800/50 rounded-xl flex items-center justify-center shadow-inner'>
                <Clock className='h-7 w-7 text-green-700 dark:text-green-300' />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className='border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 dark:border dark:border-orange-800/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-orange-700 dark:text-orange-300 text-sm font-medium'>
                  Total Questions
                </p>
                <p className='text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1'>
                  {totalQuestions}
                </p>
                <p className='text-xs text-orange-600 dark:text-orange-400 mt-1'>
                  Across all tests
                </p>
              </div>
              <div className='h-14 w-14 bg-orange-200 dark:bg-orange-800/50 rounded-xl flex items-center justify-center shadow-inner'>
                <FileText className='h-7 w-7 text-orange-700 dark:text-orange-300' />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className='border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 dark:border dark:border-purple-800/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-purple-700 dark:text-purple-300 text-sm font-medium'>
                  Total Marks
                </p>
                <p className='text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1'>
                  {tests.reduce((sum, test) => sum + test.maximumMarks, 0)}
                </p>
                <p className='text-xs text-purple-600 dark:text-purple-400 mt-1'>
                  Maximum points
                </p>
              </div>
              <div className='h-14 w-14 bg-purple-200 dark:bg-purple-800/50 rounded-xl flex items-center justify-center shadow-inner'>
                <Trophy className='h-7 w-7 text-purple-700 dark:text-purple-300' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests Table */}
      <Card className='border-0 shadow-xl'>
        <CardHeader className='border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl font-bold flex items-center gap-2'>
                <FileText className='h-6 w-6 text-indigo-600 dark:text-indigo-400' />
                Your Tests
              </CardTitle>
              <CardDescription className='mt-2 text-base'>
                A comprehensive list of all your tests and their details
              </CardDescription>
            </div>
            {tests.length > 0 && (
              <Badge 
                variant='secondary' 
                className='text-sm px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
              >
                {tests.length} {tests.length === 1 ? 'Test' : 'Tests'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {tests.length === 0 ? (
            <div className='text-center py-16 px-4'>
              <div className='w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FileText className='h-12 w-12 text-indigo-600 dark:text-indigo-400' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                No Tests Yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto'>
                Get started by creating your first test. Click the "Create Test" button above to begin.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              >
                <Plus className='mr-2 h-4 w-4' />
                Create Your First Test
              </Button>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50'>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Test Name</TableHead>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Batch</TableHead>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Status</TableHead>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Questions</TableHead>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Submissions</TableHead>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Max Marks</TableHead>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>Created</TableHead>
                    <TableHead className='text-right font-semibold text-gray-700 dark:text-gray-300'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test, index) => (
                    <TableRow 
                      key={test.id}
                      className='hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors duration-150'
                    >
                      <TableCell className='py-4'>
                        <div>
                          <div className='font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2'>
                            <div className='h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm'>
                              {index + 1}
                            </div>
                            {test.name}
                          </div>
                          <div className='text-sm text-gray-600 dark:text-gray-400 truncate max-w-[250px] mt-1'>
                            {test.description || 'No description'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant='outline' 
                          className='bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 font-medium'
                        >
                          {test.batch.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={test.active ? 'default' : 'secondary'}
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            test.active 
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : 'bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                          onClick={() => toggleTestStatus(test.id, test.active)}
                        >
                          {test.active ? '✓ Active' : '○ Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <div className='h-8 w-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center'>
                            <FileText className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                          </div>
                          <span className='font-semibold text-gray-900 dark:text-gray-100'>
                            {test._count?.questions || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <div className='h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                            <Users className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                          </div>
                          <span className='font-semibold text-gray-900 dark:text-gray-100'>
                            {test._count?.answers || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Trophy className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                          <span className='font-semibold text-gray-900 dark:text-gray-100'>
                            {test.maximumMarks}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-gray-600 dark:text-gray-400'>
                        {new Date(test.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant='ghost' 
                              className='h-9 w-9 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                            >
                              <MoreHorizontal className='h-5 w-5' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-56'>
                            <DropdownMenuItem
                              onClick={() => {
                                setViewResultsTestId(test.id);
                                fetchTestResults(test.id);
                              }}
                              className='cursor-pointer'
                            >
                              <BarChart3 className='mr-2 h-4 w-4 text-blue-600' />
                              <span className='font-medium'>View Results & Analysis</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setEvaluatingTestId(test.id)}
                              className='cursor-pointer'
                            >
                              <GraduationCap className='mr-2 h-4 w-4 text-green-600' />
                              <span className='font-medium'>Evaluate & Grade</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTestCreated={handleTestCreated}
      />
    </div>
  );
}
