# Classic theme: build and page-styling sessions

The classic homepage and every inner page, rebuilt as a national pension portal. Folder `themes/classic`, port **3015**,
**copied from `themes/calm`**. Run the sessions with `/session classic` (or `/session CL5a`). CL0–CL3 are setup, CL4 is an audit,
CL5a–CL16 restyle and restructure one page (or one part of a page) each, and CL17 closes the theme. After each session:
verify, update its row, and make one commit in `themes/classic` ("Classic CLn: …"). Never push.
Status values: `pending`, `partial`, `done (date)`.

## The target look (classic): "the national portal"
Confident, photographic and well organised. It should feel like a government portal: denser than calm, with real
effects, but never busy.

- **Type:** body `text-base` (16 px) in gray-600, ink `#0A2E10`; card titles `text-xl font-bold`; section titles
  `text-3xl sm:text-4xl font-bold`; figures may be `font-black` (in the dark band only). Meta is never below 12 px
  (the homepage's 11 px chips go up to 12 px).
- **Section title:** the app's `SectionHeading` (eyebrow pill with a green dot, title, gradient highlight with a drawn
  gold underline), usually in a **split row**: heading on the left, one outline action on the right (`lg:flex-row lg:items-end`),
  as on the homepage's services, figures and news sections.
- **Backgrounds:** white pages; soft band `bg-gradient-to-b from-white via-[#F4F7F2] to-white`; flat `#F4F7F2`
  panels. **One full-width dark band per page:** `#04240A` with `GridBackdrop`, a green blur (`#117F21]/40 blur-[160px]`)
  and a gold blur (`#CB9615]/15`). This is the page's signature section.
- **Cards:** `rounded-3xl border border-gray-200/80 bg-white`; on hover they lift 2 px (`-translate-y-0.5`) with a soft green shadow
  (`0_24px_50px_-24px_rgba(10,74,19,0.4)`). **List panels** (`rounded-3xl border bg-white divide-y divide-gray-100`,
  rows `hover:bg-[#F7FAF6]`) are used a lot. Icon tiles are mint `#E8F5E9`/green and fill green on hover; portal-style tiles are dark
  `#04240A` with a gold icon that turns 6°. A **featured card** uses the dark green gradient
  (`from-[#04240A] via-[#0A4A13] to-[#117F21]`) with a grid. Status cards have a coloured 4 px left bar and a level chip
  (red, amber or blue, as in homepage Notices).
- **Buttons:** primary gold `bg-[#CB9615] text-[#1A1206] rounded-xl min-h-12 font-semibold` (hover `#E0AA22`, gold
  shadow); secondary `border border-[#117F21]/25 bg-white text-[#117F21] rounded-xl`; on dark backgrounds
  `border-white/20` with a gold hover. Segmented controls are a `rounded-2xl bg-white p-1.5 ring-1 ring-gray-200` group with a sliding
  green `layoutId` pill. Chips are `rounded-full border-gray-200 bg-[#F7FAF6]`. Gold text on light backgrounds is `#7A5200`. Focus ring `#FFD84D` 3 px.
- **Motion (use these):** a slow Ken Burns zoom on banner photos; banner titles that rise word by word (`t()` +
  `data-i18n-done`, as in HomeHero); a floating card that rises over the banner; sliding `layoutId` pills; a subtle
  `Spotlight` on list panels and portal cards; `Tilt` on the one featured card per page; `CountUp` and growing bars in the dark band.
  Animate with `y`, never `x` (the homepage uses `x` in three places, and CL1 changes them).
  `MotionConfig reducedMotion="user"`.
- **Text on photos is allowed** (unlike calm), but only over a dark shade under the words (`from-[#021a07]/90`),
  checked for 4.5:1 contrast at its lightest point.

## The three page shapes (this is what makes it a different site)
1. **Portal page** (About, Services, Resources, Connect): `PhotoBanner` → `FloatingBar` → a 12-column body with a
   sticky **`SideNav`** in 3 columns (vertical "On this page" list in the AudienceTasks tab style: gray-50 rows, green
   gradient active pill, section icons; under it "Related pages" as a list panel and a small dark "Need help?" card with chat and call),
   and the sections in 9 columns → **one full-width dark band** after the grid (the page's signature section) →
   a closing strip of two or three link cards (PrototypeLinks style). Below `lg`, SideNav becomes a sticky
   "On this page" disclosure bar under the header.
2. **Tool page** (Operators, Regulations library, Performance, News catalogue, Media): wide, with no sidebar.
   `PhotoBanner` (or a dark grid banner) → `FloatingBar` holding the main tool (search, licence check, figures) → a
   sticky **`TabStrip`** (segmented control, `layoutId` pill, links to sections) → full-width content → one dark band.
3. **Document page** (Charter, Act, regulation docs, Q1 report, Forms, story page): `DocBanner` (dark `#04240A`
   grid banner with crumbs, type chip, title and meta row) → two columns: a sticky `Toc` on the left in SideNav style,
   with tools (text size, print, PDF) under it, and the body text on the right at 16/18/20 px.

## Leftovers to replace (calm → classic)
| Calm has | Classic uses |
| --- | --- |
| cream `#FBF8F1` page, ink `#14261A` | white page, ink `#0A2E10`, gray-600 body |
| warm `#F1EFE8` panels | `#F4F7F2` panels or the soft gradient band |
| green inset panel `#0A4A13` `rounded-[2rem]` | the full-width `#04240A` dark band with `GridBackdrop` |
| `calmCard`, mint bubble, 4 px lift | classic card (2 px lift, green shadow) or a list panel |
| `min-h-14 rounded-2xl text-lg` buttons | `min-h-12 rounded-xl` gold and outline buttons |
| light `PageHero` with an arch photo | `PhotoBanner` + `FloatingBar` (or `DocBanner`) |
| horizontal `SectionNav` | `SideNav` (portal/document pages) or `TabStrip` (tool pages) |
| no-op Spotlight, Tilt and GridBackdrop | the real ones, used sparingly |
| 18 px body everywhere | 16 px body, 18 px leads |

## Grep check
```bash
grep -nE '#FBF8F1|#14261A|#F1EFE8|calmCard|#04140A|#0B1F10|#F2F6F0|#FBFCF9|#F6F8F3|#0E2414|ring-black/5|IconTile|Bubble|rounded-\[2rem\] bg-\[#0A4A13\]' <files>
```
This should print nothing for files in scope; kit compat exports are expected in kit files only.

## Session table (paths are relative to `src/views/` unless they start with `src/`)
| ID | Page / route | Files in scope | Status |
| --- | --- | --- | --- |
| CL0 | Scaffold from calm | root files, `CLAUDE.md` | done (2026-11-21): copy of calm on port 3015 (dev + start), package `pencom-theme-classic`, classic `CLAUDE.md` + README; typecheck, build, 200s and 404s checked |
| CL1 | Homepage `/` | `HomeClassic.tsx`, `homeclassic/*`, `src/app/page.tsx` | done (2026-11-21): classic homepage ported (slider + QuickFind, tasks, notices, services, portals, news, figures band, help, prototype links); dark slider shade, `y` motion, 12 px chips, 44 px targets; HomeCalm removed |
| CL2 | Kit: banners, floating bar, SideNav, TabStrip, dark band, cards, dialogs, document kit | `theme/*`, `docs/kit.tsx`, `about/primitives.tsx` | done (2026-11-21): real `Spotlight`/`Tilt`/`GridBackdrop`; classic `Headline` (12 px eyebrow, ink `#0A2E10`); new `PhotoBanner`, `FloatingBar`, `PortalLayout`/`SideNav` (+ phone disclosure bar), `TabStrip`, `DarkBand`, `ClosingLinks`, `Tile` and class strings; compat `PageHero` = dark grid banner with actions/aside floating over it, `SectionNav` → `TabStrip`, `DarkBackdrop` = grid band, dialogs with a `#04240A` bar; `DocBanner` (= `DocHero`), gold `PrimaryBtn`, outline `GhostBtn`, pill `Toc`, gold `ReadingBar`, `sizes` 16/18/20 |
| CL3 | Chrome, placeholder, 404 | `src/components/**`, `src/app/not-found.tsx`, `src/app/[...slug]/page.tsx` | done (2026-11-21): `#04240A` top bar with a compact reportgov badge; white nav with a sliding mint `layoutId` pill and gold-green underline; full-width mega menus (list-panel columns + dark featured overview card); footer = `#04240A` grid band with green/gold blurs, white newsletter card floating over its top edge, brand + 4 link columns (new "Get help"), portal tiles; NoticesBell/Promo/Cookie/QuickLinks/Chat (gold launcher)/A11y/Language widgets in classic tokens (dark title bars, list rows, left status bars, `rounded-xl` buttons); 404 and placeholder share server-only `layout/StatusPage` (dark grid banner + floating quick-links card); no new i18n keys |
| CL4 | Baseline audit | none edited | done (2026-11-21): 24 URLs at 1400/390 px (19 routes, 2 stories, 1 regulation doc, `/mobile`, 2 missing pages): one h1 each, no sideways scroll, no console errors; grep 453 lines in 31 files of `src/views` (worst: Article 33, performance/Sections 32, about/sections 28); `/news/<missing>` is HTTP 200 (fix in CL13b); "Audit (CL4)" lines added; no code changed |
| CL5a | About part 1 (overview, mission, structure) | `about/AboutPage.tsx`, `about/sections.tsx` | done (2026-11-21): first portal page: Abuja `PhotoBanner` (word rise, gold mark, gold + dark-outline actions), `FloatingBar` with a four-fact `gap-px` strip (3 CountUps + 2004), `PortalLayout` SideNav (6 sections with icons, related pages, Need help card); mandate as a 2×2 spotlight panel with mint tiles; mission the featured gradient card with Tilt beside a vision card with a gold edge; values a list panel; org chart with a dark Board pill, DG card, Commissioners in two columns on a green spine with gold junction dots; 4 new i18n keys |
| CL5b | About part 2 (executive, history, charter) | `about/sections.tsx` | done (2026-11-21): leadership as a six-card directory (photo above the name, role chip, bio, View profile → classic Modal; DG card with gold edge and chip); history is the page's dark band (desktop year rail with a growing gold track and one chapter open below, phone vertical timeline with a scroll-filled line, % figures get growing bars); charter on the soft band (gap-px standards grid with Spotlight, gold "Read the full charter", Tell us + Visit us cards); `calmCard`/`IconTile` deleted; 2 new i18n keys |
| CL6 | Service Charter | `charter/CharterPage.tsx` | done (2026-11-21): first document page: `DocBanner` (gold Signed PDF, dark-outline complaint, 4-fact meta grid) with an "At a glance" `FloatingBar` (CountUp figures); TabStrip; standards as a Spotlight list-panel table (dark time tile, service / department / time columns, rows open to a checklist with print + ask); complaints the dark band (gold step chips on a growing gold line, glass cards); promise = featured mission card with Tilt + values panel; full text beside a sticky kit `Toc` + `DocTools`, `PdfCard` + `VerifyNote`; kit: `DocBanner floating`, Toc no longer scrolls the window; 1 new i18n key |
| CL7 | Services | `services/ServicesPage.tsx`, `services/Calculator.tsx` | done (2026-11-21): portal page: contributor `PhotoBanner` (gold calculator + dark-outline portals actions), floating "I want to" picker with most-used chips; SideNav beside journeys (AudienceTasks tabs with arrow keys + panel: light header, who/needs pair, eligibility as a list panel with Yes/No segments and a status result, steps on dark tiles with a growing green→gold line, gold-edged "where next"), portal cards (Spotlight, dark tile, hostname) and help (assistant featured card with Tilt, complaint and PFA cards); calculator is the dark band (sliders on glass, gold growth line, `font-black` estimate, bars grow on view); ClosingLinks; classic handoff dialog; no new i18n keys |
| CL8 | Operators | `operators/OperatorsPage.tsx` | done (2026-11-21): tool page: laptop `PhotoBanner` (dark-outline Report action), licence check in the `FloatingBar` with a featured register panel (PFA/PFC/CPFA `font-black` CountUps + gold Directory button), TabStrip with icons; directory defaults to a Spotlight list panel (type column header, city chip, icon contact buttons on `lg`, gradient hover bar) with a Cards toggle, type tabs as a segmented control with a gradient pill, City/Layout as small segmented controls; numbered 1-2-3 process on the soft band with a line that grows (scaleX on desktop, scaleY on phones); fund finder is the dark band (status segmented with a sliding pill, green→gold age track, glass fund cards); performance = featured card with Tilt and growing bars, complaint = red-bar status card; drawer with a featured header and list panels; 1 new i18n key |
| CL9a | Resources part 1 (hero, guides) | `resources/ResourcesPage.tsx`, `resources/Guides.tsx` | done (2026-11-21): portal page: woman-with-phone `PhotoBanner` (photo desaturated, gold guides + dark-outline publications actions), floating knowledge search (gold Search, results as a list panel with dark tiles) with a five-count "What’s here" strip; SideNav (6 sections with icons, related Services/Regulations/Contact us) beside guides → publications/forms; learning full width, closing links; guides as classic cards with a featured gradient "Start here" card (tilt); guide dialog in classic tokens (16/18/20 px); no new i18n keys |
| CL9b | Resources part 2 + `/resources/faq` | `resources/Library.tsx`, `FaqGlossary.tsx`, `compat.tsx` | done (2026-11-21): FAQ, glossary, publications and downloads as `portalSec` sections in the portal column; FAQ in the homepage accordion style (search + group segmented control with a sliding pill, chips, gradient edge on the open answer, Yes/No outline buttons, "Still have a question?" panel with a dark tile); glossary A–Z as a segmented letter control (empty letters disabled) and classic cards with a dark letter tile and a growing top line; publications: New Q1 card with a gradient edge, three covers (featured gradient with grid / mint / gold; wide on phones), type tabs as a segmented control, year chips with a sliding pill, Spotlight list panels with book thumbnails that tip on hover (official titles), monthly as a `gap-px` month grid, annual reports in two columns; forms as a Spotlight list panel beside a `#F4F7F2` language panel; learning is the dark band (glass video card, gold play with a soft ping, playlist with a sliding gold "now" bar); calm helpers moved to `legacy/calm.tsx`; no new i18n keys |
| CL10 | Forms + Q1 report | `forms/FormsPage.tsx`, `report/ReportPage.tsx` | done (2026-11-21): document pages on white: sticky Toc + "Text size" panel beside the body; forms: who-filter as a segmented control with a sliding pill, checklists as a Spotlight list panel (dark count tiles, gold when complete, progress bar, sliding gradient edge on the open one), open checklist with a featured-gradient header + gold ring, list-panel ticks sized by DocTools, `#F4F7F2` footer; forms as a Spotlight download list panel with a search field; "Applying online?" featured card with Tilt; report: tiles as a `gap-px` figure grid, domain status Spotlight list panel, DG quote featured card with grid + Tilt, domain tabs as a segmented control with status dots, kit `sizes` (16/18/20), priorities as a `gap-px` Spotlight grid; serif dropped; no new i18n keys |
| CL11a | Regulations library | `regulations/{RegulationsPage,Sections,Library,DocDrawer}.tsx` | done (2026-11-22): tool page: dark grid banner (no photo) with the h1 + gold mark, a white search field with a gold Search, dark-outline "Try" chips and the four type counts as a glass `gap-px` grid (`font-black` CountUps, gold top line on hover; each filters the library); "Latest issued" `FloatingBar` (3 newest as a `gap-px` grid + featured Act link with a dark tile); TabStrip with icons; latest rail of classic cards with the newest on the featured gradient with Tilt; library on the soft band: sticky white search/sort bar, facets in their own column under a dark "Filters" bar (24 px boxes, 44 px rows, histogram on a `#F4F7F2` panel), results as a Spotlight list panel (mint tile, chips, mono date, growing gradient edge, outline PDF), dashed empty state; the Act is the full-width dark band (gold sliding pill tabs, glass panel, `font-black` CountUp stat, growing progress track); compliance: self-check card with a `#F4F7F2` header, score ring, list-panel duties with a green edge when ticked, status card result; operators list panel with Spotlight; "Report an employer" red-bar status card; policies as Spotlight cards with dark tiles; drawer header on the featured gradient (gold PDF, dark-outline buttons), metadata `gap-px` grid, "Replaced" red-bar status card, related docs as list panels. Calm `outlineBtn` export kept in `Sections.tsx` for connect/newsroom (remove in CL12/CL13). No i18n (always English) |
| CL11b | Act + regulation docs | `regulations/PensionAct.tsx`, `regulations/RegDocPage.tsx` | pending |
| CL12a | Connect part 1 | `connect/ConnectPage.tsx`, `connect/Sections.tsx` | pending |
| CL12b | Connect part 2 (complaint form) | `connect/CaseForm.tsx` | pending |
| CL13a | News catalogue | `newsroom/NewsCatalog.tsx`, `newsroom/parts.tsx` | pending |
| CL13b | News story | `news/Article.tsx` | pending |
| CL14a | Performance part 1 | `performance/PerformancePage.tsx`, `performance/Sections.tsx` | pending |
| CL14b | Performance charts | `performance/charts.tsx`, `performance/data.ts` | pending |
| CL15 | Media | `media/MediaPage.tsx` | pending |
| CL16 | Chronicles | `chronicles/ChroniclesPage.tsx`, `chronicles/PreviewPages.tsx` | pending |
| CL17 | Site-wide sweep and close-out | any | pending |

## Session notes (what each session builds)

**CL0 Scaffold.** `rsync -a --exclude node_modules --exclude .next --exclude .git --exclude 'tools/i18n/.out'
--exclude tsconfig.tsbuildinfo --exclude SESSIONS.md themes/calm/ themes/classic/`. Set the package name to `pencom-theme-classic`
and port 3015 (dev and start scripts; `package-lock.json` name too). Install, typecheck and build must all pass. Write
`CLAUDE.md` (copy calm's; change the title, port, "copied from calm on <date>" and the Look section to the target
look above; status "in progress"). Run `git init` and make the baseline commit "Classic CL0: copy of calm as baseline". Check that
`/`, `/about` and `/regulations/pension-reform-act` return 200 on 3015 and that a bad path returns 404.

**CL1 Homepage.** Port `Home.tsx` → `views/HomeClassic.tsx` and `home/{HomeHero,AudienceTasks,Figures,Services,Stories}.tsx` →
`views/homeclassic/` with the `/port-page` transform. Order: slider + QuickFind → section bar → I am a… → notices and regulations →
services → portals → news and video → figures (dark band) → help and FAQ → prototype links. The data is already in
`views/home/data.ts` (slides, popularTasks, audiences, figures, assetGrowth, notices, latestRegulations). Port
`app/src/components/ReportGovBadge.tsx` (calm doesn't have it). Fixes while porting:
- The slider's desktop shade starts at `#c3c8c5d9` (light grey under white text). Change it to a dark shade and check contrast.
- Change the `x` motion in the slide text, the notices (`x:-20`) and the side news (`x:24`) to `y`/fade.
- Raise the 11 px chips to 12 px.
- Put the h1 (sr-only "National Pension Commission") and `homeSections` in.
- Keep the cookie banner and promo popup coordinated the way calm does (no stacking).

Point `src/app/page.tsx` at HomeClassic and delete `HomeCalm` + `homecalm/` once nothing imports them. The homepage keeps
the A11y widget. Verify `/`.
*Done (CL1):* the homepage still uses the kit's calm `SectionNav`, `SectionHeading`, and the no-op `Spotlight`/`Tilt`/`GridBackdrop`;
CL2 converts them, so `/` gains the grid, spotlight and tilt then. Sections use `scroll-mt-[170px]` (the calm bar is ~84 px);
re-check `/#help` lands under the bar once `TabStrip` replaces it. `ReportGovBadge` is in `src/components` (44 px, labelled new tab).
Build still warns about `duration-[1.2s]` in `connect/Sections.tsx` and `duration-[1500ms]` in `resources/Library.tsx`: fix in CL12a/CL9b
with `[transition-duration:…]`.

**CL2 Kit (setup; every page compiles throughout).** Keep all existing exports.
- `about/primitives.tsx`: bring back the real `Spotlight`, `Tilt` and `GridBackdrop` from the app; `SectionHeading` and
  `Headline` in classic sizes (eyebrow 12 px, green ink `#0A2E10`, `dark` variant for the band).
- `theme/ui.tsx` **new:**
  - `PhotoBanner({ crumbs, chip, title, mark?, intro, image, srcSet, position?, actions? })`: full width, Ken Burns, dark shade, word-rise h1.
  - `FloatingBar({ eyebrow, title, intro?, children })`: white `-mt-14` card with a gold hairline.
  - `PortalLayout({ sections, related?, children })`: SideNav + 9-column main; disclosure bar on phones.
  - `SideNav`, `TabStrip({ sections, pillId })`.
  - `DarkBand({ id, children })`: full width, `#04240A`, grid, blurs.
  - `ClosingLinks`, and class strings `card`, `listPanel`, `goldBtn`, `outlineBtn`, `chip`, `Tile`.
- `theme/ui.tsx` **compat:** `PageHero` → renders a dark grid `DocBanner` (no photo) until its page is converted;
  `SectionNav` → `TabStrip`; `DarkBackdrop` → the grid band backdrop; `FramedPanel` → classic card; `Modal`/`Drawer`
  get a white body with a `#04240A` title bar and a labelled Close; `sectionCls` → `py-14 sm:py-20 scroll-mt-[150px]`.
- `docs/kit.tsx`:
  - `DocBanner` (and `DocHero` mapped to it) on dark grid; `PrimaryBtn` gold `rounded-xl`, `GhostBtn` green outline.
  - `Toc` in SideNav style; `ReadingBar` gold.
  - `sizes` 16/18/20 px; `darkCard` → `#04240A` gradient card; `glowLight` → a soft green glow string again.

Verify `/`, `/about`, `/regulations/pension-reform-act` and `/services`. Pages look half converted; that is expected.
*Done (CL2):* `PhotoBanner`, `FloatingBar`, `PortalLayout`/`SideNav`, `DarkBand` and `ClosingLinks` compile but no page uses them yet:
the first page that does (CL5a About) must check them in the browser (word rise + mark, Ken Burns, SideNav scroll-spy and the
phone disclosure bar, the "Need help?" card). `sectionCls` keeps `scroll-mt-[170px]` (header 92 + TabStrip ~72); `/#help`
lands under the bar. `PhotoBanner` takes `alt` (default empty, decorative). The SideNav's "On this page", "Related pages",
"Need help?", "Ask the assistant or call us." and "Start a chat" need `/i18n-pass` when the first page uses them (CL5a).
`spot` sets `--x/--y` again and `glowLight` is a real glow string, so old `onPointerMove={spot}` call sites glow.

**CL3 Chrome.**
- **Header:** classic portal header, still 92 px: a 28 px `#04240A` top bar (phone line, language, search, "Report fraud" badge) and a 64 px white nav
  that gains a shadow on scroll. Mega menus are white `rounded-3xl` panels with list-panel rows and a featured dark card.
- **Footer:** dark `#04240A` with a grid, four link columns with gold headings, and a white newsletter card floating over its top edge (`-mt-14`).
- **Widgets** in classic tokens: NoticesBell (level chips and left bars), PromoPopup, CookieConsent, QuickLinks, Chat launcher, A11y widget.
  Keep calm's "no auto-open Notices" and the promo-then-cookie order unless the user says otherwise.
- **404 and `[...slug]`:** server-only, a dark grid banner and a white floating card with search links.

Verify `/`, `/about` and a 404.
*Done (CL3):* header search stays in the white nav (a labelled 44 px button) rather than the 28 px top bar; the top bar holds
offices, reportgov (md+), phone and language. Mega menus with several columns are positioned against the nav container
(`inset-x-4`), single-column ones against their item. Footer link labels reuse existing dictionary keys ("Get help",
"Zonal Offices", "Overview" in the mega card), so no `/i18n-pass` was needed. `ReportGovBadge` takes `compact`.

**CL4 Audit.** Every route at 1400 and 390 px; grep counts per file; add an "Audit:" line to each page session. Fix crashes only.
*Done (CL4):* no crashes, so no code changed. The kit, chrome and homepage are clean (0 grep hits in `theme/`, `docs/`, `components/`, `homeclassic/`). Leftovers by token across `src/views`: `#14261A` 249, `#FBF8F1` 76, `calmCard` 59, `#F1EFE8` 54, `IconTile` 46, `Bubble` 24 (showcase tokens `#0B1F10`, `#04140A`, `#F2F6F0` are gone). Also to replace per page: 23 compat `PageHero`, 24 `SectionNav`, 26 `DarkBackdrop`, 67 `min-h-14`, 326 `text-lg`. Every inner page except forms, Q1 report, the Act, regulation docs, stories and Chronicles shows one full-width dark block (the compat banner); none has its real dark band yet. 404s: `/no-such-page` and `/regulations/doc/<missing>` answer 404; `/news/<missing>` answers 200. Audit script (Playwright, counts calm-ink elements, dark blocks, glass, weight 900, text under 16 and 12 px, overflow offenders) was in the session scratchpad; the grep above reproduces the file counts (the table row counts matching lines; the "Audit (CL4)" lines count token occurrences, so they run a little higher).

**CL5a About part 1** (portal page). Banner: `about-*`/Abuja photo; title "About PenCom". FloatingBar: four quick facts as a
`gap-px` figure strip (CountUp). SideNav: overview, mission, structure, executive, history, charter. Mandate and values
as a list panel with icon tiles; vision and mission as a split pair (mission as the featured gradient card with Tilt).
Org chart: classic cards with green connectors.
Audit (CL4): `AboutPage.tsx` 3 grep hits (`#14261A` 2, `#FBF8F1` 1; compat `PageHero` + `SectionNav`, 2 `min-h-14`), `sections.tsx` 28 (shared with CL5b: `#14261A` 13, `calmCard` 8, `IconTile` 5, `#F1EFE8` 1, 1 `rounded-[2rem] bg-[#0A4A13]` inset panel). Renders 327 elements in calm ink `#14261A`, 1 full-width dark block (the compat banner), 29 text items under 16 px at 1400 (38 at 390). One h1, no overflow at 390, no console errors.
*Done (CL5a):* the kit's `PhotoBanner`, `FloatingBar`, `PortalLayout`/`SideNav`/disclosure bar checked in the browser (word rise + mark, Ken Burns, scroll-spy, phone bar closes after a jump and lands at 150 px). Page order is now overview → mission → structure → executive **inside** the portal grid, then history and charter full width after it (history becomes the dark band, charter the closing strip). Sections in the grid use a local `portalSec` (`scroll-mt-[150px]`, no side padding, grey top rule); `#values`, `#board`, `#why-us`, `#executive`, `#history`, `#charter` checked. `calmCard`/`IconTile` are kept at the top of `sections.tsx` only for History, Leadership and Charter: delete them in CL5b. Leadership sits in the ~926 px main column now, so plan it for that width. New keys (ha/yo/ig): "Related pages", "Need help?", "Ask the assistant or call us.", "Established". At 900 px window height the sticky sidebar's phone button is just below the fold (sidebar ~760 px tall); tighten in CL17 if it matters.
**CL5b About part 2.** Executive: directory grid (photo above the name, white cards, profile in the classic Modal).
History: the page's **dark band**, a horizontal-on-desktop / vertical-on-phone timeline with year chips and growing bars
(no `x` motion). Charter teaser: closing strip (charter, contact, service standards).
Audit (CL4): see CL5a for `sections.tsx`. Executive, history and charter teaser are calm layouts (calm cards, mint bubbles); the profile dialog already uses the classic Modal.
*Done (CL5b):* History uses one `<ol>` for both layouts: each `<li>` is `lg:contents`, so the desktop year buttons sit in grid row 1 and the open chapter (`id=history-XXXX`, the scroll target) in row 2; inactive chapters are `lg:hidden`. `History` reads the hash (with `sectionAliases`) and opens that chapter, so `#signing` and `#history-2019` land on it at 1400 and 390 px. Desktop rail buttons have `aria-expanded`/`aria-controls`; the phone year chip is plain text. Chapter periods stay English (dates). New keys (ha/yo/ig): "If we fall short, tell us.", "Commission Secretary / Legal Adviser". `find-missing.py`/`coverage.py` need Python Playwright, which isn't installed; the CL5b checks used Node Playwright from the npx cache with the 1254 headless shell.

**CL6 Service Charter** (document page). DocBanner with "Signed PDF" gold and "Make a complaint" outline buttons.
Toc sidebar with search (keep `aliases`) and text size. Standards as a filterable **list panel table** (department, service,
time) instead of cards. Complaints steps 1–4 in the **dark band** (gold step chips on a line). Full text stays English.
Audit (CL4): `CharterPage.tsx` 12 hits (`#FBF8F1` 4, `calmCard` 3, `#F1EFE8` 3, `#14261A` 2; compat `PageHero`, `SectionNav`, `DarkBackdrop`; 5 `min-h-14`). 208 calm-ink elements, 21 items under 16 px. One h1, no overflow, no console errors.
*Done (CL6):* `DocBanner` takes `floating` (pb-24/28) so a `FloatingBar` can rise over it without covering the meta grid. **Kit fix:** `Toc` used `scrollIntoView({block:"nearest"})` to keep its active row visible, which also scrolled the window: any page whose Toc sits below the fold loaded scrolled down to it. It now scrolls only its own list (checked on the charter, the Act and the Q1 report: load at 0, no drift). Charter section ids `#standards #complaints #promise #full-text #c-N` land at 170 px at 1400 and 390. The count is now "{n} services" as whole words (was "service"+"s", shown as "iṣẹs" in Yoruba). Dev server pitfall: running `npm run build` while `npm run dev` is up left the dev server serving the old `kit.tsx` (hydration mismatch on the banner padding); checks were run on `next start -p 3025` instead. New key (ha/yo/ig): "Time standard"; dictionaries now 1,703 keys each.

**CL7 Services** (portal page). Banner: contributor photo. FloatingBar: the "What do you want to do?" picker as a select plus a
gold button. Journeys become the **AudienceTasks pattern**: vertical tabs (PCC, PPP, micro, transfer…) on the left and a panel with
numbered steps, eligibility check and "where next" on the right (hash links `#pcc #ppp #micro` pick the tab). Calculator =
**dark band** (sliders on glass, results with CountUp, bars). Portals as the homepage portal cards (dark tile, hostname, Spotlight).
Help as the homepage HelpFaq right column. Keep the handoff dialog.
Audit (CL4): `ServicesPage.tsx` 26 hits (`#14261A` 10, `#F1EFE8` 6, `IconTile` 4, `#FBF8F1` 4, `calmCard` 2; compat `PageHero` + `SectionNav`; 4 `min-h-14`), `Calculator.tsx` 7 (`#14261A` 5; `DarkBackdrop`). 246 calm-ink elements, 9 small items. One h1, no overflow, no console errors.
*Done (CL7):* order is journeys → portals → help inside the portal grid, then the calculator band full width and the closing strip (Resources, Forms and checklists, Regulations; existing keys). Journey tabs are a `role=tablist` (tabs `svc-tab-<anchor>`, panel `svc-panel`); below `xl` they sit above the panel in a 2/4-column grid. The hidden `#pcc #ppp …` spans and `anchorAlias` are unchanged; `#pcc`, `#micro`, `#ehub`, `#calculator`, `#portals`, `#help` land at 150 px (1400 and 390). The handoff security note is an amber status card (`#B45309`). Banner photo is `opt/pencom-contributor-*` (max 1200 w). Verify pitfall: `pkill -f "next start"` does not stop the `next-server` process; a stale `next start` after a rebuild answers 500 for new chunks, so kill it by the port's PID.

**CL8 Operators** (tool page). Banner: office/laptop photo. FloatingBar: the licence check. TabStrip: directory, how it
works, funds, performance. Directory defaults to a **table/list view** (name, type, city, contact actions) with a card
view toggle and filters in a segmented control; the drawer is kept (`?op=`, focus). How it works: a numbered horizontal process.
Funds selector = **dark band**. PFA returns keep the "sample figures" label. `#pfcs`, `#funds` keep working.
Audit (CL4): `OperatorsPage.tsx` 27 hits (`#14261A` 9, `calmCard` 6, `IconTile` 4, `#FBF8F1` 4, `#F1EFE8` 4; compat `PageHero`, `SectionNav`, `DarkBackdrop`; 6 `min-h-14`). 275 calm-ink elements, 25 small. One h1, no overflow, no console errors.
*Done (CL8):* `#pfas #pfcs #cpfas #penop` still pick the tab and land the directory at 170 px; `#funds` lands at 150 px (DarkBand). `?op=` opens the drawer, Escape closes it, clears `op` and returns focus. The browser window would not shrink below desktop width; 390 px was checked in a 390 px iframe of the page.

**CL9a Resources part 1** (portal page). Banner: woman-with-phone photo. FloatingBar = the homepage QuickFind (search +
popular chips, results in a list panel). SideNav lists every resource section. Guides as classic cards with a featured gradient
guide card; the guide dialog in classic Modal (`?guide=` kept, steps, checklist, listen/print).
Audit (CL4): `ResourcesPage.tsx` 4 hits (compat `PageHero` + `SectionNav`), `Guides.tsx` 11 (`#14261A` 4, `IconTile` 3, `calmCard` 2). Page (and `/resources/faq`, identical): 390 calm-ink elements, the most of any portal page, 39 small at 1400. One h1, no overflow, no console errors.
*Done (CL9a):* FAQ, glossary, publications and downloads now sit **inside** the portal grid's ~926 px main column but still have calm layouts (`sectionCls` with `px-4`, cream `#FBF8F1` bands, their own `max-w-7xl`): CL9b should switch them to a local `portalSec` (`scroll-mt-[150px] border-t … py-14`, no side padding or band colour) and plan for that width. Learning stays full width after the grid and is the place for the dark band; the closing links follow it. The banner photo's pink studio backdrop is muted by a wrapper (`[&>section>img]:saturate-[.3]`) rather than a kit change. Clicking a search result now focuses the field first, so focus returns there when the guide dialog closes (the result button is gone by then). `#annual-reports` (and the other publication hashes) now re-scroll at 900 ms; `#guides` lands at 150 px, `#faq #annual-reports #downloads #learning` and `/resources/faq` at 170 px (1400 and 390).
**CL9b Resources part 2.** Publications as a list panel by year with cover thumbnails and tabs (`#annual-reports` opens
Annual, `?doc=` kept); downloads list panel; FAQ in the homepage accordion style; glossary A–Z with chips;
learning (video) is the **dark band**. `/resources/faq` lands on FAQ.
Audit (CL4): `Library.tsx` 25 hits (`calmCard` 9, `IconTile` 4, `Bubble` 4; `DarkBackdrop`; still has the `duration-[1500ms]` build warning), `FaqGlossary.tsx` 8 (`Bubble` 3, `IconTile` 2), `compat.tsx` 0.
*Done (CL9b):* `calmCard`, `goldBtn` (calm), `pill`, `IconTile` and `Bubble` moved from `resources/Library.tsx` to `src/views/legacy/calm.tsx`; the 14 other files that used them now import from there (forms, report, performance, connect, news, newsroom, regulations). Each later session drops its import; **CL17 deletes `legacy/calm.tsx`** once nothing imports it. `portalSec` is now exported from `resources/Library.tsx`. Learning uses `DarkBand`, so `#learning` lands at 150 px (was 170); every Resources hash (`#guides #faq #glossary #publications #annual-reports #monthly-reports #downloads #learning`) and `/resources/faq` land at 150 px at 1400 and 390 on a fresh load. Annual-accounts thumbnails take the year from the title (the data `year` is the publishing year). The `duration-[1500ms]` build warning is in `connect/Sections.tsx`, not here (Library's `duration-[1.2s]` is now `[transition-duration:1200ms]`).

**CL10 Forms + Q1 report** (document pages). Forms: DocBanner, Toc sidebar (checklists, forms); checklists as a
list panel with a progress bar and an open checklist card (ticks in `pencom:checklists`, `ready` flag); forms as a
download list panel with a search field. Q1 report: DocBanner with figures, tiles as `gap-px` figure grid, domain tabs as
a segmented control, DG quote as featured gradient card; text stays English; print stays white.
Audit (CL4): `FormsPage.tsx` 24 hits (`#14261A` 15, `#FBF8F1` 4, `calmCard` 3, `IconTile` 2, `Bubble` 2; 5 `min-h-14`), `ReportPage.tsx` 23 (`#14261A` 18, 1 `rounded-[2rem] bg-[#0A4A13]` panel). Both already sit under the classic `DocBanner`; no full-width band. Forms 175 calm-ink, 7 small; report 170 calm-ink, 22 small. One h1, no overflow, no console errors (one run of the report at 390 px lost its context to a dev reload; the re-run was clean).

*Done (CL10):* both pages drop `legacy/calm` imports. Forms gains a third section id `#online` (the portal card + verify note) for the Toc; `#checklists`, `#forms`, `#glance`, `#domains`, `#priorities` land at 120 px (no TabStrip on these pages, so `scroll-mt-[120px]` and Toc `top-[116px]` stay). Neither page has a full-width dark band beyond the DocBanner (document pages). Ticks in `pencom:checklists` checked across a reload. Yoruba: "Kí lo nílò láti ṣe ?" shows a space before the "?" (the highlight split in `Headline`, pre-existing); look at it in CL17.

**CL11a Regulations library** (tool page, always English). Dark DocBanner with the search field and type chips inside
it (no photo). TabStrip: latest, library, Act, compliance, policies. Library keeps facets in its own left column (no SideNav)
and shows results as a **list panel** (type chip, date, PDF), as on the homepage "Latest regulations". The Act = **dark band**. Drawer and URL filters kept.
Audit (CL4): `RegulationsPage.tsx` 11 hits (compat `PageHero` + `SectionNav`), `Sections.tsx` 29 (`#14261A` 12, `calmCard`/`IconTile`/`Bubble` 4 each; `DarkBackdrop`), `Library.tsx` 15 (`#14261A` 9, `IconTile` 3), `DocDrawer.tsx` 10 (`#14261A` 7). 267 calm-ink elements, 70 small (75 at 390). The kit `Drawer` slides in on `x` (fixed overlay, no page overflow). One h1, no overflow, no console errors.
**CL11b Act + docs** (document pages). The Act has a Toc sidebar of parts, a sticky search, part headers as `#F4F7F2`
bars, section numbers in mint tiles, and the `?s=` gold ring. Regulation docs: tables with a `#04240A` header and zebra rows; the
newer-version banner as a Warning-style status card. Unknown ids stay 404. Spot-check 3 docs + a missing one.
Audit (CL4): `PensionAct.tsx` 12 hits (`calmCard` 3, `#14261A` 4, `Bubble` 2), `RegDocPage.tsx` 20 (`#14261A` 9, `#FBF8F1` 5, `calmCard` 3). The Act renders 786 calm-ink elements and 721 items under 16 px (body text). `/regulations/doc/no-such-doc` answers **404** as intended. Wide tables scroll in their box; no console errors.

**CL12a Connect part 1** (portal page). Banner: elder-woman-on-call photo. FloatingBar: three contact actions (call, email,
chat) plus social links. SideNav: contact form, track, offices, newsroom. Tracker = **dark band**. Offices: map + state
select + office card (route line and pins share `px()`/`py()`). Newsroom: the homepage NewsMedia layout. No invented hours.
Audit (CL4): `ConnectPage.tsx` 4 hits (compat `PageHero` + `SectionNav`), `Sections.tsx` 25 (`#14261A` 11, `IconTile` 4, `#F1EFE8` 4, `calmCard` 3, `Bubble` 2; `DarkBackdrop`; still has the `duration-[1.2s]` build warning). 189 calm-ink elements, 23 small. Map pins use `x`/`y` as data, not motion. One h1, no overflow, no console errors.
**CL12b Connect part 2.** Complaint form in a white card with a segmented step bar; topic cards; 48 px inputs; errors,
focus order and the confirmation focus kept; `#report` → employer, `#complaint` → PFA.
Audit (CL4): `CaseForm.tsx` 13 hits (`#14261A` 8, `#FBF8F1` 3, `#F1EFE8` 2; 2 `min-h-14`).

**CL13a News catalogue** (tool page). Banner = the top story's photo with its title (shaded; it links to the story).
FloatingBar: search + type chips + year/sort. Below: the homepage NewsMedia lead + side list, then the rest as a **newspaper list**
(thumbnail rows grouped by month) with a cards/list toggle (URL kept). Galleries as a photo strip; media desk = **dark band**.
"Drafts until the CMS" label kept.
Audit (CL4): `NewsCatalog.tsx` 4 hits, `parts.tsx` 23 (`#14261A` 13, `calmCard` 4, `#F1EFE8` 3; compat `PageHero`, `DarkBackdrop`). 251 calm-ink elements, 4 dark blocks, 21 small. One h1, no overflow, no console errors.
**CL13b News story** (document page). PhotoBanner with the story title (word rise, `data-no-translate`), category and date;
left sidebar: share buttons, contents, "more from the newsroom" list panel; body at 16/18/20 px; figures as a `gap-px`
grid; PDF card as featured gradient. Check `q1-2026-industry-report` and `48-hour-approvals`, and a missing slug.
Audit (CL4): `Article.tsx` 37 hits, the most of any file (`#14261A` 24, `#FBF8F1` 4, `calmCard` 3, `IconTile`/`Bubble`/`#F1EFE8` 2 each; one 11 px text class). Stories render ~150 calm-ink elements, no dark band. **`/news/no-such-story` answers HTTP 200** with a "not found" view (the route has no `notFound()`, same as calm); make it a real 404 here. Dev logs a `metadataBase` warning on story pages (Open Graph images). No overflow.

**CL14a Performance part 1** (tool page). The hero **is the dark band**: the homepage IndustryFigures layout (CountUp
grid + asset growth bars) with crumbs and h1. FloatingBar: period + segment controls. TabStrip: coverage, assets,
allocation, funds, fees, compare, method. Compare as a table with checkboxes; method as an accordion. Sample labels kept;
the median line formula stays in step with the race grid.
Audit (CL4): `PerformancePage.tsx` 2 hits (compat `SectionNav`), `Sections.tsx` 38 (`#14261A` 16, `IconTile` 5, `#FBF8F1` 5, `#F1EFE8` 5, `calmCard` 4, `Bubble` 3; compat `PageHero`, `DarkBackdrop`), `data.ts` 1 (`#14261A` as a series colour). 597 calm-ink elements (most of any page), 52 small. One h1, no overflow, no console errors.
**CL14b Performance charts.** Light chart cards; area chart with a gold latest point; donut legend as a list panel;
latest column gold; white tooltip measured to stay inside the chart; CSV/JSON as outline buttons; chart/table toggle as a segmented control.
Audit (CL4): `charts.tsx` 15 hits (`#14261A` 9, `#FBF8F1` 4, `#F1EFE8` 2).

**CL15 Media** (tool page). Banner: a slow photo mosaic (three or four photos crossfading, labelled pause). TabStrip: photos, videos,
follow. Albums as a masonry grid with a gold ring on the chosen album; videos = **dark band** (player + playlist rows);
lightbox with labelled Close, Previous and Next (fade, not `x`), arrow keys, `?photo=`, focus return.
Audit (CL4): `MediaPage.tsx` 23 hits (`#14261A` 14, `#F1EFE8` 5, `#FBF8F1` 4; compat `PageHero`, `SectionNav`, `DarkBackdrop`; 6 `min-h-14`). 421 calm-ink elements, 52 small. The lightbox no longer moves on `x` (calm fixed it). One h1, no overflow, no console errors.

**CL16 Chronicles.** Magazine page: banner with the cover beside the masthead (serif, no flip-book), gold "Read the issue"
(PDF). Inside as classic cards; launch = **dark band** with medals; shelf as a cover row with lift; subscribe in a
floating white card (validation focus kept).
Audit (CL4): `ChroniclesPage.tsx` 15 hits (`#14261A` 6, `#FBF8F1` 5, `calmCard` 2, `#F1EFE8` 2; compat `SectionNav`, `DarkBackdrop`), `PreviewPages.tsx` 13 (`#14261A` 13) plus **23 `text-[9–11px]` classes** (14 visible items under 12 px, the only page with them). No full-width band yet. One h1, no overflow, no console errors.

**CL17 Sweep.** Grep over all of `src/`; all 19 routes + `/mobile` + 404 at 1400/390 px (one h1, no sideways scroll,
no console errors, exactly one dark band per page); `/i18n-pass` for any new strings (banner chips, SideNav labels,
"On this page", "Related pages"); update `CLAUDE.md` status, `docs/HANDOFF.md` and the root `CLAUDE.md` theme table.
