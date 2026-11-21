"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Briefcase, Building2, Store, User, UserRoundCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading, ease } from "@/views/about/primitives";
import { audiences } from "@/views/home/data";
import { go } from "@/views/home/SiteSearch";

const audienceIcons: Record<string, LucideIcon> = {
  user: User,
  retiree: UserRoundCheck,
  building: Building2,
  briefcase: Briefcase,
  store: Store,
};

/** "I am a…" switcher: pick who you are, get your top tasks. Tabs pattern with arrow-key support. */
export default function AudienceTasks() {
  const [active, setActive] = useState(audiences[0].id);
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const a = audiences.find((x) => x.id === active)!;
  const Icon = audienceIcons[a.icon];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!n) return;
    e.preventDefault();
    const next = audiences[(i + n + audiences.length) % audiences.length];
    setActive(next.id);
    document.getElementById(`aud-tab-${next.id}`)?.focus();
  };

  return (
    <section id="start" aria-labelledby="audience-title" className="relative scroll-mt-[170px] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          id="audience-title"
          eyebrow="Start here"
          title="I am a…"
          intro="Choose what describes you best and we’ll show you the things people like you come to do most."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Tabs */}
          <div role="tablist" aria-label="I am a" aria-orientation="vertical" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1">
            {audiences.map((x, i) => {
              const I = audienceIcons[x.icon];
              const on = x.id === active;
              return (
                <button
                  key={x.id}
                  id={`aud-tab-${x.id}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="aud-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(x.id)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "group relative isolate flex min-h-14 items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]",
                    on ? "text-white" : "bg-gray-50 text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0A4A13]",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="aud-pill"
                      className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_14px_30px_-14px_rgba(10,74,19,0.9)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                      on ? "bg-white/15 text-[#F4D27A]" : "bg-white text-[#117F21] shadow-sm",
                    )}
                  >
                    <I className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {x.label}
                  <ArrowRight
                    aria-hidden="true"
                    className={cn("ml-auto hidden h-4 w-4 transition lg:block", on ? "opacity-100" : "opacity-0 group-hover:opacity-60")}
                  />
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div
            id="aud-panel"
            role="tabpanel"
            aria-labelledby={`aud-tab-${a.id}`}
            className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-[#F4F7F2] via-white to-white p-6 sm:p-10 lg:col-span-8"
          >
            <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#CB9615]/10 blur-3xl" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -16 }}
                transition={{ duration: 0.3, ease }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#117F21] text-white shadow-[0_14px_30px_-12px_rgba(17,127,33,0.8)]">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">Top tasks</p>
                    <h3 className="text-2xl font-bold text-[#0A2E10]">{a.label}</h3>
                    <p className="mt-1 text-gray-600">{a.blurb}</p>
                  </div>
                </div>
                <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {a.tasks.map((t, i) => (
                    <motion.li
                      key={t.label}
                      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.05 + i * 0.05, ease }}
                    >
                      <button
                        type="button"
                        onClick={() => go(t, navigate)}
                        className="group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left font-semibold text-[#0A2E10] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#117F21]/40 hover:shadow-[0_18px_40px_-20px_rgba(10,74,19,0.45)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
                      >
                        <span className="flex-1">{t.label}</span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#117F21] transition group-hover:bg-[#117F21] group-hover:text-white">
                          {t.external ? (
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                          )}
                        </span>
                        {t.external && <span className="sr-only">(opens in a new tab)</span>}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
