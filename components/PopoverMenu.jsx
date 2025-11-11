"use client";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import cn from "@/utils/cn";

const PopoverMenu = forwardRef(function PopoverMenu(
  {
    trigger,
    items = [],
    align = "bottom-right",
    onSelect = () => {},
    className = "",
    icon: Icon = ChevronDown,
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const handleSelect = (item) => {
    onSelect(item);
    close();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        close();
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const positionClasses = {
    "top-left": "bottom-full mb-2 left-0 origin-bottom-left",
    "top-center": "bottom-full mb-2 left-1/2 -translate-x-1/2 origin-bottom",
    "top-right": "bottom-full mb-2 right-0 origin-bottom-right",
    "bottom-left": "top-full mt-2 left-0 origin-top-left",
    "bottom-center": "top-full mt-2 left-1/2 -translate-x-1/2 origin-top",
    "bottom-right": "top-full mt-2 right-0 origin-top-right",
  };

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1 cursor-pointer select-none focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggle();
        }}
      >
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div
          ref={menuRef}
          className={cn(
            "absolute z-50 min-w-[160px] rounded-md border border-neutral-200 dark:border-neutral-800",
            "bg-white dark:bg-neutral-900 shadow-lg focus:outline-none",
            "flex flex-col overflow-hidden transition-all duration-150 ease-out",
            positionClasses[align],
            className
          )}
          role="menu"
          tabIndex={-1}
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
      )}
    </div>
  );
});

export default PopoverMenu;
