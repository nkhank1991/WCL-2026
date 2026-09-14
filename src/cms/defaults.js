export const siteIdentity = {
  id: "wcl",
  name: "World Championship of Legends",
  logo: "/assets/wcl-official-logo.png",
  logoAlt: "WCL Season 3",
  favicon: "/favicon.svg",
  copyright: "© 2026 World Championship of Legends",
  tagline: "Built for the love of the game.",
  contactEmail: "info@wclcricket.com",
};
export const mainNavigation = [
  ["matches", "Matches", "/matches"],
  ["teams", "Teams", "/teams"],
  ["players", "Players", "/players"],
  ["news", "News & Updates", "/news"],
  ["videos", "Videos", "/watch"],
  ["tickets", "Ticket info", "/tickets"],
].map(([id, label, to], order) => ({
  id,
  label,
  to,
  primary: id === "tickets",
  visible: true,
  order,
}));
export const footerGroups = [
  {
    id: "tournament",
    title: "The tournament",
    links: [
      ["Season 3", "/season"],
      ["Season 2 · 2025", "/seasons/2"],
      ["Season 1 · 2024", "/seasons/1"],
      ["Fixtures & archive", "/matches"],
    ],
  },
  {
    id: "explore",
    title: "Explore",
    links: [
      ["Our teams", "/teams"],
      ["Season 3 players", "/players"],
      ["News & stories", "/news"],
      ["Videos", "/watch"],
      ["Gallery", "/gallery"],
    ],
  },
  {
    id: "visit",
    title: "Visit WCL",
    links: [
      ["Tickets & venues", "/tickets"],
      ["About the league", "/about"],
      ["Accreditation", "/accreditation"],
      ["Frequently asked questions", "/faq"],
      ["India vs Pakistan", "/india-vs-pakistan"],
      ["Contact us", "/contact"],
    ],
  },
].map((g, order) => ({
  ...g,
  order,
  links: g.links.map(([label, to]) => ({ label, to })),
}));
