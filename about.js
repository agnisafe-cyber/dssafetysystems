/* DS Safety Systems — About page-only background motion.
   Moves the existing grid subtly; leaves GSAP/ScrollTrigger content reveals untouched. */
(() => {
  "use strict";
  if (window.self !== window.top) return;
  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const grid = document.querySelector(".hero .grid");
  if (!grid) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const hero = grid.closest(".hero");
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
    /* Background-only movement avoids competing with the page's GSAP transforms. */
    grid.style.backgroundPosition =
      Math.round(progress * 22) + "px " + Math.round(progress * 34) + "px";
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