// One field catalogue for the editor and server validation. No raw HTML or scripts.
const field = (key, label, type = "text", extra = {}) => ({
  key,
  label,
  type,
  ...extra,
});
const text = (key, label, extra) => field(key, label, "text", extra);
const copy = (key, label) => field(key, label, "textarea");
const image = (key, label) => field(key, label, "image");
const select = (key, label, options) =>
  field(key, label, "select", { options });
const list = (key, label, fields, max = 40) =>
  field(key, label, "list", { fields, max });
const teamOptions = [
  "india",
  "pakistan",
  "south-africa",
  "australia",
  "england",
  "west-indies",
  "bangladesh",
];
const linkFields = [
  text("label", "Link label"),
  field("to", "Destination", "url"),
];
const facts = field("facts", "Key facts", "pairs", { max: 3 });
const order = field("order", "Display order", "number", { min: 0, max: 1000 });
const visible = field("visible", "Show on website", "boolean");
const season = {
  ...select("season", "Season", ["1", "2", "3"]),
  numeric: true,
};
const editorialSeason = select("season", "Season", [
  "2024",
  "2025",
  "2026",
  "2025 archive",
]);
const team = select("team", "Team", ["", ...teamOptions]);
const url = (key, label) => field(key, label, "url");
export const cmsSchema = {
  hero: {
    label: "Hero slides",
    description: "Homepage imagery, headlines, buttons and key facts.",
    path: "/",
    fields: [
      text("label", "Slide name"),
      text("tag", "Eyebrow"),
      text("title", "Headline"),
      text("line", "Accent headline"),
      copy("copy", "Description"),
      copy("mobileCopy", "Short mobile description"),
      image("image", "Hero image"),
      text("alt", "Image description"),
      text("action", "Primary button"),
      url("to", "Primary destination"),
      text("secondary", "Secondary button"),
      url("secondaryTo", "Secondary destination"),
      facts,
      list(
        "players",
        "Paired portraits",
        [
          text("name", "Player name"),
          text("team", "Team name"),
          image("image", "Portrait"),
        ],
        3,
      ),
      field("videoId", "YouTube video", "youtube"),
      text("role", "Leadership role"),
      copy("supportingCopy", "Supporting paragraph"),
      text("chapter", "Chapter label"),
      url("source", "Source"),
      visible,
      order,
    ],
  },
  news: {
    label: "News & stories",
    description: "Editorial stories and their original sources.",
    path: "/news",
    fields: [
      text("title", "Headline"),
      copy("summary", "Summary"),
      text("category", "Category"),
      team,
      editorialSeason,
      field("publishedAt", "Publication date", "date"),
      text("sourceName", "Source name"),
      url("sourceUrl", "Original article"),
      image("thumbnail", "Article image"),
      text("imageAlt", "Image description"),
      text("imageCredit", "Image credit"),
      select("contentType", "Content type", ["article", "video", "social"]),
      field("featured", "Feature story", "boolean"),
      select("verificationStatus", "Source review", [
        "pending",
        "verified",
        "preview-verified",
      ]),
      order,
    ],
  },
  brands: {
    label: "Partners & brand logos",
    path: "/#wcl-brands",
    fields: [
      text("name", "Brand name"),
      image("image", "Logo"),
      text("association", "Association"),
      text("season", "Season association"),
      text("category", "Category"),
      url("source", "Source"),
      order,
    ],
  },
  leadership: {
    label: "Leadership",
    path: "/about",
    fields: [
      text("name", "Full name"),
      text("role", "Role"),
      image("image", "Photograph"),
      copy("copy", "Biography"),
      facts,
      url("source", "Biography source"),
      order,
    ],
  },
  players: {
    label: "Players",
    path: "/players",
    fields: [
      text("name", "Player name"),
      team,
      text("role", "Playing role"),
      image("headshot", "Original photograph"),
      image("portraitVariants.card", "Card photograph"),
      image("portraitVariants.profile", "Profile photograph"),
      select("portraitReviewStatus", "Photo approval", [
        "original",
        "pending",
        "approved",
        "held",
      ]),
      copy("participation", "Roster note"),
      order,
    ],
  },
  teams: {
    label: "Teams & crests",
    path: "/teams",
    fixed: true,
    fields: [
      text("name", "Team name"),
      text("short", "Short code"),
      field("color", "Team colour", "color"),
      image("logo", "Team crest"),
      image("image", "Featured photograph"),
      text("legend", "Featured player"),
      order,
    ],
  },
  fixtures: {
    label: "Fixtures & results",
    path: "/matches",
    fields: [
      text("label", "Match name"),
      season,
      field("number", "Match number", "number"),
      select("stage", "Stage", ["League", "Knockout", "Semi-final", "Final"]),
      field("teams", "Teams", "multi", { options: teamOptions, max: 2 }),
      field("participants", "Unconfirmed participants", "strings", { max: 2 }),
      text("date", "Display date"),
      text("time", "Display time"),
      text("timeZone", "Time zone"),
      field("startsAt", "Start date & time", "datetime"),
      text("venue", "Venue"),
      select("status", "Match status", [
        "Scheduled",
        "Live",
        "Completed",
        "Archive schedule",
        "Postponed",
        "Cancelled",
      ]),
      select("verificationStatus", "Result verification", [
        "pending",
        "verified",
      ]),
      copy("result", "Verified result"),
      field("scores", "Verified score summaries", "strings", { max: 2 }),
      select("winner", "Winning team (leave blank for a tie or no result)", teamOptions),
      url("scoreSource", "Verified scorecard link"),
      url("source", "Source"),
      text("sourceLabel", "Source label"),
      order,
    ],
  },
  videos: {
    label: "Video library",
    path: "/watch",
    fields: [
      text("title", "Video title"),
      season,
      image("thumbnail", "Thumbnail"),
      url("url", "YouTube link"),
      url("source", "Source page"),
      field("teams", "Teams", "multi", { options: teamOptions, max: 2 }),
      order,
    ],
  },
  tickets: {
    label: "Ticket links",
    path: "/tickets",
    fields: [
      text("label", "Ticket listing"),
      field("matchId", "Match", "record", { collection: "fixtures" }),
      select("availability", "Availability", [
        "coming-soon",
        "on-sale",
        "sold-out",
      ]),
      select("verificationStatus", "Provider verification", [
        "pending",
        "verified",
      ]),
      text("provider", "Authorised provider"),
      url("bookingUrl", "Booking link"),
      text("venue", "Confirmed stadium"),
      text("priceLabel", "Published price"),
      order,
    ],
  },
  identity: {
    label: "Website identity",
    path: "/",
    fixed: true,
    fields: [
      text("name", "Website name"),
      image("logo", "Main WCL logo"),
      text("logoAlt", "Logo description"),
      image("favicon", "Browser icon"),
      text("copyright", "Footer copyright"),
      text("tagline", "Footer tagline"),
      field("contactEmail", "Public contact email", "email"),
    ],
  },
  social: {
    label: "Social media links",
    path: "/",
    fields: [
      text("label", "Account label"),
      select("platform", "Platform", [
        "facebook",
        "instagram",
        "x",
        "youtube",
        "linkedin",
      ]),
      team,
      url("url", "Profile link"),
      visible,
      order,
    ],
  },
  reels: {
    label: "Inside WCL reels",
    path: "/",
    fields: [
      text("title", "Caption"),
      url("sourceUrl", "Instagram Reel or post link"),
      text("sourceName", "Channel name"),
      team,
      editorialSeason,
      select("contentType", "Format", ["video", "social"]),
      image("thumbnail", "Cover image"),
      text("imageAlt", "Cover description"),
      field("publishedAt", "Published date", "date"),
      order,
    ],
  },
  navigation: {
    label: "Main navigation",
    path: "/",
    fields: [
      text("label", "Label"),
      url("to", "Destination"),
      field("primary", "Highlight as ticket action", "boolean"),
      visible,
      order,
    ],
  },
  footer: {
    label: "Footer navigation",
    path: "/",
    fields: [
      text("title", "Group heading"),
      list("links", "Links", linkFields, 16),
      order,
    ],
  },
  pages: {
    label: "Page copy & policies",
    path: "/",
    fixed: true,
    fields: [
      text("path", "Website path"),
      text("title", "Page title"),
      text("tag", "Eyebrow"),
      copy("intro", "Introduction"),
      field("updatedAt", "Last updated", "date"),
      list(
        "sections",
        "Content sections",
        [
          text("id", "Section anchor"),
          text("title", "Heading"),
          copy("body", "Paragraphs and links"),
        ],
        24,
      ),
    ],
  },
  seo: {
    label: "Search & sharing",
    path: "/",
    fields: [
      text("path", "Website path"),
      text("title", "Search title", { maxLength: 160 }),
      copy("description", "Search description"),
      image("image", "Sharing image"),
      text("imageAlt", "Sharing image description"),
      field("noindex", "Keep this page out of search", "boolean"),
    ],
  },
  experience: {
    label: "Motion preferences",
    path: "/",
    fixed: true,
    fields: [
      field("motionEnabled", "Enable decorative motion", "boolean"),
      field("brandMotion", "Allow brand rail movement", "boolean"),
      field("brandDuration", "Brand rail duration (seconds)", "number", {
        min: 80,
        max: 180,
      }),
      field("revealDuration", "Entry duration (seconds)", "number", {
        min: 0.15,
        max: 0.6,
        step: 0.05,
      }),
    ],
  },
};
export const managedCollections = Object.keys(cmsSchema);
export function fieldValue(value, key) {
  return key.split(".").reduce((v, k) => v?.[k], value);
}
export function setField(value, key, next) {
  const result = structuredClone(value);
  const parts = key.split(".");
  let cursor = result;
  for (const part of parts.slice(0, -1)) cursor = cursor[part] ??= {};
  cursor[parts.at(-1)] = next;
  return result;
}
export function newContent(collection, count = 0) {
  const id =
    collection === "videos" ? "" : `${collection}-${Date.now().toString(36)}`;
  const result = { id, order: count };
  for (const f of cmsSchema[collection]?.fields || []) {
    if (f.key.includes(".")) continue;
    result[f.key] =
      f.type === "boolean"
        ? f.key !== "featured" && f.key !== "noindex" && f.key !== "primary"
        : f.type === "number"
          ? (f.min ?? 0)
          : ["list", "multi", "strings", "pairs"].includes(f.type)
            ? []
            : f.type === "select"
              ? f.numeric
                ? Number(f.options[0])
                : f.options[0]
              : "";
  }
  if (collection === "hero")
    Object.assign(result, {
      visible: false,
      facts: [
        ["", ""],
        ["", ""],
        ["", ""],
      ],
      to: "/season",
      secondaryTo: "/matches",
    });
  if (collection === "players") result.portraitReviewStatus = "pending";
  if (collection === "fixtures")
    Object.assign(result, {
      season: 3,
      status: "Scheduled",
      timeZone: "Asia/Dubai",
    });
  result.order = count;
  return result;
}
