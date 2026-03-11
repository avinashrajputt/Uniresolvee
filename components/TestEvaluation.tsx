'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Award,
  FileText,
  User,
  Clock,
  ArrowLeft,
  Upload,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnswerUploadInterface from './AnswerUploadInterface';

interface Answer {
  id: string;
  questionId: string;
  answer: string;
  marksScored: number;
  remarks: string;
  question: {
    id: string;
    text: string;
    marks: number;
    orderForAi: string;
  };
  student: {
    id: string;
    name: string;
    regNo: number;
    email: string;
  };
}

interface Test {
  id: string;
  name: string;
  description: string;
  maximumMarks: number;
  batch: {
    name: string;
  };
  questions: Array<{
    id: string;
    text: string;
    marks: number;
    orderForAi: string;
  }>;
}

interface TestEvaluationProps {
  testId: string;
  onBack?: () => void;
}

export default function TestEvaluation({
  testId,
  onBack,
}: TestEvaluationProps) {
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoGrading, setAutoGrading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [grading, setGrading] = useState<
    Record<string, { marks: number; remarks: string }>
  >({});
  const [activeTab, setActiveTab] = useState('upload');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestAndAnswers();
  }, [testId]);

  const fetchTestAndAnswers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching test details for:', testId);

      const [testResponse, answersResponse] = await Promise.all([
        fetch(`/api/tests/${testId}/details`),
        fetch(`/api/tests/${testId}/evaluation`),
      ]);

      console.log('Test response status:', testResponse.status);
      console.log('Answers response status:', answersResponse.status);

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Test data:', testData);
        setTest(testData);
      } else {
        const errorText = await testResponse.text();
        console.error('Failed to fetch test:', errorText);
        setError('Failed to load test details');
      }

      if (answersResponse.ok) {
        const answersData = await answersResponse.json();
        console.log('Answers data:', answersData);
        setAnswers(answersData);

        // Initialize grading state
        const gradingState: Record<string, { marks: number; remarks: string }> =
          {};
        answersData.forEach((answer: Answer) => {
          gradingState[answer.id] = {
            marks: answer.marksScored || 0,
            remarks: answer.remarks || '',
          };
        });
        setGrading(gradingState);
      } else {
        const errorText = await answersResponse.text();
        console.error('Failed to fetch answers:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch test data:', error);
      setError('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const updateGrading = (
    answerId: string,
    field: 'marks' | 'remarks',
    value: string | number
  ) => {
    setGrading((prev) => ({
      ...prev,
      [answerId]: {
        ...(prev[answerId] || { marks: 0, remarks: '' }),
        [field]: value,
      },
    }));
  };

  const saveGrading = async () => {
    setSaving(true);
    setError(null);
    try {
      const gradingData = Object.entries(grading).map(([answerId, grade]) => ({
        answerId,
        marksScored: grade.marks,
        remarks: grade.remarks,
      }));

      console.log('Saving grades:', gradingData);

      const response = await fetch(`/api/tests/${testId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grades: gradingData }),
      });

      const responseData = await response.json();
      console.log('Save response:', responseData);

      if (response.ok) {
        alert(
          `Grades saved successfully! Updated ${responseData.updatedCount}/${responseData.totalGrades} grades.`
        );
        fetchTestAndAnswers(); // Refresh data
      } else {
        throw new Error(responseData.error || 'Failed to save grades');
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Failed to save grades: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const autoGradeAll = async () => {
    setAutoGrading(true);
    setError(null);
    try {
      console.log('Starting auto-grading...');

      const response = await fetch(`/api/tests/${testId}/auto-grade`, {
        method: 'POST',
      });

      const responseData = await response.json();
      console.log('Auto-grade response:', responseData);

      if (response.ok) {
        alert(
          `Auto-grading completed! Graded ${responseData.gradedCount}/${responseData.totalAnswers} answers.`
        );
        fetchTestAndAnswers(); // Refresh data
      } else {
        throw new Error(responseData.error || 'Auto-grading failed');
      }
    } catch (error) {
      console.error('Auto-grading error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Auto-grading failed: ${errorMessage}`);
    } finally {
      setAutoGrading(false);
    }
  };

  const getStudents = () => {
    const studentMap = new Map();
    answers.forEach((answer) => {
      if (!studentMap.has(answer.student.id)) {
        studentMap.set(answer.student.id, {
          ...answer.student,
          answers: [],
        });
      }
      studentMap.get(answer.student.id).answers.push(answer);
    });
    return Array.from(studentMap.values());
  };

  const getStudentTotal = (studentId: string) => {
    const studentAnswers = answers.filter((a) => a.student.id === studentId);
    return studentAnswers.reduce((sum, answer) => {
      const grade = grading[answer.id];
      return sum + (grade?.marks || answer.marksScored || 0);
    }, 0);
  };

  const students = getStudents();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!test) {
    return (
      <Alert variant='destructive'>
        <AlertDescription>Test not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {onBack && (
                <Button variant='ghost' onClick={onBack}>
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              )}
              <div>
                <CardTitle>{test.name} - Evaluation</CardTitle>
                <CardDescription>
                  Batch: {test.batch.name} • Max Marks: {test.maximumMarks} •
                  Questions: {test.questions?.length || 0}
                </CardDescription>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={fetchTestAndAnswers}
                variant='outline'
                size='sm'
                disabled={loading}
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Refresh
              </Button>
              <Button
                onClick={autoGradeAll}
                disabled={autoGrading || answers.length === 0}
                variant='outline'
              >
                {autoGrading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
                    Auto Grading...
                  </>
                ) : (
                  <>
                    <Award className='mr-2 h-4 w-4' />
                    Auto Grade All
                  </>
                )}
              </Button>
              <Button
                onClick={saveGrading}
                disabled={saving || Object.keys(grading).length === 0}
              >
                {saving ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Save Grades
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Show Test Questions */}
      {test.questions && test.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Questions ({test.questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {test.questions
                .sort((a, b) => a.orderForAi.localeCompare(b.orderForAi))
                .map((question, index) => (
                  <div key={question.id} className='border rounded-lg p-4'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h4 className='font-medium'>
                          Question {index + 1}
                          <Badge variant='secondary' className='ml-2'>
                            {question.orderForAi}
                          </Badge>
                        </h4>
                        <p className='text-gray-600 mt-2 whitespace-pre-wrap'>
                          {question.text}
                        </p>
                      </div>
                      <Badge variant='outline'>{question.marks} marks</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='upload'>Upload Answers</TabsTrigger>
          <TabsTrigger value='grade'>
            Grade & Evaluate ({answers.length} submissions)
          </TabsTrigger>
        </TabsList>

        <TabsContent value='upload'>
          <AnswerUploadInterface
            testId={testId}
            onAnswersUploaded={() => {
              fetchTestAndAnswers();
              setActiveTab('grade');
            }}
          />
        </TabsContent>

        <TabsContent value='grade'>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            {/* Student List */}
            <Card className='lg:col-span-1'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Students ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {students.length === 0 ? (
                  <p className='text-sm text-gray-500'>
                    No student answers uploaded yet.
                  </p>
                ) : (
                  students.map((student) => {
                    const total = getStudentTotal(student.id);
                    const percentage =
                      test.maximumMarks > 0
                        ? (total / test.maximumMarks) * 100
                        : 0;

                    return (
                      <div
                        key={student.id}
                        className={`p-3 rounded border cursor-pointer ${
                          selectedStudent === student.id
                            ? 'border-blue-500'
                            : ''
                        }`}
                        onClick={() => setSelectedStudent(student.id)}
                      >
                        <div className='font-medium'>{student.name}</div>
                        <div className='text-sm text-gray-500'>
                          #{student.regNo}
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                          <Progress value={percentage} className='flex-1 h-2' />
                          <span className='text-xs font-medium'>
                            {total}/{test.maximumMarks}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Answer Grading */}
            <Card className='lg:col-span-3'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {selectedStudent
                    ? `Grading - ${
                        students.find((s) => s.id === selectedStudent)?.name
                      }`
                    : 'Select a student to start grading'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className='space-y-6'>
                    {answers.filter((answer) => answer.student.id === selectedStudent).some(a => a.marksScored === 0 && !a.remarks) && (
                      <Alert className='border-yellow-500 bg-yellow-50'>
                        <AlertDescription>
                          <div className='flex items-center justify-between'>
                            <span className='font-medium'>
                              ⚠️ This student's answers haven't been graded by AI yet.
                            </span>
                            <Button 
                              onClick={autoGradeAll}
                              disabled={autoGrading}
                              size='sm'
                              variant='default'
                            >
                              {autoGrading ? 'Grading...' : 'Grade Now with AI'}
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    {answers
                      .filter((answer) => answer.student.id === selectedStudent)
                      .sort((a, b) =>
                        a.question.orderForAi.localeCompare(
                          b.question.orderForAi
                        )
                      )
                      .map((answer, index) => (
                        <div key={answer.id} className='border rounded-lg p-4'>
                          <div className='space-y-4'>
                            <div className='flex justify-between items-start'>
                              <div>
                                <h4 className='font-medium text-lg'>
                                  Question {index + 1}
                                  <Badge variant='secondary' className='ml-2'>
                                    {answer.question.orderForAi}
                                  </Badge>
                                </h4>
                                <p className='text-gray-600 mt-2 whitespace-pre-wrap'>
                                  {answer.question.text}
                                </p>
                              </div>
                              <Badge variant='outline'>
                                Max: {answer.question.marks} marks
                              </Badge>
                            </div>

                            <div>
                              <div className='flex justify-between items-center mb-1'>
                                <Label className='text-sm font-medium'>
                                  Student's Answer:
                                </Label>
                                {(answer.marksScored === 0 && !answer.remarks) ? (
                                  <Badge variant='destructive' className='text-xs'>
                                    ⚠️ Not Graded - Click "Auto Grade All"
                                  </Badge>
                                ) : (
                                  <Badge variant='default' className='text-xs bg-green-600'>
                                    ✓ Graded by AI
                                  </Badge>
                                )}
                              </div>
                              <div className='p-3 rounded border mt-1'>
                                <p className='whitespace-pre-wrap'>
                                  {answer.answer || 'No answer provided'}
                                </p>
                              </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <div>
                                <Label htmlFor={`marks-${answer.id}`}>
                                  Marks Scored
                                </Label>
                                <Input
                                  id={`marks-${answer.id}`}
                                  type='number'
                                  min='0'
                                  max={answer.question.marks}
                                  value={
                                    grading[answer.id]?.marks ??
                                    answer.marksScored ??
                                    0
                                  }
                                  onChange={(e) =>
                                    updateGrading(
                                      answer.id,
                                      'marks',
                                      Math.min(
                                        answer.question.marks,
                                        Math.max(
                                          0,
                                          parseInt(e.target.value) || 0
                                        )
                                      )
                                    )
                                  }
                                />
                                {(grading[answer.id]?.marks ?? answer.marksScored ?? 0) > 0 && (
                                  <div className='mt-2'>
                                    <Badge variant='default' className='text-xs'>
                                      {Math.round(((grading[answer.id]?.marks ?? answer.marksScored ?? 0) / answer.question.marks) * 100)}% Score
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <div className='md:col-span-1'>
                                <Label htmlFor={`remarks-${answer.id}`}>
                                  AI Feedback & Remarks
                                </Label>
                                <Textarea
                                  id={`remarks-${answer.id}`}
                                  value={
                                    grading[answer.id]?.remarks ??
                                    answer.remarks ??
                                    ''
                                  }
                                  onChange={(e) =>
                                    updateGrading(
                                      answer.id,
                                      'remarks',
                                      e.target.value
                                    )
                                  }
                                  placeholder='AI will provide detailed feedback here after auto-grading...'
                                  rows={3}
                                  className='resize-none'
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className='text-center py-12 text-gray-500'>
                    <User className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>
                      Select a student from the list to start grading their
                      answers
                    </p>
                    {students.length === 0 && (
                      <p className='mt-2'>
                        Upload student answers first using the "Upload Answers"
                        tab
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
