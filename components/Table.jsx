"use client";
import Link from "next/link";
import cn from "@/utils/cn";
import display from "@/utils/display";
import { getFormatedTimeStamp } from "@/utils/dateTime";

export default function Table({ result }) {
  const { items = [], headers = [], editURL, deleteAction } = result || {};

  return (
    <table className="min-w-full border-collapse">
      <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-amber-50 uppercase tracking-wide shadow-sm">
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-4 py-3 text-left font-semibold whitespace-nowrap bg-inherit"
            >
              {header.title}
            </th>
          ))}
          <th className="px-4 py-3 text-center font-semibold whitespace-nowrap bg-inherit">
            Action
          </th>
        </tr>
      </thead>

      {/* ---------- Table Body ---------- */}
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item, itemIndex) => (
          <tr
            key={item._id || itemIndex}
            className={cn(
              "hover:bg-amber-50 dark:hover:bg-amber-900/40 last:border-b-1 border-gray-200 dark:border-gray-700",
              itemIndex % 2 === 1
                ? "bg-gray-50 dark:bg-gray-900"
                : "bg-white dark:bg-gray-950"
            )}
          >
            {headers.map((header, headerIndex) => (
              <td
                key={`${itemIndex}-${headerIndex}`}
                className="px-4 py-2 whitespace-nowrap text-gray-800 dark:text-gray-100"
                title={getFormatedTimeStamp(item[header.valuePath])}
              >
                {display(item[header.valuePath], header?.display)}
              </td>
            ))}

            {/* ---------- Action Buttons ---------- */}
            <td className="px-4 py-2 text-center whitespace-nowrap">
              {editURL && (
                <Link
                  href={`${editURL}/${item._id}`}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 mr-1"
                  title="Edit"
                >
                  ✏️
                </Link>
              )}
              {deleteAction && (
                <button
                  onClick={() => deleteAction(item)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-200 dark:hover:bg-red-900"
                  title="Delete"
                >
                  ❌
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
