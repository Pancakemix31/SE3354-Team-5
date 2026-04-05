/**
 * USE CASE 2 — Modify Notification Settings
 * Student: Faris Suleiman
 *
 * This file is self-contained: one teammate can own use-case-2.* without touching use case 1.
 */

// localStorage keys (unchanged from original single-file demo so existing saves still work)
var STORAGE_KEYS = {
  ENABLED: "se_project_notifications_enabled",
  FREQUENCY: "se_project_notifications_frequency"
};

/**
 * Reads saved notification settings from localStorage.
 * @returns {{ enabled: boolean, frequency: 'hourly'|'daily' }}
 */
function loadNotificationSettings() {
  var enabledRaw = window.localStorage.getItem(STORAGE_KEYS.ENABLED);
  var freqRaw = window.localStorage.getItem(STORAGE_KEYS.FREQUENCY);

  var enabled = enabledRaw === "true";
  var frequency = freqRaw === "daily" || freqRaw === "hourly" ? freqRaw : "daily";

  if (enabledRaw === null && freqRaw === null) {
    enabled = false;
    frequency = "daily";
  }

  return { enabled: enabled, frequency: frequency };
}

/**
 * Persists one setting to localStorage.
 * @param {string} key
 * @param {string} value
 */
function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage not available:", e);
  }
}

/**
 * Updates the ON/OFF label next to the toggle.
 * @param {boolean} on
 */
function updateToggleLabel(on) {
  var el = document.getElementById("toggleStateLabel");
  el.textContent = on ? "ON" : "OFF";
}

/**
 * Shows a short confirmation when settings change.
 * @param {string} message
 */
function showConfirmation(message) {
  var banner = document.getElementById("confirmBanner");
  banner.textContent = message;
  banner.classList.add("show");
  window.clearTimeout(showConfirmation._t);
  showConfirmation._t = window.setTimeout(function () {
    banner.classList.remove("show");
  }, 3200);
}

/**
 * Applies loaded settings to the DOM.
 * @param {{ enabled: boolean, frequency: string }} settings
 */
function applySettingsToUi(settings) {
  document.getElementById("notifToggle").checked = settings.enabled;
  document.getElementById("frequencySelect").value = settings.frequency;
  updateToggleLabel(settings.enabled);
}

/**
 * Initializes listeners: changes save to localStorage and show confirmation.
 */
function initNotificationSettingsPage() {
  var settings = loadNotificationSettings();
  applySettingsToUi(settings);

  var toggle = document.getElementById("notifToggle");
  var select = document.getElementById("frequencySelect");

  toggle.addEventListener("change", function () {
    var on = toggle.checked;
    saveToStorage(STORAGE_KEYS.ENABLED, on ? "true" : "false");
    updateToggleLabel(on);
    showConfirmation(
      "Notifications turned " + (on ? "ON" : "OFF") + ". Preference saved."
    );
  });

  select.addEventListener("change", function () {
    var freq = select.value;
    saveToStorage(STORAGE_KEYS.FREQUENCY, freq);
    var label = freq === "hourly" ? "Hourly" : "Daily";
    showConfirmation("Frequency set to " + label + ". Preference saved.");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNotificationSettingsPage);
} else {
  initNotificationSettingsPage();
}
