(function(root){
  const phases = [
    ['01-03T10:03','Full moon'],['01-10T15:48','Last quarter'],['01-18T19:52','New moon'],['01-26T04:48','First quarter'],
    ['02-01T22:09','Full moon'],['02-09T12:43','Last quarter'],['02-17T12:01','New moon'],['02-24T12:28','First quarter'],
    ['03-03T11:38','Full moon'],['03-11T09:39','Last quarter'],['03-19T01:23','New moon'],['03-25T19:18','First quarter'],
    ['04-02T02:12','Full moon'],['04-10T04:52','Last quarter'],['04-17T11:52','New moon'],['04-24T02:32','First quarter'],
    ['05-01T17:23','Full moon'],['05-09T21:11','Last quarter'],['05-16T20:01','New moon'],['05-23T11:11','First quarter'],['05-31T08:45','Full moon'],
    ['06-08T10:01','Last quarter'],['06-15T02:54','New moon'],['06-21T21:55','First quarter'],['06-29T23:57','Full moon'],
    ['07-07T19:29','Last quarter'],['07-14T09:44','New moon'],['07-21T11:06','First quarter'],['07-29T14:36','Full moon'],
    ['08-06T02:22','Last quarter'],['08-12T17:37','New moon'],['08-20T02:46','First quarter'],['08-28T04:18','Full moon'],
    ['09-04T07:51','Last quarter'],['09-11T03:27','New moon'],['09-18T20:44','First quarter'],['09-26T16:49','Full moon'],
    ['10-03T13:25','Last quarter'],['10-10T15:50','New moon'],['10-18T16:13','First quarter'],['10-26T04:12','Full moon'],
    ['11-01T20:28','Last quarter'],['11-09T07:02','New moon'],['11-17T11:48','First quarter'],['11-24T14:53','Full moon'],
    ['12-01T06:09','Last quarter'],['12-09T00:52','New moon'],['12-17T05:43','First quarter'],['12-24T01:28','Full moon'],['12-30T19:00','Last quarter']
  ].map(([date,name])=>({utc:'2026-'+date+':00Z',name}));
  const data={
    lunarEpoch:'2026-01-18T19:52:00Z', phases2026:phases,
    // UTC minute-resolution 2026 reference; reused as a seasonal template in other years.
    seasonTurns:[{month:3,day:20,hour:14,minute:46},{month:6,day:21,hour:8,minute:24},{month:9,day:23,hour:0,minute:5},{month:12,day:21,hour:20,minute:50}],
    sources:[{title:'Fred Espenak / AstroPixels — lunar phases (GMT)',url:'https://astropixels.com/ephemeris/moon/phases2001.html'}, {title:'US National Weather Service — 2026 seasons (UT)',url:'https://www.weather.gov/dvn/Climate_Astronomical_Seasons'}]
  };
  if(typeof module==='object') module.exports=data; else root.ArcanusAstronomy=data;
})(globalThis);
