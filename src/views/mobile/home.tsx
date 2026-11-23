"use client";

import { motion } from "framer-motion";
import { Accessibility, Bell, BookOpen, Bot, ChevronRight, ClipboardList, FileCheck, Landmark, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { focus } from "@/views/theme/ui";
import { journeys } from "@/views/services/data";
import type { notifications as seed, ScreenName } from "./data";
import { Body, stagger } from "./screens";
import { HeroDecor, ScreenTitle, sk } from "./skin";

/**
 * The app's home screen in the classic "national portal" look: a photo banner (Ken Burns, dark shade under the words)
 * with a white search card floating over its lower edge (gold hairline), a government-app grid of eight quick services,
 * status notices with a coloured left bar and level chip (as on the homepage), and a list panel of popular services.
 * Public: no sign-in, no account data.
 */

const level: Record<string, { label: string; bar: string; chip: string }> = {
  critical: { label: "Important", bar: "bg-[#B52026]", chip: "bg-[#FDECEC] text-[#9B1C22]" },
  warning: { label: "Reminder", bar: "bg-[#CB9615]", chip: "bg-[#FFF5DB] text-[#7A5200]" },
  info: { label: "Update", bar: "bg-[#1D63B8]", chip: "bg-[#E8F0FB] text-[#164E91]" },
  success: { label: "Update", bar: "bg-[#117F21]", chip: "bg-[#E8F5E9] text-[#0A4A13]" },
};

export function HomeScreen({ go, items, unread }: { go: (s: ScreenName) => void; items: typeof seed; unread: number }) {
  const quick = [
    { label: "Services", icon: ClipboardList, screen: "services" as const },
    { label: "Guides", icon: FileCheck, screen: "guidance" as const },
    { label: "Library", icon: BookOpen, screen: "publications" as const },
    { label: "PFAs", icon: Landmark, screen: "pfa" as const },
    { label: "Updates", icon: Bell, screen: "notifications" as const },
    { label: "Feedback", icon: MessageSquare, screen: "feedback" as const },
    { label: "Ask AI", icon: Bot, screen: "chat" as const },
    { label: "Settings", icon: Accessibility, screen: "accessibility" as const },
  ];
  return (
    <Body label="Home" className={sk.appBg}>
      {/* photo banner */}
      <div className="relative isolate overflow-hidden px-5 pb-14 pt-3 text-white">
        <HeroDecor />
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pencom-logo.png" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold">PenCom</span>
              <span className="block text-xs text-white/80">National Pension Commission</span>
            </span>
          </span>
          <button type="button" onClick={() => go("notifications")} aria-label={`Notifications, ${unread} new`} className={cn("relative flex h-11 w-11 items-center justify-center rounded-xl", sk.heroBell, focus)}>
            <Bell className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" />
            {unread > 0 && <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#CB9615] px-1 text-[11px] font-bold text-[#1A1206] ring-2 ring-[#04240A]">{unread}</span>}
          </button>
        </div>
        <span className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F4D27A] ring-1 ring-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F4D27A]" /> Official app
        </span>
        <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-tight">Pensions made clear</h2>
        <p className="mt-1 text-[15px] leading-snug text-white/85">Guides, publications and PFA contacts from the National Pension Commission.</p>
      </div>

      {/* floating search card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative z-10 -mt-9 px-4">
        <div className="relative rounded-2xl border border-gray-200/80 bg-white p-2 shadow-[0_24px_40px_-24px_rgba(4,36,10,0.6)]">
          <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
          <button type="button" onClick={() => go("publications")} className={cn("flex min-h-12 w-full items-center gap-3 rounded-xl bg-[#F7FAF6] px-3.5 text-left text-[15px] text-gray-600 transition hover:bg-[#E8F5E9]", focus)}>
            <Search className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
            Search publications
          </button>
        </div>
      </motion.div>

      {/* quick services grid */}
      <div className="mt-5 px-4">
        <ScreenTitle>Quick services</ScreenTitle>
        <ul className="mt-3 grid grid-cols-4 gap-x-1 gap-y-3 rounded-3xl border border-gray-200/80 bg-white p-3">
          {quick.map((q, i) => (
            <motion.li key={q.label} {...stagger(i)}>
              <button type="button" onClick={() => go(q.screen)} className={cn("group flex w-full flex-col items-center gap-1.5 rounded-xl py-1 text-center active:scale-95", focus)}>
                <span className={cn(sk.tile, "h-12 w-12 rounded-2xl", sk.tileHover)}><q.icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="text-[13px] font-semibold leading-tight text-[#0A2E10]">{q.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* notices */}
      <div className="mt-6 px-4">
        <ScreenTitle aside={<span className="rounded-full border border-gray-200 bg-[#F7FAF6] px-2.5 py-0.5 text-xs font-semibold text-[#7A5200]">Sample</span>}>Notices</ScreenTitle>
        <ul className="mt-3 space-y-2.5">
          {items.map((n, i) => {
            const l = level[n.type];
            return (
              <motion.li key={n.title} {...stagger(i)} className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-3.5 pl-5">
                <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", n.read ? "bg-gray-300" : l.bar)} />
                <span className="flex items-center justify-between gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", l.chip)}>{l.label}</span>
                  <span className="text-xs text-gray-600">{n.time}</span>
                </span>
                <span className="mt-1.5 block text-[15px] font-bold text-[#0A2E10]">{n.title}</span>
                <span className="block text-sm leading-snug text-gray-600">{n.body}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* popular services list panel */}
      <div className="mt-6 px-4 pb-5">
        <ScreenTitle>Popular services</ScreenTitle>
        <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-200/80 bg-white">
          {journeys.slice(0, 4).map((j) => (
            <li key={j.id}>
              <button type="button" onClick={() => go("services")} className={cn("group flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F7FAF6]", focus)}>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#7A5200]">{j.audience}</span>
                  <span className="block text-[15px] font-bold text-[#0A2E10]">{j.short}</span>
                </span>
                <ChevronRight className="h-5 w-5 text-[#117F21] transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Body>
  );
}
