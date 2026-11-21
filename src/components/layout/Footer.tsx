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

/**
 * Site footer in the calm look: a full-width dark-green band with one soft gold blur (no spotlight, grid or
 * ghost word). It opens with a white newsletter card (gold Subscribe, app and social links), then the brand
 * and contact details, link columns with gold headings and 18 px links, the online-service pills and a
 * bottom bar with a labelled "Back to top". Motion: the card rises in once; reduced motion shows it at rest.
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
    <p className={cn("flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.18em]", light ? "text-[#0A4A13]" : "text-[#F4D27A]")}>
      <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", light ? "bg-gradient-to-br from-[#2E913D] to-[#0A4A13]" : "bg-[#F4D27A]")} />
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
    <footer className="relative isolate overflow-hidden bg-[#0A4A13] text-white print:hidden" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site footer
      </h2>
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-[#CB9615]/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 pt-14 sm:pt-16">
        {/* ── Newsletter, app and social: one white card ── */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="grid grid-cols-1 gap-8 rounded-[2rem] bg-[#FBF8F1] p-6 text-[#14261A] shadow-[0_40px_70px_-40px_rgba(0,0,0,0.6)] sm:p-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="lg:col-span-7">
            <Kicker light>Stay informed</Kicker>
            <h3 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl">
              Pension news, straight to <DrawnMark text="your inbox" />
            </h3>
            <p className="mt-4 max-w-xl text-lg text-gray-700">Circulars, deadlines and new services, about once a month. No spam, unsubscribe at any time.</p>

            <form onSubmit={subscribe} className="mt-6">
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.p
                    key="ok"
                    role="status"
                    initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl bg-[#E8F5E9] p-4 text-lg font-semibold text-[#0A4A13] ring-1 ring-[#117F21]/20"
                  >
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-[#117F21]" aria-hidden="true" />
                    Thank you. Check your inbox to confirm your subscription.
                  </motion.p>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }}>
                    <label htmlFor="footer-email" className="mb-2 block text-lg font-semibold">
                      Email address
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <span className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-black/15 transition focus-within:ring-[3px] focus-within:ring-[#FFD84D]">
                        <Mail className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                        <input
                          id="footer-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="min-h-14 w-full bg-transparent text-lg text-[#14261A] placeholder:text-gray-500 focus:outline-none"
                        />
                      </span>
                      <button
                        type="submit"
                        className={cn("group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F]", focus)}
                      >
                        Subscribe
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <div className="flex flex-col gap-8 border-t border-black/10 pt-8 sm:flex-row sm:flex-wrap sm:gap-12 lg:col-span-5 lg:flex-col lg:gap-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
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
                    className={cn("inline-flex min-h-14 items-center gap-3 rounded-2xl border-2 border-[#117F21] bg-white px-4 text-[#14261A] transition hover:bg-[#0A4A13] hover:text-white", focus)}
                  >
                    <s.icon className="h-6 w-6" aria-hidden="true" />
                    <span className="text-left">
                      <span className="block text-sm leading-none">{s.top}</span>
                      <span className="block text-lg font-bold leading-tight">{s.name}</span>
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
                      className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition duration-300 hover:-translate-y-1 hover:bg-[#117F21]", focus)}
                    >
                      <s.icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* ── Brand, contact and link columns ── */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className={cn("inline-flex items-center gap-3 rounded-2xl", focus)}>
              <img src="/pencom-logo.png" alt="" className="h-14 w-14 rounded-2xl bg-white object-contain p-1.5" />
              <span>
                <span className="block text-xl font-bold leading-tight">PenCom</span>
                <span className="block text-base text-white/80">National Pension Commission</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">
              Ensuring the safety and security of retirement benefits for all Nigerian workers through effective regulation and supervision of the pension industry.
            </p>
            <ul className="mt-6 space-y-3">
              {contacts.map((c) => {
                const inner = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] text-[#F4D27A] ring-1 ring-white/10 transition duration-300 group-hover:-rotate-6 group-hover:bg-[#F4D27A] group-hover:text-[#1A1206]">
                      <c.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold uppercase tracking-[0.14em] text-[#F4D27A]">{c.label}</span>
                      <span className="block break-words text-base text-white/90 group-hover:underline">{c.value}</span>
                    </span>
                  </>
                );
                const cls = cn("group flex items-center gap-3 rounded-2xl py-1", focus);
                return <li key={c.label}>{c.to ? <Link to={c.to} className={cls}>{inner}</Link> : <a href={c.href} className={cls}>{inner}</a>}</li>;
              })}
            </ul>
          </div>

          {columns.map((col, i) => (
            <nav key={col.title} aria-label={t(col.title)} className={cn("lg:col-span-2", i === 2 && "sm:col-span-2 lg:col-span-4")}>
              <Kicker>{col.title}</Kicker>
              <ul className={cn("mt-5 space-y-0.5", col.links.length > 4 && "sm:columns-2 sm:gap-6")}>
                {col.links.map((l) => (
                  <li key={l.label} className="break-inside-avoid">
                    <Link to={l.href} className={cn("group inline-flex min-h-11 items-center gap-1.5 rounded-xl py-1 text-lg text-white/90 transition hover:text-white", focus)}>
                      <span className="relative">
                        {l.label}
                        <span aria-hidden="true" className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-[#F4D27A] transition-transform duration-300 group-hover:scale-x-100" />
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#F4D27A] opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
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
                  className={cn("group flex min-h-14 items-center gap-3 rounded-2xl bg-white/[0.07] px-5 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#14261A]", focus)}
                >
                  <span className="text-lg font-bold">{p.name}</span>
                  <span className="truncate text-base text-white/80 transition group-hover:text-gray-700">{p.note}</span>
                  <ExternalLink className="ml-auto h-5 w-5 shrink-0 text-[#F4D27A] transition group-hover:text-[#0A4A13]" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="mx-auto mt-12 max-w-7xl px-4 pb-28">
        <div className="flex flex-col gap-4 border-t border-white/15 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-base text-white/80">
            &copy; 2026 National Pension Commission. All rights reserved. Federal Republic of Nigeria.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { label: "Contact Us", to: "/connect" },
              { label: "Report Employer", to: "/connect#report" },
              { label: "Privacy Policy", to: "/regulations#policies" },
            ].map((l) => (
              <Link key={l.label} to={l.to} className={cn("inline-flex min-h-11 items-center rounded text-base font-medium text-white/90 hover:text-white hover:underline", focus)}>
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={toTop}
              className={cn("group inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-[#F4D27A] px-4 text-base font-semibold text-white transition hover:bg-[#F4D27A] hover:text-[#1A1206]", focus)}
            >
              <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
