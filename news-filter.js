// ── Фильтрация по тегам ──────────────────────────────────────────────
(function() {
  const bar = document.getElementById('filter-bar');
  let active = 'all';
  bar.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === active)));

  function applyFilter() {
    document.querySelectorAll('[data-tag]').forEach(el => {
      const match = active === 'all' || el.dataset.tag === active;
      el.classList.toggle('hidden', !match);
    });
  }

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    bar.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    active = btn.dataset.filter;
    applyFilter();
  });

  // добавить теги из динамических новостей в фильтр
  window._applyNewsFilter = applyFilter;
})();
