"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PasswordStrengthBar } from "@/webcomponents/reusable";
import { toast } from "sonner";
import { useChangePasswordMutation } from "@/api/auth";

const inputCls =
  "h-9 rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none text-sm pr-10";

export const Security = () => {
  const { mutateAsync: changePassword, isPending } = useChangePasswordMutation();

  const [fields, setFields] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow]     = useState({ current: false, newPass: false, confirm: false });

  const handleChange = (field: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleShow = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const renderEye = (field: keyof typeof show) => (
    <button
      type="button"
      onClick={() => toggleShow(field)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
    >
      {show[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  const handleCancel = () => setFields({ current: "", newPass: "", confirm: "" });

  const handleUpdate = async () => {
    if (!fields.current)           { toast.error("Enter your current password"); return; }
    if (fields.newPass.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (fields.newPass !== fields.confirm) { toast.error("Passwords do not match"); return; }
    try {
      await changePassword({ currentPassword: fields.current, newPassword: fields.newPass, confirmPassword: fields.confirm });
      toast.success("Password updated");
      handleCancel();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update password";
      toast.error(message);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-none p-6 space-y-5">
      {/* Header */}
      <div className="pb-1">
        <h3 className="text-sm font-semibold text-slate-800">Change Password</h3>
        <p className="text-xs text-slate-400 mt-0.5">Choose a strong password to keep your account secure.</p>
      </div>
      <Separator className="bg-slate-200/70" />

      {/* Current Password */}
      <div className="space-y-1.5">
        <Label htmlFor="current" className="text-xs font-semibold text-slate-700">Current Password</Label>
        <div className="relative">
          <Input
            id="current"
            type={show.current ? "text" : "password"}
            value={fields.current}
            onChange={handleChange("current")}
            placeholder="Enter current password"
            className={inputCls}
          />
          {renderEye("current")}
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-1.5">
        <Label htmlFor="newPass" className="text-xs font-semibold text-slate-700">New Password</Label>
        <div className="relative">
          <Input
            id="newPass"
            type={show.newPass ? "text" : "password"}
            value={fields.newPass}
            onChange={handleChange("newPass")}
            placeholder="Enter new password"
            className={inputCls}
          />
          {renderEye("newPass")}
        </div>
        <PasswordStrengthBar password={fields.newPass} />
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm" className="text-xs font-semibold text-slate-700">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirm"
            type={show.confirm ? "text" : "password"}
            value={fields.confirm}
            onChange={handleChange("confirm")}
            placeholder="Confirm new password"
            className={inputCls}
          />
          {renderEye("confirm")}
        </div>
        {fields.confirm && fields.newPass !== fields.confirm && (
          <p className="text-[11px] text-red-500 mt-1">Passwords do not match.</p>
        )}
      </div>

      <Separator className="bg-slate-200/70" />

      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={handleCancel}
          disabled={isPending}
          className="text-xs h-9 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-none"
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          disabled={isPending}
          className="text-xs h-9 rounded-lg gap-2 bg-[#007EEF] hover:bg-[#0066cc] text-white shadow-none border-none"
          style={{ boxShadow: "none" }}
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Update Password
        </Button>
      </div>
    </div>
  );
};
