"use client";

import { useRef, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Building2, Check, FileCheck, HandCoins, KeyRound, Landmark, Lock,
  MessageSquareWarning, PiggyBank, Scale, ShieldCheck, Undo2, Users, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ease } from "@/views/about/primitives";
import { ArrowChip } from "@/views/docs/kit";
import { Bubble, IconTile, calmCard, goldBtn } from "@/views/resources/Library";
import { SectionHeading } from "@/views/theme/heading";
import { DarkBackdrop, Rise, focus, sectionCls } from "@/views/theme/ui";
import { library } from "./library";
import { fmtDate, latest, typeStyle } from "./search";
import type { Filters } from "./Library";

/** Green outline button that fills green on hover. */
export const outlineBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white";
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
                <button
                  key={l}
                  type="button"
                  onClick={() => scroll(d)}
                  className={cn("inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-lg font-semibold text-[#14261A] ring-1 ring-[#117F21]/30 transition hover:bg-[#0A4A13] hover:text-white", focus)}
                >
                  {d < 0 && <I className="h-5 w-5" aria-hidden="true" />}
                  {l}
                  {d > 0 && <I className="h-5 w-5" aria-hidden="true" />}
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
          return (
            <motion.li
              key={d.id}
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.06, ease }}
              className="w-[290px] shrink-0 snap-start sm:w-[330px]"
            >
              <button
                type="button"
                onClick={() => onOpen(d.id)}
                className={cn(calmCard, "flex h-full min-h-[260px] w-full flex-col p-6 text-left", first && "ring-2 ring-[#CB9615]", focus)}
              >
                <Bubble />
                <span className="relative flex flex-wrap items-center justify-between gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-bold uppercase tracking-wider", typeStyle[d.type].chip)}>{d.type}</span>
                  <span className="text-base text-gray-700">{fmtDate(d.date)}</span>
                </span>
                {first && (
                  <span className="relative mt-4 inline-flex w-fit items-center rounded-full bg-[#F4D27A] px-3 py-0.5 text-sm font-bold uppercase tracking-[0.14em] text-[#1A1206]">Newest</span>
                )}
                <span className={cn("relative line-clamp-4 text-xl font-bold leading-snug text-[#14261A] group-hover:text-[#0A4A13]", first ? "mt-3" : "mt-5")}>{d.title}</span>
                <span className="relative mt-auto flex items-center justify-between gap-2 pt-5 text-lg font-semibold text-[#0A4A13]">
                  Read details
                  <ArrowChip />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─────────────────────────── Pension Reform Act 2014 ─────────────────────────── */

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
  const p = provisions.find((x) => x.id === tab)!;

  return (
    <section id="act" aria-labelledby="act-title" className={cn("bg-white", sectionCls)}>
      {/* The page's one green inset panel */}
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-5 py-12 text-white sm:px-10 sm:py-14 lg:px-14">
        <DarkBackdrop />
        <SectionHeading
          id="act-title"
          dark
          eyebrow="Primary legislation"
          title="The Pension Reform Act 2014, in plain language"
          highlight="in plain language"
          intro="The Act sets up the Contributory Pension Scheme and the Commission. Here is what it means for you."
          action={
            <Rise>
              <div className="rounded-3xl bg-white/[0.07] p-5 ring-1 ring-white/10">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4D27A] text-[#1A1206]">
                    <Landmark className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-base font-medium text-white/85">Signed into law</p>
                    <p className="text-2xl font-bold text-[#F4D27A]">1 July 2014</p>
                  </div>
                </div>
                <Link to="/regulations/pension-reform-act" className={cn(goldBtn, "mt-5 w-full", focus)}>
                  Read the full Act
                  <ArrowRight className={moveArrow} aria-hidden="true" />
                </Link>
              </div>
            </Rise>
          }
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div role="tablist" aria-label="Key provisions" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:col-span-4 lg:flex-col lg:overflow-visible">
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
                    "relative isolate flex min-h-14 shrink-0 items-center gap-3 rounded-2xl px-5 text-left text-lg font-semibold transition-colors",
                    focus,
                    on ? "text-[#1A1206]" : "bg-white/[0.07] text-white ring-1 ring-white/10 hover:bg-white/[0.12]",
                  )}
                >
                  {on && <motion.span layoutId="act-pill" className="absolute inset-0 -z-10 rounded-2xl bg-[#F4D27A]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <x.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {x.tab}
                </button>
              );
            })}
          </div>

          <div id="act-panel" role="tabpanel" aria-labelledby={`act-tab-${p.id}`} className="lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -16 }}
                transition={{ duration: 0.3, ease }}
                className="grid grid-cols-1 gap-6 rounded-3xl bg-white p-6 text-[#14261A] sm:p-9 md:grid-cols-[1fr_220px]"
              >
                <div>
                  <h3 className="text-2xl font-bold">{p.title}</h3>
                  <ul className="mt-5 space-y-4">
                    {p.points.map((pt, i) => (
                      <motion.li
                        key={pt}
                        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.08 + i * 0.07, ease }}
                        className="flex gap-3 text-lg leading-relaxed text-gray-800"
                      >
                        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#0A4A13]">
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
                    className={cn(outlineBtn, "mt-7", focus)}
                  >
                    Related regulations and circulars
                    <ArrowRight className={moveArrow} aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-col justify-center rounded-3xl bg-[#F1EFE8] p-6">
                  <span aria-hidden="true" className="mb-4 block h-1.5 w-12 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
                  <p className="text-5xl font-bold tracking-tight text-[#14261A]">{p.stat.value}</p>
                  <p className="mt-2 text-lg font-medium leading-snug text-gray-800">{p.stat.label}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <p className="mt-4 text-base text-white/85">
              A plain-language summary. The wording of the Pension Reform Act 2014 is the legal text and takes precedence.
            </p>
          </div>
        </div>
      </div>
    </section>
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
    <section id="compliance" aria-labelledby="compliance-title" className={cn("bg-[#FBF8F1]", sectionCls)}>
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
            <div className="rounded-[2rem] bg-white p-6 shadow-[0_30px_60px_-40px_rgba(10,74,19,0.45)] ring-1 ring-black/10 sm:p-8">
              <div className="flex items-start gap-4">
                <IconTile icon={Building2} />
                <div>
                  <p className="text-base font-bold uppercase tracking-[0.14em] text-[#7A5200]">For employers</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#14261A]">Your pension duties: a self-check</h3>
                  <p className="mt-1 text-lg text-gray-700">Tick what you already do. Nothing is sent to PenCom.</p>
                </div>
              </div>

              {/* Green progress line */}
              <div className="mt-6">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-lg font-semibold text-[#14261A]" aria-live="polite">
                    {score} of {duties.length} done
                  </p>
                  {pct === 1 && <p className="text-base font-semibold text-[#0A4A13]">All done</p>}
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#E8F5E9]" aria-hidden="true">
                  <motion.div
                    className="h-full origin-left rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]"
                    initial={false}
                    animate={{ scaleX: pct }}
                    transition={{ duration: reduce ? 0 : 0.6, ease }}
                  />
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {duties.map((d, i) => (
                  <li key={d.title}>
                    <label
                      className={cn(
                        "group flex min-h-14 cursor-pointer gap-4 rounded-3xl p-4 ring-1 transition duration-300",
                        done[i] ? "bg-[#E8F5E9] ring-[#117F21]/40" : "bg-white ring-black/10 hover:bg-[#FBF8F1] hover:ring-[#117F21]/40",
                      )}
                    >
                      <input type="checkbox" className="peer sr-only" checked={done[i]} onChange={() => setDone((x) => x.map((v, j) => (j === i ? !v : v)))} />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition duration-300 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#FFD84D]",
                          done[i] ? "border-[#0A4A13] bg-[#0A4A13] text-[#F4D27A]" : "border-gray-500 bg-white group-hover:border-[#117F21]",
                        )}
                      >
                        {done[i] && <Check className="h-5 w-5" strokeWidth={3} />}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2 text-lg font-bold text-[#14261A]">
                          <d.icon className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                          {d.title}
                        </span>
                        <span className="mt-1 block text-lg leading-relaxed text-gray-700">{d.body}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pct === 1 ? "all" : "some"}
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                  className={cn(
                    "relative mt-6 flex flex-col gap-4 overflow-hidden rounded-3xl p-5 pl-6 sm:flex-row sm:items-center",
                    pct === 1 ? "bg-[#E8F5E9] ring-1 ring-[#117F21]/30" : "bg-[#F1EFE8]",
                  )}
                  aria-live="polite"
                >
                  <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1.5", pct === 1 ? "bg-[#117F21]" : "bg-[#CB9615]")} />
                  <p className="flex-1 text-lg text-[#14261A]">
                    {pct === 1
                      ? "You’re doing everything on the list. Keep your records ready for PenCom inspections."
                      : `${duties.length - score} to go. Late or unpaid contributions attract penalties under the Pension Reform Act 2014.`}
                  </p>
                  <Link to="/services#pcc" className={cn(goldBtn, "shrink-0 self-start sm:self-auto", focus)}>
                    Get your PCC
                    <ArrowRight className={moveArrow} aria-hidden="true" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </Rise>

          <div className="space-y-6 lg:col-span-4">
            {/* Operators */}
            <Rise delay={0.08}>
              <div className="rounded-[2rem] bg-white p-6 ring-1 ring-black/10 sm:p-7">
                <IconTile icon={KeyRound} />
                <p className="mt-5 text-base font-bold uppercase tracking-[0.14em] text-[#7A5200]">For licensed operators</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-[#14261A]">The rules that apply to you</h3>
                <ul className="mt-5 space-y-2">
                  {operatorLinks.map((o) => (
                    <li key={o.label}>
                      <button
                        type="button"
                        onClick={() => {
                          set({ q: "", types: [], years: [], who: [], subjects: [], status: "", ...o.patch });
                          document.getElementById("library")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                        }}
                        className={cn("group flex min-h-14 w-full items-center gap-3 rounded-2xl bg-[#FBF8F1] px-4 py-2 text-left text-lg font-semibold text-[#14261A] ring-1 ring-black/10 transition hover:bg-[#E8F5E9] hover:ring-[#117F21]/40", focus)}
                      >
                        <span className="flex-1">{o.label}</span>
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-base tabular-nums text-[#0A4A13] ring-1 ring-[#117F21]/20">
                          {o.n}
                          <span className="sr-only"> documents</span>
                        </span>
                        <ArrowRight className={cn(moveArrow, "text-[#0A4A13]")} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Rise>

            {/* Report */}
            <Rise delay={0.16}>
              <Link to="/connect#report" className={cn(calmCard, "flex gap-4 p-6", focus)}>
                <Bubble />
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FDE8E8] text-[#8E1A1E] transition-transform duration-300 group-hover:rotate-[-6deg]">
                  <MessageSquareWarning className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="relative flex-1">
                  <span className="block text-xl font-bold tracking-tight text-[#14261A]">Report an employer</span>
                  <span className="mt-1 block text-lg leading-relaxed text-gray-700">Is your employer deducting pension but not remitting it? Tell us and we will follow it up.</span>
                </span>
                <span className="relative self-end"><ArrowChip /></span>
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
    <section id="policies" aria-labelledby="policies-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="policies-title" eyebrow="Our own policies" title="How PenCom protects your information" highlight="protects your information" />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((it, i) => (
            <Rise key={it.title} delay={i * 0.1} className="h-full">
              <div className={cn(calmCard, "h-full p-7 sm:p-8")}>
                <Bubble />
                <IconTile icon={it.icon} className="relative" />
                <h3 className="relative mt-5 text-xl font-bold tracking-tight text-[#14261A]">{it.title}</h3>
                <p className="relative mt-2 text-lg leading-relaxed text-gray-700">{it.body}</p>
                <Link to="/connect#contact" className={cn(outlineBtn, "relative mt-6 h-auto py-3 text-left", focus)}>
                  Questions about your data? Contact us
                  <ArrowRight className={moveArrow} aria-hidden="true" />
                </Link>
              </div>
            </Rise>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-base text-gray-700">
          <Scale className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
          Full policy text to be supplied by the Data Protection Officer and ICT before launch.
        </p>
      </div>
    </section>
  );
}
