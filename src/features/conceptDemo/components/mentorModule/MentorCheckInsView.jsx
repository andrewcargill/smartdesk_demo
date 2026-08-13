import { Box, Paper, Stack, Typography } from '@mui/material';
import { border, CheckInTimeline, darkText, formatDate } from './mentorModuleShared.jsx';

export default function MentorCheckInsView({ picture }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Check-ins</Typography>
      <CheckInTimeline checkIns={picture.checkIns} />
      <Stack component="ul" spacing={0.45} sx={{ m: 0, mt: 0.7, p: 0, listStyle: 'none' }}>
        {(picture.checkIns || []).map((checkIn) => (
          <Box key={checkIn.id} component="li" sx={{ display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr)', gap: 0.6, py: 0.4, borderTop: '1px solid rgba(23, 21, 26, 0.06)' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 780 }}>{formatDate(checkIn.date)}</Typography>
            <Typography sx={{ color: checkIn.comment ? darkText : 'text.secondary', fontSize: 12.2, fontWeight: checkIn.comment ? 820 : 680 }}>{checkIn.comment || 'Check-in logged'}</Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
