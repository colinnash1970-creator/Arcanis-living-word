/* Town adapter. Canonical dates are independent of legacy 30-day accounting buckets. */
function migrateCalendar(){
 const E=ArcanusEngine;
 if(!world.calendar){
  const year=793+Math.floor(world.month/12),month=world.month%12+1;
  const day=Math.min(world.day,E.daysInMonth(year,month));
  const minute=world.livingClock.minute;
  const date={year,month,day,hour:Math.floor(minute/60),minute:minute%60};
  world.calendar={schema:1,date,anchorDate:{...date,hour:0,minute:0},anchorDay:worldDay(),hemisphere:'north',offset:0,offsetConfirmed:false,
   migration:{legacyMonth:world.month,legacyDay:world.day,clamped:day!==world.day}};
 }
 world.paused=true;
 world.livingClock.minute=world.calendar.date.hour*60+world.calendar.date.minute;
 world.version=12;
}
function validateCalendar(data){
 const E=ArcanusEngine,c=data.calendar;
 if(!c||c.schema!==1)throw Error('Missing calendar state.');
 E.validate(c.date);E.validate(c.anchorDate);
 if(!Number.isInteger(c.date.hour)||!Number.isInteger(c.date.minute)||c.anchorDate.hour!==0||c.anchorDate.minute!==0)throw Error('Incomplete calendar time.');
 const day=data.month*30+data.day-1;
 if(!Number.isSafeInteger(c.anchorDay)||c.anchorDay<0||c.anchorDay>day)throw Error('Invalid calendar anchor.');
 const expected=E.shift(c.anchorDate,(day-c.anchorDay)*1440);
 if(E.toStamp({...c.date,hour:0,minute:0})!==E.toStamp(expected))throw Error('Calendar and simulated days disagree.');
 if(data.livingClock.minute!==c.date.hour*60+c.date.minute||data.paused!==true)throw Error('Calendar must use a consistent manual clock.');
 if(!['north','south'].includes(c.hemisphere)||typeof c.offsetConfirmed!=='boolean')throw Error('Invalid calendar settings.');
 E.earthStamp(c.date,c.offset);
}
function townDateAt(day,minute=0){
 const c=world.calendar;
 return ArcanusEngine.shift(c.anchorDate,(day-c.anchorDay)*1440+minute);
}
function calendarStamp(day,minute){
 const c=world.calendar;
 if(!c||day<c.anchorDay)return `Legacy accounting day ${day} · ${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
 const d=townDateAt(day,minute);
 return `${d.day} ${ArcanusCalendarData.months[d.month-1]} ${d.year} AF · ${String(d.hour).padStart(2,'0')}:${String(d.minute).padStart(2,'0')}`;
}
function advanceCalendarMinutes(minutes){
 if(loadFailed)return;
 if(!Number.isSafeInteger(minutes)||minutes<1||minutes>366*1440)throw Error('Advance between one minute and one year at a time.');
 const E=ArcanusEngine,target=E.shift(world.calendar.date,minutes);
 const before=JSON.stringify(world),oldMinute=world.livingClock.minute,days=Math.floor((oldMinute+minutes)/1440);
 try{
  if(days===0)livingRange(worldDay(),oldMinute,oldMinute+minutes);
  // Existing routines are condensed for multi-day steps; each economy day runs once.
  simulateDays(days,false);
  world.calendar.date=target;world.livingClock.minute=target.hour*60+target.minute;
  addEvent(`Manual calendar advance: ${minutes} minutes (${days} day boundaries).`);
  validateSave(world);
 }catch(err){world=JSON.parse(before);eventContext=null;throw err;}
 populationRenderKey='';lastLedgerRenderKey=null;innRenderKey='';persist();render();
}
function advanceCalendarMonths(months){
 if(loadFailed)return;
 if(!Number.isInteger(months)||months<1||months>12)throw Error('Choose 1–12 calendar months.');
 const E=ArcanusEngine,target=E.shiftMonth(world.calendar.date,months);
 advanceCalendarMinutes((E.toStamp(target)-E.toStamp(world.calendar.date))/E.MINUTE);
}
function calendarAction(fn){try{fn()}catch(e){$('calendarError').textContent=e.message;}}
function renderTownCalendar(){
 const host=$('calendarSummary');if(!host||!world.calendar)return;
 const E=ArcanusEngine,C=ArcanusCalendarData,c=world.calendar,d=c.date,w=E.watch(d),s=E.season(d,c.hemisphere,c.offset),m=E.moon(d,c.offset);
 $('date').textContent=`${C.weekdays[E.weekday(d)]} · ${d.day} ${C.months[d.month-1]} ${d.year} AF`;
 $('liveTime').textContent=`${String(d.hour).padStart(2,'0')}:${String(d.minute).padStart(2,'0')} · ${w.name}`;
 $('clockStatus').textContent='Manual campaign time · Starhaven standard · no DST';
 $('pauseButton').hidden=true;
 $('nextDay').textContent='Time advances only through your controls. Closing or reopening the simulator advances nothing.';
 host.replaceChildren();
 const add=(text,cls)=>{const p=document.createElement('p');p.textContent=text;if(cls)p.className=cls;host.append(p)};
 add(`${s.name} (${c.hemisphere==='north'?'northern':'southern'}) · Aeloria: ${m.name}, ${Math.round(m.illumination*100)}% illuminated`);
 add(`${s.quality}. ${m.quality}.`,'muted');
 const events=E.eventsOn(d);add(events.length?'On this day: '+events.map(e=>e.name+(e.type==='birthday'?' (birthday)':'')).join(' · '):'No registered observances or birthdays today.');
 add('UK reference: '+E.ukReference(E.earthStamp(d,c.offset))+(c.offsetConfirmed?'':' · UTC+0 alignment provisional'),'muted');
 if(c.migration?.clamped)add('Imported legacy date used a day absent from this month; calendar day was clamped to the last valid day. Original day is preserved in save metadata.','muted');
 $('calendarHemisphere').value=c.hemisphere;$('calendarOffset').value=c.offset;
 const query=new URLSearchParams({year:d.year,month:d.month,day:d.day,hour:d.hour,minute:d.minute,hemisphere:c.hemisphere,offset:c.offset,offsetConfirmed:String(c.offsetConfirmed)});
 $('calendarBrowse').href=$('calendarBrowse').dataset.base+'?'+query;
 try{$('calendarBackup').hidden=localStorage.getItem(KEY+'-before-calendar-v12')===null}catch{$('calendarBackup').hidden=true}
 if(window.renderCanonYear)window.renderCanonYear(d.year);
}
function exportCalendarBackup(){
 calendarAction(()=>{const raw=localStorage.getItem(KEY+'-before-calendar-v12');if(raw===null)throw Error('No pre-calendar backup is stored on this device.');const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='kaddinghall-before-calendar.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
function updateCalendarSettings(){
 if(loadFailed)return;
 calendarAction(()=>{const hemisphere=$('calendarHemisphere').value,raw=$('calendarOffset').value;if(raw.trim()==='')throw Error('Enter a UTC offset in minutes.');const offset=Number(raw);ArcanusEngine.season(world.calendar.date,hemisphere,offset);world.calendar.hemisphere=hemisphere;world.calendar.offset=offset;world.calendar.offsetConfirmed=true;persist();render();});
}
