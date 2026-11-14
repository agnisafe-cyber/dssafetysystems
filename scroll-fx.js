/* DS Safety Systems — shared scroll motion.
   Lightweight parallax + reveal choreography. Respects reduced motion and existing page layouts. */
(function(){
  "use strict";
  if(window.self!==window.top)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body=document.body;
  if(!body)return;

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
      var offset=Math.max(-52,Math.min(52,distance*-item.speed));
      el.style.translate="0 "+offset.toFixed(1)+"px";
    }
  }
  function requestUpdate(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
  addEventListener("scroll",requestUpdate,{passive:true});
  addEventListener("resize",requestUpdate,{passive:true});

  if(!reduce){
    /* Decorative layers and image subjects move at a slower rate than the page. */
    var parallaxSelector="[data-ds-parallax],.parallax-layer,.hero .grid,.hero .orb,.hero .hero-bg,.hero img,.hero video,.modal-slide img,.modal-slider-box img,.product-visual img,.product-image img,.about-visual img,.image-panel img";
    var seenParallax=new Set();
    document.querySelectorAll(parallaxSelector).forEach(function(el){
      if(seenParallax.has(el)||el.closest("nav,button,a,[role='dialog']"))return;
      seenParallax.add(el);
      var speed=Number(el.getAttribute("data-ds-parallax-speed"))||0.105;
      el.style.willChange="translate";
      parallax.push({el:el,speed:speed});
    });

    /* Scroll reveals for page content; parent cards animate as a unit, not every child. */
    if("IntersectionObserver" in window){
      var selector="h1,h2,h3,h4,p,img,video,figure,article,form,blockquote,.btn,[class*='card'],[class*='stat'],[class*='step'],[class*='feature'],.modal-grid > *, .modal-spec-table, .capacity-options";
      var all=[].slice.call(document.querySelectorAll(selector));
      var candidates=new Set(all);
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          var el=entry.target;io.unobserve(el);
          var anim=el.animate(
            [{opacity:0,translate:"0 28px"},{opacity:1,translate:"0 0"}],
            {duration:740,easing:"cubic-bezier(.22,1,.36,1)",fill:"both"}
          );
          anim.onfinish=function(){anim.cancel()};
        });
      },{rootMargin:"0px 0px -7% 0px",threshold:0.08});

      all.forEach(function(el){
        if(el.closest("nav,footer,header nav,.nav,[class*='modal'],[role='dialog'],[aria-hidden='true'],#ds-sticky-contact,button,svg"))return;
        var parent=el.parentElement,nested=false;
        while(parent){
          if(candidates.has(parent)){nested=true;break}
          parent=parent.parentElement;
        }
        if(nested)return;
        var r=el.getBoundingClientRect();
        if(r.width<40||r.height<12||r.top<window.innerHeight*.92)return;
        var cs=getComputedStyle(el);
        if(cs.position==="fixed"||cs.position==="sticky"||cs.display==="none"||cs.visibility==="hidden")return;
        io.observe(el);
      });
    }

    /* Inner-page hero entrance. The homepage retains its own GSAP intro. */
    if(!document.querySelector(".hero-title")){
      var hero=document.querySelector(".hero");
      if(hero)hero.animate(
        [{opacity:.76,translate:"0 14px"},{opacity:1,translate:"0 0"}],
        {duration:820,easing:"cubic-bezier(.22,1,.36,1)"}
      );
    }
  }

  update();
  if("fonts" in document)document.fonts.ready.then(requestUpdate);
  addEventListener("load",requestUpdate,{once:true});
})();