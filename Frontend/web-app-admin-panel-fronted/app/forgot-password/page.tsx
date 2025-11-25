"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useForgotPasswordMutation,
  useVerifyForgotPasswordOTPMutation,
  useChangePasswordMutation,
} from "@/redux/features/auth/authApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  KeyRound,
  Lock,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [forgotPassword, { isLoading: isSendingOTP }] =
    useForgotPasswordMutation();
  const [verifyOTP, { isLoading: isVerifyingOTP }] =
    useVerifyForgotPasswordOTPMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await forgotPassword(email).unwrap();
      // Capture the token returned from forgotPassword
      if (response.data?.forgotPasswordToken) {
        setResetToken(response.data.forgotPasswordToken);
      }
      setStep(2);
      setSuccessMessage("OTP sent to your email.");
    } catch (err: any) {
      setError(err.data?.message || "Failed to send OTP.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // Pass the captured token to verifyOTP
      const response = await verifyOTP({
        email,
        otp,
        token: resetToken,
      }).unwrap();
      // Update token if a new one is returned (usually it is)
      if (response.data?.forgotPasswordToken) {
        setResetToken(response.data.forgotPasswordToken);
      }
      setStep(3);
      setSuccessMessage("OTP verified. Please set your new password.");
    } catch (err: any) {
      setError(err.data?.message || "Invalid OTP.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    try {
      await changePassword({
        newPassword,
        confirmPassword,
        email,
        token: resetToken,
      }).unwrap();

      setSuccessMessage(
        "Password changed successfully. Redirecting to login..."
      );
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      const validationErrors = err.data?.errors?.properties;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0] as any;
        setError(firstError?.errors?.[0] || "Failed to change password.");
      } else {
        setError(err.data?.message || "Failed to change password.");
      }
    }
  };

  const isLoading = isSendingOTP || isVerifyingOTP || isChangingPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "New Password"}
            </h1>
            <p className="text-gray-300 text-sm">
              {step === 1 && "Enter your email to receive a verification code"}
              {step === 2 && `Enter the code sent to ${email}`}
              {step === 3 && "Create a strong new password for your account"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {successMessage && !error && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-200">{successMessage}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : "Send OTP"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-200">
                  One-Time Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="w-4 h-4 mr-2" />
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-200">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="w-4 h-4 mr-2" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
