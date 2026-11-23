"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ClipboardCheck, Clock, Download, FileText, FileType, Globe, Printer, RotateCcw, Search } from "lucide-react";
import { Rise, ease, focus, featured, goldBtn, outlineBtn, outlineDarkBtn } from "@/views/theme/ui";
import { cn } from "@/lib/utils";
import { GridBackdrop, Spotlight, Tilt } from "@/views/about/primitives";
import { SectionHeading } from "@/views/theme/heading";
import { forms } from "@/views/resources/publications";
import { splitReq } from "@/views/charter/splitReq";
import charter from "@/views/charter/charter.json";
import { ArrowChip, DocHero, DocTools, Toc, VerifyNote, ring, sizes } from "@/views/docs/kit";

/**
 * Forms and application checklists as web pages (DES-22: "forms, application checklists ... available as web pages";
 * DES-41: printable checklists). Checklist items are the documentation requirements in the revised Service Charter (May 2026).
 * Classic document page: dark DocBanner, sticky contents + text size on the left, checklists and forms on the right.
 */

type Std = { dept: string; service: string; time: string; req: string };
type Charter = { standards: Std[] };
type Who = "Contributors" | "Retirees" | "Families" | "Employers";

const PICK: { match: RegExp; title: string; who: Who[]; id: string }[] = [
  { id: "programmed-withdrawal", match: /^Programmed Withdrawal Access/, title: "Retire and start your monthly pension", who: ["Retirees"] },
  { id: "en-bloc", match: /^En bloc Withdrawal/, title: "Withdraw your whole RSA balance (en bloc)", who: ["Retirees"] },
  { id: "job-loss-25", match: /^Request for withdrawal of 25%/, title: "Withdraw 25% after losing your job", who: ["Contributors"] },
  { id: "voluntary", match: /^Withdrawal from Voluntary Contributions/, title: "Withdraw your voluntary contributions", who: ["Contributors"] },
  { id: "mortgage", match: /^Residential Mortgage/, title: "Use your RSA towards a home (mortgage equity)", who: ["Contributors"] },
  { id: "ppp-payment", match: /^Request for Payment of Personal Pension Plan/, title: "Get paid from your Personal Pension Plan", who: ["Contributors", "Retirees"] },
  { id: "death-benefits", match: /^Death Benefits Request/, title: "Claim death benefits for a family member", who: ["Families"] },
  { id: "death-claims-fgn", match: /^Death Benefits Claims/, title: "Claim accrued rights for a deceased federal employee", who: ["Families"] },
  { id: "accrued-rights", match: /^Processing and Payment of Accrued Rights/, title: "Get your accrued rights (federal employees)", who: ["Retirees"] },
  { id: "biodata", match: /^Approval for Update of Contributors/, title: "Update your personal details (biodata)", who: ["Contributors"] },
  { id: "pcc", match: /^Issuance of Pension Clearance Certificate/, title: "Get a Pension Clearance Certificate (PCC)", who: ["Employers"] },
  { id: "employer-code", match: /^Employer Codes Generation/, title: "Get an employer code", who: ["Employers"] },
  { id: "refund", match: /^Approval for refunds of Pension Contributions/, title: "Get a refund of pension contributions", who: ["Employers", "Contributors"] },
];
const WHO: ("All" | Who)[] = ["All", "Contributors", "Retirees", "Families", "Employers"];
const KEY = "pencom:checklists";
const TOC = [
  { id: "checklists", label: "Application checklists" },
  { id: "forms", label: "Official forms" },
  { id: "online", label: "Applying online?" },
];

function load(): Record<string, number[]> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}

export default function FormsPage() {
  const reduce = useReducedMotion();
  // Bundled with the page, so the checklists are in the server-rendered HTML.
  const data = charter as unknown as Charter;
  const [who, setWho] = useState<"All" | Who>("All");
  const [sel, setSel] = useState(PICK[0].id);
  const [size, setSize] = useState(0);
  // Ticks live on this device; read after mount so server and browser render the same.
  const [ticks, setTicks] = useState<Record<string, number[]>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setTicks(load());
    setReady(true);
  }, []);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(ticks)); } catch { /* storage unavailable */ }
  }, [ticks, ready]);

  const lists = useMemo(() => {
    if (!data) return [];
    return PICK.map((p) => {
      const s = data.standards.find((x) => p.match.test(x.service));
      return s ? { ...p, std: s, items: splitReq(s.req) } : null;
    }).filter(Boolean) as (typeof PICK[number] & { std: Std; items: string[] })[];
  }, [data]);
  const shown = lists.filter((l) => who === "All" || l.who.includes(who as Who));
  const cur = lists.find((l) => l.id === sel) ?? shown[0];
  const done = cur ? (ticks[cur.id] ?? []) : [];
  const pct = cur ? Math.round((done.length / cur.items.length) * 100) : 0;
  const toggle = (i: number) => cur && setTicks((t) => ({ ...t, [cur.id]: done.includes(i) ? done.filter((x) => x !== i) : [...done, i] }));

  const printList = () => {
    if (!cur) return;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><title>${cur.title}</title><style>body{font:16px/1.6 Arial;margin:40px}h1{font:bold 22px Verdana;color:#105D1D;margin:0}p{color:#444}ul{list-style:none;padding:0}li{display:flex;gap:12px;margin-bottom:12px}.b{flex:none;width:18px;height:18px;border:2px solid #14892A;border-radius:4px;margin-top:3px;text-align:center;line-height:14px;font-weight:bold;color:#117F21}footer{margin-top:30px;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:8px}</style><h1>${cur.title}</h1><p>${cur.std.dept}${cur.std.time ? ` · Service standard: ${cur.std.time}` : ""}</p><ul>${cur.items.map((t, i) => `<li><span class="b">${done.includes(i) ? "✓" : ""}</span>${t.replace(/</g, "&lt;")}</li>`).join("")}</ul><footer>National Pension Commission · From the Service Charter (revised May 2026) · pencom.gov.ng</footer>`);
    w.document.close(); w.focus(); w.print();
  };

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  const fq = q.trim().toLowerCase();
  const fl = forms.filter((f) => !fq || f.title.toLowerCase().includes(fq));
  const R = 30, C = 2 * Math.PI * R;

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-[#164D20] print:bg-white">
      <DocHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Resources", to: "/resources" }, { label: "Forms and checklists" }]}
        kind="Forms and checklists"
        icon={<ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />}
        title="Get your documents ready"
        lead="Checklists for the most common requests, taken from the documentation requirements in our Service Charter. Tick items off as you go, then print the list or take it on your phone."
        meta={[
          { label: "Checklists", value: lists.length || PICK.length },
          { label: "Forms", value: forms.length },
          { label: "Source", value: "Service Charter" },
          { label: "Updated", value: "May 2026" },
        ]}
        actions={<>
          <button type="button" onClick={() => jump("checklists")} className={goldBtn}><ClipboardCheck className="h-5 w-5" aria-hidden="true" /> Start a checklist</button>
          <button type="button" onClick={() => jump("forms")} className={outlineDarkBtn}><FileText className="h-5 w-5" aria-hidden="true" /> Download forms</button>
        </>}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-14 sm:py-20 lg:grid-cols-12 lg:gap-10">
        <aside className="lg:col-span-3 print:hidden">
          <div className="space-y-4 lg:sticky lg:top-[116px]">
            <Toc items={TOC} title="On this page" className="hidden lg:block" />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-3 pl-4">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">Text size</span>
              <DocTools size={size} setSize={setSize} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-16 sm:space-y-20 lg:col-span-9">
          {/* Checklists */}
          <section id="checklists" aria-labelledby="cl-t" className="scroll-mt-[120px]">
            <SectionHeading id="cl-t" eyebrow="Application checklists" title="What do you need to do?" highlight="need to do" stacked />

            <LayoutGroup id="forms-who">
              <div role="radiogroup" aria-label="Who is this for" className="mt-8 flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-gray-200 sm:inline-flex">
                {WHO.map((w) => {
                  const on = who === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => { setWho(w); const first = lists.find((l) => w === "All" || l.who.includes(w as Who)); if (first) setSel(first.id); }}
                      className={cn("relative inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 font-semibold transition sm:flex-none", on ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#105D1D]", focus)}
                    >
                      {on && <motion.span layoutId="forms-who-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#105D1D] to-[#14892A] shadow-[0_10px_24px_-12px_rgba(16,93,29,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                      {on && <Check className="relative h-4 w-4" aria-hidden="true" />}
                      <span className="relative">{w}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            {cur && (
              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
                <Spotlight className="h-fit overflow-hidden rounded-3xl border border-gray-200/80 bg-white xl:col-span-5">
                  <ul className="divide-y divide-gray-100" aria-label="Checklists">
                    {shown.map((l, i) => {
                      const on = l.id === cur.id;
                      const n = (ticks[l.id] ?? []).length;
                      const full = n === l.items.length;
                      return (
                        <motion.li key={l.id} layout={!reduce} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                          <button type="button" onClick={() => setSel(l.id)} aria-pressed={on} className={cn("group relative flex w-full items-center gap-4 px-5 py-4 text-left transition focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]", on ? "bg-[#F7FAF6]" : "hover:bg-[#F7FAF6]")}>
                            {on && <motion.span layoutId="forms-cur-bar" aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#14892A] to-[#CB9615]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                            <span aria-hidden="true" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold tabular-nums transition duration-300 group-hover:rotate-[-6deg]", full ? "bg-[#CB9615] text-[#1A1206]" : on ? "bg-[#14892A] text-white" : "bg-[#11421A] text-[#F4D27A]")}>
                              {full ? <Check className="h-5 w-5" /> : l.items.length}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={cn("block font-bold leading-snug", on ? "text-[#105D1D]" : "text-[#164D20]")}>{l.title}</span>
                              <span className="mt-0.5 block text-sm text-gray-600">{l.who.join(" · ")}{n > 0 && ` · ${n} of ${l.items.length} ready`}</span>
                              {n > 0 && (
                                <span aria-hidden="true" className="mt-2 block h-1.5 overflow-hidden rounded-full bg-gray-100">
                                  <span className="block h-full origin-left rounded-full bg-gradient-to-r from-[#14892A] to-[#CB9615] transition-transform duration-500" style={{ transform: `scaleX(${n / l.items.length})` }} />
                                </span>
                              )}
                            </span>
                            <ArrowRight className={cn("h-5 w-5 shrink-0 transition duration-300", on ? "text-[#117F21]" : "text-gray-400 group-hover:translate-x-1 group-hover:text-[#117F21]")} aria-hidden="true" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </Spotlight>

                <AnimatePresence mode="wait">
                  <motion.article key={cur.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3, ease }} aria-labelledby="cl-cur" className="min-w-0 xl:col-span-7">
                    <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_30px_60px_-40px_rgba(16,93,29,0.45)]">
                      <div className={cn(featured, "flex flex-col gap-5 rounded-none p-6 sm:flex-row sm:items-center sm:p-7 print:bg-none print:bg-white print:text-black")}>
                        <GridBackdrop className="-z-10 opacity-60 print:hidden" />
                        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-[#CB9615]/20 blur-3xl print:hidden" />
                        <div className="relative h-24 w-24 shrink-0">
                          <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden="true">
                            <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
                            <motion.circle cx="36" cy="36" r={R} fill="none" stroke="#F4D27A" strokeWidth="7" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }} transition={{ duration: 0.6, ease }} />
                          </svg>
                          <span className="absolute inset-0 flex flex-col items-center justify-center text-xl font-bold tabular-nums text-[#F4D27A]" aria-live="polite">{pct}%<span className="sr-only"> ready</span></span>
                        </div>
                        <div className="relative min-w-0">
                          <h3 id="cl-cur" className="text-2xl font-bold leading-snug tracking-tight">{cur.title}</h3>
                          <p className="mt-1 text-base text-white/85 print:text-black">{cur.std.dept}</p>
                          {cur.std.time && <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/15"><Clock className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" />PenCom’s service standard: {cur.std.time}</p>}
                        </div>
                      </div>
                      <ul className="divide-y divide-gray-100" style={{ fontSize: sizes[size] }}>
                        {cur.items.map((it, i) => {
                          const on = done.includes(i);
                          return (
                            <li key={i}>
                              <label className={cn("flex min-h-12 cursor-pointer gap-4 px-6 py-4 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:-outline-offset-[3px] has-[:focus-visible]:outline-[#FFD84D] sm:px-7", on ? "bg-[#E8F5E9]/60" : "hover:bg-[#F7FAF6]")}>
                                <input type="checkbox" checked={on} onChange={() => toggle(i)} className="sr-only" />
                                <motion.span animate={{ scale: on ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.3 }} aria-hidden="true" className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition", on ? "border-[#14892A] bg-[#14892A] text-white" : "border-gray-400 bg-white")}>
                                  {on && <Check className="h-4 w-4" strokeWidth={3} />}
                                </motion.span>
                                <span className={cn("leading-relaxed transition", on ? "text-gray-600 line-through decoration-[#14892A]/60" : "text-gray-700")}>{it}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 bg-[#F4F7F2] p-5 sm:px-7">
                        <button type="button" onClick={printList} className={goldBtn}><Printer className="h-5 w-5" aria-hidden="true" /> Print checklist</button>
                        <button type="button" onClick={() => setTicks((t) => ({ ...t, [cur.id]: [] }))} disabled={!done.length} className={cn(outlineBtn, "disabled:pointer-events-none disabled:opacity-40")}><RotateCcw className="h-5 w-5" aria-hidden="true" /> Start again</button>
                        <Link to="/about/service-charter#standards" className={cn("group inline-flex min-h-12 items-center gap-3 rounded-xl font-semibold text-[#117F21] hover:underline 2xl:ml-auto", ring)}>See it in the Service Charter <ArrowChip /></Link>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">Your ticks are saved on this device only.</p>
                  </motion.article>
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Forms */}
          <section id="forms" aria-labelledby="forms-t" className="scroll-mt-[120px] border-t border-gray-100 pt-14 sm:pt-16">
            <SectionHeading
              id="forms-t"
              eyebrow="Forms"
              title="Official forms"
              highlight="forms"
              intro="Download, complete and submit as the form instructs. Most services now start online through the right portal."
              action={
                <label className="block w-full sm:w-80">
                  <span className="sr-only">Find a form</span>
                  <span className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 ring-1 ring-gray-200 transition focus-within:ring-[3px] focus-within:ring-[#FFD84D]">
                    <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a form" className="min-h-12 w-full min-w-0 bg-transparent text-base text-[#164D20] placeholder:text-gray-500 focus:outline-none focus-visible:outline-none focus-visible:ring-0" />
                  </span>
                </label>
              }
            />
            <Spotlight className="mt-8 overflow-hidden rounded-3xl border border-gray-200/80 bg-white">
              <ul className="divide-y divide-gray-100" aria-live="polite">
                {fl.map((f, i) => (
                  <motion.li key={f.pdf} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 8) * 0.04, ease }}>
                    <a href={f.pdf} target="_blank" rel="noopener noreferrer" className="group relative flex items-center gap-4 px-5 py-4 transition hover:bg-[#F7FAF6] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D] sm:px-6">
                      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-[#14892A] to-[#CB9615] transition-transform duration-300 group-hover:scale-y-100" />
                      <span aria-hidden="true" className={cn("flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg text-xs font-bold text-white shadow transition-transform duration-300 group-hover:rotate-[-6deg]", f.ext === "PDF" ? "bg-[#B52026]" : "bg-[#1F6A99]")}><FileType className="h-4 w-4" />{f.ext}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold leading-snug text-[#164D20] group-hover:text-[#105D1D]">{f.title}</span>
                        <span className="mt-0.5 block text-sm text-gray-600">Published {new Date(f.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                      </span>
                      <span className="hidden items-center gap-2 text-sm font-semibold text-[#117F21] sm:inline-flex">Download</span>
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#117F21] transition group-hover:bg-[#14892A] group-hover:text-white">
                        <Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" />
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </Spotlight>
          </section>

          {/* Before you apply */}
          <section id="online" aria-label="Applying online?" className="scroll-mt-[120px]">
            <Rise className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Tilt className="h-full">
                <Link to="/services#portals" className={cn(featured, "group flex h-full items-center gap-5 p-6 shadow-[0_28px_50px_-30px_rgba(16,93,29,0.7)] sm:p-7", ring)}>
                  <GridBackdrop className="-z-10 opacity-60" />
                  <span aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-40 w-40 rounded-full bg-[#CB9615]/20 blur-3xl" />
                  <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#F4D27A] ring-1 ring-white/15 transition-transform duration-300 group-hover:rotate-[-6deg]"><Globe className="h-7 w-7" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-bold tracking-tight">Applying online?</span>
                    <span className="mt-1 block text-base text-white/85">Find the right portal: eHub, PCRS, PENCAP and more</span>
                  </span>
                  <ArrowChip dark />
                </Link>
              </Tilt>
              <VerifyNote>Checklists reproduce the documentation requirements in the revised Service Charter (May 2026). Your PFA or the relevant PenCom department may ask for more in particular cases.</VerifyNote>
            </Rise>
          </section>
        </div>
      </div>
      </div>
    </MotionConfig>
  );
}
