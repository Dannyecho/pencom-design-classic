"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Globe, Scale } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { LANGS, type Lang } from "@/i18n/languages";
import { cn } from "@/lib/utils";

/**
 * Language picker for the utility bar (DES-39). Menu-button pattern: arrow keys, Home/End,
 * Esc closes and returns focus. Each language is named in itself, with a greeting.
 */
export default function LanguageSwitcher() {
  const { lang, info, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    menu.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onMenuKey = (e: KeyboardEvent) => {
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    const to: Record<string, number> = { ArrowDown: (i + 1) % items.length, ArrowUp: (i - 1 + items.length) % items.length, Home: 0, End: items.length - 1 };
    if (e.key === "Tab") return setOpen(false);
    if (!(e.key in to)) return;
    e.preventDefault();
    items[to[e.key]]?.focus();
  };

  const choose = (code: Lang) => {
    setOpen(false);
    btn.current?.focus();
    if (code === lang) return;
    setLang(code);
    const next = LANGS.find((l) => l.code === code)!;
    setSaid(`${next.hello}. ${next.native}.`);
  };

  return (
    <div ref={wrap} className="relative" data-no-translate>
      <button
        ref={btn}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="lang-menu"
        aria-label={`${t("Language")}: ${info.native}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex h-6 items-center gap-1.5 rounded-md border px-2.5 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]",
          open ? "border-[#F4D27A] bg-white text-[#0A4A13]" : "border-white/20 text-white hover:border-[#F4D27A] hover:bg-white/10",
        )}
      >
        <Globe className={cn("h-3.5 w-3.5 transition-transform duration-500", open && !reduce && "rotate-[360deg]")} aria-hidden="true" />
        <span className="hidden sm:inline">{info.native}</span>
        <span className="sm:hidden">{info.short}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menu}
            id="lang-menu"
            role="menu"
            aria-label={t("Choose a language")}
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-[70] mt-2 w-[min(21rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-3xl border border-gray-200/80 bg-white text-[#0A2E10] shadow-[0_30px_60px_-30px_rgba(10,74,19,0.55)]"
          >
            <div className="bg-[#04240A] px-5 py-3.5 text-white">
              <p className="text-lg font-bold">{t("Choose a language")}</p>
              <p className="mt-0.5 text-sm text-white/80">{t("Translations are drafts being checked by PenCom.")}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {LANGS.map((l, i) => {
                const on = l.code === lang;
                return (
                  <motion.button
                    key={l.code}
                    type="button"
                    role="menuitemradio"
                    aria-checked={on}
                    lang={l.code}
                    onClick={() => choose(l.code)}
                    initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.03 * i }}
                    className={cn(
                      "flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]",
                      on ? "bg-[#E8F5E9]" : "hover:bg-[#F7FAF6]",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold tracking-wider",
                        on ? "bg-[#04240A] text-[#F4D27A]" : "bg-[#E8F5E9] text-[#0A4A13]",
                      )}
                    >
                      {l.short}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold leading-tight text-[#0A2E10]">{l.native}</span>
                      <span className="block truncate text-sm italic text-gray-600">“{l.hello}”</span>
                    </span>
                    {l.code !== "en" && <span lang={lang} className="rounded-full bg-[#FFF4D6] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#7A5200]">{t("Draft")}</span>}
                    {on && <Check className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />}
                  </motion.button>
                );
              })}
            </div>
            <p className="flex items-start gap-2 border-t border-gray-200 bg-[#F4F7F2] px-5 py-3 text-sm leading-snug text-gray-700">
              <Scale className="mt-0.5 h-4 w-4 shrink-0 text-[#7A5200]" aria-hidden="true" />
              {t("Laws and regulations are kept in their official English version.")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">{said}</span>
    </div>
  );
}
