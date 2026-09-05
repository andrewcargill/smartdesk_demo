import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { border, darkText, getWeekOrDate, purple } from './mentorModuleShared.jsx';

export function NextFollowUpCard({ nextFollowUp }) {
  return (
    <Box sx={{ p: 0.85, borderRadius: '8px', border: '1px solid rgba(var(--sd-text-rgb), 0.08)', bgcolor: 'var(--sd-surface)' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 780 }}>Next follow-up</Typography>
      {nextFollowUp ? (
        <>
          <Typography sx={{ mt: 0.45, color: darkText, fontSize: 12.6, fontWeight: 850, lineHeight: 1.25 }}>
            {nextFollowUp.label}
          </Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.7, lineHeight: 1.25 }}>
            {getWeekOrDate(nextFollowUp)}
          </Typography>
        </>
      ) : (
        <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 12.6, fontWeight: 760, lineHeight: 1.25 }}>
          None planned
        </Typography>
      )}
    </Box>
  );
}

export default function MentorFollowUpView({ picture }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: 'var(--sd-surface)' }}>
      <Stack direction="row" spacing={0.55} alignItems="center">
        <EventAvailableIcon sx={{ color: 'var(--sd-accent-text)', fontSize: 18 }} />
        <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Upcoming</Typography>
      </Stack>
      {picture.followUps.length ? (
        <Stack component="ul" spacing={0.55} sx={{ m: 0, mt: 0.8, p: 0, listStyle: 'none' }}>
          {picture.followUps.map((item) => (
            <Box key={item.id} component="li" sx={{ display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr)', gap: 0.65, py: 0.55, borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.07)' }}>
              <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 780 }}>{getWeekOrDate(item)}</Typography>
              <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 820 }}>{item.label}{item.completed ? ' · Completed' : ''}</Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography sx={{ mt: 0.8, color: 'text.secondary', fontSize: 12.5 }}>No upcoming follow-up.</Typography>
      )}
    </Paper>
  );
}
