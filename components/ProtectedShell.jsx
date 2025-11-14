"use client";

import { startTransition, useEffect } from "react";
import cn from "@/utils/cn";
import Sidebar from "./Sidebar";
import { useSession } from "@/context/SessionProvider";
import { useActionHandler } from "@/context/ActionHandlerProvider";
import { logoutAction } from "@/actions/authAction";
import { useSettings } from "@/context/SettingsProvider";
import { MenuIcon } from "lucide-react";
import { useScreen } from "@/context/ScreenProvider";

export default function ProtectedShell({ children }) {
  const { session } = useSession();
  const { runAction } = useActionHandler();
  const { settings, updateSetting } = useSettings();
  const { isSidebarOpen = false } = settings;
  const { screenWidth, screenHeight, device } = useScreen();

  function toggleSidebar(e) {
    e?.preventDefault();
    updateSetting("isSidebarOpen", !isSidebarOpen);
  }

  // 🚨 Handle invalid sessions
  useEffect(() => {
    if (session && !session.isValid) {
      startTransition(() => {
        runAction(logoutAction);
      });
    }
  }, [session?.isValid, runAction]);

  return (
    <div className="flex h-screen overflow-hidden">
      <main
        className={cn(
          "flex-1 transition-all duration-250 ease-in-out",
          isSidebarOpen ? "mr-[180px]" : "mr-0",
          device == "sm" && "mr-0"
        )}
      >
        {device == "sm" && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={toggleSidebar}
          ></div>
        )}
        {children}
      </main>

      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-[180px] z-60 transition-transform duration-250 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {!isSidebarOpen && (
          <MenuIcon
            className="p-1 bg-black/10 rounded-full absolute -left-8 bottom-3"
            onClick={toggleSidebar}
          />
        )}
        <Sidebar toggleSidebar={toggleSidebar} hideOnAction={device == "sm"} />
      </aside>
    </div>
  );
}
