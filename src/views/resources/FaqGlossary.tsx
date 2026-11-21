"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, ChevronDown, MessageCircle, Search, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tile, card, chip, ease, focus, goldBtn, outlineBtn } from "@/views/theme/ui";
import { SectionHeading } from "./compat";
import { faqCats, faqs, glossary } from "./data";
import { portalSec } from "./Library";
import { useI18n } from "@/i18n/context";

const insetFocus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]";

/** Segmented filter (white group, sliding green pill) used by the FAQ groups and the glossary letters. */
function Segments({ id, label, options, value, onChange, square = false }: { id: string; label: string; options: { v: string; disabled?: boolean }[]; value: string; onChange: (v: string) => void; square?: boolean }) {
  return (
    <LayoutGroup id={id}>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-gray-200">
        {options.map((o) => {
          const on = value === o.v;
          return (
            <button
              key={o.v}
              type="button"
              disabled={o.disabled}
              aria-pressed={on}
              onClick={() => onChange(o.v)}
              className={cn(
                "relative inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-semibold transition sm:text-base",
                square ? "min-w-11 px-2" : "px-4",
                o.disabled ? "cursor-not-allowed text-gray-400" : on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]",
                insetFocus,
              )}
            >
              {on && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_10px_24px_-12px_rgba(10,74,19,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{o.v}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/* ─────────────────────────── FAQ: the homepage accordion ─────────────────────────── */

export function FaqSection({ openQ, setOpenQ }: { openQ: string | null; setOpenQ: (q: string | null) => void }) {
  const { t, t: tr } = useI18n();
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const [vote, setVote] = useState<Record<string, "up" | "down">>({});

  // When opened from search, make sure its category is visible.
  useEffect(() => {
    if (openQ) {
      setCat("All");
      setQ("");
    }
  }, [openQ]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    // Search the English and the translated wording, so readers can type in their own language.
    const has = (s: string) => s.toLowerCase().includes(t) || tr(s).toLowerCase().includes(t);
    return faqs.filter((f) => (cat === "All" || f.cat === cat) && (!t || has(f.q) || has(f.a)));
  }, [cat, q, tr]);

  return (
    <section id="faq" aria-labelledby="faq-title" className={portalSec}>
      <SectionHeading id="faq-title" eyebrow="Frequently asked" title="Answers in plain language" highlight="plain language" intro="Short answers to the questions we hear most. Choose a group or search." />

      {/* Toolbar: search, then the groups as a segmented control */}
      <div className="mt-8 rounded-3xl bg-[#F4F7F2] p-4 sm:p-5">
        <label htmlFor="faq-q" className="block font-semibold text-[#0A2E10]">Search questions</label>
        <div className="mt-2 flex min-w-0 items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 transition focus-within:border-[#117F21] focus-within:ring-2 focus-within:ring-[#117F21]/30 hover:border-[#117F21]/50">
          <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
          <input id="faq-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions" className="min-h-12 w-full min-w-0 bg-transparent text-base text-[#0A2E10] placeholder:text-gray-500 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden" />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className={cn("-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-[#E8F5E9] hover:text-[#117F21]", focus)}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="mt-4">
          <Segments id="faq-cat" label="Filter questions" value={cat} onChange={setCat} options={["All", ...faqCats].map((v) => ({ v }))} />
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{t("{n} questions shown", { n: list.length })}</p>

      <ul className="mt-6 space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((f) => {
            const isOpen = openQ === f.q;
            const id = `faq-${faqs.indexOf(f)}`;
            return (
              <motion.li
                key={f.q}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease }}
                className={cn(
                  "relative overflow-hidden rounded-2xl border transition-colors duration-300",
                  isOpen ? "border-[#117F21]/30 bg-[#F7FAF6] shadow-[0_24px_50px_-30px_rgba(10,74,19,0.45)]" : "border-gray-200 bg-white hover:border-[#117F21]/30",
                )}
              >
                <span aria-hidden="true" className={cn("absolute inset-y-4 left-0 w-1 origin-top rounded-r-full bg-gradient-to-b from-[#117F21] to-[#CB9615] transition-transform duration-500", isOpen ? "scale-y-100" : "scale-y-0")} />
                <h3>
                  <button
                    id={`${id}-btn`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={id}
                    onClick={() => setOpenQ(isOpen ? null : f.q)}
                    className={cn("group flex min-h-14 w-full items-center gap-4 rounded-2xl px-5 py-4 text-left", insetFocus)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className={cn(chip, "mb-1.5 hidden w-fit sm:inline-flex")}>{f.cat}</span>
                      <span className="block text-lg font-semibold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{f.q}</span>
                    </span>
                    <span aria-hidden="true" className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition duration-300", isOpen ? "rotate-180 bg-[#117F21] text-white" : "bg-gray-100 text-gray-600 group-hover:bg-[#E8F5E9] group-hover:text-[#117F21]")}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={id} role="region" aria-labelledby={`${id}-btn`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}>
                      <div className="px-5 pb-5">
                        <p className="leading-relaxed text-gray-700">{f.a}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 text-gray-600">
                          <span className="mr-1">Was this helpful?</span>
                          {(["up", "down"] as const).map((v) => {
                            const I = v === "up" ? ThumbsUp : ThumbsDown;
                            const on = vote[f.q] === v;
                            return (
                              <button
                                key={v}
                                type="button"
                                aria-pressed={on}
                                onClick={() => setVote((x) => ({ ...x, [f.q]: v }))}
                                className={cn(
                                  "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 font-semibold transition",
                                  focus,
                                  on ? "bg-[#117F21] text-white" : "border border-[#117F21]/25 bg-white text-[#117F21] hover:border-[#117F21]",
                                )}
                              >
                                <I className="h-4 w-4" aria-hidden="true" />
                                {v === "up" ? "Yes" : "No"}
                              </button>
                            );
                          })}
                          <span aria-live="polite" className="font-semibold text-[#0A4A13]">{vote[f.q] ? "Thanks for your feedback." : ""}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {list.length === 0 && <p className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-gray-600">No questions match. Try another word, or ask PenCom Assistant.</p>}

      {/* Still have a question? */}
      <div className="mt-8 flex flex-col gap-4 rounded-3xl border-l-4 border-[#117F21] bg-[#F4F7F2] p-5 sm:flex-row sm:items-center sm:p-6">
        <Tile icon={MessageCircle} dark />
        <div className="flex-1">
          <p className="text-xl font-bold text-[#0A2E10]">Still have a question?</p>
          <p className="mt-0.5 text-gray-600">PenCom Assistant answers from our published guidance.</p>
        </div>
        <button type="button" onClick={() => document.getElementById("chat-trigger")?.click()} className={cn(goldBtn, "group w-full shrink-0 sm:w-fit")}>
          Ask PenCom Assistant
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────── Glossary: A–Z letters and cards that open ─────────────────────────── */

export function Glossary({ focusTerm }: { focusTerm: string | null }) {
  const [letter, setLetter] = useState("All");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const letters = Array.from(new Set(glossary.map((g) => g.term[0].toUpperCase()))).sort();
  const list = glossary.filter((g) => letter === "All" || g.term[0].toUpperCase() === letter);
  const anyOpen = Object.values(open).some(Boolean);

  useEffect(() => {
    if (focusTerm) {
      setLetter("All");
      setOpen((f) => ({ ...f, [focusTerm]: true }));
    }
  }, [focusTerm]);

  return (
    <section id="glossary" aria-labelledby="glossary-title" className={portalSec}>
      <SectionHeading
        id="glossary-title"
        eyebrow="Glossary"
        title="Pension words, explained"
        highlight="explained"
        intro="Tap a card to see what a term means. Letters with no terms are greyed out."
        action={
          <button type="button" onClick={() => setOpen(Object.fromEntries(list.map((g) => [g.term, !anyOpen])))} className={cn(outlineBtn, "w-fit")}>
            {anyOpen ? "Show terms" : "Show all meanings"}
          </button>
        }
      />

      <nav aria-label="Glossary letters" className="mt-8">
        <Segments id="gl-letter" label="Glossary letters" square value={letter} onChange={setLetter} options={["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((v) => ({ v, disabled: v !== "All" && !letters.includes(v) }))} />
      </nav>

      <ul className="mt-6 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((g) => {
            const on = !!open[g.term];
            const id = `term-${g.term.replace(/\W+/g, "-")}`;
            return (
              <motion.li key={g.term} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
                {/* Hover lift on the inner card, not on the layout-animated li. */}
                <div className={cn(card, "group relative overflow-hidden", on && "border-[#117F21]/30 bg-[#F7FAF6]")}>
                  <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1 origin-left bg-gradient-to-r from-[#117F21] to-[#CB9615] transition-transform duration-500", on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                  <button type="button" aria-expanded={on} aria-controls={id} onClick={() => setOpen((f) => ({ ...f, [g.term]: !f[g.term] }))} className={cn("flex w-full items-start gap-4 rounded-3xl p-5 text-left", insetFocus)}>
                    <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#04240A] text-lg font-bold text-[#F4D27A] transition duration-300 group-hover:-rotate-6">
                      {g.term[0].toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xl font-bold text-[#0A2E10] group-hover:text-[#117F21]">{g.term}</span>
                      {g.full && <span className="mt-0.5 block text-sm text-gray-600">{g.full}</span>}
                      <span className="mt-3 inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-[#117F21]">
                        What it means
                        <ChevronDown aria-hidden="true" className={cn("h-4 w-4 transition-transform duration-300", on && "rotate-180")} />
                      </span>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}>
                        <p className="mx-5 mb-5 border-t border-gray-200 pt-4 leading-relaxed text-gray-700">{g.def}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
