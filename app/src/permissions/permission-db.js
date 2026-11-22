'use strict';

/**
 * Curated Android permission database.
 *
 * Every entry carries:
 *  - risk: critical | high | medium | low | info (how much the permission
 *    exposes if misused)
 *  - category: microphone | location | camera | contacts | messages | calls |
 *    storage | sensors | network | other
 *  - exposes: plain-language explanation of what the permission gives access to
 *  - masvs: OWASP MASVS v2.1.0 control reference. Only control IDs verified
 *    against the published standard are used:
 *      MASVS-PRIVACY-1 "The app minimizes access to sensitive data and
 *        resources." — the data-minimization control; applies to every
 *        permission an app collects without needing it.
 *      MASVS-PRIVACY-2 "The app prevents identification of the user." —
 *        applies to permissions that expose stable identifiers.
 *    No other control numbers are cited anywhere in this database.
 *  - guidance: what the user should do about it.
 *
 * Sources: Android permission reference (developer.android.com) for the
 * permission names; OWASP MASVS v2.1.0 (mas.owasp.org) for the controls.
 */

const MASVS_PRIVACY_1 = 'MASVS-PRIVACY-1';
const MASVS_PRIVACY_2 = 'MASVS-PRIVACY-2';

const REVOKE =
  'Revoke it unless you actively use the feature that needs it. On Android: ' +
  'Settings → Apps → [app] → Permissions.';

const PERMISSIONS = [
  // --- Microphone ---------------------------------------------------------
  {
    id: 'android.permission.RECORD_AUDIO',
    name: 'Microphone',
    risk: 'critical',
    category: 'microphone',
    exposes:
      'Lets the app record audio from the microphone at any time while it runs — ' +
      'including in the background if it also runs background services.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Revoke it unless you use voice messages, calls, or voice search in this app. ' +
      'On Android: Settings → Apps → [app] → Permissions → Microphone → Don’t allow.',
  },

  // --- Location -----------------------------------------------------------
  {
    id: 'android.permission.ACCESS_FINE_LOCATION',
    name: 'Precise location',
    risk: 'critical',
    category: 'location',
    exposes:
      'Gives the app your precise GPS location, accurate to within a few metres — ' +
      'enough to know your home, workplace, and daily routine.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Prefer “Allow only while using the app”, or switch the app to approximate ' +
      'location if it works without GPS precision.',
  },
  {
    id: 'android.permission.ACCESS_BACKGROUND_LOCATION',
    name: 'Location in the background',
    risk: 'critical',
    category: 'location',
    exposes:
      'Lets the app track your precise location even when you are not using it — ' +
      'a continuous record of everywhere you go.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Revoke background access unless the app genuinely needs it (e.g. a navigation ' +
      'app guiding you while the screen is off). “Allow only while using the app” ' +
      'is almost always enough.',
  },
  {
    id: 'android.permission.ACCESS_COARSE_LOCATION',
    name: 'Approximate location',
    risk: 'high',
    category: 'location',
    exposes:
      'Gives the app your approximate location (roughly city-block level) from ' +
      'cell towers and nearby Wi-Fi networks.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Less sensitive than precise location, but still reveals the area you live ' +
      'and work in. Revoke it for apps with no location feature.',
  },

  // --- Camera ---------------------------------------------------------------
  {
    id: 'android.permission.CAMERA',
    name: 'Camera',
    risk: 'high',
    category: 'camera',
    exposes: 'Lets the app take photos and record video.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },

  // --- Contacts -------------------------------------------------------------
  {
    id: 'android.permission.READ_CONTACTS',
    name: 'Read contacts',
    risk: 'high',
    category: 'contacts',
    exposes:
      'Lets the app read your full address book — names, phone numbers, and email ' +
      'addresses of everyone you know.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },
  {
    id: 'android.permission.WRITE_CONTACTS',
    name: 'Modify contacts',
    risk: 'medium',
    category: 'contacts',
    exposes: 'Lets the app add, edit, or delete entries in your address book.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },

  // --- Messages ---------------------------------------------------------------
  {
    id: 'android.permission.READ_SMS',
    name: 'Read text messages',
    risk: 'critical',
    category: 'messages',
    exposes:
      'Lets the app read all your text messages, including one-time login codes ' +
      'and password-reset messages.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Very few apps legitimately need this. Revoke it unless the app is your SMS ' +
      'app or an authenticator you trust.',
  },
  {
    id: 'android.permission.SEND_SMS',
    name: 'Send text messages',
    risk: 'high',
    category: 'messages',
    exposes:
      'Lets the app send text messages from your number — including to ' +
      'premium-rate numbers that cost you money.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },
  {
    id: 'android.permission.RECEIVE_SMS',
    name: 'Receive text messages',
    risk: 'high',
    category: 'messages',
    exposes:
      'Lets the app see incoming text messages as they arrive, including ' +
      'one-time login codes.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },

  // --- Calls ------------------------------------------------------------------
  {
    id: 'android.permission.READ_CALL_LOG',
    name: 'Read call history',
    risk: 'critical',
    category: 'calls',
    exposes:
      'Lets the app read your call history — who you called, when, and for how long.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },
  {
    id: 'android.permission.CALL_PHONE',
    name: 'Make phone calls',
    risk: 'high',
    category: 'calls',
    exposes:
      'Lets the app place calls from your phone without asking you each time.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },
  {
    id: 'android.permission.READ_PHONE_STATE',
    name: 'Read phone state & device ID',
    risk: 'high',
    category: 'calls',
    exposes:
      'Lets the app read phone state (such as whether a call is active) and, on ' +
      'older Android versions, stable device identifiers that can be used to ' +
      'track you across apps.',
    masvs: MASVS_PRIVACY_2,
    guidance:
      'Rarely needed by ordinary apps. Revoke it unless the app clearly needs ' +
      'to react to calls.',
  },

  // --- Storage ----------------------------------------------------------------
  {
    id: 'android.permission.READ_EXTERNAL_STORAGE',
    name: 'Read shared storage',
    risk: 'medium',
    category: 'storage',
    exposes:
      'Lets the app read files in shared storage — photos, downloads, and ' +
      'documents stored outside the app.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'On newer Android versions apps should use the scoped media permissions ' +
      'instead. Revoke it for apps that do not work with your files.',
  },
  {
    id: 'android.permission.READ_MEDIA_IMAGES',
    name: 'Read photos',
    risk: 'medium',
    category: 'storage',
    exposes:
      'Lets the app read your photos, including metadata such as where and when ' +
      'each photo was taken.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Prefer “Select photos and videos” (partial access) over full access when ' +
      'Android offers the choice.',
  },
  {
    id: 'android.permission.READ_MEDIA_VIDEO',
    name: 'Read videos',
    risk: 'medium',
    category: 'storage',
    exposes: 'Lets the app read the videos stored on your phone.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Prefer “Select photos and videos” (partial access) over full access when ' +
      'Android offers the choice.',
  },
  {
    id: 'android.permission.READ_MEDIA_AUDIO',
    name: 'Read audio files',
    risk: 'medium',
    category: 'storage',
    exposes: 'Lets the app read audio files and music stored on your phone.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },
  {
    id: 'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
    name: 'Read selected photos & videos',
    risk: 'low',
    category: 'storage',
    exposes:
      'Lets the app read only the photos and videos you specifically picked for ' +
      'it — not your whole library.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'This is the privacy-friendly way for an app to access media. Usually fine ' +
      'to leave enabled.',
  },

  // --- Sensors ----------------------------------------------------------------
  {
    id: 'android.permission.BODY_SENSORS',
    name: 'Body sensors',
    risk: 'high',
    category: 'sensors',
    exposes:
      'Lets the app read heart rate and other body-sensor data — health ' +
      'information.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Only health and fitness apps have a reason to ask for this. Revoke it ' +
      'everywhere else.',
  },
  {
    id: 'android.permission.ACTIVITY_RECOGNITION',
    name: 'Physical activity',
    risk: 'medium',
    category: 'sensors',
    exposes:
      'Lets the app detect what you are doing — walking, running, cycling, ' +
      'driving, or sitting still.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Makes sense for fitness apps. Revoke it for apps with no activity ' +
      'feature.',
  },
  {
    id: 'android.permission.UWB_RANGING',
    name: 'Ultra-wideband ranging',
    risk: 'medium',
    category: 'sensors',
    exposes:
      'Lets the app measure precise distance and direction to nearby devices — ' +
      'accurate enough to follow you around a room.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Only needed by apps that locate nearby devices or keys. Revoke it ' +
      'elsewhere.',
  },

  // --- Network ------------------------------------------------------------------
  {
    id: 'android.permission.INTERNET',
    name: 'Internet access',
    risk: 'info',
    category: 'network',
    exposes:
      'Lets the app access the internet. Nearly every app needs this; on its own ' +
      'it is not a privacy risk.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'No action needed. This permission alone tells you nothing about an app.',
  },
  {
    id: 'android.permission.ACCESS_NETWORK_STATE',
    name: 'View network connections',
    risk: 'info',
    category: 'network',
    exposes:
      'Lets the app check whether you are online and on Wi-Fi or mobile data.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'No action needed.',
  },
  {
    id: 'android.permission.ACCESS_WIFI_STATE',
    name: 'View Wi-Fi connections',
    risk: 'low',
    category: 'network',
    exposes:
      'Lets the app see Wi-Fi network details, which can reveal the networks ' +
      'around you and your approximate location.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'Usually harmless. Revoke it only if the app has no Wi-Fi feature.',
  },
  {
    id: 'android.permission.NEARBY_WIFI_DEVICES',
    name: 'Nearby Wi-Fi devices',
    risk: 'medium',
    category: 'network',
    exposes:
      'Lets the app scan for nearby Wi-Fi devices — usable to infer where you ' +
      'are and which places you visit.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Needed by apps that connect to Wi-Fi gadgets. Revoke it for apps that ' +
      'do not connect to nearby devices.',
  },
  {
    id: 'android.permission.BLUETOOTH_SCAN',
    name: 'Scan for Bluetooth devices',
    risk: 'medium',
    category: 'network',
    exposes:
      'Lets the app scan for nearby Bluetooth devices — usable to track your ' +
      'movements via the beacons around you.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Needed by apps that find Bluetooth gadgets. Revoke it for apps that do ' +
      'not use Bluetooth.',
  },
  {
    id: 'android.permission.BLUETOOTH_CONNECT',
    name: 'Connect to Bluetooth devices',
    risk: 'medium',
    category: 'network',
    exposes:
      'Lets the app connect to paired Bluetooth devices such as headphones and ' +
      'watches.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Fine for media and companion apps. Revoke it for apps with no Bluetooth ' +
      'feature.',
  },
  {
    id: 'android.permission.NFC',
    name: 'NFC',
    risk: 'low',
    category: 'network',
    exposes: 'Lets the app use NFC for tap-to-pay and reading NFC tags.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'Usually harmless. No action needed.',
  },

  // --- Other ----------------------------------------------------------------------
  {
    id: 'android.permission.POST_NOTIFICATIONS',
    name: 'Show notifications',
    risk: 'low',
    category: 'other',
    exposes: 'Lets the app show notifications on your phone.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'No privacy risk on its own. Turn it off if the app spams you.',
  },
  {
    id: 'android.permission.SCHEDULE_EXACT_ALARM',
    name: 'Schedule exact alarms',
    risk: 'info',
    category: 'other',
    exposes: 'Lets the app schedule alarms and reminders at exact times.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'No action needed.',
  },
  {
    id: 'android.permission.VIBRATE',
    name: 'Vibrate',
    risk: 'info',
    category: 'other',
    exposes: 'Lets the app vibrate the phone.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'No action needed.',
  },
  {
    id: 'android.permission.WAKE_LOCK',
    name: 'Keep phone awake',
    risk: 'info',
    category: 'other',
    exposes: 'Lets the app keep the screen or processor awake.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'No action needed (it affects battery, not privacy).',
  },
  {
    id: 'android.permission.RECEIVE_BOOT_COMPLETED',
    name: 'Run at startup',
    risk: 'low',
    category: 'other',
    exposes: 'Lets the app start itself when the phone boots.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'Usually harmless. Worth knowing about for apps you rarely use.',
  },
  {
    id: 'android.permission.USE_BIOMETRIC',
    name: 'Biometric unlock',
    risk: 'low',
    category: 'other',
    exposes:
      'Lets the app ask for fingerprint or face unlock. Your biometric data ' +
      'stays in the phone’s secure hardware — the app never sees it.',
    masvs: MASVS_PRIVACY_1,
    guidance: 'No action needed.',
  },
  {
    id: 'android.permission.SYSTEM_ALERT_WINDOW',
    name: 'Draw over other apps',
    risk: 'high',
    category: 'other',
    exposes:
      'Lets the app draw windows on top of other apps — abused for fake login ' +
      'screens and tap-jacking (tricking you into tapping something else).',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Only grant this to apps you fully trust (e.g. chat bubbles, screen ' +
      'filters). Revoke it everywhere else.',
  },
  {
    id: 'android.permission.REQUEST_INSTALL_PACKAGES',
    name: 'Install other apps',
    risk: 'high',
    category: 'other',
    exposes:
      'Lets the app install other apps on your phone — a classic route for ' +
      'unwanted or malicious software.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Only app stores and file managers have a reason to ask for this. Revoke ' +
      'it everywhere else.',
  },
  {
    id: 'android.permission.QUERY_ALL_PACKAGES',
    name: 'See all installed apps',
    risk: 'high',
    category: 'other',
    exposes:
      'Lets the app see the full list of apps installed on your phone — a ' +
      'fingerprint of your interests, habits, and even health or finances.',
    masvs: MASVS_PRIVACY_1,
    guidance:
      'Only launchers, file managers, and security tools (like this scanner) ' +
      'have a reason to ask for this. Revoke it everywhere else.',
  },
  {
    id: 'android.permission.READ_CALENDAR',
    name: 'Read calendar',
    risk: 'medium',
    category: 'other',
    exposes:
      'Lets the app read your calendar events — your schedule, meetings, and ' +
      'appointments.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },
  {
    id: 'android.permission.WRITE_CALENDAR',
    name: 'Modify calendar',
    risk: 'medium',
    category: 'other',
    exposes: 'Lets the app add or change events in your calendar.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },
  {
    id: 'android.permission.GET_ACCOUNTS',
    name: 'See accounts on device',
    risk: 'medium',
    category: 'other',
    exposes:
      'Lets the app see the accounts signed in on your phone, such as your ' +
      'email addresses.',
    masvs: MASVS_PRIVACY_1,
    guidance: REVOKE,
  },
  {
    id: 'com.google.android.gms.permission.AD_ID',
    name: 'Advertising ID',
    risk: 'medium',
    category: 'other',
    exposes:
      'Lets the app read your advertising ID, used to track you across apps ' +
      'for ad targeting.',
    masvs: MASVS_PRIVACY_2,
    guidance:
      'You can also delete your advertising ID entirely: Settings → Privacy → ' +
      'Ads → Delete advertising ID.',
  },
];

const BY_ID = new Map(PERMISSIONS.map((p) => [p.id, p]));

const RISK_LEVELS = ['critical', 'high', 'medium', 'low', 'info'];

const PERMISSION_CATEGORIES = [
  'microphone',
  'location',
  'camera',
  'contacts',
  'messages',
  'calls',
  'storage',
  'sensors',
  'network',
  'other',
];

/**
 * Look up a permission by its Android id. Returns a fallback entry for
 * permissions not in the database (e.g. vendor-specific custom permissions):
 * treated as low risk, never flagged as over-privilege, and shown in the UI
 * as unknown rather than guessed at.
 */
function getPermission(id) {
  const found = BY_ID.get(id);
  if (found) return found;
  const shortName = id.includes('.') ? id.slice(id.lastIndexOf('.') + 1) : id;
  return {
    id,
    name: shortName,
    risk: 'low',
    category: 'other',
    exposes:
      'This permission is not in our database (it may be a vendor-specific ' +
      'custom permission), so we cannot say exactly what it exposes.',
    masvs: null,
    guidance:
      'Look up the permission name in the app’s Play Store listing or privacy ' +
      'policy, and revoke it if the app works without it.',
    unknown: true,
  };
}

function isKnownPermission(id) {
  return BY_ID.has(id);
}

module.exports = {
  PERMISSIONS,
  RISK_LEVELS,
  PERMISSION_CATEGORIES,
  MASVS_PRIVACY_1,
  MASVS_PRIVACY_2,
  getPermission,
  isKnownPermission,
};
