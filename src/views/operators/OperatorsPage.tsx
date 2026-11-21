"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight, ArrowRight, BadgeCheck, BarChart3, Building2, Globe, Landmark, LayoutGrid, List, Mail, MapPin, MessageSquareWarning, Phone, Search,
  ShieldAlert, ShieldCheck, UserRound, Vault, Wallet, X,
} from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "@/lib/router";
import { cn } from "@/lib/utils";
import { CountUp, scrollToId } from "@/views/about/primitives";
import Headline from "@/views/theme/Headline";
import { DarkBackdrop, Drawer, FramedPanel, PageHero, Rise, SectionNav, ease, focus, sectionCls } from "@/views/theme/ui";
import { funds, operators, relatedBodies, typeInfo, type Operator, type OperatorType } from "./data";

/**
 * Pension operators, calm theme (brief §6.2 Operators and the "Operator directory and details" template;
 * DES-28, DES-29, DES-30). Hero with a "Is this company licensed?" check → directory (type tabs, search, city,
 * card or list view; each operator opens a details panel with a shareable ?op= link) → how the three safeguards
 * work → which RSA fund you are in → performance and complaints. Old links (#pfas, #pfcs, #cpfas, #penop …) open
 * the matching tab.
 */

type Tab = OperatorType | "Related";
const tabFor: Record<string, Tab> = { pfas: "PFA", "pfa-addresses": "PFA", pfcs: "PFC", cpfas: "CPFA", penop: "Related", ptad: "Related", related: "Related" };

const onThisPage = [
  { id: "directory", label: "Directory" },
  { id: "how", label: "How it works" },
  { id: "funds", label: "RSA funds" },
  { id: "performance", label: "Performance" },
];

/** The calm card: white, thin ring; on hover it lifts 4 px, gets a green ring and a soft green shadow. */
const calmCard =
  "group relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]";
/** Large gold primary and green outline buttons. */
const goldBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-semibold text-[#1A1206] shadow-[0_14px_30px_-18px_rgba(122,82,0,0.8)] transition hover:bg-[#FFE08F]";
const outlineBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white";
/** Large round thumb (28 px) for the age slider, as on the services calculator. */
const thumb = [
  "[&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#117F21] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md",
  "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[#117F21] [&::-moz-range-thumb]:bg-white",
].join(" ");

/** Dark-green icon tile with a gold icon that tips on card hover. */
function IconTile({ icon: Icon, className }: { icon: typeof Phone; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]", className)}>
      <Icon className="h-7 w-7" />
    </span>
  );
}

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
const tones = ["bg-[#0A4A13] text-[#F4D27A]", "bg-[#117F21] text-white", "bg-[#CB9615] text-[#1A1206]", "bg-[#E8F5E9] text-[#0A4A13]"];
const tone = (id: string) => tones[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length];

function Monogram({ o, size = "md", className }: { o: Operator; size?: "md" | "lg"; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center rounded-2xl font-bold", tone(o.id), size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-base", className)}>
      {initials(o.name) || o.name[0]}
    </span>
  );
}

function ContactActions({ o, compact = false, grid = false }: { o: Operator; compact?: boolean; grid?: boolean }) {
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
            "inline-flex items-center justify-center gap-1.5 rounded-full bg-white font-semibold text-[#0A4A13] ring-1 ring-[#117F21]/40 transition hover:bg-[#0A4A13] hover:text-white hover:ring-[#0A4A13]",
            compact ? "min-h-11 px-3 text-base" : "min-h-12 px-4 text-lg",
            focus,
          )}
        >
          <it.icon className="h-4 w-4" aria-hidden="true" />
          {it.text}
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
      <div className="bg-[#FBF8F1] text-[#14261A]">
        <Hero onOpen={open} />
        <SectionNav sections={onThisPage} pillId="ops-nav-pill" />
        <Directory onOpen={open} tabHint={tabHint} />
        <HowItWorks />
        <Funds />
        <Performance />
        <Details id={params.get("op")} onClose={() => open(null)} />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Hero + licence check ─────────────────────────── */

function Hero({ onOpen }: { onOpen: (id: string) => void }) {
  const [q, setQ] = useState("");
  const term = norm(q);
  const matches = useMemo(() => (term.length < 3 ? [] : operators.filter((o) => norm(o.name).includes(term))), [term]);
  const state = term.length < 3 ? "idle" : matches.length ? "found" : "none";
  const count = (t: OperatorType) => operators.filter((o) => o.type === t).length;

  return (
    <PageHero
      id="ops-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Operators" }]}
      pill={{ icon: ShieldCheck, label: "Licensed by PenCom" }}
      title="The companies that look after your pension"
      mark="your pension"
      intro="Find, compare and contact every Pension Fund Administrator, Pension Fund Custodian and Closed Pension Fund Administrator licensed by the Commission."
      actions={
        <dl className="grid max-w-lg grid-cols-3 gap-3">
          {(["PFA", "PFC", "CPFA"] as const).map((t) => (
            <div key={t} className="rounded-3xl bg-white px-4 py-4 ring-1 ring-black/10 sm:px-5">
              <dt className="text-base font-semibold text-[#0A4A13]">{typeInfo[t].short}</dt>
              <dd className="mt-1 text-4xl font-bold tabular-nums text-[#14261A]">
                <CountUp value={String(count(t))} duration={1.2} />
              </dd>
            </div>
          ))}
        </dl>
      }
      aside={
        <FramedPanel className="p-6 sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#E8F5E9]" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <IconTile icon={BadgeCheck} />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0A4A13]">Licence check</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">Is this company licensed?</h2>
              </div>
            </div>
            <p className="mt-4 text-lg text-gray-700">Check a name before you hand over your details.</p>
            <label htmlFor="verify-q" className="mt-5 block text-lg font-semibold">
              Company name
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-[#FBF8F1] px-4 ring-1 ring-black/15 focus-within:ring-2 focus-within:ring-[#117F21]">
              <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
              <input id="verify-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type at least 3 letters, e.g. “Leadway”" autoComplete="off" className="min-h-14 w-full min-w-0 bg-transparent text-lg placeholder:text-gray-500 focus:outline-none" />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-white", focus)}>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div aria-live="polite" className="mt-4 min-h-[9.5rem]">
              <AnimatePresence mode="wait" initial={false}>
                {state === "idle" && (
                  <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl bg-[#F1EFE8] p-4 text-lg leading-relaxed text-gray-700">
                    Only companies on PenCom’s register may open RSAs, hold pension assets or collect contributions.
                  </motion.p>
                )}
                {state === "found" && (
                  <motion.ul key="found" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                    {matches.slice(0, 3).map((o) => (
                      <li key={o.id}>
                        <button type="button" onClick={() => onOpen(o.id)} className={cn("group flex min-h-14 w-full items-center gap-3 rounded-2xl bg-[#E8F5E9] p-3 text-left transition hover:bg-[#0A4A13] hover:text-white", focus)}>
                          <ShieldCheck className="h-6 w-6 shrink-0 text-[#117F21] group-hover:text-[#F4D27A]" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-lg font-bold">{o.name}</span>
                            <span className="block text-base opacity-80">Licensed {typeInfo[o.type].label}</span>
                          </span>
                          <Arrow />
                        </button>
                      </li>
                    ))}
                    {matches.length > 3 && <li className="px-1 text-base text-gray-600">and {matches.length - 3} more in the directory below</li>}
                  </motion.ul>
                )}
                {state === "none" && (
                  <motion.div key="none" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3 rounded-2xl bg-[#FDE8E8] p-4 text-[#5C1013]">
                    <ShieldAlert className="h-6 w-6 shrink-0" aria-hidden="true" />
                    <p className="text-lg leading-relaxed">
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
        </FramedPanel>
      }
    />
  );
}

/* ─────────────────────────── Directory ─────────────────────────── */

/** A labelled group of pill buttons in the directory toolbar. */
function ToolGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span aria-hidden="true" className="text-base font-semibold text-gray-700">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

const toolBtn = (on: boolean) =>
  cn(
    "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-base font-semibold transition",
    on ? "bg-[#0A4A13] text-white" : "bg-white text-[#0A4A13] ring-1 ring-[#117F21]/40 hover:bg-[#E8F5E9]",
    focus,
  );

function Directory({ onOpen, tabHint }: { onOpen: (id: string) => void; tabHint: Tab | null }) {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>("PFA");
  const [q, setQ] = useState("");
  const [city, setCity] = useState<"All" | "Lagos" | "Abuja">("All");
  const [view, setView] = useState<"grid" | "list">("grid");

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
    <section id="directory" aria-labelledby="directory-title" className={cn(sectionCls, "bg-white")}>
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

        <div className="mt-10 rounded-3xl bg-[#FBF8F1] p-3 ring-1 ring-black/10 sm:p-4">
          <LayoutGroup id="ops-tabs">
            <div role="tablist" aria-label="Type of operator" className="flex flex-wrap gap-1.5 rounded-2xl bg-white p-1.5 ring-1 ring-black/[0.06]">
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
                    className={cn("relative flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-lg font-semibold transition sm:flex-none", on ? "text-white" : "text-[#14261A] hover:bg-[#E8F5E9]", focus)}
                  >
                    {on && <motion.span layoutId="ops-tab-pill" className="absolute inset-0 rounded-xl bg-[#0A4A13]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <span className="relative">{t.label}</span>
                    <span className={cn("relative rounded-full px-2 text-base tabular-nums", on ? "bg-[#F4D27A] text-[#1A1206]" : "bg-[#E8F5E9] text-[#0A4A13]")}>{t.n}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
          {tab !== "Related" && (
            <div className="mt-3 flex flex-col gap-4 px-1 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 lg:max-w-md">
                <label htmlFor="ops-q" className="sr-only">
                  Search operators
                </label>
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 ring-1 ring-black/15 focus-within:ring-2 focus-within:ring-[#117F21]">
                  <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                  <input id="ops-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or address" className="min-h-12 w-full min-w-0 bg-transparent text-lg placeholder:text-gray-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <ToolGroup label="City">
                  {(["All", "Lagos", "Abuja"] as const).map((c) => (
                    <button key={c} type="button" aria-pressed={city === c} onClick={() => setCity(c)} className={toolBtn(city === c)}>
                      {c}
                    </button>
                  ))}
                </ToolGroup>
                <ToolGroup label="Layout">
                  {([["grid", LayoutGrid, "Cards"], ["list", List, "List"]] as const).map(([v, Icon, label]) => (
                    <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={toolBtn(view === v)}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </ToolGroup>
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
                    <div className={cn(calmCard, "flex h-full gap-5 p-6 sm:p-7")}>
                      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />
                      <IconTile icon={Landmark} className="relative" />
                      <span className="relative">
                        <span className="block text-sm font-bold uppercase tracking-[0.18em] text-[#117F21]">{b.short}</span>
                        <span className="mt-1 block text-xl font-bold tracking-tight">{b.name}</span>
                        <span className="mt-2 block text-lg leading-relaxed text-gray-700">{b.body}</span>
                      </span>
                    </div>
                  </Rise>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="mb-4 px-1 text-lg text-gray-700" aria-live="polite">
                {list.length} {list.length === 1 ? typeInfo[tab].label : typeInfo[tab].plural}
                {city !== "All" && ` in ${city}`}
                {q && ` matching “${q}”`}
              </p>
              {list.length === 0 ? (
                <div className="rounded-3xl bg-[#FBF8F1] px-6 py-14 text-center ring-1 ring-black/10">
                  <Search className="mx-auto h-8 w-8 text-[#117F21]" aria-hidden="true" />
                  <p className="mt-3 text-xl font-bold">No operator matches</p>
                  <button type="button" onClick={() => { setQ(""); setCity("All"); }} className={cn("mt-5", outlineBtn, focus)}>
                    <X className="h-5 w-5" aria-hidden="true" />
                    Clear filters
                  </button>
                </div>
              ) : (
                <motion.ul layout className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {list.map((o) => (
                      <motion.li key={`${view}-${o.id}`} layout initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.3, ease }}>
                        {view === "grid" ? (
                          <article className={cn(calmCard, "flex h-full flex-col p-6")}>
                            <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />
                            <div className="relative flex items-start gap-3">
                              <Monogram o={o} />
                              <div className="min-w-0">
                                <h3 className="text-xl font-bold leading-snug tracking-tight">
                                  <button type="button" onClick={() => onOpen(o.id)} className={cn("text-left after:absolute after:inset-0 after:rounded-3xl after:content-[''] group-hover:text-[#0A4A13]", focus)}>
                                    {o.name}
                                  </button>
                                </h3>
                                <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-2.5 py-0.5 text-sm font-bold text-[#0A4A13]">
                                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                                  Licensed
                                </p>
                              </div>
                            </div>
                            <dl className="relative mb-5 mt-4 space-y-2 text-base text-gray-700">
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
                            <div className="mt-auto border-t border-black/[0.06] pt-4">
                              <ContactActions o={o} compact grid />
                            </div>
                          </article>
                        ) : (
                          <article className={cn(calmCard, "flex items-center gap-4 p-4")}>
                            <Monogram o={o} />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-bold">
                                <button type="button" onClick={() => onOpen(o.id)} className={cn("text-left after:absolute after:inset-0 after:rounded-3xl after:content-[''] group-hover:text-[#0A4A13]", focus)}>
                                  {o.name}
                                </button>
                              </h3>
                              <p className="truncate text-base text-gray-700">
                                {o.city} · {o.md}
                              </p>
                            </div>
                            <div className="hidden lg:block">
                              <ContactActions o={o} compact />
                            </div>
                            <Arrow className="text-[#117F21]" />
                          </article>
                        )}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </>
          )}
        </div>
        <p className="mt-6 text-base text-gray-600">Operator details as published on PenCom’s register of licensed operators. Branch offices and licence dates will be added from the licensing department.</p>
      </div>
    </section>
  );
}

/* ─────────────────────────── Details panel ─────────────────────────── */

function Details({ id, onClose }: { id: string | null; onClose: () => void }) {
  const o = operators.find((x) => x.id === id);
  const linkCls = cn(calmCard, "flex min-h-16 items-center gap-3 p-4 text-[#14261A]", focus);
  return (
    <Drawer open={!!o} onClose={onClose} labelledBy="op-name">
      {o && (
        <>
          <div className="relative isolate overflow-hidden bg-[#E8F5E9] px-6 pb-8 pt-7 sm:px-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-[#F4D27A]/40 blur-2xl" />
            <div className="flex items-center gap-4">
              <Monogram o={o} size="lg" className="ring-4 ring-white" />
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0A4A13] px-3 py-1 text-sm font-bold text-[#F4D27A]">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Licensed
                </span>
                <p className="mt-1.5 text-base font-semibold text-[#0A4A13]">{typeInfo[o.type].label}</p>
              </div>
            </div>
            <h2 id="op-name" className="mt-5 text-2xl font-bold leading-snug tracking-tight text-[#14261A] sm:text-[1.75rem]">
              {o.name}
            </h2>
            <p className="mt-2 text-lg leading-relaxed text-gray-700">{typeInfo[o.type].role}</p>
          </div>
          <div className="space-y-7 px-6 py-7 sm:px-8">
            <dl className="space-y-5">
              {[
                { icon: UserRound, k: "Managing director", v: o.md },
                { icon: MapPin, k: "Head office", v: o.address },
                { icon: Phone, k: "Phone", v: o.phones.length ? o.phones.join(" · ") : "Not published" },
                { icon: Mail, k: "Email", v: o.emails.join(" · ") },
                { icon: Globe, k: "Website", v: o.website },
              ].map((r) => (
                <div key={r.k} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A]">
                    <r.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm font-bold uppercase tracking-[0.16em] text-gray-600">{r.k}</dt>
                    <dd className="mt-0.5 break-words text-lg font-medium">{r.v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <ContactActions o={o} />
            {o.type === "PFA" && (
              <div className="grid gap-3">
                <Link to="/performance" onClick={onClose} className={linkCls}>
                  <BarChart3 className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
                  <span className="flex-1 text-lg font-semibold">Compare performance</span>
                  <Arrow className="text-[#117F21]" />
                </Link>
                <Link to="/services#rsa-transfer" onClick={onClose} className={linkCls}>
                  <ArrowLeftRight className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
                  <span className="flex-1 text-lg font-semibold">How to transfer to this PFA</span>
                  <Arrow className="text-[#117F21]" />
                </Link>
              </div>
            )}
            <p className="rounded-2xl bg-[#F1EFE8] p-4 text-base leading-relaxed text-gray-700">Details as published on PenCom’s register. Share this page’s address to send someone straight to this operator.</p>
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ─────────────────────────── How it works ─────────────────────────── */

const nodes = [
  { icon: UserRound, title: "You and your employer", body: "At least 18% of your pay is set aside each month." },
  { icon: Vault, title: "Pension Fund Custodian", body: "Receives the contributions and holds the assets in trust." },
  { icon: Wallet, title: "Pension Fund Administrator", body: "Invests your savings and pays your benefits when you retire." },
];

function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section id="how" aria-labelledby="how-title" className={sectionCls}>
      <div className="mx-auto max-w-7xl">
        <Headline id="how-title" kicker="How it works" title="Three safeguards around your savings" mark="Three safeguards" intro="The company that invests your money never holds it. A separate custodian keeps the assets, and PenCom supervises both." />
        <Rise className="mt-10">
          <div className="rounded-[2rem] bg-[#F1EFE8] p-5 sm:p-8 lg:p-10">
            <p className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-center text-lg font-semibold text-[#0A4A13] ring-1 ring-[#117F21]/30">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
              PenCom licenses, supervises and inspects every operator
            </p>
            <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-0">
              {nodes.map((n, i) => (
                <li key={n.title} className="relative md:px-4">
                  {i > 0 && (
                    <span aria-hidden="true" className="absolute left-0 top-1/2 hidden h-[3px] w-8 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#117F21]/25 md:block">
                      {!reduce && (
                        <motion.span className="absolute inset-y-0 w-3 rounded-full bg-[#CB9615]" initial={{ left: "-40%" }} whileInView={{ left: "110%" }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeInOut", delay: 0.4 + i * 0.3 }} />
                      )}
                    </span>
                  )}
                  <div className={cn(calmCard, "h-full p-6 sm:p-7")}>
                    <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />
                    <IconTile icon={n.icon} className="relative" />
                    <h3 className="relative mt-5 text-xl font-bold tracking-tight">{n.title}</h3>
                    <p className="relative mt-2 text-lg leading-relaxed text-gray-700">{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-1 text-center text-base font-medium text-gray-700">
              <span>Contributions flow to the custodian →</span>
              <span>← Investment instructions come from the PFA</span>
            </p>
          </div>
        </Rise>
      </div>
    </section>
  );
}

/* ─────────────────────────── RSA funds ─────────────────────────── */

function Funds() {
  const [age, setAge] = useState(35);
  const [status, setStatus] = useState<"working" | "retired" | "ppp">("working");
  const [nonInterest, setNonInterest] = useState(false);
  const yours = nonInterest ? "VI" : status === "retired" ? "IV" : status === "ppp" ? "V" : age >= 50 ? "III" : "II";
  const options = !nonInterest && status === "working" && age < 50 ? ["I"] : [];
  const pct = ((age - 18) / 52) * 100;

  // The page's one green inset panel: the fund finder is its interactive moment.
  return (
    <section id="funds" aria-labelledby="funds-title" className={cn(sectionCls, "bg-white")}>
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-4 py-8 text-white sm:p-10 lg:p-14">
        <DarkBackdrop />
        <Headline id="funds-title" kicker="RSA funds" title="Which fund is your money in?" mark="your money" intro="Every PFA runs the same set of RSA funds. Which one you’re in depends on your age and situation. Try it." dark />
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-fit lg:sticky lg:top-[170px] lg:col-span-5">
            <div className="rounded-3xl bg-white p-6 text-[#14261A] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] sm:p-8">
              <fieldset>
                <legend className="text-xl font-bold tracking-tight">I am…</legend>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {([["working", "Working"], ["retired", "Retired"], ["ppp", "Self-employed (PPP)"]] as const).map(([v, l]) => {
                    const on = status === v;
                    return (
                      <label
                        key={v}
                        className={cn(
                          "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-4 text-lg font-semibold ring-1 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-[#FFD84D]",
                          on ? "bg-[#0A4A13] text-white ring-[#0A4A13]" : "bg-white text-[#14261A] ring-black/15 hover:ring-2 hover:ring-[#117F21]",
                        )}
                      >
                        <input type="radio" name="fund-status" value={v} checked={on} onChange={() => setStatus(v)} className="sr-only" />
                        <span aria-hidden="true" className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2", on ? "border-[#F4D27A]" : "border-gray-400")}>
                          {on && <span className="h-3 w-3 rounded-full bg-[#F4D27A]" />}
                        </span>
                        {l}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div className={cn("mt-7 transition-opacity", status !== "working" && "pointer-events-none opacity-40")}>
                <label htmlFor="fund-age" className="flex items-baseline justify-between text-xl font-bold tracking-tight">
                  My age
                  <span className="rounded-xl bg-[#E8F5E9] px-3 py-0.5 text-lg font-bold tabular-nums text-[#0A4A13]">{age}</span>
                </label>
                <input
                  id="fund-age"
                  type="range"
                  min={18}
                  max={70}
                  value={age}
                  disabled={status !== "working"}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className={cn("mt-4 h-3 w-full cursor-pointer appearance-none rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-[#FFD84D]", thumb)}
                  style={{ background: `linear-gradient(to right, #117F21 ${pct}%, #E5E7EB ${pct}%)` }}
                />
              </div>
              <label className="mt-7 flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-[#F1EFE8] p-4">
                <input type="checkbox" checked={nonInterest} onChange={(e) => setNonInterest(e.target.checked)} className="h-6 w-6 shrink-0 accent-[#117F21]" />
                <span className="text-lg font-semibold">I want non-interest (ethical) investments</span>
              </label>
              <p className="mt-5 text-base leading-relaxed text-gray-700">A simplified guide. Your PFA can confirm which fund you are in and help you move between funds where the rules allow.</p>
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
                    "relative overflow-hidden rounded-3xl p-6 ring-1 transition-[background-color,box-shadow,color] duration-300",
                    mine
                      ? "bg-white text-[#14261A] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] ring-transparent"
                      : open
                        ? "bg-white/[0.09] ring-[#F4D27A]/60"
                        : "bg-white/[0.07] ring-white/10",
                  )}
                >
                  {mine && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-[#F4D27A]" />}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={cn("text-2xl font-bold tabular-nums", mine ? "text-[#0A4A13]" : "text-[#F4D27A]")}>Fund {f.key}</span>
                    {mine && <span className="rounded-full bg-[#0A4A13] px-3 py-1 text-sm font-bold text-[#F4D27A]">Your fund</span>}
                    {open && <span className="rounded-full px-3 py-1 text-sm font-bold text-[#F4D27A] ring-1 ring-[#F4D27A]/70">You can choose this</span>}
                  </div>
                  <p className={cn("mt-3 text-lg font-semibold", mine ? "text-[#14261A]" : "text-white")}>{f.who}</p>
                  <p className={cn("mt-1 text-base leading-relaxed", mine ? "text-gray-700" : "text-white/80")}>{f.note}</p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Performance + complaints ─────────────────────────── */

function Performance() {
  return (
    <section id="performance" aria-labelledby="perf-title" className={cn(sectionCls, "pb-24")}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-12">
        <Rise className="lg:col-span-8">
          <div className="relative h-full overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_30px_60px_-36px_rgba(10,74,19,0.45)] ring-1 ring-black/10 sm:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#E8F5E9]" />
            <BarChart3 aria-hidden="true" className="pointer-events-none absolute right-8 top-8 hidden h-20 w-20 text-[#117F21]/25 sm:block" />
            <div className="relative">
              <Headline id="perf-title" kicker="Performance and reporting" title="Compare PFA performance and fees" mark="performance and fees" stacked />
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-700">Returns by fund, assets under management and published fees, with the data to download. Past returns don’t guarantee future returns.</p>
              <Link to="/performance" className={cn("mt-7", goldBtn, focus)}>
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
                See industry performance
                <Arrow />
              </Link>
            </div>
          </div>
        </Rise>
        <Rise delay={0.08} className="lg:col-span-4">
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white p-7 ring-1 ring-black/10 sm:p-8">
            <span aria-hidden="true" className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-[#B52026]/70" />
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B52026] text-white">
              <MessageSquareWarning className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">Problem with an operator?</h2>
            <p className="mt-2 text-lg leading-relaxed text-gray-700">Complain to the operator first. If it isn’t resolved, or someone unlicensed approaches you, tell PenCom.</p>
            <div className="mt-auto pt-6">
              <Link to="/connect#report" className={cn(outlineBtn, "w-full sm:w-auto", focus)}>
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
