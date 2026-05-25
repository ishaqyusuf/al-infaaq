"use client";

import { Button } from "@al-infaaq/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button disabled={isPending} onClick={handleSignOut} type="button">
      <LogOut aria-hidden="true" className="size-4" />
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
