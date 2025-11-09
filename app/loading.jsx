"use client";

import { LoaderCircle } from "lucide-react";

export default function LoadingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center w-full">
      <div className="text-center px-6 py-12 max-w-md mx-auto">
        {/* Loading Icon */}
        <div className="mb-8">
          <LoaderCircle
            size={60}
            className="animate-spin text-amber-500 inline-block"
          />
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-extrabold mb-4">Loading...</h1>

        {/* Message */}
        <p className="text-xl mb-8">Please wait while we load your content.</p>
      </div>
    </main>
  );
}
