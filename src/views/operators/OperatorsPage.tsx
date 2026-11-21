"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight, ArrowRight, BadgeCheck, BarChart3, Building2, ChevronRight, Globe, Landmark, LayoutGrid, List, Mail, MapPin, MessageSquareWarning, Phone, Search,
  ShieldAlert, ShieldCheck, UserRound, Vault, Wallet, X,
} from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "@/lib/router";
import { cn } from "@/lib/utils";
import { CountUp, GridBackdrop, Spotlight, Tilt, scrollToId } from "@/views/about/primitives";
import Headline from "@/views/theme/Headline";
import {
  DarkBand, Drawer, FloatingBar, PhotoBanner, Rise, TabStrip, Tile, card, ease, featured, focus, goldBtn, listPanel, outlineBtn, outlineDarkBtn, sectionCls,
  type NavSection,
} from "@/views/theme/ui";
import { funds, operators, relatedBodies, typeInfo, type Operator, type OperatorType } from "./data";

/**
 * Pension operators, classic theme (a tool page; brief §6.2 Operators and the "Operator directory and details"
 * template; DES-28, DES-29, DES-30). Laptop photo banner → the licence check floating over it with the register
 * counts → sticky TabStrip → the directory (type segments, search, city, list or card view; each operator opens a
 * details drawer with a shareable ?op= link) → how the three safeguards work as a numbered process → the RSA fund
 * finder as the page's dark band → performance (featured card) and complaints. Old links (#pfas, #pfcs, #cpfas,
 * #penop …) open the matching tab.
 */

type Tab = OperatorType | "Related";
const tabFor: Record<string, Tab> = { pfas: "PFA", "pfa-addresses": "PFA", pfcs: "PFC", cpfas: "CPFA", penop: "Related", ptad: "Related", related: "Related" };

const onThisPage: NavSection[] = [
  { id: "directory", label: "Directory", icon: Building2 },
  { id: "how", label: "How it works", icon: ShieldCheck },
  { id: "funds", label: "RSA funds", icon: Wallet },
  { id: "performance", label: "Performance", icon: BarChart3 },
];

/** Round thumb for the age slider (white with a green rim), as on the services calculator. */
const thumb = [
  "[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#117F21] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md",
  "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[#117F21] [&::-moz-range-thumb]:bg-white",
].join(" ");

/** A plain arrow that moves 4 px inside its card or button. */
function Arrow({ className }: { className?: string }) {
  return <ArrowRight className={cn("h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1", className)} aria-hidden="true" />;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tel = (p: string) => `tel:${p.split(/[,(]/)[0].replace(/-\d+$/, "").replace(/[^\d+]/g, "")}`;
const mapUrl = (o: Operator) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.name}, ${o.address}`)}`;
const initials = (n: string) =>
  n
    .replace(/\(.*?\)|limited|ltd\.?|nig\.?|pfa|pension(s)?|fund|managers|administrators?|custodian|closed/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
const tones = ["bg-[#04240A] text-[#F4D27A]", "bg-[#117F21] text-white", "bg-[#CB9615] text-[#1A1206]", "bg-[#E8F5E9] text-[#0A4A13]"];
const tone = (id: string) => tones[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length];

function Monogram({ o, size = "md", className }: { o: Operator; size?: "md" | "lg"; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center rounded-xl font-bold", tone(o.id), size === "lg" ? "h-16 w-16 rounded-2xl text-xl" : "h-11 w-11 text-sm", className)}>
      {initials(o.name) || o.name[0]}
    </span>
  );
}

function ContactActions({ o, compact = false, grid = false, iconsOnly = false }: { o: Operator; compact?: boolean; grid?: boolean; iconsOnly?: boolean }) {
  const items = [
    o.phones[0] && { href: tel(o.phones[0]), icon: Phone, label: `Call ${o.name}`, text: "Call" },
    o.emails[0] && { href: `mailto:${o.emails[0]}`, icon: Mail, label: `Email ${o.name}`, text: "Email" },
    { href: `https://${o.website}`, icon: Globe, label: `${o.name} website (opens in a new tab)`, text: "Website", ext: true },
    { href: mapUrl(o), icon: MapPin, label: `${o.name} on a map (opens in a new tab)`, text: "Map", ext: true },
  ].filter(Boolean) as { href: string; icon: typeof Phone; label: string; text: string; ext?: boolean }[];
  return (
    <div className={cn("relative z-10", grid ? "grid grid-cols-2 gap-2" : "flex flex-wrap", !grid && (compact ? "gap-1.5" : "gap-2"))}>
      {items.map((it) => (
        <a
          key={it.text}
          href={it.href}
          aria-label={it.label}
          title={it.text}
          {...(it.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#117F21]/25 bg-white font-semibold text-[#117F21] transition hover:border-[#117F21] hover:bg-[#117F21] hover:text-white",
            iconsOnly ? "h-11 w-11" : compact ? "min-h-11 px-3 text-sm" : "min-h-12 px-4",
            focus,
          )}
        >
          <it.icon className="h-4 w-4" aria-hidden="true" />
          {!iconsOnly && it.text}
        </a>
      ))}
    </div>
  );
}

export default function OperatorsPage() {
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [tabHint, setTabHint] = useState<Tab | null>(null);

  const open = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("op", id);
    else next.delete("op");
    setParams(next, { replace: true, preventScrollReset: true });
  };

  // Old links: #pfas, #pfcs … land on the directory tab; downloads and summaries moved to other pages.
  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    if (id === "pfa-downloads" || id === "pfc-downloads") return void navigate("/resources#downloads", { replace: true });
    if (id === "rsa-summary") return void navigate("/performance", { replace: true });
    if (id in tabFor) setTabHint(tabFor[id]);
    const target = id in tabFor ? "directory" : id;
    const t1 = window.setTimeout(() => scrollToId(target, !reduce), 80);
    const t2 = window.setTimeout(() => scrollToId(target, false), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hash, reduce, navigate]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#0A2E10]">
        <PhotoBanner
          id="ops-title"
          crumbs={[{ label: "Home", to: "/" }, { label: "Operators" }]}
          chip={{ icon: ShieldCheck, label: "Licensed by PenCom" }}
          title="The companies that look after your pension"
          mark="your pension"
          intro="Find, compare and contact every Pension Fund Administrator, Pension Fund Custodian and Closed Pension Fund Administrator licensed by the Commission."
          image="/images/site/laptop-phone-1920.webp"
          srcSet="/images/site/laptop-phone-480.webp 480w, /images/site/laptop-phone-960.webp 960w, /images/site/laptop-phone-1920.webp 1920w"
          position="center 40%"
          actions={
            <Link to="/connect#report" className={cn(outlineDarkBtn, "group")}>
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              Report to PenCom
              <Arrow />
            </Link>
          }
        />
        <LicenceCheck onOpen={open} />
        <div className="h-6" aria-hidden="true" />
        <TabStrip sections={onThisPage} pillId="ops-nav-pill" />
        <Directory onOpen={open} tabHint={tabHint} />
        <HowItWorks />
        <Funds />
        <Performance />
        <Details id={params.get("op")} onClose={() => open(null)} />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Licence check (floating over the banner) ─────────────────────────── */

function LicenceCheck({ onOpen }: { onOpen: (id: string) => void }) {
  const [q, setQ] = useState("");
  const term = norm(q);
  const matches = useMemo(() => (term.length < 3 ? [] : operators.filter((o) => norm(o.name).includes(term))), [term]);
  const state = term.length < 3 ? "idle" : matches.length ? "found" : "none";
  const count = (t: OperatorType) => operators.filter((o) => o.type === t).length;

  return (
    <FloatingBar eyebrow="Licence check" title="Is this company licensed?" intro="Check a name before you hand over your details.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <label htmlFor="verify-q" className="block font-semibold">
            Company name
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-[#F4F7F2] px-4 ring-1 ring-gray-200 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#117F21]">
            <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
            <input id="verify-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type at least 3 letters, e.g. “Leadway”" autoComplete="off" className="min-h-14 w-full min-w-0 bg-transparent text-lg placeholder:text-gray-500 focus:outline-none" />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-white", focus)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <div aria-live="polite" className="mt-4 min-h-[8.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              {state === "idle" && (
                <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3 rounded-2xl border border-gray-200/80 bg-[#F7FAF6] p-4 leading-relaxed text-gray-600">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                  Only companies on PenCom’s register may open RSAs, hold pension assets or collect contributions.
                </motion.p>
              )}
              {state === "found" && (
                <motion.ul key="found" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={listPanel}>
                  {matches.slice(0, 3).map((o) => (
                    <li key={o.id}>
                      <button type="button" onClick={() => onOpen(o.id)} className={cn("group relative flex min-h-14 w-full items-center gap-3 py-3 pl-5 pr-4 text-left transition hover:bg-[#F7FAF6]", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]")}>
                        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#117F21]" />
                        <ShieldCheck className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold text-[#0A2E10]">{o.name}</span>
                          <span className="block text-sm text-gray-600">Licensed {typeInfo[o.type].label}</span>
                        </span>
                        <Arrow className="text-[#117F21]" />
                      </button>
                    </li>
                  ))}
                  {matches.length > 3 && <li className="px-5 py-3 text-sm text-gray-600">and {matches.length - 3} more in the directory below</li>}
                </motion.ul>
              )}
              {state === "none" && (
                <motion.div key="none" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative flex gap-3 overflow-hidden rounded-2xl border border-[#B52026]/20 bg-[#FDF2F2] py-4 pl-5 pr-4 text-[#5C1013]">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B52026]" />
                  <ShieldAlert className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <p className="leading-relaxed">
                    <strong className="block">Not on PenCom’s register.</strong>
                    Don’t give them your RSA PIN or money. If they claim to be licensed,{" "}
                    <Link to="/connect#report" className={cn("rounded font-semibold underline", focus)}>
                      report it to PenCom
                    </Link>
                    .
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* The register in numbers: a small featured panel beside the check. */}
        <div className={cn(featured, "self-start p-5 sm:p-6 lg:col-span-5")}>
          <GridBackdrop className="opacity-70" />
          <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#CB9615]/25 blur-2xl" />
          <p className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Licensed by PenCom
          </p>
          <dl className="relative mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10">
            {(["PFA", "PFC", "CPFA"] as const).map((t) => (
              <div key={t} className="bg-[#04240A]/60 px-3 py-4 text-center sm:px-4">
                <dt className="text-sm font-semibold text-white/85">{typeInfo[t].short}</dt>
                <dd className="mt-1 text-4xl font-black tabular-nums text-white">
                  <CountUp value={String(count(t))} duration={1.2} />
                </dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={() => scrollToId("directory", true)} className={cn(goldBtn, "group relative mt-4 w-full")}>
            <Building2 className="h-5 w-5" aria-hidden="true" />
            Directory
            <Arrow />
          </button>
        </div>
      </div>
    </FloatingBar>
  );
}

/* ─────────────────────────── Directory ─────────────────────────── */

/** A segmented control (white group, sliding green pill) with a visible label. */
function Segments<T extends string>({ label, value, options, onChange, id }: { label: string; value: T; options: { v: T; label: string; icon?: typeof List }[]; onChange: (v: T) => void; id: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span aria-hidden="true" className="text-sm font-semibold text-gray-600">
        {label}
      </span>
      <LayoutGroup id={id}>
        <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-gray-200">
          {options.map((o) => {
            const on = value === o.v;
            return (
              <button key={o.v} type="button" aria-pressed={on} onClick={() => onChange(o.v)} className={cn("relative inline-flex min-h-11 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition", on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]", focus)}>
                {on && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-lg bg-[#117F21]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                {o.icon && <o.icon className="relative h-4 w-4" aria-hidden="true" />}
                <span className="relative">{o.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function Directory({ onOpen, tabHint }: { onOpen: (id: string) => void; tabHint: Tab | null }) {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>("PFA");
  const [q, setQ] = useState("");
  const [city, setCity] = useState<"All" | "Lagos" | "Abuja">("All");
  const [view, setView] = useState<"grid" | "list">("list");

  useEffect(() => {
    if (tabHint) setTab(tabHint);
  }, [tabHint]);

  const tabs: { id: Tab; label: string; n: number }[] = [
    ...(["PFA", "PFC", "CPFA"] as const).map((t) => ({ id: t, label: typeInfo[t].short, n: operators.filter((o) => o.type === t).length })),
    { id: "Related", label: "Related bodies", n: relatedBodies.length },
  ];
  const list = useMemo(() => {
    const term = norm(q);
    return operators.filter((o) => o.type === tab && (city === "All" || o.city === city) && (!term || norm(`${o.name} ${o.md} ${o.address}`).includes(term)));
  }, [tab, q, city]);

  return (
    <section id="directory" aria-labelledby="directory-title" className={cn(sectionCls, "pt-10 sm:pt-14")}>
      {Object.keys(tabFor).map((a) => (
        <span key={a} id={a} className="block scroll-mt-[170px]" aria-hidden="true" />
      ))}
      <div className="mx-auto max-w-7xl">
        <Headline
          id="directory-title"
          kicker="Directory"
          title="Every licensed operator, in one place"
          mark="in one place"
          intro={tab === "Related" ? "Bodies that work alongside the Commission and licensed operators." : typeInfo[tab].role}
        />

        {/* Toolbar: type segments on top, then search, city and layout. */}
        <div className="mt-10 rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-2 sm:p-3">
          <LayoutGroup id="ops-tabs">
            <div role="tablist" aria-label="Type of operator" className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-gray-200 sm:flex sm:flex-wrap">
              {tabs.map((t) => {
                const on = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="ops-panel"
                    onClick={() => setTab(t.id)}
                    className={cn("relative flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 font-semibold transition sm:flex-1 lg:flex-none", on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]", focus)}
                  >
                    {on && <motion.span layoutId="ops-tab-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_10px_24px_-12px_rgba(10,74,19,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <span className="relative">{t.label}</span>
                    <span className={cn("relative rounded-full px-2 text-xs font-bold tabular-nums leading-5", on ? "bg-[#F4D27A] text-[#1A1206]" : "bg-[#E8F5E9] text-[#0A4A13]")}>{t.n}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
          {tab !== "Related" && (
            <div className="mt-2 flex flex-col gap-3 px-1 pb-1 pt-1 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 lg:max-w-md">
                <label htmlFor="ops-q" className="sr-only">
                  Search operators
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-white px-4 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-[#117F21]">
                  <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                  <input id="ops-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or address" className="min-h-12 w-full min-w-0 bg-transparent placeholder:text-gray-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Segments id="ops-city" label="City" value={city} onChange={setCity} options={(["All", "Lagos", "Abuja"] as const).map((c) => ({ v: c, label: c }))} />
                <Segments
                  id="ops-view"
                  label="Layout"
                  value={view}
                  onChange={setView}
                  options={[
                    { v: "list", label: "List", icon: List },
                    { v: "grid", label: "Cards", icon: LayoutGrid },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        <div id="ops-panel" role="tabpanel" className="mt-6">
          {tab === "Related" ? (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {relatedBodies.map((b, i) => (
                <li key={b.short}>
                  <Rise delay={i * 0.06} className="h-full">
                    <Spotlight className={cn(card, "group flex h-full gap-5 p-6 sm:p-7")}>
                      <Tile icon={Landmark} dark size="lg" />
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">{b.short}</span>
                        <span className="mt-1 block text-xl font-bold text-[#0A2E10]">{b.name}</span>
                        <span className="mt-2 block leading-relaxed text-gray-600">{b.body}</span>
                      </span>
                    </Spotlight>
                  </Rise>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="mb-4 px-1 text-gray-600" aria-live="polite">
                <strong className="font-bold text-[#0A2E10]">{list.length}</strong> {list.length === 1 ? typeInfo[tab].label : typeInfo[tab].plural}
                {city !== "All" && ` in ${city}`}
                {q && ` matching “${q}”`}
              </p>
              {list.length === 0 ? (
                <div className="rounded-3xl border border-gray-200/80 bg-[#F4F7F2] px-6 py-14 text-center">
                  <Search className="mx-auto h-8 w-8 text-[#117F21]" aria-hidden="true" />
                  <p className="mt-3 text-xl font-bold">No operator matches</p>
                  <button type="button" onClick={() => { setQ(""); setCity("All"); }} className={cn("mt-5", outlineBtn)}>
                    <X className="h-5 w-5" aria-hidden="true" />
                    Clear filters
                  </button>
                </div>
              ) : view === "list" ? (
                <Spotlight className="rounded-3xl">
                  <div className={listPanel}>
                    <div aria-hidden="true" className="hidden items-center gap-4 bg-[#F4F7F2] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-600 md:flex">
                      <span className="w-11" />
                      <span className="flex-1">{typeInfo[tab].label}</span>
                      <span className="w-24">City</span>
                      <span className="hidden w-[12.5rem] lg:block">Contact</span>
                      <span className="w-5" />
                    </div>
                    <motion.ul layout>
                      <AnimatePresence mode="popLayout" initial={false}>
                        {list.map((o) => (
                          <motion.li
                            key={o.id}
                            layout
                            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.3, ease }}
                            className="border-t border-gray-100 first:border-t-0"
                          >
                            <article className="group relative flex items-center gap-4 px-4 py-3.5 transition hover:bg-[#F7FAF6] sm:px-6">
                              <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 origin-center scale-y-0 rounded-r-full bg-gradient-to-b from-[#117F21] to-[#CB9615] transition-transform duration-300 group-hover:scale-y-100" />
                              <Monogram o={o} />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold leading-snug text-[#0A2E10]">
                                  <button type="button" onClick={() => onOpen(o.id)} className={cn("text-left after:absolute after:inset-0 after:content-[''] group-hover:text-[#117F21]", "focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-[3px] focus-visible:after:-outline-offset-[3px] focus-visible:after:outline-[#FFD84D]")}>
                                    {o.name}
                                  </button>
                                </h3>
                                <p className="truncate text-sm text-gray-600">
                                  <span className="md:hidden">{o.city} · </span>
                                  {o.md}
                                </p>
                              </div>
                              <span className="hidden w-24 md:block">
                                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-[#F7FAF6] px-2.5 py-0.5 text-sm font-semibold text-gray-700">
                                  <MapPin className="h-3.5 w-3.5 text-[#117F21]" aria-hidden="true" />
                                  {o.city}
                                </span>
                              </span>
                              <div className="hidden w-[12.5rem] lg:block">
                                <ContactActions o={o} iconsOnly compact />
                              </div>
                              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#117F21]" aria-hidden="true" />
                            </article>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </motion.ul>
                  </div>
                </Spotlight>
              ) : (
                <motion.ul layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {list.map((o) => (
                      <motion.li key={o.id} layout initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.3, ease }}>
                        <article className={cn(card, "group relative flex h-full flex-col overflow-hidden p-6")}>
                          <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="flex items-start gap-3">
                            <Monogram o={o} />
                            <div className="min-w-0">
                              <h3 className="text-lg font-bold leading-snug text-[#0A2E10]">
                                <button type="button" onClick={() => onOpen(o.id)} className={cn("text-left after:absolute after:inset-0 after:rounded-3xl after:content-[''] group-hover:text-[#117F21]", focus)}>
                                  {o.name}
                                </button>
                              </h3>
                              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[#117F21]/20 bg-[#E8F5E9] px-2.5 py-0.5 text-xs font-bold text-[#0A4A13]">
                                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                Licensed
                              </p>
                            </div>
                          </div>
                          <dl className="mb-5 mt-4 space-y-2 text-gray-600">
                            <div className="flex gap-2">
                              <dt className="sr-only">Managing director</dt>
                              <UserRound className="mt-1 h-4 w-4 shrink-0 text-[#117F21]" aria-hidden="true" />
                              <dd>{o.md}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="sr-only">Head office</dt>
                              <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#117F21]" aria-hidden="true" />
                              <dd className="line-clamp-2">{o.address}</dd>
                            </div>
                          </dl>
                          <div className="mt-auto border-t border-gray-100 pt-4">
                            <ContactActions o={o} compact grid />
                          </div>
                        </article>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </>
          )}
        </div>
        <p className="mt-6 text-sm text-gray-600">Operator details as published on PenCom’s register of licensed operators. Branch offices and licence dates will be added from the licensing department.</p>
      </div>
    </section>
  );
}

/* ─────────────────────────── Details drawer ─────────────────────────── */

function Details({ id, onClose }: { id: string | null; onClose: () => void }) {
  const o = operators.find((x) => x.id === id);
  const rowCls = cn("group flex min-h-14 items-center gap-3 px-5 py-3 font-semibold text-[#0A2E10] transition hover:bg-[#F7FAF6]", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]");
  return (
    <Drawer open={!!o} onClose={onClose} labelledBy="op-name">
      {o && (
        <>
          <div className={cn(featured, "rounded-none px-6 pb-8 pt-7 sm:px-8")}>
            <GridBackdrop />
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#CB9615]/25 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <Monogram o={o} size="lg" className="ring-4 ring-white/20" />
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#CB9615] px-3 py-1 text-xs font-bold text-[#1A1206]">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Licensed
                </span>
                <p className="mt-1.5 text-sm font-semibold text-white/85">{typeInfo[o.type].label}</p>
              </div>
            </div>
            <h2 id="op-name" className="relative mt-5 text-2xl font-bold leading-snug sm:text-[1.75rem]">
              {o.name}
            </h2>
            <p className="relative mt-2 leading-relaxed text-white/85">{typeInfo[o.type].role}</p>
          </div>
          <div className="space-y-6 px-6 py-7 sm:px-8">
            <dl className={listPanel}>
              {[
                { icon: UserRound, k: "Managing director", v: o.md },
                { icon: MapPin, k: "Head office", v: o.address },
                { icon: Phone, k: "Phone", v: o.phones.length ? o.phones.join(" · ") : "Not published" },
                { icon: Mail, k: "Email", v: o.emails.join(" · ") },
                { icon: Globe, k: "Website", v: o.website },
              ].map((r) => (
                <div key={r.k} className="flex gap-4 px-5 py-4">
                  <Tile icon={r.icon} size="sm" />
                  <div className="min-w-0">
                    <dt className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">{r.k}</dt>
                    <dd className="mt-0.5 break-words font-medium text-[#0A2E10]">{r.v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <ContactActions o={o} />
            {o.type === "PFA" && (
              <div className={listPanel}>
                <Link to="/performance" onClick={onClose} className={rowCls}>
                  <Tile icon={BarChart3} size="sm" />
                  <span className="flex-1">Compare performance</span>
                  <Arrow className="text-[#117F21]" />
                </Link>
                <Link to="/services#rsa-transfer" onClick={onClose} className={rowCls}>
                  <Tile icon={ArrowLeftRight} size="sm" />
                  <span className="flex-1">How to transfer to this PFA</span>
                  <Arrow className="text-[#117F21]" />
                </Link>
              </div>
            )}
            <p className="rounded-2xl bg-[#F4F7F2] p-4 text-sm leading-relaxed text-gray-600">Details as published on PenCom’s register. Share this page’s address to send someone straight to this operator.</p>
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ─────────────────────────── How it works: a numbered process ─────────────────────────── */

const nodes = [
  { icon: UserRound, title: "You and your employer", body: "At least 18% of your pay is set aside each month." },
  { icon: Vault, title: "Pension Fund Custodian", body: "Receives the contributions and holds the assets in trust." },
  { icon: Wallet, title: "Pension Fund Administrator", body: "Invests your savings and pays your benefits when you retire." },
];

function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section id="how" aria-labelledby="how-title" className={cn(sectionCls, "bg-gradient-to-b from-white via-[#F4F7F2] to-white")}>
      <div className="mx-auto max-w-7xl">
        <Headline
          id="how-title"
          kicker="How it works"
          title="Three safeguards around your savings"
          mark="Three safeguards"
          intro="The company that invests your money never holds it. A separate custodian keeps the assets, and PenCom supervises both."
        />
        <Rise className="mt-10">
          <p className="flex w-fit items-center gap-2 rounded-full border border-[#117F21]/20 bg-white px-4 py-2 font-semibold text-[#0A4A13] shadow-sm">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
            PenCom licenses, supervises and inspects every operator
          </p>
        </Rise>
        <ol className="relative mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* The line that runs through the step numbers: grows from left to right on desktop, top to bottom on phones. */}
          <span aria-hidden="true" className="absolute left-6 top-6 hidden h-[3px] w-[calc(66.667%+0.833rem)] -translate-y-1/2 overflow-hidden rounded-full bg-[#117F21]/15 md:block">
            <motion.span className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" initial={{ scaleX: reduce ? 1 : 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1.4, ease }} />
          </span>
          <span aria-hidden="true" className="absolute bottom-6 left-[1.375rem] top-6 w-[3px] overflow-hidden rounded-full bg-[#117F21]/15 md:hidden">
            <motion.span className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-[#117F21] to-[#CB9615]" initial={{ scaleY: reduce ? 1 : 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1.4, ease }} />
          </span>
          {nodes.map((n, i) => (
            <li key={n.title} className="relative flex gap-4 md:block">
              <Rise delay={0.15 + i * 0.2} className="relative z-10 shrink-0">
                <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#04240A] text-lg font-bold tabular-nums text-[#F4D27A] ring-4 ring-white shadow-[0_10px_24px_-10px_rgba(4,36,10,0.8)]">
                  {i + 1}
                </span>
              </Rise>
              <Rise delay={0.2 + i * 0.2} className="min-w-0 flex-1 md:mt-5">
                <div className={cn(card, "group h-full p-6")}>
                  <Tile icon={n.icon} />
                  <h3 className="mt-4 text-xl font-bold text-[#0A2E10]">{n.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{n.body}</p>
                </div>
              </Rise>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex flex-wrap gap-2 text-sm font-medium text-gray-700 md:justify-center">
          <span className="rounded-full border border-gray-200 bg-[#F7FAF6] px-3 py-1">Contributions flow to the custodian →</span>
          <span className="rounded-full border border-gray-200 bg-[#F7FAF6] px-3 py-1">← Investment instructions come from the PFA</span>
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────── RSA funds: the dark band ─────────────────────────── */

function Funds() {
  const [age, setAge] = useState(35);
  const [status, setStatus] = useState<"working" | "retired" | "ppp">("working");
  const [nonInterest, setNonInterest] = useState(false);
  const yours = nonInterest ? "VI" : status === "retired" ? "IV" : status === "ppp" ? "V" : age >= 50 ? "III" : "II";
  const options = !nonInterest && status === "working" && age < 50 ? ["I"] : [];
  const pct = ((age - 18) / 52) * 100;

  return (
    <DarkBand id="funds" labelledBy="funds-title">
      <Headline id="funds-title" kicker="RSA funds" title="Which fund is your money in?" mark="your money" intro="Every PFA runs the same set of RSA funds. Which one you’re in depends on your age and situation. Try it." dark />
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit lg:sticky lg:top-[170px] lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-[#0A2E10] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] sm:p-7">
            <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
            <fieldset>
              <legend className="text-lg font-bold">I am…</legend>
              <LayoutGroup id="fund-status">
                <div className="mt-3 grid grid-cols-1 gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-gray-200">
                  {([["working", "Working"], ["retired", "Retired"], ["ppp", "Self-employed (PPP)"]] as const).map(([v, l]) => {
                    const on = status === v;
                    return (
                      <label
                        key={v}
                        className={cn(
                          "relative flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-4 font-semibold transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-[#FFD84D]",
                          on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6]",
                        )}
                      >
                        {on && <motion.span layoutId="fund-status-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                        <input type="radio" name="fund-status" value={v} checked={on} onChange={() => setStatus(v)} className="sr-only" />
                        <span aria-hidden="true" className={cn("relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", on ? "border-[#F4D27A]" : "border-gray-400")}>
                          {on && <span className="h-2.5 w-2.5 rounded-full bg-[#F4D27A]" />}
                        </span>
                        <span className="relative">{l}</span>
                      </label>
                    );
                  })}
                </div>
              </LayoutGroup>
            </fieldset>
            <div className={cn("mt-6 transition-opacity", status !== "working" && "pointer-events-none opacity-40")}>
              <label htmlFor="fund-age" className="flex items-baseline justify-between text-lg font-bold">
                My age
                <span className="rounded-lg bg-[#E8F5E9] px-3 py-0.5 font-bold tabular-nums text-[#0A4A13]">{age}</span>
              </label>
              <input
                id="fund-age"
                type="range"
                min={18}
                max={70}
                value={age}
                disabled={status !== "working"}
                onChange={(e) => setAge(Number(e.target.value))}
                className={cn("mt-4 h-2.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-[#FFD84D]", thumb)}
                style={{ background: `linear-gradient(to right, #117F21, #CB9615 ${pct}%, #E5E7EB ${pct}%)` }}
              />
            </div>
            <label className="mt-6 flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-gray-200/80 bg-[#F4F7F2] p-4">
              <input type="checkbox" checked={nonInterest} onChange={(e) => setNonInterest(e.target.checked)} className="h-5 w-5 shrink-0 accent-[#117F21]" />
              <span className="font-semibold">I want non-interest (ethical) investments</span>
            </label>
            <p className="mt-5 text-sm leading-relaxed text-gray-600">A simplified guide. Your PFA can confirm which fund you are in and help you move between funds where the rules allow.</p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7" aria-live="polite">
          {funds.map((f) => {
            const mine = f.key === yours;
            const open = options.includes(f.key);
            return (
              <motion.li
                key={f.key}
                layout
                className={cn(
                  "relative overflow-hidden rounded-3xl p-6 ring-1 backdrop-blur-sm transition-[background-color,box-shadow,color] duration-300",
                  mine ? "bg-white text-[#0A2E10] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] ring-transparent" : open ? "bg-white/[0.09] ring-[#F4D27A]/60" : "bg-white/[0.06] ring-white/10",
                )}
              >
                {mine && <motion.span layoutId="fund-mine-bar" aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#CB9615]" />}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={cn("text-2xl font-black tabular-nums", mine ? "text-[#0A4A13]" : "text-[#F4D27A]")}>Fund {f.key}</span>
                  {mine && <span className="rounded-full bg-[#04240A] px-3 py-1 text-xs font-bold text-[#F4D27A]">Your fund</span>}
                  {open && <span className="rounded-full px-3 py-1 text-xs font-bold text-[#F4D27A] ring-1 ring-[#F4D27A]/70">You can choose this</span>}
                </div>
                <p className={cn("mt-3 font-semibold", mine ? "text-[#0A2E10]" : "text-white")}>{f.who}</p>
                <p className={cn("mt-1 text-sm leading-relaxed", mine ? "text-gray-600" : "text-white/80")}>{f.note}</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </DarkBand>
  );
}

/* ─────────────────────────── Performance + complaints ─────────────────────────── */

function Performance() {
  return (
    <section id="performance" aria-labelledby="perf-title" className={cn(sectionCls, "pb-24")}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-12">
        <Rise className="lg:col-span-8">
          <Tilt className="h-full" max={4}>
            <div className={cn(featured, "h-full p-7 sm:p-10")}>
              <GridBackdrop />
              <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#CB9615]/20 blur-3xl" />
              {/* Decorative bars that grow when the card comes into view. */}
              <div aria-hidden="true" className="absolute bottom-8 right-8 hidden h-24 items-end gap-2 sm:flex">
                {[40, 62, 50, 78, 92].map((h, i) => (
                  <motion.span key={i} className="w-3 origin-bottom rounded-t bg-gradient-to-t from-[#117F21] to-[#F4D27A]/80" style={{ height: `${h}%` }} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease }} />
                ))}
              </div>
              <div className="relative sm:pr-24">
                <Headline id="perf-title" kicker="Performance and reporting" title="Compare PFA performance and fees" mark="performance and fees" stacked dark />
                <p className="mt-4 max-w-xl leading-relaxed text-white/85 sm:text-lg">Returns by fund, assets under management and published fees, with the data to download. Past returns don’t guarantee future returns.</p>
                <Link to="/performance" className={cn("group mt-7", goldBtn)}>
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                  See industry performance
                  <Arrow />
                </Link>
              </div>
            </div>
          </Tilt>
        </Rise>
        <Rise delay={0.08} className="lg:col-span-4">
          <div className={cn(card, "relative flex h-full flex-col overflow-hidden p-7 sm:p-8")}>
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B52026]" />
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDE8E8] text-[#B52026]">
              <MessageSquareWarning className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-[#0A2E10]">Problem with an operator?</h2>
            <p className="mt-2 leading-relaxed text-gray-600">Complain to the operator first. If it isn’t resolved, or someone unlicensed approaches you, tell PenCom.</p>
            <div className="mt-auto pt-6">
              <Link to="/connect#report" className={cn("group w-full sm:w-auto", outlineBtn)}>
                <Building2 className="h-5 w-5" aria-hidden="true" />
                Report to PenCom
                <Arrow />
              </Link>
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}

