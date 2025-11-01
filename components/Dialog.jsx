"use client";
import { useHotkeys } from "react-hotkeys-hook";

export default function Dialog({ children, state, onClose, trigger }) {
  useHotkeys("esc", onClose);

  return (
    <div className="relative text-base">
      {/* Trigger */}
      {trigger}

      {/* Overlay + Content */}
      {state && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Centered Dialog Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
