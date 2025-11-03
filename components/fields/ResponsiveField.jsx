import cn from "@/utils/cn";

export default function ResponsiveField({ children, className = "" }) {
  return (
    <div
      className={cn("flex gap-x-2 *:flex-1 max-md:flex-col mb-0", className)}
    >
      {children}
    </div>
  );
}
