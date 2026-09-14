import React from 'react';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import {AnimatePresence} from 'motion/react';
import {LeaguePages} from './League.jsx';
import {CinematicProvider} from './Cinematic.jsx';
export {publicRoutes,pageMetadata} from './seo/model.js';
export {headTags} from './seo/Seo.jsx';

// The public application itself, not a separate bot-only page.
export function renderPage(pathname) {
  return renderToString(
    <StaticRouter location={pathname}>
      <CinematicProvider staticRender>
        <AnimatePresence initial={false}><LeaguePages/></AnimatePresence>
      </CinematicProvider>
    </StaticRouter>
  );
}
