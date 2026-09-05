import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { renderToString } from 'react-dom/server';
import { Button } from '@mui/material';
import { AppThemeProvider, useColorMode } from '../src/ColorModeContext.jsx';
import { createAppTheme } from '../src/theme/appTheme.js';
import { getSurfaceVariables } from '../src/theme/surfaceVariables.js';
import Home from '../src/components/Home.jsx';
import { conceptDemoTranslations } from '../src/features/conceptDemo/i18n/conceptDemoTranslations.js';

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map((v) => parseInt(v, 16) / 255)
    .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return rgb.reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (high + 0.05) / (low + 0.05);
}

for (const mode of ['light', 'dark']) {
  test(`${mode}: text, status labels, filled controls and focus have sufficient contrast`, () => {
    const theme = createAppTheme(mode);
    const vars = getSurfaceVariables(theme);
    for (const surface of ['surface', 'surface-muted', 'primary-soft']) {
      for (const text of ['text', 'text-muted', 'accent-text', 'warning', 'error', 'success']) {
        const ratio = contrast(vars[`--sd-${surface}`], vars[`--sd-${text}`]);
        assert.ok(ratio >= 4.5, `${text} on ${surface}: ${ratio.toFixed(2)}`);
      }
      assert.ok(contrast(vars['--sd-focus'], vars[`--sd-${surface}`]) >= 3);
      assert.ok(contrast(vars['--sd-chart'], vars[`--sd-${surface}`]) >= 3);
    }
    for (const fill of ['primary', 'primary-hover', 'primary-selected']) {
      assert.ok(contrast(vars['--sd-on-primary'], vars[`--sd-${fill}`]) >= 4.5, fill);
    }
  });
}

test('dark mode retains the original brand colour and neutral surfaces', () => {
  const light = createAppTheme('light');
  const dark = createAppTheme('dark');
  assert.equal(dark.palette.primary.main, '#9c28af');
  assert.equal(dark.palette.primary.main, light.palette.primary.main);
  for (const color of [dark.palette.background.paper, dark.palette.background.default]) {
    const channels = color.slice(1).match(/../g).map((v) => parseInt(v, 16));
    assert.ok(Math.max(...channels) - Math.min(...channels) <= 4);
  }
});

function Probe() {
  const { colorMode } = useColorMode();
  return <><output>{colorMode}</output><Home onNavigate={() => {}} /><Button variant="contained">Action</Button></>;
}
function renderMode(saved, systemDark, storageThrows = false) {
  const original = globalThis.window;
  globalThis.window = {
    localStorage: { getItem: () => { if (storageThrows) throw new Error('Storage unavailable'); return saved; } },
    matchMedia: () => ({ matches: systemDark }),
  };
  try { return renderToString(<AppThemeProvider><Probe /></AppThemeProvider>); }
  finally { if (original === undefined) delete globalThis.window; else globalThis.window = original; }
}

test('saved preference takes precedence over system mode and renders themed CSS', () => {
  for (const mode of ['light', 'dark']) {
    const html = renderMode(mode, mode === 'light');
    assert.ok(html.includes(`<output>${mode}</output>`));
    assert.ok(html.includes(`--sd-surface:${createAppTheme(mode).palette.background.paper}`));
    assert.ok(html.includes('SmartDesk Learning Lab'));
  }
});

test('missing, invalid and inaccessible preferences fall back to the system mode', () => {
  for (const saved of [null, 'invalid']) {
    assert.ok(renderMode(saved, true).includes('<output>dark</output>'));
    assert.ok(renderMode(saved, false).includes('<output>light</output>'));
  }
  assert.ok(renderMode(null, true, true).includes('<output>dark</output>'));
  assert.doesNotThrow(() => renderToString(<AppThemeProvider><Probe /></AppThemeProvider>));
});

test('all CSS colour variables in active home/demo imports are defined in both themes', () => {
  const seen = new Set();
  const variables = new Set();
  function visit(path) {
    path = resolve(path);
    if (seen.has(path) || !existsSync(path) || !['.jsx', '.js'].includes(extname(path))) return;
    seen.add(path);
    const source = readFileSync(path, 'utf8');
    for (const match of source.matchAll(/var\((--sd-[a-z-]+)/g)) variables.add(match[1]);
    for (const match of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) visit(resolve(dirname(path), match[1]));
  }
  ['src/components/Home.jsx', 'src/features/conceptDemo/HomeScreen.jsx', 'src/features/richDataIntro/RichDataIntro.jsx'].forEach(visit);
  assert.ok(seen.size > 50, 'Includes nested demo screens');
  assert.ok(variables.size > 15, 'Includes surface, foreground, status and alpha tokens');
  for (const mode of ['light', 'dark']) {
    const values = getSurfaceVariables(createAppTheme(mode));
    for (const name of variables) assert.ok(values[name], `${mode}: missing ${name}`);
  }
});

test('demo appearance actions are translated in English and Swedish', () => {
  for (const language of ['en', 'sv']) {
    for (const key of ['switchToDarkMode', 'switchToLightMode']) assert.ok(conceptDemoTranslations[language].common[key]);
  }
});
