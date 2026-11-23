/* Loads the shared DS Safety Systems footer on each main site page. */
(async function(){
  if(document.getElementById('ds-site-footer')) return;
  try{
    const response=await fetch('footer.html');
    if(!response.ok) throw new Error('Footer request failed: '+response.status);
    const markup=await response.text();
    const parsed=new DOMParser().parseFromString(markup,'text/html');
    const footer=parsed.querySelector('#ds-site-footer');
    const styles=parsed.querySelector('#ds-shared-footer-styles');
    if(!footer) throw new Error('Shared footer markup is missing.');
    document.body.insertAdjacentHTML('beforeend',footer.outerHTML);
    if(styles) document.head.appendChild(styles.cloneNode(true));
    const year=document.querySelector('[data-ds-footer-year]');
    if(year) year.textContent=new Date().getFullYear();
  }catch(error){console.error('DS Safety Systems footer could not load:',error);}
})();