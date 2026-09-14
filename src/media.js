// Derivative delivery copies only. Original identity mappings stay untouched.
export const optimisedCampaignSources = new Set([
 '/assets/chris-gayle-campaign.png',
 '/assets/west-indies-chadwick-walton-campaign-2026-v1.png',
 '/assets/west-indies.png','/assets/australia.png','/assets/india.png',
 '/assets/australia-chris-lynn-campaign-2026-v1.png',
 '/assets/india-robin-uthappa-campaign-2026-v1.png',
 '/assets/south-africa.png','/assets/england.png','/assets/pakistan.png','/assets/bangladesh.png',
 '/assets/south-africa-hardus-viljoen-campaign-2026-v1.png',
 '/assets/england-phil-mustard-campaign-2026-v1.png',
 '/assets/pakistan-kamran-akmal-campaign-2026-v1.png',
 '/assets/season3-trophy.png',
]);
export const deliveryImage=source=>optimisedCampaignSources.has(source)?source.replace(/\.png$/,'-web.webp'):source;
export const responsiveCampaign=(source,sizes='(max-width: 700px) 90vw, 600px')=>optimisedCampaignSources.has(source)?{
 srcSet:[480,800].map(width=>source.replace(/\.png$/,`-w${width}.webp`)+` ${width}w`).concat(deliveryImage(source)+(source==='/assets/india.png'?' 1055w':' 1122w')).join(', '),sizes
}:{};
