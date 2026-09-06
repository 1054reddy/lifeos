"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getAccessToken } from "@/lib/api";

export function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (pathname === "/login") {
      setIsCheckingAuth(false);
      return;
    }

    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsCheckingAuth(false);
  }, [pathname, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading LifeOS...
        </p>
      </div>
    );
  }

  return children;
}
