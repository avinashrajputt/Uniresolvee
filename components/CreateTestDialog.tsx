'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Image, Loader2, FileText, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Question {
  text: string;
  marks: number;
  orderForAi: string;
}

interface Batch {
  id: string;
  name: string;
  _count: {
    students: number;
  };
}

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestCreated: (test: any) => void;
}

export function CreateTestDialog({
  open,
  onOpenChange,
  onTestCreated,
}: CreateTestDialogProps) {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', marks: 0, orderForAi: '' },
  ]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [batchesLoading, setBatchesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    setBatchesLoading(true);
    try {
      console.log('Fetching batches...'); // Debug log
      const response = await fetch('/api/batches');
      console.log('Batches response status:', response.status); // Debug log

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Batches data:', data); // Debug log

      setBatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      setError('Failed to load batches. Please try again.');
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string | number
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value as never;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', marks: 0, orderForAi: '' }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError('Image file too large. Please upload a file smaller than 10MB.');
      return;
    }

    setImageUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading image for digitization...'); // Debug log

      const response = await fetch('/api/digitize-questions', {
        method: 'POST',
        body: formData,
      });

      console.log('Digitization response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const data = await response.json();
      console.log('Digitization result:', data); // Debug log

      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setUploadedImage(URL.createObjectURL(file));
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError(`Failed to process image: ${error.message}`);
    } finally {
      setImageUploading(false);
    }
  };

  const calculateMaxMarks = () => {
    return questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validQuestions = questions.filter(
        (q) => q.text.trim() && q.marks > 0
      );

      if (validQuestions.length === 0) {
        setError('Please add at least one valid question');
        setLoading(false);
        return;
      }

      if (!selectedBatchId) {
        setError('Please select a batch');
        setLoading(false);
        return;
      }

      if (!testName.trim()) {
        setError('Please enter a test name');
        setLoading(false);
        return;
      }

      console.log('Submitting test:', {
        name: testName,
        description,
        batchId: selectedBatchId,
        active: isActive,
        maximumMarks: calculateMaxMarks(),
        questions: validQuestions,
      });

      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: testName,
          description,
          batchId: selectedBatchId,
          active: isActive,
          maximumMarks: calculateMaxMarks(),
          questions: validQuestions,
        }),
      });

      const responseData = await response.json();
      console.log('Test creation response:', responseData);

      if (response.ok) {
        onTestCreated(responseData);

        // Reset form
        setTestName('');
        setDescription('');
        setSelectedBatchId('');
        setIsActive(false);
        setQuestions([{ text: '', marks: 0, orderForAi: '' }]);
        setUploadedImage(null);
        setError(null);
      } else {
        setError(responseData.error || 'Failed to create test');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      setError('Network error: Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-indigo-500/20'>
        <DialogHeader className='space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg'>
              <FileText className='h-6 w-6 text-white' />
            </div>
            <div>
              <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                Create New Test
              </DialogTitle>
              <DialogDescription className='text-base mt-1'>
                Create a new test for your batch. Add questions manually or upload an image to digitize them with AI.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant='destructive' className='border-2 border-red-500/50 bg-red-50 dark:bg-red-900/20'>
            <AlertCircle className='h-5 w-5' />
            <AlertDescription className='font-medium'>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Test Details */}
          <Card className='border-0 shadow-xl bg-white dark:bg-gray-800/50'>
            <CardHeader className='border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-2 rounded-full bg-indigo-500'></div>
                <CardTitle className='text-xl font-bold text-gray-900 dark:text-gray-100'>Test Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-5 pt-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='testName' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Test Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='testName'
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder='e.g., Mid-term Exam'
                    required
                    className='h-11 border-2 focus:border-indigo-500 focus:ring-indigo-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='batch' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Select Batch <span className='text-red-500'>*</span>
                  </Label>
                  <Select
                    value={selectedBatchId}
                    onValueChange={setSelectedBatchId}
                    required
                  >
                    <SelectTrigger className='h-11 border-2 focus:border-indigo-500'>
                      <SelectValue placeholder='Choose a batch' />
                    </SelectTrigger>
                    <SelectContent>
                      {batchesLoading ? (
                        <SelectItem value='loading' disabled>
                          <div className='flex items-center gap-2'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Loading batches...
                          </div>
                        </SelectItem>
                      ) : batches.length === 0 ? (
                        <SelectItem value='no-batches' disabled>
                          No batches found. Create a batch first.
                        </SelectItem>
                      ) : (
                        batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            <div className='flex items-center justify-between w-full'>
                              <span>{batch.name}</span>
                              <Badge variant='secondary' className='ml-2'>
                                {batch._count?.students || 0} students
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Brief description of the test'
                  rows={3}
                  className='border-2 focus:border-indigo-500 resize-none'
                />
              </div>
              <div className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800'>
                <div className='flex items-center space-x-3'>
                  <Switch
                    id='active'
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className='data-[state=checked]:bg-indigo-600'
                  />
                  <Label htmlFor='active' className='font-medium cursor-pointer'>
                    Make test active immediately
                  </Label>
                </div>
                <Badge variant='outline' className='bg-white dark:bg-gray-800 px-4 py-1.5'>
                  Max Marks: <span className='font-bold text-indigo-600 ml-1'>{calculateMaxMarks()}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload for Question Digitization */}
          <Card className='border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'>
            <CardHeader className='border-b border-purple-200 dark:border-purple-800'>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                <CardTitle className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                  Upload Question Sheet
                </CardTitle>
              </div>
              <CardDescription className='text-base mt-2'>
                Upload an image of your question paper to automatically extract questions using AI
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 pt-6'>
              <div className='flex items-center gap-4'>
                <Button
                  type='button'
                  size='lg'
                  disabled={imageUploading}
                  onClick={() =>
                    document.getElementById('imageUpload')?.click()
                  }
                  className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
                >
                  {imageUploading ? (
                    <>
                      <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Upload className='mr-2 h-5 w-5' />
                      Upload Image
                    </>
                  )}
                </Button>
                <input
                  id='imageUpload'
                  type='file'
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='hidden'
                />
                {uploadedImage && (
                  <div className='flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-800'>
                    <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
                    <span className='text-sm font-semibold text-green-700 dark:text-green-300'>
                      Image processed successfully
                    </span>
                  </div>
                )}
              </div>
              {uploadedImage && (
                <div className='mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-inner'>
                  <img
                    src={uploadedImage}
                    alt='Uploaded question sheet'
                    className='max-w-full h-40 object-contain mx-auto rounded-lg'
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Separator className='my-8' />

          {/* Questions */}
          <Card className='border-0 shadow-xl bg-white dark:bg-gray-800/50'>
            <CardHeader className='flex flex-row items-center justify-between border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'>
              <div>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  <CardTitle className='text-xl font-bold text-gray-900 dark:text-gray-100'>Questions</CardTitle>
                </div>
                <CardDescription className='mt-2 text-base'>
                  Add questions manually or use the image upload above
                </CardDescription>
              </div>
              <Button
                type='button'
                onClick={addQuestion}
                size='lg'
                className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className='pt-6'>
              <div className='space-y-6'>
                {questions.map((question, index) => (
                  <div 
                    key={index} 
                    className='border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 hover:shadow-lg'
                  >
                    <div className='flex justify-between items-start mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md'>
                          {index + 1}
                        </div>
                        <h4 className='font-bold text-lg text-gray-900 dark:text-gray-100'>
                          Question {index + 1}
                        </h4>
                      </div>
                      {questions.length > 1 && (
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          onClick={() => removeQuestion(index)}
                          className='border-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    <div className='grid grid-cols-1 gap-5'>
                      <div className='space-y-2'>
                        <Label htmlFor={`question-${index}`} className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                          Question Text <span className='text-red-500'>*</span>
                        </Label>
                        <Textarea
                          id={`question-${index}`}
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionChange(index, 'text', e.target.value)
                          }
                          placeholder='Enter the question...'
                          rows={3}
                          required
                          className='border-2 focus:border-indigo-500 resize-none'
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor={`marks-${index}`} className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                            Marks <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            id={`marks-${index}`}
                            type='number'
                            min='1'
                            value={question.marks}
                            onChange={(e) =>
                              handleQuestionChange(
                                index,
                                'marks',
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder='0'
                            required
                            className='h-11 border-2 focus:border-indigo-500'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor={`order-${index}`} className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                            AI Order/Hint
                          </Label>
                          <Input
                            id={`order-${index}`}
                            value={question.orderForAi}
                            onChange={(e) =>
                              handleQuestionChange(
                                index,
                                'orderForAi',
                                e.target.value
                              )
                            }
                            placeholder='e.g., Q1, Part A'
                            className='h-11 border-2 focus:border-indigo-500'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {questions.length === 0 && (
                  <div className='text-center py-12'>
                    <div className='w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <FileText className='h-10 w-10 text-gray-400' />
                    </div>
                    <p className='text-gray-600 dark:text-gray-400'>
                      No questions added yet. Click "Add Question" to get started.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className='flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <Button
              type='button'
              variant='outline'
              size='lg'
              onClick={() => onOpenChange(false)}
              className='px-8 border-2 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              Cancel
            </Button>
            <Button 
              type='submit' 
              size='lg' 
              disabled={loading || batchesLoading}
              className='px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Creating Test...
                </>
              ) : (
                <>
                  <CheckCircle2 className='mr-2 h-5 w-5' />
                  Create Test
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
