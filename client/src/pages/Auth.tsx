import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { signIn, signUp, loading } = useSupabase();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleSignup = async (data: SignupFormValues) => {
    try {
      await signUp(data.email, data.password, data.fullName);
      loginForm.setValue('email', data.email);
      loginForm.setValue('password', data.password);
      setActiveTab('login');
      toast({
        title: 'Account created successfully',
        description: 'You can now log in with your credentials',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 shadow-md rounded-lg p-8 bg-white">
      <div className="flex border-b border-gray-200 mb-6">
        <Button
          variant="ghost"
          className={`px-4 py-2 font-medium ${
            activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </Button>
        <Button
          variant="ghost"
          className={`px-4 py-2 font-medium ${
            activeTab === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </Button>
      </div>

      {activeTab === 'login' ? (
        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              {...loginForm.register('email')}
              className="mt-1"
            />
            {loginForm.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              {...loginForm.register('password')}
              className="mt-1"
            />
            {loginForm.formState.errors.password && (
              <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      ) : (
        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
          <div>
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              {...signupForm.register('fullName')}
              className="mt-1"
            />
            {signupForm.formState.errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.fullName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              {...signupForm.register('email')}
              className="mt-1"
            />
            {signupForm.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              {...signupForm.register('password')}
              className="mt-1"
            />
            {signupForm.formState.errors.password && (
              <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="signup-confirm">Confirm Password</Label>
            <Input
              id="signup-confirm"
              type="password"
              {...signupForm.register('confirmPassword')}
              className="mt-1"
            />
            {signupForm.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default Auth;
