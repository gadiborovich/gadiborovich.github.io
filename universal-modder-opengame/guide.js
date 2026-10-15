(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const tocToggle = $('#toc-toggle');
  const toc = $('.toc');
  if (tocToggle && toc) {
    tocToggle.addEventListener('click', () => {
      const open = toc.classList.toggle('is-open');
      tocToggle.setAttribute('aria-expanded', String(open));
    });
    $$('.toc a').forEach((link) => link.addEventListener('click', () => {
      toc.classList.remove('is-open');
      tocToggle.setAttribute('aria-expanded', 'false');
    }));
  }
  const defaults = { check: 200, 'um-cap': 80, dilution: 50, 'exit-value': 1000 };
  const number = (value, digits = 1) => Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0, maximumFractionDigits: digits,
  });
  const money = (value) => {
    if (value >= 1e9) return `$${number(value / 1e9, 2)}B`;
    if (value >= 1e6) return `$${number(value / 1e6, 2)}M`;
    if (value >= 1e3) return `$${number(value / 1e3, 1)}K`;
    return `$${number(value, 0)}`;
  };
  const percent = (value) => `${number(value * 100, 3)}%`;
  const output = (key, value) => $$(`[data-output="${key}"]`).forEach((el) => {
    el.textContent = value;
  });

  function readValue(id) {
    const input = document.getElementById(id);
    if (!input) return defaults[id];
    const parsed = Number(input.value);
    const min = input.min === '' ? 0 : Number(input.min);
    const max = input.max === '' ? Infinity : Number(input.max);
    return Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : defaults[id]));
  }

  function updateMath() {
    const check = readValue('check') * 1000;
    const umCap = readValue('um-cap') * 1e6;
    const dilution = readValue('dilution');
    const exitValue = readValue('exit-value') * 1e6;
    const retained = 1 - Math.min(100, dilution) / 100;
    const ogInitial = check / 18e6;
    const umInitial = check / umCap;
    const ogFinal = ogInitial * retained;
    const umFinal = umInitial * retained;
    const ogProceeds = ogFinal * exitValue;
    const umProceeds = umFinal * exitValue;
    const values = {
      check: money(check), 'um-cap': money(umCap), dilution: `${number(dilution, 0)}%`,
      'exit-value': money(exitValue), 'og-initial': percent(ogInitial), 'um-initial': percent(umInitial),
      'og-final': percent(ogFinal), 'um-final': percent(umFinal),
      'og-proceeds': money(ogProceeds), 'um-proceeds': money(umProceeds),
      'og-multiple': `${number(ogProceeds / check, 1)}×`,
      'um-multiple': `${number(umProceeds / check, 1)}×`,
      ratio: `${number(umCap / 18e6, 2)}×`,
    };
    Object.entries(values).forEach(([key, value]) => output(key, value));
    const higher = Math.max(ogInitial, umInitial);
    [['og-bar', ogInitial], ['um-bar', umInitial]].forEach(([id, value]) => {
      const bar = document.getElementById(id);
      if (!bar) return;
      bar.style.width = `${higher > 0 ? value / higher * 100 : 0}%`;
      bar.setAttribute('aria-label', `Initial ownership ${percent(value)}`);
    });
  }

  Object.keys(defaults).forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('input', updateMath);
  });
  const reset = $('#reset-math');
  if (reset) reset.addEventListener('click', () => {
    Object.entries(defaults).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.value = value;
    });
    updateMath();
  });
  updateMath();

  const scenarioButtons = $$('button[data-scenario]');
  const scenarioDetail = $('#scenario-detail');
  function showScenario(key, notify = true) {
    const scenario = window.GUIDE_SCENARIOS && window.GUIDE_SCENARIOS[key];
    if (!scenarioDetail || scenario == null) return;
    scenarioButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.scenario === key)));
    if (notify) scenarioDetail.setAttribute('aria-live', 'polite');
    scenarioDetail.replaceChildren();
    if (typeof scenario === 'string') {
      // This is authored local page content, never user or remote input.
      scenarioDetail.innerHTML = scenario;
    } else {
      const title = scenario.title || scenario.heading;
      if (title) {
        const heading = document.createElement('h3');
        heading.textContent = title;
        scenarioDetail.append(heading);
      }
      const paragraphs = Array.isArray(scenario.body) ? scenario.body : [scenario.body];
      paragraphs.filter(Boolean).forEach((text) => {
        const p = document.createElement('p');
        p.textContent = text;
        scenarioDetail.append(p);
      });
      if (scenario.takeaway) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = scenario.takeaway;
        p.append(strong);
        scenarioDetail.append(p);
      }
    }
    scenarioDetail.dataset.scenario = key;
  }
  scenarioButtons.forEach((button) => button.addEventListener('click', () => showScenario(button.dataset.scenario)));
  if (scenarioButtons.length) {
    const initial = scenarioButtons.find((button) => button.getAttribute('aria-pressed') === 'true') || scenarioButtons[0];
    showScenario(initial.dataset.scenario, false);
  }

  const progress = $('#progress');
  const navLinks = $$('.toc a[href^="#"]');
  const chapters = navLinks.map((link) => ({ link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter(({ section }) => section);
  const tableWrappers = $$('.comparison-wrap');
  function updateTableAccess() {
    tableWrappers.forEach((wrapper) => {
      const scrollable = wrapper.scrollWidth > wrapper.clientWidth + 1;
      wrapper.dataset.scrollable = String(scrollable);
      if (scrollable) {
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('role', 'region');
        if (!wrapper.hasAttribute('aria-label') && !wrapper.hasAttribute('aria-labelledby')) {
          const caption = wrapper.querySelector('caption');
          wrapper.setAttribute('aria-label', `${caption ? caption.textContent.trim() : 'Comparison table'}. Scroll horizontally to read all columns.`);
        }
      } else {
        wrapper.removeAttribute('tabindex');
      }
    });
  }

  function revealHashTarget() {
    if (!window.location.hash) return;
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let node = target;
    while (node) {
      if (node.tagName === 'DETAILS') node.open = true;
      node = node.parentElement;
    }
    scheduleReadingUpdate();
  }
  let framePending = false;
  function updateReadingPosition() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
    if (progress) progress.style.width = `${fraction * 100}%`;
    let active = chapters[0];
    chapters.forEach((entry) => {
      if (entry.section.getBoundingClientRect().top <= 150) active = entry;
    });
    if (fraction >= .995 && chapters.length) active = chapters[chapters.length - 1];
    chapters.forEach(({ link }) => {
      const selected = Boolean(active && link === active.link);
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    framePending = false;
  }
  function scheduleReadingUpdate() {
    if (!framePending) {
      framePending = true;
      window.requestAnimationFrame(updateReadingPosition);
    }
  }
  window.addEventListener('scroll', scheduleReadingUpdate, { passive: true });
  window.addEventListener('resize', () => { scheduleReadingUpdate(); updateTableAccess(); });
  window.addEventListener('load', () => { scheduleReadingUpdate(); updateTableAccess(); revealHashTarget(); });
  window.addEventListener('hashchange', revealHashTarget);
  $$('details').forEach((detail) => detail.addEventListener('toggle', () => { scheduleReadingUpdate(); updateTableAccess(); }));
  updateTableAccess();
  revealHashTarget();
  updateReadingPosition();

  let printDetails = [];
  window.addEventListener('beforeprint', () => {
    printDetails = $$('details.deep-dive, .source-list details').filter((detail) => !detail.open);
    printDetails.forEach((detail) => { detail.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printDetails.forEach((detail) => { detail.open = false; });
    printDetails = [];
  });

  const printButton = $('#print');
  if (printButton) printButton.addEventListener('click', () => window.print());
})();
