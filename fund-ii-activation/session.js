'use strict';

const filters = { lps: 'all', puentes: 'all', warm: 'all' };
const groupSections = {
  lps: [
    { categories: ['core'], title: 'Core invitations', note: '19 LP relationships' },
    { categories: ['outside'], title: 'Outside this core pass', note: 'Preparation retained for later' }
  ],
  warm: [
    { categories: ['developing'], title: 'Working list', note: 'Approach still to be determined' }
  ],
  puentes: [
    { categories: ['current'], title: 'Current relationship threads', note: 'Pick up where we left off' },
    { categories: ['dinner', 'fireside'], title: 'Selected email drafts', note: '12 invitations · 18 people' },
    { categories: ['candidate'], title: 'Proposed addition', note: 'Choose whether to include' }
  ]
};
let people = [];
let toastTimer;

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

// Only the links and paragraph/list formatting used in the prepared drafts.
// Source text is escaped; neither HTML nor arbitrary URL protocols are rendered.
function inline(text) {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>]+)/g;
  let result = '', cursor = 0;
  for (const match of text.matchAll(pattern)) {
    result += escapeHTML(text.slice(cursor, match.index));
    let url = match[2] || match[3];
    const suffix = !match[2] && /[.,;!]$/.test(url) ? url.slice(-1) : '';
    if (suffix) url = url.slice(0, -1);
    const label = match[1] || url;
    result += `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>${suffix}`;
    cursor = match.index + match[0].length;
  }
  return result + escapeHTML(text.slice(cursor));
}

function markdown(text) {
  return text.split(/\n\s*\n/).map(block => {
    const lines = block.split('\n');
    if (lines.every(line => /^- /.test(line))) return `<ul>${lines.map(line => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

function card(person) {
  const detail = document.createElement('details');
  detail.className = 'person';
  detail.id = person.id;
  detail.dataset.group = person.group;
  detail.dataset.category = person.category;
  detail.innerHTML = `
    <summary><span><span class="person-name">${escapeHTML(person.name)}</span><span class="person-summary">${escapeHTML(person.summary)}</span></span><span class="summary-meta"><span class="channel">${escapeHTML(person.channel)}</span><span class="plus" aria-hidden="true">+</span></span></summary>
    <div class="person-content">
      <div class="person-meta"><p class="route">${escapeHTML(person.channel)} · ${escapeHTML(person.route)}</p><button type="button" class="link-button" aria-label="Copy link to ${escapeHTML(person.name)}">Link to this entry ↗</button></div>
      <div class="context"><span class="micro">${escapeHTML(person.contextLabel || 'Relationship / latest')}</span><p>${escapeHTML(person.context)}</p></div>
      ${person.caution ? `<p class="caution">${escapeHTML(person.caution)}</p>` : ''}
      ${person.planningNote ? `<div class="shared-note"><span class="micro">Possible approach · not chosen</span><p>${escapeHTML(person.planningNote)}</p></div>` : ''}
      ${person.drafts.map((draft, i) => `<div class="draft"><div class="draft-header"><span class="micro">${escapeHTML(draft.label)} · ${draft.sentOn ? `sent ${escapeHTML(draft.sentOn)}` : 'unsent'}</span><button type="button" class="copy-button" data-draft="${i}" aria-label="Copy ${escapeHTML(draft.label.toLowerCase())} for ${escapeHTML(person.name)}">Copy text</button></div>${i === 0 && person.subject ? `<p class="draft-subject"><span>Subject</span>${escapeHTML(person.subject)}</p>` : ''}<div class="draft-body">${markdown(draft.text)}</div></div>`).join('')}
      <div class="next-step"><span class="micro">${escapeHTML(person.nextLabel || 'What follows')}</span><p>${escapeHTML(person.next)}</p></div>
      ${person.sources.length ? `<div class="sources">${person.sources.map(source => `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.label)} ↗</a>`).join('')}</div>` : ''}
    </div>`;
  detail.querySelector('.link-button').addEventListener('click', () => copy(`${location.origin}${location.pathname}#${person.id}`, 'Entry link copied'));
  detail.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', () => {
      const draft = person.drafts[Number(button.dataset.draft)];
      const plain = draft.text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)');
      copy(plain, draft.sentOn ? 'Sent email copied' : 'Draft copied — nothing sent', button);
    });
  });
  detail.addEventListener('toggle', () => updateExpandControl(person.group));
  return detail;
}

function render() {
  for (const group of Object.keys(groupSections)) {
    const container = document.getElementById(`${group}-roster`);
    container.replaceChildren();
    for (const section of groupSections[group]) {
      const block = document.createElement('div');
      block.className = 'roster-block';
      block.innerHTML = `<div class="block-heading"><h3>${escapeHTML(section.title)}</h3><span>${escapeHTML(section.note)}</span></div>`;
      people.filter(person => person.group === group && section.categories.includes(person.category)).forEach(person => block.appendChild(card(person)));
      container.appendChild(block);
    }
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.hidden = true;
    empty.textContent = 'No matching relationships in this group.';
    container.appendChild(empty);
  }
}

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function updateResults() {
  const query = normalize(document.getElementById('search').value.trim());
  let visible = 0;
  people.forEach(person => {
    const haystack = normalize([person.name, person.channel, person.route, person.summary, person.context].join(' '));
    const matches = (!query || query.split(/\s+/).every(word => haystack.includes(word))) && (filters[person.group] === 'all' || filters[person.group] === person.category);
    document.getElementById(person.id).hidden = !matches;
    if (matches) visible++;
  });
  document.querySelectorAll('.roster-block').forEach(block => { block.hidden = !block.querySelector('.person:not([hidden])'); });
  for (const group of Object.keys(filters)) {
    const container = document.getElementById(`${group}-roster`);
    container.querySelector('.empty').hidden = Boolean(container.querySelector('.person:not([hidden])'));
    updateExpandControl(group);
  }
  document.getElementById('clear-search').hidden = !query;
  document.getElementById('search-result').textContent = query || Object.values(filters).some(filter => filter !== 'all') ? `${visible} of ${people.length} entries` : `${people.length} relationship entries`;
}

function setFilter(group, category) {
  filters[group] = category;
  document.querySelectorAll(`.filter[data-group="${group}"]`).forEach(button => {
    const active = button.dataset.category === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  updateResults();
}

function updateExpandControl(group) {
  const visible = [...document.querySelectorAll(`.person[data-group="${group}"]:not([hidden])`)];
  const allOpen = visible.length > 0 && visible.every(detail => detail.open);
  const button = document.querySelector(`.expand-group[data-group="${group}"]`);
  button.textContent = allOpen ? 'Close all' : 'Open all';
  button.setAttribute('aria-expanded', String(allOpen));
  button.disabled = visible.length === 0;
}

async function copy(text, message, button) {
  try {
    await navigator.clipboard.writeText(text);
    if (button) {
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = 'Copy text'; }, 1800);
    }
    announce(message);
  } catch {
    announce('Copy unavailable in this browser. Select and copy the text directly.');
  }
}

function announce(message) {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

function followHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  if (target.classList.contains('person')) {
    document.getElementById('search').value = '';
    setFilter(target.dataset.group, 'all');
    target.open = true;
  } else if (target.tagName === 'DETAILS') target.open = true;
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
}

let printState = [];
let printVisibility = [];
function preparePrint() {
  printState = [...document.querySelectorAll('details')].map(detail => ({ detail, open: detail.open }));
  printVisibility = [...document.querySelectorAll('.person,.roster-block,.empty')].map(element => ({ element, hidden: element.hidden }));
  printVisibility.forEach(({ element }) => { element.hidden = element.classList.contains('empty'); });
  printState.forEach(({ detail }) => { detail.open = true; });
}
function restorePrint() {
  printState.forEach(({ detail, open }) => { detail.open = open; });
  printVisibility.forEach(({ element, hidden }) => { element.hidden = hidden; });
  printState = [];
  printVisibility = [];
}
window.addEventListener('beforeprint', preparePrint);
window.addEventListener('afterprint', restorePrint);
document.querySelectorAll('.print-button').forEach(button => button.addEventListener('click', () => window.print()));

async function init() {
  try {
    const response = await fetch('./relationships.json?v=20261009-warm-expanded');
    if (!response.ok) throw new Error(`Unable to load relationship data (${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data.people) || data.people.length === 0) throw new Error('Relationship data is empty');
    people = data.people;
    render();
    document.getElementById('search').addEventListener('input', updateResults);
    document.getElementById('clear-search').addEventListener('click', () => {
      document.getElementById('search').value = '';
      updateResults();
      document.getElementById('search').focus();
    });
    document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.group, button.dataset.category)));
    document.querySelectorAll('.expand-group').forEach(button => button.addEventListener('click', () => {
      const visible = [...document.querySelectorAll(`.person[data-group="${button.dataset.group}"]:not([hidden])`)];
      const open = !visible.every(detail => detail.open);
      visible.forEach(detail => { detail.open = open; });
    }));
    updateResults();
    followHash();
    window.addEventListener('hashchange', followHash);
  } catch (error) {
    document.querySelectorAll('.roster').forEach(container => {
      container.innerHTML = '<p class="error">The relationship drafts could not be loaded. Refresh this page to try again.</p>';
    });
    document.querySelectorAll('.filter,.expand-group').forEach(button => { button.disabled = true; });
    console.error(error);
  }
}
init();
