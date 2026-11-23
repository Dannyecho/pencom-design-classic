"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Building2,
  Headphones,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareWarning,
  Newspaper,
  Phone,
  ScrollText,
  Search,
  Send,
} from "lucide-react";
import { useLocation, useNavigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight, Tilt, scrollToId } from "@/views/about/primitives";
import { openChat } from "@/views/home/SiteSearch";
import {
  ClosingLinks,
  FloatingBar,
  PhotoBanner,
  PortalLayout,
  Tile,
  ease,
  featured,
  focus,
  goldBtn,
  outlineDarkBtn,
  type NavSection,
} from "@/views/theme/ui";
import CaseForm from "./CaseForm";
import { Newsroom, Offices, Tracker } from "./Sections";
import { headOffice, offices, social, type TopicId } from "./data";

/**
 * Connect, classic theme (a portal page; brief §6.2 Connect; templates "Complaint, enquiry and employer report
 * forms", "Case status tracker", "Utility pages: contact and zonal offices", "News and events").
 * Photo banner → a floating bar with the four things people come here to do and a dark "Talk to us directly" card
 * (call, email, head office, chat, social) → SideNav beside the three-step form, the offices map and the newsroom →
 * the case tracker as the page's dark band → closing link cards.
 * #report and #complaint open the form on the right topic; #track, #zonal-offices and #news scroll to their section.
 */

const sections: NavSection[] = [
  { id: "contact", label: "Contact us", icon: Send },
  { id: "zonal-offices", label: "Offices", icon: MapPin },
  { id: "news", label: "Newsroom", icon: Newspaper },
  { id: "track", label: "Track a case", icon: Search },
];

const related = [
  { to: "/services", label: "Services" },
  { to: "/about/service-charter", label: "Service Charter" },
  { to: "/resources/faq", label: "Read the FAQ" },
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
      <div className="bg-white text-[#164D20]">
        <Banner go={go} />
        <ContactBar go={go} />
        <PortalLayout sections={sections} pillId="connect-side-pill" related={related}>
          <CaseForm topic={topic} setTopic={setTopic} onSubmitted={setLastRef} />
          <Offices />
          <Newsroom />
        </PortalLayout>
        <Tracker prefill={lastRef} />
        <ClosingLinks
          items={[
            { to: "/services", icon: LayoutGrid, title: "Services", body: "All pension services" },
            { to: "/about/service-charter", icon: ScrollText, title: "Service Charter", body: "Read the charter", tone: "gold" },
            { to: "/resources", icon: BookOpen, title: "Resources", body: "Publications, forms, FAQ" },
          ]}
        />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Banner ─────────────────────────── */

function Banner({ go }: { go: (id: string, topic?: TopicId) => void }) {
  return (
    <PhotoBanner
      id="connect-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "Connect" }]}
      chip={{ icon: Headphones, label: "Contact and support" }}
      title="How can we help you?"
      mark="help you?"
      intro={`Ask a question, make a complaint, report an employer or track a case. Or visit us at our head office in Abuja or one of ${offices.length} zonal offices.`}
      image="/images/site/elder-woman-call-1920.webp"
      srcSet="/images/site/elder-woman-call-480.webp 480w, /images/site/elder-woman-call-960.webp 960w, /images/site/elder-woman-call-1920.webp 1920w"
      position="70% 30%"
      actions={
        <>
          <button type="button" onClick={() => go("track")} className={cn(goldBtn, "group")}>
            <Search className="h-5 w-5" aria-hidden="true" />
            Track a case
          </button>
          <button type="button" onClick={() => go("zonal-offices")} className={cn(outlineDarkBtn, "group")}>
            Find your nearest office
            <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </button>
        </>
      }
    />
  );
}

/* ─────────────────────────── Floating bar: tasks + direct contact ─────────────────────────── */

const actions: { id: string; topic?: TopicId; icon: typeof Send; title: string; body: string }[] = [
  { id: "contact", topic: "enquiry", icon: Send, title: "Ask a question", body: "Send us an enquiry" },
  { id: "contact", topic: "pfa", icon: MessageSquareWarning, title: "Make a complaint", body: "About a PFA or PenCom" },
  { id: "contact", topic: "employer", icon: Building2, title: "Report an employer", body: "Pension not remitted" },
  { id: "track", icon: Search, title: "Track a case", body: "Use your case reference" },
];

const darkRow = "group flex min-h-14 w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/10";
const darkTile = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#F4D27A] ring-1 ring-white/15 transition duration-300 group-hover:bg-[#CB9615] group-hover:text-[#1A1206]";
const darkLabel = "block text-xs font-bold uppercase tracking-[0.16em] text-[#F4D27A]";

function ContactBar({ go }: { go: (id: string, topic?: TopicId) => void }) {
  const reduce = useReducedMotion();
  return (
    <FloatingBar className="p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* The four things people come here to do */}
        <Spotlight className="rounded-2xl xl:col-span-7">
          <ul className="grid h-full grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 min-[480px]:grid-cols-2">
            {actions.map((a, i) => (
              <motion.li
                key={a.title}
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 + i * 0.07, ease }}
                className="bg-white/95"
              >
                <button
                  type="button"
                  onClick={() => go(a.id, a.topic)}
                  className={cn(
                    "group relative flex h-full min-h-24 w-full items-center gap-4 p-5 text-left transition hover:bg-[#F7FAF6]/80 min-[480px]:flex-col min-[480px]:items-start min-[480px]:justify-between sm:p-6",
                    focus,
                    "focus-visible:-outline-offset-[3px]",
                  )}
                >
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#14892A] to-[#CB9615] transition-transform duration-500 group-hover:scale-x-100" />
                  <span className="flex w-full min-w-0 flex-1 items-center gap-4 min-[480px]:flex-none min-[480px]:flex-col min-[480px]:items-start">
                    <Tile icon={a.icon} dark size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-bold leading-snug text-[#164D20] group-hover:text-[#117F21] xl:text-xl">{a.title}</span>
                      <span className="mt-0.5 block text-base text-gray-600">{a.body}</span>
                    </span>
                  </span>
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition group-hover:border-[#14892A] group-hover:bg-[#14892A] group-hover:text-white min-[480px]:mt-5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </Spotlight>

        {/* Talk to us directly: the page's featured card */}
        <Tilt className="xl:col-span-5" max={4}>
          <div className={cn(featured, "h-full p-5 sm:p-6")}>
            <GridBackdrop />
            <span aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#CB9615]/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">National Pension Commission</p>
              <p className="mt-1.5 text-2xl font-bold leading-tight">Talk to us directly</p>
              <p className="mt-1 text-base text-white/85">Call, email or visit the head office in Abuja.</p>
            </div>
            <ul className="relative mt-4 space-y-1">
              <li>
                <a href={`tel:${headOffice.phone.replace(/\s/g, "")}`} className={cn(darkRow, focus)}>
                  <span aria-hidden="true" className={darkTile}><Phone className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className={darkLabel}>Call</span>
                    <span className="block text-lg font-bold">{headOffice.phone}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${headOffice.email}`} className={cn(darkRow, focus)}>
                  <span aria-hidden="true" className={darkTile}><Mail className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className={darkLabel}>Email</span>
                    <span className="block break-all text-lg font-bold">{headOffice.email}</span>
                  </span>
                </a>
              </li>
              <li>
                <button type="button" onClick={() => go("zonal-offices")} className={cn(darkRow, focus)}>
                  <span aria-hidden="true" className={darkTile}><MapPin className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className={darkLabel}>Head office</span>
                    <span className="block text-base font-semibold leading-snug">{headOffice.address}</span>
                    <span className="mt-0.5 block text-sm font-semibold text-[#F4D27A]">All offices →</span>
                  </span>
                </button>
              </li>
            </ul>
            <div className="relative mt-4 border-t border-white/10 pt-4">
              <button type="button" onClick={openChat} className={cn(goldBtn, "group w-full justify-between")}>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" /> Chat with PenCom Assistant
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </button>
              <p className="mt-4 text-sm text-white/85">Follow our verified accounts</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {social.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn("inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-[#F4D27A] hover:text-[#F4D27A]", focus)}
                    >
                      {s.name}
                      <span className="sr-only"> {s.handle} (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Tilt>
      </div>
    </FloatingBar>
  );
}
