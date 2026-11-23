"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { focus } from "@/views/theme/ui";

/**
 * The app preview's design tokens for the classic theme. `screens.tsx` and `Phone.tsx` are the same file in every
 * theme and read all their colours, radii and flourishes from here, so a theme restyles the app by editing this file.
 *
 * Classic "national portal" look, scaled to a phone: white app on soft #F4F7F2 panels, rounded-3xl cards with a gray
 * border, mint icon tiles that fill green on hover, gold #CB9615 buttons (rounded-xl), a photographic header with a
 * dark shade under the words, status notices with a coloured bar down the left edge, and section titles with a green dot.
 */

export const sk = {
  /* Type and text colours */
  ink: "text-[#0A2E10]",
  accent: "text-[#117F21]",
  eyebrow: "text-[#7A5200]",
  check: "text-[#117F21]",
  /* Surfaces */
  appBg: "bg-[#F4F7F2]",
  muted: "bg-[#F7FAF6]",
  softColors: "bg-[#E8F5E9] text-[#117F21]",
  hoverSoft: "hover:bg-[#F7FAF6]",
  card: "rounded-3xl border border-gray-200/80 bg-white",
  cardHover: "transition duration-300 hover:-translate-y-0.5 hover:border-[#14892A]/30 hover:shadow-[0_18px_36px_-22px_rgba(16,93,29,0.45)]",
  cardOn: "border-[#117F21] ring-1 ring-[#117F21]",
  tile: "flex shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#117F21] transition duration-300",
  tileHover: "group-hover:bg-[#117F21] group-hover:text-white",
  bar: "relative border-b border-gray-200 bg-white after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#CB9615] after:to-transparent",
  barTitle: "font-bold text-[#0A2E10]",
  barMuted: "text-gray-600",
  barBack: "text-[#117F21] hover:bg-[#F7FAF6]",
  toast: "bg-[#04240A] text-white ring-1 ring-[#CB9615]/50",
  composer: "border-t border-gray-200 bg-white",
  /* Controls */
  goldBtn: cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#CB9615] px-4 text-[15px] font-semibold text-[#1A1206] shadow-[0_12px_24px_-14px_rgba(203,150,21,0.9)] transition hover:bg-[#E0AA22]", focus),
  outlineBtn: cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#14892A]/25 bg-white px-4 text-[15px] font-semibold text-[#117F21] transition hover:border-[#14892A] hover:bg-[#F7FAF6]", focus),
  savedBtn: cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#117F21]/25 bg-[#E8F5E9] px-4 text-[15px] font-semibold text-[#117F21]", focus),
  field: "w-full rounded-xl border border-gray-200 bg-[#F7FAF6] px-4 py-3 text-base text-[#0A2E10] placeholder:text-gray-600 focus:border-[#117F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#117F21]/30",
  chipOn: "bg-[#117F21] text-white ring-[#117F21]",
  chipOff: "bg-[#F7FAF6] text-gray-700 ring-gray-200 hover:bg-white hover:ring-[#117F21]/40",
  solid: "bg-[#117F21]",
  range: "accent-[#117F21]",
  promptBtn: "border border-gray-200 bg-white text-[#0A2E10] hover:border-[#117F21] hover:bg-[#F7FAF6]",
  dashed: "border-gray-300 bg-[#F7FAF6] text-[#117F21] hover:border-[#117F21] hover:bg-white",
  /* Home screen header */
  hero: "rounded-b-[1.75rem] bg-[#04240A] text-white",
  heroTitle: "text-[25px] font-bold leading-tight tracking-tight",
  heroBell: "bg-white/10 ring-1 ring-white/20 backdrop-blur hover:bg-white/20",
  heroBellIcon: "text-[#F4D27A]",
  heroBadge: "bg-[#CB9615] text-[#1A1206] ring-[#04240A]",
  /* Lists, steps, notices, chat */
  stepDot: "bg-[#117F21] text-white ring-4 ring-white",
  stepLine: "bg-gradient-to-b from-[#117F21] to-[#CB9615]/60",
  unread: "bg-white shadow-[0_14px_30px_-22px_rgba(16,93,29,0.6)]",
  newBadge: "bg-[#CB9615] text-[#1A1206]",
  /** "dot": a coloured dot per notice; "bar": a coloured bar down the left edge (classic notices). */
  notice: "bar" as "dot" | "bar",
  bubbleUser: "rounded-tr-md bg-[#117F21] text-white",
  bubbleBot: "rounded-tl-md border border-gray-200 bg-white text-[#0A2E10]",
  success: "bg-[#E8F5E9] ring-8 ring-[#E8F5E9]/50",

  /* Phone shell (Phone.tsx) */
  navIndicator: "line" as "pill" | "line",
  navFloat: false,
  statusHome: "bg-[#04240A] text-white",
  statusInner: "bg-white text-[#0A2E10]",
  island: "bg-[#0A2E10]",
  homeBar: "bg-[#0A2E10]",
  nav: "border-t border-gray-200 bg-white",
  navOn: "text-[#117F21]",
  navPill: "bg-[#CB9615]",
  navOff: "text-gray-500",
  navText: "text-[13px]",
  navLabelOn: "font-bold text-[#117F21]",
  navLabelOff: "font-medium text-gray-700",
  navDot: "bg-[#CB9615] ring-white",
  fab: "bg-[#04240A] text-white ring-1 ring-white/20 shadow-[0_18px_36px_-14px_rgba(4,36,10,0.9)] hover:bg-[#0A4A13]",
  fabIcon: "bg-[#CB9615] text-[#1A1206]",
  fabPulse: "ring-[#CB9615]",
  backdrop: "bg-[#04240A]/45",
  sheet: "rounded-t-[1.75rem] bg-[#F4F7F2] shadow-[0_-20px_40px_-24px_rgba(4,36,10,0.6)]",
  sheetTitle: "font-bold text-[#0A2E10]",
  sheetList: "rounded-3xl border border-gray-200/80 bg-white divide-gray-100",
  sheetRowOn: "bg-[#F7FAF6]",
  sheetBadge: "bg-[#CB9615] text-[#1A1206]",
  closeBtn: "border border-gray-200 bg-white text-[#0A2E10] hover:border-[#117F21] hover:text-[#117F21]",
};

/** Photographic header: the app-user photo with a dark shade under the words, slow Ken Burns zoom. */
export function HeroDecor() {
  return (
    <>
      <motion.img
        src="/images/opt/pencom-app-user-640.webp"
        alt=""
        aria-hidden="true"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 9, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-[center_30%]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#021a07] via-[#021a07]/90 to-[#04240A]/55" />
    </>
  );
}

/** Section title inside the app: green dot and bold ink title. */
export function ScreenTitle({ children, aside }: { n?: number; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-lg font-bold text-[#0A2E10]">
        <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
          <motion.span className="absolute inset-0 rounded-full bg-[#14892A]" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 1.4, repeat: 1, delay: 0.4 }} />
          <span className="relative h-2.5 w-2.5 rounded-full bg-[#14892A]" />
        </span>
        {children}
      </h2>
      {aside}
    </div>
  );
}
