"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
// Import Axios for making HTTP requests
import axios from "axios"; 
import { Router } from "next/router";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  // New State for form data, loading, and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_ENDPOINT = "http://localhost:5001/api/v1/auth/login"; // Use http:// for local
  
  /**
   * Handles the form submission and communicates with the backend API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Clear previous error and set loading state
    setError("");
    setLoading(true);

    try {
      // 1. Make the POST request to the API endpoint
      const response = await axios.post(API_ENDPOINT, {
        email: email,
        password: password,
      });

      // 2. Handle successful response (e.g., store token, redirect)
      console.log("Login Successful:", response.data);
      // Example: Store the JWT token (if provided) in localStorage/sessionStorage
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      
      // Example: Redirect user to the dashboard
      Router.push("/dashboard"); 

    } catch (err) {
      // 3. Handle errors
      console.error("Login Failed:", err);
      
      // Check for a specific error message from the backend response
      const errorMessage = err.response?.data?.message || "An unexpected error occurred during sign-in.";
      setError(errorMessage);

    } finally {
      // 4. Reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          {/* ... Social sign-in buttons (omitted for brevity) ... */}
          
          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                Or
              </span>
            </div>
          </div>
          
          {/* Form with onSubmit handler */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>{" "}
                </Label>
                <Input 
                  placeholder="info@gmail.com" 
                  type="email" 
                  value={email} // Controlled input
                  onChange={(e) => setEmail(e.target.value)} // Update state
                  required
                />
              </div>
              
              {/* Password Input */}
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>{" "}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password} // Controlled input
                    onChange={(e) => setPassword(e.target.value)} // Update state
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              
              {/* Error Message Display */}
              {error && (
                <p className="text-sm text-error-500 mt-2">{error}</p>
              )}
              
              {/* Checkbox and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
                <Link
                  href="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>
              
              {/* Sign In Button */}
              <div>
                <Button className="w-full" size="sm" type="submit" disabled={loading}>
                  {loading ? "Signing In..." : "Sign in"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account? {""}
              <Link
                href="/signup"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}