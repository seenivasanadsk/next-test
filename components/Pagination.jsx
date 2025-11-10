"use client";

import React from "react";
import cn from "@/utils/cn";
import { ChevronDown } from "lucide-react";

export default function Pagination({
  itemsCount = 1,
  defaultPageSize = 25,
  page,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
}) {
  // --- Current state from URL ---
  page = Math.max(Number(page) || 1, 1);
  const pageSize = Math.max(Number(itemsPerPage) || defaultPageSize, 1);

  // --- Derived values ---
  const totalPages = Math.max(Math.ceil(itemsCount / pageSize), 1);

  // --- Generate page numbers with ellipsis ---
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const showLeftEllipsis = page > 3;
      const showRightEllipsis = page < totalPages - 2;

      if (!showLeftEllipsis && showRightEllipsis) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (showLeftEllipsis && !showRightEllipsis) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const pageSizeOptions = [25, 50, 100, 150, 200];

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-3 py-2 text-sm">
      {/* --- Page Navigation --- */}
      <div className="flex items-center gap-1">
        {/* Prev button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={cn(
            "px-1 py-0.5 rounded border-2",
            page === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber-200 dark:hover:bg-amber-700"
          )}
        >
          <span className="inline-block rotate-180">&#10148;</span>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2">
              ...
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Go to page ${p}`}
              className={cn(
                "px-1 py-0.5 rounded border-2",
                p === page
                  ? "bg-amber-600 text-white border-amber-800 dark:border-amber-200 dark:bg-amber-500"
                  : "hover:bg-amber-200 dark:hover:bg-amber-700"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className={cn(
            "px-1 py-0.5 rounded border-2",
            page === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber-200 dark:hover:bg-amber-700"
          )}
        >
          <span className="inline-block">&#10148;</span>
        </button>
      </div>
      {/* --- Items per page selector --- */}
      <div className="relative inline-block">
        <select
          id="itemsPerPage"
          value={pageSize}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="
            bg-transparent cursor-pointer px-1 py-[2px] pr-6 
            rounded border-2 outline-none appearance-none
            dark:bg-amber-1000 dark:text-amber-50
          "
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <ChevronDown
          size={16}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-amber-800 dark:text-amber-50"
        />
      </div>
    </div>
  );
}
