"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ClipboardCheck, Clock, Gavel, Library as LibraryIcon, Lock, Scale, Search } from "lucide-react";
import { Link, useLocation, useSearchParams } from "@/lib/router";
import { cn } from "@/lib/utils";
import { CountUp, GridBackdrop, scrollToId } from "@/views/about/primitives";
import { DrawnMark } from "@/views/theme/Headline";
import { Crumbs, DarkBackdrop, EyebrowPill, FloatingBar, TabStrip, Tile, ease, featured, focus, goldBtn, type NavSection } from "@/views/theme/ui";
import DocDrawer from "./DocDrawer";
import Library, { type Filters } from "./Library";
import { ActSpotlight, Compliance, LatestRail, Policies } from "./Sections";
import { library } from "./library";
import { fmtDate, latest, typeStyle } from "./search";

/**
 * Regulations and compliance, classic theme: a tool page (brief §7 "Regulatory library" + "Regulatory item").
 * Dark banner with the search and the type counts → floating "Latest issued" card → sticky TabStrip → latest rail →
 * filterable library (facets in their own column, results as a list panel) → the Act as the page's dark band →
 * compliance → PenCom's own policies. Filters and the open document (?doc=) live in the URL. Always English.
 */

const sections: NavSection[] = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "library", label: "Library", icon: LibraryIcon },
  { id: "act", label: "Pension Reform Act", icon: Gavel },
  { id: "compliance", label: "Compliance", icon: ClipboardCheck },
  { id: "policies", label: "Our policies", icon: Lock },
];

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export default function RegulationsPage() {
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const reduce = useReducedMotion();

  const f: Filters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      types: list(params.get("type")),
      years: list(params.get("year")).map(Number),
      who: list(params.get("who")),
      subjects: list(params.get("subject")),
      status: params.get("status") ?? "",
      sort: (params.get("sort") as Filters["sort"]) || "new",
    }),
    [params],
  );

  const set = useCallback(
    (p: Partial<Filters>) => {
      const n = { ...f, ...p };
      const next = new URLSearchParams();
      if (n.q) next.set("q", n.q);
      if (n.types.length) next.set("type", n.types.join(","));
      if (n.years.length) next.set("year", n.years.join(","));
      if (n.who.length) next.set("who", n.who.join(","));
      if (n.subjects.length) next.set("subject", n.subjects.join(","));
      if (n.status) next.set("status", n.status);
      if (n.sort !== "new") next.set("sort", n.sort);
      const doc = params.get("doc");
      if (doc) next.set("doc", doc);
      setParams(next, { replace: true, preventScrollReset: true });
    },
    [f, params, setParams],
  );

  const openDoc = (id: string | null) => {
    // Read the live address (in the handler, not in render): `params` can be one render behind a debounced search.
    const next = new URLSearchParams(window.location.search);
    if (id) next.set("doc", id);
    else next.delete("doc");
    setParams(next, { preventScrollReset: true });
  };

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

  const toLibrary = () => window.setTimeout(() => scrollToId("library", !reduce), 60);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#0A2E10]">
        <Banner
          onSearch={(q) => {
            set({ q });
            toLibrary();
          }}
          onType={(t) => {
            set({ types: [t] });
            toLibrary();
          }}
        />
        <LatestBar onOpen={openDoc} />
        <TabStrip sections={sections} pillId="reg-nav-pill" />
        <LatestRail onOpen={openDoc} />
        <Library f={f} set={set} onOpen={openDoc} />
        <ActSpotlight set={set} />
        <Compliance set={set} />
        <Policies />
        <DocDrawer id={params.get("doc")} onClose={() => openDoc(null)} onOpen={openDoc} />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Banner ─────────────────────────── */

const counts = (["Regulation", "Guideline", "Circular", "Framework"] as const).map((t) => ({ t, n: library.filter((d) => d.type === t).length }));
const examples = ["RSA transfer", "investment", "PPP", "annuity"];

/** Dark grid banner (no photo): the library search and the type counts sit inside it. */
function Banner({ onSearch, onType }: { onSearch: (q: string) => void; onType: (t: string) => void }) {
  const [q, setQ] = useState("");
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({ initial: { opacity: 0, y: reduce ? 0 : 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease } });
  return (
    <section aria-labelledby="reg-title" className="relative isolate overflow-hidden text-white print:text-black">
      <DarkBackdrop />
      {/* A soft gold arc behind the counts */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-24 -z-10 hidden h-[420px] w-[420px] rounded-full border border-[#F4D27A]/10 lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-40 -z-10 hidden h-[300px] w-[300px] rounded-full border border-[#F4D27A]/10 lg:block" />
      <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-6 lg:pb-32">
        <Crumbs crumbs={[{ label: "Home", to: "/" }, { label: "Regulations and compliance" }]} dark />
        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <motion.div {...rise(0)}>
              <EyebrowPill icon={Scale} label="Regulatory library" dark />
            </motion.div>
            <motion.h1 id="reg-title" {...rise(0.06)} className="mt-5 text-[2.25rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Regulations and <DrawnMark text="compliance" dark />
            </motion.h1>
            <motion.p {...rise(0.16)} className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              All {library.length} regulations, guidelines, frameworks and circulars issued under the Pension Reform Act, in one place. Search by title,
              subject or abbreviation, then read the summary or download the signed document.
            </motion.p>

            <motion.form
              {...rise(0.24)}
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch(q.trim());
              }}
              className="mt-8 max-w-2xl print:hidden"
            >
              <label htmlFor="reg-hero-q" className="block text-base font-semibold text-white">
                Search the regulatory library
              </label>
              <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-white p-1.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#FFD84D] sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3 pl-3">
                  <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                  <input
                    id="reg-hero-q"
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="e.g. “RSA transfer”, “PPP”"
                    className="min-h-12 w-full min-w-0 bg-transparent text-base text-[#0A2E10] placeholder:text-gray-600 focus:outline-none focus-visible:outline-none focus-visible:ring-0 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
                  />
                </div>
                <button type="submit" className={cn(goldBtn, "shrink-0")}>
                  <Search className="h-5 w-5" aria-hidden="true" />
                  Search
                </button>
              </div>
            </motion.form>
            <motion.div {...rise(0.3)} className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/85 print:hidden">
              <span className="font-semibold">Try:</span>
              {examples.map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => {
                    setQ(x);
                    onSearch(x);
                  }}
                  className={cn("min-h-11 rounded-full border border-white/20 bg-white/[0.06] px-4 font-semibold text-white transition hover:border-[#F4D27A] hover:text-[#F4D27A]", focus)}
                >
                  {x}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Type counts: glass tiles in a gap-px grid; each one filters the library */}
          <motion.div {...rise(0.2)} className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">In the library</p>
            <ul className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-sm">
              {counts.map((c, i) => (
                <motion.li key={c.t} initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 + i * 0.07, ease }}>
                  <button
                    type="button"
                    onClick={() => onType(c.t)}
                    className={cn("group relative flex h-full w-full flex-col bg-[#04240A]/80 p-5 text-left transition duration-300 hover:bg-[#0A4A13]/90 sm:p-6", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]")}
                  >
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#F4D27A] to-[#CB9615] transition-transform duration-500 group-hover:scale-x-100" />
                    <CountUp value={String(c.n)} className="block text-4xl font-black tracking-tight text-white sm:text-5xl" />
                    <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/85 group-hover:text-[#F4D27A]">
                      <span aria-hidden="true" className={cn("h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/20", typeStyle[c.t].dot)} />
                      {c.t}s
                      <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </span>
                    <span className="sr-only">, show only {c.t.toLowerCase()}s</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Latest issued (floating bar) ─────────────────────────── */

function LatestBar({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <FloatingBar className="p-0 sm:p-0">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="p-5 sm:p-6 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-[#0A2E10]">Latest issued</h2>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A4A13]">
              <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#117F21]/50 motion-reduce:hidden" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-[#117F21]" />
              </span>
              Updated {fmtDate(latest[0].date)}
            </span>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 sm:grid-cols-3">
            {latest.slice(0, 3).map((d) => (
              <li key={d.id} className="bg-white">
                <button
                  type="button"
                  onClick={() => onOpen(d.id)}
                  className={cn("group flex h-full w-full flex-col p-4 text-left transition hover:bg-[#F7FAF6]", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]")}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider", typeStyle[d.type].chip)}>{d.type}</span>
                    <span className="text-xs font-medium text-gray-600">{fmtDate(d.date)}</span>
                  </span>
                  <span className="mt-2 line-clamp-2 block font-semibold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{d.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/regulations/pension-reform-act" className={cn(featured, "group flex items-center gap-4 rounded-none p-6 lg:col-span-4", focus)}>
          <GridBackdrop className="opacity-70" />
          <Tile icon={Gavel} dark size="lg" className="relative ring-1 ring-white/15" />
          <span className="relative min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">Primary legislation</span>
            <span className="mt-1 block text-lg font-bold">Pension Reform Act 2014</span>
            <span className="block text-sm text-white/80">Read every section online, or download it</span>
          </span>
          <ArrowRight aria-hidden="true" className="relative h-5 w-5 shrink-0 text-[#F4D27A] transition group-hover:translate-x-1" />
        </Link>
      </div>
    </FloatingBar>
  );
}
