'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BatchDashboard from './BatchDashboard';
import TestDashboard from './TestDashboard';
import TestResults from './TestResults';

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState('batches');

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>UniResolve Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='batches'>Batches</TabsTrigger>
          <TabsTrigger value='tests'>Tests</TabsTrigger>
          <TabsTrigger value='results'>Results</TabsTrigger>
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
