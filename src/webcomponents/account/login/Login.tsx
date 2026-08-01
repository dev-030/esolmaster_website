/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, Loader2, Users, School, Eye, EyeOff } from "lucide-react";
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
      await signIn({ email, password });
      toast.success("Login successful!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Invalid credentials");
    }
  };

  // Google Login Logic
  const handleGoogleLogin = (role: "student" | "teacher") => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    
    // Construct the state object as your backend expects
    const state = encodeURIComponent(JSON.stringify({ role }));
    
    // Redirect to backend
    window.location.href = `${backendUrl}/auth/google?state=${state}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-none p-8 border border-slate-200">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <GraduationCap className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Login to Continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-xs font-medium text-slate-600">Remember me</label>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => router.push("/forgot-password")}
            >
              Forget Password?
            </button>
          </div>

          <Button type="submit" className="w-full h-11" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin mr-2" /> : "Login"}
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* GOOGLE BUTTON - Triggers Role Dialog */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => setShowRoleDialog(true)}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button type="button" variant="outline" className="w-full">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05 1.8-3.08 1.8-1.09 0-1.44-.65-2.67-.65-1.25 0-1.64.65-2.67.65-1.05 0-2.05-.85-3.08-1.8-2.67-2.58-4.63-7.23-3.48-10.45.69-1.95 2.19-3.21 3.8-3.21 1.05 0 1.94.5 2.67.5.75 0 1.62-.5 2.67-.5 1.61 0 3.11 1.26 3.8 3.21-3.15 1.48-2.63 5.48.51 6.84-.71 1.77-1.43 3.17-2.26 4.09z" />
                <path d="M12 4.14c-.05-1.57.88-3.02 2.21-3.79-.34 1.65-.92 3.14-2.21 3.79z" />
              </svg>
              Apple
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don&apos;t have an account?{" "}
          <span className="text-primary font-bold cursor-pointer hover:underline" onClick={()=>router.push('/register')}>Sign Up</span>
        </p>
      </div>

      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Continue as...</DialogTitle>
            <DialogDescription className="text-center">
              Please select your role to personalize your experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => handleGoogleLogin("student")}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10">
                <School className="w-6 h-6 text-slate-600 group-hover:text-primary" />
              </div>
              <span className="font-bold text-slate-700">Student</span>
            </button>

            <button
              onClick={() => handleGoogleLogin("teacher")}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10">
                <Users className="w-6 h-6 text-slate-600 group-hover:text-primary" />
              </div>
              <span className="font-bold text-slate-700">Teacher</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};