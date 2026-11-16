/* DS Safety Systems — global page-transition engine (JS)
   Loaded synchronously in <head> on every top-level page (tiny on purpose).
   - Supported browsers : the CSS does the work; this script only tells it whether
                          the user is going forward or back.
   - Other browsers     : plays a charcoal curtain between pages (no white/black flashes).
   - Inside iframes (sections embedded in the homepage) and with reduced motion: does nothing. */
(function () {
  "use strict";
  var root = document.documentElement;

  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }
  if (embedded) { root.classList.add("ds-embedded"); return; }

  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var supportsVT = !!window.CSSViewTransitionRule;
  root.classList.add(supportsVT ? "ds-vt" : "ds-novt");

  /* Work out the direction of a navigation from the Navigation API's activation record. */
  function direction(act) {
    try {
      if (!act || !act.from || !act.entry) return "forward";
      if (act.navigationType === "traverse") return act.entry.index < act.from.index ? "back" : "forward";
    } catch (e) {}
    return "forward";
  }

  if (supportsVT) {
    /* Old page, just before it is replaced. */
    window.addEventListener("pageswap", function (e) {
      if (e.viewTransition) root.dataset.vtDir = direction(e.activation);
    });
    /* New page, before its first paint. */
    window.addEventListener("pagereveal", function (e) {
      if (!e.viewTransition) return;
      root.dataset.vtDir = direction(window.navigation && window.navigation.activation);
      var clear = function () { delete root.dataset.vtDir; };
      e.viewTransition.finished.then(clear, clear);
    });
    return;
  }

  /* ---------------- Fallback curtain ---------------- */
  if (reduce) return;
  var KEY = "ds-transition";

  /* If the previous page started a transition, cover this page immediately, then lift the curtain. */
  try {
    if (window.sessionStorage.getItem(KEY)) {
      window.sessionStorage.removeItem(KEY);
      root.classList.add("ds-entering");
      window.setTimeout(function () { root.classList.remove("ds-entering"); }, 1100);
    }
  } catch (e) {}

  document.addEventListener("click", function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    var url;
    try { url = new URL(a.href, window.location.href); } catch (e) { return; }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return; /* same page / #hash */
    ev.preventDefault();
    try { window.sessionStorage.setItem(KEY, "1"); } catch (e) {}
    root.classList.add("ds-leaving");
    window.setTimeout(function () { window.location.href = url.href; }, 360);
  });

  /* Back/forward cache: never come back to a page that is still covered. */
  window.addEventListener("pageshow", function (ev) {
    if (ev.persisted) root.classList.remove("ds-leaving", "ds-entering");
  });
})();
