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

export default function DataTable({ config: parentConfig }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Smoothly handle pending state
  useEffect(() => {
    if (isPending) setLoading(true);
    else {
      setLoading(false);
      // const timer = setTimeout(() => setLoading(false), 300); // smooth fade-out
      // return () => clearTimeout(timer);
    }
  }, [isPending]);

  // Handles filter/search updates that trigger URL change
  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  const config = {
    title: "Data Table",
    addButtonText: "Add",
    footerContent: "Footer Information",
    loading,
    ...parentConfig,
  };
  return (
    <div className="h-full">
      <div className="h-full flex flex-col rounded-lg shadow-lg bg-white dark:bg-gray-950 overflow-hidden w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex bg-amber-100 dark:bg-amber-950 px-3 py-2 border-b border-amber-200 dark:border-amber-700 items-center flex-col md:flex-row">
          <div className="flex-1">
            <div className="font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2 flex-col md:flex-row">
              <div className="text-xl mr-5 inline-block">{config.title}</div>
              <DataTableSearch
                search={config.search}
                updateParams={updateParams}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Filter
              headers={config.headers}
              filterable={config.filterable}
              updateParams={updateParams}
            />
            <Button size="sm" prefix={<PlusCircle />}>
              {config.addButtonText}
            </Button>
          </div>
        </div>
        <HorizontalLoader loading={loading} />

        {/* Scrollable Body with fixed padding */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 p-5">
            <div className="w-full h-full overflow-auto rounded-lg shadow">
              <Table config={config} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-amber-100 dark:bg-amber-950 px-3 py-2 border-t border-amber-200 dark:border-amber-700">
          <div className="text-md font-semibold text-amber-900 dark:text-amber-100">
            <Pagination
              totalItems={config.total}
              filteredItems={config.filtered}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
