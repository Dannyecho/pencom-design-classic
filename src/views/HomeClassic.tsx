"use client";

import { useEffect } from "react";
import { useLocation } from "@/lib/router";
import { MotionConfig, useReducedMotion } from "framer-motion";
import CookieConsent from "@/components/CookieConsent";
import PromoPopup from "@/components/PromoPopup";
import { scrollToId } from "./about/primitives";
import { SectionNav } from "./theme/ui";
import HomeHero from "./homeclassic/HomeHero";
import AudienceTasks from "./homeclassic/AudienceTasks";
import { IndustryFigures, Updates } from "./homeclassic/Figures";
import { Portals, ServicesGrid } from "./homeclassic/Services";
import { HelpFaq, NewsMedia } from "./homeclassic/Stories";

export const homeSections = [
  { id: "start", label: "I am a…" },
  { id: "notices", label: "Notices" },
  { id: "services", label: "Services" },
  { id: "portals", label: "Online services" },
  { id: "news", label: "News" },
  { id: "figures", label: "Figures" },
  { id: "help", label: "Help" },
];

/**
 * Home, classic design: the national portal. Order follows the stakeholder answer to DES-19:
 * full-width slider + search → section bar → "I am a…" tasks → notices and latest regulations → services →
 * online portals → news and video → industry figures (the page's dark band) → FAQs and help → prototype links.
 * The h1 ("National Pension Commission") is visually hidden inside the slider.
 */
export default function HomeClassic() {
  const { hash } = useLocation();
  const reduce = useReducedMotion();

  // In-page links (/#services, /#help …) from the section bar, menus and footer. #chat opens the assistant.
  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id || id === "chat") return;
    const a = window.setTimeout(() => scrollToId(id, !reduce), 80);
    const b = window.setTimeout(() => scrollToId(id, false), 900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [hash, reduce]);

  return (
    <MotionConfig reducedMotion="user">
      <CookieConsent />
      <PromoPopup />
      <div className="bg-white text-[#164D20]">
        <HomeHero />
        <SectionNav sections={homeSections} pillId="home-nav-pill" />
        <AudienceTasks />
        <Updates />
        <ServicesGrid />
        <Portals />
        <NewsMedia />
        <IndustryFigures />
        <HelpFaq />
      </div>
    </MotionConfig>
  );
}
