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

/* DS THREE-PANEL FULL-PAGE PARALLAX — native page scroll, no wheel hijacking */
(() => {
  "use strict";
  const init = () => {
    const container = document.querySelector("#ds-parallax-container");
    if (!container) return false;
    const stage = container.querySelector(".ds-parallax-stage");
    const slides = Array.from(container.querySelectorAll(".ds-parallax-slide"));
    const progress = container.querySelector(".ds-parallax-progress");
    if (!stage || slides.length !== 3) return false;

    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = container.getBoundingClientRect();
      const travel = Math.max(1, container.offsetHeight - window.innerHeight);
      const passed = Math.max(0, Math.min(travel, -rect.top));
      const slide = Math.min(2, Math.floor((passed / travel) * 3));
      container.dataset.slide = String(slide);
      slides.forEach((item, index) => {
        const content = item.querySelector(".ds-parallax-content");
        if (!content) return;
        const localProgress = Math.max(0, Math.min(1, (passed / travel) * 3 - index));
        const y = reduceMotion ? 0 : Math.round((localProgress - .5) * -42);
        content.style.transform = "translate3d(0," + y + "px,0)";
      });
      if (progress) progress.setAttribute("aria-label", "Panel " + (slide + 1) + " of 3");
    };
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", requestUpdate, { passive:true });
    window.addEventListener("resize", requestUpdate, { passive:true });
    update();
    return true;
  };
  if (init()) return;
  const observer = new MutationObserver(() => {
    if (init()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
  window.addEventListener("pagehide", () => observer.disconnect(), { once:true });
})();
