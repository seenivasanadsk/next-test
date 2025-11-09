"use client";
import { useState } from "react";
import Button from "./Button";
import InputField from "./fields/InputField";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { convertToDate, parseDateTime } from "@/utils/dateTime";

export default function DateNavigation({ value, onValue }) {
  const [dateInput, setDateInput] = useState("");

  function handleInput(e, canConvert = false) {
    const { value } = e?.target;
    if (canConvert) {
      const converted = convertToDate(value);
      setDateInput(converted);
      onValue(parseDateTime(converted));
    } else {
      setDateInput(value);
    }
  }

  function handleDateNav(val) {
    const date = parseDateTime(dateInput);
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + val);
    const converted = convertToDate(newDate);
    setDateInput(converted);
    onValue(parseDateTime(converted));
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => handleDateNav(-1)} className={"p-2"}>
        <ArrowLeft />
      </Button>
      <InputField
        className="mb-0 max-w-[130px]"
        inputClassName="text-center"
        onChange={(e) => handleInput(e)}
        onBlur={(e) => handleInput(e, true)}
        value={dateInput}
      />
      <Button onClick={() => handleDateNav(1)} className={"p-2"}>
        <ArrowRight />
      </Button>
    </div>
  );
}
