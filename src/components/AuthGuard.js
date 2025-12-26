"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userId = localStorage.getItem("userId"); // For normal user
    const role = localStorage.getItem("role"); // For admin

    // ✅ Public routes that don’t need login
    const publicRoutes = [
      "/",
      "/login",
      "/adminLogin",
      "/about",
      "/contact",
      "/privacy-policy",
      "/franchise-opportunities",
      "/cancellation-policy",
      "/terms-and-conditions",
      "/refund-policy",
    ];

    const isPublicRoute = publicRoutes.includes(pathname);
    const isAdminRoute = pathname.startsWith("/admin");

    // ⭐ NEW: Allow all /reviews/* URLs
    const isReviewRoute = pathname.startsWith("/reviews");

    setTimeout(() => {
      // 👉 Allow all reviews pages without auth
      if (isReviewRoute) {
        setIsChecking(false);
        return;
      }

      // 👉 Admin routes protection
      if (isAdminRoute) {
        if (role !== "admin") {
          router.replace("/adminLogin");
          setIsChecking(false);
          return;
        }
        setIsChecking(false);
        return;
      }

      // 👉 Private user routes
      if (!userId && !isPublicRoute && role !== "admin") {
        router.replace("/");
        setIsChecking(false);
        return;
      }

      // 👉 If user logged in and tries to open /login → redirect to dashboard
      if (userId && pathname === "/login") {
        router.replace("/dashboard");
        setIsChecking(false);
        return;
      }

      // 👉 Admin logged in but tries to open /adminLogin → redirect
      if (role === "admin" && pathname === "/adminLogin") {
        router.replace("/admin/dashboard");
        setIsChecking(false);
        return;
      }

      // Default allow
      setIsChecking(false);
    }, 100);
  }, [pathname, router]);

  if (isChecking) return null;

  return <>{children}</>;
}
