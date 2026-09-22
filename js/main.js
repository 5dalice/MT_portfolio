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
  '#packages': 'packages',
  '#contact': 'contact',
  '#collaborations': 'content',
  '#brands': 'content',
  '#xpeng-case': 'content',
  '#hp-case': 'content'
};

function setCaseState(caseName) {
  caseBlocks.forEach(block => {
    const matches = block.dataset.case === caseName;
    block.classList.toggle('is-visible', matches);
  });
}

function updateRoute() {
  const hash = window.location.hash || '';

  if (hash === '#brands' || hash === '#collaborations') {
    const path = window.location.pathname + window.location.search;
    history.replaceState(null, '', `${path}#content`);
    return updateRoute();
  }

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

  if (activeCase) {
    setCaseState(activeCase);
  } else {
    caseBlocks.forEach(block => {
      const isDefaultVisible = block.dataset.section === 'content' && block.dataset.case === 'xpeng';
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
    const nextHash = targetCase === 'xpeng' ? '#xpeng-case' : targetCase === 'hp' ? '#hp-case' : '#content';
    const path = window.location.pathname + window.location.search;
    history.pushState(null, '', `${path}${nextHash}`);
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
