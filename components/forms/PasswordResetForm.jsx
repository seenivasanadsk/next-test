"use client";

import React, { useState, useTransition } from "react";
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail, User } from "lucide-react";
import { useNotification } from "@/context/NotificationProvider";
import { useRouter } from "next/navigation";
import CommonForm from "../CommonForm";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { resetPassword, sendOTP } from "@/actions/authAction";
import { useActionHandler } from "@/context/ActionHandlerProvider";

export default function PasswordResetForm({ users, config: parentConfig }) {
  const [showPassword, setShowPassword] = useState(false);
  const [pwdMismatch, setPwdMismatch] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { runAction } = useActionHandler();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    otp: "",
    userId: "",
  });

  function handlePasswordReset() {
    startTransition(async () => {
      const data = await runAction(resetPassword, formData);
      if (data?.userId) {
        router.push("/login");
      }
    });
  }

  function handleSentOTP() {
    startTransition(async () => {
      const data = await runAction(sendOTP, formData);
      if (data !== null) {
        setIsOTPSent(true);
      }
    });
  }

  function handleFormData(name, value) {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Update password mismatch state
      if (name === "newPassword" || name === "confirmPassword") {
        setPwdMismatch(
          name === "newPassword"
            ? value !== prev.confirmPassword
            : prev.newPassword !== value
        );
      }

      return updated;
    });
  }

  function handleFormAction() {
    if (isOTPSent) handlePasswordReset();
    else handleSentOTP();
  }

  function isFormValid() {
    if (isOTPSent)
      return !pwdMismatch && Object.values(formData).every((val) => val);
    else return formData.userId;
  }

  const config = {
    title: "Reset Password",
    description: isOTPSent
      ? "Enter the OTP sent to your email and set a new password."
      : "Choose User and Send OTP",
    submitText: isOTPSent ? "Reset Password" : "Sent OTP",
    action: handleFormAction,
    loading: isPending,
    cancel: "/login",
    submitPrefix: <Mail />,
    canEnableSave: isFormValid(),
    ...parentConfig,
  };

  return (
    <div className="w-full h-full flex justify-center">
      <CommonForm config={config}>
        {isOTPSent ? (
          <>
            <InputField
              type="text"
              placeholder="Enter OTP"
              value={formData.otp}
              prefix={<LockKeyhole />}
              onValue={(val) => handleFormData("otp", val)}
              required
            />
            <InputField
              value={formData.newPassword}
              placeholder="New Password"
              error={pwdMismatch}
              type={showPassword ? "text" : "password"}
              prefix={<KeyRound />}
              suffix={showPassword ? <Eye /> : <EyeOff />}
              onSuffixClick={() => setShowPassword(!showPassword)}
              onValue={(val) => handleFormData("newPassword", val)}
            />
            <InputField
              value={formData.confirmPassword}
              placeholder="Re-enter New Password"
              error={pwdMismatch}
              type={showPassword ? "text" : "password"}
              prefix={<KeyRound />}
              suffix={showPassword ? <Eye /> : <EyeOff />}
              onSuffixClick={() => setShowPassword(!showPassword)}
              onValue={(val) => handleFormData("confirmPassword", val)}
            />
          </>
        ) : (
          <SelectField
            prefix={<User />}
            options={users}
            optionLabel="username"
            optionValue="_id"
            value={formData.userId}
            onValue={(val) => {
              handleFormData("userId", val);
            }}
          />
        )}
      </CommonForm>
    </div>
  );
}
