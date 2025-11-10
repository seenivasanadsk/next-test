"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import cn from "@/utils/cn";
import { useHotkeys } from "react-hotkeys-hook";

const Popover = forwardRef(function Popover(
  { trigger, children, align = "bottom-center" },
  ref
) {
  const [open, setOpen] = useState(false);
  const [dynamicAlign, setDynamicAlign] = useState(align);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  // --- Centralized close logic ---
  const closePopover = () => {
    const prevActive = document.activeElement;
    setOpen(false);

    requestAnimationFrame(() => {
      prevActive?.blur?.();
      triggerRef.current?.focus?.();
    });
  };

  // --- Expose methods to parent ---
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => closePopover(),
    toggle: () => setOpen((p) => !p),
    isOpen: () => open,
  }));

  // --- Focus management ---
  useEffect(() => {
    if (open && contentRef.current) {
      const focusable = contentRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      requestAnimationFrame(() => {
        if (focusable) focusable.focus();
        else contentRef.current?.focus?.();
      });
    }
  }, [open]);

  // --- Close when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        closePopover();
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // --- ESC key (native + hotkeys) ---
  useHotkeys(
    "escape",
    () => open && closePopover(),
    { global: true, filter: () => true },
    [open]
  );

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        closePopover();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // --- Dynamic alignment detection to prevent overflow ---
  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let newAlign = align;

    const fitsBelow = triggerRect.bottom + contentRect.height < vh;
    const fitsAbove = triggerRect.top - contentRect.height > 0;
    const fitsLeft = triggerRect.left + contentRect.width < vw;
    const fitsRight = triggerRect.right - contentRect.width > 0;

    // Flip vertically if overflow
    if (align.startsWith("bottom") && !fitsBelow && fitsAbove)
      newAlign = align.replace("bottom", "top");
    else if (align.startsWith("top") && !fitsAbove && fitsBelow)
      newAlign = align.replace("top", "bottom");

    // Adjust horizontally if overflow
    if (align.endsWith("left") && !fitsLeft && fitsRight)
      newAlign = newAlign.replace("left", "right");
    else if (align.endsWith("right") && !fitsRight && fitsLeft)
      newAlign = newAlign.replace("right", "left");

    setDynamicAlign(newAlign);
  }, [open, align]);

  // --- Position classes ---
  const positionClasses = {
    "top-left": "bottom-full mb-2 left-0 origin-bottom-left",
    "top-center": "bottom-full mb-2 left-1/2 -translate-x-1/2 origin-bottom",
    "top-right": "bottom-full mb-2 right-0 origin-bottom-right",
    "bottom-left": "top-full mt-2 left-0 origin-top-left",
    "bottom-center": "top-full mt-2 left-1/2 -translate-x-1/2 origin-top",
    "bottom-right": "top-full mt-2 right-0 origin-top-right",
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger element */}
      <div
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex cursor-pointer h-full"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {trigger}
      </div>

      {/* Popover content */}
      <div
        ref={contentRef}
        tabIndex={-1}
        role="dialog"
        aria-hidden={!open}
        className={cn(
          "absolute z-50 min-w-[160px] rounded-md bg-white shadow-xl",
          "dark:bg-neutral-900 dark:text-neutral-100",
          "p-2 text-sm transition-all duration-200 ease-out",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
          positionClasses[dynamicAlign] || positionClasses["bottom-center"]
        )}
      >
        {children}
      </div>
    </div>
  );
});

export default Popover;
