"use client";
import { useRef, useState, useEffect, useTransition } from "react";
import { Eye, EyeOff, KeyRound, LogIn, User } from "lucide-react";
import { loginAction } from "@/actions/authAction";
import { getUserOptionsAction } from "@/actions/userAction";
import { useActionHandler } from "@/context/ActionHandlerProvider";
import CommonForm from "../CommonForm";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsProvider";

export default function LoginForm() {
  const router = useRouter();
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, showError] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ userId: "", password: "" });
  const { runAction } = useActionHandler();
  const { settings, updateSetting } = useSettings();
  const { lostUserId = null } = settings;

  function handleFormData(name, value) {
    setFormData((prev) => {
      if (name === "password") showError(false);
      return { ...prev, [name]: value };
    });
  }

  async function handleLogin() {
    startTransition(async () => {
      const data = await runAction(loginAction, formData);
      if (data) {
        updateSetting("lostUserId", formData.userId);
        router.push("/");
      } else {
        showError(true);
        passwordRef.current?.focus();
      }
    });
  }

  // Fetch users
  useEffect(() => {
    startTransition(async () => {
      const data = await runAction(getUserOptionsAction, { silent: true });
      if (data) {
        setUsers(data);
        const savedUserId = lostUserId;
        if (savedUserId) handleFormData("userId", savedUserId);
      }
    });
  }, []);

  const config = {
    title: "Login",
    description: "Login to get access",
    action: handleLogin,
    cancel: "/",
    loading: isPending,
    submitText: "Login",
    submitPrefix: <LogIn />,
  };

  return (
    <CommonForm config={config}>
      <SelectField
        prefix={<User />}
        value={formData.userId}
        placeholder="User"
        options={users}
        onValue={(value) => handleFormData("userId", value)}
        optionLabel="username"
        optionValue="_id"
      />
      <InputField
        className={error ? "animate-shake" : ""}
        prefix={<KeyRound />}
        ref={passwordRef}
        suffix={showPassword ? <Eye /> : <EyeOff />}
        type={showPassword ? "text" : "password"}
        onSuffixClick={() => setShowPassword(!showPassword)}
        value={formData.password}
        placeholder="Password"
        onValue={(value) => handleFormData("password", value)}
        autoFocus
      />
      <Link className="text-blue-500 dark:text-blue-300" href="/reset-password">
        Forget Password?
      </Link>
    </CommonForm>
  );
}
