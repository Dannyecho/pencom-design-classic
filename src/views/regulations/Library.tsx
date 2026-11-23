"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowDownWideNarrow, Check, Download, FileText, MessageCircle, Search, SlidersHorizontal, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Spotlight, ease } from "@/views/about/primitives";
import { SectionHeading } from "@/views/theme/heading";
import { Tile, focus, goldBtn, listPanel, outlineBtn, sectionCls } from "@/views/theme/ui";
import { library, type RegDoc } from "./library";
import { fmtDate, matchQuery, statusStyle, typeStyle, years } from "./search";

export type Filters = {
  q: string;
  types: string[];
  years: number[];
  who: string[];
  subjects: string[];
  status: string;
  sort: "new" | "old" | "az";
};

const TYPES: RegDoc["type"][] = ["Regulation", "Guideline", "Circular", "Framework", "Code"];
const WHO = ["PFAs", "PFCs", "Employers", "Contributors", "Retirees", "Informal sector", "Pension agents", "States & LGs", "Closed schemes", "All operators"];
const SUBJECTS = ["Investment", "Contributions & RSAs", "Benefits & retirement", "Governance & licensing", "Coverage & PPP", "Fees", "Technology & data", "Health"];
const STATUSES = ["Latest version", "Amended", "Revised version available", "Draft"];
const PAGE = 12;

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function applyFilters(f: Filters) {
  const { test, used } = matchQuery(f.q);
  const out = library.filter(
    (d) =>
      (!f.q.trim() || test(d)) &&
      (!f.types.length || f.types.includes(d.type)) &&
      (!f.years.length || f.years.includes(d.year)) &&
      (!f.who.length || d.appliesTo.some((w) => f.who.includes(w))) &&
      (!f.subjects.length || d.subjects.some((s) => f.subjects.includes(s))) &&
      (!f.status || d.status === f.status),
  );
  if (f.sort === "old") out.sort((a, b) => a.date.localeCompare(b.date));
  else if (f.sort === "az") out.sort((a, b) => a.title.localeCompare(b.title));
  else out.sort((a, b) => b.date.localeCompare(a.date));
  return { results: out, used };
}

/* ─────────────────────────── Facets ─────────────────────────── */

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-gray-100 px-4 py-5 first:border-0 sm:px-5">
      <legend className="float-left mb-2 w-full px-1 text-xs font-bold uppercase tracking-[0.16em] text-gray-600">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function CheckRow({ label, count, checked, onChange, dot }: { label: string; count: number; checked: boolean; onChange: () => void; dot?: string }) {
  return (
    <label
      className={cn(
        "group relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-[15px] transition",
        checked ? "bg-[#F7FAF6]" : "hover:bg-[#F7FAF6]",
        count === 0 && !checked && "opacity-50",
      )}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#FFD84D]",
          checked ? "border-[#14892A] bg-[#14892A] text-white" : "border-gray-400 bg-white group-hover:border-[#14892A]",
        )}
      >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
      {dot && <span aria-hidden="true" className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot)} />}
      <span className={cn("flex-1 leading-snug", checked ? "font-semibold text-[#164D20]" : "text-gray-700 group-hover:text-[#164D20]")}>{label}</span>
      <span className={cn("min-w-8 rounded-full px-2 py-0.5 text-center text-sm font-semibold tabular-nums transition", checked ? "bg-[#14892A] text-white" : "bg-gray-100 text-gray-600")}>{count}</span>
    </label>
  );
}

function Facets({ f, set }: { f: Filters; set: (p: Partial<Filters>) => void }) {
  // Counts reflect the other active filters, so users can see what each choice would return.
  const countFor = (patch: Partial<Filters>) => applyFilters({ ...f, ...patch }).results;
  const typeBase = countFor({ types: [] });
  const yearBase = countFor({ years: [] });
  const whoBase = countFor({ who: [] });
  const subjBase = countFor({ subjects: [] });
  const statusBase = countFor({ status: "" });
  const maxYear = Math.max(...years.map((y) => yearBase.filter((d) => d.year === y).length), 1);

  return (
    <div>
      <FacetGroup title="Document type">
        {TYPES.map((t) => (
          <CheckRow
            key={t}
            label={t === "Code" ? "Codes" : `${t}s`}
            dot={typeStyle[t].dot}
            count={typeBase.filter((d) => d.type === t).length}
            checked={f.types.includes(t)}
            onChange={() => set({ types: toggle(f.types, t) })}
          />
        ))}
      </FacetGroup>

      <FacetGroup title="Year issued">
        {/* Interactive histogram: each bar is a year; click to filter */}
        <div className="relative rounded-2xl bg-[#F4F7F2] p-3">
          <div className="flex h-28 items-end gap-[3px]" role="group" aria-label="Filter by year">
            {years.map((y) => {
              const n = yearBase.filter((d) => d.year === y).length;
              const on = f.years.includes(y);
              return (
                <button
                  key={y}
                  type="button"
                  aria-pressed={on}
                  aria-label={`${y}: ${n} documents`}
                  title={`${y} · ${n}`}
                  disabled={n === 0 && !on}
                  onClick={() => set({ years: toggle(f.years, y) })}
                  className={cn("group relative flex h-full flex-1 items-end rounded-t-[4px]", focus)}
                >
                  <motion.span
                    layout
                    className={cn(
                      "block w-full rounded-t-[4px] transition-colors",
                      on ? "bg-[#CB9615]" : f.years.length ? "bg-gray-300 group-hover:bg-[#14892A]/60" : "bg-gradient-to-t from-[#105D1D] to-[#36A045] group-hover:from-[#CB9615] group-hover:to-[#E0AA22]",
                    )}
                    style={{ height: `${Math.max(n ? 6 : 2, (n / maxYear) * 100)}%` }}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-xs text-gray-600">
            <span>{years[0]}</span>
            <span>{years[years.length - 1]}</span>
          </div>
        </div>
        {f.years.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            {f.years.slice().sort().join(", ")}
            <button type="button" onClick={() => set({ years: [] })} className={cn("min-h-11 rounded-xl px-2 font-semibold text-[#117F21] underline underline-offset-2", focus)}>
              Clear years
            </button>
          </p>
        )}
      </FacetGroup>

      <FacetGroup title="Who it applies to">
        {WHO.map((w) => (
          <CheckRow key={w} label={w} count={whoBase.filter((d) => d.appliesTo.includes(w)).length} checked={f.who.includes(w)} onChange={() => set({ who: toggle(f.who, w) })} />
        ))}
      </FacetGroup>

      <FacetGroup title="Subject">
        {SUBJECTS.map((s) => (
          <CheckRow key={s} label={s} count={subjBase.filter((d) => d.subjects.includes(s)).length} checked={f.subjects.includes(s)} onChange={() => set({ subjects: toggle(f.subjects, s) })} />
        ))}
      </FacetGroup>

      <FacetGroup title="Status">
        {STATUSES.map((s) => (
          <CheckRow key={s} label={s} count={statusBase.filter((d) => d.status === s).length} checked={f.status === s} onChange={() => set({ status: f.status === s ? "" : s })} />
        ))}
      </FacetGroup>
    </div>
  );
}

/* ─────────────────────────── Result row (list panel) ─────────────────────────── */

function ResultRow({ d, onOpen, i }: { d: RegDoc; onOpen: (id: string) => void; i: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      layout={!reduce}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.03, ease }}
      className="bg-white"
    >
      <div className="group relative flex gap-4 px-5 py-5 transition hover:bg-[#F7FAF6] has-[button:focus-visible]:outline has-[button:focus-visible]:outline-[3px] has-[button:focus-visible]:-outline-offset-[3px] has-[button:focus-visible]:outline-[#FFD84D] sm:gap-5 sm:px-6">
        {/* Gradient bar that grows on hover */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-[#14892A] to-[#CB9615] transition-transform duration-300 group-hover:scale-y-100" />
        <Tile icon={FileText} className="mt-0.5 hidden sm:flex" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={cn("rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider", typeStyle[d.type].chip)}>{d.type}</span>
            <span className={cn("rounded-full px-2.5 py-0.5 font-semibold ring-1", statusStyle[d.status])}>{d.status}</span>
            <span className="font-mono text-sm text-gray-600">
              <span className="sr-only">Issued </span>
              {fmtDate(d.date)}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold leading-snug text-[#164D20] sm:text-xl">
            <button
              type="button"
              onClick={() => onOpen(d.id)}
              className="text-left after:absolute after:inset-0 after:content-[''] group-hover:text-[#117F21] focus-visible:outline-none group-has-[:focus-visible]:underline"
            >
              {d.title}
            </button>
          </h3>
          {d.summary && <p className="mt-1.5 line-clamp-2 text-base leading-relaxed text-gray-600">{d.summary}</p>}
          <p className="mt-3 flex flex-wrap gap-1.5">
            {[...d.appliesTo, ...d.subjects.filter((s) => s !== "General")].slice(0, 4).map((t) => (
              <span key={t} className="inline-flex items-center rounded-full border border-gray-200 bg-[#F7FAF6] px-3 py-0.5 text-xs font-semibold text-gray-700">{t}</span>
            ))}
          </p>
        </div>
        <a
          href={d.pdf}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(outlineBtn, "relative z-10 hidden shrink-0 self-center px-4 hover:bg-[#14892A] hover:text-white md:inline-flex")}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          PDF
          <span className="sr-only">of {d.title} (opens in a new tab)</span>
        </a>
      </div>
    </motion.li>
  );
}

/* ─────────────────────────── Library ─────────────────────────── */

export default function Library({ f, set, onOpen }: { f: Filters; set: (p: Partial<Filters>) => void; onOpen: (id: string) => void }) {
  const [shown, setShown] = useState(PAGE);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [draft, setDraft] = useState(f.q);
  const { results, used } = useMemo(() => applyFilters(f), [f]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(f.q), [f.q]);
  useEffect(() => setShown(PAGE), [f]);
  // Search as you type (debounced) – results update live and the count is announced.
  useEffect(() => {
    if (draft === f.q) return;
    const t = window.setTimeout(() => set({ q: draft }), 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const chips = [
    ...(f.q ? [{ label: `“${f.q}”`, clear: () => set({ q: "" }) }] : []),
    ...f.types.map((t) => ({ label: t, clear: () => set({ types: f.types.filter((x) => x !== t) }) })),
    ...f.years.map((y) => ({ label: String(y), clear: () => set({ years: f.years.filter((x) => x !== y) }) })),
    ...f.who.map((w) => ({ label: w, clear: () => set({ who: f.who.filter((x) => x !== w) }) })),
    ...f.subjects.map((s) => ({ label: s, clear: () => set({ subjects: f.subjects.filter((x) => x !== s) }) })),
    ...(f.status ? [{ label: f.status, clear: () => set({ status: "" }) }] : []),
  ];
  const clearAll = () => set({ q: "", types: [], years: [], who: [], subjects: [], status: "" });

  return (
    <section id="library" aria-labelledby="library-title" className={cn("bg-gradient-to-b from-white via-[#F4F7F2] to-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="library-title"
          eyebrow="Regulatory library"
          title="Find any regulation, guideline or circular"
          highlight="regulation, guideline or circular"
          intro="Filter by type, year, who it applies to and subject. Abbreviations like RSA, PFA and PCC work too."
        />

        {/* Search + sort bar: sticks under the tab strip */}
        <div className="sticky top-[160px] z-20 mt-10 rounded-2xl bg-white/95 p-1.5 shadow-[0_24px_50px_-30px_rgba(17,66,26,0.55)] ring-1 ring-gray-200 backdrop-blur">
          <div className="flex flex-col gap-1.5 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl pl-3 pr-1 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-[#FFD84D]">
              <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
              <span className="shrink-0 font-semibold text-[#164D20]">Search</span>
              <span className="sr-only"> the library</span>
              <input
                ref={inputRef}
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search titles, subjects or abbreviations"
                className="min-h-12 w-full min-w-0 bg-transparent text-base placeholder:text-gray-600 focus:outline-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden"
              />
              {draft && (
                <button type="button" onClick={() => setDraft("")} aria-label="Clear search" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-[#F7FAF6] hover:text-[#164D20]", focus)}>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </label>
            <div className="flex gap-1.5">
              <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#F7FAF6] px-3 text-gray-600 ring-1 ring-gray-200 has-[select:focus-visible]:outline has-[select:focus-visible]:outline-[3px] has-[select:focus-visible]:outline-[#FFD84D] sm:flex-none sm:px-4">
                <ArrowDownWideNarrow className="hidden h-4 w-4 shrink-0 text-[#117F21] sm:block" aria-hidden="true" />
                <span className="shrink-0 text-sm font-semibold">Sort</span>
                <span className="sr-only"> by</span>
                <select value={f.sort} onChange={(e) => set({ sort: e.target.value as Filters["sort"] })} className="min-h-11 min-w-0 flex-1 cursor-pointer bg-transparent font-semibold text-[#164D20] focus:outline-none focus-visible:outline-none">
                  <option value="new">Newest first</option>
                  <option value="old">Oldest first</option>
                  <option value="az">Title A–Z</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => setMobileFilters((o) => !o)}
                aria-expanded={mobileFilters}
                aria-controls="reg-facets"
                className={cn("inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-[#11421A] px-4 font-semibold text-white transition hover:bg-[#105D1D] lg:hidden", focus)}
              >
                <SlidersHorizontal className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" />
                Filters{chips.length ? ` (${chips.length})` : ""}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Facets: their own left column (no SideNav on this tool page) */}
          <aside
            id="reg-facets"
            aria-label="Filters"
            className={cn("overflow-hidden rounded-3xl border border-gray-200/80 bg-white lg:col-span-3 lg:block lg:self-start", mobileFilters ? "block" : "hidden")}
          >
            <div className="flex items-center justify-between gap-2 bg-[#11421A] px-5 py-3">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#F4D27A]">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
              </p>
              {chips.length > 0 && (
                <button type="button" onClick={clearAll} className={cn("min-h-11 rounded-lg px-2 text-sm font-semibold text-white underline underline-offset-2 hover:text-[#F4D27A]", focus)}>
                  Clear all
                </button>
              )}
            </div>
            <Facets f={f} set={set} />
          </aside>

          {/* Results */}
          <div className="min-w-0 lg:col-span-9">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-2 text-base text-gray-600" aria-live="polite">
                <strong className="text-2xl font-bold tabular-nums text-[#164D20]">{results.length}</strong> of {library.length} documents
              </p>
              <LayoutGroup>
                <AnimatePresence initial={false}>
                  {chips.map((c) => (
                    <motion.button
                      layout
                      key={c.label}
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={c.clear}
                      className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border border-[#14892A]/25 bg-[#E8F5E9] pl-4 pr-3 text-sm font-semibold text-[#105D1D] transition hover:border-[#14892A] hover:bg-[#14892A] hover:text-white", focus)}
                    >
                      {c.label}
                      <X className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Remove filter</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </LayoutGroup>
              {chips.length > 1 && (
                <button type="button" onClick={clearAll} className={cn("min-h-11 rounded-xl px-2 text-sm font-semibold text-[#117F21] underline underline-offset-2", focus)}>
                  Clear all
                </button>
              )}
            </div>
            {used.length > 0 && <p className="mt-2 text-sm text-gray-600">Also matching: {used.join(" · ")}</p>}

            {results.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-10">
                <Tile icon={Search} size="lg" className="mx-auto" />
                <h3 className="mt-4 text-2xl font-bold text-[#164D20]">No documents match</h3>
                <p className="mx-auto mt-2 max-w-md text-base text-gray-600">
                  Try fewer words, remove a filter, or search for a topic such as “transfer”, “investment” or “benefits”.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={clearAll} className={goldBtn}>
                    Clear all filters
                  </button>
                  <button type="button" onClick={() => document.getElementById("chat-trigger")?.click()} className={outlineBtn}>
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Ask PenCom Assistant
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <Spotlight color="rgba(20,137,42,0.07)" size={600} className={cn(listPanel, "mt-5 divide-y-0")}>
                  <ul className="divide-y divide-gray-100">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {results.slice(0, shown).map((d, i) => (
                        <ResultRow key={d.id} d={d} i={i} onOpen={onOpen} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </Spotlight>
                {shown < results.length && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <div className="h-1.5 w-56 overflow-hidden rounded-full bg-[#E8F5E9]" aria-hidden="true">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-[#14892A] to-[#CB9615]" animate={{ width: `${(shown / results.length) * 100}%` }} />
                    </div>
                    <p className="text-sm text-gray-600">Showing {shown} of {results.length}</p>
                    <button type="button" onClick={() => setShown((s) => s + PAGE)} className={cn(outlineBtn, "group")}>
                      Show {Math.min(PAGE, results.length - shown)} more
                      <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
