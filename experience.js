// Small, optional ways for guests to take part. No personal details go into browser storage.
import {eventWhen, hasDate} from './invitation-utils.js';
export function enhanceInvitation({config, rsvpEnabled = true, navigateTo}) {
  const $ = selector => document.querySelector(selector);
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const dateLabel=event=>eventWhen(event,config.timezone);
  function goTo(id,focusTarget){navigateTo(id,{focusTarget});}

  const letter = $('#invitation-dialog');
  $('#letter-date').textContent = $('#hero-dates').textContent;
  $('#letter-signoff').textContent = `${config.couple.first}, ${config.couple.second} & families`;
  $('#letter-preview-note').hidden = !config.preview;
  $('.wax-seal').textContent = config.couple.initials || config.couple.first.charAt(0);
  $('#open-invitation').addEventListener('click', () => letter.showModal());
  for (const dialog of [letter, $('#celebration-dialog')]) {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  }

  function openEvent(id) {
    const event = config.events.find(event => event.id === id);
    if (!event) return;
    const experience = config.eventExperiences?.[id] || {lead:event.description, highlights:[], colours:[]};
    const content = $('#celebration-dialog-content');
    content.className = `celebration-detail ${event.theme}`;
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(icon.namespaceURI, 'use');
    use.setAttribute('href', `#${event.icon}`);
    icon.append(use);
    const title = make('h2', '', event.title);
    title.id = 'celebration-dialog-title';
    const schedule = make('div', 'detail-schedule');
    schedule.append(make('b', '', dateLabel(event)), make('span', '', event.place));
    const highlights = make('ul', 'detail-highlights');
    highlights.append(...experience.highlights.map(text => make('li', '', text)));
    const dress = make('div', 'detail-dress');
    const palette = make('div', 'dress-palette');
    palette.setAttribute('aria-hidden', 'true');
    for (const colour of experience.colours) {
      if (!/^#[\da-f]{6}$/i.test(colour)) continue;
      const swatch = make('span');
      swatch.style.backgroundColor = colour;
      palette.append(swatch);
    }
    const dressCopy = make('div');
    dressCopy.append(make('p', 'eyebrow', event.dressCode?'THE DRESS CODE':'A LITTLE OUTFIT INSPIRATION'), make('p', '', event.dressCode||event.dress), make('small', '', event.dressCode?'Dress code confirmed by the family.':'Suggested colours only; the family will confirm the dress code.'));
    dress.append(palette, dressCopy);
    content.replaceChildren(icon, make('p', 'eyebrow', event.kind), title, make('p', 'detail-lead', experience.lead), schedule);
    content.append(make('p', 'detail-preview', hasDate(event) ? `All times are in India Standard Time. ${config.venue.name}, ${config.venue.address}.` : 'This event’s date and time are still to be decided.'));
    content.append(highlights, dress);
    if (experience.prompt) content.append(make('p', 'detail-prompt', experience.prompt));
    $('#celebration-dialog').showModal();
  }

  document.addEventListener('click', event => {
    const detail = event.target.closest('[data-event-detail]');
    if (detail) openEvent(detail.dataset.eventDetail);
    const close = event.target.closest('[data-close-dialog]');
    if (close) document.getElementById(close.dataset.closeDialog)?.close();
    const letterGo = event.target.closest('[data-letter-go]');
    if (letterGo) { letter.close(); goTo(letterGo.dataset.letterGo); }
    const prompt = event.target.closest('[data-guest-prompt]');
    if (prompt) {
      event.preventDefault();
      goTo('rsvp', rsvpEnabled ? $('#guest-note') : $('#rsvp-unavailable'));
    }
  });

  const hero = $('.hero');
  const petals = make('div', 'hero-petals');
  petals.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 9; i++) petals.append(make('span'));
  hero.prepend(petals);
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => hero.classList.toggle('hero-awake', entries[0].isIntersecting));
    heroObserver.observe(hero);
  } else hero.classList.add('hero-awake');
}
