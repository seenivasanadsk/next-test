"use client";

import { useNotification } from "@/context/NotificationProvider";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function TableDeleteButton({ id, deleteAction }) {
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotification();
  const router = useRouter();

  async function handleDelete() {
    startTransition(async () => {
      try {
        const response = await deleteAction(id);
        if (response && response.success) {
          addNotification("Deleted successfully", "success");
          router.refresh();
        }
      } catch (err) {
        addNotification("Failed to delete", "error");
        console.error(err);
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`inline-block cursor-pointer rounded-full p-1 ${
        isPending
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-amber-200 dark:hover:bg-amber-700"
      }`}
      title="Delete"
    >
      {isPending ? "⌛" : "❌"}
    </button>
  );
}
