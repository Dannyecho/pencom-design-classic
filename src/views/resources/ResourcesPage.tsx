"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, BookOpen, ClipboardList, FileText, FolderOpen, HelpCircle, LayoutGrid, Library as LibraryIcon, PlayCircle, Scale, Search, Type, X } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "@/lib/router";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/views/about/primitives";
import { ClosingLinks, FloatingBar, PhotoBanner, PortalLayout, Tile, ease, focus, goldBtn, listPanel, listRow, outlineDarkBtn, type NavSection } from "@/views/theme/ui";
import { FaqSection, Glossary } from "./FaqGlossary";
import Guides from "./Guides";
import { Downloads, Learning, Publications } from "./Library";
import { faqs, glossary, guides } from "./data";
import { forms, publications } from "./publications";

/**
 * Resources and knowledge base, classic portal page (brief §6.2 Resources; DES-06, DES-22, DES-24, DES-39, DES-41).
 * Photo banner → floating knowledge search (one search across guides, questions, terms and publications, plus a
 * "What's here" strip) → SideNav beside guides (read aloud, enlarge, print; ?guide=<id> makes each shareable),
 * FAQs, glossary, publications and forms → learning full width → closing links.
 * /resources/faq lands on the questions; old anchors (#annual-reports, #circulars …) still work.
 */

const onThisPage: NavSection[] = [
  { id: "guides", label: "Guides", icon: BookOpen },
  { id: "faq", label: "FAQs", icon: HelpCircle },
  { id: "glossary", label: "Glossary", icon: Type },
  { id: "publications", label: "Publications", icon: LibraryIcon },
  { id: "downloads", label: "Forms", icon: FolderOpen },
  { id: "learning", label: "Learning", icon: PlayCircle },
];

const related = [
  { to: "/services", label: "Services" },
  { to: "/regulations", label: "Regulations" },
  { to: "/connect", label: "Contact us" },
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
    const pubTab: Record<string, string> = {
      "annual-reports": "annual report",
      "monthly-reports": "monthly",
      "quarterly-reports": "quarterly",
      general: "other",
    };
    if (id in pubTab) {
      setPubHint(pubTab[id]);
      const t1 = go("publications");
      const t2 = window.setTimeout(() => scrollToId("publications", false), 900);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
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
      <div className="bg-white text-[#0A2E10]">
        <Banner jump={(id) => go(id)} />
        <KnowledgeSearch
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
        <PortalLayout sections={onThisPage} pillId="res-side-pill" related={related}>
          <Guides openId={params.get("guide")} setOpenId={setGuide} />
          <FaqSection openQ={openQ} setOpenQ={setOpenQ} />
          <Glossary focusTerm={focusTerm} />
          <Publications key={pubHint ?? "pubs"} highlight={pubHint} />
          <Downloads />
        </PortalLayout>
        <Learning openGuides={() => go("guides")} />
        <ClosingLinks
          items={[
            {
              to: "/services",
              icon: LayoutGrid,
              title: "Services",
              body: "All pension services",
            },
            {
              to: "/resources/forms-and-checklists",
              icon: ClipboardList,
              title: "Forms and checklists",
              body: "Simple checklists you can print.",
              tone: "gold",
            },
            {
              to: "/regulations",
              icon: Scale,
              title: "Regulations",
              body: "Laws, guidelines, compliance",
            },
          ]}
        />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Banner ─────────────────────────── */

function Banner({ jump }: { jump: (id: string) => void }) {
  // The photo's studio backdrop is bright pink: muting it lets the green shade read as the portal's colour.
  return (
    <div className="[&>section>img]:saturate-[.3]">
      <PhotoBanner
        id="res-title"
        crumbs={[{ label: "Home", to: "/" }, { label: "Resources" }]}
        chip={{ icon: LibraryIcon, label: "Knowledge base" }}
        title="Understand your pension, step by step"
        mark="step by step"
        intro="Plain-language guides you can read, listen to or print, answers to common questions, a glossary of pension terms, and every report and form we publish."
        image="/images/site/woman-phone-1920.webp"
        srcSet="/images/site/woman-phone-480.webp 480w, /images/site/woman-phone-960.webp 960w, /images/site/woman-phone-1920.webp 1920w"
        position="68% 30%"
        actions={
          <>
            <button type="button" onClick={() => jump("guides")} className={cn(goldBtn, "group")}>
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Step-by-step guides
            </button>
            <button type="button" onClick={() => jump("publications")} className={cn(outlineDarkBtn, "group")}>
              Reports and publications
              <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </button>
          </>
        }
      />
    </div>
  );
}

/* ─────────────────────────── Knowledge search (floating bar) ─────────────────────────── */

type Hit = {
  label: string;
  kind: "Guide" | "Question" | "Term" | "Publication";
  go: () => void;
};
const kindIcon = {
  Guide: BookOpen,
  Question: HelpCircle,
  Term: Type,
  Publication: FileText,
};

function KnowledgeSearch({
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
      ...guides
        .filter((g) => m(g.title) || m(g.intro))
        .map((g) => ({
          label: g.title,
          kind: "Guide" as const,
          go: () => openGuide(g.id),
        })),
      ...glossary
        .filter((g) => m(g.term) || m(g.full ?? ""))
        .map((g) => ({
          label: g.full ? `${g.term}: ${g.full}` : g.term,
          kind: "Term" as const,
          go: () => openTerm(g.term),
        })),
      ...faqs
        .filter((f) => m(f.q) || m(f.a))
        .map((f) => ({
          label: f.q,
          kind: "Question" as const,
          go: () => openFaq(f.q),
        })),
      ...publications
        .filter((p) => m(p.title))
        .slice(0, 4)
        .map((p) => ({
          label: p.title,
          kind: "Publication" as const,
          go: () => findPublication(p.title),
        })),
    ].slice(0, 8);
  }, [q, openGuide, openFaq, openTerm, findPublication]);

  const tiles = [
    {
      id: "guides",
      icon: BookOpen,
      n: guides.length,
      label: "Step-by-step guides",
      note: "Read, listen or print",
    },
    {
      id: "faq",
      icon: HelpCircle,
      n: faqs.length,
      label: "Common questions",
      note: "Answered in plain language",
    },
    {
      id: "glossary",
      icon: Type,
      n: glossary.length,
      label: "Pension words",
      note: "Explained simply",
    },
    {
      id: "publications",
      icon: LibraryIcon,
      n: publications.length,
      label: "Reports and publications",
      note: "Monthly to annual",
    },
    {
      id: "downloads",
      icon: FolderOpen,
      n: forms.length,
      label: "Forms and templates",
      note: "Ready to download",
    },
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
    <FloatingBar>
      <form role="search" onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="lg:col-span-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Knowledge base
          </p>
          <label htmlFor="kb-q" className="mt-1.5 block text-xl font-bold leading-snug text-[#0A2E10] sm:text-2xl">
            Search guides, questions, terms and publications
          </label>
        </div>
        <div className="min-w-0 lg:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-300 bg-[#F7FAF6] px-4 transition focus-within:border-[#117F21] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#117F21]/30 hover:border-[#117F21]/50">
              <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
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
                className="min-h-12 w-full min-w-0 bg-transparent text-base text-[#0A2E10] placeholder:text-gray-500 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                  className={cn("-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-[#E8F5E9] hover:text-[#117F21]", focus)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <button type="submit" className={cn(goldBtn, "shrink-0 px-6")}>
              <Search className="h-5 w-5" aria-hidden="true" />
              Search
            </button>
          </div>
          <AnimatePresence initial={false}>
            {q.trim().length >= 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.25, ease }} className="mt-3">
                {hits.length ? (
                  <ul ref={resultsRef} id="kb-results" role="listbox" aria-label="Results" className={cn(listPanel, "shadow-[0_28px_50px_-30px_rgba(10,74,19,0.5)]")}>
                    {hits.map((h) => {
                      const I = kindIcon[h.kind];
                      return (
                        <li key={`${h.kind}-${h.label}`} role="option" aria-selected="false">
                          <button
                            type="button"
                            onClick={() => {
                              // The results close, so focus returns to the field when a guide dialog closes.
                              inputRef.current?.focus({ preventScroll: true });
                              h.go();
                              setQ("");
                            }}
                            className={cn(listRow, "min-h-14 w-full py-2.5 text-left sm:px-5")}
                          >
                            <Tile icon={I} dark size="sm" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold text-[#0A2E10] group-hover:text-[#117F21]">{h.label}</span>
                              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#7A5200]">{h.kind}</span>
                            </span>
                            <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#117F21]" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="rounded-2xl border-l-4 border-[#117F21] bg-[#F4F7F2] px-4 py-3 text-base text-gray-700">
                    Nothing found. Try another word, or{" "}
                    <button type="button" onClick={() => document.getElementById("chat-trigger")?.click()} className={cn("rounded font-semibold text-[#117F21] underline underline-offset-4", focus)}>
                      ask PenCom Assistant
                    </button>
                    .
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* What's here: one count per collection; each jumps to its section. */}
      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-600">What’s here</p>
        <ul className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 lg:grid-cols-5">
          {tiles.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.45 + i * 0.05, ease }}
              className="last:col-span-2 lg:last:col-span-1"
            >
              <button
                type="button"
                onClick={() => jump(t.id)}
                className={cn(
                  "group flex h-full w-full flex-col items-start gap-2 bg-white p-4 text-left transition hover:bg-[#F7FAF6]",
                  "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <Tile icon={t.icon} size="sm" />
                  <span className="text-2xl font-bold tabular-nums text-[#0A4A13]">{t.n}</span>
                </span>
                <span className="block font-bold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{t.label}</span>
                <span className="-mt-1 block text-sm text-gray-600">{t.note}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </FloatingBar>
  );
}
