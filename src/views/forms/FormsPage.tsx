"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ClipboardCheck, Clock, Download, FileText, FileType, Globe, Printer, RotateCcw, Search } from "lucide-react";
import { Rise, sectionCls } from "@/views/theme/ui";
import { cn } from "@/lib/utils";
import { ease } from "@/views/about/primitives";
import { Bubble, IconTile, calmCard, goldBtn, pill } from "@/views/legacy/calm";
import { SectionHeading } from "@/views/theme/heading";
import { forms } from "@/views/resources/publications";
import { splitReq } from "@/views/charter/splitReq";
import charter from "@/views/charter/charter.json";
import { ArrowChip, DocHero, VerifyNote, ring } from "@/views/docs/kit";

/**
 * Forms and application checklists as web pages (DES-22: "forms, application checklists ... available as web pages";
 * DES-41: printable checklists). Checklist items are the documentation requirements in the revised Service Charter (May 2026).
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
const outlineBtn = cn("group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] bg-white px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white disabled:pointer-events-none disabled:opacity-40", ring);

function load(): Record<string, number[]> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}

export default function FormsPage() {
  const reduce = useReducedMotion();
  // Bundled with the page, so the checklists are in the server-rendered HTML.
  const data = charter as unknown as Charter;
  const [who, setWho] = useState<"All" | Who>("All");
  const [sel, setSel] = useState(PICK[0].id);
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
    w.document.write(`<!doctype html><title>${cur.title}</title><style>body{font:16px/1.6 Arial;margin:40px}h1{font:bold 22px Verdana;color:#0A4A13;margin:0}p{color:#444}ul{list-style:none;padding:0}li{display:flex;gap:12px;margin-bottom:12px}.b{flex:none;width:18px;height:18px;border:2px solid #117F21;border-radius:4px;margin-top:3px;text-align:center;line-height:14px;font-weight:bold;color:#117F21}footer{margin-top:30px;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:8px}</style><h1>${cur.title}</h1><p>${cur.std.dept}${cur.std.time ? ` · Service standard: ${cur.std.time}` : ""}</p><ul>${cur.items.map((t, i) => `<li><span class="b">${done.includes(i) ? "✓" : ""}</span>${t.replace(/</g, "&lt;")}</li>`).join("")}</ul><footer>National Pension Commission · From the Service Charter (revised May 2026) · pencom.gov.ng</footer>`);
    w.document.close(); w.focus(); w.print();
  };

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  const fq = q.trim().toLowerCase();
  const fl = forms.filter((f) => !fq || f.title.toLowerCase().includes(fq));
  const R = 30, C = 2 * Math.PI * R;

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#FBF8F1] text-[#14261A] print:bg-white">
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
          <button type="button" onClick={() => jump("checklists")} className={cn(goldBtn, ring)}><ClipboardCheck className="h-5 w-5" aria-hidden="true" /> Start a checklist</button>
          <button type="button" onClick={() => jump("forms")} className={outlineBtn}><FileText className="h-5 w-5" aria-hidden="true" /> Download forms</button>
        </>}
      />

      <section id="checklists" aria-labelledby="cl-t" className={cn(sectionCls, "bg-white")}>
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            id="cl-t"
            eyebrow="Application checklists"
            title="What do you need to do?"
            highlight="need to do"
            action={
              <div role="radiogroup" aria-label="Who is this for" className="flex flex-wrap gap-2">
                {WHO.map((w) => (
                  <button key={w} type="button" role="radio" aria-checked={who === w} onClick={() => { setWho(w); const first = lists.find((l) => w === "All" || l.who.includes(w as Who)); if (first) setSel(first.id); }} className={pill(who === w)}>
                    {who === w && <Check className="-ml-1 mr-1.5 h-5 w-5" aria-hidden="true" />}{w}
                  </button>
                ))}
              </div>
            }
          />

          {cur && (
            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <ul className="space-y-3 lg:col-span-5" aria-label="Checklists">
                {shown.map((l, i) => {
                  const on = l.id === cur.id;
                  const n = (ticks[l.id] ?? []).length;
                  return (
                    <motion.li key={l.id} layout={!reduce} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <button type="button" onClick={() => setSel(l.id)} aria-pressed={on} className={cn("group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl p-4 text-left transition duration-300", ring, on ? "bg-[#E8F5E9] ring-2 ring-[#117F21] shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)]" : "bg-white ring-1 ring-black/10 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(10,74,19,0.55)] hover:ring-2 hover:ring-[#117F21]")}>
                        <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold tabular-nums transition-transform duration-300 group-hover:rotate-[-6deg]", on || n === l.items.length ? "bg-[#F4D27A] text-[#1A1206]" : "bg-[#0A4A13] text-[#F4D27A]")}>{n === l.items.length ? <Check className="h-6 w-6" aria-hidden="true" /> : l.items.length}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-lg font-bold leading-snug">{l.title}</span>
                          <span className="mt-0.5 block text-base text-[#14261A]/75">{l.who.join(" · ")}{n > 0 && ` · ${n} of ${l.items.length} ready`}</span>
                        </span>
                        <ArrowRight className={cn("h-5 w-5 shrink-0 transition-transform duration-300", on ? "text-[#0A4A13]" : "text-[#14261A]/50 group-hover:translate-x-1 group-hover:text-[#117F21]")} aria-hidden="true" />
                        {n > 0 && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-black/5"><span className="block h-full origin-left bg-gradient-to-r from-[#117F21] to-[#CB9615] transition-transform duration-500" style={{ transform: `scaleX(${n / l.items.length})` }} /></span>}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>

              <AnimatePresence mode="wait">
                <motion.article key={cur.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3, ease }} aria-labelledby="cl-cur" className="lg:col-span-7">
                  <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_80px_-50px_rgba(10,74,19,0.55)] ring-1 ring-black/10">
                    <div className="relative isolate flex flex-col gap-5 overflow-hidden bg-[#0A4A13] p-6 text-white sm:flex-row sm:items-center sm:p-7">
                      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-[#CB9615]/20 blur-3xl" />
                      <div className="relative h-24 w-24 shrink-0">
                        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden="true">
                          <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
                          <motion.circle cx="36" cy="36" r={R} fill="none" stroke="#F4D27A" strokeWidth="7" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }} transition={{ duration: 0.6, ease }} />
                        </svg>
                        <span className="absolute inset-0 flex flex-col items-center justify-center text-xl font-bold tabular-nums text-[#F4D27A]" aria-live="polite">{pct}%<span className="sr-only"> ready</span></span>
                      </div>
                      <div className="relative min-w-0">
                        <h3 id="cl-cur" className="text-2xl font-bold leading-snug tracking-tight">{cur.title}</h3>
                        <p className="mt-1 text-lg text-white/85">{cur.std.dept}</p>
                        {cur.std.time && <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-1.5 text-base font-semibold ring-1 ring-white/10"><Clock className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" />PenCom’s service standard: {cur.std.time}</p>}
                      </div>
                    </div>
                    <ul className="divide-y divide-[#14261A]/[0.08]">
                      {cur.items.map((it, i) => {
                        const on = done.includes(i);
                        return (
                          <li key={i}>
                            <label className={cn("flex min-h-14 cursor-pointer gap-4 px-6 py-4 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:-outline-offset-[3px] has-[:focus-visible]:outline-[#FFD84D] sm:px-7", on ? "bg-[#E8F5E9]/70" : "hover:bg-[#FBF8F1]")}>
                              <input type="checkbox" checked={on} onChange={() => toggle(i)} className="sr-only" />
                              <motion.span animate={{ scale: on ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.3 }} aria-hidden="true" className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition", on ? "border-[#117F21] bg-[#117F21] text-white" : "border-[#14261A]/40 bg-white")}>
                                {on && <Check className="h-5 w-5" strokeWidth={3} />}
                              </motion.span>
                              <span className={cn("text-lg leading-relaxed transition", on ? "text-[#14261A]/70 line-through decoration-[#117F21]/60" : "text-[#14261A]")}>{it}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex flex-wrap items-center gap-3 border-t border-[#14261A]/[0.08] bg-[#FBF8F1] p-5 sm:px-7">
                      <button type="button" onClick={printList} className={cn(goldBtn, ring)}><Printer className="h-5 w-5" aria-hidden="true" /> Print checklist</button>
                      <button type="button" onClick={() => setTicks((t) => ({ ...t, [cur.id]: [] }))} disabled={!done.length} className={outlineBtn}><RotateCcw className="h-5 w-5" aria-hidden="true" /> Start again</button>
                      <Link to="/about/service-charter#standards" className={cn("group inline-flex min-h-14 items-center gap-3 rounded-2xl text-lg font-semibold text-[#0A4A13] hover:underline lg:ml-auto", ring)}>See it in the Service Charter <ArrowChip /></Link>
                    </div>
                  </div>
                  <p className="mt-3 text-base text-[#14261A]/75">Your ticks are saved on this device only.</p>
                </motion.article>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <section id="forms" aria-labelledby="forms-t" className={cn(sectionCls, "bg-[#FBF8F1]")}>
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            id="forms-t"
            eyebrow="Forms"
            title="Official forms"
            highlight="forms"
            intro="Download, complete and submit as the form instructs. Most services now start online through the right portal."
            action={
              <label className="block w-full sm:max-w-sm">
              <span className="block text-lg font-semibold text-[#14261A]">Find a form</span>
              <span className="mt-2 flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-black/15 transition focus-within:ring-[3px] focus-within:ring-[#FFD84D]">
                <Search className="h-5 w-5 shrink-0 text-[#0A4A13]" aria-hidden="true" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a form" className="min-h-14 w-full min-w-0 bg-transparent text-lg text-[#14261A] placeholder:text-[#14261A]/60 focus:outline-none focus-visible:outline-none focus-visible:ring-0" />
              </span>
            </label>
            }
          />
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {fl.map((f, i) => (
              <motion.li key={f.pdf} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.07, ease }}>
                <a href={f.pdf} target="_blank" rel="noopener noreferrer" className={cn(calmCard, "flex h-full flex-col p-6", ring)}>
                  <Bubble />
                  <span className="relative flex items-center justify-between">
                    <span className={cn("flex h-14 w-12 flex-col items-center justify-center rounded-xl text-xs font-bold text-white shadow transition-transform duration-300 group-hover:rotate-[-6deg]", f.ext === "PDF" ? "bg-[#B52026]" : "bg-[#1F6A99]")}><FileType className="h-5 w-5" aria-hidden="true" />{f.ext}</span>
                    <span className="inline-flex items-center gap-2 text-base font-semibold text-[#0A4A13]">Download <Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" /></span>
                  </span>
                  <span className="relative mt-5 block flex-1 text-xl font-bold leading-snug text-[#14261A]">{f.title}</span>
                  <span className="relative mt-3 block text-base text-[#14261A]/75">Published {new Date(f.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </motion.li>
            ))}
          </ul>
          <Rise className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <VerifyNote>Checklists reproduce the documentation requirements in the revised Service Charter (May 2026). Your PFA or the relevant PenCom department may ask for more in particular cases.</VerifyNote>
            <Link to="/services#portals" className={cn(calmCard, "flex items-center gap-5 p-6", ring)}>
              <IconTile icon={Globe} />
              <span className="min-w-0 flex-1"><span className="block text-xl font-bold tracking-tight">Applying online?</span><span className="mt-1 block text-lg text-[#14261A]/80">Find the right portal: eHub, PCRS, PENCAP and more</span></span>
              <ArrowChip />
            </Link>
          </Rise>
        </div>
      </section>
      </div>
    </MotionConfig>
  );
}
