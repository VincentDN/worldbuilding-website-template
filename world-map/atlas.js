/* Source-inspired atlas engine. Scenarios, artwork, and data are configured separately. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
  const scene=document.body.dataset.scenario || (Object.hasOwn(window.ATLAS_SCENARIOS,params.get('map'))?params.get('map'):'europe');
  const config=window.ATLAS_SCENARIOS[scene],edit=params.get('edit')==='1';
  const lite=!edit && (params.get('detail')==='lite'||(params.get('detail')!=='full'&&(matchMedia('(max-width:900px)').matches||navigator.connection?.saveData)));
  const storageKey='worldbuilding-view-'+scene,entries=new Map(),labelEntries=[];
  let selected=null,dirty=false,mode='realms',reference,ready=false;
  document.documentElement.classList.toggle('atlas-lite',lite);
  $('atlas-title').textContent=config.title;document.title=config.title+' | World atlas';
  $('scenario-description').textContent=config.description;$('scenario-note').textContent=config.note;
  if(config.parent){const option=new Option(config.short,scene);$('scenario').add(option);$('parent-map').hidden=false;}
  $('scenario').value=scene;
  function pageURL(nextScene=scene){const url=new URL('./',document.baseURI);url.searchParams.set('map',nextScene);return url;}
  $('scenario').onchange=()=>{location.href=pageURL($('scenario').value);};
  const detailURL=pageURL();detailURL.searchParams.set('detail',lite?'full':'lite');detailURL.searchParams.set('return','1');
  $('detail-switch').href=detailURL;$('detail-switch').textContent=lite?'Switch to full detail':'Switch to light map';
  const editURL=pageURL();if(!edit)editURL.searchParams.set('edit','1');editURL.searchParams.set('return','1');
  $('editor-toggle').href=editURL;$('editor-toggle').textContent=edit?'Leave territory editor':'Open territory editor';
  $('map-detail-note').textContent=lite?'Light view: simplified territory data, fewer labels, no city or river overlays.':'Full view: detailed borders, cities, rivers, and hover previews.';
  if(lite)for(const id of ['cities','rivers']){$(id).checked=false;$(id).disabled=true;}
  if(!window.L){$('status').textContent='The map library could not load. Reload to try again.';return;}

  function polarCRS(){
    const R=6371000,d=Math.PI/180,lon0=-100*d;
    return L.extend({},L.CRS.Earth,{code:'TEMPLATE:polar',projection:{
      project(p){const rho=R*(Math.PI/2-p.lat*d),theta=p.lng*d-lon0;return L.point(rho*Math.sin(theta),-rho*Math.cos(theta));},
      unproject(p){return L.latLng(90-Math.hypot(p.x,p.y)/R/d,(((lon0+Math.atan2(p.x,-p.y))/d+540)%360)-180);},
      bounds:L.bounds([-R*Math.PI,-R*Math.PI],[R*Math.PI,R*Math.PI])
    },transformation:new L.Transformation(.5/(Math.PI*R),.5,-.5/(Math.PI*R),.5)});
  }
  const map=L.map('map',{crs:config.crs==='image'?L.CRS.Simple:config.crs==='polar'?polarCRS():L.CRS.EPSG3857,
    preferCanvas:lite,zoomControl:false,minZoom:config.crs==='image'?-3:0,maxZoom:config.parent?13:config.crs==='image'?3:9,
    zoomSnap:.25,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false});
  L.control.zoom({position:'topright'}).addTo(map);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
  const credit=document.createElement('span');credit.textContent=config.credit;
  map.attributionControl.addAttribution(credit.outerHTML);
  for(const [name,z] of [['land',200],['water',250],['countries',350],['regions',360],['labels',500]]){map.createPane(name);map.getPane(name).style.zIndex=z;}
  map.getPane('labels').style.pointerEvents='none';
  const groups={countries:L.featureGroup().addTo(map),regions:L.featureGroup().addTo(map),cities:L.featureGroup(),rivers:L.featureGroup().addTo(map)};
  const reset=()=>{map.stop();if(config.bounds)map.fitBounds(config.bounds,{padding:[24,24],animate:false});else map.setView(config.center,config.zoom,{animate:false});};
  reset();$('home-view').onclick=()=>{reset();$('region-filter').value='';filterRegions();};
  new ResizeObserver(()=>map.invalidateSize({pan:false})).observe($('map'));
  if(config.image){$('reference-wrap').hidden=false;reference=L.imageOverlay(lite?config.liteImage:config.image,config.bounds,{pane:'land',interactive:false}).addTo(map);map.setMaxBounds(L.latLngBounds(config.bounds).pad(.25));}
  $('reference').onchange=()=>{if(reference){if($('reference').checked)reference.addTo(map);else map.removeLayer(reference);}};

  function panel(open,details=false){
    $('panel').hidden=!open;$('panel-toggle').setAttribute('aria-expanded',String(open));
    $('key-content').hidden=details;$('details').hidden=!details;$('editor').hidden=!edit;
    $('panel-title').textContent=details?'Territory details':edit?'Atlas editor':'Map key';
    $('panel').querySelector('.panel-body').scrollTop=0;
    entries.forEach(layer=>layer.closeTooltip());
  }
  $('panel-toggle').onclick=()=>panel($('panel').hidden||$('key-content').hidden);
  $('panel-close').onclick=()=>{panel(false);$('panel-toggle').focus();};
  $('back-to-key').onclick=()=>panel(true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('panel').hidden){panel(false);$('panel-toggle').focus();}});
  panel(!matchMedia('(max-width:700px)').matches||edit);
  const status=text=>{$('status').textContent=text;$('status').hidden=false;};
  $('retry').onclick=()=>location.reload();
  const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}};
  const assetURL=value=>{if(!value)return null;try{const u=new URL(value,document.baseURI);return u.protocol==='https:'||(u.origin===location.origin&&/^https?:$/.test(u.protocol))?u.href:null;}catch{return null;}};
  function setLink(id,value){const url=safeURL(value);$(id).hidden=!url;if(url)$(id).href=url;else $(id).removeAttribute('href');}
  const hex=(value,fallback='#a59670')=>/^#[0-9a-f]{6}$/i.test(value||'')?value:fallback;
  const color=f=>mode==='realms'&&config.alliances[f.properties.alliance]?config.alliances[f.properties.alliance]:hex(f.properties.color);
  const style=f=>({color:color(f),weight:1.4,fillColor:color(f),fillOpacity:config.image ? .55 : f.properties.canon ? .72 : .3,opacity:1});
  const textNode=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el;};
  function tooltip(f){const box=document.createElement('div');box.className='territory-preview';const p=f.properties;const imgURL=assetURL(p.flag);if(imgURL){const img=document.createElement('img');img.src=imgURL;img.alt='';img.className='territory-preview-flag';box.append(img);}box.append(textNode('strong',p.name),textNode('span',(p.summary||p.culture||'Territory').slice(0,110)));return box;}
  function select(layer,fit=false){
    selected=layer;const p=layer.feature.properties;
    const group=groups[layer.groupKey];if(!map.hasLayer(group)){$(layer.groupKey).checked=true;group.addTo(map);}
    if(fit)map.fitBounds(layer.getBounds(),{padding:[35,35],maxZoom:config.crs==='image'?1:config.parent?10:7,animate:false});
    panel(true,true);layer.closeTooltip();$('detail-name').textContent=p.name;
    $('detail-description').textContent=p.summary||'Add this territory’s story in the editor.';
    $('detail-author').textContent='Contributor: '+(p.claim||'Unclaimed');
    $('detail-culture').textContent=[p.culture&&'Culture: '+p.culture,p.alliance&&'Alliance: '+p.alliance,p.region&&'Subregion: '+p.region].filter(Boolean).join(' · ');
    const flag=assetURL(p.flag);$('detail-flag').hidden=!flag;if(flag){$('detail-flag').src=flag;$('detail-flag').alt='Example flag of '+p.name;}
    setLink('detail-link',p.wiki);setLink('detail-shop',p.flagShopUrl);
    const submap=config.submaps?.[p.submap];$('submap-link').hidden=!submap;if(submap)$('submap-link').href=new URL(submap,document.baseURI);
    if(edit){for(const [id,key] of [['name','name'],['culture','culture'],['alliance','alliance'],['author','claim'],['description','summary'],['wiki','wiki'],['flag','flag'],['shop','flagShopUrl']])$('edit-'+id).value=p[key]||'';$('edit-color').value=hex(p.color);$('edit-kind').value=layer.groupKey==='countries'?'country':'region';}
  }
  function groupKey(p){return p.kind==='region'||p.canon===false?'regions':'countries';}
  function addLabel(layer){
    const p=layer.feature.properties;
    const position=Array.isArray(p.label)?[p.label[1],p.label[0]]:layer.getBounds().getCenter();
    const node=document.createElement('span');node.className='state-map-label';
    const url=assetURL(p.shield||p.flag);if(url){const img=document.createElement('img');img.src=url;img.alt='';img.width=28;img.height=23;node.append(img);}
    node.append(textNode('span',p.name));
    const marker=L.marker(position,{pane:'labels',interactive:false,keyboard:false,pmIgnore:true,icon:L.divIcon({className:'state-label-marker',html:node,iconSize:[140,68],iconAnchor:[70,34]})});
    labelEntries.push({layer,marker,minZoom:p.labelMinZoom??(config.crs==='image'?-1:3)});
  }
  function updateLabels(){
    const boxes=[],size=map.getSize();
    for(const entry of [...labelEntries].sort((a,b)=>Number(!!b.layer.feature.properties.canon)-Number(!!a.layer.feature.properties.canon))){
      const point=map.latLngToContainerPoint(entry.marker.getLatLng());const r={x:point.x-65,y:point.y-30,w:130,h:60};
      const visible=$('labels').checked&&map.hasLayer(entry.layer)&&map.getZoom()>=entry.minZoom&&point.x>0&&point.y>0&&point.x<size.x&&point.y<size.y&&(!lite||boxes.length<18)&&!boxes.some(b=>r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y);
      if(visible){boxes.push(r);if(!map.hasLayer(entry.marker))entry.marker.addTo(map);}else if(map.hasLayer(entry.marker))map.removeLayer(entry.marker);
    }
  }
  map.on('zoomend moveend resize',updateLabels);$('labels').onchange=updateLabels;
  function markDirty(){dirty=true;$('editor-status').textContent='Changes are in this tab only. Export before closing.';}
  function refreshFinder(){
    const query=$('realm-search').value.toLowerCase();$('realm-finder').replaceChildren(new Option('Choose a territory…',''));
    [...entries].filter(([,layer])=>layer.feature.properties.name.toLowerCase().includes(query)).sort((a,b)=>a[1].feature.properties.name.localeCompare(b[1].feature.properties.name)).forEach(([id,layer])=>$('realm-finder').add(new Option(layer.feature.properties.name,id)));
    $('realm-finder').disabled=entries.size===0;
  }
  $('realm-search').oninput=refreshFinder;
  $('realm-finder').onchange=()=>{const layer=entries.get($('realm-finder').value);if(layer){$('region-filter').value='';filterRegions();select(layer,true);$('panel-close').focus();}};
  function wire(layer,f){
    if(!['Polygon','MultiPolygon'].includes(f.geometry.type))return;
    const p=f.properties||{};f.properties=p;p.id=String(p.id||crypto.randomUUID());p.name=String(p.name||'Unnamed territory');
    if(entries.has(p.id))p.id=crypto.randomUUID();
    layer.feature=f;layer.groupKey=groupKey(p);layer.options.pane=layer.groupKey;
    layer.setStyle(style(f));
    if(!lite){layer.bindTooltip(tooltip(f),{className:'territory-tooltip',sticky:true});layer.on('mouseover',()=>{entries.forEach(other=>{if(other!==layer)other.closeTooltip();});layer.setStyle({weight:3});});layer.on('mouseout',()=>layer.setStyle(style(f)));}
    layer.on('click',()=>select(layer));
    layer.on('add',()=>{const path=layer.getElement();if(path){path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',p.name);path.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select(layer);}};}});
    layer.on('pm:edit',()=>{for(const entry of labelEntries)if(entry.layer===layer)entry.marker.setLatLng(layer.getBounds().getCenter());p.label=undefined;markDirty();updateLabels();});
    groups[layer.groupKey].addLayer(layer);entries.set(p.id,layer);addLabel(layer);
  }
  function addFeatures(fc){L.geoJSON(fc,{onEachFeature:(f,layer)=>wire(layer,f)});}
  function filterRegions(){const region=$('region-filter').value;entries.forEach(layer=>{const active=!region||layer.feature.properties.region===region;layer.setStyle({...style(layer.feature),fillOpacity:active?style(layer.feature).fillOpacity:.08});});}
  $('region-filter').onchange=()=>{const filtered=[...entries.values()].filter(l=>!$('region-filter').value||l.feature.properties.region===$('region-filter').value);if(filtered.length)map.fitBounds(L.featureGroup(filtered).getBounds(),{padding:[30,30],animate:false});filterRegions();};
  for(const id of ['countries','regions','rivers'])$(id).onchange=()=>{if($(id).checked)groups[id].addTo(map);else map.removeLayer(groups[id]);updateLabels();};
  const cityEntries=[];
  function updateCities(){for(const {marker,minZoom} of cityEntries){const visible=$('cities').checked&&map.getZoom()>=minZoom;if(visible&&!map.hasLayer(marker))marker.addTo(map);else if(!visible&&map.hasLayer(marker))map.removeLayer(marker);}}
  $('cities').onchange=updateCities;map.on('zoomend',updateCities);
  document.querySelectorAll('[name=mapmode]').forEach(radio=>radio.onchange=()=>{mode=radio.value;filterRegions();});
  function remember(){if(!ready)return;try{sessionStorage.setItem(storageKey,JSON.stringify({center:[map.getCenter().lat,map.getCenter().lng],zoom:map.getZoom(),mode,selected:selected?.feature.properties.id,layers:Object.fromEntries(['countries','regions','cities','rivers','labels','reference'].map(id=>[id,$(id).checked]))}));}catch{}}
  window.addEventListener('pagehide',remember);$('detail-switch').addEventListener('click',remember);$('editor-toggle').addEventListener('click',remember);$('submap-link').addEventListener('click',remember);
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  async function read(name){const response=await fetch(config.data+name);if(!response.ok)throw new Error('Could not load '+name);return response.json();}
  async function init(){
    try{
      const empty=()=>({type:'FeatureCollection',features:[]});
      const data=lite?{...await read('lite.json'),rivers:empty(),cities:empty()}:Object.fromEntries(await Promise.all(['land','lakes','rivers','territories','cities'].map(async n=>[n,await read(n+'.geojson')])));
      L.geoJSON(data.land,{pane:'land',interactive:false,pmIgnore:true,style:{color:'#796747',weight:.8,fillColor:'#f0e5cd',fillOpacity:1}}).addTo(map);
      L.geoJSON(data.lakes,{pane:'water',interactive:false,pmIgnore:true,style:{color:'#9d8961',weight:.6,fillColor:'#d6c6a4',fillOpacity:1}}).addTo(map);
      L.geoJSON(data.rivers,{pane:'water',interactive:false,pmIgnore:true,style:{color:'#4e829b',weight:1.4,opacity:.8}}).addTo(groups.rivers);
      addFeatures(data.territories);refreshFinder();
      for(const f of data.cities.features){const p=f.properties,[x,y]=f.geometry.coordinates;
        const marker=L.circleMarker([y,x],{radius:p.tier==='capital'?4:2,color:'#655137',weight:1,fillColor:'#b59a60',fillOpacity:.9,pmIgnore:true});marker.bindTooltip(textNode('span',p.name));marker.on('click',()=>marker.openTooltip());
        cityEntries.push({marker,minZoom:config.crs==='image'?-1:p.tier==='capital'?2:p.tier==='province'?4:p.tier==='metro'?5:6});}
      const regions=[...new Set([...entries.values()].map(l=>l.feature.properties.region).filter(Boolean))];
      if(regions.length){$('region-filter-wrap').hidden=false;regions.forEach(r=>$('region-filter').add(new Option(r,r)));}
      ready=true;
      if(params.get('return')==='1'||performance.getEntriesByType('navigation')[0]?.type==='back_forward'){
        try{const saved=JSON.parse(sessionStorage.getItem(storageKey));if(saved&&saved.center?.length===2&&saved.center.every(Number.isFinite)&&Number.isFinite(saved.zoom)){
          map.setView(saved.center,Math.max(map.getMinZoom(),Math.min(map.getMaxZoom(),saved.zoom)),{animate:false});
          mode=saved.mode==='cultures'?'cultures':'realms';document.querySelector('[name=mapmode][value='+mode+']').checked=true;filterRegions();
          for(const [id,checked] of Object.entries(saved.layers||{})){if($(id)&&!$(id).disabled){$(id).checked=!!checked;$(id).dispatchEvent(new Event('change'));}}
          if(entries.has(saved.selected))select(entries.get(saved.selected));
        }}catch{}
      }
      updateLabels();updateCities();status(entries.size?entries.size+' territories ready.':'Blank atlas ready. Open the editor to add a territory.');
      if(edit)await enableEditor();
    }catch(error){panel(true);status('Part of the atlas could not load. Check your connection and reload.');$('retry').hidden=false;console.error(error);}
  }
  async function enableEditor(){
    const css=document.createElement('link');css.rel='stylesheet';css.href='../vendor/geoman.css';document.head.append(css);
    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='../vendor/geoman.js';script.onload=resolve;script.onerror=()=>reject(new Error('Editor library unavailable'));document.head.append(script);});
    L.PM.reInitLayer(map);Object.values(groups).forEach(group=>L.PM.reInitLayer(group));
    map.pm.addControls({position:'topright',drawMarker:false,drawCircleMarker:false,drawPolyline:false,drawRectangle:false,drawCircle:false,drawText:false,cutPolygon:false,rotateMode:false,dragMode:false});
    map.pm.setGlobalOptions({snappable:true,allowSelfIntersection:false});
    map.on('pm:create',event=>{const f=event.layer.toGeoJSON();f.properties={id:crypto.randomUUID(),name:'New territory',kind:'country',canon:true,color:'#b31f34'};wire(event.layer,f);refreshFinder();select(event.layer);markDirty();});
    map.on('pm:remove',event=>{entries.delete(event.layer.feature?.properties.id);Object.values(groups).forEach(group=>group.removeLayer(event.layer));for(let i=labelEntries.length-1;i>=0;i--)if(labelEntries[i].layer===event.layer){map.removeLayer(labelEntries[i].marker);labelEntries.splice(i,1);}if(selected===event.layer){selected=null;panel(true);}refreshFinder();markDirty();});
    $('edit-form').onsubmit=event=>{event.preventDefault();if(!selected){$('editor-status').textContent='Draw or select a territory first.';return;}
      const p=selected.feature.properties,oldGroup=selected.groupKey;
      for(const [id,key] of [['name','name'],['culture','culture'],['alliance','alliance'],['author','claim'],['description','summary']])p[key]=$('edit-'+id).value.trim();
      if(!p.name){$('editor-status').textContent='Enter a territory name.';return;}
      p.color=$('edit-color').value;p.kind=$('edit-kind').value;p.canon=p.kind==='country';p.wiki=safeURL($('edit-wiki').value)||'';p.flag=assetURL($('edit-flag').value)?$('edit-flag').value:'';p.flagShopUrl=safeURL($('edit-shop').value)||'';
      selected.groupKey=groupKey(p);if(oldGroup!==selected.groupKey){groups[oldGroup].removeLayer(selected);selected.options.pane=selected.groupKey;groups[selected.groupKey].addLayer(selected);}
      selected.setStyle(style(selected.feature));selected.setTooltipContent(tooltip(selected.feature));selected.getElement()?.setAttribute('aria-label',p.name);
      for(let i=labelEntries.length-1;i>=0;i--)if(labelEntries[i].layer===selected){map.removeLayer(labelEntries[i].marker);labelEntries.splice(i,1);}addLabel(selected);updateLabels();refreshFinder();select(selected);markDirty();
    };
    $('export').onclick=()=>{
      const data={type:'FeatureCollection',coordinateSystem:config.crs==='image'?'image-pixels-1600x1548':'WGS84',scenario:scene,features:[...entries.values()].map(l=>l.toGeoJSON())};
      const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download=scene+'-territories.geojson';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);dirty=false;$('editor-status').textContent='Export requested. Publish the downloaded data file to save it on your website.';
    };
    $('import').onchange=async()=>{try{
      const file=$('import').files[0];if(!file)return;if(file.size>15_000_000)throw new Error('Choose a file smaller than 15 MB.');
      const data=JSON.parse(await file.text());const expected=config.crs==='image'?'image-pixels-1600x1548':'WGS84';
      if(data.coordinateSystem&&data.coordinateSystem!==expected)throw new Error('This file uses a different coordinate system.');
      const validCoordinates=value=>Array.isArray(value)&&value.length>0&&(typeof value[0]==='number'?value.length>=2&&value.every(Number.isFinite):value.every(validCoordinates));
      if(data.type!=='FeatureCollection'||!Array.isArray(data.features)||data.features.some(f=>f.type!=='Feature'||!['Polygon','MultiPolygon'].includes(f.geometry?.type)||!validCoordinates(f.geometry.coordinates)))throw new Error('Choose a polygon GeoJSON FeatureCollection.');
      addFeatures(data);entries.forEach(l=>L.PM.reInitLayer(l));refreshFinder();updateLabels();markDirty();$('editor-status').textContent='Imported '+data.features.length+' territories. Existing territories were kept. Export to save.';
    }catch(error){$('editor-status').textContent=error.message;}finally{$('import').value='';}};
    panel(true,!!selected);
  }
  init();
})();
