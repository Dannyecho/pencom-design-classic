"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Check, Clock, Landmark, MapPin, Navigation, Phone, Search, Video, Mic, Newspaper, Image as ImageIcon, Megaphone } from "lucide-react";
import { latestNews } from "@/lib/data";
import { newsPath } from "@/views/news/data";
import { cn } from "@/lib/utils";
import { DarkBackdrop, Rise, ease, focus, sectionCls } from "@/views/theme/ui";
import { SectionHeading } from "@/views/theme/heading";
import { Bubble, IconTile, calmCard, goldBtn, pill } from "@/views/resources/Library";
import { outlineBtn } from "@/views/regulations/Sections";
import { abuja, allStates, headOffice, offices, social, topics } from "./data";
import { loadCases } from "./CaseForm";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const moveArrow = "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1";

/* ─────────────────────────── Case tracker ─────────────────────────── */

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
    <section id="track" aria-labelledby="track-title" className={sectionCls}>
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] p-6 text-white sm:p-10 lg:p-14">
        <DarkBackdrop />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading stacked id="track-title" dark eyebrow="Case tracker" title="Track your case" highlight="your case" intro="Enter the reference we gave you. No sign-in needed." />
            <form role="search" onSubmit={(e) => { e.preventDefault(); look(ref); }} className="mt-8">
              <label htmlFor="track-ref" className="block text-lg font-semibold text-white">Case reference</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="track-ref"
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="e.g. PC-2611-AB12C"
                  autoComplete="off"
                  className={cn("min-h-14 w-full min-w-0 flex-1 rounded-2xl bg-white px-5 font-mono text-lg uppercase text-[#14261A] ring-1 ring-black/10 placeholder:font-sans placeholder:normal-case placeholder:text-gray-600", focus)}
                />
                <button type="submit" className={cn(goldBtn, "shrink-0", focus)}>
                  <Search className="h-5 w-5" aria-hidden="true" /> Track
                </button>
              </div>
            </form>
            <p className="mt-5 text-lg text-white/85">
              Want to see how it works?{" "}
              <button type="button" onClick={() => { setRef("PC-SAMPLE"); look("PC-SAMPLE"); }} className={cn("inline-flex min-h-11 items-center rounded font-semibold text-[#F4D27A] underline underline-offset-4 hover:text-white", focus)}>Try a sample case</button>
            </p>
          </div>

          <div className="lg:col-span-7" aria-live="polite">
            <AnimatePresence mode="wait">
              {result === null && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full min-h-56 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-white/30 p-8 text-center text-lg text-white/85">
                  <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4D27A] text-[#1A1206]"><Search className="h-7 w-7" /></span>
                  Your case progress will appear here.
                </motion.div>
              )}
              {result === "none" && (
                <motion.div key="none" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-3xl border-l-8 border-[#B52026] bg-white p-7 text-[#14261A] sm:p-8">
                  <p className="text-xl font-bold text-[#B52026]">We couldn’t find that reference.</p>
                  <p className="mt-2 text-lg text-gray-700">Check it matches the one in your confirmation, including the dashes. Still stuck? Call {headOffice.phone}.</p>
                </motion.div>
              )}
              {result && result !== "none" && (
                <motion.div key={result.ref} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }} className="rounded-3xl bg-white p-7 text-[#14261A] shadow-[0_28px_50px_-28px_rgba(0,0,0,0.6)] sm:p-9">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xl font-bold text-[#0A4A13] sm:text-2xl">{result.ref}</p>
                      <p className="mt-1 text-lg text-gray-700">{result.topic} · opened {fmt(result.date)}</p>
                    </div>
                    {result.sample && <span className="rounded-full bg-[#F4D27A] px-3 py-1 text-sm font-bold uppercase tracking-wider text-[#1A1206]">Sample</span>}
                  </div>
                  <ol className="mt-8">
                    {STAGES.map((s, i) => {
                      const state = i < result.stage ? "done" : i === result.stage ? "now" : "next";
                      return (
                        <li key={s} className="relative flex gap-4 pb-7 last:pb-0">
                          {i < STAGES.length - 1 && (
                            <span aria-hidden="true" className="absolute left-[23px] top-12 h-[calc(100%-3rem)] w-1 rounded-full bg-gray-200">
                              <motion.span className="block w-full origin-top rounded-full bg-gradient-to-b from-[#117F21] to-[#CB9615]" initial={{ height: 0 }} animate={{ height: i < result.stage ? "100%" : "0%" }} transition={{ duration: reduce ? 0 : 0.5, delay: 0.2 + i * 0.25 }} />
                            </span>
                          )}
                          <motion.span initial={{ scale: reduce ? 1 : 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 + i * 0.2 }} className={cn("relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold", state === "done" ? "bg-[#117F21] text-white" : state === "now" ? "bg-[#F4D27A] text-[#1A1206]" : "bg-white text-gray-700 ring-2 ring-gray-300")}>
                            {state === "done" ? <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" /> : state === "now" ? <Clock className="h-6 w-6" aria-hidden="true" /> : i + 1}
                            {state === "now" && !reduce && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-2xl border-2 border-[#CB9615]/60 [animation-iteration-count:2]" />}
                          </motion.span>
                          <div className="pt-1">
                            <p className={cn("text-lg font-bold", state === "next" && "text-gray-700")}>{s}</p>
                            <p className="text-base text-gray-700">{state === "done" ? "Complete" : state === "now" ? "In progress" : "Not started"}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  {result.sample && <p className="mt-6 rounded-2xl bg-[#F1EFE8] p-4 text-base text-gray-700">This is example data. Real case statuses will come from PenCom’s case management system.</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Zonal offices ─────────────────────────── */

/** Map positions (percent of the map box) from the office data. */
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
  const card = office
    ? { title: `${office.zone} zonal office`, city: office.city, address: office.address, phone: office.phone, confirm: office.confirm, states: office.states }
    : { title: "Head office", city: "Abuja", address: headOffice.address, phone: headOffice.phone, confirm: false, states: ["FCT (Abuja)", "and anywhere in Nigeria"] };

  const pins = useMemo(() => [{ id: "hq", city: "Abuja", x: abuja.x, y: abuja.y, hq: true }, ...offices.map((o) => ({ id: o.id, city: o.city, x: o.x, y: o.y, hq: false }))], []);

  return (
    <section id="zonal-offices" aria-labelledby="offices-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="offices-title"
          eyebrow="Visit us"
          title="Find your nearest office"
          highlight="nearest office"
          intro="Choose your state and we’ll show you the office that serves it, or pick a pin on the map."
          action={
            <label className="block w-full max-w-xs">
              <span className="text-lg font-semibold text-[#14261A]">I live in</span>
              <select value={state} onChange={(e) => setState(e.target.value)} className={cn("mt-2 min-h-14 w-full cursor-pointer rounded-2xl bg-white px-5 text-lg font-semibold text-[#14261A] ring-1 ring-black/15 transition hover:ring-2 hover:ring-[#117F21]", focus)}>
                <option value="">Choose your state</option>
                {allStates.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          }
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Map */}
          <Rise className="lg:col-span-7">
            <div className="relative h-full overflow-hidden rounded-3xl bg-[#F1EFE8] p-5 sm:p-6">
              <div aria-hidden="true" className="absolute left-[12%] top-[10%] h-[80%] w-[76%] rounded-[45%_55%_48%_52%/52%_45%_55%_48%] bg-[#FBF8F1] ring-1 ring-[#117F21]/15" />
              <div className="relative mx-auto aspect-[0.95] w-full max-w-2xl sm:aspect-[1.25]">
                {/* Route from the head office to the chosen zonal office (shares px/py with the pins) */}
                <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="office-route" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#CB9615" />
                      <stop offset="100%" stopColor="#117F21" />
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
                          {on && !reduce && <span aria-hidden="true" className="absolute top-0 h-9 w-9 animate-ping rounded-full bg-[#CB9615]/35 [animation-iteration-count:2] sm:h-12 sm:w-12" />}
                          <motion.span animate={{ scale: on ? 1.12 : 1 }} className={cn("relative flex h-9 w-9 items-center justify-center rounded-full shadow-[0_12px_24px_-12px_rgba(10,74,19,0.6)] ring-[3px] transition group-hover:-translate-y-0.5 group-focus-visible:outline group-focus-visible:outline-[3px] group-focus-visible:outline-[#FFD84D] sm:h-12 sm:w-12", on ? "bg-[#0A4A13] text-[#F4D27A] ring-[#F4D27A]" : p.hq ? "bg-[#F4D27A] text-[#1A1206] ring-white" : "bg-white text-[#117F21] ring-[#117F21]/30 group-hover:bg-[#E8F5E9]")}>
                            {p.hq ? <Landmark className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> : <MapPin className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />}
                          </motion.span>
                          <span className={cn("mt-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold shadow-sm ring-1 sm:mt-1.5 sm:px-3 sm:text-sm", on ? "bg-[#0A4A13] text-[#F4D27A] ring-[#0A4A13]" : "bg-white text-[#14261A] ring-black/10")}>
                            {p.city}{p.hq && " (HQ)"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="relative mt-3 text-center text-base text-gray-700">Schematic map. Pins show approximate locations.</p>
              <div className="relative mt-4 flex flex-wrap justify-center gap-2 sm:hidden">
                {pins.map((p) => (
                  <button key={p.id} type="button" onClick={() => setSel(p.id)} aria-pressed={sel === p.id} className={pill(sel === p.id)}>
                    {p.city}
                  </button>
                ))}
              </div>
            </div>
          </Rise>

          {/* Office card */}
          <div className="lg:col-span-5" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.article key={sel} initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -16 }} transition={{ duration: 0.3, ease }} className="relative h-full overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-black/10 shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] sm:p-9">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
                <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1.5 text-sm font-bold uppercase tracking-[0.08em] text-[#0A4A13] sm:tracking-[0.16em]">
                  {office ? <MapPin className="h-4 w-4" aria-hidden="true" /> : <Landmark className="h-4 w-4" aria-hidden="true" />}
                  {card.title}
                </p>
                <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{card.city}</h3>
                <ul className="mt-6 space-y-4 text-lg">
                  <li className="flex gap-4">
                    <IconTile icon={MapPin} className="h-11 w-11 [&>svg]:h-5 [&>svg]:w-5" />
                    <span className="pt-1.5">{card.address}</span>
                  </li>
                  {card.phone && (
                    <li className="flex gap-4">
                      <IconTile icon={Phone} className="h-11 w-11 [&>svg]:h-5 [&>svg]:w-5" />
                      <span className="pt-1.5">
                        <a href={`tel:${card.phone.replace(/\s/g, "")}`} className={cn("rounded font-semibold text-[#0A4A13] underline underline-offset-4 hover:text-[#117F21]", focus)}>{card.phone}</a>
                        {card.confirm && <span className="ml-2 inline-block rounded-full bg-[#F4D27A] px-2.5 py-0.5 text-sm font-bold text-[#1A1206]">To be confirmed</span>}
                      </span>
                    </li>
                  )}
                </ul>
                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#7A5200]">Serves</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {card.states.map((s) => (
                    <li key={s} className={cn("rounded-full px-3 py-1 text-base font-semibold", s === state ? "bg-[#0A4A13] text-[#F4D27A]" : "bg-[#F1EFE8] text-[#14261A]")}>{s}</li>
                  ))}
                </ul>
                <a href={mapsUrl(card.address)} target="_blank" rel="noopener noreferrer" className={cn(goldBtn, "mt-8", focus)}>
                  <Navigation className="h-5 w-5" aria-hidden="true" /> Get directions
                  <span className="sr-only">(opens Google Maps in a new tab)</span>
                  <ArrowRight className={moveArrow} aria-hidden="true" />
                </a>
              </motion.article>
            </AnimatePresence>
          </div>
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
    <section id="news" aria-labelledby="news-title" className={sectionCls}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="news-title"
          eyebrow="News and media"
          title="Newsroom"
          intro="Press releases, statements, speeches, events, photos and videos from the Commission."
          action={
            <Link to="/news" className={cn(outlineBtn, focus)}>
              Open the newsroom
              <ArrowRight className={moveArrow} aria-hidden="true" />
            </Link>
          }
        />

        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Media centre sections">
          {media.map((m) => (
            <li key={m.k}>
              {"to" in m && m.to ? (
                <Link to={m.to} className={cn("group inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0A4A13] px-5 text-lg font-semibold text-white transition hover:bg-[#117F21]", focus)}>
                  <m.icon className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" /> {m.k}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              ) : (
                <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-lg font-semibold text-[#14261A] ring-1 ring-black/10">
                  <m.icon className="h-5 w-5 text-[#117F21]" aria-hidden="true" /> {m.k}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Rise className="lg:col-span-7">
            <article className="h-full">
              <Link to={newsPath(lead)} className={cn(calmCard, "flex h-full flex-col", focus)}>
                <span className="relative block aspect-[16/9] overflow-hidden bg-gray-100">
                  <img src={lead.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-[1500ms] group-hover:scale-105" />
                </span>
                <span className="flex flex-1 flex-col p-6 sm:p-8">
                  <span className="flex flex-wrap items-center gap-3 text-base">
                    <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-bold uppercase tracking-wider text-[#0A4A13]">{lead.category}</span>
                    <span className="text-gray-700">{fmt(lead.date)}</span>
                  </span>
                  <span className="mt-4 block text-2xl font-bold leading-tight tracking-tight text-[#14261A] sm:text-3xl">{lead.title}</span>
                  <span className="mt-3 line-clamp-2 block max-w-xl text-lg text-gray-700">{lead.excerpt}</span>
                  <span className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-[#117F21]">
                    Read the story <ArrowRight className={moveArrow} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </article>
          </Rise>
          <div className="grid grid-cols-1 gap-5 lg:col-span-5">
            {rest.map((n, i) => (
              <Rise key={n.id} delay={0.08 * (i + 1)}>
                <article className="h-full">
                  <Link to={newsPath(n)} className={cn(calmCard, "flex h-full gap-4 p-3", focus)}>
                    <span className="relative block min-h-28 flex-none overflow-hidden rounded-2xl bg-gray-100" style={{ width: "clamp(7rem, 32%, 10rem)" }}>
                      <img src={n.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col justify-center py-2 pr-2">
                      <span className="text-sm font-bold uppercase tracking-wider text-[#117F21]">{n.category} · <span className="font-normal normal-case text-gray-700">{fmt(n.date)}</span></span>
                      <span className="mt-1 block text-lg font-bold leading-snug text-[#14261A] transition group-hover:text-[#117F21]">{n.title}</span>
                    </span>
                  </Link>
                </article>
              </Rise>
            ))}
            <Rise delay={0.32}>
              <div className="group relative overflow-hidden rounded-3xl bg-[#F1EFE8] p-6">
                <Bubble />
                <div className="relative flex gap-4">
                  <IconTile icon={Megaphone} className="h-12 w-12 [&>svg]:h-6 [&>svg]:w-6" />
                  <div className="min-w-0">
                    <p className="text-xl font-bold">Media enquiries</p>
                    <p className="mt-1 text-lg text-gray-700">Journalists can contact Corporate Communications at <a href={`mailto:${headOffice.email}`} className={cn("break-all rounded font-semibold text-[#0A4A13] underline underline-offset-2 hover:text-[#117F21]", focus)}>{headOffice.email}</a>.</p>
                  </div>
                </div>
                <ul className="relative mt-4 flex flex-wrap gap-2">
                  {social.map((s) => (
                    <li key={s.name}><a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-11 items-center rounded-full bg-white px-4 text-base font-semibold text-[#14261A] ring-1 ring-black/15 transition hover:bg-[#0A4A13] hover:text-white hover:ring-[#0A4A13]", focus)}>{s.name}<span className="sr-only"> (opens in a new tab)</span></a></li>
                  ))}
                </ul>
              </div>
            </Rise>
          </div>
        </div>
        <p className="mt-8 text-base text-gray-700">News items are placeholders until the newsroom is connected to the CMS.</p>
      </div>
    </section>
  );
}
