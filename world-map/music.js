/* Original placeholder ambience. Replace the source with your own licensed music. */
(() => {
  const audio=document.getElementById('music-audio'),button=document.getElementById('music-playpause');
  const toggle=document.getElementById('music-toggle'),panel=document.getElementById('music-popover'),volume=document.getElementById('music-volume');
  const key='worldbuilding-atlas-music';
  audio.src=new URL('assets/atlas-ambient.wav',document.baseURI).href;
  let saved;
  try{saved=JSON.parse(sessionStorage.getItem(key));}catch{}
  audio.volume=Number.isFinite(saved?.volume)?Math.max(0,Math.min(1,saved.volume)):.18;
  volume.value=Math.round(audio.volume*100);
  if(saved?.time>0){audio.addEventListener('loadedmetadata',()=>{audio.currentTime=saved.time%audio.duration;},{once:true});audio.load();}
  const save=()=>{try{sessionStorage.setItem(key,JSON.stringify({volume:audio.volume,time:audio.currentTime,playing:!audio.paused}));}catch{}};
  const update=()=>{button.textContent=audio.paused?'▶':'⏸';button.setAttribute('aria-label',audio.paused?'Play music':'Pause music');save();};
  button.onclick=()=>{if(audio.paused)audio.play().catch(()=>{document.getElementById('music-track').textContent='Playback unavailable';});else audio.pause();};
  volume.oninput=()=>{audio.volume=Number(volume.value)/100;save();};
  toggle.onclick=()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));};
  document.addEventListener('click',e=>{if(!panel.hidden&&!e.target.closest('.music-player')){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();}});
  audio.addEventListener('play',update);audio.addEventListener('pause',update);window.addEventListener('pagehide',save);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});setInterval(()=>{if(!audio.paused)save();},5000);
  // First visits stay quiet. Resume only a session the visitor explicitly played.
  if(saved?.playing)audio.play().catch(()=>{});
})();
