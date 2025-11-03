"use client";

import { startTransition, useEffect, useRef } from "react";
import cn from "@/utils/cn";
import Sidebar from "./Sidebar";
import { useSession } from "@/context/SessionProvider";
import { useActionHandler } from "@/context/ActionHandlerProvider";
import { logoutAction } from "@/actions/authAction";
import Button from "./Button";
import { MenuIcon } from "lucide-react";
import { useSettings } from "@/context/SettingsProvider";

export default function ProtectedShell({ children }) {
  const { session } = useSession();
  const { runAction } = useActionHandler();
  const { settings, updateSetting, hydrated } = useSettings();
  const { isSidebarOpen = false } = settings;
  const hasMounted = useRef(false);

  function toggleSidebar(e) {
    e?.preventDefault();
    updateSetting("isSidebarOpen", !isSidebarOpen);
  }

  // 🧩 Prevent transition on first mount
  useEffect(() => {
    if (!hydrated) return;
    const body = document.body;
    if (!hasMounted.current) {
      body.classList.add("no-transitions");
      setTimeout(() => body.classList.remove("no-transitions"), 50);
      hasMounted.current = true;
    }
  }, [hydrated]);

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
          hydrated ? (isSidebarOpen ? "mr-[180px]" : "mr-0") : "mr-0"
        )}
      >
        <div className="p-6 h-full">{children}</div>
      </main>

      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-[180px] z-10 transition-transform duration-250 ease-in-out",
          hydrated
            ? isSidebarOpen
              ? "translate-x-0"
              : "translate-x-full"
            : "translate-x-full"
        )}
      >
        {hydrated && !isSidebarOpen && (
          <div className="absolute -left-11 bottom-2">
            <Button
              variant="secondary"
              radius="full"
              className="p-2"
              onClick={toggleSidebar}
              title="Open Sidebar"
            >
              <MenuIcon size={20} />
            </Button>
          </div>
        )}
        <Sidebar toggleSidebar={toggleSidebar} />
      </aside>
    </div>
  );
}
