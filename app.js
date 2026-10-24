const BUILD_ID='v1.6.1 · Orders verified';
const KEY='arcanus-kaddinghall';
const DAY=86400000, DAYS_PER_MONTH=30;
const ukDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const ukParts=()=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));
const ukDayNumber=()=>{const p=ukParts();return Math.floor(Date.UTC(p.year,p.month-1,p.day)/DAY)};
const ukTime=()=>new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date());
const initial=()=>({version:7,foodModel:1,month:0,day:1,pop:3000,food:12000,gold:5000,farms:80,events:[],paused:false,lastUpdated:Date.now(),lastUKDay:ukDayNumber()});
let world;
try {world=JSON.parse(localStorage.getItem(KEY))||initial()}catch {world=initial()}
// Migrate v1 without resetting existing saves. The real-time clock begins on first v1.1 opening.
if(world.version===1){world={...world,version:2,day:1,paused:false,lastUpdated:Date.now()}}
if(!world.timber)world.timber=initialTimber();
if(!Array.isArray(world.timber.ledger))world.timber.ledger=[];
migrateOrders();
world.version=7;
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
 orders:[],nextOrderId:1,fulfilledOrders:0,unfilledTonnes:0,municipalReserve:30,notes:'Provisional rates and batch dates; generated outcomes are not canon.'};
}
// v1.6: finite, identifiable demand requests. Orders are simulated, not canon.
function migrateOrders(){
 if(!world.timber)return;
 const t=world.timber;
 if(!Array.isArray(t.orders))t.orders=[];
 if(!Number.isFinite(t.nextOrderId))t.nextOrderId=1;
 if(!Number.isFinite(t.fulfilledOrders))t.fulfilledOrders=0;
 if(!Number.isFinite(t.unfilledTonnes))t.unfilledTonnes=0;
}
function orderDemand(day){
 const t=world.timber;
 const season=Math.floor(((day-1)%360)/90);
 const fireFactors=[1.15,.75,.85,1.4]; // seasonal household heating demand
 const constructionFactors=[.75,1.3,1.2,.65];
 const orders=[];
 for(const b of t.businesses){
  const seed=b.id==='oak'?0:11;
  // Repeatable daily variation; no dependence on device random state.
  const variation=.8+((day*17+seed*7)%11)/25;
  const fire=(b.fireAnnual/360)*fireFactors[season]*variation;
  const construction=(b.buildAnnual/360)*constructionFactors[season]*(1.05-((day*7+seed)%7)/30);
  orders.push({business:b.id,product:'fire',customer:season===3?'Household winter fuel':'Household and inn fuel',tonnes:fire});
  orders.push({business:b.id,product:'construction',customer:'Builders and farm repairs',tonnes:construction});
 }
 for(const o of orders){
  // Merge outstanding requests from the same category to avoid enormous saves.
  const prior=t.orders.find(x=>x.business===o.business&&x.product===o.product&&x.customer===o.customer);
  if(prior)prior.remaining+=o.tonnes;
  else t.orders.push({id:t.nextOrderId++,placedDay:day,...o,remaining:o.tonnes});
 }
}
function fulfillOrders(b){
 const t=world.timber;
 for(const order of t.orders.filter(o=>o.business===b.id).sort((a,z)=>a.placedDay-z.placedDay)){
  const key=order.product==='fire'?'ready':'construction';
  const sold=timberSell(b,key,order.remaining,t.prices[order.product]);
  order.remaining=Math.max(0,order.remaining-sold);
  if(order.product==='fire')b.soldFire+=sold;else b.soldConstruction+=sold;
  if(order.remaining<1e-7){t.fulfilledOrders++;order.remaining=0;}
 }
 t.orders=t.orders.filter(o=>o.remaining>1e-7);
 t.unfilledTonnes=t.orders.reduce((sum,o)=>sum+o.remaining,0);
}
function timberStock(b){return b.ready+b.construction+b.rawLogs+b.batches.reduce((a,x)=>a+x.tonnes,0)}
function timberSpend(b,gp){b.cash-=gp;b.expenses+=gp}
function timberSell(b,key,tonnes,price){const sold=Math.min(b[key],Math.max(0,tonnes));b[key]-=sold;b.cash+=sold*price;b.revenue+=sold*price;return sold}
function simulateTimberDay(){
 const t=world.timber;t.elapsed++;
 if(!Array.isArray(t.ledger))t.ledger=[];
 if(!t.monthStart)t.monthStart=timberSnapshot();
 orderDemand(t.elapsed);
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
    // Provisional specialist-order share: 20% of construction logs require
    // smaller custom cuts offered by the manual mill. Ordinary logs choose
    // the lower-priced available mill. No artificial profit guarantee.
    const portions=[{amount:input*.8,special:false},{amount:input*.2,special:true}];
    for(const part of portions){
     const eligible=t.mills.map((mill,index)=>({mill,index})).filter(x=>!part.special||x.index===1);
     eligible.sort((a,c)=>a.mill.rate-c.mill.rate);
     let remaining=part.amount;
     for(const {mill} of eligible){
      const used=mill.todayProcessed||0;
      const accepted=Math.min(remaining,Math.max(0,mill.capacity-used));
      if(accepted<=0)continue;
      const fee=accepted*mill.rate;
      timberSpend(b,fee);mill.cash+=fee;mill.revenue+=fee;mill.processed+=accepted;
      mill.todayProcessed=used+accepted;
      b.construction+=accepted*.9;remaining-=accepted;
      if(remaining<1e-9)break;
     }
     // Any excess remains unprocessed; it does not become saleable timber.
     if(remaining>1e-8)b.rawLogs+=remaining;
    }
   }
  }
  // Batch maturity: wood never becomes saleable before its ready date.
  let matured=0;b.batches=b.batches.filter(x=>{if(x.readyAt<=day){matured+=x.tonnes;return false}return true});b.ready+=matured;
  // Only fulfill recorded customer requests, oldest first; unavailable wood stays backordered.
  fulfillOrders(b);
  // Transport budget and other fixed costs accrued daily; woodland licence is not a town Treasury transfer.
  timberSpend(b,(b.horseCost+b.licence+b.nursery+b.yard+b.tools+b.haulAnnual)/360);
  if(day%30===0){
   if(matured>0)addEvent(`${b.name}: ${round3(matured)} t of firewood matured.`);
   if(b.cash<0)addEvent(`${b.name} has negative cash (${round3(b.cash)} gp): urgent financing required.`);
  }
 }
 // Order-driven sawmill staffing: paid days accrue only when processing.
 for(const m of t.mills){
  const requiredDays=m.processed/m.capacity;
  const newlyRequired=Math.max(0,Math.ceil(requiredDays-1e-8)-m.operatingDays);
  if(newlyRequired){m.operatingDays+=newlyRequired;const wage=newlyRequired*m.workers*.3;m.cash-=wage;m.expenses+=wage}
  const fixed=(m.maintenance+m.tools)/360;m.cash-=fixed;m.expenses+=fixed;
  m.todayProcessed=0;
 }
 if(day%30===0)recordTimberMonth();
}
function timberSnapshot(){
 const t=world.timber;
 return {businesses:t.businesses.map(b=>({revenue:b.revenue,expenses:b.expenses,soldFire:b.soldFire,soldConstruction:b.soldConstruction,ready:b.ready,seasoning:b.batches.reduce((a,x)=>a+x.tonnes,0)})),mills:t.mills.map(m=>({processed:m.processed,revenue:m.revenue,expenses:m.expenses,days:m.operatingDays}))};
}
function recordTimberMonth(){
 const t=world.timber,start=t.monthStart||timberSnapshot(),end=timberSnapshot();
 const month=Math.ceil(t.elapsed/30);
 const businesses=t.businesses.map((b,i)=>{const a=start.businesses[i],z=end.businesses[i];return {name:b.name,fire:z.soldFire-a.soldFire,construction:z.soldConstruction-a.soldConstruction,income:z.revenue-a.revenue,cost:z.expenses-a.expenses,closingCash:b.cash,ready:b.ready,seasoning:z.seasoning};});
 const mills=t.mills.map((m,i)=>{const a=start.mills[i],z=end.mills[i];return {name:m.name,logs:z.processed-a.processed,income:z.revenue-a.revenue,cost:z.expenses-a.expenses,days:z.days-a.days};});
 const outstanding=t.orders.reduce((sum,o)=>sum+o.remaining,0);
 t.ledger.unshift({month,businesses,mills,outstanding,openOrders:t.orders.length});t.ledger=t.ledger.slice(0,24);t.monthStart=end;
 for(const b of businesses){
  addEvent(`Timber month ${month}: ${b.name} sold ${b.fire.toFixed(1)} t firewood and ${b.construction.toFixed(1)} t construction; income ${b.income.toFixed(1)} gp, expenses ${b.cost.toFixed(1)} gp.`);
  if(b.ready<1)addEvent(`${b.name}: seasoned firewood depleted; future orders may go unfilled.`);
 }
 addEvent(`Sawmills month ${month}: watermill ${mills[0].logs.toFixed(1)} t; manual mill ${mills[1].logs.toFixed(1)} t processed.`);
}
let lastLedgerRenderKey=null;
function renderTimberLedger(){
 const root=$('timberLedger');if(!root)return;
 const entries=world.timber.ledger||[];
 // Do not destroy the open/closed <details> controls on every clock tick.
 // Only rebuild when the underlying monthly reports actually change.
 const ledgerKey=JSON.stringify(entries.slice(0,6));
 if(ledgerKey===lastLedgerRenderKey && root.childNodes.length)return;
 const previousStates=new Map(Array.from(root.querySelectorAll('details[data-ledger-month]'))
  .map(d=>[d.dataset.ledgerMonth,d.open]));
 root.replaceChildren();
 lastLedgerRenderKey=ledgerKey;
 if(!entries.length){root.textContent='No completed timber month yet. Advance one month to see the first report.';return}
 for(const entry of entries.slice(0,6)){
  const details=document.createElement('details');details.className='ledger-entry';
  details.dataset.ledgerMonth=String(entry.month);
  details.open=previousStates.has(String(entry.month))?previousStates.get(String(entry.month)):entry===entries[0];
  const summary=document.createElement('summary');summary.textContent=`Month ${entry.month} · business transactions`;details.append(summary);
  for(const b of entry.businesses){const p=document.createElement('p');p.textContent=`${b.name}: ${b.fire.toFixed(1)} t firewood + ${b.construction.toFixed(1)} t construction sold; income ${b.income.toFixed(1)} gp; expenses ${b.cost.toFixed(1)} gp; net ${(b.income-b.cost).toFixed(1)} gp; cash ${b.closingCash.toFixed(1)} gp.`;details.append(p)}
  for(const m of entry.mills){const p=document.createElement('p');p.textContent=`${m.name}: ${m.logs.toFixed(1)} t processed; fees ${m.income.toFixed(1)} gp; expenses ${m.cost.toFixed(1)} gp; ${m.days} paid days.`;details.append(p)}
  if(Number.isFinite(entry.outstanding)){const p=document.createElement('p');p.textContent=`Outstanding customer requests: ${entry.outstanding.toFixed(1)} t across ${entry.openOrders} order groups.`;details.append(p)}
  root.append(details);
 }
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
 const orderStats=$('timberOrders');if(orderStats){orderStats.textContent=`${t.orders.length} outstanding order groups · ${t.unfilledTonnes.toFixed(1)} tonnes awaiting stock · ${t.fulfilledOrders} fulfilled order groups`; }
 renderTimberLedger();
}

// Food economy v1.4: seasonal harvest and Treasury-funded emergency imports.
// Units, farm yield and import prices are provisional; no NPC market yet.
const FOOD_YIELD_PER_FARM=450; // annual units, spread across the growing year
const FOOD_IMPORT_GP_PER_UNIT=.02;
const FOOD_HARVEST_SHARES=[0,0,0,.03,.06,.09,.12,.15,.20,.30,.05,0];
function foodEmergencyImport(reason){
 const target=Math.ceil(world.pop*3); // rebuild to three months of supplies
 const needed=Math.max(0,target-world.food);
 const purchased=Math.min(needed,Math.floor(Math.max(0,world.gold)/FOOD_IMPORT_GP_PER_UNIT));
 if(purchased>0){
  const cost=Math.round(purchased*FOOD_IMPORT_GP_PER_UNIT*100)/100;
  world.gold=Math.round((world.gold-cost)*100)/100;
  world.food+=purchased;
  addEvent(`Food emergency: imported ${purchased.toLocaleString('en-GB')} units for ${cost.toFixed(2)} gp (${reason}).`);
 }
 if(world.food<world.pop)addEvent('CRITICAL: insufficient food for the next month; Treasury cannot fully fund imports.');
}
function migrateFood(){
 if(world.foodModel===1)return;
 world.foodModel=1;
 // Existing saves are not reset. A shortage triggers an explicit, paid import.
 if(world.food<world.pop*2)foodEmergencyImport('food-system upgrade');
 addEvent('Food system upgraded: seasonal farm yields, reserve warnings and paid emergency imports enabled.');
}
function simulateMonth(){
 const m=world.month%12;
 const harvest=Math.round(world.farms*FOOD_YIELD_PER_FARM*FOOD_HARVEST_SHARES[m]);
 world.food+=harvest;
 // Emergency procurement is visible in the Chronicle and deducted from Treasury.
 if(world.food<world.pop*2)foodEmergencyImport('low reserves');
 const shortage=Math.max(0,world.pop-world.food);
 world.food=Math.max(0,world.food-world.pop);
 const births=Math.round(world.pop*.03/12);
 const deaths=Math.round(world.pop*.025/12)+Math.ceil(shortage/100);
 world.pop=Math.max(0,world.pop+births-deaths);
 world.gold+=Math.round(world.pop*.025-world.farms*.2);
 world.month++;
 addEvent(`${793+Math.floor((world.month-1)/12)} A.F. month ${(world.month-1)%12+1}: ${births} births, ${deaths} deaths; harvest ${harvest} units${shortage?`; food shortage ${shortage}`:''}.`);
 if(world.food<world.pop*2)addEvent(`Food reserve warning: ${world.food.toLocaleString('en-GB')} units remain, under two months of demand.`);
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
 const build=$('buildStatus');if(build)build.textContent='Running v1.6.2 · Ledger controls fixed';
 $('liveTime').textContent=ukTime();
 $('date').textContent=`${793+Math.floor(world.month/12)} A.F. · Month ${world.month%12+1} · Day ${world.day}`;
 for(const id of ['pop','food','gold','farms'])$(id).textContent=world[id].toLocaleString('en-GB');
 $('log').replaceChildren(...world.events.slice(0,20).map(e=>{const li=document.createElement('li');li.textContent=e;return li}));
 $('clockStatus').textContent=world.paused?'Paused — no time passes while away':'Running · 1 real day = 1 Arcanus day';
 $('pauseButton').textContent=world.paused?'Resume world':'Pause world';
 $('nextDay').textContent=world.paused?'Clock paused':`Next Arcanus day at midnight UK time`;
 renderTimber();
 const foodStatus=$('foodStatus');if(foodStatus)foodStatus.textContent=`Food available: ${Math.floor(world.food/Math.max(1,world.pop)*10)/10} months of demand · Annual farm yield estimate: ${(world.farms*FOOD_YIELD_PER_FARM).toLocaleString('en-GB')} units · Import price: 0.02 gp/unit.`;
}
function advance(n){catchUp();simulateDays(n*DAYS_PER_MONTH);world.lastUpdated=Date.now();persist();render()}
function buildFarm(){catchUp();if(world.gold<150)return;world.gold-=150;world.farms++;addEvent('A new farm was constructed (simulation event).');persist();render()}
function togglePause(){catchUp();world.paused=!world.paused;world.lastUpdated=Date.now();world.lastUKDay=ukDayNumber();persist();render()}
function exportSave(){catchUp();const blob=new Blob([JSON.stringify(world,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kaddinghall-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(![1,2,3,4,5,6,7].includes(data.version)||!['month','pop','food','gold','farms'].every(k=>Number.isFinite(data[k])&&data[k]>=0)||!Array.isArray(data.events))throw Error('Invalid save');world=data;if(world.version===1)world={...world,version:2,day:1,paused:false,lastUpdated:Date.now()};if(!world.timber)world.timber=initialTimber();migrateOrders();world.version=7;if(!Number.isFinite(world.day)||world.day<1||world.day>30)world.day=1;if(!Number.isFinite(world.lastUpdated))world.lastUpdated=Date.now();world.paused=!!world.paused;if(!Number.isFinite(world.lastUKDay)){const elapsed=Math.max(0,Date.now()-world.lastUpdated);if(!world.paused)simulateDays(Math.floor(elapsed/DAY));world.lastUKDay=ukDayNumber();world.version=7}migrateFood();catchUp();persist();render()}catch(err){alert('Cannot import this save: '+err.message)}e.target.value=''});
function resetWorld(){if(confirm('Reset Kaddinghall? Export your save first if needed.')){world=initial();world.timber=initialTimber();migrateFood();persist();render()}}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
migrateFood();catchUp();persist();render();
window.addEventListener('focus',()=>{catchUp();render()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){catchUp();render()}});
setInterval(()=>{if(!document.hidden){catchUp();render()}},1000);
