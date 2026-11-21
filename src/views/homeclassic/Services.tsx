"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ArrowRight, ArrowRightLeft, ArrowUpRight, Banknote, ExternalLink, FileCheck, Heart, RefreshCw, TrendingUp,
  UserCircle, UserPlus, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GridBackdrop, SectionHeading, Spotlight, Tilt, ease } from "@/views/about/primitives";
import { externalPortals, services } from "@/views/home/data";

const serviceIcons: Record<string, LucideIcon> = {
  ArrowRightLeft, UserCircle, TrendingUp, FileCheck, UserPlus, Heart,
};
const portalIcons: Record<string, LucideIcon> = { ExternalLink, Heart, RefreshCw, Banknote };

const filters = [
  { id: "all", label: "All services" },
  { id: "individual", label: "For individuals" },
  { id: "employer", label: "For employers" },
] as const;

export function ServicesGrid() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const list = services.filter((s) => filter === "all" || s.category === filter);

  return (
    <section id="services" aria-labelledby="services-title" className="relative scroll-mt-[170px] bg-gradient-to-b from-white via-[#F4F7F2] to-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            id="services-title"
            eyebrow="Our services"
            title="Pension services for everyone"
            highlight="for everyone"
            intro="Whether you are an employee, an employer or self-employed, start the service you need here."
          />
          <LayoutGroup id="svc-filter">
            <div role="group" aria-label="Filter services" className="inline-flex w-fit rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "relative isolate min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]",
                    filter === f.id ? "text-white" : "text-gray-600 hover:text-[#117F21]",
                  )}
                >
                  {filter === f.id && (
                    <motion.span
                      layoutId="svc-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-[#117F21]"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {f.label}
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>

        <motion.ul layout className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((s, i) => {
              const Icon = serviceIcons[s.icon] ?? ArrowRight;
              const featured = filter === "all" && i === 0;
              return (
                <motion.li
                  key={s.title}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <Tilt className="h-full" max={featured ? 4 : 6}>
                    <Link
                      to={s.href}
                      className={cn(
                        "group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-shadow duration-300 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]",
                        featured
                          ? "bg-gradient-to-br from-[#04240A] via-[#0A4A13] to-[#117F21] text-white shadow-[0_40px_80px_-40px_rgba(4,36,10,0.9)]"
                          : "border border-gray-200/80 bg-white hover:shadow-[0_30px_60px_-30px_rgba(10,74,19,0.45)]",
                      )}
                    >
                      {featured && <GridBackdrop className="opacity-60" />}
                      <span className="relative flex items-start justify-between">
                        <span
                          className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-2xl transition duration-500 group-hover:rotate-[-6deg] group-hover:scale-110",
                            featured ? "bg-white/10 text-[#F4D27A] ring-1 ring-white/20" : "bg-[#E8F5E9] text-[#117F21]",
                          )}
                        >
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                            featured
                              ? "bg-white/10 text-white/80"
                              : s.category === "employer"
                                ? "bg-[#FFF8E1] text-[#7A5200]"
                                : "bg-[#E8F5E9] text-[#117F21]",
                          )}
                        >
                          {s.category === "employer" ? "Employers" : "Individuals"}
                        </span>
                      </span>
                      <span className={cn("relative mt-6 block font-bold", featured ? "text-3xl leading-tight" : "text-xl text-[#0A2E10] group-hover:text-[#117F21]")}>
                        {s.title}
                      </span>
                      <span className={cn("relative mt-3 block leading-relaxed", featured ? "text-lg text-white/75" : "text-sm text-gray-600")}>
                        {s.description}
                      </span>
                      {featured && (
                        <span className="relative mt-6 block rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                          Most requested service. Moving to a new PFA keeps your full balance and contribution history.
                        </span>
                      )}
                      <span
                        className={cn(
                          "relative mt-auto flex items-center gap-2 pt-6 text-sm font-semibold",
                          featured ? "text-[#F4D27A]" : "text-[#117F21]",
                        )}
                      >
                        Start now
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </Tilt>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Online services hub ─────────────────────────── */

export function Portals() {
  return (
    <section id="portals" aria-labelledby="portals-title" className="scroll-mt-[170px] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          id="portals-title"
          eyebrow="Online services"
          title="Go straight to the right portal"
          highlight="right portal"
          intro="These PenCom services run on their own websites. Each opens in a new tab."
        />
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {externalPortals.map((p, i) => {
            const Icon = portalIcons[p.icon] ?? ExternalLink;
            return (
              <motion.li
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
              >
                <Spotlight color="rgba(203,150,21,0.16)" className="h-full rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#CB9615]/40 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.3)]">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col p-6 focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]"
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#04240A] text-[#F4D27A] transition duration-500 group-hover:rotate-6">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <ArrowUpRight className="h-5 w-5 text-gray-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#CB9615]" aria-hidden="true" />
                    </span>
                    <span className="mt-5 block text-xl font-bold text-[#0A2E10]">{p.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600">{p.description}</span>
                    <span className="mt-auto block pt-4 font-mono text-xs text-gray-500">{new URL(p.url).hostname}</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Spotlight>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
