"use client";
import React, { useEffect, useState, useTransition } from "react";
import Table from "./Table";
import DataTableSearch from "./DataTableSearch";
import Button from "./Button";
import Filter from "./Filter";
import { FileSearchIcon, PlusCircleIcon } from "lucide-react";
import Pagination from "./Pagination";
import HorizontalLoader from "./HorizontalLoader";
import DateNavigation from "./DateNavigation";
import { useHotkeys } from "react-hotkeys-hook";

export default function DataTable({ config: parentConfig }) {
  const [tableOptions, setTableOptions] = useState({});

  function updateTableOption(key, val) {
    setTableOptions((prev) => ({ ...prev, [key]: val }));
  }

  useHotkeys(["alt+n", "0"], () => {
    console.log("Add New Item");
  });

  const config = {
    title: "Data Table",
    addButtonText: "Add",
    items: [],
    loading: false,
    noDataText: "No data found",
    noDataIcon: <FileSearchIcon size={35} />,
    onAdd: () => {},
    ...parentConfig,
  };
  return (
    <div className="h-full flex justify-center items-center text-gray-900 dark:text-gray-100 duration-300 p-6">
      <main className="bg-white dark:bg-amber-1200 shadow-xl max-w-6xl w-full h-full rounded-xl overflow-hidden flex flex-col text-lg duration-300">
        {/* Header */}
        <header className="items-center bg-amber-100 dark:bg-amber-1000 text-amber-900 dark:text-amber-50 p-3 border-b border-amber-200 dark:border-amber-950 flex flex-col md:flex-row gap-3 duration-300">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-semibold">{config.title}</h1>
          </div>
          <div className="flex-1 flex justify-center">
            <DateNavigation onValue={(val) => updateTableOption("date", val)} />
          </div>
          <div className="flex-1 self-center flex gap-2 justify-end">
            {config.addButtonText && (
              <Button
                onClick={config.onAdd}
                title="(Alt+N or 0) New Record"
                variant="success"
                prefix={<PlusCircleIcon />}
              >
                {config.addButtonText}
              </Button>
            )}
          </div>
        </header>
        <HorizontalLoader loading={config.loading} />

        {/* Table Section */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full border border-gray-200 relative dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col duration-300">
            {config.items.length ? (
              <div className="overflow-auto flex-1">
                <Table config={config} />
              </div>
            ) : (
              <div className="p-4 flex justify-center flex-col items-center h-full text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-amber-1200 duration-300">
                <div className="mb-3">{config.noDataIcon}</div>
                <div>{config.noDataText}</div>
              </div>
            )}
            {config.loading && (
              <div className="flex h-full bg-black/10 dark:bg-black/20 absolute inset-0 z-10" />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-amber-100 dark:bg-amber-1000 text-amber-900 dark:text-amber-50 p-3 border-t border-amber-200 dark:border-amber-950 flex justify-between items-center flex-col md:flex-row gap-3 duration-300">
          <div className="flex gap-x-4">{/* Exra button here */}</div>
          <div className="border rounded p-1 uppercase text-xs border-amber-300 dark:border-amber-950">
            {/* Midle informaticve */}
          </div>
          <div className="flex gap-x-3">
            {/* <span className="rounded bg-amber-600 dark:bg-amber-800 px-2 py-1 text-amber-50 dark:text-amber-50">
              Total: 00
            </span>
            <span className="rounded bg-amber-600 dark:bg-amber-800 px-2 py-1 text-amber-50 dark:text-amber-50">
              Opened: 00
            </span>
            <span className="rounded bg-amber-600 dark:bg-amber-800 px-2 py-1 text-amber-50 dark:text-amber-50">
              Closed: 00
            </span> */}
          </div>
        </footer>
      </main>
    </div>
  );
}
