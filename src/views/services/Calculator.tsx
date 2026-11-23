"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Calculator as CalcIcon, Info } from "lucide-react";
import { GridBackdrop } from "@/views/about/primitives";
import Headline from "@/views/theme/Headline";
import { cn } from "@/lib/utils";
import { DarkBand, Rise, ease } from "@/views/theme/ui";

const naira = (n: number, compact = false) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(n);

function Money({
  value,
  compact = true,
  className,
}: {
  value: number;
  compact?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 90, damping: 20 });
  const text = useTransform(spring, (v) => naira(Math.max(0, v), compact));
  useEffect(() => {
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [value, reduce, spring]);
  return (
    <span className={className}>
      <motion.span aria-hidden="true">{text}</motion.span>
      <span className="sr-only">{naira(value, compact)}</span>
    </span>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <label
        htmlFor={id}
        className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-semibold text-white"
      >
        {label}
        <span className="rounded-lg bg-white/10 px-2.5 py-0.5 font-bold tabular-nums text-[#F4D27A] ring-1 ring-white/15">
          {format(value)}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)}
        className={cn(
          "mt-4 h-2.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-[#FFD84D]",
          // A large round thumb (28 px) that is easy to grab.
          "[&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#CB9615] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md",
          "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[#CB9615] [&::-moz-range-thumb]:bg-white",
        )}
        style={{
          background: `linear-gradient(to right, #CB9615 ${pct}%, rgba(255,255,255,0.22) ${pct}%)`,
        }}
      />
      {hint && <p className="mt-2 text-sm text-white/75">{hint}</p>}
    </div>
  );
}

const W = 600;
const H = 240;

/** Illustrative RSA projection (the Services page's dark band): 18% of pay (10% employer + 8% employee) plus voluntary contributions, compounded monthly. */
export default function Calculator() {
  const [age, setAge] = useState(30);
  const [retire, setRetire] = useState(60);
  const [salary, setSalary] = useState(250_000);
  const [balance, setBalance] = useState(500_000);
  const [voluntary, setVoluntary] = useState(0);
  const [ret, setRet] = useState(10);
  const [growth, setGrowth] = useState(5);
  const reduce = useReducedMotion();
  const barsRef = useRef<HTMLDivElement>(null);
  const barsIn = useInView(barsRef, { once: true, margin: "-40px" });

  const r = useMemo(() => {
    const years = Math.max(1, retire - age);
    let bal = balance;
    let pay = salary;
    let employee = 0;
    let employer = 0;
    let vol = 0;
    const series: number[] = [bal];
    const paidIn: number[] = [bal];
    for (let y = 0; y < years; y++) {
      for (let m = 0; m < 12; m++) {
        bal *= 1 + ret / 100 / 12;
        bal += pay * 0.18 + voluntary;
        employee += pay * 0.08;
        employer += pay * 0.1;
        vol += voluntary;
      }
      series.push(bal);
      paidIn.push(balance + employee + employer + vol);
      pay *= 1 + growth / 100;
    }
    return {
      years,
      total: bal,
      employee,
      employer,
      vol,
      start: balance,
      growthAmt: bal - balance - employee - employer - vol,
      series,
      paidIn,
    };
  }, [age, retire, salary, balance, voluntary, ret, growth]);

  // Fixed 41-point paths so framer can morph between them.
  const toPath = (vals: number[], close: boolean) => {
    const max = Math.max(...r.series, 1);
    const pts = Array.from({ length: 41 }, (_, i) => {
      const t = (i / 40) * (vals.length - 1);
      const lo = Math.floor(t);
      const hi = Math.min(vals.length - 1, lo + 1);
      const v = vals[lo] + (vals[hi] - vals[lo]) * (t - lo);
      return [(i / 40) * W, H - (v / max) * (H - 16)];
    });
    const line = pts
      .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
    return close ? `${line} L${W},${H} L0,${H} Z` : line;
  };

  const parts = [
    // Each colour keeps at least 3:1 against the dark band.
    { k: "Starting balance", v: r.start, c: "bg-[#9CA3AF]" },
    { k: "Your 8%", v: r.employee, c: "bg-[#4ADE80]" },
    { k: "Employer’s 10%", v: r.employer, c: "bg-[#2E913D]" },
    { k: "Voluntary", v: r.vol, c: "bg-[#38BDF8]" },
    { k: "Investment growth", v: Math.max(0, r.growthAmt), c: "bg-[#F4D27A]" },
  ];
  const sum = parts.reduce((a, p) => a + p.v, 0) || 1;

  return (
    <DarkBand id="calculator" labelledBy="calc-title">
      {/* The page's dark band: sliders on glass, the estimate in large type, a gold growth line and growing bars. */}
      <Headline
        id="calc-title"
        kicker="Pension calculator"
        title="See how your savings could grow"
        mark="could grow"
        dark
        intro="Move the sliders to estimate your RSA balance when you retire. It’s an illustration, not a promise: real returns go up and down."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Rise className="lg:col-span-5">
          <div className="h-full space-y-7 rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/15 backdrop-blur-sm sm:p-8">
            <Slider
              label="Your age"
              value={age}
              min={18}
              max={64}
              step={1}
              onChange={(v) => {
                setAge(v);
                if (retire <= v) setRetire(v + 1);
              }}
              format={(v) => `${v}`}
            />
            <Slider label="Retire at" value={retire} min={Math.max(50, age + 1)} max={70} step={1} onChange={setRetire} format={(v) => `${v}`} />
            <Slider label="Monthly pay" value={salary} min={30_000} max={3_000_000} step={10_000} onChange={setSalary} format={(v) => naira(v)} />
            <Slider label="Current RSA balance" value={balance} min={0} max={50_000_000} step={50_000} onChange={setBalance} format={(v) => naira(v, true)} />
            <Slider label="Voluntary contribution a month" value={voluntary} min={0} max={500_000} step={5_000} onChange={setVoluntary} format={(v) => naira(v)} />
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Slider label="Yearly return" value={ret} min={0} max={20} step={0.5} onChange={setRet} format={(v) => `${v}%`} hint="An assumption, not a forecast" />
              <Slider label="Yearly pay rise" value={growth} min={0} max={15} step={0.5} onChange={setGrowth} format={(v) => `${v}%`} />
            </div>
          </div>
        </Rise>

        <Rise delay={0.08} className="lg:col-span-7">
          <div className="relative h-full overflow-hidden rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/15 backdrop-blur-sm sm:p-8">
            <GridBackdrop className="opacity-50" />
            <div className="relative flex items-start gap-4">
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F4D27A] to-[#CB9615] text-[#11421A] shadow-[0_14px_30px_-12px_rgba(203,150,21,0.8)]">
                <CalcIcon className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">Estimated balance at {retire}</p>
                <p className="mt-1" aria-live="polite">
                  <Money value={r.total} className="text-4xl font-black tabular-nums tracking-tight text-white sm:text-6xl" />
                </p>
              </div>
            </div>
            <p className="relative mt-4 leading-relaxed text-white/85 sm:text-lg">
              After {r.years} years of contributions. That could pay roughly{" "}
              <Money value={r.total / 240} compact={false} className="font-bold text-[#F4D27A]" /> a month over 20 years, before any further returns.
            </p>

            {/* Growth chart */}
            <figure className="relative mt-6 rounded-2xl bg-[#11421A]/60 p-4 ring-1 ring-white/10">
              <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full sm:h-52" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="calc-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#F4D27A" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#F4D27A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.08)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                ))}
                <motion.path initial={false} d={toPath(r.series, true)} fill="url(#calc-fill)" animate={{ d: toPath(r.series, true) }} transition={{ duration: reduce ? 0 : 0.6, ease }} />
                <motion.path
                  initial={false}
                  d={toPath(r.series, false)}
                  fill="none"
                  stroke="#F4D27A"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                  animate={{ d: toPath(r.series, false) }}
                  transition={{ duration: reduce ? 0 : 0.6, ease }}
                />
                <motion.path
                  initial={false}
                  d={toPath(r.paidIn, false)}
                  fill="none"
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  vectorEffect="non-scaling-stroke"
                  animate={{ d: toPath(r.paidIn, false) }}
                  transition={{ duration: reduce ? 0 : 0.6, ease }}
                />
              </svg>
              <figcaption className="mt-3 text-sm text-white/80">
                <span className="flex justify-between gap-4">
                  <span>Age {age}</span>
                  <span>Age {retire}</span>
                </span>
                <span className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
                  <span className="flex items-center gap-2">
                    <span className="h-1 w-6 rounded-full bg-[#F4D27A]" /> Balance
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-0 w-6 border-t-2 border-dashed border-white/75" /> Money paid in
                  </span>
                </span>
              </figcaption>
            </figure>

            {/* Breakdown: bars that grow to each part's share */}
            <div className="relative mt-6">
              <div ref={barsRef} className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                {parts.map((p) => (
                  <motion.span
                    key={p.k}
                    className={p.c}
                    initial={{ width: 0 }}
                    animate={{ width: barsIn ? `${(p.v / sum) * 100}%` : 0 }}
                    transition={{ duration: reduce ? 0 : 0.8, ease }}
                  />
                ))}
              </div>
              <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 min-[400px]:grid-cols-2 sm:grid-cols-3">
                {parts
                  .filter((p) => p.v > 0)
                  .map((p) => (
                    <div key={p.k}>
                      <dt className="flex items-center gap-2 text-sm text-white/80">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.c}`} aria-hidden="true" />
                        {p.k}
                      </dt>
                      <dd className="mt-0.5 text-xl font-bold tabular-nums text-white">
                        <Money value={p.v} />
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
            <p className="relative mt-6 flex gap-3 rounded-2xl bg-white/[0.06] p-4 text-sm leading-relaxed text-white/85 ring-1 ring-white/10">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#F4D27A]" aria-hidden="true" />
              Assumes the minimum 18% contribution every month, the return and pay rise you chose, and no withdrawals or fees. Your PFA can give you your actual balance and projections.
            </p>
          </div>
        </Rise>
      </div>
    </DarkBand>
  );
}
