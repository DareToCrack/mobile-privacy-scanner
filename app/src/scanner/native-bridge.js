'use strict';

/**
 * Loads the local Expo module (modules/privacy-scanner). Returns null when
 * the native module is not present — web, Expo Go, iOS, or a build made
 * before the module was added — so the app falls back to demo mode instead
 * of crashing.
 *
 * Metro-only file: it requires the 'privacy-scanner' package, whose entry
 * point calls requireNativeModule. node:test never loads this file; the
 * scanner abstraction in index.js receives the result as an argument.
 */

let scanner = null;

try {
  // Requiring the package evaluates requireNativeModule, which throws when
  // the native module is not linked (web / Expo Go).
  scanner = require('privacy-scanner');
} catch (e) {
  scanner = null;
}

function getNativeScanner() {
  if (!scanner || typeof scanner.getInstalledApps !== 'function') return null;
  return {
    getInstalledApps: () => scanner.getInstalledApps(),
  };
}

module.exports = { getNativeScanner };
