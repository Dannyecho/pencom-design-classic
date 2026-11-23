"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, Bell, CheckCheck, CheckCircle2, ChevronDown, Info, RotateCcw, ShieldAlert, X } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { siteNotices, type NoticeType } from "@/lib/alerts";
import { cn } from "@/lib/utils";

const look: Record<NoticeType, { icon: typeof Info; label: string; chip: string; text: string; dot: string; bar: string }> = {
  critical: { icon: ShieldAlert, label: "Critical", chip: "bg-[#FCEBEB] text-[#A32D2D]", text: "text-[#A32D2D]", dot: "bg-[#D32F2F]", bar: "bg-[#D32F2F]" },
  warning: { icon: AlertTriangle, label: "Warning", chip: "bg-[#FAEEDA] text-[#854F0B]", text: "text-[#854F0B]", dot: "bg-[#D97706]", bar: "bg-[#D97706]" },
  info: { icon: Info, label: "Information", chip: "bg-[#E6F1FB] text-[#185FA5]", text: "text-[#185FA5]", dot: "bg-[#1E88E5]", bar: "bg-[#1E88E5]" },
  success: { icon: CheckCircle2, label: "Update", chip: "bg-[#E8F5E9] text-[#117F21]", text: "text-[#117F21]", dot: "bg-[#2E913D]", bar: "bg-[#2E913D]" },
};

const READ = "pencom:notices-read";
const GONE = "pencom:alerts-closed"; // same key the old banner used, so earlier dismissals carry over
const load = (k: string): string[] => {
  try {
    return JSON.parse(window.localStorage.getItem(k) ?? "[]");
  } catch {
    return [];
  }
};
const save = (k: string, v: string[]) => {
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage unavailable: lasts for this visit */
  }
};

/**
 * Header bell with a notices panel (all pages). A badge counts unread notices; a critical
 * unread notice turns the badge red and gives the bell a brief shake when the page loads.
 * Readers can mark everything read, dismiss single notices, and bring dismissed ones back.
 * Classic theme (kept from calm): the panel only opens from the bell (no first-visit preview). The preview mode (top notice
 * plus "Show all") is kept in the code but nothing turns it on.
 */
export default function NoticesBell() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false); // opened by itself: one notice + expand button
  // Saved read/dismissed lists are loaded after the first render, so the server and browser HTML match.
  const [read, setRead] = useState<string[]>([]);
  const [gone, setGone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const shown = siteNotices.filter((n) => !gone.includes(n.id));
  const unread = shown.filter((n) => !read.includes(n.id));
  const urgent = unread.some((n) => n.type === "critical");

  // Saved lists load after mount. Calm theme: the panel never opens by itself (the badge shows the count).
  useEffect(() => {
    setRead(load(READ));
    setGone(load(GONE));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) save(READ, read);
  }, [read, ready]);
  useEffect(() => {
    if (ready) save(GONE, gone);
  }, [gone, ready]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !preview && !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    if (!preview) panel.current?.focus(); // don't pull focus away when it opened by itself
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, preview]);

  const markAll = () => setRead((r) => Array.from(new Set([...r, ...shown.map((n) => n.id)])));
  const markOne = (id: string) => setRead((r) => (r.includes(id) ? r : [...r, id]));
  const dismiss = (id: string) => setGone((g) => [...g, id]);

  const label = unread.length ? t("Notices, {n} unread", { n: unread.length }) : t("Notices");

  return (
    <div ref={wrap} className="relative">
      <motion.button
        ref={btn}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="notices-panel"
        aria-label={label}
        title={label}
        data-i18n-done
        onClick={() => {
          setPreview(false);
          setOpen((o) => !o);
        }}
        animate={urgent && !reduce ? { rotate: [0, -14, 12, -10, 8, -4, 0] } : undefined}
        transition={{ duration: 0.9, delay: 1.2, repeat: 1, repeatDelay: 2.5 }}
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]",
          open ? "bg-[#11421A] text-[#F4D27A]" : "border border-[#14892A]/25 text-[#117F21] hover:border-[#14892A] hover:bg-[#F7FAF6]",
        )}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        <AnimatePresence>
          {unread.length > 0 && (
            <motion.span
              key={unread.length}
              initial={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              aria-hidden="true"
              className={cn(
                "absolute -right-1 -top-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-xs font-bold text-white ring-2 ring-white",
                urgent ? "bg-[#C62828]" : "bg-[#14892A]",
              )}
            >
              {unread.length}
              {urgent && !reduce && <span className="absolute inset-0 animate-ping rounded-full bg-[#D32F2F]/50 [animation-iteration-count:3]" />}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id="notices-panel"
            role="dialog"
            aria-label={t("Notices")}
            tabIndex={-1}
            initial={{ opacity: 0, y: reduce ? 0 : -8, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8, scale: reduce ? 1 : 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 top-[96px] z-[70] origin-top-right overflow-hidden rounded-3xl border border-gray-200/80 bg-white text-[#164D20] shadow-[0_30px_60px_-30px_rgba(16,93,29,0.55)] focus:outline-none sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[28rem]"
          >
            <div className="flex items-center justify-between gap-3 bg-[#11421A] px-5 py-3 text-white">
              <div>
                <p className="flex items-center gap-2 text-lg font-bold text-white">
                  <Bell className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" />
                  {t("Notices")}
                </p>
                <p className="text-sm text-white/75" data-i18n-done>
                  {unread.length ? t("{n} unread", { n: unread.length }) : t("You're up to date")}
                </p>
              </div>
              <div className="flex items-center gap-1">
              {unread.length > 0 && !preview && (
                <button type="button" onClick={markAll} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#F4D27A] hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]">
                  <CheckCheck className="h-4 w-4" aria-hidden="true" />
                  {t("Mark all as read")}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPreview(false);
                  btn.current?.focus();
                }}
                aria-label={t("Close notices")}
                title={t("Close notices")}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/20 px-3 text-sm font-semibold text-white transition hover:border-[#F4D27A] hover:text-[#F4D27A] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                {t("Close")}
              </button>
              </div>
            </div>

            <ul className="max-h-[min(60vh,26rem)] overflow-y-auto">
              <AnimatePresence initial={false}>
                {(preview ? shown.slice(0, 1) : shown).map((n) => {
                  const s = look[n.type];
                  const Icon = s.icon;
                  const isNew = !read.includes(n.id);
                  return (
                    <motion.li
                      key={n.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                      className={cn("relative border-b border-gray-100 last:border-0", isNew && "bg-[#F7FAF6]")}
                    >
                      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", s.bar)} />
                      <div className="flex gap-3 px-5 py-4">
                        <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s.chip)}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 text-xs font-bold uppercase tracking-[0.12em]">
                            <span className={cn("rounded-full px-2 py-0.5", s.chip)}>{t(s.label)}</span>
                            {isNew && (
                              <span className="inline-flex items-center gap-1 text-[#117F21]">
                                <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden="true" />
                                {t("New")}
                              </span>
                            )}
                          </p>
                          <p className="mt-1.5 text-base font-bold leading-snug text-[#164D20]">{t(n.title)}</p>
                          <p className="mt-1 text-[15px] leading-snug text-gray-600">{t(n.message)}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                            {n.link && (
                              <Link
                                to={n.link.to}
                                onClick={() => {
                                  markOne(n.id);
                                  setOpen(false);
                                }}
                                className={cn("group inline-flex min-h-11 items-center gap-1.5 text-base font-semibold hover:underline", s.text)}
                              >
                                {t(n.link.label)}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </Link>
                            )}
                            {isNew && (
                              <button type="button" onClick={() => markOne(n.id)} className="inline-flex min-h-11 items-center text-sm font-semibold text-gray-600 hover:text-[#164D20] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]">
                                {t("Mark as read")}
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => dismiss(n.id)}
                          aria-label={`${t("Dismiss notice")}: ${t(n.title)}`}
                          title={t("Dismiss notice")}
                          data-i18n-done
                          className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-[#F7FAF6] hover:text-[#164D20] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {shown.length === 0 && (
                <li className="px-4 py-10 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5E9] text-[#117F21]">
                    <CheckCheck className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-lg font-semibold text-[#164D20]">{t("No notices right now")}</p>
                </li>
              )}
            </ul>

            {preview && shown.length > 1 && (
              <button
                type="button"
                onClick={() => setPreview(false)}
                aria-expanded="false"
                aria-controls="notices-panel"
                data-i18n-done
                className="group flex w-full items-center justify-center gap-2 min-h-12 border-t border-gray-200 bg-[#F4F7F2] px-4 py-3 text-base font-semibold text-[#105D1D] transition hover:bg-[#E8F5E9] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]"
              >
                {t("Show all {n} notices", { n: shown.length })}
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </button>
            )}

            {!preview && gone.some((id) => siteNotices.some((n) => n.id === id)) && (
              <div className="border-t border-gray-200 bg-[#F4F7F2] px-5 py-1">
                <button type="button" onClick={() => setGone([])} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-[#164D20] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]">
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("Show dismissed notices")}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite" data-i18n-done>
        {unread.length ? t("Notices, {n} unread", { n: unread.length }) : ""}
      </span>
    </div>
  );
}
