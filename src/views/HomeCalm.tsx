"use client";

import { useEffect } from "react";
import { useLocation } from "@/lib/router";
import { MotionConfig, useReducedMotion } from "framer-motion";
import CookieConsent from "@/components/CookieConsent";
import PromoPopup from "@/components/PromoPopup";
import { scrollToId } from "./about/primitives";
import Showcase from "./homecalm/Showcase";
import { ImportantNotices, LatestNews, RetireeSteps, TalkToUs, TopTasks, WelcomeBar } from "./homecalm/Sections";

/**
 * Home, second design: built first for older readers and retirees (DES-41).
 * Larger type (18px+ body), strong contrast, plain words, one idea per section, big labelled controls,
 * text on solid panels rather than over photos, a text-size control and "Listen" on the slider.
 * Order: welcome + text size → showcase slider → six top tasks + search → retiring in three steps →
 * important notices → latest news → ways to reach us. In the calm theme it is the homepage (/).
 */
export default function HomeCalm() {
  const { hash } = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id || id === "chat") return;
    const t = window.setTimeout(() => scrollToId(id, !reduce), 80);
    return () => window.clearTimeout(t);
  }, [hash, reduce]);

  return (
    <MotionConfig reducedMotion="user">
      <CookieConsent />
      <PromoPopup />
      <div className="bg-[#FBF8F1] text-[#14261A]">
        <WelcomeBar />
        <Showcase />
        <TopTasks />
        <RetireeSteps />
        <ImportantNotices />
        <LatestNews />
        <TalkToUs />
      </div>
    </MotionConfig>
  );
}
