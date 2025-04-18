import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const password = watch('password'); // For confirm password validation

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null); // Reset error state

    // Map 'fullname' to match backend expectation
    const signupData = {
      fullname: data.fullname,
      email: data.email,
      password: data.password,
    };

    try {
      const response = await fetch('https://expensetracker-server-644u.onrender.com/api/v1/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const result = await response.json();
      if (result.success) {
        console.log('Signup success:', result);
        navigate('/login'); // Redirect to login page on success
      } else {
        throw new Error(result.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8 bg-gray-900 p-6 rounded-lg shadow-md">
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-100">Sign Up</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Create your expense tracker account
        </p>
      </div>
  
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
  
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              {...register('fullname', { required: 'Full name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="John Doe"
            />
            {errors.fullname && <p className="mt-1 text-sm text-red-500">{errors.fullname.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>
  
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-green-500 hover:text-green-400">
          Log in
        </Link>
      </p>
    </div>
  </div>
  
  );
}

export default Signup;