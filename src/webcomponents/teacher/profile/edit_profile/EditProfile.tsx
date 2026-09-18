"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from "@/api/auth";

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase();

const inputCls =
  "h-9 rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none text-sm disabled:opacity-60 disabled:cursor-default";

export const EditProfile = () => {
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const { mutateAsync: updateProfile, isPending: saving } = useUpdateMyProfileMutation();

  const [form, setForm] = useState({ firstName: "", lastName: "", institution: "" });

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        institution: profile.teacherProfile?.institution ?? "",
      });
    }
  }, [profile]);

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      institution: profile.teacherProfile?.institution ?? "",
    });
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    try {
      await updateProfile({ firstName: form.firstName, lastName: form.lastName, institution: form.institution });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200/70 bg-white shadow-none p-6 space-y-6">
        {/* Avatar skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Skeleton className="h-3 w-20 rounded" /><Skeleton className="h-9 w-full rounded-lg" /></div>
            <div className="space-y-1.5"><Skeleton className="h-3 w-20 rounded" /><Skeleton className="h-9 w-full rounded-lg" /></div>
          </div>
          <div className="space-y-1.5"><Skeleton className="h-3 w-28 rounded" /><Skeleton className="h-9 w-full rounded-lg" /></div>
          <div className="space-y-1.5"><Skeleton className="h-3 w-28 rounded" /><Skeleton className="h-9 w-full rounded-lg" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-none p-6 space-y-6">
      {/* Avatar + Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary/15 text-primary font-semibold text-lg">
            {getInitials(fullName) || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm text-slate-800">{fullName || "—"}</p>
          <p className="text-xs text-slate-400 mt-0.5">Teacher</p>
        </div>
      </div>

      <Separator className="bg-slate-200/70" />

      {/* Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">First Name</Label>
            <Input id="firstName" value={form.firstName} onChange={handleChange("firstName")} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">Last Name</Label>
            <Input id="lastName" value={form.lastName} onChange={handleChange("lastName")} className={inputCls} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address</Label>
          <Input id="email" type="email" value={profile?.email ?? ""} disabled className={inputCls} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="institution" className="text-xs font-semibold text-slate-700">Institution / School</Label>
          <Input id="institution" value={form.institution} onChange={handleChange("institution")} className={inputCls} />
        </div>
      </div>

      <div>
        <Separator className="mb-4 bg-slate-200/70" />
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={saving}
            className="text-xs h-9 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="text-xs h-9 rounded-lg gap-2 bg-[#007EEF] hover:bg-[#0066cc] text-white shadow-none border-none"
            style={{ boxShadow: "none" }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
