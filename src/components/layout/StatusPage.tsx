import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight, Download, FileText, HelpCircle, LayoutGrid, Mail, MessageCircle, Users, type LucideIcon } from "lucide-react";

/**
 * Server-only frame for the 404 and the "being redesigned" placeholder, in the classic portal look: a dark #04240A
 * grid banner (chip, h1, gold bar, lead, gold and outline buttons) and a white card that floats over its lower edge
 * with a list panel of the most used pages. CSS only, no motion, no client JavaScript.
 */
const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

const links: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Pension services", href: "/services", icon: LayoutGrid },
  { label: "Find a PFA", href: "/operators#pfas", icon: Users },
  { label: "FAQs", href: "/resources/faq", icon: HelpCircle },
  { label: "Download forms", href: "/resources#downloads", icon: Download },
  { label: "Regulations", href: "/regulations", icon: FileText },
  { label: "Contact Us", href: "/connect", icon: Mail },
];

export default function StatusPage({ chip, chipIcon: ChipIcon, title, lead, homeLabel }: { chip: string; chipIcon: LucideIcon; title: ReactNode; lead: ReactNode; homeLabel: string }) {
  return (
    <div className="bg-white pb-20">
      <section className="relative isolate overflow-hidden bg-[#04240A] px-4 pb-32 pt-16 text-white sm:pb-36 sm:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#117F21]/40 blur-[160px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-[#CB9615]/15 blur-[140px]" />
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A]">
            <ChipIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {chip}
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
          <span aria-hidden="true" className="mx-auto mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{lead}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#CB9615] px-6 font-semibold text-[#1A1206] shadow-[0_14px_30px_-16px_rgba(203,150,21,0.9)] transition hover:bg-[#E0AA22] ${focus}`}>
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              {homeLabel}
            </Link>
            <Link href="/#chat" className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 font-semibold text-white transition hover:border-[#F4D27A] hover:text-[#F4D27A] ${focus}`}>
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Ask PenCom Assistant
            </Link>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-20 max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-[0_30px_60px_-30px_rgba(10,74,19,0.5)] sm:p-7">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#117F21] via-[#CB9615] to-[#117F21]" />
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0A4A13]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#117F21]" />
            Quick links
          </h2>
          <ul className="mt-4 grid overflow-hidden rounded-2xl border border-gray-200/80 sm:grid-cols-2 [&>li]:border-gray-100 [&>li:not(:last-child)]:border-b sm:[&>li:nth-last-child(2)]:border-b-0 sm:[&>li:nth-child(odd)]:border-r">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex min-h-14 items-center gap-3 px-4 py-3 text-[15px] font-semibold text-[#0A2E10] transition hover:bg-[#F7FAF6] hover:text-[#117F21] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]"
                >
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#117F21] transition group-hover:bg-[#117F21] group-hover:text-white">
                    <l.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">{l.label}</span>
                  <ChevronRight className="h-4 w-4 text-[#117F21] opacity-40 transition group-hover:opacity-100" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
