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
export function whatsappWish(config,response){
  const phone=config.contact.phone.replace(/\D/g,'');
  if(!/^[1-9]\d{7,14}$/.test(phone))throw Error('A family contact number is needed.');
  const lines=['Hello '+config.contact.name+',','Wedding wishes for '+config.couple.first+' & '+config.couple.second,'','With love, from: '+response.name,'Contact: '+response.contact,'','My wishes:',response.note];
  const text=lines.join('\n');return {text,url:'https://wa.me/'+phone+'?text='+encodeURIComponent(text)};
}
