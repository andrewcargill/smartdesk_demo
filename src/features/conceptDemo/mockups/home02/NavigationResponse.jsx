import { cloneElement, isValidElement } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

export default function NavigationResponse({ navigation, onReset }) {
  return <Box component="section" aria-labelledby="navigation-response-title" sx={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 4, bgcolor: 'var(--sd-surface-muted)', overflow: 'hidden' }}>
    <Box sx={{ px: 2.5, py: 2 }}>
      <Typography id="navigation-response-title" component="h2" sx={{ fontSize: 20, fontWeight: 500 }}>Your workspace</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>Choose a subject, open a module, or look at your week.</Typography>
    </Box>
    <Box component="nav" aria-label="Workspace navigation" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin', px: { xs: 2, sm: 3 }, py: 2 }}>
      {isValidElement(navigation) ? cloneElement(navigation, { spacious: true }) : navigation}
    </Box>
    <Stack direction="row" justifyContent="center" sx={{ p: 1.25, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
      <Button size="small" color="inherit" onClick={onReset}>Thanks</Button>
    </Stack>
  </Box>;
}
