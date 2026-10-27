function filterTeam(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('[data-team-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === btn)));
  const cards = document.querySelectorAll('.team-grid .team-card');
  cards.forEach(card => {
    if (category === 'all' || card.dataset.cat === category) {
      card.style.display = '';
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(8px)';
      setTimeout(() => { card.style.display = 'none'; }, 180);
    }
  });
}
document.querySelectorAll('[data-team-filter]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.addEventListener('click', () => filterTeam(button.dataset.teamFilter, button));
});
