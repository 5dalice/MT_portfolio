const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const views = [...document.querySelectorAll('.view')];
const homeLink = document.querySelector('.brand-mark');

const routeMap = {
  '': 'home',
  '#about': 'about',
  '#content': 'content',
  '#engagement': 'engagement',
  '#packages': 'packages'
};

function updateRoute() {
  const hash = window.location.hash || '';
  const resolvedView = routeMap[hash] || 'home';

  document.body.classList.toggle('is-home', resolvedView === 'home');

  views.forEach(view => {
    view.classList.toggle('is-active', view.id === resolvedView);
  });

  navLinks.forEach(link => {
    const target = link.getAttribute('href') || '';
    const isCurrent = target === `#${resolvedView}`;
    link.classList.toggle('is-active', isCurrent);
  });
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

// Content label filter. All 15 videos are visible by default.
const filterButtons = [...document.querySelectorAll('.filter-button')];
const videoItems = [...document.querySelectorAll('.video-item')];
const archiveTitle = document.querySelector('#archiveTitle');
const archiveCount = document.querySelector('#archiveCount');
const filterLabels = { all:'All work', corsair:'Corsair', hyperx:'HyperX', msi:'MSI', nvidia:'NVIDIA', xpeng:'XPENG' };

function updateArchive(filter = 'all') {
  let visibleCount = 0;
  videoItems.forEach(item => {
    const matches = filter === 'all' || item.dataset.brand === filter;
    item.hidden = !matches;
    if (matches) visibleCount += 1;
  });
  if (archiveTitle) archiveTitle.textContent = filterLabels[filter] || 'All work';
  if (archiveCount) archiveCount.textContent = `${visibleCount} video${visibleCount === 1 ? '' : 's'}`;
  filterButtons.forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

filterButtons.forEach(button => button.addEventListener('click', () => updateArchive(button.dataset.filter)));

updateRoute();
updateArchive('all');
