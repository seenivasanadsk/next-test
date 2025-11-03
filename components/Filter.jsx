"use client";
import React, { useState } from "react";
import { Funnel, FunnelPlusIcon, FunnelX } from "lucide-react";
import Dialog from "./Dialog";
import CommonForm from "./CommonForm";
import SelectField from "./fields/SelectField";
import Button from "./Button";
import { useHotkeys } from "react-hotkeys-hook";
import DateTimeField from "./DateTimeField";
import ResponsiveField from "./fields/ResponsiveField";

export default function Filter({
  headers,
  filterable,
  updateParams,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const filterableHeaders = headers.filter(
    (h) => h.filterable && h.filterable !== "Off"
  );

  useHotkeys("alt+f", (e) => {
    e.preventDefault();
    setOpen(!open);
  });

  const trigger = (
    <Button
      onClick={() => setOpen(true)}
      size="sm"
      className={className}
      prefix={<Funnel />}
    >
      Filter
    </Button>
  );

  /** ✅ Fix: merge only if value is an object */
  const handleFilterChange = (field, value) => {
    setFormData((prev) => {
      const existing = prev[field];

      // If value is null → remove field
      if (value == null) {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      }

      // If it's an object (like {$gte, $lte}), merge keys safely
      if (typeof value === "object" && !Array.isArray(value)) {
        return {
          ...prev,
          [field]: { ...existing, ...value },
        };
      }

      // Otherwise (string, number, boolean), set directly
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  function applyFilter() {
    updateParams(formData);
  }

  const config = {
    action: applyFilter,
    cancelAction: () => setOpen(false),
    title: "Filter",
    description: "",
    bigSize: true,
    submitText: "Apply",
    extraFormButton: [
      <Button prefix={<FunnelX />} onClick={() => setFormData({})}>
        Clear Filter
      </Button>,
    ],
  };

  return (
    <Dialog state={open} trigger={trigger} onClose={() => setOpen(false)}>
      <CommonForm config={config}>
        {filterableHeaders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No filterable fields available.
          </p>
        ) : (
          filterableHeaders.map((header, index) => {
            const commonProps = {
              placeholder: header.title,
              value: formData[header.valuePath],
              onValue: (val) => handleFilterChange(header.valuePath, val),
            };

            switch (header.filterable) {
              case "Select": {
                const options = filterable[header.valuePath].map((item) => ({
                  title: item,
                  value: item,
                }));
                return (
                  <SelectField {...commonProps} key={index} options={options} />
                );
              }

              case "Date":
                return (
                  <ResponsiveField key={index}>
                    <DateTimeField {...commonProps} type="from" /> To{" "}
                    <DateTimeField {...commonProps} type="to" />
                  </ResponsiveField>
                );

              default:
                return null;
            }
          })
        )}
      </CommonForm>
    </Dialog>
  );
}
