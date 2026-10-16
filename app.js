import config from './site.config.js';
import runtime from './runtime.js';
import {enhanceInvitation} from './experience.js';

const $ = selector => document.querySelector(selector);
const svg = name => { const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); el.setAttribute('aria-hidden', 'true'); const use = document.createElementNS(el.namespaceURI, 'use'); use.setAttribute('href', `#${name}`); el.append(use); return el; };
const make = (tag, className, text) => { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; };
const formatDate = (date, options) => new Intl.DateTimeFormat('en-IN', { timeZone: config.timezone, ...options }).format(new Date(date));
const dateKey = date => { const parts = new Intl.DateTimeFormat('en-CA', {timeZone:config.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(date)); const value = name => parts.find(p => p.type === name).value; return `${value('year')}-${value('month')}-${value('day')}`; };
const safeUrl = value => { try { const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const firstDay = config.events[0].date, lastDay = config.events.at(-1).date;
const daysLabel = `${formatDate(firstDay, {day:'numeric'})} & ${formatDate(lastDay, {day:'numeric',month:'long',year:'numeric'})}`;
const brand = config.couple.second ? `${config.couple.first} & ${config.couple.second}` : `${config.couple.first}’s wedding`;
document.title = `${brand} · ${daysLabel}`;
document.querySelectorAll('[data-brand]').forEach(el => el.textContent = brand);
$('#hero-name').textContent = config.couple.second ? config.couple.first : `${config.couple.first}’s`;
$('#hero-ending').textContent = config.couple.second ? `& ${config.couple.second}` : 'new beginning.';
$('#hero-dates').textContent = daysLabel;
$('#footer-date').textContent = `${daysLabel.toUpperCase()} · A MARWARI CELEBRATION`;
$('#name-note').hidden = Boolean(config.couple.second);
$('#preview-notice').hidden = !config.preview;
$('#schedule-note').hidden = !config.preview;
$('#rsvp-preview-note').hidden = !config.preview;
const rsvpEnabled = runtime.rsvpEnabled !== false;
$('#rsvp-form').hidden = !rsvpEnabled;
$('#rsvp-unavailable').hidden = rsvpEnabled;
$('.guest-participation').hidden = !rsvpEnabled;
if (!rsvpEnabled) $('#rsvp-preview-note').textContent = 'A preview of the celebration. Online RSVPs are not open yet.';
$('#rsvp-deadline').textContent = formatDate(config.rsvpDeadline, {day:'numeric',month:'long',year:'numeric'});
const titleWords = config.story.title.split('. ');
$('#story-title').replaceChildren(document.createTextNode(titleWords[0] + (titleWords.length > 1 ? '.' : '')));
if (titleWords.length > 1) $('#story-title').append(make('em', '', titleWords.slice(1).join('. ')));
$('#story-copy').replaceChildren(...config.story.paragraphs.map(text => make('p', '', text)));
$('.invitation-signoff>span').textContent = config.couple.second ? `${config.couple.first}, ${config.couple.second} & families` : `${config.couple.first} & family`;
$('#venue-name').textContent = config.venue.name;
$('#venue-address').textContent = config.venue.address;
$('#venue-note').textContent = config.venue.note;
if (config.venue.mapsUrl && safeUrl(config.venue.mapsUrl)) { $('#directions-link').href = safeUrl(config.venue.mapsUrl); $('#directions-link').hidden = false; $('#directions-pending').hidden = true; }
if (config.contact.phone || config.contact.email) {
  const contact = $('#contact-note'); contact.replaceChildren();
  if (config.contact.phone) { const a = make('a', '', `${config.contact.name}: ${config.contact.phone}`); a.href = `tel:${config.contact.phone.replace(/[^+\d]/g,'')}`; contact.append(a); }
  if (config.contact.email) { const a = make('a', '', config.contact.email); a.href = `mailto:${config.contact.email}`; if (contact.childNodes.length) contact.append(document.createElement('br')); contact.append(a); }
}

const toggle = $('.menu-toggle');
function closeNavigation(focus = false) { toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); $('#navigation').classList.remove('open'); if (focus) toggle.focus(); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); $('#navigation').classList.toggle('open',open); });
$('#navigation').addEventListener('click', event => { if (event.target.closest('a')) closeNavigation(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeNavigation(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeNavigation(true); });
const sections = [...document.querySelectorAll('main>section[id]')];
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => { const entry = entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]; if (!entry) return; document.querySelectorAll('#navigation a').forEach(a => { if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); }); }, { rootMargin:'-20% 0px -55% 0px',threshold:0 });
  sections.forEach(section=>navObserver.observe(section));
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('ready');observer.observe(el)});
}
let toastTimer;
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(()=>$('#toast').hidden=true,5000); }

const calendarStamp = date => new Date(date).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
const calendarEscape = text => String(text).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
function foldCalendar(line) { let out = '', count = 0; const encoder = new TextEncoder(); for (const char of line) { const size=encoder.encode(char).length; if(count+size>73){out+='\r\n ';count=1}out+=char;count+=size; } return out; }
function downloadCalendar(event) {
  const eventList=Array.isArray(event)?event:[event];
  if(!eventList.length)return;
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Stunity Tech//Wedding invitation//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',...eventList.flatMap(event=>['BEGIN:VEVENT',`UID:${event.id}-${calendarStamp(event.date)}@wedding-invitation.local`,`DTSTAMP:${calendarStamp(new Date())}`,`DTSTART:${calendarStamp(event.date)}`,`DTEND:${calendarStamp(event.end)}`,`SUMMARY:${calendarEscape(`${config.preview?'[Provisional] ':''}${event.title} · ${brand}`)}`,`LOCATION:${calendarEscape(config.venue.address)}`,`DESCRIPTION:${calendarEscape(event.description + (config.preview?'\nProposed timing only. Confirm the year, venue, muhurat and schedule with the family before making plans.':''))}`,'END:VEVENT']),'END:VCALENDAR'];
  const url = URL.createObjectURL(new Blob([lines.map(foldCalendar).join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
  const link=make('a');link.href=url;link.download=eventList.length>1?'wedding-my-celebrations.ics':`wedding-${eventList[0].id}.ics`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(config.preview?'Provisional event downloaded. Please confirm final timings with the family.':'Calendar event downloaded.');
}
document.querySelectorAll('[data-calendar]').forEach(button=>button.addEventListener('click',()=>{const event=config.events.find(e=>e.id===button.dataset.calendar);if(event)downloadCalendar(event)}));
const uniqueDays=[...new Set(config.events.map(event=>dateKey(event.date)))];
document.querySelectorAll('[data-day]:not([data-day=all])').forEach((button,index)=>{button.dataset.day=uniqueDays[index];button.textContent=formatDate(uniqueDays[index]+'T12:00:00+05:30',{day:'numeric',month:'long'});});
function renderEvents(day = 'all') {
  $('#events-grid').replaceChildren(...config.events.filter(event=>day==='all'||dateKey(event.date)===day).map(event=>{
    const article=make('article',`event-card ${event.theme}`);article.dataset.eventId=event.id;article.append(svg(event.icon),make('span','event-kind',event.kind),make('h3','',event.title));article.firstChild.classList.add('event-icon');
    const date=make('time','',`${formatDate(event.date,{day:'numeric',month:'short'})} · ${formatDate(event.date,{hour:'numeric',minute:'2-digit'})}`);date.dateTime=event.date;
    article.append(date,make('p','event-place',`${event.place}${config.preview?' · PROVISIONAL':''}`),make('p','event-description',event.description));
    const dress=make('p','event-dress');dress.append(make('span','','THE DRESS MOOD'),document.createTextNode(event.dress));article.append(dress);
    const actions=make('div','event-actions');const explore=make('button','event-explore','A little look inside ↗');explore.type='button';explore.dataset.eventDetail=event.id;explore.setAttribute('aria-haspopup','dialog');explore.setAttribute('aria-controls','celebration-dialog');const plan=make('button','event-plan-toggle','＋ Add to my plan');plan.type='button';plan.dataset.planToggle=event.id;plan.setAttribute('aria-pressed','false');actions.append(explore,plan);article.append(actions);
    const button=make('button','text-button event-calendar',config.preview?'Save provisional event ＋':'Add to my calendar ＋');button.type='button';button.addEventListener('click',()=>downloadCalendar(event));article.append(button);return article;
  }));
  document.dispatchEvent(new Event('wedding:events-rendered'));
}
renderEvents();
document.querySelectorAll('[data-day]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-day]').forEach(el=>{const active=el===button;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active))});renderEvents(button.dataset.day);}));
function updateCountdown() {
  const diff=Math.max(0,new Date(config.weddingDate).getTime()-Date.now());
  const values=[Math.floor(diff/86400000),Math.floor(diff/3600000)%24,Math.floor(diff/60000)%60,Math.floor(diff/1000)%60];
  ['days','hours','minutes','seconds'].forEach((unit,index)=>$(`#count-${unit}`).textContent=String(values[index]).padStart(2,'0'));
  if(diff===0)$('#countdown-title').textContent='Our wedding day has arrived.';
}
updateCountdown();setInterval(updateCountdown,1000);

let activePhoto=0,visiblePhotos=config.gallery;
function showPhoto(index) { activePhoto=(index+visiblePhotos.length)%visiblePhotos.length;const photo=visiblePhotos[activePhoto];$('#dialog-photo').src=photo.src;$('#dialog-photo').alt=photo.alt;$('#photo-title').textContent=photo.title;$('#photo-next').disabled=$('#photo-previous').disabled=visiblePhotos.length<2; }
function renderPhotos(filter='all') { visiblePhotos=config.gallery.filter(p=>filter==='all'||p.category===filter);$('#gallery-grid').replaceChildren(...visiblePhotos.map(photo=>{const button=make('button','gallery-card');button.type='button';button.setAttribute('aria-label',`Enlarge photograph: ${photo.title}`);const img=make('img');img.src=photo.src;img.alt=photo.alt;img.loading='lazy';img.width=800;img.height=1000;button.append(img,make('span','',photo.title),make('small','','ILLUSTRATIVE PHOTOGRAPH'));button.addEventListener('click',()=>{showPhoto(visiblePhotos.indexOf(photo));$('#photo-dialog').showModal()});return button})); }
renderPhotos();
document.querySelectorAll('[data-photo-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-photo-filter]').forEach(el=>{const active=el===button;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active))});renderPhotos(button.dataset.photoFilter);}));
$('.dialog-close').addEventListener('click',()=>$('#photo-dialog').close());
$('#photo-next').addEventListener('click',()=>showPhoto(activePhoto+1));$('#photo-previous').addEventListener('click',()=>showPhoto(activePhoto-1));
$('#photo-dialog').addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showPhoto(activePhoto+1)}if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(activePhoto-1)}});
$('#photo-dialog').addEventListener('click',event=>{if(event.target===$('#photo-dialog')){const box=event.target.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)event.target.close()}});

const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');let userCalm=false;try{userCalm=localStorage.getItem('wedding-calm')==='true'}catch{}
function applyMotion(){const calm=userCalm||systemMotion.matches;document.documentElement.dataset.calm=String(calm);$('#motion-toggle').textContent=calm?'Animations are calm':'Calm the animations';$('#motion-toggle').setAttribute('aria-pressed',String(calm));}
applyMotion();systemMotion.addEventListener('change',applyMotion);
$('#motion-toggle').addEventListener('click',()=>{if(systemMotion.matches){toast('Your device’s reduced-motion preference is being respected.');return;}userCalm=!userCalm;try{localStorage.setItem('wedding-calm',String(userCalm))}catch{}applyMotion()});
let confettiFrame;
function celebrate() {
  if(document.documentElement.dataset.calm==='true'){toast('Sending a little extra love ♡');return;}
  cancelAnimationFrame(confettiFrame);const canvas=$('#confetti-canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const ratio=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*ratio;canvas.height=innerHeight*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);
  const colours=['#e84e81','#f5bb47','#267760','#bdb1df','#ef824b'];const pieces=Array.from({length:100},()=>({x:innerWidth/2,y:innerHeight*.63,vx:(Math.random()-.5)*16,vy:-6-Math.random()*13,size:3+Math.random()*6,rotation:Math.random()*6,colour:colours[Math.floor(Math.random()*colours.length)]}));const start=performance.now();
  function frame(now){ctx.clearRect(0,0,innerWidth,innerHeight);const elapsed=now-start;for(const piece of pieces){piece.x+=piece.vx;piece.y+=piece.vy;piece.vy+=.13;piece.rotation+=.05;ctx.save();ctx.translate(piece.x,piece.y);ctx.rotate(piece.rotation);ctx.globalAlpha=Math.max(0,1-elapsed/2800);ctx.fillStyle=piece.colour;ctx.fillRect(-piece.size/2,-piece.size/2,piece.size,piece.size*.55);ctx.restore()}if(elapsed<2800&&document.documentElement.dataset.calm!=='true')confettiFrame=requestAnimationFrame(frame);else ctx.clearRect(0,0,innerWidth,innerHeight);}
  confettiFrame=requestAnimationFrame(frame);
}
$('#confetti-button').addEventListener('click',celebrate);

$('#rsvp-events').replaceChildren();
config.events.forEach(event=>{const label=make('label');const input=make('input');input.type='checkbox';input.name='events';input.value=event.id;input.defaultChecked=['wedding','reception'].includes(event.id);input.checked=input.defaultChecked;label.append(input,document.createTextNode(event.title));$('#rsvp-events').append(label);});
const eventInputs=[...document.querySelectorAll('#rsvp-events input')];
function updateAttendance(){const attending=$('input[name=attendance]:checked').value==='yes';$('#attending-fields').hidden=!attending;$('#attending-fields').querySelectorAll('input,select').forEach(el=>el.disabled=!attending);eventInputs.forEach(el=>el.setCustomValidity(''));$('#submit-rsvp').firstChild.textContent=attending?'Send my RSVP ':'Send my warm wishes ';}
document.querySelectorAll('[name=attendance]').forEach(input=>input.addEventListener('change',updateAttendance));eventInputs.forEach(input=>input.addEventListener('change',()=>eventInputs.forEach(el=>el.setCustomValidity(''))));
let lastAttempt;
$('#rsvp-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if (!rsvpEnabled) { toast('Online RSVPs are not open yet. Please wait for the family’s final invitation.'); return; }
  const form=event.currentTarget;const data=new FormData(form);const attending=data.get('attendance')==='yes';
  if(attending&&!data.getAll('events').length){eventInputs[0].setCustomValidity('Please choose at least one celebration.');eventInputs[0].reportValidity();return;}
  if(!form.reportValidity())return;
  const payload={name:String(data.get('name')||'').trim(),contact:String(data.get('contact')||'').trim(),attendance:data.get('attendance'),guests:attending?Number(data.get('guests')):0,events:attending?data.getAll('events'):[],note:String(data.get('note')||'').trim(),song:String(data.get('song')||'').trim(),consent:data.get('consent')==='yes',website:String(data.get('website')||'')};
  if(!payload.name){$('#guest-name').setCustomValidity('Please enter your name.');$('#guest-name').reportValidity();return;}
  const signature=JSON.stringify(payload);if(!lastAttempt||lastAttempt.signature!==signature)lastAttempt={signature,id:crypto.randomUUID()};payload.requestId=lastAttempt.id;
  const status=$('#form-status');status.hidden=false;status.classList.remove('error');status.textContent='Saving your response…';$('#submit-rsvp').disabled=true;
  try{
    const response=await fetch(runtime.rsvpEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw Error(result.error||'We could not save your response. Please try again.');
    status.textContent=result.message;lastAttempt=undefined;form.reset();$('#rsvp-plan-note').hidden=true;updateAttendance();if(attending)celebrate();status.focus({preventScroll:true});
  }catch(error){status.classList.add('error');status.textContent=error.message==='Failed to fetch'||error instanceof SyntaxError?'Your response was not confirmed. Please check your connection and try again.':error.message;status.focus({preventScroll:true});}
  finally{$('#submit-rsvp').disabled=false;}
});
$('#guest-name').addEventListener('input',event=>event.target.setCustomValidity(''));
document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.classList.add('image-unavailable');img.alt+=' · Image currently unavailable';}));
enhanceInvitation({config,downloadCalendar,celebrate,toast,formatDate,rsvpEnabled});
