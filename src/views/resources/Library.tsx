"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "@/lib/router";
import { ArrowRight, BookOpen, Download, FileText, Globe2, Headphones, Newspaper, Play, Printer, Type, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DarkBackdrop, Rise, ease, focus, sectionCls } from "@/views/theme/ui";
import { SectionHeading } from "./compat";
import { forms, publications, type Publication } from "./publications";

/* ─────────────────────────── Calm helpers (shared with FaqGlossary) ─────────────────────────── */

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

const coverCls = "mx-auto w-full max-w-[15rem] sm:max-w-none";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const monthly = publications.filter((p) => p.kind === "Monthly report" && /^\d{4}-\d{2}$/.test(p.period));
const quarterly = publications
  .filter((p) => p.kind === "Quarterly report")
  .map((p) => {
    const m = p.period.match(/(\d{4})-Q(\d)/);
    const t = p.title.toLowerCase();
    const q = m ? Number(m[2]) : t.includes("first") ? 1 : t.includes("second") ? 2 : t.includes("third") ? 3 : t.includes("fourth") ? 4 : 0;
    const y = m ? Number(m[1]) : Number(p.title.match(/(20\d\d)/)?.[1] ?? p.year);
    return { ...p, q, qy: y };
  });
const annual = publications.filter((p) => p.kind === "Annual report").sort((a, b) => b.year - a.year);
const accounts = publications.filter((p) => p.kind === "Annual accounts");
const other = publications.filter((p) => p.kind === "Publication");
const booklets = publications
  .filter((p) => p.kind === "FAQ booklet")
  .map((p) => {
    const m = p.title.match(/hausa|yoruba|igbo|pidgin/i)?.[0];
    return { ...p, lang: m ? m[0].toUpperCase() + m.slice(1).toLowerCase() : null };
  });

/* ─────────────────────────── Cover (gentle lift) ─────────────────────────── */

function Cover({ p, label, big, tone }: { p: Publication; label: string; big: string; tone: "green" | "gold" | "mint" }) {
  const bg = {
    green: "bg-[#0A4A13] text-white",
    gold: "bg-[#F4D27A] text-[#1A1206]",
    mint: "bg-[#E8F5E9] text-[#0A4A13] ring-1 ring-[#0A4A13]/15",
  }[tone];
  const sub = { green: "text-white/80", gold: "text-[#1A1206]/80", mint: "text-[#0A4A13]/80" }[tone];
  const bar = { green: "bg-[#F4D27A]", gold: "bg-[#0A4A13]", mint: "bg-[#CB9615]" }[tone];
  const tag = { green: "bg-white text-[#0A4A13]", gold: "bg-[#0A4A13] text-[#F4D27A]", mint: "bg-[#0A4A13] text-[#F4D27A]" }[tone];
  return (
    <a href={p.pdf} target="_blank" rel="noopener noreferrer" className="group block rounded-3xl focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#FFD84D]">
      <span
        className={cn(
          "relative block aspect-[3/4] w-full overflow-hidden rounded-r-3xl rounded-l-lg p-6 shadow-[0_24px_44px_-26px_rgba(10,74,19,0.6)] transition duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_36px_60px_-30px_rgba(10,74,19,0.7)]",
          bg,
        )}
      >
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2.5 bg-black/15" />
        <span aria-hidden="true" className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-125" />
        <span className="relative flex h-full flex-col">
          <span className={cn("text-sm font-bold uppercase tracking-[0.16em]", sub)}>National Pension Commission</span>
          <span aria-hidden="true" className={cn("mt-4 h-[3px] w-10 rounded-full transition-all duration-500 group-hover:w-20", bar)} />
          <span className="mt-auto block text-6xl font-bold leading-none tracking-tight">{big}</span>
          <span className="mt-3 block text-xl font-bold leading-tight">{label}</span>
          <span className={cn("mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold", tag)}>
            <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" /> PDF
          </span>
        </span>
      </span>
      <span className="mt-4 block text-center text-base text-gray-700">Published {fmt(p.date)}<span className="sr-only">. {p.title}, opens in a new tab</span></span>
    </a>
  );
}

/* ─────────────────────────── Publications ─────────────────────────── */

const tabs = ["Quarterly reports", "Monthly reports", "Annual reports", "Annual accounts", "Other publications"] as const;

function YearChips({ years, year, setYear }: { years: number[]; year: number; setYear: (y: number) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto p-1 pb-2 [scrollbar-width:thin]" role="group" aria-label="Year">
      {years.map((y) => (
        <button key={y} type="button" aria-pressed={y === year} onClick={() => setYear(y)} className={cn(pill(y === year), "tabular-nums")}>
          {y}
        </button>
      ))}
    </div>
  );
}

function DocRow({ p }: { p: Publication }) {
  return (
    <li>
      <a href={p.pdf} target="_blank" rel="noopener noreferrer" className={cn(calmCard, "flex min-h-[4.5rem] items-center gap-4 rounded-2xl px-4 py-3 hover:-translate-y-0.5", focus)}>
        <IconTile icon={FileText} className="h-12 w-12 rounded-xl [&>svg]:h-6 [&>svg]:w-6" />
        <span className="flex-1 text-lg font-semibold">{p.title}</span>
        <span className="hidden text-base tabular-nums text-gray-700 sm:block">{fmt(p.date)}</span>
        <Download className="h-5 w-5 shrink-0 text-[#0A4A13] transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
        <span className="sr-only">(PDF, opens in a new tab)</span>
      </a>
    </li>
  );
}

export function Publications({ highlight }: { highlight: string | null }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>(
    highlight && /annual report/i.test(highlight) ? "Annual reports" : highlight && /monthly/i.test(highlight) ? "Monthly reports" : highlight && /^other$/i.test(highlight) ? "Other publications" : "Quarterly reports",
  );
  const qYears = useMemo(() => Array.from(new Set(quarterly.map((q) => q.qy))).sort((a, b) => b - a), []);
  const mYears = useMemo(() => Array.from(new Set(monthly.map((m) => Number(m.period.slice(0, 4))))).sort((a, b) => b - a), []);
  const [qYear, setQYear] = useState(qYears[0]);
  const [mYear, setMYear] = useState(mYears[0]);
  const reduce = useReducedMotion();

  const latestQ = quarterly.slice().sort((a, b) => b.qy - a.qy || b.q - a.q)[0];
  const magazine = other.find((o) => /chronicles/i.test(o.title)) ?? other[0];

  return (
    <section id="publications" aria-labelledby="pub-title" className={cn(sectionCls, "relative bg-[#FBF8F1]")}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="pub-title" eyebrow="Publications" title="Reports on the pension industry" highlight="pension industry" intro={`${publications.length} reports and publications, from monthly figures to annual reports. Every one is the official PDF.`} />
        <Rise className="mt-10">
          <Link to="/resources/reports/q1-2026" className={cn(calmCard, "flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8", focus)}>
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#117F21] to-[#CB9615]" />
            <Bubble />
            <span className="relative flex items-start gap-5">
              <IconTile icon={Newspaper} className="hidden sm:flex" />
              <span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-bold uppercase tracking-[0.14em] text-[#0A4A13]">New · Read online</span>
                <span className="mt-3 block text-2xl font-bold tracking-tight">Q1 2026 Quarterly Industry Report</span>
                <span className="mt-1 block text-lg text-gray-700">The dashboard, the Director-General’s read and the priorities for Q2, as a web page.</span>
              </span>
            </span>
            <span className={cn(goldBtn, "relative w-fit shrink-0")}>
              Read the report
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </Rise>

        {/* Featured covers */}
        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 lg:gap-14 lg:px-10">
          {latestQ && <Rise className={coverCls}><Cover p={latestQ} label={`Quarter ${latestQ.q} report`} big={`Q${latestQ.q} ’${String(latestQ.qy).slice(2)}`} tone="green" /></Rise>}
          {annual[0] && <Rise delay={0.1} className={coverCls}><Cover p={annual[0]} label="Annual report" big={String(annual[0].year)} tone="mint" /></Rise>}
          {magazine && <Rise delay={0.2} className={coverCls}><Cover p={magazine} label={magazine.title} big={String(magazine.year)} tone="gold" /></Rise>}
        </div>

        {/* Browser */}
        <div className="mt-16 rounded-[2rem] bg-white p-4 shadow-[0_30px_60px_-40px_rgba(10,74,19,0.45)] ring-1 ring-black/10 sm:p-8">
          <div role="tablist" aria-label="Publication types" className="flex gap-1.5 overflow-x-auto rounded-full bg-[#F1EFE8] p-1.5 [scrollbar-width:none]">
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "min-h-12 shrink-0 rounded-full px-5 text-lg font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]",
                  tab === t ? "bg-[#0A4A13] text-[#F4D27A] shadow-[0_10px_24px_-14px_rgba(10,74,19,0.8)]" : "text-[#14261A] hover:bg-white",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div role="tabpanel" aria-label={tab} className="pt-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -12 }} transition={{ duration: 0.25, ease }}>
                {tab === "Quarterly reports" && (
                  <>
                    <YearChips years={qYears} year={qYear} setYear={setQYear} />
                    <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[1, 2, 3, 4].map((n) => {
                        const r = quarterly.find((x) => x.qy === qYear && x.q === n);
                        return (
                          <motion.li key={`${qYear}-${n}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: n * 0.05, ease }}>
                            {r ? (
                              <a href={r.pdf} target="_blank" rel="noopener noreferrer" className={cn(calmCard, "flex aspect-[4/3] flex-col justify-between p-5", focus)}>
                                <Bubble />
                                <span className="relative text-5xl font-bold tracking-tight text-[#0A4A13]">Q{n}</span>
                                <span className="relative flex items-center justify-between text-lg text-gray-700">
                                  <span className="tabular-nums">{qYear} report</span>
                                  <Download className="h-5 w-5 text-[#0A4A13] transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
                                </span>
                                <span className="sr-only">{r.title}, PDF, opens in a new tab</span>
                              </a>
                            ) : (
                              <span className="flex aspect-[4/3] flex-col justify-between rounded-3xl border-2 border-dashed border-black/15 p-5 text-gray-600">
                                <span className="text-5xl font-bold">Q{n}</span>
                                <span className="text-lg">Not published</span>
                              </span>
                            )}
                          </motion.li>
                        );
                      })}
                    </ul>
                  </>
                )}

                {tab === "Monthly reports" && (
                  <>
                    <YearChips years={mYears} year={mYear} setYear={setMYear} />
                    <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                      {MONTHS.map((m, i) => {
                        const r = monthly.find((x) => x.period === `${mYear}-${String(i + 1).padStart(2, "0")}`);
                        return (
                          <motion.li key={`${mYear}-${m}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.025, ease }}>
                            {r ? (
                              <a href={r.pdf} target="_blank" rel="noopener noreferrer" className={cn(calmCard, "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#FBF8F1] hover:bg-white", focus)}>
                                <span className="text-xl font-bold">{m}</span>
                                <Download className="h-5 w-5 text-[#0A4A13] transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
                                <span className="sr-only">{r.title}, PDF, opens in a new tab</span>
                              </a>
                            ) : (
                              <span className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 text-gray-500" aria-label={`${m} ${mYear}: not available`}>
                                <span className="text-xl font-bold">{m}</span>
                              </span>
                            )}
                          </motion.li>
                        );
                      })}
                    </ul>
                  </>
                )}

                {tab === "Annual reports" && (
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {annual.map((a, i) => (
                      <motion.li key={a.pdf} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03, ease }}>
                        <a href={a.pdf} target="_blank" rel="noopener noreferrer" className={cn(calmCard, "flex aspect-[3/4] flex-col justify-end rounded-l-lg rounded-r-3xl p-4", focus)}>
                          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-[#CB9615]" />
                          <Bubble />
                          <span className="relative text-sm font-bold uppercase tracking-[0.14em] text-[#7A5200]">Annual report</span>
                          <span className="relative text-3xl font-bold text-[#0A4A13]">{a.year}</span>
                          <span className="sr-only">{a.title}, PDF, opens in a new tab</span>
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                )}

                {tab === "Annual accounts" && <ul className="space-y-3">{accounts.map((a) => <DocRow key={a.pdf} p={a} />)}</ul>}
                {tab === "Other publications" && <ul className="space-y-3">{other.map((a) => <DocRow key={a.pdf} p={a} />)}</ul>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Forms & downloads ─────────────────────────── */

const langNames: Record<string, string> = { Hausa: "Hausa", Yoruba: "Yorùbá", Igbo: "Igbo", Pidgin: "Naijá (Pidgin)" };

export function Downloads() {
  return (
    <section id="downloads" aria-labelledby="dl-title" className={cn(sectionCls, "bg-white")}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="dl-title" eyebrow="Forms and downloads" title="Forms, booklets and templates" highlight="booklets" />
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#7A5200]">Forms</h3>
            <ul className="mt-4 space-y-3">
              {forms.map((f, i) => (
                <motion.li key={f.pdf} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.05, ease }}>
                  <a href={f.pdf} target="_blank" rel="noopener noreferrer" className={cn(calmCard, "flex min-h-[4.5rem] items-center gap-4 rounded-2xl px-4 py-3 hover:-translate-y-0.5", focus)}>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-transform duration-300 group-hover:rotate-[-6deg]",
                        f.ext === "PDF" ? "bg-[#0A4A13] text-[#F4D27A]" : "bg-[#E8F5E9] text-[#0A4A13]",
                      )}
                    >
                      {f.ext}
                    </span>
                    <span className="flex-1 text-lg font-semibold">{f.title}</span>
                    <Download className="h-5 w-5 shrink-0 text-[#0A4A13] transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
                    <span className="sr-only">({f.ext}, opens in a new tab)</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="mt-4 text-lg text-gray-700">Employer, benefit and transfer forms are issued by your PFA. Ask your PFA for the current version.</p>
          </div>

          <div className="lg:col-span-5">
            <Rise className="h-full">
              <div className="relative isolate h-full overflow-hidden rounded-[2rem] bg-[#F1EFE8] p-6 sm:p-8">
                <span aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 -z-10 h-44 w-44 rounded-full bg-[#E8F5E9]" />
                <IconTile icon={Globe2} />
                <h3 className="mt-5 text-2xl font-bold tracking-tight">In your language</h3>
                <p className="mt-2 text-lg text-gray-700">Micro Pension questions and answers in Nigerian languages.</p>
                <ul className="mt-6 grid grid-cols-2 gap-3">
                  {booklets.filter((b) => b.lang).map((b) => (
                    <li key={b.pdf}>
                      <a
                        href={b.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        lang={b.lang === "Hausa" ? "ha" : b.lang === "Yoruba" ? "yo" : b.lang === "Igbo" ? "ig" : "pcm"}
                        className={cn(calmCard, "flex min-h-24 flex-col justify-between rounded-2xl p-4", focus)}
                      >
                        <span className="text-lg font-bold">{langNames[b.lang!]}</span>
                        <span className="flex items-center gap-1.5 text-base text-gray-700">
                          <Download className="h-4 w-4 text-[#0A4A13] transition-transform group-hover:translate-y-0.5" aria-hidden="true" /> PDF
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                {booklets.filter((b) => !b.lang).map((b) => (
                  <a key={b.pdf} href={b.pdf} target="_blank" rel="noopener noreferrer" className={cn(calmCard, "mt-3 flex min-h-14 items-center gap-3 rounded-2xl p-4 text-lg font-semibold hover:-translate-y-0.5", focus)}>
                    <BookOpen className="h-5 w-5 shrink-0 text-[#0A4A13]" aria-hidden="true" />
                    <span className="flex-1">{b.title}</span>
                    <Download className="h-5 w-5 shrink-0 text-[#0A4A13] transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </Rise>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Learning: the page's green inset panel ─────────────────────────── */

const videos = [
  // Titles and descriptions to be confirmed by Corporate Communications.
  { src: "/highlight-video2.mp4", poster: "/images/site/video-poster-team.webp", title: "PenCom at work", body: "A short film from the National Pension Commission." },
  { src: "/highlight-video.mp4", poster: "/images/site/video-poster-elders.webp", title: "PenCom highlights", body: "A short highlights film from the National Pension Commission." },
];

export function Learning({ openGuides }: { openGuides: () => void }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const v = videos[current];

  return (
    <section id="learning" aria-labelledby="learn-title" className={cn(sectionCls, "bg-[#FBF8F1]")}>
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-4 py-8 text-white sm:p-10 lg:p-14">
        <DarkBackdrop />
        <SectionHeading id="learn-title" dark eyebrow="Learning" title="Watch, listen and learn" highlight="listen and learn" intro="Videos about the scheme, and reading aids for every guide: listen aloud, bigger text, printable checklists." />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl bg-white text-[#14261A] shadow-[0_30px_60px_-34px_rgba(0,0,0,0.7)]">
              <div className="relative bg-black">
                {playing ? (
                  <video key={v.src} controls autoPlay poster={v.poster} className="aspect-video w-full" preload="metadata">
                    <source src={v.src} type="video/mp4" />
                  </video>
                ) : (
                  <button type="button" onClick={() => setPlaying(true)} className="group relative block aspect-video w-full overflow-hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]">
                    <img src={v.poster} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
                    <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F4D27A] text-[#1A1206] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] ring-8 ring-[#F4D27A]/30 transition duration-300 group-hover:scale-110 group-hover:bg-[#FFE08F]">
                      <Play className="ml-1 h-8 w-8 fill-current" aria-hidden="true" />
                    </span>
                    <span className="sr-only">Play video</span>
                  </button>
                )}
              </div>
              {/* Words below the video, never over the picture. */}
              <div className="p-5 sm:p-6">
                <p className="text-xl font-bold sm:text-2xl">{v.title}</p>
                <p className="mt-1 text-lg text-gray-700">{v.body}</p>
              </div>
            </div>
            <p className="mt-3 text-base text-white/85">Captions and transcripts will be added before launch.</p>
          </div>

          <div className="space-y-3 lg:col-span-4">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#F4D27A]">Playlist</p>
            {videos.map((x, i) => (
              <button
                key={x.src}
                type="button"
                aria-current={i === current ? "true" : undefined}
                onClick={() => {
                  setCurrent(i);
                  setPlaying(true);
                }}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-2xl p-3 text-left ring-1 transition duration-300 hover:-translate-y-0.5",
                  focus,
                  i === current ? "bg-white/[0.14] ring-2 ring-[#F4D27A]" : "bg-white/[0.07] ring-white/10 hover:bg-white/[0.12]",
                )}
              >
                <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                  <img src={x.poster} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4D27A] text-[#1A1206]">
                      <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
                    </span>
                  </span>
                </span>
                <span>
                  <span className="block text-lg font-semibold">{x.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-base text-white/80">{x.body}</span>
                </span>
              </button>
            ))}

            <div className="mt-6 rounded-3xl bg-white/[0.07] p-5 ring-1 ring-white/10">
              <p className="text-lg font-bold">Reading aids in every guide</p>
              <ul className="mt-3 space-y-2.5 text-lg text-white/85">
                <li className="flex items-center gap-3"><Headphones className="h-5 w-5 shrink-0 text-[#F4D27A]" aria-hidden="true" /> Listen to the guide read aloud</li>
                <li className="flex items-center gap-3"><Type className="h-5 w-5 shrink-0 text-[#F4D27A]" aria-hidden="true" /> Make the text bigger</li>
                <li className="flex items-center gap-3"><Printer className="h-5 w-5 shrink-0 text-[#F4D27A]" aria-hidden="true" /> Print a checklist to take with you</li>
              </ul>
              <button type="button" onClick={openGuides} className={cn(goldBtn, "mt-5 w-full sm:w-fit", focus)}>
                Browse the guides
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
