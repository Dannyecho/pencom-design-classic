import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

/**
 * Unknown regulation id (HTTP 404) in the calm look: cream page, white card, eyebrow pill, bold title,
 * 18 px text and a large gold "Search the library" button. Server component: CSS only, no motion.
 */
const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

export default function DocNotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-[#FBF8F1] px-4 py-20 text-[#14261A] sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#E8F5E9] blur-3xl" />
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-[0_30px_60px_-40px_rgba(10,74,19,0.55)] ring-1 ring-black/10 sm:p-14">
        <span className="inline-flex items-center gap-2.5 rounded-full bg-[#E8F5E9]/80 py-1 pl-1 pr-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#0A4A13] ring-1 ring-[#117F21]/15 sm:text-sm">
          <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2E913D] to-[#0A4A13] text-[#F4D27A]">
            <Scale className="h-3.5 w-3.5" />
          </span>
          Regulatory library
        </span>
        <h1 className="mt-6 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem]">We can’t find that document</h1>
        <span aria-hidden="true" className="mx-auto mt-5 block h-1.5 w-20 rounded-full bg-gradient-to-r from-[#117F21] to-[#CB9615]" />
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-gray-700">It may have been renamed or withdrawn.</p>
        <div className="mt-9 flex justify-center">
          <Link href="/regulations#library" className={`group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F] ${focus}`}>
            Search the library
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
