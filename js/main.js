const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const views = [...document.querySelectorAll('.view')];
const homeLink = document.querySelector('.brand-mark');

const routeMap = {
  '': 'home',
  '#about': 'about',
  '#content': 'content',
  '#engagement': 'engagement',
  '#collaborations': 'collaborations',
  '#brands': 'brands',
  '#packages': 'packages',
  '#contact': 'contact'
};

function updateRoute() {
  const hash = window.location.hash || '';
  const resolvedView = routeMap[hash] || 'home';

  views.forEach(view => {
    const isActive = view.id === resolvedView;
    view.classList.toggle('is-active', isActive);
  });

  navLinks.forEach(link => {
    const target = link.getAttribute('href') || '';
    const isCurrent = target === `#${resolvedView}` || (resolvedView === 'home' && target === '#about');
    link.classList.toggle('is-active', isCurrent);
  });

  if (resolvedView === 'home' && location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

function navigateTo(target) {
  const nextHash = target || '';
  const path = window.location.pathname + window.location.search;

  if (nextHash === '#') {
    history.pushState(null, '', path);
    updateRoute();
    return;
  }

  const nextUrl = nextHash === '' ? path : `${path}${nextHash}`;
  history.pushState(null, '', nextUrl);
  updateRoute();
}

navLinks.forEach(link => {
  const target = link.getAttribute('href') || '';

  link.addEventListener('click', event => {
    event.preventDefault();
    navigateTo(target);
  });
});

if (homeLink) {
  homeLink.addEventListener('click', event => {
    event.preventDefault();
    navigateTo('');
  });
}

window.addEventListener('hashchange', updateRoute);
window.addEventListener('popstate', updateRoute);

updateRoute();
