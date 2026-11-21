"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeftRight,
  ArrowRight,
  Award,
  Banknote,
  BadgeCheck,
  Check,
  CircleHelp,
  Clock,
  ClipboardList,
  ExternalLink,
  FileCheck,
  HeartPulse,
  LogOut,
  MapPin,
  MessageCircle,
  MessageSquareWarning,
  RefreshCw,
  ShieldCheck,
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
import { scrollToId } from "@/views/about/primitives";
import { openChat } from "@/views/home/SiteSearch";
import Headline from "@/views/theme/Headline";
import {
  FramedPanel,
  Modal,
  PageHero,
  Rise,
  SectionNav,
  ease,
  focus,
  sectionCls,
} from "@/views/theme/ui";
import Calculator from "./Calculator";
import { anchorAlias, journeys, portals, type Journey } from "./data";

/**
 * Services, calm theme (brief §6.2; templates "Guided service journey" and "Online services hub";
 * DES-25, DES-26). Light hero with an "I want to…" picker and service tiles → step-by-step journeys (who it's
 * for, eligibility check, what you need, steps as gold number tiles, where to go next) → pension calculator
 * (the page's one green inset panel) → online portals as calm task cards, each with a "before you leave this
 * site" screen → help cards in the homepage TalkToUs style. Old links (/services#pcc, #ppp, #rsa-transfer,
 * #micro, #ehub …) open the matching journey or section.
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

/** The calm card: white, thin ring; on hover it lifts 4 px, gets a green ring and a soft green shadow. */
const calmCard =
  "group relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]";
/** Large gold primary and green outline buttons. */
const goldBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-semibold text-[#1A1206] shadow-[0_14px_30px_-18px_rgba(122,82,0,0.8)] transition hover:bg-[#FFE08F]";
const outlineBtn =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white";

/** Dark-green icon tile with a gold icon that tips on card hover. */
function IconTile({ icon: Icon, small = false }: { icon: LucideIcon; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]",
        small ? "h-12 w-12" : "h-16 w-16",
      )}
    >
      <Icon className={small ? "h-6 w-6" : "h-8 w-8"} />
    </span>
  );
}

/** Small uppercase label above each part of a journey. */
function Label({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#0A4A13]">
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

const onThisPage = [
  { id: "journeys", label: "Step-by-step services" },
  { id: "calculator", label: "Pension calculator" },
  { id: "portals", label: "Online services" },
  { id: "help", label: "Get help" },
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
    const t1 = window.setTimeout(
      () => scrollToId(isJourney ? "journeys" : id, !reduce),
      80,
    );
    const t2 = window.setTimeout(
      () => scrollToId(isJourney ? "journeys" : id, false),
      900,
    );
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
      <div className="bg-[#FBF8F1] text-[#14261A]">
        <Hero onPick={(a) => choose(a, true)} />
        <SectionNav sections={onThisPage} pillId="svc-nav-pill" />
        <Journeys
          active={active}
          onChoose={(a) => choose(a, false)}
          onHandoff={setHandoff}
        />
        <Calculator />
        <Portals onHandoff={setHandoff} />
        <Help />
        <Handoff portalKey={handoff} onClose={() => setHandoff(null)} />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */

function Hero({ onPick }: { onPick: (anchor: string) => void }) {
  const [pick, setPick] = useState(journeys[1].anchor);
  return (
    <PageHero
      id="svc-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Services" }]}
      pill={{ icon: ClipboardList, label: "Pension services" }}
      title="What do you need to do?"
      mark="need to do?"
      intro="Choose a service and we’ll take you through it step by step: who it’s for, what to bring, and which office or portal to use."
      actions={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onPick(pick);
          }}
          className="max-w-xl rounded-3xl bg-white p-3 shadow-[0_20px_40px_-28px_rgba(10,74,19,0.6)] ring-1 ring-black/10 sm:p-4"
        >
          <label
            htmlFor="svc-pick"
            className="block px-1 text-lg font-semibold text-[#0A4A13]"
          >
            I want to
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <span className="relative min-w-0 flex-1">
              <select
                id="svc-pick"
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                className={cn(
                  "min-h-14 w-full appearance-none truncate rounded-2xl bg-[#FBF8F1] pl-4 pr-11 text-lg font-semibold text-[#14261A] ring-1 ring-black/15",
                  focus,
                )}
              >
                {journeys.map((j) => (
                  <option key={j.anchor} value={j.anchor}>
                    {verbs[j.anchor] ?? j.short}
                  </option>
                ))}
              </select>
              <ArrowRight
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-[#117F21]"
              />
            </span>
            <button type="submit" className={cn(goldBtn, "shrink-0", focus)}>
              Show me how
              <ArrowRight
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </form>
      }
      aside={
        <FramedPanel className="hidden p-5 sm:block sm:p-6">
          {/* Hidden on phones: the picker beside it and the journey rail below offer the same choices. */}
          <p className="px-1 text-sm font-bold uppercase tracking-[0.18em] text-[#0A4A13]">
            Most used services
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {journeys.map((j, i) => {
              const Icon = icons[j.icon] ?? UserPlus;
              return (
                <motion.li
                  key={j.anchor}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.04, ease }}
                >
                  <button
                    type="button"
                    onClick={() => onPick(j.anchor)}
                    className={cn(
                      "group flex h-full min-h-16 w-full items-center gap-3 rounded-2xl bg-[#FBF8F1] p-3 text-left ring-1 ring-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#E8F5E9] hover:ring-2 hover:ring-[#117F21]",
                      focus,
                    )}
                  >
                    <IconTile icon={Icon} small />
                    <span className="min-w-0">
                      <span className="block text-lg font-bold leading-snug text-[#14261A]">
                        {j.short}
                      </span>
                      <span className="block text-base text-gray-700">
                        {j.audience}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </FramedPanel>
      }
    />
  );
}

/* ─────────────────────────── Journeys ─────────────────────────── */

function Eligibility({ j }: { j: Journey }) {
  const [ans, setAns] = useState<(boolean | null)[]>(
    j.eligibility!.questions.map(() => null),
  );
  const done = ans.every((a) => a !== null);
  const ok = done && ans.every(Boolean);
  return (
    <div className="rounded-3xl bg-[#F1EFE8] p-5 sm:p-6">
      <p className="flex items-center gap-2 text-lg font-bold">
        <CircleHelp className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
        {j.eligibility!.intro}
      </p>
      <ol className="mt-4 space-y-3">
        {j.eligibility!.questions.map((q, i) => (
          <li key={q}>
            <fieldset className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10 sm:flex-row sm:items-center">
              <legend className="sr-only">{q}</legend>
              <span
                aria-hidden="true"
                className="flex-1 text-lg leading-snug text-[#14261A]"
              >
                {q}
              </span>
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <label
                    key={String(v)}
                    className={cn(
                      "flex min-h-12 min-w-20 cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-4 text-lg font-semibold ring-1 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-[#FFD84D]",
                      ans[i] === v
                        ? v
                          ? "bg-[#0A4A13] text-[#F4D27A] ring-[#0A4A13]"
                          : "bg-[#B52026] text-white ring-[#B52026]"
                        : "bg-white text-[#14261A] ring-black/20 hover:ring-2 hover:ring-[#117F21]",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${j.anchor}-q${i}`}
                      className="sr-only"
                      checked={ans[i] === v}
                      onChange={() =>
                        setAns((a) => a.map((x, k) => (k === i ? v : x)))
                      }
                    />
                    {ans[i] === v &&
                      (v ? (
                        <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                      ) : (
                        <X className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                      ))}
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
              className={cn(
                "mt-4 flex gap-3 rounded-2xl p-4 text-lg font-medium ring-1",
                ok
                  ? "bg-[#E8F5E9] text-[#0A4A13] ring-[#117F21]/30"
                  : "bg-[#FDE8E8] text-[#5C1013] ring-[#B52026]/25",
              )}
            >
              {ok ? (
                <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
              ) : (
                <X className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
              )}
              {ok ? j.eligibility!.yes : j.eligibility!.no}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Panel({
  j,
  onHandoff,
}: {
  j: Journey;
  onHandoff: (key: string) => void;
}) {
  const reduce = useReducedMotion();
  const Icon = icons[j.icon] ?? UserPlus;
  const portal = portals.find((p) => p.key === j.portal);
  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -16 }}
      transition={{ duration: 0.35, ease }}
      aria-labelledby={`${j.anchor}-title`}
      className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-36px_rgba(10,74,19,0.45)] ring-1 ring-black/10"
    >
      {/* Green header: the journey's name, who it's for, where and how long */}
      <header className="relative isolate flex flex-col gap-5 overflow-hidden bg-[#0A4A13] p-6 text-white sm:flex-row sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-[#CB9615]/20 blur-3xl"
        />
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F4D27A] text-[#1A1206]">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-bold uppercase tracking-[0.14em] text-[#0A4A13]">
            For {j.audience.toLowerCase()}
          </p>
          <h3
            id={`${j.anchor}-title`}
            className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
          >
            {j.title}
          </h3>
          <p className="mt-2 max-w-2xl text-lg leading-relaxed text-white/90">
            {j.intro}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-base">
            <li className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-medium ring-1 ring-white/20">
              <MapPin className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" />
              {j.where}
            </li>
            <li className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-medium ring-1 ring-white/20">
              <Clock className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" />
              {j.standard ?? j.time}
            </li>
          </ul>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10 p-6 sm:p-8 xl:grid-cols-[1fr_1.15fr]">
        <div className="space-y-7">
          <div>
            <Label icon={Users}>Who it’s for</Label>
            <p className="mt-2 text-lg leading-relaxed text-gray-700">{j.forWho}</p>
          </div>
          {j.eligibility && <Eligibility key={j.anchor} j={j} />}
          <div>
            <Label>What you need</Label>
            <ul className="mt-3 space-y-2.5">
              {j.needs.map((n) => (
                <li key={n} className="flex items-start gap-3 text-lg leading-snug text-gray-800">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#117F21]">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <Label>Steps</Label>
          <ol className="relative mt-4 space-y-6">
            <motion.span
              aria-hidden="true"
              initial={{ scaleY: reduce ? 1 : 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="absolute bottom-4 left-[27px] top-4 w-0.5 origin-top rounded-full bg-gradient-to-b from-[#117F21] to-[#CB9615]"
            />
            {j.steps.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.08, ease }}
                className="relative flex gap-4"
              >
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4D27A] text-xl font-bold text-[#1A1206] ring-4 ring-white">
                  {i + 1}
                </span>
                <span className="min-w-0 pt-1">
                  <span className="block text-xl font-bold leading-snug">{s.title}</span>
                  <span className="mt-1 block text-lg leading-relaxed text-gray-700">
                    {s.body}
                  </span>
                </span>
              </motion.li>
            ))}
          </ol>

          <div className="relative mt-8 overflow-hidden rounded-3xl bg-[#F1EFE8] p-6 pl-7">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#F4D27A] to-[#CB9615]"
            />
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7A5200]">
              Where to go next
            </p>
            {portal ? (
              <>
                <p className="mt-2 text-xl font-bold">{portal.full}</p>
                <p className="mt-1 text-lg text-gray-700">{portal.use}</p>
                <button
                  type="button"
                  onClick={() => onHandoff(portal.key)}
                  className={cn("mt-5", goldBtn, focus)}
                >
                  Go to {portal.name}
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <Link
                to={
                  j.link.href.startsWith("#")
                    ? `/services${j.link.href}`
                    : j.link.href
                }
                className={cn("mt-4", goldBtn, focus)}
              >
                {j.link.label}
                <ArrowRight
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Journeys({
  active,
  onChoose,
  onHandoff,
}: {
  active: string;
  onChoose: (a: string) => void;
  onHandoff: (key: string) => void;
}) {
  const j = journeys.find((x) => x.anchor === active) ?? journeys[0];
  return (
    <section
      id="journeys"
      aria-labelledby="journeys-title"
      className={cn(sectionCls, "bg-white")}
    >
      {/* Old links: /services#pcc, #ppp, #rsa-transfer … */}
      {journeys.map((x) => (
        <span
          key={x.anchor}
          id={x.anchor}
          className="block scroll-mt-[170px]"
          aria-hidden="true"
        />
      ))}
      <div className="mx-auto max-w-7xl">
        <Headline
          id="journeys-title"
          kicker="Step-by-step services"
          title="Choose a service and we’ll guide you through it"
          mark="guide you through it"
          intro="Each guide says who it’s for, what to bring, the steps, and where to go next. Some have a quick check so you know you’re ready."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <LayoutGroup id="svc-rail">
            <nav aria-label="Services" className="lg:col-span-4 xl:col-span-3">
              <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:sticky lg:top-[170px] lg:mx-0 lg:flex-col lg:overflow-visible lg:rounded-3xl lg:bg-[#FBF8F1] lg:p-2 lg:ring-1 lg:ring-black/10 [&::-webkit-scrollbar]:hidden">
                {journeys.map((x) => {
                  const I = icons[x.icon] ?? UserPlus;
                  const on = x.anchor === j.anchor;
                  return (
                    <li key={x.anchor} className="shrink-0">
                      <button
                        type="button"
                        aria-current={on ? "true" : undefined}
                        onClick={() => onChoose(x.anchor)}
                        className={cn(
                          "relative isolate flex min-h-16 w-full items-center gap-3 rounded-2xl px-3 text-left text-lg font-semibold transition-colors",
                          on
                            ? "text-white"
                            : "bg-white text-[#14261A] ring-1 ring-black/10 hover:bg-[#E8F5E9] lg:bg-transparent lg:ring-0",
                          focus,
                        )}
                      >
                        {on && (
                          <motion.span
                            layoutId="svc-rail-pill"
                            className="absolute inset-0 -z-10 rounded-2xl bg-[#0A4A13] shadow-[0_18px_36px_-18px_rgba(10,74,19,0.8)]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 32,
                            }}
                          />
                        )}
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            on
                              ? "bg-[#F4D27A] text-[#1A1206]"
                              : "bg-[#E8F5E9] text-[#0A4A13]",
                          )}
                        >
                          <I className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block whitespace-nowrap leading-snug lg:whitespace-normal">
                            {x.short}
                          </span>
                          <span
                            className={cn(
                              "hidden text-base font-normal lg:block",
                              on ? "text-[#F4D27A]" : "text-gray-700",
                            )}
                          >
                            {x.audience}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </LayoutGroup>
          <div className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait" initial={false}>
              <Panel key={j.anchor} j={j} onHandoff={onHandoff} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Online services ─────────────────────────── */

function Portals({ onHandoff }: { onHandoff: (key: string) => void }) {
  return (
    <section
      id="portals"
      aria-labelledby="portals-title"
      className={cn(sectionCls, "bg-white")}
    >
      <div className="mx-auto max-w-7xl">
        <Headline
          id="portals-title"
          kicker="Online services"
          title="Which portal do you need?"
          mark="portal"
          intro="Some PenCom services run on their own websites. Each card says what it’s for, and we’ll tell you what to have ready before you leave this site."
        />
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((p, i) => {
            const I = portalIcons[p.key] ?? ExternalLink;
            return (
              <li key={p.key}>
                <Rise delay={(i % 3) * 0.06} className="h-full">
                  <button
                    type="button"
                    onClick={() => onHandoff(p.key)}
                    className={cn(
                      calmCard,
                      "flex h-full w-full items-start gap-5 p-6 text-left sm:p-7",
                      focus,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150"
                    />
                    <IconTile icon={I} />
                    <span className="relative flex min-w-0 flex-1 flex-col self-stretch">
                      <span className="block text-2xl font-bold tracking-tight text-[#14261A]">
                        {p.name}
                      </span>
                      <span className="mt-0.5 block text-base text-gray-600">
                        {p.full}
                      </span>
                      <span className="mt-3 block text-lg leading-snug text-gray-700">
                        {p.use}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-lg font-semibold text-[#117F21]">
                        Before you go
                        <ArrowRight
                          className="h-5 w-5 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </button>
                </Rise>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-base text-gray-600">
          Descriptions to be confirmed by each portal’s owner before launch.
        </p>
      </div>
    </section>
  );
}

/** "Before you leave this site" screen (DES-26): what the portal is for, what to have ready, what happens next. */
function Handoff({
  portalKey,
  onClose,
}: {
  portalKey: string | null;
  onClose: () => void;
}) {
  const p = portals.find((x) => x.key === portalKey);
  const I = p ? (portalIcons[p.key] ?? ExternalLink) : ExternalLink;
  return (
    <Modal
      open={!!p}
      onClose={onClose}
      labelledBy="handoff-title"
      className="max-w-lg"
    >
      {p && (
        <>
          <div className="relative isolate overflow-hidden bg-[#E8F5E9] p-7">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-[#F4D27A]/40 blur-3xl"
            />
            <div className="flex items-start gap-4">
              <IconTile icon={I} small />
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#0A4A13]">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  You’re about to leave this site
                </p>
                <h2
                  id="handoff-title"
                  className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#14261A]"
                >
                  {p.full}
                </h2>
              </div>
            </div>
            <p className="mt-3 text-lg text-gray-800">{p.use}</p>
          </div>
          <div className="space-y-6 p-7">
            {p.prepare ? (
              <div>
                <Label>Have these ready</Label>
                <ul className="mt-3 space-y-2.5">
                  {p.prepare.map((x) => (
                    <li key={x} className="flex gap-3 text-lg leading-snug text-gray-800">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#117F21]">
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="rounded-2xl bg-[#F1EFE8] p-4 text-lg text-gray-700">
                A checklist for this portal will be added by its owner.
              </p>
            )}
            {p.next && (
              <div>
                <Label>What happens next</Label>
                <p className="mt-2 text-lg text-gray-800">{p.next}</p>
              </div>
            )}
            <p className="relative flex gap-3 overflow-hidden rounded-2xl bg-[#F1EFE8] p-4 pl-5 text-base text-[#14261A]">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1.5 bg-[#CB9615]"
              />
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-[#117F21]"
                aria-hidden="true"
              />
              Check the address bar shows a pencom.gov.ng address before you
              sign in. PenCom will never ask for your password by phone or SMS.
            </p>
            <div className="flex flex-wrap gap-3">
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={cn(goldBtn, focus)}
                >
                  Continue to {p.name}
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <span className="inline-flex min-h-14 items-center rounded-2xl bg-[#F1EFE8] px-5 text-lg font-semibold text-gray-700">
                  Portal link to be confirmed
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className={cn(outlineBtn, focus)}
              >
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

function Help() {
  const cards = [
    {
      icon: MessageCircle,
      title: "Ask PenCom Assistant",
      body: "Quick answers in plain language, from our published guidance.",
      chat: true,
      tone: "green",
    },
    {
      icon: MessageSquareWarning,
      title: "Report an employer",
      body: "Deducting pension from your pay but not remitting it? Tell us.",
      to: "/connect#report",
      tone: "red",
    },
    {
      icon: UserCheck,
      title: "Find a PFA",
      body: "Contacts for every licensed Pension Fund Administrator.",
      to: "/operators#pfas",
      tone: "green",
    },
  ] as const;
  return (
    <section
      id="help"
      aria-labelledby="help-title"
      className={cn(sectionCls, "pb-24")}
    >
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#F1EFE8] p-6 sm:p-10 lg:p-14">
        <Headline
          id="help-title"
          kicker="Get help"
          title="Still not sure? We’ll help"
          mark="We’ll help"
          center
        />
        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((c, i) => {
            const cls = cn(
              "group flex h-full w-full flex-col items-center rounded-3xl bg-white p-7 text-center ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]",
              focus,
            );
            const inner = (
              <>
                <span
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110",
                    c.tone === "red"
                      ? "bg-[#B52026] text-white"
                      : "bg-[#0A4A13] text-[#F4D27A]",
                  )}
                >
                  <c.icon className="h-8 w-8" aria-hidden="true" />
                </span>
                <span className="mt-5 block text-xl font-bold text-[#14261A]">
                  {c.title}
                </span>
                <span className="mt-2 block text-lg leading-relaxed text-gray-700">
                  {c.body}
                </span>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-lg font-semibold text-[#117F21]">
                  {"chat" in c ? "Ask a question" : "Open"}
                  <ArrowRight
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </>
            );
            return (
              <li key={c.title}>
                <Rise delay={i * 0.06} className="h-full">
                  {"chat" in c ? (
                    <button type="button" onClick={openChat} className={cls}>
                      {inner}
                    </button>
                  ) : (
                    <Link to={c.to} className={cls}>
                      {inner}
                    </Link>
                  )}
                </Rise>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
