const KEY='arcanus-kaddinghall';
const DAY=86400000, DAYS_PER_MONTH=30;
const ukDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const ukParts=()=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));
const ukDayNumber=()=>{const p=ukParts();return Math.floor(Date.UTC(p.year,p.month-1,p.day)/DAY)};
const ukTime=()=>new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date());
const initial=()=>({version:4,month:0,day:1,pop:3000,food:9000,gold:5000,farms:80,events:[],paused:false,lastUpdated:Date.now(),lastUKDay:ukDayNumber()});
let world;
try {world=JSON.parse(localStorage.getItem(KEY))||initial()}catch {world=initial()}
// Migrate v1 without resetting existing saves. The real-time clock begins on first v1.1 opening.
if(world.version===1){world={...world,version:2,day:1,paused:false,lastUpdated:Date.now()}}
if(!world.timber)world.timber=initialTimber();
world.version=4;
if(!Number.isFinite(world.lastUpdated))world.lastUpdated=Date.now();
if(!Number.isFinite(world.day)||world.day<1||world.day>30)world.day=1;
if(typeof world.paused!=='boolean')world.paused=false;
// On upgrade, preserve any elapsed full days from the previous 24-hour clock,
// then align future day changes with UK midnight.
if(!Number.isFinite(world.lastUKDay)){const elapsed=Math.max(0,Date.now()-world.lastUpdated);const fullDays=Math.floor(elapsed/DAY);if(!world.paused&&fullDays>0)simulateDays(fullDays);world.lastUKDay=ukDayNumber();world.lastUpdated=Date.now();world.version=3;}
const $=id=>document.getElementById(id);
function persist(){localStorage.setItem(KEY,JSON.stringify(world))}
function addEvent(message){world.events.unshift(message);world.events=world.events.slice(0,150)}

// Timber economy v1: simulation assumptions, not established campaign canon.
// gp is the internal money unit; 1 gp = 10 sp = 100 cp.
const round3=n=>Math.round(n*1000)/1000;
function initialTimber(){
 const business=(id,name,cash,capacity,ready,seasoning,fireAnnual,buildAnnual,workers,seasonal,horseCost,licence,nursery,yard,tools,haulAnnual)=>({
  id,name,cash,capacity,ready,fireAnnual,buildAnnual,workers,seasonal,horseCost,licence,nursery,yard,tools,haulAnnual,
  construction:0,rawLogs:0,kindling:0,soldFire:0,soldConstruction:0,revenue:0,expenses:0,
  batches:[{tonnes:seasoning*.25,readyAt:90},{tonnes:seasoning*.3333333333,readyAt:180},{tonnes:seasoning*(1-.25-.3333333333),readyAt:360}]
 });
 return {elapsed:0,prices:{fire:1.5,construction:1.5},businesses:[
  business('oak','Oak & Axe Timberworks',200,600,120,240,480,200,5,4,96,30,10,15,8,60),
  business('green','The Greenwood Cutters',120,400,75,150,300,100,3,2,48,15,6,10,5,40)
 ],mills:[{name:'Water-powered sawmill',cash:0,processed:0,revenue:0,expenses:0,rate:.332,capacity:5,workers:3,maintenance:20,tools:10,operatingDays:0},
 {name:'Manual sawmill',cash:0,processed:0,revenue:0,expenses:0,rate:.658,capacity:2,workers:2,maintenance:10,tools:8,operatingDays:0}],
 municipalReserve:30,notes:'Provisional rates and batch dates; generated outcomes are not canon.'};
}
function timberStock(b){return b.ready+b.construction+b.rawLogs+b.batches.reduce((a,x)=>a+x.tonnes,0)}
function timberSpend(b,gp){b.cash-=gp;b.expenses+=gp}
function timberSell(b,key,tonnes,price){const sold=Math.min(b[key],Math.max(0,tonnes));b[key]-=sold;b.cash+=sold*price;b.revenue+=sold*price;return sold}
function simulateTimberDay(){
 const t=world.timber;t.elapsed++;
 const day=t.elapsed, monthInYear=Math.floor((day-1)%360/30), seasonal=monthInYear>=4&&monthInYear<7;
 for(const b of t.businesses){
  // Paid staff: 312 permanent paid days/year and 72 seasonal days/year.
  const weekday=(day-1)%7;const working=weekday<6;
  if(working){
   const permanentWage=b.id==='oak'?1.6:1.0;
   timberSpend(b,permanentWage+(seasonal?b.seasonal*.3:0));
   // Targets are annual green-input requirements; newly produced firewood matures after 360 days.
   const fireRaw=b.fireAnnual/.9/312, constructionRaw=b.buildAnnual/.9/312;
   const fireFinished=fireRaw*.9, constructionFinished=constructionRaw*.9;
   const free=Math.max(0,b.capacity-timberStock(b));
   const cutFire=Math.min(fireFinished,free);
   if(cutFire>0)b.batches.push({tonnes:cutFire,readyAt:day+360});
   // Construction timber uses sawmills, with limited daily throughput and real fees.
   const room=Math.max(0,b.capacity-timberStock(b));
   const cutConstruction=Math.min(constructionFinished,room);
   if(cutConstruction>0){
    const input=cutConstruction/.9;
    const mill=t.mills[0]; // baseline: watermill; other customer demand not invented.
    const fee=input*mill.rate;
    timberSpend(b,fee);mill.cash+=fee;mill.revenue+=fee;mill.processed+=input;
    b.construction+=cutConstruction;
   }
  }
  // Batch maturity: wood never becomes saleable before its ready date.
  let matured=0;b.batches=b.batches.filter(x=>{if(x.readyAt<=day){matured+=x.tonnes;return false}return true});b.ready+=matured;
  // Evenly distributed orders are a test assumption, not simulated household demand.
  const fireSold=timberSell(b,'ready',b.fireAnnual/360,t.prices.fire);
  const constructionSold=timberSell(b,'construction',b.buildAnnual/360,t.prices.construction);
  b.soldFire+=fireSold;b.soldConstruction+=constructionSold;
  // Transport budget and other fixed costs accrued daily; woodland licence is not a town Treasury transfer.
  timberSpend(b,(b.horseCost+b.licence+b.nursery+b.yard+b.tools+b.haulAnnual)/360);
  if(day%30===0){
   if(matured>0)addEvent(`${b.name}: ${round3(matured)} t of firewood matured.`);
   if(b.cash<0)addEvent(`${b.name} has negative cash (${round3(b.cash)} gp): urgent financing required.`);
  }
 }
 // Order-driven sawmill staffing: owner pay, rent, and other demand are not yet modeled.
 for(const m of t.mills){
  const requiredDays=m.processed/m.capacity;
  const newlyRequired=Math.max(0,Math.ceil(requiredDays-1e-8)-m.operatingDays);
  if(newlyRequired){m.operatingDays+=newlyRequired;const wage=newlyRequired*m.workers*.3;m.cash-=wage;m.expenses+=wage}
  const fixed=(m.maintenance+m.tools)/360;m.cash-=fixed;m.expenses+=fixed;
 }
 if(day%30===0)addEvent(`Timber month ${Math.ceil(day/30)}: ${t.businesses.map(b=>`${b.name} ${round3(b.cash)} gp`).join('; ')}.`);
}
function timberAdvanceDays(days){for(let i=0;i<days;i++)simulateTimberDay()}
function renderTimber(){
 const t=world.timber, gp=n=>`${n.toFixed(1)} gp`, ton=n=>`${n.toFixed(1)} t`;
 const root=$('timberBusinesses');if(!root)return;
 root.replaceChildren();
 for(const b of t.businesses){
  const article=document.createElement('article');article.className='timber-business';
  const h=document.createElement('h4');h.textContent=b.name;article.append(h);
  const stats=document.createElement('div');stats.className='stats';
  const values=[['Cash',gp(b.cash)],['Seasoned firewood',ton(b.ready)],['Still seasoning',ton(b.batches.reduce((a,x)=>a+x.tonnes,0))],['Construction timber',ton(b.construction)],['Yard used',`${ton(timberStock(b))} / ${ton(b.capacity)}`],['Operating result',gp(b.revenue-b.expenses)],['Firewood sold',ton(b.soldFire)],['Construction sold',ton(b.soldConstruction)]];
  for(const [name,value] of values){const cell=document.createElement('div');cell.append(document.createTextNode(name));const strong=document.createElement('strong');strong.textContent=value;cell.append(strong);stats.append(cell)}article.append(stats);root.append(article);
 }
 const mills=$('timberMills');mills.replaceChildren();
 for(const m of t.mills){const li=document.createElement('li');li.textContent=`${m.name}: ${ton(m.processed)} processed · ${gp(m.revenue-m.expenses)} operating result · ${m.operatingDays} paid operating days`;mills.append(li)}
 $('timberDays').textContent=t.elapsed.toLocaleString('en-GB');
 $('timberReserve').textContent=ton(t.municipalReserve);
}

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
   simulateTimberDay();
   world.day++;
   if(world.day>DAYS_PER_MONTH){world.day=1;simulateMonth()}
 }
}
function catchUp(){
 const today=ukDayNumber();
 if(world.paused){world.lastUKDay=today;world.lastUpdated=Date.now();return}
 if(today<world.lastUKDay){world.lastUKDay=today;world.lastUpdated=Date.now();return}
 const days=today-world.lastUKDay;
 if(days>0){
   simulateDays(days);
   world.lastUKDay=today;
   world.lastUpdated=Date.now();
   addEvent(`Real-time catch-up: ${days.toLocaleString('en-GB')} day${days===1?'':'s'} passed.`);
   persist();
 }
}
function render(){
 $('liveTime').textContent=ukTime();
 $('date').textContent=`${793+Math.floor(world.month/12)} A.F. · Month ${world.month%12+1} · Day ${world.day}`;
 for(const id of ['pop','food','gold','farms'])$(id).textContent=world[id].toLocaleString('en-GB');
 $('log').replaceChildren(...world.events.slice(0,20).map(e=>{const li=document.createElement('li');li.textContent=e;return li}));
 $('clockStatus').textContent=world.paused?'Paused — no time passes while away':'Running · 1 real day = 1 Arcanus day';
 $('pauseButton').textContent=world.paused?'Resume world':'Pause world';
 $('nextDay').textContent=world.paused?'Clock paused':`Next Arcanus day at midnight UK time`;
 renderTimber(); 
}
function advance(n){catchUp();simulateDays(n*DAYS_PER_MONTH);world.lastUpdated=Date.now();persist();render()}
function buildFarm(){catchUp();if(world.gold<150)return;world.gold-=150;world.farms++;addEvent('A new farm was constructed (simulation event).');persist();render()}
function togglePause(){catchUp();world.paused=!world.paused;world.lastUpdated=Date.now();world.lastUKDay=ukDayNumber();persist();render()}
function exportSave(){catchUp();const blob=new Blob([JSON.stringify(world,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kaddinghall-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(![1,2,3,4].includes(data.version)||!['month','pop','food','gold','farms'].every(k=>Number.isFinite(data[k])&&data[k]>=0)||!Array.isArray(data.events))throw Error('Invalid save');world=data;if(world.version===1)world={...world,version:2,day:1,paused:false,lastUpdated:Date.now()};if(!world.timber)world.timber=initialTimber();world.version=4;if(!Number.isFinite(world.day)||world.day<1||world.day>30)world.day=1;if(!Number.isFinite(world.lastUpdated))world.lastUpdated=Date.now();world.paused=!!world.paused;if(!Number.isFinite(world.lastUKDay)){const elapsed=Math.max(0,Date.now()-world.lastUpdated);if(!world.paused)simulateDays(Math.floor(elapsed/DAY));world.lastUKDay=ukDayNumber();world.version=4}catchUp();persist();render()}catch(err){alert('Cannot import this save: '+err.message)}e.target.value=''});
function resetWorld(){if(confirm('Reset Kaddinghall? Export your save first if needed.')){world=initial();persist();render()}}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
catchUp();persist();render();
window.addEventListener('focus',()=>{catchUp();render()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){catchUp();render()}});
setInterval(()=>{if(!document.hidden){catchUp();render()}},1000);
