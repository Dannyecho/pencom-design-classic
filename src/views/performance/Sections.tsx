"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle, BarChart3, ArrowRight, ArrowUpRight, Building2, ChevronDown, Download, FileText, HelpCircle, Landmark, Percent,
  PiggyBank, Search, Shield, Wallet, X, Check, ArrowDownUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/views/theme/heading";
import { DrawnMark } from "@/views/theme/Headline";
import { CountUp, GridBackdrop, Spotlight, Tilt } from "@/views/about/primitives";
import {
  Crumbs, DarkBackdrop, EyebrowPill, FloatingBar, RiseWords, Rise, Tile, card, ease, featured, focus, goldBtn, listPanel, listRow, outlineBtn,
  sectionCls, useMarked,
} from "@/views/theme/ui";
import { AreaChart, Columns, DataPanel, DataTable, Donut, Ticker } from "./charts";
import {
  allocColors, allocation, asAt, assets, contributions, download, fees, fundInfo, fundTypes, funds, headline, members, monthLabel,
  periods, pfaReturns, ppp, sources, type FundKey, type PeriodKey,
} from "./data";

const tn = (v: number) => `₦${v.toFixed(2)}tn`;
const bn = (v: number) => `₦${v.toFixed(v >= 100 ? 0 : 1)}bn`;
const mil = (v: number) => `${(v / 1e6).toFixed(2)}m`;
/** White chart card (no hover lift: the chart itself is interactive), with a green→gold hairline on top. */
const chartCard = "relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_30px_60px_-44px_rgba(16,93,29,0.45)]";
const topLine = <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#14892A] via-[#14892A] to-[#CB9615]" />;
const softBand = "bg-gradient-to-b from-white via-[#F4F7F2] to-white";
/** Visible label over a control (labelled controls, DES-41). */
const ctrlLabel = "mb-2 block text-sm font-semibold text-[#164D20]";
/** 48 px field; the #7A8A7E border keeps 3:1 against white. */
const field = "min-h-12 w-full rounded-xl border border-[#7A8A7E] bg-white text-base text-[#164D20] transition focus:border-[#14892A] focus:outline-none focus:ring-[3px] focus:ring-[#FFD84D]";

/** Classic segmented control: white group, sliding green gradient pill. Visible label above. */
function Segmented<T extends string>({ value, options, onChange, label, id }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string; id: string }) {
  return (
    <div>
      <span id={`seg-label-${id}`} className={ctrlLabel}>{label}</span>
      <div role="radiogroup" aria-labelledby={`seg-label-${id}`} className="inline-flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-gray-200 shadow-[0_12px_28px_-22px_rgba(16,93,29,0.5)]">
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)} className={cn("relative min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors sm:text-base", focus, value === o ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#105D1D]")}>
            {value === o && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#105D1D] to-[#14892A] shadow-[0_10px_24px_-12px_rgba(16,93,29,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className="relative">{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AsAt({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", dark ? "border-white/20 bg-white/10 text-white" : "border-gray-200 bg-[#F7FAF6] text-gray-700")}>
      <span className={cn("h-2 w-2 rounded-full", dark ? "bg-[#F4D27A]" : "bg-[#14892A]")} aria-hidden="true" />
      {children}
    </span>
  );
}

/* ─────────────────────────── Banner (the page's dark band) ─────────────────────────── */

const heroTitle = "The pension industry in numbers";

export function PerfHero() {
  const reduce = useReducedMotion();
  const { before, shown, after, done } = useMarked(heroTitle, "in numbers");
  const nBefore = before.split(" ").length;
  const bars = assets.slice(-12);
  const lo = Math.min(...bars.map((s) => s.v));
  const hi = Math.max(...bars.map((s) => s.v));
  const figs = [
    { v: mil(headline.members), l: "RSA holders" },
    { v: headline.retirees.toLocaleString("en-NG"), l: "Retirees on monthly pension*" },
    { v: `₦${headline.benefitsPaid}tn`, l: "Paid in benefits to date*" },
    { v: headline.joined2y.toLocaleString("en-NG"), l: "New members in two years*" },
  ];
  return (
    <section aria-labelledby="perf-title" className="relative isolate overflow-hidden text-white print:text-black">
      <DarkBackdrop />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-6 sm:pb-28">
        <Crumbs dark crumbs={[{ label: "Home", to: "/" }, { label: "Operators", to: "/operators" }, { label: "Industry performance" }]} />
        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
              <EyebrowPill dark icon={BarChart3} label={`Latest data: ${asAt}`} />
            </motion.div>
            <h1 id="perf-title" data-i18n-done={done} className="mt-5 text-[2.25rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              <RiseWords text={before.trimEnd()} />
              {shown && (
                <>
                  {before && " "}
                  <motion.span className="inline-block" initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.06 + nBefore * 0.05, ease }}>
                    <DrawnMark text={shown} dark />
                  </motion.span>
                  {after && !after.startsWith(" ") ? "" : " "}
                  <RiseWords text={after.trimStart()} start={nBefore + 1} />
                </>
              )}
            </h1>
            <motion.p initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease }} className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              How much Nigerians have saved, where it is invested, how each fund is growing and how PFAs compare. Every chart can be read as a table and downloaded.
            </motion.p>
          </div>

          {/* Total assets: Ticker + the last twelve months as growing bars */}
          <motion.figure initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }} className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-6 backdrop-blur-sm sm:p-7 lg:col-span-5">
            <div className="flex items-start justify-between gap-4">
              <figcaption className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">Total pension assets</figcaption>
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F4D27A] opacity-60 [animation-iteration-count:2]" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#F4D27A]" />
              </span>
            </div>
            <p className="mt-2 text-5xl font-black tracking-tight sm:text-6xl">
              <Ticker value={headline.assets} fmt={(v) => `₦${v.toFixed(2)}`} />
              <span className="ml-1 text-2xl font-semibold text-white/80 sm:text-3xl">trillion</span>
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-3 text-base">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#14892A]/50 px-3 py-1 text-sm font-bold text-[#CFF5D5]">▲ {headline.ytd}% since January</span>
              <span className="text-white/80">about ${headline.usd}bn</span>
            </p>
            <div aria-hidden="true" className="mt-6 flex h-28 items-end gap-1.5">
              {bars.map((b, i) => {
                const last = i === bars.length - 1;
                return (
                  <motion.span
                    key={b.m}
                    className={cn("flex-1 rounded-t-md", last ? "bg-gradient-to-t from-[#14892A] to-[#F4D27A] shadow-[0_0_30px_rgba(244,210,122,0.35)]" : "border border-white/15 bg-gradient-to-t from-white/10 to-white/35")}
                    initial={{ height: reduce ? `${22 + ((b.v - lo) / (hi - lo)) * 78}%` : "0%" }}
                    animate={{ height: `${22 + ((b.v - lo) / (hi - lo)) * 78}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.05, ease }}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-sm text-white/75"><span>{monthLabel(bars[0].m)}</span><span>{monthLabel(bars[bars.length - 1].m)}</span></div>
          </motion.figure>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {figs.map((f, i) => (
            <motion.li key={f.l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }} className="group relative bg-[#11421A] p-6 transition-colors hover:bg-[#124C1B] sm:p-7">
              <span aria-hidden="true" className="absolute left-0 top-7 h-10 w-0.5 bg-gradient-to-b from-[#F4D27A] to-transparent transition-all duration-500 group-hover:h-16" />
              <CountUp value={f.v} className="text-3xl font-black tracking-tight sm:text-4xl" />
              <p className="mt-2 font-medium text-white/85">{f.l}</p>
            </motion.li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-white/75">Unaudited. *As at July 2026.</p>
      </div>
    </section>
  );
}

/* ─────────────────────────── Floating bar: time period for the assets chart ─────────────────────────── */

const ranges = ["6 months", "12 months", "Since Jan 2025"] as const;
export type Range = (typeof ranges)[number];

function useAssetSeries(range: Range) {
  return useMemo(() => {
    const n = range === "6 months" ? 6 : range === "12 months" ? 12 : assets.length;
    return assets.slice(-n).map((a) => ({ label: monthLabel(a.m), long: monthLabel(a.m, true), v: a.v, m: a.m }));
  }, [range]);
}

export function AssetsBar({ range, setRange }: { range: Range; setRange: (r: Range) => void }) {
  const data = useAssetSeries(range);
  const first = data[0];
  const last = data[data.length - 1];
  const growth = ((last.v - first.v) / first.v) * 100;
  const avg = (Math.pow(last.v / first.v, 1 / Math.max(1, data.length - 1)) - 1) * 100;
  const best = data.slice(1).reduce((b, d, i) => (d.v - data[i].v > b.d ? { d: d.v - data[i].v, m: d.long } : b), { d: -Infinity, m: "" });
  const stats = [
    { l: `Growth over ${range.toLowerCase()}`, v: `+${growth.toFixed(1)}%`, s: `${tn(first.v)} → ${tn(last.v)}` },
    { l: "Average monthly growth", v: `${avg.toFixed(2)}%`, s: "Compound, month on month" },
    { l: "Biggest monthly rise", v: `+₦${best.d.toFixed(2)}tn`, s: best.m },
  ];
  return (
    <FloatingBar eyebrow="Total assets">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <Segmented value={range} options={ranges} onChange={setRange} label="Time period" id="assets" />
        </div>
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 sm:grid-cols-3 lg:col-span-8">
          {stats.map((c, i) => (
            <li key={c.l} className="group relative bg-white p-5 transition-colors hover:bg-[#F7FAF6]">
              <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#14892A] to-[#CB9615] transition-opacity", i === 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
              <p className="text-sm font-semibold text-[#105D1D]">{c.l}</p>
              <AnimatePresence mode="wait">
                <motion.p key={c.v} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-1 text-3xl font-bold tabular-nums text-[#164D20]">{c.v}</motion.p>
              </AnimatePresence>
              <p className="mt-1 text-sm text-gray-600">{c.s}</p>
            </li>
          ))}
        </ul>
      </div>
    </FloatingBar>
  );
}

/* ─────────────────────────── Total assets ─────────────────────────── */

export function AssetsSection({ range }: { range: Range }) {
  const data = useAssetSeries(range);
  return (
    <section id="assets" aria-labelledby="assets-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="assets-title" eyebrow="Total assets" title="How pension savings have grown" highlight="grown" intro="The total value of all pension funds at the end of each month, after investment gains and new contributions." />
        <Rise className="mt-10">
          <div className={cn("p-5 sm:p-8", chartCard)}>
            {topLine}
            <DataPanel
              title="Total pension assets" name={`assets-${range.replace(/\s/g, "-").toLowerCase()}`}
              rows={data.map((d) => ({ month: d.m, assets_naira_trillion: d.v }))}
              chart={<AreaChart key={range} data={data} fmt={tn} label="Total pension assets, ₦ trillion" />}
              table={<DataTable head={["Month", "Assets (₦ trillion)", "Change on month"]} rows={data.map((d, i) => [d.long, d.v.toFixed(2), i ? `${(((d.v - data[i - 1].v) / data[i - 1].v) * 100).toFixed(2)}%` : "—"])} />}
              caption="Source: PenCom unaudited monthly portfolio reports. Hover, tap or use arrow keys on the chart to read each month."
            />
          </div>
        </Rise>
      </div>
    </section>
  );
}

/* ─────────────────────────── Asset allocation ─────────────────────────── */

export function AllocationSection() {
  const [p, setP] = useState(allocation[allocation.length - 1].label);
  const a = allocation.find((x) => x.label === p)!;
  return (
    <section id="allocation" aria-labelledby="alloc-title" className={cn(softBand, sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="alloc-title" eyebrow="Investments" title="Where pension money is invested" highlight="invested" intro="PFAs must invest within the limits in the Regulation on Investment of Pension Fund Assets. Most savings sit in Federal Government securities." action={<Segmented value={p} options={allocation.map((x) => x.label)} onChange={setP} label="Reporting month" id="alloc" />} />
        <Rise className="mt-10">
          <div className={cn("p-5 sm:p-8", chartCard)}>
            {topLine}
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

/* ─────────────────────────── Fund types ─────────────────────────── */

export function FundsSection() {
  const [p, setP] = useState(fundTypes[0].label);
  const f = fundTypes.find((x) => x.label === p)!;
  const reduce = useReducedMotion();
  const max = Math.max(...f.rows.map((r) => r.v));
  return (
    <section id="funds" aria-labelledby="funds-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="funds-title" eyebrow="Fund types" title="Savings by fund type" highlight="fund type" intro="Your PFA places your savings in a fund that matches your age and appetite for risk. Fund II holds the largest share." action={<Segmented value={p} options={fundTypes.map((x) => x.label)} onChange={setP} label="Reporting month" id="funds" />} />
        <Rise className="mt-10">
          <div className={cn("p-5 sm:p-8", chartCard)}>
            {topLine}
            <DataPanel
              title="Assets by fund type" name={`fund-types-${f.period}`}
              rows={f.rows.map((r) => ({ period: f.period, fund: r.k, naira_trillion: r.v, share_percent: +((r.v / f.total) * 100).toFixed(2) }))}
              chart={
                <Spotlight className="rounded-2xl border border-gray-200/80">
                  <ul className="divide-y divide-gray-100" aria-label={`Assets by fund type, ${f.label}`}>
                    {f.rows.map((r, i) => (
                      <li key={`${f.period}-${r.k}`} className="group grid grid-cols-1 gap-2 px-4 py-4 transition-colors hover:bg-[#F7FAF6] sm:grid-cols-[220px_1fr_150px] sm:items-center sm:px-5">
                        <div>
                          <p className="font-bold text-[#164D20]">{r.k}</p>
                          <p className="text-sm text-gray-600">{r.who}</p>
                        </div>
                        <div className="h-3 rounded-full bg-[#E8F5E9]">
                          <motion.div className="relative h-full rounded-full bg-gradient-to-r from-[#105D1D] via-[#14892A] to-[#CB9615]" initial={{ width: 0 }} whileInView={{ width: `${(r.v / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 1, delay: reduce ? 0 : i * 0.1, ease }}>
                            <span aria-hidden="true" className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#CB9615] ring-4 ring-white transition-transform duration-300 group-hover:scale-125" />
                          </motion.div>
                        </div>
                        <p className="font-bold tabular-nums text-[#164D20] sm:text-right">{tn(r.v)} <span className="text-sm font-normal text-gray-600">{((r.v / f.total) * 100).toFixed(0)}%</span></p>
                      </li>
                    ))}
                  </ul>
                </Spotlight>
              }
              table={<DataTable head={["Fund", "₦ trillion", "Share"]} rows={[...f.rows.map((r) => [r.k, r.v.toFixed(2), `${((r.v / f.total) * 100).toFixed(1)}%`]), ["Total", f.total.toFixed(2), "100%"]]} />}
              caption="Other funds are worked out as total assets minus the funds listed. Source: PenCom monthly portfolio reports."
            />
          </div>
        </Rise>
        <div className="group mt-6 flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-[#F4F7F2] p-4 sm:p-5">
          <Tile icon={HelpCircle} />
          <p className="text-base text-gray-700">Not sure which fund you are in? <Link to="/resources/faq" className={cn("rounded font-semibold text-[#117F21] underline underline-offset-4 hover:text-[#105D1D]", focus)}>Read the FAQ</Link> or ask your PFA.</p>
        </div>
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
    <section id="coverage" aria-labelledby="cov-title" className={cn(softBand, sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="cov-title" eyebrow="Coverage and contributions" title="Who is saving, and how much is coming in" highlight="coming in" />
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Rise className="h-full">
            <div className={cn("h-full p-6 sm:p-8", chartCard)}>
              <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-xl font-bold tracking-tight">RSA holders</h3><AsAt>{asAt}</AsAt></div>
              <p className="mt-1 text-base text-gray-600">People with a Retirement Savings Account.</p>
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
            <div className={cn("h-full p-6 sm:p-8", chartCard)}>
              <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-xl font-bold tracking-tight">Contributions received</h3><AsAt>Q1 2026</AsAt></div>
              <p className="mt-1 text-base text-gray-600">Money paid in by employers and workers each quarter.</p>
              <div className="mt-6">
                <DataPanel title="Contributions" name="contributions" rows={contributions.map((c) => ({ quarter: c.label, naira_billion: c.v, derived: !!c.derived }))}
                  chart={<Columns data={contributions.map((c) => ({ ...c, note: c.derived ? "derived" : undefined }))} fmt={bn} color="#105D1D" />}
                  table={<DataTable head={["Quarter", "₦ billion"]} rows={contributions.map((c) => [c.label + (c.derived ? " *" : ""), c.v.toFixed(2)])} />}
                  caption="* Worked out from the published Q3 2025 increase of 18%. Q4 2025 included one-off public-sector payments."
                />
              </div>
            </div>
          </Rise>

          {/* The page's one featured card */}
          <Rise className="h-full">
            <Tilt className="h-full">
              <div className={cn(featured, "h-full p-6 sm:p-8")}>
                <GridBackdrop />
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#CB9615]/20 blur-3xl" />
                <div className="relative flex flex-wrap items-start justify-between gap-3"><h3 className="text-xl font-bold tracking-tight">Personal Pension Plan</h3><AsAt dark>{ppp.asAt}</AsAt></div>
                <div className="relative mt-6 flex flex-col items-center gap-8 sm:flex-row">
                  <div className="relative h-40 w-40 shrink-0">
                    <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${pct.toFixed(1)}% of Personal Pension Plan accounts have received a contribution`}>
                      <defs><linearGradient id="ppp-ring" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7BC67E" /><stop offset="1" stopColor="#F4D27A" /></linearGradient></defs>
                      <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
                      <motion.circle cx="60" cy="60" r={R} fill="none" stroke="url(#ppp-ring)" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} whileInView={{ strokeDashoffset: C * (1 - pct / 100) }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 1.4, ease }} />
                    </svg>
                    <span className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black">{pct.toFixed(1)}%</span><span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F4D27A]">funded</span></span>
                  </div>
                  <div>
                    <p className="text-base leading-relaxed text-white/85 sm:text-lg"><strong className="text-white">{ppp.registered.toLocaleString("en-NG")}</strong> accounts opened, but only <strong className="text-white">{ppp.funded.toLocaleString("en-NG")}</strong> have received a contribution.</p>
                    <Link to="/services#ppp" className={cn(goldBtn, "group mt-5")}>Start saving in a PPP <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></Link>
                  </div>
                </div>
              </div>
            </Tilt>
          </Rise>

          <Rise delay={0.1} className="h-full">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-4"><Tile icon={PiggyBank} /><h3 className="text-xl font-bold tracking-tight">Retirees</h3></span>
                <AsAt>July 2026</AsAt>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 sm:grid-cols-2">
                <div className="bg-white p-5"><p className="text-3xl font-bold tabular-nums text-[#164D20] sm:text-4xl">{headline.retirees.toLocaleString("en-NG")}</p><p className="mt-1 text-base text-gray-600">retirees receiving a monthly pension</p></div>
                <div className="bg-white p-5"><p className="text-3xl font-bold tabular-nums text-[#164D20] sm:text-4xl">₦{headline.benefitsPaid}tn</p><p className="mt-1 text-base text-gray-600">paid in retirement benefits since the scheme began</p></div>
              </div>
              <p className="mt-6 border-t border-gray-200 pt-4 text-base text-gray-700">Up from 658,811 retirees and ₦2.3tn in July 2024.</p>
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

        {/* Amber status card: sample data */}
        <div role="note" className="relative mt-8 flex gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 pl-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.3)]">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#D97706]" />
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3D9AE] text-[#6B4300]"><AlertTriangle className="h-5 w-5" /></span>
          <p className="text-base leading-relaxed text-gray-700"><strong className="text-[#164D20]">Sample figures for design review.</strong> The PFA names are real; the returns, unit prices and fund sizes are placeholders. PenCom’s Research and Statistics team will supply validated figures before this section goes live.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-5 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-end">
          <Segmented value={fund} options={funds} onChange={setFund} label="Fund" id="cmp-fund" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:justify-self-end">
            <label className="block">
              <span className={ctrlLabel}>Period</span>
              <span className="relative block">
                <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)} className={cn(field, "appearance-none pl-4 pr-11 font-semibold")}>
                  {periods.map((p) => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
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
        <p className="mt-4 text-base text-gray-600">{fundInfo[fund].who} · {fundInfo[fund].risk}. Tick up to three PFAs to compare them side by side.</p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className={cn("p-4 sm:p-6 lg:col-span-8", chartCard)}>
            {topLine}
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
                            <label className={cn("group grid min-h-12 cursor-pointer grid-cols-[1.5rem_var(--name)_1fr_3.75rem] items-center gap-2 rounded-xl px-2 py-1.5 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-[#FFD84D]", on ? "bg-[#F0F8F1] ring-1 ring-[#14892A]/35" : "hover:bg-[#F7FAF6]")}>
                              <input type="checkbox" checked={on} onChange={() => toggle(r.id)} className="sr-only" />
                              <span aria-hidden="true" className={cn("flex h-6 w-6 items-center justify-center rounded-md border-2 transition", on ? "border-[#14892A] bg-[#14892A] text-white" : "border-[#7A8A7E] bg-white group-hover:border-[#14892A]")}>{on && <Check className="h-4 w-4" strokeWidth={3} />}</span>
                              <span className="truncate text-sm font-semibold text-[#164D20] sm:text-base" title={r.name}>{r.short}</span>
                              <span className="h-3 overflow-hidden rounded-full bg-[#E8F5E9]">
                                <motion.span className={cn("block h-full rounded-full", on ? "bg-gradient-to-r from-[#CB9615] to-[#F4D27A]" : "bg-gradient-to-r from-[#105D1D] to-[#14892A]")} initial={{ width: 0 }} animate={{ width: `${(r.ret / max) * 100}%` }} transition={{ duration: reduce ? 0 : 0.7, ease }} />
                              </span>
                              <span className="text-right text-sm font-bold tabular-nums text-[#164D20] sm:text-base">{r.ret.toFixed(1)}%</span>
                            </label>
                          </motion.li>
                        );
                      })}
                      {rows.length === 0 && <li className="py-10 text-center text-base text-gray-600">No PFA matches “{q}”.</li>}
                    </ul>
                  </div>
                </LayoutGroup>
              }
              table={<DataTable head={["PFA", "Return", "Unit price (₦)", "Fund size"]} rows={rows.map((r) => [r.name, `${r.ret.toFixed(2)}%`, r.price.toFixed(4), `₦${(r.size * 1000).toFixed(0)}bn`])} />}
              caption={`Sample data. ${period === "3 years (a year)" ? "Three-year figures are average yearly returns." : ""}`}
            />
          </div>

          <aside className="lg:col-span-4" aria-label="Your comparison">
            <div className="sticky top-[180px] overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_30px_60px_-40px_rgba(16,93,29,0.45)]">
              <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
              <p className="text-xl font-bold">Your comparison</p>
              <AnimatePresence initial={false} mode="popLayout">
                {chosen.length === 0 ? (
                  <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-base text-gray-600">Tick up to three PFAs in the list to see them side by side.</motion.p>
                ) : (
                  <motion.ul key="list" className="mt-4 space-y-3">
                    {chosen.map((c) => (
                      <motion.li key={c.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-[#F7FAF6] p-4 pl-5">
                        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#CB9615] to-[#14892A]" />
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold leading-snug text-[#164D20]">{c.name}</p>
                          <button type="button" onClick={() => toggle(c.id)} aria-label={`Remove ${c.name}`} className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-[#14892A] hover:bg-[#14892A] hover:text-white", focus)}><X className="h-5 w-5" aria-hidden="true" /></button>
                        </div>
                        <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-gray-200/80 bg-gray-200/80 text-center">
                          <div className="bg-white p-2"><dt className="text-sm text-gray-600">Return</dt><dd className="text-lg font-bold">{c.ret.toFixed(1)}%</dd></div>
                          <div className="bg-white p-2"><dt className="text-sm text-gray-600">vs median</dt><dd className={cn("text-lg font-bold", c.ret >= median ? "text-[#117F21]" : "text-[#B42318]")}>{c.ret >= median ? "+" : ""}{(c.ret - median).toFixed(1)}</dd></div>
                          <div className="bg-white p-2"><dt className="text-sm text-gray-600">Size</dt><dd className="text-lg font-bold">₦{(c.size * 1000).toFixed(0)}bn</dd></div>
                        </dl>
                        <Link to={`/operators?op=${c.id}`} className={cn("group mt-2 inline-flex min-h-11 items-center gap-1.5 rounded text-base font-semibold text-[#117F21] underline-offset-4 hover:underline", focus)}>Contact details <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" /></Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-base text-gray-600">Want to move your savings?</p>
                <Link to="/services#rsa-transfer" className={cn(goldBtn, "group mt-3 w-full justify-between")}>Transfer your RSA <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></Link>
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
    <section id="fees" aria-labelledby="fees-title" className={cn(softBand, sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="fees-title" eyebrow="Fees" title="What you pay for managing your pension" highlight="What you pay" intro="Fees are deducted from the fund before unit prices are published, so the returns above are after fees. PenCom sets the maximum each party can charge." />
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fees.map((f, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li key={f.title}>
                <Rise delay={i * 0.07} className="h-full">
                  <div className={cn("group relative h-full overflow-hidden p-6", card)}>
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#14892A] to-[#CB9615] transition-transform duration-500 group-hover:scale-x-100" />
                    <div className="flex items-start justify-between gap-3">
                      <Tile icon={Icon} />
                      <span className="rounded-full bg-[#FFF8E1] px-3 py-1 text-xs font-bold text-[#7A5200] ring-1 ring-[#CB9615]/40">{f.tag}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold tracking-tight">{f.title}</h3>
                    <p className="mt-2 text-base leading-relaxed text-gray-600">{f.body}</p>
                  </div>
                </Rise>
              </li>
            );
          })}
          <li>
            <Rise delay={fees.length * 0.07} className="h-full">
              <Link to="/regulations?q=fees#library" className={cn("group relative flex h-full flex-col justify-between overflow-hidden p-6", card, "bg-[#F4F7F2]", focus)}>
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#CB9615] to-[#14892A]" />
                <Tile icon={FileText} dark />
                <span><span className="mt-6 block text-xl font-bold tracking-tight">Read the fee regulations</span><span className="mt-1 block text-base text-gray-600">Regulation on Fees Structure and later circulars, in the library.</span></span>
                <span className="mt-4 inline-flex items-center gap-2 font-semibold text-[#117F21]">Open the library <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></span>
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
          <Spotlight className="mt-8 rounded-3xl">
            <ul className={listPanel}>
              {notes.map((n, i) => {
                const on = open === i;
                return (
                  <li key={n.q} className="relative">
                    <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1 origin-top bg-gradient-to-b from-[#14892A] to-[#CB9615] transition-transform duration-500", on ? "scale-y-100" : "scale-y-0")} />
                    <h3>
                      <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : i)} className={cn("group flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-bold transition-colors hover:bg-[#F7FAF6] sm:px-6", on ? "text-[#105D1D]" : "text-[#164D20]", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]")}>
                        {n.q}
                        <span aria-hidden="true" className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-300", on ? "rotate-180 bg-[#14892A] text-white" : "bg-[#E8F5E9] text-[#117F21]")}><ChevronDown className="h-5 w-5" /></span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                          <p className="px-5 pb-5 text-base leading-relaxed text-gray-600 sm:px-6">{n.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </Spotlight>
        </div>
        <div className="space-y-5 lg:col-span-5">
          <Rise>
            <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-6 sm:p-7">
              <div className="flex items-center gap-4"><Tile icon={Download} /><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">Open data</p></div>
              <p className="mt-4 text-2xl font-bold tracking-tight">Download every series on this page</p>
              <p className="mt-1 text-base text-gray-600">One CSV file with assets, allocation, fund types, membership and contributions.</p>
              <button type="button" onClick={everything} className={cn(goldBtn, "group/dl mt-5")}><Download className="h-5 w-5 transition-transform duration-300 group-hover/dl:translate-y-0.5" aria-hidden="true" /> Download CSV</button>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-200 pt-5">
                {([["/resources#monthly-reports", "Monthly reports"], ["/resources#quarterly-reports", "Quarterly reports"], ["/resources#annual-reports", "Annual reports"]] as const).map(([to, l]) => (
                  <Link key={to} to={to} className={cn("inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-[#164D20] transition hover:border-[#14892A] hover:text-[#117F21]", focus)}>{l}</Link>
                ))}
              </div>
            </div>
          </Rise>
          <Rise delay={0.1}>
            <Spotlight className="rounded-3xl">
              <div className={listPanel}>
                <h3 className="px-5 py-4 text-xl font-bold sm:px-6">Sources</h3>
                <ul className="divide-y divide-gray-100">
                  {sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className={cn(listRow, "min-h-12 justify-between font-medium text-[#164D20] hover:text-[#117F21]")}>
                        {s.label}
                        <Tile icon={ArrowUpRight} size="sm" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Spotlight>
          </Rise>
        </div>
      </div>
    </section>
  );
}
