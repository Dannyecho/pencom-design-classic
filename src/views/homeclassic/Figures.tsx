"use client";

import { Link } from "@/lib/router";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, ArrowUpRight, FileText, Info, ShieldAlert, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp, GridBackdrop, SectionHeading, Spotlight, ease, reveal } from "@/views/about/primitives";
import { assetGrowth, figures, latestRegulations, notices } from "@/views/home/data";
import { useI18n } from "@/i18n/context";

/* ─────────────────────────── Industry at a glance ─────────────────────────── */

export function IndustryFigures() {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const max = Math.max(...assetGrowth.map((a) => a.value));
  const growth = Math.round(((assetGrowth[1].value - assetGrowth[0].value) / assetGrowth[0].value) * 100);

  return (
    <section id="figures" aria-labelledby="figures-title" className="relative isolate scroll-mt-[170px] overflow-hidden bg-[#11421A] py-20 text-white sm:py-28">
      <GridBackdrop className="-z-10" />
      <div aria-hidden="true" className="absolute -right-40 top-0 -z-10 h-[520px] w-[520px] rounded-full bg-[#14892A]/40 blur-[160px]" />
      <div aria-hidden="true" className="absolute -left-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#CB9615]/15 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            id="figures-title"
            dark
            eyebrow="By the numbers"
            title="Nigeria’s pension industry at a glance"
            highlight="at a glance"
          />
          <motion.div {...reveal}>
            <Link
              to="/performance"
              className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:border-[#F4D27A] hover:text-[#F4D27A] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
            >
              Industry performance
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:col-span-7">
            {figures.map((f, i) => (
              <motion.li
                key={f.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative bg-[#11421A] p-7 transition-colors hover:bg-[#124C1B]"
              >
                <span aria-hidden="true" className="absolute left-0 top-7 h-10 w-0.5 bg-gradient-to-b from-[#F4D27A] to-transparent transition-all duration-500 group-hover:h-16" />
                <CountUp value={f.value} className="text-4xl font-black tracking-tight sm:text-5xl" />
                <p className="mt-2 font-medium text-white/85">{f.label}</p>
                <p className="mt-1 text-xs text-white/65">{f.note}</p>
              </motion.li>
            ))}
          </ul>

          {/* Growth comparison */}
          <motion.figure {...reveal} className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-7 lg:col-span-5">
            <div className="flex items-center justify-between">
              <figcaption className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">Pension assets, ₦ trillion</figcaption>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#14892A]/40 px-3 py-1 text-xs font-bold text-[#B9F0C2]">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />+{growth}%
              </span>
            </div>
            <div className="mt-8 flex h-56 gap-6">
              {assetGrowth.map((g, i) => (
                <div key={g.label} className="flex flex-1 flex-col items-center gap-3">
                  <span className="text-2xl font-black text-[#F4D27A]">
                    <CountUp value={`₦${g.value}tn`} />
                  </span>
                  <div className="relative w-full flex-1">
                    <motion.div
                      initial={{ height: reduce ? `${(g.value / max) * 100}%` : "0%" }}
                      whileInView={{ height: `${(g.value / max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.2 + i * 0.25, ease }}
                      className={cn(
                        "absolute inset-x-0 bottom-0 rounded-t-2xl",
                        i === assetGrowth.length - 1
                          ? "bg-gradient-to-t from-[#14892A] to-[#F4D27A] shadow-[0_0_40px_rgba(244,210,122,0.35)]"
                          : "border border-white/20 bg-gradient-to-t from-white/15 to-white/40",
                      )}
                    />
                  </div>
                  <span className="text-center">
                    <span className="block text-sm font-semibold">{g.label}</span>
                    <span className="block text-xs text-white/65">{g.sub}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="sr-only" data-i18n-done={lang !== "en" ? "" : undefined}>
              {t("Pension assets grew from ₦{a} trillion in {b} to ₦{c} trillion in {d}.", { a: assetGrowth[0].value, b: assetGrowth[0].label, c: assetGrowth[1].value, d: assetGrowth[1].label })}
            </p>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Notices + latest regulations ─────────────────────────── */

const levelStyle = {
  Critical: { icon: ShieldAlert, chip: "bg-[#B52026] text-white", bar: "bg-[#B52026]" },
  Warning: { icon: AlertTriangle, chip: "bg-[#F3D9AE] text-[#6B4300]", bar: "bg-[#D97706]" },
  Information: { icon: Info, chip: "bg-[#E3F2FD] text-[#0B4F8A]", bar: "bg-[#1E88E5]" },
} as const;

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function Updates() {
  return (
    <section id="notices" aria-labelledby="updates-title" className="scroll-mt-[170px] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          id="updates-title"
          eyebrow="Stay current"
          title="Notices and the latest regulations"
          highlight="latest regulations"
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Notices */}
          <div className="lg:col-span-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500">Notices</h3>
            <ul className="mt-4 space-y-3">
              {notices.map((n, i) => {
                const s = levelStyle[n.level];
                const I = s.icon;
                return (
                  <motion.li
                    key={n.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease }}
                  >
                    <Link
                      to={n.href}
                      className="group relative flex gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 pl-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.25)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
                    >
                      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", s.bar)} />
                      <I className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
                      <span>
                        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider", s.chip)}>
                          {n.level}
                        </span>
                        <span className="mt-2 block font-semibold text-[#164D20] group-hover:text-[#117F21]">{n.title}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-gray-600">{n.body}</span>
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          {/* Regulations */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500">Latest regulations and guidelines</h3>
              <Link to="/regulations" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#117F21] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]">
                Regulatory library <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <Spotlight color="rgba(20,137,42,0.08)" size={600} className="mt-4 rounded-3xl border border-gray-200 bg-white">
              <ul className="divide-y divide-gray-100">
                {latestRegulations.map((r, i) => (
                  <motion.li
                    key={r.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06, ease }}
                  >
                    <Link
                      to="/regulations"
                      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F7FAF6] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D] sm:px-6"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#117F21] transition group-hover:bg-[#14892A] group-hover:text-white">
                        <FileText className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-[#164D20] group-hover:text-[#117F21]">{r.title}</span>
                        <span className="mt-0.5 block truncate text-sm text-gray-500">{r.description}</span>
                      </span>
                      <span className="hidden shrink-0 text-right sm:block">
                        <span className="block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">{r.type}</span>
                        <span className="mt-1 block font-mono text-xs text-gray-500">{fmt(r.date)}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#117F21]" aria-hidden="true" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </Spotlight>
          </div>
        </div>
      </div>
    </section>
  );
}
