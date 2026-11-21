"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Building2, ChevronDown, Clock, Compass, MapPin, MessageSquareWarning, Quote, Target, type LucideIcon } from "lucide-react";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight, Tilt, icons } from "@/views/about/primitives";
import Headline from "@/views/theme/Headline";
import { EyebrowPill, FramedPanel, Modal, Rise, Tile, card, chip, featured, focus, listPanel, listRow, sectionCls } from "@/views/theme/ui";
import { allExecs, arms, chapters, charter, commissioners, dg, dgOffices, mandate, mission, overview, secretary, values, vision, zonalOffices, type Exec } from "./data";

/* ─────────────────────────── Overview ─────────────────────────── */

/** Calm-era card and tile, still used by leadership, history and charter until CL5b converts them. */
const calmCard =
  "group relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]";

function IconTile({ icon: Icon, small = false }: { icon: LucideIcon; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]",
        small ? "h-12 w-12" : "h-14 w-14",
      )}
    >
      <Icon className={small ? "h-6 w-6" : "h-7 w-7"} />
    </span>
  );
}

/** A section inside the portal layout's 9-column main (the layout supplies the side padding). */
const portalSec = "scroll-mt-[150px] border-t border-gray-100 py-14 first:border-t-0 sm:py-16";

/** Who we are, then the four parts of the mandate as a 2 × 2 `gap-px` panel with mint tiles and a pointer spotlight. */
export function Overview() {
  return (
    <section id="overview" aria-labelledby="overview-title" className={portalSec}>
      <Headline
        id="overview-title"
        kicker="Who we are"
        title="One regulator for every pension in Nigeria"
        mark="every pension"
        intro={
          <>
            {overview[0]}
            <span className="mt-3 block">{overview[1]}</span>
          </>
        }
      />
      <h3 className="sr-only">What we do</h3>
      <Rise className="mt-10">
        <Spotlight className="rounded-3xl border border-gray-200/80 bg-gray-100">
          <ul className="grid grid-cols-1 gap-px sm:grid-cols-2">
            {mandate.map((m) => (
              <li key={m.title} className="group flex gap-4 bg-white p-6 transition-colors hover:bg-[#F7FAF6]/80 sm:p-7">
                <Tile icon={icons[m.icon]} />
                <div>
                  <h4 className="text-xl font-bold leading-snug text-[#0A2E10]">{m.title}</h4>
                  <p className="mt-1.5 text-base leading-relaxed text-gray-600">{m.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Spotlight>
      </Rise>
    </section>
  );
}

/* ─────────────────────────── Mission, vision, values ─────────────────────────── */

/**
 * Mission and vision as a split pair: mission is the page's featured gradient card (grid, gold chip, tilt), vision a
 * classic card with a gold left edge. Then the core values as a list panel with mint tiles.
 */
export function MissionValues() {
  return (
    <section id="mission" aria-labelledby="mission-title" className={portalSec}>
      <Headline id="mission-title" kicker="What drives us" title="The purpose behind every decision" mark="every decision" />
      <div className="mt-10 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Rise className="xl:col-span-7">
          <Tilt className="h-full" max={4}>
            <div className={cn(featured, "h-full p-7 shadow-[0_40px_80px_-40px_rgba(4,36,10,0.7)] sm:p-9")}>
              <GridBackdrop className="-z-10" />
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-[#CB9615]/25 blur-3xl" />
              <Quote aria-hidden="true" className="absolute bottom-5 right-5 h-16 w-16 text-[#F4D27A]/15" />
              <EyebrowPill icon={Target} label="Our mission" dark />
              <p className="relative mt-6 text-xl font-semibold leading-snug sm:text-2xl">{mission}</p>
            </div>
          </Tilt>
        </Rise>
        <Rise delay={0.08} className="xl:col-span-5">
          <div className={cn(card, "relative h-full overflow-hidden p-7 pl-9 sm:p-9 sm:pl-11")}>
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#CB9615] to-[#117F21]" />
            <EyebrowPill icon={Compass} label="Our vision" />
            <p className="mt-6 text-xl font-semibold leading-snug text-[#0A2E10]">{vision}</p>
          </div>
        </Rise>
      </div>

      <h3 id="values" className="mt-12 scroll-mt-[150px] text-xl font-bold tracking-tight text-[#0A2E10] sm:text-2xl">
        Our core values
      </h3>
      <Rise className="mt-5">
        <Spotlight className={listPanel}>
          <ul className="divide-y divide-gray-100">
            {values.map((v) => (
              <li key={v.title} className={cn(listRow, "items-start sm:items-center")}>
                <Tile icon={icons[v.icon]} />
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-6">
                  <h4 className="text-lg font-bold text-[#0A2E10] sm:w-44 sm:shrink-0">{v.title}</h4>
                  <p className="mt-0.5 text-base leading-relaxed text-gray-600 sm:mt-0">{v.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Spotlight>
      </Rise>
    </section>
  );
}

/* ─────────────────────────── History ─────────────────────────── */

/** Timeline on white: a thin line that fills green→gold as you scroll, green year dots, white calm cards. */
export function History() {
  const reduce = useReducedMotion();
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 70%", "end 60%"] });
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="history" aria-labelledby="history-title" className={cn(sectionCls, "bg-white")}>
      <div className="mx-auto max-w-7xl">
        <Headline
          id="history-title"
          kicker="Our history"
          title="From unpaid pensions to ₦31.8 trillion in savings"
          mark="₦31.8 trillion"
          intro="How Nigeria moved from budget-funded pensions to the Contributory Pension Scheme, and what has changed since."
        />
        <ol ref={list} className="relative mt-14 space-y-8 pl-11 sm:pl-16">
          {/* Track, and a green-to-gold line that fills as you scroll. */}
          <span aria-hidden="true" className="absolute bottom-2 left-[15px] top-2 w-[3px] rounded-full bg-[#14261A]/10 sm:left-[23px]" />
          <motion.span aria-hidden="true" style={{ scaleY: reduce ? 1 : grow }} className="absolute bottom-2 left-[15px] top-2 w-[3px] origin-top rounded-full bg-gradient-to-b from-[#117F21] via-[#2E913D] to-[#CB9615] sm:left-[23px]" />
          {chapters.map((c) => (
            <li key={c.id} id={c.id} className="relative scroll-mt-[170px]">
              <span aria-hidden="true" className="absolute -left-11 top-8 flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#0A4A13] shadow-[0_0_0_6px_#fff] sm:-left-16 sm:h-[49px] sm:w-[49px]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F4D27A] sm:h-3 sm:w-3" />
              </span>
              <Rise>
                <article className={cn(calmCard, "grid grid-cols-1 gap-5 p-6 sm:p-8 lg:grid-cols-12 lg:gap-10")}>
                  <div className="lg:col-span-3">
                    <p className="text-5xl font-bold leading-none tracking-tight text-[#0A4A13] sm:text-6xl">{c.year}</p>
                    <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#117F21]">{c.period}</p>
                    {c.figure && (
                      <p className="mt-5 inline-flex flex-col rounded-2xl bg-[#E8F5E9] px-4 py-3 ring-1 ring-[#117F21]/20">
                        <span className="text-2xl font-bold tabular-nums text-[#0A4A13]">{c.figure.value}</span>
                        <span className="text-base leading-snug text-gray-700">{c.figure.label}</span>
                      </p>
                    )}
                  </div>
                  <div className="lg:col-span-9 lg:border-l lg:border-black/10 lg:pl-10">
                    <h3 className="text-xl font-bold leading-snug tracking-tight text-[#14261A] sm:text-2xl">{c.title}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-gray-700">{c.body}</p>
                    {c.points && (
                      <ul className="mt-4 space-y-2.5">
                        {c.points.map((p) => (
                          <li key={p} className="flex gap-3 text-lg leading-relaxed text-gray-700">
                            <span aria-hidden="true" className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#CB9615]" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </Rise>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}


/* ─────────────────────────── Structure ─────────────────────────── */

const byId = (id: string) => allExecs.find((e) => e.id === id)!;

function Person({ exec, onSelect, size = "md" }: { exec: Exec; onSelect: (id: string) => void; size?: "md" | "lg" }) {
  return (
    <button type="button" onClick={() => onSelect(exec.id)} className={cn("group/p flex min-h-12 w-full items-center gap-4 rounded-2xl p-2 text-left transition hover:bg-[#F7FAF6]", focus)}>
      <img src={exec.image} alt="" className={cn("shrink-0 rounded-full object-cover object-top ring-2 ring-offset-2", size === "lg" ? "h-20 w-20 ring-[#CB9615]" : "h-14 w-14 ring-[#E8F5E9]")} loading="lazy" />
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#117F21]">{exec.title.replace("Commissioner, ", "")}</span>
        <span className={cn("mt-0.5 block font-bold leading-snug text-[#0A2E10] group-hover/p:text-[#117F21] group-hover/p:underline", size === "lg" ? "text-xl" : "text-lg")}>{exec.name}</span>
      </span>
    </button>
  );
}

/** Thin green connector between org-chart boxes. */
const Line = ({ className }: { className?: string }) => <span aria-hidden="true" className={cn("w-[2px] bg-[#117F21]/45", className)} />;

/**
 * Org chart: the Board as a dark pill → the Director General in a card with a green→gold top edge → the four
 * Commissioners as classic cards in two columns, hung off a green spine with short stubs and junction dots.
 */
export function Structure({ onSelect }: { onSelect: (id: string) => void }) {
  const [openArm, setOpenArm] = useState<string | null>(null);
  return (
    <section id="structure" aria-labelledby="structure-title" className={portalSec}>
      <Headline
        id="structure-title"
        kicker="Structure"
        title="How the Commission is organised"
        mark="organised"
        intro="A Board oversees the Commission. The Director General leads it with four Commissioners, each responsible for a group of departments. Select a name to read their profile."
      />

      <div className="mt-10 flex flex-col items-center">
        <Rise className="inline-flex items-center gap-2.5 rounded-full bg-[#04240A] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-[#F4D27A] shadow-[0_14px_30px_-16px_rgba(4,36,10,0.9)]">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#CB9615]" />
          Board of the Commission
        </Rise>
        <Line className="h-8" />
        <Rise className="w-full max-w-lg">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-3 shadow-[0_24px_50px_-24px_rgba(10,74,19,0.4)]">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
            <div className="pt-1">
              <Person exec={dg} onSelect={onSelect} size="lg" />
            </div>
            <ul className="mt-2 flex flex-wrap gap-2 px-2 pb-2">
              {dgOffices.map((o) => (
                <li key={o.name} className={cn(chip, "text-sm")}>
                  {o.name}
                </li>
              ))}
            </ul>
          </div>
        </Rise>
        <Line className="h-8" />
      </div>

      <div className="relative">
        {/* Spine between the two columns, from the Director General down to the last row (two columns only). */}
        <span aria-hidden="true" className="absolute bottom-16 left-1/2 top-0 hidden w-[2px] -translate-x-1/2 bg-[#117F21]/45 sm:block" />
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
          {arms.map((arm, i) => {
            const exec = byId(arm.execId);
            const open = openArm === arm.execId;
            return (
              <li key={arm.execId} className="relative">
                <span aria-hidden="true" className={cn("absolute top-12 hidden h-[2px] w-5 bg-[#117F21]/45 sm:block", i % 2 ? "-left-5" : "-right-5")} />
                <span aria-hidden="true" className={cn("absolute top-[44px] hidden h-2.5 w-2.5 rounded-full bg-[#CB9615] ring-4 ring-white sm:block", i % 2 ? "-left-[25px]" : "-right-[25px]")} />
                <Rise delay={i * 0.06} className={cn(card, "flex h-full flex-col p-3")}>
                  <Person exec={exec} onSelect={onSelect} />
                  <div className="mt-2 flex flex-1 flex-col border-t border-gray-100 px-2 pt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">{arm.departments.length} departments</p>
                    <ul className="mb-5 mt-3 space-y-2">
                      {arm.departments.map((d) => (
                        <li key={d.name} className="flex items-start gap-2.5 text-base font-semibold leading-snug text-[#0A2E10]">
                          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#117F21]" aria-hidden="true" />
                          <span>
                            {d.name}
                            {open && d.units && <span className="mt-1 block text-sm font-normal leading-relaxed text-gray-600">{d.units.join(" · ")}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {arm.departments.some((d) => d.units) && (
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenArm(open ? null : arm.execId)}
                        className={cn(
                          "mt-auto inline-flex min-h-11 w-fit items-center gap-2 self-start rounded-xl px-4 text-sm font-semibold transition",
                          open ? "bg-gradient-to-r from-[#0A4A13] to-[#117F21] text-white" : "border border-[#117F21]/25 text-[#117F21] hover:border-[#117F21] hover:bg-[#F7FAF6]",
                          focus,
                        )}
                      >
                        {open ? "Hide units" : "Show units"}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </Rise>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-6 text-sm text-gray-600">Based on the organisational chart in the Commission’s Annual Report. Departments are being confirmed with Human Resources.</p>
    </section>
  );
}

/* ─────────────────────────── Leadership ─────────────────────────── */

/** On white: the Director General in a large card (photo in a gold-outlined frame, words below it), then the team as calm cards. */
export function Leadership({ onSelect }: { onSelect: (id: string) => void }) {
  const team = [...commissioners, secretary];
  return (
    <section id="executive" aria-labelledby="executive-title" className={cn(sectionCls, "bg-white")}>
      <div className="mx-auto max-w-7xl">
        <Headline id="executive-title" kicker="Leadership" title="The people who lead the Commission" mark="lead the Commission" intro="The Director General leads the Commission with four Commissioners and the Commission Secretary." />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Rise className="lg:col-span-5">
            <button type="button" onClick={() => onSelect(dg.id)} className={cn(calmCard, "flex h-full w-full flex-col p-4 text-left sm:p-5", focus)}>
              <span className="relative block p-2">
                <span aria-hidden="true" className="absolute inset-0 rounded-[1.75rem] border-2 border-[#CB9615]/45" />
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-[#E8F5E9]">
                  <img src={dg.image} alt="" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
                </span>
              </span>
              <span className="flex flex-1 flex-col px-2 pb-2 pt-5">
                <span className="inline-flex w-fit rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-bold uppercase tracking-[0.14em] text-[#0A4A13]">{dg.title}</span>
                <span className="mt-3 block text-2xl font-bold leading-snug tracking-tight text-[#14261A] sm:text-3xl">{dg.name}</span>
                <span className="mt-2 block text-lg leading-relaxed text-gray-700">{dg.bio}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-lg font-semibold text-[#0A4A13]">
                  View profile
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </button>
          </Rise>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {team.map((e, i) => (
              <li key={e.id} className={cn(i === team.length - 1 && "sm:col-span-2")}>
                <Rise delay={i * 0.05} className="h-full">
                  <button type="button" onClick={() => onSelect(e.id)} className={cn(calmCard, "flex h-full w-full items-center gap-4 p-4 text-left sm:p-5", focus)}>
                    <span aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />
                    <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#E8F5E9] ring-1 ring-black/10">
                      <img src={e.image} alt="" loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="block text-sm font-bold uppercase tracking-[0.12em] text-[#117F21]">{e.title}</span>
                      <span className="mt-1 block text-xl font-bold leading-snug text-[#14261A]">{e.name}</span>
                      <span className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-[#0A4A13]">
                        View profile
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                </Rise>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Profile dialog ─────────────────────────── */

/** Profile in the kit's light Modal (cream bar with a labelled Close; focus goes in and comes back). */
export function ProfileDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const exec = id ? allExecs.find((e) => e.id === id) ?? null : null;
  return (
    <Modal open={!!exec} onClose={onClose} labelledBy="profile-name" className="max-w-3xl">
      {exec && (
        <div className="grid sm:grid-cols-5">
          <div className="p-4 sm:col-span-2 sm:p-6 sm:pr-0">
            <div className="relative p-2">
              <span aria-hidden="true" className="absolute inset-0 rounded-[1.75rem] border-2 border-[#CB9615]/45" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-[#E8F5E9] sm:aspect-[3/4]">
                <img src={exec.image} alt={`Portrait of ${exec.name}`} className="h-full w-full object-cover object-top" />
              </div>
            </div>
          </div>
          <div className="px-6 pb-7 sm:col-span-3 sm:p-8">
            <p className="inline-flex rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-bold uppercase tracking-[0.14em] text-[#0A4A13]">{exec.title}</p>
            <h2 id="profile-name" className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#14261A] sm:text-3xl">
              {exec.name}
            </h2>
            <span aria-hidden="true" className="mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
            <p className="mt-4 text-lg leading-relaxed text-gray-700">{exec.bio}</p>
            <p className="mt-6 border-t border-black/10 pt-4 text-base text-gray-700">National Pension Commission · Federal Republic of Nigeria</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ─────────────────────────── Service Charter + visit us ─────────────────────────── */

/** On cream: a warm panel with the service standards as plain figures in white cards, a gold CTA, then the visit card. */
export function Charter() {
  return (
    <section id="charter" aria-labelledby="charter-title" className={sectionCls}>
      <div className="mx-auto max-w-7xl">
        <Rise>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#F1EFE8] p-6 ring-1 ring-black/10 sm:p-10 lg:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-[#F4D27A]/30 blur-3xl" />
            <Headline
              id="charter-title"
              kicker="Service Charter"
              title="The standards you can expect from us"
              mark="expect from us"
              intro="We are committed to efficient, transparent and courteous service. If we fall short, tell us."
              action={
                <div className="flex flex-wrap gap-3">
                  <Link to="/about/service-charter" className={cn("group inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F]", focus)}>
                    Read the full charter
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/connect"
                    className={cn("inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-[#117F21] px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white", focus)}
                  >
                    <MessageSquareWarning className="h-5 w-5" aria-hidden="true" />
                    Tell us
                  </Link>
                </div>
              }
            />
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {charter.map((c, i) => (
                <li key={c.label}>
                  <Rise delay={i * 0.05} className="h-full">
                    <div className={cn(calmCard, "flex h-full items-start gap-4 p-5 sm:p-6")}>
                      <IconTile icon={Clock} small />
                      <p>
                        <span className="text-4xl font-bold tracking-tight tabular-nums text-[#0A4A13]">{c.value}</span>{" "}
                        <span className="text-lg font-semibold text-[#14261A]">{c.unit}</span>
                        <span className="mt-1 block text-lg leading-snug text-gray-700">{c.label}</span>
                      </p>
                    </div>
                  </Rise>
                </li>
              ))}
            </ul>
          </div>
        </Rise>

        <Rise className="mt-6">
          <FramedPanel className="grid grid-cols-1 items-center gap-6 p-6 sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight text-[#14261A] sm:text-2xl">
                <IconTile icon={MapPin} small />
                Visit us in Abuja or at a zonal office
              </h2>
              <p className="mt-3 text-lg text-gray-700">Head office: 174 Adetokunbo Ademola Crescent, Wuse II, Abuja.</p>
            </div>
            <ul className="flex flex-wrap gap-2 lg:col-span-4">
              {zonalOffices.map((z) => (
                <li key={z} className="rounded-full bg-white px-4 py-2 text-base font-semibold text-[#0A4A13] ring-1 ring-[#117F21]/35">
                  {z}
                </li>
              ))}
            </ul>
            <div className="lg:col-span-3 lg:text-right">
              <Link
                to="/connect#zonal-offices"
                className={cn("group inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[#0A4A13] px-6 text-lg font-semibold text-white transition hover:bg-[#117F21]", focus)}
              >
                Find an office
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </FramedPanel>
        </Rise>
      </div>
    </section>
  );
}
