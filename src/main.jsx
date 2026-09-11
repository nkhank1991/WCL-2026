import React from "react";
import { createRoot } from "react-dom/client";
import { League } from "./League.jsx";
import { CinematicProvider } from "./Cinematic.jsx";
import "./sports.css";
import "./reference-treatment.css";
import "./season3-cinema.css";
import "./hero-electric.css";
import "./campaign-system.css";
import "./social-news.css";
import "./season3-updates.css";
import "./refinement-september.css";
import "./refinement-clean.css";
import "./hero-autoplay.css";
import "./premium-exploration.css";
import "./broadcast.css";
import "./premium-finish.css";
import "./team-score-finish.css";
import "./contact-policy.css";
import "./seo/search-discovery.css";

// Route and section navigation own their scroll position, not stale browser restoration.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

function ClientReady(){
  React.useEffect(()=>{document.getElementById('root').removeAttribute('data-prerendered');document.getElementById('root').dataset.clientReady='true';},[]);
  return null;
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClientReady/>
    <CinematicProvider><League /></CinematicProvider>
  </React.StrictMode>,
);
