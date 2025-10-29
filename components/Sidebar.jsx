"use client";
import { useSession } from "@/context/SessionProvider";

// components\Sidebar.jsx
export default function Sidebar() {
  const { session } = useSession();
  return (
    <div className="border-l-2 w-full h-full flex flex-col bg-gray-50 dark:bg-gray-950 shadow-2xl">
      {/* Nav Icons */}
      <div className="flex gap-2 p-2 flex-wrap border-b-2">Test</div>

      {/* Nav Shortcuts */}
      <div className="flex-1"></div>

      {/* Sidebar Footer */}
      <div className="text-center border-t-2 p-2 text-sm">
        <div className="select-all">{`http://${session.serverIP}:${session.serverPort}`}</div>
        <div className="capitalize">Env: {process.env.NODE_ENV}</div>
        <div className="capitalize">
          User: {session.username || "loged out"}
        </div>
      </div>
    </div>
  );
}
