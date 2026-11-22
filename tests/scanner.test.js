'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getDemoApps, DEMO_APPS } = require('../app/src/scanner/demo-inventory');
const {
  scanDevice,
  normalizeNativeApps,
  IOS_MESSAGE,
} = require('../app/src/scanner');
const { APP_CATEGORIES } = require('../app/src/risk/expectations');

test('demo inventory has 17 apps', () => {
  assert.equal(DEMO_APPS.length, 17);
});

test('every demo app has valid required fields', () => {
  for (const a of DEMO_APPS) {
    assert.equal(typeof a.packageName, 'string');
    assert.ok(a.packageName.length > 0);
    assert.equal(typeof a.label, 'string');
    assert.ok(APP_CATEGORIES.includes(a.category), `${a.label}: bad category ${a.category}`);
    assert.equal(typeof a.isSystem, 'boolean');
    assert.ok(Array.isArray(a.permissions));
    assert.ok(a.permissions.length > 0, `${a.label}: no permissions`);
    for (const p of a.permissions) {
      assert.equal(typeof p.id, 'string');
      assert.equal(typeof p.granted, 'boolean');
    }
  }
});

test('demo inventory package names are unique', () => {
  const names = DEMO_APPS.map((a) => a.packageName);
  assert.equal(new Set(names).size, names.length);
});

test('demo inventory includes the over-privilege showcases', () => {
  const flashlight = DEMO_APPS.find((a) => a.label === 'FlashLight Pro');
  const ids = flashlight.permissions.map((p) => p.id);
  assert.ok(ids.includes('android.permission.ACCESS_FINE_LOCATION'));
  assert.ok(ids.includes('android.permission.RECORD_AUDIO'));
  assert.ok(ids.includes('android.permission.READ_CONTACTS'));

  const calc = DEMO_APPS.find((a) => a.label === 'CalcPlus');
  assert.ok(calc.permissions.some((p) => p.id === 'android.permission.READ_SMS'));
});

test('demo inventory includes system apps and requested-not-granted permissions', () => {
  assert.ok(DEMO_APPS.some((a) => a.isSystem));
  assert.ok(
    DEMO_APPS.some((a) => a.permissions.some((p) => p.granted === false)),
    'expected at least one requested-but-not-granted permission',
  );
});

test('getDemoApps returns a deep copy', () => {
  const first = getDemoApps();
  first[0].label = 'MUTATED';
  first[0].permissions.push({ id: 'android.permission.CAMERA', granted: true });
  const second = getDemoApps();
  assert.notEqual(second[0].label, 'MUTATED');
  assert.equal(second[0].permissions.length, DEMO_APPS[0].permissions.length);
});

test('scanDevice on web returns demo data', async () => {
  const result = await scanDevice({ platform: 'web', nativeScanner: null });
  assert.equal(result.source, 'demo');
  assert.equal(result.platform, 'web');
  assert.equal(result.apps.length, 17);
  assert.ok(result.scannedAt);
});

test('scanDevice on android without a native module returns demo data', async () => {
  const result = await scanDevice({ platform: 'android', nativeScanner: null });
  assert.equal(result.source, 'demo');
  assert.equal(result.apps.length, 17);
});

test('scanDevice on ios is unavailable with an honest explanation', async () => {
  const result = await scanDevice({ platform: 'ios', nativeScanner: null });
  assert.equal(result.source, 'unavailable');
  assert.equal(result.reason, 'ios');
  assert.equal(result.apps.length, 0);
  assert.ok(result.message.includes('iOS'));
  assert.equal(result.message, IOS_MESSAGE);
});

test('scanDevice on ios with forceDemo returns demo data', async () => {
  const result = await scanDevice({
    platform: 'ios',
    nativeScanner: null,
    forceDemo: true,
  });
  assert.equal(result.source, 'demo');
  assert.equal(result.apps.length, 17);
});

test('scanDevice with a working native scanner returns live data', async () => {
  const nativeScanner = {
    getInstalledApps: async () => [
      {
        packageName: 'com.example.one',
        label: 'Example One',
        category: 'tools',
        isSystemApp: false,
        permissions: [
          { name: 'android.permission.CAMERA', granted: true },
          { name: 'android.permission.INTERNET', granted: true },
        ],
      },
    ],
  };
  const result = await scanDevice({ platform: 'android', nativeScanner });
  assert.equal(result.source, 'live');
  assert.equal(result.apps.length, 1);
  assert.equal(result.apps[0].label, 'Example One');
  assert.equal(result.apps[0].permissions[0].id, 'android.permission.CAMERA');
  assert.equal(result.apps[0].permissions[0].granted, true);
});

test('scanDevice falls back to demo when the native scan throws', async () => {
  const nativeScanner = {
    getInstalledApps: async () => {
      throw new Error('permission denied');
    },
  };
  const result = await scanDevice({ platform: 'android', nativeScanner });
  assert.equal(result.source, 'demo');
  assert.equal(result.fallbackFromLive, true);
  assert.equal(result.apps.length, 17);
});

test('normalizeNativeApps maps native rows to the app shape', () => {
  const rows = normalizeNativeApps([
    {
      packageName: 'com.example.sys',
      label: null,
      category: 'navigation',
      isSystemApp: true,
      permissions: [{ name: 'android.permission.ACCESS_FINE_LOCATION', granted: false }],
    },
    {
      packageName: 'com.example.min',
      permissions: [],
    },
  ]);
  assert.equal(rows[0].label, 'com.example.sys'); // label falls back to package
  assert.equal(rows[0].isSystem, true);
  assert.equal(rows[0].permissions[0].granted, false);
  assert.equal(rows[1].category, 'tools'); // missing category defaults to tools
  assert.equal(rows[1].isSystem, false);
  assert.deepEqual(rows[1].permissions, []);
});
