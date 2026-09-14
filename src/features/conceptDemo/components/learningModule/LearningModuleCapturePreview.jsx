import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box, CssBaseline, Stack, ThemeProvider, ToggleButton, ToggleButtonGroup, Typography, createTheme, useTheme } from '@mui/material';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import LearningModuleQuickCaptureV2 from './LearningModuleQuickCaptureV2.jsx';

// Each preset can use its own component later without duplicating capture logic now.
const viewports = {
  mobile: { label: 'Mobile', width: 390, height: 844, icon: PhoneIphoneOutlinedIcon, component: LearningModuleQuickCaptureV2 },
  tablet: { label: 'Tablet', width: 820, height: 1000, icon: TabletMacOutlinedIcon, component: LearningModuleQuickCaptureV2 },
  desktop: { label: 'Desktop', width: 1440, height: 900, icon: DesktopWindowsOutlinedIcon, component: LearningModuleQuickCaptureV2 },
};

const frameHtml = '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html{font-synthesis:none;text-rendering:optimizeLegibility}body{margin:0}*{box-sizing:border-box}</style></head><body><div id="capture-preview-root"></div></body></html>';

export default function LearningModuleCapturePreview(props) {
  const [viewportId, setViewportId] = useState('mobile');
  const [frameDocument, setFrameDocument] = useState(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const stageRef = useRef(null);
  const theme = useTheme();
  const viewport = viewports[viewportId];
  const Capture = viewport.component;
  const scale = availableWidth ? Math.min(1, availableWidth / viewport.width) : 1;

  useEffect(() => {
    const stage = stageRef.current;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const cache = useMemo(() => frameDocument
    ? createCache({ key: 'capture-preview', container: frameDocument.head }) : null, [frameDocument]);
  const frameTheme = useMemo(() => createTheme(theme, {
    components: {
      // Keep dropdowns, tooltips and dialogs inside the simulated viewport.
      ...Object.fromEntries(['MuiPopper', 'MuiPopover', 'MuiModal', 'MuiDialog'].map((name) => [name, {
        defaultProps: { container: () => frameDocument?.body },
      }])),
    },
  }), [theme, frameDocument]);

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 1, flexWrap: 'wrap' }}>
        <ToggleButtonGroup exclusive value={viewportId} aria-label="Capture preview viewport"
          onChange={(_, next) => { if (next) setViewportId(next); }} size="small">
          {Object.entries(viewports).map(([id, preset]) => {
            const Icon = preset.icon;
            return <ToggleButton key={id} value={id} sx={{ minHeight: 44, px: { xs: 1, sm: 1.5 }, gap: 0.75, fontSize: 12, textTransform: 'none' }}>
              <Icon sx={{ fontSize: 17 }} />{preset.label}
            </ToggleButton>;
          })}
        </ToggleButtonGroup>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {viewport.width} × {viewport.height}{scale < 0.99 ? ` · ${Math.round(scale * 100)}%` : ''}
        </Typography>
      </Stack>
      <Box ref={stageRef} sx={{ minWidth: 0, width: '100%' }}>
        <Box sx={{ width: viewport.width * scale, height: viewport.height * scale, mx: 'auto', overflow: 'hidden',
          borderRadius: '12px', outline: '1px solid rgba(var(--sd-text-rgb), 0.12)' }}>
          <iframe title="Lesson capture device preview" srcDoc={frameHtml}
            onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
            style={{ display: 'block', border: 0, width: viewport.width, height: viewport.height,
              transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {frameDocument && cache && createPortal(
              <CacheProvider value={cache}>
                <ThemeProvider theme={frameTheme}>
                  <CssBaseline enableColorScheme />
                  <Box sx={{ p: { xs: 1, sm: 2, lg: 3 }, minHeight: '100vh' }}>
                    <Capture {...props} />
                  </Box>
                </ThemeProvider>
              </CacheProvider>, frameDocument.getElementById('capture-preview-root'))}
          </iframe>
        </Box>
      </Box>
    </Stack>
  );
}
