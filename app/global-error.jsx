"use client";

import React, { useState } from "react";
import Button from "@/components/Button";

export default function GlobalError({ error, reset }) {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    try {
      setLoading(true);
      reset?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full shadow-lg rounded-2xl p-8 text-center">
          <div className="mb-6 text-6xl">🚨</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            Sorry — an unexpected error occurred. You can try reloading the
            page.
          </p>

          {/* Error details toggle */}
          <details
            open={showDetails}
            onToggle={() => setShowDetails((prev) => !prev)}
            className="mb-6 p-3 rounded text-center"
          >
            <summary className="cursor-pointer select-none">
              {showDetails ? "Hide error details" : "Show error details"}
            </summary>
            <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap break-words">
              {String(error?.message ?? error ?? "Unknown error")}
            </pre>
          </details>

          {/* Buttons */}
          <div className="flex justify-center gap-3">
            <Button onClick={handleRetry} disabled={loading} variant="accent">
              {loading ? "Retrying..." : "Try again"}
            </Button>

            <Button href="/" variant="secondary">
              Go Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
