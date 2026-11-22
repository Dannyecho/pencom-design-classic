"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Copy, Landmark, Lock, MessageSquareWarning, Paperclip, Send, ShieldCheck, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/views/about/primitives";
import { Tile, ease, focus, goldBtn, outlineBtn } from "@/views/theme/ui";
import { SectionHeading } from "@/views/theme/heading";
import { operators } from "@/views/operators/data";
import { topics, type TopicId } from "./data";

/**
 * Complaint, enquiry and employer report form (brief §7: minimal fields, consent, file upload, inline errors,
 * error summary at the top, confirmation with a case reference). Front-end only in this prototype: the case is
 * kept in this browser so the tracker below can find it.
 *
 * Classic look: the first section of the portal grid (~926 px column). Split heading row, then the three
 * reassurances as a `gap-px` strip of mint tiles, then the form in a white card with a gold hairline. Its header is a
 * `#F4F7F2` strip holding a segmented step bar (green gradient `layoutId` pill, gold number on the current step, green
 * check on finished ones) over a green→gold track that grows with the steps. Topic cards are classic cards with a
 * pointer spotlight; the chosen one gets a green ring and a filled tile. Inputs are 48 px at 16 px. The review is a
 * list panel; the confirmation is a status card with a green bar. The tracker band below is the page's dark section.
 * Steps swap on `y` (never `x`); when the step changes, focus moves to the new step's heading (and to the
 * confirmation after sending).
 */

type Values = { name: string; email: string; phone: string; pin: string; pfa: string; employer: string; employerAddress: string; months: string; message: string; consent: boolean };
const empty: Values = { name: "", email: "", phone: "", pin: "", pfa: "", employer: "", employerAddress: "", months: "", message: "", consent: false };

export type SavedCase = { ref: string; topic: TopicId; date: string };
export const CASES_KEY = "pencom:cases";
export function loadCases(): SavedCase[] {
  try {
    return JSON.parse(localStorage.getItem(CASES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

const response: Record<TopicId, string> = {
  enquiry: "We aim to reply within 48 hours.",
  pfa: "We aim to resolve complaints within 14 working days.",
  employer: "We will review your report and follow it up with the employer.",
  pencom: "We aim to resolve complaints within 14 working days.",
};

/** Same icons as the hero's action cards on this page. */
const topicIcon: Record<TopicId, LucideIcon> = { enquiry: Send, pfa: MessageSquareWarning, employer: Building2, pencom: Landmark };

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-semibold text-[#0A2E10]">{label}</label>
      {hint && <p id={`${id}-hint`} className="mt-0.5 text-sm text-gray-600">{hint}</p>}
      <div className="mt-2">{children}</div>
      <AnimatePresence>
        {error && (
          <motion.p id={`${id}-error`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 flex items-start gap-2 text-base font-semibold text-[#B52026]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Input edge #7D8A80 is 3.6:1 on white (WCAG 1.4.11); focus turns it green with a soft green halo. */
const inputCls = (err?: string) =>
  cn(
    "min-h-12 w-full rounded-xl border bg-white px-4 text-base text-[#0A2E10] shadow-sm transition placeholder:text-gray-600 hover:border-[#117F21] focus:outline-none focus:ring-4",
    err ? "border-[#B52026] focus:ring-[#B52026]/20" : "border-[#7D8A80] focus:border-[#117F21] focus:ring-[#117F21]/15",
  );

const stepHeadCls = "text-2xl font-bold tracking-tight text-[#0A2E10] focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0";
const focusRing = "has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#FFD84D]";

const reassurances: [LucideIcon, string][] = [
  [Lock, "Never send your password, BVN or bank details."],
  [ShieldCheck, "Your details are used only to handle your case, under the Nigeria Data Protection Act 2023."],
  [CheckCircle2, "You get a case reference to track progress."],
];

export default function CaseForm({ topic, setTopic, onSubmitted }: { topic: TopicId; setTopic: (t: TopicId) => void; onSubmitted: (ref: string) => void }) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Values | "file", string>>>({});
  const [done, setDone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  /* Focus the confirmation when it mounts (with mode="wait" it mounts after the last step's exit animation). */
  const doneRef = useCallback((el: HTMLDivElement | null) => el?.focus(), []);
  /* After Continue/Back, focus lands on the new step's heading so keyboard and screen reader users start at its top.
     Not on first load (moved is false until the user changes step). */
  const moved = useRef(false);
  const stepHead = useCallback((el: HTMLElement | null) => {
    if (el && moved.current) el.focus();
  }, []);
  const uid = useId();
  const reduce = useReducedMotion();
  const set = (k: keyof Values, val: string | boolean) => setV((x) => ({ ...x, [k]: val }));
  const t = topics.find((x) => x.id === topic)!;
  const TopicIcon = topicIcon[topic];

  const validate = (s: number) => {
    const e: typeof errors = {};
    if (s === 1) {
      if (!v.name.trim()) e.name = "Enter your full name";
      if (!v.email.trim() && !v.phone.trim()) e.email = "Enter an email address or a phone number so we can reply";
      if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Enter an email address like name@example.com";
      if (v.phone && !/^\+?[\d\s-]{10,16}$/.test(v.phone)) e.phone = "Enter a phone number like 0803 123 4567";
      if (v.pin && !/^PEN\d{12}$/i.test(v.pin.replace(/\s/g, ""))) e.pin = "An RSA PIN is PEN followed by 12 numbers";
      if (topic === "pfa" && !v.pfa) e.pfa = "Choose the PFA your complaint is about";
      if (topic === "employer" && !v.employer.trim()) e.employer = "Enter the employer’s name";
      if (v.message.trim().length < 20) e.message = "Tell us a little more (at least 20 characters)";
      if (file && file.size > 5 * 1024 * 1024) e.file = "The file must be smaller than 5 MB";
    }
    if (s === 2 && !v.consent) e.consent = "Tick the box to agree before you send";
    setErrors(e);
    if (Object.keys(e).length) window.setTimeout(() => summaryRef.current?.focus(), 30);
    return !Object.keys(e).length;
  };

  const go = (s: number) => {
    moved.current = true;
    setStep(s);
  };

  const next = () => {
    if (step === 0 || validate(step)) go(step + 1);
  };

  const submit = () => {
    if (!validate(2)) return;
    const ref = `PC-${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    try {
      localStorage.setItem(CASES_KEY, JSON.stringify([{ ref, topic, date: new Date().toISOString() }, ...loadCases()].slice(0, 10)));
    } catch {
      /* storage unavailable: the reference is still shown */
    }
    setDone(ref);
    onSubmitted(ref);
  };

  const reset = () => {
    setDone(null);
    go(0);
    setV(empty);
    setFile(null);
    setErrors({});
  };

  const copy = (ref: string) => {
    navigator.clipboard?.writeText(ref).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const errorList = Object.entries(errors).filter(([, m]) => m) as [string, string][];
  const steps = ["What it’s about", "Your details", "Check and send"];
  const swap = { initial: { opacity: 0, y: reduce ? 0 : 18 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: reduce ? 0 : -12 }, transition: { duration: 0.32, ease } };

  return (
    <section id="contact" aria-labelledby="form-title" className="scroll-mt-[170px] border-t border-gray-100 py-14 first:border-t-0 sm:py-16">
      <span id="report" className="block scroll-mt-[170px]" aria-hidden="true" />
      <SectionHeading id="form-title" eyebrow="Contact us" title="Send us a message" highlight="message" intro="Three short steps. We only ask for what we need to help you." />

      {/* Reassurances: a gap-px strip of mint tiles */}
      <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-gray-200/80 bg-gray-200/80 md:grid-cols-3">
        {reassurances.map(([Icon, text]) => (
          <li key={text} className="group flex items-start gap-3 bg-white p-5 transition hover:bg-[#F7FAF6]">
            <Tile icon={Icon} />
            <span className="pt-0.5 text-base leading-snug text-gray-600">{text}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_40px_80px_-50px_rgba(10,74,19,0.5)]">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-0.5 bg-gradient-to-r from-transparent via-[#CB9615] to-transparent" />
        {/* Progress: a segmented step bar on a soft strip; the green pill slides, the track below grows */}
        {!done && (
          <div className="border-b border-gray-100 bg-[#F4F7F2] p-3 sm:p-4">
            <ol className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-gray-200" aria-label="Progress">
              {steps.map((s, i) => (
                <li key={s} aria-current={i === step ? "step" : undefined} className="relative">
                  {i === step && <motion.span layoutId={`${uid}-step`} aria-hidden="true" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_12px_26px_-14px_rgba(10,74,19,0.8)]" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                  <span className={cn("relative flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-2 text-base font-semibold sm:justify-start sm:px-3", i === step ? "text-white" : i < step ? "text-[#117F21]" : "text-gray-600")}>
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums transition", i < step ? "bg-[#E8F5E9] text-[#117F21]" : i === step ? "bg-[#CB9615] text-[#1A1206]" : "bg-[#F4F7F2] text-gray-600 ring-1 ring-gray-200")}>
                      {i < step ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                    </span>
                    <span className="hidden truncate md:inline">{s}</span>
                    <span className="sr-only md:hidden">{s}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div aria-hidden="true" className="mx-1.5 mt-3 h-1 overflow-hidden rounded-full bg-gray-200">
              <motion.span className="block h-full origin-left rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" initial={false} animate={{ scaleX: (step + 1) / steps.length }} transition={{ duration: 0.5, ease }} />
            </div>
            <p className="mt-2 px-1.5 text-sm font-semibold text-[#0A4A13] md:hidden" aria-hidden="true">
              {`Step ${step + 1} of ${steps.length}`}: {steps[step]}
            </p>
          </div>
        )}

        <div className="p-5 sm:p-8">
          {/* Error summary: first in the focus order, each item jumps to its field */}
          {errorList.length > 0 && !done && (
            <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby={`${uid}-errs`} className="relative mb-7 overflow-hidden rounded-2xl border border-[#B52026]/30 bg-[#FDF3F3] py-4 pl-6 pr-5 focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B52026]" />
              <p id={`${uid}-errs`} className="flex items-center gap-2 text-lg font-bold text-[#8E1A1E]"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{errorList.length === 1 ? "There is a problem" : `There are ${errorList.length} problems`}</p>
              <ul className="mt-2 list-disc space-y-1 pl-11 text-base">
                {errorList.map(([k, m]) => (
                  <li key={k}><a href={`#${uid}-${k}`} onClick={(e) => { e.preventDefault(); document.getElementById(`${uid}-${k}`)?.focus(); }} className={cn("font-semibold text-[#B52026] underline underline-offset-4 hover:text-[#8E1A1E]", focus)}>{m}</a></li>
                ))}
              </ul>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div key="done" ref={doneRef} tabIndex={-1} initial={{ opacity: 0, y: reduce ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} aria-labelledby={`${uid}-done`} className="py-4 text-center focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                <span className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  {!reduce && (
                    <motion.span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-[#CB9615]" initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 1.4, delay: 0.25, ease: "easeOut" }} />
                  )}
                  <motion.span initial={{ scale: reduce ? 1 : 0.6, opacity: reduce ? 1 : 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45, ease, delay: 0.1 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#04240A] via-[#0A4A13] to-[#117F21] text-[#F4D27A] shadow-[0_20px_40px_-18px_rgba(10,74,19,0.8)]">
                    <Check className="h-10 w-10" strokeWidth={3} aria-hidden="true" />
                  </motion.span>
                </span>
                <h3 id={`${uid}-done`} className="mt-6 text-2xl font-bold tracking-tight text-[#0A2E10] sm:text-3xl">{topic === "enquiry" ? "We’ve received your enquiry" : topic === "employer" ? "We’ve received your report" : "We’ve received your complaint"}</h3>
                <p className="mt-2 text-lg text-gray-600">{response[topic]}</p>
                <div className="relative mx-auto mt-6 flex max-w-md flex-col gap-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-[#F4F7F2] py-5 pl-6 pr-5 text-left sm:flex-row sm:items-center sm:justify-between">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#117F21]" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7A5200]">Your case reference</span>
                    <span className="mt-1 block break-all font-mono text-2xl font-bold text-[#0A4A13] sm:text-3xl">{done}</span>
                  </span>
                  <button type="button" onClick={() => copy(done)} aria-label={copied ? "Copied" : "Copy reference"} className={cn(outlineBtn, "shrink-0")}>
                    {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="sr-only" aria-live="polite">{copied ? "Reference copied" : ""}</p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <button type="button" onClick={() => document.getElementById("track")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })} className={cn("group", goldBtn)}>
                    Track this case
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={reset} className={outlineBtn}>Send another</button>
                </div>
                <p className="mt-6 text-sm text-gray-600">Prototype: nothing is sent to PenCom yet. The reference is saved in this browser so you can try the tracker.</p>
              </motion.div>
            ) : step === 0 ? (
              <motion.fieldset key="s0" {...swap}>
                <legend ref={stepHead} tabIndex={-1} className={stepHeadCls}>What is your message about?</legend>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {topics.map((x) => {
                    const on = topic === x.id;
                    const Icon = topicIcon[x.id];
                    return (
                      <Spotlight key={x.id} className={cn("rounded-3xl transition duration-300", focusRing, on ? "shadow-[0_24px_50px_-24px_rgba(10,74,19,0.45)]" : "hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-24px_rgba(10,74,19,0.4)]")}>
                        <label
                          className={cn(
                            "group relative flex h-full cursor-pointer flex-col rounded-3xl border p-5 transition duration-300",
                            on ? "border-[#117F21] bg-[#F7FAF6] ring-1 ring-[#117F21]" : "border-gray-200/80 bg-white/70 hover:border-[#117F21]/30",
                          )}
                        >
                          {on && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />}
                          <input type="radio" name={`${uid}-topic`} value={x.id} checked={on} onChange={() => setTopic(x.id)} className="sr-only" />
                          <span className="relative flex items-start justify-between gap-3">
                            <Tile icon={Icon} className={on ? "bg-[#117F21] text-white" : undefined} />
                            <span aria-hidden="true" className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 transition", on ? "border-[#117F21] bg-[#117F21] text-white" : "border-[#7D8A80] bg-white")}>
                              {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                            </span>
                          </span>
                          <span className="relative mt-4 text-xl font-bold text-[#0A2E10]">{x.label}</span>
                          <span className="relative mt-1 text-base leading-snug text-gray-600">{x.body}</span>
                        </label>
                      </Spotlight>
                    );
                  })}
                </div>
                {topic === "pfa" && (
                  <p className="relative mt-5 overflow-hidden rounded-2xl border border-[#CB9615]/30 bg-[#FFF8E1] py-4 pl-6 pr-5 text-base text-[#5C4300]">
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#CB9615]" />
                    Have you complained to your PFA first? PenCom steps in when a PFA hasn’t resolved it.
                  </p>
                )}
              </motion.fieldset>
            ) : step === 1 ? (
              <motion.div key="s1" {...swap} className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 ref={stepHead} tabIndex={-1} className={stepHeadCls}>Your details</h3>
                  <p className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#F7FAF6] py-1 pl-1 pr-4 text-sm font-semibold text-[#0A4A13]">
                    <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#04240A] text-[#F4D27A]"><TopicIcon className="h-3.5 w-3.5" /></span>
                    {t.label}
                  </p>
                </div>
                <Field id={`${uid}-name`} label="Full name" error={errors.name}>
                  <input id={`${uid}-name`} autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-error` : undefined} className={inputCls(errors.name)} />
                </Field>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field id={`${uid}-email`} label="Email address" hint="Email or phone: one is enough" error={errors.email}>
                    <input id={`${uid}-email`} type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={`${uid}-email-hint${errors.email ? ` ${uid}-email-error` : ""}`} className={inputCls(errors.email)} />
                  </Field>
                  <Field id={`${uid}-phone`} label="Phone number" hint="Optional" error={errors.phone}>
                    <input id={`${uid}-phone`} type="tel" autoComplete="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} aria-describedby={`${uid}-phone-hint${errors.phone ? ` ${uid}-phone-error` : ""}`} className={inputCls(errors.phone)} />
                  </Field>
                </div>
                {topic !== "enquiry" && topic !== "pencom" && (
                  <Field id={`${uid}-pin`} label="RSA PIN" hint="Optional. Helps us find your records faster. Starts with PEN." error={errors.pin}>
                    <input id={`${uid}-pin`} value={v.pin} onChange={(e) => set("pin", e.target.value.toUpperCase())} inputMode="text" autoComplete="off" aria-invalid={!!errors.pin} aria-describedby={`${uid}-pin-hint${errors.pin ? ` ${uid}-pin-error` : ""}`} className={cn(inputCls(errors.pin), "font-mono uppercase tracking-wider")} placeholder="PEN" />
                  </Field>
                )}
                {topic === "pfa" && (
                  <Field id={`${uid}-pfa`} label="Which PFA is it about?" error={errors.pfa}>
                    <select id={`${uid}-pfa`} value={v.pfa} onChange={(e) => set("pfa", e.target.value)} aria-invalid={!!errors.pfa} aria-describedby={errors.pfa ? `${uid}-pfa-error` : undefined} className={cn(inputCls(errors.pfa), "cursor-pointer")}>
                      <option value="">Choose a PFA</option>
                      {operators.filter((o) => o.type === "PFA").map((o) => <option key={o.id}>{o.name}</option>)}
                    </select>
                  </Field>
                )}
                {topic === "employer" && (
                  <>
                    <Field id={`${uid}-employer`} label="Employer’s name" error={errors.employer}>
                      <input id={`${uid}-employer`} value={v.employer} onChange={(e) => set("employer", e.target.value)} aria-invalid={!!errors.employer} aria-describedby={errors.employer ? `${uid}-employer-error` : undefined} className={inputCls(errors.employer)} />
                    </Field>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Field id={`${uid}-employerAddress`} label="Employer’s address" hint="Optional">
                        <input id={`${uid}-employerAddress`} value={v.employerAddress} onChange={(e) => set("employerAddress", e.target.value)} aria-describedby={`${uid}-employerAddress-hint`} className={inputCls()} />
                      </Field>
                      <Field id={`${uid}-months`} label="Months not remitted" hint="Optional, e.g. Jan–Jun 2026">
                        <input id={`${uid}-months`} value={v.months} onChange={(e) => set("months", e.target.value)} aria-describedby={`${uid}-months-hint`} className={inputCls()} />
                      </Field>
                    </div>
                  </>
                )}
                <Field id={`${uid}-message`} label={topic === "enquiry" ? "Your question" : "What happened?"} error={errors.message}>
                  <textarea id={`${uid}-message`} rows={5} maxLength={2000} value={v.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? `${uid}-message-error` : undefined} className={cn(inputCls(errors.message), "py-3 leading-relaxed")} />
                  <div aria-hidden="true" className="mt-2 flex items-center gap-3">
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <span className="block h-full origin-left rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615] transition-transform duration-300" style={{ transform: `scaleX(${Math.min(v.message.length / 2000, 1)})` }} />
                    </span>
                    <span className="font-mono text-sm tabular-nums text-gray-600">{v.message.length} / 2000</span>
                  </div>
                </Field>
                <Field id={`${uid}-file`} label="Attach a document" hint="Optional. PDF, JPG or PNG, up to 5 MB" error={errors.file}>
                  <label className={cn("group flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border border-dashed px-3 transition hover:border-[#117F21] hover:bg-[#F7FAF6]", focusRing, errors.file ? "border-[#B52026]" : file ? "border-[#117F21] bg-[#E8F5E9]" : "border-[#7D8A80] bg-[#F4F7F2]")}>
                    <Tile icon={Paperclip} dark />
                    <span className="flex-1 truncate text-base font-semibold text-[#0A2E10]">{file ? file.name : "Choose a file"}</span>
                    {file && <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} aria-label="Remove file" className={cn("flex h-11 w-11 items-center justify-center rounded-full text-gray-600 hover:bg-white hover:text-[#B52026]", focus)}><X className="h-5 w-5" aria-hidden="true" /></button>}
                    <input id={`${uid}-file`} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} aria-describedby={`${uid}-file-hint${errors.file ? ` ${uid}-file-error` : ""}`} className="sr-only" />
                  </label>
                </Field>
              </motion.div>
            ) : (
              <motion.div key="s2" {...swap}>
                <h3 ref={stepHead} tabIndex={-1} className={stepHeadCls}>Check your details</h3>
                <dl className="mt-5 overflow-hidden rounded-3xl border border-gray-200/80 bg-white divide-y divide-gray-100">
                  {[
                    ["About", t.label],
                    ["Name", v.name],
                    ["Email", v.email || "—"],
                    ["Phone", v.phone || "—"],
                    ...(v.pin ? [["RSA PIN", `${v.pin.slice(0, 3)}••••••••${v.pin.slice(-4)}`]] : []),
                    ...(v.pfa ? [["PFA", v.pfa]] : []),
                    ...(v.employer ? [["Employer", v.employer]] : []),
                    ["Message", v.message],
                    ...(file ? [["Attachment", file.name]] : []),
                  ].map(([k, val]) => (
                    <div key={k} className="grid grid-cols-1 gap-1 px-5 py-4 text-base transition hover:bg-[#F7FAF6] sm:grid-cols-4 sm:gap-4 sm:px-6">
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A5200] sm:pt-1">{k}</dt>
                      <dd className="break-words text-[#0A2E10] sm:col-span-3">{val}</dd>
                    </div>
                  ))}
                </dl>
                <button type="button" onClick={() => go(1)} className={cn("mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl px-1 font-semibold text-[#117F21] underline underline-offset-4 hover:text-[#0A4A13]", focus)}>
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Change details
                </button>
                <div className="mt-5">
                  <label className={cn("flex cursor-pointer gap-4 rounded-2xl border p-5 transition", focusRing, errors.consent ? "border-[#B52026] bg-[#FDF3F3] ring-1 ring-[#B52026]" : v.consent ? "border-[#117F21] bg-[#F7FAF6] ring-1 ring-[#117F21]" : "border-gray-200 bg-white hover:border-[#117F21]/40 hover:bg-[#F7FAF6]")}>
                    <input id={`${uid}-consent`} type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${uid}-consent-error` : undefined} className="peer sr-only" />
                    <span aria-hidden="true" className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition", v.consent ? "border-[#117F21] bg-[#117F21] text-white" : "border-[#7D8A80] bg-white")}>
                      {v.consent && <Check className="h-4 w-4" strokeWidth={3} />}
                    </span>
                    <span className="text-base leading-relaxed text-gray-700">
                      I agree that PenCom may use these details to handle my {topic === "enquiry" ? "enquiry" : "case"}, and share them with the PFA or employer concerned where needed. Read the <Link to="/regulations#policies" className="font-semibold text-[#0A4A13] underline underline-offset-2">privacy notice</Link>.
                    </span>
                  </label>
                  {errors.consent && <p id={`${uid}-consent-error`} className="mt-2 flex items-start gap-2 text-base font-semibold text-[#B52026]"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {errors.consent}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!done && (
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {step > 0 ? (
                <button type="button" onClick={() => { setErrors({}); go(step - 1); }} className={outlineBtn}>
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back
                </button>
              ) : <span className="hidden sm:block" />}
              <button type="button" onClick={step < 2 ? next : submit} className={cn("group", goldBtn)}>
                {step < 2 ? "Continue" : "Send"}
                {step < 2 ? <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /> : <Send className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
