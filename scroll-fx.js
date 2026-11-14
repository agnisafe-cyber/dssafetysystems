/* DS Safety Systems - shared scroll animation layer.
   Safe by design: skips iframes, reduced-motion users, and never leaves content hidden. */
(function(){
  try{
    if(window.self!==window.top)return;                                   // not inside the homepage iframes
    if(document.getElementById("ds-progress"))return;                     // homepage has its own layer
    if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    if(!("IntersectionObserver" in window)||!Element.prototype.animate)return;

    /* ---------- progress bar ---------- */
    var bar=document.createElement("div");bar.id="dsfx-progress";bar.setAttribute("aria-hidden","true");
    var st=document.createElement("style");
    st.textContent="#dsfx-progress{position:fixed;top:0;left:0;width:100%;height:3px;z-index:100000;background:linear-gradient(90deg,#d93830,#ff8a3d);transform:scaleX(0);transform-origin:0 50%;pointer-events:none}"+
      ".dsfx-hide{opacity:0!important;translate:0 44px!important}"+
      ".dsfx-hide.dsfx-l{translate:-48px 24px!important}.dsfx-hide.dsfx-r{translate:48px 24px!important}"+
      "@media(max-width:760px){.dsfx-hide,.dsfx-hide.dsfx-l,.dsfx-hide.dsfx-r{translate:0 32px!important}}";
    document.head.appendChild(st);document.body.appendChild(bar);

    var ticking=false,orbs=[];
    function frame(){
      ticking=false;
      var y=window.pageYOffset,max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      bar.style.transform="scaleX("+Math.min(1,y/max)+")";
      for(var i=0;i<orbs.length;i++){var o=orbs[i];if(y<innerHeight*1.5)o.style.translate="0 "+(y*-0.12).toFixed(1)+"px"}
    }
    function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
    addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",onScroll);

    /* ---------- reveal on scroll ---------- */
    var SEL="h1,h2,h3,h4,p,img,video,figure,article,table,form,blockquote,.btn,[class*='card'],[class*='stat'],[class*='step'],[class*='feature']";
    var SKIP="nav,footer,header nav,.nav,[class*='reveal'],[class*='modal'],[role='dialog'],[aria-hidden='true'],#filter-container,button,#dsfx-progress,#ds-sticky-contact,svg";
    var seen=new WeakSet();
    var batch=0,batchTimer=0;
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;var el=e.target;io.unobserve(el);
        var d=Math.min(batch++,5)*80;
        el.classList.remove("dsfx-hide","dsfx-l","dsfx-r");
        try{el.animate([{opacity:0,translate:el.__fx||"0 44px"},{opacity:1,translate:"0 0"}],{duration:850,delay:d,easing:"cubic-bezier(.22,1,.36,1)",fill:"backwards"})}catch(x){}
      });
      clearTimeout(batchTimer);batchTimer=setTimeout(function(){batch=0},120);
    },{rootMargin:"0px 0px -8% 0px",threshold:0});

    function scan(){
      var all=[].slice.call(document.querySelectorAll(SEL)),set=new Set(all);
      all.forEach(function(el,i){
        if(seen.has(el))return;seen.add(el);
        if(el.closest(SKIP))return;
        var p=el.parentElement,nested=false;while(p){if(set.has(p)&&!p.closest(SKIP)){nested=true;break}p=p.parentElement}
        if(nested)return;
        var r=el.getBoundingClientRect();
        if(r.width<40||r.height<12)return;
        if(r.top<innerHeight*0.95)return;                      // already on screen: leave alone, no flash
        var cs=getComputedStyle(el);if(cs.position==="fixed"||cs.position==="sticky"||cs.display==="none"||cs.visibility==="hidden")return;
        el.classList.add("dsfx-hide");
        var side=(i%7===3)?"dsfx-l":(i%7===5)?"dsfx-r":"";if(side)el.classList.add(side);
        el.__fx=side==="dsfx-l"?"-48px 24px":side==="dsfx-r"?"48px 24px":"0 44px";
        io.observe(el);
      });
      orbs=[].slice.call(document.querySelectorAll(".orb"));
    }
    function init(){scan();frame()}
    if(document.readyState==="complete")init();else addEventListener("load",init);
    setTimeout(scan,1200);

    /* safety net: never leave something visible-but-hidden, or hidden forever */
    setInterval(function(){[].forEach.call(document.querySelectorAll(".dsfx-hide"),function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight*0.7&&r.bottom>0){io.unobserve(el);el.classList.remove("dsfx-hide","dsfx-l","dsfx-r")}})},2500);
  }catch(e){}
})();
