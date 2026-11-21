"use client";

import { useState, type FormEvent } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, BadgeCheck, BarChart3, CalendarDays, Check, ChevronDown, FileText, Images, LayoutGrid, Link2, List, Mail,
  Megaphone, Mic, Newspaper, Paperclip, Phone, Play, Scale, Search, Share2, Tv, X, type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { CountUp } from "@/views/about/primitives";
import { social } from "@/views/connect/data";
import { ArrowChip } from "@/views/docs/kit";
import { outlineBtn } from "@/views/regulations/Sections";
import { IconTile, calmCard, goldBtn } from "@/views/legacy/calm";
import Headline from "@/views/theme/Headline";
import { DarkBackdrop, PageHero, Rise, sectionCls } from "@/views/theme/ui";
import { cardImage, galleries, kinds, totals, years, type Kind, type NewsItem } from "./data";

export const ease = [0.22, 1, 0.36, 1] as const;
export const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

export const look: Record<Kind, { icon: LucideIcon; chip: string; dot: string }> = {
  "Press release": { icon: Megaphone, chip: "bg-[#E8F5E9] text-[#0A4A13]", dot: "bg-[#117F21]" },
  Statement: { icon: FileText, chip: "bg-[#E6F1FB] text-[#0B4F8A]", dot: "bg-[#1E88E5]" },
  Speech: { icon: Mic, chip: "bg-[#F1EAFB] text-[#5B2E91]", dot: "bg-[#7E57C2]" },
  Event: { icon: CalendarDays, chip: "bg-[#FAEEDA] text-[#854F0B]", dot: "bg-[#D97706]" },
  Reports: { icon: BarChart3, chip: "bg-[#FFF2CC] text-[#7A5200]", dot: "bg-[#CB9615]" },
  Regulation: { icon: Scale, chip: "bg-[#EEF6EE] text-[#0A4A13]", dot: "bg-[#0A4A13]" },
  "Media coverage": { icon: Tv, chip: "bg-[#FCEBEB] text-[#A32D2D]", dot: "bg-[#D32F2F]" },
};

export function KindChip({ kind, className }: { kind: Kind; className?: string }) {
  const { t } = useI18n();
  const s = look[kind];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold uppercase tracking-[0.12em] sm:text-sm", s.chip, className)}>
      <s.icon className="h-4 w-4" aria-hidden="true" />
      {t(kind)}
    </span>
  );
}

const moveArrow = "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1";

/* ─────────────────────────── Hero + featured story ─────────────────────────── */

export function Hero({ lead, q, onSearch }: { lead: NewsItem; q: string; onSearch: (q: string) => void }) {
  const { t } = useI18n();
  const [text, setText] = useState(q);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(text.trim());
  };

  return (
    <PageHero
      id="news-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Connect", to: "/connect" }, { label: "News" }]}
      pill={{ icon: Newspaper, label: "Newsroom" }}
      title="News and updates from PenCom"
      mark="PenCom"
      intro={<p>Press releases, statements, reports and media coverage from the National Pension Commission, newest first.</p>}
      actions={
        <div className="max-w-xl">
          <form role="search" onSubmit={submit}>
            <label htmlFor="news-search" className="block text-lg font-semibold text-[#14261A]">
              Search the news
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
                <input
                  id="news-search"
                  type="search"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("Search the news, e.g. “Pencare” or “report”")}
                  className={cn(
                    "min-h-14 w-full rounded-2xl bg-white pl-12 pr-14 text-lg text-[#14261A] shadow-[0_18px_40px_-30px_rgba(10,74,19,0.6)] ring-1 ring-black/15 placeholder:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#117F21] [&::-webkit-search-cancel-button]:hidden",
                    focus,
                  )}
                />
                {text && (
                  <button
                    type="button"
                    onClick={() => { setText(""); onSearch(""); }}
                    aria-label={t("Clear search")}
                    className={cn("absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-gray-700 transition hover:bg-[#E8F5E9] hover:text-[#0A4A13]", focus)}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <button type="submit" className={cn(goldBtn, "shrink-0", focus)}>
                <Search className="h-5 w-5" aria-hidden="true" />
                Search
              </button>
            </div>
          </form>

          <dl className="mt-8 grid grid-cols-3 gap-3">
            {[
              [totals.stories, "Stories"],
              [totals.coverage, "Media reports"],
              [totals.photos, "Photos"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10">
                <dt className="text-base text-gray-700">{l}</dt>
                <dd className="mt-0.5 text-2xl font-bold tabular-nums text-[#14261A] sm:text-3xl">
                  <CountUp value={String(v)} duration={1.2} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      }
      aside={<Featured item={lead} />}
    />
  );
}

/** The top story: a white card with the photo above the words (never words on the photo). */
function Featured({ item }: { item: NewsItem }) {
  const { t } = useI18n();
  return (
    <article className="group relative" aria-labelledby="lead-title">
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-36px_rgba(10,74,19,0.55)] ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-[#117F21]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#E8F5E9] sm:aspect-[16/9]">
          <motion.img
            src={item.image}
            alt={t(item.imageAlt)}
            fetchPriority="high"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-gray-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F4D27A] px-3 py-1 text-[13px] font-bold uppercase tracking-[0.16em] text-[#1A1206] sm:text-sm">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0A4A13]/60 [animation-iteration-count:2]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0A4A13]" />
              </span>
              Top story
            </span>
            <KindChip kind={item.kind} />
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 text-base text-gray-700">
            <CalendarDays className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
            <time dateTime={item.date}>{item.dateLabel}</time>
            <span aria-hidden="true">·</span>
            <span>{t(item.meta)}</span>
          </p>
          <h2 id="lead-title" className="mt-3 text-2xl font-bold leading-snug tracking-tight text-[#14261A] sm:text-[1.75rem]">
            <Link to={item.to} className={cn("rounded transition-colors after:absolute after:inset-0 after:rounded-[2rem] after:content-[''] group-hover:text-[#117F21]", focus)}>
              {t(item.title)}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-3 text-lg leading-relaxed text-gray-700">{t(item.excerpt)}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-[#117F21]">
            {t(item.action)}
            <ArrowRight className={moveArrow} aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────── Filter bar ─────────────────────────── */

export type View = "grid" | "list";
export type Sort = "new" | "old";

export function FilterBar({
  kind, setKind, year, setYear, sort, setSort, view, setView, counts, shown, total, q, clear,
}: {
  kind: Kind | null; setKind: (k: Kind | null) => void;
  year: string | null; setYear: (y: string | null) => void;
  sort: Sort; setSort: (s: Sort) => void;
  view: View; setView: (v: View) => void;
  counts: Record<string, number>; shown: number; total: number; q: string; clear: () => void;
}) {
  const { t } = useI18n();
  const chips: { id: Kind | null; label: string; n: number }[] = [
    { id: null, label: "All", n: counts.all },
    ...kinds.filter((k) => counts[k.id] > 0).map((k) => ({ id: k.id, label: k.label, n: counts[k.id] })),
  ];
  const active = !!(kind || year || q);
  const select = cn(
    "min-h-12 appearance-none rounded-full bg-white pl-4 pr-10 text-base font-semibold text-[#14261A] ring-1 ring-black/15 transition hover:ring-[#117F21]",
    focus,
  );
  const fieldLabel = "flex items-center gap-2 text-base font-semibold text-gray-700";

  return (
    <>
    <div className="relative z-30 -mx-4 mt-8 px-4 py-3 lg:sticky lg:top-[92px]">
      <div className="rounded-[1.75rem] bg-white p-1.5 shadow-[0_20px_40px_-30px_rgba(10,74,19,0.6)] ring-1 ring-black/10">
        <div className="flex flex-col gap-1.5">
          <div role="group" aria-label={t("Type of news")} className="flex snap-x gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((c) => {
              const on = kind === c.id;
              return (
                <button
                  key={c.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setKind(c.id)}
                  className={cn("relative flex min-h-12 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-base font-semibold transition", on ? "text-[#F4D27A]" : "text-[#14261A] hover:bg-[#E8F5E9]", focus)}
                >
                  {on && <motion.span layoutId="news-kind-pill" className="absolute inset-0 rounded-full bg-[#0A4A13]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{t(c.label)}</span>
                  <span className={cn("relative min-w-[1.75rem] rounded-full px-1.5 text-center text-sm font-bold tabular-nums", on ? "bg-[#F4D27A] text-[#1A1206]" : "bg-[#F1EFE8] text-gray-700")}>{c.n}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/[0.07] px-2 pb-1 pt-2.5">
            <label className={fieldLabel}>
              <span>{t("Year")}</span>
              <span className="relative">
                <select value={year ?? ""} onChange={(e) => setYear(e.target.value || null)} className={select}>
                  <option value="">{t("All years")}</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
              </span>
            </label>
            <label className={fieldLabel}>
              <span>{t("Sort")}</span>
              <span className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={select}>
                  <option value="new">{t("Newest first")}</option>
                  <option value="old">{t("Oldest first")}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
              </span>
            </label>
            <div role="group" aria-label={t("Layout")} className="flex rounded-full bg-[#F1EFE8] p-1 sm:ml-auto">
              {([["grid", LayoutGrid, "Cards"], ["list", List, "List"]] as const).map(([v, Icon, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={cn("relative flex min-h-11 items-center gap-2 rounded-full px-3.5 text-base font-semibold transition", view === v ? "text-[#F4D27A]" : "text-gray-700 hover:text-[#0A4A13]", focus)}
                >
                  {view === v && <motion.span layoutId="news-view-pill" className="absolute inset-0 rounded-full bg-[#0A4A13]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <Icon className="relative h-4 w-4" aria-hidden="true" />
                  <span className="relative">{t(label)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 px-2 text-base text-gray-700">
        <p aria-live="polite" data-i18n-done>
          {t("Showing {n} of {total} items", { n: shown, total })}
          {q && <> {t("for “{q}”", { q })}</>}
        </p>
        {active && (
          <button type="button" onClick={clear} className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 font-semibold text-[#14261A] ring-1 ring-[#117F21]/40 transition hover:bg-[#0A4A13] hover:text-white", focus)}>
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────── Cards ─────────────────────────── */

/** Small gold play button on video thumbnails (an icon, not words, so it may sit on the photo). */
function PlayMark({ small }: { small?: boolean }) {
  return (
    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
      <span className={cn("flex items-center justify-center rounded-full bg-[#F4D27A] text-[#1A1206] shadow-[0_14px_30px_-12px_rgba(26,18,6,0.7)] transition duration-300 group-hover:scale-110", small ? "h-10 w-10" : "h-14 w-14")}>
        <Play className={cn("ml-0.5 fill-current", small ? "h-4 w-4" : "h-5 w-5")} />
      </span>
    </span>
  );
}

function PdfTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F1EFE8] px-2.5 py-0.5 text-sm font-bold text-[#7A5200]">
      <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
      PDF
    </span>
  );
}

export function NewsCard({ item, view, onShare }: { item: NewsItem; view: View; onShare: (i: NewsItem) => void }) {
  const { t } = useI18n();
  const video = item.kind === "Media coverage";
  const img = cardImage(item.image);

  if (view === "list") {
    return (
      <article className={cn(calmCard, "flex items-center gap-4 p-3 sm:gap-6 sm:p-4")}>
        <div className="relative aspect-[4/3] w-28 shrink-0 self-start overflow-hidden rounded-2xl bg-[#E8F5E9] sm:aspect-video sm:w-56">
          <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          {video && <PlayMark small />}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-base text-gray-700">
            <KindChip kind={item.kind} />
            <time dateTime={item.date}>{item.dateLabel}</time>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{t(item.meta)}</span>
            {item.attachment && <PdfTag />}
          </p>
          <h3 className="mt-2 text-lg font-bold leading-snug text-[#14261A] sm:text-xl">
            <Link to={item.to} className={cn("rounded transition-colors after:absolute after:inset-0 after:rounded-3xl after:content-[''] group-hover:text-[#117F21]", focus)}>
              {t(item.title)}
            </Link>
          </h3>
          <p className="mt-1 hidden line-clamp-2 text-lg leading-relaxed text-gray-700 md:block">{t(item.excerpt)}</p>
        </div>
        <div className="hidden shrink-0 flex-col items-center gap-2 sm:flex">
          <ArrowChip />
          <ShareButton item={item} onShare={onShare} />
        </div>
      </article>
    );
  }

  return (
    <article className={cn(calmCard, "flex h-full flex-col")}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E8F5E9]">
        <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105" />
        {video && <PlayMark />}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <KindChip kind={item.kind} />
          {item.attachment && <PdfTag />}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 text-base text-gray-700">
          <CalendarDays className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
          <time dateTime={item.date}>{item.dateLabel}</time>
          <span aria-hidden="true">·</span>
          <span>{t(item.meta)}</span>
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-[#14261A]">
          <Link to={item.to} className={cn("rounded transition-colors after:absolute after:inset-0 after:rounded-3xl after:content-[''] group-hover:text-[#117F21]", focus)}>
            {t(item.title)}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-lg leading-relaxed text-gray-700">{t(item.excerpt)}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/[0.08] pt-4">
          <span className="inline-flex items-center gap-2 text-lg font-semibold text-[#117F21]">
            {t(item.action)}
            <ArrowRight className={moveArrow} aria-hidden="true" />
          </span>
          <ShareButton item={item} onShare={onShare} />
        </div>
      </div>
    </article>
  );
}

function ShareButton({ item, onShare, className }: { item: NewsItem; onShare: (i: NewsItem) => void; className?: string }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => onShare(item)}
      aria-label={`${t("Share")}: ${t(item.title)}`}
      data-i18n-done
      className={cn("relative z-10 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-base font-semibold text-[#14261A] ring-1 ring-[#117F21]/40 transition hover:bg-[#0A4A13] hover:text-white", focus, className)}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      <span aria-hidden="true">{t("Share")}</span>
    </button>
  );
}

/** "Link copied" toast. */
export function Toast({ text }: { text: string | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#0A4A13] px-5 py-3 text-lg font-semibold text-white shadow-xl"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F4D27A] text-[#1A1206]">
              <Check className="h-4 w-4" aria-hidden="true" />
            </span>
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Empty({ clear }: { clear: () => void }) {
  return (
    <div className="rounded-[2rem] bg-white px-6 py-14 text-center ring-1 ring-black/10">
      <IconTile icon={Search} className="mx-auto" />
      <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#14261A]">No news matches your search</h3>
      <p className="mx-auto mt-2 max-w-md text-lg text-gray-700">Try a different word, choose another year, or look in the regulatory library for circulars and guidelines.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={clear} className={cn(goldBtn, focus)}>
          Clear filters
        </button>
        <Link to="/regulations#library" className={cn(outlineBtn, focus)}>
          Open the library
          <ArrowRight className={moveArrow} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────── Photo galleries ─────────────────────────── */

export function Galleries() {
  const { t } = useI18n();
  const list = galleries.slice(0, 4);
  return (
    <section aria-labelledby="galleries-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <Headline
          id="galleries-title"
          kicker="Photos"
          title="Pictures from our events"
          mark="our events"
          intro="Briefings, visits, campaigns and training, captioned so everyone can follow."
          action={
            <Link to="/media#photos" className={cn(outlineBtn, focus)}>
              <Images className="h-5 w-5" aria-hidden="true" />
              {t("All photos and videos")}
              <ArrowRight className={moveArrow} aria-hidden="true" />
            </Link>
          }
        />
        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((g, i) => (
            <li key={g.id}>
              <Rise delay={i * 0.06} className="h-full">
                <Link to={g.to} className={cn(calmCard, "flex h-full flex-col bg-[#FBF8F1] p-3 pb-6", focus)}>
                  {/* A gentle photo stack: the back photos open a little on hover */}
                  <div className="relative h-56">
                    {g.cover.map((c, k) => (
                      <img
                        key={c.src}
                        src={c.src}
                        alt={k === 0 ? c.alt : ""}
                        loading="lazy"
                        className={cn(
                          "absolute inset-x-4 top-3 h-48 w-[calc(100%-2rem)] rounded-2xl object-cover shadow-[0_18px_40px_-22px_rgba(10,74,19,0.6)] ring-4 ring-white transition duration-500 ease-out",
                          k === 0 && "z-30 group-hover:-translate-y-1",
                          k === 1 && "z-20 -rotate-2 scale-[0.96] group-hover:-rotate-[5deg]",
                          k === 2 && "z-10 rotate-2 scale-[0.92] group-hover:rotate-[5deg]",
                        )}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex flex-1 flex-col px-3">
                    <p className="inline-flex items-center gap-2 text-base font-semibold text-[#7A5200]">
                      <Images className="h-5 w-5" aria-hidden="true" />
                      <span data-i18n-done>{t("{n} photos", { n: g.count })}</span>
                    </p>
                    <h3 className="mt-1 text-xl font-bold leading-snug text-[#14261A] transition-colors group-hover:text-[#117F21]">{t(g.title)}</h3>
                    <p className="mt-1 flex-1 text-lg leading-relaxed text-gray-700">{t(g.blurb)}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-[#117F21]">
                      {t("See the photos")}
                      <ArrowRight className={moveArrow} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Rise>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Media desk ─────────────────────────── */

const deskCard = "h-full rounded-3xl bg-white/[0.07] p-6 ring-1 ring-white/10 sm:p-7";
const label = "text-sm font-bold uppercase tracking-[0.18em] text-[#F4D27A]";
const deskTile = "flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4D27A] text-[#1A1206]";

/** The page's one green inset panel. */
export function MediaDesk() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="media-desk-title" className={sectionCls}>
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] p-6 text-white sm:p-10 lg:p-14">
        <DarkBackdrop />
        <Headline
          id="media-desk-title"
          kicker="Media desk"
          title="For journalists and researchers"
          mark="researchers"
          intro="Ask Corporate Communications for interviews, comments or official figures. Only trust news shared on our verified accounts."
          dark
        />
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Rise className="h-full">
            <div className={deskCard}>
              <span className={deskTile} aria-hidden="true">
                <Megaphone className="h-7 w-7" />
              </span>
              <p className={cn(label, "mt-5")}>Press enquiries</p>
              <p className="mt-2 text-xl font-bold">Corporate Communications Department</p>
              <ul className="mt-4 space-y-2 text-lg">
                <li>
                  <a href="mailto:info@pencom.gov.ng" className={cn("group inline-flex min-h-12 items-center gap-3 rounded-2xl pr-3 transition hover:text-[#F4D27A]", focus)}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition group-hover:bg-[#F4D27A] group-hover:text-[#1A1206]"><Mail className="h-5 w-5" aria-hidden="true" /></span>
                    info@pencom.gov.ng
                  </a>
                </li>
                <li>
                  <a href="tel:094611300" className={cn("group inline-flex min-h-12 items-center gap-3 rounded-2xl pr-3 transition hover:text-[#F4D27A]", focus)}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition group-hover:bg-[#F4D27A] group-hover:text-[#1A1206]"><Phone className="h-5 w-5" aria-hidden="true" /></span>
                    09-4611300
                  </a>
                </li>
              </ul>
            </div>
          </Rise>
          <Rise delay={0.06} className="h-full">
            <div className={deskCard}>
              <span className={deskTile} aria-hidden="true">
                <BadgeCheck className="h-7 w-7" />
              </span>
              <p className={cn(label, "mt-5")}>Verified accounts</p>
              <ul className="mt-3 space-y-1">
                {social.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("group flex min-h-12 items-center justify-between gap-3 rounded-2xl px-3 text-lg transition hover:bg-white/10", focus)}>
                      <span><span className="font-semibold">{s.name}</span> <span className="text-white/80">{s.handle}</span></span>
                      <Link2 className="h-5 w-5 shrink-0 text-white/70 transition group-hover:text-[#F4D27A]" aria-hidden="true" />
                      <span className="sr-only">{t("(opens in a new tab)")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Rise>
          <Rise delay={0.12} className="h-full">
            <div className={cn(deskCard, "flex flex-col gap-3")}>
              <span className={deskTile} aria-hidden="true">
                <BarChart3 className="h-7 w-7" />
              </span>
              <p className={cn(label, "mt-2")}>Data and documents</p>
              {[
                { label: "Industry figures and charts", to: "/performance" },
                { label: "Reports and publications", to: "/resources#publications" },
                { label: "Circulars and regulations", to: "/regulations#library" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className={cn("group flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-white px-5 text-lg font-semibold text-[#14261A] transition hover:bg-[#F4D27A] hover:text-[#1A1206]", focus)}>
                  {t(l.label)}
                  <ArrowRight className={cn(moveArrow, "text-[#117F21] group-hover:text-[#1A1206]")} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}
