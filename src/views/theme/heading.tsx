"use client";

import type { ReactNode } from "react";
import Headline from "./Headline";

/**
 * The classic section title with the SectionHeading props (eyebrow, highlight), used by the homepage and inner
 * pages. Sections are not numbered in this theme; `n` is kept for compatibility and ignored.
 */
export function SectionHeading({
  n,
  id,
  eyebrow,
  title,
  highlight,
  intro,
  dark,
  action,
  stacked,
  center,
}: {
  n?: string;
  id: string;
  eyebrow: string;
  title: string;
  highlight?: string;
  intro?: ReactNode;
  dark?: boolean;
  action?: ReactNode;
  stacked?: boolean;
  center?: boolean;
}) {
  return <Headline id={id} n={n} kicker={eyebrow} title={title} mark={highlight} intro={intro} dark={dark} action={action} stacked={stacked} center={center} />;
}

export default SectionHeading;
