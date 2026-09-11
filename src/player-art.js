import reviews from './data/portrait-reviews.json' with {type:'json'};
// Match by player identity, never assign a team's star portrait to another player.
export const campaignPortraits = {
  'australia-davidwarner': '/assets/australia.png',
  'bangladesh-mahmudullahriyad': '/assets/bangladesh.png',
  'england-jamesanderson': '/assets/season3-portraits/james-anderson-v1.webp',
  'bangladesh-shakibalhasan': '/assets/season3-portraits/shakib-al-hasan-v1.webp',
  'south-africa-fafduplessis': '/assets/season3-portraits/faf-du-plessis-v1.webp',
  'west-indies-chadwick-walton': '/assets/west-indies-chadwick-walton-campaign-2026-v1.png',
  'australia-chris-lynn': '/assets/australia-chris-lynn-campaign-2026-v1.png',
  'india-robin-uthappa': '/assets/india-robin-uthappa-campaign-2026-v1.png',
  'south-africa-hardus-viljoen': '/assets/south-africa-hardus-viljoen-campaign-2026-v1.png',
  'england-phil-mustard': '/assets/england-phil-mustard-campaign-2026-v1.png',
  'pakistan-kamran-akmal': '/assets/pakistan-kamran-akmal-campaign-2026-v1.png',
  'west-indies-darren-sammy': '/assets/darren-sammy-campaign-v2.png',
  'west-indies-dwayne-smith': '/assets/dwayne-smith-campaign.png',
  'west-indies-samuel-badree': '/assets/samuel-badree-campaign.png',
  'india-yuvraj-singh': '/assets/india.png',
  'india-suresh-raina': '/assets/suresh-raina-campaign.png',
  'pakistan-shahid-afridi': '/assets/pakistan.png',
  'south-africa-ab-de-villiers': '/assets/south-africa.png',
  'england-moeen-ali': '/assets/england.png',
  'west-indies-chris-gayle': '/assets/chris-gayle-campaign.png',
};
export function withCampaignPortrait(player) {
  const reviewed=reviews[player.id];
  const status=player.portraitReviewStatus||reviewed?.status;
  if(['original','pending','held'].includes(status))return {...player,image:player.headshot||null,profileImage:player.headshot||null,campaign:false};
  const variants=player.portraitVariants||reviewed;
  if(status==='approved'&&variants?.card&&variants?.profile)return {...player,image:variants.card,profileImage:variants.profile,portraitVariants:{card:variants.card,profile:variants.profile},portraitReviewStatus:status,portraitFraming:reviewed?.framing||'headshot',campaign:true};
  const campaign=campaignPortraits[player.id];
  return {...player,image:campaign||player.image,profileImage:campaign||player.image,campaign:Boolean(campaign),portraitFraming:campaign?'campaign':'headshot'};
}
