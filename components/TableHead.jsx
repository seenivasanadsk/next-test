"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import cn from "@/utils/cn";
import React from "react";

export default function TableHead({ header }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSortable() {
    if (!header.sortable) return;

    const params = new URLSearchParams(searchParams.toString());
    const rawSort = params.get("sort");

    // Parse Mongo-like sort JSON safely
    let sortObj = {};
    try {
      sortObj = rawSort ? JSON.parse(rawSort) : {};
    } catch {
      sortObj = {};
    }

    // Determine current state for this column
    const current = sortObj[header.valuePath];

    // Cycle through: undefined → asc(1) → desc(-1) → none(undefined)
    if (current === 1) {
      sortObj[header.valuePath] = -1;
    } else if (current === -1) {
      delete sortObj[header.valuePath];
    } else {
      sortObj[header.valuePath] = 1;
    }

    // If all removed, clear the param
    if (Object.keys(sortObj).length === 0) {
      params.delete("sort");
    } else {
      params.set("sort", JSON.stringify(sortObj));
    }

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(decodeURIComponent(newUrl), { scroll: false });
  }

  // --- Determine this header's sort state ---
  const rawSort = searchParams.get("sort");
  let sortObj = {};
  try {
    sortObj = rawSort ? JSON.parse(rawSort) : {};
  } catch {
    sortObj = {};
  }

  const direction = sortObj[header.valuePath];
  const isActive = direction === 1 || direction === -1;
  const isDescending = direction === -1;

  return (
    <th
      onClick={handleSortable}
      className={cn(
        "border-b border-amber-300 dark:border-amber-950 px-3 py-2 text-left select-none whitespace-nowrap",
        header.sortable &&
          "cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-700"
      )}
    >
      <span className="flex items-center gap-1">
        {header.title}
        {header.sortable && (
          <span
            className={cn(
              "inline-block text-amber-700 dark:text-amber-200 transition-transform duration-200",
              isActive
                ? isDescending
                  ? "rotate-180 opacity-100"
                  : "rotate-0 opacity-100"
                : "opacity-30 rotate-0"
            )}
          >
            ▲
          </span>
        )}
      </span>
    </th>
  );
}
