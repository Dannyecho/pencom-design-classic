"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Gavel, Scale, Search } from "lucide-react";
import { Link, useLocation, useSearchParams } from "@/lib/router";
import { cn } from "@/lib/utils";
import { CountUp, scrollToId } from "@/views/about/primitives";
import { ArrowChip } from "@/views/docs/kit";
import { IconTile, goldBtn } from "@/views/resources/Library";
import { FramedPanel, PageHero, SectionNav, ease, focus } from "@/views/theme/ui";
import DocDrawer from "./DocDrawer";
import Library, { type Filters } from "./Library";
import { ActSpotlight, Compliance, LatestRail, Policies } from "./Sections";
import { library } from "./library";
import { fmtDate, latest, typeStyle } from "./search";

/**
 * Regulations and compliance, calm theme (brief §7 "Regulatory library" + "Regulatory item").
 * Hero search → latest issued → filterable library → the Act in plain language → compliance → PenCom's own
 * policies. Filters and the open document (?doc=) live in the URL, so any view can be shared or bookmarked.
 */

const sections = [
  { id: "latest", label: "Latest" },
  { id: "library", label: "Library" },
  { id: "act", label: "Pension Reform Act" },
  { id: "compliance", label: "Compliance" },
  { id: "policies", label: "Our policies" },
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
      <div className="bg-[#FBF8F1] text-[#14261A]">
        <Hero
          onSearch={(q) => {
            set({ q });
            toLibrary();
          }}
          onType={(t) => {
            set({ types: [t] });
            toLibrary();
          }}
          onOpen={openDoc}
        />
        <SectionNav sections={sections} pillId="reg-nav-pill" />
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

/* ─────────────────────────── Hero ─────────────────────────── */

const counts = (["Regulation", "Guideline", "Circular", "Framework"] as const).map((t) => ({ t, n: library.filter((d) => d.type === t).length }));
const examples = ["RSA transfer", "investment", "PPP", "annuity"];

function Hero({ onSearch, onType, onOpen }: { onSearch: (q: string) => void; onType: (t: string) => void; onOpen: (id: string) => void }) {
  const [q, setQ] = useState("");
  const reduce = useReducedMotion();
  return (
    <PageHero
      id="reg-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Regulations and compliance" }]}
      pill={{ icon: Scale, label: "Regulatory library" }}
      title="Regulations and compliance"
      mark="compliance"
      intro={`All ${library.length} regulations, guidelines, frameworks and circulars issued under the Pension Reform Act, in one place. Search by title, subject or abbreviation, then read the summary or download the signed document.`}
      actions={
        <div className="max-w-xl">
          {/* Labelled search: a visible label, a large field and a gold labelled button */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(q.trim());
            }}
          >
            <label htmlFor="reg-hero-q" className="block text-lg font-semibold text-[#14261A]">
              Search the regulatory library
            </label>
            <div className="mt-2 flex flex-col gap-2 rounded-3xl bg-white p-2 shadow-[0_24px_50px_-30px_rgba(10,74,19,0.55)] ring-1 ring-black/10 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#FFD84D] sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 pl-3">
                <Search className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
                <input
                  id="reg-hero-q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. “RSA transfer”, “PPP”"
                  className="min-h-14 w-full min-w-0 bg-transparent text-lg placeholder:text-gray-600 focus:outline-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden"
                />
              </div>
              <button type="submit" className={cn(goldBtn, "shrink-0", focus)}>
                <Search className="h-5 w-5" aria-hidden="true" />
                Search
              </button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-base text-gray-700">
            <span className="font-medium">Try:</span>
            {examples.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => {
                  setQ(x);
                  onSearch(x);
                }}
                className={cn("min-h-11 rounded-full bg-white px-4 font-semibold text-[#0A4A13] ring-1 ring-[#117F21]/30 transition hover:bg-[#0A4A13] hover:text-white hover:ring-[#0A4A13]", focus)}
              >
                {x}
              </button>
            ))}
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {counts.map((c, i) => (
              <motion.li key={c.t} initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease }}>
                <button
                  type="button"
                  onClick={() => onType(c.t)}
                  className={cn(
                    "group relative h-full w-full overflow-hidden rounded-3xl bg-white p-4 text-left ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]",
                    focus,
                  )}
                >
                  <CountUp value={String(c.n)} className="block text-3xl font-bold tabular-nums text-[#14261A]" />
                  <span className="mt-1 flex items-center gap-2 text-base font-medium text-gray-700 group-hover:text-[#0A4A13]">
                    <span aria-hidden="true" className={cn("h-2.5 w-2.5 shrink-0 rounded-full", typeStyle[c.t].dot)} />
                    {c.t}s
                  </span>
                  <span className="sr-only">, show only {c.t.toLowerCase()}s</span>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      }
      aside={
        <FramedPanel className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-xl font-bold text-[#14261A]">Latest issued</p>
            <span className="inline-flex items-center gap-2 text-base font-medium text-[#0A4A13]">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#117F21]" />
              Updated {fmtDate(latest[0].date)}
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {latest.slice(0, 4).map((d, i) => (
              <motion.li key={d.id} initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease }}>
                <button
                  type="button"
                  onClick={() => onOpen(d.id)}
                  className={cn("group flex w-full items-start gap-3 rounded-2xl bg-[#FBF8F1] p-4 text-left ring-1 ring-black/10 transition duration-300 hover:bg-[#E8F5E9] hover:ring-[#117F21]/30", focus)}
                >
                  <span className="min-w-0 flex-1">
                    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider", typeStyle[d.type].chip)}>{d.type}</span>
                    <span className="mt-1.5 line-clamp-2 block text-lg font-semibold leading-snug text-[#14261A]">{d.title}</span>
                    <span className="mt-0.5 block text-base text-gray-700">{fmtDate(d.date)}</span>
                  </span>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#0A4A13] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </ul>
          <Link
            to="/regulations/pension-reform-act"
            className={cn("group mt-3 flex items-center gap-4 rounded-2xl bg-[#F1EFE8] p-4 ring-1 ring-black/10 transition duration-300 hover:ring-2 hover:ring-[#117F21]", focus)}
          >
            <IconTile icon={Gavel} className="h-12 w-12 [&_svg]:h-6 [&_svg]:w-6" />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-[#14261A]">Pension Reform Act 2014</span>
              <span className="block text-base text-gray-700">Read every section online, or download it</span>
            </span>
            <ArrowChip />
          </Link>
        </FramedPanel>
      }
    />
  );
}
