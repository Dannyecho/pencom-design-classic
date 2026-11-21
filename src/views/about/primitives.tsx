"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
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
 * Older section-title API, kept for compatibility. It renders the classic Headline (eyebrow pill with a green
 * dot, ink title with the gradient phrase and drawn gold underline); `center` centres it, `dark` is for the band.
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

/* ─────────────────────────── Effects (classic) ─────────────────────────── */

/**
 * Pointer spotlight: a soft radial glow follows the mouse inside the box (fades in on hover). Used on list panels
 * and portal cards. Touch and keyboard users see the plain box.
 */
export function Spotlight({
  children,
  className,
  color = "rgba(17,127,33,0.08)",
  size = 480,
  style,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--sx", `${e.clientX - r.left}px`);
        el.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }}
      className={cn("group/spot relative isolate overflow-hidden", className)}
      style={style}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100 print:hidden"
        style={{ background: `radial-gradient(${size}px circle at var(--sx, 50%) var(--sy, 50%), ${color}, transparent 65%)` }}
      />
      {children}
    </div>
  );
}

/** Gentle 3D tilt that follows the mouse (one featured card per page). Off for touch and reduced motion. */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setT({ x: -py * max, y: px * max });
      }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}
      animate={{ rotateX: t.x, rotateY: t.y }}
      transition={{ type: "spring", stiffness: 200, damping: 18, mass: 0.6 }}
      style={{ transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Faint 64 px grid masked to the centre, for the dark band, dark banners and featured cards. */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 print:hidden", className)}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
      }}
    />
  );
}
