"use client";

import {
  Home,
  LogOut,
  Monitor,
  Moon,
  PanelRightClose,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useSession } from "@/context/SessionProvider";
import SidebarHeaderButton from "./SidebarHeaderButton";
import { useTheme } from "@/context/ThemeProvider";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { useActionHandler } from "@/context/ActionHandlerProvider";
import { logoutAction } from "@/actions/authAction";
import { useHotkeys } from "react-hotkeys-hook";

export default function Sidebar({ toggleSidebar }) {
  const router = useRouter();
  const { session } = useSession();
  const { runAction } = useActionHandler();
  const { theme, setTheme, themes, hydrated } = useTheme();

  // -------------------------------
  // Local client-only hydration guard
  // -------------------------------
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // -------------------------------
  // Core Functions
  // -------------------------------
  const toggleTheme = (e) => {
    e?.preventDefault();
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const logoutUser = (e) => {
    e?.preventDefault();
    startTransition(async () => {
      const data = await runAction(logoutAction);
      if (data?._id) router.refresh();
    });
  };

  const navigateHome = (e) => {
    e?.preventDefault();
    router.push("/");
  };
  const navigateProfile = (e) => {
    e?.preventDefault();
    router.push("/profile");
  };
  const navigateSettings = (e) => {
    e?.preventDefault();
    router.push("/settings");
  };

  // -------------------------------
  // Keyboard Shortcuts
  // -------------------------------
  useHotkeys("alt+d", toggleTheme, [theme]);
  useHotkeys("alt+h", navigateHome);
  useHotkeys("alt+s", navigateSettings);
  useHotkeys("alt+l", logoutUser);
  useHotkeys("alt+p", navigateProfile);
  useHotkeys("alt+x", toggleSidebar);

  // -------------------------------
  // Sidebar Buttons Config
  // -------------------------------
  const buttons = [
    {
      title: "Toggle Theme (Alt+D)",
      onClick: toggleTheme,
      icon: !isClient ? (
        <Monitor />
      ) : theme === "light" ? (
        <Sun />
      ) : theme === "dark" ? (
        <Moon />
      ) : (
        <Monitor />
      ),
    },
    {
      title: "Go to Home (Alt+H)",
      onClick: navigateHome,
      icon: <Home />,
    },
    {
      title: "Go to Settings (Alt+S)",
      onClick: navigateSettings,
      icon: <Settings />,
    },
    {
      title: "Logout (Alt+L)",
      onClick: logoutUser,
      icon: <LogOut />,
    },
    {
      title: "Profile (Alt+P)",
      onClick: navigateProfile,
      icon: <User />,
    },
    {
      title: "Close Sidebar (Alt+X)",
      onClick: toggleSidebar,
      icon: <PanelRightClose />,
    },
  ];

  // -------------------------------
  // Render Placeholder (Before Hydration)
  // -------------------------------
  if (!isClient) {
    return (
      <div className="border-l-2 w-full h-full flex flex-col bg-gray-50 dark:bg-gray-950 shadow-2xl">
        <div className="flex gap-2 p-2 flex-wrap border-b-2 opacity-50 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-9 rounded-full bg-gray-300 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------
  // Render Actual Sidebar (After Hydration)
  // -------------------------------
  return (
    <div className="border-l-2 w-full h-full flex flex-col bg-gray-50 dark:bg-gray-950 shadow-2xl">
      {/* Nav Icons */}
      <div className="flex gap-2 p-2 flex-wrap border-b-2">
        {buttons.map((btn, idx) => (
          <SidebarHeaderButton
            key={idx}
            onClick={btn.onClick}
            title={btn.title}
          >
            {btn.icon}
          </SidebarHeaderButton>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sidebar Footer */}
      <div className="text-center border-t-2 p-2 text-sm">
        <div className="select-all">
          {session?.serverIP && session?.serverPort
            ? `http://${session.serverIP}:${session.serverPort}`
            : "Server info unavailable"}
        </div>
        <div className="capitalize">Env: {process.env.NODE_ENV}</div>
        <div className="capitalize">
          User: {session?.username || "logged out"}
        </div>
      </div>
    </div>
  );
}
