/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordStrengthBar } from "@/webcomponents/reusable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  GraduationCap,
  BookOpen,
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  School,
  ArrowRight,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useCheckUsernameQuery, useSignUpMutation } from "@/api/auth";

// ─── Zod Validation Schemas ───────────────────────────────────────────────────

const baseSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms and Privacy Policy" }),
  }),
});

const studentSchema = baseSchema.extend({
  role: z.literal("student"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^\w+$/, "Username can only contain letters, numbers, and underscores"),
});

const teacherSchema = baseSchema.extend({
  role: z.literal("teacher"),
  subject: z.string().trim().min(1, "Subject or specialization is required"),
  institution: z.string().trim().min(1, "Institution name is required"),
  bio: z.string().trim().min(10, "Bio must be at least 10 characters"),
});

const formSchema = z
  .discriminatedUnion("role", [studentSchema, teacherSchema])
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export const SignUp = () => {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const { mutateAsync: signUp, isPending: isSigningUp } = useSignUpMutation();
  const { mutateAsync: checkUsername } = useCheckUsernameQuery();

  // Pick initial role from localStorage or query if set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("role");
      const storedRole = localStorage.getItem("role");
      if (queryRole === "teacher" || queryRole === "student") {
        setRole(queryRole);
      } else if (storedRole === "teacher" || storedRole === "student") {
        setRole(storedRole);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      role: "student",
      agreed: true,
    },
  });

  const handleRoleChange = (newRole: "student" | "teacher") => {
    setRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("role", newRole);
    }
    setValue("role", newRole, { shouldValidate: false });
    clearErrors();
  };

  useEffect(() => {
    setValue("role", role, { shouldValidate: false });
  }, [role, setValue]);

  const agreed = watch("agreed" as any);
  const watchedUsername = watch("username" as any);

  // Debounced username availability check for students
  useEffect(() => {
    if (role !== "student" || !watchedUsername || watchedUsername.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setUsernameStatus("checking");
        const res = await checkUsername(watchedUsername);
        if (res?.available) {
          setUsernameStatus("available");
        } else {
          setUsernameStatus("taken");
        }
      } catch {
        setUsernameStatus("idle");
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [watchedUsername, role, checkUsername]);

  const onSubmit = async (data: FormValues) => {
    if (role === "student" && usernameStatus === "taken") {
      toast.error("The chosen username is already taken. Please pick another.");
      return;
    }

    const { confirmPassword, agreed: _agreed, ...payload } = data as any;

    try {
      await signUp(payload);
      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to create account"
      );
      console.error("[SignUp] Registration error:", error);
    }
  };

  // Google OAuth redirect with current role
  const handleGoogleSignUp = () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const state = encodeURIComponent(JSON.stringify({ role }));
    window.location.href = `${backendUrl}/auth/google?state=${state}`;
  };

  const isTeacher = role === "teacher";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/60 relative overflow-hidden px-4 py-8 sm:py-12">
      {/* Ambient background glow matching brand electric blue */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-linear-to-b from-[#007EEF]/10 via-[#007EEF]/3 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[260px] bg-linear-to-t from-slate-200/50 to-transparent blur-2xl pointer-events-none -z-10" />

      {/* Sign Up Card */}
      <div className="w-full max-w-[480px] bg-white rounded-2xl border border-slate-200/80 shadow-none p-7 sm:p-8 relative">
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
            Create an Account
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
            Join ESOL Master to start {isTeacher ? "teaching and managing classes" : "learning English with interactive tasks"}
          </p>
        </div>

        {/* Top Segmented Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange("student")}
            className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              !isTeacher
                ? "bg-white text-slate-900 shadow-none border border-slate-200/70"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <GraduationCap
              className={`w-4 h-4 ${!isTeacher ? "text-[#007EEF]" : "text-slate-400"}`}
            />
            <span>Learner</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("teacher")}
            className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isTeacher
                ? "bg-white text-slate-900 shadow-none border border-slate-200/70"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen
              className={`w-4 h-4 ${isTeacher ? "text-[#007EEF]" : "text-slate-400"}`}
            />
            <span>Teacher</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("role")} value={role} />

          {/* First Name & Last Name (2 columns) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                First Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  placeholder="John"
                  className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  {...register("firstName")}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Last Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  placeholder="Doe"
                  className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  {...register("lastName")}
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Student-specific: Username */}
          {!isTeacher && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Username
              </label>
              <div className="relative group">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  placeholder="john_doe"
                  className="pl-10 pr-24 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  {...register("username" as any)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === "checking" && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                    </span>
                  )}
                  {usernameStatus === "available" && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3" /> Available
                    </span>
                  )}
                  {usernameStatus === "taken" && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      <X className="w-3 h-3" /> Taken
                    </span>
                  )}
                </div>
              </div>
              {(errors as any).username && (
                <p className="text-[11px] text-red-500">
                  {(errors as any).username.message}
                </p>
              )}
            </div>
          )}

          {/* Teacher-specific: Subject & Institution */}
          {isTeacher && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Subject / Specialization
                </label>
                <div className="relative group">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                  <Input
                    placeholder="e.g. English Grammar, IELTS Preparation"
                    className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                    {...register("subject" as any)}
                  />
                </div>
                {(errors as any).subject && (
                  <p className="text-[11px] text-red-500">
                    {(errors as any).subject.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Institution / Organization
                </label>
                <div className="relative group">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                  <Input
                    placeholder="e.g. Cambridge Language Academy"
                    className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                    {...register("institution" as any)}
                  />
                </div>
                {(errors as any).institution && (
                  <p className="text-[11px] text-red-500">
                    {(errors as any).institution.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell students about your teaching background and methodology..."
                  className="w-full rounded-lg border border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400 text-xs sm:text-sm p-3 resize-none outline-none"
                  {...register("bio" as any)}
                />
                {(errors as any).bio && (
                  <p className="text-[11px] text-red-500">
                    {(errors as any).bio.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
              <Input
                type="email"
                placeholder="john@example.com"
                className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                className="pl-10 pr-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                {...register("password", {
                  onChange: (e) => {
                    setPasswordValue(e.target.value);
                    trigger("confirmPassword");
                  },
                })}
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors focus:outline-none"
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
            {passwordValue && <PasswordStrengthBar password={passwordValue} />}
            {errors.password && (
              <p className="text-[11px] text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                className="pl-10 pr-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms & Privacy Checkbox */}
          <div className="pt-1">
            <div className="flex items-start space-x-2.5">
              <Checkbox
                id="agreed"
                checked={!!agreed}
                onCheckedChange={(checked) =>
                  setValue("agreed" as any, checked === true ? true : (undefined as any), {
                    shouldValidate: true,
                  })
                }
                className="mt-0.5 rounded border-slate-300 data-[state=checked]:bg-[#007EEF] data-[state=checked]:border-[#007EEF]"
              />
              <label
                htmlFor="agreed"
                className="text-xs text-slate-600 leading-snug cursor-pointer select-none"
              >
                I agree to the{" "}
                <span className="text-[#007EEF] font-semibold hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-[#007EEF] font-semibold hover:underline">
                  Privacy Policy
                </span>
              </label>
            </div>
            {(errors as any).agreed && (
              <p className="text-[11px] text-red-500 pl-6 mt-1">
                {(errors as any).agreed.message}
              </p>
            )}
          </div>

          {/* Primary Submit CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSigningUp}
            className="w-full h-10.5 rounded-xl bg-[#007EEF] hover:bg-[#0066cc] text-white font-medium text-xs sm:text-sm border-none shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none mt-2"
            style={{ boxShadow: "none" }}
          >
            {isSigningUp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>
                  Create {isTeacher ? "Teacher" : "Learner"} Account
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-2 my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            className="w-full h-10.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-slate-700 text-xs sm:text-[13px] font-medium transition-all shadow-none flex items-center justify-center gap-2.5 cursor-pointer"
            onClick={handleGoogleSignUp}
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
            <span>Continue with Google as {isTeacher ? "Teacher" : "Learner"}</span>
          </button>
        </form>

        {/* Footer Link to Login */}
        <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
          Already have an account?{" "}
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
