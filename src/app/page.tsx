"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (you can implement proper auth logic here)
    const isLoggedIn = localStorage.getItem("bitsave-logged-in");

    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/landing");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Bitsave...</p>
      </div>
    </div>
  );
}
