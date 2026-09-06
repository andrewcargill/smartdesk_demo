import { useConceptDemoTeacher } from '../../ConceptDemoTeacherContext.jsx';
import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from '@mui/material';

export default function MentorMessageCell({ student, message, language, hovered, sx }) {
  const [open, setOpen] = useState(false);
  const { teacherName } = useConceptDemoTeacher();
  const sv = language === 'sv';
  const label = sv ? 'Meddelande från mentor' : 'Message from mentor';
  const timestamp = message?.createdAt;
  const legacyDate = message?.createdDate || message?.updatedDate;
  const date = new Date(timestamp || (legacyDate ? `${legacyDate}T12:00:00` : NaN));
  const dateText = Number.isNaN(date.getTime()) ? (sv ? 'Datum saknas' : 'Date unavailable') : new Intl.DateTimeFormat(sv ? 'sv-SE' : 'en-GB', { dateStyle: 'medium', ...(timestamp ? { timeStyle: 'short' } : {}) }).format(date);
  return <Box role="cell" data-learning-module-row-cell="true" sx={{
    display: 'flex', alignItems: 'center', justifyContent: 'center', pr: 2,
    borderTop: hovered ? '1px solid rgba(var(--sd-primary-rgb), 0.34)' : '1px solid rgba(var(--sd-text-rgb), 0.08)',
    borderBottom: hovered ? '1px solid rgba(var(--sd-primary-rgb), 0.22)' : '1px solid transparent',
    bgcolor: hovered ? 'rgba(var(--sd-primary-rgb), 0.045)' : 'var(--sd-surface)',
    transition: 'opacity 160ms ease, filter 160ms ease, background-color 140ms ease, border-color 140ms ease',
    ...sx,
  }}>
    {message && <Tooltip title={label}>
      <IconButton size="small" aria-label={`${label}: ${student.displayName}`} onClick={() => setOpen(true)} sx={{
        color: 'text.secondary', width: 32, height: 32,
        '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: 1 },
      }}>
        <Box aria-hidden="true" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'currentColor' }} />
      </IconButton>
    </Tooltip>}

    <Dialog open={open && Boolean(message)} onClose={() => setOpen(false)} fullWidth maxWidth="sm" aria-labelledby={`mentor-message-${student.id}`}>
      <DialogTitle id={`mentor-message-${student.id}`} sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary', pt: 2.5, pb: 1 }}>
        {label} · {student.displayName}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: { xs: 20, sm: 23 }, fontWeight: 500, color: 'text.primary', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.6, py: 1.5 }}>{message?.text}</Typography>
        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{teacherName} · Mentor</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>{timestamp ? (sv ? 'Skapat' : 'Created') : (sv ? 'Registrerat datum' : 'Recorded date')}: {dateText}{!timestamp && legacyDate ? (sv ? ' · tid saknas' : ' · time not recorded') : ''}</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}><Button color="inherit" size="small" onClick={() => setOpen(false)}>{sv ? 'Stäng' : 'Close'}</Button></DialogActions>
    </Dialog>
  </Box>;
}
