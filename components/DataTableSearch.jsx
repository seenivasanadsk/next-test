"use client";
import React from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import searchParams from "@/utils/searchParams";
import InputField from "./fields/InputField";

export default function DataTableSearch({ search }) {
  const router = useRouter();
  function handleSearch(value) {
    searchParams.updateOne("search", value, router);
  }

  return (
    <div>
      <InputField
        className="mb-0"
        placeholder="Search"
        prefix={<Search />}
        autoFocus={true}
        value={search}
        onValue={handleSearch}
      />
    </div>
  );
}
