"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Megaphone, Pause, Play } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { slides } from "@/views/home/data";
import { go } from "@/views/home/SiteSearch";

const SLIDE_MS = 9000;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Showcase slider for older readers (brief §7.1, DES-41):
 * - words never sit on top of the photo: text has its own calm panel, so it is always readable;
 * - large, labelled controls ("Previous", "Next", "Pause") and numbered slide buttons, not tiny dots;
 * - a gentle 9-second pace that holds while the reader hovers or focuses;
 * - under reduced motion it never moves on by itself (text size and other aids: accessibility button).
 * Slides carry start/end dates in home/data.ts, so the Commission's adverts expire on time.
 */
export default function Showcase() {
  const { t } = useI18n();
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

  // Preload the next photo so changes are seamless.
  useEffect(() => {
    const next = slides[(index + 1) % slides.length];
    if (!next) return;
    const img = new Image();
    img.srcset = next.srcSet;
    img.sizes = "(min-width: 1024px) 60vw, 100vw";
    img.src = next.image;
  }, [index]);

  const goTo = (i: number, user = true) => {
    const n = (i + slides.length) % slides.length;
    setIndex(n);
    if (user) setAnnounce(t("Slide {n} of {total}: {title}", { n: n + 1, total: slides.length, title: t(slides[n].title) }));
  };

  const slide = slides[index];
  if (!slide) return null;
  const running = playing && !hold && !reduce;

  const bigBtn =
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 px-3 text-[0.95rem] font-semibold transition sm:min-h-14 sm:gap-2 sm:rounded-2xl sm:px-5 sm:text-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

  return (
    <section aria-label="Featured" className="px-4 pb-6 pt-2 sm:pt-4">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_90px_-50px_rgba(10,46,16,0.55)] ring-1 ring-black/10"
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
          if (Math.abs(dx) > 60) goTo(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        <div className="grid grid-cols-1 lg:h-[600px] lg:grid-cols-12">
          {/* ── Photo ── */}
          <div className="relative order-1 h-[300px] overflow-hidden sm:h-[380px] lg:order-2 lg:col-span-7 lg:h-full">
            <AnimatePresence initial={false}>
              <motion.img
                key={slide.id}
                src={slide.image}
                srcSet={slide.srcSet}
                sizes="(min-width: 1024px) 60vw, 100vw"
                alt={t(slide.alt)}
                initial={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
                animate={{ opacity: 1, scale: running ? 1.04 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: reduce ? 0 : 1.2, ease }, scale: { duration: running ? SLIDE_MS / 1000 + 1.2 : 1.2, ease: "easeOut" } }}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: slide.position }}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            </AnimatePresence>
            {/* Soft curve where the photo meets the text panel (desktop) */}
            <svg aria-hidden="true" viewBox="0 0 80 600" preserveAspectRatio="none" className="absolute inset-y-0 -left-px hidden h-full w-20 text-[#0A4A13] lg:block">
              <path d="M0 0 H50 C 10 150, 10 450, 50 600 H0 Z" fill="currentColor" />
            </svg>
            {slide.kind === "campaign" && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-[#7A5200] shadow-lg">
                <Megaphone className="h-4 w-4" aria-hidden="true" />
                {t("Campaign")}
              </span>
            )}
          </div>

          {/* ── Words: always on a solid panel ── */}
          <div className="relative order-2 min-h-[35rem] overflow-hidden bg-[#0A4A13] px-6 py-8 text-white sm:min-h-[26rem] sm:px-10 sm:py-10 lg:order-1 lg:min-h-0 lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:py-14 lg:pl-12 lg:pr-4">
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#CB9615]/25 blur-3xl" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${slides.length}`}
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -10, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, ease }}
                className="relative"
              >
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-[#F4D27A] ring-1 ring-white/15">
                  {slide.eyebrow}
                </p>
                <h2 className="mt-5 text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.6rem] lg:text-[2.9rem]">{slide.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-white/90 sm:text-xl">{slide.summary}</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => go(slide.cta, navigate)}
                    className="group inline-flex min-h-14 items-center gap-3 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] shadow-[0_16px_34px_-14px_rgba(244,210,122,0.9)] transition hover:bg-[#FFE08F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {slide.cta.label}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Controls: labelled; compact on phones, large from tablet up ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-white px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
          <button type="button" onClick={() => goTo(index - 1)} className={cn(bigBtn, "border-gray-200 text-[#14261A] hover:border-[#117F21] hover:text-[#117F21]")}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            <span>{t("Previous")}</span>
          </button>

          <ol className="order-last flex w-full items-center justify-center gap-1.5 sm:order-none sm:w-auto sm:gap-2" aria-label="Slides">
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
                      "relative flex h-11 min-w-11 items-center justify-center overflow-hidden rounded-lg px-2.5 text-base font-bold transition sm:h-12 sm:min-w-12 sm:rounded-xl sm:px-3 sm:text-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]",
                      on ? "bg-[#0A4A13] text-white" : "bg-[#F1EFE8] text-[#14261A] hover:bg-[#E8F5E9]",
                    )}
                  >
                    {i + 1}
                    {on && (
                      <motion.span
                        key={`${index}-${running}`}
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-1 origin-left bg-[#F4D27A] sm:h-1.5"
                        initial={{ scaleX: running ? 0 : 1 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: running ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                        onAnimationComplete={() => running && goTo(index + 1, false)}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className={cn(bigBtn, "border-gray-200 text-[#14261A] hover:border-[#117F21] hover:text-[#117F21]")}
            >
              {playing ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />}
              <span>{playing ? t("Pause") : t("Play")}</span>
            </button>
            <button type="button" onClick={() => goTo(index + 1)} className={cn(bigBtn, "border-[#117F21] bg-[#117F21] text-white hover:bg-[#0A4A13]")}>
              <span>{t("Next")}</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>
    </section>
  );
}
