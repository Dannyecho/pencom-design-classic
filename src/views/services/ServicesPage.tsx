"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  Banknote,
  BadgeCheck,
  BookOpen,
  Calculator as CalcIcon,
  Check,
  CircleHelp,
  ClipboardList,
  Clock,
  ExternalLink,
  FileCheck,
  HeartPulse,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  LogOut,
  MapPin,
  MessageCircle,
  MessageSquareWarning,
  RefreshCw,
  Scale,
  ShieldAlert,
  Store,
  UserCheck,
  UserPlus,
  UserRoundCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "@/lib/router";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight, Tilt, scrollToId } from "@/views/about/primitives";
import { openChat } from "@/views/home/SiteSearch";
import Headline from "@/views/theme/Headline";
import {
  ClosingLinks,
  FloatingBar,
  Modal,
  PhotoBanner,
  PortalLayout,
  Rise,
  Tile,
  card,
  ease,
  featured,
  focus,
  goldBtn,
  outlineBtn,
  outlineDarkBtn,
  type NavSection,
} from "@/views/theme/ui";
import Calculator from "./Calculator";
import { anchorAlias, journeys, portals, type Journey } from "./data";

/**
 * Services, classic theme (a portal page; brief §6.2, templates "Guided service journey" and "Online services hub";
 * DES-25, DES-26). Contributor photo banner → a floating "I want to…" picker with the most used services → the
 * sticky SideNav beside the step-by-step journeys (the homepage AudienceTasks pattern: vertical tabs and a panel
 * with who it's for, an eligibility check, numbered steps and where to go next), the online portals (homepage
 * portal cards, each with a "before you leave this site" screen) and help (the homepage HelpFaq column, the
 * assistant as the featured card) → the pension calculator as the page's dark band → closing link cards.
 * Old links (/services#pcc, #ppp, #rsa-transfer, #micro, #ehub …) open the matching journey or section.
 */

const icons: Record<string, LucideIcon> = {
  "user-plus": UserPlus,
  transfer: ArrowLeftRight,
  retiree: UserRoundCheck,
  certificate: Award,
  store: Store,
  complaint: MessageSquareWarning,
};
const portalIcons: Record<string, LucideIcon> = {
  ehub: FileCheck,
  pcrs: Banknote,
  cobra: UserCheck,
  pencap: RefreshCw,
  pencare: HeartPulse,
  ppp: Store,
};

/** Sections inside the portal grid: grey rule between them, scroll margin for the header and phone bar. */
const portalSec = "scroll-mt-[150px] border-t border-gray-100 py-14 first:border-t-0 sm:py-16";

/** Small uppercase label above each part of a journey. */
function Label({ children, icon: Icon, gold = false }: { children: ReactNode; icon?: LucideIcon; gold?: boolean }) {
  return (
    <h4 className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]", gold ? "text-[#7A5200]" : "text-[#105D1D]")}>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </h4>
  );
}

const verbs: Record<string, string> = {
  "open-rsa": "open a Retirement Savings Account",
  "rsa-transfer": "move my RSA to another PFA",
  retirement: "get my retirement benefits",
  ppp: "save for retirement as a self-employed person",
  pcc: "get a Pension Clearance Certificate",
  enrolment: "enrol my employees",
  pencare: "join Pencare health insurance",
  complaint: "make a complaint",
};

const onThisPage: NavSection[] = [
  { id: "journeys", label: "Step-by-step services", icon: ListChecks },
  { id: "portals", label: "Online services", icon: LayoutGrid },
  { id: "help", label: "Get help", icon: LifeBuoy },
  { id: "calculator", label: "Pension calculator", icon: CalcIcon },
];

const related = [
  { to: "/operators", label: "Find a PFA" },
  { to: "/about/service-charter", label: "Service Charter" },
  { to: "/connect", label: "Contact us" },
];

export default function ServicesPage() {
  const { hash } = useLocation();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(journeys[1].anchor);
  const [handoff, setHandoff] = useState<string | null>(null);

  // /services#pcc → open that journey; #calculator, #portals … → scroll to the section.
  useEffect(() => {
    const raw = hash.replace(/^#/, "");
    if (!raw) return;
    const id = anchorAlias[raw] ?? raw;
    const isJourney = journeys.some((j) => j.anchor === id);
    if (isJourney) setActive(id);
    const t1 = window.setTimeout(() => scrollToId(isJourney ? "journeys" : id, !reduce), 80);
    const t2 = window.setTimeout(() => scrollToId(isJourney ? "journeys" : id, false), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hash, reduce]);

  const choose = (anchor: string, scroll: boolean) => {
    setActive(anchor);
    history.replaceState(null, "", `#${anchor}`);
    if (scroll) scrollToId("journeys", !reduce);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#164D20]">
        <Banner />
        <Picker onPick={(a) => choose(a, true)} />
        <PortalLayout sections={onThisPage} pillId="svc-side-pill" related={related}>
          <Journeys active={active} onChoose={(a) => choose(a, false)} onHandoff={setHandoff} />
          <Portals onHandoff={setHandoff} />
          <Help />
        </PortalLayout>
        <Calculator />
        <ClosingLinks
          items={[
            { to: "/resources", icon: BookOpen, title: "Resources", body: "Publications, forms, FAQ" },
            { to: "/resources/forms-and-checklists", icon: ClipboardList, title: "Forms and checklists", body: "Simple checklists you can print.", tone: "gold" },
            { to: "/regulations", icon: Scale, title: "Regulations", body: "Laws, guidelines, compliance" },
          ]}
        />
        <Handoff portalKey={handoff} onClose={() => setHandoff(null)} />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Banner + picker ─────────────────────────── */

function Banner() {
  const reduce = useReducedMotion();
  return (
    <PhotoBanner
      id="svc-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Services" }]}
      chip={{ icon: ClipboardList, label: "Pension services" }}
      title="What do you need to do?"
      mark="need to do?"
      intro="Choose a service and we’ll take you through it step by step: who it’s for, what to bring, and which office or portal to use."
      image="/images/opt/pencom-contributor-1200.webp"
      srcSet="/images/opt/pencom-contributor-640.webp 640w, /images/opt/pencom-contributor-1080.webp 1080w, /images/opt/pencom-contributor-1200.webp 1200w"
      position="center 28%"
      actions={
        <>
          <button type="button" onClick={() => scrollToId("calculator", !reduce)} className={cn(goldBtn, "group")}>
            <CalcIcon className="h-5 w-5" aria-hidden="true" />
            Pension calculator
          </button>
          <button type="button" onClick={() => scrollToId("portals", !reduce)} className={cn(outlineDarkBtn, "group")}>
            Online services
            <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </button>
        </>
      }
    />
  );
}

/** The floating "I want to…" picker: a select and a gold button, with the most used services as quick chips beside it. */
function Picker({ onPick }: { onPick: (anchor: string) => void }) {
  const [pick, setPick] = useState(journeys[1].anchor);
  return (
    <FloatingBar>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onPick(pick);
          }}
          className="lg:col-span-5"
        >
          <label htmlFor="svc-pick" className="block text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">
            I want to
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <span className="relative min-w-0 flex-1">
              <select
                id="svc-pick"
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                className={cn(
                  "min-h-12 w-full appearance-none truncate rounded-xl border border-gray-300 bg-[#F7FAF6] pl-4 pr-11 font-semibold text-[#164D20] transition hover:border-[#14892A]/50",
                  focus,
                )}
              >
                {journeys.map((j) => (
                  <option key={j.anchor} value={j.anchor}>
                    {verbs[j.anchor] ?? j.short}
                  </option>
                ))}
              </select>
              <ArrowRight aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-[#117F21]" />
            </span>
            <button type="submit" className={cn(goldBtn, "group shrink-0")}>
              Show me how
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </form>
        {/* Hidden on phones: the picker and the journey tabs below offer the same choices. */}
        <div className="hidden sm:block lg:col-span-7 lg:border-l lg:border-gray-100 lg:pl-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-600">Most used services</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {journeys.map((j, i) => {
              const Icon = icons[j.icon] ?? UserPlus;
              return (
                <motion.li key={j.anchor} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 + i * 0.04, ease }}>
                  <button
                    type="button"
                    onClick={() => onPick(j.anchor)}
                    className={cn(
                      "group inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 bg-[#F7FAF6] py-1 pl-1 pr-4 text-sm font-semibold text-[#164D20] transition hover:-translate-y-0.5 hover:border-[#14892A]/40 hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(16,93,29,0.6)]",
                      focus,
                    )}
                  >
                    <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#117F21] shadow-sm transition group-hover:bg-[#14892A] group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    {j.short}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </FloatingBar>
  );
}

/* ─────────────────────────── Journeys ─────────────────────────── */

function Eligibility({ j }: { j: Journey }) {
  const [ans, setAns] = useState<(boolean | null)[]>(j.eligibility!.questions.map(() => null));
  const done = ans.every((a) => a !== null);
  const ok = done && ans.every(Boolean);
  return (
    <div className="rounded-2xl bg-[#F4F7F2] p-4 sm:p-5">
      <p className="flex items-center gap-2 font-bold text-[#164D20]">
        <CircleHelp className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
        {j.eligibility!.intro}
      </p>
      <ol className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200/80 bg-white">
        {j.eligibility!.questions.map((q, i) => (
          <li key={q}>
            <fieldset className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <legend className="sr-only">{q}</legend>
              <span aria-hidden="true" className="flex flex-1 gap-3 leading-snug text-[#164D20]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E8F5E9] text-xs font-bold text-[#105D1D]">{i + 1}</span>
                {q}
              </span>
              <div className="flex shrink-0 gap-1 self-start rounded-xl bg-white p-1 ring-1 ring-gray-200 sm:self-auto">
                {[true, false].map((v) => (
                  <label
                    key={String(v)}
                    className={cn(
                      "flex min-h-11 min-w-[4.5rem] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 font-semibold transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-[#FFD84D]",
                      ans[i] === v ? (v ? "bg-[#14892A] text-white" : "bg-[#B52026] text-white") : "text-gray-700 hover:bg-[#F7FAF6]",
                    )}
                  >
                    <input type="radio" name={`${j.anchor}-q${i}`} className="sr-only" checked={ans[i] === v} onChange={() => setAns((a) => a.map((x, k) => (k === i ? v : x)))} />
                    {ans[i] === v && (v ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" />)}
                    {v ? "Yes" : "No"}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {done && (
            <motion.p
              key={String(ok)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative mt-4 flex gap-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 pl-5 font-medium text-[#164D20]"
            >
              <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", ok ? "bg-[#14892A]" : "bg-[#B52026]")} />
              {ok ? <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" /> : <X className="mt-0.5 h-5 w-5 shrink-0 text-[#B52026]" aria-hidden="true" />}
              {ok ? j.eligibility!.yes : j.eligibility!.no}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Panel({ j, onHandoff }: { j: Journey; onHandoff: (key: string) => void }) {
  const reduce = useReducedMotion();
  const Icon = icons[j.icon] ?? UserPlus;
  const portal = portals.find((p) => p.key === j.portal);
  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -12 }}
      transition={{ duration: 0.3, ease }}
      aria-labelledby={`${j.anchor}-title`}
    >
      {/* Header: the journey's name, who it's for, where and how long */}
      <header className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-[#F4F7F2] via-white to-white p-6 sm:p-8">
        <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#CB9615]/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
          <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#14892A] text-white shadow-[0_14px_30px_-12px_rgba(20,137,42,0.8)]">
            <Icon className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">For {j.audience.toLowerCase()}</p>
            <h3 id={`${j.anchor}-title`} className="mt-1 text-2xl font-bold leading-tight tracking-tight text-[#164D20] sm:text-[1.75rem]">
              {j.title}
            </h3>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">{j.intro}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              <li className="inline-flex min-h-8 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700">
                <MapPin className="h-4 w-4 text-[#117F21]" aria-hidden="true" />
                {j.where}
              </li>
              <li className="inline-flex min-h-8 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700">
                <Clock className="h-4 w-4 text-[#7A5200]" aria-hidden="true" />
                {j.standard ?? j.time}
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="space-y-8 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <Label icon={Users}>Who it’s for</Label>
            <p className="mt-2 leading-relaxed text-gray-600">{j.forWho}</p>
          </div>
          <div>
            <Label>What you need</Label>
            <ul className="mt-3 space-y-2">
              {j.needs.map((n) => (
                <li key={n} className="flex items-start gap-3 leading-snug text-gray-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#E8F5E9] text-[#117F21]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {j.eligibility && <Eligibility key={j.anchor} j={j} />}

        <div>
          <Label>Steps</Label>
          <ol className="relative mt-4 space-y-5">
            <motion.span
              aria-hidden="true"
              initial={{ scaleY: reduce ? 1 : 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="absolute bottom-5 left-[21px] top-5 w-0.5 origin-top rounded-full bg-gradient-to-b from-[#14892A] to-[#CB9615]"
            />
            {j.steps.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.07, ease }}
                className="relative flex gap-4"
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#11421A] text-lg font-bold text-[#F4D27A] ring-4 ring-white">{i + 1}</span>
                <span className="min-w-0 pt-1.5">
                  <span className="block text-lg font-bold leading-snug text-[#164D20]">{s.title}</span>
                  <span className="mt-1 block leading-relaxed text-gray-600">{s.body}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-[#F7FAF6] p-5 pl-6 sm:p-6 sm:pl-7">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#F4D27A] to-[#CB9615]" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Label gold>Where to go next</Label>
              {portal && (
                <>
                  <p className="mt-1.5 text-lg font-bold text-[#164D20]">{portal.full}</p>
                  <p className="mt-0.5 text-gray-600">{portal.use}</p>
                </>
              )}
            </div>
            {portal ? (
              <button type="button" onClick={() => onHandoff(portal.key)} className={cn(goldBtn, "shrink-0")}>
                Go to {portal.name}
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : (
              <Link to={j.link.href.startsWith("#") ? `/services${j.link.href}` : j.link.href} className={cn(goldBtn, "group shrink-0")}>
                {j.link.label}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Journeys({ active, onChoose, onHandoff }: { active: string; onChoose: (a: string) => void; onHandoff: (key: string) => void }) {
  const j = journeys.find((x) => x.anchor === active) ?? journeys[0];

  // Arrow keys move between the tabs (and open the one they land on).
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!n) return;
    e.preventDefault();
    const next = journeys[(i + n + journeys.length) % journeys.length];
    onChoose(next.anchor);
    document.getElementById(`svc-tab-${next.anchor}`)?.focus();
  };

  return (
    <section id="journeys" aria-labelledby="journeys-title" className={portalSec}>
      {/* Old links: /services#pcc, #ppp, #rsa-transfer … */}
      {journeys.map((x) => (
        <span key={x.anchor} id={x.anchor} className="block scroll-mt-[150px]" aria-hidden="true" />
      ))}
      <Headline
        id="journeys-title"
        kicker="Step-by-step services"
        title="Choose a service and we’ll guide you through it"
        mark="guide you through it"
        intro="Each guide says who it’s for, what to bring, the steps, and where to go next. Some have a quick check so you know you’re ready."
      />
      <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div role="tablist" aria-label="Services" aria-orientation="vertical" className="grid grid-cols-2 gap-2 self-start sm:grid-cols-4 xl:sticky xl:top-[116px] xl:col-span-4 xl:grid-cols-1">
          {journeys.map((x, i) => {
            const I = icons[x.icon] ?? UserPlus;
            const on = x.anchor === j.anchor;
            return (
              <button
                key={x.anchor}
                id={`svc-tab-${x.anchor}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls="svc-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => onChoose(x.anchor)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "group relative isolate flex min-h-14 items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition-colors sm:text-[15px]",
                  on ? "text-white" : "bg-gray-50 text-gray-700 hover:bg-[#E8F5E9] hover:text-[#105D1D]",
                  focus,
                )}
              >
                {on && (
                  <motion.span
                    layoutId="svc-tab-pill"
                    className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-[#105D1D] to-[#14892A] shadow-[0_14px_30px_-14px_rgba(16,93,29,0.9)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span aria-hidden="true" className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition", on ? "bg-white/15 text-[#F4D27A]" : "bg-white text-[#117F21] shadow-sm")}>
                  <I className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block leading-snug">{x.short}</span>
                  <span className={cn("hidden text-xs font-medium xl:block", on ? "text-white/80" : "text-gray-600")}>{x.audience}</span>
                </span>
                <ArrowRight aria-hidden="true" className={cn("hidden h-4 w-4 shrink-0 transition xl:block", on ? "opacity-100" : "opacity-0 group-hover:opacity-60")} />
              </button>
            );
          })}
        </div>
        <div id="svc-panel" role="tabpanel" aria-labelledby={`svc-tab-${j.anchor}`} className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_30px_60px_-40px_rgba(16,93,29,0.45)] xl:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            <Panel key={j.anchor} j={j} onHandoff={onHandoff} />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Online services ─────────────────────────── */

function Portals({ onHandoff }: { onHandoff: (key: string) => void }) {
  return (
    <section id="portals" aria-labelledby="portals-title" className={portalSec}>
      <Headline
        id="portals-title"
        kicker="Online services"
        title="Which portal do you need?"
        mark="portal"
        intro="Some PenCom services run on their own websites. Each card says what it’s for, and we’ll tell you what to have ready before you leave this site."
      />
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {portals.map((p, i) => {
          const I = portalIcons[p.key] ?? ExternalLink;
          return (
            <li key={p.key}>
              <Rise delay={(i % 3) * 0.06} className="h-full">
                <Spotlight color="rgba(203,150,21,0.16)" className="h-full rounded-3xl border border-gray-200/80 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#CB9615]/40 hover:shadow-[0_24px_50px_-24px_rgba(16,93,29,0.4)]">
                  <button type="button" onClick={() => onHandoff(p.key)} className={cn("group flex h-full w-full flex-col p-6 text-left", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]")}>
                    <span className="flex w-full items-center justify-between">
                      <Tile icon={I} dark />
                      <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:-translate-y-0.5 group-hover:text-[#7A5200]" aria-hidden="true" />
                    </span>
                    <span className="mt-5 block text-xl font-bold text-[#164D20]">{p.name}</span>
                    <span className="mt-0.5 block text-sm text-gray-600">{p.full}</span>
                    <span className="mt-3 block leading-snug text-gray-700">{p.use}</span>
                    <span className="mt-auto flex w-full flex-wrap items-center justify-between gap-2 pt-5">
                      <span className="font-mono text-xs text-gray-600">{p.url ? new URL(p.url).hostname : "Portal link to be confirmed"}</span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#117F21]">
                        Before you go
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                </Spotlight>
              </Rise>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-gray-600">Descriptions to be confirmed by each portal’s owner before launch.</p>
    </section>
  );
}

/** "Before you leave this site" screen (DES-26): what the portal is for, what to have ready, what happens next. */
function Handoff({ portalKey, onClose }: { portalKey: string | null; onClose: () => void }) {
  const p = portals.find((x) => x.key === portalKey);
  const I = p ? (portalIcons[p.key] ?? ExternalLink) : ExternalLink;
  return (
    <Modal open={!!p} onClose={onClose} labelledBy="handoff-title" className="max-w-lg">
      {p && (
        <>
          <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-[#F4F7F2] via-white to-white p-6 sm:p-7">
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#CB9615]/15 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <Tile icon={I} dark size="lg" />
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  You’re about to leave this site
                </p>
                <h2 id="handoff-title" className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-[#164D20]">
                  {p.full}
                </h2>
              </div>
            </div>
            <p className="relative mt-3 text-gray-700">{p.use}</p>
          </div>
          <div className="space-y-6 p-6 sm:p-7">
            {p.prepare ? (
              <div>
                <Label>Have these ready</Label>
                <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200/80">
                  {p.prepare.map((x) => (
                    <li key={x} className="flex gap-3 px-4 py-3 leading-snug text-gray-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#E8F5E9] text-[#117F21]">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="rounded-2xl bg-[#F4F7F2] p-4 text-gray-700">A checklist for this portal will be added by its owner.</p>
            )}
            {p.next && (
              <div>
                <Label>What happens next</Label>
                <p className="mt-2 text-gray-700">{p.next}</p>
              </div>
            )}
            <p className="relative flex gap-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 pl-5 text-sm leading-relaxed text-[#164D20]">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B45309]" />
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" aria-hidden="true" />
              Check the address bar shows a pencom.gov.ng address before you sign in. PenCom will never ask for your password by phone or SMS.
            </p>
            <div className="flex flex-wrap gap-3">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={onClose} className={goldBtn}>
                  Continue to {p.name}
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <span className="inline-flex min-h-12 items-center rounded-xl bg-[#F4F7F2] px-5 font-semibold text-gray-700">Portal link to be confirmed</span>
              )}
              <button type="button" onClick={onClose} className={outlineBtn}>
                Stay here
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ─────────────────────────── Help ─────────────────────────── */

/** The homepage HelpFaq column: the assistant as the page's featured card (Tilt), then complaint and PFA cards. */
function Help() {
  return (
    <section id="help" aria-labelledby="help-title" className={portalSec}>
      <Headline id="help-title" kicker="Get help" title="Still not sure? We’ll help" mark="We’ll help" />
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Rise className="md:row-span-2">
          <Tilt className="h-full" max={4}>
            <Spotlight color="rgba(244,210,122,0.22)" className={cn(featured, "flex h-full flex-col p-7 sm:p-8")}>
              <GridBackdrop className="opacity-60" />
              <span aria-hidden="true" className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#F4D27A] ring-1 ring-white/20">
                <MessageCircle className="h-7 w-7" />
              </span>
              <h3 className="relative mt-5 text-2xl font-bold">Ask PenCom Assistant</h3>
              <p className="relative mt-2 text-white/85">Quick answers in plain language, from our published guidance.</p>
              <div className="relative mt-auto pt-8">
                <button type="button" onClick={openChat} className={cn(goldBtn, "group")}>
                  Ask a question
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </Spotlight>
          </Tilt>
        </Rise>
        <Rise delay={0.06}>
          <Link
            to="/connect#report"
            className={cn(card, "group relative flex h-full gap-4 overflow-hidden p-6 hover:border-[#B52026]/40 hover:shadow-[0_24px_50px_-24px_rgba(181,32,38,0.35)]", focus)}
          >
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDE8E8] text-[#B52026] transition group-hover:scale-110">
              <MessageSquareWarning className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-bold text-[#164D20]">Report an employer</span>
              <span className="mt-1 block text-gray-600">Deducting pension from your pay but not remitting it? Tell us.</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#B52026]">
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </span>
          </Link>
        </Rise>
        <Rise delay={0.12}>
          <Link to="/operators#pfas" className={cn(card, "group relative flex h-full gap-4 overflow-hidden p-6", focus)}>
            <Tile icon={UserCheck} size="lg" />
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-bold text-[#164D20]">Find a PFA</span>
              <span className="mt-1 block text-gray-600">Contacts for every licensed Pension Fund Administrator.</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#117F21]">
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </span>
          </Link>
        </Rise>
      </div>
    </section>
  );
}
