# Prerna & Shubham’s wedding

A colourful Marwari wedding invitation with six separate views: **Home, Invitation, Events, Photos, Venue and Wishes**. Top navigation becomes a hamburger menu on smaller screens. Bookmarks, browser Back/Forward, keyboard navigation, reduced motion and printing are supported. The invitation includes the printed Hindi family details, a wax-seal letter, floral effects and photo lightboxes.

**Public website:** https://hedaprateek.github.io/wedding-celebration/

## Open locally

Double-click **start.cmd**, or run `npm start` with Node.js 22 or newer. Open **http://localhost:8801** and keep the terminal running. Restart the preview after changing the configuration or server.

## Review the whole website at once

Open **http://localhost:8801/?review=1**. Select **Add a pin**, click an area, and write the change you want. Browse to another tab and repeat. **General note** covers feedback about the whole site. Numbered pins and the list let you return to an area, edit its note or remove it.

Each saved note includes its tab, selected area, event/photo filter and screen size. Notes survive refreshes in private **.data/review-notes.json**, separately from guest messages. Select **Finish review**, then say **“Apply my review notes”** in the coding chat. The agent can read that file in this shared workspace. **Copy all notes** also offers one text report and a Markdown download. Finishing marks the review ready; it does not apply changes automatically.

Review tools are available only on the local preview. They and their notes are excluded from the public artifact. Keep `.data` private; it is ignored by Git.

## Two-day itinerary

The Events tab has one **Download 2-day itinerary** link. The A4 PDF has a page for each day, with all nine ceremonies, precise IST start times, the venue, dress guidance, Rahul’s contact details and a clickable Maps link. It is generated directly from **site.config.js** whenever downloaded locally and on every public build, so future changes update the PDF too.

Dress codes are currently **To be confirmed**. Each event’s `dress` property contains an outfit idea; these are explicitly suggestions. Set `dressCode` to the family’s final code when supplied. The website no longer includes individual calendar downloads, a personal event planner or event-by-event RSVP choices.

## Programme and family

The couple is **Prerna Pareek and Shubham Purohit**, shown by first names in the hero. Bride’s parents: **Vandana and Sunil Vyas**, as printed and confirmed. Brother and contact: **Rahul Pareek, +91 91567 04040, rahulpareek3366@gmail.com**.

All ceremonies are at **Terapanthi Bhavan, D. V. Colony, Secunderabad, Hyderabad, Telangana**. Directions use a Maps search for the supplied address.

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

The programme follows the supplied printed invitation. No event end times have been invented. Edit **site.config.js** to update the family, programme, traditional invitation, venue, dress guidance, photographs and dates. Include the time-zone offset in each confirmed event date.

Real family photos, personal stories, travel/stay arrangements and final dress codes remain to be supplied. Sample portraits are explicitly labelled as illustrative. See **DETAILS-NEEDED.md** for the remaining details and **assets/photos/SOURCES.md** for image sources. Fonts are served locally. The separate **Stunity Tech — by Prateek** studio credit stays visible on mobile, in print and in the itinerary.

## Wishes and family contact

On GitHub Pages, the Wishes form prepares a **WhatsApp draft to Rahul** containing the sender’s name, contact and message. Guests review it and tap Send themselves. Nothing is sent automatically, the form remains filled, and a fallback link can reopen the draft. The public site stores no messages or guest records. Guests can contact Rahul directly by WhatsApp, phone or email for RSVPs, travel or any other enquiries.

The local runtime saves preview wishes privately to **.data/rsvps.jsonl**. Its confirmation explicitly says the family has not been notified. Consent and a message are required. Wishes carry no attendance, guest count or selected events. Repeat messages from the same contact update the previous wish; existing RSVP records are preserved separately, and retrying an identical request does not duplicate a message.

The private local dashboard at **http://localhost:8801/guest-list** includes wishes and any earlier RSVP records, search and CSV export. Wish records do not contribute to attending guest totals. The dashboard and its API are blocked on public hosting. No guest names, messages or counts are displayed publicly. Back up `.data` separately if its contents matter.

## Publishing and verification

The GitHub Actions workflow checks JavaScript, runs tests, builds and deploys to Pages when `main` changes. Select **GitHub Actions** as the Pages publishing source. `npm run build` creates `dist/` from an explicit list of public files and generates the current itinerary PDF. Server code, the host dashboard, review tools, guest data, tests and project documents are excluded. The generated runtime selects WhatsApp drafts for the public site.

`npm run check` validates scripts. `npm test` verifies exact event times, PDF contents and generation, wishes encoding, persistence, retry/update behaviour, review privacy and concurrency, legacy RSVP storage and the public artifact. These tasks use only built-in Node modules.
