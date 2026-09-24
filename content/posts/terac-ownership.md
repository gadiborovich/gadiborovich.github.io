---
title: "Terac investment scenarios"
date: 2026-09-04T12:00:00-07:00
lastmod: 2026-09-24T12:00:00-07:00
type: "terac"
draft: false
description: "Fund I follow-on scenarios and a separate $1M investment, with independent exit valuations and dilution."
url: "/terac-ownership/"
noindex: true
sitemap:
  disable: true
_build:
  render: always
  list: never
---

{{< rawhtml >}}
<section class="gate" id="terac-gate" aria-labelledby="gate-title">
  <p class="eyebrow">Private working page</p>
  <h1 id="gate-title">Terac investment scenarios</h1>
  <p>A comparison for Gadi and Daniel.</p>
  <form id="terac-gate-form">
    <label for="terac-password">Password</label>
    <div class="gate-fields">
      <input id="terac-password" type="password" autocomplete="current-password" required aria-describedby="terac-gate-error">
      <button type="submit">Open</button>
    </div>
    <p class="error" id="terac-gate-error" role="alert"></p>
  </form>
</section>

<main class="page" id="terac-page" hidden tabindex="-1">
  <header class="cover">
    <p class="eyebrow">Antigravity · Scenario comparison</p>
    <h1>Terac investment scenarios</h1>
    <p class="subtitle">A Fund I follow-on. A separate $1M investment. Two independent decisions.</p>
    <div class="terms">
      <span><strong>10%</strong> entry discount</span>
      <span><strong>20%</strong> dilution per later round</span>
      <span>Series A values are <strong>post-money</strong></span>
      <span><strong>Gross</strong> proceeds, before fees, carry and taxes</span>
    </div>
  </header>

  <section class="section" aria-labelledby="baseline-title">
    <div class="section-heading">
      <div><span class="section-number">01 · The baseline</span><h2 id="baseline-title">Existing stake if we pass</h2></div>
      <p class="cost">$10K already invested</p>
    </div>
    <p class="section-note">Original stake estimated at 0.03333%. Assumes 20% dilution at A, B and C, plus one more 20% round for the $5B hold.</p>
    <div class="baseline" id="terac-pass-values"></div>
  </section>

  <section class="section" id="fund-i" aria-labelledby="fund-title">
    <div class="section-heading">
      <div><span class="section-number">02 · Fund I</span><h2 id="fund-title">Add $70K to our existing position</h2></div>
      <p class="cost">$10K existing + $70K new = $80K total cost</p>
    </div>
    <p class="section-note">Each cell shows combined proceeds and the blended return on $80K. The follow-on contribution is shown separately.</p>
    <div class="matrix-tools">
      <div class="legend"><span><i class="swatch old"></i>Existing $10K</span><span><i class="swatch new"></i>New $70K</span></div>
      <span>Select an amount for the exact breakdown ↓</span>
    </div>
    <p class="mobile-hint">Swipe the table to compare all four outcomes →</p>
    <div class="matrix-scroll" tabindex="0" role="region" aria-label="Fund I outcome comparison, scroll horizontally on smaller screens">
      <table class="matrix">
        <caption class="sr-only">Fund I combined outcomes: each Series A entry crossed with each independent exit valuation.</caption>
        <thead><tr><th scope="col">Series A entry<strong>Post-money</strong></th><th scope="col">Series C<strong>$1.35B</strong></th><th scope="col">Series C<strong>$1.8B</strong></th><th scope="col">Series C<strong>$2.7B</strong></th><th scope="col" class="hold-col">Extended hold<strong>$5B</strong></th></tr></thead>
        <tbody id="terac-70-values"></tbody>
      </table>
    </div>
    <div class="scenario-detail" id="terac-70-details" role="status" aria-live="polite" aria-atomic="true"></div>
  </section>

  <section class="section" id="separate-investment" aria-labelledby="separate-title">
    <div class="section-heading">
      <div><span class="section-number">03 · Separate from Fund I</span><h2 id="separate-title">Invest an independent $1M</h2></div>
      <p class="cost">$1M total cost · Outside Fund I</p>
    </div>
    <p class="section-note">This investment stands alone. None of Fund I’s existing $10K or additional $70K is included.</p>
    <div class="matrix-tools"><span>Gross proceeds · Return on the separate $1M · Gross profit</span><span>Select an amount for the exact breakdown ↓</span></div>
    <p class="mobile-hint">Swipe the table to compare all four outcomes →</p>
    <div class="matrix-scroll" tabindex="0" role="region" aria-label="Separate one million dollar investment, scroll horizontally on smaller screens">
      <table class="matrix">
        <caption class="sr-only">Separate $1M investment outcomes, excluding every Fund I position.</caption>
        <thead><tr><th scope="col">Series A entry<strong>Post-money</strong></th><th scope="col">Series C<strong>$1.35B</strong></th><th scope="col">Series C<strong>$1.8B</strong></th><th scope="col">Series C<strong>$2.7B</strong></th><th scope="col" class="hold-col">Extended hold<strong>$5B</strong></th></tr></thead>
        <tbody id="terac-1000-values"></tbody>
      </table>
    </div>
    <div class="scenario-detail" id="terac-1000-details" role="status" aria-live="polite" aria-atomic="true"></div>
  </section>

  <details class="assumptions">
    <summary>Model assumptions &amp; formulas</summary>
    <ul>
      <li>The Series C outcomes are independent scenarios, not automatically tied to a particular Series A price. The $5B outcome is a longer, more optimistic hold.</li>
      <li>New ownership after A is approximated as investment ÷ (90% × fully diluted Series A post-money valuation). New shares then retain 64% of that ownership after 20% dilution at B and C, or 51.2% after an additional round for the $5B hold. Actual conversion depends on the financing documents and cap table.</li>
      <li>The original position starts at $10K ÷ $30M. An additional 20% dilution at A is assumed for those shares; actual historical dilution is not verified.</li>
      <li>Proceeds = ownership after dilution × exit valuation. Profit = proceeds − investment cost. Return multiple = proceeds ÷ investment cost. Fund I’s denominator is $80K; the separate investment’s denominator is $1M.</li>
      <li>All proceeds assume a sale at the modeled share value, before fees, carry, taxes or preference effects. A Series C valuation does not guarantee an opportunity to sell. No additional MFN benefit is modeled.</li>
    </ul>
  </details>
  <footer class="footer">Private working comparison · Antigravity</footer>
</main>
{{< /rawhtml >}}
