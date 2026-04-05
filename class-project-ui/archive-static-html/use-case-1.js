/**
 * USE CASE 1 — View AI Summary
 * Student: Faris Suleiman
 *
 * This file is self-contained: one teammate can own use-case-1.* without touching use case 2.
 */

// Simulated delay (ms) so the "AI" feels async
var SUMMARY_DELAY_MS = 900;

// Fixed "generated" summary (no external API)
var MOCK_AI_SUMMARY =
  "Researchers are testing ML-based cooling in data centers to cut energy use. " +
  "Pilot results look promising, with more trials planned before broader rollout " +
  "to cloud companies.";

/**
 * Simulates requesting an AI summary of the article.
 * Returns a Promise that resolves to the mock summary string after a short delay.
 */
function simulateAiSummary() {
  return new Promise(function (resolve) {
    window.setTimeout(function () {
      resolve(MOCK_AI_SUMMARY);
    }, SUMMARY_DELAY_MS);
  });
}

/**
 * Updates the summary button during the fake loading state.
 * @param {boolean} isLoading - true while "AI" is working
 */
function setSummaryButtonLoading(isLoading) {
  var btn = document.getElementById("summaryBtn");
  btn.disabled = isLoading;
  btn.classList.toggle("loading", isLoading);
  var text = btn.querySelector(".btn-text");
  text.textContent = isLoading ? "Generating summary…" : "View AI Summary";
}

/**
 * Wires the button: click → loading → show summary below the article.
 */
function initAiSummaryPage() {
  var btn = document.getElementById("summaryBtn");
  var box = document.getElementById("summaryOutput");
  var summaryText = document.getElementById("summaryText");

  btn.addEventListener("click", function () {
    setSummaryButtonLoading(true);
    btn.setAttribute("aria-expanded", "true");

    simulateAiSummary()
      .then(function (text) {
        summaryText.textContent = text;
        box.classList.add("visible");
      })
      .finally(function () {
        setSummaryButtonLoading(false);
      });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAiSummaryPage);
} else {
  initAiSummaryPage();
}
