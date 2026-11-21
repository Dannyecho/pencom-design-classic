"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, MessageCircle, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ease, focus, sectionCls } from "@/views/theme/ui";
import { SectionHeading } from "./compat";
import { faqCats, faqs, glossary } from "./data";
import { Bubble, IconTile, goldBtn, pill } from "./Library";
import { useI18n } from "@/i18n/context";

/* ─────────────────────────── FAQ: calm accordion ─────────────────────────── */

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
    <section id="faq" aria-labelledby="faq-title" className={cn(sectionCls, "bg-[#FBF8F1]")}>
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[180px]">
              <SectionHeading stacked id="faq-title" eyebrow="Frequently asked" title="Answers in plain language" highlight="plain language" intro="Short answers to the questions we hear most. Choose a group or search." />
              <div className="group relative mt-8 overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-black/10 shadow-[0_28px_50px_-34px_rgba(10,74,19,0.5)]">
                <Bubble />
                <IconTile icon={MessageCircle} className="relative" />
                <p className="relative mt-4 text-xl font-bold tracking-tight">Still have a question?</p>
                <p className="relative mt-1 text-lg text-gray-700">PenCom Assistant answers from our published guidance.</p>
                <button type="button" onClick={() => document.getElementById("chat-trigger")?.click()} className={cn(goldBtn, "relative mt-5 w-full sm:w-fit", focus)}>
                  Ask PenCom Assistant
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-[#F1EFE8] p-4 sm:p-5">
              <label htmlFor="faq-q" className="block text-lg font-semibold">Search questions</label>
              <div className="mt-2 flex min-w-0 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-black/15 transition focus-within:ring-2 focus-within:ring-[#117F21]">
                <Search className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
                <input id="faq-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions" className="min-h-14 w-full min-w-0 bg-transparent text-lg placeholder:text-gray-500 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div role="group" aria-label="Filter questions" className="mt-4 flex flex-wrap gap-2">
                {["All", ...faqCats].map((c) => (
                  <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={pill(cat === c)}>
                    {c}
                  </button>
                ))}
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
                        "relative overflow-hidden rounded-3xl bg-white transition-shadow duration-300",
                        isOpen ? "shadow-[0_28px_50px_-30px_rgba(10,74,19,0.55)] ring-2 ring-[#117F21]" : "ring-1 ring-black/10 hover:shadow-[0_24px_44px_-32px_rgba(10,74,19,0.5)] hover:ring-2 hover:ring-[#117F21]",
                      )}
                    >
                      <span aria-hidden="true" className={cn("absolute inset-y-5 left-0 w-1 origin-top rounded-r-full bg-gradient-to-b from-[#117F21] to-[#CB9615] transition-transform duration-500", isOpen ? "scale-y-100" : "scale-y-0")} />
                      <h3>
                        <button
                          id={`${id}-btn`}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={id}
                          onClick={() => setOpenQ(isOpen ? null : f.q)}
                          className="group flex min-h-16 w-full items-center gap-4 rounded-3xl px-5 py-4 text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D] sm:px-6"
                        >
                          <span className="flex-1">
                            <span className="mb-1.5 hidden w-fit rounded-full bg-[#E8F5E9] px-3 py-0.5 text-sm font-bold uppercase tracking-[0.12em] text-[#0A4A13] sm:block">{f.cat}</span>
                            <span className="block text-xl font-semibold leading-snug">{f.q}</span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition duration-300",
                              isOpen ? "rotate-180 bg-[#0A4A13] text-[#F4D27A]" : "bg-[#E8F5E9] text-[#0A4A13] group-hover:bg-[#0A4A13] group-hover:text-[#F4D27A]",
                            )}
                          >
                            <ChevronDown className="h-5 w-5" />
                          </span>
                        </button>
                      </h3>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div id={id} role="region" aria-labelledby={`${id}-btn`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}>
                            <div className="px-5 pb-6 sm:px-6">
                              <p className="text-lg leading-relaxed text-gray-800">{f.a}</p>
                              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-black/10 pt-4 text-lg text-gray-700">
                                <span>Was this helpful?</span>
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
                                        "inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 text-lg font-semibold transition duration-300",
                                        focus,
                                        on ? "bg-[#0A4A13] text-[#F4D27A]" : "border-2 border-[#117F21] bg-white text-[#0A4A13] hover:bg-[#117F21] hover:text-white",
                                      )}
                                    >
                                      <I className="h-5 w-5" aria-hidden="true" />
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
            {list.length === 0 && <p className="mt-6 rounded-3xl border-2 border-dashed border-black/15 bg-white p-8 text-center text-lg text-gray-700">No questions match. Try another word, or ask PenCom Assistant.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Glossary: simple cards that open ─────────────────────────── */

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
    <section id="glossary" aria-labelledby="glossary-title" className={cn(sectionCls, "bg-white")}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="glossary-title"
          eyebrow="Glossary"
          title="Pension words, explained"
          highlight="explained"
          intro="Tap a card to see what a term means. Letters with no terms are greyed out."
          action={
            <button
              type="button"
              onClick={() => setOpen(Object.fromEntries(list.map((g) => [g.term, !anyOpen])))}
              className={cn("inline-flex min-h-14 w-fit items-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white", focus)}
            >
              {anyOpen ? "Show terms" : "Show all meanings"}
            </button>
          }
        />

        <nav aria-label="Glossary letters" className="mt-10 flex flex-wrap gap-1.5 rounded-3xl bg-[#FBF8F1] p-2 ring-1 ring-black/10">
          {["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((l) => {
            const has = l === "All" || letters.includes(l);
            return (
              <button
                key={l}
                type="button"
                disabled={!has}
                aria-pressed={letter === l}
                onClick={() => setLetter(l)}
                className={cn(has ? pill(letter === l) : "inline-flex min-h-12 items-center justify-center rounded-full text-lg font-semibold text-gray-400", "min-w-12 px-3")}
              >
                {l}
              </button>
            );
          })}
        </nav>

        <ul className="mt-8 grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((g) => {
              const on = !!open[g.term];
              const id = `term-${g.term.replace(/\W+/g, "-")}`;
              return (
                <motion.li key={g.term} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
                  {/* Hover lift on the inner card, not on the layout-animated li. */}
                  <div className={cn("group relative overflow-hidden rounded-3xl bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)]", on ? "ring-2 ring-[#117F21]" : "ring-1 ring-black/10 hover:ring-2 hover:ring-[#117F21]")}>
                    <Bubble />
                    <button type="button" aria-expanded={on} aria-controls={id} onClick={() => setOpen((f) => ({ ...f, [g.term]: !f[g.term] }))} className="relative flex w-full flex-col items-start rounded-3xl p-5 text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D] sm:p-6">
                      <span className="pr-10 text-2xl font-bold tracking-tight">{g.term}</span>
                      {g.full && <span className="mt-1 block text-lg text-gray-700">{g.full}</span>}
                      <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-[#0A4A13]">
                        <span aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center rounded-full transition duration-300", on ? "rotate-180 bg-[#0A4A13] text-[#F4D27A]" : "bg-[#E8F5E9] text-[#0A4A13] group-hover:bg-[#0A4A13] group-hover:text-[#F4D27A]")}>
                          <ChevronDown className="h-5 w-5" />
                        </span>
                        What it means
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}>
                          <p className="relative mx-5 mb-5 border-t border-black/10 pt-4 text-lg leading-relaxed text-gray-800 sm:mx-6 sm:mb-6">{g.def}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  );
}
