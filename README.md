# WCL 2026

Public website for the World Championship of Legends, built with React, Vite and a Vercel contact function. The approved canonical address is https://www.wclcricket.com.

## Development

Use Node.js 24. Run `npm ci`, then `npm run dev`. `npm run build` creates the public site in `dist/client`, including 223 prerendered public pages. Run `npm test` after building.

## Release boundaries

This repository contains the public website and optimized artwork only. Private operational databases, accreditation records, credentials, development history and the private administrative API are not included. Administrative interfaces require a separately secured backend and are not operational in this public deployment.

Vercel uses the checked-in `vercel.json`. Production secrets belong in Vercel environment variables, never in source code. The contact form remains unavailable until its email sender, anti-abuse credentials and allowed origins are configured; visitors can use the published contact email meanwhile. Search indexing is opt-in after canonical-domain activation. Media playback remains subject to its publisher.

Website content, fixture data and prerendered metadata are versioned together: rebuild when published content changes. Scores and lineups must not be inferred where verified data is unavailable.

## Assets

WCL and team branding, player photography and third-party media remain subject to their respective rights. Bundled fonts retain their license notices in `public/fonts`. This repository does not grant a license to third-party marks or media.
