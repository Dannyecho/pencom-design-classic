"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Award, BookOpen, Check, Download, Feather, Library, Lock, Mail, Megaphone, MessageSquareQuote, Mic,
  Newspaper, PenLine, Sparkles, TrendingUp, Users, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Spotlight, Tilt, scrollToId } from "@/views/about/primitives";
import {
  ClosingLinks, Crumbs, DarkBackdrop, DarkBand, EyebrowPill, FloatingBar, Rise, RiseWords, TabStrip, Tile, card, ease, focus,
  goldBtn, outlineBtn, outlineDarkBtn, sectionCls, type NavSection,
} from "@/views/theme/ui";
import { DrawnMark } from "@/views/theme/Headline";
import { SectionHeading } from "@/views/theme/heading";
import { previewPages } from "./PreviewPages";
import { awards, issue, launchSource, sections, shelf } from "./data";

/**
 * PenCom Chronicles, the Commission's magazine (brief §7 "Publications listing and detail": cover, abstract, period,
 * download; questionnaire: news and media centre, easy sharing). No on-page reader: "Read the issue" opens the
 * PDF from /public/magazine in a new tab, and "Download PDF" links to the copy on pencom.gov.ng.
 * Classic tool page: dark grid banner with the serif masthead (the theme's one serif title) beside the cover
 * (the page's Tilt card), issue facts in the FloatingBar, TabStrip, the launch as the dark band with award medals,
 * the issue shelf, and the subscribe form in a floating white card.
 */

/* ─────────────────────────── Cover ─────────────────────────── */

/** The issue cover (preview page 0, drawn at 420 × 594 and scaled) with an offset gold outline; it tilts with the mouse. */
function CoverFrame() {
  const W = 300;
  const H = Math.round(W * (594 / 420));
  return (
    <div className="relative mx-auto flex items-center justify-center py-4 sm:py-6">
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#CB9615]/25 blur-[90px]" />
      <Tilt className="relative" max={7}>
        <a
          href={issue.localPdf}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("group relative block rounded-2xl", focus)}
          style={{ width: W, maxWidth: "100%" }}
        >
          <span className="sr-only">Read the issue (PDF, opens in a new tab)</span>
          {/* offset gold outline behind the cover */}
          <span aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl ring-2 ring-[#F4D27A]/70 transition duration-500 group-hover:translate-x-4 group-hover:translate-y-4" />
          <span aria-hidden="true" className="relative block overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)] ring-1 ring-white/20" style={{ aspectRatio: `${W} / ${H}` }}>
            <span className="pointer-events-none absolute left-0 top-0 block" style={{ width: 420, height: 594, transform: `scale(${W / 420})`, transformOrigin: "top left" }}>{previewPages[0].node}</span>
            {/* a soft sheen that crosses the cover on hover */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </span>
          <span aria-hidden="true" className="absolute -right-3 -top-3 inline-flex items-center gap-1.5 rounded-full bg-[#CB9615] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1A1206] shadow-[0_10px_24px_-10px_rgba(203,150,21,0.9)]">
            <BookOpen className="h-3.5 w-3.5" /> PDF
          </span>
        </a>
      </Tilt>
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

const nav: NavSection[] = [
  { id: "inside", label: "What’s inside", icon: BookOpen },
  { id: "launch", label: "The launch", icon: Award },
  { id: "issues", label: "All issues", icon: Library },
  { id: "subscribe", label: "Get new issues", icon: Mail },
];

export default function ChroniclesPage() {
  const { hash } = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const a = window.setTimeout(() => scrollToId(id, !reduce), 80);
    const b = window.setTimeout(() => scrollToId(id, false), 900);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, [hash, reduce]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#164D20]">
        <Masthead />
        <FloatingBar eyebrow="PenCom Chronicles">
          <IssueFacts />
        </FloatingBar>
        <div className="h-6" aria-hidden="true" />
        <TabStrip sections={nav} pillId="mag-nav-pill" />
        <Inside />
        <Launch />
        <Issues />
        <Subscribe />
        <ClosingLinks
          items={[
            { to: "/news", icon: Newspaper, title: "Newsroom", body: "Press releases and statements" },
            { to: "/resources", icon: BookOpen, title: "Resources", body: "Publications, forms, FAQ", tone: "gold" },
          ]}
        />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Masthead (dark grid banner, serif title) ─────────────────────────── */

function Masthead() {
  const reduce = useReducedMotion();
  const up = (delay: number, y = 12) => ({
    initial: { opacity: 0, y: reduce ? 0 : y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease },
  });
  return (
    <section aria-labelledby="mag-title" className="relative isolate overflow-hidden text-white print:text-black">
      <DarkBackdrop />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-6 sm:pb-28">
        <Crumbs crumbs={[{ label: "Home", to: "/" }, { label: "Resources", to: "/resources#publications" }, { label: "PenCom Chronicles" }]} dark />
        <div className="mt-6 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <motion.div {...up(0)}>
              <EyebrowPill icon={Sparkles} label={<>New · Issue 01 · {issue.date}</>} dark />
            </motion.div>
            <h1 id="mag-title" data-no-translate className="mt-6 font-serif text-[3.5rem] font-bold leading-[0.98] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-[5.25rem]">
              <span className="block"><RiseWords text="PenCom" /></span>
              <motion.span {...up(0.2, 20)} className="mt-1 inline-block pb-2 pr-3 italic">
                <DrawnMark text="Chronicles" dark />
              </motion.span>
            </h1>
            <motion.p {...up(0.3)} className="mt-7 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              The Commission’s magazine: news, interviews, industry updates, human-interest stories, features and commentaries on Nigeria’s pension system.
            </motion.p>
            <motion.div {...up(0.4)} className="mt-7 flex flex-wrap gap-3 print:hidden">
              <a href={issue.localPdf} target="_blank" rel="noopener noreferrer" className={cn(goldBtn, "group")}>
                <BookOpen className="h-5 w-5" aria-hidden="true" /> Read the issue<span className="sr-only"> (PDF, opens in a new tab)</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </a>
              <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer" className={cn(outlineDarkBtn, "group")}>
                <Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" /> Download PDF<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </motion.div>
          </div>
          <motion.div {...up(0.2, 24)} className="lg:col-span-5 print:hidden">
            <CoverFrame />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Issue facts as a `gap-px` strip in the floating bar. */
function IssueFacts() {
  const facts: [LucideIcon, string, string][] = [
    [Sparkles, "Issue 01", issue.edition],
    [BookOpen, "Published", issue.date],
    [Mic, "Launched", issue.launched],
    [Users, "Publisher", "Corporate Communications"],
  ];
  return (
    <dl className="-mt-2 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 sm:grid-cols-2 lg:grid-cols-4">
      {facts.map(([Icon, k, v]) => (
        <div key={k} className="group flex items-center gap-4 bg-white p-4 transition hover:bg-[#F7FAF6] sm:p-5">
          <Tile icon={Icon} />
          <div className="min-w-0">
            <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#7A5200]">{k}</dt>
            <dd className="mt-0.5 text-base font-bold leading-snug text-[#164D20] sm:text-lg">{v}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/* ─────────────────────────── What's inside ─────────────────────────── */

function Inside() {
  return (
    <section id="inside" aria-labelledby="inside-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="inside-title"
          eyebrow="Every edition"
          title="What you’ll find inside"
          highlight="inside"
          intro="Two editorial sections, with space in every edition for stakeholders to share their views."
          action={
            <a href={issue.localPdf} target="_blank" rel="noopener noreferrer" className={cn(outlineBtn, "group")}>
              <BookOpen className="h-5 w-5" aria-hidden="true" /> Read the issue<span className="sr-only"> (PDF, opens in a new tab)</span>
            </a>
          }
        />
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s, i) => {
            const Icon = [Newspaper, Mic, TrendingUp, Users, Feather, MessageSquareQuote][i];
            return (
              <motion.li key={s.k} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.55, delay: (i % 3) * 0.07, ease }}>
                <div className={cn(card, "group relative h-full overflow-hidden p-6 sm:p-7")}>
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#14892A] to-[#CB9615] transition-transform duration-500 group-hover:scale-x-100" />
                  <Tile icon={Icon} />
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-[#164D20]">{s.k}</h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-600">{s.body}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── The launch (the page's dark band) ─────────────────────────── */

/** A gold award medal on a short ribbon; it turns a little on hover. */
function Medal({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span aria-hidden="true" className="relative flex h-16 w-14 shrink-0 justify-center">
      <svg viewBox="0 0 40 24" className="absolute bottom-0 h-6 w-10">
        <path d="M6 0 L16 0 L12 24 L8 19 L3 22 Z" fill="#14892A" />
        <path d="M24 0 L34 0 L37 22 L32 19 L28 24 Z" fill="#2E913D" />
      </svg>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#F4D27A] via-[#E9B949] to-[#CB9615] text-[#1A1206] shadow-[0_12px_28px_-10px_rgba(203,150,21,0.9)] ring-4 ring-[#F4D27A]/20 transition duration-500 group-hover:rotate-12">
        <span className="absolute inset-1.5 rounded-full border border-dashed border-[#1A1206]/25" />
        <Icon className="relative h-6 w-6" />
      </span>
    </span>
  );
}

function Launch() {
  return (
    <DarkBand id="launch" labelledBy="launch-title">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHeading stacked id="launch-title" dark eyebrow="The launch" title="Launched in Lagos, October 2026" highlight="October 2026" />
          <Rise>
            <figure className="relative mt-8 overflow-hidden rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm sm:p-8">
              <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#F4D27A] to-transparent" />
              <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#CB9615] text-[#1A1206]"><MessageSquareQuote className="h-6 w-6" /></span>
              <blockquote className="mt-5 font-serif text-2xl italic leading-snug text-white sm:text-3xl">
                The beginning of a platform through which PenCom will tell its story.
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-base text-white/85">
                <span aria-hidden="true" className="h-0.5 w-8 shrink-0 rounded-full bg-[#F4D27A]" />
                <span>Omolola Oloworaran, Director-General, at the launch on {issue.launched}</span>
              </figcaption>
            </figure>
          </Rise>
          <p className="mt-6 text-base leading-relaxed text-white/85 sm:text-lg">The Director-General said the magazine would help close gaps in public understanding of the pension sector and set the editorial and digital direction for future editions.</p>
          <a href={launchSource.url} target="_blank" rel="noopener noreferrer" className={cn(goldBtn, "group mt-7")}>
            Read NAN’s report of the launch<span className="sr-only">(opens in a new tab)</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>
        <div className="lg:col-span-6 lg:pt-20">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">
            <Award className="h-5 w-5" aria-hidden="true" /> PenCom Media Excellence Awards 2026
          </p>
          <p className="mt-2 text-base leading-relaxed text-white/85 sm:text-lg">Presented at the launch to journalists whose reporting helps Nigerians understand their pensions.</p>
          <Spotlight color="rgba(244,210,122,0.10)" className="mt-6 rounded-3xl bg-white/[0.04] ring-1 ring-white/10">
            <ul className="divide-y divide-white/10">
              {awards.map((a, i) => {
                const Icon = a.cat === "Online" ? Megaphone : a.cat === "Print" ? Newspaper : Mic;
                return (
                  <motion.li key={a.cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: i * 0.12, ease }} className="group relative flex items-center gap-5 p-5 sm:p-6">
                    <span aria-hidden="true" className="absolute inset-y-4 left-0 w-1 origin-top scale-y-0 rounded-r-full bg-[#F4D27A] transition-transform duration-500 group-hover:scale-y-100" />
                    <Medal icon={Icon} />
                    <span className="min-w-0">
                      <span className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A] ring-1 ring-white/15">{a.cat}</span>
                      <span className="mt-1.5 block text-xl font-bold tracking-tight">{a.name}</span>
                      {a.outlet && <span className="block text-base text-white/80">{a.outlet}</span>}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </Spotlight>
        </div>
      </div>
    </DarkBand>
  );
}

/* ─────────────────────────── Issues shelf ─────────────────────────── */

function Issues() {
  return (
    <section id="issues" aria-labelledby="issues-title" className={cn("bg-gradient-to-b from-white via-[#F4F7F2] to-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="issues-title"
          eyebrow="Archive"
          title="All issues"
          highlight="issues"
          action={
            <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer" className={cn(outlineBtn, "group")}>
              <Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" /> Download PDF<span className="sr-only"> (opens in a new tab)</span>
            </a>
          }
        />
        <ul className="mt-12 flex flex-wrap items-start gap-8 sm:gap-10">
          {shelf.map((s, i) => (
            <motion.li key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease }} className="w-48">
              {s.live ? (
                <a href={issue.localPdf} target="_blank" rel="noopener noreferrer" className={cn("group block rounded-2xl", focus)}>
                  <span className="relative block h-[272px] w-48 overflow-hidden rounded-2xl border border-gray-200/80 shadow-[0_18px_36px_-22px_rgba(16,93,29,0.55)] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_50px_-24px_rgba(16,93,29,0.55)] group-hover:ring-2 group-hover:ring-[#CB9615]">
                    <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 block" style={{ width: 420, height: 594, transform: `scale(${192 / 420})`, transformOrigin: "top left" }}>{previewPages[0].node}</span>
                  </span>
                  {/* shelf edge under the cover */}
                  <span aria-hidden="true" className="mx-auto mt-2 block h-1.5 w-40 rounded-full bg-[#164D20]/10 blur-[2px] transition group-hover:w-36" />
                  <span className="mt-3 flex items-center gap-2 text-xl font-bold tracking-tight text-[#164D20] transition group-hover:text-[#117F21]">
                    {s.label}
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#11421A] px-2.5 py-0.5 text-xs font-bold text-[#F4D27A]">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#F4D27A]" /> New
                    </span>
                    <ArrowRight className="h-5 w-5 text-[#117F21] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                  <span className="block text-base text-gray-600">{s.date} · Read now</span>
                </a>
              ) : (
                <div aria-label={`${s.label}, coming soon`}>
                  <span className="flex h-[272px] w-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-[#F4F7F2] text-center text-gray-600">
                    <Tile icon={Lock} dark />
                    <span className="mt-3 text-base font-semibold">Next edition</span>
                  </span>
                  <span aria-hidden="true" className="mx-auto mt-2 block h-1.5 w-40 rounded-full bg-transparent" />
                  <span className="mt-3 block text-xl font-bold tracking-tight text-gray-600">{s.label}</span>
                  <span className="block text-base text-gray-600">{s.date}</span>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Subscribe + contribute ─────────────────────────── */

function Subscribe() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [errField, setErrField] = useState<"email" | "consent" | null>(null);
  const [done, setDone] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLInputElement>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Enter an email address like name@example.com");
      setErrField("email");
      input.current?.focus();
      return;
    }
    if (!consent) {
      setErr("Tick the box to agree to receive emails");
      setErrField("consent");
      box.current?.focus();
      return;
    }
    setErr(null);
    setErrField(null);
    setDone(true);
  };
  return (
    <section id="subscribe" aria-labelledby="sub-title" className={cn("bg-white", sectionCls)}>
      <div className="relative mx-auto max-w-7xl">
        {/* the panel the white card floats over */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-16 hidden overflow-hidden rounded-3xl bg-[#F4F7F2] lg:block">
          <span className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E8F5E9] blur-3xl" />
        </div>
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-0 lg:px-10 lg:pb-10">
          <Rise className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_40px_80px_-40px_rgba(17,66,26,0.55)] sm:p-9">
              <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <Tile icon={Mail} dark size="lg" />
                <div>
                  <h2 id="sub-title" className="text-3xl font-bold tracking-tight text-[#164D20] sm:text-4xl">Get new issues by email</h2>
                  <p className="mt-2 text-base leading-relaxed text-gray-600 sm:text-lg">We’ll email you when a new edition of PenCom Chronicles is published. Nothing else.</p>
                </div>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.p key="ok" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mt-7 flex items-center gap-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white py-4 pl-6 pr-4 text-base font-semibold text-[#105D1D] sm:text-lg">
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#14892A]" />
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#14892A] to-[#105D1D] text-white"><Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></span>
                    Thank you. We’ll let you know when Issue 02 is out.
                  </motion.p>
                ) : (
                  <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-7 space-y-4">
                    <div>
                      <label htmlFor="sub-email" className="block text-base font-semibold text-[#164D20]">Email address</label>
                      <div className="mt-2 flex flex-col gap-3 rounded-2xl bg-[#F4F7F2] p-1.5 ring-1 ring-gray-200 sm:flex-row">
                        <input
                          ref={input}
                          id="sub-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={errField === "email"}
                          aria-describedby={errField === "email" ? "sub-err" : undefined}
                          placeholder="name@example.com"
                          className={cn(
                            "min-h-12 flex-1 rounded-xl border bg-white px-4 text-base text-[#164D20] placeholder:text-gray-500 focus:border-[#14892A] focus:outline-none focus:ring-[3px] focus:ring-[#FFD84D]",
                            errField === "email" ? "border-[#B52026]" : "border-gray-300",
                          )}
                        />
                        <button type="submit" className={cn(goldBtn, "group")}>
                          Notify me
                          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl p-3 text-base leading-relaxed text-gray-700 transition", errField === "consent" ? "bg-[#FDECEC] ring-2 ring-[#B52026]" : "bg-[#F7FAF6] ring-1 ring-gray-200 hover:ring-[#14892A]/30")}>
                      <input
                        ref={box}
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        aria-invalid={errField === "consent"}
                        aria-describedby={errField === "consent" ? "sub-err" : undefined}
                        className={cn("mt-0.5 h-6 w-6 shrink-0 rounded accent-[#14892A]", focus)}
                      />
                      <span>I agree that PenCom may use my email address to tell me about new issues. I can unsubscribe at any time. <Link to="/regulations#policies" className={cn("rounded font-semibold text-[#105D1D] underline underline-offset-4", focus)}>Privacy notice</Link></span>
                    </label>
                    {err && (
                      <p id="sub-err" role="alert" className="relative overflow-hidden rounded-2xl border border-[#B52026]/25 bg-[#FDECEC] py-3 pl-5 pr-4 text-base font-semibold text-[#8A1419]">
                        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B52026]" />
                        {err}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">Prototype: no email is sent yet.</p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Rise>

          <Rise delay={0.1} className="lg:col-span-5 lg:self-end lg:pl-10">
            <div className="group relative overflow-hidden rounded-3xl bg-[#F4F7F2] p-6 sm:p-9 lg:bg-transparent lg:p-0 lg:pb-2">
              <Tile icon={PenLine} size="lg" />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#164D20] sm:text-3xl">Share your story</h2>
              <p className="mt-2 text-base leading-relaxed text-gray-600">Every edition gives stakeholders space to share their views. Contributors, retirees, employers and operators can suggest a story or a commentary for the next issue.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/connect#contact" className={cn(goldBtn, "group")}>
                  Suggest a story
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <Link to="/news" className={outlineBtn}>Latest news</Link>
              </div>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}
