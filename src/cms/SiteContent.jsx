import { Fragment } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Ticket } from "@phosphor-icons/react";
import { usePublished } from "../PublishedContent.jsx";
import { teams } from "../league-editorial.js";
import { MobileFooterGroup } from "../MobileFooterGroup.jsx";
import { siteIdentity, mainNavigation, footerGroups } from "./defaults.js";

export const useIdentity = () =>
  usePublished("identity", [siteIdentity])[0] || siteIdentity;
export function useTeams() {
  const records = usePublished("teams", teams);
  return teams.map((t) => ({ ...t, ...records.find((r) => r.id === t.id) }));
}
export function WclLogo() {
  const settings = useIdentity();
  return (
    <img
      className="official-wcl-mark"
      src={settings.logo}
      alt={settings.logoAlt || settings.name}
      width="288"
      height="172"
    />
  );
}
export function CmsNavigation() {
  const links = usePublished("navigation", mainNavigation);
  return links
    .filter((l) => l.visible !== false)
    .map((l) => (
      <NavLink
        key={l.id}
        className={l.primary ? "ticket-link" : undefined}
        to={l.to}
      >
        {l.primary && <Ticket />}
        {({Matches:'Fixtures',Videos:'Highlights','Ticket info':'Tickets','News & Updates':'News'})[l.label] || l.label}
      </NavLink>
    ));
}
export function CmsFooter() {
  const groups = usePublished("footer", footerGroups);
  return groups.map((g) => (
    <MobileFooterGroup key={g.id} title={g.title}>
      {g.links
        .filter((l) => l.to?.split(/[?#]/)[0].replace(/\/$/, "") !== "/sitemap")
        .map((l, i) => (
          <Link key={i} to={l.to}>
            {l.label}
          </Link>
        ))}
    </MobileFooterGroup>
  ));
}
export function CmsCopyright() {
  const identity = useIdentity();
  return (
    <>
      <span>{identity.copyright}</span>
      <Link to="/privacy">Privacy & Policies</Link>
      <span>{identity.tagline}</span>
    </>
  );
}
export function usePageCopy(path) {
  return usePublished("pages", []).find((p) => p.path === path);
}
export function CmsPageHeading({ tag, title, children }) {
  const { pathname } = useLocation(),
    page = usePageCopy(pathname);
  // Retire the original repeated introductory copy without modifying CMS drafts.
  // New editorial wording continues to render exactly as published.
  const intro = page?.intro || children;
  const conciseIntro = typeof intro === 'string' ? ({
    'Seven nations. Individual stories. Choose a team to meet its players.': 'Choose your team.',
    'Officially linked highlights from the first two chapters.': 'Highlights from WCL 1 & 2.',
  })[intro] || intro : intro;
  const heading = pathname === '/tickets' && page?.title === 'Your matchday starts here.' ? 'Tickets' : page?.title;
  return (
    <div className="page-title">
      <div className="wrap">
        <p className="kicker">{page?.tag || tag}</p>
        <h1>
          {heading
            ? heading.split("\n").map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))
            : title}
        </h1>
        {conciseIntro && <p>{conciseIntro}</p>}
      </div>
    </div>
  );
}
// Deliberately small, safe rich text: paragraphs, lists, emphasis and links. No HTML.
function inline(text) {
  return String(text)
    .split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g)
    .map((part, i) => {
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && /^(https:\/\/|mailto:|\/(?!\/)|#)/.test(link[2]))
        return (
          <a
            key={i}
            href={link[2]}
            {...(link[2].startsWith("https:")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {link[1]}
          </a>
        );
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      return <Fragment key={i}>{part}</Fragment>;
    });
}
export function RichCopy({ text = "" }) {
  return String(text)
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((block, i) =>
      block.startsWith("- ") ? (
        <ul key={i}>
          {block.split("\n").map((line, j) => (
            <li key={j}>{inline(line.replace(/^- /, ""))}</li>
          ))}
        </ul>
      ) : (
        <p key={i}>{inline(block)}</p>
      ),
    );
}
