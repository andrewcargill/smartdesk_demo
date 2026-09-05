import { Box, Paper } from '@mui/material';

export function WorkspaceExpandedRowCell({ id, gridColumn, children }) {
  return (
    <Box role="row" sx={{ display: 'contents' }}>
      <Box id={id} role="cell" sx={{ gridColumn, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

export default function WorkspaceExpandedRowPanel({ children }) {
  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: 'var(--sd-surface-muted)', borderTop: '1px solid rgba(var(--sd-text-rgb), 0.07)' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.25, sm: 1.55 },
          borderRadius: '18px',
          border: '6px solid var(--sd-primary)',
          bgcolor: 'var(--sd-surface)',
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
