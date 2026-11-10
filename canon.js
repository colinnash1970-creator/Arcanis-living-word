(function(root){
  const data = {
    months: ['Dawnmere','Frostveil','Thawen','Bloomtide','Kielara','Suncrest','Emberfall','Goldharvest','Duskwane','Veilwatch','Stormrend','Nightrest'],
    weekdays: ['Lunareth','Daneth','Stoneward','Stormwake','Kielday','Starwatch','Dawnrest'],
    watches: ['Deepwatch','First Stirring','Dawnwake','Rising Light','Highsun','Waning Light','Duskfall','Nightwatch'],
    seasons: ['Verdantia','Solara','Aurumn','Nivara'],
    yearOffset:1198, lunarPeriodDays:29.53059,
    eventStatus:'Canonical register supplied by the user: 50 annual observances, The Hidden Dawn, seven birthdays.',
    // UTC offset is deliberately unset. Calendar arithmetic uses a neutral civil timeline.
    starhavenUtcOffsetMinutes:null,
    weekdayConvention:'Lunareth corresponds to Monday; Dawnrest to Sunday.',
    watchConvention:'Deepwatch begins at 00:00; each watch lasts three hours.'
  };
  const annual=[];
  function add(category,rows,realm){rows.forEach(([month,day,name,notes='',originYear])=>annual.push({id:'canon-'+(annual.length+1),type:'observance',category,month,day,name,notes,...(realm?{realm}:{}),...(originYear!==undefined?{originYear}:{})}));}
  add('ancient',[[1,1,'First Light'],[3,20,'Awakening'],[6,21,'Long Light'],[9,22,'Gathering'],[12,21,'Vigil of Stars']]);
  add('religious',[[3,21,'First Bloom','Kielinya and Danel'],[6,21,'Oath of Dawn','Danel'],[9,22,'Hearthbinding','Kielinya and Danel'],[12,25,'Frostweave Fest','Kielinya']],'Kielinstria');
  add('religious',[[2,14,'First Ember','Irazael and Eryos'],[5,18,'Trial of Cinders','Irazael'],[7,17,'Phoenix Ascendant','Eryos'],[11,12,'Last Flame','Irazael and Eryos']],'Pyrothar');
  add('religious',[[3,8,'Tides’ Blessing','Caelios and Nyxas'],[6,16,'Moonlit Current','Nyxas'],[8,9,'Crossing of Waters','Caelios'],[10,19,'Returning Tide','Caelios and Nyxas']],'Aquenaleth');
  add('religious',[[3,12,'Stone Awakening','Valtharion and Zarthos'],[6,6,'Shaping','Valtharion'],[9,18,'Unbroken Oath','Zarthos'],[12,8,'Deep Remembrance','Valtharion and Zarthos']],'Terravalor');
  add('religious',[[4,7,'Whispering Winds','Sylphira and Vileth'],[6,24,'Masquerade of a Thousand Faces','Vileth'],[9,13,'Dreamweaver’s Night','Sylphira'],[11,29,'Veil of Truth','Sylphira and Vileth']],'Zephyros');
  add('religious',[[2,9,'Vigil of Ancestors','Maravith and Veldrin'],[5,11,'Eternal Record','Maravith'],[8,27,'Binding of Shadows','Veldrin'],[10,31,'Night of Whispers','Maravith and Veldrin']],'Umbrathis');
  add('religious',[[1,15,'First Vision','Ilyana and Malon'],[4,10,'Celestial Convergence','Ilyana'],[7,23,'Starfall Vigil','Malon'],[11,16,'Turning of the Hours','Ilyana and Malon']],'Luminara');
  add('religious',[[3,19,'Blooming Hearts','Thalora and Korath'],[6,12,'Song of Enchantment','Thalora'],[9,5,'Binding Promise','Korath'],[12,18,'Everlasting Song','Thalora and Korath']],'Eldarion');
  add('historical',[[1,1,'Day of Unity','Foundation of Eryndorion',0],[4,8,'Concord of Eight','Unification and Council of Eight',2],[5,15,'Day of Miracle','Miracle of Kaddinghall',350],[8,12,'Day of Accord','Treaty of Starhaven',560],[11,11,'Day of Ashes','Fall of Sternia',793]]);
  add('kingdom',[[2,20,'Winter Crown','Frostlight'],[4,3,"Founder's Day",'Aegiswatch'],[5,9,'Green Crown','Verdantreach'],[6,14,'Azure Tides','Sapphirestrand'],[6,18,'Twin Rivers','Glimmerdawn'],[7,19,'Forge','Ironveil'],[7,23,'Eternal Flame','Emberward'],[8,7,'Silver Crown','Silvermere']]);
  data.annualObservances=annual;
  data.leapFestivals=[{id:'hidden-dawn',type:'leap-festival',category:'ancient',name:'The Hidden Dawn',month:2,day:29,notes:'Leap years only.'}];
  data.birthdays=[[2,1,'Sula',undefined,'Birth year undetermined; physically 14 on leaving the Arcanium.'],[3,23,'Malcolm Darkbane',702],[6,6,'Ulaire',632],[7,4,'Thorn',711],[8,10,'Star Bright',712],[9,8,'Bonekrakka',714],[11,25,'Roxy Quills',713]].map(([month,day,name,birthYear,notes=''],i)=>({id:'birthday-'+i,type:'birthday',month,day,name,notes,...(birthYear!==undefined?{birthYear}:{})}));
  data.events=[...data.annualObservances,...data.leapFestivals,...data.birthdays];
  if(typeof module==='object') module.exports=data; else root.ArcanusCalendarData=data;
})(globalThis);
