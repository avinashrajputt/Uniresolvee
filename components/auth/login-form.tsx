'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { signInForm, handleSignIn, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = signInForm;

  return (
    <div>
      <form
        className={cn('flex flex-col gap-6', className)}
        {...props}
        onSubmit={handleSubmit(handleSignIn)}
      >
        <div className='grid gap-6'>
          <div className='grid gap-3'>
            <Label htmlFor='email' className='text-white font-medium'>Email</Label>
            <Input
              id='email'
              type='email'
              {...register('email')}
              placeholder='m@example.com'
              required
              className={cn(
                'bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12 px-4 rounded-lg',
                'focus:bg-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                'transition-all duration-200',
                errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {errors.email && (
              <p className='text-xs text-red-400'>{errors.email.message}</p>
            )}
          </div>
          <div className='grid gap-3'>
            <div className='flex items-center'>
              <Label htmlFor='password' className='text-white font-medium'>Password</Label>
              {/* <a
                href='#'
                className='ml-auto text-sm underline-offset-4 hover:underline'
              >
                Forgot your password?
              </a> */}
            </div>
            <Input
              id='password'
              type='password'
              {...register('password')}
              required
              className={cn(
                'bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12 px-4 rounded-lg',
                'focus:bg-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                'transition-all duration-200',
                errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {errors.password && (
              <p className='text-xs text-red-400'>
                {errors.password.message}
              </p>
            )}
          </div>
          {errors.root && (
            <p className='text-xs text-red-400 text-center'>
              {errors.root.message}
            </p>
          )}
          <Button 
            type='submit' 
            className='w-full h-12 bg-gradient-to-r from-[#6d5df6] to-[#3b82f6] hover:from-[#5d4de6] hover:to-[#2b72e6] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20' 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing In...
              </>
            ) : (
              'SignIn'
            )}
          </Button>
        </div>
      </form>
      <div className='grid gap-6 mt-6'>
        <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10'>
          <span className='bg-[#0a0f1e] text-gray-400 relative z-10 px-3'>
            Or continue with
          </span>
        </div>
        <Button 
          variant='outline' 
          className='w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-lg transition-all duration-200' 
          type='button' 
          onClick={() => signIn('google')}
        >
          <Image
            src='/google-logo.svg'
            alt='Google Logo'
            width={15}
            height={15}
            className='mr-2'
          />
          Login with Google
        </Button>
        <div className='text-center text-sm text-gray-400'>
          Don&apos;t have an account?{' '}
          <a href='/auth/signup' className='text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors'>
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
