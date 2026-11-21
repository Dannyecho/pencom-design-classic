"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, X, type LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/views/about/primitives";
import { DrawnMark } from "./Headline";

/**
 * Building blocks shared by every inner page of the calm theme, so pages stay consistent with the home page:
 * the light page hero (cream, crumbs, eyebrow pill, bold title with the drawn underline), the white framed
 * panel, the green inset backdrop, the sticky "On this page" bar, a scroll reveal, and accessible modal and drawer.
 */

export const ease = [0.22, 1, 0.36, 1] as const;
export const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";
/** Section spacing; scroll margin clears the header and the section bar. */
export const sectionCls = "scroll-mt-[170px] overflow-x-clip px-4 py-16 sm:py-20";

export function Rise({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Retired in the calm theme (no pointer spotlight). Kept as a no-op so old pointer-move call sites do nothing. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const spot = (_e: MouseEvent<HTMLElement>) => {};

/**
 * The calm green backdrop for the page's one dark panel: solid #0A4A13 and one soft gold blur in a corner
 * (no grid, no drifting glows). `animate` is kept for compatibility and ignored.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DarkBackdrop({ animate = true }: { animate?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#0A4A13] print:hidden">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#CB9615]/20 blur-3xl" />
    </div>
  );
}

/* ─────────────────────────── Page hero ─────────────────────────── */

export function Crumbs({ crumbs, className }: { crumbs: { label: string; to?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-gray-700">
        {crumbs.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && <ChevronRight aria-hidden="true" className="h-4 w-4 text-[#117F21]/60" />}
            {c.to ? (
              <Link to={c.to} className={cn("rounded font-medium text-[#0A4A13] underline-offset-4 hover:underline", focus)}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-[#14261A]">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The calm eyebrow pill with an icon in the green dot (page heroes). */
export function EyebrowPill({ icon: Icon, label }: { icon?: LucideIcon; label: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full bg-[#E8F5E9]/80 py-1 pl-1 pr-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#0A4A13] ring-1 ring-[#117F21]/15 sm:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5">
      <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2E913D] to-[#0A4A13] text-[#F4D27A]">
        {Icon ? <Icon /> : <span className="h-2 w-2 rounded-full bg-[#F4D27A]" />}
      </span>
      {label}
    </span>
  );
}

export function PageHero({
  id,
  crumbs,
  pill,
  title,
  mark,
  intro,
  actions,
  aside,
}: {
  id: string;
  crumbs: { label: string; to?: string }[];
  pill: { icon: LucideIcon; label: string };
  title: string;
  /** Words in the title given the green→gold gradient and the drawn underline. */
  mark: string;
  intro: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const { t, lang } = useI18n();
  // Translate the whole title, then find the translated highlight in it (word order differs by language).
  const T = t(title);
  const M = t(mark);
  const at = M ? T.toLowerCase().indexOf(M.toLowerCase()) : -1;
  const has = at >= 0;
  const shown = has ? T.slice(at, at + M.length) : "";
  const [before, after] = has ? [T.slice(0, at), T.slice(at + M.length)] : [T, ""];
  return (
    <section aria-labelledby={id} className="relative isolate overflow-hidden bg-[#FBF8F1] text-[#14261A]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#E8F5E9] blur-3xl" />
      <div className={cn("relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-14 pt-8 sm:pt-10 lg:gap-12 lg:pb-20", aside && "lg:grid-cols-12 lg:items-center")}>
        <div className={cn(aside ? "lg:col-span-6" : "max-w-3xl")}>
          <Crumbs crumbs={crumbs} />
          <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="mt-7">
            <EyebrowPill icon={pill.icon} label={pill.label} />
          </motion.div>
          <motion.h1
            id={id}
            data-i18n-done={lang !== "en" && T !== title ? "" : undefined}
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease }}
            className="mt-5 text-[2.25rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]"
          >
            {before}
            {has && <DrawnMark text={shown} />}
            {after}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-gray-700"
          >
            {intro}
          </motion.div>
          {actions && (
            <motion.div initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease }} className="mt-8 text-[#14261A]">
              {actions}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="relative text-[#14261A] lg:col-span-6"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** White card for hero asides and feature panels: rounded-[2rem], thin ring, soft green shadow. */
export function FramedPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-36px_rgba(10,74,19,0.45)] ring-1 ring-black/10", className)}>
      {children}
    </div>
  );
}

/* ─────────────────────────── On this page ─────────────────────────── */

export function SectionNav({ sections, pillId }: { sections: { id: string; label: string }[]; pillId: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(sections[0].id);

  // Current section: the last one whose top has passed just under the header and this bar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 200) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  return (
    <nav aria-label="On this page" className="sticky top-[92px] z-30 px-4 py-3">
      <div className="mx-auto max-w-7xl">
        <ul className="flex gap-1 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_20px_40px_-30px_rgba(10,74,19,0.6)] ring-1 ring-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(s.id);
                    scrollToId(s.id, !reduce);
                    history.replaceState(null, "", `#${s.id}`);
                  }}
                  aria-current={on ? "location" : undefined}
                  className={cn("relative flex min-h-12 items-center rounded-full px-5 text-base font-semibold transition lg:text-lg", on ? "text-[#F4D27A]" : "text-[#14261A] hover:bg-[#E8F5E9]", focus)}
                >
                  {on && <motion.span layoutId={pillId} className="absolute inset-0 rounded-full bg-[#0A4A13]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{s.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/* ─────────────────────────── Modal ─────────────────────────── */

/** The large labelled Close button in the light header bar of every dialog. */
const closeCls = cn(
  "inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 text-lg font-semibold text-[#14261A] ring-1 ring-black/10 transition hover:bg-[#0A4A13] hover:text-white",
  focus,
);

/**
 * Accessible modal: Escape and the backdrop close it, focus moves to the close button and returns to
 * the control that opened it, and the page behind does not scroll.
 */
export function Modal({ open, onClose, labelledBy, children, className }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) {
      if (opener.current) {
        const el = opener.current;
        opener.current = null;
        window.setTimeout(() => el.focus(), 0);
      }
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    if (active && !active.closest("[role=dialog]")) opener.current = active;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtn.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="modal" className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" tabIndex={-1} aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#14261A]/55" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ y: reduce ? 0 : 40, scale: reduce ? 1 : 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: reduce ? 0 : 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className={cn("relative max-h-[calc(100svh-1.5rem)] w-full overflow-y-auto rounded-[2rem] bg-white shadow-[0_50px_100px_-30px_rgba(10,74,19,0.55)] ring-1 ring-black/10", className)}
          >
            <div className="sticky top-0 z-20 flex justify-end border-b border-black/5 bg-[#FBF8F1] px-3 py-2.5 sm:px-4">
              <button ref={closeBtn} type="button" onClick={onClose} className={closeCls}>
                <X className="h-5 w-5" aria-hidden="true" />
                Close
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────── Drawer ─────────────────────────── */

/** Side panel that slides in from the right (full width on phones); same behaviour as Modal. */
export function Drawer({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) {
      if (opener.current) {
        const el = opener.current;
        opener.current = null;
        window.setTimeout(() => el.focus(), 0);
      }
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    if (active && !active.closest("[role=dialog]")) opener.current = active;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtn.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="drawer" className="fixed inset-0 z-[120] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" tabIndex={-1} aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#14261A]/50" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ x: reduce ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="relative h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl sm:rounded-l-[2rem]"
          >
            <div className="sticky top-0 z-20 flex justify-end border-b border-black/5 bg-[#FBF8F1] px-3 py-2.5 sm:px-4">
              <button ref={closeBtn} type="button" onClick={onClose} className={closeCls}>
                <X className="h-5 w-5" aria-hidden="true" />
                Close
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
