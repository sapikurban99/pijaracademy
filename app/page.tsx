"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050508]">
      <div className="text-gray-400 text-sm font-medium animate-pulse select-none">
        Redirecting to portal...
      </div>
    </div>
  );
}

