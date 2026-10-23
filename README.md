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

The local and public Wishes forms submit the sender’s name, contact and message to **Rahul’s email through FormSubmit**. Email contacts are also supplied as the reply-to address. Consent and a message are required. No Gmail password or private API key is embedded in the site. Guests can still contact Rahul directly by WhatsApp, phone or email for RSVPs, travel or any other enquiries.

**Recipient activation is required once.** FormSubmit sends Rahul an activation email; he clicks **Activate Form** to enable forwarding. The manual **Check wedding email delivery** GitHub Actions workflow defaults to a connection check. Its **activate** operation submits one clearly labelled setup message to request activation. It does not submit guest wishes or run automatically on pushes. See [FormSubmit’s activation help](https://formsubmit.co/help).

The form preserves the message after submission. It confirms a successful service acknowledgement, shows activation or failure states honestly, and offers prefilled WhatsApp and email-app links if submission is not confirmed. Identical repeated clicks in the same page do not send another accepted request; editing the message allows an update. The public site does not store messages in browser storage. FormSubmit processes the submitted data for email delivery. Opening a local preview does not send anything; submitting its form sends through the same email relay as the public site.

The private local dashboard at **http://localhost:8801/guest-list** preserves earlier preview wishes and RSVP records in **.data/rsvps.jsonl**, with search and CSV export. The old local storage API remains available for those records; the current Wishes form uses email delivery. The dashboard and its API are blocked on public hosting. No guest names, messages or counts are displayed publicly. Back up `.data` separately if its contents matter.

## Publishing and verification

The GitHub Actions workflow checks JavaScript, runs tests, builds and deploys to Pages when `main` changes. Select **GitHub Actions** as the Pages publishing source. `npm run build` creates `dist/` from an explicit list of public files and generates the current itinerary PDF. Server code, the host dashboard, review tools, guest data, setup scripts, tests and project documents are excluded. The generated runtime selects email submission for the public site. The native form also works without JavaScript through FormSubmit’s hosted submission flow.

`npm run check` validates scripts. `npm test` verifies exact event times, PDF generation, email payloads, acknowledgement and activation states, fallbacks, review privacy and concurrency, legacy RSVP storage and the public artifact. Email tests use a stubbed service and send no messages. These tasks use only built-in Node modules. Inbox delivery is confirmed separately after Rahul activates the connection.
