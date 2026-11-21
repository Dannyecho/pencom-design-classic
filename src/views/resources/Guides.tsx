"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight, ArrowRight, Award, Check, ChevronLeft, ChevronRight, Clock, Headphones, MapPin,
  MessageSquareWarning, Minus, Plus, Printer, Square, Store, UserPlus, UserRoundCheck, type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./compat";
import { cn } from "@/lib/utils";
import { ease, focus, sectionCls } from "@/views/theme/ui";
import { SectionHeading } from "./compat";
import { guides, type Guide } from "./data";

const guideIcons: Record<string, LucideIcon> = {
  "user-plus": UserPlus,
  transfer: ArrowLeftRight,
  retiree: UserRoundCheck,
  certificate: Award,
  store: Store,
  complaint: MessageSquareWarning,
};

const textSizes = ["text-lg", "text-xl", "text-2xl"];

/** The calm card: white, thin ring; on hover it lifts 4 px, gets a green ring and a soft green shadow. */
const calmCard =
  "group relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]";
/** Large gold primary and green outline buttons. */
const goldBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-semibold text-[#1A1206] shadow-[0_14px_30px_-18px_rgba(122,82,0,0.8)] transition hover:bg-[#FFE08F]";
const outlineBtn =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white";

/** Dark-green icon tile with a gold icon that tips on card hover. */
function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A4A13] text-[#F4D27A] transition-transform duration-300 group-hover:rotate-[-6deg]", className)}>
      <Icon className="h-7 w-7" />
    </span>
  );
}

/** Printable checklist (DES-41): opens a plain page and prints it. */
function printGuide(g: Guide) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  w.document.write(`<!doctype html><html lang="en"><head><title>${esc(g.title)} – PenCom</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;max-width:680px;margin:32px auto;color:#111;line-height:1.5;font-size:16px}
  h1{font-family:Verdana,sans-serif;font-size:24px;margin:0 0 4px}h2{font-family:Verdana,sans-serif;font-size:17px;margin-top:28px;border-bottom:2px solid #117F21;padding-bottom:4px}
  .muted{color:#555}li{margin:8px 0}.box{display:inline-block;width:14px;height:14px;border:2px solid #111;margin-right:10px;vertical-align:-2px}
  ol li::marker{font-weight:bold}footer{margin-top:40px;font-size:12px;color:#555;border-top:1px solid #ccc;padding-top:8px}</style></head><body>
  <p class="muted">National Pension Commission · Guide</p><h1>${esc(g.title)}</h1><p>${esc(g.intro)}</p>
  <p><strong>Where:</strong> ${esc(g.where)} &nbsp; <strong>Time:</strong> ${esc(g.time)}</p>
  <h2>What you need</h2><ul style="list-style:none;padding:0">${g.needs.map((n) => `<li><span class="box"></span>${esc(n)}</li>`).join("")}</ul>
  <h2>Steps</h2><ol>${g.steps.map((s) => `<li><strong>${esc(s.title)}.</strong> ${esc(s.body)}</li>`).join("")}</ol>
  <footer>PenCom · 09-4611300 · www.pencom.gov.ng · Printed ${new Date().toLocaleDateString("en-GB")}</footer>
  <script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}

function GuideDialog({ guide, onClose }: { guide: Guide | null; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [size, setSize] = useState(0);
  const [have, setHave] = useState<boolean[]>([]);
  const [speaking, setSpeaking] = useState(false);
  // Read after mount: the server has no speech engine, so the Listen button appears only in the browser.
  const [canSpeak, setCanSpeak] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setCanSpeak("speechSynthesis" in window);
  }, []);

  useEffect(() => {
    setStep(0);
    setHave(guide ? guide.needs.map(() => false) : []);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setSpeaking(false);
    };
  }, [guide]);

  // Audio explanation (DES-41) using the browser's built-in speech: reads the whole guide aloud.
  const listen = () => {
    if (!guide || !canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = [guide.title, guide.intro, "What you need:", ...guide.needs, "Steps:", ...guide.steps.map((s, i) => `Step ${i + 1}. ${s.title}. ${s.body}`)].join(". ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-NG";
    u.rate = 0.95;
    const voice = synth.getVoices().find((v) => v.lang === "en-NG") ?? synth.getVoices().find((v) => v.lang.startsWith("en"));
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  const Icon = guide ? guideIcons[guide.icon] : UserPlus;
  const s = guide?.steps[step];
  const ready = have.filter(Boolean).length;

  return (
    <Dialog open={!!guide} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl sm:max-w-3xl">
        {guide && (
          <>
            <div className="relative isolate overflow-hidden border-b border-black/5 bg-[#FBF8F1] px-6 pb-7 pt-6 sm:px-9">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-[#E8F5E9] blur-2xl" />
              <div className="flex items-start gap-4">
                <IconTile icon={Icon} className="hidden sm:flex" />
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-bold uppercase tracking-[0.16em] text-[#0A4A13] ring-1 ring-[#117F21]/15">
                    <Icon className="h-4 w-4 sm:hidden" aria-hidden="true" />
                    Guide · {guide.audience}
                  </p>
                  <DialogTitle className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#14261A] sm:text-[2rem]">{guide.title}</DialogTitle>
                </div>
              </div>
              <DialogDescription className="mt-3 max-w-xl text-lg leading-relaxed text-gray-700">{guide.intro}</DialogDescription>
              <div className="mt-5 flex flex-wrap gap-2 text-base">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 ring-1 ring-black/10"><MapPin className="h-4 w-4 text-[#117F21]" aria-hidden="true" />{guide.where}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 ring-1 ring-black/10"><Clock className="h-4 w-4 text-[#117F21]" aria-hidden="true" />{guide.time}</span>
              </div>
              {/* Reading aids */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {canSpeak && (
                  <button type="button" onClick={listen} aria-pressed={speaking} className={cn(goldBtn, "min-h-12 px-5", focus)}>
                    {speaking ? <Square className="h-5 w-5 fill-current" aria-hidden="true" /> : <Headphones className="h-5 w-5" aria-hidden="true" />}
                    {speaking ? "Stop" : "Listen"}
                    {speaking && (
                      <span aria-hidden="true" className="flex h-4 items-end gap-0.5">
                        {[0, 1, 2].map((b) => (
                          <motion.span key={b} className="w-0.5 rounded-full bg-[#1A1206]" animate={reduce ? undefined : { height: ["30%", "100%", "30%"] }} transition={{ duration: 0.8, repeat: Infinity, delay: b * 0.15 }} style={{ height: "60%" }} />
                        ))}
                      </span>
                    )}
                  </button>
                )}
                <button type="button" onClick={() => printGuide(guide)} className={cn(outlineBtn, "min-h-12 px-5", focus)}>
                  <Printer className="h-5 w-5" aria-hidden="true" /> Print checklist
                </button>
                <div role="group" aria-label="Text size" className="inline-flex items-center gap-1 rounded-2xl bg-white p-0.5 ring-1 ring-black/15 sm:ml-auto">
                  <button type="button" onClick={() => setSize((x) => Math.max(0, x - 1))} disabled={size === 0} aria-label="Smaller text" className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-[#0A4A13] transition hover:bg-[#E8F5E9] disabled:opacity-40 disabled:hover:bg-transparent", focus)}><Minus className="h-5 w-5" aria-hidden="true" /></button>
                  <span className="px-1 text-lg font-semibold" aria-live="polite">Aa{size ? ` +${size}` : ""}</span>
                  <button type="button" onClick={() => setSize((x) => Math.min(2, x + 1))} disabled={size === 2} aria-label="Larger text" className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-[#0A4A13] transition hover:bg-[#E8F5E9] disabled:opacity-40 disabled:hover:bg-transparent", focus)}><Plus className="h-5 w-5" aria-hidden="true" /></button>
                </div>
              </div>
            </div>

            <div className={cn("grid grid-cols-1 gap-9 px-6 py-8 sm:px-9 md:grid-cols-[1fr_1.3fr]", textSizes[size])}>
              {/* Checklist */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#0A4A13]">What you need</h3>
                <ul className="mt-3 space-y-2">
                  {guide.needs.map((n, i) => (
                    <li key={n}>
                      <label className={cn("flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl p-3.5 ring-1 transition duration-300", have[i] ? "bg-[#E8F5E9] ring-[#117F21]/40" : "bg-white ring-black/10 hover:ring-[#117F21]/50")}>
                        <input type="checkbox" checked={!!have[i]} onChange={() => setHave((h) => h.map((v, j) => (j === i ? !v : v)))} className="peer sr-only" />
                        <span aria-hidden="true" className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-[#FFD84D]", have[i] ? "border-[#117F21] bg-[#117F21] text-white" : "border-gray-500 bg-white")}>
                          {have[i] && <Check className="h-4 w-4" strokeWidth={3.5} />}
                        </span>
                        <span className={cn("text-gray-800", have[i] && "text-gray-700 line-through decoration-[#117F21]/60")}>{n}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-2xl bg-[#F1EFE8] p-4">
                  <p className="text-base font-semibold text-[#14261A]" aria-live="polite">{ready} of {guide.needs.length} ready</p>
                  <span aria-hidden="true" className="mt-2 block h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-black/10">
                    <motion.span className="block h-full rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" initial={false} animate={{ width: `${guide.needs.length ? (ready / guide.needs.length) * 100 : 0}%` }} transition={{ duration: 0.45, ease }} />
                  </span>
                </div>
              </div>

              {/* Stepper: steps as gold number tiles */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#0A4A13]">Steps</h3>
                <ol className="relative mt-3 flex items-center justify-between gap-2" aria-label="Progress">
                  <span aria-hidden="true" className="absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[#E3E0D6]" />
                  <motion.span aria-hidden="true" className="absolute left-6 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" initial={false} animate={{ width: guide.steps.length > 1 ? `calc((100% - 3rem) * ${step / (guide.steps.length - 1)})` : 0 }} transition={{ duration: 0.45, ease }} />
                  {guide.steps.map((st, i) => (
                    <li key={st.title} className="relative">
                      <button
                        type="button"
                        onClick={() => setStep(i)}
                        aria-current={i === step ? "step" : undefined}
                        aria-label={`Step ${i + 1}: ${st.title}`}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold tabular-nums transition duration-300",
                          i === step
                            ? "scale-110 bg-[#F4D27A] text-[#1A1206] shadow-[0_12px_24px_-12px_rgba(122,82,0,0.8)]"
                            : i < step
                              ? "bg-[#0A4A13] text-[#F4D27A] hover:bg-[#117F21]"
                              : "bg-white text-[#0A4A13] ring-1 ring-black/15 hover:ring-2 hover:ring-[#117F21]",
                          focus,
                        )}
                      >
                        {i < step ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> : i + 1}
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="relative mt-6 min-h-[11rem]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={step} initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -10 }} transition={{ duration: 0.25, ease }}>
                      <p className="text-base font-semibold tabular-nums text-[#7A5200]">Step {step + 1} of {guide.steps.length}</p>
                      <p className="mt-1 text-[1.35em] font-bold leading-snug tracking-tight text-[#14261A]">{s?.title}</p>
                      <p className="mt-2 leading-relaxed text-gray-700">{s?.body}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0} className={cn(outlineBtn, "px-5 disabled:pointer-events-none disabled:opacity-40", focus)}>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Back
                  </button>
                  {step < guide.steps.length - 1 ? (
                    <button type="button" onClick={() => setStep((x) => x + 1)} className={cn(goldBtn, focus)}>
                      Next step
                      <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </button>
                  ) : (
                    <Link to={guide.link.href} onClick={onClose} className={cn(goldBtn, focus)}>
                      {guide.link.label}
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Guides({ openId, setOpenId }: { openId: string | null; setOpenId: (id: string | null) => void }) {
  const guide = guides.find((g) => g.id === openId) ?? null;
  return (
    <section id="guides" aria-labelledby="guides-title" className={cn(sectionCls, "bg-white")}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="guides-title"
          eyebrow="Step-by-step guides"
          title="Get things done, one step at a time"
          highlight="one step at a time"
          intro="Each guide tells you who it’s for, what to bring and where to go. Listen to it, make the text bigger, or print a checklist."
        />
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g, i) => {
            const Icon = guideIcons[g.icon];
            return (
              <motion.li key={g.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, delay: (i % 3) * 0.08, ease }}>
                <button type="button" onClick={() => setOpenId(g.id)} className={cn(calmCard, "flex h-full w-full flex-col p-6 text-left sm:p-7", focus)}>
                  <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E8F5E9] transition-transform duration-500 group-hover:scale-150" />
                  <span className="relative flex items-start justify-between gap-3">
                    <IconTile icon={Icon} />
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold uppercase tracking-[0.14em] text-[#0A4A13] ring-1 ring-[#117F21]/20">{g.audience}</span>
                  </span>
                  <span className="relative mt-6 block text-xl font-bold leading-snug tracking-tight text-[#14261A]">{g.title}</span>
                  <span className="relative mt-2 block text-lg leading-relaxed text-gray-700">{g.intro}</span>
                  <span className="relative mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-5 text-base">
                    <span className="flex items-center gap-3 text-gray-700">
                      <span className="tabular-nums">{g.steps.length} steps</span>
                      <span aria-hidden="true" className="text-[#CB9615]">·</span>
                      <span className="inline-flex items-center gap-1.5"><Headphones className="h-4 w-4 text-[#117F21]" aria-hidden="true" /> Listen</span>
                    </span>
                    <span className="inline-flex items-center gap-2 text-lg font-semibold text-[#0A4A13]">
                      Open
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
      <GuideDialog guide={guide} onClose={() => setOpenId(null)} />
    </section>
  );
}
