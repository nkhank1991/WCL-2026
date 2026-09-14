export const accreditationRoles = [
  "Owner",
  "Administrator",
  "Reviewer",
  "Approver",
  "Restricted Approver",
  "Print Operator",
  "Issuance Officer",
  "Gate Operator",
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
];
export const restrictedZones = ["SEC-5", "FOP", "DRESS"];
export function workflowConfig(config) {
  return {
    ...config,
    workflowVersion: 1,
    departments: config.departments || departments,
    event: config.event || {
      from: "2026-10-02T20:00:00.000Z",
      to: "2026-10-18T19:59:59.000Z",
      timeZone: "Asia/Dubai",
    },
    activation: config.activation || {
      privacyApproved: false,
      accessApproved: false,
      printApproved: false,
    },
  };
}
export function departmentFor(config, category) {
  return config.departments?.find(
    (d) => d.enabled === true && d.categories.includes(category),
  );
}
