"use client";
import Button from "@/components/Button";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center w-full transition-colors duration-300">
      <div className="text-center px-6 py-12 max-w-md mx-auto">
        <div className="mb-8 text-6xl text-amber-500 dark:text-amber-400">
          ⚠️
        </div>
        <h1 className="text-5xl font-extrabold mb-4">404 Not Found</h1>
        <p className="text-xl mb-8">
          Oops! The page you are looking for does not exist.
        </p>
        <Button href="/" variant="accent" prefix={<Home />}>
          Return Home
        </Button>
      </div>
    </main>
  );
}
