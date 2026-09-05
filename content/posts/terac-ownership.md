---
title: "Terac follow-on ownership math"
date: 2026-09-04T12:00:00-07:00
draft: false
description: "A simple comparison of the ownership produced by a $75K follow-on investment under different Series A and discount scenarios."
url: "/terac-ownership/"
noindex: true
sitemap:
  disable: true
_build:
  render: always
  list: never
---

{{< rawhtml >}}
<style>
  .post > header {
    display: none;
  }

  .terac-page {
    color: #17212b;
    display: none;
    margin: 1.2rem 0 4rem;
  }

  .terac-page.is-unlocked {
    display: block;
  }

  .terac-gate {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 68vh;
    padding: 3rem 0;
  }

  .terac-gate.is-hidden {
    display: none;
  }

  .terac-gate-card {
    border-top: 9px solid #17212b;
    box-shadow: 0 14px 40px rgba(23, 33, 43, 0.12);
    max-width: 28rem;
    padding: 2.2rem;
    width: 100%;
  }

  .terac-gate-card h1 {
    color: #17212b;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 2.2rem;
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin: 0;
  }

  .terac-gate-card > p {
    color: #56606b;
    line-height: 1.5;
    margin: 0.8rem 0 1.25rem;
  }

  .terac-gate-fields {
    display: flex;
    gap: 0.6rem;
  }

  .terac-gate-fields input {
    border: 1px solid #bbc3cc;
    border-radius: 7px;
    color: #17212b;
    flex: 1;
    font: inherit;
    min-width: 0;
    padding: 0.75rem 0.85rem;
  }

  .terac-gate-fields input:focus {
    border-color: #17212b;
    box-shadow: 0 0 0 3px rgba(23, 33, 43, 0.12);
    outline: none;
  }

  .terac-gate-fields button {
    background: #17212b;
    border: 0;
    border-radius: 7px;
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    padding: 0.75rem 1rem;
  }

  .terac-gate-error {
    color: #b42318;
    font-size: 0.88rem;
    min-height: 1.4em;
  }

  .terac-sr-only {
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .terac-cover {
    border-top: 9px solid #17212b;
    border-bottom: 1px solid #d8dee5;
    padding: 2.5rem 0 2.2rem;
  }

  .terac-eyebrow {
    color: #68717c;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    margin-bottom: 0.9rem;
    text-transform: uppercase;
  }

  .terac-cover h1 {
    color: #17212b;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(2.5rem, 7vw, 4.2rem);
    letter-spacing: -0.035em;
    line-height: 1;
    margin: 0;
  }

  .terac-subtitle {
    color: #56606b;
    font-size: 1.14rem;
    line-height: 1.55;
    margin: 1.1rem 0 0;
    max-width: 44rem;
  }

  .terac-section {
    margin-top: 3rem;
  }

  .terac-section h2 {
    border-top: 2px solid #17212b;
    color: #17212b;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.9rem;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0;
    padding-top: 1rem;
  }

  .terac-section > p {
    color: #3f4954;
    font-size: 1.03rem;
    line-height: 1.65;
    margin: 0.8rem 0 1.25rem;
  }

  .terac-stat-grid {
    display: grid;
    gap: 0.8rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 1.4rem;
  }

  .terac-stat {
    background: #f4f6f8;
    border: 1px solid #dfe4ea;
    border-radius: 10px;
    padding: 1rem;
  }

  .terac-stat-label {
    color: #68717c;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .terac-stat-value {
    color: #17212b;
    font-size: 1.55rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-top: 0.4rem;
  }

  .terac-stat-detail {
    color: #68717c;
    font-size: 0.86rem;
    line-height: 1.45;
    margin-top: 0.3rem;
  }

  .terac-callout {
    background: #edf7f1;
    border-left: 5px solid #238653;
    border-radius: 0 8px 8px 0;
    color: #254434;
    font-size: 1.02rem;
    line-height: 1.55;
    margin: 1.2rem 0 0;
    padding: 1rem 1.1rem;
  }

  .terac-table-wrap {
    border: 1px solid #d8dee5;
    border-radius: 10px;
    margin-top: 1.25rem;
    overflow-x: auto;
  }

  .terac-table {
    border-collapse: collapse;
    margin: 0;
    min-width: 760px;
    width: 100%;
  }

  .terac-table th,
  .terac-table td {
    border: 0;
    border-bottom: 1px solid #e5e9ed;
    padding: 0.85rem 0.9rem;
    text-align: right;
    vertical-align: middle;
  }

  .terac-table th:first-child,
  .terac-table td:first-child {
    text-align: left;
  }

  .terac-table th {
    background: #f4f6f8;
    color: #56606b;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.035em;
    line-height: 1.35;
    text-transform: uppercase;
  }

  .terac-table td {
    color: #26313c;
    font-size: 0.94rem;
    line-height: 1.4;
  }

  .terac-table tr:last-child td {
    border-bottom: 0;
  }

  .terac-table .terac-result {
    color: #137a47;
    font-weight: 800;
  }

  .terac-note {
    color: #68717c;
    font-size: 0.83rem;
    line-height: 1.55;
    margin-top: 1rem;
  }

  @media (max-width: 650px) {
    .terac-gate-card {
      padding: 1.5rem;
    }

    .terac-cover {
      padding-top: 2rem;
    }

    .terac-stat-grid {
      grid-template-columns: 1fr;
    }

    .terac-stat {
      display: grid;
      gap: 0.25rem 1rem;
      grid-template-columns: 1fr auto;
    }

    .terac-stat-value {
      grid-column: 2;
      grid-row: 1 / span 2;
      margin: 0;
    }
  }
</style>

<section class="terac-gate" id="terac-gate">
  <form class="terac-gate-card" id="terac-gate-form">
    <div class="terac-eyebrow">Private page</div>
    <h1>Password required</h1>
    <p>Enter the password to continue.</p>
    <label class="terac-sr-only" for="terac-password">Password</label>
    <div class="terac-gate-fields">
      <input id="terac-password" type="password" inputmode="numeric" autocomplete="current-password" required autofocus>
      <button type="submit">Open</button>
    </div>
    <p class="terac-gate-error" id="terac-gate-error" role="alert" aria-live="polite"></p>
  </form>
</section>

<main class="terac-page" id="terac-page" tabindex="-1">
  <section class="terac-cover">
    <div class="terac-eyebrow">Antigravity × Terac</div>
    <h1>Follow-on ownership math</h1>
    <p class="terac-subtitle">A simple comparison of what a $75K follow-on buys under three potential Series A valuations and two discount scenarios.</p>

    <div class="terac-stat-grid">
      <div class="terac-stat">
        <div class="terac-stat-label">Initially invested</div>
        <div class="terac-stat-value">$10K</div>
        <div class="terac-stat-detail">At a $30M valuation</div>
      </div>
      <div class="terac-stat">
        <div class="terac-stat-label">Intended investment</div>
        <div class="terac-stat-value">$100K</div>
        <div class="terac-stat-detail">At the same $30M valuation</div>
      </div>
      <div class="terac-stat">
        <div class="terac-stat-label">Follow-on available</div>
        <div class="terac-stat-value">$75K</div>
        <div class="terac-stat-detail">For the current investment</div>
      </div>
    </div>
  </section>

  <section class="terac-section">
    <h2>Starting point</h2>
    <p>The original $10K investment at $30M bought approximately 0.0333%. The $100K investment we wanted to make at that price would have bought approximately 0.3333%.</p>
    <div class="terac-callout"><strong>We bought 10% of the position we originally wanted.</strong></div>
  </section>

  <section class="terac-section">
    <h2>75% discount</h2>
    <p>A 75% discount means investing at 25% of the Series A price. The new $75K receives the same number of shares as $300K invested at the Series A price.</p>
    <div class="terac-table-wrap">
      <table class="terac-table">
        <thead>
          <tr>
            <th>Series A valuation</th>
            <th>Effective conversion price</th>
            <th>Ownership from new $75K</th>
            <th>Headline total*</th>
            <th>% of original target</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>$150M</td>
            <td>$37.5M</td>
            <td>0.2000%</td>
            <td class="terac-result">0.2333%</td>
            <td class="terac-result">70%</td>
          </tr>
          <tr>
            <td>$200M</td>
            <td>$50M</td>
            <td>0.1500%</td>
            <td class="terac-result">0.1833%</td>
            <td class="terac-result">55%</td>
          </tr>
          <tr>
            <td>$300M</td>
            <td>$75M</td>
            <td>0.1000%</td>
            <td class="terac-result">0.1333%</td>
            <td class="terac-result">40%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="terac-section">
    <h2>50% discount</h2>
    <p>A 50% discount means investing at 50% of the Series A price. The new $75K receives the same number of shares as $150K invested at the Series A price.</p>
    <div class="terac-table-wrap">
      <table class="terac-table">
        <thead>
          <tr>
            <th>Series A valuation</th>
            <th>Effective conversion price</th>
            <th>Ownership from new $75K</th>
            <th>Headline total*</th>
            <th>% of original target</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>$150M</td>
            <td>$75M</td>
            <td>0.1000%</td>
            <td class="terac-result">0.1333%</td>
            <td class="terac-result">40%</td>
          </tr>
          <tr>
            <td>$200M</td>
            <td>$100M</td>
            <td>0.0750%</td>
            <td class="terac-result">0.1083%</td>
            <td class="terac-result">32.5%</td>
          </tr>
          <tr>
            <td>$300M</td>
            <td>$150M</td>
            <td>0.0500%</td>
            <td class="terac-result">0.0833%</td>
            <td class="terac-result">25%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <p class="terac-note">* Headline totals add the original 0.0333% without accounting for dilution. Exact ownership depends on the current fully diluted cap table and the final SAFE and Series A mechanics.</p>
</main>

<script>
  (function () {
    const expectedHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
    const sessionKey = "terac-ownership-unlocked";
    const gate = document.getElementById("terac-gate");
    const form = document.getElementById("terac-gate-form");
    const input = document.getElementById("terac-password");
    const error = document.getElementById("terac-gate-error");
    const page = document.getElementById("terac-page");

    function unlock() {
      gate.classList.add("is-hidden");
      page.classList.add("is-unlocked");
      page.focus();
    }

    try {
      if (sessionStorage.getItem(sessionKey) === "yes") {
        unlock();
      }
    } catch (_) {}

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      error.textContent = "";

      try {
        const bytes = new TextEncoder().encode(input.value);
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        const hash = Array.from(new Uint8Array(digest))
          .map(function (byte) { return byte.toString(16).padStart(2, "0"); })
          .join("");

        if (hash === expectedHash) {
          try { sessionStorage.setItem(sessionKey, "yes"); } catch (_) {}
          input.value = "";
          unlock();
          return;
        }
      } catch (_) {
        error.textContent = "This browser cannot open the protected page.";
        return;
      }

      error.textContent = "Incorrect password.";
      input.select();
    });
  })();
</script>
{{< /rawhtml >}}
