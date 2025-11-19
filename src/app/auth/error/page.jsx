"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");

  useEffect(() => {
    // When user clicks CANCEL on Google
    if (error === "access_denied" || error === "Callback") {
      router.replace("/"); // Redirect to homepage instead of 404
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Google Sign-in Cancelled</h1>
        <p className="text-gray-400">
          You cancelled the Google login process.
        </p>

        <button
          className="mt-6 px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
          onClick={() => router.push("/auth/signin")}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
