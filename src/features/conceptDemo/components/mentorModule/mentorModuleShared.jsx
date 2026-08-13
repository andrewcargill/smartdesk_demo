import { Box, ButtonBase, Chip, Paper, Stack, Typography } from '@mui/material';

export const purple = '#9c28af';
export const darkText = '#17151a';
export const border = 'rgba(23, 21, 26, 0.1)';

export const subjectIds = ['english', 'mathematics', 'swedish', 'physical-education', 'music'];

export const statusOptions = {
  green: { label: 'Green', color: '#2f7d50', bg: 'rgba(47, 125, 80, 0.1)', border: 'rgba(47, 125, 80, 0.24)' },
  orange: { label: 'Orange', color: '#b85c00', bg: 'rgba(184, 92, 0, 0.11)', border: 'rgba(184, 92, 0, 0.26)' },
  red: { label: 'Red', color: '#b42318', bg: 'rgba(180, 35, 24, 0.1)', border: 'rgba(180, 35, 24, 0.24)' },
};

export function getLocalizedValue(value) {
  if (value && typeof value === 'object') {
    return value.en || Object.values(value)[0] || '';
  }

  return value || '';
}

export function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

export function getWeekOrDate(item) {
  return item.week || formatDate(item.date);
}

export function getStatusMeta(status) {
  return statusOptions[status] || statusOptions.green;
}

export function StatusDot({ status, size = 12, title = '' }) {
  const meta = getStatusMeta(status);
  return (
    <Box
      component="span"
      title={title || meta.label}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: meta.color,
        boxShadow: `0 0 0 3px ${meta.bg}`,
        flexShrink: 0,
      }}
    />
  );
}

export function StatusControl({ label, value, onChange }) {
  return (
    <Box>
      <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 780, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={0.45} sx={{ mt: 0.55 }}>
        {Object.entries(statusOptions).map(([status, meta]) => {
          const selected = value === status;
          return (
            <ButtonBase
              key={status}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(status)}
              sx={{
                minWidth: 34,
                height: 28,
                px: 0.7,
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selected ? meta.border : 'rgba(23, 21, 26, 0.11)',
                bgcolor: selected ? meta.bg : '#fff',
                color: selected ? meta.color : 'text.secondary',
                fontSize: 11.3,
                fontWeight: 850,
                '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
              }}
            >
              {meta.label}
            </ButtonBase>
          );
        })}
      </Stack>
    </Box>
  );
}

export function CheckInTimeline({ checkIns }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const start = new Date('2026-01-01T12:00:00').getTime();
  const end = new Date('2026-05-31T12:00:00').getTime();

  return (
    <Box sx={{ position: 'relative', height: 76, px: 0.4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${months.length}, 1fr)`, color: 'text.secondary', fontSize: 11.2, fontWeight: 760 }}>
        {months.map((month) => <Box key={month}>{month}</Box>)}
      </Box>
      <Box sx={{ position: 'absolute', left: 4, right: 4, top: 45, height: 1 }}>
        <Box sx={{ width: '100%', borderTop: '1px solid rgba(23, 21, 26, 0.16)' }} />
      </Box>
      {(checkIns || []).map((checkIn) => {
        const time = new Date(`${checkIn.date}T12:00:00`).getTime();
        const left = Math.max(2, Math.min(98, ((time - start) / (end - start)) * 100));
        return (
          <Box
            key={checkIn.id}
            title={`${formatDate(checkIn.date)} · Check-in${checkIn.comment ? ` · ${checkIn.comment}` : ''}`}
            sx={{
              position: 'absolute',
              left: `${left}%`,
              top: 34,
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: `2px solid ${purple}`,
              bgcolor: '#fff',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 0 3px rgba(156, 40, 175, 0.08)',
            }}
          />
        );
      })}
    </Box>
  );
}

export function SubjectDetail({ subjectId, config, status, facts }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="space-between">
          <Typography sx={{ color: darkText, fontSize: 13.3, fontWeight: 900 }}>
            {getLocalizedValue(config.subjectTitle)}
          </Typography>
          <Chip
            size="small"
            label={getStatusMeta(status).label}
            sx={{ height: 22, bgcolor: getStatusMeta(status).bg, color: getStatusMeta(status).color, border: `1px solid ${getStatusMeta(status).border}`, fontSize: 11.2, fontWeight: 850 }}
          />
        </Stack>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 780 }}>Recent observations</Typography>
          {(facts.observations || []).slice(0, 2).map((item) => (
            <Typography key={item.id} sx={{ mt: 0.25, color: darkText, fontSize: 12.1, lineHeight: 1.25 }}>
              {formatDate(item.date)} · {getLocalizedValue(item.contextLabel) || item.evidenceTopicId || item.skillId}
            </Typography>
          ))}
          {!facts.observations.length && <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1 }}>No recent observations</Typography>}
        </Box>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 780 }}>Recent assessment</Typography>
          {facts.assessments[0] ? (
            <Typography sx={{ mt: 0.25, color: darkText, fontSize: 12.1, lineHeight: 1.25 }}>
              {facts.assessments[0].title}{Number.isFinite(Number(facts.assessments[0].percentage)) ? ` · ${facts.assessments[0].percentage}%` : ''}
            </Typography>
          ) : (
            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1 }}>No recent assessment</Typography>
          )}
        </Box>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 780 }}>Current activity</Typography>
          <Typography sx={{ mt: 0.25, color: darkText, fontSize: 12.1, lineHeight: 1.25 }}>
            {getLocalizedValue(facts.currentActivity?.title) || getLocalizedValue(config.lessons?.current?.focus) || subjectId}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
