'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";

export function PasswordResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const validatePassword = (pwd: string) => {
    const regex = /.{8}/;
    return regex.test(pwd);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!validatePassword(value)) {
      setPasswordError("Password must be at least 8 characters.");
    } else {
      setPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError(null);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!token) {
      setError("Invalid or missing token.");
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/users/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password, confirmPassword })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message || "Password reset successful.");
        // ✅ Store the used token in localStorage
        localStorage.setItem(`used-token-${token}`, 'true');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(result.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='w-80'>
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      {/* New Password */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="password">
          New Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            // className={`block w-full rounded-md border ${passwordError ? 'border-red-500' : 'border-gray-300'} p-2 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 focus:outline-none"
          >
            {showPassword ? <IoMdEyeOff size={18} /> : <IoEye size={18} />}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Password must be at least 8 characters.
        </p>
        {passwordError && (
          <p className="mt-1 text-sm text-red-600">{passwordError}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            // required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            // className={`block w-full rounded-md border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'} p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          />
        </div>
        {confirmPasswordError && (
          <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Submiting...' : 'Set Password'}
        </button>
      </div>
    </form>
    </div>
  );
}

