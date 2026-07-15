"use client";

import { useToastStore } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  default: Info,
  success: CheckCircle2,
  destructive: XCircle,
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.variant ?? "default"];
        return (
          <div
            key={t.id}
            className={cn(
              "animate-fade-in flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg",
              t.variant === "destructive" && "border-destructive/40",
              t.variant === "success" && "border-accent/40"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                t.variant === "destructive" ? "text-destructive" : t.variant === "success" ? "text-accent" : "text-muted-foreground"
              )}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="opacity-50 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
