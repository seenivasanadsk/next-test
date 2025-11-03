"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import cn from "@/utils/cn";

export default function Pagination({
  totalItems,
  filteredItems,
  defaultPageSize = 25,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("itemsPerPage") || defaultPageSize);

  const totalPages = Math.ceil(filteredItems / pageSize);
  if (totalPages <= 1) return null;

  // --- Helper: update search params ---
  const updateParams = (newPage, newPageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) params.delete("page");
    else params.set("page", newPage);

    if (newPageSize === defaultPageSize) params.delete("itemsPerPage");
    else params.set("itemsPerPage", newPageSize);

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl, { scroll: false });
  };

  // --- Generate page numbers with ellipsis ---
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 2) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 1) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // --- Items per page options ---
  const pageSizeOptions = [25, 50, 100, 150, 200];

  return (
    <div className="flex items-center gap-2 mt-4 justify-between flex-col md:flex-row">
      {/* Page Numbers */}
      <div className="flex gap-1">
        <button
          onClick={() => updateParams(page - 1, pageSize)}
          disabled={page === 1}
          className={cn(
            "px-1 py-0 rounded border-2",
            page === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber-200 dark:hover:bg-amber-700"
          )}
        >
          <span className="inline-block rotate-180">&#10148;</span>
        </button>

        {pageNumbers.map((p, idx) =>
          p === "..." ? (
            <span key={idx} className="px-1 py-0">
              ...
            </span>
          ) : (
            <button
              key={idx}
              onClick={() => updateParams(p, pageSize)}
              className={cn(
                "px-1 py-0 rounded border-2",
                p === page
                  ? "bg-amber-600 text-white border-amber-800 dark:border-amber-200 dark:bg-amber-500"
                  : "hover:bg-amber-200 dark:hover:bg-amber-700"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => updateParams(page + 1, pageSize)}
          disabled={page === totalPages}
          className={cn(
            "px-1 py-0 rounded border-2",
            page === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber-200 dark:hover:bg-amber-700"
          )}
        >
          <span className="inline-block">&#10148;</span>
        </button>
      </div>

      <div className="flex gap-2">
        <span className="inline-block bg-amber-800 text-amber-50 dark:bg-amber-100 dark:text-amber-800 px-2 py-1 rounded">
          Total: {totalItems}
        </span>
        <span className="inline-block bg-amber-800 text-amber-50 dark:bg-amber-100 dark:text-amber-800 px-2 py-1 rounded">
          Filtered: {filteredItems}
        </span>
      </div>

      {/* Items Per Page Selector */}
      <div className="flex items-center gap-2">
        <span>Per Page:</span>
        <select
          value={pageSize}
          onChange={(e) => updateParams(1, Number(e.target.value))}
          className="border-2 rounded px-2 py-1"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>
          {page} of {totalPages}
        </span>
      </div>
    </div>
  );
}
