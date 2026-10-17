// Link-based page navigation keeps bookmarks, Back/Forward and no-JavaScript reading usable.
export function setupNavigation() {
  const pages = [...document.querySelectorAll('.site-page[data-page]')];
  const baseTitle = document.title;
  const labels = {home:'Home',invitation:'Invitation',celebrations:'Events',memories:'Photos',travel:'Venue',rsvp:'RSVP'};
  let lastHash;
  function resolvePage(id) {
    const target = document.getElementById(id);
    const page = target?.closest('.site-page') || pages.find(page => page.dataset.page === id);
    return page ? {target:target || page, page} : null;
  }
  function navigateTo(id, {historyMode='push', focusTarget, focus=true} = {}) {
    const resolved = resolvePage(id) || resolvePage('home');
    const {page,target} = resolved;
    const key = page.dataset.page;
    for (const item of pages) {
      item.hidden = item !== page;
      item.classList.toggle('is-active', item === page);
    }
    document.body.classList.add('has-pages');
    document.querySelector('main').dataset.currentPage = key;
    document.querySelectorAll('#navigation a,.mobile-invitation a').forEach(link => {
      if (resolvePage(link.hash.slice(1))?.page === page) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.title = key === 'home' ? baseTitle : `${labels[key]} · ${baseTitle}`;
    const hash = '#'+(target.id || key);
    if (historyMode !== 'none' && location.hash !== hash) history[historyMode === 'replace' ? 'replaceState' : 'pushState']({page:key},'',hash);
    lastHash = location.hash;
    window.scrollTo({top:0,behavior:'instant'});
    if (!['home','invitation','celebrations','memories','travel','rsvp'].includes(target.id) && target !== page) target.scrollIntoView({behavior:'instant',block:'start'});
    if (focus) {
      const destination = focusTarget || page.querySelector('h1,h2');
      if (destination) {
        if (!focusTarget) destination.tabIndex = -1;
        destination.focus({preventScroll:true});
        if (focusTarget) destination.scrollIntoView({behavior:'instant',block:'center'});
      }
    }
    document.dispatchEvent(new CustomEvent('wedding:page',{detail:{page:key}}));
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download')) return;
    const id = link.hash.slice(1);
    if (!resolvePage(id)) return;
    event.preventDefault();
    navigateTo(id);
  });
  const restore = () => { if (location.hash !== lastHash) navigateTo(location.hash.slice(1),{historyMode:'none'}); };
  addEventListener('popstate',restore);
  addEventListener('hashchange',restore);
  navigateTo(location.hash.slice(1) || 'home',{historyMode:'replace',focus:false});
  return navigateTo;
}
