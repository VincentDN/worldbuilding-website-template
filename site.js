'use strict';
document.documentElement.classList.add('js');
// mobile menu
const burger=document.getElementById('burger'), navLinks=document.getElementById('navLinks');
burger.addEventListener('click',()=>{const o=navLinks.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{navLinks.classList.remove('open');burger.setAttribute('aria-expanded','false')}));

// reveal on scroll

// lightweight video facades: YouTube loads only after click or keyboard activation
document.querySelectorAll('.video-facade[data-embed]').forEach(video=>{
  const playVideo=()=>{
    if(video.dataset.playing) return;
    video.dataset.playing='true';
    const frame=document.createElement('iframe');
    frame.src=video.dataset.embed;
    frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen=true;
    frame.title=video.dataset.title||'American Kingdoms video';
    video.innerHTML='';
    video.appendChild(frame);
  };
  video.addEventListener('click',playVideo);
  video.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();playVideo()}});
});

// Gallery expansion and artwork viewer, shared with the backer carousel.
const galleryShell=document.querySelector('.gallery-shell');
const galleryToggle=galleryShell.querySelector('.gallery-reveal');
galleryShell.classList.add('is-collapsed');
galleryToggle.hidden=false;
galleryToggle.addEventListener('click',()=>{
  const expanded=galleryToggle.getAttribute('aria-expanded')!=='true';
  galleryToggle.setAttribute('aria-expanded',String(expanded));
  galleryShell.classList.toggle('is-collapsed',!expanded);
  galleryToggle.textContent=expanded?'Show less':'See more';
  if(expanded) galleryShell.querySelector('.gallery-extra').focus();
  else document.getElementById('gallery').scrollIntoView({behavior:'auto'});
});
const lb=document.getElementById('lightbox'),lbImg=lb.querySelector('img'),lbCaption=lb.querySelector('figcaption');
const galleryImages=[...document.querySelectorAll('.gallery-grid figure img')];
const backerImages=[...document.querySelectorAll('.backer-slide img')];
let activeImages=[],imageIndex=0,imageInvoker=null;
function showLBImage(){
  const img=activeImages[imageIndex];
  lbImg.alt=img.alt;
  lbImg.src=img.dataset.full||img.currentSrc||img.src;
  lbCaption.textContent=img.alt+' · '+(imageIndex+1)+' / '+activeImages.length;
}
function stepLB(amount){imageIndex=(imageIndex+amount+activeImages.length)%activeImages.length;showLBImage()}
[galleryImages,backerImages].forEach(images=>images.forEach((img,index)=>{
  const trigger=img.closest('.backer-slide')||img.parentElement;
  trigger.setAttribute('role','button');
  trigger.tabIndex=0;
  trigger.setAttribute('aria-label','Enlarge: '+img.alt);
  trigger.setAttribute('aria-haspopup','dialog');
  const openImage=()=>{
    activeImages=images;imageIndex=index;imageInvoker=trigger;showLBImage();
    lb.showModal();document.body.classList.add('lightbox-open');
  };
  trigger.addEventListener('click',openImage);
  trigger.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openImage()}});
}));
lb.querySelector('.close').addEventListener('click',()=>lb.close());
lb.querySelector('.lightbox-prev').addEventListener('click',()=>stepLB(-1));
lb.querySelector('.lightbox-next').addEventListener('click',()=>stepLB(1));
lb.addEventListener('click',event=>{if(event.target===lb)lb.close()});
lb.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();stepLB(event.key==='ArrowRight'?1:-1);
  }
});
lb.addEventListener('close',()=>{
  document.body.classList.remove('lightbox-open');lbImg.removeAttribute('src');imageInvoker?.focus();
});
lbImg.addEventListener('error',()=>{lbCaption.textContent='This image could not be loaded. Please try the next image.'});
let imageTouchStart=null;
lb.addEventListener('touchstart',event=>{
  imageTouchStart=event.touches.length===1?[event.touches[0].clientX,event.touches[0].clientY]:null;
},{passive:true});
lb.addEventListener('touchend',event=>{
  if(!imageTouchStart||!event.changedTouches.length)return;
  const dx=event.changedTouches[0].clientX-imageTouchStart[0],dy=event.changedTouches[0].clientY-imageTouchStart[1];
  imageTouchStart=null;
  if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))stepLB(dx<0?1:-1);
},{passive:true});
lb.addEventListener('touchcancel',()=>{imageTouchStart=null},{passive:true});
// reusable sliding carousel: arrow buttons + drag-to-scroll + edge state
function initCarousel(trackId,prevId,nextId,cardSel){
  const track=document.getElementById(trackId),tp=document.getElementById(prevId),tn=document.getElementById(nextId);
  if(!track||!tp||!tn) return;
  const reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const step=()=>{const c=track.querySelector(cardSel);return c?c.getBoundingClientRect().width+24:300;};
  const upd=()=>{tp.disabled=track.scrollLeft<8;tn.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-8;};
  tp.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:reduce?'auto':'smooth'}));
  tn.addEventListener('click',()=>track.scrollBy({left:step(),behavior:reduce?'auto':'smooth'}));
  track.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd); upd();
  let down=false,sx=0,sl=0,moved=false;
  track.addEventListener('pointerdown',e=>{down=true;moved=false;sx=e.clientX;sl=track.scrollLeft;track.classList.add('dragging')});
  track.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;if(Math.abs(dx)>4)moved=true;track.scrollLeft=sl-dx});
  const end=()=>{down=false;track.classList.remove('dragging')};
  track.addEventListener('pointerup',end);track.addEventListener('pointerleave',end);
  track.addEventListener('click',e=>{if(moved)e.preventDefault()},true);
}
initCarousel('teamTrack','teamPrev','teamNext','.member');
initCarousel('factionTrack','facPrev','facNext','.faction-card');
initCarousel('backerTrack','backerPrev','backerNext','.backer-slide');
initCarousel('shortsTrack','shortsPrev','shortsNext','.short-card');

// Example newsletter UI. It validates locally and never sends or saves addresses.
document.querySelectorAll('.newsletter-form').forEach(form=>{
  form.querySelectorAll('input[type=email],button[type=submit]').forEach(control=>control.disabled=false);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const input=form.querySelector('input[type=email]'),message=form.querySelector('.newsletter-error');
    message.hidden=false;
    if(!input.validity.valid){message.textContent='Enter a valid email address to preview the form.';input.focus();return;}
    message.textContent='Demo complete. No email was sent or stored. Connect your own newsletter service to accept signups.';
    input.value='';
  });
});
(() => {
  const modal=document.getElementById('newsletterModal'),trigger=document.getElementById('footerNewsletterTrigger');
  const storageKey='worldbuilding-newsletter-dismissed';let previousFocus;
  const close=()=>{modal.hidden=true;document.body.classList.remove('newsletter-open');try{localStorage.setItem(storageKey,String(Date.now()));}catch{}previousFocus?.focus();};
  const open=()=>{if(!document.getElementById('lightbox').open&&!document.hidden){previousFocus=document.activeElement;modal.hidden=false;document.body.classList.add('newsletter-open');modal.querySelector('.newsletter-close').focus();}};
  trigger.addEventListener('click',open);
  modal.querySelectorAll('[data-newsletter-close]').forEach(button=>button.addEventListener('click',close));
  modal.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();}
    if(event.key==='Tab'){
      const items=[...modal.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]):not([tabindex="-1"])')].filter(el=>el.getClientRects().length);
      const first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  let dismissed=0;try{dismissed=Number(localStorage.getItem(storageKey));}catch{}
  if(Date.now()-dismissed>14*24*60*60*1000)setTimeout(open,40000);
})();
