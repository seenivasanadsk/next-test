"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search } from "lucide-react";
import InputField from "./fields/InputField";

export default function DataTableSearch({ search = "", updateParams }) {
  const [inputValue, setInputValue] = useState(search || "");
  const [isPending, startTransition] = useTransition();

  // 🕒 Debounce logic (wait for user to stop typing)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue !== search) {
        startTransition(() => {
          updateParams({ search: inputValue || "" });
        });
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeout);
  }, [inputValue]);

  return (
    <div className="w-full max-w-xs">
      <InputField
        className="mb-0"
        placeholder="Search"
        prefix={<Search />}
        value={inputValue}
        onValue={(val) => setInputValue(val)}
        autoFocus
      />
    </div>
  );
}
