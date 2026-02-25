'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { signUpForm, handleSignUp, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = signUpForm;

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={handleSubmit(handleSignUp)}
    >
      <div className='grid gap-6'>
        <div className='flex items-center gap-2'>
          <div className='grid gap-3 flex-1'>
            <Label htmlFor='firstname' className='text-white font-medium'>Firstname</Label>
            <Input
              id='firstname'
              type='text'
              placeholder='John'
              {...register('firstname')}
              required
              className={cn(
                'bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12 px-4 rounded-lg',
                'focus:bg-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
                'transition-all duration-200',
                errors.firstname && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {errors.firstname && (
              <p className='text-xs text-red-400'>
                {errors.firstname.message}
              </p>
            )}
          </div>
          <div className='grid gap-3 flex-1'>
            <Label htmlFor='lastname' className='text-white font-medium'>Lastname</Label>
            <Input
              id='lastname'
              type='text'
              placeholder='Doe'
              {...register('lastname')}
              required
              className={cn(
                'bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12 px-4 rounded-lg',
                'focus:bg-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
                'transition-all duration-200',
                errors.lastname && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {errors.lastname && (
              <p className='text-xs text-red-400'>
                {errors.lastname.message}
              </p>
            )}
          </div>
        </div>
        <div className='grid gap-3'>
          <Label htmlFor='email' className='text-white font-medium'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='m@example.com'
            {...register('email')}
            className={cn(
              'bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12 px-4 rounded-lg',
              'focus:bg-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
              'transition-all duration-200',
              errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
            required
          />
          {errors.email && (
            <p className='text-xs text-red-400'>{errors.email.message}</p>
          )}
        </div>
        <div className='grid gap-3'>
          <Label htmlFor='password' className='text-white font-medium'>Password</Label>
          <Input
            id='password'
            type='password'
            required
            {...register('password')}
            className={cn(
              'bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12 px-4 rounded-lg',
              'focus:bg-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
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
        <Button 
          type='submit' 
          className='w-full h-12 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30' 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Creating Account...
            </>
          ) : (
            'Create your Account'
          )}
        </Button>
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
          Signup with Google
        </Button>
      </div>
      <div className='text-center text-sm text-gray-400'>
        Already have an account?{' '}
        <a href='/auth/login' className='text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors'>
          Login
        </a>
      </div>
    </form>
  );
}
