"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Award, BookOpen, Check, Download, Feather, Lock, Mail, Megaphone, MessageSquareQuote, Mic,
  Newspaper, PenLine, Sparkles, TrendingUp, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/views/about/primitives";
import { Crumbs, DarkBackdrop, EyebrowPill, Rise, SectionNav, ease, focus, sectionCls } from "@/views/theme/ui";
import { SectionHeading } from "@/views/theme/heading";
import { previewPages } from "./PreviewPages";
import { awards, issue, launchSource, sections, shelf } from "./data";

/**
 * PenCom Chronicles, the Commission's magazine (brief §7 "Publications listing and detail": cover, abstract, period,
 * download; questionnaire: news and media centre, easy sharing). No on-page reader: "Read the issue" opens the
 * PDF from /public/magazine in a new tab, and "Download PDF" links to the copy on pencom.gov.ng.
 * The serif masthead is the theme's one deliberate exception to its sans titles (light, on cream).
 */

/** The calm card: white, thin ring; on hover it lifts 4 px, gets a green ring and a soft green shadow. */
const calmCard =
  "group relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]";
/** Large gold primary and green outline buttons. */
const goldBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] shadow-[0_14px_30px_-18px_rgba(122,82,0,0.8)] transition hover:bg-[#FFE08F]";
const outlineBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white";
/** Dark-green icon tile with a gold icon that tips on hover. */
const iconTile =
  "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition duration-300 group-hover:-rotate-6";

/* ─────────────────────────── Cover ─────────────────────────── */

/** The issue cover in a frame with an offset gold outline; it rises in once and lifts gently on hover (no 3D, no sparkles). */
function CoverFrame() {
  const W = 300;
  const H = Math.round(W * (594 / 420));
  return (
    <div className="relative mx-auto flex items-center justify-center py-6 sm:py-8">
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8F5E9] blur-3xl" />
      <a
        href={issue.localPdf}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("group relative block rounded-2xl transition duration-500 hover:-translate-y-1", focus)}
        style={{ width: W, maxWidth: "100%" }}
      >
        <span className="sr-only">Read the issue (PDF, opens in a new tab)</span>
        {/* offset gold outline behind the cover */}
        <span aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl ring-2 ring-[#CB9615]/70 transition duration-500 group-hover:translate-x-4 group-hover:translate-y-4" />
        <span aria-hidden="true" className="relative block overflow-hidden rounded-2xl bg-white shadow-[0_34px_60px_-30px_rgba(10,74,19,0.6)] ring-1 ring-black/10" style={{ aspectRatio: `${W} / ${H}` }}>
          <span className="pointer-events-none absolute left-0 top-0 block" style={{ width: 420, height: 594, transform: `scale(${W / 420})`, transformOrigin: "top left" }}>{previewPages[0].node}</span>
        </span>
      </a>
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

const nav = [
  { id: "inside", label: "What’s inside" },
  { id: "launch", label: "The launch" },
  { id: "issues", label: "All issues" },
  { id: "subscribe", label: "Get new issues" },
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
      <div className="bg-[#FBF8F1] text-[#14261A]">
        <Hero />
        <SectionNav sections={nav} pillId="mag-nav-pill" />
        <Inside />
        <Launch />
        <Issues />
        <Subscribe />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Masthead (light, serif) ─────────────────────────── */

function Hero() {
  const reduce = useReducedMotion();
  const up = (delay: number, y = 16) => ({
    initial: { opacity: 0, y: reduce ? 0 : y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  });
  return (
    <section aria-labelledby="mag-title" className="relative isolate overflow-hidden bg-[#FBF8F1] text-[#14261A]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#E8F5E9] blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-14 pt-8 sm:pt-10 lg:grid-cols-12 lg:gap-12 lg:pb-20">
        <div className="lg:col-span-7">
          <Crumbs crumbs={[{ label: "Home", to: "/" }, { label: "Resources", to: "/resources#publications" }, { label: "PenCom Chronicles" }]} />
          <motion.div {...up(0, 12)} className="mt-7">
            <EyebrowPill icon={Sparkles} label={<>New · Issue 01 · {issue.date}</>} />
          </motion.div>
          <h1 id="mag-title" data-no-translate className="mt-6 font-serif text-6xl font-bold leading-[0.98] tracking-tight sm:text-7xl lg:text-[5.25rem]">
            <motion.span {...up(0.08, 24)} className="inline-block text-[#0A4A13]">PenCom</motion.span>
            <br />
            <motion.span {...up(0.22, 24)} className="relative inline-block pb-2 pr-3 italic">
              <span className="bg-gradient-to-r from-[#117F21] via-[#2E913D] to-[#9A6B00] bg-clip-text pr-1 text-transparent">Chronicles</span>
              <svg aria-hidden="true" viewBox="0 0 300 16" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-3.5 w-full overflow-visible">
                <motion.path d="M3 11 C 70 3, 190 2, 297 8" fill="none" stroke="#CB9615" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.7, ease: [0.65, 0, 0.35, 1] }} />
              </svg>
            </motion.span>
          </h1>
          <motion.p {...up(0.35)} className="mt-8 max-w-xl text-lg leading-relaxed text-gray-700 sm:text-xl">
            The Commission’s magazine: news, interviews, industry updates, human-interest stories, features and commentaries on Nigeria’s pension system.
          </motion.p>
          <motion.div {...up(0.45)} className="mt-8 flex flex-wrap gap-3">
            <a href={issue.localPdf} target="_blank" rel="noopener noreferrer" className={cn(goldBtn, focus)}>
              <BookOpen className="h-5 w-5" aria-hidden="true" /> Read the issue<span className="sr-only"> (PDF, opens in a new tab)</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer" className={cn(outlineBtn, focus)}>
              <Download className="h-5 w-5" aria-hidden="true" /> Download PDF<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </motion.div>
          <motion.dl {...up(0.55)} className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[["Published", issue.date], ["Launched", issue.launched], ["Publisher", "Corporate Communications"]].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <dt className="text-sm font-bold uppercase tracking-[0.14em] text-[#7A5200]">{k}</dt>
                <dd className="mt-1 text-lg font-bold leading-snug text-[#14261A]">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <motion.div {...up(0.2, 24)} className="lg:col-span-5"><CoverFrame /></motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── What's inside ─────────────────────────── */

function Inside() {
  return (
    <section id="inside" aria-labelledby="inside-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="inside-title" eyebrow="Every edition" title="What you’ll find inside" highlight="inside" intro="Two editorial sections, with space in every edition for stakeholders to share their views." />
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s, i) => {
            const Icon = [Newspaper, Mic, TrendingUp, Users, Feather, MessageSquareQuote][i];
            return (
              <motion.li key={s.k} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.55, delay: (i % 3) * 0.07, ease }}>
                <div className={cn(calmCard, "h-full p-7")}>
                  <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />
                  <span aria-hidden="true" className={iconTile}><Icon className="h-6 w-6" /></span>
                  <h3 className="relative mt-5 text-xl font-bold tracking-tight">{s.k}</h3>
                  <p className="relative mt-2 text-lg leading-relaxed text-gray-700">{s.body}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── The launch (the page's one green inset panel) ─────────────────────────── */

function Launch() {
  return (
    <section id="launch" aria-labelledby="launch-title" className={cn("bg-[#FBF8F1]", sectionCls)}>
      <div className="relative isolate mx-auto grid max-w-7xl grid-cols-1 gap-12 overflow-hidden rounded-[2rem] px-5 py-10 text-white sm:p-10 lg:grid-cols-12 lg:p-14">
        <DarkBackdrop />
        <div className="lg:col-span-6">
          <SectionHeading stacked id="launch-title" dark eyebrow="The launch" title="Launched in Lagos, October 2026" highlight="October 2026" />
          <Rise>
            <figure className="relative mt-8 rounded-3xl bg-white/[0.07] p-7 ring-1 ring-white/10 sm:p-8">
              <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4D27A] text-[#1A1206]"><MessageSquareQuote className="h-6 w-6" /></span>
              <blockquote className="mt-5 font-serif text-2xl italic leading-snug text-white sm:text-3xl">
                The beginning of a platform through which PenCom will tell its story.
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-base text-white/85">
                <span aria-hidden="true" className="h-0.5 w-8 shrink-0 rounded-full bg-[#F4D27A]" />
                <span>Omolola Oloworaran, Director-General, at the launch on {issue.launched}</span>
              </figcaption>
            </figure>
          </Rise>
          <p className="mt-6 text-lg leading-relaxed text-white/85">The Director-General said the magazine would help close gaps in public understanding of the pension sector and set the editorial and digital direction for future editions.</p>
          <a href={launchSource.url} target="_blank" rel="noopener noreferrer" className={cn(goldBtn, "mt-7", focus)}>
            Read NAN’s report of the launch<span className="sr-only">(opens in a new tab)</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>
        <div className="lg:col-span-6 lg:pt-24">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#F4D27A]">
            <Award className="h-5 w-5" aria-hidden="true" /> PenCom Media Excellence Awards 2026
          </p>
          <p className="mt-2 text-lg leading-relaxed text-white/85">Presented at the launch to journalists whose reporting helps Nigerians understand their pensions.</p>
          <ul className="mt-6 space-y-3">
            {awards.map((a, i) => {
              const Icon = a.cat === "Online" ? Megaphone : a.cat === "Print" ? Newspaper : Mic;
              return (
                <motion.li key={a.cat} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: i * 0.1, ease }}>
                  <div className="flex items-center gap-5 rounded-3xl bg-white/[0.07] p-5 ring-1 ring-white/10">
                    <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F4D27A] text-[#1A1206] ring-4 ring-[#F4D27A]/25"><Icon className="h-6 w-6" /></span>
                    <span>
                      <span className="block text-sm font-bold uppercase tracking-[0.16em] text-[#F4D27A]">{a.cat}</span>
                      <span className="block text-xl font-bold tracking-tight">{a.name}</span>
                      {a.outlet && <span className="block text-base text-white/80">{a.outlet}</span>}
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Issues shelf ─────────────────────────── */

function Issues() {
  return (
    <section id="issues" aria-labelledby="issues-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="issues-title" eyebrow="Archive" title="All issues" highlight="issues" />
        <ul className="mt-12 flex flex-wrap items-start gap-8 sm:gap-10">
          {shelf.map((s, i) => (
            <motion.li key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease }} className="w-48">
              {s.live ? (
                <a href={issue.localPdf} target="_blank" rel="noopener noreferrer" className={cn("group block rounded-2xl", focus)}>
                  <span className="relative block h-[272px] w-48 overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-[0_18px_36px_-22px_rgba(10,74,19,0.55)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.6)] group-hover:ring-2 group-hover:ring-[#117F21]">
                    <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 block" style={{ width: 420, height: 594, transform: `scale(${192 / 420})`, transformOrigin: "top left" }}>{previewPages[0].node}</span>
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-xl font-bold tracking-tight transition group-hover:text-[#117F21]">
                    {s.label}
                    <ArrowRight className="h-5 w-5 text-[#117F21] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                  <span className="block text-base text-gray-700">{s.date} · Read now</span>
                </a>
              ) : (
                <div aria-label={`${s.label}, coming soon`}>
                  <span className="flex h-[272px] w-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#14261A]/25 bg-[#FBF8F1] text-center text-gray-700">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A]"><Lock className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="mt-3 text-base font-semibold">Next edition</span>
                  </span>
                  <span className="mt-4 block text-xl font-bold tracking-tight text-gray-700">{s.label}</span>
                  <span className="block text-base text-gray-700">{s.date}</span>
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
    <section id="subscribe" aria-labelledby="sub-title" className={cn("bg-[#FBF8F1]", sectionCls)}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
        <Rise className="h-full">
          <div className="relative h-full overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_30px_60px_-40px_rgba(10,74,19,0.5)] ring-1 ring-black/10 sm:p-10">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
            <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A]"><Mail className="h-6 w-6" /></span>
            <h2 id="sub-title" className="mt-5 text-3xl font-bold tracking-tight">Get new issues by email</h2>
            <p className="mt-2 text-lg leading-relaxed text-gray-700">We’ll email you when a new edition of PenCom Chronicles is published. Nothing else.</p>
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.p key="ok" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-3 rounded-2xl bg-[#E8F5E9] p-4 text-lg font-semibold text-[#0A4A13] ring-1 ring-[#117F21]/20">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#117F21] text-white"><Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></span>
                  Thank you. We’ll let you know when Issue 02 is out.
                </motion.p>
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="sub-email" className="block text-lg font-semibold text-[#14261A]">Email address</label>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
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
                          "min-h-14 flex-1 rounded-2xl border-2 bg-white px-4 text-lg text-[#14261A] placeholder:text-gray-500 focus:border-[#117F21] focus:outline-none focus:ring-[3px] focus:ring-[#FFD84D]",
                          errField === "email" ? "border-[#B52026]" : "border-gray-400",
                        )}
                      />
                      <button type="submit" className={cn(goldBtn, focus)}>
                        Notify me
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl p-3 text-lg leading-relaxed text-gray-700 transition", errField === "consent" ? "bg-[#FDECEC] ring-2 ring-[#B52026]" : "bg-[#F1EFE8]")}>
                    <input
                      ref={box}
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      aria-invalid={errField === "consent"}
                      aria-describedby={errField === "consent" ? "sub-err" : undefined}
                      className={cn("mt-1 h-7 w-7 shrink-0 rounded accent-[#117F21]", focus)}
                    />
                    <span>I agree that PenCom may use my email address to tell me about new issues. I can unsubscribe at any time. <Link to="/regulations#policies" className={cn("rounded font-semibold text-[#0A4A13] underline underline-offset-4", focus)}>Privacy notice</Link></span>
                  </label>
                  {err && <p id="sub-err" role="alert" className="rounded-2xl border-l-4 border-[#B52026] bg-[#FDECEC] px-4 py-3 text-lg font-semibold text-[#8A1419]">{err}</p>}
                  <p className="text-base text-gray-700">Prototype: no email is sent yet.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Rise>

        <Rise delay={0.1} className="h-full">
          <div className="group relative h-full overflow-hidden rounded-[2rem] bg-[#F1EFE8] p-7 sm:p-10">
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#E8F5E9] transition-transform duration-700 group-hover:scale-125" />
            <span aria-hidden="true" className={iconTile}><PenLine className="h-6 w-6" /></span>
            <h2 className="relative mt-5 text-3xl font-bold tracking-tight">Share your story</h2>
            <p className="relative mt-2 text-lg leading-relaxed text-gray-700">Every edition gives stakeholders space to share their views. Contributors, retirees, employers and operators can suggest a story or a commentary for the next issue.</p>
            <div className="relative mt-7 flex flex-wrap gap-3">
              <Link to="/connect#contact" className={cn(goldBtn, focus)}>
                Suggest a story
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link to="/news" className={cn(outlineBtn, focus)}>Latest news</Link>
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}
