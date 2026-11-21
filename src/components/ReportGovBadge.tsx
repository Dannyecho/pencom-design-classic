"use client";

import { motion } from "framer-motion";

/** ReportGov.ng badge (the government's public reporting service). Opens in a new tab. */
export default function ReportGovBadge() {
  return (
    <motion.a
      href="https://reportgov.ng"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center rounded-lg bg-gradient-to-r from-[#B52026] to-[#C62828] px-3 text-white shadow-lg transition-shadow hover:shadow-xl focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      title="ReportGov.ng - Report Government Activities"
    >
      <span className="text-xs font-bold tracking-wide">reportgov</span>
      <span aria-hidden="true" className="ml-0.5 rounded-sm bg-[#117F21] px-1 py-0.5 text-[10px] font-bold text-white">
        .ng
      </span>
      <span className="sr-only">.ng (opens in a new tab)</span>
    </motion.a>
  );
}
