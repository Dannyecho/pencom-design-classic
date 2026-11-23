"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Check, Clock, Landmark, MapPin, Navigation, Phone, Search, Video, Mic, Newspaper, Image as ImageIcon, Megaphone } from "lucide-react";
import { latestNews } from "@/lib/data";
import { newsPath } from "@/views/news/data";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/views/about/primitives";
import { DarkBand, Rise, Tile, card, ease, focus, goldBtn, outlineBtn } from "@/views/theme/ui";
import { SectionHeading } from "@/views/theme/heading";
import { abuja, allStates, headOffice, offices, social, topics } from "./data";
import { loadCases } from "./CaseForm";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const moveArrow = "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1";
/** Sections inside the portal grid: grey rule between them, scroll margin for the header and phone bar. */
const portalSec = "scroll-mt-[150px] border-t border-gray-100 py-14 first:border-t-0 sm:py-16";

/* ─────────────────────────── Case tracker (the page's dark band) ─────────────────────────── */

const STAGES = ["Received", "Assigned to a team", "Under review", "Resolved"];

export function Tracker({ prefill }: { prefill: string | null }) {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<null | { ref: string; stage: number; date: string; topic: string; sample?: boolean } | "none">(null);
  const reduce = useReducedMotion();

  const look = (r: string) => {
    const q = r.trim().toUpperCase();
    if (!q) return;
    if (q === "PC-SAMPLE") {
      setResult({ ref: q, stage: 2, date: new Date(Date.now() - 6 * 864e5).toISOString(), topic: "Complain about a PFA", sample: true });
      return;
    }
    const c = loadCases().find((x) => x.ref === q);
    setResult(c ? { ref: c.ref, stage: 0, date: c.date, topic: topics.find((t) => t.id === c.topic)?.label ?? "" } : "none");
  };

  useEffect(() => {
    if (prefill) {
      setRef(prefill);
      look(prefill);
    }
  }, [prefill]);

  return (
    <DarkBand id="track" labelledBy="track-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <SectionHeading stacked id="track-title" dark eyebrow="Case tracker" title="Track your case" highlight="your case" intro="Enter the reference we gave you. No sign-in needed." />
          <form role="search" onSubmit={(e) => { e.preventDefault(); look(ref); }} className="mt-8">
            <label htmlFor="track-ref" className="block font-semibold text-white">Case reference</label>
            <div className="mt-2 flex flex-col gap-3 rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/15 backdrop-blur sm:flex-row">
              <input
                id="track-ref"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. PC-2611-AB12C"
                autoComplete="off"
                className={cn("min-h-12 w-full min-w-0 flex-1 rounded-xl bg-white px-4 font-mono text-lg uppercase text-[#164D20] placeholder:font-sans placeholder:text-base placeholder:normal-case placeholder:text-gray-600", focus)}
              />
              <button type="submit" className={cn(goldBtn, "shrink-0")}>
                <Search className="h-5 w-5" aria-hidden="true" /> Track
              </button>
            </div>
          </form>
          <p className="mt-5 text-base text-white/85">
            Want to see how it works?{" "}
            <button type="button" onClick={() => { setRef("PC-SAMPLE"); look("PC-SAMPLE"); }} className={cn("inline-flex min-h-11 items-center rounded font-semibold text-[#F4D27A] underline underline-offset-4 hover:text-white", focus)}>Try a sample case</button>
          </p>
        </div>

        <div className="lg:col-span-7" aria-live="polite">
          <AnimatePresence mode="wait">
            {result === null && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
                <div className="flex items-center gap-4">
                  <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F4D27A] to-[#CB9615] text-[#1A1206] shadow-[0_14px_30px_-12px_rgba(203,150,21,0.8)]"><Search className="h-7 w-7" /></span>
                  <p className="text-lg font-semibold text-white">Your case progress will appear here.</p>
                </div>
                <ol className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {STAGES.map((s, i) => (
                    <li key={s} className="rounded-2xl border border-dashed border-white/20 p-4">
                      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-bold text-[#F4D27A]">{i + 1}</span>
                      <span className="mt-3 block text-sm font-semibold leading-snug text-white/85">{s}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
            {result === "none" && (
              <motion.div key="none" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative overflow-hidden rounded-3xl bg-white p-7 pl-8 text-[#164D20] sm:p-8 sm:pl-9">
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B52026]" />
                <p className="text-xl font-bold text-[#B52026]">We couldn’t find that reference.</p>
                <p className="mt-2 text-base text-gray-600">Check it matches the one in your confirmation, including the dashes. Still stuck? Call {headOffice.phone}.</p>
              </motion.div>
            )}
            {result && result !== "none" && (
              <motion.div key={result.ref} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="relative overflow-hidden rounded-3xl bg-white p-6 text-[#164D20] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] sm:p-8">
                <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xl font-bold text-[#105D1D] sm:text-2xl">{result.ref}</p>
                    <p className="mt-1 text-base text-gray-600">{result.topic} · opened {fmt(result.date)}</p>
                  </div>
                  {result.sample && <span className="rounded-full bg-[#F4D27A] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1A1206]">Sample</span>}
                </div>
                {/* Overall progress: grows to the current stage */}
                <div aria-hidden="true" className="mt-6 h-2 overflow-hidden rounded-full bg-gray-100">
                  <motion.span
                    className="block h-full origin-left rounded-full bg-gradient-to-r from-[#14892A] to-[#CB9615]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: (result.stage + 0.5) / STAGES.length }}
                    transition={{ duration: reduce ? 0 : 0.9, delay: 0.15, ease }}
                  />
                </div>
                <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {STAGES.map((s, i) => {
                    const state = i < result.stage ? "done" : i === result.stage ? "now" : "next";
                    return (
                      <motion.li
                        key={s}
                        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.12, ease }}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3 sm:flex-col sm:items-start sm:p-4",
                          state === "now" ? "border-[#CB9615] bg-[#FFF8E1]" : state === "done" ? "border-[#14892A]/25 bg-[#F4F7F2]" : "border-gray-200 bg-white",
                        )}
                      >
                        <span className={cn("relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold", state === "done" ? "bg-[#14892A] text-white" : state === "now" ? "bg-[#CB9615] text-[#1A1206]" : "bg-gray-100 text-gray-700")}>
                          {state === "done" ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> : state === "now" ? <Clock className="h-5 w-5" aria-hidden="true" /> : i + 1}
                          {state === "now" && !reduce && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-xl border-2 border-[#CB9615]/60 [animation-iteration-count:2]" />}
                        </span>
                        <span className="min-w-0">
                          <span className={cn("block font-bold leading-snug", state === "next" && "text-gray-700")}>{s}</span>
                          <span className={cn("block text-sm", state === "now" ? "font-semibold text-[#7A5200]" : "text-gray-600")}>{state === "done" ? "Complete" : state === "now" ? "In progress" : "Not started"}</span>
                        </span>
                      </motion.li>
                    );
                  })}
                </ol>
                {result.sample && <p className="mt-6 rounded-2xl bg-[#F4F7F2] p-4 text-sm text-gray-600">This is example data. Real case statuses will come from PenCom’s case management system.</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DarkBand>
  );
}

/* ─────────────────────────── Zonal offices ─────────────────────────── */

/** Map positions (percent of the map box) from the office data; the route line and the pins share them. */
const px = (x: number) => 8 + x * 0.84;
const py = (y: number) => 6 + y * 0.86;

export function Offices() {
  const [state, setState] = useState("");
  const [sel, setSel] = useState<string>("hq");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!state) return;
    if (state.startsWith("FCT")) setSel("hq");
    else setSel(offices.find((o) => o.states.includes(state))?.id ?? "hq");
  }, [state]);

  const office = offices.find((o) => o.id === sel);
  const info = office
    ? { title: `${office.zone} zonal office`, city: office.city, address: office.address, phone: office.phone, confirm: office.confirm, states: office.states }
    : { title: "Head office", city: "Abuja", address: headOffice.address, phone: headOffice.phone, confirm: false, states: ["FCT (Abuja)", "and anywhere in Nigeria"] };

  const pins = useMemo(() => [{ id: "hq", city: "Abuja", x: abuja.x, y: abuja.y, hq: true }, ...offices.map((o) => ({ id: o.id, city: o.city, x: o.x, y: o.y, hq: false }))], []);

  return (
    <section id="zonal-offices" aria-labelledby="offices-title" className={portalSec}>
      <SectionHeading
        id="offices-title"
        eyebrow="Visit us"
        title="Find your nearest office"
        highlight="nearest office"
        intro="Choose your state and we’ll show you the office that serves it, or pick a pin on the map."
        action={
          <label className="block w-full lg:w-72">
            <span className="text-sm font-semibold text-[#164D20]">I live in</span>
            <select value={state} onChange={(e) => setState(e.target.value)} className={cn("mt-1.5 min-h-12 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 font-semibold text-[#164D20] shadow-sm transition hover:border-[#14892A]", focus)}>
              <option value="">Choose your state</option>
              {allStates.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        }
      />

      <div className="mt-10 grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Map */}
        <Rise className="xl:col-span-7">
          <div className="relative isolate h-full overflow-hidden rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-4 sm:p-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10"
              style={{
                backgroundImage: "linear-gradient(rgba(20,137,42,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(20,137,42,0.07) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
              }}
            />
            <div aria-hidden="true" className="absolute left-[12%] top-[10%] -z-10 h-[78%] w-[76%] rounded-[45%_55%_48%_52%/52%_45%_55%_48%] bg-white shadow-[0_30px_60px_-40px_rgba(16,93,29,0.5)] ring-1 ring-[#14892A]/15" />
            <div className="relative mx-auto aspect-[0.95] w-full max-w-2xl sm:aspect-[1.25]">
              <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="office-route" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#CB9615" />
                    <stop offset="100%" stopColor="#14892A" />
                  </linearGradient>
                </defs>
                {office && (
                  <motion.path
                    key={office.id}
                    d={`M ${px(abuja.x)} ${py(abuja.y)} L ${px(office.x)} ${py(office.y)}`}
                    fill="none"
                    stroke="url(#office-route)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: reduce ? 1 : 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease }}
                  />
                )}
              </svg>
              <ul className="absolute inset-0" aria-label="Office locations">
                {pins.map((p) => {
                  const on = sel === p.id;
                  return (
                    <li key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${px(p.x)}%`, top: `${py(p.y)}%` }}>
                      <button type="button" onClick={() => setSel(p.id)} aria-pressed={on} className="group relative flex flex-col items-center focus-visible:outline-none">
                        {on && !reduce && <span aria-hidden="true" className="absolute top-0 h-9 w-9 animate-ping rounded-full bg-[#CB9615]/35 [animation-iteration-count:2] sm:h-11 sm:w-11" />}
                        <motion.span
                          animate={{ scale: on ? 1.12 : 1 }}
                          className={cn(
                            "relative flex h-9 w-9 items-center justify-center rounded-xl shadow-[0_12px_24px_-12px_rgba(17,66,26,0.7)] ring-[3px] transition group-hover:-translate-y-0.5 group-focus-visible:outline group-focus-visible:outline-[3px] group-focus-visible:outline-[#FFD84D] sm:h-11 sm:w-11",
                            on ? "bg-[#11421A] text-[#F4D27A] ring-[#CB9615]" : p.hq ? "bg-[#CB9615] text-[#1A1206] ring-white" : "bg-white text-[#117F21] ring-[#14892A]/25 group-hover:bg-[#14892A] group-hover:text-white",
                          )}
                        >
                          {p.hq ? <Landmark className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> : <MapPin className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />}
                        </motion.span>
                        <span className={cn("mt-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold shadow-sm ring-1 sm:mt-1.5 sm:px-2.5", on ? "bg-[#11421A] text-[#F4D27A] ring-[#11421A]" : "bg-white text-[#164D20] ring-gray-200")}>
                          {p.city}{p.hq && " (HQ)"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="relative mt-3 text-center text-sm text-gray-600">Schematic map. Pins show approximate locations.</p>
            <div className="relative mt-4 flex flex-wrap justify-center gap-1.5 sm:hidden">
              {pins.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSel(p.id)}
                  aria-pressed={sel === p.id}
                  className={cn("inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition", sel === p.id ? "bg-gradient-to-r from-[#105D1D] to-[#14892A] text-white" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:text-[#105D1D]", focus)}
                >
                  {p.city}
                </button>
              ))}
            </div>
          </div>
        </Rise>

        {/* Office card */}
        <div className="xl:col-span-5" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.article
              key={sel}
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -16 }}
              transition={{ duration: 0.3, ease }}
              className="relative h-full overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_24px_50px_-24px_rgba(16,93,29,0.4)] sm:p-7"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#14892A] to-[#CB9615]" />
              <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#14892A]/15 bg-[#E8F5E9] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#105D1D]">
                {office ? <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> : <Landmark className="h-3.5 w-3.5" aria-hidden="true" />}
                {info.title}
              </p>
              <h3 className="mt-4 text-3xl font-bold tracking-tight">{info.city}</h3>
              <ul className="mt-5 space-y-3">
                <li className="flex gap-4">
                  <Tile icon={MapPin} />
                  <span className="pt-2.5">{info.address}</span>
                </li>
                {info.phone && (
                  <li className="flex gap-4">
                    <Tile icon={Phone} />
                    <span className="pt-2.5">
                      <a href={`tel:${info.phone.replace(/\s/g, "")}`} className={cn("rounded font-semibold text-[#105D1D] underline underline-offset-4 hover:text-[#117F21]", focus)}>{info.phone}</a>
                      {info.confirm && <span className="ml-2 inline-block rounded-full bg-[#FFF8E1] px-2.5 py-0.5 text-xs font-bold text-[#7A5200] ring-1 ring-[#CB9615]/40">To be confirmed</span>}
                    </span>
                  </li>
                )}
              </ul>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">Serves</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {info.states.map((s) => (
                  <li key={s} className={cn("rounded-full border px-3 py-1 text-sm font-semibold", s === state ? "border-[#11421A] bg-[#11421A] text-[#F4D27A]" : "border-gray-200 bg-[#F7FAF6] text-gray-700")}>{s}</li>
                ))}
              </ul>
              <a href={mapsUrl(info.address)} target="_blank" rel="noopener noreferrer" className={cn(goldBtn, "group mt-7")}>
                <Navigation className="h-5 w-5" aria-hidden="true" /> Get directions
                <span className="sr-only">(opens Google Maps in a new tab)</span>
                <ArrowRight className={moveArrow} aria-hidden="true" />
              </a>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── News and media centre ─────────────────────────── */

const media = [
  { k: "Press releases", icon: Megaphone },
  { k: "Speeches", icon: Mic },
  { k: "Events", icon: Calendar },
  { k: "Photos", icon: ImageIcon, to: "/media#photos" },
  { k: "Videos", icon: Video, to: "/media#videos" },
  { k: "In the news", icon: Newspaper },
];

export function Newsroom() {
  const [lead, ...rest] = latestNews.slice(0, 4);
  return (
    <section id="news" aria-labelledby="news-title" className={portalSec}>
      <SectionHeading
        id="news-title"
        eyebrow="News and media"
        title="Newsroom"
        intro="Press releases, statements, speeches, events, photos and videos from the Commission."
        action={
          <Link to="/news" className={cn(outlineBtn, "group w-fit")}>
            Open the newsroom
            <ArrowRight className={moveArrow} aria-hidden="true" />
          </Link>
        }
      />

      <ul className="mt-8 flex flex-wrap gap-2" aria-label="Media centre sections">
        {media.map((m) => (
          <li key={m.k}>
            {"to" in m && m.to ? (
              <Link to={m.to} className={cn("group inline-flex min-h-11 items-center gap-2 rounded-full bg-[#11421A] px-4 text-sm font-semibold text-white transition hover:bg-[#105D1D]", focus)}>
                <m.icon className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" /> {m.k}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 bg-[#F7FAF6] px-4 text-sm font-semibold text-gray-700">
                <m.icon className="h-4 w-4 text-[#117F21]" aria-hidden="true" /> {m.k}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Lead story: photo with the words on a dark shade (homepage NewsMedia) */}
        <Rise className="xl:col-span-7">
          <article className="h-full">
            <Link to={newsPath(lead)} className={cn("group relative block h-full min-h-[400px] overflow-hidden rounded-3xl bg-[#11421A] text-white", focus)}>
              <img src={lead.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition [transition-duration:1200ms] group-hover:scale-105" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#11421A] via-[#11421A]/75 via-45% to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <span className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full bg-[#CB9615] px-2.5 py-1 font-bold uppercase tracking-wider text-[#1A1206]">{lead.category}</span>
                  <span className="flex items-center gap-1 text-white/85">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {fmt(lead.date)}
                  </span>
                </span>
                <span className="mt-4 block text-2xl font-bold leading-tight sm:text-3xl">{lead.title}</span>
                <span className="mt-3 line-clamp-2 block max-w-xl text-white/85">{lead.excerpt}</span>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-[#F4D27A]">
                  Read the story <ArrowRight className={moveArrow} aria-hidden="true" />
                </span>
              </span>
            </Link>
          </article>
        </Rise>

        <div className="grid grid-cols-1 gap-4 xl:col-span-5">
          {rest.map((n, i) => (
            <Rise key={n.id} delay={0.08 * (i + 1)}>
              <article className="h-full">
                <Link to={newsPath(n)} className={cn(card, "group flex h-full gap-4 p-3", focus)}>
                  <span className="relative block min-h-24 flex-none overflow-hidden rounded-2xl bg-gray-100" style={{ width: "clamp(6.5rem, 30%, 9rem)" }}>
                    <img src={n.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center py-1.5 pr-2">
                    <span className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-[#E8F5E9] px-2 py-0.5 font-bold uppercase tracking-wider text-[#105D1D]">{n.category}</span>
                      <span className="text-gray-600">{fmt(n.date)}</span>
                    </span>
                    <span className="mt-1.5 block font-bold leading-snug text-[#164D20] transition group-hover:text-[#117F21]">{n.title}</span>
                  </span>
                </Link>
              </article>
            </Rise>
          ))}
          <Rise delay={0.32}>
            <Spotlight className="rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-5">
              <div className="group flex gap-4">
                <Tile icon={Megaphone} dark />
                <div className="min-w-0">
                  <p className="text-lg font-bold">Media enquiries</p>
                  <p className="mt-1 text-gray-600">Journalists can contact Corporate Communications at <a href={`mailto:${headOffice.email}`} className={cn("break-all rounded font-semibold text-[#105D1D] underline underline-offset-2 hover:text-[#117F21]", focus)}>{headOffice.email}</a>.</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {social.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 transition hover:border-[#14892A] hover:text-[#117F21]", focus)}>
                      {s.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Spotlight>
          </Rise>
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-600">News items are placeholders until the newsroom is connected to the CMS.</p>
    </section>
  );
}
