import InputPrefix from "./InputPrefix";
import InputSuffix from "./InputSuffix";
import _cn from "@/utils/cn";

export default function InputField({
  error = false,
  type = "text",
  placeholder,
  required,
  value,
  onValue,
  prefix,
  suffix,
  onPrefixClick,
  onSuffixClick,
  className,
  ...props
}) {
  return (
    <div
      className={_cn(
        "mb-3 border-2 border-gray-400 focus-within:border-amber-500 rounded-md flex",
        error && "border-red-500 focus-within:border-red-500",
        className
      )}
    >
      {prefix && <InputPrefix onClick={onPrefixClick}>{prefix}</InputPrefix>}
      <input
        className="outline-none w-full px-2 py-1"
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
