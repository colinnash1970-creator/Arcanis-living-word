const BUILD_ID='v1.9.1 · Inn Staffing Correction';
const KEY='arcanus-kaddinghall';
const DAY=86400000, DAYS_PER_MONTH=30;
const ukDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const ukParts=()=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));
const ukDayNumber=()=>{const p=ukParts();return Math.floor(Date.UTC(p.year,p.month-1,p.day)/DAY)};
const ukTime=()=>new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date());
const initial=()=>({version:7,foodModel:1,month:0,day:1,pop:3000,food:12000,gold:5000,farms:80,events:[],paused:false,lastUpdated:Date.now(),lastUKDay:ukDayNumber()});
let world, loadFailed=false;
const $=id=>document.getElementById(id);
function persist(){try{localStorage.setItem(KEY,JSON.stringify(world));$('saveStatus').textContent='Autosaved on this device.'}catch(err){$('saveStatus').textContent='Autosave failed. Export your save to keep your progress.'}}
function addEvent(message){
 const at=eventContext||{day:worldDay(),minute:world.livingClock?.minute??clockMinute()};
 world.events.unshift('['+stamp(at.day,at.minute)+'] '+message);world.events=world.events.slice(0,150);
}

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
 populationMonth(births,deaths);
 addEvent(`${793+Math.floor((world.month-1)/12)} A.F. month ${(world.month-1)%12+1}: ${births} births, ${deaths} deaths; harvest ${harvest} units${shortage?`; food shortage ${shortage}`:''}.`);
 if(world.food<world.pop*2)addEvent(`Food reserve warning: ${world.food.toLocaleString('en-GB')} units remain, under two months of demand.`);
}
function simulateDays(days,logNeeds=true){
 for(let i=0;i<days;i++){
  eventContext={day:worldDay()+1,minute:0};
  simulateTimberDay();world.day++;
  if(world.day>DAYS_PER_MONTH){world.day=1;simulateMonth()}
  assessHouseholds(logNeeds);
  eventContext=null;
 }
}
function catchUp(){
 const today=ukDayNumber(), minute=clockMinute(), current=today*1440+minute, c=world.livingClock;
 if(world.paused){
  const changed=c.cursor!==current||world.lastUKDay!==today;
  c.cursor=current;world.lastUKDay=today;world.lastUpdated=Date.now();
  if(changed)persist();return;
 }
 // UK civil-minute high water prevents duplicate hours at the autumn DST change.
 // A backward device date likewise must not run the same economy day twice.
 if(today<world.lastUKDay){c.minute=minute;return}
 const days=today-world.lastUKDay, previous=c.cursor;
 for(let i=0;i<days;i++){
  const civilDay=world.lastUKDay+i;
  if(civilDay>=today-1)livingRange(worldDay(),Math.max(-1,previous-civilDay*1440),1439);
  simulateDays(1,civilDay>=today-2);
 }
 world.lastUKDay=today;c.minute=minute;
 if(current>previous){livingRange(worldDay(),Math.max(-1,previous-today*1440),minute);c.cursor=current}
 if(days>0)addEvent('Real-time catch-up: '+days.toLocaleString('en-GB')+' day'+(days===1?'':'s')+' passed. '+(days>1?'Older daily routines condensed; economy and population fully advanced.':''));
 world.lastUpdated=Date.now();
 if(days>0||current>previous)persist();
}
function render(){
 const build=$('buildStatus');if(build)build.textContent='Running '+BUILD_ID;
 $('liveTime').textContent=world.paused?String(Math.floor(world.livingClock.minute/60)).padStart(2,'0')+':'+String(world.livingClock.minute%60).padStart(2,'0')+' · paused':ukTime();
 $('date').textContent=`${793+Math.floor(world.month/12)} A.F. · Month ${world.month%12+1} · Day ${world.day}`;
 for(const id of ['pop','food','gold','farms'])$(id).textContent=world[id].toLocaleString('en-GB');
 $('log').replaceChildren(...world.events.slice(0,20).map(e=>{const li=document.createElement('li');li.textContent=e;return li}));
 $('clockStatus').textContent=world.paused?'Paused — no time passes while away':'Running · 1 real day = 1 Arcanus day';
 $('pauseButton').textContent=world.paused?'Resume world':'Pause world';
 $('nextDay').textContent=world.paused?'Clock paused':`Next Arcanus day at midnight UK time`;
 renderTimber();
 renderPopulation();
 renderLayoutSummary();
 const foodStatus=$('foodStatus');if(foodStatus)foodStatus.textContent=`Food available: ${Math.floor(world.food/Math.max(1,world.pop)*10)/10} months of demand · Annual farm yield estimate: ${(world.farms*FOOD_YIELD_PER_FARM).toLocaleString('en-GB')} units · Import price: 0.02 gp/unit.`;
}
// v1.7: saved identities; routines are derived, never a second economic engine.
const GIVEN_NAMES=['Ada','Bren','Cora','Dain','Elin','Fenn','Gwen','Hale','Iris','Jory','Kara','Lorn','Mira','Nell','Orin','Perrin','Rhea','Seth','Tess','Ulric','Vera','Wren'];
const FAMILY_NAMES=['Ash','Brook','Clay','Dale','Elm','Field','Grove','Hill','Ives','Keen','Lake','Moss','North','Oak','Pike','Reed','Stone','Thorn','Vale','Wood'];
const FAMILY_ROOTS=['Alder','Amber','Apple','Ash','Aspen','Barley','Birch','Black','Bracken','Bramble','Briar','Bright','Cedar','Cherry','Clear','Copper','Crow','Dun','Elder','Ember','Fair','Fern','Flint','Fox','Glen','Gold','Green','Grey','Hawthorn','Hazel','Heather','Holly','Iron','Lark','Laurel','Maple','Mist','Moor','Oak','Pine','Raven','Red','River','Rowan','Silver','Sloe','Willow','Winter'];
const FAMILY_ENDINGS=['bank','beck','bell','bourne','bridge','brook','by','cliff','combe','croft','dale','den','fall','fell','field','ford','gate','grove','hall','haven','hill','holt','hurst','ley','mere','mill','ridge','shaw','stead','stone','vale','wood'];
function familySurname(id){
 if(id<=FAMILY_NAMES.length)return FAMILY_NAMES[id-1];
 let n=id-FAMILY_NAMES.length-1;const parts=[],size=FAMILY_ROOTS.length*FAMILY_ENDINGS.length;
 do{const slot=((n%size)*137)%size;parts.push(FAMILY_ROOTS[Math.floor(slot/FAMILY_ENDINGS.length)]+FAMILY_ENDINGS[slot%FAMILY_ENDINGS.length]);n=Math.floor(n/size)-1}while(n>=0);
 return parts.join('-');
}
function availableSurname(id,p){
 const used=new Set(p.households.map(h=>h.surname));let candidate;
 do{candidate=familySurname(id++)}while(used.has(candidate));return candidate;
}
function migrateHouseholdNames(p){
 if(p.namingVersion===2)return;
 const residentsByHome=new Map();
 for(const r of p.residents){if(!residentsByHome.has(r.householdId))residentsByHome.set(r.householdId,[]);residentsByHome.get(r.householdId).push(r)}
 for(const h of p.households){
  const old=FAMILY_NAMES[(h.id-1)%FAMILY_NAMES.length];
  // Correct only the repeated default labels, leaving custom names untouched.
  if(h.id<=FAMILY_NAMES.length||h.surname!==old||h.name!==`${old} household ${h.id}`)continue;
  h.surname=availableSurname(h.id,p);h.name=`${h.surname} household ${h.id}`;
  for(const r of residentsByHome.get(h.id)||[])if(r.name.endsWith(' '+old))r.name=r.name.slice(0,-old.length)+h.surname;
 }
 p.namingVersion=2;p.revision++;
}
let eventContext=null, householdPage=0, householdFilter='all', populationRenderKey='';
const worldDay=()=>world.month*30+world.day-1;
function clockMinute(){const [h,m]=ukTime().split(':').map(Number);return h*60+m}
function civilMinute(){return ukDayNumber()*1440+clockMinute()}
function stamp(day,minute){return `${793+Math.floor(day/360)} A.F. · M${Math.floor(day%360/30)+1} D${day%30+1} · ${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`}
function newHousehold(p){
 const id=p.nextHouseholdId++, surname=availableSurname(id,p);
 const h={id,name:`${surname} household ${id}`,surname,address:`${1+Math.floor((id-1)/4)} ${['Mill Lane','Market Street','Orchard Row','West Fields'][(id-1)%4]}`};
 p.households.push(h);return h;
}
function makeResident(p,h,ageMonths){
 const id=p.nextResidentId++;
 const r={id,householdId:h.id,name:`${GIVEN_NAMES[(id*7)%GIVEN_NAMES.length]} ${h.surname}`,ageMonths,occupation:'',workplace:''};
 if(p.familyModel===1)r.family=blankFamily(h.id);
 assignOccupation(r,p);p.residents.push(r);return r;
}
const INN_STAFF_LIMIT=8; // Provisional staffing for the single generic town inn.
function migrateOccupations(p){
 if(p.occupationModel===2)return;
 const inn=p.residents.filter(r=>r.occupation==='Inn worker'&&r.workplace==='The town inn').sort((a,b)=>a.id-b.id);
 for(const r of inn.slice(INN_STAFF_LIMIT)){r.occupation='Labourer';r.workplace='Town works'}
 p.occupationModel=2;p.revision++;
}
function assignOccupation(r,p){
 const age=r.ageMonths/12;
 if(age<6){r.occupation='Young child';r.workplace='Home';return}
 if(age<16){r.occupation='Pupil';r.workplace='Town school';return}
 if(age>=65){r.occupation='Retired';r.workplace='Home';return}
 // Fill the established permanent timber posts before assigning other trades.
 const posts=[['Woodcutter','Oak & Axe Timberworks',5],['Woodcutter','The Greenwood Cutters',3],['Sawmill worker','Water-powered sawmill',3],['Sawmill worker','Manual sawmill',2]];
 for(const [job,place,count] of posts){if(p.residents.filter(x=>x.id!==r.id&&x.workplace===place).length<count){r.occupation=job;r.workplace=place;return}}
 const jobs=[['Farmer','Town farms'],['Farmer','Town farms'],['Farmer','Town farms'],['Farmer','Town farms'],['Craftsperson','Workshop quarter'],['Trader','Market square'],['Labourer','Town works'],['Carer','Neighbourhood homes'],['Inn worker','The town inn'],['Farmer','Town farms']];
 [r.occupation,r.workplace]=jobs[r.id%jobs.length];
 if(r.occupation==='Inn worker'&&p.residents.filter(x=>x.id!==r.id&&x.occupation==='Inn worker'&&x.workplace==='The town inn').length>=INN_STAFF_LIMIT){r.occupation='Labourer';r.workplace='Town works'}
}
function migratePopulation(){
 if(world.population){migrateHouseholdNames(world.population);migrateOccupations(world.population);return}
 const p=world.population={schema:1,namingVersion:2,occupationModel:2,nextResidentId:1,nextHouseholdId:1,households:[],residents:[],revision:0};
 // Seed once: existing population total is authoritative, including tiny/empty saves.
 while(p.residents.length<world.pop){
  const h=newHousehold(p), size=Math.min(3+(h.id%3),world.pop-p.residents.length);
  for(let i=0;i<size;i++)makeResident(p,h,(i<2?24+(h.id*7+i*5)%39:i===4?68+(h.id%12):3+(h.id+i*3)%13)*12);
 }
 world.livingClock={cursor:civilMinute(),minute:clockMinute()};
 addEvent(`Living population registered: ${p.residents.length.toLocaleString('en-GB')} residents in ${p.households.length.toLocaleString('en-GB')} households. Earlier lives are not reconstructed.`);
}
function populationMonth(births,deaths){
 const p=world.population;if(!p)return;
 for(const r of p.residents){const age=r.ageMonths++;if([71,191,779].includes(age))assignOccupation(r,p)}
 // Deterministic mortality gives stable results across reloads and catch-up.
 const removed=new Set([...p.residents].sort((a,b)=>b.ageMonths-a.ageMonths||a.id-b.id).slice(0,deaths).map(r=>r.id));
 const bereaved=archiveFamilyDeaths(p.residents.filter(r=>removed.has(r.id))),born=[];
 p.residents=p.residents.filter(r=>!removed.has(r.id));
 // Preserve the existing economy's authoritative total, including severe shortages.
 const needed=Math.max(0,world.pop-p.residents.length);
 const families=p.households.filter(h=>p.residents.some(r=>r.householdId===h.id&&r.ageMonths>=192&&r.ageMonths<660));
 for(let i=0;i<needed;i++){
  const h=families.length?families[(world.month*13+i)%families.length]:newHousehold(p);
  const child=makeResident(p,h,0);linkNewborn(child,h);born.push(child);
 }
 p.residents=p.residents.slice(0,world.pop);
 finishFamilyMonth(born,bereaved);
 const occupied=new Set(p.residents.map(r=>r.householdId));p.households=p.households.filter(h=>occupied.has(h.id));p.revision++;
}
function routine(r,minute,day=worldDay()){
 const hour=minute/60, rest=(day%7===6);
 if(hour<6||hour>=22)return {activity:'Sleeping',place:'Home'};
 if(hour<7||hour>=18&&hour<19)return {activity:'Family meal',place:'Home'};
 if(r.occupation==='Young child')return {activity:'Care and play',place:'Home'};
 if(r.occupation==='Retired')return {activity:hour>=10&&hour<12?'Visiting neighbours':'Home and garden',place:hour>=10&&hour<12?'Neighbourhood':'Home'};
 if(r.occupation==='Pupil')return !rest&&hour>=8&&hour<15?{activity:hour>=12&&hour<13?'Midday meal':'Learning',place:'Town school'}:{activity:'Family and play',place:'Home'};
 if(hour>=12&&hour<13)return {activity:'Midday meal',place:'Near home or work'};
 const essential=['Farmer','Carer','Inn worker'].includes(r.occupation);
 if((!rest||essential)&&hour>=8&&hour<(rest?12:17))return {activity:rest?'Essential duties':'Working',place:r.workplace};
 if(!rest&&hour>=7&&hour<8)return {activity:'Preparing for work',place:'Home'};
 if(hour>=17&&hour<18)return {activity:'Errands and homecoming',place:'Neighbourhood'};
 return {activity:'Rest and neighbours',place:'Home / neighbourhood'};
}
function activityCounts(minute,day){
 const counts={};for(const r of world.population.residents){const a=routine(r,minute,day).activity;counts[a]=(counts[a]||0)+1}return counts;
}
function livingAt(day,minute){
 if(!world.population.residents.length)return;
 eventContext={day,minute};
 const hour=Math.floor(minute/60);
 if(minute%60===0&&hour>=6&&hour<=22){
  const now=activityCounts(minute,day), previous=activityCounts(minute-1,day);
  if(JSON.stringify(now)!==JSON.stringify(previous)){
   const changes=Object.entries(now).filter(([key,n])=>n!==(previous[key]||0)).sort((a,b)=>b[1]-a[1]);
   addEvent(`Town hour: ${changes.map(([key,n])=>`${n.toLocaleString('en-GB')} ${key.toLowerCase()}`).join('; ')}.`);
  }
 }
 // Two selected scenes per day, with deterministic non-round minutes.
 const sceneMinute=9*60+7+(day*11)%43, eveningMinute=19*60+3+(day*7)%47;
 if(minute===sceneMinute||minute===eveningMinute){
  const p=world.population,h=p.households[(day*17+(minute===sceneMinute?0:1))%p.households.length];
  const members=p.residents.filter(r=>r.householdId===h.id);
  if(minute===sceneMinute){
   const r=members.find(x=>routine(x,minute,day).activity==='Working')||members[0];
   const a=routine(r,minute,day);
   addEvent(`${r.name} of ${h.name}, ${h.address}: ${a.activity.toLowerCase()} at ${a.place.toLowerCase()}.`);
  }else addEvent(`${h.name}, ${h.address}: ${householdScene(h)}.`);
 }
 eventContext=null;
}
function livingRange(day,from,to){
 // Visit only possible event minutes, not every minute/resident while away.
 const minutes=[...Array.from({length:17},(_,i)=>(i+6)*60),547+(day*11)%43,1143+(day*7)%47].sort((a,b)=>a-b);
 for(const minute of minutes)if(minute>from&&minute<=to)livingAt(day,minute);
}
function renderPopulation(){
 const p=world.population, minute=world.livingClock.minute;
 const key=`${p.revision}:${worldDay()}:${minute}:${householdPage}:${householdFilter}`;
 if(key===populationRenderKey)return;populationRenderKey=key;
 const counts=activityCounts(minute,worldDay());
 $('populationSummary').textContent=`${p.residents.length.toLocaleString('en-GB')} residents · ${p.households.length.toLocaleString('en-GB')} households · ${Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([a,n])=>`${n.toLocaleString('en-GB')} ${a.toLowerCase()}`).join(' · ')}`;
 const jobs={};for(const r of p.residents)jobs[r.occupation]=(jobs[r.occupation]||0)+1;
 $('occupations').textContent=Object.entries(jobs).sort((a,b)=>b[1]-a[1]).map(([job,n])=>`${job}: ${n}`).join(' · ');
 renderNeeds();
 renderFamilySummary();
 const relatives=familyIndex(),children=new Map();
 for(const resident of relatives.values())for(const id of resident.family.parentIds){if(!children.has(id))children.set(id,[]);children.get(id).push(resident)}
 const visible=p.households.filter(h=>householdFilter==='all'||h.needs.food>0||h.needs.warmth>0||h.needs.care>0||h.needs.wellbeing<65);
 const pages=Math.max(1,Math.ceil(visible.length/10));householdPage=Math.min(householdPage,pages-1);
 $('householdMatches').textContent=`${visible.length} matching households`;
 $('householdPage').textContent=`Page ${householdPage+1} of ${pages}`;
 $('previousHouseholds').disabled=householdPage===0;$('nextHouseholds').disabled=householdPage===pages-1;
 const root=$('households');const opened=new Set(Array.from(root.querySelectorAll('details')).filter(d=>d.open).map(d=>d.dataset.household));root.replaceChildren();
 if(!visible.length){const message=document.createElement('p');message.textContent=householdFilter==='all'?'No occupied households.':'No households currently need attention.';root.append(message)}
 for(const h of visible.slice(householdPage*10,householdPage*10+10)){
  const details=document.createElement('details');details.className='ledger-entry';details.dataset.household=String(h.id);details.open=opened.has(String(h.id));
  const summary=document.createElement('summary');summary.textContent=`${h.name} · ${h.address} · ${wellbeingBand(h.needs.wellbeing)}`;details.append(summary);
  const needs=document.createElement('p');needs.className='household-needs';needs.textContent=householdNeedsText(h);details.append(needs);
  for(const r of p.residents.filter(x=>x.householdId===h.id)){
   const a=routine(r,minute),line=document.createElement('p');
   line.textContent=`${r.name} · resident ${r.id} · age ${Math.floor(r.ageMonths/12)} · ${r.occupation}${!['Young child','Pupil','Retired'].includes(r.occupation)?` (${r.workplace})`:''} · ${a.activity}, ${a.place}`;details.append(line);
   const links=document.createElement('p');links.className='family-links';links.textContent=familyDescription(r,relatives,children);details.append(links);
  }root.append(details);
 }
}
function changeHouseholdPage(delta){householdPage=Math.max(0,householdPage+delta);renderPopulation()}
function filterHouseholds(value){householdFilter=value==='attention'?'attention':'all';householdPage=0;renderPopulation()}

// Household outlook uses existing town reserves. No second consumption/payroll model.
const FOOD_OUTLOOK=['Secure','Low reserves','Shortage risk'];
const WARMTH_OUTLOOK=['Adequate','Low fuel buffer','Cold risk'];
const CARE_OUTLOOK=['Balanced','Stretched','Support needed'];
const wellbeingBand=value=>value<35?'Struggling':value<65?'Under strain':'Settled';
function needsSupplies(){
 const t=world.timber,season=Math.floor((world.month%12)/3);
 const dailyFuel=t.businesses.reduce((sum,b)=>sum+Math.max(0,b.fireAnnual),0)/360*[1.15,.75,.85,1.4][season];
 const ready=t.businesses.reduce((sum,b)=>sum+Math.max(0,b.ready),0);
 const outstanding=t.orders.filter(o=>o.product==='fire').reduce((sum,o)=>sum+Math.max(0,o.remaining),0);
 return {foodMonths:world.pop?world.food/world.pop:0,fuelDays:dailyFuel>0?ready/dailyFuel:0,backlogDays:dailyFuel>0?outstanding/dailyFuel:0,coldSeason:season===0||season===3};
}
function householdOutlook(members,supplies){
 const adults=members.filter(r=>r.ageMonths>=192&&r.ageMonths<900).length;
 const careLoad=members.reduce((n,r)=>n+(r.ageMonths<72?2:r.ageMonths<192||r.ageMonths>=900?1:0),0);
 const vulnerable=members.some(r=>r.ageMonths<72||r.ageMonths>=900);
 const food=supplies.foodMonths<1?2:supplies.foodMonths<2?1:0;
 // Market supply is a risk indicator, not a claim about fuel already in a home.
 const warningBuffer=supplies.coldSeason?(vulnerable?14:7):3;
 const warmth=supplies.coldSeason&&supplies.backlogDays>=3?2:supplies.backlogDays>0||supplies.fuelDays<warningBuffer?1:0;
 const care=careLoad===0?0:adults===0?2:careLoad>adults*2?1:0;
 // A reserve warning is not deprivation. The old flat penalties pushed every
 // household below 'Settled' for a routine, just-under-two-month food buffer.
 // Cold exposure matters more where young children or older residents live.
 const foodPressure=[0,5,35][food];
 const warmthPressure=warmth===2?(vulnerable?25:12):warmth===1?(vulnerable?5:2):0;
 const target=Math.max(10,85-foodPressure-warmthPressure-care*12);
 return {food,warmth,care,target};
}
function residentGroups(){
 const map=new Map();for(const r of world.population.residents){if(!map.has(r.householdId))map.set(r.householdId,[]);map.get(r.householdId).push(r)}return map;
}
function migrateNeeds(){
 const p=world.population;if(p.needsModel===1)return;
 const supplies=needsSupplies(),groups=residentGroups();
 for(const h of p.households){
  const outlook=householdOutlook(groups.get(h.id)||[],supplies);
  h.needs={food:outlook.food,warmth:outlook.warmth,care:outlook.care,wellbeing:70,lastDay:worldDay(),trend:0,hardshipDays:0};
 }
 p.needsModel=1;p.revision++;
 // Baseline only: no invented historical hardship or retroactive life events.
}
function needsSummary(){
 const households=world.population.households;
 const result={households:households.length,food:0,warmth:0,care:0,struggling:0,settled:0,wellbeing:0};
 for(const h of households){const n=h.needs;if(!n)continue;result.food+=n.food>0?1:0;result.warmth+=n.warmth>0?1:0;result.care+=n.care>0?1:0;result.struggling+=n.wellbeing<35?1:0;result.settled+=n.wellbeing>=65?1:0;result.wellbeing+=n.wellbeing}
 result.wellbeing=households.length?Math.round(result.wellbeing/households.length):0;return result;
}
function assessHouseholds(logChanges=true){
 const p=world.population;if(!p||p.needsModel!==1)return;
 const day=worldDay(),groups=residentGroups(),supplies=needsSupplies();
 let foodChanges=0,warmthChanges=0,careChanges=0,declined=0,recovered=0,touched=false;
 for(const h of p.households){
  const outlook=householdOutlook(groups.get(h.id)||[],supplies),before=h.needs;
  if(!before){h.needs={food:outlook.food,warmth:outlook.warmth,care:outlook.care,wellbeing:70,lastDay:day,trend:0,hardshipDays:0};touched=true;continue}
  if(before.lastDay>=day)continue;
  touched=true;
  const band=wellbeingBand(before.wellbeing),value=before.wellbeing;
  // Slow recovery; a severe shortage weighs more than a low reserve warning.
  const step=outlook.target<value?(outlook.food===2||outlook.warmth===2?3:2):1;
  const wellbeing=value+Math.sign(outlook.target-value)*Math.min(step,Math.abs(outlook.target-value));
  foodChanges+=before.food!==outlook.food?1:0;warmthChanges+=before.warmth!==outlook.warmth?1:0;careChanges+=before.care!==outlook.care?1:0;
  const nextBand=wellbeingBand(wellbeing);
  if(nextBand!==band){if(wellbeing<value)declined++;else recovered++}
  h.needs={food:outlook.food,warmth:outlook.warmth,care:outlook.care,wellbeing,lastDay:day,trend:Math.sign(wellbeing-value),hardshipDays:nextBand==='Struggling'?before.hardshipDays+1:0};
 }
 if(!touched)return;
 p.revision++;
 // At most one extra bulletin per day, only for a status/band transition.
 const changes=[];
 if(foodChanges)changes.push('food outlook changed for '+foodChanges+' households ('+FOOD_OUTLOOK[supplies.foodMonths<1?2:supplies.foodMonths<2?1:0].toLowerCase()+')');
 if(warmthChanges)changes.push('warmth outlook changed for '+warmthChanges+' households');
 if(careChanges)changes.push('care needs changed in '+careChanges+' households');
 if(declined)changes.push(declined+' households moved into a lower wellbeing band');
 if(recovered)changes.push(recovered+' households moved into a higher wellbeing band');
 if(logChanges&&changes.length)addEvent('Household outlook: '+changes.join('; ')+'.');
}
function householdScene(h){
 const n=h.needs;if(!n)return 'the household settles into its evening';
 if(n.food===2)return 'food reserves cover less than a month of town demand; the household faces shortage risk';
 if(n.warmth===2)return 'unfilled town firewood orders raise concern about keeping the home warm';
 if(n.care===2)return 'the household has no resident aged 16–74 to share its care needs';
 if(n.trend>0&&n.wellbeing<65)return 'wellbeing is recovering as household conditions improve';
 if(n.food===1)return 'the household is watching food reserves, now below two months of town demand';
 if(n.warmth===1)return 'the household faces a low market fuel buffer'+(needsSupplies().coldSeason?' during the cold season':'');
 if(n.care===1)return 'care responsibilities leave the household stretched';
 return n.wellbeing>=65?'food and warmth outlooks are stable; the household is settled':'the household has a quiet evening while wellbeing recovers';
}
function renderNeeds(){
 const s=needsSummary(),supplies=needsSupplies();
 $('householdWellbeing').textContent=s.households?s.wellbeing+'/100':'—';
 $('householdSettled').textContent=s.settled.toLocaleString('en-GB');
 $('householdStruggling').textContent=s.struggling.toLocaleString('en-GB');
 $('householdCare').textContent=s.care.toLocaleString('en-GB');
 $('needsSummary').textContent=s.households?`${s.food} households watching food · ${s.warmth} watching fuel · ${s.care} with care pressure. Assessed each Arcanus day; wellbeing changes gradually.`:'No occupied households yet.';
 $('needsBasis').textContent=s.households?`Town food reserve: ${supplies.foodMonths.toFixed(1)} months · Seasoned market firewood: ${supplies.fuelDays.toFixed(1)} days of estimated demand · Firewood backorders: ${supplies.backlogDays.toFixed(1)} demand days. ${supplies.coldSeason?'Cold-season':'Mild-season'} warmth thresholds apply. Municipal emergency wood is not counted as available household fuel.`:'Household outlook will begin when residents are present.';
}
function householdNeedsText(h){
 const n=h.needs;
 return `Food: ${FOOD_OUTLOOK[n.food]} · Warmth: ${WARMTH_OUTLOOK[n.warmth]} · Care: ${CARE_OUTLOOK[n.care]} · Wellbeing: ${n.wellbeing}/100 (${wellbeingBand(n.wellbeing).toLowerCase()}, ${n.trend>0?'improving':n.trend<0?'declining':'steady'})${n.hardshipDays?' · '+n.hardshipDays+' consecutive days struggling':''}`;
}
function validateNeeds(p,data){
 if(p.needsModel===undefined)return;
 if(p.needsModel!==1)throw Error('Unsupported household needs model');
 const day=data.month*30+(Number.isInteger(data.day)?data.day:1)-1;
 for(const h of p.households){const n=h.needs;
  if(!n||!['food','warmth','care'].every(k=>Number.isInteger(n[k])&&n[k]>=0&&n[k]<=2)||!Number.isInteger(n.wellbeing)||n.wellbeing<0||n.wellbeing>100||!Number.isSafeInteger(n.lastDay)||n.lastDay<0||n.lastDay>day||![-1,0,1].includes(n.trend)||!Number.isSafeInteger(n.hardshipDays)||n.hardshipDays<0)throw Error('Invalid household needs');
 }
}

// Family links are provisional simulation data, seeded once without invented dates.
function blankFamily(householdId){return {parentIds:[],guardianIds:[],partnerId:null,formerPartnerIds:[],originHouseholdId:householdId,independent:false}}
function migrateFamilies(){
 const p=world.population;if(p.familyModel===1)return;
 for(const r of p.residents)r.family=blankFamily(r.householdId);
 const groups=residentGroups();
 for(const members of groups.values()){
  const adults=members.filter(r=>r.ageMonths>=216&&r.ageMonths<780);
  const [a,b]=adults;
  if(a&&b&&Math.abs(a.ageMonths-b.ageMonths)<=240){a.family.partnerId=b.id;b.family.partnerId=a.id}
  for(const child of members.filter(r=>r.ageMonths<216)){
   const eligible=adults.filter(r=>r.ageMonths-child.ageMonths>=216&&r.ageMonths-child.ageMonths<=600);
   const parent=eligible[0];
   if(parent){child.family.parentIds=[parent.id];if(eligible.some(r=>r.id===parent.family.partnerId))child.family.parentIds.push(parent.family.partnerId)}
   else child.family.guardianIds=adults.slice(0,2).map(r=>r.id);
  }
 }
 p.familyModel=1;p.familyArchive=[];p.revision++;
}
function familyIndex(){return new Map([...world.population.familyArchive,...world.population.residents].map(r=>[r.id,r]))}
function ancestors(id,index,includeGuardians=false){
 const links=id=>{const f=index.get(id)?.family;return f?[...f.parentIds,...(includeGuardians?f.guardianIds:[])]:[]};
 const seen=new Set(),pending=links(id);
 while(pending.length){const next=pending.pop();if(seen.has(next))continue;seen.add(next);pending.push(...links(next))}return seen;
}
function related(a,b,index){
 if(a.id===b.id||a.householdId===b.householdId||a.family.originHouseholdId===b.family.originHouseholdId)return true;
 const left=ancestors(a.id,index,true),right=ancestors(b.id,index,true);
 return left.has(b.id)||right.has(a.id)||[...left].some(id=>right.has(id));
}
function archiveFamilyDeaths(deceased){
 const p=world.population;if(p.familyModel!==1)return 0;
 const ids=new Set(deceased.map(r=>r.id));let bereaved=0;
 for(const r of p.residents)if(!ids.has(r.id)&&ids.has(r.family.partnerId)){
  r.family.formerPartnerIds.push(r.family.partnerId);r.family.partnerId=null;bereaved++;
 }
 for(const r of deceased){
  const f=JSON.parse(JSON.stringify(r.family));
  if(f.partnerId!==null){f.formerPartnerIds.push(f.partnerId);f.partnerId=null}
  p.familyArchive.push({id:r.id,name:r.name,ageMonths:r.ageMonths,deathDay:worldDay(),family:f});
 }
 return bereaved;
}
function linkNewborn(child,home){
 const p=world.population;if(p.familyModel!==1)return;
 child.family=blankFamily(home.id);
 const adults=p.residents.filter(r=>r.id!==child.id&&r.householdId===home.id&&r.ageMonths>=216&&r.ageMonths<660);
 const parent=adults.find(r=>r.family.partnerId!==null)||adults[0];
 if(parent){child.family.parentIds=[parent.id];if(adults.some(r=>r.id===parent.family.partnerId))child.family.parentIds.push(parent.family.partnerId)}
 else child.family.guardianIds=p.residents.filter(r=>r.householdId===home.id&&r.ageMonths>=216).slice(0,2).map(r=>r.id);
}
function arrangeGuardians(){
 const p=world.population,live=new Map(p.residents.map(r=>[r.id,r]));let moved=0;
 const adults=p.residents.filter(r=>r.ageMonths>=216&&r.ageMonths<900).sort((a,b)=>a.id-b.id);
 const groups=residentGroups();
 for(const child of p.residents.filter(r=>r.ageMonths<216)){
  const f=child.family;
  f.guardianIds=f.guardianIds.filter(id=>live.has(id));
  const residentParent=f.parentIds.map(id=>live.get(id)).find(r=>r&&r.householdId===child.householdId);
  if(residentParent)continue;
  const known=[...f.parentIds,...f.guardianIds].map(id=>live.get(id)).find(r=>r&&r.ageMonths>=216);
  const local=adults.find(r=>r.householdId===child.householdId);
  const target=known||local||adults[child.id%Math.max(1,adults.length)];
  if(!target){f.guardianIds=[];continue}
  if(!f.parentIds.includes(target.id))f.guardianIds=[target.id];
  if(child.householdId!==target.householdId){
   const old=groups.get(child.householdId)||[];groups.set(child.householdId,old.filter(r=>r.id!==child.id));
   child.householdId=target.householdId;moved++;
  }
 }
 return moved;
}
function formHouseholds(){
 const p=world.population,index=familyIndex(),groups=residentGroups();
 const dependedOn=new Set(p.residents.filter(r=>r.ageMonths<216).flatMap(r=>[...r.family.parentIds,...r.family.guardianIds]));
 const candidates=p.residents.filter(r=>r.ageMonths>=(20+r.id%5)*12&&r.ageMonths<=540&&r.family.parentIds.length&&!r.family.independent&&r.family.partnerId===null&&!dependedOn.has(r.id)).sort((a,b)=>b.ageMonths-a.ageMonths||a.id-b.id);
 const canLeave=r=>{
  const remaining=(groups.get(r.householdId)||[]).filter(x=>x.id!==r.id);
  return remaining.length>0&&(!remaining.some(x=>x.ageMonths<216||x.ageMonths>=900)||remaining.some(x=>x.ageMonths>=216&&x.ageMonths<900));
 };
 const used=new Set(),formed=[];
 for(const a of candidates){
  if(formed.length>=2)break;
  if(used.has(a.id)||!canLeave(a))continue;
  const b=candidates.find(r=>!used.has(r.id)&&canLeave(r)&&Math.abs(a.ageMonths-r.ageMonths)<=120&&!related(a,r,index));
  // A person can establish an independent home even without a suitable partner.
  const movers=b?[a,b]:[a],sources=movers.map(r=>p.households.find(h=>h.id===r.householdId));
  const h=newHousehold(p);h.surname=sources[0].surname;h.name=movers.map(r=>r.name).join(' & ')+' household '+h.id;
  h.foundedDay=worldDay();h.founderIds=movers.map(r=>r.id);
  const wellbeing=Math.round(sources.reduce((sum,home)=>sum+(home.needs?.wellbeing??70),0)/sources.length);
  const outlook=householdOutlook(movers,needsSupplies());
  h.needs={food:outlook.food,warmth:outlook.warmth,care:outlook.care,wellbeing,lastDay:worldDay(),trend:0,hardshipDays:0};
  for(const r of movers){groups.set(r.householdId,(groups.get(r.householdId)||[]).filter(x=>x.id!==r.id));r.householdId=h.id;r.family.independent=true;used.add(r.id)}
  groups.set(h.id,movers);
  if(b){a.family.partnerId=b.id;b.family.partnerId=a.id}
  formed.push(h);
 }
 return formed;
}
function pruneFamilyArchive(){
 const p=world.population,index=familyIndex(),needed=new Set(),links=r=>r?[...r.family.parentIds,...r.family.guardianIds,...r.family.formerPartnerIds]:[],pending=p.residents.flatMap(links);
 const living=new Set(p.residents.map(r=>r.id));
 pending.push(...p.familyArchive.filter(r=>r.family.parentIds.some(id=>living.has(id))).map(r=>r.id));
 while(pending.length){const id=pending.pop();if(needed.has(id))continue;needed.add(id);pending.push(...links(index.get(id)))}
 p.familyArchive=p.familyArchive.filter(r=>needed.has(r.id));
}
function finishFamilyMonth(born,bereaved){
 const p=world.population;if(p.familyModel!==1)return;
 const caredFor=arrangeGuardians(),formed=formHouseholds();
 pruneFamilyArchive();
 const changes=[];
 if(born.length)changes.push(born.length+' newborns added to family records');
 if(bereaved)changes.push(bereaved+' surviving partners bereaved');
 if(caredFor)changes.push(caredFor+' young residents moved into family or guardian care');
 if(formed.length)changes.push(formed.length+' new households established: '+formed.map(h=>h.name+' at '+h.address).join('; '));
 if(changes.length)addEvent('Family register: '+changes.join('; ')+'.');
}
function familyDescription(r,index,children){
 const f=r.family,label=id=>{const person=index.get(id);return person?person.name+(Number.isFinite(person.deathDay)?' (deceased)':''):'Unrecorded'};
 const details=[];
 if(f.partnerId!==null)details.push('Partner: '+label(f.partnerId));
 if(f.formerPartnerIds.length)details.push('Late partner: '+f.formerPartnerIds.map(label).join(', '));
 if(f.parentIds.length)details.push('Parents: '+f.parentIds.map(label).join(', '));
 if(f.guardianIds.length&&r.ageMonths<216)details.push('Guardian: '+f.guardianIds.map(label).join(', '));
 if(children.has(r.id))details.push('Children: '+children.get(r.id).map(child=>child.name+(Number.isFinite(child.deathDay)?' (deceased)':child.householdId!==r.householdId?' (another household)':'')).join(', '));
 return details.length?details.join(' · '):'No family links recorded';
}
function renderFamilySummary(){
 const p=world.population;
 $('familySummary').textContent=`${p.residents.filter(r=>r.family.partnerId!==null).length/2} partnerships · ${p.residents.filter(r=>r.family.parentIds.length).length} residents with recorded parents · ${p.households.filter(h=>Number.isInteger(h.foundedDay)).length} new households since family records began`;
}
function validateFamilies(p,data){
 if(p.familyModel===undefined)return;
 if(p.familyModel!==1||!Array.isArray(p.familyArchive))throw Error('Invalid family register');
 const live=new Map(p.residents.map(r=>[r.id,r])),all=new Map([...p.familyArchive,...p.residents].map(r=>[r.id,r]));
 if(all.size!==p.residents.length+p.familyArchive.length)throw Error('Duplicate family identity');
 const ids=list=>Array.isArray(list)&&new Set(list).size===list.length&&list.every(id=>Number.isSafeInteger(id)&&all.has(id));
 for(const r of all.values()){
  const f=r.family;
  if(!f||!ids(f.parentIds)||f.parentIds.length>2||!ids(f.guardianIds)||f.guardianIds.length>2||!ids(f.formerPartnerIds)||![true,false].includes(f.independent)||!Number.isSafeInteger(f.originHouseholdId)||f.originHouseholdId<1||f.originHouseholdId>=p.nextHouseholdId||[...f.parentIds,...f.guardianIds,...f.formerPartnerIds].includes(r.id))throw Error('Invalid family links');
  if(f.partnerId!==null&&(!live.has(r.id)||!live.has(f.partnerId)||f.partnerId===r.id||live.get(f.partnerId).family?.partnerId!==r.id||r.ageMonths<216||live.get(f.partnerId).ageMonths<216))throw Error('Invalid partnership');
  if(live.has(r.id)&&f.formerPartnerIds.some(id=>live.has(id)))throw Error('Invalid late partner');
  if(live.has(r.id)&&r.ageMonths<216&&f.guardianIds.some(id=>!live.has(id)||live.get(id).ageMonths<216))throw Error('Invalid guardian');
  if(f.parentIds.some(id=>all.get(id).ageMonths+(Number.isFinite(all.get(id).deathDay)?Math.floor((data.month*30+data.day-1-all.get(id).deathDay)/30):0)-r.ageMonths<216))throw Error('Invalid parent ages');
 }
 for(const r of p.familyArchive)if(!Number.isSafeInteger(r.id)||r.id<=0||r.id>=p.nextResidentId||typeof r.name!=='string'||!Number.isSafeInteger(r.ageMonths)||!Number.isSafeInteger(r.deathDay)||r.deathDay<0||r.deathDay>data.month*30+data.day-1)throw Error('Invalid family memorial');
 // Parent cycles and close-relative partnerships cannot enter through imported saves.
 for(const r of all.values())if(ancestors(r.id,all,true).has(r.id))throw Error('Cyclic family links');
 for(const r of live.values())if(r.family.partnerId!==null){const partner=live.get(r.family.partnerId),a=ancestors(r.id,all,true),b=ancestors(partner.id,all,true);if(a.has(partner.id)||b.has(r.id)||[...a].some(id=>b.has(id)))throw Error('Related partners')}
}


function advance(n){
 if(!Number.isInteger(n)||n<1||n>12)return;
 catchUp();simulateDays(n*DAYS_PER_MONTH,false);
 const outlook=needsSummary();
 addEvent('Manual advance: '+n+' month'+(n===1?'':'s')+'. Daily routines condensed; economy and population fully advanced. Household wellbeing: '+outlook.wellbeing+'/100 average; '+outlook.struggling+' struggling.');
 populationRenderKey='';world.lastUpdated=Date.now();persist();render();
}
function buildFarm(){catchUp();if(world.gold<150)return;world.gold-=150;world.farms++;addEvent('A new farm was constructed (simulation event).');persist();render()}
function togglePause(){
 catchUp();world.paused=!world.paused;world.lastUpdated=Date.now();world.lastUKDay=ukDayNumber();world.livingClock.cursor=civilMinute();
 if(!world.paused)world.livingClock.minute=clockMinute();
 addEvent(world.paused?'World paused.':'World resumed; paused time skipped.');persist();render();
}
function exportSave(){if(!loadFailed)catchUp();const blob=new Blob([loadFailed?localStorage.getItem(KEY):JSON.stringify(world,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kaddinghall-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function validateSave(data){
 if(!data||![1,2,3,4,5,6,7,8,9,10].includes(data.version)||!['month','pop','food','gold','farms'].every(k=>Number.isFinite(data[k])&&data[k]>=0)||!['month','pop','farms'].every(k=>Number.isSafeInteger(data[k]))||!Array.isArray(data.events)||!data.events.every(e=>typeof e==='string'))throw Error('Invalid world data');
 if(data.version>=9&&(!data.population||data.population.needsModel!==1))throw Error('Missing household needs');
 if(data.version===10&&(data.population.familyModel!==1||!Number.isInteger(data.day)||data.day<1||data.day>30))throw Error('Missing family data or invalid date');
 if(data.timber){
  const t=data.timber, sample=initialTimber();
  const check=(record,template)=>{if(!record)throw Error('Incomplete timber save');for(const [key,value] of Object.entries(template)){if(typeof value==='number'&&!Number.isFinite(record[key]))throw Error('Invalid timber '+key);if(typeof value==='string'&&typeof record[key]!=='string')throw Error('Invalid timber '+key)}};
  if(!Array.isArray(t.businesses)||t.businesses.length!==2||!Array.isArray(t.mills)||t.mills.length!==2||!Number.isSafeInteger(t.elapsed)||t.elapsed<0||!Number.isFinite(t.municipalReserve)||!t.prices||!Number.isFinite(t.prices.fire)||!Number.isFinite(t.prices.construction))throw Error('Invalid timber data');
  t.businesses.forEach((b,i)=>{check(b,sample.businesses[i]);if(b.id!==sample.businesses[i].id||!Array.isArray(b.batches)||!b.batches.every(x=>Number.isFinite(x.tonnes)&&Number.isFinite(x.readyAt)))throw Error('Invalid timber batches')});
  t.mills.forEach((m,i)=>check(m,sample.mills[i]));
  if(t.orders&&!t.orders.every(o=>['oak','green'].includes(o.business)&&['fire','construction'].includes(o.product)&&typeof o.customer==='string'&&Number.isFinite(o.remaining)&&Number.isFinite(o.placedDay)))throw Error('Invalid timber orders');
  const rows=(list,fields,size)=>Array.isArray(list)&&(size===undefined||list.length===size)&&list.every(row=>row&&fields.every(k=>Number.isFinite(row[k])));
  if(t.ledger&&(!Array.isArray(t.ledger)||!t.ledger.every(e=>e&&Number.isFinite(e.month)&&rows(e.businesses,['fire','construction','income','cost','closingCash'])&&rows(e.mills,['logs','income','cost','days'])&&e.businesses.concat(e.mills).every(row=>typeof row.name==='string'))))throw Error('Invalid timber ledger');
  if(t.monthStart&&(!rows(t.monthStart.businesses,['revenue','expenses','soldFire','soldConstruction','ready','seasoning'],2)||!rows(t.monthStart.mills,['processed','revenue','expenses','days'],2)))throw Error('Invalid timber month snapshot');
 }
 if(data.population){
  const p=data.population,c=data.livingClock;
  if(p.schema!==1||!Array.isArray(p.residents)||p.residents.length!==data.pop||!Array.isArray(p.households)||!Number.isSafeInteger(p.nextResidentId)||!Number.isSafeInteger(p.nextHouseholdId)||!Number.isSafeInteger(p.revision))throw Error('Invalid population');
  const homes=new Set(p.households.map(h=>h.id)),ids=new Set(p.residents.map(r=>r.id));
  if(homes.size!==p.households.length||ids.size!==p.residents.length||!p.households.every(h=>Number.isSafeInteger(h.id)&&h.id>0&&h.id<p.nextHouseholdId&&['name','surname','address'].every(k=>typeof h[k]==='string'))||!p.residents.every(r=>Number.isSafeInteger(r.id)&&r.id>0&&r.id<p.nextResidentId&&homes.has(r.householdId)&&Number.isSafeInteger(r.ageMonths)&&r.ageMonths>=0&&['name','occupation','workplace'].every(k=>typeof r[k]==='string')))throw Error('Invalid resident or household');
  if(!c||!Number.isSafeInteger(c.cursor)||!Number.isInteger(c.minute)||c.minute<0||c.minute>=1440)throw Error('Invalid living clock');
  validateNeeds(p,data);
  validateFamilies(p,data);
 }
}
function migrateWorld(){
 if(world.version===1){world.day=1;world.paused=false;world.lastUpdated=Date.now()}
 if(!world.timber)world.timber=initialTimber();
 if(!Array.isArray(world.timber.ledger))world.timber.ledger=[];
 migrateOrders();
 if(!Number.isFinite(world.lastUpdated))world.lastUpdated=Date.now();
 if(!Number.isInteger(world.day)||world.day<1||world.day>30)world.day=1;
 world.paused=!!world.paused;
 if(!Number.isFinite(world.lastUKDay)){
  if(!world.paused)simulateDays(Math.floor(Math.max(0,Date.now()-world.lastUpdated)/DAY));
  world.lastUKDay=ukDayNumber();
 }
 migrateFood();migratePopulation();migrateNeeds();migrateFamilies();world.version=10;
 world.events=world.events.slice(0,150);
}
function importWorld(data){
 validateSave(data);
 const previous=world;
 try{world=JSON.parse(JSON.stringify(data));migrateWorld();catchUp()}
 catch(err){world=previous;eventContext=null;throw err}
 loadFailed=false;householdPage=0;householdFilter='all';$('householdFilter').value='all';populationRenderKey='';lastLedgerRenderKey=null;persist();render();
}
$('file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{importWorld(JSON.parse(await f.text()))}catch(err){alert('Cannot import this save: '+err.message)}e.target.value=''});
function resetWorld(){if(confirm('Reset Kaddinghall? Export your save first if needed.')){loadFailed=false;world=initial();migrateWorld();householdPage=0;householdFilter='all';$('householdFilter').value='all';populationRenderKey='';lastLedgerRenderKey=null;persist();render()}}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
function start(){
 try{const saved=localStorage.getItem(KEY);world=saved?JSON.parse(saved):initial();validateSave(world);migrateWorld();catchUp();persist();render()}
 catch(err){loadFailed=true;$('saveStatus').textContent='Save could not be loaded: '+err.message+'. Export save can download the stored data before resetting.';}
 window.addEventListener('focus',()=>{if(!loadFailed){catchUp();render()}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!loadFailed){catchUp();render()}});
 setInterval(()=>{if(!document.hidden&&!loadFailed){catchUp();render()}},1000);
}
start();


// Navigation and summaries are presentation only; they never advance the simulation.
function renderLayoutSummary(){
 const needs=needsSummary();
 $('overviewWellbeing').textContent=needs.households?needs.wellbeing+'/100':'—';
 $('overviewNeeds').textContent=needs.households?`${needs.settled} settled households · ${needs.struggling} struggling · ${needs.care} with care pressure`:'No occupied households yet.';
 $('recentEvents').replaceChildren(...world.events.slice(0,3).map(message=>{const li=document.createElement('li');li.textContent=message;return li}));
 if(!world.events.length){const li=document.createElement('li');li.textContent='The town’s story will appear here.';$('recentEvents').append(li)}
}
function showView(name,scroll=true){
 const names=['overview','population','businesses','chronicle'];
 if(!names.includes(name))name='overview';
 for(const item of names){
  const active=item===name,tab=$('tab-'+item);
  tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
  $('view-'+item).hidden=!active;
 }
 try{history.replaceState(null,'','#'+name)}catch{}
 if(scroll)$('view-'+name).scrollIntoView({block:'start',behavior:'instant'});
 if(document.activeElement?.closest('[role="tabpanel"]')?.hidden)$('view-'+name).focus({preventScroll:true});
}
function openWorldControls(){
 const controls=$('worldControls');controls.open=true;
 controls.scrollIntoView({block:'start',behavior:'instant'});
 controls.querySelector('summary').focus({preventScroll:true});
}
function initLayout(){
 const names=['overview','population','businesses','chronicle'];
 for(const name of names){
  const tab=$('tab-'+name);
  tab.addEventListener('click',()=>showView(name));
  tab.addEventListener('keydown',event=>{
   const index=names.indexOf(name);
   const next=event.key==='ArrowRight'?(index+1)%4:event.key==='ArrowLeft'?(index+3)%4:event.key==='Home'?0:event.key==='End'?3:null;
   if(next===null)return;event.preventDefault();showView(names[next]);$('tab-'+names[next]).focus({preventScroll:true});
  });
 }
 showView(location.hash.slice(1),false);
 window.addEventListener('hashchange',()=>showView(location.hash.slice(1)));
}
initLayout();
