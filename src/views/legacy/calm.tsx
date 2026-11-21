"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { focus } from "@/views/theme/ui";

/**
 * Calm-era helpers, moved out of resources/Library.tsx in CL9b so the Resources page could be converted while the
 * pages that still use them (forms, report, performance, connect, news, newsroom, regulations) keep compiling.
 * Each later session drops its import; CL17 deletes this file once nothing imports it.
 */

/** The calm card: white, thin ring; on hover it lifts 4 px, gets a green ring and a soft green shadow. */
export const calmCard =
  "group relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]";
/** Large gold primary button. */
export const goldBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-semibold text-[#1A1206] shadow-[0_14px_30px_-18px_rgba(122,82,0,0.8)] transition hover:bg-[#FFE08F]";
/** Pill toggle (filters, years, letters): white with a green ring, solid dark green with gold text when on. */
export const pill = (on: boolean) =>
  cn(
    "inline-flex min-h-12 shrink-0 items-center justify-center rounded-full px-5 text-lg font-semibold transition duration-300",
    focus,
    on ? "bg-[#0A4A13] text-[#F4D27A] shadow-[0_10px_24px_-14px_rgba(10,74,19,0.8)]" : "bg-white text-[#14261A] ring-1 ring-black/15 hover:bg-[#0A4A13] hover:text-white hover:ring-[#0A4A13]",
  );

/** Dark-green icon tile with a gold icon that tips on card hover. */
export function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]", className)}>
      <Icon className="h-7 w-7" />
    </span>
  );
}

/** Mint bubble in a card corner that grows on hover. */
export const Bubble = () => <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />;
