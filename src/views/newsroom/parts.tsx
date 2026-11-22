"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, BadgeCheck, BarChart3, CalendarDays, Check, ChevronDown, FileText, Images, Info, LayoutGrid, Link2, List,
  Mail, Megaphone, Mic, Newspaper, Paperclip, Phone, Play, Scale, Search, Share2, Tv, X, type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { CountUp, GridBackdrop, Spotlight, Tilt } from "@/views/about/primitives";
import { social } from "@/views/connect/data";
import { ArrowChip } from "@/views/docs/kit";
import Headline from "@/views/theme/Headline";
import { DarkBand, PhotoBanner, Rise, Tile, card, goldBtn, outlineBtn, sectionCls } from "@/views/theme/ui";
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
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider", s.chip, className)}>
      <s.icon className="h-3.5 w-3.5" aria-hidden="true" />
      {t(kind)}
    </span>
  );
}

const moveArrow = "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1";
/** The -480/-960/-1920 copies of a site photo, for the banner's srcSet. */
const srcSetOf = (src: string) => {
  const m = src.match(/^(.*)-1920\.webp$/);
  return m ? `${m[1]}-480.webp 480w, ${m[1]}-960.webp 960w, ${m[1]}-1920.webp 1920w` : undefined;
};

/* ─────────────────────────── Banner: the top story's photo ─────────────────────────── */

export function Banner({ lead }: { lead: NewsItem }) {
  const { t } = useI18n();
  return (
    <PhotoBanner
      id="news-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Connect", to: "/connect" }, { label: "News" }]}
      chip={{ icon: Newspaper, label: "Newsroom" }}
      title="News and updates from PenCom"
      mark="PenCom"
      intro={<p>Press releases, statements, reports and media coverage from the National Pension Commission, newest first.</p>}
      image={lead.image}
      srcSet={srcSetOf(lead.image)}
      alt={t(lead.imageAlt)}
      actions={
        <article aria-labelledby="lead-title" className="group relative w-full max-w-xl">
          <div className="relative flex items-center gap-4 rounded-2xl border border-white/15 bg-[#021a07]/70 p-4 backdrop-blur-md transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#F4D27A]/60 sm:p-5">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/85">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#CB9615] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1A1206]">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#04240A]/60 [animation-iteration-count:3]" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#04240A]" />
                  </span>
                  Top story
                </span>
                <span>{t(lead.kind)}</span>
                <time dateTime={lead.date} className="before:mr-3 before:content-['·']">{lead.dateLabel}</time>
              </p>
              <h2 id="lead-title" className="mt-2 text-lg font-bold leading-snug text-white sm:text-xl">
                <Link to={lead.to} className={cn("rounded after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:text-[#F4D27A]", focus)}>
                  {t(lead.title)}
                </Link>
              </h2>
            </div>
            <ArrowChip dark />
          </div>
        </article>
      }
    />
  );
}

/* ─────────────────────────── Floating bar: search, type, year, sort ─────────────────────────── */

export type View = "grid" | "list";
export type Sort = "new" | "old";

export function FilterPanel({
  q, onSearch, kind, setKind, year, setYear, sort, setSort, counts,
}: {
  q: string; onSearch: (q: string) => void;
  kind: Kind | null; setKind: (k: Kind | null) => void;
  year: string | null; setYear: (y: string | null) => void;
  sort: Sort; setSort: (s: Sort) => void;
  counts: Record<string, number>;
}) {
  const { t } = useI18n();
  const [text, setText] = useState(q);
  // Keep the field in step with the address (Clear filters, back button).
  useEffect(() => setText(q), [q]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(text.trim());
  };
  const chips: { id: Kind | null; label: string; n: number; icon: LucideIcon }[] = [
    { id: null, label: "All", n: counts.all, icon: Newspaper },
    ...kinds.filter((k) => counts[k.id] > 0).map((k) => ({ id: k.id, label: k.label, n: counts[k.id], icon: look[k.id].icon })),
  ];
  const select = cn(
    "min-h-12 w-full appearance-none rounded-xl border border-gray-200 bg-[#F7FAF6] pl-4 pr-10 text-base font-semibold text-[#0A2E10] transition hover:border-[#117F21]",
    focus,
  );
  const fieldLabel = "block text-sm font-semibold text-gray-700";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
        <form role="search" onSubmit={submit} className="lg:col-span-8">
          <label htmlFor="news-search" className="block text-base font-bold text-[#0A2E10]">
            Search the news
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
              <input
                id="news-search"
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("Search the news, e.g. “Pencare” or “report”")}
                className={cn(
                  "min-h-12 w-full rounded-xl border border-gray-200 bg-[#F4F7F2] pl-12 pr-12 text-base text-[#0A2E10] transition placeholder:text-gray-600 hover:border-[#117F21]/50 focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:hidden",
                  focus,
                )}
              />
              {text && (
                <button
                  type="button"
                  onClick={() => { setText(""); onSearch(""); }}
                  aria-label={t("Clear search")}
                  className={cn("absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-gray-600 transition hover:bg-[#E8F5E9] hover:text-[#0A4A13]", focus)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <button type="submit" className={cn(goldBtn, "shrink-0")}>
              <Search className="h-5 w-5" aria-hidden="true" />
              Search
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-3 lg:col-span-4">
          <label>
            <span className={fieldLabel}>{t("Year")}</span>
            <span className="relative mt-2 block">
              <select value={year ?? ""} onChange={(e) => setYear(e.target.value || null)} className={select}>
                <option value="">{t("All years")}</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
            </span>
          </label>
          <label>
            <span className={fieldLabel}>{t("Sort")}</span>
            <span className="relative mt-2 block">
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={select}>
                <option value="new">{t("Newest first")}</option>
                <option value="old">{t("Oldest first")}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#117F21]" aria-hidden="true" />
            </span>
          </label>
        </div>
      </div>

      <div role="group" aria-label={t("Type of news")} className="-mx-1 mt-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 ring-1 ring-gray-200 [scrollbar-width:none] sm:mx-0 sm:flex-wrap [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => {
          const on = kind === c.id;
          return (
            <button
              key={c.label}
              type="button"
              aria-pressed={on}
              onClick={() => setKind(c.id)}
              className={cn("relative flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition sm:text-base", on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]", focus)}
            >
              {on && <motion.span layoutId="news-kind-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_10px_24px_-12px_rgba(10,74,19,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <c.icon className={cn("relative h-4 w-4", on ? "text-[#F4D27A]" : "text-[#117F21]")} aria-hidden="true" />
              <span className="relative">{t(c.label)}</span>
              <span className={cn("relative min-w-[1.75rem] rounded-full px-1.5 text-center text-xs font-bold tabular-nums leading-5", on ? "bg-[#F4D27A] text-[#1A1206]" : "bg-[#F4F7F2] text-gray-700")}>{c.n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Cards / List switch, at the right of the catalogue heading. */
export function ViewSwitch({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { t } = useI18n();
  return (
    <div role="group" aria-label={t("Layout")} className="flex w-fit rounded-2xl bg-white p-1.5 ring-1 ring-gray-200">
      {([["list", List, "List"], ["grid", LayoutGrid, "Cards"]] as const).map(([v, Icon, label]) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => setView(v)}
          className={cn("relative flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition", view === v ? "text-white" : "text-gray-700 hover:text-[#0A4A13]", focus)}
        >
          {view === v && <motion.span layoutId="news-view-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
          <Icon className={cn("relative h-4 w-4", view === v ? "text-[#F4D27A]" : "text-[#117F21]")} aria-hidden="true" />
          <span className="relative">{t(label)}</span>
        </button>
      ))}
    </div>
  );
}

/** "Showing n of total" (live) and Clear filters, above the results. */
export function ResultStatus({ shown, total, q, active, clear }: { shown: number; total: number; q: string; active: boolean; clear: () => void }) {
  const { t } = useI18n();
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-gray-600">
      <p aria-live="polite" data-i18n-done>
        {t("Showing {n} of {total} items", { n: shown, total })}
        {q && <> {t("for “{q}”", { q })}</>}
      </p>
      {active && (
        <button type="button" onClick={clear} className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#0A2E10] transition hover:border-[#117F21] hover:text-[#117F21]", focus)}>
          <X className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────── Latest: lead + side list (homepage NewsMedia) ─────────────────────────── */

export function Latest({ main, side, video }: { main: NewsItem; side: NewsItem[]; video?: NewsItem }) {
  const { t } = useI18n();
  return (
    <section id="latest" aria-labelledby="latest-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <Headline id="latest-title" kicker="Latest news" title="Latest from PenCom" mark="PenCom" />
        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Rise className="lg:col-span-7">
            <Tilt className="h-full">
              <article aria-labelledby="latest-lead" className="group relative h-full min-h-[440px] overflow-hidden rounded-3xl bg-[#04240A] text-white">
                <img src={cardImage(main.image)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition [transition-duration:1200ms] group-hover:scale-105" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#04240A] via-[#04240A]/80 via-45% to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                  <p className="flex flex-wrap items-center gap-3 text-sm text-white/85">
                    <span className="rounded-full bg-[#CB9615] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1A1206]">{t(main.kind)}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      <time dateTime={main.date}>{main.dateLabel}</time>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{t(main.meta)}</span>
                  </p>
                  <h3 id="latest-lead" className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
                    <Link to={main.to} className={cn("rounded after:absolute after:inset-0 after:rounded-3xl after:content-['']", focus)}>
                      {t(main.title)}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-2 max-w-xl text-base text-white/85">{t(main.excerpt)}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-semibold text-[#F4D27A]">
                    {t(main.action)}
                    <ArrowRight className={moveArrow} aria-hidden="true" />
                  </span>
                </div>
              </article>
            </Tilt>
          </Rise>

          <div className="grid grid-cols-1 gap-4 lg:col-span-5">
            {side.map((n, i) => (
              <Rise key={n.id} delay={0.08 * (i + 1)}>
                <article className={cn(card, "group relative flex h-full gap-4 p-3")}>
                  <span className="relative block min-h-28 flex-none overflow-hidden rounded-2xl bg-[#E8F5E9]" style={{ width: "clamp(6.5rem, 32%, 10rem)" }}>
                    <img src={cardImage(n.image)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col justify-center py-1.5 pr-2">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <KindChip kind={n.kind} />
                      <time dateTime={n.date}>{n.dateLabel}</time>
                    </p>
                    <h3 className="mt-2 font-bold leading-snug text-[#0A2E10] transition group-hover:text-[#117F21] sm:text-lg">
                      <Link to={n.to} className={cn("rounded after:absolute after:inset-0 after:rounded-3xl after:content-['']", focus)}>
                        {t(n.title)}
                      </Link>
                    </h3>
                  </div>
                </article>
              </Rise>
            ))}
            {video && (
              <Rise delay={0.08 * (side.length + 1)}>
                <article className="group relative overflow-hidden rounded-3xl bg-[#04240A] text-white">
                  <img src={video.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105" />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#04240A] via-[#04240A]/85 to-[#04240A]/30" />
                  <div className="relative flex items-center gap-4 p-5">
                    <span aria-hidden="true" className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#F4D27A]/30 [animation-iteration-count:3]" />
                      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#F4D27A] text-[#1A1206] shadow-2xl transition group-hover:scale-110">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A]">
                        {t(video.kind)} · {video.meta}
                      </p>
                      <h3 className="mt-1 font-bold leading-snug sm:text-lg">
                        <Link to={video.to} className={cn("rounded after:absolute after:inset-0 after:rounded-3xl after:content-['']", focus)}>
                          {t(video.title)}
                        </Link>
                      </h3>
                      <p className="mt-0.5 text-sm text-white/85">{video.dateLabel}</p>
                    </div>
                  </div>
                </article>
              </Rise>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Catalogue: newspaper rows and cards ─────────────────────────── */

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
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-[#F7FAF6] px-2.5 py-0.5 text-xs font-bold text-[#7A5200]">
      <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
      PDF
    </span>
  );
}

const monthName = (iso: string) =>
  new Date(`${iso.slice(0, 7)}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** Group a list (already sorted) by month, keeping its order. */
export function byMonth(list: NewsItem[]) {
  const groups: { key: string; label: string; items: NewsItem[] }[] = [];
  list.forEach((i) => {
    const key = i.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(i);
    else groups.push({ key, label: monthName(i.date), items: [i] });
  });
  return groups;
}

/** The newspaper view: month headings over Spotlight list panels of thumbnail rows. */
export function NewsList({ list, onShare }: { list: NewsItem[]; onShare: (i: NewsItem) => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-8">
      {byMonth(list).map((g) => (
        <div key={g.key}>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#0A4A13]">{g.label}</h3>
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-[#117F21]/40 via-[#CB9615]/40 to-transparent" />
            <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-bold tabular-nums text-gray-700" aria-hidden="true">{g.items.length}</span>
          </div>
          <Spotlight className="mt-3 rounded-3xl border border-gray-200/80 bg-white">
            <ul className="divide-y divide-gray-100">
              {g.items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.04, ease }}
                >
                  <NewsRow item={item} onShare={onShare} />
                </motion.li>
              ))}
            </ul>
          </Spotlight>
        </div>
      ))}
    </div>
  );
}

function NewsRow({ item, onShare }: { item: NewsItem; onShare: (i: NewsItem) => void }) {
  const { t } = useI18n();
  const video = item.kind === "Media coverage";
  return (
    <article className="group relative flex items-start gap-4 px-4 py-4 transition hover:bg-[#F7FAF6] sm:gap-5 sm:px-5">
      <span aria-hidden="true" className="absolute inset-y-3 left-0 w-1 origin-top scale-y-0 rounded-r-full bg-gradient-to-b from-[#117F21] to-[#CB9615] transition-transform duration-300 group-hover:scale-y-100" />
      <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-2xl bg-[#E8F5E9] sm:aspect-video sm:w-44">
        <img src={cardImage(item.image)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        {video && <PlayMark small />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-gray-600">
          <KindChip kind={item.kind} />
          <time dateTime={item.date} className="font-mono">{item.dateLabel}</time>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{t(item.meta)}</span>
          {item.attachment && <PdfTag />}
        </p>
        <h4 className="mt-2 text-lg font-bold leading-snug text-[#0A2E10] transition-colors group-hover:text-[#117F21] sm:text-xl">
          <Link to={item.to} className={cn("rounded after:absolute after:inset-0 after:content-['']", focus)}>
            {t(item.title)}
          </Link>
        </h4>
        <p className="mt-1 line-clamp-2 hidden text-base leading-relaxed text-gray-600 md:block">{t(item.excerpt)}</p>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-2 self-center sm:flex">
        <ArrowChip />
        <ShareButton item={item} onShare={onShare} />
      </div>
    </article>
  );
}

export function NewsCard({ item, onShare }: { item: NewsItem; onShare: (i: NewsItem) => void }) {
  const { t } = useI18n();
  const video = item.kind === "Media coverage";
  return (
    <article className={cn(card, "group relative flex h-full flex-col overflow-hidden")}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#117F21] to-[#CB9615] transition-transform duration-500 group-hover:scale-x-100" />
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E8F5E9]">
        <img src={cardImage(item.image)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105" />
        {video && <PlayMark />}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <KindChip kind={item.kind} />
          {item.attachment && <PdfTag />}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
          <CalendarDays className="h-4 w-4 text-[#117F21]" aria-hidden="true" />
          <time dateTime={item.date}>{item.dateLabel}</time>
          <span aria-hidden="true">·</span>
          <span>{t(item.meta)}</span>
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-[#0A2E10] transition-colors group-hover:text-[#117F21]">
          <Link to={item.to} className={cn("rounded after:absolute after:inset-0 after:rounded-3xl after:content-['']", focus)}>
            {t(item.title)}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-base leading-relaxed text-gray-600">{t(item.excerpt)}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <span className="inline-flex items-center gap-2 font-semibold text-[#117F21]">
            {t(item.action)}
            <ArrowRight className={moveArrow} aria-hidden="true" />
          </span>
          <ShareButton item={item} onShare={onShare} />
        </div>
      </div>
    </article>
  );
}

function ShareButton({ item, onShare }: { item: NewsItem; onShare: (i: NewsItem) => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => onShare(item)}
      aria-label={`${t("Share")}: ${t(item.title)}`}
      data-i18n-done
      className={cn("relative z-10 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 transition hover:border-[#117F21] hover:text-[#117F21]", focus)}
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
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#04240A] px-5 py-3 text-base font-semibold text-white shadow-xl ring-1 ring-white/10"
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
    <div className="group rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <Tile icon={Search} size="lg" className="mx-auto" />
      <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#0A2E10]">No news matches your search</h3>
      <p className="mx-auto mt-2 max-w-md text-base text-gray-600">Try a different word, choose another year, or look in the regulatory library for circulars and guidelines.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={clear} className={goldBtn}>
          Clear filters
        </button>
        <Link to="/regulations#library" className={cn(outlineBtn, "group")}>
          Open the library
          <ArrowRight className={moveArrow} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/** The drafts label under the catalogue (information status card). */
export function DraftNote() {
  return (
    <div className="relative mx-auto mt-10 flex max-w-3xl items-start gap-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white py-4 pl-6 pr-5 text-base text-gray-700">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#1E88E5]" />
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#0B4F8A]" aria-hidden="true" />
      <p>News items are drafts until the newsroom is connected to the CMS. Items scheduled for a later date appear automatically on that date.</p>
    </div>
  );
}

/* ─────────────────────────── Photo galleries: a strip of albums ─────────────────────────── */

export function Galleries() {
  const { t } = useI18n();
  const list = galleries.slice(0, 4);
  return (
    <section id="galleries" aria-labelledby="galleries-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <Headline
          id="galleries-title"
          kicker="Photos"
          title="Pictures from our events"
          mark="our events"
          intro="Briefings, visits, campaigns and training, captioned so everyone can follow."
          action={
            <Link to="/media#photos" className={cn(outlineBtn, "group w-fit")}>
              <Images className="h-5 w-5" aria-hidden="true" />
              {t("All photos and videos")}
              <ArrowRight className={moveArrow} aria-hidden="true" />
            </Link>
          }
        />
        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {list.map((g, i) => {
            const [main, ...more] = g.cover;
            return (
              <li key={g.id} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
                <Rise delay={i * 0.06} className="h-full">
                  <Link to={g.to} className={cn("group flex h-full flex-col rounded-3xl", focus)}>
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-[#04240A] shadow-[0_24px_50px_-30px_rgba(4,36,10,0.7)]">
                      {main && <img src={main.src} alt={main.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition [transition-duration:1200ms] group-hover:scale-105" />}
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#04240A]/70 to-transparent" />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#04240A]/85 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/15 backdrop-blur">
                        <Images className="h-3.5 w-3.5 text-[#F4D27A]" aria-hidden="true" />
                        <span data-i18n-done>{t("{n} photos", { n: g.count })}</span>
                      </span>
                      <span aria-hidden="true" className="absolute bottom-3 right-3 flex gap-2">
                        {more.map((c, k) => (
                          <img
                            key={c.src}
                            src={c.src}
                            alt=""
                            loading="lazy"
                            className="h-14 w-14 rounded-xl object-cover shadow-lg ring-2 ring-white transition duration-500 group-hover:-translate-y-1.5"
                            style={{ transitionDelay: `${k * 60}ms` }}
                          />
                        ))}
                      </span>
                    </span>
                    <span className="mt-4 block px-1 text-xl font-bold leading-snug text-[#0A2E10] transition-colors group-hover:text-[#117F21]">{t(g.title)}</span>
                    <span className="mt-1 block flex-1 px-1 text-base leading-relaxed text-gray-600">{t(g.blurb)}</span>
                    <span className="mt-3 inline-flex items-center gap-2 px-1 font-semibold text-[#117F21]">
                      {t("See the photos")}
                      <ArrowRight className={moveArrow} aria-hidden="true" />
                    </span>
                  </Link>
                </Rise>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Media desk: the page's dark band ─────────────────────────── */

const deskCard = "relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition duration-300 hover:border-white/20 sm:p-7";
const label = "text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]";
const deskTile = "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F4D27A] to-[#CB9615] text-[#04240A] shadow-[0_12px_24px_-12px_rgba(203,150,21,0.9)]";
const deskRow = cn("group flex min-h-12 items-center gap-3 rounded-xl pr-3 transition hover:text-[#F4D27A]", focus);
const deskIcon = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition group-hover:bg-[#F4D27A] group-hover:text-[#1A1206]";

export function MediaDesk() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const figures: [number, string, LucideIcon][] = [
    [totals.stories, "Stories", Newspaper],
    [totals.coverage, "Media reports", Tv],
    [totals.photos, "Photos", Images],
  ];
  return (
    <DarkBand id="media-desk" labelledBy="media-desk-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Headline
            id="media-desk-title"
            kicker="Media desk"
            title="For journalists and researchers"
            mark="researchers"
            intro="Ask Corporate Communications for interviews, comments or official figures. Only trust news shared on our verified accounts."
            dark
            stacked
          />
        </div>
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10 lg:col-span-5">
          {figures.map(([v, l, Icon], i) => (
            <div key={l} className="group relative flex flex-col justify-between bg-[#04240A]/70 px-4 py-5 backdrop-blur sm:px-5">
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-[#CB9615] to-[#F4D27A]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: reduce ? 0 : 1.1, delay: 0.2 + i * 0.15, ease }}
              />
              <dt className="flex items-center gap-1.5 text-sm text-white/85">
                <Icon className="h-4 w-4 shrink-0 text-[#F4D27A]" aria-hidden="true" />
                {t(l)}
              </dt>
              <dd className="mt-1 text-3xl font-black tabular-nums sm:text-5xl">
                <CountUp value={String(v)} duration={1.4} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Rise className="h-full">
          <div className={deskCard}>
            <GridBackdrop className="opacity-60" />
            <span className={deskTile} aria-hidden="true">
              <Megaphone className="h-6 w-6" />
            </span>
            <p className={cn(label, "mt-5")}>Press enquiries</p>
            <p className="mt-2 text-xl font-bold">Corporate Communications Department</p>
            <ul className="mt-4 space-y-2 text-base">
              <li>
                <a href="mailto:info@pencom.gov.ng" className={deskRow}>
                  <span className={deskIcon}><Mail className="h-5 w-5" aria-hidden="true" /></span>
                  info@pencom.gov.ng
                </a>
              </li>
              <li>
                <a href="tel:094611300" className={deskRow}>
                  <span className={deskIcon}><Phone className="h-5 w-5" aria-hidden="true" /></span>
                  09-4611300
                </a>
              </li>
            </ul>
          </div>
        </Rise>
        <Rise delay={0.06} className="h-full">
          <div className={deskCard}>
            <span className={deskTile} aria-hidden="true">
              <BadgeCheck className="h-6 w-6" />
            </span>
            <p className={cn(label, "mt-5")}>Verified accounts</p>
            <ul className="mt-3 divide-y divide-white/10">
              {social.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("group flex min-h-12 items-center justify-between gap-3 rounded-xl px-2 text-base transition hover:bg-white/[0.06]", focus)}>
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
          <div className={cn(deskCard, "flex flex-col")}>
            <span className={deskTile} aria-hidden="true">
              <BarChart3 className="h-6 w-6" />
            </span>
            <p className={cn(label, "mt-5")}>Data and documents</p>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "Industry figures and charts", to: "/performance" },
                { label: "Reports and publications", to: "/resources#publications" },
                { label: "Circulars and regulations", to: "/regulations#library" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className={cn("group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 font-semibold transition hover:border-[#F4D27A] hover:text-[#F4D27A]", focus)}>
                  {t(l.label)}
                  <ArrowRight className={cn(moveArrow, "text-[#F4D27A]")} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </Rise>
      </div>
    </DarkBand>
  );
}
