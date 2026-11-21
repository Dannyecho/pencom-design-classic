"use client";

import { useCallback, useEffect, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Landmark } from "lucide-react";
import { useLocation } from "@/lib/router";
import { cn } from "@/lib/utils";
import { CountUp, scrollToId } from "@/views/about/primitives";
import { PageHero, SectionNav, focus } from "@/views/theme/ui";
import { heroStats } from "./data";
import { Charter, History, Leadership, MissionValues, Overview, ProfileDialog, Structure } from "./sections";

/**
 * About PenCom, calm theme. Same language as the calm home page: a light hero on cream with an arch-framed
 * photo, calm section titles, white cards with the calm hover, and one dark-green inset panel (mission). Sections: overview and mandate → mission,
 * vision and values → history → structure → leadership → Service Charter and visiting us.
 * Menu anchors from the header and footer (#mission, #executive, #structure, #stakeholders, #why-us,
 * #dg-corner, #board, #signing, #charter, #history) all land on the right section.
 */

const onThisPage = [
  { id: "overview", label: "Overview" },
  { id: "mission", label: "Mission and values" },
  { id: "history", label: "Our history" },
  { id: "structure", label: "Structure" },
  { id: "executive", label: "Leadership" },
  { id: "charter", label: "Service Charter" },
];

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
      <div className="bg-[#FBF8F1] text-[#14261A]">
        <Hero />
        <SectionNav sections={onThisPage} pillId="about-nav-pill" />
        <Overview />
        <MissionValues />
        <History />
        <Structure onSelect={setProfile} />
        <Leadership onSelect={setProfile} />
        <Charter />
        <ProfileDialog id={profile} onClose={closeProfile} />
      </div>
    </MotionConfig>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */

/**
 * The calm light hero: crumbs, eyebrow pill, bold title with the drawn underline, 18 px intro, two large
 * labelled actions. Beside it the boardroom photo in an arch frame with a gold outline and a slow Ken Burns
 * zoom, and a white figures card overlapping its foot (the page's one count-up). No text over the photo.
 */
function Hero() {
  const reduce = useReducedMotion();
  return (
    <PageHero
      id="about-title"
      crumbs={[{ label: "Home", to: "/" }, { label: "About PenCom" }]}
      pill={{ icon: Landmark, label: "About the Commission" }}
      title="Keeping every Nigerian’s retirement safe"
      mark="retirement safe"
      intro="The National Pension Commission licenses and supervises every pension operator in Nigeria, so that what workers save is invested safely and paid when they retire. Established in 2004, we now work under the Pension Reform Act 2014."
      actions={
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => scrollToId("history", !reduce)}
            className={cn("group inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F]", focus)}
          >
            Explore our history
            <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-1" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollToId("structure", !reduce)}
            className={cn(
              "group inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-[#117F21] px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white",
              focus,
            )}
          >
            How we are organised
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      }
      aside={
        <div className="relative mx-auto max-w-xl px-3 pt-3">
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-3 rounded-t-[999px] rounded-b-[2rem] border-2 border-[#CB9615]/45" />
            <div className="relative aspect-[5/4] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-[#E8F5E9]">
              <motion.img
                src="/images/site/board-meeting-1920.webp"
                srcSet="/images/site/board-meeting-960.webp 960w, /images/site/board-meeting-1920.webp 1920w"
                sizes="(min-width: 1024px) 40vw, 100vw"
                alt="Colleagues reviewing figures around a boardroom table"
                fetchPriority="high"
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="relative mx-1 -mt-14 rounded-3xl bg-white p-4 shadow-[0_30px_60px_-30px_rgba(10,74,19,0.55)] ring-1 ring-black/10 sm:mx-8 sm:p-5">
            <p className="inline-flex items-center rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-bold uppercase tracking-[0.14em] text-[#0A4A13]">Since 2004</p>
            <dl className="mt-3 grid grid-cols-3 divide-x divide-black/10">
              {heroStats.map((s) => (
                <div key={s.label} className="px-2 first:pl-0 last:pr-0 sm:px-4">
                  <dt className="text-base font-semibold leading-snug text-gray-700">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight text-[#14261A] sm:text-3xl">
                    <CountUp value={s.value} />
                  </dd>
                  <dd className="text-sm text-gray-600 sm:text-base">{s.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      }
    />
  );
}
