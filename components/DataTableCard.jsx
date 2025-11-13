"use client";

import { getFormatedTimeStamp } from "@/utils/dateTime";
import display from "@/utils/display";
import Link from "next/link";
import React from "react";

export default function DataTableCard({ result }) {
  const { items = [], headers = [], editURL, deleteAction } = result || {};
  return (
    <div className="w-full p-4">
      {/* Grid Container */}
      <div
        className="
          grid
          gap-4
          sm:grid-cols-1
          lg:grid-cols-2
          xl:grid-cols-3
        "
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="
                bg-white dark:bg-gray-800
                rounded-2xl
                shadow-md
                hover:shadow-xl
                transition
                duration-200
                flex flex-col
                justify-between
                p-4
                border border-gray-200 dark:border-gray-700
              "
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-2">
              {/* <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                  {item.status || "Active"}
                </span> */}
              <span>
                <Link
                  href={`/`}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 mr-1"
                  title="Edit"
                >
                  ✏️
                </Link>
                <button
                  onClick={() => {}}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-200 dark:hover:bg-red-900"
                  title="Delete"
                >
                  ❌
                </button>
              </span>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {item.title || `Item ${i + 1}`}
              </h2>
            </div>

            {/* Card Body */}
            <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {headers.map((h, i) => (
                <p key={i} className="flex justify-between">
                  <span className="font-medium capitalize">{h.title}:</span>
                  <span
                    className="truncate text-right"
                    title={getFormatedTimeStamp(item[h.valuePath])}
                  >
                    {display(item[h.valuePath], h?.display)}
                  </span>
                </p>
              ))}
            </div>

            {/* Card Footer */}
            <div className="mt-3 flex justify-end gap-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
