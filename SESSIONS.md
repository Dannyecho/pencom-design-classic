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
| CL4 | Baseline audit | none edited | pending |
| CL5a | About part 1 (overview, mission, structure) | `about/AboutPage.tsx`, `about/sections.tsx` | pending |
| CL5b | About part 2 (executive, history, charter) | `about/sections.tsx` | pending |
| CL6 | Service Charter | `charter/CharterPage.tsx` | pending |
| CL7 | Services | `services/ServicesPage.tsx`, `services/Calculator.tsx` | pending |
| CL8 | Operators | `operators/OperatorsPage.tsx` | pending |
| CL9a | Resources part 1 (hero, guides) | `resources/ResourcesPage.tsx`, `resources/Guides.tsx` | pending |
| CL9b | Resources part 2 + `/resources/faq` | `resources/Library.tsx`, `FaqGlossary.tsx`, `compat.tsx` | pending |
| CL10 | Forms + Q1 report | `forms/FormsPage.tsx`, `report/ReportPage.tsx` | pending |
| CL11a | Regulations library | `regulations/{RegulationsPage,Sections,Library,DocDrawer}.tsx` | pending |
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

**CL5a About part 1** (portal page). Banner: `about-*`/Abuja photo; title "About PenCom". FloatingBar: four quick facts as a
`gap-px` figure strip (CountUp). SideNav: overview, mission, structure, executive, history, charter. Mandate and values
as a list panel with icon tiles; vision and mission as a split pair (mission as the featured gradient card with Tilt).
Org chart: classic cards with green connectors.
**CL5b About part 2.** Executive: directory grid (photo above the name, white cards, profile in the classic Modal).
History: the page's **dark band**, a horizontal-on-desktop / vertical-on-phone timeline with year chips and growing bars
(no `x` motion). Charter teaser: closing strip (charter, contact, service standards).

**CL6 Service Charter** (document page). DocBanner with "Signed PDF" gold and "Make a complaint" outline buttons.
Toc sidebar with search (keep `aliases`) and text size. Standards as a filterable **list panel table** (department, service,
time) instead of cards. Complaints steps 1–4 in the **dark band** (gold step chips on a line). Full text stays English.

**CL7 Services** (portal page). Banner: contributor photo. FloatingBar: the "What do you want to do?" picker as a select plus a
gold button. Journeys become the **AudienceTasks pattern**: vertical tabs (PCC, PPP, micro, transfer…) on the left and a panel with
numbered steps, eligibility check and "where next" on the right (hash links `#pcc #ppp #micro` pick the tab). Calculator =
**dark band** (sliders on glass, results with CountUp, bars). Portals as the homepage portal cards (dark tile, hostname, Spotlight).
Help as the homepage HelpFaq right column. Keep the handoff dialog.

**CL8 Operators** (tool page). Banner: office/laptop photo. FloatingBar: the licence check. TabStrip: directory, how it
works, funds, performance. Directory defaults to a **table/list view** (name, type, city, contact actions) with a card
view toggle and filters in a segmented control; the drawer is kept (`?op=`, focus). How it works: a numbered horizontal process.
Funds selector = **dark band**. PFA returns keep the "sample figures" label. `#pfcs`, `#funds` keep working.

**CL9a Resources part 1** (portal page). Banner: woman-with-phone photo. FloatingBar = the homepage QuickFind (search +
popular chips, results in a list panel). SideNav lists every resource section. Guides as classic cards with a featured gradient
guide card; the guide dialog in classic Modal (`?guide=` kept, steps, checklist, listen/print).
**CL9b Resources part 2.** Publications as a list panel by year with cover thumbnails and tabs (`#annual-reports` opens
Annual, `?doc=` kept); downloads list panel; FAQ in the homepage accordion style; glossary A–Z with chips;
learning (video) is the **dark band**. `/resources/faq` lands on FAQ.

**CL10 Forms + Q1 report** (document pages). Forms: DocBanner, Toc sidebar (checklists, forms); checklists as a
list panel with a progress bar and an open checklist card (ticks in `pencom:checklists`, `ready` flag); forms as a
download list panel with a search field. Q1 report: DocBanner with figures, tiles as `gap-px` figure grid, domain tabs as
a segmented control, DG quote as featured gradient card; text stays English; print stays white.

**CL11a Regulations library** (tool page, always English). Dark DocBanner with the search field and type chips inside
it (no photo). TabStrip: latest, library, Act, compliance, policies. Library keeps facets in its own left column (no SideNav)
and shows results as a **list panel** (type chip, date, PDF), as on the homepage "Latest regulations". The Act = **dark band**. Drawer and URL filters kept.
**CL11b Act + docs** (document pages). The Act has a Toc sidebar of parts, a sticky search, part headers as `#F4F7F2`
bars, section numbers in mint tiles, and the `?s=` gold ring. Regulation docs: tables with a `#04240A` header and zebra rows; the
newer-version banner as a Warning-style status card. Unknown ids stay 404. Spot-check 3 docs + a missing one.

**CL12a Connect part 1** (portal page). Banner: elder-woman-on-call photo. FloatingBar: three contact actions (call, email,
chat) plus social links. SideNav: contact form, track, offices, newsroom. Tracker = **dark band**. Offices: map + state
select + office card (route line and pins share `px()`/`py()`). Newsroom: the homepage NewsMedia layout. No invented hours.
**CL12b Connect part 2.** Complaint form in a white card with a segmented step bar; topic cards; 48 px inputs; errors,
focus order and the confirmation focus kept; `#report` → employer, `#complaint` → PFA.

**CL13a News catalogue** (tool page). Banner = the top story's photo with its title (shaded; it links to the story).
FloatingBar: search + type chips + year/sort. Below: the homepage NewsMedia lead + side list, then the rest as a **newspaper list**
(thumbnail rows grouped by month) with a cards/list toggle (URL kept). Galleries as a photo strip; media desk = **dark band**.
"Drafts until the CMS" label kept.
**CL13b News story** (document page). PhotoBanner with the story title (word rise, `data-no-translate`), category and date;
left sidebar: share buttons, contents, "more from the newsroom" list panel; body at 16/18/20 px; figures as a `gap-px`
grid; PDF card as featured gradient. Check `q1-2026-industry-report` and `48-hour-approvals`, and a missing slug.

**CL14a Performance part 1** (tool page). The hero **is the dark band**: the homepage IndustryFigures layout (CountUp
grid + asset growth bars) with crumbs and h1. FloatingBar: period + segment controls. TabStrip: coverage, assets,
allocation, funds, fees, compare, method. Compare as a table with checkboxes; method as an accordion. Sample labels kept;
the median line formula stays in step with the race grid.
**CL14b Performance charts.** Light chart cards; area chart with a gold latest point; donut legend as a list panel;
latest column gold; white tooltip measured to stay inside the chart; CSV/JSON as outline buttons; chart/table toggle as a segmented control.

**CL15 Media** (tool page). Banner: a slow photo mosaic (three or four photos crossfading, labelled pause). TabStrip: photos, videos,
follow. Albums as a masonry grid with a gold ring on the chosen album; videos = **dark band** (player + playlist rows);
lightbox with labelled Close, Previous and Next (fade, not `x`), arrow keys, `?photo=`, focus return.

**CL16 Chronicles.** Magazine page: banner with the cover beside the masthead (serif, no flip-book), gold "Read the issue"
(PDF). Inside as classic cards; launch = **dark band** with medals; shelf as a cover row with lift; subscribe in a
floating white card (validation focus kept).

**CL17 Sweep.** Grep over all of `src/`; all 19 routes + `/mobile` + 404 at 1400/390 px (one h1, no sideways scroll,
no console errors, exactly one dark band per page); `/i18n-pass` for any new strings (banner chips, SideNav labels,
"On this page", "Related pages"); update `CLAUDE.md` status, `docs/HANDOFF.md` and the root `CLAUDE.md` theme table.
