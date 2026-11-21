"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Check, Copy, Download, FileText, Info, Minus, Plus, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridBackdrop, ease } from "@/views/about/primitives";
import { Crumbs, DarkBackdrop } from "@/views/theme/ui";

/** Shared building blocks for web versions of official documents (DES-22), in classic tokens. */

export const ring = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]";
/** Soft green glow that follows the pointer (set `--x`/`--y` with `spot` from the theme kit). */
export const glowLight = "[background-image:radial-gradient(420px_circle_at_var(--x,50%)_var(--y,0%),rgba(46,145,61,0.10),transparent_45%)]";
/** Featured dark card: the classic #04240A → #0A4A13 → #117F21 gradient. */
export const darkCard = "bg-gradient-to-br from-[#04240A] via-[#0A4A13] to-[#117F21]";

/** `url` null: the document has no web version; report "error" without a request (no 404 in the console). */
export function useDocJson<T>(url: string | null) {
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; data: T | null }>({ status: "loading", data: null });
  useEffect(() => {
    let off = false;
    if (!url) {
      setState({ status: "error", data: null });
      return;
    }
    setState({ status: "loading", data: null });
    fetch(url)
      .then((r) => {
        if (!r.ok || !(r.headers.get("content-type") ?? "").includes("json")) throw new Error("missing");
        return r.json();
      })
      .then((d: T) => !off && setState({ status: "ready", data: d }))
      .catch(() => !off && setState({ status: "error", data: null }));
    return () => {
      off = true;
    };
  }, [url]);
  return state;
}

export function useTitle(t: string) {
  useEffect(() => {
    document.title = `${t} | PenCom`;
    return () => {
      document.title = "PenCom Nigeria";
    };
  }, [t]);
}

/** Highlights search matches. */
export function Mark({ text, q }: { text: string; q: string }) {
  const t = q.trim();
  if (t.length < 2) return <>{text}</>;
  const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return <>{text.split(re).map((p, i) => (i % 2 ? <mark key={i} className="rounded bg-[#FFE38A] px-0.5 text-inherit">{p}</mark> : p))}</>;
}

export function ReadingBar() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden="true" style={{ scaleX: x }} className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#CB9615] via-[#E0AA22] to-[#F4D27A] print:hidden" />;
}

/**
 * Document banner: dark #04240A with the grid and blurs, light crumbs, a type chip (plus an optional badge), the
 * title with a short gold bar, a lead, actions, and the meta row as a `gap-px` grid. Print stays white.
 */
export function DocBanner({
  crumbs, kind, title, lead, meta, badge, actions, icon,
}: {
  crumbs: { label: string; to?: string }[];
  kind: string;
  title: string;
  lead?: ReactNode;
  meta: { label: string; value: ReactNode }[];
  badge?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <header className="relative isolate overflow-hidden text-white print:bg-white print:text-black">
      <DarkBackdrop />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 lg:pb-14">
        <Crumbs crumbs={crumbs} dark className="print:hidden" />
        <div className="mt-6 max-w-4xl">
          <motion.p initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white/10 py-1 pl-1 pr-4 text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A] ring-1 ring-white/15 backdrop-blur-md print:text-black">
              <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#F4D27A] to-[#CB9615] text-[#04240A] [&_svg]:h-3.5 [&_svg]:w-3.5">{icon ?? <FileText />}</span>
              {kind}
            </span>
            {badge}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="mt-5 text-3xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            {title}
          </motion.h1>
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: reduce ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            className="mt-5 block h-1 w-20 origin-left rounded-full bg-gradient-to-r from-[#F4D27A] to-[#CB9615] print:hidden"
          />
          {lead && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg print:text-black">{lead}</motion.div>}
          {actions && <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-7 flex flex-wrap gap-3 print:hidden">{actions}</motion.div>}
        </div>
        {meta.length > 0 && (
          <motion.dl
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease }}
            className={cn("mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 print:border-black/20", meta.length >= 4 ? "lg:grid-cols-4" : meta.length === 3 ? "sm:grid-cols-3" : "")}
          >
            {meta.map((m) => (
              <div key={m.label} className="bg-[#04240A]/85 p-4 sm:p-5 print:bg-white">
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A] print:text-black">{m.label}</dt>
                <dd className="mt-1 text-base font-semibold sm:text-lg">{m.value}</dd>
              </div>
            ))}
          </motion.dl>
        )}
      </div>
    </header>
  );
}
/** Calm-era name for the document banner. */
export const DocHero = DocBanner;

export function PrimaryBtn({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  const cls = cn("group inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#CB9615] px-5 font-semibold text-[#1A1206] shadow-[0_14px_30px_-16px_rgba(203,150,21,0.9)] transition hover:bg-[#E0AA22]", ring);
  return external ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}<span className="sr-only"> (opens in a new tab)</span></a> : <Link to={href} className={cls}>{children}</Link>;
}
export function GhostBtn({ onClick, children, href }: { onClick?: () => void; children: ReactNode; href?: string }) {
  const cls = cn("inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#117F21]/25 bg-white px-5 font-semibold text-[#117F21] transition hover:border-[#117F21] hover:bg-[#F7FAF6]", ring);
  if (href) return <a href={href} onClick={onClick} className={cls}>{children}</a>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

/** Arrow tile; the arrow moves 4 px on hover (put inside a `group`). */
export function ArrowChip({ dark }: { dark?: boolean }) {
  return (
    <span aria-hidden="true" className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", dark ? "bg-[#CB9615] text-[#1A1206]" : "bg-[#E8F5E9] text-[#117F21] transition group-hover:bg-[#117F21] group-hover:text-white")}>
      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  );
}

/** Text size, print and copy-link tools. */
export function DocTools({ size, setSize }: { size: number; setSize: (n: number) => void }) {
  const [copied, setCopied] = useState(false);
  const btn = cn("flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#0A2E10] transition hover:border-[#117F21] hover:bg-[#117F21] hover:text-white disabled:pointer-events-none disabled:opacity-30", ring);
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <div role="group" aria-label="Text size" className="flex items-center gap-1">
        <button type="button" className={btn} onClick={() => setSize(Math.max(0, size - 1))} disabled={size === 0} aria-label="Smaller text"><Minus className="h-4 w-4" aria-hidden="true" /></button>
        <span className="w-8 text-center text-base font-bold text-gray-600" aria-live="polite">A<span className="sr-only"> size {size + 1} of 3</span></span>
        <button type="button" className={btn} onClick={() => setSize(Math.min(2, size + 1))} disabled={size === 2} aria-label="Larger text"><Plus className="h-4 w-4" aria-hidden="true" /></button>
      </div>
      <button type="button" className={btn} onClick={() => window.print()} aria-label="Print"><Printer className="h-4 w-4" aria-hidden="true" /></button>
      <button type="button" className={btn} aria-label="Copy link to this page" onClick={() => { navigator.clipboard?.writeText(location.href).catch(() => undefined); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>
        {copied ? <Check className="h-4 w-4 text-[#117F21]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span>
    </div>
  );
}
/** Document body sizes: 16 px base in classic, then 18 and 20 px (DES-41). */
export const sizes = ["1rem", "1.125rem", "1.25rem"];

/** Contents list with a scroll-spy that works in both directions. */
export function Toc({ items, title = "Contents", className }: { items: { id: string; label: string; level?: number }[]; title?: string; className?: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let cur = items[0]?.id;
      for (const i of items) {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top <= line) cur = i.id;
      }
      setActive(cur);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, [items]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);
  return (
    <nav aria-label={title} className={cn("rounded-3xl border border-gray-200/80 bg-white p-3", className)}>
      <p className="px-2 pt-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-600">{title}</p>
      <ol ref={listRef} className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {items.map((i) => (
          <li key={i.id} data-id={i.id}>
            <a
              href={`#${i.id}`}
              onClick={(e) => { e.preventDefault(); document.getElementById(i.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              aria-current={active === i.id ? "location" : undefined}
              className={cn("flex min-h-11 items-center rounded-xl py-2 pr-3 text-[15px] leading-snug transition", (i.level ?? 1) > 1 ? "pl-7 text-sm" : "pl-3 font-medium", active === i.id ? "bg-gradient-to-r from-[#0A4A13] to-[#117F21] font-semibold text-white shadow-[0_10px_24px_-14px_rgba(10,74,19,0.9)]" : "bg-gray-50 text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0A4A13]", ring)}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PdfCard({ href, title, meta }: { href: string; title: string; meta: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn("group relative isolate flex items-center gap-5 overflow-hidden rounded-3xl p-6 text-white shadow-[0_28px_50px_-30px_rgba(10,74,19,0.7)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-24px_rgba(10,74,19,0.8)]", darkCard, ring)}>
      <GridBackdrop className="-z-10 opacity-60" />
      <span aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-40 w-40 rounded-full bg-[#CB9615]/20 blur-3xl" />
      <span className="relative flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[#B52026] shadow-lg transition group-hover:-rotate-6">
        <FileText className="h-6 w-6" aria-hidden="true" /><span className="text-xs font-bold">PDF</span>
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A]">Official signed copy</span>
        <span className="mt-1 block text-lg font-semibold leading-snug">{title}</span>
        <span className="mt-0.5 block text-base text-white/80">{meta}</span>
      </span>
      <span className="relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#CB9615] text-[#1A1206] transition group-hover:bg-[#E0AA22] sm:flex"><Download className="h-5 w-5" aria-hidden="true" /></span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export function VerifyNote({ children }: { children?: ReactNode }) {
  return (
    <p className="relative flex gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 pl-6 text-base leading-relaxed text-gray-600">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#1E88E5]" />
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F2FD] text-[#0B4F8A]"><Info className="h-5 w-5" /></span>
      <span>{children ?? "This web version was prepared from the official PDF so it is easier to read, search and link to. If the two ever differ, the signed PDF is the authoritative text."}</span>
    </p>
  );
}

export function Loading({ label = "Loading the document" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-base text-gray-600" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#117F21]/20 border-t-[#CB9615]" aria-hidden="true" />
      {label}…
    </div>
  );
}
