"use client";
import React, { useEffect, useState, useTransition } from "react";
import Table from "./Table";
import DataTableSearch from "./DataTableSearch";
import Button from "./Button";
import Filter from "./Filter";
import { PlusCircle } from "lucide-react";
import Pagination from "./Pagination";
import HorizontalLoader from "./HorizontalLoader";
import { useRouter, useSearchParams } from "next/navigation";
import DateNavigation from "./DateNavigation";

export default function DataTable({ config: parentConfig }) {
  const [tableOptions, setTableOptions] = useState({});

  function updateTableOption(key, val) {
    setTableOptions((prev) => ({ ...prev, key: val }));
  }

  const config = {
    title: "Data Table",
    addButtonText: "Add",
    footerContent: "Footer Information",
    ...parentConfig,
  };
  return (
    <div className="h-full flex justify-center items-center text-gray-900 dark:text-gray-100 transition-colors duration-300 p-6">
      <main className="bg-white dark:bg-amber-1200 shadow-xl max-w-6xl w-full h-full rounded-xl overflow-hidden flex flex-col text-lg transition-colors duration-300">
        {/* Header */}
        <header className="bg-amber-100 dark:bg-amber-1000 text-amber-900 dark:text-amber-50 p-5 border-b border-amber-200 dark:border-amber-950 flex flex-col md:flex-row gap-5 transition-colors duration-300">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-semibold">{config.title}</h1>
          </div>
          {JSON.stringify(tableOptions.date)}
          <div className="flex-1 text-center">
            <DateNavigation
              value={tableOptions.date}
              onValue={(val) => updateTableOption("date", val)}
            />
          </div>
          <div className="flex-1 self-center flex gap-2 justify-end">
            <button className="px-2 py-1 rounded-md cursor-pointer bg-blue-500 dark:bg-blue-800 text-white shadow hover:bg-blue-600 transition-colors">
              Options
            </button>
            <button
              className="px-2 py-1 rounded-md cursor-pointer bg-green-500 dark:bg-green-800 text-white shadow hover:bg-green-600 transition-colors"
              title="(Alt+N) New Token"
            >
              + New Token
            </button>
          </div>
        </header>

        {/* Table Section */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
            <div className="overflow-auto flex-1">
              <Table config={config} />
            </div>
            {/* <div className="p-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-amber-1200 transition-colors duration-300">
              No data Found.
            </div> */}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-amber-100 dark:bg-amber-1000 text-amber-900 dark:text-amber-50 p-4 border-t border-amber-200 dark:border-amber-950 flex justify-between items-center flex-col md:flex-row gap-4 transition-colors duration-300">
          <div className="flex gap-x-4">
            <button className="text-center px-3 py-1.5 rounded-md cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white shadow transition-colors">
              Opened Tokens
            </button>
            <button className="text-center px-3 py-1.5 rounded-md cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white shadow transition-colors">
              Closed Tokens
            </button>
          </div>
          <div className="border rounded p-1 uppercase text-xs border-amber-300 dark:border-amber-950">
            ENV: TEST
          </div>
          <div className="flex gap-x-3">
            <span className="rounded bg-amber-600 dark:bg-amber-800 px-2 py-1 text-amber-50 dark:text-amber-50">
              Total: 00
            </span>
            <span className="rounded bg-amber-600 dark:bg-amber-800 px-2 py-1 text-amber-50 dark:text-amber-50">
              Opened: 00
            </span>
            <span className="rounded bg-amber-600 dark:bg-amber-800 px-2 py-1 text-amber-50 dark:text-amber-50">
              Closed: 00
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
