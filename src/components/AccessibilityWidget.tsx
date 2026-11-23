"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  Type,
  Contrast,
  Moon,
  Sun,
  MousePointerClick,
  X,
} from "lucide-react";

interface AccessibilitySettings {
  fontSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  darkMode: boolean;
  largeCursor: boolean;
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: "normal",
    highContrast: false,
    darkMode: false,
    largeCursor: false,
  });

  const toggleFontSize = () => {
    setSettings((prev) => {
      const next =
        prev.fontSize === "normal"
          ? "large"
          : prev.fontSize === "large"
          ? "xlarge"
          : "normal";
      // Apply to document
      const root = document.documentElement;
      root.style.fontSize =
        next === "normal" ? "16px" : next === "large" ? "18px" : "20px";
      return { ...prev, fontSize: next };
    });
  };

  const toggleHighContrast = () => {
    setSettings((prev) => {
      const next = !prev.highContrast;
      const root = document.documentElement;
      if (next) {
        root.classList.add("high-contrast");
      } else {
        root.classList.remove("high-contrast");
      }
      return { ...prev, highContrast: next };
    });
  };

  const toggleDarkMode = () => {
    setSettings((prev) => {
      const next = !prev.darkMode;
      const root = document.documentElement;
      if (next) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      return { ...prev, darkMode: next };
    });
  };

  const toggleLargeCursor = () => {
    setSettings((prev) => {
      const next = !prev.largeCursor;
      const root = document.documentElement;
      if (next) {
        root.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23117F21%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>') 16 16, auto";
        root.classList.add("large-cursor");
      } else {
        root.style.cursor = "";
        root.classList.remove("large-cursor");
      }
      return { ...prev, largeCursor: next };
    });
  };

  const options = [
    {
      label: "Font Size",
      value:
        settings.fontSize === "normal"
          ? "Normal"
          : settings.fontSize === "large"
          ? "Large"
          : "Extra Large",
      icon: Type,
      action: toggleFontSize,
      active: settings.fontSize !== "normal",
    },
    {
      label: "High Contrast",
      value: settings.highContrast ? "On" : "Off",
      icon: Contrast,
      action: toggleHighContrast,
      active: settings.highContrast,
    },
    {
      label: "Dark Mode",
      value: settings.darkMode ? "On" : "Off",
      icon: settings.darkMode ? Sun : Moon,
      action: toggleDarkMode,
      active: settings.darkMode,
    },
    {
      label: "Large Cursor",
      value: settings.largeCursor ? "On" : "Off",
      icon: MousePointerClick,
      action: toggleLargeCursor,
      active: settings.largeCursor,
    },
  ];

  return (
    <>
      {/* High Contrast CSS */}
      <style>{`
        .high-contrast {
          filter: contrast(1.4) !important;
        }
        .high-contrast img {
          filter: contrast(1.2) !important;
        }
        .large-cursor * {
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23117F21' stroke-width='2'><circle cx='12' cy='12' r='10'/></svg>") 16 16, auto !important;
        }
      `}</style>

      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        type="button"
        aria-expanded={open}
        className="fixed bottom-[6.5rem] right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-2xl bg-[#11421A] text-[#F4D27A] shadow-[0_16px_36px_-14px_rgba(17,66,26,0.9)] ring-2 ring-white transition-colors hover:bg-[#105D1D] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D] sm:right-6 print:hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        aria-label="Accessibility options"
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Accessibility className="h-6 w-6" aria-hidden="true" />}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[11rem] right-4 z-[70] max-h-[calc(100svh-13rem)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-3xl border border-gray-200/80 bg-white text-[#164D20] shadow-[0_30px_70px_-20px_rgba(16,93,29,0.55)] sm:right-6"
          >
            <div className="flex items-center gap-3 bg-[#11421A] px-4 py-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"><Accessibility className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" /></span>
              <h3 className="text-lg font-bold">
                Accessibility Options
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={!!option.active}
                  onClick={option.action}
                  className={`flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D] ${
                    option.active
                      ? "bg-[#E8F5E9] text-[#105D1D]"
                      : "text-[#164D20] hover:bg-[#F7FAF6]"
                  }`}
                >
                  <option.icon
                    className={`w-4.5 h-4.5 shrink-0 ${
                      option.active ? "text-[#117F21]" : "text-gray-600"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <p className="text-base font-semibold">{option.label}</p>
                    <p
                      className={`text-sm ${
                        option.active ? "text-[#105D1D]" : "text-gray-600"
                      }`}
                    >
                      {option.value}
                    </p>
                  </div>
                  <div
                    aria-hidden="true"
                    className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                      option.active ? "bg-[#14892A]" : "bg-gray-400"
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-[left] ${
                        option.active ? "left-5" : "left-1"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 bg-[#F4F7F2] px-4 py-3 text-center">
              <p className="text-sm text-gray-600">
                PenCom Accessibility Widget v1.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
