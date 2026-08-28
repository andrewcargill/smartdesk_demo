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
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.25, sm: 1.55 },
          borderRadius: '18px',
          border: '6px solid #9c28af',
          bgcolor: '#fff',
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
