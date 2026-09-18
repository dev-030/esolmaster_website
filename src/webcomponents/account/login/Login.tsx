/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Users, School, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";
import { useSignInMutation } from "@/api/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: signIn, isPending } = useSignInMutation();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signIn({ email: email.trim(), password: password.trim() });
      toast.success("Login successful!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Invalid credentials");
      console.error("[DEBUG] Login error:", error);
    }
  };

  // Google Login Logic
  const handleGoogleLogin = (role: "student" | "teacher") => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const state = encodeURIComponent(JSON.stringify({ role }));
    window.location.href = `${backendUrl}/auth/google?state=${state}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/60 relative overflow-hidden px-4 py-8 sm:py-12">
      {/* Ambient background glow matching the brand electric blue */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-linear-to-b from-[#007EEF]/10 via-[#007EEF]/3 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[260px] bg-linear-to-t from-slate-200/50 to-transparent blur-2xl pointer-events-none -z-10" />

      {/* Login Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/80 shadow-none p-7 sm:p-8 relative">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <img src="/logo.png" alt="ESOL Master" className="h-9 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
            Sign in to access your teaching &amp; learning portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
              <Input
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between pt-0.5 pb-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="rounded border-slate-300 data-[state=checked]:bg-[#007EEF] data-[state=checked]:border-[#007EEF]"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-[#007EEF] hover:text-[#0066cc] hover:underline transition-colors"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          {/* Primary CTA Button matching the brand blue */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10.5 rounded-xl bg-[#007EEF] hover:bg-[#0066cc] text-white font-medium text-xs sm:text-sm border-none shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            style={{ boxShadow: "none" }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-3 my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social OAuth Button */}
          <button
            type="button"
            className="w-full h-10.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-slate-700 text-xs sm:text-[13px] font-medium transition-all shadow-none flex items-center justify-center gap-2.5 cursor-pointer"
            onClick={() => setShowRoleDialog(true)}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-7 pt-4 border-t border-slate-100">
          Don&apos;t have an account?{" "}
          <span
            className="text-[#007EEF] font-semibold cursor-pointer hover:text-[#0066cc] hover:underline transition-colors"
            onClick={() => router.push("/signup")}
          >
            Create an account
          </span>
        </p>
      </div>

      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-bold text-slate-900">Continue with Google</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Select your role to personalize your learning &amp; teaching experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3.5 py-4">
            <button
              onClick={() => handleGoogleLogin("student")}
              className="flex flex-col items-center justify-center p-5 rounded-xl border border-slate-200/80 bg-white hover:border-[#007EEF] hover:bg-[#007EEF]/5 transition-all group cursor-pointer"
            >
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center mb-2.5 group-hover:bg-[#007EEF]/10 transition-colors">
                <School className="w-5 h-5 text-slate-600 group-hover:text-[#007EEF] transition-colors" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-[#007EEF] transition-colors">
                Student
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 text-center">
                Access assigned tasks
              </span>
            </button>

            <button
              onClick={() => handleGoogleLogin("teacher")}
              className="flex flex-col items-center justify-center p-5 rounded-xl border border-slate-200/80 bg-white hover:border-[#007EEF] hover:bg-[#007EEF]/5 transition-all group cursor-pointer"
            >
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center mb-2.5 group-hover:bg-[#007EEF]/10 transition-colors">
                <Users className="w-5 h-5 text-slate-600 group-hover:text-[#007EEF] transition-colors" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-[#007EEF] transition-colors">
                Teacher
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 text-center">
                Manage classes &amp; tasks
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};