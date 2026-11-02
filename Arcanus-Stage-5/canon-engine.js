/* Pure annual canon projection. No economy, random outcomes or source mutations. */
(function(root){
'use strict';
const rules = {
 'event:unification': [['faction:council_eight','institution','constituted']],
 'event:sternia_fall': [['location:sternia','settlement','destroyed'],['location:sternia','nexus','survives, weakened']],
 'event:elianora_killed': [['person:elianora','physical_state','physically killed']],
 'event:elianora_sacrifice': [['person:elianora','soul_state','sacrificed']],
 'event:alaric_exile': [['person:tyrenvale:16','political_state','exiled'],['person:malcolm','office','Temporary High Councillor']],
 'event:alaric_death': [['person:tyrenvale:16','physical_state','dead']],
 'event:aldren_coronation': [['person:tyrenvale:17','coronation','secretly crowned']],
 'event:council_abolished': [['faction:council_eight','institution','unconstitutionally abolished']],
 'event:iron_rule': [['person:malcolm','rule','Iron Rule begun']]
};
function validate(db){
 const records=['characters','locations','factions','events'].flatMap(k=>{if(!Array.isArray(db[k]))throw Error('Missing collection: '+k);return db[k]}).concat(db.mechanics||[]);
 const ids=new Set();for(const r of records){if(!r.id||ids.has(r.id))throw Error('Missing or duplicate record ID');ids.add(r.id);if(!r.canon_status)throw Error('Missing canon status: '+r.id)}
 for(const r of records){for(const id of r.related_ids||[])if(!ids.has(id))throw Error('Broken reference: '+id)}
 for(const r of db.relationships||[])for(const id of [r.subject_id,r.object_id])if(!ids.has(id))throw Error('Broken relationship: '+id);
 return true;
}
function project(db,year){
 if(!Number.isSafeInteger(year)||year<0||year>9999)throw Error('Choose a whole A.F. year from 0 to 9999.');
 validate(db);
 const entities=Object.fromEntries(['characters','locations','factions'].flatMap(k=>db[k].map(r=>[r.id,{id:r.id,name:r.name,facts:{}}])));
 const set=(id,key,value,e)=>{if(!entities[id])throw Error('Missing effect target: '+id);entities[id].facts[key]={value,event_id:e.id,sources:e.sources}};
 const dated=e=>e.date?.era==='AF'&&Number.isSafeInteger(e.date.year)&&e.date.year>=0&&(!e.date.precision||e.date.precision==='exact');
 const ordered=db.events.map((e,i)=>({e,i})).sort((a,b)=>(a.e.date?.year??Infinity)-(b.e.date?.year??Infinity)||a.i-b.i).map(x=>x.e);
 const occurred=[],pending=[],excluded=[];
 for(const e of ordered){
  if(e.canon_status!=='established'||!dated(e)){excluded.push({id:e.id,status:e.canon_status,reason:e.canon_status!=='established'?'Not established completed history':'Reference history; no precise supported A.F. date'});continue}
  if(e.date.year>year){pending.push(e.id);continue}
  occurred.push(e.id);for(const [id,key,value] of rules[e.id]||[])set(id,key,value,e);
 }
 // The source explicitly says AFTER 793; do not assign an invented day within 793.
 const sternia=db.locations.find(r=>r.id==='location:sternia');
 if(year>793&&sternia?.canon_status==='established'&&occurred.includes('event:sternia_fall')&&sternia.nexus_condition_after_793)set(sternia.id,'nexus_condition',sternia.nexus_condition_after_793,sternia);
 const monarchs=db.characters.filter(r=>r.canon_status==='established'&&r.reign&&r.reign.start_af<=year&&(r.reign.end_af===null||year<r.reign.end_af)).map(r=>r.id);
 return {schema_version:'stage3.1',year_af:year,precision:'annual; events included in their listed year; no within-year order asserted',entities,monarch_ids:monarchs,occurred_event_ids:occurred,pending_event_ids:pending,excluded_events:excluded};
}
const api={project,validate,rules};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ArcanusCanon=api;
})(typeof globalThis!=='undefined'?globalThis:this);
