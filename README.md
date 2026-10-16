# Prerna’s wedding celebration

A colourful Marwari wedding invitation with an arched photograph, floral illustrations, a wax-seal invitation letter, gentle drifting petals, a live countdown, confetti, a photo lightbox, expandable celebration details, a personal event planner, calendar downloads, and persistent RSVPs. No dependencies or build step are needed.

**Public preview:** https://hedaprateek.github.io/wedding-celebration/

The public preview keeps the draft labels and illustrative photos. Online RSVP collection is not connected: visitors see an explicit update instead of a submission form. The local Node version below still supports private preview RSVPs, song suggestions and wishes.

## Open locally

Double-click **start.cmd**, or run `npm start` with Node.js 22 or newer. The invitation opens at **http://localhost:8801**. Keep the terminal open while using it.

The host can review responses at **http://localhost:8801/guest-list**, including party totals, per-event guest counts, search, attendance filters, and CSV export. This page is not linked from the invitation and is restricted to the local preview. Guest data lives in `.data/rsvps.jsonl`, which is never served publicly and is ignored by Git. Back up that folder separately if responses matter.

A fill-in list of the information needed to personalise the invitation is in **DETAILS-NEEDED.md**.

## Details to finalise

The supplied details are **Prerna**, **1 and 2 December**, and **a Marwari wedding**. The groom’s name is intentionally blank. **2026 is an assumption**, and the proposed ceremony times, RSVP deadline, city, venue, travel, contact details, and photographs still need confirmation. The first day currently proposes haldi/mehendi and sangeet; the second proposes baraat/pheras and dinner. The family should confirm rituals, dates, year and muhurat.

Edit **site.config.js** to update names, story, events, dress suggestions, venue, directions, family contact, photos and dates. Include a time-zone offset in every date. Calendar downloads carry a provisional label while `preview` is `true`. All sample portraits are clearly disclosed as illustrative; they do not depict Prerna.

Restart the preview after changing the configuration so the RSVP backend and invitation use the same event list.

Replace images in `assets/photos/` with the family’s own authorised photos. Keep meaningful alt text. Photo sources are listed in `assets/photos/SOURCES.md`; fonts are served locally. The separate **Stunity Tech — by Prateek** studio credit remains visible on mobile and in print.

## RSVP behaviour

- In preview mode, submitting the form saves a preview response locally. The confirmation explicitly says the family has not been notified. No email or WhatsApp message is sent automatically.
- Submitting the same email or phone number updates the previous response. Retrying an identical request does not duplicate guests. Use the same contact format when making an update.
- A decline has zero attending guests. Attending parties must select at least one event and have 1–8 guests. Larger parties should contact the family.
- Guest contact, optional song suggestions and wishes are private. Consent is required. CSV export protects spreadsheet cells from formula execution.
- Guest-list routes are blocked for cross-site requests and for public hosting. No guest names or counts are shown on the public invitation.

## Publish the public preview

The GitHub Actions workflow in `.github/workflows/pages.yml` checks the scripts, runs the tests, and publishes `npm run build` output to GitHub Pages whenever `main` changes. Select **GitHub Actions** as the Pages publishing source in repository settings.

The build creates `dist/` from an explicit list of public files. It excludes `.data`, the local guest-list dashboard, server code, test fixtures and project documents. It replaces `runtime.js` with the public-preview settings, hides the RSVP form even without JavaScript, and displays “Online RSVPs are not open yet.” Event planning, calendar downloads, photos, invitation letters and reduced-motion controls still work.

## Before collecting real RSVPs

Confirm all details in `site.config.js`, replace the illustrative photos, update the confirmation FAQ copy in `index.html`, and set `preview: false`. Use a Node host with persistent private storage for RSVP collection, or connect a hosted RSVP service: GitHub Pages alone cannot run this server. RSVP notifications are not connected. The Pages build deliberately keeps online submissions unavailable until a real collection arrangement is supplied.

For Node hosting, set `HOST=0.0.0.0`, `PORT` as required, and `PUBLIC_ORIGIN` to the exact HTTPS address of the invitation, then start `node server.mjs`. Put it behind the host’s HTTPS proxy and preserve `.data` on a private persistent volume. Setting `PUBLIC_ORIGIN` disables the local guest-list dashboard, including all CSV and JSON routes. A hosted owner dashboard should use authentication; this project supplies the local host view instead. Share guest records only with the hosts. Use the host’s private file access to retrieve records on a server.

The invitation supports keyboard navigation and reduced motion, has a “Calm the animations” control, and includes a print layout with the studio credit. RSVP details are not saved in browser storage; only the animation preference and selected event IDs are. The planner is not an RSVP: guests explicitly apply their choices to the form and submit it. Song suggestions and wishes are saved with that response and appear in the local guest list and CSV.

## Verify

`npm run check` validates JavaScript. `npm test` runs isolated RSVP fixtures under `tests/fixtures`, covering updates, retries, persistence, contact validation, consent, declines, private routes, origin checks, rate limiting, native submissions and CSV safety. It also checks that the public build includes its required modules and images, hides the RSVP form, and excludes host pages and guest data. The local preview, build and all tests use only Node’s built-in modules.
