"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Building2, ChevronDown, Clock, Compass, MapPin, MessageSquareWarning, Quote, Target } from "lucide-react";
import { Link, useLocation } from "@/lib/router";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight, Tilt, icons, sectionAliases } from "@/views/about/primitives";
import Headline from "@/views/theme/Headline";
import { DarkBand, EyebrowPill, Modal, Rise, Tile, card, chip, ease, featured, focus, goldBtn, listPanel, listRow, outlineBtn, sectionCls } from "@/views/theme/ui";
import { allExecs, arms, chapters, charter, commissioners, dg, dgOffices, mandate, mission, overview, secretary, values, vision, zonalOffices, type Exec } from "./data";

/* ─────────────────────────── Overview ─────────────────────────── */

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

/* ─────────────────────────── History (the page's dark band) ─────────────────────────── */

/**
 * The page's one dark band. Desktop: a horizontal rail of year buttons on a track whose gold bar grows to the chosen
 * year, with that chapter open below it. Phone: a vertical timeline with every chapter open and a line that fills as
 * you scroll. One list serves both (`lg:contents` on each item puts the buttons in row 1 and the open chapter in row 2).
 * `#history-2004` (and `#signing`) open and land on that chapter; percentage figures get a bar that grows to the value.
 */
export function History() {
  const reduce = useReducedMotion();
  const { hash } = useLocation();
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 70%", "end 60%"] });
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // A deep link to one chapter opens it on desktop before the page scrolls to it.
  useEffect(() => {
    const id = hash.replace(/^#/, "");
    const i = chapters.findIndex((c) => c.id === (sectionAliases[id] ?? id));
    if (i >= 0) setActive(i);
  }, [hash]);

  return (
    <DarkBand id="history" labelledBy="history-title">
      <Headline
        id="history-title"
        dark
        kicker="Our history"
        title="From unpaid pensions to ₦31.8 trillion in savings"
        mark="₦31.8 trillion"
        intro="How Nigeria moved from budget-funded pensions to the Contributory Pension Scheme, and what has changed since."
      />
      <ol ref={list} className="relative mt-12 space-y-6 pl-11 sm:pl-14 lg:mt-14 lg:grid lg:grid-cols-8 lg:gap-x-3 lg:space-y-0 lg:pl-0">
        {/* Phone: a vertical track and a line that fills as you scroll. */}
        <span aria-hidden="true" className="absolute bottom-2 left-[15px] top-2 w-[3px] rounded-full bg-white/10 sm:left-[19px] lg:hidden" />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: reduce ? 1 : grow }}
          className="absolute bottom-2 left-[15px] top-2 w-[3px] origin-top rounded-full bg-gradient-to-b from-[#2E913D] to-[#CB9615] sm:left-[19px] lg:hidden"
        />
        {/* Desktop: a horizontal track through the year dots, filled up to the chosen year. */}
        <span aria-hidden="true" className="absolute left-[calc((100%-84px)/16)] right-[calc((100%-84px)/16)] top-[9px] hidden h-[3px] rounded-full bg-white/10 lg:block" />
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ scaleX: active / (chapters.length - 1) }}
          transition={{ duration: reduce ? 0 : 0.7, ease }}
          className="absolute left-[calc((100%-84px)/16)] right-[calc((100%-84px)/16)] top-[9px] hidden h-[3px] origin-left rounded-full bg-gradient-to-r from-[#2E913D] via-[#E9B949] to-[#CB9615] lg:block"
        />
        {chapters.map((c, i) => {
          const on = active === i;
          const pct = c.figure && /^\d+(\.\d+)?%$/.test(c.figure.value) ? parseFloat(c.figure.value) : null;
          return (
            <li key={c.id} className="relative lg:contents">
              {/* Phone: dot on the line and the year as a heading chip. */}
              <span aria-hidden="true" className="absolute -left-11 top-1 flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#0A4A13] ring-4 ring-[#04240A] sm:-left-14 sm:h-[41px] sm:w-[41px] lg:hidden">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F4D27A]" />
              </span>
              <p className="inline-flex min-h-10 items-baseline gap-3 rounded-full bg-white/[0.06] px-4 py-1.5 ring-1 ring-white/15 lg:hidden">
                <span className="text-xl font-black tabular-nums text-[#F4D27A]">{c.year}</span>
                {c.period !== c.year && <span className="text-sm font-semibold text-white/80">{c.period}</span>}
              </p>

              {/* Desktop: a year button on the rail. */}
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={on}
                aria-controls={c.id}
                className={cn("group hidden min-w-0 flex-col items-center gap-3 rounded-2xl text-center lg:row-start-1 lg:flex", focus)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative h-[21px] w-[21px] rounded-full ring-4 ring-[#04240A] transition-colors duration-500",
                    i <= active ? "bg-[#CB9615]" : "bg-[#24452B] group-hover:bg-[#2E913D]",
                  )}
                >
                  {on && !reduce && <span className="absolute inset-0 animate-ping rounded-full bg-[#F4D27A]/60" />}
                </span>
                <span
                  className={cn(
                    "flex w-full flex-col rounded-2xl px-2 py-3 ring-1 transition duration-300",
                    on
                      ? "bg-[#CB9615] text-[#1A1206] shadow-[0_18px_40px_-18px_rgba(203,150,21,0.9)] ring-[#CB9615]"
                      : "bg-white/[0.05] text-white ring-white/15 group-hover:-translate-y-0.5 group-hover:ring-[#F4D27A]/60",
                  )}
                >
                  <span className="text-2xl font-black tabular-nums leading-none">{c.year}</span>
                  <span className={cn("mt-1.5 truncate text-xs font-semibold", on ? "text-[#1A1206]" : "text-white/75")}>{c.period}</span>
                </span>
              </button>

              {/* The chapter: always open on phones; on desktop only the chosen one, under the rail. */}
              <div id={c.id} className={cn("mt-4 scroll-mt-[170px] lg:col-span-8 lg:row-start-2 lg:mt-10", !on && "lg:hidden")}>
                <motion.article
                  key={on ? "on" : "off"}
                  initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease }}
                  className="grid grid-cols-1 gap-6 rounded-3xl bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur-sm sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-10"
                >
                  <div className="lg:col-span-4">
                    <p aria-hidden="true" className="hidden text-7xl font-black leading-none tracking-tight text-[#F4D27A] lg:block">{c.year}</p>
                    <p className="hidden text-sm font-bold uppercase tracking-[0.16em] text-white/75 lg:mt-4 lg:block">{c.period}</p>
                    {c.figure && (
                      <div className="rounded-2xl bg-[#04240A]/60 lg:mt-5 p-5 ring-1 ring-white/10">
                        <p className="text-4xl font-black tabular-nums text-white">{c.figure.value}</p>
                        <p className="mt-1 text-base leading-snug text-white/80">{c.figure.label}</p>
                        {pct !== null && (
                          <span aria-hidden="true" className="mt-4 block h-2 overflow-hidden rounded-full bg-white/10">
                            <motion.span
                              initial={{ scaleX: reduce ? pct / 100 : 0 }}
                              whileInView={{ scaleX: pct / 100 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, ease, delay: 0.2 }}
                              className="block h-full origin-left rounded-full bg-gradient-to-r from-[#2E913D] to-[#CB9615]"
                            />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="lg:col-span-8 lg:border-l lg:border-white/10 lg:pl-10">
                    <h3 className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">{c.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-white/80 sm:text-lg">{c.body}</p>
                    {c.points && (
                      <ul className="mt-5 space-y-2.5">
                        {c.points.map((p) => (
                          <li key={p} className="flex gap-3 text-base leading-relaxed text-white/80">
                            <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#CB9615]" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.article>
              </div>
            </li>
          );
        })}
      </ol>
    </DarkBand>
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

/**
 * A directory of the six executives: white cards with the photo above the name (it zooms a little on hover), the
 * role, the short bio and "View profile". The Director General's card carries a gold top edge and a gold role chip.
 */
export function Leadership({ onSelect }: { onSelect: (id: string) => void }) {
  const people = [dg, ...commissioners, secretary];
  return (
    <section id="executive" aria-labelledby="executive-title" className={portalSec}>
      <Headline id="executive-title" kicker="Leadership" title="The people who lead the Commission" mark="lead the Commission" intro="The Director General leads the Commission with four Commissioners and the Commission Secretary." />
      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {people.map((e, i) => {
          const lead = e.id === dg.id;
          return (
            <li key={e.id}>
              <Rise delay={(i % 3) * 0.06} className="h-full">
                <button type="button" onClick={() => onSelect(e.id)} className={cn(card, "group relative flex h-full w-full flex-col overflow-hidden text-left", focus)}>
                  {lead && <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#117F21] to-[#CB9615]" />}
                  <span className="relative block aspect-[4/3] overflow-hidden bg-[#E8F5E9]">
                    <img src={e.image} alt="" loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#04240A]/35 to-transparent" />
                  </span>
                  <span className="flex flex-1 flex-col p-5 sm:p-6">
                    <span
                      className={cn(
                        "inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]",
                        lead ? "bg-[#FFF8E1] text-[#7A5200] ring-1 ring-[#CB9615]/40" : "bg-[#E8F5E9] text-[#0A4A13]",
                      )}
                    >
                      {e.title.replace("Commissioner, ", "")}
                    </span>
                    <span className="mt-3 block text-xl font-bold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{e.name}</span>
                    {!lead && e.title.startsWith("Commissioner") && <span className="mt-0.5 block text-sm font-semibold text-gray-600">Commissioner</span>}
                    <span className="mt-2 block text-base leading-relaxed text-gray-600">{e.bio}</span>
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 font-semibold text-[#117F21]">
                      View profile
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </Rise>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─────────────────────────── Profile dialog ─────────────────────────── */

/** Profile in the kit's Modal (dark title bar with a labelled Close; focus goes in and comes back). */
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
            <h2 id="profile-name" className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#0A2E10] sm:text-3xl">
              {exec.name}
            </h2>
            <span aria-hidden="true" className="mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">{exec.bio}</p>
            <p className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-600">National Pension Commission · Federal Republic of Nigeria</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ─────────────────────────── Service Charter + visit us ─────────────────────────── */

/**
 * The closing section, on the soft band: the service standards as a `gap-px` figure grid with a pointer spotlight
 * (each figure grows a gold edge on hover), the full charter as the gold action, then a strip of two link cards:
 * tell us when we fall short, and visit us (head office and the zonal offices).
 */
export function Charter() {
  return (
    <section id="charter" aria-labelledby="charter-title" className={cn(sectionCls, "bg-gradient-to-b from-white via-[#F4F7F2] to-white")}>
      <div className="mx-auto max-w-7xl">
        <Headline
          id="charter-title"
          kicker="Service Charter"
          title="The standards you can expect from us"
          mark="expect from us"
          intro="We are committed to efficient, transparent and courteous service. If we fall short, tell us."
          action={
            <Link to="/about/service-charter" className={cn(goldBtn, "group")}>
              Read the full charter
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          }
        />
        <Rise className="mt-10">
          <Spotlight className="rounded-3xl border border-gray-200/80 bg-gray-200/80">
            <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
              {charter.map((c) => (
                <li key={c.label} className="group relative flex items-start gap-4 bg-white p-6 transition-colors hover:bg-[#F7FAF6]/80 sm:p-7">
                  <span aria-hidden="true" className="absolute left-0 top-7 h-8 w-1 rounded-r bg-gradient-to-b from-[#CB9615] to-[#CB9615]/0 transition-all duration-500 group-hover:h-14" />
                  <Tile icon={Clock} />
                  <p>
                    <span className="text-4xl font-bold tracking-tight tabular-nums text-[#0A2E10]">{c.value}</span>{" "}
                    <span className="text-lg font-semibold text-[#0A2E10]">{c.unit}</span>
                    <span className="mt-1 block text-base leading-snug text-gray-600">{c.label}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Spotlight>
        </Rise>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Rise className="h-full">
            <Link to="/connect" className={cn(card, "group flex h-full flex-col items-start gap-5 p-6 sm:p-7", focus)}>
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF8E1] text-[#7A5200] transition group-hover:scale-110">
                <MessageSquareWarning className="h-7 w-7" />
              </span>
              <span className="block">
                <span className="block text-xl font-bold text-[#0A2E10]">Tell us</span>
                <span className="mt-0.5 block text-base text-gray-600">If we fall short, tell us.</span>
              </span>
              <span aria-hidden="true" className="mt-auto flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-[#117F21] transition group-hover:border-[#117F21] group-hover:bg-[#117F21] group-hover:text-white">
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Rise>
          <Rise delay={0.06} className="h-full lg:col-span-2">
            <div className={cn(card, "group grid h-full grid-cols-1 items-center gap-5 p-6 sm:p-7 md:grid-cols-12")}>
              <div className="flex gap-5 md:col-span-7">
                <Tile icon={MapPin} size="lg" />
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-[#0A2E10]">Visit us in Abuja or at a zonal office</h3>
                  <p className="mt-1 text-base text-gray-600">Head office: 174 Adetokunbo Ademola Crescent, Wuse II, Abuja.</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {zonalOffices.map((z) => (
                      <li key={z} className={cn(chip, "text-sm")}>
                        {z}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:col-span-5 md:text-right">
                <Link to="/connect#zonal-offices" className={cn(outlineBtn, "group/b")}>
                  Find an office
                  <ArrowRight className="h-5 w-5 transition-transform group-hover/b:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}
