(function(){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const db=window.ARCANUS_DB;
 let current;
 function render(year){
  const host=document.getElementById('canon-state');if(!host)return;
  if(current?.year_af===year)return;
  try{current=ArcanusCanon.project(db,year)}catch(e){current=null;host.textContent=e.message;return}
  const names=ids=>ids.map(id=>db.characters.find(r=>r.id===id)?.name||id).join(', ');
  host.innerHTML='<p><strong>'+year+' A.F.</strong> · Recorded monarch: '+esc(names(current.monarch_ids)||'Unknown')+'</p><p>Annual view: dated events are included in their listed year. Empty fields are unknown. Facts persist until a documented change; this is not a forecast.</p>'+Object.values(current.entities).filter(e=>Object.keys(e.facts).length).map(e=>'<article class="item"><h3>'+esc(e.name)+'</h3>'+Object.entries(e.facts).map(([key,f])=>'<p>'+esc(key.replaceAll('_',' '))+': <strong>'+esc(f.value)+'</strong><br><small>'+esc(f.event_id)+' · Chronicle pages '+esc((f.sources||[]).flatMap(s=>s.pages).join(', '))+'</small></p>').join('')+'</article>').join('')+'<h3>Established events through this year</h3><ol>'+current.occurred_event_ids.map(id=>{const e=db.events.find(e=>e.id===id);return '<li>'+e.date.year+' · '+esc(e.name)+'</li>'}).join('')+'</ol><h3>Excluded from world state</h3>'+current.excluded_events.map(x=>{const e=db.events.find(e=>e.id===x.id);return '<p>'+esc(e.name)+' · '+esc(x.status)+' — '+esc(x.reason)+'</p>'}).join('');
 }
 window.renderCanonYear=render;
 const year=document.getElementById('canon-year');
 if(year){year.addEventListener('input',()=>render(year.value.trim()===''?NaN:Number(year.value)));document.querySelectorAll('[data-canon-year]').forEach(b=>b.addEventListener('click',()=>{year.value=b.dataset.canonYear;render(Number(year.value))}));render(Number(year.value))}
 const download=document.getElementById('canon-export');if(download)download.addEventListener('click',()=>{if(!current)return;const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='arcanus-canon-state-'+current.year_af+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
})();
