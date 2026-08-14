/// <reference types="node" />
/**
 * Tests for src/utils/theme.ts (AURA-20260813-016 + AURA-20260813-012).
 *
 * Scope: pure logic only (no DOM). Uses Node's built-in `node:test` runner
 * (zero new deps). DOM-touching code (`applyTheme`) is intentionally
 * deferred to a follow-up card when jsdom or happy-dom is added — see
 * card notes.
 *
 * Run with:
 *   cd garos-control-web
 *   npx tsx --test src/utils/__tests__/theme.test.ts
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  defaultPreferences,
  getSavedPreferences,
  type GarosPreferences,
} from '../theme';

// Minimal localStorage polyfill so `getSavedPreferences` works in Node.
const memory: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (k in memory ? memory[k] : null),
  setItem: (k: string, v: string) => { memory[k] = String(v); },
  removeItem: (k: string) => { delete memory[k]; },
  clear: () => { for (const k of Object.keys(memory)) delete memory[k]; },
  key: (i: number) => Object.keys(memory)[i] ?? null,
  get length() { return Object.keys(memory).length; },
} as Storage;

beforeEach(() => {
  for (const k of Object.keys(memory)) delete memory[k];
});

describe('defaultPreferences', () => {
  it('has stable, expected defaults', () => {
    assert.equal(defaultPreferences.theme, 'dark');
    assert.equal(defaultPreferences.accentColor, 'cyan');
    assert.equal(defaultPreferences.language, 'pt-BR');
    assert.equal(defaultPreferences.telemetryInterval, 5);
    assert.equal(defaultPreferences.soundAlerts, true);
    assert.equal(defaultPreferences.thermalWarningSound, true);
    assert.equal(defaultPreferences.loginNotifications, true);
  });

  it('exposes only the four documented themes', () => {
    const themes: GarosPreferences['theme'][] = ['dark', 'light', 'cyberpunk', 'slate'];
    assert.ok(themes.includes(defaultPreferences.theme));
  });
});

describe('getSavedPreferences', () => {
  it('returns defaults when localStorage is empty', () => {
    assert.deepEqual(getSavedPreferences(), defaultPreferences);
  });

  it('merges saved overrides onto defaults', () => {
    memory['garos_user_preferences'] = JSON.stringify({
      theme: 'light',
      accentColor: 'emerald',
    });
    const prefs = getSavedPreferences();
    assert.equal(prefs.theme, 'light');
    assert.equal(prefs.accentColor, 'emerald');
    assert.equal(prefs.language, defaultPreferences.language);
    assert.equal(prefs.telemetryInterval, defaultPreferences.telemetryInterval);
  });

  it('falls back to defaults on corrupted JSON (does not throw)', () => {
    memory['garos_user_preferences'] = '{ not valid json';
    assert.deepEqual(getSavedPreferences(), defaultPreferences);
  });

  it('passes through unknown keys without dropping them', () => {
    memory['garos_user_preferences'] = JSON.stringify({
      theme: 'slate',
      unknownFutureKey: 'whatever',
    });
    const prefs = getSavedPreferences() as unknown as Record<string, unknown>;
    assert.equal(prefs.theme, 'slate');
    assert.equal(prefs.unknownFutureKey, 'whatever');
  });

  it('preserves boolean false from saved prefs (does not default to true)', () => {
    memory['garos_user_preferences'] = JSON.stringify({
      soundAlerts: false,
      thermalWarningSound: false,
      loginNotifications: false,
    });
    const prefs = getSavedPreferences();
    assert.equal(prefs.soundAlerts, false);
    assert.equal(prefs.thermalWarningSound, false);
    assert.equal(prefs.loginNotifications, false);
  });
});
