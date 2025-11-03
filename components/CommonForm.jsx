"use client";
import cn from "@/utils/cn";
import React from "react";
import Button from "./Button";
import { ArrowLeft, CircleCheck, CirclePlus } from "lucide-react";

export default function CommonForm({ children, config: parentConfig }) {
  const config = {
    title: "New Form",
    description: "This is some description.",
    isEdit: false,
    loading: false,
    action: () => {},
    submitText: "",
    submitPrefix: null,
    cancel: "",
    bigSize: false,
    extraFormButton: [],
    canEnableSave: true,
    cancelAction: null,
    ...parentConfig,
  };

  return (
    <form
      className={cn(
        config.bigSize ? "max-w-4xl" : "max-w-md",
        "w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden h-fit"
      )}
      onSubmit={(e) => {
        e.preventDefault();
        config.action(e);
      }}
    >
      {/* Header */}
      <div className="bg-amber-400 dark:bg-amber-800 p-6 border-b-2 border-amber-600 dark:border-amber-400">
        <h1 className="text-2xl font-bold">{config.title}</h1>
        {config.description && <p className="mt-1">{config.description}</p>}
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">{children}</div>

      {/* Footer */}
      <div className="px-6 py-4 border-amber-600 dark:border-amber-400 border-t-2 flex justify-between items-center">
        {/* Left side: extra buttons */}
        <div className="flex gap-3">
          {config.extraFormButton.map((Btn, index) => (
            <React.Fragment key={index}>{Btn}</React.Fragment>
          ))}
        </div>

        {/* Right side: fixed buttons */}
        <div className="flex gap-3">
          <Button
            loading={config.loading}
            disabled={!config.canEnableSave}
            type="submit"
            prefix={
              config.submitPrefix ||
              (config.isEdit ? <CircleCheck /> : <CirclePlus />)
            }
          >
            {config.submitText || (config.isEdit ? "Update" : "Create")}
          </Button>
          <Button
            variant="secondary"
            href={config.cancel}
            onClick={config.cancelAction}
            prefix={<ArrowLeft />}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
