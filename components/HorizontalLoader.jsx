// components/HorizontalLoader.jsx
"use client";

export default function HorizontalLoader({ loading }) {
  if (!loading) return <div className="relative w-full h-[3px]"></div>;
  return (
    <div className="relative w-full h-[3px] overflow-hidden bg-amber-200 dark:bg-amber-900">
      <div className="absolute left-0 top-0 h-full w-1/3 bg-amber-500 dark:bg-amber-400 animate-loader" />
      <style jsx>{`
        @keyframes loader {
          0% {
            left: -30%;
            width: 30%;
          }
          50% {
            left: 35%;
            width: 30%;
          }
          100% {
            left: 100%;
            width: 30%;
          }
        }
        .animate-loader {
          animation: loader 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
