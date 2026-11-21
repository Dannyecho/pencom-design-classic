"use client";

import { Link } from "@/lib/router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cookie, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConsentState = "undecided" | "accepted" | "declined";
type Prefs = { necessary: boolean; analytics: boolean; personalization: boolean; advertising: boolean };

const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";
const gold = cn("inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F]", focus);
const outline = cn("inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-[#117F21] px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white", focus);
const quiet = cn("inline-flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-5 text-lg font-semibold text-[#14261A] ring-1 ring-black/15 transition hover:bg-[#F1EFE8]", focus);

const options: { key: Exclude<keyof Prefs, "necessary">; label: string; note: string }[] = [
  { key: "analytics", label: "Analytics", note: "Help us understand how you use our website" },
  { key: "personalization", label: "Personalisation", note: "Allow us to personalise your experience" },
  { key: "advertising", label: "Advertising", note: "Used to deliver relevant advertisements" },
];

/** A switch drawn as a pill; the button carries role="switch" and aria-checked. */
function Switch({ on, label, onToggle }: { on: boolean; label?: string; onToggle?: () => void }) {
  const knob = (
    <span aria-hidden="true" className={cn("relative block h-8 w-14 shrink-0 rounded-full transition-colors", on ? "bg-[#117F21]" : "bg-gray-400")}>
      <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left]", on ? "left-7" : "left-1")} />
    </span>
  );
  if (!onToggle) return knob;
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onToggle} className={cn("grid min-h-11 min-w-14 place-items-center rounded-full", focus)}>
      {knob}
    </button>
  );
}

/** Cookie choice in the calm look: a white rounded card floating at the bottom, large labelled buttons. */
export default function CookieConsent() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [, setConsent] = useState<ConsentState>("undecided");
  const [preferences, setPreferences] = useState<Prefs>({
    necessary: true,
    analytics: false,
    personalization: false,
    advertising: false,
  });

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("pencom-cookie-consent");
    } catch {
      /* storage unavailable: ask */
    }
    if (!saved) {
      // Wait for a first-visit promo popup (it sets data-promo on <html>) so the two never stack.
      let timer = 0;
      const show = () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setVisible(true), 700);
      };
      timer = window.setTimeout(() => {
        if (document.documentElement.dataset.promo) window.addEventListener("pencom:promo-done", show, { once: true });
        else setVisible(true);
      }, 1500);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("pencom:promo-done", show);
      };
    }
    setConsent(saved as ConsentState);
  }, []);

  const store = (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  };
  const finish = (state: ConsentState) => {
    store("pencom-cookie-consent", state);
    setConsent(state);
    setVisible(false);
    setShowManage(false);
  };
  const handleAcceptAll = () => finish("accepted");
  const handleDeclineAll = () => finish("declined");
  const handleSavePreferences = () => {
    store("pencom-cookie-preferences", JSON.stringify(preferences));
    finish("accepted");
  };
  // Closing without a choice just hides it for this visit.
  const handleClose = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-labelledby="cookie-title"
          initial={{ y: reduce ? 0 : 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 40, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5 print:hidden"
        >
          <div className="mx-auto max-h-[calc(100svh-7rem)] max-w-5xl overflow-y-auto rounded-3xl bg-white p-5 text-[#14261A] shadow-[0_30px_70px_-20px_rgba(10,74,19,0.55)] ring-1 ring-black/10 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <h3 id="cookie-title" className="flex items-center gap-3 text-xl font-bold">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A]">
                  {showManage ? <Settings className="h-5 w-5" /> : <Cookie className="h-5 w-5" />}
                </span>
                {showManage ? "Manage Cookies" : "Cookies"}
              </h3>
              <button
                type="button"
                onClick={showManage ? () => setShowManage(false) : handleClose}
                aria-label={showManage ? "Back" : "Close cookie consent"}
                className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 ring-1 ring-black/10 transition hover:bg-[#F1EFE8] hover:text-[#14261A]", focus)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {!showManage ? (
              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-8">
                <div className="min-w-0 flex-1">
                  <p className="text-lg leading-relaxed text-gray-700">
                    At PenCom we use cookies to ensure that our website works
                    properly. We can also use cookies to improve and
                    personalise your experience, understand how you use our
                    website and for our advertising purposes. You can agree to
                    all cookies by clicking on{" "}
                    <span className="font-semibold">&apos;Accept All&apos;</span>, you
                    can also choose which cookies you want to agree by
                    selecting{" "}
                    <span className="font-semibold">&apos;Manage cookies&apos;</span>{" "}
                    or you can choose to{" "}
                    <span className="font-semibold">&apos;Decline all&apos;</span>{" "}
                    cookies.
                  </p>
                  <p className="mt-2 text-lg">
                    <Link to="/regulations#policies" className={cn("rounded font-semibold text-[#0A4A13] underline underline-offset-4 hover:text-[#117F21]", focus)}>
                      See our Privacy & Cookie Policy
                    </Link>
                  </p>
                </div>
                <div className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-3 lg:w-[15rem] lg:grid-cols-1">
                  <button type="button" onClick={handleAcceptAll} className={gold}>Accept All</button>
                  <button type="button" onClick={handleDeclineAll} className={outline}>Decline All</button>
                  <button type="button" onClick={() => setShowManage(true)} className={quiet}>
                    <Settings className="h-5 w-5" aria-hidden="true" />
                    Manage Cookies
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <ul className="space-y-2.5">
                  <li className="flex items-center justify-between gap-4 rounded-2xl bg-[#FBF8F1] p-4 ring-1 ring-black/10">
                    <div>
                      <p className="text-lg font-semibold">Necessary</p>
                      <p className="text-base text-gray-700">Required for the website to function</p>
                    </div>
                    <Switch on />
                  </li>
                  {options.map((o) => (
                    <li key={o.key} className="flex items-center justify-between gap-4 rounded-2xl bg-[#FBF8F1] p-4 ring-1 ring-black/10">
                      <div>
                        <p className="text-lg font-semibold">{o.label}</p>
                        <p className="text-base text-gray-700">{o.note}</p>
                      </div>
                      <Switch on={preferences[o.key]} label={o.label} onToggle={() => setPreferences((p) => ({ ...p, [o.key]: !p[o.key] }))} />
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button type="button" onClick={handleSavePreferences} className={gold}>Save Preferences</button>
                  <button type="button" onClick={handleAcceptAll} className={outline}>Accept All</button>
                  <button type="button" onClick={handleDeclineAll} className={quiet}>Decline All</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
