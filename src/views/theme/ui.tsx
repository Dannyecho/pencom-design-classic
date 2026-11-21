"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronRight, MessageCircle, Phone, X, type LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { GridBackdrop, scrollToId } from "@/views/about/primitives";
import { openChat } from "@/views/home/SiteSearch";
import { DrawnMark } from "./Headline";

/**
 * Building blocks shared by every inner page of the classic theme ("the national portal"), so pages stay
 * consistent with the home page: the photo banner and the floating card that rises over it, the portal layout
 * with its sticky side navigation, the tool-page tab strip, the page's one dark band, closing link cards, class
 * strings for cards, list panels, buttons and chips, and accessible modal and drawer.
 * Calm-era exports (PageHero, SectionNav, FramedPanel, DarkBackdrop) still work and render in classic tokens
 * until each page is converted.
 */

export const ease = [0.22, 1, 0.36, 1] as const;
export const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";
/** Section spacing; scroll margin clears the 92 px header and the sticky tab strip. */
export const sectionCls = "scroll-mt-[170px] overflow-x-clip px-4 py-14 sm:py-20";

/* ─────────────────────────── Class strings ─────────────────────────── */

/** Classic card: white, thin grey border; lifts 2 px with a soft green shadow on hover (add `group` for links). */
export const card =
  "rounded-3xl border border-gray-200/80 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#117F21]/30 hover:shadow-[0_24px_50px_-24px_rgba(10,74,19,0.4)]";
/** List panel: white rounded box with dividers; rows use `listRow`. */
export const listPanel = "overflow-hidden rounded-3xl border border-gray-200/80 bg-white divide-y divide-gray-100";
export const listRow = cn("group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F7FAF6] sm:px-6", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]");
export const goldBtn = cn(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#CB9615] px-5 font-semibold text-[#1A1206] shadow-[0_14px_30px_-16px_rgba(203,150,21,0.9)] transition hover:bg-[#E0AA22]",
  focus,
);
export const outlineBtn = cn(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#117F21]/25 bg-white px-5 font-semibold text-[#117F21] transition hover:border-[#117F21] hover:bg-[#F7FAF6]",
  focus,
);
/** Outline button for dark backgrounds (dark band, banners, featured cards). */
export const outlineDarkBtn = cn(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 font-semibold text-white transition hover:border-[#F4D27A] hover:text-[#F4D27A]",
  focus,
);
export const chip = "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-[#F7FAF6] px-3 py-1 text-xs font-semibold text-gray-700";
/** Featured card background: dark green gradient (put `GridBackdrop` inside). */
export const featured = "relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#04240A] via-[#0A4A13] to-[#117F21] text-white";

/** Icon tile: mint with a green icon that fills green on hover (inside a `group`); `dark` is the portal tile. */
export function Tile({ icon: Icon, dark = false, size = "md", className }: { icon: LucideIcon; dark?: boolean; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center transition duration-300",
        size === "sm" ? "h-9 w-9 rounded-lg" : size === "lg" ? "h-14 w-14 rounded-2xl" : "h-11 w-11 rounded-xl",
        dark
          ? "bg-[#04240A] text-[#F4D27A] shadow-[0_12px_24px_-12px_rgba(4,36,10,0.9)] [&_svg]:transition-transform [&_svg]:duration-300 group-hover:[&_svg]:rotate-6"
          : "bg-[#E8F5E9] text-[#117F21] group-hover:bg-[#117F21] group-hover:text-white",
        className,
      )}
    >
      <Icon className={size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </span>
  );
}

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

/**
 * Pointer position for a `[background-image:radial-gradient(…var(--x)…var(--y)…)]` glow on the element
 * (e.g. `glowLight` from the document kit). Put it on `onPointerMove`.
 */
export const spot = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
};

/** The dark band's background: #04240A, the faint grid, a green blur and a gold blur. `animate` is ignored. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DarkBackdrop({ animate = true }: { animate?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#04240A] print:hidden">
      <GridBackdrop />
      <div className="absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-[#117F21]/40 blur-[160px]" />
      <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[#CB9615]/15 blur-[120px]" />
    </div>
  );
}

/** The page's one full-width dark band (its signature section). */
export function DarkBand({ id, labelledBy, label, children, className }: { id?: string; labelledBy?: string; label?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label} className={cn("relative isolate scroll-mt-[150px] overflow-hidden py-20 text-white sm:py-24 print:bg-white print:text-black", className)}>
      <DarkBackdrop />
      <div className="relative mx-auto max-w-7xl px-4">{children}</div>
    </section>
  );
}

/* ─────────────────────────── Banners ─────────────────────────── */

export function Crumbs({ crumbs, className, dark = false }: { crumbs: { label: string; to?: string }[]; className?: string; dark?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm", dark ? "text-white/80" : "text-gray-600")}>
        {crumbs.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && <ChevronRight aria-hidden="true" className={cn("h-4 w-4", dark ? "text-[#F4D27A]/80" : "text-[#117F21]/60")} />}
            {c.to ? (
              <Link to={c.to} className={cn("inline-flex min-h-11 items-center rounded font-medium underline-offset-4 hover:underline", dark ? "text-white hover:text-[#F4D27A]" : "text-[#117F21]", focus)}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className={cn("font-semibold", dark ? "text-white" : "text-[#0A2E10]")}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Eyebrow pill with an icon in the green dot; `dark` for banners and the dark band. */
export function EyebrowPill({ icon: Icon, label, dark = false }: { icon?: LucideIcon; label: ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-4 text-xs font-bold uppercase tracking-[0.18em] ring-1 [&_svg]:h-3.5 [&_svg]:w-3.5",
        dark ? "bg-white/10 text-[#F4D27A] ring-white/15 backdrop-blur-md" : "bg-[#E8F5E9]/80 text-[#0A4A13] ring-[#117F21]/15",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full",
          dark ? "bg-gradient-to-br from-[#F4D27A] to-[#CB9615] text-[#04240A]" : "bg-gradient-to-br from-[#2E913D] to-[#0A4A13] text-[#F4D27A]",
        )}
      >
        {Icon ? <Icon /> : <span className={cn("h-2 w-2 rounded-full", dark ? "bg-[#04240A]" : "bg-[#F4D27A]")} />}
      </span>
      {label}
    </span>
  );
}

/** Splits a translated title around its translated highlight (case-insensitive; word order differs by language). */
function useMarked(title: string, mark?: string) {
  const { t, lang } = useI18n();
  const T = t(title);
  const M = mark ? t(mark) : "";
  const at = M ? T.toLowerCase().indexOf(M.toLowerCase()) : -1;
  const shown = at >= 0 ? T.slice(at, at + M.length) : "";
  const [before, after] = at >= 0 ? [T.slice(0, at), T.slice(at + M.length)] : [T, ""];
  return { before, shown, after, done: lang !== "en" && T !== title ? "" : undefined };
}

/** Words that rise one by one out of a clipped line (banner titles, as in the homepage slider). */
function RiseWords({ text, start = 0 }: { text: string; start?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) =>
        w ? (
          <span key={i}>
            <span className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span className="inline-block" initial={{ y: reduce ? 0 : "105%" }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.06 + (start + i) * 0.05, ease }}>
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ) : (
          i < words.length - 1 && <span key={i}> </span>
        ),
      )}
    </>
  );
}

/**
 * Full-width photo banner for portal and tool pages: the photo zooms slowly (Ken Burns), a dark shade sits under
 * the words (from #021a07/90; white text keeps well over 4.5:1), crumbs, a chip, an h1 whose words rise and whose
 * `mark` phrase gets the gold drawn underline, an intro and optional actions. Leaves room at the bottom for a
 * `FloatingBar`.
 */
export function PhotoBanner({
  id,
  crumbs,
  chip: chipEl,
  title,
  mark,
  intro,
  image,
  srcSet,
  alt = "",
  position = "center",
  actions,
  floating = true,
}: {
  id: string;
  crumbs: { label: string; to?: string }[];
  chip?: { icon?: LucideIcon; label: string };
  title: string;
  mark?: string;
  intro?: ReactNode;
  image: string;
  srcSet?: string;
  alt?: string;
  position?: string;
  actions?: ReactNode;
  /** Leave space at the bottom for a FloatingBar (default). */
  floating?: boolean;
}) {
  const reduce = useReducedMotion();
  const { before, shown, after, done } = useMarked(title, mark);
  const nBefore = before.split(" ").length;
  return (
    <section aria-labelledby={id} className="relative isolate overflow-hidden bg-[#04240A] text-white print:bg-white print:text-black">
      <motion.img
        src={image}
        srcSet={srcSet}
        sizes="100vw"
        alt={alt}
        initial={{ scale: 1 }}
        animate={{ scale: reduce ? 1 : 1.08 }}
        transition={{ duration: 24, ease: "linear" }}
        className="absolute inset-0 -z-20 h-full w-full object-cover print:hidden"
        style={{ objectPosition: position }}
        fetchPriority="high"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#021a07]/95 via-[#021a07]/80 to-[#021a07]/40 lg:hidden" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#021a07]/90 via-[#021a07]/80 via-55% to-[#021a07]/10 lg:block" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-black/40 to-transparent" />
      <div className={cn("relative mx-auto flex min-h-[460px] max-w-7xl flex-col justify-end px-4 pt-8 sm:min-h-[500px]", floating ? "pb-24 sm:pb-28" : "pb-14 sm:pb-16")}>
        <Crumbs crumbs={crumbs} dark className="absolute left-4 right-4 top-6 print:static" />
        <div className="max-w-3xl pt-12">
          {chipEl && (
            <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
              <EyebrowPill icon={chipEl.icon} label={chipEl.label} dark />
            </motion.div>
          )}
          <h1 id={id} data-i18n-done={done} className="mt-5 text-[2.25rem] font-bold leading-[1.08] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-[3.5rem]">
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
          {intro && (
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] sm:text-lg"
            >
              {intro}
            </motion.div>
          )}
          {actions && (
            <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4, ease }} className="mt-7 flex flex-wrap gap-3 print:hidden">
              {actions}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/** White card that rises over the bottom of a banner, with a gold hairline on top. Holds the page's main tool. */
export function FloatingBar({ eyebrow, title, intro, children, className }: { eyebrow?: string; title?: string; intro?: ReactNode; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const hid = useId();
  return (
    <div className="relative z-10 -mt-14 px-4">
      <motion.section
        aria-labelledby={title ? hid : undefined}
        aria-label={title ? undefined : eyebrow}
        initial={{ opacity: 0, y: reduce ? 0 : 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease }}
        className={cn("relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 text-[#0A2E10] shadow-[0_40px_80px_-40px_rgba(4,36,10,0.55)] sm:p-7", className)}
      >
        <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
        {(eyebrow || title || intro) && (
          <div className="mb-5">
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">{eyebrow}</p>}
            {title && (
              <h2 id={hid} className="mt-1 text-xl font-bold text-[#0A2E10]">
                {title}
              </h2>
            )}
            {intro && <div className="mt-1 text-base text-gray-600">{intro}</div>}
          </div>
        )}
        {children}
      </motion.section>
    </div>
  );
}

/**
 * Calm-era hero, kept so unconverted pages compile: a dark grid banner with crumbs, pill, title (drawn mark) and
 * intro; `actions` and `aside` sit below it on white, the aside rising over the banner like a FloatingBar.
 */
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
  /** Words in the title given the gold gradient and the drawn underline. */
  mark: string;
  intro: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const { before, shown, after, done } = useMarked(title, mark);
  return (
    <>
      <section aria-labelledby={id} className="relative isolate overflow-hidden text-white print:text-black">
        <DarkBackdrop />
        <div className={cn("relative mx-auto max-w-7xl px-4 pt-6", aside || actions ? "pb-24" : "pb-16")}>
          <Crumbs crumbs={crumbs} dark />
          <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="mt-6">
            <EyebrowPill icon={pill.icon} label={pill.label} dark />
          </motion.div>
          <motion.h1
            id={id}
            data-i18n-done={done}
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease }}
            className="mt-5 max-w-4xl text-[2.25rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]"
          >
            {before}
            {shown && <DrawnMark text={shown} dark />}
            {after}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg"
          >
            {intro}
          </motion.div>
        </div>
      </section>
      {(actions || aside) && (
        <div className="relative z-10 -mt-14 px-4 pb-4">
          <div className={cn("mx-auto grid max-w-7xl grid-cols-1 gap-6", actions && aside && "lg:grid-cols-12")}>
            {actions && (
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease }}
                className={cn("relative self-start overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 text-[#0A2E10] shadow-[0_40px_80px_-40px_rgba(4,36,10,0.55)] sm:p-6", aside && "lg:col-span-5")}
              >
                <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
                {actions}
              </motion.div>
            )}
            {aside && (
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease }}
                className={cn("relative text-[#0A2E10]", actions ? "lg:col-span-7" : "lg:ml-auto lg:w-full lg:max-w-3xl")}
              >
                {aside}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Classic white card for hero asides and feature panels (calm-era name). */
export function FramedPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_30px_60px_-36px_rgba(10,74,19,0.45)]", className)}>
      {children}
    </div>
  );
}

/* ─────────────────────────── On this page ─────────────────────────── */

export type NavSection = { id: string; label: string; icon?: LucideIcon };

/** The section whose top has passed `line` px from the top of the window (scroll-spy). */
function useActiveSection(sections: NavSection[], line: number) {
  const [active, setActive] = useState(sections[0].id);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
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
  }, [sections, line]);
  return [active, setActive] as const;
}

function jump(e: MouseEvent<HTMLAnchorElement>, id: string, smooth: boolean) {
  e.preventDefault();
  scrollToId(id, smooth);
  history.replaceState(null, "", `#${id}`);
}

/**
 * Tool pages: a sticky segmented control under the header (white group, sliding green `layoutId` pill) linking to
 * the page's sections. It scrolls sideways on phones.
 */
export function TabStrip({ sections, pillId }: { sections: NavSection[]; pillId: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useActiveSection(sections, 190);
  return (
    <nav aria-label="On this page" className="sticky top-[92px] z-30 px-4 py-2 print:hidden">
      <div className="mx-auto max-w-7xl">
        <ul className="flex gap-1 overflow-x-auto rounded-2xl bg-white/95 p-1.5 shadow-[0_20px_40px_-28px_rgba(4,36,10,0.55)] ring-1 ring-gray-200 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => {
            const on = active === s.id;
            const I = s.icon;
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    setActive(s.id);
                    jump(e, s.id, !reduce);
                  }}
                  aria-current={on ? "location" : undefined}
                  className={cn("relative flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition sm:text-base", on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]", focus)}
                >
                  {on && <motion.span layoutId={pillId} className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_10px_24px_-12px_rgba(10,74,19,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  {I && <I aria-hidden="true" className={cn("relative h-4 w-4", on ? "text-[#F4D27A]" : "text-[#117F21]")} />}
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

/** Calm-era name for the section bar: now the classic TabStrip. */
export function SectionNav({ sections, pillId }: { sections: NavSection[]; pillId: string }) {
  return <TabStrip sections={sections} pillId={pillId} />;
}

/**
 * Portal pages: the vertical "On this page" list (AudienceTasks tab style: grey rows, green gradient active pill,
 * section icons), then "Related pages" as a list panel and a small dark "Need help?" card with chat and call.
 */
export function SideNav({ sections, pillId, related }: { sections: NavSection[]; pillId: string; related?: { to: string; label: string }[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useActiveSection(sections, 190);
  return (
    <div className="space-y-5">
      <nav aria-label="On this page">
        <p className="px-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-600">On this page</p>
        <ul className="mt-3 space-y-1.5">
          {sections.map((s) => {
            const on = active === s.id;
            const I = s.icon;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    setActive(s.id);
                    jump(e, s.id, !reduce);
                  }}
                  aria-current={on ? "location" : undefined}
                  className={cn(
                    "group relative isolate flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 text-[15px] font-semibold transition-colors",
                    on ? "text-white" : "bg-gray-50 text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0A4A13]",
                    focus,
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId={pillId}
                      className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_14px_30px_-14px_rgba(10,74,19,0.9)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {I && (
                    <span aria-hidden="true" className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition", on ? "bg-white/15 text-[#F4D27A]" : "bg-white text-[#117F21] shadow-sm")}>
                      <I className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">{s.label}</span>
                  <ArrowRight aria-hidden="true" className={cn("h-4 w-4 shrink-0 transition", on ? "opacity-100" : "opacity-0 group-hover:opacity-60")} />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {related && related.length > 0 && (
        <div>
          <p className="px-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-600">Related pages</p>
          <ul className={cn(listPanel, "mt-3")}>
            {related.map((r) => (
              <li key={r.to}>
                <Link to={r.to} className={cn(listRow, "min-h-12 py-3 text-[15px] font-semibold text-[#0A2E10] sm:px-5")}>
                  <span className="flex-1 group-hover:text-[#117F21]">{r.label}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#117F21]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={cn(featured, "p-5")}>
        <GridBackdrop className="opacity-60" />
        <p className="relative text-lg font-bold">Need help?</p>
        <p className="relative mt-1 text-sm text-white/80">Ask the assistant or call us.</p>
        <div className="relative mt-4 grid gap-2">
          <button type="button" onClick={openChat} className={cn(goldBtn, "min-h-11 text-sm")}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Start a chat
          </button>
          <a href="tel:094611300" className={cn(outlineDarkBtn, "min-h-11 text-sm")}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            09-4611300
          </a>
        </div>
      </div>
    </div>
  );
}

/** Phones and tablets: a sticky "On this page" disclosure bar under the header (closes after a jump). */
function SideNavBar({ sections }: { sections: NavSection[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useActiveSection(sections, 190);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const current = sections.find((s) => s.id === active) ?? sections[0];
  return (
    <nav aria-label="On this page" className="sticky top-[92px] z-30 -mx-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:hidden print:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn("flex min-h-12 w-full items-center gap-3 text-left", focus)}
      >
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">On this page</span>
        <span className="min-w-0 flex-1 truncate font-semibold text-[#0A2E10]">{current.label}</span>
        <ChevronDown aria-hidden="true" className={cn("h-5 w-5 shrink-0 text-[#117F21] transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={listId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            {sections.map((s) => (
              <li key={s.id} className="pb-1 last:pb-3">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    setActive(s.id);
                    setOpen(false);
                    jump(e, s.id, !reduce);
                  }}
                  aria-current={active === s.id ? "location" : undefined}
                  className={cn("flex min-h-11 items-center rounded-xl px-3 font-semibold", active === s.id ? "bg-gradient-to-r from-[#0A4A13] to-[#117F21] text-white" : "text-gray-700 hover:bg-[#F7FAF6]", focus)}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
}

/** Portal page body: sticky SideNav in 3 columns and the sections in 9 (a disclosure bar below `lg`). */
export function PortalLayout({ sections, pillId, related, children }: { sections: NavSection[]; pillId: string; related?: { to: string; label: string }[]; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:grid lg:grid-cols-12 lg:gap-10">
      <SideNavBar sections={sections} />
      <aside className="hidden lg:col-span-3 lg:block print:hidden">
        <div className="sticky top-[116px] pb-10 pt-14">
          <SideNav sections={sections} pillId={pillId} related={related} />
        </div>
      </aside>
      <div className="min-w-0 lg:col-span-9">{children}</div>
    </div>
  );
}

/* ─────────────────────────── Closing links ─────────────────────────── */

export function ClosingLinks({ items, label = "Related pages" }: { items: { to: string; icon: LucideIcon; title: string; body: string; tone?: "green" | "gold" }[]; label?: string }) {
  return (
    <section aria-label={label} className="px-4 py-14 sm:py-16 print:hidden">
      <div className={cn("mx-auto grid max-w-7xl grid-cols-1 gap-4", items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {items.map((it, i) => (
          <Rise key={it.to} delay={i * 0.06}>
            <Link to={it.to} className={cn(card, "group flex h-full items-center gap-5 p-6", focus)}>
              <span aria-hidden="true" className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-110", it.tone === "gold" ? "bg-[#FFF8E1] text-[#7A5200]" : "bg-[#E8F5E9] text-[#117F21]")}>
                <it.icon className="h-7 w-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-[#0A2E10]">{it.title}</span>
                <span className="mt-0.5 block text-sm text-gray-600">{it.body}</span>
              </span>
              <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#117F21]" />
            </Link>
          </Rise>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── Dialogs ─────────────────────────── */

/** The labelled Close button in the dark title bar of every dialog. */
const closeCls = cn(
  "inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 font-semibold text-white transition hover:border-[#F4D27A] hover:text-[#F4D27A]",
  focus,
);

function DialogBar({ closeRef, onClose }: { closeRef: React.RefObject<HTMLButtonElement | null>; onClose: () => void }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-[#04240A] px-4 py-2.5 sm:px-5">
      <span aria-hidden="true" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">
        <span className="h-2 w-2 rounded-full bg-[#CB9615]" />
        PenCom
      </span>
      <button ref={closeRef} type="button" onClick={onClose} className={closeCls}>
        <X className="h-5 w-5" aria-hidden="true" />
        Close
      </button>
    </div>
  );
}

/** Focus in and back, Escape, and scroll lock for Modal and Drawer. */
function useDialog(open: boolean, onClose: () => void) {
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
  return closeBtn;
}

/**
 * Accessible modal: Escape and the backdrop close it, focus moves to the close button and returns to
 * the control that opened it, and the page behind does not scroll.
 */
export function Modal({ open, onClose, labelledBy, children, className }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const closeBtn = useDialog(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="modal" className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" tabIndex={-1} aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#04240A]/60 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ y: reduce ? 0 : 40, scale: reduce ? 1 : 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: reduce ? 0 : 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className={cn("relative max-h-[calc(100svh-1.5rem)] w-full overflow-y-auto rounded-3xl bg-white text-[#0A2E10] shadow-[0_50px_100px_-30px_rgba(4,36,10,0.6)]", className)}
          >
            <DialogBar closeRef={closeBtn} onClose={onClose} />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Side panel that slides in from the right (full width on phones); same behaviour as Modal. */
export function Drawer({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const closeBtn = useDialog(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="drawer" className="fixed inset-0 z-[120] flex justify-end overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" tabIndex={-1} aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#04240A]/55 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ x: reduce ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="relative h-full w-full max-w-lg overflow-y-auto bg-white text-[#0A2E10] shadow-2xl sm:rounded-l-3xl"
          >
            <DialogBar closeRef={closeBtn} onClose={onClose} />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
