"use client";

import { create } from "zustand";

/**
 * A minimal toast store (no external toast library — just a tiny Zustand
 * store + the Toaster component that renders whatever's in it). Kept
 * simple on purpose: this project's complexity budget is spent on the
 * search engine, not notification infrastructure.
 */
export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

interface ToastState {
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  toast: (t) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...t, id }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((x) => x.id !== id) })), 4000);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (t: Omit<ToastItem, "id">) => useToastStore.getState().toast(t);
