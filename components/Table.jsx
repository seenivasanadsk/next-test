import Link from "next/link";
import TableHead from "./TableHead";
import TableDeleteButton from "./TableDeleteAction";
import display from "@/utils/display";
import cn from "@/utils/cn";

export default function Table({ config }) {
  const { items, headers, editURL, deleteAction, loading } = config;
  return (
    <table className="min-w-full border-collapse text-sm md:text-base">
      <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-amber-1100 text-gray-700 dark:text-amber-50 uppercase tracking-wide shadow-sm transition-colors duration-300">
        <tr>
          <th className="px-3 py-2 text-left font-semibold w-1/4">TEST 1</th>
          <th className="px-3 py-2 text-left font-semibold w-1/4">TEST 2</th>
          <th className="px-3 py-2 text-left font-semibold w-1/4">TEST 3</th>
          <th className="px-3 py-2 text-center font-semibold w-1/4">ACTION</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
        {Array.from({ length: 25 }).map((_, i) => (
          <tr
            key={i}
            className={`transition-colors hover:bg-amber-50 dark:hover:bg-amber-1100 ${
              i % 2 === 1
                ? "bg-gray-50 dark:bg-amber-1200"
                : "bg-white dark:bg-amber-full"
            }`}
          >
            <td className="px-3 py-1 whitespace-nowrap">data 1</td>
            <td className="px-3 py-1 whitespace-nowrap">data 2</td>
            <td className="px-3 py-1 whitespace-nowrap">data 3</td>
            <td className="px-3 py-1 text-center">
              <button
                className="rounded-full p-1 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors cursor-pointer mr-2"
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="rounded-full p-1 hover:bg-red-200 dark:hover:bg-red-900 transition-colors cursor-pointer"
                title="Delete"
              >
                ❌
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
