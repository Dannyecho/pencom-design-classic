import { Search } from "lucide-react";
import StatusPage from "@/components/layout/StatusPage";

/** 404 in the classic look: dark grid banner and a floating card of quick links (server component, no motion). */
export default function NotFound() {
  return (
    <StatusPage
      chip="Error 404"
      chipIcon={Search}
      title={
        <>
          We can’t find{" "}
          <span className="relative inline-block text-[#F4D27A]">
            that page
            <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute -bottom-2.5 left-0 h-3.5 w-full overflow-visible">
              <path d="M3 10 C 45 3, 95 2, 140 5 S 190 9, 197 6" fill="none" stroke="#CB9615" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </>
      }
      lead="The address may be mistyped, or the page may have moved."
      homeLabel="Go to the home page"
    />
  );
}
