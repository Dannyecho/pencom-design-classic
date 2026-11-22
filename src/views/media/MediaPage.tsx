"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  Camera, Check, ChevronLeft, ChevronRight, Clapperboard, Expand, Images, Mail, Newspaper, Pause, Play, Share2, Youtube, X,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight, scrollToId } from "@/views/about/primitives";
import Headline, { DrawnMark } from "@/views/theme/Headline";
import {
  ClosingLinks, Crumbs, DarkBackdrop, DarkBand, EyebrowPill, FloatingBar, RiseWords, TabStrip, Tile, card, ease, focus, goldBtn,
  outlineBtn, outlineDarkBtn, sectionCls, useMarked, type NavSection,
} from "@/views/theme/ui";
import { social } from "@/views/connect/data";
import { albums, channelUrl, photoSrc, photos, thumb, topics, videos, type Photo, type Topic } from "./data";

/**
 * Photos and videos (questionnaire "Anything else": news and media centre with photographs and videos;
 * brief §7 "News and events": gallery with alt text). Deep links: /media?album=people, /media?photo=<id>, /media?video=<id>.
 * Classic tool page: dark banner with a slow photo mosaic (three tiles crossfading, labelled pause) → floating bar with
 * the page's figures and the newest video → sticky TabStrip (photos, videos, follow) → albums and the photo masonry
 * on the soft band → videos as the page's one dark band (player and playlist) → official accounts and closing links.
 * The lightbox fades between photos (no sideways motion), takes the arrow keys, keeps `?photo=` and returns focus.
 */

const byId = (id: string) => photos.find((p) => p.id === id)!;
/** Banner mosaic: one large tile and two small ones, each with its own photos (larger files on the large tile). */
const mosaic: Photo[][] = [
  ["statehouse-dg-onanuga", "people-iwd-ppp-launch", "media-fsd-africa", "people-customer-clinic"].map(byId),
  ["industry-apa-licence-awabah", "partners-dg-igp", "learning-redeemers-tour"].map(byId),
  ["people-nup-legacy-house", "media-pilc-briefing", "staff-tgif-dance"].map(byId),
];

const nav: NavSection[] = [
  { id: "photos", label: "Photos", icon: Images },
  { id: "videos", label: "Videos", icon: Clapperboard },
  { id: "follow", label: "Follow us", icon: Share2 },
];

/* ─────────────────────────── Banner: photo mosaic ─────────────────────────── */

function MosaicTile({ list, index, className }: { list: Photo[]; index: number; className?: string }) {
  const reduce = useReducedMotion();
  const ph = list[index % list.length];
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-[#0A4A13] ring-1 ring-white/15", className)}>
      <AnimatePresence initial={false}>
        <motion.img
          key={ph.id}
          src={photoSrc(ph)}
          alt=""
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: reduce ? 1 : 1.06 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.4, ease }, scale: { duration: 12, ease: "linear" } }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#021a07]/40 to-transparent" />
    </div>
  );
}

function Banner({ onVideos, onPhotos }: { onVideos: () => void; onPhotos: () => void }) {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const title = "PenCom in pictures and video";
  const { before, shown, after, done } = useMarked(title, "pictures and video");
  const nBefore = before.split(" ").length;

  // One tile changes at a time, every 3.5 s (stopped while paused or with reduced motion).
  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 3500);
    return () => window.clearInterval(id);
  }, [reduce, paused]);
  const idx = (k: number) => Math.floor((tick + 2 - k) / 3);

  return (
    <section aria-labelledby="media-title" className="relative isolate overflow-hidden text-white print:text-black">
      <DarkBackdrop />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-6 sm:pb-28">
        <Crumbs crumbs={[{ label: "Home", to: "/" }, { label: "Connect", to: "/connect" }, { label: "Photos and videos" }]} dark />
        <div className="mt-6 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
              <EyebrowPill icon={Camera} label="Media centre" dark />
            </motion.div>
            <h1 id="media-title" data-i18n-done={done} className="mt-5 text-[2.25rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              <RiseWords text={before.trimEnd()} />
              {shown && (
                <>
                  {before && " "}
                  <motion.span className="inline-block" initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.06 + nBefore * 0.05, ease }}>
                    <DrawnMark text={shown} dark />
                  </motion.span>
                  {after && !after.startsWith(" ") ? "" : " "}
                  <RiseWords text={after.trimStart()} start={nBefore + 1} />
                </>
              )}
            </h1>
            <motion.p initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease }} className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Events, campaigns and visits from across the country, and the Commission’s work as reported on national television.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4, ease }} className="mt-7 flex flex-wrap gap-3 print:hidden">
              <button type="button" onClick={onPhotos} className={goldBtn}>
                <Images className="h-5 w-5" aria-hidden="true" /> Browse photos
              </button>
              <button type="button" onClick={onVideos} className={outlineDarkBtn}>
                <Play className="h-5 w-5 fill-current" aria-hidden="true" /> Watch videos
              </button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }} className="lg:col-span-6 print:hidden">
            <div aria-hidden="true" className="grid h-60 grid-cols-3 grid-rows-2 gap-3 sm:h-80 lg:h-[400px]">
              <MosaicTile list={mosaic[0]} index={idx(0)} className="col-span-2 row-span-2" />
              <MosaicTile list={mosaic[1]} index={idx(1)} />
              <MosaicTile list={mosaic[2]} index={idx(2)} />
            </div>
            {!reduce && (
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className={cn(outlineDarkBtn, "min-h-11 px-4 text-sm")}>
                  {paused ? <Play className="h-4 w-4 fill-current" aria-hidden="true" /> : <Pause className="h-4 w-4 fill-current" aria-hidden="true" />}
                  {t(paused ? "Play photo wall" : "Pause photo wall")}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Floating bar: figures and the newest video ─────────────────────────── */

function Overview({ onPlay }: { onPlay: () => void }) {
  const v = videos[0];
  const figures = [[photos.length, "Photos", Camera], [albums.length, "Albums", Images], [videos.length, "Videos", Clapperboard]] as const;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-gray-200/80 ring-1 ring-gray-200/80 lg:col-span-5">
        {figures.map(([n, l, Icon]) => (
          <div key={l} className="bg-white px-4 py-4 sm:px-5">
            <dt className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
              <Icon className="h-4 w-4 shrink-0 text-[#117F21]" aria-hidden="true" /> {l}
            </dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums text-[#0A2E10]">{n}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:col-span-7">
        <button type="button" onClick={onPlay} className={cn("group relative block aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-[#04240A] sm:w-48", focus)} aria-label={`Play: ${v.title}`}>
          <img src={thumb(v.id)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-[#04240A]/30 transition group-hover:bg-[#04240A]/10">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#CB9615] text-[#1A1206] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] transition group-hover:scale-110">
              <Play className="h-4 w-4 translate-x-px fill-current" />
            </span>
          </span>
        </button>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">Newest video</p>
          <p className="mt-1 text-lg font-bold leading-snug text-[#0A2E10]">{v.title}</p>
          <p className="mt-0.5 text-sm text-gray-600">{v.channel} · {v.month}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Photos ─────────────────────────── */

function Photos({ album, setAlbum, open }: { album: string; setAlbum: (a: string) => void; open: (id: string) => void }) {
  const reduce = useReducedMotion();
  const shown = photos.filter((p) => album === "all" || p.album === album);
  const a = albums.find((x) => x.id === album);
  const cards = [{ id: "all", title: "All photos", cover: byId("people-iwd-crowd"), n: photos.length }, ...albums.map((al) => ({ id: al.id, title: al.title, cover: photos.find((p) => p.album === al.id)!, n: photos.filter((p) => p.album === al.id).length }))];
  return (
    <section id="photos" aria-labelledby="ph-title" className={cn("bg-gradient-to-b from-white via-[#F4F7F2] to-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <Headline
          id="ph-title"
          kicker="Photo gallery"
          title="Moments from the Commission"
          mark="the Commission"
          intro="Photos from PenCom Chronicles, Issue 1. Select a photo to see it full screen."
          action={
            <Link to="/chronicles" className={cn(outlineBtn, "group")}>
              From PenCom Chronicles <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          }
        />

        {/* Albums: a small masonry of covers; the chosen one has a gold ring */}
        <ul className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4" aria-label="Albums">
          {cards.map((c, i) => {
            const on = album === c.id;
            return (
              <li key={c.id} className="mb-4 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setAlbum(c.id)}
                  aria-pressed={on}
                  className={cn(
                    "group block w-full overflow-hidden rounded-3xl border bg-white p-1.5 text-left transition duration-300 hover:-translate-y-0.5",
                    focus,
                    on ? "border-transparent shadow-[0_24px_50px_-24px_rgba(203,150,21,0.7)] ring-[3px] ring-[#CB9615]" : "border-gray-200/80 hover:border-[#117F21]/30 hover:shadow-[0_24px_50px_-24px_rgba(10,74,19,0.4)]",
                  )}
                >
                  <span className={cn("relative block overflow-hidden rounded-[1.25rem] bg-[#F4F7F2]", i % 3 === 0 ? "h-40 sm:h-44" : i % 3 === 1 ? "h-28 sm:h-32" : "h-32 sm:h-36")}>
                    <img src={photoSrc(c.cover)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#021a07]/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#04240A]/85 px-2.5 py-1 text-xs font-semibold text-white">
                      <Camera className="h-3.5 w-3.5 text-[#F4D27A]" aria-hidden="true" /> {c.n} photos
                    </span>
                    {on && (
                      <motion.span initial={{ scale: reduce ? 1 : 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} aria-hidden="true" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#CB9615] text-[#1A1206] shadow">
                        <Check className="h-4 w-4" />
                      </motion.span>
                    )}
                  </span>
                  <span className="block px-2.5 pb-2 pt-2.5 text-base font-bold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{c.title}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <AnimatePresence mode="wait">
          <motion.p key={album} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 text-base text-gray-600" aria-live="polite">
            <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#CB9615]" />
            <span>{a ? <><strong className="text-[#0A2E10]">{a.title}.</strong> {a.blurb} </> : <strong className="text-[#0A2E10]">All albums. </strong>}{shown.length} photos.</span>
          </motion.p>
        </AnimatePresence>

        {/* Masonry: photo on top, caption below (text never sits over a photo) */}
        <AnimatePresence mode="wait">
          <motion.ul key={album} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {shown.map((ph, i) => (
              <motion.li key={ph.id} initial={{ opacity: 0, y: reduce ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease }} className="mb-5 break-inside-avoid">
                <button type="button" onClick={() => open(ph.id)} className={cn(card, "group relative block w-full overflow-hidden p-2 text-left", focus)}>
                  <span className="relative block overflow-hidden rounded-[1.25rem] bg-[#F4F7F2]">
                    <img src={photoSrc(ph)} alt={ph.alt} loading="lazy" className={cn("w-full object-cover transition duration-700 group-hover:scale-[1.04]", ph.tall ? "aspect-[4/5]" : i % 5 === 0 ? "aspect-[4/3]" : "aspect-[3/2]")} />
                  </span>
                  <span className="flex items-start justify-between gap-3 px-2 pb-2 pt-3">
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#7A5200]">{albums.find((x) => x.id === ph.album)?.title}</span>
                      <span className="mt-1 block text-base font-semibold leading-snug text-[#0A2E10]">{ph.caption}</span>
                    </span>
                    <Tile icon={Expand} size="sm" />
                  </span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─────────────────────────── Videos (the dark band) ─────────────────────────── */

function Videos({ current, setCurrent, playing, setPlaying }: { current: string; setCurrent: (id: string) => void; playing: boolean; setPlaying: (p: boolean) => void }) {
  const reduce = useReducedMotion();
  const [topic, setTopic] = useState<Topic>("All");
  const [hiOk, setHiOk] = useState(true);
  const list = useMemo(() => videos.filter((v) => topic === "All" || v.topic === topic), [topic]);
  const v = videos.find((x) => x.id === current) ?? videos[0];
  useEffect(() => setHiOk(true), [current]);

  const choose = (id: string) => {
    setCurrent(id);
    setPlaying(true);
    if (window.innerWidth < 1024) document.getElementById("player")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <DarkBand id="videos" labelledBy="vid-title">
      <Headline
        id="vid-title"
        dark
        kicker="Videos"
        title="PenCom on TV"
        mark="on TV"
        intro="How national broadcasters have covered the Commission’s work. Videos play from YouTube."
        action={
          <div role="radiogroup" aria-label="Filter videos by topic" className="flex flex-wrap gap-1 rounded-2xl bg-white/[0.06] p-1.5 ring-1 ring-white/15">
            {topics.map((t) => {
              const on = topic === t;
              return (
                <button key={t} type="button" role="radio" aria-checked={on} onClick={() => setTopic(t)} className={cn("relative min-h-11 rounded-xl px-4 text-sm font-semibold transition sm:text-base", focus, on ? "text-[#1A1206]" : "text-white/85 hover:bg-white/10 hover:text-white")}>
                  {on && <motion.span layoutId="media-topic-pill" className="absolute inset-0 rounded-xl bg-[#CB9615] shadow-[0_10px_24px_-12px_rgba(203,150,21,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{t}</span>
                </button>
              );
            })}
          </div>
        }
      />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div id="player" className="lg:col-span-8">
          <div className="relative rounded-3xl bg-white/[0.04] p-2 ring-1 ring-white/15">
            <span aria-hidden="true" className="absolute inset-x-10 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
            <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-[#021a07] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
              <AnimatePresence mode="wait">
                {playing ? (
                  <motion.iframe
                    key={`play-${v.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`}
                    title={`${v.title} (${v.channel})`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <motion.button
                    key={`poster-${v.id}`} type="button" onClick={() => setPlaying(true)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }}
                    className={cn("group absolute inset-0", focus)} aria-label={`Play: ${v.title}`}
                  >
                    <img src={thumb(v.id, hiOk)} onError={() => setHiOk(false)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#021a07]/60 via-[#021a07]/10 to-transparent" />
                    <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                      {!reduce && <motion.span className="absolute inset-0 rounded-full bg-[#CB9615]/40" animate={{ scale: [1, 1.45], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />}
                      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#CB9615] text-[#1A1206] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7)] transition group-hover:scale-105 group-hover:bg-[#E0AA22]">
                        <Play className="h-8 w-8 translate-x-0.5 fill-current" />
                      </span>
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-[#F4D27A] ring-1 ring-white/15">{v.channel} · {v.month}</p>
              <h3 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">{v.title}</h3>
              <p className="mt-2 max-w-2xl text-base text-white/85 sm:text-lg">{v.blurb}</p>
              <p className="mt-2 text-sm text-white/75">Video by {v.channel}. Published {v.month}.</p>
            </div>
            <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className={cn(outlineDarkBtn, "shrink-0 self-start")}>
              <Youtube className="h-5 w-5" aria-hidden="true" /> Watch on YouTube<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-4">
          <p className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">Playlist</span>
            <span aria-live="polite" className="text-sm text-white/85">{list.length} videos</span>
          </p>
          <Spotlight color="rgba(244,210,122,0.10)" className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10">
            <ul className="max-h-[560px] divide-y divide-white/10 overflow-y-auto [scrollbar-color:rgba(244,210,122,0.5)_transparent] [scrollbar-width:thin]">
              <AnimatePresence initial={false}>
                {list.map((x) => {
                  const on = x.id === current;
                  return (
                    <motion.li key={x.id} layout={!reduce} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                      <button type="button" onClick={() => choose(x.id)} aria-current={on ? "true" : undefined} className={cn("group relative flex w-full items-center gap-3 p-3 text-left transition", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]", on ? "bg-white/[0.08]" : "hover:bg-white/[0.05]")}>
                        <span aria-hidden="true" className={cn("absolute inset-y-2 left-0 w-1 rounded-r-full transition", on ? "bg-[#CB9615]" : "bg-transparent group-hover:bg-white/20")} />
                        <span className="relative ml-1 block aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-[#0A4A13]">
                          <img src={thumb(x.id)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          {on && playing && (
                            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-[#04240A]/60">
                              <span className="flex h-4 items-end gap-0.5">{[0, 1, 2].map((k) => <motion.span key={k} className="w-1 rounded-full bg-[#F4D27A]" animate={reduce ? undefined : { height: ["30%", "100%", "30%"] }} transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.15 }} style={{ height: "60%" }} />)}</span>
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className={cn("line-clamp-2 text-sm font-semibold leading-snug sm:text-base", on ? "text-[#F4D27A]" : "text-white")}>{x.title}</span>
                          <span className="mt-1 block text-xs text-white/75 sm:text-sm">{x.channel} · {x.month}</span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </Spotlight>
          <a href={channelUrl} target="_blank" rel="noopener noreferrer" className={cn("group mt-4 flex items-center justify-between gap-3 rounded-3xl bg-white/[0.06] p-4 font-semibold text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:ring-[#F4D27A]/60", focus)}>
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C4161C] text-white"><Youtube className="h-5 w-5" /></span>
              PenCom’s official YouTube channel
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#F4D27A] transition group-hover:translate-x-0.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </DarkBand>
  );
}

/* ─────────────────────────── Lightbox ─────────────────────────── */

/** Full-screen dialog for the lightbox: Escape closes, arrow keys move, focus goes in and back, the page stays put. */
function FullScreen({ open, onClose, onArrow, labelledBy, describedBy, children }: { open: boolean; onClose: () => void; onArrow: (d: number) => void; labelledBy: string; describedBy: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const keys = useRef({ onClose, onArrow });
  keys.current = { onClose, onArrow };
  useEffect(() => {
    if (!open) {
      const el = opener.current;
      opener.current = null;
      if (el) window.setTimeout(() => el.focus(), 0);
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    if (active && !active.closest("[role=dialog]")) opener.current = active;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => box.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") keys.current.onClose();
      if (e.key === "ArrowRight") keys.current.onArrow(1);
      if (e.key === "ArrowLeft") keys.current.onArrow(-1);
      if (e.key === "Tab" && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>("button, a[href]")].filter((x) => !x.hasAttribute("disabled"));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={box}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[130] isolate flex h-[100dvh] w-screen flex-col bg-[#04240A] text-white"
        >
          <GridBackdrop className="-z-10" />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Lightbox({ id, list, onChange, onClose }: { id: string | null; list: typeof photos; onChange: (id: string) => void; onClose: () => void }) {
  const reduce = useReducedMotion();
  const idx = list.findIndex((p) => p.id === id);
  const ph = idx >= 0 ? list[idx] : null;
  const startX = useRef<number | null>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const go = (d: number) => {
    if (idx < 0) return;
    onChange(list[(idx + d + list.length) % list.length].id);
  };
  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
  }, [id, reduce]);

  return (
    <FullScreen open={!!ph} onClose={onClose} onArrow={go} labelledBy="lightbox-title" describedBy="lightbox-desc">
      {ph && (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#04240A]/90 px-4 py-2.5 sm:px-6">
            <p className="flex items-center gap-3 text-base text-white/85" aria-live="polite">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#CB9615]" />
              <span><span className="font-bold text-[#F4D27A]">{idx + 1}</span> / {list.length}</span>
            </p>
            <button type="button" data-autofocus onClick={onClose} className={cn(outlineDarkBtn, "min-h-11 px-4")}>
              <X className="h-5 w-5" aria-hidden="true" /> Close
            </button>
          </div>
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-8"
            onPointerDown={(e) => { startX.current = e.clientX; }}
            onPointerUp={(e) => { if (startX.current === null) return; const dx = e.clientX - startX.current; startX.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={ph.id} src={photoSrc(ph)} alt={ph.alt}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }} draggable={false}
                className="max-h-full max-w-full select-none rounded-2xl object-contain shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15"
              />
            </AnimatePresence>
          </div>
          <div className="border-t border-white/10 bg-[#04240A]/90 px-4 pb-4 pt-4 sm:px-6">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
              <button type="button" onClick={() => go(-1)} className={outlineDarkBtn} aria-label="Previous photo">
                <ChevronLeft className="h-5 w-5" aria-hidden="true" /> <span aria-hidden="true">Previous</span>
              </button>
              <div className="order-first w-full min-w-0 text-center sm:order-none sm:w-auto sm:flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A]">{albums.find((x) => x.id === ph.album)?.title}</p>
                <h2 id="lightbox-title" className="mx-auto mt-1 line-clamp-3 max-w-3xl text-lg font-bold leading-snug sm:text-xl">{ph.caption}</h2>
              </div>
              <button type="button" onClick={() => go(1)} className={outlineDarkBtn} aria-label="Next photo">
                <span aria-hidden="true">Next</span> <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p id="lightbox-desc" className="sr-only">{ph.alt}. Use the left and right arrow keys to move between photos.</p>
            <p className="mt-2 text-center text-sm text-white/75">Photo: National Pension Commission · PenCom Chronicles, Issue 1</p>
            <ul ref={stripRef} className="mx-auto mt-3 hidden max-w-5xl gap-2 overflow-x-auto px-1 pb-1 pt-1 sm:flex" aria-label="All photos">
              {list.map((p) => (
                <li key={p.id} data-id={p.id} className="shrink-0">
                  <button type="button" onClick={() => onChange(p.id)} aria-current={p.id === ph.id ? "true" : undefined} className={cn("block h-12 w-16 overflow-hidden rounded-lg transition duration-300", focus, p.id === ph.id ? "opacity-100 ring-[3px] ring-[#CB9615]" : "opacity-55 hover:opacity-100")}>
                    <img src={photoSrc(p)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </FullScreen>
  );
}

/* ─────────────────────────── Follow ─────────────────────────── */

function Follow() {
  return (
    <section id="follow" aria-labelledby="follow-title" className={cn("bg-white", sectionCls, "pb-0 sm:pb-0")}>
      <div className="mx-auto max-w-7xl">
        <Headline id="follow-title" kicker="Follow us" title="Get PenCom news where you already are" mark="where you already are" intro="These are the Commission’s only official accounts. Be wary of pages that copy PenCom’s name or logo." />
        <Spotlight className="mt-10 rounded-3xl border border-gray-200/80 bg-white">
          <ul className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
            {social.map((s, i) => (
              <motion.li key={s.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, ease }} className="sm:border-b sm:border-gray-100 lg:border-b-0">
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("group block h-full px-5 py-5 transition hover:bg-[#F7FAF6] lg:py-6", "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]")}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-lg font-bold text-[#0A2E10] group-hover:text-[#117F21]">{s.name}</span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#117F21]" aria-hidden="true" />
                  </span>
                  <span className="mt-0.5 block break-words text-sm text-gray-600">{s.handle}</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </motion.li>
            ))}
          </ul>
        </Spotlight>
        <p className="mt-6 flex items-start gap-3 rounded-2xl bg-[#F4F7F2] p-5 text-base text-gray-600">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
          <span>Journalists: for interviews, photos or footage, contact Corporate Communications at <a href="mailto:info@pencom.gov.ng" className={cn("font-semibold text-[#0A4A13] underline decoration-[#CB9615] decoration-2 underline-offset-4 hover:text-[#117F21]", focus)}>info@pencom.gov.ng</a>.</span>
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function MediaPage() {
  const { hash } = useLocation();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const album = params.get("album") ?? "all";
  const photo = params.get("photo");
  const list = photos.filter((p) => album === "all" || p.album === album);
  const initialVideo = params.get("video");
  const [current, setCurrent] = useState(() => videos.find((v) => v.id === initialVideo)?.id ?? videos[0].id);
  const [playing, setPlaying] = useState(!!initialVideo);

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v && !(k === "album" && v === "all")) next.set(k, v);
    else next.delete(k);
    setParams(next, { preventScrollReset: true, replace: k === "photo" && !!params.get("photo") && !!v });
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

  const playNewest = () => {
    setCurrent(videos[0].id);
    setPlaying(true);
    scrollToId("videos", !reduce);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#0A2E10]">
        <Banner onVideos={() => scrollToId("videos", !reduce)} onPhotos={() => scrollToId("photos", !reduce)} />
        <FloatingBar>
          <Overview onPlay={playNewest} />
        </FloatingBar>
        <div className="h-6" aria-hidden="true" />
        <TabStrip sections={nav} pillId="media-nav-pill" />
        <Photos album={album} setAlbum={(a) => setParam("album", a)} open={(id) => setParam("photo", id)} />
        <Videos current={current} setCurrent={setCurrent} playing={playing} setPlaying={setPlaying} />
        <Follow />
        <ClosingLinks
          items={[
            { to: "/news", icon: Newspaper, title: "Newsroom", body: "Press releases and statements" },
            { to: "/chronicles", icon: Images, title: "PenCom Chronicles", body: "Read the magazine", tone: "gold" },
          ]}
        />
      </div>
      <Lightbox id={photo} list={list.some((p) => p.id === photo) ? list : photos} onChange={(id) => setParam("photo", id)} onClose={() => setParam("photo", null)} />
    </MotionConfig>
  );
}
