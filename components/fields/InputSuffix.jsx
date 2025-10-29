import cn from "@/utils/cn";
import React from "react";

export default function InputSuffix({ children, onClick }) {
  return (
    <div
      className={cn(
        "flex items-center px-2 text-gray-500 border-l-2 border-inherit",
        onClick ? "cursor-pointer hover:text-amber-500" : ""
      )}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}
