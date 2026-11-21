"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, FileText, FolderOpen, HelpCircle, Library as LibraryIcon, Search, Type, X } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "@/lib/router";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/views/about/primitives";
import { FramedPanel, PageHero, SectionNav, ease, focus } from "@/views/theme/ui";
import { FaqSection, Glossary } from "./FaqGlossary";
import Guides from "./Guides";
import { Downloads, Learning, Publications } from "./Library";
import { faqs, glossary, guides } from "./data";
import { forms, publications } from "./publications";

/**
 * Resources and knowledge base, calm theme (brief §6.2 Resources; DES-06, DES-22, DES-24, DES-39, DES-41).
 * Hero with one search across guides, questions, terms and publications → guides (read aloud, enlarge, print;
 * ?guide=<id> makes each shareable) → FAQs → glossary → publications → forms → learning.
 * /resources/faq lands on the questions; old anchors (#annual-reports, #circulars …) still work.
 */

const onThisPage = [
  { id: "guides", label: "Guides" },
  { id: "faq", label: "FAQs" },
  { id: "glossary", label: "Glossary" },
  { id: "publications", label: "Publications" },
  { id: "downloads", label: "Forms" },
  { id: "learning", label: "Learning" },
];

export default function ResourcesPage() {
  const { pathname, hash } = useLocation();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [openQ, setOpenQ] = useState<string | null>(null);
  const [focusTerm, setFocusTerm] = useState<string | null>(null);
  const [pubHint, setPubHint] = useState<string | null>(null);

  const go = useCallback((id: string) => window.setTimeout(() => scrollToId(id, !reduce), 60), [reduce]);

  const setGuide = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("guide", id);
    else next.delete("guide");
    setParams(next, { replace: true, preventScrollReset: true });
  };

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (id === "circulars") {
      navigate("/regulations?type=Circular#library", { replace: true });
      return;
    }
    const pubTab: Record<string, string> = { "annual-reports": "annual report", "monthly-reports": "monthly", "quarterly-reports": "quarterly", general: "other" };
    if (id in pubTab) {
      setPubHint(pubTab[id]);
      const t = go("publications");
      return () => window.clearTimeout(t);
    }
    if (id === "presentations" || id === "seminars") {
      const t = go("learning");
      return () => window.clearTimeout(t);
    }
    if (id) {
      const t1 = go(id);
      const t2 = window.setTimeout(() => scrollToId(id, false), 900);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    if (pathname.endsWith("/faq")) {
      const t = go("faq");
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [hash, pathname, go, navigate]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#FBF8F1] text-[#14261A]">
        <Hero
          openGuide={(id) => setGuide(id)}
          openFaq={(q) => {
            setOpenQ(q);
            go("faq");
          }}
          openTerm={(t) => {
            setFocusTerm(t);
            go("glossary");
          }}
          findPublication={(t) => {
            setPubHint(t);
            go("publications");
          }}
          jump={(id) => go(id)}
        />
        <SectionNav sections={onThisPage} pillId="res-nav-pill" />
        <Guides openId={params.get("guide")} setOpenId={setGuide} />
        <FaqSection openQ={openQ} setOpenQ={setOpenQ} />
        <Glossary focusTerm={focusTerm} />
        <Publications key={pubHint ?? "pubs"} highlight={pubHint} />
        <Downloads />
        <Learning openGuides={() => go("guides")} />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Hero + knowledge search ─────────────────────────── */

type Hit = { label: string; kind: "Guide" | "Question" | "Term" | "Publication"; go: () => void };
const kindIcon = { Guide: BookOpen, Question: HelpCircle, Term: Type, Publication: FileText };

function Hero({
  openGuide,
  openFaq,
  openTerm,
  findPublication,
  jump,
}: {
  openGuide: (id: string) => void;
  openFaq: (q: string) => void;
  openTerm: (term: string) => void;
  findPublication: (q: string) => void;
  jump: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const m = (s: string) => s.toLowerCase().includes(term);
    return [
      ...guides.filter((g) => m(g.title) || m(g.intro)).map((g) => ({ label: g.title, kind: "Guide" as const, go: () => openGuide(g.id) })),
      ...glossary.filter((g) => m(g.term) || m(g.full ?? "")).map((g) => ({ label: g.full ? `${g.term}: ${g.full}` : g.term, kind: "Term" as const, go: () => openTerm(g.term) })),
      ...faqs.filter((f) => m(f.q) || m(f.a)).map((f) => ({ label: f.q, kind: "Question" as const, go: () => openFaq(f.q) })),
      ...publications.filter((p) => m(p.title)).slice(0, 4).map((p) => ({ label: p.title, kind: "Publication" as const, go: () => findPublication(p.title) })),
    ].slice(0, 8);
  }, [q, openGuide, openFaq, openTerm, findPublication]);

  const tiles = [
    { id: "guides", icon: BookOpen, n: guides.length, label: "Step-by-step guides", note: "Read, listen or print" },
    { id: "faq", icon: HelpCircle, n: faqs.length, label: "Common questions", note: "Answered in plain language" },
    { id: "glossary", icon: Type, n: glossary.length, label: "Pension words", note: "Explained simply" },
    { id: "publications", icon: LibraryIcon, n: publications.length, label: "Reports and publications", note: "Monthly to annual" },
    { id: "downloads", icon: FolderOpen, n: forms.length, label: "Forms and templates", note: "Ready to download" },
  ];

  const resultsRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // The labelled Search button moves to the first result (results show as you type), or back to the field.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const first = resultsRef.current?.querySelector<HTMLButtonElement>("button");
    if (first) first.focus();
    else inputRef.current?.focus();
  };

  return (
    <PageHero
      id="res-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Resources" }]}
      pill={{ icon: LibraryIcon, label: "Knowledge base" }}
      title="Understand your pension, step by step"
      mark="step by step"
      intro="Plain-language guides you can read, listen to or print, answers to common questions, a glossary of pension terms, and every report and form we publish."
      actions={
        <form role="search" onSubmit={submit} className="max-w-xl">
          <label htmlFor="kb-q" className="block text-lg font-semibold">
            Search guides, questions, terms and publications
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white px-4 shadow-[0_18px_40px_-26px_rgba(10,74,19,0.6)] ring-1 ring-black/15 transition focus-within:ring-2 focus-within:ring-[#117F21]">
              <Search className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
              <input
                ref={inputRef}
                id="kb-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “transfer”, “RSA” or “annual report”"
                autoComplete="off"
                role="combobox"
                aria-expanded={hits.length > 0}
                aria-controls="kb-results"
                className="min-h-16 w-full min-w-0 bg-transparent text-lg placeholder:text-lg placeholder:text-gray-500 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear search" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-[#F1EFE8]", focus)}>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <button type="submit" className={cn("inline-flex min-h-16 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-7 text-lg font-semibold text-[#1A1206] shadow-[0_14px_30px_-18px_rgba(122,82,0,0.8)] transition hover:bg-[#FFE08F]", focus)}>
              <Search className="h-5 w-5" aria-hidden="true" />
              Search
            </button>
          </div>
          <AnimatePresence initial={false}>
            {q.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25, ease }}
                className="mt-3 rounded-3xl bg-white p-2 shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] ring-1 ring-black/10"
              >
                {hits.length ? (
                  <ul ref={resultsRef} id="kb-results" role="listbox" aria-label="Results">
                    {hits.map((h) => {
                      const I = kindIcon[h.kind];
                      return (
                        <li key={`${h.kind}-${h.label}`} role="option" aria-selected="false">
                          <button
                            type="button"
                            onClick={() => {
                              h.go();
                              setQ("");
                            }}
                            className={cn("group flex min-h-16 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-[#E8F5E9]", focus)}
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]">
                              <I className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-lg font-semibold">{h.label}</span>
                              <span className="block text-sm font-bold uppercase tracking-[0.14em] text-[#7A5200]">{h.kind}</span>
                            </span>
                            <ArrowRight className="h-5 w-5 shrink-0 text-[#0A4A13] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-4 py-4 text-lg text-gray-700">
                    Nothing found. Try another word, or{" "}
                    <button type="button" onClick={() => document.getElementById("chat-trigger")?.click()} className={cn("rounded font-semibold text-[#0A4A13] underline underline-offset-4", focus)}>
                      ask PenCom Assistant
                    </button>
                    .
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      }
      aside={
        <FramedPanel className="p-5 sm:p-7">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#E8F5E9]" />
          <p className="relative flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-[0.18em] text-[#0A4A13]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#CB9615]" />
            What’s here
          </p>
          <ul className="relative mt-4 space-y-2.5">
            {tiles.map((t, i) => (
              <motion.li key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.3 + i * 0.06, ease }}>
                <button
                  type="button"
                  onClick={() => jump(t.id)}
                  className={cn("group flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl bg-[#FBF8F1] p-3 text-left ring-1 ring-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_40px_-26px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]", focus)}
                >
                  <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]">
                    <t.icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold leading-snug">{t.label}</span>
                    <span className="block text-base text-gray-600">{t.note}</span>
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-[#0A4A13]">{t.n}</span>
                  <ArrowRight className="hidden h-5 w-5 shrink-0 text-[#0A4A13] transition-transform duration-300 group-hover:translate-x-1 sm:block" aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </ul>
        </FramedPanel>
      }
    />
  );
}
