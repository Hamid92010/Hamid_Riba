/* Cookie Panic proof-of-concept modal, videos play only when selected. */
(() => {
 const dialog=document.getElementById('cookie-modal');
 const openButton=document.querySelector('[data-open-cookie]');
 if(!dialog||!openButton||typeof dialog.showModal!=='function')return;
 const closeButton=dialog.querySelector('[data-cookie-close]');
 const cover=document.getElementById('cookie-cover');
 const player=document.getElementById('cookie-player');
 const options=[...dialog.querySelectorAll('[data-cookie-media]')];
 const sources={1:'assets/games/cookie-panic-gameplay-1.mp4',2:'assets/games/cookie-panic-gameplay-2.mp4'};
 function selectMedia(key){
   player.pause();player.removeAttribute('src');player.load();
   cover.hidden=key!=='cover';player.hidden=key==='cover';
   options.forEach(b=>{const chosen=b.dataset.cookieMedia===key;b.classList.toggle('is-selected',chosen);b.setAttribute('aria-pressed',String(chosen));});
   if(key!=='cover'){
     player.src=sources[key];player.load();
     const attempt=player.play();if(attempt?.catch)attempt.catch(()=>{});
   }
 }
 openButton.addEventListener('click',()=>{dialog.showModal();selectMedia('cover');});
 closeButton.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>selectMedia('cover'));
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 options.forEach(b=>b.addEventListener('click',()=>selectMedia(b.dataset.cookieMedia)));
})();
