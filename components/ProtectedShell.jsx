"use client";

import { startTransition, useEffect, useState } from "react";
import cn from "@/utils/cn";
import Sidebar from "./Sidebar";
import { useSession } from "@/context/SessionProvider";
import { useActionHandler } from "@/context/ActionHandlerProvider";
import { logoutAction } from "@/actions/authAction";

export default function ProtectedShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { session } = useSession();
  const { runAction } = useActionHandler();

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
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
        <Sidebar toggleSidebar={toggleSidebar} />
      </aside>
    </div>
  );
}
