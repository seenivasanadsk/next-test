"use client";

import { startTransition, useEffect } from "react";
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
  const { settings, updateSetting } = useSettings();
  const { isSidebarOpen = false } = settings;

  function toggleSidebar() {
    const newValue = !isSidebarOpen;
    updateSetting("isSidebarOpen", newValue);
  }

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
          isSidebarOpen ? "mr-[180px]" : "mr-0"
        )}
      >
        <div className="p-6 h-full">{children}</div>
      </main>

      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-[180px] transition-transform duration-250 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {!isSidebarOpen && (
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
