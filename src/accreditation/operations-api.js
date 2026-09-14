let csrf = "";
export async function operationsApi(route, body) {
  const response = await fetch("/api/operations/" + route, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body === undefined
        ? {}
        : { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw Object.assign(Error(
      result.error ||
        "The service could not complete this request. Please try again.",
    ), {status:response.status});
  }
  if (!response.headers.get("content-type")?.includes("json"))
    return response.blob();
  const result = await response.json();
  if (result.csrf) csrf = result.csrf;
  return result;
}
export function saveDownload(blob, filename) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export const uaeDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        timeZone: "Asia/Dubai",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " UAE"
    : "—";
export const toUaeInput = (value) =>
  value
    ? new Date(Date.parse(value) + 4 * 3600000).toISOString().slice(0, 16)
    : "";
export const fromUaeInput = (value) => new Date(value + "+04:00").toISOString();
