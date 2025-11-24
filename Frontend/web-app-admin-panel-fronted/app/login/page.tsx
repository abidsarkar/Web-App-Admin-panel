"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { AlertCircle } from "lucide-react";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error: loginError }] = useLoginMutation();
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const result = await login({ email, password }).unwrap();

      // Set cookie for middleware
      if (result.data?.accessToken) {
        Cookies.set("accessToken", result.data.accessToken, { expires: 7 }); // Expires in 7 days
        // Also store user info if needed, or fetch it separately
        if (result.data?.user) {
          localStorage.setItem("user", JSON.stringify(result.data.user));
        }

        // Force a hard refresh or router push to trigger middleware/server check if needed
        // But router.push should be enough if middleware logic is sound and we are moving to a protected route
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(
        err.data?.message || "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">
              Sign in to access your admin dashboard
            </p>
          </div>

          {(errorMsg || loginError) && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">
                {errorMsg || "An error occurred during login"}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4 border-white/30 border-t-white" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <div className="bg-black/20 p-4 text-center border-t border-white/5">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <span className="text-gray-500 cursor-not-allowed">
              Contact Super Admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
