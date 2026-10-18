// Small, optional ways for guests to take part. No personal details go into browser storage.
import {eventWhen, hasDate, fullNames} from './invitation-utils.js';
export function enhanceInvitation({config, downloadCalendar, toast, formatDate, rsvpEnabled = true, navigateTo}) {
  const $ = selector => document.querySelector(selector);
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const calm = () => document.documentElement.dataset.calm === 'true';
  const storageKey = 'wedding-celebration-plan';
  let selected = new Set();
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) selected = new Set(stored.filter(id => config.events.some(event => event.id === id)));
  } catch { /* A guest can still use the planner without storage. */ }
  const selectedEvents = () => config.events.filter(event => selected.has(event.id));
  const dateLabel = event => eventWhen(event, config.timezone);

  function goTo(id, focusTarget) {
    navigateTo(id, {focusTarget});
  }

  function updatePlan() {
    document.querySelectorAll('[data-plan-toggle]').forEach(button => {
      const active = selected.has(button.dataset.planToggle);
      button.setAttribute('aria-pressed', String(active));
      if (!button.classList.contains('plan-remove')) button.textContent = active ? '✓ In my plan' : '＋ Add to my plan';
    });
    const events = selectedEvents();
    $('#plan-events').replaceChildren(...events.map(event => {
      const li = make('li');
      const info = make('div');
      info.append(make('b', '', event.title), make('span', '', dateLabel(event)));
      const remove = make('button', 'plan-remove', '×');
      remove.type = 'button';
      remove.dataset.planToggle = event.id;
      remove.setAttribute('aria-label', `Remove ${event.title} from my plan`);
      remove.setAttribute('aria-pressed', 'true');
      li.append(info, remove);
      return li;
    }));
    $('#plan-empty').hidden = events.length > 0;
    const pending = events.filter(event => !hasDate(event)).length;
    $('#plan-status').textContent = events.length ? `${events.length} celebration${events.length === 1 ? '' : 's'} in your plan.${pending ? ' Events awaiting their timing are not included in calendar downloads.' : ''} This is not an RSVP yet.` : 'No celebrations selected yet.';
    $('#plan-calendar').disabled = !events.some(hasDate);
    $('#plan-rsvp').disabled = !events.length;
    if (!rsvpEnabled) $('#plan-rsvp').textContent = 'Read the RSVP update ↗';
  }
  function togglePlan(id) {
    if (!config.events.some(event => event.id === id)) return;
    const adding = !selected.has(id);
    adding ? selected.add(id) : selected.delete(id);
    try { localStorage.setItem(storageKey, JSON.stringify([...selected])); } catch {}
    updatePlan();
    toast(adding ? 'Added to your plan. Send an RSVP when you’re ready.' : 'Removed from your plan.');
  }
  $('#plan-calendar').addEventListener('click', () => downloadCalendar(selectedEvents()));
  $('#plan-rsvp').addEventListener('click', () => {
    if (!rsvpEnabled) { goTo('rsvp', $('#rsvp-unavailable')); return; }
    const yes = $('input[name=attendance][value=yes]');
    yes.checked = true;
    yes.dispatchEvent(new Event('change', {bubbles:true}));
    document.querySelectorAll('#rsvp-events input').forEach(input => {
      input.checked = selected.has(input.value);
      input.setCustomValidity('');
    });
    $('#rsvp-plan-note').hidden = false;
    goTo('rsvp', $('#guest-name'));
  });

  const letter = $('#invitation-dialog');
  $('#letter-date').textContent = $('#hero-dates').textContent;
  const names = fullNames(config);
  $('#letter-signoff').textContent = `${names.bride}, ${names.groom} & families`;
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
    dressCopy.append(make('p', 'eyebrow', 'A LITTLE OUTFIT INSPIRATION'), make('p', '', event.dress), make('small', '', config.preview ? 'Suggested colours only; the family will confirm the dress code.' : 'An invitation to dress up. Come feeling like yourself.'));
    dress.append(palette, dressCopy);
    const actions = make('div', 'detail-actions');
    const plan = make('button', 'button button-teal');
    plan.type = 'button';
    plan.dataset.planToggle = id;
    const calendar = make('button', 'text-button', hasDate(event) ? 'Save to my calendar ＋' : 'Calendar available once confirmed');
    calendar.type = 'button';
    calendar.disabled = !hasDate(event);
    calendar.addEventListener('click', () => downloadCalendar(event));
    actions.append(plan, calendar);
    content.replaceChildren(icon, make('p', 'eyebrow', event.kind), title, make('p', 'detail-lead', experience.lead), schedule);
    content.append(make('p', 'detail-preview', hasDate(event) ? `All times are in India Standard Time. ${config.venue.name}, ${config.venue.address}.` : 'This event’s date and time are still to be decided.'));
    content.append(highlights, dress);
    if (experience.prompt) content.append(make('p', 'detail-prompt', experience.prompt));
    content.append(actions);
    updatePlan();
    $('#celebration-dialog').showModal();
  }

  document.addEventListener('click', event => {
    const plan = event.target.closest('[data-plan-toggle]');
    if (plan) {
      const wasRemove = plan.classList.contains('plan-remove');
      togglePlan(plan.dataset.planToggle);
      if (wasRemove) {
        const next = $('#plan-events .plan-remove') || $('#plan-title');
        if (next.id === 'plan-title') next.tabIndex = -1;
        next.focus({preventScroll:true});
      }
    }
    const detail = event.target.closest('[data-event-detail]');
    if (detail) openEvent(detail.dataset.eventDetail);
    const close = event.target.closest('[data-close-dialog]');
    if (close) document.getElementById(close.dataset.closeDialog)?.close();
    const letterGo = event.target.closest('[data-letter-go]');
    if (letterGo) { letter.close(); goTo(letterGo.dataset.letterGo); }
    const prompt = event.target.closest('[data-guest-prompt]');
    if (prompt) {
      event.preventDefault();
      goTo('rsvp', rsvpEnabled ? document.getElementById(prompt.dataset.guestPrompt === 'song' ? 'guest-song' : 'guest-note') : $('#rsvp-unavailable'));
    }
  });
  updatePlan();
  document.addEventListener('wedding:events-rendered', updatePlan);

  const hero = $('.hero');
  const petals = make('div', 'hero-petals');
  petals.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 9; i++) petals.append(make('span'));
  hero.prepend(petals);
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => hero.classList.toggle('hero-awake', entries[0].isIntersecting));
    heroObserver.observe(hero);
  } else hero.classList.add('hero-awake');
  const visual = $('.hero-visual');
  const pointer = matchMedia('(hover:hover) and (pointer:fine)');
  let pointerFrame = 0;
  hero.addEventListener('pointermove', event => {
    if (calm() || !pointer.matches) return;
    cancelAnimationFrame(pointerFrame);
    const {clientX, clientY} = event;
    pointerFrame = requestAnimationFrame(() => {
      if (calm()) return;
      const rect = hero.getBoundingClientRect();
      visual.style.setProperty('--parallax-x', `${((clientX - rect.left) / rect.width - .5) * 12}px`);
      visual.style.setProperty('--parallax-y', `${((clientY - rect.top) / rect.height - .5) * 9}px`);
    });
  });
  function resetParallax() {
    cancelAnimationFrame(pointerFrame);
    visual.style.removeProperty('--parallax-x');
    visual.style.removeProperty('--parallax-y');
  }
  hero.addEventListener('pointerleave', resetParallax);
  new MutationObserver(resetParallax).observe(document.documentElement, {attributes:true, attributeFilter:['data-calm']});
}
