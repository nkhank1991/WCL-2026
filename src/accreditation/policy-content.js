// Prepared for WCL review. Publication of these drafts is not legal approval.
// No legal entity, provider permission or retention automation is inferred.
export const policyVersion = 'WCL-S3-2026-DRAFT-20260915';
export const policyDate = '15 September 2026';
export const policyPaths = {
  privacy: '/accreditation/privacy',
  terms: '/accreditation/terms',
  storage: '/accreditation/id-policy',
};
export const policyStatus = 'draft';
export const draftNotice = 'Draft for WCL review — not yet in force. Applications and document uploads remain closed.';
export const policyReferences = [
  ['UAE Government: data protection laws','https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws.'],
  ['Render: terms of service','https://render.com/terms'],
  ['Render: persistent disk security and snapshots','https://render.com/docs/disks'],
  ['Vercel: data-processing addendum','https://vercel.com/legal/dpa'],
];
export const policyDocuments = {
  privacy: {
    title: 'Accreditation privacy notice',
    intro: 'How personal information would be used for World Championship of Legends — Season 3, 3–18 October 2026, in the UAE.',
    summary: ['Event accreditation only', 'Human approval of access', 'ID documents never printed'],
    sections: [
      {id:'responsibility',title:'Who is responsible',paragraphs:[
        'This draft covers the WCL Season 3 accreditation application, review, badge production and credential checks. It is separate from the website privacy policy, ticket purchases and any employment or player agreement.',
        'Before this notice takes effect, WCL must identify the registered legal entity acting as data controller, its postal address and its authorised privacy contact. Those details have not been confirmed; “WCL” is the event identity, not a substitute for the legal entity.',
        'Proposed contact: info@wclcricket.com, subject to confirmation that this mailbox handles privacy requests. Do not email passport copies, ID numbers or other identity documents. Quote your application reference when asking about an application.'
      ]},
      {id:'information',title:'Information in an application',paragraphs:[
        'The proposed form collects your full name, optional card name, email, international mobile number, organisation, department, role, team where relevant, portrait, requested days and access areas, assignment and any restricted-access justification. It also records declarations and their version and time.',
        'Where required for a verified role, it requests a nominating contact and assignment evidence. The proposed identity process requests a government photo-ID copy and its reverse where relevant. ID collection is not active: its necessity, permitted hosting route and retention arrangements must first be approved.',
        'The system also records application references, corrections, human decisions, approved access and dates, badge versions, downloads, credential checks and security events. Hosting services process technical information such as connection details. Nomination details may be checked with your named manager or department contact; share their work contact details only with authority.'
      ]},
      {id:'purposes',title:'Why it is needed',paragraphs:[
        'Information is intended to verify the applicant and assignment, assess access requests, manage corrections, prepare an accurate credential, control approved access, prevent misuse and handle accreditation enquiries or incidents. A request does not grant access. PMOA requires a verified eligible role and explicit approval.',
        'This workflow does not subscribe applicants to marketing, sell their information, publish their ID documents, perform automated face recognition or make admission decisions solely by automated profiling. A printer receives the approved badge PDF and queue details, not the ID proof, private contact information or assignment evidence.',
        'WCL must document the applicable lawful basis for each purpose before collection. An acknowledgement that you have read this notice is not, by itself, consent to every use. Where consent is the appropriate basis, the specific use and withdrawal method must be stated separately; any reliance on a contract or legal obligation must be identified and justified. No blanket claim is made that UAE law requires every applicant to upload an ID copy.'
      ]},
      {id:'sharing',title:'Who can see it and where it travels',paragraphs:[
        'Authorised accreditation staff can access records within their assigned role and department. Identity documents are restricted to the Owner and assigned reviewers or approvers. Approved badge information may be used by authorised printers, issuance staff and venue access personnel for their duties. Disclosure to authorities must have a valid legal basis and be limited to what is necessary.',
        'The current website and request gateway use Vercel; the private application database is on Render in Frankfurt, Germany. This is not UAE-only processing: delivery, support, logs and subprocessors may involve other countries. WCL must review the complete provider arrangements and lawful international-transfer mechanism before collection.',
        'Government-ID uploads are blocked pending provider permission. Standard Render terms exclude government identification numbers, and Vercel’s data-processing terms restrict sensitive data. WCL must obtain suitable written arrangements or use a permitted alternative. Encryption or applicant consent alone does not resolve a contractual restriction.'
      ]},
      {id:'retention',title:'Keeping and deleting information',paragraphs:[
        'The proposed retention schedule is in the ID handling policy. It recommends keeping identity and assignment copies for the shortest verification period, separate from the badge and decision record. The proposed periods are operational recommendations, not a statutory retention requirement or a claim that scheduled deletion is already operating.',
        'Currently, unsubmitted staged uploads expire after 30 minutes. The active system periodically removes expired unclaimed files. Automatic deletion of submitted documents, application history, downloaded printer copies and backups is not yet configured. That gap must be resolved before accepting real documents.',
        'A documented legal or security hold may preserve only relevant records for an identified purpose and review period. Backups and downloaded copies require their own deletion controls. A database deletion does not mean every historical copy disappears immediately.'
      ]},
      {id:'rights',title:'Questions, corrections and your rights',paragraphs:[
        'Depending on the applicable law, you may request information about processing, access to your personal data, correction, deletion, restriction, objection, portability or withdrawal of consent where relied upon. These rights can have lawful limits. WCL must provide its confirmed contact and the applicable supervisory complaint route before this draft becomes effective.',
        'Use the private application link for requested corrections. For privacy requests, contact the confirmed privacy team with your application reference; proportionate identity checks may be needed. Do not send further ID documents by ordinary email. Refusing information genuinely necessary for accreditation may prevent review; ask about an approved alternative verification method.',
        'The standard form has not been designed as a child or guardian application. Under-18 applicants should not submit documents until WCL provides an approved safeguarding and guardian process. Necessary processing and requests must not be repurposed for a later season without a fresh justification and notice.'
      ]},
    ],
  },
  terms: {
    title: 'Accreditation event terms',
    intro: 'Proposed conditions for applying for and using a WCL Season 3 accreditation credential.',
    summary: ['Personal and non-transferable', 'Approved areas and dates only', 'Not a spectator ticket'],
    sections: [
      {id:'scope',title:'Event and scope',paragraphs:[
        'These draft conditions relate to World Championship of Legends — Season 3, 3–18 October 2026, at Sharjah Cricket Stadium and Dubai International Cricket Stadium. Match schedules may change. Your credential is valid only for the dates, areas and any venue restrictions expressly approved for you.',
        'Setup, training and operational access are separate approvals. A reference number, submitted form or downloaded draft is not an admission credential. Accreditation does not itself provide a ticket, reserved seat, hospitality benefit, parking, transport, accommodation, employment, visa or permission to play.'
      ]},
      {id:'application',title:'Accurate information and authority',paragraphs:[
        'Provide your correct identity, current role and assignment, and a recent recognisable portrait. Use only documents you are entitled to provide. Obtain authority before giving a manager’s or colleague’s contact details. Do not upload unrelated financial, medical or other sensitive information.',
        'WCL may verify nominations, ask for corrections or additional relevant evidence through an approved channel, approve a narrower request, or reject an application. Tell the accreditation team promptly if your employer, team, role, dates or contact details change. A department or job title selected on the form does not grant access or administrative authority.',
        'ID uploads will remain unavailable until the approved identity-verification method is announced. Do not put ID numbers in remarks, use the portrait field for an ID document, or send an ID copy by email as a workaround.'
      ]},
      {id:'access',title:'Access is explicitly approved',paragraphs:[
        'Use only the areas and dates shown in the current approved credential. The five requested access categories are Broadcast; Media Centre / Photography Area; Stands; Hospitality Area; and PMOA. A checked request box is not permission to enter.',
        'PMOA is the Players and Match Officials Area. Eligibility to request it is limited to players, match officials, team managers and essential team logistics personnel. The Owner must verify the assignment and explicitly clear access. The role label alone is insufficient.',
        'A credential does not override a restricted gate, safety closure, capacity limit, escort requirement or separately notified venue condition. A missing venue assignment is not automatic permission for both venues. Follow lawful instructions from authorised event and venue personnel.'
      ]},
      {id:'credential',title:'Care of your credential',paragraphs:[
        'Your credential is personal and non-transferable. Do not lend, sell, copy, alter or publish its barcode, QR code or private download link. Display it when required and present it for authorised checks. Report loss, theft, damaged artwork or incorrect details promptly.',
        'Only the latest approved version may be issued or used. Replaced, withdrawn, expired or revoked versions are invalid. Printing a card does not activate entry: required identity, issuance and access checks must still be completed. Printers must use approved files without editing names, photographs, dates or permissions.'
      ]},
      {id:'conduct',title:'Conduct, media and safety',paragraphs:[
        'Do not obstruct play or operations, enter areas without permission, misrepresent your assignment, harass others or interfere with security controls. Follow applicable safety and emergency directions. Report an immediate emergency to venue emergency personnel rather than through the application form.',
        'Media or broadcast accreditation is not an unlimited right to film, stream, photograph or commercially exploit event material. Your assignment and any separately agreed media or rights-holder conditions determine those permissions. These accreditation terms do not request a blanket promotional licence over your portrait or ID.'
      ]},
      {id:'decisions',title:'Changes, suspension and review',paragraphs:[
        'WCL may restrict or suspend a credential where an assignment changes, information is materially inaccurate, permission is misused, or lawful safety, security or operational needs require it. A person may request a review or correction through the accreditation team. Where lawful and practicable, the reason and next steps should be explained.',
        'These terms do not exclude liability or remove rights that cannot lawfully be excluded. They are not a waiver of all personal-injury or consumer rights. Any binding jurisdiction, organiser identity or additional venue conditions require WCL’s legal review before publication as effective terms.',
        'The approved version and acknowledgement time will accompany an application. Material changes must be explained and re-acknowledged when required. The website terms, ticket seller’s conditions, employment agreements and approved reverse-side badge wording remain separate; this draft does not replace them automatically.'
      ]},
    ],
  },
  storage: {
    title: 'ID handling & retention policy',
    intro: 'A proposed operating policy for accreditation identity proof, assignment evidence, photographs and credential records.',
    summary: ['Minimum necessary information', 'Role-limited access', 'Documented deletion'],
    sections: [
      {id:'purpose',title:'Purpose and collection limits',paragraphs:[
        'Use identity material only to check an applicant’s identity and role for this event, resolve a relevant correction or investigate documented misuse. It must not become a general personnel archive, marketing list or future-season database.',
        'Before requiring a copy, document why inspection of an original, a verified nomination or a minimal verification record is insufficient. If an approved copy workflow permits redaction, specify which details must remain visible and how unnecessary numbers, machine-readable zones, signatures or addresses can be removed. Do not assume redaction alone resolves the provider contract restriction.',
        'Never place identity documents in public assets, GitHub, badges, analytics, application logs, shared chat or ordinary email. A portrait upload is for the badge portrait, not an ID scan. Do not collect bank details, health records or criminal-history documents through this workflow.'
      ]},
      {id:'controls',title:'Controls already implemented',paragraphs:[
        'Staged files have one-use, time-limited upload references. File type, size and image content are checked; image metadata is stripped. Simple PDFs are limited to five pages and rejected if encrypted or containing forms, active actions, links or attachments. These checks are not a complete malware scan.',
        'Submitted documents are stored as private database files. Only the Owner and assigned reviewers or approvers may retrieve them; access is logged. Printer accounts cannot open them. HTTPS, session controls, role checks and no-store download responses are used. Render documents encryption at rest for its persistent disks and snapshots; this does not establish permission to store every type of data.',
        'The deployed database is in Frankfurt. An isolated backup restoration has been verified, including the document table. No real ID documents were present at verification. A restore test is not a scheduled offsite backup or a guarantee of deletion from historical backups.'
      ]},
      {id:'schedule',title:'Proposed retention schedule',paragraphs:[
        'These periods are recommendations for WCL approval, not legal minimums. They are not yet enabled as an automatic deletion schedule. Shorter periods should be used where the purpose ends earlier.'
      ],rows:[
        ['Unsubmitted staged files','30 minutes; existing expiry and cleanup controls apply.'],
        ['ID and assignment-document copies','Proposed: delete within 30 days after verification or final rejection/withdrawal, and no later than 30 days after the event ends, unless a documented hold applies.'],
        ['Applications, portraits and badge PDFs','Proposed: delete or irreversibly de-identify within 90 days after the event ends; remove printer working copies within 30 days after their approved use ends.'],
        ['Minimal decision and security audit records','Proposed: retain up to 12 months after the event for accountable access decisions and incident handling; exclude document bytes and unnecessary contact details.'],
        ['Backups and restore-test copies','Proposed: controlled rolling expiry, target no more than 35 days, subject to the verified provider limits; reapply recorded deletions before a restored service is reopened.'],
      ]},
      {id:'operations',title:'Handling, deletion and incidents',paragraphs:[
        'An authorised privacy lead must approve retention exceptions and assign a review date. Retain only records relevant to a specific legal obligation, claim or incident. Keep the reason, approver and next review date without duplicating the ID itself.',
        'Deletion must cover current and superseded uploads, correction history, photo copies, badge files, local downloads, database storage, backups and restoration directories. Use a dry-run inventory, obtain the authorised decision, perform deletion and retain a minimal deletion record. Do not promise instant secure erasure from snapshots or storage media.',
        'Reviewers should view documents on managed devices and avoid keeping downloads. Printers must delete local files and securely dispose of spoiled badges. Revoke access immediately when a staff assignment ends. Limit support access and never send a raw ID in a support ticket.',
        'If data is exposed or misused, restrict affected access, preserve necessary evidence, notify the designated privacy/security lead and assess required notifications under the applicable law. Do not assume a universal notification deadline. Only authorised personnel should contact affected applicants or authorities.'
      ]},
      {id:'activation',title:'What must be approved before collection',paragraphs:[
        'Confirm the legal controller and privacy contact, the necessity and lawful basis of ID collection, a provider-permitted upload and storage route, international transfers, document retention and deletion controls, and responsibility for rights requests and incidents. Review whether a formal impact assessment and further safeguards are required.',
        'Existing standard Render terms prohibit government identification numbers. Vercel’s DPA also restricts sensitive data. Obtain appropriate written permission from each provider, or approve an alternative such as in-person ID inspection without retaining a copy. No provider contract has been changed by publishing this draft.',
        'Applications remain closed. This document does not activate storage, create provider permission, approve a legal basis or switch on retention deletion. WCL’s authorised decision and verified technical controls are still required.'
      ]},
    ],
  },
};
