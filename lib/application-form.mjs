import {season3Venues} from './accreditation-venues.mjs';

export const matchDays=[...new Set(season3Venues.flatMap(v=>v.matchDates))].sort();
export const applicationTeams=['India Champions','Pakistan Champions','Australia Champions','England Champions','South Africa Champions','West Indies Champions','Bangladesh Champions'];
export const documentKinds=['idFront','idBack','assignmentEvidence'];
export const documentLabels={idFront:'ID proof',idBack:'ID reverse side',assignmentEvidence:'Appointment or assignment evidence'};
export const applicationLabels={name:'Full name',displayName:'Name on card',email:'Email address',mobile:'Mobile number',organisation:'Company / organisation',jobTitle:'Job title',assignment:'Assignment',category:'Accreditation category',headshot:'Photograph',...documentLabels,department:'Department',departmentOther:'Department details',roleChoice:'Actual role',team:'Team',idType:'ID type',idDescription:'Government ID name',idHasReverse:'ID reverse side required',requestedDays:'Requested dates',requestedZones:'Requested access',restrictedReason:'Reason for restricted access',nominatorName:'Nominating contact',nominatorContact:'Contact email / phone',remarks:'Additional remarks'};
export const applicationDepartments=[
  ['teams','Players & Team Management',['player','team-staff'],['Player','Team manager','Team logistics','Coach / support staff','Other']],
  ['officials','Match Officials',['official'],['Match referee','Umpire','Match official','Other']],
  ['integrity','Anti-Corruption / Integrity',['acu'],['Integrity officer','Anti-corruption officer','Other']],
  ['management','Tournament Operations',['management'],['Tournament director','Operations manager','Operations staff','Other']],
  ['administration','Accreditation & Administration',['management'],['Accreditation coordinator','Administration staff','Other']],
  ['broadcast','Broadcast Production',['broadcast','temporary-broadcast'],['Producer','Camera operator','Commentator','Broadcast technician','Other']],
  ['media','Media & Communications',['media','temporary-media','wcl-media','temporary-wcl-media'],['Journalist','Photographer','Communications officer','Other']],
  ['commercial','Commercial, Sponsors & Partners',['management','vip'],['Partner representative','Sponsor representative','Commercial staff','Other']],
  ['venues','Venue & Facilities',['venue'],['Venue manager','Facilities staff','Ground staff','Other']],
  ['security','Security',['vendor'],['Security supervisor','Security officer','Other']],
  ['medical','Medical',['vendor'],['Doctor','Paramedic','Medical support','Other']],
  ['hospitality','Hospitality & Catering',['pitch-lounge','vendor'],['Hospitality manager','Catering staff','Host','Other']],
  ['transport','Transport & Logistics',['vendor'],['Driver','Logistics coordinator','Transport manager','Other']],
  ['technical','IT & Technical',['vendor'],['IT support','Technical engineer','Other']],
  ['volunteers','Volunteers',['vendor'],['Volunteer coordinator','Volunteer','Other']],
  ['guests','Guests / VIPs',['vip'],['Guest','VIP','Other']],
  ['other','Other — specify',['vendor'],['Other']],
].map(([id,label,categories,roles])=>({id,label,categories,roles,enabled:true,nominationRequired:id!=='guests',evidenceRequired:id!=='guests'}));

// Stable IDs preserve staff scopes and historical queues. Old departments remain
// readable but are not offered to new applicants after this migration.
export function migrateApplicationDepartments(existing=[]){
  return [
    ...applicationDepartments.map(d=>({...d,enabled:existing.find(x=>x.id===d.id)?.enabled??true})),
    ...existing.filter(d=>!applicationDepartments.some(x=>x.id===d.id)).map(d=>({...d,legacyOnly:true,roles:d.roles||['Other']})),
  ];
}

export function requestedTeamRole(category,role){
  if(category!=='team-staff')return '';
  return role==='Team manager'?'team-manager':role==='Team logistics'?'team-logistics':'other';
}

export function applicationFieldError(config,body){
  const d=config.departments.find(d=>d.id===body.department&&d.enabled&&!d.legacyOnly);
  if(!d||!d.categories.includes(body.category))return 'Choose a department and a category available to it.';
  if(!d.roles?.includes(body.roleChoice))return 'Choose your actual role in this department.';
  if(body.category==='player'&&body.roleChoice!=='Player')return 'Choose Player only when your actual assignment is as a player.';
  if(body.roleChoice==='Other'&&!String(body.jobTitle||'').trim())return 'Specify your actual role.';
  if(d.id==='other'&&!String(body.departmentOther||'').trim())return 'Specify your department.';
  if((d.id==='teams'||['player','team-staff'].includes(body.category))&&!applicationTeams.includes(body.team))return 'Choose the team you are assigned to.';
  if(!['passport','emirates-id','other'].includes(body.idType))return 'Choose your government photo ID type.';
  if(body.idType==='other'&&!String(body.idDescription||'').trim())return 'Specify the government photo ID you are providing.';
  if(!Array.isArray(body.requestedDays)||!body.requestedDays.length||body.requestedDays.some(d=>!matchDays.includes(d)))return 'Select the required match or working dates from the event schedule.';
  if(body.requestedZones?.some(z=>['SEC-5','FOP','DRESS'].includes(z))&&String(body.restrictedReason||'').trim().length<8)return 'Explain why your assignment requires restricted access.';
  if(d.nominationRequired&&(!String(body.nominatorName||'').trim()||!/^([^\s@]+@[^\s@]+\.[^\s@]+|\+[0-9 ()-]{7,20})$/.test(String(body.nominatorContact||''))))return 'Add your nominating manager or department contact and their email or international phone number.';
  if(body.accuracy!==true||body.eventTerms!==true)return 'Confirm the accuracy declaration and accept the event terms.';
  return '';
}
export function approvedDayError(snapshot,at=new Date()){
  if(!snapshot?.approvedDays)return '';
  const day=new Date(at).toLocaleDateString('en-CA',{timeZone:'Asia/Dubai'});
  return snapshot.approvedDays.includes(day)?'':'Not an approved access date';
}

// Provider contracts are a separate prerequisite. WCL privacy consent cannot
// authorise a hosting provider to process data excluded by its service terms.
export function identityProviderReady(config){
  return config.activation?.identityProviderApproved===true&&
    typeof config.activation.identityProviderReference==='string'&&
    config.activation.identityProviderReference.trim().length>=8;
}
