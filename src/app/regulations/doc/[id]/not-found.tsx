import { Scale, Search } from "lucide-react";
import StatusPage from "@/components/layout/StatusPage";

/**
 * Unknown regulation id (HTTP 404) in the classic look: the shared dark grid banner with a floating quick-links card,
 * and a gold "Search the library" button instead of the home link. Server component, no motion. Always English.
 */
export default function DocNotFound() {
  return (
    <StatusPage
      chip="Regulatory library"
      chipIcon={Scale}
      title={
        <>
          We can’t find{" "}
          <span className="relative inline-block text-[#F4D27A]">
            that document
            <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute -bottom-2.5 left-0 h-3.5 w-full overflow-visible">
              <path d="M3 10 C 45 3, 95 2, 140 5 S 190 9, 197 6" fill="none" stroke="#CB9615" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </>
      }
      lead="It may have been renamed or withdrawn."
      homeLabel="Search the library"
      homeHref="/regulations#library"
      homeIcon={Search}
    />
  );
}
