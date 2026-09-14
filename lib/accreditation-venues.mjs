// Supplied Season 3 schedule and ticket map. Neither grants operational access.
export const season3Event = {
  label: 'World Championship of Legends — Season 3, 2026',
  heading: '3–18 OCTOBER 2026',
  from: '2026-10-02T20:00:00.000Z',
  to: '2026-10-18T19:59:59.000Z',
  timeZone: 'Asia/Dubai',
};
export const season3Venues = [
  {id:'sharjah', label:'Sharjah Cricket Stadium', enabled:false, matchDates:[3,4,5,6,7,12,13,14,16,18].map(d=>`2026-10-${String(d).padStart(2,'0')}`)},
  {id:'dubai', label:'Dubai International Cricket Stadium', enabled:false, matchDates:[9,10,11].map(d=>`2026-10-${String(d).padStart(2,'0')}`)},
];
export const season3Finals = [
  {label:'Semi-finals', date:'2026-10-16', venue:'sharjah'},
  {label:'Grand Final', date:'2026-10-18', venue:'sharjah'},
];
export const sharjahOrientation = ['Sharjah Academy End','Bukhatir End'];
export const sharjahSeatingAreas = [
  ['north-west','North-West Stand','Stands'],
  ['north-east','North-East Stand','Stands'],
  ['west','West Stand','Stands'],
  ['east','East Stand','Stands'],
  ['diamond','Diamond Pavilion','Pavilions'],
  ['platinum','Platinum Pavilion','Pavilions'],
  ['gold','Gold Pavilion','Pavilions'],
  ['west-vip','West V.I.P Suites','Suites and lounge'],
  ['east-vip','East V.I.P Suites','Suites and lounge'],
  ['royal-suite','Royal Suite','Suites and lounge'],
  ['royal-lounge','Royal Lounge','Suites and lounge'],
].map(([id,label,group])=>({id,label,group}));

// Zone associations are deliberately empty until event security configures them.
export const emptySeatingConfig = () => ({approved:false, reference:'', areas:[]});
export function seatingError(config, proposal, {required = true} = {}) {
  const selected = proposal.seatingAreas ?? [];
  if(!Array.isArray(selected)||selected.some(id=>typeof id!=='string')||new Set(selected).size!==selected.length)
    return 'Choose valid seating areas without duplicates.';
  const sharjah = proposal.venues?.includes('sharjah');
  const relevant = (proposal.zones || []).filter(z=>['SEC-3','SEC-4'].includes(z));
  if(!selected.length && !(required && sharjah && relevant.length))return '';
  if(!sharjah || !relevant.length)return 'Sharjah seating requires Sharjah venue and approved stand or hospitality access.';
  const plan = config.sharjahSeating;
  if(!plan?.approved || !plan.reference?.trim())return 'Event security must approve the Sharjah seating-to-access mapping first.';
  for(const id of selected){
    const area = plan.areas?.find(a=>a.id===id && a.enabled);
    if(!sharjahSeatingAreas.some(a=>a.id===id)||!area||!relevant.includes(area.zone))return 'A selected seating area is unavailable or outside the proposed access.';
  }
  if(required && relevant.some(zone=>!selected.some(id=>plan.areas.some(a=>a.id===id && a.enabled && a.zone===zone))))
    return 'Select a permitted Sharjah area for each proposed stand or hospitality access code.';
  return '';
}
export function seatingLabels(ids = []) {
  return ids.map(id=>sharjahSeatingAreas.find(a=>a.id===id)?.label).filter(Boolean);
}
export function venueHeading(ids, venues) {
  if(ids.length===2 && ids.includes('sharjah') && ids.includes('dubai'))return 'BOTH VENUES';
  return ids.map(id=>venues.find(v=>v.id===id)?.label || id).join(' · ').toUpperCase();
}
export function seatingScanError(config, snapshot, venue, zone, area) {
  if(venue!=='sharjah')return area ? 'Seating area does not belong to this venue' : '';
  if(!['SEC-3','SEC-4'].includes(zone))return area ? 'Seating area does not belong to this access code' : '';
  if(!snapshot)return 'Seating approval unavailable';
  const invalid = seatingError(config,snapshot);
  if(invalid || (snapshot.seatingMapping || []).some(a=>!config.sharjahSeating.areas.some(x=>x.id===a.id&&x.zone===a.zone&&x.enabled)))return 'Seating approval needs revalidation';
  const mapping = config.sharjahSeating.areas.find(a=>a.id===area&&a.enabled&&a.zone===zone);
  if(!mapping)return 'Choose an enabled seating checkpoint for this access code';
  return snapshot.seatingAreas.includes(area) ? '' : 'Seating area not permitted';
}
