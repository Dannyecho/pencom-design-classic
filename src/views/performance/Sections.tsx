"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle, BarChart3, ArrowRight, ArrowUpRight, Building2, ChevronDown, Download, FileText, Landmark, Percent,
  PiggyBank, Search, Shield, TrendingUp, Users, Wallet, X, Check, ArrowDownUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/views/theme/heading";
import { DarkBackdrop, FramedPanel, PageHero, Rise, ease, focus, sectionCls } from "@/views/theme/ui";
import { Bubble, IconTile, calmCard, goldBtn } from "@/views/resources/Library";
import { AreaChart, Columns, DataPanel, DataTable, Donut, Ticker } from "./charts";
import {
  allocColors, allocation, asAt, assets, contributions, download, fees, fundInfo, fundTypes, funds, headline, members, monthLabel,
  periods, pfaReturns, ppp, sources, type FundKey, type PeriodKey,
} from "./data";

const tn = (v: number) => `₦${v.toFixed(2)}tn`;
const bn = (v: number) => `₦${v.toFixed(v >= 100 ? 0 : 1)}bn`;
const mil = (v: number) => `${(v / 1e6).toFixed(2)}m`;
/** Plain white card for charts (no hover lift: the chart itself is interactive). */
const panel = "rounded-[2rem] bg-white ring-1 ring-black/10 shadow-[0_28px_50px_-36px_rgba(10,74,19,0.45)]";
/** Visible label over a control (labelled controls, DES-41). */
const ctrlLabel = "mb-2 block text-base font-semibold text-[#14261A]";
const field = "min-h-14 w-full rounded-2xl border-2 border-[#7A8A7E] bg-white text-lg text-[#14261A] focus:border-[#117F21] focus:outline-none focus:ring-4 focus:ring-[#FFD84D]";
const outlineBtn = cn("group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white", focus);

/** White pill bar with a dark-green active pill (gold active pill on the green panel). Visible label above. */
function Segmented<T extends string>({ value, options, onChange, label, id, dark }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string; id: string; dark?: boolean }) {
  return (
    <div>
      <span id={`seg-label-${id}`} className={cn(ctrlLabel, dark && "text-white")}>{label}</span>
      <div role="radiogroup" aria-labelledby={`seg-label-${id}`} className={cn("inline-flex flex-wrap gap-1 rounded-[1.6rem] p-1.5", dark ? "bg-white/[0.07] ring-1 ring-white/15" : "bg-white ring-1 ring-black/10 shadow-[0_12px_28px_-20px_rgba(10,74,19,0.5)]")}>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)} className={cn("relative min-h-12 rounded-full px-5 text-lg font-semibold transition-colors", focus, value === o ? (dark ? "text-[#1A1206]" : "text-[#F4D27A]") : dark ? "text-white hover:bg-white/10" : "text-[#14261A] hover:text-[#117F21]")}>
            {value === o && <motion.span layoutId={`seg-${id}`} className={cn("absolute inset-0 rounded-full", dark ? "bg-[#F4D27A]" : "bg-[#0A4A13]")} transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <span className="relative">{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AsAt({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-semibold text-[#0A4A13]"><span className="h-2 w-2 rounded-full bg-[#117F21]" aria-hidden="true" />{children}</span>;
}

/* ─────────────────────────── Hero ─────────────────────────── */

export function PerfHero() {
  const reduce = useReducedMotion();
  const spark = assets.slice(-12);
  const lo = Math.min(...spark.map((s) => s.v));
  const hi = Math.max(...spark.map((s) => s.v));
  const pts = spark.map((s, i) => `${(i / (spark.length - 1)) * 300},${70 - ((s.v - lo) / (hi - lo)) * 60}`).join(" ");
  const stats = [
    { icon: Users, v: mil(headline.members), l: "RSA holders" },
    { icon: TrendingUp, v: `+${headline.ytd}%`, l: "Asset growth this year" },
    { icon: Landmark, v: headline.retirees.toLocaleString("en-NG"), l: "Retirees on monthly pension*" },
  ];
  return (
    <PageHero
      id="perf-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Operators", to: "/operators" }, { label: "Industry performance" }]}
      pill={{ icon: BarChart3, label: `Latest data: ${asAt}` }}
      title="The pension industry in numbers"
      mark="in numbers"
      intro="How much Nigerians have saved, where it is invested, how each fund is growing and how PFAs compare. Every chart can be read as a table and downloaded."
      actions={
        <ul className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((s, i) => (
            <motion.li key={s.l} initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.08, ease }} className="flex items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-black/10 sm:block">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A]"><s.icon className="h-5 w-5" /></span>
              <span className="block sm:mt-3">
                <span className="block text-2xl font-bold tabular-nums text-[#14261A]">{s.v}</span>
                <span className="block text-base text-gray-700">{s.l}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      }
      aside={
        <FramedPanel className="p-7 sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7A5200]">Total pension assets</p>
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#117F21] opacity-50 [animation-iteration-count:2]" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#117F21]" />
            </span>
          </div>
          <p className="mt-2 text-5xl font-bold tracking-tight text-[#14261A] sm:text-6xl">
            <Ticker value={headline.assets} fmt={(v) => `₦${v.toFixed(2)}`} />
            <span className="ml-1 text-2xl font-semibold text-gray-700 sm:text-3xl">trillion</span>
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-3 text-base">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-3 py-1 font-bold text-[#0A4A13]">▲ {headline.ytd}% since January</span>
            <span className="text-gray-700">about ${headline.usd}bn</span>
          </p>
          <svg viewBox="0 0 300 80" className="mt-6 h-28 w-full overflow-visible" aria-hidden="true" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hero-spark" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#117F21" /><stop offset="1" stopColor="#CB9615" /></linearGradient>
              <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#117F21" stopOpacity="0.16" /><stop offset="1" stopColor="#117F21" stopOpacity="0" /></linearGradient>
            </defs>
            <motion.polygon points={`0,80 ${pts} 300,80`} fill="url(#hero-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 1.2, duration: 0.8 }} />
            <motion.polyline points={pts} fill="none" stroke="url(#hero-spark)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : 1.8, delay: 0.4, ease }} />
          </svg>
          <div className="mt-1 flex justify-between text-sm text-gray-700"><span>{monthLabel(spark[0].m)}</span><span>{monthLabel(spark[spark.length - 1].m)}</span></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <p className="rounded-2xl bg-[#F1EFE8] p-4"><span className="block text-base text-gray-700">Paid in benefits to date*</span><span className="mt-1 block text-xl font-bold text-[#14261A]">₦{headline.benefitsPaid}tn</span></p>
            <p className="rounded-2xl bg-[#F1EFE8] p-4"><span className="block text-base text-gray-700">New members in two years*</span><span className="mt-1 block text-xl font-bold text-[#14261A]">{headline.joined2y.toLocaleString("en-NG")}</span></p>
          </div>
          <p className="mt-4 text-sm text-gray-700">Unaudited. *As at July 2026.</p>
        </FramedPanel>
      }
    />
  );
}

const ranges = ["6 months", "12 months", "Since Jan 2025"] as const;

export function AssetsSection() {
  const [range, setRange] = useState<(typeof ranges)[number]>("12 months");
  const data = useMemo(() => {
    const n = range === "6 months" ? 6 : range === "12 months" ? 12 : assets.length;
    return assets.slice(-n).map((a) => ({ label: monthLabel(a.m), long: monthLabel(a.m, true), v: a.v, m: a.m }));
  }, [range]);
  const first = data[0];
  const last = data[data.length - 1];
  const growth = ((last.v - first.v) / first.v) * 100;
  const avg = ((Math.pow(last.v / first.v, 1 / Math.max(1, data.length - 1)) - 1) * 100);
  const best = data.slice(1).reduce((b, d, i) => (d.v - data[i].v > b.d ? { d: d.v - data[i].v, m: d.long } : b), { d: -Infinity, m: "" });

  return (
    <section id="assets" aria-labelledby="assets-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="assets-title" eyebrow="Total assets" title="How pension savings have grown" highlight="grown" intro="The total value of all pension funds at the end of each month, after investment gains and new contributions." action={<Segmented value={range} options={ranges} onChange={setRange} label="Time period" id="assets" />} />
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Rise className="lg:col-span-9">
            <div className={cn("relative overflow-hidden p-5 sm:p-8", panel)}>
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
              <DataPanel
                title="Total pension assets" name={`assets-${range.replace(/\s/g, "-").toLowerCase()}`}
                rows={data.map((d) => ({ month: d.m, assets_naira_trillion: d.v }))}
                chart={<AreaChart key={range} data={data} fmt={tn} label="Total pension assets, ₦ trillion" />}
                table={<DataTable head={["Month", "Assets (₦ trillion)", "Change on month"]} rows={data.map((d, i) => [d.long, d.v.toFixed(2), i ? `${(((d.v - data[i - 1].v) / data[i - 1].v) * 100).toFixed(2)}%` : "—"])} />}
                caption="Source: PenCom unaudited monthly portfolio reports. Hover, tap or use arrow keys on the chart to read each month."
              />
            </div>
          </Rise>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-1">
            {[
              { l: `Growth over ${range.toLowerCase()}`, v: `+${growth.toFixed(1)}%`, s: `${tn(first.v)} → ${tn(last.v)}` },
              { l: "Average monthly growth", v: `${avg.toFixed(2)}%`, s: "Compound, month on month" },
              { l: "Biggest monthly rise", v: `+₦${best.d.toFixed(2)}tn`, s: best.m },
            ].map((c, i) => (
              <Rise key={c.l} delay={i * 0.1} className="h-full">
                <div className={cn("relative h-full overflow-hidden rounded-3xl p-5 ring-1 ring-black/10", i === 0 ? "bg-[#E8F5E9]" : "bg-[#FBF8F1]")}>
                  {i === 0 && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#117F21] to-[#CB9615]" />}
                  <p className="text-base font-semibold text-[#0A4A13]">{c.l}</p>
                  <AnimatePresence mode="wait"><motion.p key={c.v} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-1 text-3xl font-bold tabular-nums text-[#14261A]">{c.v}</motion.p></AnimatePresence>
                  <p className="mt-1 text-base text-gray-700">{c.s}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Asset allocation ─────────────────────────── */

export function AllocationSection() {
  const [p, setP] = useState(allocation[allocation.length - 1].label);
  const a = allocation.find((x) => x.label === p)!;
  return (
    <section id="allocation" aria-labelledby="alloc-title" className={sectionCls}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="alloc-title" eyebrow="Investments" title="Where pension money is invested" highlight="invested" intro="PFAs must invest within the limits in the Regulation on Investment of Pension Fund Assets. Most savings sit in Federal Government securities." action={<Segmented value={p} options={allocation.map((x) => x.label)} onChange={setP} label="Reporting month" id="alloc" />} />
        <Rise className="mt-10">
          <div className={cn("relative overflow-hidden p-5 sm:p-8", panel)}>
            <DataPanel
              title="Asset allocation" name={`allocation-${a.period}`}
              rows={a.items.map((i) => ({ period: a.period, asset_class: i.k, naira_trillion: i.v, share_percent: +((i.v / a.total) * 100).toFixed(2) }))}
              chart={<Donut key={a.period} items={a.items} colors={allocColors} total={a.total} unit={tn} />}
              table={<DataTable head={["Asset class", "₦ trillion", "Share"]} rows={[...a.items.map((i) => [i.k, i.v ? i.v.toFixed(2) : "in Other", i.v ? `${((i.v / a.total) * 100).toFixed(1)}%` : "—"]), ["Total", a.total.toFixed(2), "100%"]]} />}
              caption={<>{a.note && <span className="mr-1">{a.note}</span>}Other includes mutual funds, real estate, infrastructure and private equity funds, and cash.</>}
            />
          </div>
        </Rise>
      </div>
    </section>
  );
}

/* ─────────────────────────── Fund types (the page's one green panel) ─────────────────────────── */

export function FundsSection() {
  const [p, setP] = useState(fundTypes[0].label);
  const f = fundTypes.find((x) => x.label === p)!;
  const reduce = useReducedMotion();
  const max = Math.max(...f.rows.map((r) => r.v));
  return (
    <section id="funds" aria-labelledby="funds-title" className={cn("bg-white", sectionCls)}>
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-4 py-8 text-white sm:p-10 lg:p-14">
        <DarkBackdrop />
        <SectionHeading id="funds-title" dark eyebrow="Fund types" title="Savings by fund type" highlight="fund type" intro="Your PFA places your savings in a fund that matches your age and appetite for risk. Fund II holds the largest share." action={<Segmented dark value={p} options={fundTypes.map((x) => x.label)} onChange={setP} label="Reporting month" id="funds" />} />
        <Rise className="mt-10">
          <div className="rounded-[1.75rem] bg-white p-5 text-[#14261A] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] sm:p-8">
            <DataPanel
              title="Assets by fund type" name={`fund-types-${f.period}`}
              rows={f.rows.map((r) => ({ period: f.period, fund: r.k, naira_trillion: r.v, share_percent: +((r.v / f.total) * 100).toFixed(2) }))}
              chart={
                <ul className="space-y-3" aria-label={`Assets by fund type, ${f.label}`}>
                  {f.rows.map((r, i) => (
                    <li key={`${f.period}-${r.k}`} className="group grid grid-cols-1 gap-2 rounded-2xl p-3 transition-colors hover:bg-[#FBF8F1] sm:grid-cols-[220px_1fr_150px] sm:items-center">
                      <div>
                        <p className="text-lg font-bold">{r.k}</p>
                        <p className="text-base text-gray-700">{r.who}</p>
                      </div>
                      <div className="h-4 rounded-full bg-[#E8F5E9]">
                        <motion.div className="relative h-full rounded-full bg-gradient-to-r from-[#0A4A13] via-[#117F21] to-[#CB9615]" initial={{ width: 0 }} whileInView={{ width: `${(r.v / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 1, delay: reduce ? 0 : i * 0.1, ease }}>
                          <span aria-hidden="true" className="absolute -right-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#F4D27A] ring-4 ring-white transition-transform duration-300 group-hover:scale-110" />
                        </motion.div>
                      </div>
                      <p className="text-lg font-bold tabular-nums sm:text-right">{tn(r.v)} <span className="text-base font-normal text-gray-700">{((r.v / f.total) * 100).toFixed(0)}%</span></p>
                    </li>
                  ))}
                </ul>
              }
              table={<DataTable head={["Fund", "₦ trillion", "Share"]} rows={[...f.rows.map((r) => [r.k, r.v.toFixed(2), `${((r.v / f.total) * 100).toFixed(1)}%`]), ["Total", f.total.toFixed(2), "100%"]]} />}
              caption="Other funds are worked out as total assets minus the funds listed. Source: PenCom monthly portfolio reports."
            />
          </div>
        </Rise>
        <p className="mt-6 text-lg text-white/90">Not sure which fund you are in? <Link to="/resources/faq" className={cn("rounded font-semibold text-[#F4D27A] underline underline-offset-4", focus)}>Read the FAQ</Link> or ask your PFA.</p>
      </div>
    </section>
  );
}

/* ─────────────────────────── Coverage and flows ─────────────────────────── */

export function CoverageSection() {
  const reduce = useReducedMotion();
  const pct = (ppp.funded / ppp.registered) * 100;
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <section id="coverage" aria-labelledby="cov-title" className={sectionCls}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="cov-title" eyebrow="Coverage and contributions" title="Who is saving, and how much is coming in" highlight="coming in" />
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Rise className="h-full">
            <div className={cn("h-full p-6 sm:p-8", panel)}>
              <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-2xl font-bold tracking-tight">RSA holders</h3><AsAt>{asAt}</AsAt></div>
              <p className="mt-1 text-lg text-gray-700">People with a Retirement Savings Account.</p>
              <div className="mt-6">
                <DataPanel title="RSA holders" name="rsa-holders" rows={members.map((m) => ({ period: m.label, rsa_holders: m.v }))}
                  chart={<Columns data={members} fmt={mil} />}
                  table={<DataTable head={["Period", "RSA holders"]} rows={members.map((m) => [m.label, m.v.toLocaleString("en-NG")])} />}
                  caption="Bars start at about 10.5 million, not zero, so the change is easier to see."
                />
              </div>
            </div>
          </Rise>
          <Rise delay={0.1} className="h-full">
            <div className={cn("h-full p-6 sm:p-8", panel)}>
              <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-2xl font-bold tracking-tight">Contributions received</h3><AsAt>Q1 2026</AsAt></div>
              <p className="mt-1 text-lg text-gray-700">Money paid in by employers and workers each quarter.</p>
              <div className="mt-6">
                <DataPanel title="Contributions" name="contributions" rows={contributions.map((c) => ({ quarter: c.label, naira_billion: c.v, derived: !!c.derived }))}
                  chart={<Columns data={contributions.map((c) => ({ ...c, note: c.derived ? "derived" : undefined }))} fmt={bn} color="#0A4A13" />}
                  table={<DataTable head={["Quarter", "₦ billion"]} rows={contributions.map((c) => [c.label + (c.derived ? " *" : ""), c.v.toFixed(2)])} />}
                  caption="* Worked out from the published Q3 2025 increase of 18%. Q4 2025 included one-off public-sector payments."
                />
              </div>
            </div>
          </Rise>

          <Rise className="h-full">
            <div className={cn("h-full p-6 sm:p-8", calmCard)}>
              <Bubble />
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#F4D27A] via-[#CB9615] to-[#117F21]" />
              <div className="relative flex flex-wrap items-start justify-between gap-3"><h3 className="text-2xl font-bold tracking-tight">Personal Pension Plan</h3><AsAt>{ppp.asAt}</AsAt></div>
              <div className="relative mt-6 flex flex-col items-center gap-8 sm:flex-row">
                <div className="relative h-40 w-40 shrink-0">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${pct.toFixed(1)}% of Personal Pension Plan accounts have received a contribution`}>
                    <defs><linearGradient id="ppp-ring" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#117F21" /><stop offset="1" stopColor="#CB9615" /></linearGradient></defs>
                    <circle cx="60" cy="60" r={R} fill="none" stroke="#E8F5E9" strokeWidth="12" />
                    <motion.circle cx="60" cy="60" r={R} fill="none" stroke="url(#ppp-ring)" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} whileInView={{ strokeDashoffset: C * (1 - pct / 100) }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 1.4, ease }} />
                  </svg>
                  <span className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold">{pct.toFixed(1)}%</span><span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7A5200]">funded</span></span>
                </div>
                <div>
                  <p className="text-lg text-gray-700"><strong className="text-[#14261A]">{ppp.registered.toLocaleString("en-NG")}</strong> accounts opened, but only <strong className="text-[#14261A]">{ppp.funded.toLocaleString("en-NG")}</strong> have received a contribution.</p>
                  <Link to="/services#ppp" className={cn(goldBtn, focus, "mt-5")}>Start saving in a PPP <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></Link>
                </div>
              </div>
            </div>
          </Rise>

          <Rise delay={0.1} className="h-full">
            <div className="relative h-full overflow-hidden rounded-3xl bg-[#F1EFE8] p-6 ring-1 ring-black/10 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-4"><IconTile icon={PiggyBank} /><h3 className="text-2xl font-bold tracking-tight">Retirees</h3></span>
                <AsAt>July 2026</AsAt>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 ring-1 ring-black/10"><p className="text-4xl font-bold tabular-nums">{headline.retirees.toLocaleString("en-NG")}</p><p className="mt-1 text-lg text-gray-700">retirees receiving a monthly pension</p></div>
                <div className="rounded-2xl bg-white p-5 ring-1 ring-black/10"><p className="text-4xl font-bold tabular-nums">₦{headline.benefitsPaid}tn</p><p className="mt-1 text-lg text-gray-700">paid in retirement benefits since the scheme began</p></div>
              </div>
              <p className="mt-6 border-t border-black/10 pt-4 text-lg text-gray-700">Up from 658,811 retirees and ₦2.3tn in July 2024.</p>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── PFA comparison (SAMPLE) ─────────────────────────── */

export function CompareSection() {
  const [fund, setFund] = useState<FundKey>("Fund II");
  const [period, setPeriod] = useState<PeriodKey>("Year to date");
  const [q, setQ] = useState("");
  const [dir, setDir] = useState<"desc" | "asc">("desc");
  const [picked, setPicked] = useState<string[]>([]);
  const reduce = useReducedMotion();
  const all = useMemo(() => pfaReturns(fund, period), [fund, period]);
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter((r) => !t || r.name.toLowerCase().includes(t)).sort((a, b) => (dir === "desc" ? b.ret - a.ret : a.ret - b.ret));
  }, [all, q, dir]);
  const sorted = [...all].sort((a, b) => a.ret - b.ret);
  const median = sorted[Math.floor(sorted.length / 2)]?.ret ?? 0;
  const max = Math.max(...all.map((r) => r.ret));
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? [...p.slice(1), id] : [...p, id]));
  const chosen = all.filter((r) => picked.includes(r.id));

  return (
    <section id="compare" aria-labelledby="cmp-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="cmp-title" eyebrow="Compare PFAs" title="How PFA funds have performed" highlight="performed" intro="Returns show how much a fund’s unit price has changed. Past returns do not guarantee future returns, and service quality matters too." />

        <div role="note" className="mt-8 flex gap-3 rounded-3xl border-2 border-dashed border-[#CB9615] bg-[#FFF8E1] p-5 text-lg text-[#5C4300]">
          <AlertTriangle className="mt-1 h-6 w-6 shrink-0" aria-hidden="true" />
          <p><strong>Sample figures for design review.</strong> The PFA names are real; the returns, unit prices and fund sizes are placeholders. PenCom’s Research and Statistics team will supply validated figures before this section goes live.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 rounded-[2rem] bg-[#FBF8F1] p-5 ring-1 ring-black/10 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-end">
          <Segmented value={fund} options={funds} onChange={setFund} label="Fund" id="cmp-fund" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:justify-self-end">
            <label className="block">
              <span className={ctrlLabel}>Period</span>
              <span className="relative block">
                <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)} className={cn(field, "appearance-none pl-4 pr-11 font-semibold")}>
                  {periods.map((p) => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0A4A13]" aria-hidden="true" />
              </span>
            </label>
            <label className="block">
              <span className={ctrlLabel}>Find a PFA</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name of a PFA" className={cn(field, "pl-12 pr-4 placeholder:text-gray-600")} />
              </span>
            </label>
            <div>
              <span className={ctrlLabel} aria-hidden="true">Sort</span>
              <button type="button" onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))} className={cn(outlineBtn, "w-full px-4")}>
                <ArrowDownUp className="h-5 w-5" aria-hidden="true" /> {dir === "desc" ? "Highest first" : "Lowest first"}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-4 text-lg text-gray-700">{fundInfo[fund].who} · {fundInfo[fund].risk}. Tick up to three PFAs to compare them side by side.</p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className={cn("p-4 sm:p-6 lg:col-span-8", panel)}>
            <DataPanel
              title="PFA returns" name={`pfa-returns-sample-${fund.replace(" ", "-").toLowerCase()}`}
              rows={rows.map((r) => ({ pfa: r.name, fund, period, return_percent: r.ret, unit_price: r.price, fund_size_naira_trillion: r.size, sample: true }))}
              chart={
                <LayoutGroup id="pfa-race">
                  {/* Row grid: px-2 | 1.5rem box | --name | bar | 3.75rem figure | px-2, gap 0.5rem. The median line uses the same sums: left = name + 3rem, fixed width = name + 7.75rem. */}
                  <div className="relative pt-8 [--name:7rem] sm:[--name:10rem]">
                    <span aria-hidden="true" className="pointer-events-none absolute bottom-0 top-8 z-10 w-0 border-l-2 border-dashed border-[#CB9615]" style={{ left: `calc(var(--name) + 3rem + (100% - var(--name) - 7.75rem) * ${median / max})` }}>
                      <span className="absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FFF8E1] px-3 py-1 text-sm font-bold text-[#7A5200] ring-1 ring-[#CB9615]/50">median {median.toFixed(1)}%</span>
                    </span>
                    <ul className="space-y-1" aria-label={`${fund} returns, ${period}, sample data`}>
                      {rows.map((r) => {
                        const on = picked.includes(r.id);
                        return (
                          <motion.li key={r.id} layout={!reduce ? "position" : false} transition={{ type: "spring", stiffness: 300, damping: 32 }}>
                            <label className={cn("group grid min-h-12 cursor-pointer grid-cols-[1.5rem_var(--name)_1fr_3.75rem] items-center gap-2 rounded-2xl px-2 py-1.5 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-[#FFD84D]", on ? "bg-[#FFF8E1] ring-1 ring-[#CB9615]/50" : "hover:bg-[#FBF8F1]")}>
                              <input type="checkbox" checked={on} onChange={() => toggle(r.id)} className="sr-only" />
                              <span aria-hidden="true" className={cn("flex h-6 w-6 items-center justify-center rounded-md border-2 transition", on ? "border-[#0A4A13] bg-[#0A4A13] text-[#F4D27A]" : "border-[#7A8A7E] bg-white")}>{on && <Check className="h-4 w-4" strokeWidth={3} />}</span>
                              <span className="truncate text-base font-semibold text-[#14261A] sm:text-lg" title={r.name}>{r.short}</span>
                              <span className="h-3 overflow-hidden rounded-full bg-[#E8F5E9]">
                                <motion.span className={cn("block h-full rounded-full", on ? "bg-gradient-to-r from-[#CB9615] to-[#F4D27A]" : "bg-gradient-to-r from-[#0A4A13] to-[#117F21]")} initial={{ width: 0 }} animate={{ width: `${(r.ret / max) * 100}%` }} transition={{ duration: reduce ? 0 : 0.7, ease }} />
                              </span>
                              <span className="text-right text-base font-bold tabular-nums text-[#14261A] sm:text-lg">{r.ret.toFixed(1)}%</span>
                            </label>
                          </motion.li>
                        );
                      })}
                      {rows.length === 0 && <li className="py-10 text-center text-lg text-gray-700">No PFA matches “{q}”.</li>}
                    </ul>
                  </div>
                </LayoutGroup>
              }
              table={<DataTable head={["PFA", "Return", "Unit price (₦)", "Fund size"]} rows={rows.map((r) => [r.name, `${r.ret.toFixed(2)}%`, r.price.toFixed(4), `₦${(r.size * 1000).toFixed(0)}bn`])} />}
              caption={`Sample data. ${period === "3 years (a year)" ? "Three-year figures are average yearly returns." : ""}`}
            />
          </div>

          <aside className="lg:col-span-4" aria-label="Your comparison">
            <div className="sticky top-[180px] overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-black/10 shadow-[0_28px_50px_-36px_rgba(10,74,19,0.45)]">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#CB9615] to-[#F4D27A]" />
              <p className="text-xl font-bold">Your comparison</p>
              <AnimatePresence initial={false} mode="popLayout">
                {chosen.length === 0 ? (
                  <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-lg text-gray-700">Tick up to three PFAs in the list to see them side by side.</motion.p>
                ) : (
                  <motion.ul key="list" className="mt-4 space-y-3">
                    {chosen.map((c) => (
                      <motion.li key={c.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="rounded-2xl bg-[#FBF8F1] p-4 ring-1 ring-black/10">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-lg font-semibold leading-snug">{c.name}</p>
                          <button type="button" onClick={() => toggle(c.id)} aria-label={`Remove ${c.name}`} className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/10 transition hover:bg-[#0A4A13] hover:text-white", focus)}><X className="h-5 w-5" aria-hidden="true" /></button>
                        </div>
                        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-xl bg-white p-2"><dt className="text-sm text-gray-700">Return</dt><dd className="text-lg font-bold">{c.ret.toFixed(1)}%</dd></div>
                          <div className="rounded-xl bg-white p-2"><dt className="text-sm text-gray-700">vs median</dt><dd className={cn("text-lg font-bold", c.ret >= median ? "text-[#117F21]" : "text-[#B42318]")}>{c.ret >= median ? "+" : ""}{(c.ret - median).toFixed(1)}</dd></div>
                          <div className="rounded-xl bg-white p-2"><dt className="text-sm text-gray-700">Size</dt><dd className="text-lg font-bold">₦{(c.size * 1000).toFixed(0)}bn</dd></div>
                        </dl>
                        <Link to={`/operators?op=${c.id}`} className={cn("group mt-2 inline-flex min-h-11 items-center gap-1.5 rounded text-base font-semibold text-[#0A4A13] underline-offset-4 hover:underline", focus)}>Contact details <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              <div className="mt-6 border-t border-black/10 pt-5">
                <p className="text-lg text-gray-700">Want to move your savings?</p>
                <Link to="/services#rsa-transfer" className={cn(goldBtn, focus, "mt-3 w-full justify-between")}>Transfer your RSA <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Fees ─────────────────────────── */

export function FeesSection() {
  const icons = [Percent, Shield, Building2, Landmark, Wallet];
  return (
    <section id="fees" aria-labelledby="fees-title" className={sectionCls}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="fees-title" eyebrow="Fees" title="What you pay for managing your pension" highlight="What you pay" intro="Fees are deducted from the fund before unit prices are published, so the returns above are after fees. PenCom sets the maximum each party can charge." />
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fees.map((f, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li key={f.title}>
                <Rise delay={i * 0.07} className="h-full">
                  <div className={cn("h-full p-6", calmCard)}>
                    <Bubble />
                    <div className="relative flex items-start justify-between gap-3">
                      <IconTile icon={Icon} />
                      <span className="rounded-full bg-[#FFF8E1] px-3 py-1 text-sm font-bold text-[#7A5200] ring-1 ring-[#CB9615]/40">{f.tag}</span>
                    </div>
                    <h3 className="relative mt-5 text-xl font-bold tracking-tight">{f.title}</h3>
                    <p className="relative mt-2 text-lg leading-relaxed text-gray-700">{f.body}</p>
                  </div>
                </Rise>
              </li>
            );
          })}
          <li>
            <Rise delay={fees.length * 0.07} className="h-full">
              <Link to="/regulations?q=fees#library" className={cn("flex h-full flex-col justify-between p-6", calmCard, "bg-[#F1EFE8]", focus)}>
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#CB9615] to-[#117F21]" />
                <IconTile icon={FileText} />
                <span><span className="mt-6 block text-xl font-bold tracking-tight">Read the fee regulations</span><span className="mt-1 block text-lg text-gray-700">Regulation on Fees Structure and later circulars, in the library.</span></span>
                <span className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-[#0A4A13]">Open the library <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            </Rise>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Methodology and downloads ─────────────────────────── */

const notes = [
  { q: "Where do these figures come from?", a: "From the unaudited monthly portfolio reports PFAs and custodians file with PenCom, the quarterly industry reports and the industry dashboards. Monthly figures can be revised when audited accounts are published." },
  { q: "When are they published?", a: "Monthly figures usually appear four to six weeks after the end of the month. Quarterly reports follow the end of each quarter. The date on each chart shows the period it covers." },
  { q: "How are PFA returns worked out?", a: "A return is the change in a fund’s unit price over the period, after fees. Three-year figures are average yearly returns. Funds of different sizes and risk levels should not be compared directly." },
  { q: "Why are some values marked as worked out?", a: "Where PenCom has published a total and some of its parts, the remaining part is total minus the parts shown. These values are marked in the tables." },
];

export function MethodSection() {
  const [open, setOpen] = useState<number | null>(0);
  const everything = () =>
    download("industry-data", [
      ...assets.map((a) => ({ dataset: "total_assets", period: a.m, item: "Total", value: a.v, unit: "NGN trillion" })),
      ...allocation.flatMap((a) => a.items.map((i) => ({ dataset: "allocation", period: a.period, item: i.k, value: i.v, unit: "NGN trillion" }))),
      ...fundTypes.flatMap((f) => f.rows.map((r) => ({ dataset: "fund_types", period: f.period, item: r.k, value: r.v, unit: "NGN trillion" }))),
      ...members.map((m) => ({ dataset: "rsa_holders", period: m.label, item: "RSA holders", value: m.v, unit: "people" })),
      ...contributions.map((c) => ({ dataset: "contributions", period: c.label, item: c.derived ? "Contributions (derived)" : "Contributions", value: c.v, unit: "NGN billion" })),
    ], "csv");
  return (
    <section id="method" aria-labelledby="method-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeading id="method-title" eyebrow="About this data" title="Methodology" stacked />
          <ul className="mt-8 space-y-3">
            {notes.map((n, i) => (
              <li key={n.q} className={cn("overflow-hidden rounded-3xl bg-white transition-shadow duration-300", open === i ? "shadow-[0_28px_50px_-36px_rgba(10,74,19,0.55)] ring-2 ring-[#117F21]" : "ring-1 ring-black/10")}>
                <h3>
                  <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className={cn("flex min-h-16 w-full items-center justify-between gap-4 px-5 py-3 text-left text-xl font-bold text-[#14261A]", focus)}>
                    {n.q}
                    <span aria-hidden="true" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition", open === i ? "rotate-180 bg-[#0A4A13] text-[#F4D27A]" : "bg-[#E8F5E9] text-[#0A4A13]")}><ChevronDown className="h-5 w-5" /></span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}>
                      <p className="px-5 pb-5 text-lg leading-relaxed text-gray-700">{n.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-5 lg:col-span-5">
          <Rise>
            <div className="relative overflow-hidden rounded-[2rem] bg-[#F1EFE8] p-7 ring-1 ring-black/10">
              <div className="flex items-center gap-4"><IconTile icon={Download} /><p className="text-base font-bold uppercase tracking-[0.16em] text-[#7A5200]">Open data</p></div>
              <p className="mt-4 text-2xl font-bold tracking-tight">Download every series on this page</p>
              <p className="mt-1 text-lg text-gray-700">One CSV file with assets, allocation, fund types, membership and contributions.</p>
              <button type="button" onClick={everything} className={cn(goldBtn, focus, "mt-5")}><Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" /> Download CSV</button>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-black/10 pt-5">
                {([["/resources#monthly-reports", "Monthly reports"], ["/resources#quarterly-reports", "Quarterly reports"], ["/resources#annual-reports", "Annual reports"]] as const).map(([to, l]) => (
                  <Link key={to} to={to} className={cn("inline-flex min-h-12 items-center rounded-full bg-white px-5 text-lg font-semibold text-[#14261A] ring-1 ring-[#117F21]/40 transition hover:bg-[#0A4A13] hover:text-white hover:ring-[#0A4A13]", focus)}>{l}</Link>
                ))}
              </div>
            </div>
          </Rise>
          <Rise delay={0.1}>
            <div className={cn("p-6", panel)}>
              <h3 className="text-xl font-bold">Sources</h3>
              <ul className="mt-3 divide-y divide-black/10">
                {sources.map((s) => (
                  <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className={cn("group flex min-h-12 items-center justify-between gap-3 py-3 text-lg font-medium text-[#14261A] transition-colors hover:text-[#117F21]", focus)}>{s.label}<span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#0A4A13]"><ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" /></span><span className="sr-only">(opens in a new tab)</span></a></li>
                ))}
              </ul>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}
