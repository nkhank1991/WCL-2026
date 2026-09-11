export const SITE_ORIGIN = 'https://www.wclcricket.com';
// Only these non-secret values may be serialized into the browser bundle.
export function publicSeoConfig(env = {}) {
  return {
    origin: SITE_ORIGIN,
    indexable: env.SEO_INDEXABLE === 'true' && (!env.VERCEL_ENV || env.VERCEL_ENV === 'production'),
    googleVerification: env.GOOGLE_SITE_VERIFICATION || '',
    bingVerification: env.BING_SITE_VERIFICATION || '',
  };
}
export const seoConfig = typeof __WCL_SEO__ === 'undefined' ? publicSeoConfig() : __WCL_SEO__;
export function canonicalPath(value = '/') {
  try {
    const path = new URL(value, SITE_ORIGIN).pathname.replace(/\/+$/, '');
    return path || '/';
  } catch { return '/'; }
}
export const absoluteUrl = path => new URL(path, SITE_ORIGIN).href;
export const jsonForHtml = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
