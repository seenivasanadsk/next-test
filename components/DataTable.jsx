import React from "react";
import Table from "./Table";
import DataTableSearch from "./DataTableSearch";
import Button from "./Button";
import Filter from "./Filter";
import { PlusCircle } from "lucide-react";
import Pagination from "./Pagination";

export default function DataTable({ config: parentConfig }) {
  const config = {
    title: "Data Table",
    addButtonText: "Add",
    footerContent: "Footer Information",
    ...parentConfig,
  };
  return (
    <div className="h-full">
      <div className="h-full flex flex-col rounded-lg shadow-lg bg-white dark:bg-gray-950 overflow-hidden w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex bg-amber-100 dark:bg-amber-950 px-3 py-2 border-b border-amber-200 dark:border-amber-700 items-center">
          <div className="flex-1">
            <div className="font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <div className="text-xl mr-5 inline-block">{config.title}</div>
              <DataTableSearch search={config.search} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter headers={config.headers} filterable={config.filterable} />
            <Button size="sm" prefix={<PlusCircle />}>
              {config.addButtonText}
            </Button>
          </div>
        </div>

        {/* Scrollable Body with fixed padding */}
        <div className="flex-1 relative">
          <div className="inset-0 p-5 h-full">
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
