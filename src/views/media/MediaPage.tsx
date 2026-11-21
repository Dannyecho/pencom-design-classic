"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Camera, Check, ChevronLeft, ChevronRight, Clapperboard, Expand, Images, Mail, Pause, Play, Youtube, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/views/about/primitives";
import { ArrowChip } from "@/views/docs/kit";
import { SectionHeading } from "@/views/theme/heading";
import { DarkBackdrop, FramedPanel, PageHero, Rise, SectionNav, ease, focus, sectionCls } from "@/views/theme/ui";
import { social } from "@/views/connect/data";
import { albums, channelUrl, photoSrc, photos, thumb, topics, videos, type Topic } from "./data";

/**
 * Photos and videos (questionnaire "Anything else": news and media centre with photographs and videos;
 * brief §7 "News and events": gallery with alt text). Deep links: /media?album=people, /media?photo=<id>, /media?video=<id>.
 */

const ring = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]";
/** The calm card hover: lift 4 px, green ring, soft green shadow. */
const lift = "transition duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-[#117F21] hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)]";
const nav = [
  { id: "videos", label: "Videos" },
  { id: "photos", label: "Photos" },
  { id: "follow", label: "Follow us" },
];

/* ─────────────────────────── Hero: moving photo wall ─────────────────────────── */

function PhotoColumn({ items, dir, paused, speed }: { items: typeof photos; dir: 1 | -1; paused: boolean; speed: number }) {
  const reduce = useReducedMotion();
  const loop = [...items, ...items];
  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        className="flex flex-col gap-3"
        animate={reduce || paused ? undefined : { y: dir === 1 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((ph, i) => (
          <img key={`${ph.id}-${i}`} src={photoSrc(ph)} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        ))}
      </motion.div>
    </div>
  );
}

function Hero({ onVideos, onPhotos }: { onVideos: () => void; onPhotos: () => void }) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const cols = [photos.filter((_, i) => i % 3 === 0), photos.filter((_, i) => i % 3 === 1), photos.filter((_, i) => i % 3 === 2)];
  return (
    <PageHero
      id="media-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Connect", to: "/connect" }, { label: "Photos and videos" }]}
      pill={{ icon: Camera, label: "Media centre" }}
      title="PenCom in pictures and video"
      mark="pictures and video"
      intro="Events, campaigns and visits from across the country, and the Commission’s work as reported on national television."
      actions={
        <div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onVideos} className={cn("inline-flex min-h-14 items-center gap-2.5 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] shadow-[0_14px_30px_-16px_rgba(154,107,0,0.8)] transition hover:bg-[#FFE08F]", focus)}>
              <Play className="h-5 w-5 fill-current" aria-hidden="true" /> Watch videos
            </button>
            <button type="button" onClick={onPhotos} className={cn("inline-flex min-h-14 items-center gap-2.5 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white", focus)}>
              <Images className="h-5 w-5" aria-hidden="true" /> Browse photos
            </button>
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {([[photos.length, "Photos", Camera], [albums.length, "Albums", Images], [videos.length, "Videos", Clapperboard]] as const).map(([v, l, Icon]) => (
              <div key={l} className="flex flex-col rounded-3xl bg-white p-4 ring-1 ring-black/10">
                <dt className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <Icon className="h-4 w-4 shrink-0 text-[#117F21]" aria-hidden="true" /> {l}
                </dt>
                <dd className="mt-1 text-3xl font-bold text-[#14261A]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      }
      aside={
        <FramedPanel className="p-3">
          <div className="relative h-[300px] sm:h-[420px] lg:h-[480px]" aria-hidden="true">
            <div className="absolute inset-0 grid grid-cols-3 gap-3 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
              <PhotoColumn items={cols[0]} dir={1} paused={paused} speed={90} />
              <PhotoColumn items={cols[1]} dir={-1} paused={paused} speed={105} />
              <PhotoColumn items={cols[2]} dir={1} paused={paused} speed={80} />
            </div>
          </div>
          {!reduce && (
            <div className="mt-3 flex justify-end">
              <button type="button" onClick={() => setPaused((p) => !p)} className={cn("inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 text-base font-semibold text-[#0A4A13] ring-1 ring-[#117F21]/40 transition hover:bg-[#0A4A13] hover:text-white", focus)}>
                {paused ? <Play className="h-4 w-4 fill-current" aria-hidden="true" /> : <Pause className="h-4 w-4 fill-current" aria-hidden="true" />}
                {paused ? "Play photo wall" : "Pause photo wall"}
              </button>
            </div>
          )}
        </FramedPanel>
      }
    />
  );
}

/* ─────────────────────────── Videos ─────────────────────────── */

function Videos({ initial }: { initial: string | null }) {
  const reduce = useReducedMotion();
  const [topic, setTopic] = useState<Topic>("All");
  const [current, setCurrent] = useState(() => videos.find((v) => v.id === initial)?.id ?? videos[0].id);
  const [playing, setPlaying] = useState(!!initial);
  const [hiOk, setHiOk] = useState(true);
  const list = useMemo(() => videos.filter((v) => topic === "All" || v.topic === topic), [topic]);
  const v = videos.find((x) => x.id === current)!;

  const choose = (id: string) => {
    setCurrent(id);
    setHiOk(true);
    setPlaying(true);
    if (window.innerWidth < 1024) document.getElementById("player")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <section id="videos" aria-labelledby="vid-title" className={cn("bg-[#FBF8F1]", sectionCls)}>
      {/* The page's one green inset panel */}
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-4 py-8 text-white sm:p-10 lg:p-14">
        <DarkBackdrop />
        <SectionHeading
          id="vid-title"
          dark
          eyebrow="Videos"
          title="PenCom on TV"
          highlight="on TV"
          intro="How national broadcasters have covered the Commission’s work. Videos play from YouTube."
          stacked
          action={
            <div role="radiogroup" aria-label="Filter videos by topic" className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={topic === t} onClick={() => setTopic(t)} className={cn("min-h-12 rounded-2xl px-5 text-base font-semibold transition sm:text-lg", ring, topic === t ? "bg-[#F4D27A] text-[#1A1206]" : "bg-white/[0.07] text-white ring-1 ring-white/20 hover:bg-white hover:text-[#0A4A13]")}>
                  {t}
                </button>
              ))}
            </div>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div id="player" className="lg:col-span-8">
            <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-[#06300C] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] ring-4 ring-white/10">
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
                    className={cn("group absolute inset-0", ring)} aria-label={`Play: ${v.title}`}
                  >
                    <img src={thumb(v.id, hiOk)} onError={() => setHiOk(false)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    <span aria-hidden="true" className="absolute inset-0 bg-black/15 transition group-hover:bg-black/5" />
                    <span aria-hidden="true" className="absolute left-1/2 top-1/2 inline-flex min-h-14 -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 whitespace-nowrap rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)] transition group-hover:bg-[#FFE08F]">
                      <Play className="h-5 w-5 fill-current" /> Play video
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-base font-semibold text-[#F4D27A]">{v.channel} · {v.month}</p>
                <h3 className="mt-1 text-xl font-bold leading-snug sm:text-2xl">{v.title}</h3>
                <p className="mt-2 max-w-2xl text-lg text-white/85">{v.blurb}</p>
                <p className="mt-2 text-base text-white/75">Video by {v.channel}. Published {v.month}.</p>
              </div>
              <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-14 shrink-0 items-center gap-2.5 self-start rounded-2xl bg-white px-5 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#F4D27A] hover:text-[#1A1206]", ring)}>
                <Youtube className="h-5 w-5" aria-hidden="true" /> Watch on YouTube<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <p className="mb-3 flex items-center justify-between gap-3">
              <span className="text-base font-bold uppercase tracking-[0.16em] text-[#F4D27A]">Playlist</span>
              <span aria-live="polite" className="text-base text-white/85">{list.length} videos</span>
            </p>
            <ul className="-m-1 max-h-[600px] space-y-2.5 overflow-y-auto p-1 [scrollbar-color:rgba(244,210,122,0.5)_transparent] [scrollbar-width:thin]">
              <AnimatePresence initial={false}>
                {list.map((x) => {
                  const on = x.id === current;
                  return (
                    <motion.li key={x.id} layout={!reduce} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                      <button type="button" onClick={() => choose(x.id)} aria-current={on ? "true" : undefined} className={cn("group flex w-full items-center gap-3 rounded-2xl bg-white p-2.5 text-left text-[#14261A] transition duration-300", ring, on ? "ring-[3px] ring-[#F4D27A]" : "hover:-translate-y-0.5 hover:bg-[#E8F5E9]")}>
                        <span className="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-[#F1EFE8] sm:w-32">
                          <img src={thumb(x.id)} alt="" loading="lazy" className="h-full w-full object-cover" />
                          {on && playing && (
                            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-[#0A4A13]/60">
                              <span className="flex h-4 items-end gap-0.5">{[0, 1, 2].map((k) => <motion.span key={k} className="w-1 rounded-full bg-[#F4D27A]" animate={reduce ? undefined : { height: ["30%", "100%", "30%"] }} transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.15 }} style={{ height: "60%" }} />)}</span>
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-base font-semibold leading-snug">{x.title}</span>
                          <span className="mt-1 block text-sm text-gray-700">{x.channel} · {x.month}</span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
            <a href={channelUrl} target="_blank" rel="noopener noreferrer" className={cn("group mt-4 flex items-center justify-between gap-3 rounded-3xl bg-white p-4 text-lg font-semibold text-[#14261A] transition duration-300 hover:-translate-y-1", ring)}>
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C4161C] text-white"><Youtube className="h-6 w-6" /></span>
                PenCom’s official YouTube channel
              </span>
              <ArrowChip />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Photos ─────────────────────────── */

function Photos({ album, setAlbum, open }: { album: string; setAlbum: (a: string) => void; open: (id: string) => void }) {
  const reduce = useReducedMotion();
  const shown = photos.filter((p) => album === "all" || p.album === album);
  const a = albums.find((x) => x.id === album);
  const cards = [{ id: "all", title: "All photos", blurb: "Every album", cover: photos[12], n: photos.length }, ...albums.map((al) => ({ ...al, cover: photos.find((p) => p.album === al.id)!, n: photos.filter((p) => p.album === al.id).length }))];
  return (
    <section id="photos" aria-labelledby="ph-title" className={cn("bg-white", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="ph-title"
          eyebrow="Photo gallery"
          title="Moments from the Commission"
          highlight="the Commission"
          intro="Photos from PenCom Chronicles, Issue 1. Select a photo to see it full screen."
          action={
            <Link to="/chronicles" className={cn("group inline-flex min-h-14 items-center gap-3 rounded-2xl border-2 border-[#117F21] bg-white px-5 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white", ring)}>
              From PenCom Chronicles <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          }
        />

        {/* Albums */}
        <ul className="-mx-1 mt-10 flex snap-x gap-4 overflow-x-auto px-1 pb-4 pt-2" aria-label="Albums">
          {cards.map((c) => {
            const on = album === c.id;
            return (
              <li key={c.id} className="snap-start">
                <button type="button" onClick={() => setAlbum(c.id)} aria-pressed={on} className={cn("group block w-56 overflow-hidden rounded-3xl bg-white p-2 text-left transition duration-300 hover:-translate-y-1", ring, on ? "shadow-[0_24px_50px_-28px_rgba(154,107,0,0.7)] ring-[3px] ring-[#CB9615]" : "ring-1 ring-black/10 hover:ring-2 hover:ring-[#117F21] hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)]")}>
                  <span className="relative block h-28 overflow-hidden rounded-2xl bg-[#F1EFE8]">
                    <img src={photoSrc(c.cover)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    {on && (
                      <span aria-hidden="true" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F4D27A] text-[#1A1206] shadow">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </span>
                  <span className="block px-2 pb-1.5 pt-3">
                    <span className="block text-lg font-bold leading-tight text-[#14261A]">{c.title}</span>
                    <span className="mt-0.5 block text-base text-gray-700">{c.n} photos</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <AnimatePresence mode="wait">
          <motion.p key={album} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 rounded-2xl bg-[#F1EFE8] px-4 py-3 text-lg text-gray-700" aria-live="polite">
            {a ? <><strong className="text-[#14261A]">{a.title}.</strong> {a.blurb} </> : <strong className="text-[#14261A]">All albums. </strong>}{shown.length} photos.
          </motion.p>
        </AnimatePresence>

        {/* Masonry: photo on top, caption below (text never sits over a photo) */}
        <AnimatePresence mode="wait">
          <motion.ul key={album} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {shown.map((ph, i) => (
              <motion.li key={ph.id} initial={{ opacity: 0, y: reduce ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease }} className="mb-5 break-inside-avoid">
                <button type="button" onClick={() => open(ph.id)} className={cn("group relative block w-full overflow-hidden rounded-3xl bg-white p-2 text-left ring-1 ring-black/10", lift, ring)}>
                  <span className="relative block overflow-hidden rounded-2xl bg-[#F1EFE8]">
                    <img src={photoSrc(ph)} alt={ph.alt} loading="lazy" className={cn("w-full object-cover transition duration-700 group-hover:scale-[1.04]", ph.tall ? "aspect-[4/5]" : i % 5 === 0 ? "aspect-[4/3]" : "aspect-[3/2]")} />
                  </span>
                  <span className="flex items-start justify-between gap-3 px-2 pb-2 pt-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-bold uppercase tracking-[0.14em] text-[#7A5200]">{albums.find((x) => x.id === ph.album)?.title}</span>
                      <span className="mt-1 block text-base font-semibold leading-snug text-[#14261A]">{ph.caption}</span>
                    </span>
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#0A4A13] transition duration-300 group-hover:bg-[#0A4A13] group-hover:text-[#F4D27A]"><Expand className="h-4 w-4" /></span>
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
          className="fixed inset-0 z-[130] flex h-[100dvh] w-screen flex-col bg-[#FBF8F1] text-[#14261A]"
        >
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
  const stepBtn = cn("inline-flex min-h-14 items-center gap-2 rounded-2xl bg-white px-4 text-lg font-semibold text-[#0A4A13] ring-1 ring-[#117F21]/40 transition hover:bg-[#0A4A13] hover:text-white sm:px-6", ring);

  return (
    <FullScreen open={!!ph} onClose={onClose} onArrow={go} labelledBy="lightbox-title" describedBy="lightbox-desc">
        {ph && (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-white px-4 py-3 sm:px-6">
              <p className="text-lg text-gray-700" aria-live="polite"><span className="font-bold text-[#14261A]">{idx + 1}</span> / {list.length}</p>
              <button type="button" data-autofocus onClick={onClose} className={cn("inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 text-lg font-semibold text-[#14261A] ring-1 ring-black/10 transition hover:bg-[#0A4A13] hover:text-white", ring)}>
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
                  initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease }} draggable={false}
                  className="max-h-full max-w-full select-none rounded-2xl bg-white object-contain p-2 shadow-[0_40px_80px_-40px_rgba(10,74,19,0.55)] ring-1 ring-black/10"
                />
              </AnimatePresence>
            </div>
            <div className="border-t border-black/5 bg-white px-4 pb-4 pt-4 sm:px-6">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
                <button type="button" onClick={() => go(-1)} className={stepBtn} aria-label="Previous photo">
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" /> <span aria-hidden="true">Previous</span>
                </button>
                <div className="order-first w-full min-w-0 text-center sm:order-none sm:w-auto sm:flex-1">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7A5200]">{albums.find((x) => x.id === ph.album)?.title}</p>
                  <h2 id="lightbox-title" className="mx-auto mt-1 line-clamp-3 max-w-3xl text-lg font-bold leading-snug text-[#14261A] sm:text-xl">{ph.caption}</h2>
                </div>
                <button type="button" onClick={() => go(1)} className={stepBtn} aria-label="Next photo">
                  <span aria-hidden="true">Next</span> <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <p id="lightbox-desc" className="sr-only">{ph.alt}. Use the left and right arrow keys to move between photos.</p>
              <p className="mt-2 text-center text-base text-gray-700">Photo: National Pension Commission · PenCom Chronicles, Issue 1</p>
              <ul ref={stripRef} className="mx-auto mt-3 hidden max-w-5xl gap-2 overflow-x-auto px-1 pb-1 pt-1 sm:flex" aria-label="All photos">
                {list.map((p) => (
                  <li key={p.id} data-id={p.id} className="shrink-0">
                    <button type="button" onClick={() => onChange(p.id)} aria-current={p.id === ph.id ? "true" : undefined} className={cn("block h-12 w-16 overflow-hidden rounded-lg transition duration-300", ring, p.id === ph.id ? "opacity-100 ring-[3px] ring-[#CB9615]" : "opacity-60 hover:opacity-100")}>
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
    <section id="follow" aria-labelledby="follow-title" className={cn("bg-[#FBF8F1]", sectionCls)}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="follow-title" eyebrow="Follow us" title="Get PenCom news where you already are" highlight="where you already are" intro="These are the Commission’s only official accounts. Be wary of pages that copy PenCom’s name or logo." />
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {social.map((s, i) => (
            <motion.li key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, ease }}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-black/10", lift, ring)}>
                <span aria-hidden="true" className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />
                <span className="relative flex items-start justify-between gap-3">
                  <span className="text-xl font-bold tracking-tight text-[#14261A]">{s.name}</span>
                  <ArrowChip />
                </span>
                <span className="relative mt-8 block break-words text-lg text-gray-700">{s.handle}</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </motion.li>
          ))}
        </ul>
        <Rise className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { to: "/news", title: "Newsroom", sub: "Press releases and statements", Icon: Clapperboard },
            { to: "/chronicles", title: "PenCom Chronicles", sub: "Read the magazine", Icon: Images },
          ].map(({ to, title, sub, Icon }) => (
            <Link key={to} to={to} className={cn("group relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-black/10 sm:p-7", lift, ring)}>
              <span className="flex items-center gap-4">
                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:-rotate-6"><Icon className="h-6 w-6" /></span>
                <span><span className="block text-xl font-bold tracking-tight text-[#14261A]">{title}</span><span className="block text-lg text-gray-700">{sub}</span></span>
              </span>
              <ArrowChip />
            </Link>
          ))}
        </Rise>
        <p className="mt-8 flex items-start gap-3 rounded-2xl bg-[#F1EFE8] p-5 text-lg text-gray-700">
          <Mail className="mt-1 h-5 w-5 shrink-0 text-[#7A5200]" aria-hidden="true" />
          <span>Journalists: for interviews, photos or footage, contact Corporate Communications at <a href="mailto:info@pencom.gov.ng" className={cn("font-semibold text-[#0A4A13] underline decoration-[#CB9615] decoration-2 underline-offset-4 hover:text-[#117F21]", ring)}>info@pencom.gov.ng</a>.</span>
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

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v && !(k === "album" && v === "all")) next.set(k, v);
    else next.delete(k);
    setParams(next, { preventScrollReset: true, replace: k === "photo" && !!params.get("photo") && !!v });
  };

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const t = window.setTimeout(() => scrollToId(id, !reduce), 80);
    return () => window.clearTimeout(t);
  }, [hash, reduce]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#FBF8F1] text-[#14261A]">
      <Hero onVideos={() => scrollToId("videos", !reduce)} onPhotos={() => scrollToId("photos", !reduce)} />
      <SectionNav sections={nav} pillId="media-nav-pill" />
      <Videos initial={params.get("video")} />
      <Photos album={album} setAlbum={(a) => setParam("album", a)} open={(id) => setParam("photo", id)} />
      <Follow />
      </div>
      <Lightbox id={photo} list={list.some((p) => p.id === photo) ? list : photos} onChange={(id) => setParam("photo", id)} onClose={() => setParam("photo", null)} />
    </MotionConfig>
  );
}
