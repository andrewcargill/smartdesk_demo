import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import TeachingMaterial from './TeachingMaterial.jsx';
import { mathsSummary as data } from './mathsSummaryData.js';

const panel = { p: { xs: 1.5, sm: 2 }, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' };
const caption = { fontSize: 12, color: 'text.secondary' };

function ProgressChart() {
  const points = data.scores.map((value, index) => `${28 + index * 88},${120 - value}`);
  return (
    <Box component="svg" viewBox="0 0 320 114" role="img" aria-label={`Class average over four checks: ${data.scores.join(', ')} percent.`} sx={{ display: 'block', width: '100%', height: 92, mt: 0.5 }}>
      {[50, 75].map((value) => <line key={value} x1="20" x2="300" y1={120 - value} y2={120 - value} stroke="var(--sd-text-muted)" strokeOpacity="0.12" />)}
      <polyline points={points.join(' ')} fill="none" stroke="var(--sd-chart)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.scores.map((value, index) => (
        <g key={index}>
          <circle cx={28 + index * 88} cy={120 - value} r="4" fill="var(--sd-chart)" />
          <text x={28 + index * 88} y={108 - value} textAnchor="middle" fill="var(--sd-text)" fontSize="11">{value}%</text>
          <text x={28 + index * 88} y="102" textAnchor="middle" fill="var(--sd-text-muted)" fontSize="10">Check {index + 1}</text>
        </g>
      ))}
    </Box>
  );
}

export default function MathsSummary() {
  const notPassed = data.followUps.filter((student) => student.score !== null).length;
  const absent = data.followUps.length - notPassed;
  const segments = [
    { label: 'Passed', count: data.passed, color: 'var(--sd-chart)' },
    { label: 'Not yet passed', count: notPassed, color: 'var(--sd-warning)' },
    { label: 'Absent', count: absent, color: 'var(--sd-text-muted)' },
  ];

  return (
    <Box component="section" aria-labelledby="maths-summary-title" sx={{ width: '100%', maxWidth: 820, mx: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: '20px', overflow: 'hidden', bgcolor: 'var(--sd-surface-muted)', animation: 'mathsSummaryEnter 550ms ease both', '@keyframes mathsSummaryEnter': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } }, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5, gap: 1, flexShrink: 0, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography id="maths-summary-title" component="h2" sx={{ fontSize: 18, fontWeight: 550 }}>8A maths · summary</Typography>
        <Typography sx={{ ...caption, fontSize: 10 }}>Mock response · fictional data</Typography>
      </Stack>
      <Box
        role="region"
        aria-label="8A maths summary details"
        tabIndex={0}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', scrollbarWidth: 'thin', scrollbarGutter: 'stable', p: { xs: 1.5, sm: 2 }, '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: -2, borderRadius: 2 } }}
      >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
        <Paper elevation={0} sx={panel}>
          <TeachingMaterial chapterId={data.module.chapterId} />
          <Typography sx={{ ...caption, mt: 1.5 }}>Current module</Typography>
          <Typography component="h3" sx={{ fontSize: 18, fontWeight: 500, mt: 0.5 }}>{data.module.title}</Typography>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5, mb: 0.75 }}>
            <Typography sx={caption}>Lesson {data.module.lesson} of {data.module.lessons}</Typography>
            <Typography sx={caption}>{data.students} students</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={data.module.lesson / data.module.lessons * 100} aria-label="Current module progress" sx={{ height: 5, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'var(--sd-chart)' } }} />
          <Typography sx={{ ...caption, mt: 1.25, lineHeight: 1.5 }}>Up next · {data.module.next}</Typography>
        </Paper>
        <Paper elevation={0} sx={panel}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography sx={caption}>Class average</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>+12 points</Typography>
          </Stack>
          <ProgressChart />
        </Paper>
      </Box>

      <Box sx={{ my: 2 }}>
        <Typography component="h3" sx={{ fontSize: 13, fontWeight: 650, mb: 1 }}>Student highlights</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          {data.highlights.map((student) => (
            <Box key={student.name} sx={{ borderLeft: '2px solid', borderColor: 'var(--sd-chart)', pl: 1.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 650 }}>{student.name}</Typography>
              <Typography sx={{ ...caption, mt: 0.4, lineHeight: 1.5 }}>{student.note}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Paper elevation={0} sx={panel}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography component="h3" sx={{ fontSize: 15, fontWeight: 600 }}>Last test</Typography>
          <Typography sx={caption}>23 passed · 2 not yet passed · 1 absent</Typography>
        </Stack>
        <Box role="img" aria-label="Last test: 23 passed, 2 not yet passed, 1 absent, out of 26 students." sx={{ display: 'flex', gap: '3px', height: 7, borderRadius: 5, overflow: 'hidden', mb: 1.2 }}>
          {segments.map((segment) => <Box key={segment.label} sx={{ flex: segment.count, bgcolor: segment.color }} />)}
        </Box>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 0.5, mb: 1 }}>
          {segments.map((segment) => <Stack key={segment.label} direction="row" spacing={0.6} alignItems="center"><Box aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: segment.color }} /><Typography sx={{ ...caption, fontSize: 10 }}>{segment.label}</Typography></Stack>)}
        </Stack>
        {data.followUps.map((student) => (
          <Box key={student.name} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '140px 150px 1fr' }, gap: 0.5, py: 0.9, borderTop: '1px solid', borderColor: 'divider', alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{student.name}</Typography>
            <Typography sx={{ fontSize: 11, color: student.score === null ? 'text.secondary' : 'var(--sd-warning)' }}>{student.status}{student.score !== null ? ` · ${student.score}%` : ''}</Typography>
            <Typography sx={{ ...caption, gridColumn: { xs: '1 / -1', sm: 'auto' } }}>{student.note}</Typography>
          </Box>
        ))}
        <Typography sx={{ ...caption, fontSize: 10, mt: 1 }}>Example pass mark: 50%. Absent students have no score.</Typography>
      </Paper>
      </Box>

    </Box>
  );
}
