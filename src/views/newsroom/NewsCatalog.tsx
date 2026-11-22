"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "@/lib/router";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Images, List, Megaphone, Newspaper } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/views/about/primitives";
import { FloatingBar, TabStrip, outlineBtn, sectionCls, type NavSection } from "@/views/theme/ui";
import Headline from "@/views/theme/Headline";
import { items, kinds, type Kind, type NewsItem } from "./data";
import {
  Banner, DraftNote, Empty, FilterPanel, Galleries, Latest, MediaDesk, NewsCard, NewsList, ResultStatus, Toast, ViewSwitch, ease,
  type Sort, type View,
} from "./parts";

const PAGE = 9;

// Top story (banner), then the Latest block (the next three stories and the newest media report). The data is static.
const lead = items.find((i) => i.kind !== "Media coverage") ?? items[0];
const stories = items.filter((i) => i.id !== lead.id && i.kind !== "Media coverage");
const latestMain: NewsItem | undefined = stories[0];
const latestSide = stories.slice(1, 3);
const latestVideo = items.find((i) => i.kind === "Media coverage" && i.id !== lead.id);
const shownAbove = new Set([lead.id, latestMain?.id, ...latestSide.map((i) => i.id), latestVideo?.id].filter(Boolean) as string[]);

/**
 * News catalogue (/news): the newsroom the stakeholders asked for (questionnaire "Anything else"; brief §6–7).
 * Classic tool page: the top story's photo is the banner (its title links to the story) → a floating bar with
 * search, type, year and sort → sticky TabStrip → the latest stories in the homepage NewsMedia layout → every
 * other story as a newspaper list grouped by month (or cards) → photo albums as a strip → the media desk as the
 * page's one dark band. Filters, sort and the cards/list choice stay in the URL so a view can be shared; while
 * filtering, the Latest block steps aside and the results include every match.
 * Not a carousel (brief §13: the home slider is the only one); images lazy-load below the fold.
 */
export default function NewsCatalog() {
  const { t } = useI18n();
  const { hash } = useLocation();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const q = params.get("q") ?? "";
  const kindParam = params.get("type");
  const kind = (kinds.find((k) => k.id === kindParam)?.id ?? null) as Kind | null;
  const year = params.get("year");
  const sort: Sort = params.get("sort") === "old" ? "old" : "new";
  // The newspaper list is the default; `?view=grid` shows cards (`?view=list` links still work).
  const view: View = params.get("view") === "grid" ? "grid" : "list";

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true, preventScrollReset: true });
    setLimit(PAGE);
  };
  const clear = () => {
    const next = new URLSearchParams(params);
    ["q", "type", "year"].forEach((k) => next.delete(k));
    setParams(next, { replace: true, preventScrollReset: true });
    setLimit(PAGE);
  };

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const a = window.setTimeout(() => scrollToId(id, !reduce), 80);
    const b = window.setTimeout(() => scrollToId(id, false), 900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [hash, reduce]);

  const filtering = !!(q || kind || year);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((i) => (c[i.kind] = (c[i.kind] ?? 0) + 1));
    return c;
  }, []);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = items.filter((i) => {
      if (kind && i.kind !== kind) return false;
      if (year && !i.date.startsWith(year)) return false;
      if (!words.length) return true;
      const hay = `${i.title} ${i.excerpt} ${i.meta} ${i.kind} ${t(i.title)} ${t(i.excerpt)}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    // Stories already shown in the banner and the Latest block are left out of the unfiltered list.
    const trimmed = filtering ? list : list.filter((i) => !shownAbove.has(i.id));
    return sort === "old" ? [...trimmed].reverse() : trimmed;
  }, [q, kind, year, sort, filtering, t]);

  const shown = results.slice(0, limit);

  const onThisPage = useMemo<NavSection[]>(
    () => [
      ...(filtering ? [] : [{ id: "latest", label: "Latest", icon: Newspaper }]),
      { id: "catalogue", label: "All news", icon: List },
      { id: "galleries", label: "Photos", icon: Images },
      { id: "media-desk", label: "Media desk", icon: Megaphone },
    ],
    [filtering],
  );

  const share = async (item: NewsItem) => {
    const url = `${window.location.origin}${item.to}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: t(item.title), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast(t("Link copied"));
    } catch {
      return;
    }
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const search = (v: string) => {
    set("q", v || null);
    window.setTimeout(() => scrollToId("catalogue", !reduce), 60);
  };

  return (
    <MotionConfig reducedMotion="user">
      <CookieConsent />
      <div className="bg-white text-[#0A2E10]">
        <Banner lead={lead} />
        <FloatingBar>
          <FilterPanel
            q={q}
            onSearch={search}
            kind={kind}
            setKind={(k) => set("type", k)}
            year={year}
            setYear={(y) => set("year", y)}
            sort={sort}
            setSort={(s) => set("sort", s === "new" ? null : s)}
            counts={counts}
          />
        </FloatingBar>
        <div className="h-6" aria-hidden="true" />
        <TabStrip sections={onThisPage} pillId="news-nav-pill" />

        {!filtering && latestMain && <Latest main={latestMain} side={latestSide} video={latestVideo} />}

        <section id="catalogue" aria-labelledby="catalogue-title" className={cn("bg-gradient-to-b from-white via-[#F4F7F2] to-white", sectionCls)}>
          <div className="mx-auto max-w-7xl">
            <Headline
              id="catalogue-title"
              kicker="All news"
              title="Browse every story"
              mark="every story"
              intro="Filter by type or year, or search. Your choices stay in the page address, so you can share the view."
              action={<ViewSwitch view={view} setView={(v) => set("view", v === "list" ? null : v)} />}
            />

            <ResultStatus shown={Math.min(limit, results.length)} total={results.length} q={q} active={filtering} clear={clear} />

            <div className="mt-6">
              {results.length === 0 ? (
                <Empty clear={clear} />
              ) : view === "list" ? (
                <NewsList list={shown} onShare={share} />
              ) : (
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((item, i) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(i % PAGE, 6) * 0.04, ease }}
                    >
                      <NewsCard item={item} onShare={share} />
                    </motion.li>
                  ))}
                </ul>
              )}

              {results.length > limit && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="h-2 w-56 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" animate={{ width: `${(limit / results.length) * 100}%` }} transition={{ duration: 0.5, ease }} />
                  </div>
                  <button type="button" onClick={() => setLimit((l) => l + PAGE)} className={cn(outlineBtn, "group")}>
                    {t("Show more news")}
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
                  </button>
                </div>
              )}
              <DraftNote />
            </div>
          </div>
        </section>

        <Galleries />
        <MediaDesk />
      </div>
      <Toast text={toast} />
    </MotionConfig>
  );
}
