const KEY='arcanus-kaddinghall';
const DAY=86400000, DAYS_PER_MONTH=30;
const initial=()=>({version:2,month:0,day:1,pop:3000,food:9000,gold:5000,farms:80,events:[],paused:false,lastUpdated:Date.now()});
let world;
try {world=JSON.parse(localStorage.getItem(KEY))||initial()}catch {world=initial()}
// Migrate v1 without resetting existing saves. The real-time clock begins on first v1.1 opening.
if(world.version===1){world={...world,version:2,day:1,paused:false,lastUpdated:Date.now()}}
if(!Number.isFinite(world.lastUpdated))world.lastUpdated=Date.now();
if(!Number.isFinite(world.day)||world.day<1||world.day>30)world.day=1;
if(typeof world.paused!=='boolean')world.paused=false;
const $=id=>document.getElementById(id);
function persist(){localStorage.setItem(KEY,JSON.stringify(world))}
function addEvent(message){world.events.unshift(message);world.events=world.events.slice(0,150)}
function simulateMonth(){
 const m=world.month%12;
 const harvest=m===9?world.farms*420:0;
 const available=world.food+harvest;
 const shortage=Math.max(0,world.pop-available);
 world.food=Math.max(0,available-world.pop);
 const births=Math.round(world.pop*.03/12);
 const deaths=Math.round(world.pop*.025/12)+Math.ceil(shortage/100);
 world.pop=Math.max(0,world.pop+births-deaths);
 world.gold+=Math.round(world.pop*.025-world.farms*.2);
 world.month++;
 addEvent(`${793+Math.floor((world.month-1)/12)} A.F. month ${(world.month-1)%12+1}: ${births} births, ${deaths} deaths; harvest ${harvest} units${shortage?`; shortage ${shortage}`:''}.`);
}
function simulateDays(days){
 // Only whole days advance. Each 30-day month invokes the established v1 economy once.
 for(let i=0;i<days;i++){
   world.day++;
   if(world.day>DAYS_PER_MONTH){world.day=1;simulateMonth()}
 }
}
function catchUp(){
 const now=Date.now();
 if(now<world.lastUpdated){world.lastUpdated=now;persist();return}
 if(world.paused){world.lastUpdated=now;persist();return}
 const elapsed=now-world.lastUpdated;
 const days=Math.floor(elapsed/DAY);
 if(days>0){
   // Skip huge per-day loops by stepping only through month boundaries.
   let remaining=days;
   while(remaining>0){const untilNextMonth=DAYS_PER_MONTH-world.day+1;
     if(remaining>=untilNextMonth){remaining-=untilNextMonth;world.day=1;simulateMonth()}
     else{world.day+=remaining;remaining=0}
   }
   world.lastUpdated+=days*DAY;
   addEvent(`Real-time catch-up: ${days.toLocaleString('en-GB')} day${days===1?'':'s'} passed while you were away.`);
   persist();
 }
}
function render(){
 $('date').textContent=`${793+Math.floor(world.month/12)} A.F. · Month ${world.month%12+1} · Day ${world.day}`;
 for(const id of ['pop','food','gold','farms'])$(id).textContent=world[id].toLocaleString('en-GB');
 $('log').replaceChildren(...world.events.slice(0,20).map(e=>{const li=document.createElement('li');li.textContent=e;return li}));
 $('clockStatus').textContent=world.paused?'Paused — no time passes while away':'Running · 1 real day = 1 Arcanus day';
 $('pauseButton').textContent=world.paused?'Resume world':'Pause world';
 const remaining=DAY-Math.max(0,Date.now()-world.lastUpdated);
 $('nextDay').textContent=world.paused?'Clock paused':`Next day in approximately ${Math.max(0,Math.ceil(remaining/3600000))} hour(s)`;
 persist();
}
function advance(n){catchUp();for(let i=0;i<n;i++)simulateMonth();world.lastUpdated=Date.now();render()}
function buildFarm(){catchUp();if(world.gold<150)return;world.gold-=150;world.farms++;addEvent('A new farm was constructed (simulation event).');render()}
function togglePause(){catchUp();world.paused=!world.paused;world.lastUpdated=Date.now();render()}
function exportSave(){catchUp();const blob=new Blob([JSON.stringify(world,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kaddinghall-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(![1,2].includes(data.version)||!['month','pop','food','gold','farms'].every(k=>Number.isFinite(data[k])&&data[k]>=0)||!Array.isArray(data.events))throw Error('Invalid save');world=data;if(world.version===1)world={...world,version:2,day:1,paused:false,lastUpdated:Date.now()};if(!Number.isFinite(world.day)||world.day<1||world.day>30)world.day=1;if(!Number.isFinite(world.lastUpdated))world.lastUpdated=Date.now();world.paused=!!world.paused;catchUp();render()}catch(err){alert('Cannot import this save: '+err.message)}e.target.value=''});
function resetWorld(){if(confirm('Reset Kaddinghall? Export your save first if needed.')){world=initial();render()}}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
catchUp();render();
window.addEventListener('focus',()=>{catchUp();render()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){catchUp();render()}});
setInterval(()=>{if(!document.hidden){catchUp();render()}},60000);
