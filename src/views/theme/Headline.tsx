"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
const view = { once: true, margin: "-60px" } as const;

/**
 * Section title for the classic theme (the app's SectionHeading, same props as before): a 12 px eyebrow pill with
 * a green dot that pulses twice and one shimmer sweep, then the title in ink #0A2E10 with its `mark` phrase in a
 * green→gold gradient and a hand-drawn gold underline that draws in. With no mark, a short green→gold bar grows in.
 * `dark` is for the page's dark band (#04240A). `n` is accepted and ignored. The light gradient ends on #9A6B00 so
 * the phrase keeps 3:1 on white as large text.
 */
export default function Headline({
  kicker,
  title,
  mark,
  intro,
  action,
  dark = false,
  stacked = false,
  center = false,
  id,
}: {
  n?: string;
  kicker: string;
  title: string;
  mark?: string;
  intro?: ReactNode;
  action?: ReactNode;
  dark?: boolean;
  /** Title, intro and action one above the other, for narrow columns. */
  stacked?: boolean;
  center?: boolean;
  id: string;
}) {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  // Translate the whole title, then find the translated highlight in it (ignoring case).
  const T = t(title);
  const M = mark ? t(mark) : undefined;
  const at = M ? T.toLowerCase().indexOf(M.toLowerCase()) : -1;
  const hl = at >= 0 ? T.slice(at, at + M!.length) : undefined;
  const [before, after] = hl ? [T.slice(0, at), T.slice(at + hl.length)] : [T, ""];
  const side = !!action && !stacked && !center;

  return (
    <motion.header
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={view}
      transition={{ duration: 0.7, ease }}
      className={cn("relative", side && "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between")}
    >
      <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
        <span
          className={cn(
            "relative inline-flex items-center gap-2.5 overflow-hidden rounded-full py-1 pl-1 pr-4 text-xs font-bold uppercase tracking-[0.18em] ring-1",
            dark ? "bg-white/[0.08] text-[#F4D27A] ring-white/15" : "bg-[#E8F5E9]/80 text-[#0A4A13] ring-[#117F21]/15",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "relative flex h-6 w-6 items-center justify-center rounded-full",
              dark ? "bg-gradient-to-br from-[#F4D27A] to-[#CB9615]" : "bg-gradient-to-br from-[#2E913D] to-[#0A4A13]",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", dark ? "bg-[#04240A]" : "bg-[#F4D27A]")} />
            {!reduce && (
              <motion.span
                className={cn("absolute inset-0 rounded-full", dark ? "bg-[#F4D27A]" : "bg-[#2E913D]")}
                initial={{ scale: 1, opacity: 0.5 }}
                whileInView={{ scale: 1.9, opacity: 0 }}
                viewport={view}
                transition={{ duration: 1.4, repeat: 2, ease: "easeOut" }}
              />
            )}
          </span>
          <span className="relative">{t(kicker)}</span>
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className={cn("pointer-events-none absolute inset-y-0 w-10 -skew-x-12", dark ? "bg-white/20" : "bg-white/70")}
              initial={{ left: "-20%" }}
              whileInView={{ left: "120%" }}
              viewport={view}
              transition={{ duration: 1.1, delay: 0.35, ease: "easeInOut" }}
            />
          )}
        </span>

        <h2
          id={id}
          data-i18n-done={lang !== "en" && T !== title ? "" : undefined}
          className={cn("mt-5 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem]", dark ? "text-white" : "text-[#0A2E10]")}
        >
          {before}
          {hl && <DrawnMark text={hl} dark={dark} />}
          {after}
        </h2>

        {!hl && (
          <motion.span
            aria-hidden="true"
            className={cn(
              "mt-5 block h-1.5 w-16 rounded-full bg-gradient-to-r",
              dark ? "from-[#F4D27A] to-[#CB9615]" : "from-[#117F21] to-[#CB9615]",
              center ? "mx-auto origin-center" : "origin-left",
            )}
            initial={{ scaleX: reduce ? 1 : 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={view}
            transition={{ duration: 0.7, delay: 0.2, ease }}
          />
        )}

        {intro && <div className={cn("mt-5 text-base leading-relaxed sm:text-lg", dark ? "text-white/80" : "text-gray-600")}>{intro}</div>}
        {action && !side && <div className={cn("mt-6", center && "flex justify-center")}>{action}</div>}
      </div>
      {side && <div className="shrink-0">{action}</div>}
    </motion.header>
  );
}

/**
 * The highlighted phrase of a classic title: green→gold gradient text with a hand-drawn gold underline that draws in.
 * Used by Headline, PhotoBanner, PageHero and DocBanner.
 */
export function DrawnMark({ text, dark = false }: { text: string; dark?: boolean }) {
  const reduce = useReducedMotion();
  const gid = useId().replace(/:/g, "");
  return (
    <span className="relative inline-block">
      <span
        className={cn(
          "relative z-10 bg-clip-text text-transparent",
          dark ? "bg-gradient-to-r from-[#F4D27A] via-[#E9B949] to-[#CB9615]" : "bg-gradient-to-r from-[#117F21] via-[#2E913D] to-[#9A6B00]",
        )}
      >
        {text}
      </span>
      <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute -bottom-2.5 left-0 h-3.5 w-full overflow-visible print:hidden">
        <defs>
          <linearGradient id={`ul-${gid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={dark ? "#F4D27A" : "#2E913D"} />
            <stop offset="100%" stopColor="#CB9615" />
          </linearGradient>
        </defs>
        <motion.path
          d="M3 10 C 45 3, 95 2, 140 5 S 190 9, 197 6"
          fill="none"
          stroke={`url(#ul-${gid})`}
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.9 : 0 }}
          whileInView={{ pathLength: 1, opacity: 0.9 }}
          viewport={view}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
    </span>
  );
}
