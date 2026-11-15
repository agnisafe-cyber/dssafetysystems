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
    var parallaxSelector="[data-ds-parallax],.parallax-layer,.hero .grid,.hero .orb,.hero .hero-bg,.hero img,.hero video,.hero-video-visual,.hero-video-visual video,.about-image-wrap img,.manufacturing-slider img,.modal-slide img,.modal-slider-box img,.product-visual img,.product-image img,.about-visual img,.image-panel img";
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


  /* Wavescroll interaction: staggered vertical slices react to page scroll and background dragging.
     Kept as a lightweight overlay so normal page layout, links and native scrolling remain intact. */
  if(!reduce){
    var waveStyle=document.createElement("style");
    waveStyle.textContent=
      "#dsfx-wave{position:fixed;inset:0;z-index:8;display:flex;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .18s ease;contain:strict}" +
      "#dsfx-wave.is-active{opacity:1}" +
      "#dsfx-wave .dsfx-wave-slice{height:100%;flex:1 1 0;min-width:0;transform:translate3d(0,0,0);will-change:transform; border-right:1px solid rgba(255,115,65,.035);background:linear-gradient(180deg,rgba(255,74,42,.13),rgba(12,12,14,.025) 38%,rgba(255,112,52,.075) 72%,rgba(0,0,0,.025))}" +
      "@media(prefers-reduced-motion:reduce){#dsfx-wave{display:none!important}}";
    document.head.appendChild(waveStyle);
    var wave=document.createElement("div");
    wave.id="dsfx-wave";
    wave.setAttribute("aria-hidden","true");
    var waveSlices=[];
    for(var wi=0;wi<24;wi++){
      var slice=document.createElement("i");
      slice.className="dsfx-wave-slice";
      wave.appendChild(slice);
      waveSlices.push(slice);
    }
    document.body.appendChild(wave);

    var waveBusy=false,waveReset=null,lastScrollY=window.scrollY||0;
    function pulseWave(direction,amount){
      if(waveBusy)return;
      waveBusy=true;
      wave.classList.add("is-active");
      var distance=Math.max(10,Math.min(34,Math.abs(amount)*.65));
      waveSlices.forEach(function(slice,i){
        if(slice.getAnimations) slice.getAnimations().forEach(function(a){a.cancel()});
        var phase=Math.sin((i/23)*Math.PI);
        var sign=(i%2===0?1:-1);
        var offset=direction*distance*(.35+phase*.65)*sign;
        slice.animate(
          [{transform:"translate3d(0,0,0)"},{transform:"translate3d(0,"+offset.toFixed(1)+"px,0)"},{transform:"translate3d(0,0,0)"}],
          {duration:460,easing:"cubic-bezier(.22,1,.36,1)",delay:Math.abs(i-11.5)*7,fill:"none"}
        );
      });
      window.clearTimeout(waveReset);
      waveReset=window.setTimeout(function(){wave.classList.remove("is-active");waveBusy=false},650);
    }
    var waveScrollTick=false;
    addEventListener("scroll",function(){
      if(waveScrollTick)return;
      waveScrollTick=true;
      requestAnimationFrame(function(){
        var now=window.scrollY||0,delta=now-lastScrollY;
        lastScrollY=now;
        if(Math.abs(delta)>3)pulseWave(delta>0?1:-1,delta);
        waveScrollTick=false;
      });
    },{passive:true});

    var dragY=0,dragX=0,dragging=false,dragMoved=false;
    function isInteractive(target){
      return !!(target&&target.closest("a,button,input,select,textarea,label,[role='button'],[role='dialog'],.modal,[contenteditable='true']"));
    }
    document.addEventListener("pointerdown",function(e){
      if(e.button!==0||isInteractive(e.target))return;
      dragging=true;dragMoved=false;dragY=e.clientY;dragX=e.clientX;
    },{passive:true});
    document.addEventListener("pointermove",function(e){
      if(!dragging)return;
      var dy=e.clientY-dragY,dx=e.clientX-dragX;
      if(Math.abs(dy)<4&&Math.abs(dx)<10)return;
      dragMoved=true;
      wave.classList.add("is-active");
      var strength=Math.max(-52,Math.min(52,dy*.42));
      var focus=(e.clientX/Math.max(1,window.innerWidth))*23;
      waveSlices.forEach(function(slice,i){
        var spread=Math.abs(i-focus);
        var falloff=Math.max(0,1-spread/12);
        var curve=Math.sin((i/23)*Math.PI);
        var offset=strength*falloff*(.35+curve*.65);
        slice.style.transform="translate3d(0,"+offset.toFixed(1)+"px,0)";
      });
    },{passive:true});
    function finishWaveDrag(){
      if(!dragging)return;
      dragging=false;
      if(!dragMoved)return;
      waveSlices.forEach(function(slice,i){
        slice.animate(
          [{transform:getComputedStyle(slice).transform},{transform:"translate3d(0,0,0)"}],
          {duration:420,easing:"cubic-bezier(.22,1,.36,1)",delay:Math.abs(i-11.5)*6,fill:"forwards"}
        );
        slice.style.transform="";
      });
      window.clearTimeout(waveReset);
      waveReset=window.setTimeout(function(){wave.classList.remove("is-active")},600);
    }
    document.addEventListener("pointerup",finishWaveDrag,{passive:true});
    document.addEventListener("pointercancel",finishWaveDrag,{passive:true});
  }

  update();
  if("fonts" in document)document.fonts.ready.then(requestUpdate);
  addEventListener("load",requestUpdate,{once:true});
})();