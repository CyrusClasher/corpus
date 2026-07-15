import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LandingNav } from "@/components/landing/landing-nav";
import { Library, Search, Layers, Gauge } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="container flex flex-col items-center gap-6 py-24 text-center">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Layers className="h-3.5 w-3.5 text-accent" /> Built on a real
            inverted index — not a wrapper around grep
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Upload documents. Search them{" "}
            <span className="text-accent">instantly.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Corpus indexes every word in every document you upload, then answers
            keyword searches with a transparent, scored ranking — the same core
            idea behind every search engine, distilled to something you can read
            top-to-bottom.
          </p>
          <div className="flex gap-3">
            <Link
              // href="/api/auth/signin"
              href="/api/auth/signin/google?callbackUrl=/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-8 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Sign in with Google
            </Link>
            <a
              href="#features"
              className="inline-flex h-11 items-center justify-center rounded-md border border-input px-8 text-sm font-medium hover:bg-muted"
            >
              See how it works
            </a>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-border bg-card/40 py-20"
        >
          <div className="container grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={Layers}
              title="A real inverted index"
              description="Every uploaded document is tokenized and stored as word → document → frequency rows — the exact data structure every search engine is built on."
            />
            <FeatureCard
              icon={Search}
              title="Transparent ranking"
              description="Results are scored with a readable point system — title matches, body matches, frequency, and recency — no black-box ML."
            />
            <FeatureCard
              icon={Gauge}
              title="Millisecond search"
              description="Indexed lookups mean searching never re-scans your documents — queries resolve directly against the index."
            />
          </div>
        </section>

        {/* About */}
        <section id="about" className="container py-20">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="text-2xl font-semibold">Why this exists</h2>
            <p className="text-muted-foreground">
              Corpus is a small, complete demonstration of classical information
              retrieval: tokenization, inverted indexing, and scored ranking,
              wired into a real full-stack app with authentication, file
              uploads, and a Postgres database. No AI, no vector search, no
              black boxes — every result can be explained.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="container flex items-center justify-center gap-2">
          <Library className="h-4 w-4" /> Corpus — a document indexing &amp;
          search engine
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Layers;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
