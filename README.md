# Prerna Pareek weds Shubham Purohit

A colourful Marwari wedding invitation with six separate views: Home, Invitation, Events, Photos, Venue and RSVP. The top navigation becomes a hamburger menu on phones. Bookmarks and browser Back/Forward open the matching view; printing and reading without JavaScript include all sections. Floral effects, a wax-seal letter, a countdown, a photo lightbox, celebration details, a personal event planner and calendar downloads remain available.

**Public preview:** https://hedaprateek.github.io/wedding-celebration/

The public site opens RSVP responses as a WhatsApp draft to **Rahul Pareek, +91 91567 04040**, the bride’s brother. Guests review the message and tap Send themselves. Nothing is sent automatically, and the public site does not store guest records. Guests can also call Rahul or email **rahulpareek3366@gmail.com**. Photos remain clearly labelled as illustrative until family photographs are supplied.

## Open locally

Double-click **start.cmd**, or run `npm start` with Node.js 22 or newer. The invitation opens at **http://localhost:8801**. Keep the terminal open while using it.

The host can review responses at **http://localhost:8801/guest-list**, including party totals, per-event guest counts, search, attendance filters, and CSV export. This page is not linked from the invitation and is restricted to the local preview. Guest data lives in `.data/rsvps.jsonl`, which is never served publicly and is ignored by Git. Back up that folder separately if responses matter.

A fill-in list of the information needed to personalise the invitation is in **DETAILS-NEEDED.md**.

## Details to finalise

Confirmed: **Prerna Pareek and Shubham Purohit**, **1–2 December 2026**, at **Terapanthi Bhavan, D. V. Colony, Secunderabad, Hyderabad**. As confirmed by the family, the bride keeps the surname Pareek and her parents are **Vandana and Sunil Vyas**. Her brother and RSVP contact is **Rahul Pareek**. The Invitation view includes the printed Hindi invitation, both families’ parents and grandparents, and expandable host groups.

| Event | Date | Time (IST) |
| --- | --- | --- |
| Tilak Chhantna | Tuesday, 1 December 2026 | 9:15 am |
| Chak Pujan | Tuesday, 1 December 2026 | 10:15 am |
| Vinayak Pujan | Tuesday, 1 December 2026 | 12:15 pm |
| Maayra | Tuesday, 1 December 2026 | 4:31 pm |
| Sangeet Sandhya | Tuesday, 1 December 2026 | 7:31 pm |
| Haldi | Wednesday, 2 December 2026 | 8:15 am |
| Baraat Swagat | Wednesday, 2 December 2026 | 12:15 pm |
| Phera · Panigrahan Sanskar | Wednesday, 2 December 2026 | 3:15 pm |
| Reception & Pritibhoj | Wednesday, 2 December 2026 | 8:31 pm onwards |

The programme follows the supplied printed invitation, including its precise 4:31 pm, 7:31 pm and 8:31 pm times. Real photos, travel/stay arrangements, any compulsory dress code and an RSVP deadline still need confirmation. No event end times or RSVP deadline have been invented. Directions open a Google Maps search for the supplied venue address.

Edit **site.config.js** to update names, story, events, dress suggestions, venue, directions, family contact, traditional invitation, photos and dates. Include a time-zone offset in every confirmed date; leave an unconfirmed event’s date as `null`. Calendar downloads include all nine confirmed starts and include no end time unless the family supplies one. The sample portraits do not depict Prerna or Shubham.

Restart the preview after changing the configuration so the RSVP backend and invitation use the same event list.

Replace images in `assets/photos/` with the family’s own authorised photos. Keep meaningful alt text. Photo sources are listed in `assets/photos/SOURCES.md`; fonts are served locally. The separate **Stunity Tech — by Prateek** studio credit remains visible on mobile and in print.

## RSVP behaviour

On GitHub Pages, the RSVP form prepares a WhatsApp message with names, attendance, party size, chosen events, song and wish. The confirmation explicitly asks guests to tap Send in WhatsApp; their form stays filled, and a fallback link reopens the draft. Updating an RSVP means messaging or calling Rahul again. No WhatsApp account is used by the site to send messages on a guest’s behalf.

The local Node runtime is separately configured in `runtime.js` to keep the original private RSVP preview available:

- In preview mode, submitting the form saves a preview response locally. The confirmation explicitly says the family has not been notified. No email or WhatsApp message is sent automatically.
- Submitting the same email or phone number updates the previous response. Retrying an identical request does not duplicate guests. Use the same contact format when making an update.
- A decline has zero attending guests. Attending parties must select at least one event and have 1–8 guests. Larger parties should contact the family.
- Guest contact, optional song suggestions and wishes are private. Consent is required. CSV export protects spreadsheet cells from formula execution.
- Guest-list routes are blocked for cross-site requests and for public hosting. No guest names or counts are shown on the public invitation.

## Publish the public preview

The GitHub Actions workflow in `.github/workflows/pages.yml` checks the scripts, runs the tests, and publishes `npm run build` output to GitHub Pages whenever `main` changes. Select **GitHub Actions** as the Pages publishing source in repository settings.

The build creates `dist/` from an explicit list of public files. It excludes `.data`, the local guest-list dashboard, server code, test fixtures and project documents, and replaces `runtime.js` with WhatsApp settings. Without JavaScript, guests can read the complete programme and invitation and use direct WhatsApp, phone and email links. With JavaScript, event planning, calendar downloads, photos, invitation letters and reduced-motion controls are available.

## Optional hosted RSVP storage

The public site currently delivers RSVP drafts through WhatsApp. For a hosted database and owner dashboard instead, use a Node host with persistent private storage or connect a hosted RSVP service: GitHub Pages alone cannot run this server. Confirm the remaining details and replace the illustrative photos before removing the preview setting. Backend email/WhatsApp notifications are not connected.

For Node hosting, set `HOST=0.0.0.0`, `PORT` as required, and `PUBLIC_ORIGIN` to the exact HTTPS address of the invitation, then start `node server.mjs`. Put it behind the host’s HTTPS proxy and preserve `.data` on a private persistent volume. Setting `PUBLIC_ORIGIN` disables the local guest-list dashboard, including all CSV and JSON routes. A hosted owner dashboard should use authentication; this project supplies the local host view instead. Share guest records only with the hosts. Use the host’s private file access to retrieve records on a server.

The invitation supports keyboard navigation and reduced motion, has a “Calm the animations” control, and includes a print layout with the studio credit. RSVP details are not saved in browser storage; only the animation preference and selected event IDs are. The planner is not an RSVP: guests explicitly apply their choices to the form and review/send them in WhatsApp. Local preview responses are saved separately to the private guest list and CSV.

## Verify

`npm run check` validates JavaScript. `npm test` checks all nine printed event times, family/contact details, calendar UTC conversion, WhatsApp draft encoding, public artifact and private RSVP handling. The public artifact excludes host pages and guest data. The local preview, build and all tests use only Node’s built-in modules.
