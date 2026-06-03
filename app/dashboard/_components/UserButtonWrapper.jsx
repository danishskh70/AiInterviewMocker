"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";

export function UserButtonWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <UserButton />;
}
