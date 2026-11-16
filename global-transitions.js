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
      window.setTimeout(function(){location.href=url.href},560);
    },true);

  }else{
    root.classList.add("ds-motion-ready");
  }
})();
