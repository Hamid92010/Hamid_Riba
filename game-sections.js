/* Scroll reveals only for the Game Developer page. */
(() => {
  if (!document.body.classList.contains('game-page')) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sections = document.querySelectorAll('.game-page .reveal');
  document.body.classList.add('has-reveal');
  const observer = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
  }, { threshold:0.08, rootMargin:'0px 0px -16px 0px' });
  sections.forEach(el => observer.observe(el));
  // Safety: never hide content indefinitely if browser throttles the observer.
  window.setTimeout(() => sections.forEach(el => el.classList.add('is-visible')), 2400);
})();
