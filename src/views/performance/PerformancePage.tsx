"use client";

import { useEffect, useState } from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";
import { ArrowDownUp, FileText, Layers, Percent, PieChart, TrendingUp, Users } from "lucide-react";
import { useLocation } from "@/lib/router";
import { scrollToId } from "@/views/about/primitives";
import { TabStrip, type NavSection } from "@/views/theme/ui";
import { AllocationSection, AssetsBar, AssetsSection, CompareSection, CoverageSection, FeesSection, FundsSection, MethodSection, PerfHero, type Range } from "./Sections";

const sections: NavSection[] = [
  { id: "assets", label: "Assets", icon: TrendingUp },
  { id: "allocation", label: "Investments", icon: PieChart },
  { id: "funds", label: "Fund types", icon: Layers },
  { id: "coverage", label: "Coverage", icon: Users },
  { id: "compare", label: "Compare PFAs", icon: ArrowDownUp },
  { id: "fees", label: "Fees", icon: Percent },
  { id: "method", label: "Methodology", icon: FileText },
];

/**
 * Industry performance, classic theme: a tool page (brief §7 "Data page (PFA performance and fees)": accessible
 * tables and charts, period selector, CSV/JSON download, methodology note; DES-29). The banner is the page's dark
 * band (industry figures); the floating bar holds the time period for the assets chart.
 * #rsa-summary (old link) lands on Coverage.
 */
export default function PerformancePage() {
  const { hash } = useLocation();
  const reduce = useReducedMotion();
  const [range, setRange] = useState<Range>("12 months");
  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const target = id === "rsa-summary" ? "coverage" : id;
    const t1 = window.setTimeout(() => scrollToId(target, !reduce), 80);
    const t2 = window.setTimeout(() => scrollToId(target, false), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hash, reduce]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#0A2E10]">
        <PerfHero />
        <AssetsBar range={range} setRange={setRange} />
        <TabStrip sections={sections} pillId="perf-nav-pill" />
        <AssetsSection range={range} />
        <AllocationSection />
        <FundsSection />
        <CoverageSection />
        <CompareSection />
        <FeesSection />
        <MethodSection />
      </div>
    </MotionConfig>
  );
}
