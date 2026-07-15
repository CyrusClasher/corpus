import Link from "next/link";
import { Library } from "lucide-react";

export function LandingNav() {
  return (
    <header className="border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Library className="h-5 w-5 text-accent" />
          Corpus
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#about" className="hover:text-foreground">About</a>
        </nav>
        <Link
          href="/api/auth/signin"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
