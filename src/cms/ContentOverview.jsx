import {
  ArrowRight,
  Article,
  Trophy,
  Palette,
  Globe,
} from "@phosphor-icons/react";
import { cmsSchema } from "./schema.js";

const areas = [
  {
    title: "Stories & media",
    icon: Article,
    items: [
      ["hero", "Homepage headlines and imagery"],
      ["news", "Articles, announcements and sources"],
      ["videos", "Highlights and YouTube links"],
      ["reels", "Instagram moments and covers"],
      ["leadership", "People, portraits and biographies"],
    ],
  },
  {
    title: "Cricket",
    icon: Trophy,
    items: [
      ["teams", "Team names, colours and crests"],
      ["players", "Profiles and approved photography"],
      ["fixtures", "Match dates, times and verified results"],
      ["tickets", "Booking information and destinations"],
    ],
  },
  {
    title: "Brand & connections",
    icon: Palette,
    items: [
      ["identity", "WCL logo, favicon and contact details"],
      ["brands", "Partner logos and associations"],
      ["social", "League and team social channels"],
    ],
  },
  {
    title: "Website settings",
    icon: Globe,
    items: [
      ["navigation", "Main menu labels and links"],
      ["footer", "Footer groups and useful links"],
      ["pages", "Page introductions and policies"],
      ["seo", "Search titles and sharing images"],
      ["experience", "Website motion preferences"],
    ],
  },
];

export function ContentOverview({ onChoose }) {
  return (
    <section className="cms-overview" aria-label="Website editing areas">
      <div className="cms-overview-heading">
        <h2>What would you like to update?</h2>
        <p>Choose an area to start. Your edits stay private until published.</p>
      </div>
      <div className="cms-area-grid">
        {areas.map(({ title, icon: Icon, items }) => (
          <section className="cms-area-group" key={title}>
            <h3>
              <Icon size={20} aria-hidden="true" />
              {title}
            </h3>
            {items.map(([key, description]) => (
              <button type="button" key={key} onClick={() => onChoose(key)}>
                <span>
                  <strong>{cmsSchema[key].label}</strong>
                  <small>{description}</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}
