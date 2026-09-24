---
title: "Terac investment scenarios"
date: 2026-09-04T12:00:00-07:00
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

  .terac-eyebrow { color: #68717c; font-size: 0.78rem; letter-spacing: 0.13em; margin-bottom: 0.9rem; text-transform: uppercase; }
  #codex-visualization { display: block; width: 100%; height: 1300px; border: 0; }
  @media (max-width: 650px) { .terac-gate-card { padding: 1.5rem; } }
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
{{< /rawhtml >}}
{{< terac-simulator >}}
{{< rawhtml >}}
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
