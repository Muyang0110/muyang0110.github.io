const menuButton = document.querySelector('.profile-menu-toggle');
const menu = document.getElementById('myLinks');
menuButton?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
const navigationLinks = [...document.querySelectorAll('.profile-nav a.normal')];
const homeUrl = new URL(document.body.dataset.profileHome, location.href);
const publicationsUrl = new URL(document.body.dataset.publicationsLink, location.href);
const legacyPublicationAnchors = new Set(['#publications', '#cirpe-2026', '#qfd-2024', '#dataset-2025', '#llm-robotics-2025']);
if (location.pathname === homeUrl.pathname && legacyPublicationAnchors.has(location.hash)) {
  publicationsUrl.hash = location.hash === '#publications' ? '' : location.hash;
  location.replace(publicationsUrl.href);
} else if (location.pathname === homeUrl.pathname && location.hash === '#visitors') {
  location.replace(new URL('muyang-visitors/', homeUrl).href);
}
navigationLinks.forEach((link) => link.addEventListener('click', () => {
  menu?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));
navigationLinks.forEach((link) => {
  const url = new URL(link.href);
  if (url.pathname === location.pathname && !url.hash) link.setAttribute('aria-current', 'page');
});
const links = navigationLinks.filter((link) => {
  const url = new URL(link.href);
  return url.pathname === location.pathname && url.hash;
});
if (links.length) {
  const sections = links.map(link => ({ link, target: document.querySelector(link.hash) })).filter(item => item.target);
  const updateCurrentSection = () => {
    let current = sections[0];
    let closestTop = -Infinity;
    for (const item of sections) {
      const top = item.target.getBoundingClientRect().top;
      if (top <= 120 && top > closestTop) { current = item; closestTop = top; }
    }
    links.forEach(link => {
      if (link === current?.link) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; updateCurrentSection(); });
  }, { passive: true });
  window.addEventListener('resize', updateCurrentSection);
  updateCurrentSection();
}
