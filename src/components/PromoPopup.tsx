"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { go } from "@/views/home/SiteSearch";

/**
 * First-visit promotional popup. Shown once per browser (localStorage), a moment after the page loads.
 * Add ?promo=1 to the URL to show it again for testing.
 * Several banners → swipe/drag, arrows, dots and keyboard arrows. One banner → a plain popup.
 * Banners carry optional start/end dates so expired campaigns drop out on their own.
 */
export type Promo = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href?: string; chat?: boolean; external?: boolean };
  image: string;
  alt: string;
  starts?: string;
  ends?: string;
};

const today = new Date().toISOString().slice(0, 10);

export const promos: Promo[] = [
  {
    id: "pencare-2026",
    eyebrow: "Now open",
    title: "Health cover that continues after you retire",
    text: "Retirees on Programmed Withdrawal can now enrol in Pencare. Find out if you qualify and how to join.",
    cta: { label: "Join Pencare", href: "/services#pencare" },
    image: "/images/site/retiree-health-check-960.webp",
    alt: "A retiree having a health check with a doctor",
  },
  {
    id: "ppp-2026",
    eyebrow: "Personal Pension Plan",
    title: "Self-employed? Start your pension today",
    text: "Save any amount, at your own pace, with a licensed Pension Fund Administrator.",
    cta: { label: "Start saving", href: "/services#ppp" },
    image: "/images/site/market-street-960.webp",
    alt: "Traders at a busy street market",
  },
  {
    id: "remit-deadline",
    eyebrow: "Employers",
    title: "Remit contributions by the 7th of every month",
    text: "Late remittance attracts penalties. Remit online through PCRS and keep your PCC valid.",
    cta: { label: "Remit through PCRS", href: "https://pcrs.pencom.gov.ng", external: true },
    image: "/images/site/signing-document-960.webp",
    alt: "A person signing a document at a desk",
  },
].filter((p: Promo) => (!p.starts || p.starts <= today) && (!p.ends || p.ends >= today));

const KEY = "pencom:promo-seen";

/** The popup is closed (or the page left before it showed): let waiting surprises go ahead. */
function promoDone() {
  if (!document.documentElement.dataset.promo) return;
  delete document.documentElement.dataset.promo;
  window.dispatchEvent(new Event("pencom:promo-done"));
}
const DELAY = 1400;

export default function PromoPopup({ items = promos }: { items?: Promo[] }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const many = items.length > 1;

  // Show once, a moment after the first load.
  useEffect(() => {
    if (!items.length) return;
    let seen = false;
    try {
      const force = /[?&]promo=1/.test(window.location.href);
      seen = !force && localStorage.getItem(KEY) === "1";
    } catch {
      /* storage unavailable: show it */
    }
    if (seen) return;
    // Other first-load surprises (the notices preview) wait until the popup is done.
    document.documentElement.dataset.promo = "pending";
    const id = window.setTimeout(() => {
      lastFocus.current = document.activeElement as HTMLElement | null;
      document.documentElement.dataset.promo = "open";
      setOpen(true);
    }, DELAY);
    return () => {
      window.clearTimeout(id);
      promoDone();
    };
  }, [items.length]);

  const close = useCallback(() => {
    setOpen(false);
    promoDone();
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(() => lastFocus.current?.focus?.(), 0);
  }, []);

  const paginate = useCallback(
    (d: number) => setPage(([i]) => [(i + d + items.length) % items.length, d]),
    [items.length],
  );
  const jump = (i: number) => setPage(([cur]) => [i, i > cur ? 1 : -1]);

  // Keyboard: Escape closes, arrows slide, Tab stays inside the dialog.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t0 = window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (many && e.key === "ArrowRight") paginate(1);
      if (many && e.key === "ArrowLeft") paginate(-1);
      if (e.key === "Tab" && dialogRef.current) {
        const f = [...dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]")].filter((el) => !el.hasAttribute("disabled"));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t0);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, many, close, paginate]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -60) paginate(1);
    else if (swipe > 60) paginate(-1);
  };

  const p = items[index];
  const focus = "focus-visible:outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

  return (
    <AnimatePresence>
      {open && p && (
        <motion.div
          key="promo"
          className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label={t("Close")}
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-[#14261A]/55"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-roledescription={many ? t("carousel") : undefined}
            aria-labelledby="promo-title"
            className="relative max-h-[calc(100svh-1.5rem)] w-full max-w-[880px] overflow-y-auto overflow-x-hidden rounded-[2rem] bg-[#FBF8F1] shadow-[0_40px_90px_-30px_rgba(10,74,19,0.6)] ring-1 ring-black/10"
            initial={{ y: reduce ? 0 : 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : 16, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={close}
              className={cn(
                "absolute right-3 top-3 z-20 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 text-base font-semibold text-[#14261A] shadow-lg ring-1 ring-black/10 transition hover:bg-[#0A4A13] hover:text-white",
                focus,
              )}
            >
              <X className="h-5 w-5" aria-hidden="true" />
              {t("Close")}
            </button>

            <div className="relative min-h-[39rem] sm:min-h-0 sm:h-[31rem]">
              <AnimatePresence initial={false} custom={dir} mode="wait">
                <motion.div
                  key={p.id}
                  custom={dir}
                  className={cn("grid min-h-[39rem] sm:min-h-0 sm:h-[31rem] sm:grid-cols-[1.05fr_1fr]", many && "touch-pan-y")}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {/* Image */}
                  <motion.div
                    className="relative m-3 h-56 overflow-hidden rounded-[1.5rem] sm:m-4 sm:h-auto"
                    custom={dir}
                    variants={{
                      enter: { opacity: 0 },
                      center: { opacity: 1 },
                      exit: { opacity: 0 },
                    }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    drag={many ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={many ? onDragEnd : undefined}
                  >
                    <motion.img
                      src={p.image}
                      alt={t(p.alt)}
                      draggable={false}
                      className="h-full w-full select-none object-cover"
                      initial={{ scale: reduce ? 1 : 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 6, ease: "easeOut" }}
                    />
                  </motion.div>

                  {/* Copy */}
                  <motion.div
                    className="flex flex-col justify-center gap-4 p-6 pt-3 sm:p-9 sm:pl-5"
                    custom={dir}
                    variants={{
                      enter: { opacity: 0, y: reduce ? 0 : 12 },
                      center: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: reduce ? 0 : -8 },
                    }}
                    transition={{ duration: 0.35, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                    drag={many ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={many ? onDragEnd : undefined}
                  >
                    <p className="w-fit">
                      <span className="inline-flex items-center gap-2.5 rounded-full bg-[#E8F5E9] py-1 pl-1 pr-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#0A4A13] ring-1 ring-[#117F21]/15 sm:text-sm">
                        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2E913D] to-[#0A4A13]">
                          <span className="h-2 w-2 rounded-full bg-[#F4D27A]" />
                        </span>
                        {t(p.eyebrow)}
                      </span>
                    </p>
                    {many && (
                      <p className="sr-only" aria-live="polite">
                        {t(p.title)}
                      </p>
                    )}
                    <h2 id="promo-title" className="text-[1.75rem] font-bold leading-[1.15] tracking-tight text-[#14261A] sm:text-[2.1rem]">
                      {t(p.title)}
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-700">{t(p.text)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        data-autofocus
                        onClick={() => {
                          close();
                          go(p.cta, navigate);
                        }}
                        className={cn(
                          "group inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F]",
                          focus,
                        )}
                      >
                        {t(p.cta.label)}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={close}
                        className={cn("inline-flex min-h-14 items-center rounded-2xl border-2 border-[#117F21] px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white", focus)}
                      >
                        {t("Maybe later")}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {many && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-white px-4 py-3 sm:px-9">
                <div className="flex items-center" role="group" aria-label={t("Choose a banner")}>
                  {items.map((it, i) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => jump(i)}
                      aria-label={t("Show banner {n}", { n: i + 1 })}
                      aria-current={i === index ? "true" : undefined}
                      className={cn("grid h-11 min-w-11 place-items-center rounded-full", focus)}
                    >
                      <span
                        className={cn(
                          "block h-2.5 rounded-full transition-all duration-300",
                          i === index ? "w-9 bg-[#117F21]" : "w-3 bg-[#B9C4BC] hover:bg-[#7E9585]",
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-1 hidden text-base text-gray-600 md:inline">{t("Swipe or use the arrows")}</span>
                  <button
                    type="button"
                    onClick={() => paginate(-1)}
                    aria-label={t("Previous banner")}
                    className={cn("inline-flex min-h-11 items-center gap-1 rounded-full pl-2 pr-4 text-base font-semibold text-[#14261A] ring-1 ring-[#117F21]/30 transition hover:bg-[#0A4A13] hover:text-white", focus)}
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    {t("Previous")}
                  </button>
                  <button
                    type="button"
                    onClick={() => paginate(1)}
                    aria-label={t("Next banner")}
                    className={cn("inline-flex min-h-11 items-center gap-1 rounded-full bg-[#0A4A13] pl-4 pr-2 text-base font-semibold text-white transition hover:bg-[#117F21]", focus)}
                  >
                    {t("Next")}
                    <ChevronRight className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
