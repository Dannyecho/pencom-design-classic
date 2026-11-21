"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Download, FileText, HelpCircle, LayoutGrid, MapPin, MessageSquareWarning, Newspaper, Users, X, type LucideIcon,
} from "lucide-react";

type QuickLink = { label: string; to: string; icon: LucideIcon };

/** Floating quick-access button (modelled on ndic.gov.ng). Present on every page, bottom-left. */
const links: QuickLink[] = [
  { label: "Lodge a complaint", to: "/connect#report", icon: MessageSquareWarning },
  { label: "Find a PFA", to: "/operators#pfas", icon: Users },
  { label: "FAQs", to: "/resources/faq", icon: HelpCircle },
  { label: "Download forms", to: "/resources#downloads", icon: Download },
  { label: "Regulations", to: "/regulations", icon: FileText },
  { label: "Latest news", to: "/connect", icon: Newspaper },
  { label: "Zonal offices", to: "/connect#zonal-offices", icon: MapPin },
];

export default function QuickLinks() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const hoverOpened = useRef(false); // opened by hover, not yet clicked
  const pinned = useRef(false); // opened by click/tap: stays open until closed
  const reduce = useReducedMotion();
  const location = useLocation();

  // Close on route change, Escape and outside click.
  useEffect(() => setOpen(false), [location.pathname, location.hash]);
  useEffect(() => {
    if (!open) {
      pinned.current = false;
      hoverOpened.current = false;
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // Mouse users can open it by hovering; touch and keyboard users click/tap.
  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    if (!open) hoverOpened.current = true;
    setOpen(true);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (pinned.current) return;
    hoverTimer.current = window.setTimeout(() => setOpen(false), 350);
  };

  return (
    <div
      ref={wrap}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="fixed bottom-6 left-4 z-40 sm:left-6 print:hidden"
    >
      <AnimatePresence>
        {open && (
          <motion.nav
            id="quick-links"
            aria-label="Quick links"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute bottom-[4.5rem] left-0"
          >
            <ul className="flex flex-col-reverse gap-2.5">
              {links.map((l, i) => (
                <motion.li
                  key={l.to + l.label}
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : 8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : i * 0.03 }}
                  style={{ transformOrigin: "left bottom" }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="group flex min-h-11 items-center gap-3 focus-visible:outline-none"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#04240A] text-[#F4D27A] shadow-[0_10px_24px_-10px_rgba(4,36,10,0.8)] ring-2 ring-white transition duration-200 group-hover:rotate-6 group-hover:bg-[#0A4A13] group-focus-visible:outline group-focus-visible:outline-[3px] group-focus-visible:outline-offset-2 group-focus-visible:outline-[#FFD84D]">
                      <l.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="whitespace-nowrap rounded-xl border border-gray-200/80 bg-white px-4 py-2 text-base font-semibold text-[#0A2E10] shadow-[0_12px_28px_-14px_rgba(10,74,19,0.55)] transition group-hover:border-[#117F21]/40 group-hover:text-[#117F21]">
                      {l.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      <motion.button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="quick-links"
        aria-label={open ? "Close quick links" : "Open quick links"}
        onClick={() => {
          if (hoverOpened.current) {
            // The pointer already opened it on hover: a click pins it open instead of closing it.
            hoverOpened.current = false;
            pinned.current = true;
            setOpen(true);
            return;
          }
          pinned.current = !open;
          setOpen((o) => !o);
        }}
        className="relative flex h-14 min-w-14 items-center justify-center gap-2 rounded-2xl bg-[#04240A] px-4 text-white shadow-[0_16px_36px_-14px_rgba(4,36,10,0.9)] ring-2 ring-white transition hover:bg-[#0A4A13] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D] sm:pr-5"
      >
        {open ? <X className="h-6 w-6 text-[#F4D27A]" aria-hidden="true" /> : <LayoutGrid className="h-6 w-6 text-[#F4D27A]" aria-hidden="true" />}
        <span className="hidden text-base font-semibold sm:inline" aria-hidden="true">Quick links</span>
      </motion.button>
    </div>
  );
}
