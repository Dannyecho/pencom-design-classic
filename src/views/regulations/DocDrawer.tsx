"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/router";
import { motion } from "framer-motion";
import { ArrowLeftRight, ArrowRight, Calendar, Check, Download, FileText, Link2, Tag, Users } from "lucide-react";
import { Drawer, featured, focus, goldBtn, listPanel, listRow, outlineDarkBtn } from "@/views/theme/ui";
import { cn } from "@/lib/utils";
import { GridBackdrop, ease } from "@/views/about/primitives";
import { library, type RegDoc } from "./library";
import { byId, fmtDate, statusStyle, typeStyle } from "./search";

function Related({ label, docs, onOpen }: { label: string; docs: RegDoc[]; onOpen: (id: string) => void }) {
  if (!docs.length) return null;
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">{label}</h3>
      <ul className={cn(listPanel, "mt-3")}>
        {docs.map((d) => (
          <li key={d.id}>
            <button type="button" onClick={() => onOpen(d.id)} className={cn(listRow, "w-full items-start gap-3 py-3.5 text-left sm:px-5")}>
              <span aria-hidden="true" className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", typeStyle[d.type].dot)} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{d.title}</span>
                <span className="mt-0.5 block font-mono text-sm text-gray-600">{d.type} · {fmtDate(d.date)}</span>
              </span>
              <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#117F21]" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Regulatory item (brief §7): metadata, status, relationships, summary and the signed PDF. */
export default function DocDrawer({ id, onClose, onOpen }: { id: string | null; onClose: () => void; onOpen: (id: string) => void }) {
  const live = byId(id);
  const last = useRef(live);
  useEffect(() => {
    if (live) last.current = live;
  }, [live]);
  const d = live ?? last.current;
  const [copied, setCopied] = useState(false);

  const supersededBy = d?.revisedBy ? [byId(d.revisedBy)!] : [];
  const replaces = d?.revises ? [byId(d.revises)!] : [];
  const amends = d?.amends ? [byId(d.amends)!] : [];
  const amendedBy = (d?.amendedBy ?? []).map((x) => byId(x)!).filter(Boolean);
  const more = d
    ? library
        .filter((o) => o.id !== d.id && o.subjects.some((s) => s !== "General" && d.subjects.includes(s)))
        .slice(0, 3)
    : [];

  return (
    <Drawer open={!!live} onClose={onClose} labelledBy="doc-drawer-title">
        {d && (
          <motion.div key={d.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
            {/* Header */}
            <div className={cn(featured, "rounded-none px-6 pb-8 pt-7 sm:px-8")}>
              <GridBackdrop className="opacity-70" />
              <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-[#CB9615]/20 blur-3xl" />
              <div className="relative flex flex-wrap items-center gap-2 text-xs">
                <span className={cn("rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider", typeStyle[d.type].chip)}>{d.type}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 font-semibold ring-1", statusStyle[d.status])}>{d.status}</span>
              </div>
              <h2 id="doc-drawer-title" className="relative mt-4 text-2xl font-bold leading-snug tracking-tight text-white">{d.title}</h2>
              <span aria-hidden="true" className="relative mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-[#F4D27A] to-[#CB9615]" />
              <p className="relative mt-3 text-base text-white/85">
                Issued {fmtDate(d.date)} by the National Pension Commission
              </p>
              <div className="relative mt-6 flex flex-wrap gap-2.5">
                <a href={d.pdf} target="_blank" rel="noopener noreferrer" className={goldBtn}>
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Official document (PDF)
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <Link to={`/regulations/doc/${d.id}`} className={cn(outlineDarkBtn, "group")}>
                  Open full page
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  }}
                  className={outlineDarkBtn}
                >
                  {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Link2 className="h-5 w-5" aria-hidden="true" />}
                  {copied ? "Link copied" : "Copy link"}
                </button>
                <span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span>
              </div>
            </div>

            <div className="space-y-7 px-6 py-7 sm:px-8">
              {d.status === "Revised version available" && supersededBy[0] && (
                <div className="relative flex gap-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 pl-5 text-base text-[#0A2E10]">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B52026]" />
                  <ArrowLeftRight className="mt-0.5 h-5 w-5 shrink-0 text-[#8E1A1E]" aria-hidden="true" />
                  <p>
                    <span className="mr-2 inline-block rounded-full bg-[#FDE8E8] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#8E1A1E]">Replaced</span>
                    A revised version was issued on {fmtDate(supersededBy[0].date)}.{" "}
                    <button type="button" onClick={() => onOpen(supersededBy[0].id)} className={cn("rounded font-semibold text-[#117F21] underline underline-offset-2", focus)}>
                      Read the revised version
                    </button>
                    .
                  </p>
                </div>
              )}

              {/* Metadata (DES-23) */}
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 min-[420px]:grid-cols-2">
                {[
                  { icon: FileText, k: "Document type", v: d.type },
                  { icon: Calendar, k: "Date issued", v: fmtDate(d.date) },
                  { icon: Tag, k: "Reference number", v: null },
                  { icon: Calendar, k: "Effective date", v: null },
                  { icon: Users, k: "Applies to", v: d.appliesTo.join(", ") },
                  { icon: Tag, k: "Subject", v: d.subjects.join(", ") },
                ].map((m) => (
                  <div key={m.k} className="bg-white p-4">
                    <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7A5200]">
                      <m.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {m.k}
                    </dt>
                    <dd className={cn("mt-1 font-semibold text-[#0A2E10]", !m.v && "text-sm font-normal italic text-gray-600")}>
                      {m.v ?? "To be added from the CMS"}
                    </dd>
                  </div>
                ))}
              </dl>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">Summary</h3>
                {d.summary ? (
                  <p className="mt-2 text-base leading-relaxed text-gray-700 sm:text-lg">{d.summary}</p>
                ) : (
                  <p className="mt-2 text-base leading-relaxed text-gray-600">A plain-language summary will be published with this document.</p>
                )}
                <p className="relative mt-3 overflow-hidden rounded-2xl bg-[#F4F7F2] p-4 pl-5 text-sm leading-relaxed text-gray-700">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[#CB9615]" />
                  Summaries help you understand the document. The official wording is in the signed PDF, and that is what applies.
                </p>
              </div>

              <Related label="Replaced by" docs={supersededBy} onOpen={onOpen} />
              <Related label="Replaces" docs={replaces} onOpen={onOpen} />
              <Related label="Amends" docs={amends} onOpen={onOpen} />
              <Related label="Amended by" docs={amendedBy} onOpen={onOpen} />
              <Related label="Related documents" docs={more} onOpen={onOpen} />
            </div>
          </motion.div>
        )}
    </Drawer>
  );
}
