"use client";
import { useState, useEffect } from "react";
import Button from "./Button";
import InputField from "./fields/InputField";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { convertToDate, parseDateTime } from "@/utils/dateTime";

export default function DateNavigation({ onValue }) {
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    const today = convertToDate(new Date());
    setDateInput(today);
    if (typeof onValue === "function") {
      onValue(parseDateTime(today));
    }
  }, []);

  const handleInput = (e, shouldConvert = false) => {
    const value = e?.target?.value || "";

    if (shouldConvert) {
      const converted = convertToDate(value);
      setDateInput(converted);
      if (typeof onValue === "function") {
        onValue(parseDateTime(converted));
      }
    } else {
      setDateInput(value);
    }
  };

  const handleDateNav = (offset) => {
    const date = parseDateTime(dateInput);
    if (isNaN(date)) return;

    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + offset);

    const converted = convertToDate(newDate);
    setDateInput(converted);
    if (typeof onValue === "function") {
      onValue(parseDateTime(converted));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleDateNav(-1)}
        className="p-2"
        aria-label="Previous date"
      >
        <ArrowLeft />
      </Button>

      <InputField
        className="mb-0 max-w-[130px] border-amber-600 dark:border-amber-600 focus:outline-amber-600 dark:focus:outline-amber-500"
        inputClassName="text-center"
        onChange={(e) => handleInput(e)}
        onBlur={(e) => handleInput(e, true)}
        value={dateInput}
      />

      <Button
        onClick={() => handleDateNav(1)}
        className="p-2"
        aria-label="Next date"
      >
        <ArrowRight />
      </Button>
    </div>
  );
}
