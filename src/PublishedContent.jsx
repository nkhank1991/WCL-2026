import { useSyncExternalStore } from "react";
import builtContent from "./data/cms-public.json";
// A collection has one shared request and refresh timer, regardless of card count.
// Public build snapshots make the same published content available without JavaScript.
const stores = new Map();
export function refreshPublishedContent() {
  for (const store of stores.values())
    if (store.listeners.size) store.refresh();
}
function collectionStore(key, fallback) {
  if (stores.has(key)) return stores.get(key);
  const store = {
    items: builtContent[key] ?? fallback,
    listeners: new Set(),
    timer: null,
    request: null,
  };
  store.refresh = () => {
    if (store.request) return;
    store.request = fetch("/api/public/content/" + key, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw Error("Unavailable");
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data.items)) return;
        const next = data.items.sort((a, b) => (a.order || 0) - (b.order || 0));
        if (JSON.stringify(next) !== JSON.stringify(store.items)) {
          store.items = next;
          store.listeners.forEach((notify) => notify());
        }
      })
      .catch(() => {})
      .finally(() => {
        store.request = null;
      });
  };
  store.subscribe = (notify) => {
    store.listeners.add(notify);
    if (!store.timer) {
      store.refresh();
      store.timer = setInterval(store.refresh, 60000);
      window.addEventListener("focus", store.refresh);
    }
    return () => {
      store.listeners.delete(notify);
      if (!store.listeners.size) {
        clearInterval(store.timer);
        store.timer = null;
        window.removeEventListener("focus", store.refresh);
      }
    };
  };
  stores.set(key, store);
  return store;
}
export function usePublished(collection, fallback) {
  const store = collectionStore(collection, fallback);
  return useSyncExternalStore(
    store.subscribe,
    () => store.items,
    () => builtContent[collection] ?? fallback,
  );
}
