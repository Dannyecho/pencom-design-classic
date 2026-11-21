"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Headphones, Mail, MapPin, MessageCircle, MessageSquareWarning, Phone, Search, Send } from "lucide-react";
import { useLocation, useNavigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/views/about/primitives";
import { openChat } from "@/views/home/SiteSearch";
import { goldBtn } from "@/views/resources/Library";
import { FramedPanel, PageHero, SectionNav, ease, focus } from "@/views/theme/ui";
import CaseForm from "./CaseForm";
import { Newsroom, Offices, Tracker } from "./Sections";
import { headOffice, offices, social, type TopicId } from "./data";

/**
 * Connect, calm theme (brief §6.2 Connect; templates "Complaint, enquiry and employer report forms",
 * "Case status tracker", "Utility pages: contact and zonal offices", "News and events").
 * Hero with the four things people come here to do → three-step form → case tracker → offices map → newsroom.
 * #report and #complaint open the form on the right topic.
 */

const sections = [
  { id: "contact", label: "Contact us" },
  { id: "track", label: "Track a case" },
  { id: "zonal-offices", label: "Offices" },
  { id: "news", label: "Newsroom" },
];

export default function ConnectPage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [topic, setTopic] = useState<TopicId>("enquiry");
  const [lastRef, setLastRef] = useState<string | null>(null);

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    if (id === "report") setTopic("employer");
    if (id === "complaint") setTopic("pfa");
    const target = id === "report" || id === "complaint" ? "contact" : id;
    const t1 = window.setTimeout(() => scrollToId(target, !reduce), 80);
    const t2 = window.setTimeout(() => scrollToId(target, false), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hash, reduce]);

  const go = (id: string, t?: TopicId) => {
    if (t) setTopic(t);
    navigate(`/connect#${id}`, { replace: true, preventScrollReset: true });
    scrollToId(id, !reduce);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#FBF8F1] text-[#14261A]">
        <Hero go={go} />
        <SectionNav sections={sections} pillId="connect-nav-pill" />
        <CaseForm topic={topic} setTopic={setTopic} onSubmitted={setLastRef} />
        <Tracker prefill={lastRef} />
        <Offices />
        <Newsroom />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */

const actions: { id: string; topic?: TopicId; icon: typeof Send; title: string; body: string }[] = [
  { id: "contact", topic: "enquiry", icon: Send, title: "Ask a question", body: "Send us an enquiry" },
  { id: "contact", topic: "pfa", icon: MessageSquareWarning, title: "Make a complaint", body: "About a PFA or PenCom" },
  { id: "contact", topic: "employer", icon: Building2, title: "Report an employer", body: "Pension not remitted" },
  { id: "track", icon: Search, title: "Track a case", body: "Use your case reference" },
];

const row = "group flex min-h-14 items-center gap-4 rounded-2xl p-3 transition hover:bg-[#E8F5E9]";
const tile = "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]";
const label = "block text-sm font-semibold uppercase tracking-[0.16em] text-[#7A5200]";

function Hero({ go }: { go: (id: string, topic?: TopicId) => void }) {
  const reduce = useReducedMotion();
  return (
    <PageHero
      id="connect-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Connect" }]}
      pill={{ icon: Headphones, label: "Contact and support" }}
      title="How can we help you?"
      mark="help you?"
      intro={`Ask a question, make a complaint, report an employer or track a case. Or visit us at our head office in Abuja or one of ${offices.length} zonal offices.`}
      actions={
        <ul className="grid max-w-xl grid-cols-1 gap-4 min-[420px]:grid-cols-2">
          {actions.map((a, i) => (
            <motion.li key={a.title} initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 + i * 0.07, ease }}>
              <button
                type="button"
                onClick={() => go(a.id, a.topic)}
                className={cn(
                  "group flex h-full w-full items-center gap-4 rounded-3xl bg-white p-4 text-left ring-1 min-[420px]:flex-col min-[420px]:gap-0 min-[420px]:p-5 min-[420px]:text-center ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]",
                  focus,
                )}
              >
                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:scale-110">
                  <a.icon className="h-7 w-7" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xl font-bold leading-snug text-[#14261A] min-[420px]:mt-3">{a.title}</span>
                  <span className="mt-1 block text-lg text-gray-700">{a.body}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      }
      aside={
        <FramedPanel>
          <div className="relative overflow-hidden border-b border-black/10 bg-[#E8F5E9] px-6 pb-6 pt-6 sm:px-7">
            <span aria-hidden="true" className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#CB9615]/20 blur-3xl" />
            <p className="relative text-sm font-bold uppercase tracking-[0.18em] text-[#0A4A13]">National Pension Commission</p>
            <p className="relative mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">Talk to us directly</p>
            <p className="relative mt-1 text-lg text-gray-700">Call, email or visit the head office in Abuja.</p>
          </div>
          <ul className="space-y-1 p-3 sm:p-4">
            <li>
              <a href={`tel:${headOffice.phone.replace(/\s/g, "")}`} className={cn(row, focus)}>
                <span aria-hidden="true" className={tile}><Phone className="h-6 w-6" /></span>
                <span className="min-w-0">
                  <span className={label}>Call</span>
                  <span className="block text-lg font-bold">{headOffice.phone}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${headOffice.email}`} className={cn(row, focus)}>
                <span aria-hidden="true" className={tile}><Mail className="h-6 w-6" /></span>
                <span className="min-w-0">
                  <span className={label}>Email</span>
                  <span className="block break-all text-lg font-bold">{headOffice.email}</span>
                </span>
              </a>
            </li>
            <li>
              <button type="button" onClick={() => go("zonal-offices")} className={cn(row, "w-full text-left", focus)}>
                <span aria-hidden="true" className={tile}><MapPin className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className={label}>Head office</span>
                  <span className="block text-lg font-semibold leading-snug">{headOffice.address}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-base font-semibold text-[#117F21] sm:hidden">All offices →</span>
                </span>
                <span className="hidden shrink-0 items-center gap-1 text-base font-semibold text-[#117F21] sm:inline-flex">
                  All offices →
                </span>
              </button>
            </li>
          </ul>
          <div className="border-t border-black/10 px-6 pb-6 pt-5 sm:px-7">
            <button type="button" onClick={openChat} className={cn(goldBtn, "w-full justify-between", focus)}>
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> Chat with PenCom Assistant
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <p className="mt-5 text-base text-gray-700">Follow our verified accounts</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {social.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-11 items-center rounded-full bg-white px-4 text-base font-semibold text-[#14261A] ring-1 ring-black/15 transition hover:bg-[#0A4A13] hover:text-white hover:ring-[#0A4A13]", focus)}>
                    {s.name}
                    <span className="sr-only"> {s.handle} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </FramedPanel>
      }
    />
  );
}
