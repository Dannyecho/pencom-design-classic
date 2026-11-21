"use client";

import { useEffect, useState } from "react";
import { useLocation } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Languages, Scale, X } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { isLegalPath } from "@/i18n/languages";

type Level = "full" | "part" | "none" | "wait";

const level = (c: number | null): Level => (c == null ? "wait" : c >= 0.85 ? "full" : c >= 0.3 ? "part" : "none");

/**
 * Sits under the header. In English it offers the visitor's browser language once; in
 * Hausa, Yoruba or Igbo it says how much of the page is translated, that translations are
 * drafts, and that laws stay in official English. Stays until the reader closes it.
 */
export default function LanguageNotice() {
  const { lang, info, setLang, t, coverage, suggestion, dismissSuggestion } = useI18n();
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const [closed, setClosed] = useState<string[]>([]);
  // Read after mount (server render has no storage).
  useEffect(() => {
    try {
      setClosed(JSON.parse(window.sessionStorage.getItem("pencom:lang-notice") ?? "[]"));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const lv = level(coverage);
  const legal = isLegalPath(pathname);
  // Closing hides the notice for this language and situation; a worse situation shows it again.
  const key = `${lang}:${legal ? "legal" : lv === "full" ? "full" : lv === "wait" ? "full" : "gap"}`;
  const show = lang !== "en" && !closed.includes(key);

  const close = () => {
    const next = [...closed, key];
    setClosed(next);
    try {
      window.sessionStorage.setItem("pencom:lang-notice", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const pct = coverage == null ? null : Math.round(coverage * 100);
  const headline = legal
    ? t("Laws and regulations are kept in their official English version.")
    : lv === "full" ? t("You are reading this page in {lang}.", { lang: info.native })
    : lv === "part" ? t("Parts of this page are still in English.")
    : lv === "none" ? t("This page is not yet available in {lang}, so it is shown in English.", { lang: info.native })
    : t("Translating…");

  const anim = { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: reduce ? 0 : 0.35 } };

  return (
    <div data-i18n-notice data-no-translate>
      <AnimatePresence initial={false}>
        {suggestion && lang === "en" && (
          <motion.div key="offer" {...anim} className="overflow-hidden" role="region" aria-label="Language">
            <div lang={suggestion.code} className="border-b border-black/10 bg-[#E8F5E9]">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-base">
                <Languages className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
                <span className="font-semibold text-[#14261A]">{suggestion.hello}!</span>
                <span className="text-gray-700">{suggestion.offer}</span>
                <button type="button" onClick={() => setLang(suggestion.code)} className="inline-flex min-h-11 items-center rounded-2xl bg-[#0A4A13] px-5 text-base font-bold text-white hover:bg-[#117F21] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]">
                  {suggestion.switchTo}
                </button>
                <button type="button" onClick={dismissSuggestion} lang="en" aria-label="No thanks, stay in English" className="ml-auto flex h-11 w-11 items-center justify-center rounded-full text-gray-700 hover:bg-black/5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {show && (
          <motion.div key={`notice-${lang}`} {...anim} className="overflow-hidden" role="region" aria-label={t("Language notice")}>
            <div className="border-b border-black/10 bg-[#F1EFE8] text-[#14261A]">
              <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 sm:items-center">
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] sm:flex">
                  <Languages className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 text-base">
                  <p className="font-semibold">{headline}</p>
                  <p className="mt-0.5 text-sm text-gray-700">
                    {t("Translations are drafts being checked by PenCom.")}
                    {legal && (
                      <span className="ml-1 inline-flex items-center gap-1 text-[#7A5200]">
                        <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("Menus and help are shown in {lang}.", { lang: info.native })}
                      </span>
                    )}
                  </p>
                </div>
                {pct != null && !legal && (
                  <div className="hidden shrink-0 items-center gap-2 md:flex" aria-hidden="true">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-black/10">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: reduce ? 0 : 0.8 }} />
                    </div>
                    <span className="w-12 text-sm font-bold tabular-nums text-[#0A4A13]">{pct}%</span>
                  </div>
                )}
                <button type="button" onClick={() => setLang("en")} className="inline-flex min-h-11 shrink-0 items-center rounded-2xl border-2 border-[#117F21] px-4 text-base font-semibold text-[#0A4A13] hover:bg-[#117F21] hover:text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]">
                  {t("Read in English")}
                </button>
                <button type="button" onClick={close} aria-label={t("Close language notice")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-black/5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
