/* First-visit brand intro. The original logo lands in its header position. */
(() => {
  const storageKey = 'cxpp.intro.seen.v1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const previewRequested = new URLSearchParams(location.search).get('intro') === '1';
  if (reducedMotion.matches) return;
  try {
    if (!previewRequested && sessionStorage.getItem(storageKey)) return;
  } catch (_) { /* The intro also works when browser storage is unavailable. */ }

  const root = document.documentElement;
  const style = document.createElement('style');
  style.textContent = `
    html.intro-running { overflow: hidden; }
    .intro-running #site-header .logo-icon img { visibility: hidden; }
    .intro-running .studio-hero-image,
    .intro-running .studio-hero .studio-kicker,
    .intro-running .studio-hero h1,
    .intro-running .studio-hero-bottom,
    .intro-running .studio-caption,
    .intro-running .page-hero .breadcrumb,
    .intro-running .page-hero h1,
    .intro-running .page-hero p { animation-play-state: paused; }
    #site-intro { position: fixed; inset: 0; z-index: 10000; }
    #site-intro-curtain { position: absolute; inset: 0; background: #000; }
    #site-intro-logo {
      position: absolute; left: 50%; top: 50%; width: 156px; height: 88px;
      object-fit: contain; transform: translate(-50%, -50%); opacity: 0;
    }
    #site-intro-skip {
      position: absolute; right: clamp(20px, 3.4vw, 60px); bottom: 24px;
      border: 0; padding: 10px 0; background: none; color: #fff;
      font: 12px/1.4 Arial, sans-serif; cursor: pointer;
    }
    #site-intro-skip:focus-visible { outline: 2px solid #d4ab63; outline-offset: 5px; }
    @media (max-width: 760px) { #site-intro-logo { width: 128px; height: 72px; } }
  `;
  const overlay = document.createElement('div');
  overlay.id = 'site-intro';
  overlay.setAttribute('aria-label', window.cxppT?.('Загрузка сайта') || 'Загрузка сайта');
  const curtain = document.createElement('div');
  curtain.id = 'site-intro-curtain';
  const logo = document.createElement('img');
  logo.id = 'site-intro-logo';
  logo.src = new URL('logo%20main/logo-complete.png', document.currentScript.src).href;
  logo.alt = window.cxppT?.('Союзхимпромпроект') || 'Союзхимпромпроект';
  logo.draggable = false;
  const skip = document.createElement('button');
  skip.id = 'site-intro-skip';
  skip.type = 'button';
  skip.textContent = window.cxppT?.('Пропустить заставку ↗') || 'Пропустить заставку ↗';
  overlay.append(curtain, logo, skip);
  root.classList.add('intro-running');
  document.head.append(style);
  root.append(overlay);

  let finished = false;
  let bodyWasInert = false;
  let bodyLocked = false;
  const animations = [];
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const domReady = document.readyState === 'loading'
    ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
    : Promise.resolve();

  function lockBody() {
    if (finished || !document.body) return;
    bodyWasInert = document.body.inert;
    document.body.inert = true;
    bodyLocked = true;
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(failsafe);
    animations.forEach(animation => animation.cancel());
    const restoreFocus = document.activeElement === skip;
    if (bodyLocked) document.body.inert = bodyWasInert;
    root.classList.remove('intro-running');
    overlay.remove();
    style.remove();
    window.removeEventListener('resize', finish);
    window.removeEventListener('pagehide', finish);
    reducedMotion.removeEventListener('change', onMotionChange);
    try { sessionStorage.setItem(storageKey, '1'); } catch (_) { /* Optional storage. */ }
    if (restoreFocus) document.querySelector('.header-logo')?.focus({ preventScroll: true });
  }

  function onMotionChange(event) { if (event.matches) finish(); }
  skip.addEventListener('click', finish);
  window.addEventListener('resize', finish);
  window.addEventListener('pagehide', finish, { once: true });
  reducedMotion.addEventListener('change', onMotionChange);
  const failsafe = setTimeout(finish, 4500);
  domReady.then(lockBody);

  async function play() {
    await Promise.race([logo.decode().catch(() => {}), delay(800)]);
    if (finished) return;
    if (!logo.naturalWidth || !logo.animate) { finish(); return; }
    const appear = logo.animate(
      [{ opacity: 0, transform: 'translate(-50%, -50%) scale(.92)' },
       { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }],
      { duration: 300, easing: 'ease-out', fill: 'forwards' }
    );
    animations.push(appear);
    await Promise.all([domReady, delay(650)]);
    if (finished) return;
    if (document.fonts) await Promise.race([document.fonts.ready, delay(250)]);
    if (finished) return;
    const target = document.querySelector('#site-header .logo-icon img');
    if (!target) { finish(); return; }
    const start = logo.getBoundingClientRect();
    const end = target.getBoundingClientRect();
    if (!end.width || !end.height) { finish(); return; }
    appear.cancel();
    Object.assign(logo.style, {
      left: start.left + 'px', top: start.top + 'px',
      width: start.width + 'px', height: start.height + 'px',
      transform: 'none', opacity: '1'
    });
    skip.style.visibility = 'hidden';
    const travel = logo.animate([
      { left: start.left + 'px', top: start.top + 'px', width: start.width + 'px', height: start.height + 'px' },
      { left: end.left + 'px', top: end.top + 'px', width: end.width + 'px', height: end.height + 'px' }
    ], { duration: 850, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    animations.push(travel, curtain.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
      { duration: 850, delay: 50, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }
    ));
    await delay(910);
    finish();
  }
  play().catch(finish);
})();
