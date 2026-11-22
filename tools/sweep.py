"""Site-wide sweep: every route at 1400 and 390 px.

Usage: python3 tools/sweep.py [/route ...] > sweep.out   (BASE=http://localhost:3015, CHROME=/usr/bin/google-chrome)
Prints per page and width: HTTP status, number of h1s, sideways overflow after scrolling to the bottom, the page
offsets of full-width #04240A blocks (banner + dark band), elements wider than the screen, visible text under 12 px,
and console errors. Lines that fail (h1 != 1, overflow, errors) end with "<<<".
"""
import os, sys, time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://localhost:3015")
ROUTES = ["/", "/about", "/about/service-charter", "/services", "/operators", "/resources", "/resources/faq",
          "/resources/forms-and-checklists", "/resources/reports/q1-2026", "/regulations", "/regulations/pension-reform-act",
          "/regulations/doc/code-of-corporate-governance-for-licensed-pension-operators", "/connect", "/news",
          "/news/q1-2026-industry-report", "/performance", "/media", "/chronicles", "/resources/chronicles", "/mobile",
          "/no-such-page", "/regulations/doc/nope", "/news/nope"]
JS = r"""() => {
 const vw = document.documentElement.clientWidth, main = document.querySelector('main') || document.body, DK = 'rgb(4, 36, 10)';
 const full = e => e.getBoundingClientRect().width >= vw * 0.97;
 const dark = [...main.querySelectorAll('*')].filter(e => {
   if (getComputedStyle(e).backgroundColor !== DK || !full(e) || e.getBoundingClientRect().height < 150) return false;
   for (let p = e.parentElement; p && p !== main; p = p.parentElement) if (getComputedStyle(p).backgroundColor === DK && full(p)) return false;
   return true; }).map(e => Math.round(e.getBoundingClientRect().top + scrollY));
 const wide = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > vw + 1 &&
   !e.closest('[aria-hidden=true],.overflow-hidden,.overflow-x-auto,.sr-only')).slice(0, 3)
   .map(e => e.tagName + '.' + String(e.className.baseVal ?? e.className).slice(0, 60));
 const small = [...main.querySelectorAll('*')].filter(e => !e.closest('[aria-hidden=true],.sr-only') &&
   [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()) && e.getBoundingClientRect().width > 0 &&
   parseFloat(getComputedStyle(e).fontSize) < 12).slice(0, 3).map(e => e.textContent.trim().slice(0, 30));
 return { h1: document.querySelectorAll('h1').length, sw: document.documentElement.scrollWidth, cw: vw, dark, wide, small };
}"""

with sync_playwright() as p:
    kw = {"args": ["--no-sandbox"], "executable_path": os.environ.get("CHROME", "/usr/bin/google-chrome")}
    b = p.chromium.launch(**kw)
    for w, h in [(1400, 900), (390, 844)]:
        ctx = b.new_context(viewport={"width": w, "height": h})
        ctx.add_init_script("try{localStorage.setItem('pencom:lang','en');localStorage.setItem('pencom:lang-offer-dismissed','1')}catch(e){}")
        pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.on("console", lambda m: errs.append(m.text[:160]) if m.type == "error" and "404" not in m.text else None)
        for u in (sys.argv[1:] or ROUTES):
            errs.clear()
            resp = pg.goto(BASE + u, wait_until="load", timeout=90000); time.sleep(2)
            for y in range(0, pg.evaluate("document.body.scrollHeight") + 900, 700):
                pg.evaluate(f"window.scrollTo(0,{y})"); time.sleep(0.12)
            time.sleep(1)
            r = pg.evaluate(JS)
            bad = r["h1"] != 1 or r["sw"] != r["cw"] or errs
            print(w, u, resp.status if resp else "-", "h1", r["h1"], "overflow", r["sw"] - r["cw"], "dark@", r["dark"],
                  "wide", r["wide"], "small", r["small"], "errs", errs[:2], "<<<" if bad else "", flush=True)
        ctx.close()
    b.close()
