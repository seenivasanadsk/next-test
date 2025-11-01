export default function Switch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors min-w-12 ml-5 ${
        enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-500"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
