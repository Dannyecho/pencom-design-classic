"use client";

import { splitReq } from "./splitReq";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Award, Check, ChevronDown, Clock, Download, Eye, HeartHandshake, Lightbulb, MessageSquareWarning,
  Phone, Printer, Quote, Scale, Search, ShieldCheck, Sparkles, X, Zap, type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "@/lib/router";
import { cn } from "@/lib/utils";
import { CountUp, GridBackdrop, Spotlight, Tilt, scrollToId } from "@/views/about/primitives";
import Headline from "@/views/theme/Headline";
import { DocBanner, DocTools, PdfCard, ReadingBar, Toc, VerifyNote, sizes } from "@/views/docs/kit";
import { DarkBand, EyebrowPill, FloatingBar, Rise, TabStrip, Tile, ease, featured, focus, goldBtn, outlineBtn, outlineDarkBtn, sectionCls } from "@/views/theme/ui";
import data from "./charter.json";

/**
 * Service Charter / Service Level Agreement, classic theme (DES-22: important documents as web pages
 * with the signed PDF attached; brief §6.2 About: "Service Charter (HTML + signed PDF)"). A document page: dark
 * DocBanner, an "At a glance" card rising over it, the service standards as a filterable list-panel table, the
 * complaint steps as the page's one dark band, our promise, and the full text beside a sticky contents list with
 * text size, print and the signed PDF. The text comes from the revised charter (May 2026) and stays English.
 */

type Block = { m?: string; x: string; sub?: boolean };
type Std = { division: string; dept: string; sn: number; service: string; time: string; req: string };
type Charter = { foreword: string; forewordList: string[]; sections: { n: number; title: string; blocks: Block[] }[]; standards: Std[] };
const charter = data as Charter;

const PDF = "/documents/service-charter-2026.pdf";

const onThisPage = [
  { id: "standards", label: "Service standards", icon: Clock },
  { id: "complaints", label: "Complaints", icon: MessageSquareWarning },
  { id: "promise", label: "Our promise", icon: HeartHandshake },
  { id: "full-text", label: "Full charter", icon: Scale },
];

/** Short badge for the time standard: "5d", "4h" … */
function badge(t: string) {
  const m = t.match(/(\d+)\s*(?:to\s*(\d+))?\s*(working days|days|hours)/i);
  if (!m) return "—";
  const v = Number(m[2] ?? m[1]);
  return /hour/i.test(m[3]) ? `${v}h` : `${v}d`;
}

/** Highlight the search words in a piece of text. */
function Mark({ text, q }: { text: string; q: string }) {
  const t = q.trim();
  if (t.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === t.toLowerCase() ? (
          <mark key={i} className="rounded bg-[#FFE38A] px-0.5 text-inherit">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function printChecklist(s: Std) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  const esc = (x: string) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const items = splitReq(s.req).map((r) => `<li><span class="box"></span>${esc(r)}</li>`).join("");
  w.document.write(
    `<!doctype html><title>${esc(s.service)} – checklist</title><style>body{font:16px/1.6 Arial;margin:40px;color:#111}h1{font:bold 22px Verdana;color:#105D1D;margin:0 0 4px}p{margin:0 0 16px;color:#444}ul{list-style:none;padding:0}li{display:flex;gap:12px;margin:0 0 12px}.box{flex:none;width:18px;height:18px;border:2px solid #14892A;border-radius:4px;margin-top:3px}footer{margin-top:32px;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:8px}</style><h1>${esc(s.service)}</h1><p>${esc(s.dept)} · Service standard: ${esc(s.time || "see charter")}</p><ul>${items}</ul><footer>National Pension Commission · Service Charter (revised May 2026) · pencom.gov.ng</footer>`,
  );
  w.document.close();
  w.focus();
  w.print();
}

export default function CharterPage() {
  const { hash } = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const t1 = window.setTimeout(() => scrollToId(id, !reduce), 80);
    const t2 = window.setTimeout(() => scrollToId(id, false), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hash, reduce]);

  return (
    <MotionConfig reducedMotion="user">
      <ReadingBar />
      <div className="bg-white text-[#164D20]">
        <Hero />
        <TabStrip sections={onThisPage} pillId="charter-nav-pill" />
        <Standards />
        <Complaints />
        <OurPromise />
        <FullText />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Banner + at a glance ─────────────────────────── */

function Hero() {
  const depts = new Set(charter.standards.map((s) => s.dept)).size;
  return (
    <>
      <DocBanner
        crumbs={[{ label: "Home", to: "/" }, { label: "About", to: "/about" }, { label: "Service Charter" }]}
        kind="Service Charter · Revised May 2026"
        icon={<HeartHandshake />}
        title="Service you can measure"
        floating
        lead="What you can expect from the Commission: how quickly we deliver each service, the documents you need, how to complain, and what we expect from you."
        actions={
          <>
            <a href={PDF} target="_blank" rel="noopener noreferrer" className={cn(goldBtn, "group")}>
              <Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
              Signed PDF
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <Link to="/connect" className={outlineDarkBtn}>
              <MessageSquareWarning className="h-5 w-5" aria-hidden="true" />
              Make a complaint
            </Link>
          </>
        }
        meta={[
          { label: "Services covered", value: String(charter.standards.length) },
          { label: "Departments", value: String(depts) },
          { label: "Version", value: "Revised, May 2026" },
          { label: "Signed by", value: "Director-General" },
        ]}
      />
      <FloatingBar eyebrow="At a glance">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 sm:grid-cols-3">
            {[
              { v: "2", u: "working days", l: "for most benefit approvals", count: true },
              { v: "3–5", u: "working days", l: "to resolve a complaint", count: false },
              { v: "72", u: "hours", l: "to issue a PCC", count: true },
            ].map((f) => (
              <div key={f.l} className="group flex items-center gap-4 bg-white p-4 transition hover:bg-[#F7FAF6] sm:block sm:p-5">
                <dt className="sr-only">{f.l}</dt>
                <dd className="flex items-center gap-4 sm:block">
                  <span className="block w-28 shrink-0 sm:w-auto">
                    <span className="block text-4xl font-bold tracking-tight text-[#105D1D]">{f.count ? <CountUp value={f.v} /> : <span className="tabular-nums">{f.v}</span>}</span>
                    <span className="mt-1 block text-sm font-semibold text-[#7A5200]">{f.u}</span>
                  </span>
                  <span className="block text-base leading-snug text-gray-600 sm:mt-3">{f.l}</span>
                </dd>
              </div>
            ))}
          </dl>
      </FloatingBar>
    </>
  );
}

/* ─────────────────────────── Service standards (list-panel table) ─────────────────────────── */

const cols = "md:grid md:grid-cols-[minmax(0,1fr)_13rem_13rem_2.75rem] md:items-center md:gap-5";

function StandardRow({ s, q, open, onToggle }: { s: Std; q: string; open: boolean; onToggle: () => void }) {
  const reqs = splitReq(s.req);
  const panelId = `std-${s.sn}-${s.dept.length}-${s.service.length}`;
  return (
    <li className={cn("transition-colors", open && "bg-[#F7FAF6]")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn("group flex w-full items-start gap-4 px-4 py-4 text-left transition hover:bg-[#F7FAF6] sm:px-6", cols, "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]")}
      >
        <span className="flex min-w-0 flex-1 items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#11421A] text-[#F4D27A] shadow-[0_12px_24px_-12px_rgba(17,66,26,0.9)] transition-transform duration-300 group-hover:rotate-6"
          >
            <Clock className="h-4 w-4" />
            <span className="mt-0.5 text-xs font-bold tabular-nums leading-none">{badge(s.time)}</span>
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold leading-snug text-[#164D20] group-hover:text-[#117F21]">
              <Mark text={s.service} q={q} />
            </span>
            <span className="mt-1 block text-sm text-gray-600 md:hidden">{s.dept}</span>
            {s.time && (
              <span className="mt-2 inline-flex items-start gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-[#105D1D] md:hidden">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="line-clamp-2">{s.time}</span>
              </span>
            )}
          </span>
        </span>
        <span className="hidden text-sm leading-snug text-gray-600 md:block">{s.dept}</span>
        <span className="hidden text-sm font-semibold leading-snug text-[#105D1D] md:line-clamp-3">{s.time || "—"}</span>
        <span
          aria-hidden="true"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-300",
            open ? "rotate-180 bg-[#14892A] text-white" : "bg-[#E8F5E9] text-[#117F21] group-hover:bg-[#14892A] group-hover:text-white",
          )}
        >
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={panelId} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
            <div className="px-4 pb-6 sm:px-6 md:pl-[5.5rem]">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 pl-6 sm:p-6 sm:pl-7">
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#14892A] to-[#CB9615]" />
                {s.time && (
                  <p className="mb-4 flex gap-2 text-base font-semibold text-[#105D1D]">
                    <Clock className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    {s.time}
                  </p>
                )}
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">What you need</p>
                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 lg:grid-cols-2">
                  {reqs.map((r, k) => (
                    <li key={k} className="flex gap-3 text-base leading-relaxed text-gray-700">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#117F21]">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span>
                        <Mark text={r} q={q} />
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => printChecklist(s)} className={goldBtn}>
                    <Printer className="h-5 w-5" aria-hidden="true" />
                    Print this checklist
                  </button>
                  <Link to="/connect" className={cn(outlineBtn, "group")}>
                    Ask about this service
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Short forms people type that the charter spells out. */
const aliases: Record<string, string[]> = { pcc: ["pension clearance certificate"] };

function Standards() {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [dept, setDept] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const depts = useMemo(() => ["All", ...Array.from(new Set(charter.standards.map((s) => s.dept)))], []);
  const list = useMemo(() => {
    const t = dq.trim().toLowerCase();
    const terms = [t, ...(aliases[t] ?? [])];
    return charter.standards
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => (dept === "All" || s.dept === dept) && (!t || terms.some((w) => `${s.service} ${s.req} ${s.dept}`.toLowerCase().includes(w))));
  }, [dq, dept]);
  const filtered = !!dq || dept !== "All";
  const visible = showAll || filtered ? list : list.slice(0, 8);

  return (
    <section id="standards" aria-labelledby="std-title" className={sectionCls}>
      <div className="mx-auto max-w-7xl">
        <Headline id="std-title" kicker="Service standards" title="How long each service takes" mark="each service" intro="Find a service to see its timeline and the documents you need. Print the list and take it with you." />
        <div className="mt-10 flex flex-col gap-3 rounded-3xl bg-[#F4F7F2] p-3 sm:flex-row sm:p-4">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 transition focus-within:border-[#14892A] focus-within:ring-2 focus-within:ring-[#14892A]/30">
            <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
            <span className="sr-only">Find a service</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “death benefits”, “25%”, “mortgage”, “PCC”" className="w-full min-w-0 bg-transparent text-base placeholder:text-gray-500 focus:outline-none" />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search" className={cn("-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-[#E8F5E9]", focus)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </label>
          <label className="relative sm:w-80">
            <span className="sr-only">Department</span>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className={cn("min-h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-11 text-base font-semibold text-[#164D20] transition hover:border-[#14892A]", focus)}>
              {depts.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All departments" : d}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
          </label>
        </div>
        <p className="mt-4 px-1 text-base font-semibold text-gray-600" aria-live="polite">
          {list.length} {list.length === 1 ? "service" : "services"}
          {dept !== "All" && ` in ${dept}`}
        </p>

        {list.length > 0 ? (
          <Spotlight className="mt-4 rounded-3xl border border-gray-200/80 bg-white">
            <div aria-hidden="true" className={cn("hidden border-b border-gray-200 bg-[#F4F7F2]/80 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-600 md:grid", cols)}>
              <span className="pl-16">Service</span>
              <span>Department</span>
              <span>Time standard</span>
              <span />
            </div>
            <ul className="divide-y divide-gray-100">
              {visible.map(({ s, i }) => (
                <StandardRow key={i} s={s} q={dq} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
              ))}
            </ul>
          </Spotlight>
        ) : (
          <div className="mt-4 rounded-3xl border border-gray-200/80 bg-[#F4F7F2] px-6 py-12 text-center">
            <p className="text-xl font-bold">No service matches</p>
            <button type="button" onClick={() => { setQ(""); setDept("All"); }} className={cn(outlineBtn, "mt-5")}>
              Clear search
            </button>
          </div>
        )}
        {!showAll && !filtered && list.length > 8 && (
          <div className="mt-8 text-center">
            <button type="button" onClick={() => setShowAll(true)} className={cn(outlineBtn, "group")}>
              Show all {list.length} services
              <ChevronDown className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────── Complaints (the page's dark band) ─────────────────────────── */

function Complaints() {
  const reduce = useReducedMotion();
  const steps = [
    ["Day 1", "We acknowledge your complaint", "By email, phone, letter, walk-in or social media."],
    ["Days 2–3", "We resolve it and reply", "Most complaints are closed within 3 to 5 working days."],
    ["Fair hearing", "We hear both sides", "We get the response of the party you complained about before we decide."],
    ["Still unhappy?", "Take it further", "You can refer the Commission’s decision to arbitration or the National Industrial Court."],
  ];
  return (
    <DarkBand id="complaints" labelledBy="cmp-title" className="scroll-mt-[170px]">
      <Headline id="cmp-title" kicker="If something goes wrong" title="Complaints and disputes" mark="disputes" intro="How we handle a complaint, and what you can do if you are still not satisfied." dark />
      <div className="relative mt-12">
        {/* The gold line that joins the step chips (desktop: across; phone: down the left). */}
        <motion.span
          aria-hidden="true"
          initial={{ scaleX: reduce ? 1 : 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.4, ease }}
          className="absolute left-7 right-[12.5%] top-7 hidden h-0.5 origin-left bg-gradient-to-r from-[#CB9615] via-[#F4D27A] to-[#CB9615]/40 xl:block"
        />
        <motion.span
          aria-hidden="true"
          initial={{ scaleY: reduce ? 1 : 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.4, ease }}
          className="absolute bottom-10 left-7 top-7 w-0.5 origin-top bg-gradient-to-b from-[#CB9615] via-[#F4D27A] to-[#CB9615]/30 md:hidden"
        />
        <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([k, t, b], i) => (
            <li key={k}>
              <Rise delay={i * 0.12} className="group flex h-full gap-5 md:block">
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F4D27A] to-[#CB9615] text-2xl font-black text-[#1A1206] shadow-[0_0_0_6px_#11421A,0_16px_30px_-12px_rgba(203,150,21,0.7)] transition-transform duration-300 group-hover:-rotate-6"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#F4D27A]/40 md:mt-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A]">
                    <span className="sr-only">Step {i + 1}: </span>
                    {k}
                  </p>
                  <p className="mt-1.5 text-xl font-bold leading-snug">{t}</p>
                  <p className="mt-2 text-base leading-relaxed text-white/80">{b}</p>
                </div>
              </Rise>
            </li>
          ))}
        </ol>
      </div>
      <div className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a href="tel:+2342094603955" className={cn("group flex min-h-20 items-center gap-4 rounded-3xl border border-white/15 bg-white/[0.06] p-5 text-white transition duration-300 hover:-translate-y-0.5 hover:border-[#F4D27A]/60", focus)}>
          <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#F4D27A] transition-transform duration-300 group-hover:rotate-6">
            <Phone className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm text-white/80">0700 CALL PENCOM</span>
            <span className="block text-xl font-bold tabular-nums">02094603955</span>
          </span>
        </a>
        <Link to="/connect" className={cn("group flex min-h-20 items-center justify-between gap-4 rounded-3xl bg-[#CB9615] p-5 text-lg font-bold text-[#1A1206] shadow-[0_20px_40px_-20px_rgba(203,150,21,0.9)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E0AA22]", focus)}>
          <span className="flex items-center gap-4">
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1A1206]/10">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Complain online and track your case
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </DarkBand>
  );
}

/* ─────────────────────────── Our promise ─────────────────────────── */

/** An icon for each core value (by its English name in the charter). */
const valueIcon: Record<string, LucideIcon> = {
  Transparency: Eye,
  Responsiveness: Zap,
  Integrity: Scale,
  Proactivity: Lightbulb,
  Professionalism: Award,
  Empathy: HeartHandshake,
};

function OurPromise() {
  const mission = charter.sections.find((s) => s.n === 3)?.blocks[0]?.x;
  const values = charter.sections.find((s) => s.n === 4)?.blocks.filter((b) => b.sub) ?? [];
  return (
    <section id="promise" aria-labelledby="promise-title" className={cn(sectionCls, "bg-gradient-to-b from-white via-[#F4F7F2] to-white")}>
      <div className="mx-auto max-w-7xl">
        <Headline id="promise-title" kicker="Our promise" title="The values behind every service" mark="every service" />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {mission && (
            <Rise className="lg:col-span-5">
              <Tilt className="h-full">
                <div className={cn(featured, "h-full p-7 shadow-[0_40px_80px_-40px_rgba(17,66,26,0.7)] sm:p-10")}>
                  <GridBackdrop className="opacity-60" />
                  <span aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-[#CB9615]/25 blur-3xl" />
                  <Quote aria-hidden="true" className="absolute right-6 top-6 h-16 w-16 text-[#F4D27A]/25" />
                  <EyebrowPill icon={Sparkles} label="Our mission" dark />
                  <p className="relative mt-6 text-2xl font-bold leading-snug tracking-tight sm:text-[1.75rem]">{mission}</p>
                  <span aria-hidden="true" className="relative mt-6 block h-1 w-16 rounded-full bg-gradient-to-r from-[#F4D27A] to-[#CB9615]" />
                </div>
              </Tilt>
            </Rise>
          )}
          <Rise delay={0.08} className="lg:col-span-7">
            <Spotlight className="h-full rounded-3xl border border-gray-200/80 bg-white">
              <ul className="grid h-full grid-cols-1 sm:grid-cols-2">
                {values.map((v) => {
                  const [k, ...rest] = v.x.split(":");
                  const Icon = valueIcon[k.trim()] ?? Sparkles;
                  return (
                    <li key={k} className="group flex gap-4 border-b border-gray-100 p-5 transition last:border-b-0 hover:bg-[#F7FAF6]/70 sm:p-6 sm:odd:border-r sm:[&:nth-last-child(2)]:border-b-0">
                      <Tile icon={Icon} />
                      <span className="min-w-0">
                        <span className="block text-lg font-bold text-[#164D20]">{k}</span>
                        <span className="mt-1 block text-base leading-relaxed text-gray-600">{rest.join(":").trim()}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Spotlight>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Full charter ─────────────────────────── */

/** Charter sections shown as running text (mission, values and the standards table have their own sections). */
const narrative = charter.sections.filter((s) => ![3, 4, 10].includes(s.n));
const tocItems = narrative.map((s) => ({ id: `c-${s.n}`, label: `${s.n}. ${s.title}` }));

function FullText() {
  const [size, setSize] = useState(0);
  return (
    <section id="full-text" aria-labelledby="full-title" className={cn(sectionCls, "pb-24")}>
      <div className="mx-auto max-w-7xl">
        <Headline
          id="full-title"
          kicker="Read the charter"
          title="The full charter"
          mark="full charter"
          action={
            <a href={PDF} target="_blank" rel="noopener noreferrer" className={cn(outlineBtn, "group")}>
              <Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
              Signed PDF
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          <aside className="lg:col-span-4 xl:col-span-3 print:hidden">
            <div className="space-y-4 lg:sticky lg:top-[170px]">
              <Toc items={tocItems} title="Charter contents" className="hidden lg:block" />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-3 pl-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">Text size</span>
                <DocTools size={size} setSize={setSize} />
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-6 lg:col-span-8 xl:col-span-9">
            <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_30px_60px_-40px_rgba(16,93,29,0.4)] sm:p-10" style={{ fontSize: sizes[size] }}>
              <div className="relative overflow-hidden rounded-2xl bg-[#F4F7F2] p-5 pl-7 sm:p-7 sm:pl-9">
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#14892A] to-[#CB9615]" />
                <p className="inline-flex items-center rounded-full bg-[#11421A] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A]">Foreword</p>
                <p className="mt-3 leading-[1.75] text-gray-700">{charter.foreword.split(" the provision")[0]}</p>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {charter.forewordList.map((f) => (
                    <li key={f} className="flex gap-2 text-gray-700">
                      <Check className="mt-1.5 h-4 w-4 shrink-0 text-[#117F21]" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-bold text-[#105D1D]">Omolola Bridget Oloworaran, Director-General</p>
              </div>
              <div className="mt-10 divide-y divide-gray-100">
                {narrative.map((s) => (
                  <section key={s.n} id={`c-${s.n}`} aria-labelledby={`c-${s.n}-h`} className="scroll-mt-[170px] py-8 first:pt-0 last:pb-0">
                    <h3 id={`c-${s.n}-h`} className="flex items-start gap-3 text-[1.25em] font-bold leading-snug tracking-tight text-[#164D20]">
                      <span className="mt-0.5 flex h-8 min-w-[2rem] shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] px-1.5 text-[0.7em] tabular-nums text-[#117F21]">{s.n}.0</span>
                      {s.title}
                    </h3>
                    <div className="mt-3 space-y-3">
                      {s.blocks.map((b, i) => (
                        <p key={i} className={cn("leading-[1.75] text-gray-700", b.sub ? "pl-14" : b.m ? "pl-12" : "")}>
                          {b.m && <span className={cn("-ml-12 inline-block w-12 text-[0.9em] font-bold", b.sub ? "-ml-8 w-8 text-gray-600" : "text-[#117F21]")}>{b.m}</span>}
                          {b.x}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <PdfCard href={PDF} title="Revised Commission’s Service Charter / Service Level Agreement" meta="PDF · 46 pages · May 2026" />
              <VerifyNote>This web version is for easy reading. If it differs from the signed PDF, the signed PDF is the official version.</VerifyNote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
