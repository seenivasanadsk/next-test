"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useTransition,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationProvider";

const ActionHandlerContext = createContext(null);

export function ActionHandlerProvider({ children }) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // 🔒 Track last executed action (for dev duplicate prevention)
  const lastActionRef = useRef({ key: null, timestamp: 0 });

  function runAction(actionFn, payload, options) {
    return new Promise((resolve) => {
      startTransition(async () => {
        let actualPayload = null;
        let actualOptions = { silent: false };

        if (arguments.length === 1) {
          // only actionFn
        } else if (arguments.length === 2) {
          if (
            payload &&
            typeof payload === "object" &&
            Object.keys(payload).every((k) => ["silent"].includes(k))
          ) {
            actualOptions = payload;
          } else {
            actualPayload = payload;
          }
        } else if (arguments.length >= 3) {
          actualPayload = payload;
          actualOptions = options || {};
        }

        const { silent = false } = actualOptions;

        // 🧩 Create a simple signature for deduplication
        const actionKey = JSON.stringify({
          fn: actionFn?.name || "anonymous",
          payload: actualPayload,
        });

        // 🚫 Skip if same action ran very recently (Strict Mode double render)
        if (process.env.NODE_ENV === "development") {
          const now = Date.now();
          const diff = now - lastActionRef.current.timestamp;
          if (
            lastActionRef.current.key === actionKey &&
            diff < 1000 // 1 second threshold
          ) {
            console.warn(
              "[runAction] Duplicate action skipped in dev mode:",
              actionFn?.name
            );
            return resolve(null);
          }
          lastActionRef.current = { key: actionKey, timestamp: now };
        }

        try {
          setIsLoading(true);
          const response = await actionFn(actualPayload);
          const { success, message, data } = response || {};

          if (success) {
            if (data?.redirectTo) {
              if (data?.message && !silent) {
                addNotification(data.message, "info");
              }
              router.push(data.redirectTo);
              return resolve(null);
            }
            if (!silent && message) addNotification(message, "success");
            return resolve(data);
          }

          if (!silent && message) addNotification(message, "error");
          resolve(null);
        } catch (error) {
          if (!silent)
            addNotification(error?.message || "Something went wrong", "error");
          console.error("runAction error:", error);
          resolve(null);
        } finally {
          setIsLoading(false);
        }
      });
    });
  }

  const value = useMemo(
    () => ({ runAction, isPending, isLoading }),
    [isPending, isLoading]
  );

  return (
    <ActionHandlerContext.Provider value={value}>
      {children}
    </ActionHandlerContext.Provider>
  );
}

export function useActionHandler() {
  const ctx = useContext(ActionHandlerContext);
  if (!ctx)
    throw new Error(
      "useActionHandler must be used inside ActionHandlerProvider"
    );
  return ctx;
}
