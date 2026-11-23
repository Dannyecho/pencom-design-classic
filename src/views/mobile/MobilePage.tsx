"use client";

import { useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { Accessibility, ArrowLeft, ArrowRight, Bot, ChevronRight, Info, Smartphone, UserRoundCheck, WifiOff } from "lucide-react";
import { operators } from "@/lib/data";
import { cn } from "@/lib/utils";
import { DarkBand, FloatingBar, PhotoBanner, Rise, Tile, ease, featured, focus, goldBtn, listPanel, listRow, outlineDarkBtn } from "@/views/theme/ui";
import { SectionHeading } from "@/views/theme/heading";
import { CountUp, GridBackdrop, Spotlight, Tilt } from "@/views/about/primitives";
import { journeys } from "@/views/services/data";
import { features, guides, publications, type ScreenName } from "./data";
import { Phone } from "./Phone";

/**
 * /mobile in the classic "national portal" look, as a tool page: photo banner (Ken Burns, word-rise title) → floating
 * card holding the feature picker as a segmented control with a sliding green pill → the phone (pointer spotlight) beside
 * the page's one featured card (tilts, grid, Previous/Next) and a list panel of what the app is built for → the one dark
 * band, with count-ups taken from the preview's own data. Screens: ./screens + ./Phone, tokens: ./skin.
 */

const builtFor: { title: string; body: string; icon: typeof Bot; screen: ScreenName }[] = [
  { title: "No sign-in", body: "Everything in the app is public. Open it and start reading, with no account and no password.", icon: UserRoundCheck, screen: "dashboard" },
  { title: "Saved for offline reading", body: "Download circulars and reports once, then read them where the network is weak.", icon: WifiOff, screen: "publications" },
  { title: "Answers show their source", body: "The assistant names the PenCom document each answer comes from.", icon: Bot, screen: "chat" },
  { title: "Text size, contrast and motion", body: "Make words bigger, raise the contrast or turn movement off.", icon: Accessibility, screen: "accessibility" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function MobilePage() {
  const reduce = useReducedMotion();
  const [screen, setScreen] = useState<ScreenName>("dashboard");
  const phoneRef = useRef<HTMLDivElement>(null);
  const at = Math.max(features.findIndex((f) => f.screen === screen), 0);
  const cur = features[at];
  const showPhone = () => phoneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const pick = (s: ScreenName) => {
    setScreen(s);
    if (window.matchMedia("(max-width: 1023px)").matches) showPhone();
  };

  const figures = [
    { value: String(features.length), label: "Features to try in this preview" },
    { value: String(journeys.length), label: "Services explained step by step" },
    { value: String(operators.length), label: "Administrators in the PFA directory" },
    { value: String(guides.length), label: "Step-by-step service guides" },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-white text-[#0A2E10]">
        <PhotoBanner
          id="mobile-title"
          crumbs={[{ label: "Home", to: "/" }, { label: "Mobile app" }]}
          chip={{ icon: Smartphone, label: "App preview" }}
          title="The PenCom app, in your pocket"
          mark="in your pocket"
          intro="A preview of the PenCom app for Android and iOS. Choose a feature below to see it on the phone, or tap around the phone itself."
          image="/images/opt/pencom-app-user-1200.webp"
          srcSet="/images/opt/pencom-app-user-640.webp 640w, /images/opt/pencom-app-user-1080.webp 1080w, /images/opt/pencom-app-user-1200.webp 1200w"
          position="center 30%"
        />

        <FloatingBar
          eyebrow="App preview"
          title="Choose a feature to try"
          intro={
            <p className="flex items-start gap-2">
              <Info className="mt-1 h-4 w-4 shrink-0 text-[#117F21]" aria-hidden="true" />
              This is a design preview. The app is open to everyone, with no sign-in. Updates shown in it are sample content.
            </p>
          }
        >
          <ul className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 ring-1 ring-gray-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {features.map((f) => {
              const on = screen === f.screen;
              return (
                <li key={f.screen} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-controls="app-screen"
                    onClick={() => pick(f.screen)}
                    className={cn("relative flex min-h-12 items-center gap-2 rounded-xl px-3.5 text-[15px] font-semibold transition-colors", on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#117F21]", focus)}
                  >
                    {on && <motion.span layoutId="classic-feature" transition={{ type: "spring", stiffness: 380, damping: 34 }} className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0A4A13] to-[#117F21] shadow-[0_10px_24px_-12px_rgba(17,127,33,0.8)]" />}
                    <f.icon className={cn("relative h-[18px] w-[18px]", on ? "text-[#F4D27A]" : "text-[#117F21]")} aria-hidden="true" />
                    <span className="relative whitespace-nowrap">{f.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </FloatingBar>

        <section aria-label="App preview" className="bg-gradient-to-b from-white via-[#F4F7F2] to-white px-4 py-14 sm:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-12">
            {/* the phone */}
            <div ref={phoneRef} className="scroll-mt-[110px] lg:col-span-5">
              <div className="relative mx-auto w-full max-w-[392px]">
                <div aria-hidden="true" className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[#117F21]/15 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 -right-10 -z-10 h-48 w-48 rounded-full bg-[#CB9615]/20 blur-3xl" />
                <motion.div initial={{ opacity: 0, y: reduce ? 0 : 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                  <Spotlight color="rgba(244,210,122,0.22)" size={360} className="rounded-[3.25rem] bg-[#04240A] p-2.5 shadow-[0_40px_80px_-40px_rgba(4,36,10,0.85)] ring-1 ring-[#CB9615]/30">
                    <Phone screen={screen} setScreen={setScreen} className="h-[calc(100svh-210px)] max-h-[760px] min-h-[600px] rounded-[2.6rem] bg-[#F4F7F2]" />
                  </Spotlight>
                </motion.div>
              </div>
            </div>

            {/* the featured card + list panel */}
            <div className="space-y-8 lg:col-span-7">
              <Tilt className="[transform-style:preserve-3d]">
                <div className={cn(featured, "bg-gradient-to-br from-[#04240A] via-[#0A4A13] to-[#117F21] p-6 sm:p-8")}>
                  <GridBackdrop />
                  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-[#CB9615]/25 blur-3xl" />
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#F4D27A]">
                    <span className="font-mono text-sm tracking-normal">{pad(at + 1)} / {pad(features.length)}</span>
                    <span aria-hidden="true" className="relative h-[3px] w-24 overflow-hidden rounded-full bg-white/15">
                      <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[#CB9615]" animate={{ width: `${((at + 1) / features.length) * 100}%` }} transition={{ duration: 0.5, ease }} />
                    </span>
                    Now on the phone
                  </p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={cur.screen} initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -10 }} transition={{ duration: 0.3, ease }} className="mt-6 flex items-start gap-4">
                      <Tile icon={cur.icon} dark size="lg" className="ring-1 ring-white/15" />
                      <div>
                        <h2 className="text-2xl font-bold sm:text-3xl">{cur.label}</h2>
                        <p className="mt-1.5 text-lg leading-relaxed text-white/85">{cur.desc}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button type="button" disabled={at === 0} onClick={() => setScreen(features[at - 1].screen)} className={cn(outlineDarkBtn, "disabled:cursor-not-allowed disabled:opacity-40")}>
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous
                    </button>
                    <button type="button" disabled={at === features.length - 1} onClick={() => setScreen(features[at + 1].screen)} className={cn(goldBtn, "disabled:cursor-not-allowed disabled:opacity-40")}>
                      Next feature <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </Tilt>

              <div>
                <SectionHeading
                  id="app-built-title"
                  eyebrow="Built for everyone"
                  title="Made for the way people really read"
                  highlight="really read"
                  intro="The app follows the same rules as the website: plain words, labelled buttons and nothing behind a login."
                  stacked
                />
                <Spotlight className="mt-6 rounded-3xl">
                  <ul className={listPanel}>
                    {builtFor.map((b) => {
                      const on = screen === b.screen;
                      return (
                        <li key={b.title}>
                          <button type="button" onClick={() => { setScreen(b.screen); showPhone(); }} className={cn(listRow, "relative w-full text-left", on && "bg-[#F7FAF6]")}>
                            {on && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[#117F21]" />}
                            <Tile icon={b.icon} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-lg font-bold text-[#0A2E10]">{b.title}</span>
                              <span className="block text-base leading-snug text-gray-600">{b.body}</span>
                            </span>
                            <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[#117F21] sm:inline-flex">
                              Show me <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </Spotlight>
              </div>
            </div>
          </div>
        </section>

        <DarkBand labelledBy="app-figures-title">
          <SectionHeading id="app-figures-title" eyebrow="In this preview" title="What the preview holds" highlight="preview holds" dark />
          <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {figures.map((f, i) => (
              <li key={f.label}>
                <Rise delay={i * 0.08} className="h-full">
                  <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                    <CountUp value={f.value} className="block text-5xl font-black tabular-nums text-[#F4D27A]" />
                    <motion.span aria-hidden="true" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease }} className="mt-4 block h-1 w-16 origin-left rounded-full bg-gradient-to-r from-[#CB9615] to-[#117F21]" />
                    <span className="mt-3 block text-base leading-snug text-white/85">{f.label}</span>
                  </div>
                </Rise>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-white/70">Counts come from the content in this preview. {publications.length} sample publications are in its library.</p>
        </DarkBand>
      </div>
    </MotionConfig>
  );
}
