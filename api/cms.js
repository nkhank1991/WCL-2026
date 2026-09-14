// Same-origin gateway: browsers never receive the private backend credential.
import builtContent from '../src/data/cms-public.json' with {type:'json'};
import {publicPayload} from '../server/policy.mjs';
export function allowedCmsRoute(path) {
  return /^(status|auth\/(session|login|accept|logout)|public\/(snapshot|content\/[a-z-]+|media\/[a-f0-9]+)|admin\/(publication|audit|content(?:\/[\w:%-]+(?:\/revisions)?)?|media(?:\/[a-f0-9]+)?|staff(?:\/[\w-]+)?))$/.test(
    path,
  );
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const fail = (status, error) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error }));
  };
  if (!["GET", "POST"].includes(req.method))
    return fail(405, "Method not allowed.");
  const incoming = new URL(req.url, "https://www.wclcricket.com");
  const cmsPath = String(
    req.query?.cmsPath || incoming.searchParams.get("cmsPath") || "",
  );
  if (!allowedCmsRoute(cmsPath)) return fail(404, "Not found.");
  if (!process.env.CMS_BACKEND_ORIGIN || !process.env.CMS_PROXY_SECRET) {
    // Until the editorial backend is connected, serve the same reviewed public
    // snapshot used by prerendering. Never substitute it for private admin APIs.
    const collection = cmsPath.match(/^public\/content\/([a-z-]+)$/)?.[1];
    if (req.method === "GET" && collection && Array.isArray(builtContent[collection])) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "public, max-age=60");
      return res.end(JSON.stringify({items: builtContent[collection].map(item => publicPayload(collection, item)), source: "published-build"}));
    }
    return fail(503, "The content service is not connected.");
  }
  try {
    const backend = new URL(process.env.CMS_BACKEND_ORIGIN);
    if (
      backend.protocol !== "https:" ||
      backend.username ||
      backend.password ||
      backend.pathname !== "/"
    )
      return fail(503, "The content service configuration needs review.");
    const target = new URL("/api/" + cmsPath, backend);
    if (incoming.searchParams.has("collection"))
      target.searchParams.set(
        "collection",
        incoming.searchParams.get("collection"),
      );
    const headers = {
      "X-WCL-Proxy-Key": process.env.CMS_PROXY_SECRET,
      "X-WCL-Client-IP": String(
        req.headers["x-vercel-forwarded-for"] ||
          req.socket?.remoteAddress ||
          "unknown",
      ).split(",")[0],
    };
    for (const key of ["cookie", "origin", "x-csrf-token", "content-type"])
      if (req.headers[key]) headers[key] = req.headers[key];
    let body;
    if (req.method === "POST") {
      if (!String(req.headers["content-type"]).includes("application/json"))
        return fail(415, "JSON body required.");
      body =
        typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body || {});
      if (Buffer.byteLength(body) > 3 * 1024 * 1024)
        return fail(
          413,
          "This upload is too large. Choose an image below 2 MB.",
        );
    }
    const response = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: "error",
      signal: AbortSignal.timeout(20000),
    });
    res.statusCode = response.status;
    for (const key of [
      "content-type",
      "set-cookie",
      "referrer-policy",
      "x-frame-options",
    ])
      if (response.headers.has(key))
        res.setHeader(key, response.headers.get(key));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    return fail(
      502,
      "The content service could not be reached. Please try again.",
    );
  }
}
