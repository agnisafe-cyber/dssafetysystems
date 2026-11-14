/* DS Safety Systems — shared scroll motion.
   Lightweight parallax + reveal choreography. Respects reduced motion and existing page layouts. */
(function(){
  "use strict";
  if(window.self!==window.top)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body=document.body;
  if(!body)return;

  /* Scroll progress — subtle brand accent, no layout impact. */
  var bar=document.createElement("div");
  bar.id="dsfx-progress";
  bar.setAttribute("aria-hidden","true");
  document.documentElement.appendChild(bar);
  var ticking=false,parallax=[];
  function update(){
    ticking=false;
    var y=window.scrollY||window.pageYOffset||0;
    var max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    bar.style.transform="scaleX("+Math.min(1,y/max)+")";
    if(reduce)return;
    var vh=window.innerHeight||800,center=vh*.5;
    for(var i=0;i<parallax.length;i++){
      var item=parallax[i],el=item.el;
      if(!el.isConnected)continue;
      var r=el.getBoundingClientRect();
      if(r.bottom<-120||r.top>vh+120)continue;
      var distance=(r.top+r.height*.5-center);
      var offset=Math.max(-48,Math.min(48,distance*-item.speed));
      el.style.translate="0 "+offset.toFixed(1)+"px";
    }
  }
  function requestUpdate(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
  addEventListener("scroll",requestUpdate,{passive:true});
  addEventListener("resize",requestUpdate,{passive:true});

  if(!reduce){
    /* Parallax is restricted to decorative/background layers to avoid moving controls. */
    var selector="[data-ds-parallax],.parallax-layer,.hero .grid,.hero .orb,.hero .hero-bg,.hero .hero-visual img,.hero .hero-image img,.hero figure img,.hero video,.about-visual img,.image-panel img";
    var seen=new Set();
    document.querySelectorAll(selector).forEach(function(el){
      if(seen.has(el)||el.closest("nav,button,a"))return;
      seen.add(el);
      var speed=Number(el.getAttribute("data-ds-parallax-speed"))||0.12;
      el.style.willChange="translate";
      parallax.push({el:el,speed:speed});
    });

    /* Entrance reveal for content not already controlled by a page-specific timeline. */
    if(!document.querySelector(".hero-title") && "IntersectionObserver" in window){
      var revealSelector=".reveal,.fact,.principle,.service,.step,.product-card,.sector-card,.wsk-cp-product,.cta h2,.section > .wide,.section > .statement";
      var revealNodes=[].slice.call(document.querySelectorAll(revealSelector));
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          var el=entry.target;io.unobserve(el);
          el.classList.remove("dsfx-pending");
          var anim=el.animate(
            [{opacity:0,translate:"0 28px"},{opacity:1,translate:"0 0"}],
            {duration:760,easing:"cubic-bezier(.22,1,.36,1)",fill:"both"}
          );
          anim.onfinish=function(){el.style.opacity="";el.style.translate="";anim.cancel()};
        });
      },{rootMargin:"0px 0px -7% 0px",threshold:0.08});
      revealNodes.forEach(function(el){
        if(el.closest("nav,footer,[aria-hidden='true'],[role='dialog']"))return;
        var r=el.getBoundingClientRect();
        if(r.top<window.innerHeight*.92)return;
        el.classList.add("dsfx-pending");
        io.observe(el);
      });
    }

    /* A restrained first-load entrance on inner pages; homepage keeps its own GSAP intro. */
    if(!document.querySelector(".hero-title")){
      var hero=document.querySelector(".hero");
      if(hero){
        hero.animate(
          [{opacity:.72,translate:"0 14px"},{opacity:1,translate:"0 0"}],
          {duration:850,easing:"cubic-bezier(.22,1,.36,1)"}
        );
      }
    }
  }

  update();
  if("fonts" in document)document.fonts.ready.then(requestUpdate);
  addEventListener("load",requestUpdate,{once:true});
})();