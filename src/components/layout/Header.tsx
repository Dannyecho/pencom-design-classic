"use client";

import { useState, useEffect, useRef, type FocusEvent } from "react";
import { Link, useLocation } from "@/lib/router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Menu, X, ChevronDown, ChevronRight, Shield, Search,
  Building2, ClipboardList, Users, BookOpen, Scale, Mail,
  Home, ArrowRightLeft, UserCircle, TrendingUp, FileCheck,
  UserPlus, Heart, Download, Calculator, Landmark,
  Phone, HelpCircle, MapPin,
} from "lucide-react";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NoticesBell from "@/components/NoticesBell";
import SiteSearch from "@/views/home/SiteSearch";
import ReportGovBadge from "@/components/ReportGovBadge";

/**
 * Site header in the classic "national portal" look. Total height stays 92 px (28 px top bar + 64 px nav),
 * because pages offset sticky bars by that amount. Dark #04240A top bar (offices, phone, reportgov.ng,
 * language); white nav that gains a shadow on scroll, a sliding green pill under the active item, labelled
 * "Search" and "Menu" buttons. Mega menus are white rounded-3xl panels with list-panel rows and a dark
 * featured card for the section's overview page (open on hover or keyboard focus, Escape closes).
 * The search panel uses the site typeahead (SiteSearch).
 */

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  ClipboardList: <ClipboardList className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Scale: <Scale className="h-5 w-5" />,
  Mail: <Mail className="h-5 w-5" />,
  ArrowRightLeft: <ArrowRightLeft className="h-5 w-5" />,
  UserCircle: <UserCircle className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  FileCheck: <FileCheck className="h-5 w-5" />,
  UserPlus: <UserPlus className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Download: <Download className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  Landmark: <Landmark className="h-5 w-5" />,
  Phone: <Phone className="h-5 w-5" />,
  HelpCircle: <HelpCircle className="h-5 w-5" />,
  Search: <Search className="h-5 w-5" />,
};

const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

/** Menu link: router link inside this app, plain link for pages outside it (the v2 site at ./v2/). */
function NavLink({ to, plain, ...rest }: { to: string; plain?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return plain ? <a href={to} {...rest} /> : <Link to={to} {...rest} />;
}

type NavLinkItem = { label: string; href: string; plain?: boolean; note?: string };

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBox = useRef<HTMLDivElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
    setSearchOpen(false);
  }, [location.pathname]);

  // Search panel: focus the field when it opens, Escape closes and returns focus to the button.
  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => searchBox.current?.querySelector<HTMLInputElement>("input")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSearchOpen(false);
      searchBtn.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  // Escape closes an open mega menu.
  useEffect(() => {
    if (!activeMega) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActiveMega(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMega]);

  const hasMega = (label: string) => {
    const item = navItems.find((n) => n.label === label);
    return !!(item?.megaMenu?.columns && item.megaMenu.columns.length > 0);
  };
  const isActive = (item: (typeof navItems)[number]) =>
    location.pathname === item.href ||
    (item.href !== "/" && location.pathname.startsWith(`${item.href}/`)) ||
    !!(item as { match?: string[] }).match?.includes(location.pathname);
  const leave = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActiveMega(null);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 print:hidden">
      {/* Utility bar (28 px) */}
      <div className="bg-[#04240A] text-[13px] text-white">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span className="text-white/85">Federal Republic of Nigeria</span>
            <Link to="/connect#zonal-offices" className={cn("hidden items-center gap-1.5 rounded text-white/85 transition hover:text-[#F4D27A] sm:inline-flex", focus)}>
              <MapPin className="h-3.5 w-3.5 text-[#F4D27A]" aria-hidden="true" />
              Zonal Offices
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex"><ReportGovBadge compact /></span>
            <Link to="/connect#contact" className={cn("flex items-center gap-1.5 whitespace-nowrap rounded text-white/85 transition hover:text-[#F4D27A]", focus)}>
              <Phone className="h-3.5 w-3.5 text-[#F4D27A]" aria-hidden="true" />
              <span className="hidden sm:inline">09-4611300</span>
              <span className="sr-only sm:hidden">09-4611300</span>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main nav (64 px) */}
      <nav
        aria-label="Main"
        className={cn(
          "bg-white transition-shadow duration-300",
          scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_18px_36px_-24px_rgba(10,74,19,0.5)]" : "shadow-[0_1px_0_rgba(0,0,0,0.06)]",
        )}
      >
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link to="/" className={cn("flex shrink-0 items-center gap-3 rounded-xl", focus)} aria-label="PenCom Home">
              <img src="/pencom-logo.png" alt="PenCom Logo" className="h-11 w-auto object-contain" />
              <span className="hidden sm:block lg:hidden xl:block">
                <span className="block text-lg font-bold leading-tight text-[#0A2E10]">PenCom</span>
                <span className="block text-[13px] leading-tight text-gray-600">National Pension Commission</span>
              </span>
            </Link>

            {/* Desktop menu */}
            <ul className="hidden items-center gap-0.5 lg:flex">
              {navItems.map((item) => {
                const mega = hasMega(item.label) ? item.megaMenu : undefined;
                const on = isActive(item);
                const openNow = activeMega === item.label;
                const cols = mega?.columns.length ?? 0;
                return (
                  <li
                    key={item.label}
                    className={cn(cols > 1 ? "static" : "relative")}
                    onMouseEnter={() => mega && setActiveMega(item.label)}
                    onMouseLeave={() => setActiveMega(null)}
                    onFocus={() => mega && setActiveMega(item.label)}
                    onBlur={leave}
                  >
                    <Link
                      to={item.href}
                      aria-current={location.pathname === item.href ? "page" : undefined}
                      aria-expanded={mega ? openNow : undefined}
                      className={cn(
                        "relative isolate flex min-h-11 items-center gap-1 whitespace-nowrap rounded-xl px-2.5 text-[15px] font-semibold transition-colors xl:px-3",
                        on ? "text-[#0A4A13]" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]",
                        focus,
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="nav-active"
                          aria-hidden="true"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                          className="absolute inset-0 -z-10 rounded-xl bg-[#E8F5E9]"
                        />
                      )}
                      {item.label}
                      {mega && <ChevronDown className={cn("h-4 w-4 transition-transform", openNow && "rotate-180")} aria-hidden="true" />}
                      {on && <span aria-hidden="true" className="absolute inset-x-3 -bottom-[10px] h-[3px] rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />}
                    </Link>

                    <AnimatePresence>
                      {openNow && mega && (
                        <motion.div
                          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: reduce ? 0 : 6 }}
                          transition={{ duration: 0.2 }}
                          className={cn("absolute top-full z-10 pt-3", cols === 1 ? "left-0" : "inset-x-4")}
                        >
                          <div
                            className={cn(
                              "relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_30px_60px_-30px_rgba(10,74,19,0.55)]",
                              cols === 1 ? "w-[22rem] p-3" : "flex gap-5 p-5",
                            )}
                          >
                            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#117F21] via-[#CB9615] to-[#117F21]" />
                            {cols > 1 && (
                              <Link
                                to={item.href}
                                className={cn("group/feat relative isolate flex w-56 shrink-0 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#04240A] via-[#0A4A13] to-[#117F21] p-5 text-white", focus)}
                              >
                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute inset-0 -z-10"
                                  style={{
                                    backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                                    backgroundSize: "32px 32px",
                                  }}
                                />
                                <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 -z-10 h-40 w-40 rounded-full bg-[#CB9615]/25 blur-3xl" />
                                <span>
                                  <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#F4D27A] ring-1 ring-white/15 transition duration-300 group-hover/feat:rotate-6">
                                    {iconMap[item.icon] || <Shield className="h-5 w-5" />}
                                  </span>
                                  <span className="mt-4 block text-xl font-bold leading-tight">{item.label}</span>
                                  <span className="mt-1.5 block text-sm leading-snug text-white/80">{item.description}</span>
                                </span>
                                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F4D27A]">
                                  Overview
                                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover/feat:translate-y-[-1px]" aria-hidden="true" />
                                </span>
                              </Link>
                            )}
                            <div className="grid flex-1 gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                              {mega.columns.map((col) => (
                                <div key={col.title}>
                                  {cols > 1 && (
                                    <p className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.16em] text-[#0A4A13]">
                                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#117F21]" />
                                      {col.title}
                                    </p>
                                  )}
                                  <ul className={cn(cols > 1 ? "overflow-hidden rounded-2xl border border-gray-200/80 divide-y divide-gray-100" : "space-y-0.5")}>
                                    {(col.links as NavLinkItem[]).map((link) => {
                                      const here = location.pathname === link.href;
                                      return (
                                        <li key={link.label}>
                                          <NavLink
                                            to={link.href}
                                            plain={link.plain}
                                            aria-current={here ? "page" : undefined}
                                            className={cn(
                                              "group flex min-h-11 items-center gap-2 px-3 py-2 text-[15px] transition-colors",
                                              cols > 1 ? "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]" : cn("rounded-xl", focus),
                                              here ? "bg-[#E8F5E9] font-semibold text-[#0A4A13]" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]",
                                            )}
                                          >
                                            <span className="min-w-0 flex-1">
                                              <span className={link.note ? "font-semibold" : undefined}>{link.label}</span>
                                              {link.note && <span className="mt-0.5 block text-sm font-normal leading-snug text-gray-600">{link.note}</span>}
                                            </span>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-[#117F21] opacity-0 transition duration-200 group-hover:opacity-100" aria-hidden="true" />
                                          </NavLink>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <NoticesBell />
              <button
                ref={searchBtn}
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                aria-expanded={searchOpen}
                aria-controls="header-search"
                aria-label={searchOpen ? "Close search" : undefined}
                className={cn(
                  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-2.5 text-[15px] font-semibold transition-colors sm:px-3.5",
                  searchOpen ? "bg-[#04240A] text-[#F4D27A]" : "border border-[#117F21]/25 text-[#117F21] hover:border-[#117F21] hover:bg-[#F7FAF6]",
                  focus,
                )}
              >
                {searchOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{searchOpen ? "Close" : "Search"}</span>
              </button>
              <Link
                to="/services"
                className={cn("hidden min-h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-[#CB9615] px-4 text-[15px] font-semibold text-[#1A1206] shadow-[0_14px_30px_-16px_rgba(203,150,21,0.9)] transition-colors hover:bg-[#E0AA22] xl:inline-flex", focus)}
              >
                <Shield className="h-5 w-5" aria-hidden="true" />
                e-Services
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#04240A] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A4A13] lg:hidden",
                  focus,
                )}
              >
                {mobileOpen ? <X className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" /> : <Menu className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" />}
                {mobileOpen ? "Close" : "Menu"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search panel */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            id="header-search"
            role="region"
            aria-label="Search"
            initial={{ opacity: 0, y: reduce ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-200 bg-gradient-to-b from-white to-[#F4F7F2] shadow-[0_24px_40px_-30px_rgba(10,74,19,0.6)]"
          >
            <div ref={searchBox} className="mx-auto max-w-3xl px-4 py-5">
              <p className="mb-3 text-lg font-bold text-[#0A2E10]">What are you looking for?</p>
              <SiteSearch />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            className="max-h-[calc(100svh-92px)] overflow-y-auto border-t border-gray-200 bg-[#F4F7F2] shadow-xl lg:hidden"
          >
            <ul className="space-y-2 px-4 py-4">
              {navItems.map((item) => {
                const on = isActive(item);
                return (
                  <li key={item.label} className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white">
                    <Link
                      to={item.href}
                      aria-current={location.pathname === item.href ? "page" : undefined}
                      className={cn(
                        "flex min-h-14 items-center gap-3 px-4 text-base font-bold transition-colors",
                        "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]",
                        on ? "bg-[#E8F5E9] text-[#0A4A13]" : "text-[#0A2E10] hover:bg-[#F7FAF6]",
                      )}
                    >
                      <span aria-hidden="true" className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl [&_svg]:h-[18px] [&_svg]:w-[18px]", on ? "bg-[#117F21] text-white" : "bg-[#E8F5E9] text-[#117F21]")}>
                        {iconMap[item.icon] || <Shield className="h-5 w-5" />}
                      </span>
                      {item.label}
                    </Link>
                    {item.megaMenu && (
                      <ul className="divide-y divide-gray-100 border-t border-gray-100">
                        {item.megaMenu.columns.map((col) =>
                          (col.links as NavLinkItem[]).slice(0, item.megaMenu!.columns.length === 1 ? undefined : 3).map((link) => (
                            <li key={link.label}>
                              <NavLink
                                to={link.href}
                                plain={link.plain}
                                aria-current={location.pathname === link.href ? "page" : undefined}
                                className={cn(
                                  "flex min-h-11 items-center pl-16 pr-4 text-[15px]",
                                  "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]",
                                  location.pathname === link.href ? "font-semibold text-[#0A4A13]" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]",
                                )}
                              >
                                {link.label}
                              </NavLink>
                            </li>
                          )),
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="px-4 pb-5">
              <Link
                to="/services"
                className={cn("flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#CB9615] px-6 text-base font-semibold text-[#1A1206] shadow-[0_14px_30px_-16px_rgba(203,150,21,0.9)] hover:bg-[#E0AA22]", focus)}
              >
                <Shield className="h-5 w-5" aria-hidden="true" />
                Access e-Services
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
