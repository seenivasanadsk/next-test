"use client";
import React, { useRef, useState, useTransition } from "react";
import Table from "./Table";
import Button from "./Button";
import Filter from "./Filter";
import {
  ChevronUp,
  FileSearchIcon,
  Pin,
  PlusCircleIcon,
  Search,
} from "lucide-react";
import Pagination from "./Pagination";
import HorizontalLoader from "./HorizontalLoader";
import DateNavigation from "./DateNavigation";
import { useHotkeys } from "react-hotkeys-hook";
import cn from "@/utils/cn";
import InputField from "./fields/InputField";
import Popover from "./Popover";
import PopoverMenu from "./PopoverMenu";
import { getDataTableAction } from "@/actions/dataTableAction";

export default function DataTable({ config: parentConfig }) {
  const config = {
    title: "Data Table",
    addButtonText: "Add",
    items: [],
    showDateNavigator: false,
    noDataText: "No data found",
    noDataIcon: <FileSearchIcon size={35} />,
    onAdd: () => {},
    ...parentConfig,
  };

  const [tableOptions, setTableOptions] = useState({
    page: 1,
    itemsPerPage: 25,
    search: "",
  });
  const [tableData, setTableData] = useState(config.firstData);
  const popoverRef = useRef();
  const [isPending, startTransition] = useTransition();

  function updateTable(key, val) {
    setTableOptions((prev) => {
      const newOptions = { ...prev };
      switch (key) {
        case "itemsPerPage":
          newOptions["itemsPerPage"] = val;
          newOptions["page"] = 1;
          break;
        default:
          newOptions[key] = val;
          break;
      }
      console.log(newOptions);
      handleDataFetch(newOptions);
      return newOptions;
    });
  }

  const savedFilter = [
    { label: "Delivery Filter" },
    { label: "Settings Filter" },
    // { label: "Tokens Filter" },
    // { label: "Ledger Filter" },
    // { label: "User Filter" },
    // { label: "Profile Filter" },
    // { label: "Logout Filter" },
  ];

  useHotkeys(["alt+n", "0"], () => {
    console.log("Add New Item");
  });
  useHotkeys(["1", "2"], (e) => {
    console.log("Saved Filter", e.key);
  });
  useHotkeys(["alt+g", "8"], () => {
    popoverRef.current.toggle();
  });

  function handleDataFetch(newOptions) {
    startTransition(async () => {
      const data = await runAction(getDataTableAction, newOptions);
      console.log(data);
    });
  }

  return (
    <div className="h-full flex justify-center items-center text-gray-900 dark:text-gray-100 p-6">
      <main className="bg-white dark:bg-gray-950 shadow-xl max-w-6xl w-full h-full rounded-xl overflow-hidden flex flex-col text-lg">
        {/* Header */}
        <header className="items-center bg-amber-100 dark:bg-amber-1000 text-amber-900 dark:text-amber-50 p-3 border-b border-amber-200 dark:border-amber-950 flex flex-col lg:flex-row gap-3">
          <div className="flex-1 text-center lg:text-left flex flex-col lg:flex-row gap-x-5">
            <h1 className="text-3xl font-semibold">{config.title}</h1>
          </div>
          <div className="flex-1 flex justify-center">
            {config.showDateNavigator && (
              <DateNavigation
                onValue={(val) => updateTableOption("date", val)}
              />
            )}
          </div>
          <div className="flex-1 items-start flex gap-2 justify-end">
            <Popover
              ref={popoverRef}
              trigger={
                <Button size="sm" title="(Alt+G or 8) Search Records">
                  <Search />
                </Button>
              }
            >
              <InputField
                className={"mb-0 w-[200px]"}
                prefix={<Search />}
                value={tableOptions.search}
                onValue={(val) => updateTable("search", val)}
                placeholder="Search..."
              />
            </Popover>
            <Filter />
            <Button
              size="sm"
              onClick={config.onAdd}
              title="(Alt+N or 0) New Record"
              variant="success"
              prefix={<PlusCircleIcon />}
            >
              {config.addButtonText || "New"}
            </Button>
          </div>
        </header>
        <HorizontalLoader loading={isPending} />

        {/* Table Section */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full border border-gray-200 relative dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {tableData.items.length ? (
              <div
                className={cn(
                  "overflow-auto flex-1",
                  isPending && "opacity-50"
                )}
              >
                <Table result={tableData} />
              </div>
            ) : (
              <div
                className={cn(
                  "p-4 flex justify-center flex-col items-center h-full text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-amber-1200",
                  isPending && "opacity-50"
                )}
              >
                <div className="mb-3">{config.noDataIcon}</div>
                <div>{config.noDataText}</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-amber-100 dark:bg-amber-1000 text-amber-900 dark:text-amber-50 p-3 border-t border-amber-200 dark:border-amber-950 flex justify-between items-center flex-col lg:flex-row gap-3">
          <div className="flex-1 flex gap-x-2">
            {savedFilter.length >= 3 ? (
              <PopoverMenu
                trigger={
                  <Button size="sm" prefix={<Pin />} suffix={<ChevronUp />}>
                    Saved Filter
                  </Button>
                }
                align="top-left"
                items={savedFilter}
                onSelect={(item) => console.log("Selected:", item)}
              />
            ) : (
              savedFilter.map((f) => (
                <Button size="sm" key={f.label}>
                  {f.label}
                </Button>
              ))
            )}
          </div>
          <div className="flex-1">
            <Pagination
              itemsCount={tableData?.total || 0}
              page={tableOptions.page}
              onPageChange={(val) => updateTable("page", val)}
              itemsPerPage={tableOptions.itemsPerPage}
              onItemsPerPageChange={(val) => updateTable("itemsPerPage", val)}
            />
          </div>
          <div className="flex gap-x-2 text-base flex-1 justify-end">
            <span className="rounded bg-amber-600 dark:bg-amber-800 px-2 py-0.5 text-amber-50 dark:text-amber-50">
              Total: {tableData?.total || "0"}
            </span>
            {tableData.filtered != tableData.total && (
              <span className="rounded bg-amber-600 dark:bg-amber-800 px-2 py-0.5 text-amber-50 dark:text-amber-50">
                Filtered: {tableData.filtered || "0"}
              </span>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
