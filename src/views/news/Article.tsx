"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Calendar, Check, Clock, Download, Facebook, FileText,
  Info, Link2, Linkedin, Mail, Megaphone, MessageCircle, Mic, Minus, Pause, Plus, Printer, Quote, Scale, Share2, ThumbsDown, ThumbsUp, Twitter, Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight, Tilt } from "@/views/about/primitives";
import { Crumbs, DarkBand, EyebrowPill, FloatingBar, Tile, ease, focus, goldBtn, listPanel, listRow, outlineBtn, outlineDarkBtn } from "@/views/theme/ui";
import { SectionHeading } from "@/views/theme/heading";
import { darkCard, sizes } from "@/views/docs/kit";
import { KindChip } from "@/views/newsroom/parts";
import { social } from "@/views/connect/data";
import { findArticle, news, newsPath, type Article as A, type Block, type Category } from "./data";

/**
 * News story (brief §7 "News and events"; questionnaire: news and media centre, easy sharing, verified social links).
 * Route: /news/:slug (unknown slugs answer 404 from the route).
 * Classic document page: the story's photo as a banner (dark shade under the words, title rising word by word), a
 * byline and reading tools card floating over it, a left sidebar (contents with reading progress, share, more from
 * the newsroom) and the story at 16/18/20 px; figures as a `gap-px` grid, the PDF as the featured card, and the
 * page's one dark band for "Keep reading" (previous/next story, media enquiries).
 */

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const short = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
/** The -480/-960/-1920 copies of a site photo (or the -640/-1200 copies of an optimised one). */
const srcSetOf = (src: string) => {
  const m = src.match(/^(.*)-1920\.webp$/);
  if (m) return `${m[1]}-480.webp 480w, ${m[1]}-960.webp 960w, ${m[1]}-1920.webp 1920w`;
  const o = src.match(/^(\/images\/opt\/.*)-1200\.webp$/);
  return o ? `${o[1]}-640.webp 640w, ${o[1]}-1200.webp 1200w` : undefined;
};

/** A small copy of a site photo for thumbnails. */
const thumbOf = (src: string) => src.replace(/-1920\.webp$/, "-480.webp").replace(/^(\/images\/opt\/.*)-1200\.webp$/, "$1-256.webp");

export const catIcon: Record<Category, typeof Megaphone> = {
  "Press release": Megaphone,
  Statement: FileText,
  Reports: BarChart3,
  Regulation: Scale,
  Speech: Mic,
  Event: Calendar,
};

const eyebrowCls = "text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]";
const moveArrow = "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1";
/** Small labelled tool button (listen, print, feedback). */
const tool = cn(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-base font-semibold text-[#0A2E10] transition hover:border-[#117F21] hover:bg-[#F7FAF6] hover:text-[#117F21] disabled:pointer-events-none disabled:opacity-40",
  focus,
);
const toolOn = "border-[#0A4A13] bg-[#0A4A13] text-[#F4D27A] hover:border-[#0A4A13] hover:bg-[#0A4A13] hover:text-[#F4D27A]";

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

/** Share panel: labelled buttons in a `gap-px` grid (words next to every icon). */
function SharePanel({ a }: { a: A }) {
  const { links, copy, copied, native } = useShare(a);
  const cell = cn("group flex min-h-12 items-center gap-2.5 bg-white px-4 text-base font-semibold text-[#0A2E10] transition hover:bg-[#F7FAF6] hover:text-[#117F21]", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]");
  const ico = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#117F21] transition group-hover:bg-[#117F21] group-hover:text-white [&_svg]:h-4 [&_svg]:w-4";
  return (
    <section aria-labelledby="share-title" className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white print:hidden">
      <h2 id="share-title" className="flex items-center gap-2 border-b border-gray-100 bg-[#F4F7F2] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-600">
        <Share2 className="h-4 w-4 text-[#117F21]" aria-hidden="true" />
        Share this story
      </h2>
      <ul className="grid grid-cols-2 gap-px bg-gray-100">
        {links.map((l) => (
          <li key={l.name} className="bg-white">
            <a href={l.href} target="_blank" rel="noopener noreferrer" className={cell} aria-label={`Share on ${l.name} (opens in a new tab)`}>
              <span aria-hidden="true" className={ico}><l.icon /></span>
              <span aria-hidden="true">{l.name}</span>
            </a>
          </li>
        ))}
        <li className={cn("bg-white", !native && "col-span-2")}>
          <button type="button" onClick={copy} className={cn(cell, "w-full")} aria-label="Copy link to this story">
            <span aria-hidden="true" className={cn(ico, copied && "bg-[#117F21] text-white")}>{copied ? <Check /> : <Link2 />}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={copied ? "y" : "n"} aria-hidden="true" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                {copied ? "Copied" : "Copy link"}
              </motion.span>
            </AnimatePresence>
          </button>
        </li>
        {native && (
          <li className="bg-white">
            <button type="button" onClick={native} className={cn(cell, "w-full")} aria-label="More ways to share">
              <span aria-hidden="true" className={ico}><Share2 /></span>
              <span aria-hidden="true">More</span>
            </button>
          </li>
        )}
      </ul>
      <span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span>
    </section>
  );
}

/* ─────────────────────────── Blocks ─────────────────────────── */

function Facts({ items }: { items: { value: string; label: string }[] }) {
  const reduce = useReducedMotion();
  return (
    <Spotlight className="my-10 rounded-3xl border border-gray-200/80 bg-gray-200/80">
      <dl className={cn("grid grid-cols-1 gap-px sm:grid-cols-2", items.length === 3 && "md:grid-cols-3")}>
        {items.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease }}
            className="relative flex flex-col-reverse bg-white/95 p-6"
          >
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease }}
              className="absolute inset-x-0 top-0 h-1 origin-left bg-gradient-to-r from-[#117F21] to-[#CB9615]"
            />
            <dt className="mt-3 text-base leading-snug text-gray-600">{f.label}</dt>
            <dd className="break-words text-[1.75rem] font-bold leading-none tracking-tight text-[#0A2E10] tabular-nums sm:text-[2rem]">{f.value}</dd>
          </motion.div>
        ))}
      </dl>
    </Spotlight>
  );
}

function BlockView({ b, first }: { b: Block; first: boolean }) {
  const reduce = useReducedMotion();
  const rise = { initial: { opacity: 0, y: reduce ? 0 : 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.6, ease } };
  switch (b.type) {
    case "p":
      return (
        <p className={cn("leading-[1.8] text-gray-700", first && "text-[1.15em] leading-[1.7] text-[#0A2E10] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[3.4em] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-[#117F21]")}>
          {b.text}
        </p>
      );
    case "h2":
      return (
        <h2 id={b.id} className="!mt-12 flex scroll-mt-[180px] items-start gap-3 text-[1.4em] font-bold leading-snug tracking-tight text-[#0A2E10] sm:text-[1.55em]">
          <motion.span
            aria-hidden="true"
            initial={{ scaleY: reduce ? 1 : 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mt-1 block h-[1.1em] w-1.5 shrink-0 origin-top rounded-full bg-gradient-to-b from-[#117F21] to-[#CB9615]"
          />
          {b.text}
        </h2>
      );
    case "quote":
      return (
        <motion.figure {...rise} className="relative !my-12 overflow-hidden rounded-3xl border border-gray-200/80 bg-[#F4F7F2] py-8 pl-8 pr-6 sm:py-9 sm:pl-10 sm:pr-9">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#CB9615] to-[#117F21]" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-6 text-[9rem] font-black leading-none text-[#117F21]/[0.07]">&ldquo;</span>
          <Tile icon={Quote} dark className="mb-4" />
          <blockquote className="relative text-[1.25em] font-semibold leading-snug text-[#0A2E10]">{b.text}</blockquote>
          {b.by && <figcaption className={cn(eyebrowCls, "mt-4 text-sm")}>{b.by}</figcaption>}
        </motion.figure>
      );
    case "list":
      return (
        <ul className={cn(listPanel, "!my-8")}>
          {b.items.map((it, i) => (
            <motion.li
              key={it}
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, ease }}
              className="flex gap-4 px-5 py-4 leading-relaxed text-gray-700 transition hover:bg-[#F7FAF6] sm:px-6"
            >
              <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#117F21]">
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
        <motion.aside {...rise} aria-label={b.title} className="relative !my-12 overflow-hidden rounded-3xl border border-gray-200/80 bg-white">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#117F21]" />
          <div className="flex items-center gap-3 border-b border-gray-100 bg-[#F4F7F2] py-4 pl-7 pr-5 sm:pl-8">
            <Tile icon={Info} size="sm" />
            <p className="text-base font-bold text-[#0A2E10]">{b.title}</p>
          </div>
          <div className="py-6 pl-7 pr-6 sm:pl-8">
            <p className="text-[1em] leading-relaxed text-gray-700">{b.text}</p>
            <ul className="mt-5 flex flex-wrap gap-3">
              {b.links.map((l, i) => (
                <li key={l.to}>
                  <Link to={l.to} className={cn("group text-base", i === 0 ? goldBtn : outlineBtn)}>
                    {l.label}
                    <ArrowRight className={moveArrow} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>
      );
  }
}

/* ─────────────────────────── Contents with scroll-spy and reading progress ─────────────────────────── */

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
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <nav aria-label="In this story" className="rounded-3xl border border-gray-200/80 bg-white p-3">
      <div className="flex items-center gap-3 px-2 pt-1">
        <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90" aria-hidden="true">
          <circle cx="22" cy="22" r={r} fill="none" stroke="#E8F5E9" strokeWidth="4" />
          <circle cx="22" cy="22" r={r} fill="none" stroke="url(#story-ring)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} className="transition-[stroke-dashoffset] duration-200" />
          <defs>
            <linearGradient id="story-ring" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#117F21" /><stop offset="1" stopColor="#CB9615" /></linearGradient>
          </defs>
        </svg>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-600">In this story</p>
          <p className="text-base font-bold text-[#0A2E10] tabular-nums">{Math.round(progress * 100)}% read</p>
        </div>
      </div>
      {items.length > 0 && (
        <ol className="mt-3 space-y-1">
          {items.map((i) => {
            const on = active === i.id;
            return (
              <li key={i.id} className="relative">
                {on && <motion.span layoutId="story-toc" aria-hidden="true" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_10px_24px_-14px_rgba(10,74,19,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <a
                  href={`#${i.id}`}
                  onClick={(e) => { e.preventDefault(); document.getElementById(i.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                  aria-current={on ? "location" : undefined}
                  className={cn("relative flex min-h-11 items-center rounded-xl py-2 pl-3 pr-3 text-[15px] leading-snug transition", on ? "font-semibold text-white" : "bg-gray-50 font-medium text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0A4A13]", focus)}
                >
                  {i.text}
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function Article({ slug }: { slug: string }) {
  const a = findArticle(slug);
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#0A2E10]">{a && <Story key={a.slug} a={a} />}</div>
    </MotionConfig>
  );
}

/** The story's photo as the banner: Ken Burns, dark shade under the words, title rising word by word. */
function StoryBanner({ a, bannerRef }: { a: A; bannerRef: React.RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const Icon = catIcon[a.category];
  const words = a.title.split(" ");
  const meta = [
    { icon: Calendar, node: <time dateTime={a.date}>{fmt(a.date)}</time> },
    { icon: Clock, node: <>{a.readMins} min read</> },
  ];
  return (
    <header ref={bannerRef} className="relative isolate overflow-hidden bg-[#04240A] text-white print:bg-white print:text-black">
      <motion.img
        src={a.image}
        srcSet={srcSetOf(a.image)}
        sizes="100vw"
        alt={a.imageAlt}
        fetchPriority="high"
        initial={{ scale: 1 }}
        animate={{ scale: reduce ? 1 : 1.08 }}
        transition={{ duration: 24, ease: "linear" }}
        className="absolute inset-0 -z-20 h-full w-full object-cover print:hidden"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#021a07]/95 via-[#021a07]/80 to-[#021a07]/45 lg:hidden" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#021a07]/90 via-[#021a07]/80 via-55% to-[#021a07]/15 lg:block" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="relative mx-auto flex min-h-[500px] max-w-7xl flex-col justify-end px-4 pb-24 pt-8 sm:min-h-[540px] sm:pb-28">
        <Crumbs crumbs={[{ label: "Home", to: "/" }, { label: "Connect", to: "/connect" }, { label: "News", to: "/news" }]} dark className="absolute left-4 right-4 top-6 print:static" />
        <div className="max-w-4xl pt-14">
          <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <EyebrowPill icon={Icon} label={a.category} dark />
            {meta.map((m, i) => (
              <span key={i} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-black/25 px-3.5 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur-md">
                <m.icon className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" />
                {m.node}
              </span>
            ))}
          </motion.div>
          <h1 id="story-title" data-no-translate className="mt-5 text-[2.1rem] font-bold leading-[1.1] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-[3.25rem]">
            {words.map((w, i) => (
              <span key={`${w}-${i}`}>
                <span className="inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span className="inline-block" initial={{ y: reduce ? 0 : "105%" }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.06 + i * 0.04, ease }}>
                    {w}
                  </motion.span>
                </span>
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: reduce ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 + words.length * 0.04, ease }}
            className="mt-5 block h-1 w-24 origin-left rounded-full bg-gradient-to-r from-[#F4D27A] to-[#CB9615] print:hidden"
          />
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 + words.length * 0.04, ease }}
            className="mt-5 max-w-3xl text-lg leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] print:text-black"
          >
            {a.excerpt}
          </motion.p>
        </div>
      </div>
    </header>
  );
}

function Story({ a }: { a: A }) {
  const bannerRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bannerVisible = useInView(bannerRef, { margin: "-92px 0px 0px 0px" });
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
  const sizeBtn = cn("flex h-11 w-11 items-center justify-center rounded-lg text-[#0A2E10] transition hover:bg-[#117F21] hover:text-white disabled:pointer-events-none disabled:opacity-30", focus);

  const listenBtn = (extra?: string) => (
    <button type="button" onClick={listen} disabled={!canSpeak} aria-pressed={speaking} className={cn(tool, speaking && toolOn, extra)}>
      {speaking ? (
        <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
          {[0, 1, 2].map((i) => <motion.span key={i} className="w-1 rounded-full bg-current" animate={{ height: ["30%", "100%", "30%"] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />)}
        </span>
      ) : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );

  return (
    <article aria-labelledby="story-title">
      {/* Sticky reading bar once the banner has scrolled away */}
      <AnimatePresence>
        {!bannerVisible && (
          <motion.div initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -64, opacity: 0 }} transition={{ duration: 0.35, ease }} className="fixed inset-x-0 top-[92px] z-30 border-b border-gray-200/80 bg-white/95 shadow-[0_12px_30px_-24px_rgba(10,74,19,0.5)] backdrop-blur print:hidden">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4">
              <Tile icon={Icon} dark size="sm" className="hidden sm:flex" />
              <p className="min-w-0 flex-1 truncate text-base font-bold text-[#0A2E10]" data-no-translate>{a.title}</p>
              {listenBtn("hidden sm:inline-flex")}
              <Link to="/news" className={cn(outlineBtn, "group min-h-11 shrink-0 px-4")}>
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" /> Newsroom
              </Link>
            </div>
            <motion.span aria-hidden="true" style={{ scaleX: bar }} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-[#117F21] via-[#CB9615] to-[#F4D27A]" />
          </motion.div>
        )}
      </AnimatePresence>

      <StoryBanner a={a} bannerRef={bannerRef} />

      {/* Byline and reading tools, rising over the banner */}
      <FloatingBar className="sm:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
              <img src="/pencom-logo.png" alt="" className="h-9 w-9 object-contain" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-[#0A2E10]">{a.author}</p>
              <p className="text-sm text-gray-600">National Pension Commission</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {listenBtn()}
            <div role="group" aria-labelledby="size-label" className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-[#F7FAF6] py-0 pl-3">
              <span id="size-label" className="mr-1 text-sm font-semibold text-gray-700">Text size</span>
              <button type="button" onClick={() => setSize((s) => Math.max(0, s - 1))} disabled={size === 0} className={sizeBtn} aria-label="Smaller text"><Minus className="h-4 w-4" aria-hidden="true" /></button>
              <span aria-hidden="true" className="flex items-end gap-0.5">
                {[0, 1, 2].map((i) => <span key={i} className={cn("w-1.5 rounded-full transition-colors", ["h-2", "h-3", "h-4"][i], i <= size ? "bg-[#CB9615]" : "bg-gray-300")} />)}
              </span>
              <span className="sr-only" aria-live="polite">{size + 1} of 3</span>
              <button type="button" onClick={() => setSize((s) => Math.min(2, s + 1))} disabled={size === 2} className={sizeBtn} aria-label="Larger text"><Plus className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            <button type="button" onClick={() => window.print()} className={tool}><Printer className="h-4 w-4" aria-hidden="true" /> Print</button>
          </div>
        </div>
      </FloatingBar>

      {/* Body: the story on the right, the sidebar on the left (after the story on phones) */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-14 sm:py-16 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[18.5rem_minmax(0,1fr)]">
        <div ref={bodyRef} className="min-w-0 lg:col-start-2 lg:row-start-1">
          <div className="max-w-[46rem]">
            <div className="space-y-6" style={{ fontSize: sizes[size] }}>
              {a.blocks.map((b, i) => <BlockView key={i} b={b} first={i === 0} />)}
            </div>

            <div className="mt-12 space-y-6">
              {a.attachment && (
                <Tilt max={4}>
                  <a href={a.attachment.url} target="_blank" rel="noopener noreferrer" className={cn("group relative isolate flex items-center gap-5 overflow-hidden rounded-3xl p-6 text-white shadow-[0_28px_50px_-30px_rgba(10,74,19,0.7)] transition-shadow duration-300 hover:shadow-[0_28px_50px_-24px_rgba(10,74,19,0.85)] sm:p-7", darkCard, focus)}>
                    <GridBackdrop className="-z-10 opacity-70" />
                    <span aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-[#CB9615]/20 blur-3xl" />
                    <span className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[#B52026] shadow-lg transition group-hover:-rotate-6">
                      <FileText className="h-6 w-6" aria-hidden="true" /><span className="text-xs font-bold">PDF</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A]">Read the full document</span>
                      <span className="mt-1 block text-lg font-semibold leading-snug">{a.attachment.title}</span>
                      {a.attachment.size && <span className="mt-0.5 block text-base text-white/80">{a.attachment.size}</span>}
                    </span>
                    <span className="hidden min-h-12 shrink-0 items-center gap-2 rounded-xl bg-[#CB9615] px-4 text-base font-semibold text-[#1A1206] transition group-hover:bg-[#E0AA22] sm:inline-flex">
                      <Download className="h-5 w-5" aria-hidden="true" /> Download
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Tilt>
              )}

              {/* Related + sources */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { title: "Related on this site", rows: a.related.map((r) => ({ key: r.to, label: r.label, to: r.to })) },
                  { title: "Sources", rows: a.sources.map((s) => ({ key: s.url, label: s.label, href: s.url })) },
                ].map((g) => (
                  <div key={g.title} className={cn(listPanel, "h-full self-start")}>
                    <h2 className="bg-[#F4F7F2] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-600 sm:px-6">{g.title}</h2>
                    <ul className="divide-y divide-gray-100">
                      {g.rows.map((r) => (
                        <li key={r.key}>
                          {"to" in r && r.to ? (
                            <Link to={r.to} className={cn(listRow, "min-h-12 justify-between py-3 text-base font-semibold text-[#0A2E10] hover:text-[#117F21]")}>
                              {r.label}
                              <ArrowRight className={cn(moveArrow, "text-[#117F21]")} aria-hidden="true" />
                            </Link>
                          ) : (
                            <a href={"href" in r ? r.href : undefined} target="_blank" rel="noopener noreferrer" className={cn(listRow, "min-h-12 items-start justify-between py-3 text-base text-gray-700 hover:text-[#117F21]")}>
                              {r.label}
                              <ArrowUpRight className="mt-0.5 h-5 w-5 shrink-0 text-[#7A5200] transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                              <span className="sr-only">(opens in a new tab)</span>
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Feedback */}
              <div className="rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-5 sm:p-6 print:hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {useful === null ? (
                    <motion.div key="ask" exit={{ opacity: 0, y: -8 }} className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <p className="text-lg font-bold text-[#0A2E10]">Was this story useful?</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setUseful(true)} className={tool}><ThumbsUp className="h-4 w-4" aria-hidden="true" /> Yes</button>
                        <button type="button" onClick={() => setUseful(false)} className={tool}><ThumbsDown className="h-4 w-4" aria-hidden="true" /> No</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p key="thanks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className="flex items-center gap-3 text-lg font-semibold text-[#0A2E10]">
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#117F21] to-[#0A4A13] text-white"><Check className="h-5 w-5" strokeWidth={3} /></span>
                      {useful ? "Thank you for your feedback." : <>Thank you. <Link to="/connect#contact" className={cn("text-[#117F21] underline underline-offset-2", focus)}>Tell us what was missing</Link>.</>}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1 print:hidden" aria-label="About this story">
          <div className="flex-1">
            <div className="space-y-4 lg:sticky lg:top-[176px]">
              <div className="hidden lg:block"><Contents items={toc} progress={pct} /></div>
              <SharePanel a={a} />
            </div>
          </div>
          <Spotlight className="rounded-3xl">
            <section aria-labelledby="more-title" className={listPanel}>
              <h2 id="more-title" className="flex items-center gap-2 bg-[#F4F7F2] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-600">
                More from the newsroom
              </h2>
              <ul className="divide-y divide-gray-100">
                {more.map((m) => (
                  <li key={m.slug}>
                    <Link to={newsPath(m)} className={cn(listRow, "items-start gap-3 px-4 py-4 sm:px-4")}>
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#E8F5E9]">
                        <img src={thumbOf(m.image)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                      </span>
                      <span className="min-w-0">
                        <KindChip kind={m.category} />
                        <span className="mt-1.5 block text-base font-semibold leading-snug text-[#0A2E10] transition-colors group-hover:text-[#117F21]">{m.title}</span>
                        <time dateTime={m.date} className="mt-1 block font-mono text-xs text-gray-600">{short(m.date)}</time>
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/news" className={cn(listRow, "min-h-12 justify-between py-3 text-base font-semibold text-[#117F21]")}>
                    All news
                    <ArrowRight className={moveArrow} aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </section>
          </Spotlight>
        </aside>
      </div>

      {/* Keep reading: the page's dark band */}
      <DarkBand labelledBy="keep-title" className="print:hidden">
        <SectionHeading
          id="keep-title"
          eyebrow="Newsroom"
          title="Keep reading"
          dark
          action={
            <Link to="/news" className={cn(outlineDarkBtn, "group")}>
              All news
              <ArrowRight className={moveArrow} aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <nav aria-label="More stories" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
            {[{ s: older, label: "Previous story", dir: -1 }, { s: newer, label: "Next story", dir: 1 }].map(({ s, label, dir }, i) =>
              s ? (
                <motion.div key={label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.08, ease }}>
                  <Link to={newsPath(s)} className={cn("group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-[#F4D27A]/40 hover:bg-white/[0.09]", focus)}>
                    <span className="relative block aspect-[16/9] overflow-hidden">
                      <img src={s.image} srcSet={srcSetOf(s.image)} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#04240A] via-[#04240A]/20 to-transparent" />
                    </span>
                    <span className="flex flex-1 flex-col gap-3 p-6">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">{label}</span>
                        <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CB9615] text-[#1A1206] transition group-hover:bg-[#E0AA22]">
                          {dir === -1 ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                        </span>
                      </span>
                      <span className="text-xl font-bold leading-snug text-white">{s.title}</span>
                      <time dateTime={s.date} className="mt-auto font-mono text-sm text-white/75">{short(s.date)}</time>
                    </span>
                  </Link>
                </motion.div>
              ) : null,
            )}
          </nav>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: 0.16, ease }} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#CB9615] text-[#1A1206]"><Mail className="h-5 w-5" /></span>
              <div>
                <p className="text-lg font-bold text-white">Media enquiries</p>
                <p className="text-sm text-white/80">Corporate Communications Department</p>
              </div>
            </div>
            <a href="mailto:info@pencom.gov.ng" className={cn("mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-lg font-semibold text-[#F4D27A] underline underline-offset-4 hover:text-white", focus)}>
              info@pencom.gov.ng
            </a>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-white/75">Follow PenCom</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {social.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white transition hover:border-[#F4D27A] hover:text-[#F4D27A]", focus)}>
                    {s.name}<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </DarkBand>
    </article>
  );
}
