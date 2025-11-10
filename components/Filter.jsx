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

export default function Filter({ className }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useHotkeys("alt+f", (e) => {
    e.preventDefault();
    setOpen(!open);
  });

  const trigger = (
    <Button size="sm" prefix={<Funnel />} title="(Alt+F or 7) Filter Records">
      Filter
    </Button>
  );

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
      <CommonForm config={config}></CommonForm>
    </Dialog>
  );
}
