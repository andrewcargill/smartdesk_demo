import { Paper, Typography } from '@mui/material';

export default function NowScreen({ screenConfig }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid rgba(23, 21, 26, 0.1)', borderRadius: '14px', p: 2 }}>
      <Typography sx={{ color: '#17151a', fontSize: 16, fontWeight: 800 }}>
        {screenConfig?.title || 'Now'}
      </Typography>
      <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 13.5 }}>
        {screenConfig?.description || 'Placeholder for reusable lesson capture.'}
      </Typography>
    </Paper>
  );
}
