"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { highlightText } from "@/lib/highlight";
import { Search } from "lucide-react";

export function DocumentViewerSearch({ content }: { content: string }) {
  const [term, setTerm] = useState("");
  const words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search within this document…"
            className="pl-9"
          />
        </div>
        <div
          className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightText(content, words) }}
        />
      </CardContent>
    </Card>
  );
}
