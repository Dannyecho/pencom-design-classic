"use client";

import { useState, type FormEvent } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Apple, ArrowRight, ArrowUp, CheckCircle2, ChevronRight, ExternalLink, Facebook, Instagram,
  Linkedin, Mail, MapPin, Phone, Play, Twitter, Youtube,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { DrawnMark } from "@/views/theme/Headline";
import { GridBackdrop } from "@/views/about/primitives";

/**
 * Site footer in the classic "national portal" look: a full-width #04240A band with the 64 px grid, a green and a
 * gold blur. A white newsletter card (gold hairline, gold Subscribe, app and social links) floats over its top edge
 * (-mt-14, over a white strip), then the brand and contact details, four link columns with gold headings, the
 * online-service portal tiles and a bottom bar with a labelled "Back to top". The card rises in once.
 */

const columns = [
  {
    title: "About PenCom",
    links: [
      { label: "About the Commission", href: "/about" },
      { label: "Mission & Vision", href: "/about#mission" },
      { label: "Leadership", href: "/about#executive" },
      { label: "Service Charter", href: "/about/service-charter" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Pension Services", href: "/services" },
      { label: "RSA Transfer", href: "/services#rsa-transfer" },
      { label: "Personal Pension Plan", href: "/services#ppp" },
      { label: "Pension Clearance", href: "/services#pcc" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Publications", href: "/resources#publications" },
      { label: "PenCom Chronicles", href: "/chronicles" },
      { label: "Photos and videos", href: "/media" },
      { label: "Circulars", href: "/regulations?type=Circular#library" },
      { label: "Downloads", href: "/resources#downloads" },
      { label: "Forms and checklists", href: "/resources/forms-and-checklists" },
      { label: "FAQs", href: "/resources/faq" },
      { label: "Admin Dashboard", href: "/admin" },
    ],
  },
  {
    title: "Get help",
    links: [
      { label: "Contact Us", href: "/connect" },
      { label: "Zonal Offices", href: "/connect#zonal-offices" },
      { label: "Report Employer", href: "/connect#report" },
      { label: "FAQs", href: "/resources/faq" },
      { label: "Privacy Policy", href: "/regulations#policies" },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, href: "https://x.com/PenComNig", label: "X (Twitter)" },
  { icon: Instagram, href: "https://instagram.com/pencomnigeria", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/PenCom.gov", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com/channel/UCK7FCj7J1GMk6hrnDDInq9w", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com/company/national-pension-commission", label: "LinkedIn" },
];

const portals = [
  { name: "COBRA", note: "Contributions" },
  { name: "Pencare", note: "Retiree health cover" },
  { name: "PENCAP", note: "Pension capital" },
  { name: "PCRS", note: "Remit contributions" },
];

const contacts = [
  { icon: MapPin, label: "Head office", value: "174, Adetokunbo Ademola Crescent, Wuse II, Abuja", to: "/connect#zonal-offices" },
  { icon: Phone, label: "Call us", value: "09-4611300, 0700-PENCOM (0700-736266)", href: "tel:094611300" },
  { icon: Mail, label: "Email us", value: "info@pencom.gov.ng", href: "mailto:info@pencom.gov.ng" },
];

const ease = [0.22, 1, 0.36, 1] as const;
const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

/** Column heading on the green band: gold, uppercase, with a small gold dot. */
function Kicker({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={cn("flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em]", light ? "text-[#0A4A13]" : "text-[#F4D27A]")}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 rounded-full", light ? "bg-[#117F21]" : "bg-[#F4D27A]")} />
      {children}
    </p>
  );
}

export default function Footer() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  const toTop = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  return (
    <footer className="relative bg-white pt-16 text-white print:hidden" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site footer
      </h2>
      <div className="relative isolate bg-[#04240A]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <GridBackdrop />
        <div className="absolute -left-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#117F21]/40 blur-[160px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#CB9615]/15 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* ── Newsletter, app and social: one white card ── */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="relative -top-16 -mb-16 grid grid-cols-1 gap-8 overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 text-[#0A2E10] shadow-[0_40px_70px_-40px_rgba(4,36,10,0.7)] sm:p-9 lg:grid-cols-12 lg:gap-12"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#117F21] via-[#CB9615] to-[#117F21]" />
          <div className="lg:col-span-7">
            <Kicker light>Stay informed</Kicker>
            <h3 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight sm:text-[2.1rem]">
              Pension news, straight to <DrawnMark text="your inbox" />
            </h3>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">Circulars, deadlines and new services, about once a month. No spam, unsubscribe at any time.</p>

            <form onSubmit={subscribe} className="mt-6">
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.p
                    key="ok"
                    role="status"
                    initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl border-l-4 border-[#117F21] bg-[#E8F5E9] p-4 text-base font-semibold text-[#0A4A13]"
                  >
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
                    Thank you. Check your inbox to confirm your subscription.
                  </motion.p>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }}>
                    <label htmlFor="footer-email" className="mb-2 block text-base font-semibold">
                      Email address
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <span className="flex flex-1 items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 transition focus-within:border-[#117F21] focus-within:ring-[3px] focus-within:ring-[#FFD84D]">
                        <Mail className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                        <input
                          id="footer-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="min-h-12 w-full bg-transparent text-base text-[#0A2E10] placeholder:text-gray-500 focus:outline-none"
                        />
                      </span>
                      <button
                        type="submit"
                        className={cn("group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#CB9615] px-6 text-base font-semibold text-[#1A1206] shadow-[0_14px_30px_-16px_rgba(203,150,21,0.9)] transition hover:bg-[#E0AA22]", focus)}
                      >
                        Subscribe
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <div className="flex flex-col gap-8 border-t border-gray-100 pt-8 sm:flex-row sm:flex-wrap sm:gap-12 lg:col-span-5 lg:flex-col lg:gap-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <Kicker light>Get the app</Kicker>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { icon: Apple, top: "Download on the", name: "App Store" },
                  { icon: Play, top: "Get it on", name: "Google Play" },
                ].map((s) => (
                  <Link
                    key={s.name}
                    to="/mobile"
                    className={cn("inline-flex min-h-12 items-center gap-3 rounded-xl border border-[#117F21]/25 bg-white px-4 text-[#0A2E10] transition hover:border-[#117F21] hover:bg-[#F7FAF6]", focus)}
                  >
                    <s.icon className="h-6 w-6 text-[#117F21]" aria-hidden="true" />
                    <span className="text-left">
                      <span className="block text-xs leading-none text-gray-600">{s.top}</span>
                      <span className="block text-base font-bold leading-tight">{s.name}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Kicker light>Follow us</Kicker>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {socialLinks.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (opens in a new tab)`}
                      title={s.label}
                      className={cn("group flex h-12 w-12 items-center justify-center rounded-xl bg-[#04240A] text-[#F4D27A] transition duration-300 hover:-translate-y-0.5 hover:bg-[#0A4A13]", focus)}
                    >
                      <s.icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* ── Brand, contact and link columns ── */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 pb-14 pt-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className={cn("inline-flex items-center gap-3 rounded-2xl", focus)}>
              <img src="/pencom-logo.png" alt="" className="h-14 w-14 rounded-xl bg-white object-contain p-1.5" />
              <span>
                <span className="block text-xl font-bold leading-tight">PenCom</span>
                <span className="block text-sm text-white/75">National Pension Commission</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
              Ensuring the safety and security of retirement benefits for all Nigerian workers through effective regulation and supervision of the pension industry.
            </p>
            <ul className="mt-6 space-y-3">
              {contacts.map((c) => {
                const inner = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#F4D27A] ring-1 ring-white/10 transition duration-300 group-hover:rotate-6 group-hover:bg-[#CB9615] group-hover:text-[#1A1206]">
                      <c.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#F4D27A]">{c.label}</span>
                      <span className="block break-words text-[15px] text-white/85 group-hover:underline">{c.value}</span>
                    </span>
                  </>
                );
                const cls = cn("group flex items-center gap-3 rounded-2xl py-1", focus);
                return <li key={c.label}>{c.to ? <Link to={c.to} className={cls}>{inner}</Link> : <a href={c.href} className={cls}>{inner}</a>}</li>;
              })}
            </ul>
          </div>

          {columns.map((col, i) => (
            <nav key={col.title} aria-label={t(col.title)} className="lg:col-span-2">
              <Kicker>{col.title}</Kicker>
              <ul className="mt-4 space-y-0.5">
                {col.links.map((l) => (
                  <li key={l.label} className="break-inside-avoid">
                    <Link to={l.href} className={cn("group inline-flex min-h-11 items-center gap-1.5 rounded-lg py-0.5 text-[15px] text-white/80 transition hover:text-white", focus)}>
                      <span className="relative">
                        {l.label}
                        <span aria-hidden="true" className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-[#F4D27A] transition-transform duration-300 group-hover:scale-x-100" />
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#F4D27A] opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ── Online services ── */}
        <div className="border-t border-white/15 pt-8">
          <Kicker>Online services</Kicker>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {portals.map((p) => (
              <li key={p.name}>
                <a
                  href={`https://${p.name.toLowerCase()}.pencom.gov.ng`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("group flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#F4D27A]/40 hover:bg-white/[0.09]", focus)}
                >
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CB9615] text-xs font-black text-[#1A1206] transition-transform duration-300 group-hover:rotate-6">{p.name.slice(0, 2).toUpperCase()}</span>
                  <span className="min-w-0">
                    <span className="block text-base font-bold leading-tight">{p.name}</span>
                  <span className="block truncate text-sm text-white/75">{p.note}</span>
                  </span>
                  <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-[#F4D27A]" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="mx-auto mt-10 max-w-7xl px-4 pb-28">
        <div className="flex flex-col gap-4 border-t border-white/15 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/75">
            &copy; 2026 National Pension Commission. All rights reserved. Federal Republic of Nigeria.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { label: "Contact Us", to: "/connect" },
              { label: "Report Employer", to: "/connect#report" },
              { label: "Privacy Policy", to: "/regulations#policies" },
            ].map((l) => (
              <Link key={l.label} to={l.to} className={cn("inline-flex min-h-11 items-center rounded text-sm font-medium text-white/80 hover:text-white hover:underline", focus)}>
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={toTop}
              className={cn("group inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:border-[#F4D27A] hover:text-[#F4D27A]", focus)}
            >
              <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              Back to top
            </button>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
