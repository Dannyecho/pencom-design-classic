import { notFound } from "next/navigation";
import { Hammer } from "lucide-react";
import StatusPage from "@/components/layout/StatusPage";

/**
 * Pages not yet rebuilt in this theme. Each section gets its own redesigned page in turn; until then,
 * links from the home page land here instead of on an error. Server-rendered classic StatusPage (dark grid
 * banner + floating quick-links card): CSS only, no motion.
 */
const sections: Record<string, { title: string; blurb: string }> = {
  about: { title: "About PenCom", blurb: "Mission, leadership, history and the Service Charter." },
  services: { title: "Services", blurb: "RSA transfer, Personal Pension Plan, PCC, enrolment, Pencare and the pension calculator." },
  operators: { title: "Operators", blurb: "Licensed PFAs and PFCs, closed operators and related bodies." },
  resources: { title: "Resources", blurb: "Publications, downloads, forms and frequently asked questions." },
  admin: { title: "Admin", blurb: "Content management for Commission staff." },
};

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
    <StatusPage
      chip="Being redesigned"
      chipIcon={Hammer}
      title={s.title}
      lead={<>{s.blurb} This page is being rebuilt to match the new home page.</>}
      homeLabel="Back to the home page"
    />
  );
}
