// Transcribed from the user-supplied UAE 2026 schedule. Stadium allocations are NOT supplied.
export const scheduleSource='/assets/season3-updates/schedule-original.png';
export const restDays=['2026-10-08','2026-10-15','2026-10-17'];
const fixtures=[
 [3,'15:30','pakistan','bangladesh'],[3,'19:30','india','australia'],
 [4,'15:30','south-africa','west-indies'],[4,'19:30','india','england'],
 [5,'15:30','australia','pakistan'],[5,'19:30','bangladesh','england'],
 [6,'15:30','india','south-africa'],[6,'19:30','pakistan','west-indies'],
 [7,'15:30','australia','bangladesh'],[7,'19:30','england','west-indies'],
 [9,'15:30','australia','south-africa'],[9,'19:30','bangladesh','west-indies'],
 [10,'15:30','england','south-africa'],[10,'19:30','india','pakistan'],
 [11,'15:30','australia','west-indies'],[11,'19:30','india','bangladesh'],
 [12,'19:30','pakistan','south-africa'],
 [13,'15:30','australia','england'],[13,'19:30','india','west-indies'],
 [14,'15:30','england','pakistan'],[14,'19:30','bangladesh','south-africa'],
 [16,'15:30',null,null,'Semi-final 1'],[16,'19:30',null,null,'Semi-final 2'],
 [18,'19:30',null,null,'Grand final']
];
export const season3Matches=fixtures.map(([day,time,home,away,label],i)=>({
 id:`s3-match-${i+1}`,season:3,number:i+1,label:label||`Match ${i+1}`,
 teams:[home,away].filter(Boolean),participants:home?null:['To be confirmed','To be confirmed'],
 date:`${String(day).padStart(2,'0')} October 2026`,time,timeZone:'Asia/Dubai',
 startsAt:`2026-10-${String(day).padStart(2,'0')}T${time}:00+04:00`,
 venue:'UAE · stadium to be confirmed',status:'Scheduled',source:scheduleSource,
 sourceLabel:'Supplied UAE 2026 schedule',stage:label?'Knockout':'League'
}));
export const uaeTime=match=>match.time?`${match.time} UAE · UTC+4`:null;
