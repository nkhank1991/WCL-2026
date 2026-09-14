// Canonical origins and private-route rules remain deployment controlled.
export function applyContentMetadata(
  meta,
  collections = {},
  origin = "https://www.wclcricket.com",
) {
  if (!meta.known || /^\/(admin|api|accreditation)(\/|$)/.test(meta.path))
    return meta;
  const record = collections.seo?.find((r) => r.path === meta.path);
  const identity = collections.identity?.[0];
  const next = { ...meta, graph: structuredClone(meta.graph) };
  if (record) {
    next.title = record.title || meta.title;
    next.description = record.description || meta.description;
    next.image = record.image ? new URL(record.image, origin).href : meta.image;
    next.imageAlt = record.imageAlt || meta.imageAlt;
    if (record.noindex) next.robots = "noindex, follow";
  }
  for (const entity of next.graph["@graph"] || []) {
    if (entity["@id"] === meta.canonical + "#webpage") {
      entity.name = next.title;
      entity.description = next.description;
    }
    if (entity["@type"] === "SportsOrganization" && identity) {
      entity.name = identity.name || entity.name;
      entity.logo = new URL(identity.logo, origin).href;
      entity.email = identity.contactEmail || entity.email;
    }
    if (entity["@type"] === "SportsOrganization" && collections.social)
      entity.sameAs = collections.social
        .filter((r) => !r.team && r.visible !== false)
        .map((r) => r.url);
  }
  return next;
}
