/* DS Safety Systems — GSAP navbar enhancement */
(function(){
  function initNavbar(){
    if(!window.gsap) return;
    const nav=document.querySelector('.nav');
    if(!nav || nav.dataset.gsapNavbarReady) return;
    nav.dataset.gsapNavbarReady='true';

    const brand=nav.querySelector('.brand');
    const links=nav.querySelectorAll('.nav-links > a');
    const menu=nav.querySelector('.menu');
    const mobileLinks=nav.querySelector('.nav-links');

    const glow=document.createElement('span');
    glow.className='nav-brand-glow';
    nav.prepend(glow);

    gsap.set(nav,{y:-24,opacity:0});
    gsap.set([brand,...links,menu].filter(Boolean),{y:10,opacity:0});

    const intro=gsap.timeline({defaults:{ease:'power3.out'}});
    intro.to(nav,{y:0,opacity:1,duration:.75})
      .to(brand,{y:0,opacity:1,duration:.5},'-=.35')
      .to(links,{y:0,opacity:1,duration:.42,stagger:.06},'-=.25')
      .to(menu,{y:0,opacity:1,duration:.4},'-=.35')
      .to(glow,{opacity:1,duration:.6},'-=.3');

    let compact=false;
    function onScroll(){
      const shouldCompact=window.scrollY>55;
      if(shouldCompact===compact) return;
      compact=shouldCompact;
      nav.classList.toggle('nav-scrolled',compact);
      gsap.to(nav,{
        scale:compact?.985:1,
        duration:.35,
        ease:'power2.out',
        overwrite:true
      });
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();

    links.forEach(link=>{
      link.addEventListener('mouseenter',()=>{
        gsap.to(link,{y:-2,duration:.22,ease:'power2.out',overwrite:true});
      });
      link.addEventListener('mouseleave',()=>{
        gsap.to(link,{y:0,duration:.22,ease:'power2.out',overwrite:true});
      });
    });

    if(menu && mobileLinks){
      menu.addEventListener('click',()=>{
        const open=mobileLinks.classList.contains('mobile-open');
        if(open){
          gsap.fromTo(mobileLinks,{opacity:1,y:0},{opacity:0,y:-10,duration:.22,ease:'power2.in',onComplete:()=>mobileLinks.classList.remove('mobile-open')});
        }else{
          mobileLinks.classList.add('mobile-open');
          gsap.fromTo(mobileLinks,{opacity:0,y:-12},{opacity:1,y:0,duration:.35,ease:'power3.out'});
          gsap.fromTo(mobileLinks.querySelectorAll('a'),{opacity:0,x:-12},{opacity:1,x:0,duration:.28,stagger:.05,delay:.05,ease:'power2.out'});
        }
      });
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initNavbar);
  }else{
    initNavbar();
  }
})();