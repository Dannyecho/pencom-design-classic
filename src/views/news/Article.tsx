"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Calendar, Check, Clock, Copy, Download, Facebook, FileText,
  Linkedin, Mail, Megaphone, MessageCircle, Mic, Minus, Newspaper, Pause, Plus, Printer, Quote, Scale, Share2, ThumbsDown, ThumbsUp, Twitter, Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reveal } from "@/views/about/primitives";
import { Crumbs, EyebrowPill, Rise, ease, focus, sectionCls } from "@/views/theme/ui";
import { SectionHeading } from "@/views/theme/heading";
import { darkCard } from "@/views/docs/kit";
import { Bubble, IconTile, calmCard, goldBtn } from "@/views/resources/Library";
import { KindChip } from "@/views/newsroom/parts";
import { social } from "@/views/connect/data";
import { findArticle, news, newsPath, type Article as A, type Block, type Category } from "./data";

/**
 * News article (brief §7 "News and events"; questionnaire: news and media centre, easy sharing, verified social links).
 * Route: /news/:slug
 * Calm look: the title sits on cream with the photo below it in a rounded frame (never words on the photo); the story
 * is on white at 18 px and up, with labelled tools and share buttons; figures are white cards with plain figures, the
 * callout a warm panel, the PDF the page's one dark-green panel; "More from the newsroom" is on cream.
 */

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const short = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const catIcon: Record<Category, typeof Megaphone> = {
  "Press release": Megaphone,
  Statement: FileText,
  Reports: BarChart3,
  Regulation: Scale,
  Speech: Mic,
  Event: Calendar,
};

const eyebrowCls = "text-sm font-bold uppercase tracking-[0.16em] text-[#7A5200]";
const moveArrow = "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1";
/** Labelled white pill that fills dark green on hover (share, tools, feedback). */
const tool = cn(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-base font-semibold text-[#14261A] ring-1 ring-[#117F21]/40 transition hover:bg-[#0A4A13] hover:text-white hover:ring-[#0A4A13] disabled:pointer-events-none disabled:opacity-40",
  focus,
);
const outlineBtn = cn(
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white",
  focus,
);

/* ─────────────────────────── Sharing ─────────────────────────── */

function useShare(a: A) {
  const [copied, setCopied] = useState(false);
  // Read the address and share support after mount, so the server and browser render the same HTML.
  const [url, setUrl] = useState("");
  const [canNative, setCanNative] = useState(false);
  useEffect(() => {
    setUrl(window.location.href);
    setCanNative("share" in navigator);
  }, []);
  const text = `${a.title} | National Pension Commission`;
  const links = [
    { name: "X", icon: Twitter, href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { name: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard blocked: nothing else to do */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  const native = canNative ? () => navigator.share({ title: text, url }).catch(() => undefined) : null;
  return { links, copy, copied, native };
}

/** Labelled share buttons (words next to every icon). */
function ShareRow({ a }: { a: A }) {
  const { links, copy, copied, native } = useShare(a);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn(eyebrowCls, "mr-1 w-full sm:w-auto")}>Share this story</span>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className={cn(tool, "px-4")} aria-label={`Share on ${l.name} (opens in a new tab)`}>
          <l.icon className="h-4 w-4" aria-hidden="true" />
          <span aria-hidden="true">{l.name}</span>
        </a>
      ))}
      <button type="button" onClick={copy} className={cn(tool, "px-4")} aria-label="Copy link to this story">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={copied ? "y" : "n"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-flex items-center gap-2">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            <span aria-hidden="true">{copied ? "Copied" : "Copy link"}</span>
          </motion.span>
        </AnimatePresence>
      </button>
      {native && (
        <button type="button" onClick={native} className={cn(tool, "px-4 sm:hidden")} aria-label="More ways to share">
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span aria-hidden="true">More</span>
        </button>
      )}
      <span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span>
    </div>
  );
}

/* ─────────────────────────── Blocks ─────────────────────────── */

function Facts({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className={cn("my-10 grid grid-cols-1 gap-4 sm:grid-cols-2", items.length === 3 && "md:grid-cols-3")}>
      {items.map((f, i) => (
        <motion.div key={f.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: i * 0.08, ease }}>
          <div className="relative h-full overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-black/10">
            <span aria-hidden="true" className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
            <span className="block break-words text-[1.75rem] font-bold leading-none tracking-tight text-[#14261A] tabular-nums sm:text-[2rem]">{f.value}</span>
            <span className="mt-3 block text-base leading-snug text-gray-700">{f.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BlockView({ b, first }: { b: Block; first: boolean }) {
  switch (b.type) {
    case "p":
      return (
        <p className={cn("leading-[1.8] text-gray-800", first && "text-[1.15em] leading-[1.7] text-[#14261A] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[3.4em] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-[#117F21]")}>
          {b.text}
        </p>
      );
    case "h2":
      return (
        <h2 id={b.id} className="mt-12 scroll-mt-48 text-[1.4em] font-bold leading-snug tracking-tight text-[#14261A] sm:text-[1.6em]">
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="mb-3 block h-1 w-14 origin-left rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]"
          />
          {b.text}
        </h2>
      );
    case "quote":
      return (
        <motion.figure {...reveal} className="relative my-12 overflow-hidden rounded-[1.75rem] bg-[#E8F5E9] px-7 py-9 sm:px-10">
          <span aria-hidden="true" className="absolute inset-y-6 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#CB9615] to-[#117F21]" />
          <span aria-hidden="true" className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A]"><Quote className="h-5 w-5 rotate-180 fill-current" /></span>
          <blockquote className="text-[1.3em] font-medium italic leading-snug text-[#14261A]">{b.text}</blockquote>
          {b.by && <figcaption className="mt-4 text-base font-bold uppercase tracking-[0.12em] text-[#7A5200]">{b.by}</figcaption>}
        </motion.figure>
      );
    case "list":
      return (
        <ul className="my-6 space-y-3">
          {b.items.map((it, i) => (
            <motion.li key={it} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, ease }} className="flex gap-3 leading-relaxed text-gray-800">
              <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0A4A13] text-[#F4D27A]">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              {it}
            </motion.li>
          ))}
        </ul>
      );
    case "facts":
      return <Facts items={b.items} />;
    case "callout":
      return (
        <motion.aside {...reveal} aria-label={b.title} className="relative my-12 overflow-hidden rounded-[1.75rem] bg-[#F1EFE8] p-7 sm:p-8">
          <span aria-hidden="true" className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/70" />
          <p className="relative inline-flex items-center gap-2 rounded-full bg-[#0A4A13] px-3.5 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-[#F4D27A]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#F4D27A]" />
            {b.title}
          </p>
          <p className="relative mt-4 text-lg leading-relaxed text-[#14261A]">{b.text}</p>
          <ul className="relative mt-6 flex flex-wrap gap-3">
            {b.links.map((l, i) => (
              <li key={l.to}>
                <Link to={l.to} className={i === 0 ? cn(goldBtn, focus) : outlineBtn}>
                  {l.label}
                  <ArrowRight className={moveArrow} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </motion.aside>
      );
  }
}

/* ─────────────────────────── Contents with scroll-spy ─────────────────────────── */

function Contents({ items, progress }: { items: { id: string; text: string }[]; progress: number }) {
  const [active, setActive] = useState(items[0]?.id);
  // The current section is the last heading that has passed 40% of the viewport, in either scroll direction.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let cur = items[0]?.id;
      for (const i of items) {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top <= line) cur = i.id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <nav aria-label="In this story" className="rounded-3xl bg-white p-5 ring-1 ring-black/10">
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden="true">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#E8F5E9" strokeWidth="5" />
          <circle cx="28" cy="28" r={r} fill="none" stroke="url(#ring)" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} className="transition-[stroke-dashoffset] duration-200" />
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#117F21" /><stop offset="1" stopColor="#CB9615" /></linearGradient>
          </defs>
        </svg>
        <div>
          <p className={eyebrowCls}>In this story</p>
          <p className="text-base font-bold text-[#14261A]">{Math.round(progress * 100)}% read</p>
        </div>
      </div>
      {items.length > 0 && (
        <ol className="mt-4 space-y-0.5 border-l-2 border-[#14261A]/10">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(i.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                aria-current={active === i.id ? "location" : undefined}
                className={cn("-ml-0.5 flex min-h-11 items-center rounded-r-xl border-l-2 py-2 pl-4 pr-2 text-base leading-snug transition", active === i.id ? "border-[#CB9615] bg-[#E8F5E9] font-semibold text-[#0A4A13]" : "border-transparent text-[#14261A]/80 hover:bg-[#E8F5E9]/60 hover:text-[#14261A]", focus)}
              >
                {i.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

/* ─────────────────────────── Story card ─────────────────────────── */

export function StoryCard({ a, i = 0 }: { a: A; i?: number }) {
  return (
    <motion.li initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: i * 0.08, ease }}>
      <article className={cn(calmCard, "flex h-full flex-col")}>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#E8F5E9]">
          <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p><KindChip kind={a.category} /></p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 text-base text-gray-700">
            <Calendar className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
            <time dateTime={a.date}>{short(a.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{a.readMins} min read</span>
          </p>
          <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-[#14261A]">
            <Link to={newsPath(a)} className={cn("rounded transition-colors after:absolute after:inset-0 after:rounded-3xl after:content-[''] group-hover:text-[#117F21]", focus)}>
              {a.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-lg leading-relaxed text-gray-700">{a.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-2 border-t border-black/[0.08] pt-4 text-lg font-semibold text-[#117F21]">
            Read story <ArrowRight className={moveArrow} aria-hidden="true" />
          </span>
        </div>
      </article>
    </motion.li>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function Article({ slug }: { slug: string }) {
  const a = findArticle(slug);
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#FBF8F1] text-[#14261A]">{a ? <Story key={a.slug} a={a} /> : <Missing />}</div>
    </MotionConfig>
  );
}

function Story({ a }: { a: A }) {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const heroVisible = useInView(heroRef, { margin: "-92px 0px 0px 0px" });
  const [size, setSize] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [useful, setUseful] = useState<null | boolean>(null);
  const [pct, setPct] = useState(0);
  const Icon = catIcon[a.category];

  const { scrollYProgress } = useScroll({ target: bodyRef, offset: ["start 160px", "end end"] });
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  useEffect(() => scrollYProgress.on("change", (v) => setPct(Math.min(1, Math.max(0, v)))), [scrollYProgress]);

  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => {
    const ok = "speechSynthesis" in window;
    setCanSpeak(ok);
    return () => {
      if (ok) window.speechSynthesis.cancel();
    };
  }, [a]);

  const listen = () => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const parts = [a.title, a.excerpt, ...a.blocks.flatMap((b) => (b.type === "p" || b.type === "h2" || b.type === "quote" ? [b.text] : b.type === "list" ? b.items : b.type === "facts" ? b.items.map((f) => `${f.label}: ${f.value}`) : [b.title, b.text]))];
    const u = new SpeechSynthesisUtterance(parts.join(". ").replace(/₦/g, "naira "));
    u.lang = "en-NG";
    u.rate = 0.95;
    const voice = synth.getVoices().find((v) => v.lang === "en-NG") ?? synth.getVoices().find((v) => v.lang.startsWith("en"));
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  const toc = useMemo(() => a.blocks.filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2").map((b) => ({ id: b.id, text: b.text })), [a]);
  const idx = news.findIndex((n) => n.slug === a.slug);
  const newer = idx > 0 ? news[idx - 1] : null;
  const older = idx < news.length - 1 ? news[idx + 1] : null;
  const more = news.filter((n) => n.slug !== a.slug).sort((x, y) => Number(y.category === a.category) - Number(x.category === a.category)).slice(0, 3);
  const words = a.title.split(" ");
  const sizeBtn = cn("flex h-12 w-12 items-center justify-center rounded-full text-[#14261A] transition hover:bg-[#0A4A13] hover:text-[#F4D27A] disabled:pointer-events-none disabled:opacity-30", focus);

  return (
    <article aria-labelledby="story-title">
      {/* Sticky reading bar */}
      <AnimatePresence>
        {!heroVisible && (
          <motion.div initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -64, opacity: 0 }} transition={{ duration: 0.35, ease }} className="fixed inset-x-0 top-[92px] z-30 border-b border-black/10 bg-white shadow-[0_12px_30px_-24px_rgba(10,74,19,0.5)] print:hidden">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4">
              <span aria-hidden="true" className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A4A13] text-[#F4D27A] sm:flex"><Icon className="h-5 w-5" /></span>
              <p className="min-w-0 flex-1 truncate text-base font-bold text-[#14261A] sm:text-lg">{a.title}</p>
              <button type="button" onClick={listen} disabled={!canSpeak} className={cn(tool, "hidden min-h-11 sm:inline-flex", speaking && "bg-[#0A4A13] text-[#F4D27A] ring-[#0A4A13]")} aria-pressed={speaking}>
                {speaking ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}{speaking ? "Stop" : "Listen"}
              </button>
              <Link to="/news" className={cn("inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#0A4A13] px-4 text-base font-semibold text-white transition hover:bg-[#117F21]", focus)}>
                <ArrowLeft className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" /> Newsroom
              </Link>
            </div>
            <motion.span aria-hidden="true" style={{ scaleX: bar }} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero: title on cream, photo below in a rounded frame */}
      <header ref={heroRef} className="relative isolate overflow-x-clip bg-[#FBF8F1]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#E8F5E9] blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:pt-10 lg:pb-20">
          <Crumbs crumbs={[{ label: "Home", to: "/" }, { label: "Connect", to: "/connect" }, { label: "News", to: "/news" }]} />
          <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 text-base text-gray-700">
            <EyebrowPill icon={Icon} label={a.category} />
            <span className="inline-flex items-center gap-2"><Calendar className="h-5 w-5 text-[#117F21]" aria-hidden="true" /><time dateTime={a.date}>{fmt(a.date)}</time></span>
            <span className="inline-flex items-center gap-2"><Clock className="h-5 w-5 text-[#117F21]" aria-hidden="true" />{a.readMins} min read</span>
          </motion.div>
          <h1 id="story-title" data-no-translate className="mt-6 max-w-4xl text-[2.1rem] font-bold leading-[1.1] tracking-tight text-[#14261A] sm:text-5xl lg:text-[3.4rem]">
            {words.map((w, i) => (
              <Fragment key={`${w}-${i}`}>
                <motion.span initial={{ opacity: 0, y: reduce ? 0 : "0.4em" }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 + i * 0.04, ease }} className="inline-block">
                  {w}
                </motion.span>
                {i < words.length - 1 && " "}
              </Fragment>
            ))}
          </h1>
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 + words.length * 0.04, ease }}
            className="mt-6 block h-1.5 w-24 origin-left rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]"
          />
          <motion.p initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 + words.length * 0.04, ease }} className="mt-6 max-w-3xl text-xl leading-relaxed text-gray-700">
            {a.excerpt}
          </motion.p>

          <motion.figure initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease }} className="relative mt-10 lg:mt-12">
            <span aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-2 rounded-[2rem] border-2 border-[#CB9615]/60 sm:translate-x-3 sm:translate-y-3" />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-[#E8F5E9] shadow-[0_30px_60px_-36px_rgba(10,74,19,0.55)] ring-1 ring-black/10 sm:aspect-[2/1] lg:aspect-[21/9]">
              <motion.img
                src={a.image}
                alt={a.imageAlt}
                fetchPriority="high"
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.figure>
        </div>
      </header>

      {/* Body */}
      <div className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div ref={bodyRef} className="min-w-0">
            <div className="mx-auto max-w-[46rem]">
              {/* Byline + tools */}
              <div className="flex flex-col gap-5 border-b border-black/10 pb-7 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-[#CB9615]/50 ring-offset-2">
                    <img src="/pencom-logo.png" alt="" className="h-10 w-10 object-contain" />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-[#14261A]">{a.author}</p>
                    <p className="text-base text-gray-700">National Pension Commission</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <button type="button" onClick={listen} disabled={!canSpeak} aria-pressed={speaking} className={cn(tool, speaking && "bg-[#0A4A13] text-[#F4D27A] ring-[#0A4A13]")}>
                    {speaking ? (
                      <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
                        {[0, 1, 2].map((i) => <motion.span key={i} className="w-1 rounded-full bg-current" animate={{ height: ["30%", "100%", "30%"] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />)}
                      </span>
                    ) : <Volume2 className="h-4 w-4" aria-hidden="true" />}
                    {speaking ? "Stop" : "Listen"}
                  </button>
                  <div className="inline-flex items-center gap-1 rounded-full bg-white py-0 pl-4 ring-1 ring-[#117F21]/40" role="group" aria-labelledby="size-label">
                    <span id="size-label" className="mr-1 text-base font-semibold text-[#14261A]">Text size</span>
                    <button type="button" onClick={() => setSize((s) => Math.max(0, s - 1))} disabled={size === 0} className={sizeBtn} aria-label="Smaller text"><Minus className="h-4 w-4" aria-hidden="true" /></button>
                    <span className="sr-only" aria-live="polite">{size + 1} of 3</span>
                    <button type="button" onClick={() => setSize((s) => Math.min(2, s + 1))} disabled={size === 2} className={sizeBtn} aria-label="Larger text"><Plus className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                  <button type="button" onClick={() => window.print()} className={tool}><Printer className="h-4 w-4" aria-hidden="true" /> Print</button>
                </div>
              </div>
              <div className="mt-6 print:hidden"><ShareRow a={a} /></div>

              {/* Story: 18 px base, then 20 and 22 px */}
              <div className="mt-10 space-y-6" style={{ fontSize: `${[1.125, 1.25, 1.375][size]}rem` }}>
                {a.blocks.map((b, i) => <BlockView key={i} b={b} first={i === 0} />)}
              </div>

              <div className="mt-12 space-y-6">
                {a.attachment && (
                  <motion.a {...reveal} href={a.attachment.url} target="_blank" rel="noopener noreferrer" className={cn("group relative isolate flex items-center gap-5 overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_28px_50px_-30px_rgba(10,74,19,0.7)] transition-shadow duration-300 hover:shadow-[0_28px_50px_-24px_rgba(10,74,19,0.85)] sm:p-7", darkCard, focus)}>
                    <span aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-[#CB9615]/20 blur-3xl" />
                    <span className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[#B52026] shadow-lg transition group-hover:-rotate-6">
                      <FileText className="h-6 w-6" aria-hidden="true" /><span className="text-[11px] font-bold">PDF</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold uppercase tracking-[0.16em] text-[#F4D27A]">Read the full document</span>
                      <span className="mt-1 block text-lg font-semibold leading-snug">{a.attachment.title}</span>
                      {a.attachment.size && <span className="mt-0.5 block text-base text-white/80">{a.attachment.size}</span>}
                    </span>
                    <span className="hidden min-h-12 shrink-0 items-center gap-2 rounded-2xl bg-[#F4D27A] px-4 text-base font-semibold text-[#1A1206] transition group-hover:bg-[#FFE08F] sm:inline-flex">
                      <Download className="h-5 w-5" aria-hidden="true" /> Download
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </motion.a>
                )}

                {/* Related + sources */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Rise className="h-full">
                    <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-black/10">
                      <h2 className={eyebrowCls}>Related on this site</h2>
                      <ul className="mt-3 divide-y divide-black/[0.08]">
                        {a.related.map((r) => (
                          <li key={r.to}>
                            <Link to={r.to} className={cn("group flex min-h-12 items-center justify-between gap-3 rounded-lg py-2.5 text-lg font-semibold text-[#14261A] transition-colors hover:text-[#117F21]", focus)}>
                              {r.label}
                              <ArrowRight className={cn(moveArrow, "text-[#117F21]")} aria-hidden="true" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Rise>
                  <Rise delay={0.08} className="h-full">
                    <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-black/10">
                      <h2 className={eyebrowCls}>Sources</h2>
                      <ul className="mt-3 divide-y divide-black/[0.08]">
                        {a.sources.map((s) => (
                          <li key={s.url}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className={cn("group flex min-h-12 items-start justify-between gap-3 rounded-lg py-2.5 text-base text-gray-700 transition-colors hover:text-[#117F21]", focus)}>
                              {s.label}
                              <ArrowUpRight className="mt-0.5 h-5 w-5 shrink-0 text-[#7A5200] transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                              <span className="sr-only">(opens in a new tab)</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Rise>
                </div>

                {/* Feedback */}
                <div className="rounded-3xl bg-[#FBF8F1] p-6 ring-1 ring-black/10 print:hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    {useful === null ? (
                      <motion.div key="ask" exit={{ opacity: 0, y: -8 }} className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <p className="text-lg font-bold text-[#14261A]">Was this story useful?</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setUseful(true)} className={tool}><ThumbsUp className="h-4 w-4" aria-hidden="true" /> Yes</button>
                          <button type="button" onClick={() => setUseful(false)} className={tool}><ThumbsDown className="h-4 w-4" aria-hidden="true" /> No</button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.p key="thanks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className="flex items-center gap-3 text-lg font-semibold text-[#14261A]">
                        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A4A13] text-[#F4D27A]"><Check className="h-5 w-5" strokeWidth={3} /></span>
                        {useful ? "Thank you for your feedback." : <>Thank you. <Link to="/connect#contact" className={cn("text-[#117F21] underline underline-offset-2", focus)}>Tell us what was missing</Link>.</>}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block print:hidden" aria-label="About this story">
            <div className="sticky top-[176px] space-y-5">
              <Contents items={toc} progress={pct} />
              <div className="relative overflow-hidden rounded-3xl bg-[#F1EFE8] p-6">
                <div className="flex items-center gap-3">
                  <IconTile icon={Mail} className="h-12 w-12 [&_svg]:h-6 [&_svg]:w-6" />
                  <div>
                    <p className="text-lg font-bold text-[#14261A]">Media enquiries</p>
                    <p className="text-base text-gray-700">Corporate Communications Department</p>
                  </div>
                </div>
                <a href="mailto:info@pencom.gov.ng" className={cn("mt-4 inline-flex min-h-11 items-center rounded-lg text-lg font-semibold text-[#0A4A13] underline underline-offset-4 hover:text-[#117F21]", focus)}>info@pencom.gov.ng</a>
                <p className={cn(eyebrowCls, "mt-4")}>Follow PenCom</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {social.map((s) => (
                    <li key={s.name}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-11 items-center rounded-full bg-white px-4 text-base font-semibold text-[#14261A] ring-1 ring-[#117F21]/40 transition hover:bg-[#0A4A13] hover:text-white", focus)}>
                        {s.name}<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Newer / older */}
      <nav aria-label="More stories" className="bg-white px-4 pb-16 print:hidden sm:pb-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2">
          {[{ s: older, label: "Previous story", dir: -1 }, { s: newer, label: "Next story", dir: 1 }].map(({ s, label, dir }) =>
            s ? (
              <Link key={label} to={newsPath(s)} className={cn(calmCard, "flex items-center gap-4 p-5 sm:p-6", dir === 1 && "sm:flex-row-reverse sm:text-right", focus)}>
                <Bubble />
                <span aria-hidden="true" className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A]">
                  {dir === -1
                    ? <ArrowLeft className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
                    : <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />}
                </span>
                <span className="relative min-w-0">
                  <span className={cn("block", eyebrowCls)}>{label}</span>
                  <span className="mt-1 block text-lg font-bold leading-snug text-[#14261A] transition-colors group-hover:text-[#117F21] sm:text-xl">{s.title}</span>
                </span>
              </Link>
            ) : <span key={label} className="hidden sm:block" />,
          )}
        </div>
      </nav>

      {/* More stories */}
      <section aria-labelledby="more-title" className={cn("bg-[#FBF8F1] print:hidden", sectionCls)}>
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            id="more-title"
            eyebrow="Newsroom"
            title="More from the newsroom"
            highlight="newsroom"
            action={
              <Link to="/news" className={outlineBtn}>
                All news
                <ArrowRight className={moveArrow} aria-hidden="true" />
              </Link>
            }
          />
          <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {more.map((m, i) => <StoryCard key={m.slug} a={m} i={i} />)}
          </ul>
        </div>
      </section>
    </article>
  );
}

function Missing() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-[0_30px_60px_-36px_rgba(10,74,19,0.45)] ring-1 ring-black/10 sm:p-10">
        <EyebrowPill icon={Newspaper} label="Newsroom" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#14261A] sm:text-4xl">We can’t find that story</h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-700">It may have been moved or archived. Browse the latest news instead.</p>
        <Link to="/news" className={cn(goldBtn, "mt-8", focus)}>
          Go to the newsroom <ArrowRight className={moveArrow} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
