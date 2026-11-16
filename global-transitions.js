/* DS Safety Systems — reusable global page transitions + section reveals.
   Works with ordinary GitHub Pages HTML navigation and preserves native history. */
(function(){
  "use strict";
  var root=document.documentElement;
  var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var overlay=document.createElement("div");
  overlay.id="ds-page-transition";
  overlay.setAttribute("aria-hidden","true");
  function reset(){document.body&&document.body.classList.remove("ds-page-leaving");overlay.classList.remove("is-active");root.classList.add("ds-motion-ready");}
  if(document.body){document.body.appendChild(overlay);reset();}
  window.addEventListener("pageshow",reset);
  window.addEventListener("pagehide",function(){if(document.body)document.body.classList.remove("ds-page-leaving");});
  if(!reduced){
    document.addEventListener("click",function(event){
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      var link=event.target&&event.target.closest?event.target.closest("a[href]"):null;
      if(!link||link.hasAttribute("download")||(link.target&&link.target!=="_self")||link.getAttribute("rel")==="external")return;
      var raw=link.getAttribute("href");
      if(!raw||raw.charAt(0)==="#"||/^\s*(javascript:|mailto:|tel:)/i.test(raw))return;
      var url;try{url=new URL(link.href,location.href)}catch(_){return}
      if(url.origin!==location.origin||url.pathname===location.pathname&&url.search===location.search)return;
      if(!/\.html?$/i.test(url.pathname)&&url.pathname!=="/dssafetysystems/"&&url.pathname!=="/")return;
      event.preventDefault();
      if(document.body.classList.contains("ds-page-leaving"))return;
      document.body.classList.add("ds-page-leaving");
      overlay.classList.add("is-active");
      window.setTimeout(function(){location.href=url.href},390);
    },true);
    if("IntersectionObserver" in window){
      var candidates=Array.prototype.slice.call(document.querySelectorAll("main section,body>section,section:not(.marquee):not([aria-hidden='true']),.service-card,.product-card,.industry-card,.testimonial-card"));
      var count=0;
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("ds-revealed");io.unobserve(entry.target)}});
      },{rootMargin:"0px 0px -7% 0px",threshold:.08});
      candidates.forEach(function(el){
        if(el.closest("nav,header footer,[role='dialog'],#quote-modal,.marquee")||el.hasAttribute("data-no-reveal"))return;
        if(el.getBoundingClientRect().height<35)return;
        el.setAttribute("data-ds-reveal","");
        el.style.setProperty("--ds-reveal-delay",Math.min(count%4,3)*75+"ms");
        count++;io.observe(el);
      });
      window.addEventListener("pageshow",function(){if(window.scrollY>0)requestAnimationFrame(function(){candidates.forEach(function(el){if(el.getBoundingClientRect().bottom<0)el.classList.add("ds-revealed")})})});
    }
  }else{
    root.classList.add("ds-motion-ready");
  }
})();
