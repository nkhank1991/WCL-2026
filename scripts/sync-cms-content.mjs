import { writeFile, readFile } from "node:fs/promises";
import { loadEnv } from "vite";
import { validateManaged } from "../server/cms-content.mjs";
import { managedCollections } from "../src/cms/schema.js";
import { publicPayload } from "../server/policy.mjs";
const env = { ...loadEnv("production", process.cwd(), ""), ...process.env };
const origin = env.CMS_BACKEND_ORIGIN;
if (!origin) {
  console.log(
    "CMS build source not configured; using the checked-in public snapshot.",
  );
} else {
  const url = new URL(origin);
  if (
    url.protocol !== "https:" &&
    !(["localhost", "127.0.0.1"].includes(url.hostname) && env.VERCEL !== "1")
  )
    throw Error("CMS build source requires HTTPS.");
  if (url.username || url.password || url.pathname !== "/" || url.search)
    throw Error(
      "CMS_BACKEND_ORIGIN must be an origin, without credentials or a path.",
    );
  const response = await fetch(new URL("/api/public/snapshot", url), {
    headers: env.CMS_PROXY_SECRET
      ? { "X-WCL-Proxy-Key": env.CMS_PROXY_SECRET }
      : {},
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw Error(
      "CMS snapshot unavailable. Build stopped so stale content is not deployed.",
    );
  const snapshot = await response.json(),
    content = {};
  for (const collection of managedCollections) {
    const rows = snapshot.collections?.[collection];
    if (!Array.isArray(rows))
      throw Error("Incomplete CMS snapshot: " + collection);
    content[collection] = rows.map((row) => {
      validateManaged(collection, row);
      return publicPayload(collection, row);
    });
  }
  // Only explicitly allowlisted, published fields enter the frontend bundle.
  await writeFile(
    new URL("../src/data/cms-public.json", import.meta.url),
    JSON.stringify(content, null, 2) + "\n",
  );
  console.log(
    "Loaded published CMS revision " +
      snapshot.revision +
      " for the website and search pages.",
  );
}
