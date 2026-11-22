'use strict';

/**
 * JavaScript interface for the PrivacyScanner native module.
 *
 * `requireNativeModule` throws when the native module is not linked (web,
 * Expo Go, iOS) — callers must catch that and fall back to demo mode. See
 * app/src/scanner/native-bridge.js.
 */

const { requireNativeModule } = require('expo-modules-core');

const PrivacyScannerModule = requireNativeModule('PrivacyScanner');

/**
 * List installed apps with their declared permissions.
 * @returns {Promise<Array<{packageName, label, category, isSystemApp, permissions: Array<{name, granted}>}>>}
 */
function getInstalledApps() {
  return PrivacyScannerModule.getInstalledApps();
}

module.exports = { getInstalledApps, PrivacyScannerModule };
