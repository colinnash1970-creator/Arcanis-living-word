(function(root){
  const C=typeof module==='object'?require('./canon.js'):root.ArcanusCalendarData;
  const A=typeof module==='object'?require('./astronomy.js'):root.ArcanusAstronomy;
  const DAY=86400000, MINUTE=60000, MAX_YEAR=8801;
  const mod=(a,b)=>((a%b)+b)%b;
  function yearCheck(y){if(!Number.isInteger(y)||y<0||y>MAX_YEAR)throw Error('Year must be a whole number from 0 to 8801 AF.');}
  function leap(y){yearCheck(y);const ce=y+C.yearOffset;return ce%4===0&&(ce%100!==0||ce%400===0);}
  function daysInMonth(y,m){yearCheck(y);if(!Number.isInteger(m)||m<1||m>12)throw Error('Month must be 1–12.');return [31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m-1];}
  function validate(d){yearCheck(d.year);if(!Number.isInteger(d.day)||d.day<1||d.day>daysInMonth(d.year,d.month))throw Error('That day does not exist in the selected month.');for(const [k,max]of [['hour',23],['minute',59]])if(!Number.isInteger(d[k]??0)||(d[k]??0)<0||(d[k]??0)>max)throw Error('Use a valid 24-hour time.');return d;}
  function toStamp(d){validate(d);return Date.UTC(d.year+C.yearOffset,d.month-1,d.day,d.hour??0,d.minute??0);}
  function fromStamp(ms){if(!Number.isFinite(ms))throw Error('Invalid date.');const d=new Date(ms);return validate({year:d.getUTCFullYear()-C.yearOffset,month:d.getUTCMonth()+1,day:d.getUTCDate(),hour:d.getUTCHours(),minute:d.getUTCMinutes()});}
  function shift(d,minutes){if(!Number.isFinite(minutes))throw Error('Invalid time step.');return fromStamp(toStamp(d)+minutes*MINUTE);}
  function shiftMonth(d,delta){validate(d);if(!Number.isInteger(delta))throw Error('Month step must be whole.');const n=d.year*12+d.month-1+delta,y=Math.floor(n/12),m=mod(n,12)+1;return validate({...d,year:y,month:m,day:Math.min(d.day,daysInMonth(y,m))});}
  function weekday(d){return mod(new Date(toStamp(d)).getUTCDay()+6,7);}
  function watch(d){validate(d);const index=Math.floor((d.hour??0)/3);return {index,name:C.watches[index],start:index*3,end:(index+1)*3};}
  function offsetCheck(offset){if(!Number.isInteger(offset)||offset< -840||offset>840)throw Error('Earth alignment must be whole minutes from −840 to +840.');}
  function earthStamp(d,offset=0){offsetCheck(offset);return toStamp(d)-offset*MINUTE;}
  function fromEarth(iso,offset=0){offsetCheck(offset);if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?Z$/.test(iso))throw Error('Use an explicit UTC date and time.');const ms=Date.parse(iso);if(!Number.isFinite(ms))throw Error('Invalid Earth date.');const normalized=new Date(ms).toISOString().slice(0,16);if(normalized!==iso.slice(0,16))throw Error('Invalid Earth date.');return fromStamp(ms+offset*MINUTE);}
  function moon(d,offset=0){const t=earthStamp(d,offset),period=C.lunarPeriodDays*DAY,age=mod(t-Date.parse(A.lunarEpoch),period)/DAY, fraction=age/C.lunarPeriodDays;
    const names=['New moon','Waxing crescent','First quarter','Waxing gibbous','Full moon','Waning gibbous','Last quarter','Waning crescent'];
    return {age,fraction,illumination:(1-Math.cos(2*Math.PI*fraction))/2,name:names[Math.round(fraction*8)%8],nextNew:t+(C.lunarPeriodDays-age)*DAY,quality:d.year<828?'Approximate historical back-projection':d.year===828?'Mean-cycle estimate, anchored to the 2026 new moon':'Approximate forward projection'};
  }
  function season(d,hemisphere='north',offset=0){if(!['north','south'].includes(hemisphere))throw Error('Choose north or south.');const t=earthStamp(d,offset),ce=d.year+C.yearOffset;let index=3;
    A.seasonTurns.forEach((s,i)=>{if(t>=Date.UTC(ce,s.month-1,s.day,s.hour,s.minute))index=i;});
    if(hemisphere==='south')index=(index+2)%4;
    return {name:C.seasons[index],index,quality:d.year===828?'2026 astronomical turning points':'Approximate: repeated 2026 seasonal template'};
  }
  function validateEvents(events){if(!Array.isArray(events)||events.length>5000)throw Error('Events must be an array of at most 5,000 entries.');const ids=new Set();return events.map(e=>{
    if(!e||typeof e.id!=='string'||!e.id.trim()||ids.has(e.id))throw Error('Each event needs a unique text id.');ids.add(e.id);
    if(typeof e.name!=='string'||!e.name.trim()||e.name.length>160)throw Error('Each event needs a name (1–160 characters).');
    if(!['observance','birthday','leap-festival','campaign'].includes(e.type))throw Error('Unknown event type.');
    if(e.year!==undefined)yearCheck(e.year);
    validate({year:e.year??2,month:e.month,day:e.day}); // 2 AF = 1200 CE: leap year, permits recurring Feb 29.
    if(e.type==='leap-festival'&&(e.month!==2||e.day!==29))throw Error('Leap festivals must be on 29 Frostveil.');
    for(const key of ['birthYear','originYear'])if(e[key]!==undefined)yearCheck(e[key]);
    return {...e,name:e.name.trim(),notes:typeof e.notes==='string'?e.notes.slice(0,2000):''};
  });}
  function active(e,y){return (e.year===undefined||e.year===y)&&(e.birthYear===undefined||y>=e.birthYear)&&(e.originYear===undefined||y>=e.originYear)&&(e.type!=='leap-festival'||leap(y));}
  function eventsOn(d,events=C.events){validate(d);return events.filter(e=>e.month===d.month&&e.day===d.day&&active(e,d.year));}
  function eventsInYear(y,events=C.events){yearCheck(y);return events.filter(e=>active(e,y)&&e.day<=daysInMonth(y,e.month)).sort((a,b)=>a.month-b.month||a.day-b.day||a.name.localeCompare(b.name));}
  function ukReference(ms){const year=new Date(ms).getUTCFullYear(); // Modern GMT/BST only: do not imply medieval UK civil time.
    if(year<1972)return new Date(ms).toISOString().slice(0,16).replace('T',' ')+' UTC (proleptic Earth reference; historical UK time not modelled)';
    return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZoneName:'short'}).format(ms);
  }
  const api={DAY,MINUTE,MAX_YEAR,leap,daysInMonth,validate,toStamp,fromStamp,shift,shiftMonth,weekday,watch,earthStamp,fromEarth,moon,season,validateEvents,eventsOn,eventsInYear,ukReference};
  if(typeof module==='object')module.exports=api;else root.ArcanusEngine=api;
})(globalThis);
