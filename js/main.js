const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const views = [...document.querySelectorAll('.view')];
const homeLink = document.querySelector('.brand-mark');
const caseLinks = [...document.querySelectorAll('[data-case-trigger]')];
const caseBlocks = [...document.querySelectorAll('.case-study')];

const routeMap = {
  '': 'home',
  '#about': 'about',
  '#content': 'content',
  '#engagement': 'engagement',
  '#collaborations': 'collaborations',
  '#brands': 'brands',
  '#packages': 'packages',
  '#contact': 'contact',
  '#xpeng-case': 'content',
  '#hp-case': 'collaborations'
};

function setCaseState(caseName) {
  caseBlocks.forEach(block => {
    const matches = block.dataset.case === caseName;
    block.classList.toggle('is-visible', matches);
  });
}

function updateRoute() {
  const hash = window.location.hash || '';
  const resolvedView = routeMap[hash] || 'home';
  const activeCase = hash === '#xpeng-case' ? 'xpeng' : hash === '#hp-case' ? 'hp' : null;

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
    return updateRoute();
  }

  if (activeCase) {
    setCaseState(activeCase);
  } else {
    caseBlocks.forEach(block => {
      const isDefaultVisible = block.dataset.section === 'collaborations' && block.dataset.case === 'xpeng';
      block.classList.toggle('is-visible', isDefaultVisible);
    });
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

caseLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const targetCase = link.dataset.caseTrigger;
    const hash = targetCase === 'xpeng' ? '#xpeng-case' : targetCase === 'hp' ? '#hp-case' : '#content';
    const path = window.location.pathname + window.location.search;
    history.pushState(null, '', `${path}${hash}`);
    updateRoute();
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
