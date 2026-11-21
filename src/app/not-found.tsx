import Link from "next/link";
import { ArrowLeft, MessageCircle, Search } from "lucide-react";

/**
 * 404 in the calm look: cream page, eyebrow pill, bold title with a static gold underline, 18 px text,
 * a large gold "home" button and an outline "ask" button. Server component: CSS only, no motion.
 */
const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]";

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-[#FBF8F1] px-4 py-20 text-[#14261A] sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#E8F5E9] blur-3xl" />
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-[0_30px_60px_-40px_rgba(10,74,19,0.55)] ring-1 ring-black/10 sm:p-14">
        <span className="inline-flex items-center gap-2.5 rounded-full bg-[#E8F5E9]/80 py-1 pl-1 pr-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#0A4A13] ring-1 ring-[#117F21]/15 sm:text-sm">
          <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2E913D] to-[#0A4A13] text-[#F4D27A]">
            <Search className="h-3.5 w-3.5" />
          </span>
          Error 404
        </span>
        <h1 className="mt-6 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem]">
          We can’t find{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#117F21] via-[#2E913D] to-[#9A6B00] bg-clip-text text-transparent">that page</span>
            <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute -bottom-2.5 left-0 h-3.5 w-full overflow-visible">
              <path d="M3 10 C 45 3, 95 2, 140 5 S 190 9, 197 6" fill="none" stroke="#CB9615" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-gray-700">The address may be mistyped, or the page may have moved.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F4D27A] px-6 text-lg font-bold text-[#1A1206] transition hover:bg-[#FFE08F] ${focus}`}>
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Go to the home page
          </Link>
          <Link href="/#chat" className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#117F21] px-6 text-lg font-semibold text-[#0A4A13] transition hover:bg-[#117F21] hover:text-white ${focus}`}>
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Ask PenCom Assistant
          </Link>
        </div>
      </div>
    </section>
  );
}
