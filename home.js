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

/* DS PARALLAX INTERLUDE — wait for the React homepage to mount before binding */
(() => {
  "use strict";

  const startParallax = () => {
    const section = document.querySelector(".ds-parallax-interlude");
    const header = document.querySelector("#ds-parallax-header");
    const center = document.querySelector("#ds-parallax-center");
    if (!section || !header || !center) return false;

    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return true;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      if (rect.bottom < 0 || rect.top > viewport) return;

      const progress = Math.max(0, Math.min(1,
        (viewport - rect.top) / (viewport + rect.height)
      ));
      const offset = Math.round((progress - 0.5) * 300);
      const contentOffset = Math.round((progress - 0.5) * -88);
      header.style.transform = "translate3d(0," + offset + "px,0)";
      center.style.transform = "translate3d(0," + contentOffset + "px,0)";
    };
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    update();
    return true;
  };

  if (startParallax()) return;

  /* React 18 may commit the homepage after this deferred file executes. */
  const observer = new MutationObserver(() => {
    if (startParallax()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
})();
