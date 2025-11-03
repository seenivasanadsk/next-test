"use client";
import React, { useState, useEffect } from "react";
import InputField from "./fields/InputField";
import { Calendar, Clock } from "lucide-react";
import {
  formatDateObject,
  getCurrentDateTime,
  parseDateTime,
} from "@/utils/dateTime";

/**
 * DateTimeField — unified input for date + time.
 * Handles prefix clicks, blur parsing, and internally manages
 * `$gte` and `$lte` for "from" and "to" fields.
 */
export default function DateTimeField({ value = {}, onValue, type, ...props }) {
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [isTimeTouched, setIsTimeTouched] = useState(false);

  // Sync existing value ($gte or $lte)
  useEffect(() => {
    let rawVal =
      (type === "from" && value?.$gte) ||
      (type === "to" && value?.$lte) ||
      (value instanceof Date ? value : null);

    if (!rawVal) {
      setDateValue("");
      setTimeValue("");
      setIsTimeTouched(false);
      return;
    }

    const dateObj = rawVal instanceof Date ? rawVal : parseDateTime(rawVal);
    if (!dateObj || isNaN(dateObj)) return;

    const { dateString, timeString } = formatDateObject(dateObj);
    const isMidnight = dateObj.getHours() === 0 && dateObj.getMinutes() === 0;

    setDateValue(dateString);
    setTimeValue(isMidnight ? "" : timeString);
  }, [value, type]);

  /** 🔹 Emit formatted date/time based on type (from/to/normal) */
  const emitDateTime = (dateStr, timeStr, touched = isTimeTouched) => {
    const date = dateStr.trim();
    const time = timeStr.trim() || "00:00";

    if (!date) {
      onValue(null);
      return;
    }

    const parsed = parseDateTime(date, time);
    if (!parsed || isNaN(parsed)) return;

    const payload =
      type === "from"
        ? { $gte: parsed }
        : type === "to"
        ? { $lte: parsed }
        : parsed;

    onValue(payload);

    const { dateString, timeString } = formatDateObject(parsed);
    setDateValue(dateString);
    setTimeValue(touched ? timeString : "");
  };

  /** 🔹 Date prefix: sets today’s date (midnight) */
  const handleDatePrefixClick = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const { dateString } = formatDateObject(now);
    setDateValue(dateString);
    emitDateTime(dateString, timeValue);
  };

  /** 🔹 Time prefix: sets current time */
  const handleTimePrefixClick = () => {
    const { dateString: currentDate, timeString: currentTime } =
      getCurrentDateTime();
    const dateStr = dateValue.trim() || currentDate;
    setTimeValue(currentTime);
    setIsTimeTouched(true);
    emitDateTime(dateStr, currentTime, true);
  };

  return (
    <div className="flex gap-x-2 max-md:flex-col mb-0">
      <InputField
        label="Date"
        placeholder="e.g., 05-11-2025"
        prefix={<Calendar />}
        onPrefixClick={handleDatePrefixClick}
        value={dateValue}
        onValue={(val) => setDateValue(val)}
        onBlur={() => emitDateTime(dateValue, timeValue)}
        className="flex-3/5"
        {...props}
      />

      <InputField
        label="Time"
        placeholder="e.g., 2:30 PM"
        prefix={<Clock />}
        onPrefixClick={handleTimePrefixClick}
        value={timeValue}
        onValue={(val) => {
          setTimeValue(val);
          setIsTimeTouched(!!val.trim());
        }}
        onBlur={() => emitDateTime(dateValue, timeValue, !!timeValue.trim())}
        disabled={!dateValue.trim()}
        className="flex-2/5"
        {...props}
      />
    </div>
  );
}
