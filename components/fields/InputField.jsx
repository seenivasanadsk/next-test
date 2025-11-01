import InputPrefix from "./InputPrefix";
import InputSuffix from "./InputSuffix";
import cn from "@/utils/cn";

export default function InputField({
  error = false,
  type = "text",
  placeholder,
  required,
  value,
  onValue,
  prefix,
  suffix,
  disabled,
  onPrefixClick,
  onSuffixClick,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "mb-3 border-2 border-gray-400 focus-within:border-amber-500 rounded-md flex overflow-hidden",
        error && "border-red-500 focus-within:border-red-500",
        disabled && "bg-gray-200 dark:bg-gray-600",
        className
      )}
    >
      {prefix && <InputPrefix onClick={onPrefixClick}>{prefix}</InputPrefix>}
      <input
        className="outline-none w-full px-2 py-1 placeholder-gray-500 focus:placeholder-amber-800 focus:dark:placeholder-amber-200"
        disabled={disabled}
        readOnly={disabled}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValue && onValue(e.target.value)}
        {...props}
      />
      {suffix && <InputSuffix onClick={onSuffixClick}>{suffix}</InputSuffix>}
    </div>
  );
}
