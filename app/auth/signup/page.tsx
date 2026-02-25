import { SignupForm } from '@/components/auth/signup-form';
import { GraduationCap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className='grid min-h-screen lg:grid-cols-2 text-white bg-gradient-to-b from-[#071026] via-[#0a1435] to-[#0f1729] relative overflow-hidden'>
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
      
      <div className='flex flex-col gap-4 p-6 md:p-10 relative z-10'>
        <div className='flex items-center gap-3 mb-6'>
          <Link href='/' className='flex items-center gap-3 group'>
            <div className='w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/40 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/50'>
              <GraduationCap className='h-6 w-6 text-white' />
            </div>
            <div className='text-white font-semibold text-xl'>UniResolve</div>
          </Link>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-md'>
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-2'>Create an account</h1>
              <p className='text-gray-400'>Join us and start your journey today</p>
            </div>
            <SignupForm />
          </div>
        </div>
      </div>
      <div className='relative hidden lg:flex items-center justify-center p-10 bg-gradient-to-br from-purple-600/10 via-indigo-600/10 to-purple-600/10 backdrop-blur-sm border-l border-white/5'>
        <div className='max-w-md text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 mb-6 backdrop-blur-sm'>
            <Sparkles className='h-4 w-4 text-purple-400' />
            <span className='text-sm font-medium text-purple-300'>AI-Powered Platform</span>
          </div>
          <h2 className='text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent'>
            Transform Your Assessment Process
          </h2>
          <p className='text-gray-400 leading-relaxed'>
            Join thousands of educators using UniResolve to deliver accurate, fair, and fast grading at scale with cutting-edge AI technology.
          </p>
        </div>
      </div>
    </div>
  );
}
