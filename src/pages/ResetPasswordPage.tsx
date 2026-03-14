"use client"
import { Suspense, useEffect, useState } from 'react';
import { PasswordResetForm } from '@/components/PasswordResetForm';
import { useSearchParams } from "next/navigation";
export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isTokenUsed, setIsTokenUsed] = useState(false);

  useEffect(() => {
    if (token) {
      const used = localStorage.getItem(`used-token-${token}`);
      if (used) {
        setIsTokenUsed(true);
      }
    }
  }, [token]);
  if (!token || isTokenUsed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Invalid Reset Link</h1>
          <p className="text-gray-700">
            The password reset link is invalid or expired. Please request a new password reset link.
          </p>
        </div>
      </div>
    );
  }

  return (
    // <div className="flex min-h-screen flex-col items-center justify-center p-4">
    // <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width:"400vh"
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center justify-center  py-[20px]">
          <img src="/logo.png" alt="Logo" className="h-6" />
          <h1 className="text-lg font-bold text-gray-800 uppercase">BASEGROW</h1>
        </div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Set Your Password</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <PasswordResetForm />
        </Suspense>
      </div>
    </div>
  );
}