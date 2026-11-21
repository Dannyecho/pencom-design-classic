"use client";

import type { ReactNode } from "react";
import { Link } from "@/lib/router";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, BookOpenCheck, Building2, CalendarDays, CheckCircle2, ClipboardList, HeartPulse, Info, Mail,
  MapPin, MessageCircle, MessageSquareWarning, Phone, Search, ShieldAlert, ShieldCheck, UserRoundSearch, Wallet,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { siteNotices, type NoticeType } from "@/lib/alerts";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/views/theme/heading";
import { headOffice } from "@/views/connect/data";
import { news, newsPath } from "@/views/news/data";
import SiteSearch, { openChat } from "@/views/home/SiteSearch";

const ease = [0.22, 1, 0.36, 1] as const;
const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

function Rise({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── Welcome ─────────────────────────── */

export function WelcomeBar() {
  const { t } = useI18n();
  return (
    <div className="px-4 pt-6 sm:pt-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-semibold text-[#117F21] sm:text-lg">{t("Welcome")}</p>
          <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight text-[#14261A] sm:text-4xl">National Pension Commission</h1>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── What would you like to do? ─────────────────────────── */

const tasks = [
  { icon: Wallet, title: "Get my retirement benefits", body: "What to prepare and how you will be paid.", to: "/resources#guides" },
  { icon: HeartPulse, title: "Join Pencare health insurance", body: "Health cover for retirees under the scheme.", to: "/services#pencare" },
  { icon: UserRoundSearch, title: "Find my PFA", body: "The company that keeps and pays your pension.", to: "/operators#pfas" },
  { icon: ClipboardList, title: "Documents I need", body: "Simple checklists you can print.", to: "/resources/forms-and-checklists" },
  { icon: MapPin, title: "Find an office near me", body: "Addresses and phone numbers of our offices.", to: "/connect#zonal-offices" },
  { icon: MessageSquareWarning, title: "Make a complaint", body: "Tell us about a problem with your pension.", to: "/connect" },
];

const others = [
  { label: "Still working", to: "/services" },
  { label: "Employer", to: "/services#pcc" },
  { label: "Self-employed", to: "/services#ppp" },
  { label: "Pension operator", to: "/regulations" },
];

export function TopTasks() {
  const { t } = useI18n();
  return (
    <section id="tasks" aria-labelledby="tasks-title" className="scroll-mt-32 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading id="tasks-title" eyebrow="Start here" title="What would you like to do today?" highlight="today" />
          </div>
          <div className="lg:col-span-6">
            <p className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#14261A]">
              <Search className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
              {t("Type what you are looking for")}
            </p>
            <div className="[&_form_button]:min-h-12 [&_form_button]:px-5 [&_form_button]:text-lg [&_input]:min-h-16 [&_input]:text-lg">
              <SiteSearch />
            </div>
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((k, i) => (
            <li key={k.title}>
              <Rise delay={i * 0.05} className="h-full">
                <Link
                  to={k.to}
                  className={cn(
                    "group relative flex h-full items-start gap-5 overflow-hidden rounded-3xl bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21] sm:p-7",
                    focus,
                  )}
                >
                  <span aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />
                  <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]">
                    <k.icon className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block text-xl font-bold leading-snug text-[#14261A]">{k.title}</span>
                    <span className="mt-1.5 block text-lg leading-snug text-gray-700">{k.body}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-[#117F21]">
                      {t("Open")}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </Rise>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 rounded-3xl bg-[#F1EFE8] p-5 sm:flex-row sm:items-center sm:p-6">
          <p className="text-lg font-semibold text-[#14261A]">{t("Not retired yet? I am…")}</p>
          <ul className="flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.label}>
                <Link to={o.to} className={cn("inline-flex min-h-12 items-center rounded-full bg-white px-5 text-lg font-semibold text-[#0A4A13] ring-1 ring-black/10 transition hover:bg-[#0A4A13] hover:text-white", focus)}>
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Retiring: three simple steps ─────────────────────────── */

const steps = [
  { title: "Contact your PFA early", body: "Ask your PFA for its checklist of documents and start the process before your retirement date." },
  { title: "Choose how to be paid", body: "A regular amount through your PFA (programmed withdrawal), or an income for life from an insurer (annuity)." },
  { title: "Receive your payments", body: "Your PFA pays into your bank account. If there are delays, contact your PFA first, then PenCom." },
];

export function RetireeSteps() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const tel = headOffice.phone.replace(/\s/g, "");
  return (
    <section id="retiring" aria-labelledby="retiring-title" className="scroll-mt-32 px-4 pb-16 sm:pb-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0A4A13] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#CB9615]/20 blur-3xl" />
        <div className="relative grid grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-14">
          {/* Arch-framed photo */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
              className="relative mx-auto max-w-md"
            >
              <div aria-hidden="true" className="absolute -inset-3 rounded-t-[999px] rounded-b-[2rem] border-2 border-[#F4D27A]/50" />
              <img
                src="/images/opt/pencom-retiree-family-1200.webp"
                srcSet="/images/opt/pencom-retiree-family-640.webp 640w, /images/opt/pencom-retiree-family-1080.webp 1080w"
                sizes="(min-width: 1024px) 30vw, 90vw"
                alt={t("A retired man")}
                className="relative aspect-[4/5] w-full rounded-t-[999px] rounded-b-[2rem] object-cover"
                style={{ objectPosition: "30% 30%" }}
                loading="lazy"
              />
              <div className="absolute -bottom-5 left-1/2 flex w-[88%] -translate-x-1/2 items-center gap-3 rounded-2xl bg-white p-4 text-[#14261A] shadow-xl">
                <ShieldCheck className="h-8 w-8 shrink-0 text-[#117F21]" aria-hidden="true" />
                <p className="text-base font-semibold leading-snug">{t("PenCom staff will never ask for your RSA PIN, password or bank details.")}</p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <SectionHeading id="retiring-title" dark eyebrow="For retirees" title="Getting your pension in three steps" highlight="three steps" />
            <ol className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <Rise delay={i * 0.1} className="flex gap-5 rounded-3xl bg-white/[0.07] p-5 ring-1 ring-white/10 sm:p-6">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4D27A] text-2xl font-bold text-[#1A1206]" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <span className="sr-only" data-i18n-done>{t("Step {n}", { n: i + 1 })}: </span>
                      <span className="block text-xl font-bold">{s.title}</span>
                      <span className="mt-1 block text-lg leading-relaxed text-white/85">{s.body}</span>
                    </span>
                  </Rise>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/resources#guides" className={cn("inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F]", focus)}>
                <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
                {t("Read the full guide")}
              </Link>
              <a href={`tel:${tel}`} className={cn("inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-white/40 px-6 text-lg font-semibold transition hover:bg-white/10", focus)}>
                <Phone className="h-5 w-5" aria-hidden="true" />
                {t("Call us")}: <span className="whitespace-nowrap">{headOffice.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Important notices ─────────────────────────── */

const noticeLook: Record<NoticeType, { icon: typeof Info; label: string; tone: string; bar: string }> = {
  critical: { icon: ShieldAlert, label: "Critical", tone: "bg-[#FCEBEB] text-[#8E1A1E]", bar: "bg-[#D32F2F]" },
  warning: { icon: AlertTriangle, label: "Warning", tone: "bg-[#FAEEDA] text-[#7A4300]", bar: "bg-[#D97706]" },
  info: { icon: Info, label: "Information", tone: "bg-[#E6F1FB] text-[#0C447C]", bar: "bg-[#1E88E5]" },
  success: { icon: CheckCircle2, label: "Update", tone: "bg-[#E8F5E9] text-[#0A4A13]", bar: "bg-[#2E913D]" },
};

export function ImportantNotices() {
  const { t } = useI18n();
  return (
    <section id="notices" aria-labelledby="notices-title" className="scroll-mt-32 bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="notices-title" eyebrow="Notices" title="Important notices" />
        <ul className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {siteNotices.map((n, i) => {
            const s = noticeLook[n.type];
            return (
              <li key={n.id}>
                <Rise delay={i * 0.08} className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#FBF8F1] p-6 ring-1 ring-black/10 sm:p-7">
                  <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1.5", s.bar)} />
                  <span className={cn("inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-base font-bold", s.tone)}>
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                    {t(s.label)}
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-[#14261A]">{t(n.title)}</h3>
                  <p className="mt-2 flex-1 text-lg leading-relaxed text-gray-700">{t(n.message)}</p>
                  {n.link && (
                    <Link to={n.link.to} className={cn("group mt-4 inline-flex min-h-11 w-fit items-center gap-2 text-lg font-semibold text-[#117F21] underline-offset-4 hover:underline", focus)}>
                      {t(n.link.label)}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  )}
                </Rise>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Latest news ─────────────────────────── */

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function LatestNews() {
  const { t } = useI18n();
  const list = news.slice(0, 3);
  return (
    <section id="news" aria-labelledby="news-title" className="scroll-mt-32 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading id="news-title" eyebrow="News" title="Latest news from PenCom" highlight="PenCom" />
          <Link to="/news" className={cn("inline-flex min-h-14 w-fit items-center gap-2 rounded-2xl border-2 border-[#117F21] px-6 text-lg font-semibold text-[#117F21] transition hover:bg-[#117F21] hover:text-white", focus)}>
            {t("All news")}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {list.map((a, i) => (
            <li key={a.id}>
              <Rise delay={i * 0.08} className="h-full">
                <Link to={newsPath(a)} className={cn("group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.5)]", focus)}>
                  <span className="relative block aspect-[16/10] overflow-hidden">
                    <img src={a.image} alt={t(a.imageAlt)} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  </span>
                  <span className="flex flex-1 flex-col p-6">
                    <span className="flex items-center gap-2 text-base text-gray-600">
                      <CalendarDays className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
                      {fmt(a.date)}
                    </span>
                    <span className="mt-2 block text-xl font-bold leading-snug text-[#14261A] group-hover:text-[#117F21]">{a.title}</span>
                    <span className="mt-auto inline-flex items-center gap-2 pt-4 text-lg font-semibold text-[#117F21]">
                      {t("Read more")}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </Rise>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── We are here to help ─────────────────────────── */

export function TalkToUs() {
  const { t } = useI18n();
  const tel = headOffice.phone.replace(/\s/g, "");
  const ways = [
    { icon: Phone, title: "Call us", detail: headOffice.phone, href: `tel:${tel}` },
    { icon: Mail, title: "Email us", detail: headOffice.email, href: `mailto:${headOffice.email}` },
    { icon: Building2, title: "Visit an office", detail: "Head office in Abuja and offices in every zone", to: "/connect#zonal-offices" },
    { icon: MessageCircle, title: "Ask PenCom Assistant", detail: "Quick answers in plain language", chat: true },
  ];
  return (
    <section id="help" aria-labelledby="help-title" className="scroll-mt-32 px-4 pb-20">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#F1EFE8] p-6 sm:p-10 lg:p-14">
        <SectionHeading id="help-title" eyebrow="Help" title="We are here to help" highlight="help" center />
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ways.map((w, i) => {
            const inner = (
              <>
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:scale-110">
                  <w.icon className="h-8 w-8" aria-hidden="true" />
                </span>
                <span className="mt-4 block text-xl font-bold text-[#14261A]">{t(w.title)}</span>
                <span className="mt-1 block break-words text-lg text-gray-700">{t(w.detail)}</span>
              </>
            );
            const cls = cn("group flex h-full flex-col items-center rounded-3xl bg-white p-6 text-center ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-[#117F21]", focus);
            return (
              <li key={w.title}>
                <Rise delay={i * 0.06} className="h-full">
                  {w.chat ? (
                    <button type="button" onClick={openChat} className={cn(cls, "w-full")}>{inner}</button>
                  ) : w.to ? (
                    <Link to={w.to} className={cls}>{inner}</Link>
                  ) : (
                    <a href={w.href} className={cls}>{inner}</a>
                  )}
                </Rise>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
