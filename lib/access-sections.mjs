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
