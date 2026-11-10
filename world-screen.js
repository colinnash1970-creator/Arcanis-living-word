/* World-screen presentation only. No separate clock, calendar arithmetic or event copies. */
(()=>{
 const E=ArcanusEngine,C=ArcanusCalendarData,$=id=>document.getElementById(id),pad=n=>String(n).padStart(2,'0');
 const frame=$('town-frame');let calendar=null;
 const send=message=>frame.contentWindow.postMessage({channel:'arcanus-calendar',...message},location.protocol==='file:'?'*':location.origin);
 function text(id,value){$(id).textContent=value;}
 function render(){
  const d=calendar.date,moon=E.moon(d,calendar.offset),season=E.season(d,calendar.hemisphere,calendar.offset);
  // Keep this display order identical to the five fields in index.html.
  text('world-time',`${pad(d.hour)}:${pad(d.minute)}`);
  text('world-watch',E.watch(d).name);
  text('world-moon',moon.name);
  text('world-weekday',C.weekdays[E.weekday(d)]);
  text('world-date',`${d.day} ${C.months[d.month-1]}, ${d.year} AF`);
  text('moon-detail',`${Math.round(moon.illumination*100)}% illuminated · ${moon.quality}`);
  text('season',season.name);text('season-detail',`${calendar.hemisphere==='north'?'Northern':'Southern'} hemisphere · ${season.quality}`);
  text('earth-reference',E.ukReference(E.earthStamp(d,calendar.offset))+(calendar.offsetConfirmed?'':' · provisional UTC+0 alignment'));
  const today=E.eventsOn(d);$('today-events').replaceChildren();
  if(!today.length)$('today-events').textContent='No registered observances or birthdays today.';
  for(const event of today){const p=document.createElement('p');p.textContent=event.name+(event.type==='birthday'?' · Birthday':'');$('today-events').append(p);}
  text('clock-status','Shared simulation time · advances only through your controls');
  document.querySelectorAll('[data-step]').forEach(button=>button.disabled=false);
  if(window.renderCanonYear)window.renderCanonYear(d.year);
  renderRegister();
 }
 function renderRegister(){
  if(!calendar)return;const q=$('event-search').value.toLowerCase().trim();
  const events=E.eventsInYear(calendar.date.year).filter(e=>[e.name,e.realm,e.notes].filter(Boolean).join(' ').toLowerCase().includes(q));
  $('event-rows').replaceChildren();
  for(const event of events){const tr=document.createElement('tr');for(const value of [`${event.day} ${C.months[event.month-1]}`,event.name,event.type==='birthday'?'Birthday':event.type==='leap-festival'?'Leap festival':event.category,[event.realm,event.notes].filter(Boolean).join(' · ')]){const td=document.createElement('td');td.textContent=value;tr.append(td);}$('event-rows').append(tr);}
  text('register-year',`${events.length} matching records occurring in ${calendar.date.year} AF. The complete register contains 50 annual observances, The Hidden Dawn and seven birthdays.`);
 }
 window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow)return;
  if(location.protocol!=='file:'&&event.origin!==location.origin)return;
  const message=event.data;if(message?.channel!=='arcanus-calendar')return;
  if(message.error){text('world-error',message.error);return;}
  if(message.kind!=='state'||!message.calendar)return;
  try{E.validate(message.calendar.date);E.earthStamp(message.calendar.date,message.calendar.offset);calendar=message.calendar;text('world-error','');render();}catch(e){text('world-error',e.message);}
 });
 function selectView(name){
  for(const id of ['world','town','register']){$('view-'+id).hidden=id!==name;$('nav-'+id).setAttribute('aria-pressed',String(id===name));}
 }
 for(const id of ['world','town','register'])$('nav-'+id).onclick=()=>selectView(id);
 $('open-town').onclick=()=>selectView('town');
 document.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>{if(!calendar)return;text('world-error','');send({kind:'advance',unit:button.dataset.unit,amount:Number(button.dataset.step)});});
 $('event-search').addEventListener('input',renderRegister);
 frame.addEventListener('load',()=>send({kind:'read'}));
 send({kind:'read'});
 setTimeout(()=>{if(!calendar)text('world-error','The town calendar has not connected. Open Kaddinghall below to check its loading message. Keep the extracted folders together.');},8000);
})();
