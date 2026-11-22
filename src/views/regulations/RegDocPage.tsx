"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Link } from "@/lib/router";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BookOpenText, Calendar, Download, FileText, Scale, Search, Tag, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ease } from "@/views/about/primitives";
import { library, type RegDoc } from "@/views/regulations/library";
import { byId, fmtDate, statusStyle, typeStyle } from "@/views/regulations/search";
import { webText } from "@/views/regulations/texts";
import { ArrowChip, DocHero, DocTools, GhostBtn, Loading, Mark, PdfCard, PrimaryBtn, ReadingBar, Toc, VerifyNote, ring, sizes, useDocJson } from "@/views/docs/kit";
import { Tile, card, goldBtn, listPanel, listRow } from "@/views/theme/ui";

/**
 * Regulatory item (brief §7 "Regulatory item": reference, dates, status badge, superseded-by link, HTML text, signed PDF,
 * related items; DES-22, DES-23). Route: /regulations/doc/:id
 */

type B = { t: "h"; l: number; x: string } | { t: "p"; n?: string; x: string } | { t: "table"; cap: string; head: string[]; rows: string[][] };
type Text = { id: string; pages: number | null; words: number; blocks: B[] };

const slug = (s: string, i: number) => `h-${i}-${s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;

function DocText({ blocks, q }: { blocks: B[]; q: string }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.t === "h") {
          const H = b.l <= 1 ? "h2" : "h3";
          return (
            <H key={i} id={slug(b.x, i)} className={cn("scroll-mt-[190px] text-[#0A2E10]", b.l <= 1 ? "mt-12 text-2xl font-bold leading-[1.2] tracking-tight first:mt-0 sm:text-[1.75rem]" : "mt-8 text-xl font-bold leading-snug")}>
              <Mark text={b.x} q={q} />
              {b.l <= 1 && <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />}
            </H>
          );
        }
        if (b.t === "table") {
          return (
            <figure key={i} className="my-8 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_24px_50px_-36px_rgba(10,74,19,0.5)] first:mt-0">
              {b.cap && <figcaption className="flex items-center gap-3 border-b border-gray-200/80 bg-[#F4F7F2] px-5 py-3 text-[0.95em] font-bold text-[#0A2E10]"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#CB9615]" />{b.cap}</figcaption>}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-base">
                  {b.head.some((h) => h.trim()) && <thead className="bg-[#04240A] print:bg-white"><tr>{b.head.map((h, k) => <th key={k} scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#F4D27A] print:text-black">{h}</th>)}</tr></thead>}
                  <tbody>{b.rows.map((r, k) => <tr key={k} className="border-t border-gray-100 align-top transition-colors even:bg-[#F7FAF6] hover:bg-[#E8F5E9]">{r.map((c, j) => <td key={j} className={cn("px-4 py-3 leading-relaxed text-gray-800", j === 0 && "font-semibold text-[#0A2E10]")}><Mark text={c} q={q} /></td>)}</tr>)}</tbody>
                </table>
              </div>
            </figure>
          );
        }
        return (
          <p key={i} className={cn("font-serif leading-[1.75] text-gray-800", b.n && "pl-14")}>
            {b.n && <span className="-ml-14 inline-block w-14 font-mono text-[0.9em] font-bold text-[#117F21]">{b.n}</span>}
            <Mark text={b.x} q={q} />
          </p>
        );
      })}
    </div>
  );
}

function Related({ title, docs }: { title: string; docs: RegDoc[] }) {
  if (!docs.length) return null;
  return (
    <div>
      <h3 className="px-1 text-xs font-bold uppercase tracking-[0.18em] text-[#7A5200]">{title}</h3>
      <ul className={cn(listPanel, "mt-3")}>
        {docs.map((d) => (
          <li key={d.id}>
            <Link to={`/regulations/doc/${d.id}`} className={cn(listRow, "relative")}>
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-[#117F21] to-[#CB9615] transition-transform duration-300 group-hover:scale-y-100" />
              <span aria-hidden="true" className={cn("h-3 w-3 shrink-0 rounded-full ring-4 ring-[#E8F5E9]", typeStyle[d.type].dot)} />
              <span className="min-w-0 flex-1">
                <span className="block font-bold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{d.title}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">{d.type} · {fmtDate(d.date)}{webText[d.id] && <span className="rounded-full border border-[#117F21]/20 bg-[#E8F5E9] px-2.5 py-0.5 text-xs font-bold text-[#0A4A13]">Web version</span>}</span>
              </span>
              <ArrowChip />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RegDocPage({ id }: { id: string }) {
  const d = byId(id);
  // Unknown id: the route's not-found.tsx answers with HTTP 404 ("We can't find that document").
  if (!d) notFound();
  return <Doc key={d.id} d={d} />;
}

function Doc({ d }: { d: RegDoc }) {
  const has = webText[d.id];
  const { status, data } = useDocJson<Text>(has ? `/documents/text/${d.id}.json` : null);
  const [tab, setTab] = useState<"read" | "about">(has ? "read" : "about");
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [size, setSize] = useState(0);

  const newer = d.revisedBy ? byId(d.revisedBy) : null;
  const replaces = d.revises ? [byId(d.revises)!].filter(Boolean) : [];
  const amends = d.amends ? [byId(d.amends)!].filter(Boolean) : [];
  const amendedBy = d.amendedBy.map((x) => byId(x)!).filter(Boolean);
  const more = library.filter((o) => o.id !== d.id && o.subjects.some((s) => s !== "General" && d.subjects.includes(s))).sort((a, b) => Number(!!webText[b.id]) - Number(!!webText[a.id]) || b.date.localeCompare(a.date)).slice(0, 4);

  const blocks = data?.blocks ?? [];
  const toc = useMemo(() => blocks.map((b, i) => (b.t === "h" && b.l <= 2 && b.x.length < 90 ? { id: slug(b.x, i), label: b.x.charAt(0) + b.x.slice(1).toLowerCase().replace(/\b(pfa|pfc|rsa|pra|cps|pencom|ppp|fgn|ict)s?\b/gi, (m) => m.toUpperCase()), level: b.l <= 1 ? 1 : 2 } : null)).filter(Boolean) as { id: string; label: string; level: number }[], [blocks]);
  const hits = useMemo(() => {
    const t = dq.trim().toLowerCase();
    if (t.length < 2) return null;
    return blocks.reduce((n, b) => n + ((b.t === "table" ? b.rows.flat().join(" ") : b.x).toLowerCase().split(t).length - 1), 0);
  }, [blocks, dq]);
  const minutes = has ? Math.max(1, Math.round(has.words / 220)) : null;

  return (
    <MotionConfig reducedMotion="user">
      {has && <ReadingBar />}
      <DocHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Regulations", to: "/regulations" }, { label: "Library", to: "/regulations#library" }, { label: d.type }]}
        kind={d.type}
        title={d.title}
        badge={<span className={cn("rounded-full px-3.5 py-1 text-sm font-bold ring-1", statusStyle[d.status])}>{d.status}</span>}
        lead={d.summary || undefined}
        floating={!!newer}
        meta={[
          { label: "Issued", value: fmtDate(d.date) },
          { label: "Status", value: d.status },
          { label: "Applies to", value: d.appliesTo.join(", ") || "All" },
          { label: has ? "Reading time" : "Format", value: has ? `${minutes} min · ${has.pages ?? "?"} pp` : "PDF" },
        ]}
        actions={<>
          <PrimaryBtn href={d.pdf} external><Download className="h-4 w-4" aria-hidden="true" /> Signed PDF</PrimaryBtn>
          {has && <GhostBtn onClick={() => { setTab("read"); document.getElementById("doc-body")?.scrollIntoView({ behavior: "smooth" }); }}><BookOpenText className="h-4 w-4" aria-hidden="true" /> Read online</GhostBtn>}
        </>}
      />

      {newer && (
        <div className="relative z-10 -mt-14 px-4" role="note">
          <div className="mx-auto max-w-7xl">
            <div className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 pl-7 shadow-[0_30px_60px_-36px_rgba(4,36,10,0.55)] sm:p-6 sm:pl-8 lg:flex-row lg:items-center lg:justify-between">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#B45309]" />
              <div className="flex items-start gap-4">
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]"><AlertTriangle className="h-6 w-6" /></span>
                <div>
                  <p className="text-lg font-bold text-[#0A2E10]">A newer version of this document has been issued</p>
                  <p className="mt-1 text-gray-600">Read the newer version: <span className="font-semibold text-[#0A2E10]">{newer.title}</span></p>
                </div>
              </div>
              <Link to={`/regulations/doc/${newer.id}`} className={cn(goldBtn, "group shrink-0 self-start lg:self-auto")}>Open the newer version <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      )}

      <div id="doc-body" className="scroll-mt-24 bg-white text-[#0A2E10]">
        <div className="mx-auto max-w-7xl px-4 pt-8">
          <div role="tablist" aria-label="Document views" className="inline-flex max-w-full gap-1 rounded-2xl bg-white p-1.5 shadow-[0_20px_40px_-28px_rgba(4,36,10,0.55)] ring-1 ring-gray-200">
            {([["read", "Read online"], ["about", "Details and related"]] as const).map(([k, l]) => (
              <button key={k} role="tab" type="button" aria-selected={tab === k} disabled={k === "read" && !has} onClick={() => setTab(k)} className={cn("relative min-h-11 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 min-[400px]:text-base sm:px-5", ring, tab === k ? "text-white" : "text-gray-700 hover:bg-[#F7FAF6] hover:text-[#0A4A13]")}>
                {tab === k && <motion.span layoutId="doc-tab" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0A4A13] to-[#117F21] shadow-[0_10px_24px_-12px_rgba(10,74,19,0.9)]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{l}</span>
              </button>
            ))}
          </div>
          {!has && <p className="mt-4 text-gray-600">A web version of this document is not available yet. Read the signed PDF.</p>}
        </div>

        <AnimatePresence mode="wait">
          {tab === "read" && has ? (
            <motion.div key="read" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }} className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="hidden lg:block print:hidden">
                <div className="sticky top-[116px] space-y-4">
                  {toc.length > 2 && <Toc items={toc} className="[&_ol]:max-h-[calc(100vh-22rem)]" />}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-200/80 bg-[#F4F7F2] p-4">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600">Text size</span>
                    <DocTools size={size} setSize={setSize} />
                  </div>
                </div>
              </aside>
              <div className="min-w-0 space-y-6">
                <div className="sticky top-[92px] z-10 -mx-1 bg-white/95 px-1 pb-2 pt-2 backdrop-blur print:hidden">
                <div className="flex flex-col gap-2 overflow-hidden rounded-2xl bg-white/95 p-1.5 shadow-[0_20px_40px_-28px_rgba(4,36,10,0.55)] ring-1 ring-gray-200 backdrop-blur sm:flex-row sm:items-center print:hidden">
                  <label className="flex flex-1 items-center gap-3 rounded-xl bg-[#F4F7F2] pl-4 pr-1 ring-1 ring-gray-200 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-[#FFD84D]">
                    <Search className="h-5 w-5 shrink-0 text-[#117F21]" aria-hidden="true" />
                    <span className="sr-only">Search this document</span>
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this document" className="min-h-12 w-full min-w-0 bg-transparent text-base placeholder:text-gray-600 focus:outline-none focus-visible:outline-none focus-visible:ring-0" />
                    {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search" className={cn("inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#0A4A13] transition hover:bg-white", ring)}><X className="h-4 w-4" aria-hidden="true" />Clear</button>}
                  </label>
                  <div className="flex items-center justify-between gap-2 px-2 pb-1 sm:pb-0">
                    <span className="text-sm text-gray-600 sm:w-28" aria-live="polite">{hits === null ? "" : <><strong className="rounded-full bg-[#04240A] px-2.5 py-0.5 tabular-nums text-[#F4D27A]">{hits}</strong> match{hits === 1 ? "" : "es"}</>}</span>
                    <div className="lg:hidden"><DocTools size={size} setSize={setSize} /></div>
                  </div>
                </div>
                </div>
                <article className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_40px_80px_-50px_rgba(10,74,19,0.45)] sm:p-10 print:border-0 print:shadow-none" style={{ fontSize: sizes[size] }} aria-label={d.title}>
                  {status === "loading" && <Loading />}
                  {status === "error" && <p>The web version could not be loaded. <a href={d.pdf} className="font-semibold text-[#117F21] underline">Open the signed PDF</a>.</p>}
                  {data && <DocText blocks={blocks} q={dq} />}
                </article>
                <VerifyNote />
              </div>
            </motion.div>
          ) : (
            <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }} className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-gray-200/80 bg-gray-200/80 sm:grid-cols-2">
                  {[
                    [FileText, "Type", d.type], [Calendar, "Date issued", fmtDate(d.date)], [Scale, "Status", d.status],
                    [Users, "Applies to", d.appliesTo.join(", ") || "All"], [Tag, "Subjects", d.subjects.join(", ")], [Calendar, "Effective date", "As stated in the document"],
                  ].map(([Icon, k, v]) => {
                    const I = Icon as typeof FileText;
                    return (
                      <div key={k as string} className="group flex gap-4 bg-white p-5 transition-colors hover:bg-[#F7FAF6] sm:p-6">
                        <Tile icon={I} />
                        <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#7A5200]">{k as string}</dt><dd className="mt-1 font-semibold text-[#0A2E10]">{v as string}</dd></div>
                      </div>
                    );
                  })}
                </dl>
                <PdfCard href={d.pdf} title={d.title} meta={`PDF · issued ${fmtDate(d.date)}`} />
                <p className="text-sm text-gray-600">Reference numbers, effective dates and in-force status are being confirmed by Legal Services and will appear here.</p>
              </div>
              <div className="space-y-6 lg:col-span-5">
                <Related title="Replaced by" docs={newer ? [newer] : []} />
                <Related title="Replaces" docs={replaces} />
                <Related title="Amends" docs={amends} />
                <Related title="Amended by" docs={amendedBy} />
                <Related title="Related documents" docs={more} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-7xl px-4 pb-16">
          <Link to="/regulations#library" className={cn(card, "group flex items-center justify-between gap-4 p-6 text-lg font-bold text-[#0A2E10] hover:text-[#117F21]", ring)}>
            <span>Back to the regulatory library</span>
            <ArrowChip />
          </Link>
        </div>
      </div>
    </MotionConfig>
  );
}
