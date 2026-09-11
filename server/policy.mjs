export const roles=['Owner','Administrator','Editor','Publisher','Media Manager','Analyst','Accreditation Manager','Gate Operator'];
export const permissions={
 Owner:['*'],Administrator:['content:read','content:write','content:publish','media:write','accred:read','accred:write','accred:approve','accred:scan','config:write','audit:read'],
 Editor:['content:read','content:write'],Publisher:['content:read','content:publish'],
 'Media Manager':['content:read','media:write'],Analyst:['content:read','audit:read'],
 'Accreditation Manager':['accred:read','accred:write','accred:approve','accred:scan'],
 'Gate Operator':['accred:scan']
};
export const can=(role,permission)=>permissions[role]?.some(p=>p==='*'||p===permission)||false;
export function check(role,permission){if(!can(role,permission))throw Object.assign(Error('Your role cannot perform this action.'),{status:403});}
export const categories=[
 ['player','Team player','#ed078d'],['team-staff','Team staff','#e25327'],['official','Match official','#981b35'],['acu','Anti-corruption unit','#552fa8'],
 ['management','WCL management','#e82a31'],['broadcast','Broadcast','#ffe500'],['media','Media','#a51285'],['wcl-media','WCL media','#7130df'],
 ['vendor','Service provider','#ff810d'],['venue','Venue operations','#267aaa'],['vip','Sponsor / VIP / guest','#aa853b'],['pitch-lounge','Pitch Lounge','#111a6c'],
 ['field-of-play','Field of play','#25dd69'],['temporary-wcl-media','Temporary WCL media','#7130df'],
 ['temporary-broadcast','Temporary broadcast','#ffe500'],['temporary-media','Temporary media','#a51285'],['temporary-vendor','Temporary service provider','#ff810d'],['temporary-field','Temporary field of play','#25dd69']
].map(([id,label,color])=>({id,label,color,defaultZones:[]}));
export const defaultAccreditationConfig={
 intake:{enabled:false,privacyNoticeUrl:'',contactEmail:'',consentVersion:''},
 season:'2026',categories,
 zones:[{id:'FOP',label:'Field of play',enabled:false},{id:'DRESS',label:'Dressing rooms',enabled:false},{id:'MEDIA',label:'Media box',enabled:false},{id:'BROADCAST',label:'Broadcast compound',enabled:false},{id:'OPS',label:'Operations',enabled:false},{id:'LOUNGE',label:'Pitch Lounge',enabled:false}],
 venues:[],widthMm:85,heightMm:120,backText:'Personal, non-transferable accreditation. Access is limited to the dates, venue and zones approved for this credential. Follow the instructions of venue security. Report a lost pass to WCL accreditation immediately.',
 reviewNotice:'Historical PDF colour categories are references, not Season 3 access approvals. Venue and zone mappings require event-security sign-off.'
};
export const collections=['hero','news','brands','leadership','players','teams','fixtures','pages','navigation','footer','seasons','records','videos','tickets','experience','social','seo'];
const publicFields={
 hero:'id label tag title line copy supportingCopy chapter role source action to secondary secondaryTo facts note image alt players videoId visible order',
 news:'id sourceItem sourceUrl title summary sourceName contentType category team season publishedAt thumbnail imageAlt imageCredit featured verificationStatus order',
 players:'id name team role image headshot participation campaign portraitVariants portraitReviewStatus order',
 fixtures:'id season number label teams participants date time timeZone startsAt venue source sourceLabel stage status verificationStatus result scores order',
 brands:'id name image source sourceImage association season category order',
 leadership:'id name role image source copy facts order',
 videos:'id title thumbnail season source url teams order',
 tickets:'id matchId label title verificationStatus availability bookingUrl provider venue priceLabel category order',
 experience:'id label motionEnabled brandMotion brandDuration revealDuration'
};
export function publicPayload(collection,payload){const fields=(publicFields[collection]||'id title name label summary body image alt to order').split(' ');return Object.fromEntries(fields.filter(key=>payload[key]!==undefined).map(key=>[key,payload[key]]));}
export function validatePayload(collection,payload){
 if(!collections.includes(collection)||!payload||typeof payload!=='object'||Array.isArray(payload))throw Object.assign(Error('Invalid content record.'),{status:400});
 const text=JSON.stringify(payload);if(text.length>80000||/<script|javascript:|data:text\/html|onerror\s*=/i.test(text))throw Object.assign(Error('Unsafe or oversized content.'),{status:400});
 if(!String(payload.title||payload.name||payload.label||payload.id||'').trim())throw Object.assign(Error('A title, name, label or id is required.'),{status:400});
 if(collection==='hero'&&(!payload.id||!payload.title||!payload.line||!payload.label||!payload.to||!payload.secondaryTo||!Array.isArray(payload.facts)||payload.facts.some(x=>!Array.isArray(x)||x.length!==2)))throw Object.assign(Error('Hero needs id, label, title, line, both CTA destinations and value/label fact pairs.'),{status:400});
 if(collection==='hero')for(const field of ['supportingCopy','chapter','role'])if(payload[field]!==undefined&&(typeof payload[field]!=='string'||payload[field].length>1000))throw Object.assign(Error('Use up to 1000 text characters for '+field),{status:400});
 if(collection==='fixtures'&&(!payload.id||!Array.isArray(payload.teams)||!payload.label||!payload.date))throw Object.assign(Error('A fixture needs id, teams, label and date.'),{status:400});
 if(collection==='players'&&(!payload.id||!payload.name||!payload.team))throw Object.assign(Error('Player id, workbook name and team required.'),{status:400});
 for(const field of ['image','thumbnail','sourceUrl','source','to','secondaryTo','headshot','bookingUrl'])if(payload[field]&&!/^(https:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(payload[field]))throw Object.assign(Error('Use HTTPS or local paths for '+field),{status:400});
 if(payload.videoId&&!/^[A-Za-z0-9_-]{11}$/.test(payload.videoId))throw Object.assign(Error('Use a valid YouTube video ID.'),{status:400});
 if(payload.visible!==undefined&&typeof payload.visible!=='boolean')throw Object.assign(Error('Visibility must be true or false.'),{status:400});
 if(collection==='players'){
  if(payload.portraitReviewStatus&&!['pending','approved','held','original'].includes(payload.portraitReviewStatus))throw Object.assign(Error('Choose a valid portrait review status.'),{status:400});
  for(const url of Object.values(payload.portraitVariants||{}))if(typeof url!=='string'||!/^(https:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(url))throw Object.assign(Error('Portrait variants need safe image URLs.'),{status:400});
 }
 const teamIds=['india','pakistan','south-africa','australia','england','west-indies','bangladesh'];
 if(collection==='fixtures'){
  if(![1,2,3].includes(Number(payload.season))||payload.teams.length>2||new Set(payload.teams).size!==payload.teams.length||payload.teams.some(id=>!teamIds.includes(id)))throw Object.assign(Error('Choose a valid season and up to two distinct WCL teams.'),{status:400});
  if(payload.startsAt&&!Number.isFinite(Date.parse(payload.startsAt)))throw Object.assign(Error('Match start must be a valid date/time.'),{status:400});
  if(payload.scores&&(!Array.isArray(payload.scores)||payload.scores.length>2||payload.scores.some(s=>typeof s!=='string')))throw Object.assign(Error('Scores must be up to two verified text summaries.'),{status:400});
 }
 if(collection==='players'&&!teamIds.includes(payload.team))throw Object.assign(Error('Choose a WCL team.'),{status:400});
 if(collection==='hero'&&payload.players&&(!Array.isArray(payload.players)||payload.players.length>3||payload.players.some(p=>!p.name||!p.team||!/^(https:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(p.image||''))))throw Object.assign(Error('Hero portraits need a name, team and safe image URL; maximum three portraits per story.'),{status:400});
 if(collection==='fixtures'&&payload.verificationStatus==='verified'&&payload.status==='Completed'&&!payload.result)throw Object.assign(Error('A verified completed fixture needs its result.'),{status:400});
 if(collection==='tickets'&&(!payload.matchId||!['coming-soon','on-sale','sold-out'].includes(payload.availability)))throw Object.assign(Error('Ticket mapping needs a match ID and availability.'),{status:400});
 if(collection==='tickets'&&payload.availability==='on-sale'&&(payload.verificationStatus!=='verified'||!/^https:\/\//.test(payload.bookingUrl||'')||!payload.provider))throw Object.assign(Error('On-sale tickets need verification, an HTTPS booking URL and named provider.'),{status:400});
 if(collection==='experience'){
  if(payload.id!=='motion')throw Object.assign(Error('Use motion as the experience settings ID.'),{status:400});
  for(const key of ['motionEnabled','brandMotion'])if(payload[key]!==undefined&&typeof payload[key]!=='boolean')throw Object.assign(Error(key+' must be a boolean.'),{status:400});
  for(const [key,min,max] of [['brandDuration',80,180],['revealDuration',.15,.6]])if(payload[key]!==undefined&&(!Number.isFinite(payload[key])||payload[key]<min||payload[key]>max))throw Object.assign(Error(key+' is outside its safe motion range.'),{status:400});
 }
 return payload;
}
