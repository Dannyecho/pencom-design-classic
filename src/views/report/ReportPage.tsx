"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { AlertTriangle, BarChart3, CheckCircle2, Download, Flag, Lightbulb, Quote, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight, Tilt, ease, reveal } from "@/views/about/primitives";
import { card as liftCard, featured, focus, outlineDarkBtn } from "@/views/theme/ui";
import { SectionHeading } from "@/views/theme/heading";
import { ArrowChip, DocHero, DocTools, Loading, PdfCard, PrimaryBtn, ReadingBar, Toc, VerifyNote, ring, sizes, useDocJson } from "@/views/docs/kit";

/**
 * Industry report as a web page with the PDF attached (DES-22: "industry reports ... available as web pages").
 * Text and figures: PenCom Q1 2026 Quarterly Industry Report (published April 2026). Tiles and domain statuses are
 * transcribed from the report's Executive Dashboard; chapter text is extracted from the PDF.
 */

type Para = { x: string; b: boolean; insight: boolean };
type Chapter = { n: string; title: string; blocks: Para[]; subs: { n: string; title: string; blocks: Para[] }[] };

const PDF = "/documents/q1-2026-industry-report.pdf";

const STATUS: Record<string, string> = {
  "On track": "bg-[#E8F5E9] text-[#105D1D]",
  Improving: "bg-[#E0F2F1] text-[#00695C]",
  Watch: "bg-[#FFF3CD] text-[#7A5600]",
  Critical: "bg-[#FDECEC] text-[#9B1C1C]",
  "Strong quarter": "bg-[#FFF8E1] text-[#7A5600]",
  Stable: "bg-[#E8F5E9] text-[#105D1D]",
  Mixed: "bg-[#FFF3CD] text-[#7A5600]",
};

/** Dot colour per status, for the domain list. */
const DOT: Record<string, string> = { Stable: "bg-[#14892A]", Improving: "bg-[#00897B]", Watch: "bg-[#CB9615]", Mixed: "bg-[#CB9615]", Critical: "bg-[#B52026]" };
/** Static content card (no lift); `liftCard` is the theme's card with the 2 px hover lift. */
const card = "rounded-3xl border border-gray-200/80 bg-white";

const tiles = [
  { k: "Pension assets (NAV)", v: "₦29.52tn", note: "+7.53% on Q4 2025. Equity revaluation of ₦1.50 trillion drove most of the growth.", s: "On track" },
  { k: "Q1 contributions", v: "₦559.4bn", note: "Public 50.9%, private 49.1%. Lower than Q4’s ₦903.7 billion, which was raised by public-sector arrears.", s: "On track" },
  { k: "New RSAs in Q1", v: "143,248", note: "75.31% under age 40. Cumulative RSAs of 11.18 million.", s: "Improving" },
  { k: "Accrued rights paid", v: "₦11.19bn", note: "4,592 beneficiaries. FGN-funded legacy obligations honoured on schedule.", s: "On track" },
  { k: "Real return (36-month)", v: "Improving", note: "Funds I, II and VI Active now above CPI. The gap to 15.38% inflation narrowed in Q1.", s: "Watch" },
  { k: "PPP funding ratio", v: "8.58%", note: "18,811 funded of 219,316 RSAs. Registrations grew but the funded share barely moved.", s: "Critical" },
  { k: "States fully compliant", v: "8 / 37", note: "25 with CPS legislation. Katsina switched from CDBS to CPS in the quarter.", s: "Improving" },
  { k: "Employer recoveries", v: "₦1.18bn", note: "From 15 defaulters in Q1. ₦33.80 billion recovered since June 2012.", s: "Strong quarter" },
];

const domains = [
  { d: "A. Stability", s: "Stable", r: "Asset base past ₦29.52 trillion, driven by equity revaluation and disciplined contribution flow." },
  { d: "B. Coverage", s: "Mixed", r: "CPS membership expanding at pace; the Personal Pension Plan funding gap remains the binding constraint." },
  { d: "C. Welfare", s: "Stable", r: "Approximately 21,600 retirees served in the quarter; ₦11.19 billion in accrued rights settled." },
  { d: "D. Compliance", s: "Improving", r: "e-PCC issuance more than doubled; ICPC collaboration commenced for recalcitrant defaulters." },
  { d: "E. Investment", s: "Watch", r: "Real returns trajectory clearly positive; FGN concentration at 58.07% now the diversification priority." },
];

function Paras({ blocks }: { blocks: Para[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((p, i) =>
        p.insight ? (
          <aside key={i} className="relative overflow-hidden rounded-2xl bg-[#F4F7F2] p-5 pl-6 sm:p-6 sm:pl-7 print:bg-white print:ring-1 print:ring-black/20">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#F4D27A] to-[#CB9615]" />
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7A5200]"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#11421A] text-[#F4D27A]"><Lightbulb className="h-5 w-5" /></span> Further insight</p>
            <p className="mt-3 leading-[1.75] text-gray-700">{p.x}</p>
          </aside>
        ) : p.b ? (
          <p key={i} className="flex gap-3 leading-relaxed text-gray-700"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" /><span>{p.x}</span></p>
        ) : (
          <p key={i} className="leading-[1.75] text-gray-700">{p.x}</p>
        ),
      )}
    </div>
  );
}

export default function ReportPage() {
  const { status, data } = useDocJson<Chapter[]>("/documents/text/q1-2026-industry-report.json");
  const [size, setSize] = useState(0);
  const [domain, setDomain] = useState("04");

  const ch = (n: string) => data?.find((c) => c.n === n);
  const dg = ch("02");
  const bullets = dg?.blocks.filter((b) => b.b) ?? [];
  const headline = dg?.blocks.find((b) => !b.b)?.x.replace(/^HEADLINE, Q1 2026\s*/, "");
  const cols = [
    { k: "What is working", icon: TrendingUp, tone: "bg-[#14892A]", chip: "bg-[#E8F5E9] text-[#117F21] group-hover:bg-[#14892A] group-hover:text-white", items: bullets.slice(0, 5) },
    { k: "What is at risk", icon: AlertTriangle, tone: "bg-[#B52026]", chip: "bg-[#FDECEC] text-[#9B1C1C] group-hover:bg-[#B52026] group-hover:text-white", items: bullets.slice(5, 10) },
    { k: "What we will do", icon: Target, tone: "bg-[#CB9615]", chip: "bg-[#FFF8E1] text-[#7A5200] group-hover:bg-[#CB9615] group-hover:text-[#1A1206]", items: bullets.slice(10) },
  ];
  const domainChs = data?.filter((c) => ["04", "05", "06", "07", "08"].includes(c.n)) ?? [];
  const toc = [
    { id: "glance", label: "Q1 2026 at a glance" }, { id: "dg", label: "Director-General’s read" }, { id: "domains", label: "Five outcome domains" },
    { id: "environment", label: "Operating environment" }, { id: "outlook", label: "Outlook for Q2 2026" }, { id: "priorities", label: "Strategic priorities" },
  ];
  const label = (s: string) => s.replace(/^\w/, (c) => c.toUpperCase());

  return (
    <MotionConfig reducedMotion="user">
      <ReadingBar />
      <DocHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Resources", to: "/resources" }, { label: "Quarterly reports", to: "/resources#quarterly-reports" }, { label: "Q1 2026" }]}
        kind="Quarterly industry report"
        icon={<BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />}
        title="Nigerian Pension Industry Quarterly Report, Q1 2026"
        lead="The Commission’s consolidated view of the pension industry for January to March 2026, organised around the five outcome domains of the PenCom Insight Framework."
        meta={[
          { label: "Period", value: "1 Jan – 31 Mar 2026" },
          { label: "Published", value: "April 2026" },
          { label: "Framework", value: "PenCom Insight" },
          { label: "Length", value: "33 pages" },
        ]}
        actions={<>
          <PrimaryBtn href={PDF} external><Download className="h-5 w-5" aria-hidden="true" /> Full report (PDF)</PrimaryBtn>
          <Link to="/performance" className={outlineDarkBtn}><TrendingUp className="h-5 w-5" aria-hidden="true" /> Latest industry figures</Link>
        </>}
      />

      {status === "loading" && <Loading />}
      <div className="bg-white text-[#164D20]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="print:hidden lg:block">
            <div className="space-y-4 lg:sticky lg:top-[116px]">
              <Toc items={toc} title="In this report" className="hidden lg:block" />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-3 pl-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">Text size</span>
                <DocTools size={size} setSize={setSize} />
              </div>
            </div>
          </aside>
          <div className="min-w-0 space-y-20 sm:space-y-24" style={{ fontSize: sizes[size] }}>
            {/* At a glance */}
            <section id="glance" aria-labelledby="glance-t" className="scroll-mt-[120px]">
              <SectionHeading id="glance-t" eyebrow="Executive dashboard" title="Q1 2026 at a glance" highlight="at a glance" intro="The industry entered 2026 on a stronger footing. Assets crossed ₦29 trillion for the first time and every reform track moved forward under Pension Revolution 2.0." />
              <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-gray-200/80 bg-gray-200/80 sm:grid-cols-2 xl:grid-cols-4">
                {tiles.map((t, i) => (
                  <motion.li key={t.k} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.07, duration: 0.6, ease }} className="group relative bg-white p-5 transition-colors hover:bg-[#F7FAF6] sm:p-6 print:break-inside-avoid">
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#14892A] to-[#CB9615] transition-transform duration-500 group-hover:scale-x-100" />
                    <div className="flex flex-col-reverse items-start gap-2">
                      <p className="text-sm font-semibold leading-snug text-gray-600">{t.k}</p>
                      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold", STATUS[t.s])}>{t.s}</span>
                    </div>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#105D1D] tabular-nums">{t.v}</p>
                    <p className="mt-2 text-[0.9em] leading-snug text-gray-600">{t.note}</p>
                  </motion.li>
                ))}
              </ul>
              <Spotlight className="mt-6 overflow-hidden rounded-3xl border border-gray-200/80 bg-white">
                <p className="border-b border-gray-100 bg-[#F4F7F2] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#7A5200]">Status by outcome domain</p>
                <ul className="divide-y divide-gray-100">
                  {domains.map((d, i) => (
                    <motion.li key={d.d} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="grid grid-cols-1 gap-2 px-6 py-5 transition-colors hover:bg-[#F7FAF6] sm:grid-cols-[190px_130px_1fr] sm:items-center">
                      <span className="flex items-center gap-3 font-bold text-[#164D20]"><span aria-hidden="true" className={cn("h-3 w-3 shrink-0 rounded-full ring-4 ring-black/[0.05]", DOT[d.s])} />{d.d}</span>
                      <span className={cn("w-fit rounded-full px-3 py-1 text-sm font-bold", STATUS[d.s])}>{d.s}</span>
                      <span className="text-gray-600">{d.r}</span>
                    </motion.li>
                  ))}
                </ul>
              </Spotlight>
            </section>

            {/* DG's read */}
            <section id="dg" aria-labelledby="dg-t" className="scroll-mt-[120px]">
              <SectionHeading id="dg-t" eyebrow="Director-General’s read" title="The quarter in perspective" highlight="perspective" />
              {headline && (
                <motion.div {...reveal} className="mt-8">
                  <Tilt max={3}>
                    <figure className={cn(featured, "p-7 shadow-[0_40px_80px_-44px_rgba(16,93,29,0.8)] sm:p-10 lg:p-12 print:bg-none print:bg-white print:text-black print:shadow-none print:ring-1 print:ring-black/20")}>
                      <GridBackdrop className="-z-10 opacity-60 print:hidden" />
                      <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#CB9615]/20 blur-3xl print:hidden" />
                      <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CB9615] text-[#1A1206]"><Quote className="h-7 w-7" /></span>
                      <blockquote className="relative mt-6 text-[1.15em] font-medium leading-relaxed text-white print:text-black sm:text-[1.3em]">{headline}</blockquote>
                      <figcaption className="relative mt-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-[#F4D27A] print:text-black"><span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-[#F4D27A]" />Headline, Q1 2026</figcaption>
                    </figure>
                  </Tilt>
                </motion.div>
              )}
              <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                {cols.map((c, i) => (
                  <motion.div key={c.k} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, ease }} className={cn("group relative overflow-hidden print:break-inside-avoid", liftCard)}>
                    <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", c.tone)} />
                    <p className="flex items-center gap-3 px-6 pb-2 pt-7 text-xl font-bold tracking-tight text-[#164D20]"><span aria-hidden="true" className={cn("flex h-11 w-11 items-center justify-center rounded-xl transition duration-300 group-hover:rotate-[-6deg]", c.chip)}><c.icon className="h-5 w-5" /></span>{c.k}</p>
                    <ul className="divide-y divide-gray-100 px-6 pb-4">
                      {c.items.map((b) => {
                        const [lead, ...rest] = b.x.split(". ");
                        return <li key={b.x.slice(0, 30)} className="py-3 leading-relaxed text-gray-600"><strong className="text-[#164D20]">{lead}.</strong> {rest.join(". ")}</li>;
                      })}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Domains */}
            <section id="domains" aria-labelledby="dom-t" className="scroll-mt-[120px]">
              <SectionHeading id="dom-t" eyebrow="PenCom Insight Framework" title="Five outcome domains" highlight="outcome domains" />
              <LayoutGroup id="report-domains">
                <div role="tablist" aria-label="Outcome domains" className="mt-8 flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-gray-200 print:hidden">
                  {domainChs.map((c, i) => {
                    const on = domain === c.n;
                    return (
                      <button key={c.n} role="tab" type="button" aria-selected={on} onClick={() => setDomain(c.n)} className={cn("relative inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-[15px] font-semibold transition", on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#105D1D]", focus)}>
                        {on && <motion.span layoutId="report-domain-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#105D1D] to-[#14892A] shadow-[0_10px_24px_-12px_rgba(16,93,29,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                        {domains[i] && <span aria-hidden="true" className={cn("relative h-2.5 w-2.5 shrink-0 rounded-full", DOT[domains[i].s], on && "ring-2 ring-white/70")} />}
                        <span className="relative">{domains[i]?.d ?? c.title}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>
              <AnimatePresence mode="wait">
                {domainChs.filter((c) => c.n === domain).map((c) => (
                  <motion.div key={c.n} role="tabpanel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease }} className="mt-6 space-y-5">
                    {c.subs.map((s) => (
                      <article key={s.n} className={cn("p-6 sm:p-8", card)}>
                        <h3 className="flex items-start gap-3 text-xl font-bold leading-snug tracking-tight text-[#164D20] sm:text-2xl"><span className="mt-0.5 flex h-8 min-w-[2.75rem] shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] px-1.5 text-sm font-bold tabular-nums text-[#117F21]">{s.n}</span>{label(s.title)}</h3>
                        <div className="mt-4"><Paras blocks={s.blocks} /></div>
                      </article>
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>

            {[["environment", "09", "Operating environment"], ["outlook", "10", "Outlook for Q2 2026"], ["priorities", "11", "Strategic priorities for Q2 2026"]].map(([id, n, t]) => {
              const c = ch(n);
              if (!c) return null;
              return (
                <section key={id} id={id} aria-labelledby={`${id}-t`} className="scroll-mt-[120px]">
                  <SectionHeading n={n} id={`${id}-t`} eyebrow={`Chapter ${n}`} title={t} />
                  {id === "priorities" ? (
                    <>
                      {c.blocks.filter((b) => !b.b).slice(0, 1).map((b) => <p key="i" className="mt-6 max-w-3xl leading-[1.75] text-gray-700">{b.x}</p>)}
                      <Spotlight className="mt-6 overflow-hidden rounded-3xl border border-gray-200/80 bg-white">
                        <ol className="grid grid-cols-1 gap-px bg-gray-100 md:grid-cols-2">
                          {c.blocks.filter((b) => b.b).map((b, i) => (
                            <motion.li key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.04 }} className="group flex gap-4 bg-white p-5 leading-relaxed text-gray-700 transition-colors hover:bg-[#F7FAF6] print:break-inside-avoid">
                              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#11421A] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]"><Flag className="h-5 w-5" /></span>{b.x}
                            </motion.li>
                          ))}
                        </ol>
                      </Spotlight>
                    </>
                  ) : (
                    <div className={cn("mt-6 p-6 sm:p-8", card)}><Paras blocks={c.blocks.filter((b) => !b.x.startsWith("Sources:"))} /></div>
                  )}
                </section>
              );
            })}

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <PdfCard href={PDF} title="Nigerian Pension Industry Quarterly Report, Q1 2026" meta="PDF · 33 pages · 0.8 MB" />
                <VerifyNote>This web version presents the report’s dashboard, commentary and priorities in an accessible format. Charts, the risk register and the statistical annex are in the full PDF.</VerifyNote>
              </div>
              <Link to="/resources#quarterly-reports" className={cn("group flex min-h-14 items-center justify-between gap-4 p-6 text-xl font-bold text-[#164D20] print:hidden", liftCard, ring)}>
                All quarterly reports <ArrowChip />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
