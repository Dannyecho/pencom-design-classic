"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import {
  Award, Eye, HeartHandshake, Scale, Shield, ShieldCheck, TrendingUp, Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Headline from "@/views/theme/Headline";

export const icons: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  scale: Scale,
  users: Users,
  trend: TrendingUp,
  award: Award,
  eye: Eye,
  heart: HeartHandshake,
  plain: Shield,
};

export const ease = [0.16, 1, 0.3, 1] as const;

export const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease },
};

/** Section ids that share a URL with the mega menu, footer and "On this page" nav. */
export const sectionAliases: Record<string, string> = {
  "why-us": "overview",
  stakeholders: "charter",
  "dg-corner": "executive",
  board: "structure",
  signing: "history-2004",
};

export function scrollToId(id: string, smooth = true) {
  const el = document.getElementById(sectionAliases[id] ?? id);
  if (!el) return;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

/* ─────────────────────────── Heading ─────────────────────────── */

/**
 * Older section-title API, kept for compatibility. It renders the calm theme's Headline (eyebrow pill, ink
 * title with the gradient phrase and drawn underline); `center` centres it.
 */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  intro,
  center = false,
  dark = false,
  id,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  intro?: ReactNode;
  center?: boolean;
  dark?: boolean;
  id?: string;
}) {
  const fallback = useId().replace(/:/g, "");
  return <Headline id={id ?? `h-${fallback}`} kicker={eyebrow} title={title} mark={highlight} intro={intro} dark={dark} center={center} />;
}

export function CountUp({ value, className, duration = 1.8 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const match = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  const zero = match ? `${match[1]}0${match[3]}` : value;
  const [display, setDisplay] = useState(reduce || !match ? value : zero);

  useEffect(() => {
    if (!match) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const [, pre, num, suf] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = (num.split(".")[1] || "").length;
    const commas = num.includes(",");
    const controls = animate(0, target, {
      duration,
      ease,
      onUpdate: (v) => {
        const s = commas
          ? v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          : v.toFixed(decimals);
        setDisplay(`${pre}${s}${suf}`);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

/* ─────────────────────────── Retired effects ─────────────────────────── */

/**
 * The calm theme has no pointer spotlight or 3D tilt: `Spotlight` and `Tilt` keep their props and render their
 * children in a plain wrapper; `GridBackdrop` renders nothing.
 */
export function Spotlight({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)} style={style}>
      {children}
    </div>
  );
}

export function Tilt({ children, className }: { children: ReactNode; className?: string; max?: number }) {
  return <div className={className}>{children}</div>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GridBackdrop(_props: { className?: string }) {
  return null;
}
