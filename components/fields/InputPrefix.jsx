import cn from "@/utils/cn";

export default function InputPrefix({ children, onClick }) {
  return (
    <div
      className={cn(
        "flex items-center px-2 text-gray-500 border-r-2 border-inherit",
        onClick ? "cursor-pointer hover:text-amber-500" : ""
      )}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}
