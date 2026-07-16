import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LandingNav } from "@/components/landing/landing-nav";
import { Reveal } from "@/components/landing/reveal";
import { Library, Search, Layers, Gauge, ArrowRight } from "lucide-react";

const DEMO_SENTENCE = "Amazon develops cloud computing services.";
const DEMO_TOKENS = [
  { word: "amazon", tab: "gold" },
  { word: "develops", tab: "teal" },
  { word: "cloud", tab: "coral" },
  { word: "computing", tab: "gold" },
  { word: "service", tab: "teal" },
] as const;

const TAB_CLASS: Record<string, string> = {
  gold: "bg-accent/20 text-accent-foreground border-accent/40",
  teal: "bg-tab-teal/15 text-tab-teal border-tab-teal/30",
  coral: "bg-tab-coral/15 text-tab-coral border-tab-coral/30",
};

const FEATURES = [
  {
    icon: Layers,
    tab: "gold" as const,
    title: "A real inverted index",
    description:
      "Every document you upload gets tokenized and stored as word → document → frequency rows — the exact structure behind every search engine you've ever used, just small enough to read in an afternoon.",
  },
  {
    icon: Search,
    tab: "teal" as const,
    title: "Scoring you can actually explain",
    description:
      'Title match, body match, frequency, recency — four rules, four point values, zero mystery. Say goodbye to "the algorithm decided."',
  },
  {
    icon: Gauge,
    tab: "coral" as const,
    title: "Search that doesn't skim",
    description:
      "No re-reading your documents on every query. Search hits the index directly, so results come back in milliseconds, not scroll-bars.",
  },
];

const PIPELINE_STEPS = [
  { label: "Receive query", detail: '"cloud computing" comes in' },
  { label: "Tokenize", detail: '→ ["cloud", "computing"]' },
  {
    label: "Look up the index",
    detail: "one lookup per word, not per document",
  },
  { label: "Score & sort", detail: "title, body, frequency, recency" },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="container flex flex-col items-center gap-6 py-24 text-center">
          <Reveal className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Layers className="h-3.5 w-3.5 text-accent" />
            No AI. No vector database. Just a really good HashMap.
          </Reveal>

          <Reveal delayMs={80}>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Upload a document.
              <br />
              We'll <mark>memorize</mark> every word.
            </h1>
          </Reveal>

          <Reveal delayMs={160} className="max-w-xl">
            <p className="text-lg text-muted-foreground">
              Corpus reads what you upload, builds a genuine inverted index
              behind the scenes, and hands back ranked results before you finish
              blinking — tokens, HashMaps, and a scoring formula you could grade
              like homework.
            </p>
          </Reveal>

          <Reveal delayMs={240} className="flex gap-3">
            <Link
              href="/api/auth/signin"
              className="glow-accent-hover inline-flex h-11 items-center justify-center rounded-md bg-accent px-8 text-sm font-medium text-accent-foreground"
            >
              Sign in with Google
            </Link>
            <a
              href="#features"
              className="inline-flex h-11 items-center justify-center rounded-md border border-input px-8 text-sm font-medium transition-colors hover:bg-muted"
            >
              See how it works
            </a>
          </Reveal>

          {/* Signature element: the tokenization pipeline, shown live, since
              that's the single idea this whole product is a demo of. */}
          <Reveal delayMs={320} className="mt-6 w-full max-w-xl">
            <div className="glow-accent-hover rounded-lg border border-border bg-card p-6 text-left shadow-sm">
              <p className="mb-3 font-mono text-sm text-muted-foreground">
                "{DEMO_SENTENCE}"
              </p>
              <div className="mb-3 flex justify-center">
                <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {DEMO_TOKENS.map((t) => (
                  <span
                    key={t.word}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs ${TAB_CLASS[t.tab]}`}
                  >
                    {t.word}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                lowercased · punctuation stripped · stopwords dropped ·
                tokenized
              </p>
            </div>
          </Reveal>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-border bg-card/40 py-20"
        >
          <div className="container">
            <Reveal className="mx-auto mb-12 max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Built like a library, not a black box
              </h2>
              <p className="mt-2 text-muted-foreground">
                Three ideas do all the work. Here's each one, in plain terms.
              </p>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delayMs={i * 100}>
                  <FeatureCard {...f} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How search actually works — the pipeline, styled like connected index cards */}
        <section className="py-20">
          <div className="container">
            <Reveal className="mx-auto mb-12 max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                What happens when you hit search
              </h2>
              <p className="mt-2 text-muted-foreground">
                Four steps. No step is a secret.
              </p>
            </Reveal>

            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-4">
              {PIPELINE_STEPS.map((step, i) => (
                <Reveal key={step.label} delayMs={i * 90} className="relative">
                  <div className="glow-accent-hover h-full rounded-lg border border-border bg-card p-4 text-center">
                    <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground sm:block" />
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-t border-border py-20">
          <div className="container">
            <Reveal className="mx-auto max-w-2xl space-y-4 text-center">
              <h2 className="text-2xl font-semibold">
                Why build a search engine from scratch?
              </h2>
              <p className="text-muted-foreground">
                Because "it calls an API" isn't an answer you can defend in an
                interview. Corpus is small enough to hold in your head end to
                end: tokenization, inverted indexing, and scored ranking, wired
                into a real app with authentication, file uploads, and a
                Postgres database that remembers everything. No AI, no vector
                search, no black boxes — every result comes with a reason.
              </p>
            </Reveal>
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
  tab,
  title,
  description,
}: {
  icon: typeof Layers;
  tab: "gold" | "teal" | "coral";
  title: string;
  description: string;
}) {
  const tabBg =
    tab === "gold"
      ? "bg-accent"
      : tab === "teal"
        ? "bg-tab-teal"
        : "bg-tab-coral";
  const iconBg =
    tab === "gold"
      ? "bg-accent/15 text-accent-foreground"
      : tab === "teal"
        ? "bg-tab-teal/15 text-tab-teal"
        : "bg-tab-coral/15 text-tab-coral";

  return (
    <div className="glow-accent-hover group relative h-full overflow-hidden rounded-lg border border-border bg-card p-6">
      {/* The "index tab" — a nod to the colored guide tabs on real library
          catalog cards, echoed here as a literal tab at the top of the card. */}
      <div
        className={`absolute left-6 top-0 h-1.5 w-10 rounded-b-full ${tabBg}`}
      />
      <div
        className={`mb-4 mt-2 flex h-10 w-10 items-center justify-center rounded-md ${iconBg}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// import Link from "next/link";
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import { authOptions } from "@/lib/auth";
// import { LandingNav } from "@/components/landing/landing-nav";
// import { Library, Search, Layers, Gauge } from "lucide-react";

// export default async function LandingPage() {
//   const session = await getServerSession(authOptions);
//   if (session) redirect("/dashboard");

//   return (
//     <div className="flex min-h-screen flex-col">
//       <LandingNav />

//       <main className="flex-1">
//         {/* Hero */}
//         <section className="container flex flex-col items-center gap-6 py-24 text-center">
//           <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
//             <Layers className="h-3.5 w-3.5 text-accent" /> Built on a real
//             inverted index — not a wrapper around grep
//           </div>
//           <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
//             Upload documents. Search them{" "}
//             <span className="text-accent">instantly.</span>
//           </h1>
//           <p className="max-w-xl text-lg text-muted-foreground">
//             Corpus indexes every word in every document you upload, then answers
//             keyword searches with a transparent, scored ranking — the same core
//             idea behind every search engine, distilled to something you can read
//             top-to-bottom.
//           </p>
//           <div className="flex gap-3">
//             <Link
//               // href="/api/auth/signin"
//               href="/api/auth/signin/google?callbackUrl=/dashboard"
//               className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-8 text-sm font-medium text-accent-foreground hover:opacity-90"
//             >
//               Sign in with Google
//             </Link>
//             <a
//               href="#features"
//               className="inline-flex h-11 items-center justify-center rounded-md border border-input px-8 text-sm font-medium hover:bg-muted"
//             >
//               See how it works
//             </a>
//           </div>
//         </section>

//         {/* Features */}
//         <section
//           id="features"
//           className="border-t border-border bg-card/40 py-20"
//         >
//           <div className="container grid gap-6 sm:grid-cols-3">
//             <FeatureCard
//               icon={Layers}
//               title="A real inverted index"
//               description="Every uploaded document is tokenized and stored as word → document → frequency rows — the exact data structure every search engine is built on."
//             />
//             <FeatureCard
//               icon={Search}
//               title="Transparent ranking"
//               description="Results are scored with a readable point system — title matches, body matches, frequency, and recency — no black-box ML."
//             />
//             <FeatureCard
//               icon={Gauge}
//               title="Millisecond search"
//               description="Indexed lookups mean searching never re-scans your documents — queries resolve directly against the index."
//             />
//           </div>
//         </section>

//         {/* About */}
//         <section id="about" className="container py-20">
//           <div className="mx-auto max-w-2xl space-y-4 text-center">
//             <h2 className="text-2xl font-semibold">Why this exists</h2>
//             <p className="text-muted-foreground">
//               Corpus is a small, complete demonstration of classical information
//               retrieval: tokenization, inverted indexing, and scored ranking,
//               wired into a real full-stack app with authentication, file
//               uploads, and a Postgres database. No AI, no vector search, no
//               black boxes — every result can be explained.
//             </p>
//           </div>
//         </section>
//       </main>

//       <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
//         <div className="container flex items-center justify-center gap-2">
//           <Library className="h-4 w-4" /> Corpus — a document indexing &amp;
//           search engine
//         </div>
//       </footer>
//     </div>
//   );
// }

// function FeatureCard({
//   icon: Icon,
//   title,
//   description,
// }: {
//   icon: typeof Layers;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="rounded-lg border border-border bg-card p-6">
//       <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
//         <Icon className="h-5 w-5 text-accent" />
//       </div>
//       <h3 className="mb-2 font-semibold">{title}</h3>
//       <p className="text-sm text-muted-foreground">{description}</p>
//     </div>
//   );
// }
