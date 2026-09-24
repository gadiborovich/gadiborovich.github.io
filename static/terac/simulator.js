(function () {
  'use strict';
  const entries = [150e6, 200e6, 300e6];
  const exits = [1.35e9, 1.8e9, 2.7e9, 5e9];
  const checks = [
    { id: '70', amount: 70000, includeOriginal: true },
    { id: '1000', amount: 1000000, includeOriginal: false }
  ];
  const state = { '70': [1, 1], '1000': [1, 1] };
  const originalCost = 10000;
  const exact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const compact = function (value) {
    return value >= 1e6 ? '$' + (value / 1e6).toFixed(2) + 'M' : '$' + Math.round(value / 1000) + 'K';
  };
  const multiple = function (value) { return value.toFixed(1) + '×'; };
  const exitLabel = function (column) { return (column === 3 ? 'Extended hold' : 'Series C') + ' · $' + exits[column] / 1e9 + 'B'; };

  function metrics(check, row, column) {
    const retention = 0.8 * 0.8 * (column === 3 ? 0.8 : 1);
    const existing = check.includeOriginal ? originalCost / 30e6 * 0.8 * retention * exits[column] : 0;
    const added = check.amount / (0.9 * entries[row]) * retention * exits[column];
    const cost = check.amount + (check.includeOriginal ? originalCost : 0);
    return { existing: existing, added: added, total: existing + added, cost: cost, blended: (existing + added) / cost, newMultiple: added / check.amount };
  }

  function detailMetric(label, value) {
    return '<div><span class="detail-label">' + label + '</span><span class="detail-value">' + value + '</span></div>';
  }

  // Series A snapshot: use the same entry and original-stake assumptions as
  // the later-outcome model, with no subsequent-round dilution or exit price.
  const percent = function (ownership) { return (ownership * 100).toFixed(5) + '%'; };
  const millions = function (value) { return '$' + value / 1e6 + 'M'; };
  function aPositionCell(ownership, value, combined) {
    return '<td' + (combined ? ' class="a-combined"' : '') + '><span class="a-value">' + percent(ownership) + '</span><span class="cell-extra">' + exact.format(value) + ' on paper</span></td>';
  }
  document.getElementById('terac-a-fund-values').innerHTML = entries.map(function (entry) {
    const discountedEntry = entry * 0.9;
    const existingOwnership = originalCost / 30e6 * 0.8;
    const newOwnership = checks[0].amount / discountedEntry;
    return '<tr><th scope="row"><span class="entry-value">' + millions(entry) + '</span></th><td><span class="a-value a-price">' + millions(discountedEntry) + '</span></td>' +
      aPositionCell(existingOwnership, existingOwnership * entry, false) +
      aPositionCell(newOwnership, newOwnership * entry, false) +
      aPositionCell(existingOwnership + newOwnership, (existingOwnership + newOwnership) * entry, true) + '</tr>';
  }).join('');
  document.getElementById('terac-a-million-values').innerHTML = entries.map(function (entry) {
    const discountedEntry = entry * 0.9;
    const ownership = checks[1].amount / discountedEntry;
    return '<tr><th scope="row"><span class="entry-value">' + millions(entry) + '</span></th><td><span class="a-value a-price">' + millions(discountedEntry) + '</span></td><td><span class="a-value">' + percent(ownership) + '</span></td><td><span class="a-value">' + exact.format(ownership * entry) + '</span><span class="cell-extra">+$' + Math.round(ownership * entry - checks[1].amount).toLocaleString('en-US') + ' unrealized gain</span></td></tr>';
  }).join('');

  function updateDetail(check) {
    const row = state[check.id][0];
    const column = state[check.id][1];
    const m = metrics(check, row, column);
    const heading = '<div class="detail-heading">Series A $' + entries[row] / 1e6 + 'M → ' + exitLabel(column) + '</div>';
    let body;
    if (check.includeOriginal) {
      body = '<div class="detail-grid">' + detailMetric('Existing $10K stake', exact.format(m.existing)) + detailMetric('Added by the $70K', exact.format(m.added)) + detailMetric('Combined proceeds', exact.format(m.total)) + detailMetric('Blended return on $80K', multiple(m.blended)) + '</div>' +
        '<p class="detail-foot">Follow-on alone: ' + multiple(m.newMultiple) + ' return · ' + exact.format(m.added - check.amount) + ' profit. Combined profit: ' + exact.format(m.total - m.cost) + '.</p>';
    } else {
      body = '<div class="detail-grid">' + detailMetric('Separate investment', exact.format(check.amount)) + detailMetric('Gross proceeds', exact.format(m.total)) + detailMetric('Gross profit', exact.format(m.total - m.cost)) + detailMetric('Return on $1M', multiple(m.newMultiple)) + '</div>';
    }
    document.getElementById('terac-' + check.id + '-details').innerHTML = heading + body;
    document.querySelectorAll('button[data-check="' + check.id + '"]').forEach(function (button) {
      const selected = Number(button.dataset.row) === row && Number(button.dataset.column) === column;
      button.setAttribute('aria-pressed', String(selected));
      button.closest('td').classList.toggle('is-selected', selected);
    });
  }

  document.getElementById('terac-pass-values').innerHTML = exits.map(function (_, column) {
    const proceeds = metrics(checks[0], 0, column).existing;
    return '<div class="baseline-item"><span class="exit-label">' + exitLabel(column) + '</span><span class="baseline-value">' + exact.format(proceeds) + '</span><span class="baseline-multiple">' + multiple(proceeds / originalCost) + ' on the original $10K</span></div>';
  }).join('');

  checks.forEach(function (check) {
    document.getElementById('terac-' + check.id + '-values').innerHTML = entries.map(function (entry, row) {
      const ownership = check.amount / (0.9 * entry) * 100;
      return '<tr><th scope="row"><span class="entry-value">$' + entry / 1e6 + 'M</span><span class="entry-share">' + ownership.toFixed(4) + '%<br>' + (check.includeOriginal ? 'added after A' : 'ownership after A') + '</span></th>' + exits.map(function (_, column) {
        const m = metrics(check, row, column);
        const oldWidth = m.existing / m.total * 100;
        const description = check.includeOriginal ? 'combined proceeds' : 'standalone proceeds';
        const button = '<button type="button" class="value-button" data-check="' + check.id + '" data-row="' + row + '" data-column="' + column + '" aria-pressed="false" aria-label="' + exact.format(m.total) + ' ' + description + ', A $' + entry / 1e6 + 'M, ' + exitLabel(column) + '. Show breakdown.">' + compact(m.total) + '</button>';
        const supplement = check.includeOriginal
          ? '<div class="stack" role="img" aria-label="Existing stake ' + exact.format(m.existing) + '; follow-on ' + exact.format(m.added) + '"><span class="old" style="width:' + oldWidth + '%"></span><span class="new" style="width:' + (100 - oldWidth) + '%"></span></div><span class="cell-multiple">' + multiple(m.blended) + ' blended</span><span class="cell-extra">+' + compact(m.added) + ' from follow-on</span>'
          : '<span class="cell-multiple">' + multiple(m.newMultiple) + ' return</span><span class="cell-extra">' + compact(m.total - m.cost) + ' profit</span>';
        return '<td>' + button + supplement + '</td>';
      }).join('') + '</tr>';
    }).join('');
    updateDetail(check);
  });

  document.getElementById('terac-page').addEventListener('click', function (event) {
    const button = event.target.closest('button[data-check]');
    if (!button) return;
    const check = checks.find(function (item) { return item.id === button.dataset.check; });
    state[check.id] = [Number(button.dataset.row), Number(button.dataset.column)];
    updateDetail(check);
  });

  const gate = document.getElementById('terac-gate');
  const page = document.getElementById('terac-page');
  const form = document.getElementById('terac-gate-form');
  const input = document.getElementById('terac-password');
  const error = document.getElementById('terac-gate-error');
  function unlock() {
    gate.hidden = true;
    page.hidden = false;
    page.focus({ preventScroll: true });
  }
  try { if (sessionStorage.getItem('terac-ownership-unlocked') === 'yes') unlock(); } catch (_) {}
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    error.textContent = '';
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value));
      const hash = Array.from(new Uint8Array(digest)).map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
      if (hash === '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4') {
        try { sessionStorage.setItem('terac-ownership-unlocked', 'yes'); } catch (_) {}
        input.value = '';
        unlock();
        return;
      }
      error.textContent = 'Incorrect password.';
      input.select();
    } catch (_) { error.textContent = 'Please open this page in an up-to-date browser.'; }
  });
})();
