"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Save, Eye, EyeOff, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import {
  useChangePasswordMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/api/auth";

// --- Schemas ---
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export const Profile = () => {
  const [editing, setEditing] = React.useState(false);
  const [showPw, setShowPw] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { data: profile, isLoading } = useGetMyProfileQuery();
  const { mutateAsync: updateProfile, isPending: savingProfile } =
    useUpdateMyProfileMutation();
  const { mutateAsync: changePassword, isPending: savingPassword } =
    useChangePasswordMutation();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSave = async (values: ProfileValues) => {
    try {
      await updateProfile(values);
      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const onPasswordSave = async (values: PasswordValues) => {
    try {
      await changePassword(values);
      toast.success("Password updated");
      passwordForm.reset();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to update password";
      toast.error(message);
    }
  };

  const togglePw = (field: keyof typeof showPw) =>
    setShowPw((p) => ({ ...p, [field]: !p[field] }));

  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();

  return (
    <div className="space-y-6">
      {/* Heading Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Account Profile
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manage your personal information and account security
          </p>
        </div>

        <Button
          type="button"
          disabled={isLoading || savingProfile}
          onClick={() =>
            editing
              ? profileForm.handleSubmit(onProfileSave)()
              : setEditing(true)
          }
          className={`gap-2 rounded-[12px] text-xs font-semibold h-9 px-4 transition-all ${
            editing
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20"
              : "bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/15"
          }`}
        >
          {savingProfile ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : editing ? (
            <Save className="w-4 h-4" />
          ) : (
            <Pencil className="w-4 h-4" />
          )}
          {editing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="rounded-[22px] border border-slate-100/90 bg-white p-6 md:p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-primary/20 ring-4 ring-primary/10">
            {profile?.firstName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 tracking-tight">
              {fullName || "—"}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {profile?.email}
              {profile?.username ? ` · @${profile.username}` : ""}
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <form
          id="profile-form"
          onSubmit={profileForm.handleSubmit(onProfileSave)}
        >
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={profileForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs font-bold text-slate-700">First Name</FieldLabel>
                  <Input
                    {...field}
                    disabled={!editing}
                    placeholder="First name"
                    className="h-10 rounded-[12px] border-slate-200 text-xs focus:border-primary"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={profileForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs font-bold text-slate-700">Last Name</FieldLabel>
                  <Input
                    {...field}
                    disabled={!editing}
                    placeholder="Last name"
                    className="h-10 rounded-[12px] border-slate-200 text-xs focus:border-primary"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field className="sm:col-span-2">
              <FieldLabel className="text-xs font-bold text-slate-700">Email Address</FieldLabel>
              <Input
                value={profile?.email ?? ""}
                disabled
                className="h-10 rounded-[12px] border-slate-200 bg-slate-50 text-xs text-slate-500"
              />
            </Field>
          </FieldGroup>
        </form>

        <div className="pt-2">
          <Separator className="bg-slate-100" />
          <div className="mt-6 mb-4">
            <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
              Change Password
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Update your account password to keep your account secure
            </p>
          </div>
        </div>

        {/* Password Form */}
        <form
          id="password-form"
          onSubmit={passwordForm.handleSubmit(onPasswordSave)}
        >
          <FieldGroup className="space-y-4 max-w-xl">
            {(
              ["currentPassword", "newPassword", "confirmPassword"] as const
            ).map((fieldName) => {
              const labels: Record<string, string> = {
                currentPassword: "Current Password",
                newPassword: "New Password",
                confirmPassword: "Confirm Password",
              };
              const showKey =
                fieldName === "currentPassword"
                  ? "current"
                  : fieldName === "newPassword"
                    ? "new"
                    : "confirm";

              return (
                <Controller
                  key={fieldName}
                  name={fieldName}
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs font-bold text-slate-700">
                        {labels[fieldName]}
                      </FieldLabel>
                      <InputGroup>
                        <Input
                          {...field}
                          type={
                            showPw[showKey as keyof typeof showPw]
                              ? "text"
                              : "password"
                          }
                          placeholder="••••••••"
                          className="h-10 rounded-[12px] border-slate-200 text-xs focus:border-primary"
                        />
                        <InputGroupAddon>
                          <button
                            type="button"
                            onClick={() =>
                              togglePw(showKey as keyof typeof showPw)
                            }
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            {showPw[showKey as keyof typeof showPw] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              );
            })}

            <div className="flex justify-start pt-2">
              <Button
                type="submit"
                form="password-form"
                disabled={savingPassword}
                className="gap-2 rounded-[12px] bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-4 shadow-sm shadow-primary/15"
              >
                {savingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Update Password
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
};
