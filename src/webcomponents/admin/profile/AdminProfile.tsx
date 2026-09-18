"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  Pencil,
  ArrowRight,
  RefreshCw,
  Loader2,
  Laptop,
  Smartphone,
  Tablet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PasswordStrengthBar } from "@/webcomponents/reusable";
import {
  useChangePasswordMutation,
  useGetMyProfileQuery,
  useGetSessionsQuery,
  useRevokeAllOtherSessionsMutation,
  useRevokeSessionMutation,
  useSendEmailOtpMutation,
  useUpdateMyProfileMutation,
  useVerifyEmailOtpMutation,
} from "@/api/auth";

type Tab = "profile" | "email" | "security";

interface TabItem {
  id: Tab;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabItem[] = [
  {
    id: "profile",
    label: "Profile Information",
    icon: User,
    description: "Personal details and identity",
  },
  {
    id: "email",
    label: "Email & Communication",
    icon: Mail,
    description: "Verified email & OTP update",
  },
  {
    id: "security",
    label: "Security & Credentials",
    icon: ShieldCheck,
    description: "Password & active sessions",
  },
];

// --- 6-Digit OTP Box Component ---
const OtpInputGroup = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      const next = value.split("");
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    const nextChars = value.split("");
    if (rawVal.length === 1) {
      nextChars[index] = rawVal;
      onChange(nextChars.join("").slice(0, 6));
      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      const pasted = rawVal.slice(0, 6);
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, 5);
      inputsRef.current[nextFocus]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const char = value[i] || "";
        return (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={char}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              "w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border bg-white text-slate-800 transition-colors",
              char
                ? "border-primary bg-primary/[0.03]"
                : "border-slate-200 hover:border-slate-300",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            )}
          />
        );
      })}
    </div>
  );
};

const formatOS = (os?: string) => {
  if (!os) return "Unknown OS";
  const lower = os.toLowerCase();
  if (lower === "macos" || lower.includes("mac")) return "macOS";
  if (lower === "ios") return "iOS";
  return os;
};

const formatLastActive = (dateString?: string) => {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (isToday) return `Today at ${timeStr}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return `Yesterday at ${timeStr}`;

    const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${dateStr} at ${timeStr}`;
  } catch {
    return dateString;
  }
};

export const AdminProfile = () => {
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const { mutateAsync: updateProfile, isPending: savingProfile } = useUpdateMyProfileMutation();
  const { mutateAsync: changePassword, isPending: savingPassword } = useChangePasswordMutation();
  const { mutateAsync: sendEmailOtp, isPending: sendingOtp } = useSendEmailOtpMutation();
  const { mutateAsync: verifyEmailOtp, isPending: verifyingOtp } = useVerifyEmailOtpMutation();
  const { data: sessions, isLoading: loadingSessions } = useGetSessionsQuery();
  const { mutateAsync: revokeSession, isPending: revokingSession } = useRevokeSessionMutation();
  const { mutateAsync: revokeAllOthers, isPending: revokingAll } = useRevokeAllOtherSessionsMutation();

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security Form State
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Email OTP State
  type EmailStep = "idle" | "enter-email" | "enter-otp" | "done";
  const [emailStep, setEmailStep] = useState<EmailStep>("idle");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailCountdown, setEmailCountdown] = useState(0);

  // Populate profile info
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
    }
  }, [profile]);

  // Resend countdown timer
  useEffect(() => {
    if (emailCountdown <= 0) return;
    const interval = setInterval(() => {
      setEmailCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [emailCountdown]);

  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "AU";

  const isProfileChanged =
    profile &&
    (firstName.trim() !== (profile.firstName ?? "") ||
      lastName.trim() !== (profile.lastName ?? ""));

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProfileSuccess(false);

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }

    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      setProfileSuccess(true);
      toast.success("Profile details updated successfully");
      setTimeout(() => setProfileSuccess(false), 3500);
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleUpdatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (!currentPw) {
      setPwError("Current password is required");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters long");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New password and confirmation do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
        confirmPassword: confirmPw,
      });
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast.success("Password updated successfully");
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update password";
      setPwError(msg);
      toast.error(msg);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEmailError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (newEmail.toLowerCase() === profile?.email?.toLowerCase()) {
      setEmailError("This is already your current registered email");
      return;
    }

    try {
      await sendEmailOtp({ newEmail: newEmail.trim() });
      setEmailStep("enter-otp");
      setEmailCountdown(60);
      setOtp("");
      toast.success(`Verification code sent to ${newEmail}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to send verification code";
      setEmailError(msg);
      toast.error(msg);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEmailError(null);

    if (otp.length !== 6) {
      setEmailError("Please enter the complete 6-digit verification code");
      return;
    }

    try {
      await verifyEmailOtp({ newEmail: newEmail.trim(), code: otp });
      setEmailStep("done");
      toast.success("Email address updated successfully!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid or expired verification code";
      setEmailError(msg);
      toast.error(msg);
    }
  };

  const resetEmailFlow = () => {
    setEmailStep("idle");
    setNewEmail("");
    setOtp("");
    setEmailError(null);
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      toast.success("Session revoked successfully");
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await revokeAllOthers();
      toast.success("All other sessions terminated");
    } catch {
      toast.error("Failed to revoke other sessions");
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-16 pt-1">
      {/* ─── Top Header Section ─────────────────────────────────────────── */}
      <div className="mb-5 bg-white rounded-xl border border-slate-200/70 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Clean Neutral Avatar */}
            <div className="relative">
              <div className="h-13 w-13 sm:h-14 sm:w-14 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/70 flex items-center justify-center text-lg sm:text-xl font-semibold">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-white" title="Active Account">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {isLoading ? "Loading..." : `${firstName} ${lastName}`}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                  System Administrator
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 font-normal">{profile?.email}</p>
              <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-slate-500">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Full Privileges
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Navigation Tabs Bar ────────────────────────────────────────── */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex gap-1.5 overflow-x-auto">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setProfileSuccess(false);
                  setPwError(null);
                  setPwSuccess(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-slate-500")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB 1: PROFILE DETAILS ─────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-5">
          {/* Main Details Card */}
          <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-transparent flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your identity details displayed across administrative logs and staff communications.
                </p>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-500 border border-slate-200/60">
                Live Data
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-5">
              {profileSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Profile information has been saved successfully.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs sm:text-[13px] font-medium text-slate-700 block mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    disabled={isLoading}
                    className="w-full h-10 px-3.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-[13px] font-medium text-slate-700 block mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    disabled={isLoading}
                    className="w-full h-10 px-3.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-[13px] font-medium text-slate-700">
                      Primary Email Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab("email")}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Update with OTP →
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile?.email ?? ""}
                      disabled
                      className="w-full h-10 pl-9 pr-3.5 text-sm bg-slate-50/70 border border-slate-200/80 rounded-lg text-slate-500 font-medium cursor-not-allowed"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Protected by two-step email verification.
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  {isProfileChanged
                    ? "You have unsaved changes in your name fields."
                    : "All identity records are synchronized."}
                </p>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (profile) {
                        setFirstName(profile.firstName ?? "");
                        setLastName(profile.lastName ?? "");
                      }
                    }}
                    disabled={!isProfileChanged}
                    className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile || isLoading || !isProfileChanged}
                    className="h-9 px-5 rounded-lg bg-primary text-white text-xs sm:text-[13px] font-medium hover:bg-primary/90 transition inline-flex items-center gap-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed"
                  >
                    {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{savingProfile ? "Saving Details..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 2: EMAIL ADDRESS (OTP FLOW) ─────────────────────────── */}
      {activeTab === "email" && (
        <div className="space-y-5">
          {/* Current Verified Email Card */}
          <div className="bg-white rounded-xl border border-slate-200/70 p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/70 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-semibold text-slate-900">
                      {profile?.email ?? "—"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified Primary
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    This address receives all system notices, login verifications, and critical alerts.
                  </p>
                </div>
              </div>

              {emailStep === "idle" && (
                <button
                  onClick={() => {
                    setEmailStep("enter-email");
                    setNewEmail("");
                    setEmailError(null);
                  }}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer whitespace-nowrap"
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                  <span>Change Email</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Step Card */}
          {emailStep !== "idle" && (
            <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
              {/* Progress Steps Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-900">Email Verification Wizard</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Step-by-step verification to ensure secure transfer of administrator ownership.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-md border transition",
                    emailStep === "enter-email"
                      ? "bg-primary/10 text-primary border-primary/20 font-semibold"
                      : "bg-slate-50 text-slate-500 border-slate-200/70"
                  )}>
                    1. New Email
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-md border transition",
                    emailStep === "enter-otp"
                      ? "bg-primary/10 text-primary border-primary/20 font-semibold"
                      : "bg-slate-50 text-slate-500 border-slate-200/70"
                  )}>
                    2. OTP Code
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-md border transition",
                    emailStep === "done"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/70 font-semibold"
                      : "bg-slate-50 text-slate-500 border-slate-200/70"
                  )}>
                    3. Complete
                  </span>
                </div>
              </div>

              {/* Step 1: Enter Email */}
              {emailStep === "enter-email" && (
                <form onSubmit={handleSendOtp} className="p-5 sm:p-6 space-y-4 max-w-xl">
                  {emailError && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200/80 text-red-800 text-xs sm:text-sm flex items-center gap-2.5">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs sm:text-[13px] font-medium text-slate-700 block mb-1.5">
                      New Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="new.admin@organization.com"
                        autoFocus
                        className="w-full h-10 pl-9 pr-3.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      We will dispatch a 6-digit confirmation PIN to this inbox. You must verify it before the change is finalized.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="submit"
                      disabled={sendingOtp || !newEmail}
                      className="h-9 px-4 rounded-lg bg-primary text-white text-xs sm:text-[13px] font-medium hover:bg-primary/90 transition inline-flex items-center gap-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed"
                    >
                      {sendingOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>{sendingOtp ? "Sending code..." : "Send Verification Code"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={resetEmailFlow}
                      className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Enter OTP */}
              {emailStep === "enter-otp" && (
                <form onSubmit={handleVerifyOtp} className="p-5 sm:p-6 space-y-4 max-w-xl">
                  {emailError && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200/80 text-red-800 text-xs sm:text-sm flex items-center gap-2.5">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs sm:text-[13px] font-medium text-slate-700">
                        Enter 6-Digit Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setEmailStep("enter-email")}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit email
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                      Sent to <strong className="text-slate-800 font-semibold">{newEmail}</strong>
                    </p>

                    <OtpInputGroup
                      value={otp}
                      onChange={setOtp}
                      disabled={verifyingOtp}
                    />

                    <p className="text-xs text-slate-400 mt-2.5">
                      Please check your inbox and spam folders. Code expires in 10 minutes.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={verifyingOtp || otp.length !== 6}
                      className="h-9 px-5 rounded-lg bg-primary text-white text-xs sm:text-[13px] font-medium hover:bg-primary/90 transition inline-flex items-center gap-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed"
                    >
                      {verifyingOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>{verifyingOtp ? "Validating PIN..." : "Confirm & Update Email"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={emailCountdown > 0 || sendingOtp}
                      onClick={() => handleSendOtp()}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", sendingOtp && "animate-spin")} />
                      <span>
                        {emailCountdown > 0
                          ? `Resend code in ${emailCountdown}s`
                          : "Resend Code"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={resetEmailFlow}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer ml-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Complete */}
              {emailStep === "done" && (
                <div className="p-8 text-center max-w-md mx-auto space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Email Address Updated!</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Your administrator login email and alert routing has been securely switched to:
                  </p>
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 inline-block">
                    {newEmail}
                  </div>
                  <div className="pt-3">
                    <button
                      onClick={resetEmailFlow}
                      className="h-9 px-5 rounded-lg bg-primary text-white text-xs sm:text-[13px] font-medium hover:bg-primary/90 transition cursor-pointer"
                    >
                      Done &amp; Return to Overview
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SECURITY & PASSWORD ─────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="space-y-5">
          {/* Password Change Card */}
          <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-transparent">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure your account is defended with a strong password of at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="p-5 sm:p-6 space-y-4 max-w-2xl">
              {pwSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Your password has been changed successfully.</span>
                </div>
              )}

              {pwError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200/80 text-red-800 text-xs sm:text-sm flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}

              <div>
                <label className="text-xs sm:text-[13px] font-medium text-slate-700 block mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-10 pl-9 pr-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-[13px] font-medium text-slate-700 block mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="At least 8 characters with numbers &amp; symbols"
                    className="w-full h-10 pl-9 pr-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {newPw && <PasswordStrengthBar password={newPw} />}

                {/* Password Criteria List */}
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className={cn(
                    "flex items-center gap-1.5 font-medium transition",
                    newPw.length >= 8 ? "text-emerald-700 font-semibold" : "text-slate-400"
                  )}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> 8+ Characters
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 font-medium transition",
                    /[0-9]/.test(newPw) ? "text-emerald-700 font-semibold" : "text-slate-400"
                  )}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Includes Number
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 font-medium transition",
                    /[A-Z]/.test(newPw) ? "text-emerald-700 font-semibold" : "text-slate-400"
                  )}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Uppercase Letter
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-[13px] font-medium text-slate-700 block mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-10 pl-9 pr-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPw && newPw && confirmPw === newPw && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Passwords match
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Password changes take effect immediately across all sessions.
                </p>
                <button
                  type="submit"
                  disabled={savingPassword || !currentPw || !newPw || !confirmPw}
                  className="h-9 px-5 rounded-lg bg-primary text-white text-xs sm:text-[13px] font-medium hover:bg-primary/90 transition inline-flex items-center gap-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed"
                >
                  {savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{savingPassword ? "Updating Credentials..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* ─── Live Active Authorized Sessions Card ─────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200/70 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">Active Authorized Sessions</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time list of devices authenticated to your account, detected from live connection headers.
                </p>
              </div>
              {sessions && sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  disabled={revokingAll}
                  className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-3 py-1.5 rounded-lg border border-red-200/80 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 w-fit"
                >
                  {revokingAll && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Sign out all other sessions</span>
                </button>
              )}
            </div>

            {loadingSessions ? (
              <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Detecting active sessions...</span>
              </div>
            ) : !sessions || sessions.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                No active session records found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((session) => {
                  const isCurrent = session.isCurrent;
                  const Icon =
                    session.deviceType === "mobile"
                      ? Smartphone
                      : session.deviceType === "tablet"
                      ? Tablet
                      : Laptop;

                  return (
                    <div
                      key={session.id}
                      className={cn(
                        "p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition",
                        isCurrent
                          ? "border-primary/25 bg-primary/[0.02]"
                          : "border-slate-200/70 bg-white"
                      )}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg border shrink-0",
                            isCurrent
                              ? "bg-white border-primary/20 text-primary"
                              : "bg-slate-50 border-slate-200/60 text-slate-500"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-[13px] font-semibold text-slate-900">
                              {formatOS(session.os)} — {session.browser}
                            </h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                                Current Session
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>
                              IP: <strong className="text-slate-700 font-medium">{session.ipAddress}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Location: <strong className="text-slate-700 font-medium">{session.city}, {session.country}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              {isCurrent
                                ? "Active now"
                                : `Last active ${formatLastActive(session.lastActiveAt)}`}
                            </span>
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokingSession}
                          className="text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md transition cursor-pointer border border-transparent hover:border-red-200/80 w-fit"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
