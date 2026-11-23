"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Megaphone, Pause, Play, Search, Sparkles } from "lucide-react";
import ReportGovBadge from "@/components/ReportGovBadge";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { ease } from "@/views/about/primitives";
import { popularTasks, slides } from "@/views/home/data";
import SiteSearch, { go } from "@/views/home/SiteSearch";

const SLIDE_MS = 8000;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-bleed hero slider, built to carry the Commission's adverts and campaigns (brief §7.1):
 * photos stay clearly visible, live HTML text, prev/next + pause + "Slide x of y", thumbnails,
 * ≥7 s per slide, holds on hover/focus, never auto-advances under reduced motion, swipe on touch.
 * Slides carry start/end dates in data.ts, so an expired advert never stays live.
 * Site notices live in the header bell (NoticesBell); search sits in its own band below the slider.
 */
export default function HomeHero() {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const [announce, setAnnounce] = useState("");
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) setPlaying(false);
  }, [reduce]);

  // Warm the cache so the next photo appears without a blank frame.
  useEffect(() => {
    const next = slides[(index + 1) % slides.length];
    if (!next) return;
    const img = new Image();
    img.srcset = next.srcSet;
    img.sizes = "100vw";
    img.src = next.image;
  }, [index]);

  const goTo = (i: number, user = true) => {
    const n = (i + slides.length) % slides.length;
    setIndex(n);
    if (user) setAnnounce(t("Slide {n} of {total}: {title}", { n: n + 1, total: slides.length, title: t(slides[n].title) }));
  };

  const running = playing && !hold && !reduce;
  const slide = slides[index];
  if (!slide) return null;
  const done = lang !== "en" ? "" : undefined;

  const ctrl =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md transition hover:bg-white/25 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]";

  return (
    <>
      <section aria-label="Featured" className="relative isolate overflow-hidden bg-[#11421A] text-white">
        <h1 className="sr-only">National Pension Commission</h1>

        {/* ── Photos: full strength, only shaded where text sits ── */}
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            variants={{
              enter: { opacity: 0, scale: reduce ? 1 : 1.04 },
              center: { opacity: 1, scale: 1 },
              exit: { opacity: 0 },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0 : 1.1, ease }}
            className="absolute inset-0 -z-20"
          >
            <motion.img
              src={slide.image}
              srcSet={slide.srcSet}
              sizes="100vw"
              alt={t(slide.alt)}
              initial={{ scale: 1 }}
              animate={{ scale: running ? 1.06 : 1 }}
              transition={{ duration: running ? SLIDE_MS / 1000 + 1 : 0.8, ease: "linear" }}
              className="h-full w-full object-cover"
              style={{ objectPosition: slide.position }}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          </motion.div>
        </AnimatePresence>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0D3416]/95 via-[#0D3416]/75 to-[#0D3416]/10 lg:hidden" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#0D3416]/90 from-0% via-[#0D3416]/80 via-55% to-transparent lg:block lg:w-[80%]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 hidden h-48 bg-gradient-to-t from-black/50 to-transparent lg:block" />

        <div
          className="relative mx-auto flex min-h-[640px] max-w-7xl flex-col justify-end px-4 pb-24 pt-16 sm:min-h-[660px] lg:min-h-[max(620px,min(calc(88svh-92px),760px))] lg:pb-28"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured announcements"
          onPointerEnter={() => setHold(true)}
          onPointerLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHold(false)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1));
            touchX.current = null;
          }}
        >
          <div className="relative max-w-2xl">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${slides.length}`}
                variants={{
                  enter: { opacity: 0, y: reduce ? 0 : 24 },
                  center: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: reduce ? 0 : -16, transition: { duration: 0.3, ease } },
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease }}
                className="w-full"
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] shadow-lg backdrop-blur-md",
                    slide.kind === "campaign" ? "bg-[#CB9615] text-[#1A1206]" : "border border-white/25 bg-black/30 text-[#F4D27A]",
                  )}
                >
                  {slide.kind === "campaign" ? <Megaphone className="h-3.5 w-3.5" aria-hidden="true" /> : <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
                  {slide.eyebrow}
                </span>
                <h2 data-i18n-done={done} className="mt-5 text-[2.4rem] font-bold leading-[1.05] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-[4.1rem]">
                  {t(slide.title).split(" ").map((w, i) => (
                    <span key={i}>
                      <span className="inline-block overflow-hidden pb-1 align-bottom">
                        <motion.span className="inline-block" initial={{ y: reduce ? 0 : "105%" }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.06 + i * 0.05, ease }}>
                          {w}
                        </motion.span>
                      </span>{" "}
                    </span>
                  ))}
                </h2>
                <motion.p
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease }}
                  className="mt-4 max-w-xl text-base leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] sm:text-lg"
                >
                  {slide.summary}
                </motion.p>
                <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.42, ease }} className="mt-7">
                  <button
                    type="button"
                    onClick={() => go(slide.cta, navigate)}
                    className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#CB9615] px-6 py-3 font-semibold text-[#1A1206] shadow-[0_14px_34px_-10px_rgba(203,150,21,0.9)] transition hover:bg-[#E0AA22] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]"
                  >
                    {slide.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Controls + thumbnails ── */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous slide" className={ctrl}>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => goTo(index + 1)} aria-label="Next slide" className={ctrl}>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause slides" : "Play slides"} className={ctrl}>
                {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              </button>
              <p className="ml-2 font-mono text-sm text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                <span className="sr-only">Slide </span>
                <span className="text-lg font-bold text-white">{pad(index + 1)}</span>
                <span className="sr-only"> of </span>
                <span aria-hidden="true"> / </span>
                {pad(slides.length)}
              </p>
            </div>

            <ul className="flex items-end gap-2" aria-label="Slides">
              {slides.map((s, i) => {
                const on = i === index;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={on ? "true" : undefined}
                      aria-label={t("Go to slide {n}: {title}", { n: i + 1, title: t(s.title) })}
                      className={cn(
                        "group relative block overflow-hidden rounded-xl ring-2 transition-all duration-500 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]",
                        on ? "h-14 w-20 ring-[#F4D27A] sm:h-16 sm:w-28" : "h-11 w-12 opacity-75 ring-white/30 hover:opacity-100 sm:h-12 sm:w-20",
                      )}
                    >
                      <img src={s.thumb} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" style={{ objectPosition: s.position }} loading="lazy" />
                      {s.kind === "campaign" && <span aria-hidden="true" className="absolute left-1 top-1 h-2 w-2 rounded-full bg-[#CB9615] ring-2 ring-black/30" />}
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
                        {on && (
                          <motion.span
                            key={`${index}-${running}`}
                            className="absolute inset-y-0 left-0 bg-[#F4D27A]"
                            initial={{ width: running ? "0%" : "100%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: running ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                            onAnimationComplete={() => running && goTo(index + 1, false)}
                          />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
        </div>
      </section>

      <QuickFind />
    </>
  );
}

/** Search and popular tasks: lifted off the slider into a floating band, still above the fold. */
function QuickFind() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="find-title" className="relative z-20 -mt-14 px-4">
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
        className="relative mx-auto max-w-6xl rounded-3xl bg-white p-5 shadow-[0_40px_80px_-40px_rgba(17,66,26,0.55)] ring-1 ring-black/10 sm:p-7"
      >
        <span aria-hidden="true" className="absolute inset-x-10 -top-px h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#117F21]">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              {"Search PenCom"}
            </p>
            <h2 id="find-title" className="mt-1.5 text-xl font-bold text-[#164D20] sm:text-2xl">
              What do you need to do today?
            </h2>
            <p className="mt-1 text-sm text-gray-600">Search tasks, services, regulations and answers.</p>
          </div>
          <div className="lg:col-span-8">
            <SiteSearch />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">Popular</span>
              {popularTasks.map((tk) => (
                <Link
                  key={tk.label}
                  to={tk.href}
                  className="inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-[#F7FAF6] px-4 text-sm font-medium text-[#164D20] transition hover:border-[#14892A] hover:bg-[#E8F5E9] hover:text-[#117F21] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
                >
                  {tk.label}
                </Link>
              ))}
              <span className="ml-auto">
                <ReportGovBadge />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
