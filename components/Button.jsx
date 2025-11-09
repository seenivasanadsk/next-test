"use client";

import React from "react";
import Link from "next/link";
import cn from "@/utils/cn";
import { LoaderCircle } from "lucide-react";

export default function Button({
  variant = "accent",
  radius = "md",
  size = "md",
  href,
  onClick,
  prefix,
  suffix,
  type = "button",
  children,
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600 dark:active:bg-blue-700 focus:outline-blue-600 dark:focus:outline-blue-400",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:active:bg-gray-500 focus:outline-gray-600 dark:focus:outline-gray-400",
    accent:
      "bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700 dark:active:bg-amber-800 focus:outline-amber-600 dark:focus:outline-amber-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700 focus:outline-red-600 dark:focus:outline-red-400",
    success:
      "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 dark:bg-green-700 dark:hover:bg-green-800 dark:active:bg-green-700 focus:outline-green-600 dark:focus:outline-green-700",
  };

  const disabledStyles =
    "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300";

  const radiusStyles = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const baseClasses = cn(
    "inline-flex items-center justify-center gap-2 font-semibold transition duration-200",
    "focus:outline focus:outline-3 focus:outline-offset-2", // outline with offset
    "disabled:opacity-50 disabled:cursor-not-allowed relative" // disabled state
  );

  const buttonClass = cn(
    baseClasses,
    disabled ? disabledStyles : variantStyles[variant],
    radiusStyles[radius],
    sizeStyles[size],
    className
  );

  // --- Icon rendering ---
  const renderIcon = (icon) => {
    if (!icon) return null;
    if (typeof icon === "function") return React.createElement(icon);
    return icon;
  };

  const PrefixIcon = loading ? (
    <LoaderCircle className="animate-spin text-current" />
  ) : (
    renderIcon(prefix)
  );
  const SuffixIcon = renderIcon(suffix);

  const content = (
    <>
      {PrefixIcon && <span className="mr-1">{PrefixIcon}</span>}
      <span className={PrefixIcon ? "hidden sm:inline" : ""}>{children}</span>
      {SuffixIcon && <span className="ml-1">{SuffixIcon}</span>}
    </>
  );

  if (href) {
    // If disabled, don't navigate
    return disabled ? (
      <span className={buttonClass}>{content}</span>
    ) : (
      <Link href={href} className={buttonClass} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      className={buttonClass}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}
