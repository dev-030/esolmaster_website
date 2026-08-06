"use client";
import { PasswordStrengthBar, SectionHeading } from "@/webcomponents/reusable";
import { PasswordInput } from "./PasswordInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useChangePasswordMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/api/auth";

export const AdminProfile = () => {
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const { mutateAsync: updateProfile, isPending: savingProfile } =
    useUpdateMyProfileMutation();
  const { mutateAsync: changePassword, isPending: savingPassword } =
    useChangePasswordMutation();

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
    }
  }, [profile]);

  // Security state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    try {
      await updateProfile({ firstName, lastName });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPw) {
      toast.error("Enter your current password");
      return;
    }
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
        confirmPassword: confirmPw,
      });
      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to update password";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading heading="Profile and Security" />
      {/* ── Profile Information ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800">
            Profile Information
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Avatar row */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                disabled={isLoading}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                disabled={isLoading}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Email (read-only — changing email needs a verification flow) */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email Address
            </Label>
            <Input id="email" type="email" value={profile?.email ?? ""} disabled />
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              className="px-6 gap-2"
              onClick={handleSaveProfile}
              disabled={savingProfile || isLoading}
            >
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Security ────────────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800">
            Security
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {/* Current Password */}
          <PasswordInput
            id="currentPw"
            label="Current Password"
            value={currentPw}
            onChange={setCurrentPw}
            placeholder="Enter current password"
          />

          {/* New Password + strength bar */}
          <div className="flex flex-col gap-2">
            <PasswordInput
              id="newPw"
              label="New Password"
              value={newPw}
              onChange={setNewPw}
              placeholder="Enter new password"
            />
            {newPw && <PasswordStrengthBar password={newPw} />}
          </div>

          {/* Confirm New Password */}
          <PasswordInput
            id="confirmPw"
            label="Confirm New Password"
            value={confirmPw}
            onChange={setConfirmPw}
            placeholder="Confirm new password"
          />

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              className="px-6 gap-2"
              onClick={handleUpdatePassword}
              disabled={savingPassword}
            >
              {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
