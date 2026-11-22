"use client";

import { useRef, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Building2, Check, FileCheck, HandCoins, KeyRound, Landmark, Lock,
  MessageSquareWarning, PiggyBank, Scale, ShieldCheck, Undo2, Users, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp, GridBackdrop, Spotlight, Tilt, ease } from "@/views/about/primitives";
import { SectionHeading } from "@/views/theme/heading";
import {
  DarkBand, Rise, Tile, card, featured, focus, goldBtn, listPanel, listRow, outlineBtn as classicOutline, outlineDarkBtn, sectionCls,
} from "@/views/theme/ui";
import { library } from "./library";
import { fmtDate, latest, typeStyle } from "./search";
import type { Filters } from "./Library";

const moveArrow = "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1";

/* ─────────────────────────── Latest issued (scroll-snap rail) ─────────────────────────── */

export function LatestRail({ onOpen }: { onOpen: (id: string) => void }) {
  const rail = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * 360, behavior: reduce ? "auto" : "smooth" });
  return (
    <section id="latest" aria-labelledby="latest-title" className={cn("bg-white", sectionCls, "px-0")}>
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          id="latest-title"
          eyebrow="Just issued"
          title="The latest from the Commission"
          highlight="latest"
          intro="New regulations, guidelines and circulars, newest first. Open one for a summary and the signed PDF."
          action={
            <div className="hidden gap-2 sm:flex">
              {[
                { d: -1, I: ArrowLeft, l: "Back" },
                { d: 1, I: ArrowRight, l: "More" },
              ].map(({ d, I, l }) => (
                <button key={l} type="button" onClick={() => scroll(d)} className={classicOutline}>
                  {d < 0 && <I className="h-4 w-4" aria-hidden="true" />}
                  {l}
                  {d > 0 && <I className="h-4 w-4" aria-hidden="true" />}
                  <span className="sr-only"> (scroll the list)</span>
                </button>
              ))}
            </div>
          }
        />
      </div>
      <ul
        ref={rail}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 pt-3 [scrollbar-width:none] sm:px-[max(1rem,calc((100vw_-_80rem)/2_+_1rem))] sm:scroll-px-[max(1rem,calc((100vw_-_80rem)/2_+_1rem))] scroll-px-4 [&::-webkit-scrollbar]:hidden"
      >
        {latest.map((d, i) => {
          const first = i === 0;
          const body = (
            <>
              {first && <GridBackdrop className="opacity-70" />}
              <span className="relative flex flex-wrap items-center justify-between gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider", typeStyle[d.type].chip)}>{d.type}</span>
                <span className={cn("font-mono text-sm", first ? "text-white/80" : "text-gray-600")}>{fmtDate(d.date)}</span>
              </span>
              {first && (
                <span className="relative mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#CB9615] px-3 py-0.5 text-xs font-bold uppercase tracking-[0.16em] text-[#1A1206]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#1A1206]" />
                  Newest
                </span>
              )}
              <span className={cn("relative line-clamp-4 text-xl font-bold leading-snug", first ? "mt-3 text-white" : "mt-5 text-[#0A2E10] group-hover:text-[#117F21]")}>{d.title}</span>
              <span className={cn("relative mt-auto flex items-center justify-between gap-2 pt-5 font-semibold", first ? "text-[#F4D27A]" : "text-[#117F21]")}>
                Read details
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition duration-300",
                    first ? "bg-[#CB9615] text-[#1A1206] group-hover:bg-[#E0AA22]" : "bg-[#E8F5E9] text-[#117F21] group-hover:bg-[#117F21] group-hover:text-white",
                  )}
                >
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </span>
            </>
          );
          const cls = cn("group flex h-full min-h-[260px] w-full flex-col p-6 text-left", focus);
          return (
            <motion.li
              key={d.id}
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.06, ease }}
              className="w-[290px] shrink-0 snap-start sm:w-[330px]"
            >
              {first ? (
                // The page's one tilted card: the newest document on the featured gradient
                <Tilt className="h-full">
                  <button type="button" onClick={() => onOpen(d.id)} className={cn(featured, cls, "shadow-[0_30px_60px_-30px_rgba(4,36,10,0.8)]")}>
                    {body}
                  </button>
                </Tilt>
              ) : (
                <button type="button" onClick={() => onOpen(d.id)} className={cn(card, cls)}>
                  {body}
                </button>
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─────────────────────────── Pension Reform Act 2014 (the dark band) ─────────────────────────── */

const provisions = [
  {
    id: "cover",
    icon: Users,
    tab: "Who it covers",
    title: "Who the Act covers",
    points: [
      "Employees of the Federal Government, the FCT, States and Local Governments.",
      "Private-sector organisations with three or more employees.",
      "Self-employed people and staff of smaller organisations can join voluntarily.",
    ],
    stat: { value: "3+", label: "employees brings a private employer into the scheme" },
    q: "coverage",
  },
  {
    id: "contrib",
    icon: Wallet,
    tab: "Contributions",
    title: "How much is saved",
    points: [
      "A minimum of 18% of monthly pay: 10% from the employer and 8% from the employee.",
      "Contributions go into the employee’s own Retirement Savings Account (RSA).",
      "Employees can add voluntary contributions on top.",
    ],
    stat: { value: "18%", label: "minimum monthly contribution" },
    q: "contribution",
  },
  {
    id: "benefits",
    icon: PiggyBank,
    tab: "Retirement benefits",
    title: "Getting your benefits",
    points: [
      "Benefits are paid on retirement, generally from age 50.",
      "Retirees choose programmed withdrawal through their PFA or an annuity from an insurer.",
      "If you lose your job before 50, you may access part of your RSA after four months without work.",
    ],
    stat: { value: "50", label: "years, the usual minimum age to access benefits" },
    q: "benefits",
  },
  {
    id: "choice",
    icon: Undo2,
    tab: "Choice & transfers",
    title: "Your choice of PFA",
    points: [
      "Every employee chooses the Pension Fund Administrator (PFA) that manages their RSA.",
      "Your RSA stays yours when you change jobs.",
      "You can transfer your RSA to another PFA under PenCom’s transfer regulations.",
    ],
    stat: { value: "19", label: "licensed PFAs to choose from" },
    q: "transfer",
  },
  {
    id: "safe",
    icon: ShieldCheck,
    tab: "Keeping funds safe",
    title: "How your savings are protected",
    points: [
      "PFAs invest the money; separate Pension Fund Custodians (PFCs) hold the assets.",
      "Investments must follow PenCom’s investment regulations.",
      "PenCom licenses, supervises and inspects every operator.",
    ],
    stat: { value: "3", label: "licensed PFCs hold pension assets" },
    q: "investment",
  },
];

export function ActSpotlight({ set }: { set: (p: Partial<Filters>) => void }) {
  const [tab, setTab] = useState(provisions[0].id);
  const reduce = useReducedMotion();
  const idx = provisions.findIndex((x) => x.id === tab);
  const p = provisions[idx];

  return (
    <DarkBand id="act" labelledBy="act-title" className="scroll-mt-[170px]">
      <SectionHeading
        id="act-title"
        dark
        eyebrow="Primary legislation"
        title="The Pension Reform Act 2014, in plain language"
        highlight="in plain language"
        intro="The Act sets up the Contributory Pension Scheme and the Commission. Here is what it means for you."
        action={
          <Rise>
            <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
              <div className="flex items-center gap-4">
                <Tile icon={Landmark} dark size="lg" className="ring-1 ring-white/15" />
                <div>
                  <p className="text-sm font-medium text-white/80">Signed into law</p>
                  <p className="text-2xl font-bold text-[#F4D27A]">1 July 2014</p>
                </div>
              </div>
              <Link to="/regulations/pension-reform-act" className={cn(goldBtn, "group")}>
                Read the full Act
                <ArrowRight className={moveArrow} aria-hidden="true" />
              </Link>
            </div>
          </Rise>
        }
      />

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div
            role="tablist"
            aria-label="Key provisions"
            aria-orientation="vertical"
            className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:overflow-visible"
          >
            {provisions.map((x, i) => {
              const on = x.id === tab;
              return (
                <button
                  key={x.id}
                  id={`act-tab-${x.id}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="act-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setTab(x.id)}
                  onKeyDown={(e) => {
                    const n = ["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(e.key) ? -1 : 0;
                    if (!n) return;
                    e.preventDefault();
                    const next = provisions[(i + n + provisions.length) % provisions.length];
                    setTab(next.id);
                    document.getElementById(`act-tab-${next.id}`)?.focus();
                  }}
                  className={cn(
                    "relative isolate flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-left font-semibold transition-colors",
                    focus,
                    on ? "text-[#1A1206]" : "text-white/85 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="act-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[#CB9615] to-[#E0AA22] shadow-[0_12px_28px_-12px_rgba(203,150,21,0.9)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span aria-hidden="true" className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition", on ? "bg-[#1A1206]/10" : "bg-white/[0.08] text-[#F4D27A]")}>
                    <x.icon className="h-4 w-4" />
                  </span>
                  {x.tab}
                </button>
              );
            })}
          </div>
          {/* Progress through the five provisions: a gold track that grows */}
          <div aria-hidden="true" className="mt-4 hidden h-1 overflow-hidden rounded-full bg-white/10 lg:block">
            <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-[#117F21] to-[#F4D27A]" initial={false} animate={{ scaleX: (idx + 1) / provisions.length }} transition={{ duration: reduce ? 0 : 0.6, ease }} />
          </div>
        </div>

        <div id="act-panel" role="tabpanel" aria-labelledby={`act-tab-${p.id}`} className="lg:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -16 }}
              transition={{ duration: 0.3, ease }}
              className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-sm md:grid-cols-[1fr_240px]"
            >
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-white">{p.title}</h3>
                <ul className="mt-5 space-y-4">
                  {p.points.map((pt, i) => (
                    <motion.li
                      key={pt}
                      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.08 + i * 0.07, ease }}
                      className="flex gap-3 text-base leading-relaxed text-white/90 sm:text-lg"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F4D27A]/15 text-[#F4D27A] ring-1 ring-[#F4D27A]/30">
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                      </span>
                      {pt}
                    </motion.li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    set({ q: p.q, types: [], years: [], who: [], subjects: [], status: "" });
                    document.getElementById("library")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                  }}
                  className={cn(outlineDarkBtn, "group mt-7")}
                >
                  Related regulations and circulars
                  <ArrowRight className={moveArrow} aria-hidden="true" />
                </button>
              </div>
              <div className="relative flex flex-col justify-center border-t border-white/10 bg-[#04240A]/60 p-6 sm:p-8 md:border-l md:border-t-0">
                <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-[#F4D27A] to-[#CB9615]" />
                <CountUp value={p.stat.value} duration={1.2} className="block text-5xl font-black tracking-tight text-white sm:text-6xl" />
                <p className="mt-2 text-base font-medium leading-snug text-white/85">{p.stat.label}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <p className="mt-4 text-sm text-white/80">
            A plain-language summary. The wording of the Pension Reform Act 2014 is the legal text and takes precedence.
          </p>
        </div>
      </div>
    </DarkBand>
  );
}

/* ─────────────────────────── Compliance ─────────────────────────── */

const duties = [
  { icon: Users, title: "Register every employee", body: "Make sure each employee has a Retirement Savings Account with a PFA of their choice." },
  { icon: HandCoins, title: "Deduct and add contributions", body: "Deduct the employee’s 8% and add your 10%, at least 18% of monthly pay in total." },
  { icon: Wallet, title: "Remit on time", body: "Pay contributions to each employee’s Pension Fund Custodian promptly after paying salaries, using PCRS." },
  { icon: ShieldCheck, title: "Keep group life insurance", body: "Maintain a group life insurance policy for your employees, as the Act requires." },
  { icon: FileCheck, title: "Hold a Pension Clearance Certificate", body: "You need a valid PCC to bid for government contracts. Apply on eHub." },
];

export function Compliance({ set }: { set: (p: Partial<Filters>) => void }) {
  const [done, setDone] = useState<boolean[]>(duties.map(() => false));
  const reduce = useReducedMotion();
  const score = done.filter(Boolean).length;
  const pct = score / duties.length;

  const operatorLinks = [
    { label: "Circulars for PFAs", n: library.filter((d) => d.type === "Circular" && d.appliesTo.includes("PFAs")).length, patch: { types: ["Circular"], who: ["PFAs"] } },
    { label: "Investment rules", n: library.filter((d) => d.subjects.includes("Investment")).length, patch: { subjects: ["Investment"] } },
    { label: "Governance and licensing", n: library.filter((d) => d.subjects.includes("Governance & licensing")).length, patch: { subjects: ["Governance & licensing"] } },
    { label: "Codes of conduct and governance", n: library.filter((d) => d.type === "Code").length, patch: { types: ["Code"] } },
  ];

  return (
    <section id="compliance" aria-labelledby="compliance-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="compliance-title"
          eyebrow="Compliance"
          title="Stay compliant with the Act"
          highlight="compliant"
          intro="What employers must do, a quick self-check, and where licensed operators can find the rules that apply to them."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Employer self-check */}
          <Rise className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_30px_60px_-44px_rgba(10,74,19,0.5)]">
              <div className="flex flex-col gap-5 border-b border-gray-100 bg-[#F4F7F2] p-6 sm:flex-row sm:items-center sm:p-7">
                <Tile icon={Building2} dark size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">For employers</p>
                  <h3 className="mt-1 text-xl font-bold text-[#0A2E10] sm:text-2xl">Your pension duties: a self-check</h3>
                  <p className="mt-1 text-base text-gray-600">Tick what you already do. Nothing is sent to PenCom.</p>
                </div>
                {/* Score ring */}
                <div className="flex items-center gap-3 sm:flex-col sm:gap-1">
                  <svg viewBox="0 0 44 44" className="h-16 w-16 -rotate-90" aria-hidden="true">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#E8F5E9" strokeWidth="5" />
                    <motion.circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="url(#reg-score)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      initial={false}
                      animate={{ pathLength: Math.max(pct, 0.001), opacity: pct ? 1 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.6, ease }}
                    />
                    <defs>
                      <linearGradient id="reg-score" x1="0" x2="1">
                        <stop offset="0%" stopColor="#117F21" />
                        <stop offset="100%" stopColor="#CB9615" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <p className="text-sm font-semibold text-[#0A2E10]" aria-live="polite">
                    {score} of {duties.length} done
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-gray-100">
                {duties.map((d, i) => (
                  <li key={d.title}>
                    <label className={cn("group relative flex min-h-14 cursor-pointer gap-4 px-6 py-4 transition sm:px-7", done[i] ? "bg-[#F7FAF6]" : "hover:bg-[#F7FAF6]")}>
                      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1 origin-top bg-[#117F21] transition-transform duration-300", done[i] ? "scale-y-100" : "scale-y-0")} />
                      <input type="checkbox" className="peer sr-only" checked={done[i]} onChange={() => setDone((x) => x.map((v, j) => (j === i ? !v : v)))} />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition duration-300 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#FFD84D]",
                          done[i] ? "border-[#117F21] bg-[#117F21] text-white" : "border-gray-400 bg-white group-hover:border-[#117F21]",
                        )}
                      >
                        {done[i] && <Check className="h-4 w-4" strokeWidth={3} />}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2 font-bold text-[#0A2E10]">
                          <d.icon className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                          {d.title}
                        </span>
                        <span className="mt-1 block text-base leading-relaxed text-gray-600">{d.body}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 p-5 sm:p-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={pct === 1 ? "all" : "some"}
                    initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                    className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 pl-6 sm:flex-row sm:items-center"
                    aria-live="polite"
                  >
                    <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", pct === 1 ? "bg-[#117F21]" : "bg-[#CB9615]")} />
                    <div className="flex-1">
                      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider", pct === 1 ? "bg-[#E8F5E9] text-[#0A4A13]" : "bg-[#FFF8E1] text-[#7A5604]")}>
                        {pct === 1 ? "All done" : "To do"}
                      </span>
                      <p className="mt-2 text-base text-[#0A2E10]">
                        {pct === 1
                          ? "You’re doing everything on the list. Keep your records ready for PenCom inspections."
                          : `${duties.length - score} to go. Late or unpaid contributions attract penalties under the Pension Reform Act 2014.`}
                      </p>
                    </div>
                    <Link to="/services#pcc" className={cn(goldBtn, "group shrink-0 self-start sm:self-auto")}>
                      Get your PCC
                      <ArrowRight className={moveArrow} aria-hidden="true" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Rise>

          <div className="space-y-6 lg:col-span-4">
            {/* Operators */}
            <Rise delay={0.08}>
              <Spotlight className={cn(listPanel, "divide-y-0")}>
                <div className="flex items-center gap-4 border-b border-gray-100 p-5 sm:p-6">
                  <Tile icon={KeyRound} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">For licensed operators</p>
                    <h3 className="mt-0.5 text-xl font-bold text-[#0A2E10]">The rules that apply to you</h3>
                  </div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {operatorLinks.map((o) => (
                    <li key={o.label}>
                      <button
                        type="button"
                        onClick={() => {
                          set({ q: "", types: [], years: [], who: [], subjects: [], status: "", ...o.patch });
                          document.getElementById("library")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                        }}
                        className={cn(listRow, "min-h-14 w-full text-left font-semibold text-[#0A2E10]")}
                      >
                        <span className="flex-1 group-hover:text-[#117F21]">{o.label}</span>
                        <span className="rounded-full border border-gray-200 bg-[#F7FAF6] px-2.5 py-0.5 text-sm tabular-nums text-[#0A4A13]">
                          {o.n}
                          <span className="sr-only"> documents</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#117F21]" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Spotlight>
            </Rise>

            {/* Report: a status card with a red bar */}
            <Rise delay={0.16}>
              <Link to="/connect#report" className={cn(card, "group relative flex gap-4 overflow-hidden p-6 pl-7", focus)}>
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B52026]" />
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDE8E8] text-[#8E1A1E] transition-transform duration-300 group-hover:rotate-[-6deg]">
                  <MessageSquareWarning className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-xl font-bold text-[#0A2E10] group-hover:text-[#117F21]">Report an employer</span>
                  <span className="mt-1 block text-base leading-relaxed text-gray-600">Is your employer deducting pension but not remitting it? Tell us and we will follow it up.</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[#117F21]">
                    Report it
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </Rise>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Policies ─────────────────────────── */

export function Policies() {
  const items = [
    {
      icon: Lock,
      title: "Data Protection Policy",
      body: "How PenCom collects, uses, stores and protects personal data, in line with the Nigeria Data Protection Act 2023.",
    },
    {
      icon: ShieldCheck,
      title: "Information Security (ISMS) Policy",
      body: "How PenCom keeps the information it holds confidential, accurate and available.",
    },
  ];
  return (
    <section id="policies" aria-labelledby="policies-title" className={cn("bg-gradient-to-b from-white via-[#F4F7F2] to-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="policies-title" eyebrow="Our own policies" title="How PenCom protects your information" highlight="protects your information" />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((it, i) => (
            <Rise key={it.title} delay={i * 0.1} className="h-full">
              <Spotlight className={cn(card, "group h-full p-6 sm:p-8")}>
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#117F21] to-[#CB9615] transition-transform duration-500 group-hover:scale-x-100" />
                <Tile icon={it.icon} dark size="lg" />
                <h3 className="mt-5 text-xl font-bold text-[#0A2E10]">{it.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">{it.body}</p>
                <Link to="/connect#contact" className={cn(classicOutline, "group/btn mt-6 h-auto py-3 text-left")}>
                  Questions about your data? Contact us
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden="true" />
                </Link>
              </Spotlight>
            </Rise>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-gray-600">
          <Scale className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
          Full policy text to be supplied by the Data Protection Officer and ICT before launch.
        </p>
      </div>
    </section>
  );
}
