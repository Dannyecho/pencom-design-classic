"use client";

import { useRef, useState } from "react";
import { Link } from "@/lib/router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, BarChart3, Calendar, ChevronDown, MapPin, MessageCircle, MessageSquareWarning, Phone, Play,
  Smartphone,
} from "lucide-react";
import { latestNews } from "@/lib/data";
import { newsPath } from "@/views/news/data";
import { cn } from "@/lib/utils";
import { GridBackdrop, SectionHeading, Spotlight, ease, reveal } from "@/views/about/primitives";
import { faqs } from "@/views/home/data";
import { openChat } from "@/views/home/SiteSearch";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/* ─────────────────────────── News + video ─────────────────────────── */

export function NewsMedia() {
  const [lead, ...rest] = latestNews.slice(0, 3);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section id="news" aria-labelledby="news-title" className="relative scroll-mt-[170px] overflow-x-clip bg-[#F4F7F2] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading id="news-title" eyebrow="News and media" title="Latest from PenCom" highlight="PenCom" />
          <Link
            to="/news"
            className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-[#117F21]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#117F21] transition hover:border-[#117F21] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
          >
            All news and events
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Lead story */}
          <motion.article {...reveal} className="lg:col-span-7">
            <Link
              to={newsPath(lead)}
              className="group relative block h-full min-h-[420px] overflow-hidden rounded-3xl bg-[#04240A] text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]"
            >
              <img src={lead.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition [transition-duration:1200ms] group-hover:scale-105" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#04240A] via-[#04240A]/60 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                <span className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-[#CB9615] px-2.5 py-1 font-bold uppercase tracking-wider text-[#1A1206]">{lead.category}</span>
                  <span className="flex items-center gap-1 text-white/70">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {fmt(lead.date)}
                  </span>
                </span>
                <span className="mt-4 block text-2xl font-bold leading-tight sm:text-3xl">{lead.title}</span>
                <span className="mt-3 block max-w-xl text-white/75">{lead.excerpt}</span>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F4D27A]">
                  Read the story
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </Link>
          </motion.article>

          <div className="grid grid-cols-1 gap-5 lg:col-span-5">
            {rest.map((n, i) => (
              <motion.article
                key={n.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
              >
                <Link
                  to={newsPath(n)}
                  className="group flex h-full gap-5 overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-24px_rgba(10,74,19,0.4)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
                >
                  <span className="relative block flex-none overflow-hidden rounded-2xl bg-gray-100" style={{ width: "clamp(7rem, 30%, 11rem)" }}>
                    <img src={n.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  </span>
                  <span className="flex min-w-0 flex-col py-2 pr-3">
                    <span className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-[#E8F5E9] px-2 py-0.5 font-bold uppercase tracking-wider text-[#117F21]">{n.category}</span>
                      <span className="text-gray-500">{fmt(n.date)}</span>
                    </span>
                    <span className="mt-2 block font-semibold leading-snug text-[#0A2E10] group-hover:text-[#117F21]">{n.title}</span>
                    <span className="mt-1 line-clamp-2 text-sm text-gray-500">{n.excerpt}</span>
                  </span>
                </Link>
              </motion.article>
            ))}

            {/* Video */}
            <motion.div {...reveal} className="relative overflow-hidden rounded-3xl bg-[#04240A]">
              {playing ? (
                <video ref={videoRef} controls autoPlay poster="/images/site/video-poster-team.webp" className="aspect-video w-full" preload="metadata">
                  <source src="/highlight-video2.mp4" type="video/mp4" />
                </video>
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="group relative block aspect-video w-full text-left text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]"
                >
                  <img src="/images/site/video-poster-team.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105" />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#04240A] via-[#04240A]/30 to-transparent" />
                  <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                    <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-white/30 [animation-iteration-count:3]" />
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0A4A13] shadow-2xl transition group-hover:scale-110">
                      <Play className="ml-1 h-6 w-6 fill-current" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-5">
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#F4D27A]">Video</span>
                    <span className="mt-1 block text-lg font-bold">PenCom at work</span>
                  </span>
                  <span className="sr-only">Play video</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FAQ + help ─────────────────────────── */

export function HelpFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="help" aria-labelledby="help-title" className="scroll-mt-[170px] py-20 sm:py-28">
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-12 px-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeading id="help-title" eyebrow="Questions and help" title="Answers to common questions" highlight="common questions" />
          <ul className="mt-8 space-y-3">
            {faqs.slice(0, 5).map((f, i) => {
              const isOpen = open === i;
              return (
                <motion.li
                  key={f.question}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease }}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-colors duration-300",
                    isOpen ? "border-[#117F21]/30 bg-[#F7FAF6]" : "border-gray-200 bg-white hover:border-[#117F21]/30",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex min-h-14 w-full items-center gap-4 px-5 py-4 text-left font-semibold text-[#0A2E10] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[#FFD84D]"
                    >
                      <span className="flex-1">{f.question}</span>
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition", isOpen ? "rotate-180 bg-[#117F21] text-white" : "bg-gray-100 text-gray-500")}>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                      >
                        <p className="px-5 pb-5 leading-relaxed text-gray-600">{f.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
          <Link to="/resources/faq" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-[#117F21] hover:underline">
            See all questions <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="space-y-4 lg:col-span-5 lg:pt-14">
          {/* Assistant */}
          <motion.div {...reveal}>
            <Spotlight color="rgba(244,210,122,0.22)" className="rounded-3xl bg-gradient-to-br from-[#04240A] via-[#0A4A13] to-[#117F21] p-7 text-white">
              <GridBackdrop className="opacity-50" />
              <MessageCircle className="relative h-9 w-9 text-[#F4D27A]" aria-hidden="true" />
              <h3 className="relative mt-4 text-2xl font-bold">Ask PenCom Assistant</h3>
              <p className="relative mt-2 text-white/75">Quick, plain-language answers from PenCom’s published guidance, any time of day.</p>
              <button
                type="button"
                onClick={openChat}
                className="relative mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#CB9615] px-5 py-3 font-semibold text-[#1A1206] transition hover:bg-[#E0AA22] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]"
              >
                Start a chat <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="relative mt-4 text-xs text-white/70">Never share your RSA PIN, password or bank details in a chat.</p>
            </Spotlight>
          </motion.div>

          {/* Complaint */}
          <motion.div {...reveal}>
            <Link
              to="/connect#report"
              className="group relative flex gap-4 overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-[#B52026]/40 hover:shadow-[0_24px_50px_-24px_rgba(181,32,38,0.35)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDE8E8] text-[#B52026] transition group-hover:scale-110">
                <MessageSquareWarning className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-bold text-[#0A2E10]">Lodge a complaint</span>
                <span className="mt-1 block text-sm text-gray-600">Problems with your PFA, or an employer not remitting? We aim to resolve complaints within 14 working days.</span>
              </span>
              <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-gray-300 transition group-hover:text-[#B52026]" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Contact */}
          <motion.div {...reveal} className="grid grid-cols-2 gap-4">
            <a
              href="tel:094611300"
              className="group rounded-3xl border border-gray-200 bg-white p-5 transition hover:border-[#117F21]/40 hover:shadow-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
            >
              <Phone className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
              <span className="mt-3 block text-xs font-semibold uppercase tracking-wider text-gray-500">Call us</span>
              <span className="mt-1 block font-bold text-[#0A2E10]">09-4611300</span>
            </a>
            <Link
              to="/connect#zonal-offices"
              className="group rounded-3xl border border-gray-200 bg-white p-5 transition hover:border-[#117F21]/40 hover:shadow-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
            >
              <MapPin className="h-5 w-5 text-[#117F21]" aria-hidden="true" />
              <span className="mt-3 block text-xs font-semibold uppercase tracking-wider text-gray-500">Visit us</span>
              <span className="mt-1 block font-bold text-[#0A2E10]">Zonal offices</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Prototype links ─────────────────────────── */

export function PrototypeLinks() {
  const items = [
    { to: "/mobile", icon: Smartphone, title: "PenCom mobile app", body: "Preview the Android and iOS app prototype", tone: "green" },
    { to: "/admin", icon: BarChart3, title: "CMS admin dashboard", body: "Analytics, publishing and operator management", tone: "gold" },
  ];
  return (
    <section aria-label="Prototypes" className="px-4 pb-20">
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-4 md:grid-cols-2">
        {items.map((it) => (
          <motion.div key={it.to} {...reveal}>
            <Link
              to={it.to}
              className="group flex items-center gap-5 rounded-3xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-[#117F21]/30 hover:shadow-[0_24px_50px_-24px_rgba(10,74,19,0.4)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
            >
              <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-110", it.tone === "green" ? "bg-[#E8F5E9] text-[#117F21]" : "bg-[#FFF8E1] text-[#7A5200]")}>
                <it.icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-bold text-[#0A2E10]">{it.title}</span>
                <span className="mt-0.5 block text-sm text-gray-500">{it.body}</span>
              </span>
              <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#117F21]" aria-hidden="true" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
