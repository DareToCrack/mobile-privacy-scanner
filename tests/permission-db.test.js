'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  PERMISSIONS,
  RISK_LEVELS,
  PERMISSION_CATEGORIES,
  MASVS_PRIVACY_1,
  MASVS_PRIVACY_2,
  getPermission,
  isKnownPermission,
} = require('../app/src/permissions/permission-db');

const VERIFIED_MASVS = new Set([MASVS_PRIVACY_1, MASVS_PRIVACY_2]);

test('database covers at least 40 permissions', () => {
  assert.ok(PERMISSIONS.length >= 40, `only ${PERMISSIONS.length} permissions`);
});

test('every permission has all required fields', () => {
  for (const p of PERMISSIONS) {
    assert.equal(typeof p.id, 'string', `${p.id}: id`);
    assert.ok(p.id.length > 0);
    assert.equal(typeof p.name, 'string', `${p.id}: name`);
    assert.ok(p.name.length > 0);
    assert.equal(typeof p.exposes, 'string', `${p.id}: exposes`);
    assert.ok(p.exposes.length > 20, `${p.id}: exposes too short`);
    assert.equal(typeof p.guidance, 'string', `${p.id}: guidance`);
    assert.ok(p.guidance.length > 10, `${p.id}: guidance too short`);
  }
});

test('every risk level is valid', () => {
  for (const p of PERMISSIONS) {
    assert.ok(RISK_LEVELS.includes(p.risk), `${p.id}: bad risk ${p.risk}`);
  }
});

test('every category is valid', () => {
  for (const p of PERMISSIONS) {
    assert.ok(
      PERMISSION_CATEGORIES.includes(p.category),
      `${p.id}: bad category ${p.category}`,
    );
  }
});

test('no duplicate permission ids', () => {
  const ids = PERMISSIONS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every MASVS reference is a verified control id (or null)', () => {
  for (const p of PERMISSIONS) {
    if (p.masvs === null || p.masvs === undefined) continue;
    assert.ok(
      VERIFIED_MASVS.has(p.masvs),
      `${p.id}: unverified MASVS reference ${p.masvs}`,
    );
  }
});

test('RECORD_AUDIO is critical / microphone', () => {
  const p = getPermission('android.permission.RECORD_AUDIO');
  assert.equal(p.risk, 'critical');
  assert.equal(p.category, 'microphone');
  assert.equal(p.masvs, MASVS_PRIVACY_1);
});

test('precise location is critical, background location is critical', () => {
  assert.equal(getPermission('android.permission.ACCESS_FINE_LOCATION').risk, 'critical');
  assert.equal(
    getPermission('android.permission.ACCESS_BACKGROUND_LOCATION').risk,
    'critical',
  );
  assert.equal(getPermission('android.permission.ACCESS_COARSE_LOCATION').risk, 'high');
});

test('READ_SMS and READ_CALL_LOG are critical', () => {
  assert.equal(getPermission('android.permission.READ_SMS').risk, 'critical');
  assert.equal(getPermission('android.permission.READ_CALL_LOG').risk, 'critical');
});

test('INTERNET is informational', () => {
  const p = getPermission('android.permission.INTERNET');
  assert.equal(p.risk, 'info');
  assert.equal(p.category, 'network');
});

test('identifier permissions map to MASVS-PRIVACY-2', () => {
  assert.equal(
    getPermission('android.permission.READ_PHONE_STATE').masvs,
    MASVS_PRIVACY_2,
  );
  assert.equal(
    getPermission('com.google.android.gms.permission.AD_ID').masvs,
    MASVS_PRIVACY_2,
  );
});

test('unknown permissions get a safe fallback, never a guessed risk', () => {
  const p = getPermission('com.vendor.CUSTOM_PERMISSION');
  assert.equal(p.unknown, true);
  assert.equal(p.risk, 'low');
  assert.equal(p.masvs, null);
  assert.ok(p.exposes.includes('not in our database'));
  assert.equal(isKnownPermission('com.vendor.CUSTOM_PERMISSION'), false);
});

test('isKnownPermission recognizes real permissions', () => {
  assert.equal(isKnownPermission('android.permission.CAMERA'), true);
  assert.equal(isKnownPermission('android.permission.BODY_SENSORS'), true);
});
