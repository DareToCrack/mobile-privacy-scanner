'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getPermission } = require('../app/src/permissions/permission-db');
const { isExpected, APP_CATEGORIES } = require('../app/src/risk/expectations');

function perm(id) {
  return getPermission(id);
}

test('flashlight (tools) holding location is unexpected', () => {
  assert.equal(
    isExpected('tools', perm('android.permission.ACCESS_FINE_LOCATION')),
    false,
  );
});

test('flashlight (tools) holding microphone is unexpected', () => {
  assert.equal(isExpected('tools', perm('android.permission.RECORD_AUDIO')), false);
});

test('flashlight (tools) holding camera is expected (torch)', () => {
  assert.equal(isExpected('tools', perm('android.permission.CAMERA')), true);
});

test('messaging app holding microphone is expected', () => {
  assert.equal(isExpected('messaging', perm('android.permission.RECORD_AUDIO')), true);
});

test('messaging app holding contacts is expected', () => {
  assert.equal(isExpected('messaging', perm('android.permission.READ_CONTACTS')), true);
});

test('messaging app holding location is unexpected', () => {
  assert.equal(
    isExpected('messaging', perm('android.permission.ACCESS_FINE_LOCATION')),
    false,
  );
});

test('navigation app holding background location is expected', () => {
  assert.equal(
    isExpected('navigation', perm('android.permission.ACCESS_BACKGROUND_LOCATION')),
    true,
  );
});

test('system apps are never flagged', () => {
  for (const id of [
    'android.permission.RECORD_AUDIO',
    'android.permission.READ_SMS',
    'android.permission.QUERY_ALL_PACKAGES',
    'android.permission.SYSTEM_ALERT_WINDOW',
  ]) {
    assert.equal(isExpected('system', perm(id)), true, id);
  }
});

test('harmless permissions are expected everywhere', () => {
  for (const id of [
    'android.permission.INTERNET',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.VIBRATE',
    'android.permission.USE_BIOMETRIC',
  ]) {
    for (const category of APP_CATEGORIES) {
      assert.equal(isExpected(category, perm(id)), true, `${category} / ${id}`);
    }
  }
});

test('QUERY_ALL_PACKAGES is unexpected for social, expected for tools', () => {
  assert.equal(
    isExpected('social', perm('android.permission.QUERY_ALL_PACKAGES')),
    false,
  );
  assert.equal(
    isExpected('tools', perm('android.permission.QUERY_ALL_PACKAGES')),
    true,
  );
});

test('draw-over-apps is unexpected for games', () => {
  assert.equal(
    isExpected('games', perm('android.permission.SYSTEM_ALERT_WINDOW')),
    false,
  );
});

test('calendar access is expected for productivity, unexpected for games', () => {
  assert.equal(
    isExpected('productivity', perm('android.permission.READ_CALENDAR')),
    true,
  );
  assert.equal(isExpected('games', perm('android.permission.READ_CALENDAR')), false);
});

test('unknown permissions are never flagged', () => {
  assert.equal(isExpected('games', perm('com.vendor.CUSTOM_PERMISSION')), true);
});

test('unknown app categories are never flagged', () => {
  assert.equal(
    isExpected('something-new', perm('android.permission.RECORD_AUDIO')),
    true,
  );
});

test('health app holding body sensors is expected', () => {
  assert.equal(isExpected('health', perm('android.permission.BODY_SENSORS')), true);
});

test('finance app holding SMS is expected (OTP autofill)', () => {
  assert.equal(isExpected('finance', perm('android.permission.READ_SMS')), true);
});
