export const fullNames = config => ({
  bride: [config.couple.first, config.couple.firstSurname].filter(Boolean).join(' '),
  groom: [config.couple.second, config.couple.secondSurname].filter(Boolean).join(' ')
});
export const hasDate = event => Boolean(event.date) && Number.isFinite(Date.parse(event.date));
export function eventDay(event, timezone) {
  if (!hasDate(event)) return 'pending';
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(event.date));
  return ['year','month','day'].map(type => parts.find(part => part.type === type).value).join('-');
}
export function eventWhen(event, timezone) {
  if (!hasDate(event)) return 'Date & time to be decided';
  return new Intl.DateTimeFormat('en-IN', {timeZone:timezone,weekday:'short',day:'numeric',month:'long',hour:'numeric',minute:'2-digit'}).format(new Date(event.date));
}
const stamp = date => new Date(date).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
const escapeCalendar = text => String(text).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
function fold(line) {
  let result = '', length = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (length + size > 73) { result += '\r\n '; length = 1; }
    result += char; length += size;
  }
  return result;
}
export function calendarFile(config, events, now = new Date()) {
  const scheduled = events.filter(hasDate), names = fullNames(config);
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Stunity Tech//Wedding invitation//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  for (const event of scheduled) {
    lines.push('BEGIN:VEVENT',`UID:${event.id}-${stamp(event.date)}@wedding-celebration.local`,`DTSTAMP:${stamp(now)}`,`DTSTART:${stamp(event.date)}`);
    if (event.end && Date.parse(event.end) > Date.parse(event.date)) lines.push(`DTEND:${stamp(event.end)}`);
    lines.push(`SUMMARY:${escapeCalendar(`${event.title} · ${names.bride} & ${names.groom}`)}`,`LOCATION:${escapeCalendar(config.venue.address)}`,`DESCRIPTION:${escapeCalendar(`${event.description}\n${config.venue.note}\nRSVP: ${config.contact.name}, ${config.contact.phone}`)}`,'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return {text:lines.map(fold).join('\r\n')+'\r\n', scheduled:scheduled.length, pending:events.length-scheduled.length};
}
export function whatsappRsvp(config, response) {
  const phone = config.contact.phone.replace(/\D/g,'');
  if (!/^[1-9]\d{7,14}$/.test(phone)) throw Error('An RSVP contact number is needed.');
  const names = fullNames(config), attending = response.attendance === 'yes';
  const lines = [`Hello ${config.contact.name},`,`RSVP for ${names.bride} weds ${names.groom}`,'1 & 2 December 2026 · '+config.city,'',`Name: ${response.name}`,`Contact: ${response.contact}`,`Response: ${attending ? 'Joyfully attending' : 'Sending warm wishes; unable to attend'}`];
  if (attending) {
    lines.push(`Guests: ${response.guests}`,'Celebrations:');
    for (const id of response.events) {
      const event = config.events.find(event => event.id === id);
      if (event) lines.push(`• ${event.title} — ${eventWhen(event, config.timezone)}`);
    }
  }
  if (response.song) lines.push('',`Song suggestion: ${response.song}`);
  if (response.note) lines.push('',`Wish / note: ${response.note}`);
  const text = lines.join('\n');
  return {text, url:`https://wa.me/${phone}?text=${encodeURIComponent(text)}`};
}
