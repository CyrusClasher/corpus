# Corpus

**A lightweight document indexing and search engine, built from scratch on a real inverted index.**

Corpus lets a user upload documents (PDF, TXT, Markdown), automatically extracts and tokenizes their text, builds a classic inverted index, and serves keyword search with a transparent, hand-written ranking algorithm — no Elasticsearch, no vector databases, no LLMs. It's built to be a portfolio project a single developer can explain line-by-line in a technical interview.

---

## Table of Contents

1. [Motivation & Learning Objectives](#motivation--learning-objectives)
2. [Key Features](#key-features)
3. [Architecture Overview](#architecture-overview)
4. [Technology Stack](#technology-stack)
5. [Folder Structure](#folder-structure)
6. [Database Schema](#database-schema)
7. [Authentication Flow](#authentication-flow)
8. [Document Indexing Pipeline](#document-indexing-pipeline)
9. [Search Algorithm](#search-algorithm)
10. [Inverted Index Explained](#inverted-index-explained)
11. [Ranking Algorithm](#ranking-algorithm)
12. [API Documentation](#api-documentation)
13. [Installation & Setup](#installation--setup)
14. [Environment Variables](#environment-variables)
15. [Prisma Migrations](#prisma-migrations)
16. [Running Locally](#running-locally)
17. [Deployment (Vercel + Neon)](#deployment-vercel--neon)
18. [Future Improvements](#future-improvements)
19. [Known Limitations](#known-limitations)
20. [Challenges Faced](#challenges-faced)
21. [What This Project Demonstrates](#what-this-project-demonstrates-for-recruiters)
22. [License & Credits](#license--credits)

---

## Motivation & Learning Objectives

Most portfolio "search" projects either call a third-party search API or wrap a `LIKE '%query%'` SQL clause. Neither teaches — or demonstrates — how search actually works. Corpus exists to show, in code simple enough to read in one sitting:

- Why search engines tokenize text instead of matching raw strings.
- Why an **inverted index** (word → documents) is exponentially faster to query than a forward index (document → words).
- How a simple, explainable scoring function can rank results usefully without machine learning.
- How to wire all of that into a secure, authenticated, full-stack product.

## Key Features

- Google OAuth login, protected dashboard routes, per-user data isolation
- Drag-and-drop upload for PDF / TXT / Markdown (20MB limit) with live pipeline progress
- Traditional text extraction (`pdf-parse` for PDFs, plain read for TXT, custom markdown-syntax stripper)
- A full preprocessing pipeline: lowercase → strip punctuation/special characters → normalize whitespace → remove stopwords → light stemming
- A genuine inverted index persisted in PostgreSQL (`Token` table: word → document → frequency)
- Keyword search with `<mark>`-tag highlighting and Google-style result cards
- A simple, fully transparent ranking algorithm (title match, body match, frequency bonus, recency bonus)
- Document viewer with in-document keyword highlighting
- Search history and a statistics dashboard (Recharts bar chart + stat cards)
- Dark mode, toasts, empty states, loading skeletons, confirmation dialogs

## Architecture Overview

```
┌─────────────┐      ┌──────────────────────┐      ┌───────────────┐
│   Browser   │◄────►│  Next.js App Router  │◄────►│  PostgreSQL   │
│  (React UI) │      │  Route Handlers (API)│      │  via Prisma   │
└─────────────┘      └──────────────────────┘      └───────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   Vercel Blob     │  (durable object storage,
                     │  (src/lib/storage)│   see src/lib/storage.ts)
                     └──────────────────┘
```

Corpus is a single Next.js application. Server Components fetch data directly via Prisma for pages that only read data (dashboard overview, statistics, document viewer); Client Components + `/api/*` route handlers are used where the page needs interactivity (upload progress, live search, pagination, deletion).

## Technology Stack

| Layer           | Choice                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Frontend        | Next.js 14 (App Router), TypeScript, React, Tailwind CSS, custom shadcn-style components, Lucide icons |
| Backend         | Next.js Route Handlers (TypeScript)                                                                    |
| Auth            | NextAuth.js + Google OAuth, JWT sessions                                                               |
| Database        | PostgreSQL + Prisma ORM                                                                                |
| Storage         | Vercel Blob (`@vercel/blob`) — object storage, works locally and in production                         |
| Text Extraction | `pdf-parse` (PDF), native read (TXT), custom stripper (Markdown)                                       |
| Charts          | Recharts                                                                                               |
| Validation      | Zod                                                                                                    |
| Deployment      | Vercel + Neon PostgreSQL                                                                               |

## Folder Structure

```
corpus/
├── prisma/
│   └── schema.prisma          # Users, Documents, Tokens (the index), SearchHistory
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── providers.tsx      # Session + theme providers
│   │   ├── api/               # REST route handlers
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   ├── search/route.ts
│   │   │   ├── documents/route.ts
│   │   │   ├── document/[id]/route.ts
│   │   │   ├── stats/route.ts
│   │   │   └── history/route.ts
│   │   └── dashboard/         # Protected app pages
│   │       ├── layout.tsx     # Sidebar + navbar + auth gate
│   │       ├── page.tsx       # Overview
│   │       ├── upload/page.tsx
│   │       ├── search/page.tsx
│   │       ├── documents/page.tsx
│   │       ├── documents/[id]/page.tsx
│   │       ├── history/page.tsx
│   │       └── stats/page.tsx
│   ├── components/
│   │   ├── ui/                # Button, Card, Input, Dialog, Badge, Skeleton, Toaster
│   │   ├── dashboard/         # Sidebar, Navbar, StatCard, UploadDropzone, SearchBar, etc.
│   │   ├── shared/             # ThemeToggle, EmptyState, ConfirmDialog
│   │   └── landing/           # Landing page nav
│   ├── lib/
│   │   ├── textCleaning.ts    # Preprocessing pipeline
│   │   ├── tokenizer.ts       # Tokenization + term-frequency counting
│   │   ├── stopwords.ts       # Stopword list
│   │   ├── textExtraction.ts  # PDF/TXT/MD extraction
│   │   ├── invertedIndex.ts   # Index construction + persistence
│   │   ├── search.ts          # Query pipeline (lookup, merge, snippet)
│   │   ├── ranking.ts         # Scoring algorithm
│   │   ├── highlight.ts       # <mark> highlighting (client-safe)
│   │   ├── auth.ts            # NextAuth config
│   │   ├── session.ts         # requireUserId() auth helper
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── storage.ts         # File storage adapter
│   │   ├── validation.ts      # Zod schemas
│   │   └── utils.ts           # cn(), formatters, ApiError
│   ├── types/                 # Shared TS types + NextAuth augmentation
│   ├── hooks/                 # useToastStore
│   └── middleware.ts          # Route protection for /dashboard/*
└── README.md
```

## Database Schema

```
User ──< Document ──< Token
  │
  └──< SearchHistory
```

- **User**: `id, name, email, image, createdAt`
- **Document**: `id, title, filename, path, fileType, fileSize, wordCount, content, uploadedAt, userId`
- **Token**: `id, word, frequency, documentId` — **this table is the inverted index.** Each row is one (word, document, frequency) fact. `@@index([word])` gives Postgres a B-tree it can binary-search, turning "find every document containing X" into a single indexed lookup instead of a full scan of every document's text.
- **SearchHistory**: `id, query, resultCount, elapsedMs, searchedAt, userId`

Foreign keys use `onDelete: Cascade`, so deleting a `Document` automatically removes its `Token` rows, and deleting a `User` removes their documents and search history — no manual cleanup code needed.

Additional indexes: `Document(userId, uploadedAt)` and `SearchHistory(userId, searchedAt)`, because both tables are almost always queried "mine, newest first" — indexing the actual access pattern, not just the primary/foreign keys, is what keeps those list pages fast as data grows.

## Authentication Flow

1. User clicks **Login** → NextAuth redirects to Google's OAuth consent screen.
2. Google redirects back with an auth code → NextAuth exchanges it, and the Prisma adapter upserts a `User` row.
3. NextAuth issues a JWT-backed session cookie containing the user's database id.
4. `middleware.ts` intercepts every request to `/dashboard/*` and redirects unauthenticated requests to `/`.
5. Every API route and server component calls `requireUserId()` (in `src/lib/session.ts`), which reads the id off the _server-verified_ session — never off anything the client sends — and scopes every Prisma query with `where: { userId }`. This is what actually enforces "users can only access their own documents," not just the route-level redirect.

## Document Indexing Pipeline

```
User Upload
    │
    ▼
Store File            (src/lib/storage.ts — uploaded to Vercel Blob, URL returned)
    │
    ▼
Extract Text           (src/lib/textExtraction.ts — pdf-parse / plain read / markdown strip)
    │
    ▼
Clean Text             (src/lib/textCleaning.ts — lowercase, strip punctuation/specials, normalize whitespace)
    │
    ▼
Tokenize                (src/lib/tokenizer.ts — split, drop stopwords, light stemming)
    │
    ▼
Generate Inverted Index (src/lib/invertedIndex.ts — build word→frequency HashMap)
    │
    ▼
Store Metadata          (Document row created in Postgres)
    │
    ▼
Save Token Frequencies   (Token rows: one per unique word)
    │
    ▼
Ready to Search
```

All of this runs inside a single `POST /api/upload` request; the frontend narrates each stage while it waits.

## Search Algorithm

```
Receive Query → Normalize → Tokenize → Lookup each word in the index
→ Merge document matches → Calculate relevance score → Sort → Return results
```

The query goes through the _exact same_ cleaning/tokenizing pipeline as documents at index time — this is what guarantees `"Cloud Computing!"` (a query) and `cloud`, `computing` (indexed tokens) line up. See `src/lib/search.ts` for the implementation, with each pipeline stage marked by a comment.

## Inverted Index Explained

A forward index maps **document → words it contains**. An inverted index flips that: **word → documents that contain it.**

```
Forward index                    Inverted index
doc1 → "amazon cloud service"    amazon  → [doc1]
doc2 → "cloud storage service"   cloud   → [doc1, doc2]
                                  service → [doc1, doc2]
                                  storage → [doc2]
```

**Why it's faster:** without an inverted index, "which documents mention cloud?" means reading every document's full text — O(total characters across the whole collection) per query. With the inverted index, the same question is one lookup on the key `"cloud"` — an O(1) hash lookup in memory, or an indexed B-tree lookup in Postgres (`@@index([word])` on the `Token` table) — that returns the exact match list directly. The cost of building the index is paid once at upload time; every search afterward is cheap. That trade — slightly slower writes for much faster reads — is the foundational idea behind every real search engine, from Postgres full-text search to Elasticsearch to Google.

## Ranking Algorithm

Deliberately simple and fully explainable — no TF-IDF, no BM25, no ML:

| Signal                          | Points                              |
| ------------------------------- | ----------------------------------- |
| Query word found in title       | +20 per word                        |
| Query word found in body        | +5 per word                         |
| Extra occurrences in body       | +1 per occurrence (after the first) |
| Uploaded within the last 7 days | +3 flat bonus                       |

Results are sorted by total score, descending. See `src/lib/ranking.ts` for the full implementation and a discussion of how TF-IDF and BM25 would refine this (see [Future Improvements](#future-improvements)).

## API Documentation

All routes require an authenticated session (enforced by `requireUserId()`); unauthenticated requests receive `401`.

### `POST /api/upload`

Uploads and indexes a document.

**Request:** `multipart/form-data` with a `file` field (PDF/TXT/MD, ≤20MB).

**Response `201`:**

```json
{
  "document": {
    "id": "clx...",
    "title": "quarterly-report",
    "fileType": "pdf",
    "fileSize": 182933,
    "wordCount": 1240,
    "uploadedAt": "2026-07-10T12:00:00.000Z"
  }
}
```

### `GET /api/search?q=cloud+computing&fileType=pdf`

Runs the search pipeline and logs the query to search history.

**Response `200`:**

```json
{
  "query": "cloud computing",
  "elapsedMs": 6,
  "results": [
    {
      "documentId": "clx...",
      "title": "quarterly-report",
      "fileType": "pdf",
      "uploadedAt": "2026-07-10T12:00:00.000Z",
      "wordCount": 1240,
      "score": 34,
      "snippet": "…our cloud computing spend grew…",
      "matchedWords": ["cloud", "computing"]
    }
  ]
}
```

### `GET /api/documents?page=1&pageSize=12`

Paginated list of the current user's documents.

### `GET /api/document/:id`

Fetch a single document (used by the viewer).

### `DELETE /api/document/:id`

Deletes the file, its `Token` rows, and the `Document` row.

**Response `200`:** `{ "success": true }`

### `GET /api/stats`

Dashboard statistics: total documents, total indexed words, total searches, average search time, uploads by file type, recent uploads.

### `GET /api/history`

The current user's last 20 searches.

All routes return `400` on validation failure (Zod), `401` if unauthenticated, `404` if a resource isn't found or doesn't belong to the user, and `500` with a generic message on unexpected errors (see `src/lib/utils.ts`'s `errorResponse`).

## Installation & Setup

```bash
git clone <your-repo-url> corpus
cd corpus
npm install
cp .env.example .env      # then fill in the values (see below)
npx prisma migrate dev --name init
npm run dev
```

## Environment Variables

| Variable                | Description                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string (Neon, Supabase, or local)                 |
| `NEXTAUTH_URL`          | Base URL of your app (e.g. `http://localhost:3000`)                     |
| `NEXTAUTH_SECRET`       | Random secret — generate with `openssl rand -base64 32`                 |
| `GOOGLE_CLIENT_ID`      | From Google Cloud Console → Credentials                                 |
| `GOOGLE_CLIENT_SECRET`  | From Google Cloud Console → Credentials                                 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token — create a store at vercel.com/dashboard/stores |
| `MAX_UPLOAD_SIZE_MB`    | Upload size limit in MB (default `20`)                                  |

## Prisma Migrations

```bash
npx prisma migrate dev --name <description>   # create + apply a migration in dev
npx prisma generate                            # regenerate the client after schema changes
npx prisma studio                              # browse your data in a GUI
```

## Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000`. You'll need a Google OAuth Client ID/Secret with `http://localhost:3000/api/auth/callback/google` set as an authorized redirect URI in Google Cloud Console.

## Deployment (Vercel + Neon)

1. Create a Neon PostgreSQL project and copy its connection string into `DATABASE_URL`.
2. Push the repo to GitHub and import it into Vercel.
3. Add all environment variables from `.env.example` in Vercel's Project Settings.
4. Set `NEXTAUTH_URL` to your production URL, and add `https://<your-domain>/api/auth/callback/google` as an authorized redirect URI in Google Cloud Console.
5. Vercel runs `prisma generate` automatically via the `postinstall` script; run `npx prisma migrate deploy` (locally, pointed at the production `DATABASE_URL`, or via a one-off Vercel build step) to apply migrations.
6. Create a Blob store at vercel.com/dashboard/stores, connect it to this project (this auto-populates `BLOB_READ_WRITE_TOKEN`), and you're done — uploads go straight to Blob storage, so nothing here depends on the function's local filesystem.

## Future Improvements

- **TF-IDF ranking**: weight matches by how rare a word is across the whole collection, so common-but-not-stopword words don't dominate scores the way they do under the current flat point system.
- **BM25**: refine TF-IDF further by saturating the frequency bonus (a word's 10th occurrence shouldn't count as much as its 2nd) and normalizing for document length.
- **Positional index + phrase search**: currently the index stores only frequency per (word, document); storing token positions would allow exact phrase queries (`"cloud computing"` as an adjacent pair, not just two independent word matches).
- **Real stemming**: swap the naive suffix-stripping in `textCleaning.ts` for a proper Porter/Snowball stemmer.
- **Full-text fuzzy matching**: typo tolerance (edit-distance-based) for queries.

## Known Limitations

- Ranking is intentionally simple (no TF-IDF/BM25/ML) — see Future Improvements.
- No positional index, so phrase search isn't distinguished from independent word matches.
- Average search time is measured server-side per request and averaged from stored history — not a highly precise perf benchmark.

## Challenges Faced

- Deciding how much of the "index" to keep in-memory vs. persisted: settled on building the word→frequency map in memory per upload (cheap, one document at a time) and persisting the result as normalized rows, so the index survives restarts and can be queried directly with SQL rather than rebuilt on every server boot.
- Keeping the ranking algorithm simple without making it feel arbitrary — solved by making every point value a named constant with a one-line justification in comments.
- Making sure query-time tokenization and index-time tokenization can never drift apart (both call the exact same `tokenize()`/`cleanText()` functions), since any divergence there silently breaks search.
- Local disk storage (`fs.writeFile` into `public/uploads`) works perfectly with `next dev` but fails on Vercel with `ENOENT: no such file or directory, mkdir './public'`, because Vercel's serverless functions run on a read-only filesystem outside `/tmp`. Fixed by moving storage behind `src/lib/storage.ts` to Vercel Blob (`@vercel/blob`), which meant only that one file changed — every route still just calls `saveFile()`/`deleteFile()` and doesn't know or care what's behind them.

## What This Project Demonstrates for Recruiters

- Understanding of classical information retrieval (tokenization, inverted indexes, ranking) — not just calling a search API.
- Practical full-stack skills: authentication, file uploads, REST API design, input validation, normalized relational schema design.
- Judgment about scope: deliberately avoiding unnecessary infrastructure (no microservices, no message queues, no Elasticsearch) in favor of a codebase one person can own and explain completely.
- Clean, commented, readable TypeScript across frontend and backend.

## License & Credits

MIT License. Built with Next.js, Prisma, NextAuth.js, Tailwind CSS, and Recharts.

<!-- # Corpus

**A lightweight document indexing and search engine, built from scratch on a real inverted index.**

Corpus lets a user upload documents (PDF, TXT, Markdown), automatically extracts and tokenizes their text, builds a classic inverted index, and serves keyword search with a transparent, hand-written ranking algorithm — no Elasticsearch, no vector databases, no LLMs. It's built to be a portfolio project a single developer can explain line-by-line in a technical interview.

---

## Table of Contents

1. [Motivation & Learning Objectives](#motivation--learning-objectives)
2. [Key Features](#key-features)
3. [Architecture Overview](#architecture-overview)
4. [Technology Stack](#technology-stack)
5. [Folder Structure](#folder-structure)
6. [Database Schema](#database-schema)
7. [Authentication Flow](#authentication-flow)
8. [Document Indexing Pipeline](#document-indexing-pipeline)
9. [Search Algorithm](#search-algorithm)
10. [Inverted Index Explained](#inverted-index-explained)
11. [Ranking Algorithm](#ranking-algorithm)
12. [API Documentation](#api-documentation)
13. [Installation & Setup](#installation--setup)
14. [Environment Variables](#environment-variables)
15. [Prisma Migrations](#prisma-migrations)
16. [Running Locally](#running-locally)
17. [Deployment (Vercel + Neon)](#deployment-vercel--neon)
18. [Future Improvements](#future-improvements)
19. [Known Limitations](#known-limitations)
20. [Challenges Faced](#challenges-faced)
21. [What This Project Demonstrates](#what-this-project-demonstrates-for-recruiters)
22. [License & Credits](#license--credits)

---

## Motivation & Learning Objectives

Most portfolio "search" projects either call a third-party search API or wrap a `LIKE '%query%'` SQL clause. Neither teaches — or demonstrates — how search actually works. Corpus exists to show, in code simple enough to read in one sitting:

- Why search engines tokenize text instead of matching raw strings.
- Why an **inverted index** (word → documents) is exponentially faster to query than a forward index (document → words).
- How a simple, explainable scoring function can rank results usefully without machine learning.
- How to wire all of that into a secure, authenticated, full-stack product.

## Key Features

- Google OAuth login, protected dashboard routes, per-user data isolation
- Drag-and-drop upload for PDF / TXT / Markdown (20MB limit) with live pipeline progress
- Traditional text extraction (`pdf-parse` for PDFs, plain read for TXT, custom markdown-syntax stripper)
- A full preprocessing pipeline: lowercase → strip punctuation/special characters → normalize whitespace → remove stopwords → light stemming
- A genuine inverted index persisted in PostgreSQL (`Token` table: word → document → frequency)
- Keyword search with `<mark>`-tag highlighting and Google-style result cards
- A simple, fully transparent ranking algorithm (title match, body match, frequency bonus, recency bonus)
- Document viewer with in-document keyword highlighting
- Search history and a statistics dashboard (Recharts bar chart + stat cards)
- Dark mode, toasts, empty states, loading skeletons, confirmation dialogs

## Architecture Overview

```
┌─────────────┐      ┌──────────────────────┐      ┌───────────────┐
│   Browser   │◄────►│  Next.js App Router  │◄────►│  PostgreSQL   │
│  (React UI) │      │  Route Handlers (API)│      │  via Prisma   │
└─────────────┘      └──────────────────────┘      └───────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Local file store │  (public/uploads,
                     │  (src/lib/storage)│   swappable for S3/R2)
                     └──────────────────┘
```

Corpus is a single Next.js application. Server Components fetch data directly via Prisma for pages that only read data (dashboard overview, statistics, document viewer); Client Components + `/api/*` route handlers are used where the page needs interactivity (upload progress, live search, pagination, deletion).

## Technology Stack

| Layer          | Choice                                             |
| -------------- | --------------------------------------------------- |
| Frontend       | Next.js 14 (App Router), TypeScript, React, Tailwind CSS, custom shadcn-style components, Lucide icons |
| Backend        | Next.js Route Handlers (TypeScript)                |
| Auth           | NextAuth.js + Google OAuth, JWT sessions            |
| Database       | PostgreSQL + Prisma ORM                              |
| Storage        | Local disk (`public/uploads`), abstracted for easy cloud swap |
| Text Extraction| `pdf-parse` (PDF), native read (TXT), custom stripper (Markdown) |
| Charts         | Recharts                                             |
| Validation     | Zod                                                  |
| Deployment     | Vercel + Neon PostgreSQL                             |

## Folder Structure

```
corpus/
├── prisma/
│   └── schema.prisma          # Users, Documents, Tokens (the index), SearchHistory
├── public/uploads/            # Local file storage (dev)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── providers.tsx      # Session + theme providers
│   │   ├── api/               # REST route handlers
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   ├── search/route.ts
│   │   │   ├── documents/route.ts
│   │   │   ├── document/[id]/route.ts
│   │   │   ├── stats/route.ts
│   │   │   └── history/route.ts
│   │   └── dashboard/         # Protected app pages
│   │       ├── layout.tsx     # Sidebar + navbar + auth gate
│   │       ├── page.tsx       # Overview
│   │       ├── upload/page.tsx
│   │       ├── search/page.tsx
│   │       ├── documents/page.tsx
│   │       ├── documents/[id]/page.tsx
│   │       ├── history/page.tsx
│   │       └── stats/page.tsx
│   ├── components/
│   │   ├── ui/                # Button, Card, Input, Dialog, Badge, Skeleton, Toaster
│   │   ├── dashboard/         # Sidebar, Navbar, StatCard, UploadDropzone, SearchBar, etc.
│   │   ├── shared/             # ThemeToggle, EmptyState, ConfirmDialog
│   │   └── landing/           # Landing page nav
│   ├── lib/
│   │   ├── textCleaning.ts    # Preprocessing pipeline
│   │   ├── tokenizer.ts       # Tokenization + term-frequency counting
│   │   ├── stopwords.ts       # Stopword list
│   │   ├── textExtraction.ts  # PDF/TXT/MD extraction
│   │   ├── invertedIndex.ts   # Index construction + persistence
│   │   ├── search.ts          # Query pipeline (lookup, merge, snippet)
│   │   ├── ranking.ts         # Scoring algorithm
│   │   ├── highlight.ts       # <mark> highlighting (client-safe)
│   │   ├── auth.ts            # NextAuth config
│   │   ├── session.ts         # requireUserId() auth helper
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── storage.ts         # File storage adapter
│   │   ├── validation.ts      # Zod schemas
│   │   └── utils.ts           # cn(), formatters, ApiError
│   ├── types/                 # Shared TS types + NextAuth augmentation
│   ├── hooks/                 # useToastStore
│   └── middleware.ts          # Route protection for /dashboard/*
└── README.md
```

## Database Schema

```
User ──< Document ──< Token
  │
  └──< SearchHistory
```

- **User**: `id, name, email, image, createdAt`
- **Document**: `id, title, filename, path, fileType, fileSize, wordCount, content, uploadedAt, userId`
- **Token**: `id, word, frequency, documentId` — **this table is the inverted index.** Each row is one (word, document, frequency) fact. `@@index([word])` gives Postgres a B-tree it can binary-search, turning "find every document containing X" into a single indexed lookup instead of a full scan of every document's text.
- **SearchHistory**: `id, query, resultCount, elapsedMs, searchedAt, userId`

Foreign keys use `onDelete: Cascade`, so deleting a `Document` automatically removes its `Token` rows, and deleting a `User` removes their documents and search history — no manual cleanup code needed.

Additional indexes: `Document(userId, uploadedAt)` and `SearchHistory(userId, searchedAt)`, because both tables are almost always queried "mine, newest first" — indexing the actual access pattern, not just the primary/foreign keys, is what keeps those list pages fast as data grows.

## Authentication Flow

1. User clicks **Login** → NextAuth redirects to Google's OAuth consent screen.
2. Google redirects back with an auth code → NextAuth exchanges it, and the Prisma adapter upserts a `User` row.
3. NextAuth issues a JWT-backed session cookie containing the user's database id.
4. `middleware.ts` intercepts every request to `/dashboard/*` and redirects unauthenticated requests to `/`.
5. Every API route and server component calls `requireUserId()` (in `src/lib/session.ts`), which reads the id off the *server-verified* session — never off anything the client sends — and scopes every Prisma query with `where: { userId }`. This is what actually enforces "users can only access their own documents," not just the route-level redirect.

## Document Indexing Pipeline

```
User Upload
    │
    ▼
Store File            (src/lib/storage.ts — saved under public/uploads)
    │
    ▼
Extract Text           (src/lib/textExtraction.ts — pdf-parse / plain read / markdown strip)
    │
    ▼
Clean Text             (src/lib/textCleaning.ts — lowercase, strip punctuation/specials, normalize whitespace)
    │
    ▼
Tokenize                (src/lib/tokenizer.ts — split, drop stopwords, light stemming)
    │
    ▼
Generate Inverted Index (src/lib/invertedIndex.ts — build word→frequency HashMap)
    │
    ▼
Store Metadata          (Document row created in Postgres)
    │
    ▼
Save Token Frequencies   (Token rows: one per unique word)
    │
    ▼
Ready to Search
```

All of this runs inside a single `POST /api/upload` request; the frontend narrates each stage while it waits.

## Search Algorithm

```
Receive Query → Normalize → Tokenize → Lookup each word in the index
→ Merge document matches → Calculate relevance score → Sort → Return results
```

The query goes through the *exact same* cleaning/tokenizing pipeline as documents at index time — this is what guarantees `"Cloud Computing!"` (a query) and `cloud`, `computing` (indexed tokens) line up. See `src/lib/search.ts` for the implementation, with each pipeline stage marked by a comment.

## Inverted Index Explained

A forward index maps **document → words it contains**. An inverted index flips that: **word → documents that contain it.**

```
Forward index                    Inverted index
doc1 → "amazon cloud service"    amazon  → [doc1]
doc2 → "cloud storage service"   cloud   → [doc1, doc2]
                                  service → [doc1, doc2]
                                  storage → [doc2]
```

**Why it's faster:** without an inverted index, "which documents mention cloud?" means reading every document's full text — O(total characters across the whole collection) per query. With the inverted index, the same question is one lookup on the key `"cloud"` — an O(1) hash lookup in memory, or an indexed B-tree lookup in Postgres (`@@index([word])` on the `Token` table) — that returns the exact match list directly. The cost of building the index is paid once at upload time; every search afterward is cheap. That trade — slightly slower writes for much faster reads — is the foundational idea behind every real search engine, from Postgres full-text search to Elasticsearch to Google.

## Ranking Algorithm

Deliberately simple and fully explainable — no TF-IDF, no BM25, no ML:

| Signal                        | Points                  |
| ------------------------------ | ----------------------- |
| Query word found in title       | +20 per word             |
| Query word found in body        | +5 per word               |
| Extra occurrences in body        | +1 per occurrence (after the first) |
| Uploaded within the last 7 days  | +3 flat bonus             |

Results are sorted by total score, descending. See `src/lib/ranking.ts` for the full implementation and a discussion of how TF-IDF and BM25 would refine this (see [Future Improvements](#future-improvements)).

## API Documentation

All routes require an authenticated session (enforced by `requireUserId()`); unauthenticated requests receive `401`.

### `POST /api/upload`
Uploads and indexes a document.

**Request:** `multipart/form-data` with a `file` field (PDF/TXT/MD, ≤20MB).

**Response `201`:**
```json
{
  "document": {
    "id": "clx...",
    "title": "quarterly-report",
    "fileType": "pdf",
    "fileSize": 182933,
    "wordCount": 1240,
    "uploadedAt": "2026-07-10T12:00:00.000Z"
  }
}
```

### `GET /api/search?q=cloud+computing&fileType=pdf`
Runs the search pipeline and logs the query to search history.

**Response `200`:**
```json
{
  "query": "cloud computing",
  "elapsedMs": 6,
  "results": [
    {
      "documentId": "clx...",
      "title": "quarterly-report",
      "fileType": "pdf",
      "uploadedAt": "2026-07-10T12:00:00.000Z",
      "wordCount": 1240,
      "score": 34,
      "snippet": "…our cloud computing spend grew…",
      "matchedWords": ["cloud", "computing"]
    }
  ]
}
```

### `GET /api/documents?page=1&pageSize=12`
Paginated list of the current user's documents.

### `GET /api/document/:id`
Fetch a single document (used by the viewer).

### `DELETE /api/document/:id`
Deletes the file, its `Token` rows, and the `Document` row.

**Response `200`:** `{ "success": true }`

### `GET /api/stats`
Dashboard statistics: total documents, total indexed words, total searches, average search time, uploads by file type, recent uploads.

### `GET /api/history`
The current user's last 20 searches.

All routes return `400` on validation failure (Zod), `401` if unauthenticated, `404` if a resource isn't found or doesn't belong to the user, and `500` with a generic message on unexpected errors (see `src/lib/utils.ts`'s `errorResponse`).

## Installation & Setup

```bash
git clone <your-repo-url> corpus
cd corpus
npm install
cp .env.example .env      # then fill in the values (see below)
npx prisma migrate dev --name init
npm run dev
```

## Environment Variables

| Variable              | Description                                              |
| ---------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string (Neon, Supabase, or local)     |
| `NEXTAUTH_URL`          | Base URL of your app (e.g. `http://localhost:3000`)         |
| `NEXTAUTH_SECRET`       | Random secret — generate with `openssl rand -base64 32`     |
| `GOOGLE_CLIENT_ID`      | From Google Cloud Console → Credentials                     |
| `GOOGLE_CLIENT_SECRET`  | From Google Cloud Console → Credentials                     |
| `UPLOAD_DIR`            | Local upload directory (default `./public/uploads`)          |
| `MAX_UPLOAD_SIZE_MB`    | Upload size limit in MB (default `20`)                       |

## Prisma Migrations

```bash
npx prisma migrate dev --name <description>   # create + apply a migration in dev
npx prisma generate                            # regenerate the client after schema changes
npx prisma studio                              # browse your data in a GUI
```

## Running Locally

```bash
npm run dev
```
Visit `http://localhost:3000`. You'll need a Google OAuth Client ID/Secret with `http://localhost:3000/api/auth/callback/google` set as an authorized redirect URI in Google Cloud Console.

## Deployment (Vercel + Neon)

1. Create a Neon PostgreSQL project and copy its connection string into `DATABASE_URL`.
2. Push the repo to GitHub and import it into Vercel.
3. Add all environment variables from `.env.example` in Vercel's Project Settings.
4. Set `NEXTAUTH_URL` to your production URL, and add `https://<your-domain>/api/auth/callback/google` as an authorized redirect URI in Google Cloud Console.
5. Vercel runs `prisma generate` automatically via the `postinstall` script; run `npx prisma migrate deploy` (locally, pointed at the production `DATABASE_URL`, or via a one-off Vercel build step) to apply migrations.
6. Note: Vercel's filesystem is ephemeral — local file storage (`src/lib/storage.ts`) works for a demo but uploaded files won't persist across deploys. Swap in S3/R2/Vercel Blob there for production use (see Known Limitations).

## Future Improvements

- **TF-IDF ranking**: weight matches by how rare a word is across the whole collection, so common-but-not-stopword words don't dominate scores the way they do under the current flat point system.
- **BM25**: refine TF-IDF further by saturating the frequency bonus (a word's 10th occurrence shouldn't count as much as its 2nd) and normalizing for document length.
- **Positional index + phrase search**: currently the index stores only frequency per (word, document); storing token positions would allow exact phrase queries (`"cloud computing"` as an adjacent pair, not just two independent word matches).
- **Real stemming**: swap the naive suffix-stripping in `textCleaning.ts` for a proper Porter/Snowball stemmer.
- **Cloud file storage**: swap `src/lib/storage.ts`'s local disk calls for S3/R2/Vercel Blob for durability on serverless deploys.
- **Full-text fuzzy matching**: typo tolerance (edit-distance-based) for queries.

## Known Limitations

- File storage is local disk by default — not durable on serverless platforms like Vercel between deploys.
- Ranking is intentionally simple (no TF-IDF/BM25/ML) — see Future Improvements.
- No positional index, so phrase search isn't distinguished from independent word matches.
- Average search time is measured server-side per request and averaged from stored history — not a highly precise perf benchmark.

## Challenges Faced

- Deciding how much of the "index" to keep in-memory vs. persisted: settled on building the word→frequency map in memory per upload (cheap, one document at a time) and persisting the result as normalized rows, so the index survives restarts and can be queried directly with SQL rather than rebuilt on every server boot.
- Keeping the ranking algorithm simple without making it feel arbitrary — solved by making every point value a named constant with a one-line justification in comments.
- Making sure query-time tokenization and index-time tokenization can never drift apart (both call the exact same `tokenize()`/`cleanText()` functions), since any divergence there silently breaks search.

## What This Project Demonstrates for Recruiters

- Understanding of classical information retrieval (tokenization, inverted indexes, ranking) — not just calling a search API.
- Practical full-stack skills: authentication, file uploads, REST API design, input validation, normalized relational schema design.
- Judgment about scope: deliberately avoiding unnecessary infrastructure (no microservices, no message queues, no Elasticsearch) in favor of a codebase one person can own and explain completely.
- Clean, commented, readable TypeScript across frontend and backend.

## License & Credits

MIT License. Built with Next.js, Prisma, NextAuth.js, Tailwind CSS, and Recharts. -->
