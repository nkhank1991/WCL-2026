// Draft proposals only. Never use these identifiers as proof of approval.
export const policyPack = Object.freeze({version:'1.0',status:'draft',prepared:'2026-09-15'});
export const retentionDraft = "WCL-S3-RET-001 v1.0. Identity-document copies, any separately captured passport or Emirates ID number, and assignment documents will be deleted from active storage within 30 days after the event ends. Rejected or withdrawn applications will have these documents deleted within 30 days of final closure, or the event-based deadline if earlier, unless a documented appeal or legal hold applies. Application details, portraits and identifiable access logs will be deleted or anonymised within 90 days after the event. Only the minimum verification and administrative audit record will be retained for up to 12 months after the event. Unsubmitted uploads expire after 7 days of inactivity. Deletion includes working copies, trash and access links; provider residual copies follow the contracted deletion cycle. Any exception requires a recorded reason, owner and review date.";
export const approvalTemplates = [
  {
    "title": "Provider arrangements",
    "reference": "WCL-S3-PROV-001 v1.0 | Provider and service: [NAME / SERVICE] | Organisation account: [TENANT OR ACCOUNT IDENTIFIER] | Applicable accepted contract/DPA: [TITLE / VERSION / DATE / LINK] | Government-ID processing scope and relevant clause or written confirmation: [DETAILS] | Upload, review, storage, backup and deletion route: [TECHNICAL RECORD LINK] | Reviewed by: [NAME / ROLE / DATE]."
  },
  {
    "title": "ID handling and retention",
    "reference": "WCL-S3-ID-001 v1.0 and WCL-S3-RET-001 v1.0 | Approved by: [AUTHORISED WCL NAME / ROLE] | Date: [DATE] | Decision/evidence: [RECORD LINK] | Scope: collection, authorised review, access controls, retention, deletion and incident handling."
  },
  {
    "title": "Privacy notice",
    "reference": "WCL-S3-PRIV-001 v1.0 | Controller: [EXACT LEGAL ENTITY] | Privacy contact: [EMAIL] | Lawful-basis assessment: [RECORD LINK] | Provider/region and transfer assessment: WCL-S3-PROV-001 [VERSION / LINK] | Retention: WCL-S3-RET-001 v1.0 | Reviewer and date: [NAME / ROLE / DATE] | Decision: [RECORD LINK]."
  },
  {
    "title": "Event access",
    "reference": "WCL-S3-ACCESS-001 v1.0 | Venues: [CONFIRMED VENUE NAMES] | Zone/gate matrix: [VERSION / RECORD LINK] | Venue/event security approver: [NAME / ROLE] | Additional PMOA authorisation: [AUTHORISED EVENT OFFICIAL / RECORD, WHERE REQUIRED] | Date: [DATE] | Conditions: [DETAILS OR NONE]."
  },
  {
    "title": "Physical print proof",
    "reference": "WCL-S3-PRINT-001 v1.0 | Artwork/template version: [VERSION] | Trim size: 100 x 140 mm | Bleed: 3 mm each side | Full page: 106 x 146 mm | Stock/finish: [PRINTER-CONFIRMED MATERIAL] | Holder/punch: [DETAILS] | Duplex physical proof: [DATE / PHOTO OR PROOF RECORD] | QR scan test: [RESULT / RECORD] | Approved by: [NAME / ROLE / DATE]."
  }
];
export const idUploadHelper = "Upload one clear Emirates ID or passport as instructed. Use the required card side(s) or passport identity page only. We use this to verify your accreditation application. Your ID document and number will not appear on your badge or in its QR code. Authorised reviewers can access the evidence under the ID handling and retention policies.";
export const settingsDeclaration = "I am authorised to save these WCL accreditation settings. I have checked the values, selected only confirmations that are supported by actual decisions or agreements, and recorded their evidence references. I understand that saving draft text does not itself constitute provider permission, venue-security approval, physical print approval or activation of applications.";
