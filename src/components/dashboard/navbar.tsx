"use client";

import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardNavbar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="md:hidden font-semibold">Corpus</div>
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        {user?.image && (
          <img
            src={user.image}
            alt={user.name ?? "User avatar"}
            className="h-8 w-8 rounded-full border border-border"
          />
        )}
        <span className="hidden text-sm font-medium sm:inline">
          {user?.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
