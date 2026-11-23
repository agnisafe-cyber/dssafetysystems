/* Loads the shared DS Safety Systems footer after homepage sections are in their final order. */
(async function(){
  /* The homepage embeds product.html in an iframe; keep that embedded catalog footer-free. */
  if(window.self !== window.top && new URLSearchParams(window.location.search).get('embed') === 'homepage-products-v8') return;
  /* The homepage embeds get-quote.html too; its footer is supplied once by the parent page. */
  if(window.self !== window.top && new URLSearchParams(window.location.search).get('embed') === 'homepage-quote') return;
  if(document.getElementById('ds-site-footer')) return;
  function waitForHomepageOrder(){
    if(!location.pathname.endsWith('/index.html') && location.pathname !== '/') return Promise.resolve();
    if(window.dsHomepageSectionsArranged) return Promise.resolve();
    return new Promise(resolve=>{
      document.addEventListener('ds-homepage-sections-arranged',resolve,{once:true});
      /* Fallback for pages where the homepage ordering script cannot run. */
      window.addEventListener('load',()=>setTimeout(resolve,500),{once:true});
    });
  }
  try{
    await waitForHomepageOrder();
    if(document.getElementById('ds-site-footer')) return;
    const response=await fetch('footer.html');
    if(!response.ok) throw new Error('Footer request failed: '+response.status);
    const markup=await response.text();
    const parsed=new DOMParser().parseFromString(markup,'text/html');
    const footer=parsed.querySelector('#ds-site-footer');
    const styles=parsed.querySelector('#ds-shared-footer-styles');
    if(!footer) throw new Error('Shared footer markup is missing.');
    const quote=document.getElementById('get-quote-embed');
    if(quote) quote.insertAdjacentElement('afterend',footer);
    else document.body.appendChild(footer);
    if(styles) document.head.appendChild(styles.cloneNode(true));
    const year=document.querySelector('[data-ds-footer-year]');
    if(year) year.textContent=new Date().getFullYear();
  }catch(error){console.error('DS Safety Systems footer could not load:',error);}
})();