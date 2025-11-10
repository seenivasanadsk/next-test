"use client";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import cn from "@/utils/cn";
import Popover from "./Popover"; // your Popover component

const PopoverMenu = forwardRef(function PopoverMenu(
  {
    trigger,
    items = [],
    align = "bottom-right",
    onSelect = () => {},
    className = "",
    icon: Icon = ChevronDown, // customizable icon
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  // --- Close when menu item clicked ---
  const handleSelect = (item) => {
    onSelect(item);
    setOpen(false);
  };

  // --- Close on Escape ---
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <Popover
      ref={popoverRef}
      align={align}
      trigger={
        <div
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
          role="button"
          tabIndex={0}
          className="inline-flex items-center gap-1 cursor-pointer select-none focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setOpen((prev) => !prev);
          }}
        >
          {trigger}
        </div>
      }
    >
      <div
        className={cn(
          "flex flex-col min-w-[160px] rounded-md border border-neutral-200 dark:border-neutral-800 overflow-hidden",
          "bg-white dark:bg-neutral-900 shadow-lg focus:outline-none",
          className
        )}
        role="menu"
      >
        {items.map((item, i) => (
          <div
            key={i}
            role="menuitem"
            tabIndex={0}
            onClick={() => handleSelect(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelect(item);
            }}
            className={cn(
              "px-3 py-2 text-left text-sm transition-colors cursor-pointer select-none",
              "hover:bg-neutral-100 dark:hover:bg-neutral-800",
              "focus:bg-neutral-100 dark:focus:bg-neutral-800 outline-none"
            )}
          >
            {typeof item === "string" ? item : item.label}
          </div>
        ))}
      </div>
    </Popover>
  );
});

export default PopoverMenu;
