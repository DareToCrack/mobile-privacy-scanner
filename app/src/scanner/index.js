'use strict';

/**
 * Scanner abstraction: one interface the UI consumes, three realities behind it.
 *
 *  - Android dev build with the native module: real scan via PackageManager.
 *  - Anything else (web, Expo Go, Android without the module): demo mode
 *    against the mock inventory — works with zero setup.
 *  - iOS: scanning is impossible — the sandbox forbids listing installed apps
 *    or reading their permissions. We say so honestly instead of faking it.
 *
 * Pure JS (no React Native imports) so node:test can exercise it. The caller
 * passes the platform string and the native scanner (or null).
 */

const { getDemoApps } = require('./demo-inventory');

const IOS_MESSAGE =
  'iOS does not allow apps to list installed apps or read their permissions, ' +
  'so Privacy Scanner cannot scan this device. Use an Android device for a ' +
  'real scan, or explore the demo data on this device instead.';

/** Normalize raw native-module rows into the app shape the engine expects. */
function normalizeNativeApps(rows) {
  return (rows || []).map((row) => ({
    packageName: row.packageName,
    label: row.label || row.packageName,
    category: row.category || 'tools',
    version: row.version || '',
    isSystem: row.isSystemApp === true,
    installed: row.installed || '',
    permissions: (row.permissions || []).map((p) => ({
      id: p.name,
      granted: p.granted === true,
    })),
  }));
}

function demoResult(platform) {
  return {
    source: 'demo',
    platform,
    scannedAt: new Date().toISOString(),
    apps: getDemoApps(),
  };
}

/**
 * Run a scan.
 * @param {Object} opts
 * @param {string} opts.platform - 'android' | 'ios' | 'web'
 * @param {Object|null} opts.nativeScanner - object with getInstalledApps()
 *   returning a Promise of native rows, or null when unavailable.
 * @param {boolean} [opts.forceDemo=false] - use demo data even if native is
 *   available (used on iOS, where the user can still explore the demo).
 * @returns {Promise<{source, platform, scannedAt, apps, reason?, message?}>}
 */
async function scanDevice({ platform, nativeScanner, forceDemo = false }) {
  if (platform === 'ios' && !forceDemo) {
    return {
      source: 'unavailable',
      platform,
      scannedAt: new Date().toISOString(),
      apps: [],
      reason: 'ios',
      message: IOS_MESSAGE,
    };
  }

  if (!forceDemo && nativeScanner && typeof nativeScanner.getInstalledApps === 'function') {
    try {
      const rows = await nativeScanner.getInstalledApps();
      return {
        source: 'live',
        platform,
        scannedAt: new Date().toISOString(),
        apps: normalizeNativeApps(rows),
      };
    } catch (e) {
      // Native scan failed (e.g. permission denied): fall through to demo
      // rather than showing an empty screen. The UI notes the fallback.
      return { ...demoResult(platform), fallbackFromLive: true };
    }
  }

  return demoResult(platform);
}

module.exports = { scanDevice, normalizeNativeApps, demoResult, IOS_MESSAGE };
