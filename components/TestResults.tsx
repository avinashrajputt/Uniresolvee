'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  Users,
  FileText,
  Award,
  Download,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TestResult {
  id: string;
  percentage: number;
  totalMarks: number;
  marksObtained: number;
  student: {
    id: string;
    name: string;
    regNo: number;
    email: string;
  };
  test: {
    id: string;
    name: string;
    maximumMarks: number;
    batch: {
      name: string;
    };
  };
}

interface Test {
  id: string;
  name: string;
  maximumMarks: number;
  batch: {
    name: string;
  };
}

export default function TestResults() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestsAndResults();
  }, []);

  const fetchTestsAndResults = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching tests and results...');

      const [testsResponse, resultsResponse] = await Promise.all([
        fetch('/api/tests'),
        fetch('/api/results'),
      ]);

      console.log('Tests response status:', testsResponse.status);
      console.log('Results response status:', resultsResponse.status);

      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        console.log('Tests data:', testsData);
        setTests(Array.isArray(testsData) ? testsData : []);
      } else {
        console.error('Failed to fetch tests:', await testsResponse.text());
      }

      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        console.log('Results data:', resultsData);
        setResults(Array.isArray(resultsData) ? resultsData : []);
      } else {
        const errorText = await resultsResponse.text();
        console.error('Failed to fetch results:', errorText);
        // Don't treat this as a critical error since results API might not exist yet
        setResults([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load results data');
      setResults([]);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults =
    selectedTest === 'all'
      ? results
      : results.filter((result) => result.test.id === selectedTest);

  const getStats = (results: TestResult[]) => {
    if (!Array.isArray(results) || results.length === 0) {
      return { avg: 0, highest: 0, lowest: 0, passRate: 0 };
    }

    const scores = results.map((r) => r.percentage);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passRate =
      (results.filter((r) => r.percentage >= 50).length / results.length) * 100;

    return { avg, highest, lowest, passRate };
  };

  const stats = getStats(filteredResults);

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-500' };
    if (percentage >= 70) return { grade: 'B+', color: 'bg-blue-500' };
    if (percentage >= 60) return { grade: 'B', color: 'bg-blue-400' };
    if (percentage >= 50) return { grade: 'C', color: 'bg-yellow-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

  const exportResults = () => {
    if (!Array.isArray(filteredResults) || filteredResults.length === 0) {
      alert('No results to export');
      return;
    }

    const csvContent = [
      [
        'Student Name',
        'Registration No',
        'Test Name',
        'Marks Obtained',
        'Total Marks',
        'Percentage',
        'Grade',
      ].join(','),
      ...filteredResults
        .map((result) =>
          [
            result.student.name,
            result.student.regNo,
            result.test.name,
            result.marksObtained,
            result.totalMarks,
            result.percentage.toFixed(2),
            getGrade(result.percentage).grade,
          ].join(',')
        )
        .filter((line) => line !== ''),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6 py-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30'>
              <Trophy className='h-5 w-5 text-white' />
            </div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent'>Test Results</h1>
          </div>
          <p className='text-gray-400 ml-13'>
            View and analyze student performance across all tests
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={exportResults}
            variant='outline'
            disabled={
              !Array.isArray(filteredResults) || filteredResults.length === 0
            }
            className='bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-purple-500/50'
          >
            <Download className='mr-2 h-4 w-4' />
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <Card className='border-2 border-red-500/30 bg-red-500/10'>
          <CardContent className='pt-6'>
            <p className='text-red-400'>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Test Filter */}
      <Card className='border-0 shadow-xl bg-white/5 backdrop-blur-sm'>
        <CardHeader className='border-b bg-gradient-to-r from-purple-50/5 to-indigo-50/5'>
          <CardTitle className='text-white'>Filter Results</CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='flex gap-4 items-center'>
            <div className='flex-1 max-w-xs'>
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a test' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Tests</SelectItem>
                  {Array.isArray(tests) &&
                    tests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.name} ({test.batch.name})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className='text-sm text-gray-400'>
              Showing{' '}
              {Array.isArray(filteredResults) ? filteredResults.length : 0}{' '}
              results
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card className='border-0 shadow-lg bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-sm border border-blue-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-white'>Average Score</CardTitle>
            <TrendingUp className='h-5 w-5 text-blue-400' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-white'>{stats.avg.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-lg bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-sm border border-green-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-white'>Highest Score</CardTitle>
            <Trophy className='h-5 w-5 text-green-400' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-white'>
              {stats.highest.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-lg bg-gradient-to-br from-orange-600/10 to-red-600/10 backdrop-blur-sm border border-orange-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-white'>Lowest Score</CardTitle>
            <FileText className='h-5 w-5 text-orange-400' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-white'>{stats.lowest.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-lg bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-white'>Pass Rate</CardTitle>
            <Award className='h-5 w-5 text-purple-400' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-white'>
              {stats.passRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card className='border-0 shadow-xl bg-white/5 backdrop-blur-sm'>
        <CardHeader className='border-b bg-gradient-to-r from-purple-50/5 to-indigo-50/5'>
          <CardTitle className='text-white'>Student Results</CardTitle>
          <CardDescription className='text-gray-400'>
            Detailed results for all students and tests
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-6'>
          {!Array.isArray(filteredResults) || filteredResults.length === 0 ? (
            <div className='text-center py-8'>
              <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-muted-foreground'>
                {!Array.isArray(results) || results.length === 0
                  ? 'No test results available yet. Complete some test evaluations to see results here.'
                  : 'No results match the selected filter.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => {
                  const gradeInfo = getGrade(result.percentage);
                  return (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>
                            {result.student.name}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            #{result.student.regNo}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{result.test.name}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {result.test.batch.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className='font-mono'>
                          {result.marksObtained}/{result.totalMarks}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='font-semibold'>
                          {result.percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${gradeInfo.color} text-white`}>
                          {gradeInfo.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='w-16'>
                          <Progress value={result.percentage} className='h-2' />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
