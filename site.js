// ── Progress bar + header scroll ──
document.documentElement.classList.add('has-js');
const progressBar = document.getElementById('progress-bar');
const header = document.getElementById('site-header');
function onScroll() {
  const y = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.width = (docH > 0 ? y / docH * 100 : 0) + '%';
  if (header) header.classList.toggle('scrolled', y > 30);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobile menu ──
const menu = document.getElementById('mobile-menu');
const burgerBtn = document.getElementById('burger-btn');
const closeBtn = document.getElementById('close-menu-btn');
const inertBeforeMenu = new Map();
function setMenuOpen(open) {
  if (!menu || !burgerBtn) return;
  menu.classList.toggle('open', open);
  burgerBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  menu.setAttribute('aria-modal', String(open));
  if (open) {
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', window.cxppT?.('Навигация по сайту') || 'Навигация по сайту');
    for (const child of document.body.children) {
      if (child === menu || ['SCRIPT','STYLE'].includes(child.tagName)) continue;
      inertBeforeMenu.set(child, child.inert); child.inert = true;
    }
    closeBtn?.focus();
  } else {
    for (const [child, value] of inertBeforeMenu) child.inert = value;
    inertBeforeMenu.clear(); burgerBtn.focus();
  }
}
if (burgerBtn) {
  burgerBtn.setAttribute('aria-expanded', 'false');
  burgerBtn.setAttribute('aria-controls', 'mobile-menu');
  burgerBtn.addEventListener('click', () => setMenuOpen(true));
}
if (closeBtn) closeBtn.addEventListener('click', () => setMenuOpen(false));
if (menu) menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.classList.contains('open')) setMenuOpen(false);
  if (event.key === 'Tab' && menu?.classList.contains('open')) {
    const links = [...menu.querySelectorAll('button,a[href]')];
    const first = links[0], last = links.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener('resize', () => {
  if (innerWidth >= 1280 && menu?.classList.contains('open')) setMenuOpen(false);
});
document.querySelectorAll('a.active, #mobile-menu a').forEach(link => {
  if (new URL(link.href).pathname === location.pathname || (location.pathname === '/' && link.getAttribute('href') === 'index.html')) link.setAttribute('aria-current','page');
});

// ── Scroll reveals ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = el.dataset.delay || 0;
    setTimeout(() => el.classList.add('visible'), Number(delay));
    observer.unobserve(el);
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) {
    if (node.nodeType !== 1) continue;
    if (node.matches('[data-reveal]')) observer.observe(node);
    node.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }
}).observe(document.body, {childList:true, subtree:true});

// ── Counter animation ──
function animateCount(el, target, duration) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target; return;
  }
  const start = performance.now();
  const isFloat = String(target).includes('.');
  const step = ts => {
    const p = Math.min((ts - start) / duration, 1);
    const val = Math.round(p * target * 10) / 10;
    el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    if (!isNaN(target)) animateCount(el, target, 1200);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// Mobile-only menu tools reuse the existing destinations and localised labels.
// No elements are added to the desktop DOM; resizing restores the original menu.
(() => {
  if (!menu || !header) return;
  const mobile = window.matchMedia('(max-width: 1023px)');
  let additions = [];
  function updateMobileMenu() {
    if (!mobile.matches) {
      if (additions.length && menu.classList.contains('open')) setMenuOpen(false);
      additions.forEach(node => node.remove());
      additions = [];
      return;
    }
    if (additions.length) return;
    const title = document.createElement('p');
    title.className = 'mobile-menu-title';
    title.textContent = header.querySelector('.logo-text strong')?.textContent || document.title;
    const tools = document.createElement('div');
    tools.className = 'mobile-menu-tools';
    const languages = header.querySelector('.language-switch')?.cloneNode(true);
    const contact = header.querySelector('#cta-btn')?.cloneNode(true);
    if (languages) tools.append(languages);
    if (contact) {
      contact.removeAttribute('id');
      contact.className = 'mobile-menu-contact';
      tools.append(contact);
    }
    const email = document.querySelector('footer a[href^="mailto:"]')?.cloneNode(true);
    if (email) email.className = 'mobile-menu-email';
    menu.prepend(title);
    menu.append(tools);
    if (email) menu.append(email);
    additions = [title, tools, email].filter(Boolean);
    additions.forEach(node => {
      const links = node.matches('a') ? [node] : node.querySelectorAll('a');
      links.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
    });
  }
  updateMobileMenu();
  mobile.addEventListener('change', updateMobileMenu);
})();
