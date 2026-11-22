'use strict';

/**
 * Over-privilege heuristics: which permission categories are expected for
 * each app category.
 *
 * This is a heuristic, not ground truth — a permission outside the expected
 * set is flagged as "unexpected for this kind of app" and explained, never
 * presented as proof of malice. Some apps have legitimate reasons to hold an
 * unexpected permission; the finding text says so.
 *
 * Rules:
 *  - System apps are never flagged: the OS needs broad access.
 *  - ALWAYS_OK permissions (harmless, non-sensitive) are expected everywhere.
 *  - SENSITIVE_OTHER permissions are judged individually, because the
 *    "other" category mixes harmless permissions (vibrate) with dangerous
 *    ones (draw over apps, install packages).
 *  - Unknown permissions are never flagged: we cannot judge what we do not
 *    know.
 */

const APP_CATEGORIES = [
  'messaging',
  'social',
  'finance',
  'games',
  'health',
  'shopping',
  'news',
  'productivity',
  'navigation',
  'media',
  'tools',
  'system',
];

const CATEGORY_LABELS = {
  messaging: 'Messaging',
  social: 'Social',
  finance: 'Finance',
  games: 'Games',
  health: 'Health & Fitness',
  shopping: 'Shopping',
  news: 'News & Weather',
  productivity: 'Productivity',
  navigation: 'Navigation',
  media: 'Media',
  tools: 'Tools',
  system: 'System',
};

/** Permission categories a well-behaved app of each kind may need. */
const EXPECTED_CATEGORIES = {
  messaging: new Set([
    'microphone',
    'camera',
    'contacts',
    'messages',
    'calls',
    'storage',
    'network',
  ]),
  social: new Set([
    'microphone',
    'camera',
    'location',
    'contacts',
    'storage',
    'network',
  ]),
  finance: new Set(['camera', 'messages', 'storage', 'network']),
  games: new Set(['storage', 'network', 'sensors']),
  health: new Set(['sensors', 'location', 'storage', 'network']),
  shopping: new Set(['camera', 'location', 'storage', 'network']),
  news: new Set(['location', 'storage', 'network']),
  productivity: new Set(['contacts', 'camera', 'storage', 'network']),
  navigation: new Set(['location', 'microphone', 'storage', 'network']),
  media: new Set(['storage', 'network']),
  tools: new Set(['camera', 'storage', 'network']),
  system: null, // system apps: everything is expected, never flagged
};

/** Harmless permissions that are fine for any app to hold. */
const ALWAYS_OK = new Set([
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.ACCESS_WIFI_STATE',
  'android.permission.NFC',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.VIBRATE',
  'android.permission.WAKE_LOCK',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.USE_BIOMETRIC',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
]);

/**
 * Sensitive "other"-category permissions and the app categories that may
 * legitimately hold them. Everything else holding one of these is flagged.
 */
const SENSITIVE_OTHER = {
  'android.permission.SYSTEM_ALERT_WINDOW': new Set(['system', 'tools']),
  'android.permission.REQUEST_INSTALL_PACKAGES': new Set(['system', 'tools']),
  'android.permission.QUERY_ALL_PACKAGES': new Set(['system', 'tools']),
  'android.permission.READ_CALENDAR': new Set(['productivity']),
  'android.permission.WRITE_CALENDAR': new Set(['productivity']),
  'android.permission.GET_ACCOUNTS': new Set([
    'productivity',
    'social',
    'messaging',
  ]),
};

/**
 * Is this permission expected for an app of this category?
 * `permission` is a permission-db entry (with id, category, unknown).
 */
function isExpected(appCategory, permission) {
  if (permission.unknown) return true; // cannot judge what we do not know
  if (appCategory === 'system') return true;
  if (ALWAYS_OK.has(permission.id)) return true;

  const sensitiveRule = SENSITIVE_OTHER[permission.id];
  if (sensitiveRule) return sensitiveRule.has(appCategory);

  const expected = EXPECTED_CATEGORIES[appCategory];
  if (!expected) return true; // unknown app category: do not flag
  // 'other'-category permissions not listed above are judged case by case:
  // only the ones in ALWAYS_OK / SENSITIVE_OTHER reach here, and any other
  // 'other' permission (e.g. advertising ID) is unexpected for most apps.
  if (permission.category === 'other') return false;
  return expected.has(permission.category);
}

module.exports = {
  APP_CATEGORIES,
  CATEGORY_LABELS,
  EXPECTED_CATEGORIES,
  ALWAYS_OK,
  SENSITIVE_OTHER,
  isExpected,
};
