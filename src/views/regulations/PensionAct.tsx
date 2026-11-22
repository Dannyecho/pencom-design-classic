"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { BookOpen, Check, Download, ExternalLink, Gavel, Link2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spotlight, ease } from "@/views/about/primitives";
import { ArrowChip, DocHero, DocTools, GhostBtn, Loading, Mark, PdfCard, PrimaryBtn, ReadingBar, Toc, VerifyNote, ring, sizes, useDocJson } from "@/views/docs/kit";
import { card, listPanel, listRow } from "@/views/theme/ui";

/**
 * Pension Reform Act 2014 as a web page (DES-22; brief §6.2 Regulations: "Pension Reform Act 2014 (full act, key provisions)").
 * Text: OCR of the gazetted PDF (the PDF's own text layer is unreadable), checked against the Act's Arrangement of Sections.
 * Deep links: /regulations/pension-reform-act?s=7
 */

type Block = { m?: string; x: string; sub?: boolean };
type Section = { n: number; title: string; page: number; blocks: Block[] };
type Part = { n: string; title: string; sections: Section[] };
type Act = { parts: Part[]; schedules: { title: string; blocks: Block[] }[] };

const PDF = "/documents/pension-reform-act-2014.pdf";
const POPULAR = [4, 7, 8, 11, 13, 16, 89, 99];
/** Labelled section tools: 44 px outline buttons that fill green on hover. */
const toolBtn = cn("inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-[#117F21] transition hover:border-[#117F21] hover:bg-[#117F21] hover:text-white", ring);
/** Section number tile: mint, filling green on hover (inside a `group`). */
const numTile = "flex shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] px-2 font-bold tabular-nums text-[#0A4A13] transition duration-300 group-hover:bg-[#117F21] group-hover:text-white";
/** Offset for the site header (92 px) plus the sticky search bar. */
const anchor = "scroll-mt-[270px] md:scroll-mt-[200px]";

function Blocks({ blocks, q }: { blocks: Block[]; q: string }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <p key={i} className={cn("font-serif leading-[1.75] text-gray-800", b.sub ? "pl-8 sm:pl-12" : b.m ? "pl-8" : "")}>
          {b.m && <span className={cn("-ml-8 inline-block w-8 font-mono text-[0.9em] font-bold", b.sub ? "text-gray-600" : "text-[#117F21]")}>{b.m}</span>}
          <Mark text={b.x} q={q} />
        </p>
      ))}
    </div>
  );
}

function SectionCard({ s, q, partN, active }: { s: Section; q: string; partN: string; active: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const url = `${location.origin}/regulations/pension-reform-act?s=${s.n}`;
    navigator.clipboard?.writeText(url).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <motion.article
      id={`s-${s.n}`} aria-labelledby={`s-${s.n}-t`}
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, ease }}
      className={cn("group relative overflow-hidden rounded-3xl border bg-white p-6 transition duration-300 hover:shadow-[0_24px_50px_-24px_rgba(10,74,19,0.4)] sm:p-8 print:break-inside-avoid print:border-0 print:p-0", anchor, active ? "border-[#CB9615] ring-2 ring-[#CB9615] shadow-[0_28px_50px_-30px_rgba(122,82,0,0.5)]" : "border-gray-200/80 hover:border-[#117F21]/30")}
    >
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1 origin-top bg-gradient-to-b from-[#117F21] to-[#CB9615] transition-transform duration-500 group-hover:scale-y-100 print:hidden", active ? "scale-y-100" : "scale-y-0")} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <span className={cn(numTile, "h-12 min-w-12 text-lg", active && "bg-[#CB9615] text-[#1A1206]")}><span className="sr-only">Section </span>{s.n}</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7A5200]">Part {partN} · Section {s.n}</p>
            <h3 id={`s-${s.n}-t`} className="mt-1 text-xl font-bold leading-snug tracking-tight text-[#0A2E10]"><Mark text={s.title} q={q} /></h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 print:hidden">
          <button type="button" onClick={copy} className={toolBtn}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied" : "Copy link"}<span className="sr-only"> to section {s.n}</span>
          </button>
          {s.page > 0 && (
            <a href={`${PDF}#page=${s.page}`} target="_blank" rel="noopener noreferrer" className={toolBtn}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> PDF page {s.page}<span className="sr-only"> (opens the official PDF in a new tab)</span>
            </a>
          )}
        </div>
      </header>
      <div className="mt-5"><Blocks blocks={s.blocks} q={q} /></div>
    </motion.article>
  );
}

export default function PensionAct() {
  const reduce = useReducedMotion();
  const { status, data } = useDocJson<Act>("/documents/text/pension-reform-act-2014.json");
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const dq = useDeferredValue(q);
  const [size, setSize] = useState(0);

  const all = useMemo(() => (data ? data.parts.flatMap((p) => p.sections.map((s) => ({ ...s, part: p }))) : []), [data]);
  const matches = useMemo(() => {
    const t = dq.trim().toLowerCase();
    if (t.length < 2) return null;
    return all.filter((s) => `${s.n} ${s.title} ${s.blocks.map((b) => b.x).join(" ")}`.toLowerCase().includes(t)).map((s) => s.n);
  }, [all, dq]);
  const shown = useMemo(() => (matches ? new Set(matches) : null), [matches]);

  const toc = useMemo(
    () => (data ? data.parts.flatMap((p) => [{ id: `part-${p.n}`, label: `Part ${p.n} · ${p.title}`, level: 1 }, ...p.sections.filter((s) => !shown || shown.has(s.n)).map((s) => ({ id: `s-${s.n}`, label: `${s.n}. ${s.title}`, level: 2 }))]).concat(data.schedules.map((s, i) => ({ id: `sch-${i}`, label: s.title, level: 1 }))) : []),
    [data, shown],
  );

  // Deep link to a section
  useEffect(() => {
    const s = params.get("s");
    if (!s || status !== "ready") return;
    const t = window.setTimeout(() => document.getElementById(`s-${s}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 120);
    return () => window.clearTimeout(t);
  }, [params, status, reduce]);

  const go = (n: number) => {
    setQ("");
    const next = new URLSearchParams(params);
    next.set("s", String(n));
    setParams(next, { replace: true, preventScrollReset: true });
    window.setTimeout(() => document.getElementById(`s-${n}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 60);
  };

  return (
    <MotionConfig reducedMotion="user">
      <ReadingBar />
      <DocHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Regulations", to: "/regulations" }, { label: "Pension Reform Act 2014" }]}
        kind="Act of the National Assembly"
        icon={<Gavel className="h-3.5 w-3.5" aria-hidden="true" />}
        title="Pension Reform Act 2014"
        badge={<span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-sm font-bold text-[#0A4A13] ring-1 ring-[#117F21]/20"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#117F21]" />In force</span>}
        lead="This Act repeals the Pension Reform Act No. 2, 2004 and enacts the Pension Reform Act, 2014 to continue to govern and regulate the administration of the uniform contributory pension scheme for both the public and private sectors in Nigeria."
        meta={[
          { label: "Signed into law", value: "1 July 2014" },
          { label: "Repeals", value: "Pension Reform Act 2004" },
          { label: "Parts", value: data ? data.parts.length : 15 },
          { label: "Sections", value: data ? all.length : 121 },
        ]}
        actions={<>
          <PrimaryBtn href={PDF} external><Download className="h-4 w-4" aria-hidden="true" /> Official PDF</PrimaryBtn>
          <GhostBtn href="/regulations#act"><BookOpen className="h-4 w-4" aria-hidden="true" /> Key provisions in plain English</GhostBtn>
        </>}
      />

      <div className="bg-white text-[#0A2E10]">
        {/* Search bar: a solid white pill that stays under the site header */}
        <div className="sticky top-[92px] z-20 bg-white/95 px-4 pb-3 pt-4 backdrop-blur print:hidden">
          <div className="mx-auto max-w-7xl">
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-white/95 p-1.5 shadow-[0_20px_40px_-28px_rgba(4,36,10,0.55)] ring-1 ring-gray-200 backdrop-blur md:flex-row md:items-center">
            <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
            <label className="flex flex-1 items-center gap-3 rounded-xl bg-[#F4F7F2] pl-4 pr-1 ring-1 ring-gray-200 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-[#FFD84D]">
              <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
              <span className="sr-only">Search the Act</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the Act, e.g. “retirement savings account”, “penalty”, “death”" className="min-h-12 w-full min-w-0 bg-transparent text-base placeholder:text-gray-600 focus:outline-none focus-visible:outline-none focus-visible:ring-0" />
              {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search" className={cn("inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#0A4A13] transition hover:bg-white", ring)}><X className="h-4 w-4" aria-hidden="true" />Clear</button>}
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 md:justify-end md:px-2 md:pb-0">
              <p className={cn("text-sm text-gray-600 md:w-56", !matches && "hidden sm:block")} aria-live="polite">
                {matches ? <><strong className="rounded-full bg-[#04240A] px-2.5 py-0.5 tabular-nums text-[#F4D27A]">{matches.length}</strong> section{matches.length === 1 ? "" : "s"} mention “{dq.trim()}”</> : "Search across all 121 sections"}
              </p>
              <div className="lg:hidden"><DocTools size={size} setSize={setSize} /></div>
            </div>
          </div>
        </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-20 pt-7 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden lg:block print:hidden">
            <div className="sticky top-[192px] space-y-4">
              {data && <Toc items={toc} title={matches ? "Matching sections" : "Arrangement of sections"} className="[&_ol]:max-h-[calc(100vh-25rem)]" />}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">Text size</span>
                <DocTools size={size} setSize={setSize} />
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-10">
            {status === "ready" && !matches && (
              <section aria-labelledby="pop-title" className="print:hidden">
                <h2 id="pop-title" className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                  <span aria-hidden="true" className="h-1 w-10 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
                  Most looked-up sections
                </h2>
                <Spotlight className="mt-5 rounded-3xl">
                <ul className={cn(listPanel, "grid grid-cols-1 divide-y-0 bg-gray-100 gap-px sm:grid-cols-2 xl:grid-cols-4")}>
                  {POPULAR.map((n, i) => {
                    const s = all.find((x) => x.n === n);
                    if (!s) return null;
                    return (
                      <motion.li key={n} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease }} className="h-full bg-white/95">
                        <button type="button" onClick={() => go(n)} className={cn(listRow, "relative h-full w-full flex-col items-stretch gap-4 p-5 text-left sm:px-5")}>
                          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#117F21] to-[#CB9615] transition-transform duration-500 group-hover:scale-x-100" />
                          <span className="flex items-center justify-between gap-2">
                            <span className={cn(numTile, "h-11 min-w-11")}><span className="sr-only">Section </span>{n}</span>
                            <ArrowChip />
                          </span>
                          <span className="font-bold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{s.title}</span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
                </Spotlight>
              </section>
            )}

            {status === "loading" && <Loading />}
            {status === "error" && <p className="rounded-3xl border border-gray-200/80 bg-white p-8 text-center">The web version could not be loaded. <a href={PDF} className="font-semibold text-[#117F21] underline">Open the official PDF</a>.</p>}

            {data && (
              <div className="space-y-12" style={{ fontSize: sizes[size] }}>
                {data.parts.map((p) => {
                  const secs = p.sections.filter((s) => !shown || shown.has(s.n));
                  if (!secs.length) return null;
                  return (
                    <section key={p.n} id={`part-${p.n}`} aria-labelledby={`part-${p.n}-t`} className={anchor}>
                      <motion.div
                        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, ease }}
                        className="relative isolate flex flex-col gap-5 overflow-hidden rounded-2xl border border-gray-200/80 bg-[#F4F7F2] px-5 py-6 sm:flex-row sm:items-center sm:px-7 print:border-0 print:bg-white"
                      >
                        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#117F21] to-[#CB9615] print:hidden" />
                        <span aria-hidden="true" className="flex h-14 min-w-14 shrink-0 items-center justify-center self-start rounded-2xl bg-[#04240A] px-3 font-serif text-xl font-bold text-[#F4D27A] shadow-[0_12px_24px_-12px_rgba(4,36,10,0.9)] sm:self-auto">{p.n}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">Part {p.n}</p>
                          <h2 id={`part-${p.n}-t`} className="mt-1 max-w-3xl text-2xl font-bold leading-[1.15] tracking-tight sm:text-3xl">{p.title}</h2>
                          <p className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                            <span aria-hidden="true" className="h-1 w-10 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
                            Sections {p.sections[0].n} to {p.sections[p.sections.length - 1].n}
                          </p>
                        </div>
                      </motion.div>
                      <div className="mt-4 space-y-4">
                        {secs.map((s) => <SectionCard key={s.n} s={s} q={dq} partN={p.n} active={params.get("s") === String(s.n)} />)}
                      </div>
                    </section>
                  );
                })}
                {!matches && data.schedules.map((s, i) => (
                  <section key={s.title} id={`sch-${i}`} className={cn("relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8", anchor)}>
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
                    <p className="inline-flex rounded-full border border-[#117F21]/15 bg-[#E8F5E9] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0A4A13]">Schedule</p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{s.title}</h2>
                    <div className="mt-5"><Blocks blocks={s.blocks} q="" /></div>
                    {i === 1 && <p className="mt-5 text-base text-gray-600">The formula tables in this Schedule are easier to read in the <a href={`${PDF}#page=60`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#117F21] underline">official PDF</a>.</p>}
                  </section>
                ))}
                <AnimatePresence>
                  {matches && matches.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-10 text-center">
                      <p className="text-xl font-bold">No section mentions “{dq.trim()}”.</p>
                      <p className="mt-2 text-gray-600">Try a shorter word, or ask the PenCom Assistant.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="space-y-4 print:hidden">
              <VerifyNote>This web version was prepared from the gazetted copy of the Act using text recognition, so it is easier to read, search and link to. Legal Services will check it against the gazette before publication. If the two ever differ, the gazetted text is authoritative.</VerifyNote>
              <PdfCard href={PDF} title="Pension Reform Act 2014 (gazetted copy)" meta="PDF · 62 pages · 1.2 MB" />
              <Link to="/regulations#library" className={cn(card, "group flex items-center justify-between gap-4 p-6 text-lg font-bold text-[#0A2E10] hover:text-[#117F21]", ring)}>
                <span>Regulations, guidelines and circulars issued under the Act</span>
                <ArrowChip />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
