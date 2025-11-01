"use client";
import React, { useState } from "react";
import { Funnel } from "lucide-react";
import Dialog from "./Dialog";
import CommonForm from "./CommonForm";
import _cn from "@/utils/cn";
import SelectField from "./fields/SelectField";
import Button from "./Button";
// import DateTimeFilterField from "./DateTimeFilterField";

export default function Filter({ headers, filterable, className }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const filterableHeaders = headers.filter(
    (h) => h.filterable && h.filterable !== "Off"
  );

  const trigger = (
    <Button onClick={() => setOpen(true)} size="sm" className={className}>
      <Funnel />
    </Button>
  );

  function handleFilterChange(field, value) {
    console.log(field, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const config = {
    cancelAction: () => setOpen(false),
    title: "Filter",
    description: "",
    bigSize: true,
    submitText: "Apply",
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
              case "Select":
                let options = filterable[header.valuePath].map((item) => ({
                  title: item,
                  value: item,
                }));
                return (
                  <SelectField {...commonProps} key={index} options={options} />
                );
              case "Date":
              // return <DateTimeFilterField {...commonProps} key={index} />;
              default:
                break;
            }
          })
        )}
      </CommonForm>
    </Dialog>
  );
}
