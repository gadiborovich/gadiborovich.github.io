(() => {
  'use strict';
  const links = Array.from(document.querySelectorAll('.sidebar nav a'));
  const sections = Array.from(document.querySelectorAll('section[id^="slide-"]'));
  const setActive = id => {
    links.forEach(link => {
      if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) setActive(visible[0].target.id);
    }, {rootMargin: '-90px 0px -62% 0px', threshold: 0});
    sections.forEach(section => observer.observe(section));
  }
  links.forEach(link => link.addEventListener('click', () => setActive(link.hash.slice(1))));
  const initial = location.hash.slice(1);
  if (sections.some(section => section.id === initial)) setActive(initial);
  document.getElementById('print-page').addEventListener('click', () => window.print());
})();
