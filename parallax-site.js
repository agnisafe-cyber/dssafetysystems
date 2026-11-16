/* DS Safety Systems — parallax bands for inner pages.
   Each <section class="px-band"> holds a photo (.px-img), glow dots (.px-embers) and text (.px-copy)
   that move at different speeds while the band is on screen. Works with or without ScrollSmoother. */
(() => {
  "use strict";
  const bands = Array.prototype.slice.call(document.querySelectorAll(".px-band"));
  if (!bands.length) return;
  /* Pages that are shown inside the homepage (iframes) must not get a band. */
  if (window.self !== window.top) { bands.forEach(b => b.remove()); return; }
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const items = bands.map(el => ({
    el,
    img: el.querySelector(".px-img"),
    copy: el.querySelector(".px-copy"),
    emb: el.querySelector(".px-embers"),
    vis: false
  }));

  let running = false;
  const tick = () => {
    const vh = window.innerHeight || 800;
    let any = false;
    for (const it of items) {
      if (!it.vis) continue;
      any = true;
      const r = it.el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      const d = p - 0.5;
      if (it.img) it.img.style.transform = "translate3d(0," + (d * -0.3 * r.height).toFixed(1) + "px,0)";
      if (it.copy) it.copy.style.transform = "translate3d(0," + (d * -64).toFixed(1) + "px,0)";
      if (it.emb) it.emb.style.transform = "translate3d(0," + (d * -120).toFixed(1) + "px,0)";
    }
    if (any) requestAnimationFrame(tick); else running = false;
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(tick); } };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { const it = items.find(i => i.el === e.target); if (it) it.vis = e.isIntersecting; });
      kick();
    }, { rootMargin: "150px 0px" });
    items.forEach(i => io.observe(i.el));
  } else {
    items.forEach(i => { i.vis = true; });
  }
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });
  kick();
})();
