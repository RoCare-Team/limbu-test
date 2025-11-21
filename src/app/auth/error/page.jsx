"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>

      <p className="mt-4 text-lg">
        Google Login failed: <strong>{error}</strong>
      </p>

      <a
        href="/auth/signin"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Try Again
      </a>
    </div>
  );
}
