(function(){
'use strict';
const db=window.ARCANUS_DB,collections=['characters','locations','factions','events','mechanics'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=collections.flatMap(k=>db[k]||[]),record=id=>all.find(r=>r.id===id),name=id=>record(id)?.name||'Unresolved reference';
const status=s=>({established:'Confirmed canon',planned:'Planned — not completed history',unresolved:'Unresolved — not applied to history'}[s]||s);
function date(d){if(!d)return 'Not recorded';const era=d.era==='AF'?'A.F.':d.era==='BF'?'B.F.':d.era||'';if(d.precision==='range')return d.start_year+'–'+d.end_year+' '+era+' (range; not a single-year event)';if(d.precision==='unknown')return 'Undated'+(d.relative?' — '+d.relative:'');return (d.precision==='approximate'?'Approximately ':'')+d.year+' '+era}
const sources=r=>(r?.sources||[]).map(s=>'Grand Chronicle · PDF pages '+s.pages.join(', ')+(s.volume?' · Volume '+s.volume+', pages '+s.volume_pages.join(', '):'')).join('; ');
const source=r=>'<small class="source">'+esc(sources(r)||'Source not recorded')+'</small>';
const facts=r=>(r?.reference_facts||[]).map(f=>'<div class="reference-fact"><strong>'+esc(f.label)+'</strong><p>'+esc(f.value)+'</p><small>'+esc(status(f.canon_status))+' · Reference, not a dated state change</small>'+source(f)+'</div>').join('');
window.ArcanusReference={collections,all,esc,record,name,status,date,sources,source,facts};
})();
