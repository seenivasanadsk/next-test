"use client";
import stringcase from "@/utils/stringCase";
import { Eye, EyeOff, KeyRound, Mail, User } from "lucide-react";
import React, { startTransition, useState } from "react";
import InputField from "./fields/InputField";
import CommonForm from "./CommonForm";
import { useActionHandler } from "@/context/ActionHandlerProvider";
import { updateUserAction } from "@/actions/userAction";

export default function ProfileForm({ config: parentConfig, user = {} }) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    oldPassword: user.oldPassword || "",
    newPassword: user.newPassword || "",
    confirmPassword: user.confirmPassword || "",
  });
  const [pwdMismatch, setPwdMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { runAction, isPending } = useActionHandler();

  function handleFormData(name, value) {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Field-specific formatting
      switch (name) {
        case "username":
          updated.username = stringcase.smartTitle(value);
          break;
        case "email":
          updated.email = stringcase.lower(value);
          break;
      }

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

  function handleProfileUpdate() {
    startTransition(async () => {
      const data = await runAction(updateUserAction, {
        data: formData,
        id: user._id,
      });
    });
  }

  const config = {
    action: handleProfileUpdate,
    canEnableSave: !pwdMismatch,
    loading: isPending,
    ...parentConfig,
  };

  return (
    <div className="w-full h-full flex justify-center">
      <CommonForm config={config}>
        <InputField
          value={formData.username}
          placeholder="Username"
          prefix={<User />}
          disabled={true}
        />
        <InputField
          value={formData.email}
          placeholder="Email"
          prefix={<Mail />}
          disabled={true}
        />
        <InputField
          value={formData.oldPassword}
          placeholder="Current Password"
          type={showPassword ? "text" : "password"}
          prefix={<KeyRound />}
          suffix={showPassword ? <Eye /> : <EyeOff />}
          onSuffixClick={() => setShowPassword(!showPassword)}
          onValue={(val) => handleFormData("oldPassword", val)}
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
      </CommonForm>
    </div>
  );
}
