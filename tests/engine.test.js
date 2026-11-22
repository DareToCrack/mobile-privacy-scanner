'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { analyzeApp, analyzeDevice, bandFor } = require('../app/src/risk/engine');
const { getDemoApps } = require('../app/src/scanner/demo-inventory');

function app(overrides = {}) {
  return {
    packageName: 'com.example.test',
    label: 'Test App',
    category: 'messaging',
    isSystem: false,
    permissions: [],
    ...overrides,
  };
}

function decl(id, granted = true) {
  return { id, granted };
}

test('an app with no permissions scores 0 / Low', () => {
  const result = analyzeApp(app());
  assert.equal(result.score, 0);
  assert.equal(result.band, 'Low');
  assert.equal(result.findings.length, 0);
  assert.equal(result.breakdown.length, 0);
});

test('one granted critical permission scores 25', () => {
  const result = analyzeApp(
    app({ permissions: [decl('android.permission.RECORD_AUDIO')] }),
  );
  assert.equal(result.score, 25);
  assert.equal(result.band, 'Medium');
  assert.equal(result.basePoints, 25);
  assert.equal(result.overPrivilegeBonus, 0);
});

test('requested-but-not-granted counts half points, rounded', () => {
  const result = analyzeApp(
    app({ permissions: [decl('android.permission.RECORD_AUDIO', false)] }),
  );
  assert.equal(result.score, 13); // round(25 / 2)
  const high = analyzeApp(
    app({ permissions: [decl('android.permission.CAMERA', false)] }),
  );
  assert.equal(high.score, 8); // round(15 / 2)
});

test('score caps at 100', () => {
  const result = analyzeApp(
    app({
      category: 'tools',
      permissions: [
        decl('android.permission.RECORD_AUDIO'),
        decl('android.permission.ACCESS_FINE_LOCATION'),
        decl('android.permission.READ_SMS'),
        decl('android.permission.READ_CALL_LOG'),
        decl('android.permission.CAMERA'),
        decl('android.permission.READ_CONTACTS'),
      ],
    }),
  );
  assert.equal(result.score, 100);
  assert.equal(result.band, 'Critical');
});

test('band boundaries', () => {
  assert.equal(bandFor(0), 'Low');
  assert.equal(bandFor(24), 'Low');
  assert.equal(bandFor(25), 'Medium');
  assert.equal(bandFor(49), 'Medium');
  assert.equal(bandFor(50), 'High');
  assert.equal(bandFor(74), 'High');
  assert.equal(bandFor(75), 'Critical');
  assert.equal(bandFor(100), 'Critical');
});

test('over-privilege bonus: flashlight with location + mic', () => {
  const result = analyzeApp(
    app({
      category: 'tools',
      label: 'FlashLight',
      permissions: [
        decl('android.permission.CAMERA'), // expected (torch)
        decl('android.permission.ACCESS_FINE_LOCATION'), // +10
        decl('android.permission.RECORD_AUDIO'), // +10
        decl('android.permission.READ_CONTACTS'), // +10
      ],
    }),
  );
  assert.equal(result.basePoints, 80);
  assert.equal(result.overPrivilegeBonus, 30);
  assert.equal(result.score, 100);
  assert.equal(result.overPrivilegeCount, 3);
});

test('over-privilege bonus caps at 30', () => {
  const result = analyzeApp(
    app({
      category: 'tools',
      permissions: [
        decl('android.permission.ACCESS_FINE_LOCATION'),
        decl('android.permission.RECORD_AUDIO'),
        decl('android.permission.READ_SMS'),
        decl('android.permission.READ_CALL_LOG'),
        decl('android.permission.READ_CONTACTS'),
        decl('android.permission.CAMERA'),
      ],
    }),
  );
  assert.equal(result.overPrivilegeBonus, 30);
});

test('no bonus when every permission is expected', () => {
  const result = analyzeApp(
    app({
      permissions: [
        decl('android.permission.RECORD_AUDIO'),
        decl('android.permission.CAMERA'),
        decl('android.permission.READ_CONTACTS'),
      ],
    }),
  );
  assert.equal(result.overPrivilegeBonus, 0);
  assert.equal(result.overPrivilegeCount, 0);
});

test('system apps get no over-privilege bonus', () => {
  const result = analyzeApp(
    app({
      category: 'system',
      isSystem: true,
      permissions: [
        decl('android.permission.RECORD_AUDIO'),
        decl('android.permission.READ_SMS'),
      ],
    }),
  );
  assert.equal(result.overPrivilegeBonus, 0);
  assert.equal(result.overPrivilegeCount, 0);
});

test('unexpected medium permission adds +5, requested unexpected adds +5', () => {
  const grantedMedium = analyzeApp(
    app({
      category: 'tools',
      permissions: [decl('android.permission.READ_CALENDAR')],
    }),
  );
  assert.equal(grantedMedium.overPrivilegeBonus, 5);
  const requestedCritical = analyzeApp(
    app({
      category: 'tools',
      permissions: [decl('android.permission.ACCESS_FINE_LOCATION', false)],
    }),
  );
  assert.equal(requestedCritical.overPrivilegeBonus, 5);
  assert.equal(requestedCritical.basePoints, 13);
});

test('findings are generated only for medium+ permissions', () => {
  const result = analyzeApp(
    app({
      permissions: [
        decl('android.permission.RECORD_AUDIO'), // critical -> finding
        decl('android.permission.READ_MEDIA_IMAGES'), // medium -> finding
        decl('android.permission.POST_NOTIFICATIONS'), // low -> no finding
        decl('android.permission.INTERNET'), // info -> no finding
      ],
    }),
  );
  assert.equal(result.findings.length, 2);
  assert.deepEqual(
    result.findings.map((f) => f.permissionId).sort(),
    ['android.permission.READ_MEDIA_IMAGES', 'android.permission.RECORD_AUDIO'],
  );
});

test('findings carry the over-privilege flag and MASVS reference', () => {
  const result = analyzeApp(
    app({
      category: 'tools',
      permissions: [decl('android.permission.ACCESS_FINE_LOCATION')],
    }),
  );
  assert.equal(result.findings.length, 1);
  const finding = result.findings[0];
  assert.equal(finding.overPrivilege, true);
  assert.equal(finding.masvs, 'MASVS-PRIVACY-1');
  assert.equal(finding.granted, true);
  assert.ok(finding.exposes.length > 20);
  assert.ok(finding.guidance.length > 10);
});

test('breakdown rows match the declared permissions', () => {
  const result = analyzeApp(
    app({
      permissions: [
        decl('android.permission.CAMERA'),
        decl('android.permission.INTERNET'),
      ],
    }),
  );
  assert.equal(result.breakdown.length, 2);
  assert.equal(result.breakdown[0].points, 15);
  assert.equal(result.breakdown[1].points, 0);
});

test('device score is the mean of app scores', () => {
  const device = analyzeDevice([
    app({ packageName: 'a', permissions: [] }),
    app({
      packageName: 'b',
      permissions: [decl('android.permission.RECORD_AUDIO')],
    }),
  ]);
  assert.equal(device.score, 13); // round((0 + 25) / 2)
  assert.equal(device.totalApps, 2);
});

test('empty device scores 0', () => {
  const device = analyzeDevice([]);
  assert.equal(device.score, 0);
  assert.equal(device.totalApps, 0);
  assert.equal(device.totalFindings, 0);
});

test('demo inventory: device summary matches hand-computed values', () => {
  const device = analyzeDevice(getDemoApps());
  assert.equal(device.totalApps, 17);
  assert.equal(device.score, 51);
  assert.equal(device.band, 'High');
  assert.deepEqual(device.byBand, { Critical: 4, High: 5, Medium: 6, Low: 2 });
  assert.equal(device.totalFindings, 45);
  assert.deepEqual(device.findingsByRisk, { critical: 17, high: 19, medium: 9 });
  assert.equal(device.overPrivilegedApps, 5);
  assert.equal(device.overPrivilegeFindings, 10);
});

test('demo inventory: FlashLight Pro is the worst app', () => {
  const device = analyzeDevice(getDemoApps());
  const worst = device.analyzed.reduce((a, b) => (b.score > a.score ? b : a));
  assert.equal(worst.app.label, 'FlashLight Pro');
  assert.equal(worst.score, 100);
  assert.equal(worst.overPrivilegeCount, 3);
});

test('demo inventory: NotePad+ is clean', () => {
  const device = analyzeDevice(getDemoApps());
  const notes = device.analyzed.find((a) => a.app.label === 'NotePad+');
  assert.equal(notes.score, 11);
  assert.equal(notes.band, 'Low');
  assert.equal(notes.overPrivilegeCount, 0);
});
