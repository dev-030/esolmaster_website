/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowRight,
  AtSign,
  BookOpen,
  School,
  Loader2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { useCheckUsernameQuery, useCompleteProfileMutation } from "@/api/auth";

// ─── Zod Schema for Onboarding ───────────────────────────────────────────────

const studentOnboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^\w+$/, "Username can only contain letters, numbers, and underscores"),
});

const teacherOnboardingSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required"),
  institution: z.string().trim().min(1, "Institution is required"),
  bio: z.string().trim().min(10, "Bio must be at least 10 characters"),
});

type StudentOnboardingForm = z.infer<typeof studentOnboardingSchema>;
type TeacherOnboardingForm = z.infer<typeof teacherOnboardingSchema>;

// ─── Main: Onboarding Component ──────────────────────────────────────────────

export const Onboarding = ({ role }: { role: "teacher" | "student" }) => {
  const router = useRouter();
  const isTeacher = role === "teacher";

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const { mutateAsync: checkUsername } = useCheckUsernameQuery();
  const {
    mutateAsync: completeProfile,
    isPending: isCompleteProfilePending,
  } = useCompleteProfileMutation();

  // Student form
  const studentForm = useForm<StudentOnboardingForm>({
    resolver: zodResolver(studentOnboardingSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
    },
  });

  // Teacher form
  const teacherForm = useForm<TeacherOnboardingForm>({
    resolver: zodResolver(teacherOnboardingSchema),
    mode: "onChange",
    defaultValues: {
      subject: "",
      institution: "",
      bio: "",
    },
  });

  const studentUsername = studentForm.watch("username");

  // Debounced username availability check
  useEffect(() => {
    if (!isTeacher && studentUsername && studentUsername.length >= 3) {
      const delay = setTimeout(async () => {
        try {
          setUsernameStatus("checking");
          const res = await checkUsername(studentUsername);
          if (res?.available) {
            setUsernameStatus("available");
            studentForm.clearErrors("username");
          } else {
            setUsernameStatus("taken");
            studentForm.setError("username", {
              type: "manual",
              message: "Username is already taken",
            });
          }
        } catch {
          setUsernameStatus("idle");
        }
      }, 450);

      return () => clearTimeout(delay);
    } else {
      setUsernameStatus("idle");
    }
  }, [studentUsername, isTeacher, checkUsername, studentForm]);

  const onSubmitStudent = async (data: StudentOnboardingForm) => {
    if (usernameStatus !== "available") {
      toast.error("Please select an available username.");
      return;
    }

    try {
      await completeProfile({ username: data.username });
      toast.success("Profile setup complete! Welcome to ESOL Master.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save profile. Please try again."
      );
      console.error("Complete profile failed:", error);
    }
  };

  const onSubmitTeacher = async (data: TeacherOnboardingForm) => {
    try {
      await completeProfile({
        subject: data.subject,
        institution: data.institution,
        bio: data.bio,
      });
      toast.success("Teaching profile complete! Welcome to ESOL Master.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save profile. Please try again."
      );
      console.error("Complete profile failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/60 relative overflow-hidden px-4 py-8 sm:py-12">
      {/* Ambient background glow matching the brand electric blue */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-linear-to-b from-[#007EEF]/10 via-[#007EEF]/3 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[260px] bg-linear-to-t from-slate-200/50 to-transparent blur-2xl pointer-events-none -z-10" />

      {/* Card Container */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200/80 shadow-none p-7 sm:p-8 relative">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <img
              src="/logo.png"
              alt="ESOL Master"
              className="h-9 w-auto object-contain"
            />
          </div>
          <div className="w-11 h-11 bg-[#007EEF]/10 border border-[#007EEF]/20 rounded-xl flex items-center justify-center mb-3 text-[#007EEF]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
            {isTeacher
              ? "Add your teaching specialization to get started"
              : "Choose a unique username to personalize your portal"}
          </p>
        </div>

        {/* Student Form */}
        {!isTeacher ? (
          <form
            onSubmit={studentForm.handleSubmit(onSubmitStudent)}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Username
              </label>
              <div className="relative group">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  id="username"
                  placeholder="e.g. alex_smith"
                  className="pl-10 pr-24 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  {...studentForm.register("username")}
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
              {studentForm.formState.errors.username && (
                <p className="text-[11px] text-red-500">
                  {studentForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                !studentForm.formState.isValid ||
                usernameStatus !== "available" ||
                isCompleteProfilePending
              }
              className="w-full h-10.5 rounded-xl bg-[#007EEF] hover:bg-[#0066cc] text-white font-medium text-xs sm:text-sm border-none shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
              style={{ boxShadow: "none" }}
            >
              {isCompleteProfilePending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Teacher Form */
          <form
            onSubmit={teacherForm.handleSubmit(onSubmitTeacher)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Subject / Specialization
              </label>
              <div className="relative group">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  id="subject"
                  placeholder="e.g. English Grammar, IELTS"
                  className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  {...teacherForm.register("subject")}
                />
              </div>
              {teacherForm.formState.errors.subject && (
                <p className="text-[11px] text-red-500">
                  {teacherForm.formState.errors.subject.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Institution / School
              </label>
              <div className="relative group">
                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007EEF] transition-colors pointer-events-none" />
                <Input
                  id="institution"
                  placeholder="e.g. Oxford Learning Center"
                  className="pl-10 h-10 text-xs sm:text-sm rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400"
                  {...teacherForm.register("institution")}
                />
              </div>
              {teacherForm.formState.errors.institution && (
                <p className="text-[11px] text-red-500">
                  {teacherForm.formState.errors.institution.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Short Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                placeholder="Tell students about your teaching experience..."
                className="w-full rounded-lg border border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none transition-all placeholder:text-slate-400 text-xs sm:text-sm p-3 resize-none outline-none"
                {...teacherForm.register("bio")}
              />
              {teacherForm.formState.errors.bio && (
                <p className="text-[11px] text-red-500">
                  {teacherForm.formState.errors.bio.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                !teacherForm.formState.isValid || isCompleteProfilePending
              }
              className="w-full h-10.5 rounded-xl bg-[#007EEF] hover:bg-[#0066cc] text-white font-medium text-xs sm:text-sm border-none shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none mt-2"
              style={{ boxShadow: "none" }}
            >
              {isCompleteProfilePending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};