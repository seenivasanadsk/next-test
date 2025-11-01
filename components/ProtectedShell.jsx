"use client";

import { startTransition, useEffect, useState } from "react";
import cn from "@/utils/cn";
import Sidebar from "./Sidebar";
import { useSession } from "@/context/SessionProvider";
import { useActionHandler } from "@/context/ActionHandlerProvider";
import { logoutAction } from "@/actions/authAction";
import Button from "./Button";
import { MenuIcon } from "lucide-react";

export default function ProtectedShell({ children }) {
  const { session } = useSession();
  const { runAction } = useActionHandler();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true; // SSR safety
    try {
      const collapsed = localStorage.getItem("sidebarCollapsed");
      // stored as "true" or "false"
      return collapsed === "true" ? false : true;
    } catch {
      return true;
    }
  });

  // Persist sidebarCollapsed on toggle
  function toggleSidebar() {
    setIsSidebarOpen((prev) => {
      const newValue = !prev;
      try {
        // collapsed = opposite of open
        localStorage.setItem("sidebarCollapsed", (!newValue).toString());
      } catch {}
      return newValue;
    });
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
      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-250 ease-in-out",
          isSidebarOpen ? "mr-[180px]" : "mr-0"
        )}
      >
        <div className="p-6">{children}</div>
      </main>

      {/* Sidebar */}
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
              title="Open Sidebar (Alt+X)"
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
