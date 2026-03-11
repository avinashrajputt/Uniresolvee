'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  User,
  Save,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  RefreshCw,
  CheckCircle,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Question {
  id: string;
  text: string;
  marks: number;
  orderForAi: string;
}

interface Student {
  id: string;
  name: string;
  regNo: number;
  email: string;
}

interface Test {
  id: string;
  name: string;
  description: string;
  maximumMarks: number;
  batch: {
    name: string;
    students: Student[];
  };
  questions: Question[];
}

interface AnswerUploadInterfaceProps {
  testId: string;
  onAnswersUploaded: () => void;
}

export default function AnswerUploadInterface({
  testId,
  onAnswersUploaded,
}: AnswerUploadInterfaceProps) {
  const [test, setTest] = useState<Test | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [digitizedAnswers, setDigitizedAnswers] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}/upload-details`);
      if (response.ok) {
        const data = await response.json();
        setTest(data);
      } else {
        setError('Failed to load test details');
      }
    } catch (error) {
      setError('Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setSuggestion(null);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (!selectedStudent) {
      setError('Please select a student first');
      return;
    }

    clearMessages();

    // Validate file types and sizes
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024 // 10MB limit
    );

    if (invalidFiles.length > 0) {
      setError('Please upload only image files under 10MB each');
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });
      formData.append('testId', testId);
      formData.append('studentId', selectedStudent);

      console.log(
        'Uploading images:',
        files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );

      const response = await fetch('/api/digitize-answers', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Digitization response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process images');
      }

      if (data.answers) {
        setDigitizedAnswers(data.answers);
        setUploadedImages(files);
        setSuccess(
          `Successfully digitized answers from ${files.length} image(s)!`
        );

        // Count non-empty answers
        const nonEmptyAnswers = Object.values(data.answers).filter(
          (answer) => typeof answer === 'string' && answer.trim().length > 0
        ).length;

        if (nonEmptyAnswers > 0) {
          setSuccess(
            `✅ Successfully extracted ${nonEmptyAnswers} answer(s) from ${files.length} image(s)`
          );
        } else {
          setSuggestion(
            'No answers were extracted. Please check if the images are clear and contain visible text.'
          );
        }
      } else {
        throw new Error('No answers returned from processing');
      }
    } catch (error) {
      console.error('Image processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Failed to process images: ${errorMessage}`);

      // Check if it's a processing error with suggestion
      if (
        errorMessage.includes('AI service unable') ||
        errorMessage.includes('image quality')
      ) {
        setSuggestion(
          'Try these tips: 1) Ensure good lighting, 2) Keep camera steady, 3) Make sure text is clear and readable, 4) Upload one page at a time if multiple pages fail'
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const retryProcessing = () => {
    if (uploadedImages.length > 0) {
      // Reset file input and trigger reprocessing
      const fileInput = document.getElementById(
        'answerUpload'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Create a fake event to trigger reprocessing
      const fakeEvent = {
        target: {
          files: uploadedImages,
        },
      } as any;
      handleImageUpload(fakeEvent);
    }
  };

  const updateAnswer = (questionId: string, answer: string) => {
    setDigitizedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const saveAnswers = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    clearMessages();
    setSaving(true);

    try {
      const answersArray = Object.entries(digitizedAnswers)
        .map(([questionId, answer]) => ({
          questionId,
          answer: answer.trim(),
        }))
        .filter((item) => item.answer); // Only save non-empty answers

      console.log('Saving answers:', answersArray);

      const response = await fetch(`/api/tests/${testId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          answers: answersArray,
        }),
      });

      const responseData = await response.json();
      console.log('Save response:', responseData);

      if (response.ok) {
        setSuccess(
          `✅ Successfully saved ${answersArray.length} answer(s) for the student!`
        );
        onAnswersUploaded();

        // Reset form after successful save
        setTimeout(() => {
          setSelectedStudent('');
          setUploadedImages([]);
          setDigitizedAnswers({});
          clearMessages();
        }, 2000);
      } else {
        setError(responseData.error || 'Failed to save answers');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save answers');
    } finally {
      setSaving(false);
    }
  };

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
          <CardTitle>{test.name} - Upload Student Answers</CardTitle>
          <CardDescription>
            Upload clear, well-lit images of answer sheets for automatic
            digitization
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Success Message */}
      {success && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {error}
            {suggestion && (
              <div className='mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm'>
                <strong>💡 Tip:</strong> {suggestion}
              </div>
            )}
            {uploadedImages.length > 0 && (
              <Button
                onClick={retryProcessing}
                variant='outline'
                size='sm'
                className='mt-2'
                disabled={processing}
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry Processing
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder='Choose a student' />
            </SelectTrigger>
            <SelectContent>
              {test.batch.students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} (#{student.regNo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Answer Sheets</CardTitle>
          <CardDescription>
            📸 For best results: Use good lighting, keep camera steady, ensure
            text is clearly readable
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-4'>
            <Button
              onClick={() => document.getElementById('answerUpload')?.click()}
              disabled={!selectedStudent || processing}
              variant='outline'
            >
              {processing ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Upload Images
                </>
              )}
            </Button>
            <input
              id='answerUpload'
              type='file'
              accept='image/*'
              multiple
              onChange={handleImageUpload}
              className='hidden'
            />
            {uploadedImages.length > 0 && (
              <Badge variant='secondary'>
                {uploadedImages.length} image(s) uploaded
              </Badge>
            )}
          </div>

          <div className='text-sm text-gray-600 bg-blue-50 p-3 rounded border'>
            <strong>📋 Upload Tips:</strong>
            <ul className='mt-1 list-disc list-inside space-y-1'>
              <li>Ensure good lighting and minimal shadows</li>
              <li>Keep the camera steady and text in focus</li>
              <li>Upload one page at a time for better accuracy</li>
              <li>Make sure all text is clearly readable</li>
            </ul>
          </div>

          {uploadedImages.length > 0 && (
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {uploadedImages.map((file, index) => (
                <div key={index} className='relative'>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Answer sheet ${index + 1}`}
                    className='w-full h-32 object-cover rounded border'
                  />
                  <Badge className='absolute top-1 right-1' variant='secondary'>
                    Page {index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions and Digitized Answers */}
      {test.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions & Digitized Answers</CardTitle>
            <CardDescription>
              Review and edit the digitized answers before saving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {test.questions
                .sort((a, b) => a.orderForAi.localeCompare(b.orderForAi))
                .map((question, index) => {
                  const hasAnswer =
                    digitizedAnswers[question.id] &&
                    digitizedAnswers[question.id].trim().length > 0;

                  return (
                    <div key={question.id} className='border rounded-lg p-4'>
                      <div className='space-y-4'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <h4 className='font-medium text-lg'>
                              Question {index + 1}
                              <Badge variant='secondary' className='ml-2'>
                                {question.orderForAi}
                              </Badge>
                              {hasAnswer && (
                                <Badge
                                  variant='default'
                                  className='ml-2 bg-green-100 text-green-800'
                                >
                                  ✓ Answered
                                </Badge>
                              )}
                            </h4>
                            <p className='text-gray-600 mt-2 whitespace-pre-wrap'>
                              {question.text}
                            </p>
                          </div>
                          <Badge variant='outline'>
                            {question.marks} marks
                          </Badge>
                        </div>

                        <div>
                          <Label htmlFor={`answer-${question.id}`}>
                            Digitized Answer:
                          </Label>
                          <Textarea
                            id={`answer-${question.id}`}
                            value={digitizedAnswers[question.id] || ''}
                            onChange={(e) =>
                              updateAnswer(question.id, e.target.value)
                            }
                            placeholder='Answer will appear here after uploading images...'
                            rows={6}
                            className='mt-2'
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {Object.keys(digitizedAnswers).length > 0 && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex justify-end'>
              <Button onClick={saveAnswers} disabled={saving}>
                {saving ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Save Answers
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
