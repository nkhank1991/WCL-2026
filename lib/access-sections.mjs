// Supplied Season 3 section legend. New IDs never reinterpret historical grants.
export const accessSections = [
  ['1', 'Broadcast'],
  ['2', 'Media Centre / Photography Area'],
  ['3', 'Stands'],
  ['4', 'Hospitality Area'],
  ['5', 'PMOA'],
].map(([code, label]) => ({ id: 'SEC-' + code, code, label, enabled: false }));

export function withAccessSections(config) {
  return { ...config, zones: [
    ...accessSections.map(section => ({ ...section, enabled: config.zones.some(z => z.id === section.id && z.enabled === true) })),
    ...config.zones.filter(z => !accessSections.some(section => section.id === z.id)),
  ] };
}

export const sectionLabel = zone => zone.code ? `${zone.code} · ${zone.label}` : zone.label;
export const applicationLink = category => '/accreditation/apply?category=' + encodeURIComponent(category);

export const teamAccessRoles = [
  {id:'team-manager', label:'Team manager'},
  {id:'team-logistics', label:'Essential team logistics'},
  {id:'other', label:'Other team staff'},
];
// Eligibility permits a request only. PMOA still needs verified duties and
// an independent restricted decision; free-text job titles confer no rights.
export function pmoaEligible(category, teamRole = '') {
  return ['player','official'].includes(category) ||
    (category === 'team-staff' && ['team-manager','team-logistics'].includes(teamRole));
}
export function pmoaError(category, teamRole, zones) {
  return zones.includes('SEC-5') && !pmoaEligible(category, teamRole)
    ? 'PMOA is limited to players, match officials, team managers and essential team logistics.'
    : '';
}
