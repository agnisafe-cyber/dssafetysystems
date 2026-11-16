/* DS Safety Systems — homepage-only scroll choreography.
   Keeps the homepage hero motion separate from every inner page. */
(() => {
  "use strict";
  if (window.self !== window.top) return;

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const heroContent = document.querySelector(".hero-content");
  if (!heroContent) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const scrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const progress = Math.min(1, scrollY / Math.max(1, hero.offsetHeight));
    /* Independent CSS translate composes with the existing GSAP transform. */
    heroContent.style.translate = "0 " + (-Math.round(progress * 34)) + "px";
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();

})();

/* DS PARALLAX INTERLUDE — desktop motion comes from ScrollSmoother data-speed attributes;
   phones/tablets (where ScrollSmoother is off) get this lightweight scroll fallback. */
(() => {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const small = window.matchMedia("(max-width:900px)");

  const start = () => {
    const section = document.querySelector(".ds-parallax-interlude");
    const img = section && section.querySelector(".ds-px-img");
    const copy = section && section.querySelector(".ds-px-copy");
    if (!img) return false;

    let ticking = false;
    const update = () => {
      ticking = false;
      if (!small.matches) { img.style.translate = ""; if (copy) copy.style.translate = ""; return; }
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      if (rect.bottom < 0 || rect.top > vh) return;
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      img.style.translate = "0 " + Math.round((p - 0.5) * -0.3 * rect.height) + "px";
      if (copy) copy.style.translate = "0 " + Math.round((p - 0.5) * -46) + "px";
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    update();
    return true;
  };

  if (start()) return;
  /* React 18 may commit the homepage after this deferred file runs. */
  const observer = new MutationObserver(() => { if (start()) observer.disconnect(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();
