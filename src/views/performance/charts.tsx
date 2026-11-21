"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Download, Table2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ease } from "@/views/theme/ui";
import { download } from "./data";

const ring = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]";

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ─────────────────────────── Chart / table switch + downloads ─────────────────────────── */

/** Calm: a white pill bar (dark-green active pill with gold text) to switch chart and table, and two labelled download buttons. */
export function DataPanel({
  title, name, rows, chart, table, dark, caption,
}: {
  title: string;
  name: string;
  rows: Record<string, string | number | boolean | undefined>[];
  chart: ReactNode;
  table: ReactNode;
  dark?: boolean;
  caption?: ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const btn = cn(
    "inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-base font-semibold ring-1 transition-colors duration-300",
    ring,
    dark ? "text-white ring-white/30 hover:bg-[#F4D27A] hover:text-[#1A1206] hover:ring-[#F4D27A]" : "bg-white text-[#0A4A13] ring-[#117F21]/40 hover:bg-[#0A4A13] hover:text-[#F4D27A] hover:ring-[#0A4A13]",
  );
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={`${title}: view as`} className={cn("inline-flex gap-1 rounded-full p-1.5 ring-1", dark ? "bg-white/[0.07] ring-white/15" : "bg-[#FBF8F1] ring-black/10")}>
          {(["chart", "table"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cn("relative inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-base font-semibold capitalize transition-colors", ring, view === v ? (dark ? "text-[#1A1206]" : "text-[#F4D27A]") : dark ? "text-white hover:bg-white/10" : "text-[#14261A] hover:text-[#117F21]")}>
              {view === v && <motion.span layoutId={`view-${name}`} className={cn("absolute inset-0 -z-0 rounded-full", dark ? "bg-[#F4D27A]" : "bg-[#0A4A13]")} transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative flex items-center gap-2">{v === "chart" ? <BarChart3 className="h-5 w-5" aria-hidden="true" /> : <Table2 className="h-5 w-5" aria-hidden="true" />}{v}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" className={btn} onClick={() => download(name, rows, "csv")}><Download className="h-5 w-5" aria-hidden="true" /><span className="sr-only">Download</span> CSV<span className="sr-only"> of {title}</span></button>
          <button type="button" className={btn} onClick={() => download(name, rows, "json")}><Download className="h-5 w-5" aria-hidden="true" /><span className="sr-only">Download</span> JSON<span className="sr-only"> of {title}</span></button>
        </div>
      </div>
      <div className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25, ease }}>
            {view === "chart" ? chart : table}
          </motion.div>
        </AnimatePresence>
      </div>
      {caption && <div className={cn("mt-5 text-base leading-relaxed", dark ? "text-white/85" : "text-gray-700")}>{caption}</div>}
    </div>
  );
}

export function DataTable({ head, rows, dark }: { head: string[]; rows: (string | number)[][]; dark?: boolean }) {
  return (
    <div className={cn("max-h-[440px] overflow-auto rounded-2xl ring-1", dark ? "ring-white/15" : "bg-white ring-black/10")}>
      <table className="w-full min-w-[320px] text-left text-base">
        <thead className={cn("sticky top-0", dark ? "bg-[#0A4A13]" : "bg-[#F1EFE8]")}>
          <tr>{head.map((h, i) => <th key={h} scope="col" className={cn("px-4 py-3 text-sm font-bold", i > 0 && "text-right", dark ? "text-[#F4D27A]" : "text-[#14261A]")}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={cn("border-t transition-colors", dark ? "border-white/10 hover:bg-white/[0.07]" : "border-black/[0.07] hover:bg-[#FBF8F1]")}>
              {r.map((c, j) => j === 0 ? <th key={j} scope="row" className={cn("px-4 py-3 font-semibold", dark ? "text-white" : "text-[#14261A]")}>{c}</th> : <td key={j} className={cn("px-4 py-3 text-right tabular-nums", dark ? "text-white/90" : "text-gray-700")}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────── Area chart with crosshair ─────────────────────────── */

export function AreaChart({ data, fmt, label, dark, height = 320 }: { data: { label: string; long: string; v: number }[]; fmt: (v: number) => string; label: string; dark?: boolean; height?: number }) {
  const [wrap, w] = useWidth<HTMLDivElement>();
  const inView = useInView(wrap, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const tip = useRef<HTMLDivElement>(null);
  const [tw, setTw] = useState(170);
  const gid = useId().replace(/:/g, "");
  const pad = { t: 24, r: 16, b: 36, l: 52 };
  const W = Math.max(w, 280);
  const H = height;
  const vs = data.map((d) => d.v);
  const lo = Math.floor(Math.min(...vs) * 0.97);
  const hi = Math.ceil(Math.max(...vs) * 1.02);
  const x = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = Array.from({ length: 4 }, (_, i) => lo + ((hi - lo) * i) / 3);
  const every = Math.ceil(data.length / Math.max(2, Math.floor(W / 100)));
  const h = hover ?? data.length - 1;
  // Axis text: gray-600 #4B5563 on white (7.6:1), white/80 on the green panel. Line: green on white, light gold on green.
  const tone = dark
    ? { grid: "rgba(255,255,255,0.15)", base: "rgba(255,255,255,0.35)", txt: "rgba(255,255,255,0.8)", strong: "#F4D27A", line: "#F4D27A", dot: "#0A4A13" }
    : { grid: "#E3E0D6", base: "#B8B3A4", txt: "#4B5563", strong: "#14261A", line: "#117F21", dot: "#fff" };
  const up = h > 0 && data[h].v >= data[h - 1].v;

  // measure the tooltip so it never runs past the chart's right edge
  useEffect(() => {
    if (tip.current) setTw(tip.current.offsetWidth);
  }, [h, inView, w]);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div ref={wrap} className="relative">
      {w > 0 && (
        <svg
          viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${label}. ${data[0].long}: ${fmt(data[0].v)}; ${data[data.length - 1].long}: ${fmt(data[data.length - 1].v)}. Use left and right arrow keys to read each month.`}
          tabIndex={0} onPointerMove={onMove} onPointerLeave={() => setHover(null)}
          onKeyDown={(e) => { if (e.key === "ArrowLeft") setHover((p) => Math.max(0, (p ?? data.length - 1) - 1)); if (e.key === "ArrowRight") setHover((p) => Math.min(data.length - 1, (p ?? data.length - 1) + 1)); }}
          className={cn("block touch-none rounded-2xl", ring)}
        >
          <defs>
            <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dark ? "#F4D27A" : "#117F21"} stopOpacity={dark ? 0.22 : 0.16} />
              <stop offset="100%" stopColor={tone.line} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`stroke-${gid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={dark ? "#B9DB8A" : "#117F21"} />
              <stop offset="100%" stopColor={dark ? "#F4D27A" : "#0A4A13"} />
            </linearGradient>
          </defs>
          {ticks.map((t, i) => (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={i === 0 ? tone.base : tone.grid} strokeDasharray={i === 0 ? undefined : "4 6"} />
              <text x={pad.l - 10} y={y(t) + 5} textAnchor="end" fontSize="13" fill={tone.txt}>{fmt(t).replace(/tn$/, "")}</text>
            </g>
          ))}
          {data.map((d, i) => i % every === 0 || i === data.length - 1 ? <text key={d.label} x={i === data.length - 1 ? W - 2 : x(i)} y={H - 10} textAnchor={i === data.length - 1 ? "end" : "middle"} fontSize="13" fontWeight={i === h ? 700 : 400} fill={i === h ? tone.strong : tone.txt}>{d.label}</text> : null)}
          <motion.path d={area} fill={`url(#fill-${gid})`} initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ duration: 1, delay: reduce ? 0 : 0.6 }} />
          {/* the line draws in once: the chart's one moment */}
          <motion.path d={line} fill="none" stroke={`url(#stroke-${gid})`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: reduce ? 0 : 1.6, ease }} />
          {inView && (
            <g>
              <motion.line x1={x(h)} x2={x(h)} y1={pad.t} y2={H - pad.b} stroke={tone.line} strokeDasharray="3 5" strokeLinecap="round" opacity={0.7} animate={{ x1: x(h), x2: x(h) }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
              <motion.circle cx={x(h)} cy={y(data[h].v)} r={7} fill={tone.dot} stroke={tone.line} strokeWidth={3} animate={{ cx: x(h), cy: y(data[h].v) }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
            </g>
          )}
        </svg>
      )}
      {w > 0 && inView && (
        <motion.div
          ref={tip}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-2xl bg-white px-4 py-3 text-[#14261A] ring-1 ring-black/10 shadow-[0_20px_40px_-20px_rgba(10,74,19,0.5)]"
          // sits below the point when it is high on the chart, above it when low, so it never hides the point
          animate={{ left: Math.min(Math.max(x(h) - tw / 2, 0), W - tw), top: y(data[h].v) < H / 2 ? y(data[h].v) + 22 : Math.max(0, y(data[h].v) - 108) }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        >
          <span className="block text-sm font-semibold text-gray-700">{data[h].long}</span>
          <span className="block text-xl font-bold tabular-nums text-[#117F21]">{fmt(data[h].v)}</span>
          {/* up/down on white: green #117F21 (5.1:1) / red #B42318 (6.5:1) */}
          {h > 0 && <span className={cn("block text-sm font-semibold", up ? "text-[#117F21]" : "text-[#B42318]")}>{up ? "▲" : "▼"} {(((data[h].v - data[h - 1].v) / data[h - 1].v) * 100).toFixed(2)}% on month</span>}
        </motion.div>
      )}
      <p className="sr-only" aria-live="polite">{hover !== null ? `${data[hover].long}: ${fmt(data[hover].v)}` : ""}</p>
    </div>
  );
}

/* ─────────────────────────── Donut ─────────────────────────── */

export function Donut({ items, colors, total, unit }: { items: { k: string; v: number }[]; colors: Record<string, string>; total: number; unit: (v: number) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [on, setOn] = useState<string | null>(null);
  const shown = items.filter((i) => i.v > 0);
  const R = 42;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = shown.map((it) => {
    const frac = it.v / total;
    const s = { ...it, frac, start: acc };
    acc += frac;
    return s;
  });
  const cur = segs.find((s) => s.k === on);
  return (
    <div ref={ref} className="grid grid-cols-1 items-center gap-8 sm:grid-cols-[260px_1fr] lg:gap-12">
      <div className="relative mx-auto h-60 w-60 sm:h-64 sm:w-64">
        <svg viewBox="0 0 100 100" className="relative h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#EDEAE1" strokeWidth="12" />
          {segs.map((s, i) => (
            <motion.circle
              key={s.k} cx="50" cy="50" r={R} fill="none" stroke={colors[s.k]} strokeWidth={on === s.k ? 14 : 12}
              strokeDasharray={`${Math.max(0, s.frac * C - 0.8)} ${C}`}
              initial={{ strokeDashoffset: -s.start * C, opacity: 0 }}
              animate={{ strokeDashoffset: -s.start * C, opacity: inView ? (on && on !== s.k ? 0.3 : 1) : 0 }}
              transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.1 + i * 0.12 }}
              onPointerEnter={() => setOn(s.k)} onPointerLeave={() => setOn(null)}
              className="cursor-pointer transition-[stroke-width]"
            />
          ))}
        </svg>
        {/* plain centre figure: the total, or the part being pointed at */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
          <AnimatePresence mode="wait">
            <motion.div key={cur?.k ?? "total"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <p className="text-base font-semibold leading-tight text-gray-700">{cur ? cur.k : "Total"}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-[#14261A]">{unit(cur ? cur.v : total)}</p>
              {cur && <p className="mt-1 text-base font-semibold tabular-nums text-[#117F21]">{(cur.frac * 100).toFixed(1)}%</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((it) => {
          const pct = (it.v / total) * 100;
          const act = on === it.k;
          return (
            <li key={it.k}>
              <button type="button" onFocus={() => setOn(it.k)} onBlur={() => setOn(null)} onPointerEnter={() => setOn(it.k)} onPointerLeave={() => setOn(null)} disabled={it.v === 0} className={cn("w-full rounded-2xl p-3.5 text-left ring-1 transition duration-300", ring, act ? "bg-[#FBF8F1] ring-2 ring-[#117F21]" : "ring-transparent hover:bg-[#FBF8F1]", it.v === 0 && "opacity-60")}>
                <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-lg">
                  <span className="flex items-center gap-3 font-bold text-[#14261A]"><span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: colors[it.k] }} />{it.k}</span>
                  <span className="text-base tabular-nums text-gray-700">{it.v ? `${unit(it.v)} · ${pct.toFixed(1)}%` : "in Other"}</span>
                </span>
                <span className="mt-2.5 block h-2.5 overflow-hidden rounded-full bg-[#EDEAE1]">
                  <motion.span className="block h-full rounded-full" style={{ background: colors[it.k] }} initial={{ width: 0 }} animate={{ width: inView ? `${pct}%` : 0 }} transition={{ duration: reduce ? 0 : 0.9, ease }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────────────────── Column chart ─────────────────────────── */

/** Calm columns: plain bars on a warm track; the latest is gold with an ink figure chip. */
export function Columns({ data, fmt, color = "#117F21", dark, highlightLast = true }: { data: { label: string; v: number; note?: string }[]; fmt: (v: number) => string; color?: string; dark?: boolean; highlightLast?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const max = Math.max(...data.map((d) => d.v));
  const min = Math.min(...data.map((d) => d.v));
  const base = min > max * 0.85 ? min * 0.97 : 0;
  return (
    <div ref={ref} className="flex h-64 items-stretch gap-2 sm:gap-4" role="img" aria-label={data.map((d) => `${d.label}: ${fmt(d.v)}`).join("; ")}>
      {data.map((d, i) => {
        const hgt = Math.max(4, ((d.v - base) / (max - base)) * 100 * 0.78);
        const last = highlightLast && i === data.length - 1;
        return (
          <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center">
            {/* track: a faint full-height column the bar grows inside */}
            <div className={cn("relative w-full max-w-[64px] flex-1 rounded-t-2xl", dark ? "bg-white/[0.07]" : "bg-[#F1EFE8]")}>
              <motion.span
                className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-2xl"
                style={{ background: last ? "#F4D27A" : color, boxShadow: last ? "inset 0 0 0 2px #CB9615" : undefined }}
                initial={{ height: 0 }} animate={{ height: inView ? `${hgt}%` : 0 }} transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : i * 0.08, ease }}
              >
                {d.note && <span aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.35)_0_4px,transparent_4px_9px)]" />}
              </motion.span>
              <motion.span
                aria-hidden="true"
                className="absolute -inset-x-3 flex justify-center"
                style={{ bottom: `calc(${hgt}% + 6px)` }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 6 }} transition={{ delay: reduce ? 0 : 0.5 + i * 0.08 }}
              >
                <span className={cn(
                  "whitespace-nowrap text-xs font-bold tabular-nums sm:text-sm",
                  last ? "rounded-full bg-[#F4D27A] px-2 py-0.5 text-[#1A1206] ring-1 ring-[#CB9615]" : dark ? "text-white" : "text-[#14261A]",
                )}>
                  {fmt(d.v)}{d.note && <sup className={cn("ml-0.5", last ? "text-[#1A1206]" : dark ? "text-[#F4D27A]" : "text-[#7A5200]")}>*</sup>}
                </span>
              </motion.span>
            </div>
            <span className={cn("w-full border-t-2 pt-2 text-center text-xs leading-tight sm:text-sm", last && "font-bold", dark ? "border-white/30 text-white/85" : "border-[#B8B3A4] text-gray-700", last && !dark && "text-[#14261A]")}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}


/* ─────────────────────────── Animated number ─────────────────────────── */

export function Ticker({ value, fmt, className }: { value: number; fmt: (v: number) => string; className?: string }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? value : 0);
  const from = useRef(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setV(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      const e = 1 - Math.pow(1 - p, 3);
      setV(a + (value - a) * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);
  return <span className={className}>{fmt(v)}</span>;
}

export function useSorted<T>(rows: T[], key: (r: T) => number, dir: "desc" | "asc") {
  return useMemo(() => [...rows].sort((a, b) => (dir === "desc" ? key(b) - key(a) : key(a) - key(b))), [rows, key, dir]);
}
