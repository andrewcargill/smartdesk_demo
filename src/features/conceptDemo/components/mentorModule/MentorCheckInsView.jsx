import { useState } from 'react';
import { Box, Button, ButtonBase, Dialog, DialogContent, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { border, darkText, formatDate, purple } from './mentorModuleShared.jsx';
import { CheckInStatusIcon, checkInStatusOptions, getCheckInStatusMeta } from './mentorCheckInStatus.jsx';

const statusRows = [
  { status: 'positive', top: 34 },
  { status: 'neutral', top: 68 },
  { status: 'negative', top: 102 },
];

function CheckInTimeline({ checkIns }) {
  const checkInDates = (checkIns || []).map((checkIn) => new Date(`${checkIn.date}T12:00:00`).getTime());
  const startDate = new Date('2026-01-01T12:00:00');
  const latestDate = new Date(Math.max(new Date('2026-05-31T12:00:00').getTime(), ...checkInDates));
  const endDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0, 12);
  const start = startDate.getTime();
  const end = endDate.getTime();
  const months = [];

  for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
    months.push(new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date));
  }

  const points = (checkIns || []).map((checkIn) => {
    const time = new Date(`${checkIn.date}T12:00:00`).getTime();
    const left = Math.max(2, Math.min(98, ((time - start) / (end - start)) * 100));
    const plotLeft = Number((left * 0.96).toFixed(2));
    const meta = getCheckInStatusMeta(checkIn.status);
    const row = statusRows.find((item) => item.status === checkIn.status) || statusRows[1];

    return {
      checkIn,
      meta,
      row,
      plotLeft,
      svgY: row.top - 20,
    };
  });
  const linePoints = points.map((point) => `${point.plotLeft},${point.svgY}`).join(' ');

  return (
    <Box sx={{ position: 'relative', height: 136, pl: 3.2, pr: 0.4, mt: 0.2 }}>
      <Box sx={{ ml: '28px', mr: '4px', display: 'grid', gridTemplateColumns: `repeat(${months.length}, 1fr)`, color: 'text.secondary', fontSize: 11.2, fontWeight: 760 }}>
        {months.map((month) => <Box key={month}>{month}</Box>)}
      </Box>
      {statusRows.map(({ status, top }) => (
        <Box key={status}>
          <Box sx={{ position: 'absolute', left: 0, top: top - 9, width: 20, height: 20, display: 'grid', placeItems: 'center' }}>
            <CheckInStatusIcon status={status} size={16} />
          </Box>
        </Box>
      ))}
      <Box
        component="svg"
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        sx={{ position: 'absolute', left: 28, right: 4, top: 20, height: 96, width: 'calc(100% - 32px)', overflow: 'visible', pointerEvents: 'none' }}
      >
        {statusRows.map((row) => (
          <line key={row.status} x1="0" y1={row.top - 20} x2="96" y2={row.top - 20} stroke="rgba(23, 21, 26, 0.055)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1="0" y1="14" x2="0" y2="82" stroke="rgba(23, 21, 26, 0.1)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
        {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(156, 40, 175, 0.34)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
      </Box>
      {points.map(({ checkIn, meta, row, plotLeft }) => {
        return (
          <Tooltip
            key={checkIn.id}
            arrow
            placement="top"
            title={(
              <Box>
                <Typography sx={{ color: 'inherit', fontSize: 11.5, fontWeight: 850 }}>
                  {formatDate(checkIn.date)} 
                </Typography>
                {checkIn.comment && (
                  <Typography sx={{ mt: 0.25, color: 'inherit', fontSize: 11.2, lineHeight: 1.3 }}>
                    {checkIn.comment}
                  </Typography>
                )}
              </Box>
            )}
          >
            <Box
              sx={{
                position: 'absolute',
                left: `calc(28px + ${plotLeft}%)`,
                top: row.top - 6,
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: purple,
                transform: 'translateX(-50%)',
                border: '2px solid #fff',
                boxShadow: '0 0 0 2px rgba(156, 40, 175, 0.14)',
                cursor: 'default',
                transition: 'transform 140ms ease, box-shadow 140ms ease',
                '&:hover': {
                  transform: 'translateX(-50%) scale(1.18)',
                  boxShadow: '0 0 0 4px rgba(156, 40, 175, 0.16)',
                },
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}

function QuickAddCheckInDialog({ open, onClose, onAddCheckIn }) {
  const [comment, setComment] = useState('');

  function closeDialog() {
    setComment('');
    onClose();
  }

  function addCheckIn(status) {
    onAddCheckIn?.(status, comment.trim());
    closeDialog();
  }

  return (
    <Dialog open={open} onClose={closeDialog} PaperProps={{ sx: { borderRadius: '8px', width: 320 } }}>
      <DialogContent sx={{ p: 1.2 }}>
        <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Add check-in</Typography>
        <TextField
          label="Comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          multiline
          minRows={2}
          size="small"
          fullWidth
          sx={{ mt: 1 }}
        />
        <Box sx={{ mt: 0.7, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.5 }}>
          {Object.entries(checkInStatusOptions).map(([status, meta]) => (
            <ButtonBase
              key={status}
              type="button"
              onClick={() => addCheckIn(status)}
              sx={{
                height: 54,
                minWidth: 0,
                borderRadius: '8px',
                color: 'text.secondary',
                bgcolor: '#fff',
                border: '1px solid rgba(23, 21, 26, 0.1)',
                '&:hover': { bgcolor: 'rgba(23, 21, 26, 0.045)' },
                '&:focus-visible': { outline: '2px solid rgba(156, 40, 175, 0.72)', outlineOffset: 2 },
              }}
            >
              <Stack spacing={0.25} alignItems="center">
                <CheckInStatusIcon status={status} size={22} />
                <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 850 }}>{meta.shortLabel}</Typography>
              </Stack>
            </ButtonBase>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function MentorCheckInsView({ picture, onAddCheckIn }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Check-ins</Typography>
            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1, lineHeight: 1.35 }}>
              Quick status marks for recent mentor contact.
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(true)} sx={{ flexShrink: 0, borderRadius: '8px', color: 'text.secondary', borderColor: 'rgba(23, 21, 26, 0.14)', textTransform: 'none', fontWeight: 850 }}>
            Check-in
          </Button>
        </Stack>
        <CheckInTimeline checkIns={picture.checkIns} />
      </Stack>
      <QuickAddCheckInDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAddCheckIn={onAddCheckIn} />
    </Paper>
  );
}
