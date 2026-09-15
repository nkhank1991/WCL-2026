import {season3Event,season3Venues,emptySeatingConfig} from './accreditation-venues.mjs';
export const accreditationRoles = [
  "Owner",
  "Administrator",
  "Reviewer",
  "Approver",
  "Restricted Approver",
  "Print Operator",
  "Issuance Officer",
  "Gate Operator",
  "Security Lead",
];
export const departments = [
  ["management", "WCL Management", ["management", "vip"]],
  ["broadcast", "Broadcast", ["broadcast", "temporary-broadcast"]],
  ["teams", "Teams", ["player", "team-staff"]],
  ["officials", "Match Officials", ["official", "acu"]],
  ["media", "Media", ["media", "temporary-media"]],
  ["wcl-media", "WCL Media", ["wcl-media", "temporary-wcl-media"]],
  ["services", "Service Providers", ["vendor", "temporary-vendor"]],
  ["field", "Field of Play", ["field-of-play", "temporary-field"]],
  ["hospitality", "Hospitality", ["pitch-lounge"]],
  ["venues", "Venue Operations", ["venue"]],
].map(([id, label, categories]) => ({ id, label, categories, enabled: false }));
export const statusLabels = {
  review: "New application",
  resubmitted: "Resubmitted",
  corrections: "Correction requested",
  approval: "Awaiting approval",
  approved: "Approved",
  render_failed: "PDF needs attention",
  printed: "Printed · awaiting collection",
  collected: "Issued",
  rejected: "Rejected",
  revoked: "Revoked",
  suspended: "Suspended",
};
export const correctionFields = [
  "name",
  "displayName",
  "email",
  "mobile",
  "organisation",
  "jobTitle",
  "assignment",
  "category",
  "headshot",
  "department", "departmentOther", "roleChoice", "team", "idType", "idDescription", "idHasReverse",
  "idFront", "idBack", "assignmentEvidence", "requestedDays", "requestedZones", "restrictedReason",
  "nominatorName", "nominatorContact", "remarks",
];
export const restrictedZones = ["SEC-5", "FOP", "DRESS"];
export function workflowConfig(config) {
  return {
    ...config,
    workflowVersion: 1,
    venues: config.venues?.length ? config.venues : structuredClone(season3Venues),
    sharjahSeating: config.sharjahSeating || emptySeatingConfig(),
    operationalAccess: config.operationalAccess || {enabled:false, from:'', to:'', reference:''},
    departments: config.departments || departments,
    event: config.event || {...season3Event},
    activation: config.activation || {
      privacyApproved: false,
      accessApproved: false,
      printApproved: false,
    },
  };
}
export function departmentFor(config, category, department) {
  return config.departments?.find(
    (d) => d.enabled === true && d.categories.includes(category) && (!department || d.id===department),
  );
}
