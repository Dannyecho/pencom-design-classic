"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AlertTriangle, BarChart3, CheckCircle2, Download, Flag, Lightbulb, Quote, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ease, reveal } from "@/views/about/primitives";
import { pill } from "@/views/resources/Library";
import { SectionHeading } from "@/views/theme/heading";
import { ArrowChip, DocHero, DocTools, Loading, PdfCard, PrimaryBtn, ReadingBar, Toc, VerifyNote, ring, useDocJson } from "@/views/docs/kit";

/**
 * Industry report as a web page with the PDF attached (DES-22: "industry reports ... available as web pages").
 * Text and figures: PenCom Q1 2026 Quarterly Industry Report (published April 2026). Tiles and domain statuses are
 * transcribed from the report's Executive Dashboard; chapter text is extracted from the PDF.
 */

type Para = { x: string; b: boolean; insight: boolean };
type Chapter = { n: string; title: string; blocks: Para[]; subs: { n: string; title: string; blocks: Para[] }[] };

const PDF = "/documents/q1-2026-industry-report.pdf";

const STATUS: Record<string, string> = {
  "On track": "bg-[#E8F5E9] text-[#0A4A13]",
  Improving: "bg-[#E0F2F1] text-[#00695C]",
  Watch: "bg-[#FFF3CD] text-[#7A5600]",
  Critical: "bg-[#FDECEC] text-[#9B1C1C]",
  "Strong quarter": "bg-[#FFF8E1] text-[#7A5600]",
  Stable: "bg-[#E8F5E9] text-[#0A4A13]",
  Mixed: "bg-[#FFF3CD] text-[#7A5600]",
};

/** Dot colour per status, for the domain list. */
const DOT: Record<string, string> = { Stable: "bg-[#117F21]", Improving: "bg-[#00897B]", Watch: "bg-[#CB9615]", Mixed: "bg-[#CB9615]", Critical: "bg-[#B52026]" };
const card = "rounded-3xl bg-white ring-1 ring-black/10";
/** Calm card with the hover lift (green ring + soft green shadow). */
const liftCard = "transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]";
/** Report body sizes (18 px base in calm; the kit's `sizes` start at 16 px). */
const sizes = ["1.125rem", "1.25rem", "1.375rem"];

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
          <aside key={i} className="relative overflow-hidden rounded-2xl bg-[#F1EFE8] p-5 pl-6 sm:p-6 sm:pl-7 print:bg-white print:ring-1 print:ring-black/20">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#F4D27A] to-[#CB9615]" />
            <p className="flex items-center gap-3 text-base font-bold uppercase tracking-[0.16em] text-[#7A5200]"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A4A13] text-[#F4D27A]"><Lightbulb className="h-5 w-5" /></span> Further insight</p>
            <p className="mt-3 font-serif leading-[1.75] text-[#14261A]">{p.x}</p>
          </aside>
        ) : p.b ? (
          <p key={i} className="flex gap-3 leading-relaxed text-[#14261A]"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" /><span>{p.x}</span></p>
        ) : (
          <p key={i} className="font-serif leading-[1.75] text-[#14261A]">{p.x}</p>
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
    { k: "What is working", icon: TrendingUp, tone: "bg-[#117F21]", chip: "bg-[#0A4A13] text-[#F4D27A]", items: bullets.slice(0, 5) },
    { k: "What is at risk", icon: AlertTriangle, tone: "bg-[#B52026]", chip: "bg-[#FDECEC] text-[#9B1C1C]", items: bullets.slice(5, 10) },
    { k: "What we will do", icon: Target, tone: "bg-[#CB9615]", chip: "bg-[#F4D27A] text-[#1A1206]", items: bullets.slice(10) },
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
          <Link to="/performance" className={cn("inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white", ring)}><TrendingUp className="h-5 w-5" aria-hidden="true" /> Latest industry figures</Link>
        </>}
      />

      {status === "loading" && <Loading />}
      <div className="border-t border-black/5 bg-white text-[#14261A] print:border-0">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block print:hidden"><div className="sticky top-[116px] space-y-4"><Toc items={toc} title="In this report" /><DocTools size={size} setSize={setSize} /></div></aside>
          <div className="min-w-0 space-y-20 sm:space-y-24" style={{ fontSize: sizes[size] }}>
            {/* At a glance */}
            <section id="glance" aria-labelledby="glance-t" className="scroll-mt-[120px]">
              <SectionHeading id="glance-t" eyebrow="Executive dashboard" title="Q1 2026 at a glance" highlight="at a glance" intro="The industry entered 2026 on a stronger footing. Assets crossed ₦29 trillion for the first time and every reform track moved forward under Pension Revolution 2.0." />
              <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {tiles.map((t, i) => (
                  <motion.li key={t.k} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.07, duration: 0.6, ease }}>
                    <div className={cn("group relative h-full overflow-hidden p-6 print:break-inside-avoid", card, liftCard)}>
                      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150 print:hidden" />
                      <div className="relative flex flex-col-reverse items-start gap-2">
                        <p className="text-base font-semibold leading-snug text-[#14261A]/80">{t.k}</p>
                        <span className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-bold", STATUS[t.s])}>{t.s}</span>
                      </div>
                      <p className="relative mt-3 text-3xl font-bold tracking-tight text-[#14261A] tabular-nums">{t.v}</p>
                      <p className="relative mt-2 text-[0.9em] leading-snug text-[#14261A]/80">{t.note}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
              <div className={cn("mt-6 overflow-hidden", card)}>
                <p className="border-b border-[#14261A]/[0.08] bg-[#FBF8F1] px-6 py-4 text-base font-bold uppercase tracking-[0.16em] text-[#7A5200]">Status by outcome domain</p>
                <ul>
                  {domains.map((d, i) => (
                    <motion.li key={d.d} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="grid grid-cols-1 gap-2 border-t border-[#14261A]/[0.08] px-6 py-5 transition-colors first:border-0 hover:bg-[#FBF8F1] sm:grid-cols-[190px_130px_1fr] sm:items-center">
                      <span className="flex items-center gap-3 font-bold text-[#14261A]"><span aria-hidden="true" className={cn("h-3 w-3 shrink-0 rounded-full ring-4 ring-black/[0.05]", DOT[d.s])} />{d.d}</span>
                      <span className={cn("w-fit rounded-full px-3 py-1 text-sm font-bold", STATUS[d.s])}>{d.s}</span>
                      <span className="text-[#14261A]/85">{d.r}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </section>

            {/* DG's read */}
            <section id="dg" aria-labelledby="dg-t" className="scroll-mt-[120px]">
              <SectionHeading id="dg-t" eyebrow="Director-General’s read" title="The quarter in perspective" highlight="perspective" />
              {headline && (
                <motion.figure {...reveal} className="relative isolate mt-8 overflow-hidden rounded-[2rem] bg-[#0A4A13] p-7 text-white shadow-[0_40px_80px_-44px_rgba(10,74,19,0.8)] sm:p-10 lg:p-12 print:bg-white print:text-black print:shadow-none print:ring-1 print:ring-black/20">
                  <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#CB9615]/20 blur-3xl print:hidden" />
                  <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4D27A] text-[#1A1206]"><Quote className="h-7 w-7" /></span>
                  <blockquote className="relative mt-6 font-serif text-[1.15em] leading-relaxed text-white print:text-black sm:text-[1.25em]">{headline}</blockquote>
                  <figcaption className="relative mt-6 flex items-center gap-3 text-base font-semibold text-[#F4D27A] print:text-black"><span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-[#F4D27A]" />Headline, Q1 2026</figcaption>
                </motion.figure>
              )}
              <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                {cols.map((c, i) => (
                  <motion.div key={c.k} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, ease }} className={cn("group relative overflow-hidden print:break-inside-avoid", card, liftCard)}>
                    <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", c.tone)} />
                    <p className="flex items-center gap-3 px-6 pb-2 pt-7 text-xl font-bold tracking-tight text-[#14261A]"><span aria-hidden="true" className={cn("flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-6deg]", c.chip)}><c.icon className="h-6 w-6" /></span>{c.k}</p>
                    <ul className="space-y-4 p-6 pt-3">
                      {c.items.map((b) => {
                        const [lead, ...rest] = b.x.split(". ");
                        return <li key={b.x.slice(0, 30)} className="leading-relaxed text-[#14261A]/85"><strong className="text-[#14261A]">{lead}.</strong> {rest.join(". ")}</li>;
                      })}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Domains */}
            <section id="domains" aria-labelledby="dom-t" className="scroll-mt-[120px]">
              <SectionHeading id="dom-t" eyebrow="PenCom Insight Framework" title="Five outcome domains" highlight="outcome domains" />
              <div role="tablist" aria-label="Outcome domains" className="mt-8 flex flex-wrap gap-2 print:hidden">
                {domainChs.map((c, i) => (
                  <button key={c.n} role="tab" type="button" aria-selected={domain === c.n} onClick={() => setDomain(c.n)} className={pill(domain === c.n)}>
                    {domains[i]?.d ?? c.title}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {domainChs.filter((c) => c.n === domain).map((c) => (
                  <motion.div key={c.n} role="tabpanel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease }} className="mt-6 space-y-5">
                    {c.subs.map((s) => (
                      <article key={s.n} className={cn("p-6 sm:p-8", card)}>
                        <h3 className="flex items-baseline gap-3 text-xl font-bold tracking-tight text-[#14261A] sm:text-2xl"><span className="text-base font-bold tabular-nums text-[#7A5200]">{s.n}</span>{label(s.title)}</h3>
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
                  <div className={cn("mt-6 p-6 sm:p-8", card, id === "priorities" && "[&_ul]:grid")}>
                    {id === "priorities" ? (
                      <>
                        {c.blocks.filter((b) => !b.b).slice(0, 1).map((b) => <p key="i" className="font-serif leading-[1.75] text-[#14261A]">{b.x}</p>)}
                        <ol className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                          {c.blocks.filter((b) => b.b).map((b, i) => (
                            <motion.li key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.04 }} className="group flex gap-4 rounded-2xl bg-[#FBF8F1] p-5 leading-relaxed text-[#14261A]/90 ring-1 ring-black/[0.06] print:break-inside-avoid">
                              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]"><Flag className="h-5 w-5" /></span>{b.x}
                            </motion.li>
                          ))}
                        </ol>
                      </>
                    ) : <Paras blocks={c.blocks.filter((b) => !b.x.startsWith("Sources:"))} />}
                  </div>
                </section>
              );
            })}

            <div className="space-y-4">
              <VerifyNote>This web version presents the report’s dashboard, commentary and priorities in an accessible format. Charts, the risk register and the statistical annex are in the full PDF.</VerifyNote>
              <PdfCard href={PDF} title="Nigerian Pension Industry Quarterly Report, Q1 2026" meta="PDF · 33 pages · 0.8 MB" />
              <Link to="/resources#quarterly-reports" className={cn("group flex min-h-14 items-center justify-between gap-4 p-6 text-xl font-bold text-[#14261A] print:hidden", card, liftCard, ring)}>
                All quarterly reports <ArrowChip />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
