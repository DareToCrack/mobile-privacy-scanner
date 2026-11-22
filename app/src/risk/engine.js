'use strict';

/**
 * Privacy risk engine.
 *
 * Scores are EXPOSURE scores, not accusations: a high score means the app
 * holds a lot of sensitive access, whether or not it misuses it. Whether the
 * access is suspicious is a separate question, answered by the over-privilege
 * flags.
 *
 * Formula (per app, 0–100, higher = riskier):
 *   base  = sum of points for each declared permission
 *           granted:      critical 25, high 15, medium 8, low 3, info 0
 *           requested but not granted: half points, rounded
 *   bonus = over-privilege bonus, capped at 30
 *           +10 per unexpected granted critical/high permission
 *           +5  per unexpected granted medium permission
 *           +5  per unexpected requested (not granted) medium+ permission
 *   score = min(100, base + bonus)
 *
 * Bands: 0–24 Low, 25–49 Medium, 50–74 High, 75–100 Critical.
 *
 * Device score = mean of the per-app scores, rounded.
 */

const { getPermission } = require('../permissions/permission-db');
const { isExpected } = require('./expectations');

const RISK_POINTS = { critical: 25, high: 15, medium: 8, low: 3, info: 0 };
const OVER_PRIVILEGE_CAP = 30;

const BANDS = [
  { max: 24, band: 'Low' },
  { max: 49, band: 'Medium' },
  { max: 74, band: 'High' },
  { max: 100, band: 'Critical' },
];

function bandFor(score) {
  for (const { max, band } of BANDS) {
    if (score <= max) return band;
  }
  return 'Critical';
}

function pointsFor(permission, granted) {
  const full = RISK_POINTS[permission.risk] || 0;
  return granted ? full : Math.round(full / 2);
}

/**
 * Analyze one app.
 * app: { packageName, label, category, isSystem, permissions: [{id, granted}] }
 * Returns { app, score, band, breakdown, findings, overPrivilegeCount }.
 * breakdown: one row per permission with its points and expectation flag.
 * findings: one per permission with risk medium or higher.
 */
function analyzeApp(app) {
  const breakdown = [];
  const findings = [];
  let base = 0;
  let bonus = 0;

  for (const declared of app.permissions || []) {
    const permission = getPermission(declared.id);
    const granted = declared.granted === true;
    const points = pointsFor(permission, granted);
    const unexpected =
      !app.isSystem && !isExpected(app.category, permission);
    const countsForBonus =
      unexpected && permission.risk !== 'low' && permission.risk !== 'info';

    if (countsForBonus) {
      if (granted && (permission.risk === 'critical' || permission.risk === 'high')) {
        bonus += 10;
      } else {
        bonus += 5;
      }
    }

    base += points;
    breakdown.push({
      permissionId: permission.id,
      name: permission.name,
      risk: permission.risk,
      category: permission.category,
      granted,
      points,
      unexpected,
      unknown: permission.unknown === true,
    });

    if (
      permission.risk === 'critical' ||
      permission.risk === 'high' ||
      permission.risk === 'medium'
    ) {
      findings.push({
        appPackage: app.packageName,
        appLabel: app.label,
        appCategory: app.category,
        permissionId: permission.id,
        permissionName: permission.name,
        risk: permission.risk,
        category: permission.category,
        exposes: permission.exposes,
        masvs: permission.masvs,
        guidance: permission.guidance,
        granted,
        overPrivilege: unexpected,
        unknown: permission.unknown === true,
      });
    }
  }

  const cappedBonus = Math.min(OVER_PRIVILEGE_CAP, bonus);
  const score = Math.min(100, base + cappedBonus);
  const overPrivilegeCount = findings.filter((f) => f.overPrivilege).length;

  return {
    app,
    score,
    band: bandFor(score),
    breakdown,
    findings,
    overPrivilegeCount,
    basePoints: base,
    overPrivilegeBonus: cappedBonus,
  };
}

/** Analyze a list of apps and summarize the device. */
function analyzeDevice(apps) {
  const analyzed = (apps || []).map(analyzeApp);
  const total = analyzed.length;
  const score =
    total === 0
      ? 0
      : Math.round(analyzed.reduce((sum, a) => sum + a.score, 0) / total);

  const byBand = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const a of analyzed) byBand[a.band] += 1;

  const findings = analyzed.flatMap((a) => a.findings);
  const findingsByRisk = { critical: 0, high: 0, medium: 0 };
  for (const f of findings) {
    if (findingsByRisk[f.risk] !== undefined) findingsByRisk[f.risk] += 1;
  }

  return {
    analyzed,
    score,
    band: bandFor(score),
    totalApps: total,
    byBand,
    totalFindings: findings.length,
    findingsByRisk,
    overPrivilegedApps: analyzed.filter((a) => a.overPrivilegeCount > 0).length,
    overPrivilegeFindings: findings.filter((f) => f.overPrivilege).length,
    findings,
  };
}

module.exports = {
  RISK_POINTS,
  OVER_PRIVILEGE_CAP,
  BANDS,
  bandFor,
  pointsFor,
  analyzeApp,
  analyzeDevice,
};
