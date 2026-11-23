"use client";

import { useCallback, useEffect, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, History as HistoryIcon, Landmark, Network, ScrollText, Target, Users } from "lucide-react";
import { useLocation } from "@/lib/router";
import { cn } from "@/lib/utils";
import { CountUp, scrollToId } from "@/views/about/primitives";
import { FloatingBar, PhotoBanner, PortalLayout, goldBtn, outlineDarkBtn, type NavSection } from "@/views/theme/ui";
import { heroStats } from "./data";
import { Charter, History, Leadership, MissionValues, Overview, ProfileDialog, Structure } from "./sections";

/**
 * About PenCom, classic theme (a portal page): the Abuja photo banner with a word-rise title, a floating strip of
 * quick facts, then the sticky SideNav beside overview and mandate → mission, vision and values → structure →
 * the leadership directory; history (the page's dark band, a year rail on desktop) and the Service Charter (closing strip) follow full width.
 * Menu anchors from the header and footer (#mission, #executive, #structure, #stakeholders, #why-us,
 * #dg-corner, #board, #signing, #charter, #history) all land on the right section.
 */

const onThisPage: NavSection[] = [
  { id: "overview", label: "Overview", icon: Landmark },
  { id: "mission", label: "Mission and values", icon: Target },
  { id: "structure", label: "Structure", icon: Network },
  { id: "executive", label: "Leadership", icon: Users },
  { id: "history", label: "Our history", icon: HistoryIcon },
  { id: "charter", label: "Service Charter", icon: ScrollText },
];

const related = [
  { to: "/about/service-charter", label: "Service Charter" },
  { to: "/regulations", label: "Regulations" },
  { to: "/connect", label: "Contact us" },
];

/** The four quick facts in the floating strip: the three key figures plus the year the Commission was set up. */
const facts = [...heroStats, { value: "2004", label: "Established", note: "Pension Reform Act 2004" }];

export default function AboutPage() {
  const { hash } = useLocation();
  const reduce = useReducedMotion();
  const [profile, setProfile] = useState<string | null>(null);
  const closeProfile = useCallback(() => setProfile(null), []);

  // Deep links (/about#mission …): scroll once the page has laid out, then correct after images settle.
  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const t1 = window.setTimeout(() => scrollToId(id, !reduce), 80);
    const t2 = window.setTimeout(() => scrollToId(id, false), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hash, reduce]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#164D20]">
        <Banner />
        <QuickFacts />
        <PortalLayout sections={onThisPage} pillId="about-side-pill" related={related}>
          <Overview />
          <MissionValues />
          <Structure onSelect={setProfile} />
          <Leadership onSelect={setProfile} />
        </PortalLayout>
        <History />
        <Charter />
        <ProfileDialog id={profile} onClose={closeProfile} />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Banner + quick facts ─────────────────────────── */

/** Abuja at dusk behind a dark shade; the title rises word by word and "retirement safe" gets the gold drawn line. */
function Banner() {
  const reduce = useReducedMotion();
  return (
    <PhotoBanner
      id="about-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "About PenCom" }]}
      chip={{ icon: Landmark, label: "About the Commission" }}
      title="Keeping every Nigerian’s retirement safe"
      mark="retirement safe"
      intro="The National Pension Commission licenses and supervises every pension operator in Nigeria, so that what workers save is invested safely and paid when they retire. Established in 2004, we now work under the Pension Reform Act 2014."
      image="/images/site/abuja-dusk-1920.webp"
      srcSet="/images/site/abuja-dusk-480.webp 480w, /images/site/abuja-dusk-960.webp 960w, /images/site/abuja-dusk-1920.webp 1920w"
      position="center 60%"
      actions={
        <>
          <button type="button" onClick={() => scrollToId("history", !reduce)} className={cn(goldBtn, "group")}>
            Explore our history
            <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scrollToId("structure", !reduce)} className={cn(outlineDarkBtn, "group")}>
            How we are organised
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </>
      }
    />
  );
}

/** Floating `gap-px` strip of four figures that count up once, each with a gold edge that grows on hover. */
function QuickFacts() {
  return (
    <FloatingBar eyebrow="Since 2004">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 lg:grid-cols-4">
        {facts.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 + i * 0.08 }}
            className="group relative flex flex-col bg-white p-4 transition-colors hover:bg-[#F7FAF6] sm:p-6"
          >
            <span aria-hidden="true" className="absolute left-0 top-5 h-8 w-1 rounded-r bg-gradient-to-b from-[#CB9615] to-[#CB9615]/0 transition-all duration-500 group-hover:h-14 sm:top-6" />
            <dt className="order-2 mt-1 text-sm font-semibold text-gray-700 sm:text-base">{s.label}</dt>
            <dd className="order-1 text-2xl font-bold tracking-tight text-[#164D20] tabular-nums sm:text-4xl">
              {/^\d{4}$/.test(s.value) ? s.value : <CountUp value={s.value} />}
            </dd>
            <dd className="order-3 mt-0.5 text-xs text-gray-600 sm:text-sm">{s.note}</dd>
          </motion.div>
        ))}
      </dl>
    </FloatingBar>
  );
}
