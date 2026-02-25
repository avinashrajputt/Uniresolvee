'use client';

import { FilePlus, LayoutDashboard, LogOut, Sparkles, GraduationCap } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { signOut, useSession } from 'next-auth/react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useCallback, useMemo } from 'react';

export default function Appbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname?.includes(path);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const userInitials = useMemo(() => 
    getInitials(session?.user?.name || session?.user?.email || 'U'),
    [session?.user?.name, session?.user?.email, getInitials]
  );

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm'>
      <div className='container mx-auto flex items-center justify-between py-3 px-4'>
        {/* Logo Section */}
        <div
          onClick={() => router.push('/dashboard/tests')}
          className='cursor-pointer flex items-center gap-2 group'
        >
          <div className='h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105'>
            <GraduationCap className='h-6 w-6 text-white' />
          </div>
          <div className='flex flex-col'>
            <div className='font-bold text-xl tracking-tight'>
              <span className='bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                UniResolve
              </span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {/* User Profile Section */}
          {session?.user && (
            <div className='hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600'>
              <Avatar className='h-9 w-9 border-2 border-indigo-500 shadow-md'>
                <AvatarFallback className='bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold'>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                  {session.user.name || session.user.email?.split('@')[0]}
                </span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {session.user.email}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <nav className='flex items-center gap-2'>
            <Button
              size='default'
              onClick={() => router.push('/dashboard/batches')}
              className={`flex items-center gap-2 h-10 px-4 font-semibold transition-all duration-200 ${
                isActive('/batches')
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className='hidden sm:inline'>Batches</span>
            </Button>

            <Button
              size='default'
              onClick={() => router.push('/dashboard/tests')}
              className={`flex items-center gap-2 h-10 px-4 font-semibold transition-all duration-200 ${
                isActive('/tests')
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
              }`}
            >
              <FilePlus size={18} />
              <span className='hidden sm:inline'>Tests</span>
            </Button>

            <Button
              variant='ghost'
              size='default'
              onClick={() => signOut({ callbackUrl: '/' })}
              className='flex items-center gap-2 h-10 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-all duration-200 hover:scale-105'
            >
              <LogOut size={18} />
              <span className='hidden sm:inline'>Sign Out</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
