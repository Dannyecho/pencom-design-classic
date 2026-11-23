"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Link } from "@/lib/router";
import { ArrowRight, BookOpen, Download, FileText, Globe2, Headphones, Newspaper, Play, Printer, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight } from "@/views/about/primitives";
import { DarkBand, Rise, Tile, card, chip, ease, focus, goldBtn, listPanel, listRow } from "@/views/theme/ui";
import { SectionHeading } from "./compat";
import { forms, publications, type Publication } from "./publications";

/**
 * Resources part 2 (classic): publications and forms sit in the portal grid's main column as list panels with
 * cover thumbnails; learning (video) is the page's one full-width dark band.
 */

/** A section inside the portal grid: no side padding or band colour, a grey rule between sections. */
export const portalSec = "scroll-mt-[150px] border-t border-gray-100 py-14 first:border-t-0 sm:py-16";

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

/* ─────────────────────────── Covers and thumbnails ─────────────────────────── */

type Tone = "green" | "gold" | "mint";
const toneBg: Record<Tone, string> = {
  green: "bg-gradient-to-br from-[#11421A] via-[#105D1D] to-[#14892A] text-white",
  gold: "bg-[#F4D27A] text-[#1A1206]",
  mint: "bg-[#E8F5E9] text-[#105D1D] ring-1 ring-inset ring-[#105D1D]/15",
};

/** A large cover for the three latest titles: wide on phones, a portrait book from `sm` up. */
function Cover({ p, label, big, tone }: { p: Publication; label: string; big: string; tone: Tone }) {
  const sub = { green: "text-white/80", gold: "text-[#1A1206]/80", mint: "text-[#105D1D]/80" }[tone];
  const bar = { green: "bg-[#F4D27A]", gold: "bg-[#105D1D]", mint: "bg-[#CB9615]" }[tone];
  const tag = { green: "bg-[#CB9615] text-[#1A1206]", gold: "bg-[#11421A] text-[#F4D27A]", mint: "bg-[#11421A] text-[#F4D27A]" }[tone];
  return (
    <a href={p.pdf} target="_blank" rel="noopener noreferrer" className={cn("group block rounded-2xl", focus)}>
      <span
        className={cn(
          "relative isolate block aspect-[16/10] w-full overflow-hidden rounded-r-2xl rounded-l-md p-5 shadow-[0_24px_44px_-26px_rgba(16,93,29,0.6)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_36px_60px_-30px_rgba(16,93,29,0.7)] sm:aspect-[3/4] sm:p-6",
          toneBg[tone],
        )}
      >
        {tone === "green" && <GridBackdrop className="-z-10" />}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2.5 bg-black/15" />
        <span aria-hidden="true" className="absolute -bottom-16 -right-16 -z-10 h-44 w-44 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-125" />
        <span className="relative flex h-full flex-col pl-1">
          <span className={cn("text-xs font-bold uppercase tracking-[0.16em]", sub)}>National Pension Commission</span>
          <span aria-hidden="true" className={cn("mt-3 h-[3px] w-10 rounded-full transition-all duration-500 group-hover:w-20", bar)} />
          <span className="mt-auto block text-5xl font-bold leading-none tracking-tight">{big}</span>
          <span className="mt-2 block text-lg font-bold leading-tight">{label}</span>
          <span className={cn("mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", tag)}>
            <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" /> PDF
          </span>
        </span>
      </span>
      <span className="mt-3 block text-center text-sm text-gray-600">
        Published {fmt(p.date)}
        <span className="sr-only">. {p.title}, opens in a new tab</span>
      </span>
    </a>
  );
}

/** A small book thumbnail at the start of a list row; it tips on row hover. */
function Thumb({ tone, children, empty = false }: { tone: Tone; children: ReactNode; empty?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex h-14 w-11 shrink-0 flex-col justify-end overflow-hidden rounded-r-lg rounded-l-sm px-1.5 pb-1.5 text-xs font-bold leading-none transition duration-300",
        empty ? "border-2 border-dashed border-gray-300 text-gray-500" : cn(toneBg[tone], "shadow-[0_10px_20px_-12px_rgba(16,93,29,0.8)] group-hover:-translate-y-0.5 group-hover:-rotate-6"),
      )}
    >
      {!empty && <span className="absolute inset-y-0 left-0 w-1 bg-black/15" />}
      {!empty && <span className={cn("absolute left-2 top-2 h-0.5 w-4 rounded-full", tone === "gold" ? "bg-[#105D1D]" : "bg-[#CB9615]")} />}
      <span className="relative">{children}</span>
    </span>
  );
}

/** One downloadable title as a list-panel row. */
function PubRow({ href, thumb, title, sub, date, srTitle }: { href: string; thumb: ReactNode; title: string; sub?: string; date: string; srTitle: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(listRow, "min-h-[4.5rem] py-3")}>
      {thumb}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug text-[#164D20] group-hover:text-[#117F21]">{title}</span>
        {sub && <span className="mt-0.5 block text-sm text-gray-600">{sub}</span>}
        <span className="mt-0.5 block text-sm tabular-nums text-gray-600 sm:hidden">{fmt(date)}</span>
      </span>
      <span className="hidden shrink-0 text-sm tabular-nums text-gray-600 sm:block">{fmt(date)}</span>
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#117F21] transition group-hover:bg-[#14892A] group-hover:text-white">
        <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
      </span>
      <span className="sr-only">
        {srTitle}, PDF, opens in a new tab
      </span>
    </a>
  );
}

/* ─────────────────────────── Publications ─────────────────────────── */

const tabs = ["Quarterly reports", "Monthly reports", "Annual reports", "Annual accounts", "Other publications"] as const;

/** Years as a row of small chips with a sliding green pill; scrolls sideways in its own box on phones. */
function YearChips({ id, years, year, setYear }: { id: string; years: number[]; year: number; setYear: (y: number) => void }) {
  return (
    <LayoutGroup id={id}>
      <div role="group" aria-label="Year" className="flex gap-1 overflow-x-auto rounded-xl bg-[#F4F7F2] p-1 [scrollbar-width:thin]">
        {years.map((y) => {
          const on = y === year;
          return (
            <button
              key={y}
              type="button"
              aria-pressed={on}
              onClick={() => setYear(y)}
              className={cn(
                "relative min-h-11 shrink-0 rounded-lg px-3.5 text-sm font-semibold tabular-nums transition",
                on ? "text-white" : "text-gray-700 hover:bg-white hover:text-[#105D1D]",
                "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]",
              )}
            >
              {on && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-lg bg-[#14892A]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{y}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
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
  const item = { initial: { opacity: 0, y: reduce ? 0 : 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <section id="publications" aria-labelledby="pub-title" className={portalSec}>
      <SectionHeading id="pub-title" eyebrow="Publications" title="Reports on the pension industry" highlight="pension industry" intro={`${publications.length} reports and publications, from monthly figures to annual reports. Every one is the official PDF.`} />

      {/* New: the Q1 report as a web page */}
      <Rise className="mt-8">
        <Link to="/resources/reports/q1-2026" className={cn(card, "group relative flex flex-col gap-5 overflow-hidden p-6 pl-7 sm:flex-row sm:items-center sm:justify-between", focus)}>
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#14892A] to-[#CB9615]" />
          <span className="flex items-start gap-4">
            <Tile icon={Newspaper} dark className="hidden sm:flex" />
            <span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#105D1D]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#14892A]" aria-hidden="true" />
                New · Read online
              </span>
              <span className="mt-2 block text-xl font-bold text-[#164D20]">Q1 2026 Quarterly Industry Report</span>
              <span className="mt-1 block text-gray-600">The dashboard, the Director-General’s read and the priorities for Q2, as a web page.</span>
            </span>
          </span>
          <span className={cn(goldBtn, "w-fit shrink-0")}>
            Read the report
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      </Rise>

      {/* Latest covers */}
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
        {latestQ && (
          <Rise>
            <Cover p={latestQ} label={`Quarter ${latestQ.q} report`} big={`Q${latestQ.q} ’${String(latestQ.qy).slice(2)}`} tone="green" />
          </Rise>
        )}
        {annual[0] && (
          <Rise delay={0.08}>
            <Cover p={annual[0]} label="Annual report" big={String(annual[0].year)} tone="mint" />
          </Rise>
        )}
        {magazine && (
          <Rise delay={0.16}>
            <Cover p={magazine} label={magazine.title} big={String(magazine.year)} tone="gold" />
          </Rise>
        )}
      </div>

      {/* Browser: type tabs as a segmented control, then a list panel */}
      <div className="mt-12">
        <LayoutGroup id="pub-tabs">
          <div role="tablist" aria-label="Publication types" className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 ring-1 ring-gray-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => {
              const on = tab === t;
              return (
                <button
                  key={t}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setTab(t)}
                  className={cn(
                    "relative min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold transition sm:text-base",
                    on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#105D1D]",
                    "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]",
                  )}
                >
                  {on && <motion.span layoutId="pub-tab-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#105D1D] to-[#14892A] shadow-[0_10px_24px_-12px_rgba(16,93,29,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{t}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div role="tabpanel" aria-label={tab} className="pt-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -12 }} transition={{ duration: 0.25, ease }}>
              {tab === "Quarterly reports" && (
                <>
                  <YearChips id="pub-qyear" years={qYears} year={qYear} setYear={setQYear} />
                  <Spotlight className={cn(listPanel, "mt-4")}>
                    <ul className="divide-y divide-gray-100">
                      {[1, 2, 3, 4].map((n, i) => {
                        const r = quarterly.find((x) => x.qy === qYear && x.q === n);
                        return (
                          <motion.li key={`${qYear}-${n}`} {...item} transition={{ duration: 0.3, delay: i * 0.04, ease }}>
                            {r ? (
                              <PubRow href={r.pdf} thumb={<Thumb tone="green">Q{n}</Thumb>} title={r.title} date={r.date} srTitle={r.title} />
                            ) : (
                              <div className="flex min-h-[4.5rem] items-center gap-4 px-5 py-3 text-gray-600 sm:px-6">
                                <Thumb tone="green" empty>
                                  Q{n}
                                </Thumb>
                                <span className="flex-1">
                                  <span className="block font-semibold">
                                    Q{n} {qYear}
                                  </span>
                                  <span className="block text-sm">Not published</span>
                                </span>
                              </div>
                            )}
                          </motion.li>
                        );
                      })}
                    </ul>
                  </Spotlight>
                </>
              )}

              {tab === "Monthly reports" && (
                <>
                  <YearChips id="pub-myear" years={mYears} year={mYear} setYear={setMYear} />
                  <ul className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-3xl border border-gray-200/80 bg-gray-200/80 sm:grid-cols-4 lg:grid-cols-6">
                    {MONTHS.map((m, i) => {
                      const r = monthly.find((x) => x.period === `${mYear}-${String(i + 1).padStart(2, "0")}`);
                      return (
                        <motion.li key={`${mYear}-${m}`} {...item} transition={{ duration: 0.25, delay: i * 0.02, ease }} className="bg-white">
                          {r ? (
                            <a
                              href={r.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex min-h-24 flex-col items-center justify-center gap-2 transition hover:bg-[#F7FAF6] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]"
                            >
                              <span className="text-lg font-bold text-[#164D20] group-hover:text-[#117F21]">{m}</span>
                              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F5E9] text-[#117F21] transition group-hover:bg-[#14892A] group-hover:text-white">
                                <Download className="h-4 w-4" />
                              </span>
                              <span className="sr-only">{r.title}, PDF, opens in a new tab</span>
                            </a>
                          ) : (
                            <span className="flex min-h-24 flex-col items-center justify-center gap-1 bg-[#F7FAF6] text-gray-500" aria-label={`${m} ${mYear}: not available`}>
                              <span className="text-lg font-bold">{m}</span>
                              <span aria-hidden="true" className="h-0.5 w-5 rounded-full bg-gray-300" />
                            </span>
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>
                </>
              )}

              {tab === "Annual reports" && (
                <Spotlight className="rounded-3xl border border-gray-200/80">
                  <ul className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
                    {annual.map((a, i) => (
                      <motion.li key={a.pdf} {...item} transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.03, ease }} className="bg-white">
                        <PubRow href={a.pdf} thumb={<Thumb tone="gold">{a.year}</Thumb>} title={a.title} date={a.date} srTitle={a.title} />
                      </motion.li>
                    ))}
                  </ul>
                </Spotlight>
              )}

              {tab === "Annual accounts" && (
                <ul className={listPanel}>
                  {accounts.map((a) => (
                    <li key={a.pdf}>
                      <PubRow href={a.pdf} thumb={<Thumb tone="mint">{a.title.match(/(19|20)\d\d/)?.[0] ?? a.year}</Thumb>} title={a.title} date={a.date} srTitle={a.title} />
                    </li>
                  ))}
                </ul>
              )}

              {tab === "Other publications" && (
                <ul className={listPanel}>
                  {other.map((a) => (
                    <li key={a.pdf}>
                      <PubRow
                        href={a.pdf}
                        thumb={
                          <Thumb tone="mint">
                            <FileText className="h-4 w-4" />
                          </Thumb>
                        }
                        title={a.title}
                        date={a.date}
                        srTitle={a.title}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Forms & downloads ─────────────────────────── */

const langNames: Record<string, string> = { Hausa: "Hausa", Yoruba: "Yorùbá", Igbo: "Igbo", Pidgin: "Naijá (Pidgin)" };

export function Downloads() {
  return (
    <section id="downloads" aria-labelledby="dl-title" className={portalSec}>
      <SectionHeading id="dl-title" eyebrow="Forms and downloads" title="Forms, booklets and templates" highlight="booklets" />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">Forms</h3>
          <Spotlight className={cn(listPanel, "mt-3")}>
            <ul className="divide-y divide-gray-100">
              {forms.map((f) => (
                <li key={f.pdf}>
                  <a href={f.pdf} target="_blank" rel="noopener noreferrer" className={cn(listRow, "min-h-[4.5rem] py-3")}>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition duration-300 group-hover:-rotate-6",
                        f.ext === "PDF" ? "bg-[#11421A] text-[#F4D27A]" : "bg-[#E8F5E9] text-[#105D1D]",
                      )}
                    >
                      {f.ext}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold leading-snug text-[#164D20] group-hover:text-[#117F21]">{f.title}</span>
                    <Download className="h-5 w-5 shrink-0 text-[#117F21] transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
                    <span className="sr-only">({f.ext}, opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </Spotlight>
          <p className="mt-4 text-gray-600">Employer, benefit and transfer forms are issued by your PFA. Ask your PFA for the current version.</p>
        </div>

        <div className="lg:col-span-5">
          <Rise className="h-full">
            <div className="h-full rounded-3xl bg-[#F4F7F2] p-6">
              <Tile icon={Globe2} dark />
              <h3 className="mt-4 text-xl font-bold text-[#164D20]">In your language</h3>
              <p className="mt-1 text-gray-600">Micro Pension questions and answers in Nigerian languages.</p>
              <ul className="mt-5 grid grid-cols-2 gap-3">
                {booklets
                  .filter((b) => b.lang)
                  .map((b) => (
                    <li key={b.pdf}>
                      <a
                        href={b.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        lang={b.lang === "Hausa" ? "ha" : b.lang === "Yoruba" ? "yo" : b.lang === "Igbo" ? "ig" : "pcm"}
                        className={cn(card, "group flex min-h-24 flex-col justify-between rounded-2xl p-4", focus)}
                      >
                        <span className="font-bold text-[#164D20] group-hover:text-[#117F21]">{langNames[b.lang!]}</span>
                        <span className={cn(chip, "w-fit")}>
                          <Download className="h-3.5 w-3.5 text-[#117F21] transition-transform group-hover:translate-y-0.5" aria-hidden="true" /> PDF
                        </span>
                      </a>
                    </li>
                  ))}
              </ul>
              {booklets
                .filter((b) => !b.lang)
                .map((b) => (
                  <a key={b.pdf} href={b.pdf} target="_blank" rel="noopener noreferrer" className={cn(card, "group mt-3 flex min-h-14 items-center gap-3 rounded-2xl p-4 font-semibold text-[#164D20]", focus)}>
                    <BookOpen className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                    <span className="flex-1 group-hover:text-[#117F21]">{b.title}</span>
                    <Download className="h-5 w-5 shrink-0 text-[#117F21] transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                  </a>
                ))}
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Learning: the page's dark band ─────────────────────────── */

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
    <DarkBand id="learning" labelledBy="learn-title">
      <SectionHeading id="learn-title" dark eyebrow="Learning" title="Watch, listen and learn" highlight="listen and learn" intro="Videos about the scheme, and reading aids for every guide: listen aloud, bigger text, printable checklists." />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <Rise className="lg:col-span-8">
          <div className="overflow-hidden rounded-3xl bg-white/[0.06] shadow-[0_30px_60px_-34px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur">
            <div className="relative bg-black">
              {playing ? (
                <video key={v.src} controls autoPlay poster={v.poster} className="aspect-video w-full" preload="metadata">
                  <source src={v.src} type="video/mp4" />
                </video>
              ) : (
                <button type="button" onClick={() => setPlaying(true)} className="group relative block aspect-video w-full overflow-hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]">
                  <img src={v.poster} alt="" className="absolute inset-0 h-full w-full object-cover transition [transition-duration:1200ms] group-hover:scale-105" />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0D3416]/60 via-transparent to-transparent" />
                  <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[#CB9615]/30 [animation-duration:2.4s] motion-reduce:animate-none" />
                  <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#CB9615] text-[#1A1206] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] ring-8 ring-[#CB9615]/25 transition duration-300 group-hover:scale-110 group-hover:bg-[#E0AA22]">
                    <Play className="ml-1 h-8 w-8 fill-current" aria-hidden="true" />
                  </span>
                  <span className="sr-only">Play video</span>
                </button>
              )}
            </div>
            {/* Words below the video, never over the picture. */}
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <span aria-hidden="true" className="mt-1 h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#F4D27A] to-[#14892A]" />
              <div>
                <p className="text-xl font-bold text-white">{v.title}</p>
                <p className="mt-1 text-white/75">{v.body}</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-white/75">Captions and transcripts will be added before launch.</p>
        </Rise>

        <Rise delay={0.1} className="space-y-3 lg:col-span-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">Playlist</p>
          <LayoutGroup id="learn-list">
            {videos.map((x, i) => {
              const on = i === current;
              return (
                <button
                  key={x.src}
                  type="button"
                  aria-current={on ? "true" : undefined}
                  onClick={() => {
                    setCurrent(i);
                    setPlaying(true);
                  }}
                  className={cn(
                    "group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl p-3 text-left ring-1 transition duration-300 hover:-translate-y-0.5",
                    focus,
                    on ? "bg-white/[0.12] ring-[#F4D27A]/60" : "bg-white/[0.05] ring-white/10 hover:bg-white/[0.09]",
                  )}
                >
                  {on && <motion.span layoutId="learn-now" aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#CB9615]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                    <img src={x.poster} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CB9615] text-[#1A1206]">
                        <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
                      </span>
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-white">{x.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-white/75">{x.body}</span>
                  </span>
                </button>
              );
            })}
          </LayoutGroup>

          <div className="!mt-6 rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10">
            <p className="text-lg font-bold text-white">Reading aids in every guide</p>
            <ul className="mt-3 space-y-2.5 text-white/80">
              <li className="flex items-center gap-3">
                <Headphones className="h-5 w-5 shrink-0 text-[#F4D27A]" aria-hidden="true" /> Listen to the guide read aloud
              </li>
              <li className="flex items-center gap-3">
                <Type className="h-5 w-5 shrink-0 text-[#F4D27A]" aria-hidden="true" /> Make the text bigger
              </li>
              <li className="flex items-center gap-3">
                <Printer className="h-5 w-5 shrink-0 text-[#F4D27A]" aria-hidden="true" /> Print a checklist to take with you
              </li>
            </ul>
            <button type="button" onClick={openGuides} className={cn(goldBtn, "group mt-5 w-full sm:w-fit")}>
              Browse the guides
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </Rise>
      </div>
    </DarkBand>
  );
}
