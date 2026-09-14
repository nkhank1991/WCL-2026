import {
  cmsSchema,
  managedCollections,
  fieldValue,
} from "../src/cms/schema.js";
import { publicPayload } from "./policy.mjs";

const reject = (message) => {
  throw Object.assign(new Error(message), { status: 400 });
};
const safeUrl = (value) =>
  typeof value === "string" &&
  /^(https:\/\/[^\s\\]+|\/(?!\/)[^\s\\]*)$/.test(value) &&
  !/[<>"'\u0000-\u001f]/.test(value);
export function validateManaged(collection, payload) {
  const schema = cmsSchema[collection];
  if (!schema) return;
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(payload.id || ""))
    reject("Use letters, numbers and hyphens for the record ID.");
  function fields(definitions, value) {
    for (const f of definitions) {
      const v = fieldValue(value, f.key);
      if (v === undefined || v === null || v === "") continue;
      if (["list", "multi", "strings", "pairs"].includes(f.type)) {
        if (!Array.isArray(v) || v.length > (f.max || 100))
          reject(f.label + " has too many or invalid entries.");
        for (const row of v) {
          if (f.type === "list") {
            if (!row || typeof row !== "object" || Array.isArray(row))
              reject("Invalid " + f.label + " entry.");
            fields(f.fields, row);
          }
          if (f.type === "multi" && !f.options.includes(row))
            reject("Choose a valid " + f.label + ".");
          if (
            f.type === "strings" &&
            (typeof row !== "string" || row.length > 2000)
          )
            reject("Invalid " + f.label + ".");
          if (
            f.type === "pairs" &&
            (!Array.isArray(row) ||
              row.length !== 2 ||
              row.some((x) => typeof x !== "string" || x.length > 300))
          )
            reject("Each fact needs a short value and label.");
        }
      } else if (f.type === "boolean") {
        if (typeof v !== "boolean") reject(f.label + " must be on or off.");
      } else if (f.type === "number") {
        if (
          !Number.isFinite(v) ||
          (f.min !== undefined && v < f.min) ||
          (f.max !== undefined && v > f.max)
        )
          reject("Check " + f.label + ".");
      } else if (f.type === "select") {
        if (!f.options.includes(String(v)))
          reject("Choose a valid " + f.label + ".");
      } else {
        if (
          typeof v !== "string" ||
          v.length > (f.maxLength || (f.type === "textarea" ? 20000 : 2000))
        )
          reject("Check " + f.label + ".");
        if (["url", "image"].includes(f.type) && !safeUrl(v))
          reject(f.label + " must be a secure HTTPS URL or a website path.");
        if (f.type === "color" && !/^#[0-9a-f]{6}$/i.test(v))
          reject("Choose a six-digit team colour.");
        if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
          reject("Use a valid email address.");
        if (f.type === "youtube" && !/^[\w-]{11}$/.test(v))
          reject("Paste a YouTube video link or its 11-character ID.");
        if (
          ["date", "datetime"].includes(f.type) &&
          !Number.isFinite(Date.parse(v))
        )
          reject("Check " + f.label + ".");
      }
    }
  }
  fields(schema.fields, payload);
  const required = {
    brands: ["name", "image"],
    leadership: ["name", "role", "image", "copy"],
    news: [
      "title",
      "summary",
      "category",
      "sourceUrl",
      "sourceName",
      "contentType",
    ],
    identity: ["name", "logo", "logoAlt", "contactEmail"],
    teams: ["name", "short", "color", "logo"],
    social: ["label", "platform", "url"],
    navigation: ["label", "to"],
    footer: ["title"],
    reels: ["title", "sourceUrl", "thumbnail"],
    seo: ["path", "title", "description"],
    pages: ["path", "title"],
    videos: ["title", "url"],
  };
  for (const key of required[collection] || [])
    if (typeof payload[key] !== "string" || !payload[key].trim())
      reject("Complete " + key + " before saving.");
  if (
    collection === "footer" &&
    (!Array.isArray(payload.links) ||
      !payload.links.length ||
      payload.links.some((l) => !l.label || !l.to))
  )
    reject("A footer group needs labelled links and destinations.");
  if (
    collection === "pages" &&
    (payload.sections || []).some(
      (s) => !/^[a-zA-Z][\w-]*$/.test(s.id || "") || !s.title || !s.body,
    )
  )
    reject("Each section needs a unique anchor, heading and text.");
  if (
    collection === "fixtures" &&
    payload.status === "Live" &&
    payload.verificationStatus !== "verified"
  )
    reject("Verify the live match source before showing a Live status.");
  if (collection === "videos" && payload.url) {
    const url = new URL(payload.url);
    const video =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : ["youtube.com", "www.youtube.com"].includes(url.hostname)
          ? url.searchParams.get("v")
          : null;
    if (video !== payload.id)
      reject("The YouTube link must match this video ID.");
  }
  if (
    collection === "teams" &&
    ![
      "india",
      "pakistan",
      "south-africa",
      "australia",
      "england",
      "west-indies",
      "bangladesh",
    ].includes(payload.id)
  )
    reject("Choose one of the seven WCL teams.");
  if (collection === "identity" && payload.id !== "wcl")
    reject("Use the existing website identity record.");
  if (
    ["pages", "seo"].includes(collection) &&
    (!/^\/(?!\/)[\w/-]*$/.test(payload.path || "") ||
      /^\/(admin|api|accreditation)(\/|$)/.test(payload.path))
  )
    reject("Choose a public website path.");
  if (
    collection === "reels" &&
    !/^https:\/\/(www\.)?instagram\.com\/(?:[\w.]+\/)?(?:reel|p)\/[\w-]+\//.test(
      payload.sourceUrl || "",
    )
  )
    reject("Paste the original Instagram Reel or post URL.");
  if (collection === "videos" && !/^[\w-]{11}$/.test(payload.id))
    reject("The video ID must match its YouTube video.");
  if (
    collection === "hero" &&
    (!Array.isArray(payload.facts) || payload.facts.length !== 3)
  )
    reject("A hero slide needs three complete facts.");
  if (
    collection === "pages" &&
    new Set((payload.sections || []).map((s) => s.id)).size !==
      (payload.sections || []).length
  )
    reject("Section anchors must be unique.");
}
export function contentSnapshot(db) {
  const collections = Object.fromEntries(
    managedCollections.map((key) => [key, []]),
  );
  for (const row of db
    .prepare(
      "SELECT collection,published FROM content WHERE published IS NOT NULL",
    )
    .all())
    if (collections[row.collection])
      collections[row.collection].push(
        publicPayload(row.collection, JSON.parse(row.published)),
      );
  for (const items of Object.values(collections))
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
  return {
    revision: Number(
      db.prepare("SELECT value FROM settings WHERE key='cms-revision'").get()
        ?.value || 0,
    ),
    collections,
  };
}
