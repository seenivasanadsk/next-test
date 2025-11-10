"use client";

import cn from "@/utils/cn";
import { useState, useRef, useEffect } from "react";
import InputPrefix from "./InputPrefix";
import InputSuffix from "./InputSuffix";
import stringCase from "@/utils/stringCase";

export default function SelectField({
  value,
  options = [],
  onSearch,
  onValue,
  onCreateValue,
  prefix,
  onPrefixClick,
  suffix,
  onSuffixClick,
  optionLabel = "title",
  optionValue = "value",
  ...props
}) {
  /* -------------------- State -------------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const optionRefs = useRef([]); // store refs for options

  /* -------------------- Derived Data -------------------- */
  const filteredOptions = options.length
    ? options.filter((option) => {
        return stringCase
          .lower(option[optionLabel])
          .startsWith(stringCase.lower(search));
      })
    : [];

  /* -------------------- Helpers -------------------- */
  const commitSelection = (value) => {
    setSearch(
      options.find((op) => op[optionValue] === value)?.[optionLabel] || ""
    );
    setIsOpen(false);
    onValue?.(value);
  };

  const handleAddNew = async () => {
    if (!onCreateValue) return;
    setLoading(true);
    await onCreateValue(search);
    setLoading(false);
  };

  /* -------------------- Handlers -------------------- */
  const handleChange = (e) => {
    const value = stringCase.smartTitle(e.target.value);
    setSearch(value);
    onSearch?.(value);

    if (value) {
      setIsOpen(true);
      setHighlightIndex(0);
    } else {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightIndex]) {
          commitSelection(filteredOptions[highlightIndex][optionValue]);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) =>
          i < filteredOptions.length - 1 ? i + 1 : Math.max(i, 0)
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => (i > 0 ? i - 1 : 0));
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleBlur = () => {
    setIsOpen(false);
    if (filteredOptions[highlightIndex]) {
      commitSelection(filteredOptions[highlightIndex][optionValue]);
    }
    if (!search) {
      commitSelection("");
    }
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (highlightIndex >= 0 && optionRefs.current[highlightIndex]) {
      optionRefs.current[highlightIndex].scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightIndex]);

  useEffect(() => {
    setSearch(
      options.find((op) => op[optionValue] === value)?.[optionLabel] || ""
    );
  }, [value]);

  /* -------------------- Render -------------------- */
  return (
    <div className="relative mb-3">
      <div
        className={cn(
          "border-2 border-gray-400 focus-within:border-amber-500 flex",
          isOpen ? "rounded-t-md" : "rounded-md"
        )}
      >
        {/* Input Field */}
        {prefix && <InputPrefix onClick={onPrefixClick}>{prefix}</InputPrefix>}
        <input
          type="text"
          value={search}
          className="outline-none w-full px-2 py-1 placeholder-gray-500 focus:placeholder-amber-800 focus:dark:placeholder-amber-200"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          {...props}
        />
        {suffix && <InputSuffix onClick={onSuffixClick}>{suffix}</InputSuffix>}

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute left-0 top-full z-10 w-full max-h-60 overflow-y-auto rounded-b-md border-2 border-t-0 border-amber-500 bg-white dark:bg-gray-800 shadow-xl">
            {/* Options */}
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                ref={(el) => (optionRefs.current[index] = el)}
                className={cn(
                  `cursor-pointer px-2 py-1 hover:bg-amber-200 hover:text-amber-800 dark:hover:bg-amber-800 dark:hover:text-amber-100`,
                  highlightIndex === index && "bg-amber-100 text-amber-900"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitSelection(option[optionValue]);
                  setHighlightIndex(index);
                }}
              >
                {option[optionLabel]}
              </div>
            ))}

            {/* Empty State */}
            {filteredOptions.length === 0 && (
              <div
                className="flex cursor-pointer items-center px-2 py-1 text-gray-400"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAddNew();
                }}
              >
                {onCreateValue ? (
                  loading ? (
                    <>
                      <span className="size-5 animate-spin rounded-full border-2 border-t-amber-500"></span>
                      <span className="ml-2">Creating {search}...</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex size-5 items-center justify-center rounded-full border-2">
                        +
                      </span>
                      <span className="ml-2">Add </span>
                      <span className="ml-1 text-green-600">{search}</span>
                    </>
                  )
                ) : (
                  <span>No data found</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
