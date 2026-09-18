/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  KeyRound,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PasswordStrengthBar } from "@/webcomponents/reusable";
import {
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetCodeMutation,
} from "@/api/auth";

type Step = "email" | "code" | "password";

export const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: forget, isPending: sending } =
    useForgetPasswordMutation();
  const { mutateAsync: verify, isPending: verifying } =
    useVerifyResetCodeMutation();
  const { mutateAsync: reset, isPending: resetting } =
    useResetPasswordMutation();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    try {
      await forget(email.trim());
      toast.success("Verification code sent to your email.");
      setStep("code");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }
    try {
      const res = await verify({ email: email.trim(), code: code.trim() });
      setResetToken(res.resetToken);
      toast.success("Code verified! Set your new password.");
      setStep("password");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Invalid or expired verification code."
      );
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await reset({ password, confirmPassword, resetToken });
      toast.success("Password reset successfully! Please sign in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Reset link expired. Please start again."
      );
      setStep("email");
    }
  };

  const resend = async () => {
    try {
      await forget(email.trim());
      toast.success("A new verification code has been sent.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Could not resend the code."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/60 relative overflow-hidden px-4 py-8 sm:py-12">
      {/* Ambient background glow matching brand electric blue */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-linear-to-b from-[#007EEF]/10 via-[#007EEF]/3 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[260px] bg-linear-to-t from-slate-200/50 to-transparent blur-2xl pointer-events-none -z-10" />

      {/* Card Container */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/80 shadow-none p-7 sm:p-8 relative">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <img
              src="/logo.png"
              alt="ESOL Master"
              className="h-9 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === "email" && "Forgot Password"}
            {step === "code" && "Enter Verification Code"}
            {step === "password" && "Set a New Password"}
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
            {step === "email" &&
              "Enter your email and we'll send you a 6-digit recovery code."}
            {step === "code" && (
              <>
                We sent a 6-digit recovery code to{" "}
                <span className="font-semibold text-slate-800">{email}</span>
              </>
            )}
            {step === "password" &&
              "Choose a strong password with at least 8 characters."}
          </p>
        </div>

        {/* Step 1: Email Address */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  type="email"
                  placeholder="Enter your registered email"
                  className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full h-10.5 rounded-xl bg-[#007EEF] hover:bg-[#0066cc] text-white font-medium text-xs sm:text-sm border-none shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none mt-2"
              style={{ boxShadow: "none" }}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 6-Digit Verification Code */}
        {step === "code" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Verification Code
              </label>
              <div className="relative group">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  className="pl-10 h-10 text-center font-semibold tracking-[0.4em] text-sm sm:text-base rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full h-10.5 rounded-xl bg-[#007EEF] hover:bg-[#0066cc] text-white font-medium text-xs sm:text-sm border-none shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none mt-2"
              style={{ boxShadow: "none" }}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex justify-between items-center text-xs pt-1">
              <button
                type="button"
                className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                onClick={() => setStep("email")}
              >
                Change email
              </button>
              <button
                type="button"
                className="text-[#007EEF] font-semibold hover:text-[#0066cc] hover:underline disabled:opacity-50 cursor-pointer"
                onClick={resend}
                disabled={sending}
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "password" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="pl-10 pr-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {password && <PasswordStrengthBar password={password} />}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className="pl-10 pr-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={resetting}
              className="w-full h-10.5 rounded-xl bg-[#007EEF] hover:bg-[#0066cc] text-white font-medium text-xs sm:text-sm border-none shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none mt-2"
              style={{ boxShadow: "none" }}
            >
              {resetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link to Sign In */}
        <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
          Remember your password?{" "}
          <span
            className="text-[#007EEF] font-semibold cursor-pointer hover:text-[#0066cc] hover:underline transition-colors"
            onClick={() => router.push("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};
