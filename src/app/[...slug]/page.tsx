import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Hammer } from "lucide-react";

/**
 * Pages not yet rebuilt in this theme. Each section gets its own redesigned page in turn; until then,
 * links from the home page land here instead of on an error. Server-rendered calm cream page: CSS only,
 * no motion.
 */
const sections: Record<string, { title: string; blurb: string }> = {
  about: { title: "About PenCom", blurb: "Mission, leadership, history and the Service Charter." },
  services: { title: "Services", blurb: "RSA transfer, Personal Pension Plan, PCC, enrolment, Pencare and the pension calculator." },
  operators: { title: "Operators", blurb: "Licensed PFAs and PFCs, closed operators and related bodies." },
  resources: { title: "Resources", blurb: "Publications, downloads, forms and frequently asked questions." },
  mobile: { title: "Mobile app", blurb: "The PenCom app for Android and iOS." },
  admin: { title: "Admin", blurb: "Content management for Commission staff." },
};

const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: (sections[slug.join("/")] ?? sections[slug[0]])?.title ?? "Page not found" };
}

export default async function ComingSoon({ params }: Props) {
  const { slug } = await params;
  const s = sections[slug.join("/")] ?? sections[slug[0]];
  if (!s) notFound();
  return (
    <section className="relative isolate overflow-hidden bg-[#FBF8F1] px-4 py-20 text-[#14261A] sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#E8F5E9] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-72 w-72 rounded-full bg-[#CB9615]/10 blur-3xl" />
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-[0_30px_60px_-40px_rgba(10,74,19,0.55)] ring-1 ring-black/10 sm:p-14">
        <span className="inline-flex items-center gap-2.5 rounded-full bg-[#E8F5E9]/80 py-1 pl-1 pr-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#0A4A13] ring-1 ring-[#117F21]/15 sm:text-sm">
          <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2E913D] to-[#0A4A13] text-[#F4D27A]">
            <Hammer className="h-3.5 w-3.5" />
          </span>
          Being redesigned
        </span>
        <h1 className="mt-6 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem]">{s.title}</h1>
        <span aria-hidden="true" className="mx-auto mt-4 block h-1.5 w-16 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-700">{s.blurb} This page is being rebuilt to match the new home page.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={`group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F] ${focus}`}>
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Back to the home page
          </Link>
          <Link href="/#chat" className={`group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white ${focus}`}>
            Ask PenCom Assistant
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
