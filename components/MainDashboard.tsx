'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BatchDashboard from './BatchDashboard';
import TestDashboard from './TestDashboard';
import TestResults from './TestResults';
import { GraduationCap, Users, FileText, BarChart3 } from 'lucide-react';

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState('batches');

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30'>
            <GraduationCap className='h-6 w-6 text-white' />
          </div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent'>UniResolve Dashboard</h1>
        </div>
        <p className='text-gray-400 text-lg'>Manage your batches, tests, and view results in one place</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3 bg-white/5 border border-white/10 p-1 rounded-xl backdrop-blur-sm'>
          <TabsTrigger 
            value='batches' 
            className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-200 flex items-center gap-2'
          >
            <Users className='h-4 w-4' />
            Batches
          </TabsTrigger>
          <TabsTrigger 
            value='tests' 
            className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-200 flex items-center gap-2'
          >
            <FileText className='h-4 w-4' />
            Tests
          </TabsTrigger>
          <TabsTrigger 
            value='results' 
            className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-200 flex items-center gap-2'
          >
            <BarChart3 className='h-4 w-4' />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value='batches'>
          <BatchDashboard />
        </TabsContent>

        <TabsContent value='tests'>
          <TestDashboard />
        </TabsContent>

        <TabsContent value='results'>
          <TestResults />
        </TabsContent>
      </Tabs>
    </div>
  );
}
