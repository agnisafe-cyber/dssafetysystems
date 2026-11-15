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

  /* Dedicated parallax transition between the fire-safety marquee and About. */
  const interlude = document.querySelector(".interlude-parallax");
  if (interlude) {
    const background = interlude.querySelector(".interlude-parallax-bg");
    const content = interlude.querySelector(".interlude-parallax-content");
    let interludeTicking = false;
    const updateInterlude = () => {
      interludeTicking = false;
      const rect = interlude.getBoundingClientRect();
      const span = Math.max(1, window.innerHeight + rect.height);
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / span));
      if (background) background.style.setProperty("--interlude-bg-y", Math.round((progress - 0.5) * -105) + "px");
      if (content) content.style.setProperty("--interlude-content-y", Math.round((progress - 0.5) * 24) + "px");
    };
    const requestInterludeUpdate = () => {
      if (interludeTicking) return;
      interludeTicking = true;
      window.requestAnimationFrame(updateInterlude);
    };
    window.addEventListener("scroll", requestInterludeUpdate, { passive: true });
    window.addEventListener("resize", requestInterludeUpdate, { passive: true });
    updateInterlude();
  }

})();