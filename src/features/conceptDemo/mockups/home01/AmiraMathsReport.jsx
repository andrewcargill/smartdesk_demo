import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { amiraMaths as data } from './amiraMathsData.js';
import TeachingMaterial from './TeachingMaterial.jsx';
import { mathsSummary } from './mathsSummaryData.js';

const panel = { p: { xs: 1.5, sm: 2 }, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' };
const caption = { fontSize: 12, color: 'text.secondary', lineHeight: 1.6 };

export default function AmiraMathsReport() {
  const latest = data.scores.at(-1);
  return (
    <Box component="section" aria-labelledby="amira-report-title" sx={{ width: '100%', maxWidth: 820, mx: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: '20px', overflow: 'hidden', bgcolor: 'var(--sd-surface-muted)' }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5, gap: 1, flexShrink: 0, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography id="amira-report-title" component="h2" sx={{ fontSize: 18, fontWeight: 550 }}>Amira · maths</Typography>
        <Typography sx={{ ...caption, fontSize: 10 }}>Mock report · fictional data</Typography>
      </Stack>
      <Box role="region" aria-label="Amira maths report details" tabIndex={0} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', scrollbarWidth: 'thin', scrollbarGutter: 'stable', p: { xs: 1.5, sm: 2 }, '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: -2, borderRadius: 2 } }}>
        <Box sx={{ mb: 1.5 }}><TeachingMaterial chapterId={mathsSummary.module.chapterId} /></Box>
        <Typography sx={{ ...caption, mb: 1.5 }}>8A · {mathsSummary.module.title} · Lesson {mathsSummary.module.lesson} of {mathsSummary.module.lessons}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
          <Paper elevation={0} sx={panel}>
            <Typography component="h3" sx={caption}>Last check-in</Typography>
            <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mt: 0.5 }}>
              <Typography sx={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.04em' }}>{latest}%</Typography>
              <Typography sx={caption}>Passed · +{latest - data.scores[0]} points since check 1</Typography>
            </Stack>
            <Typography sx={{ ...caption, mt: 0.75 }}>Class average {mathsSummary.scores.at(-1)}% · Example pass mark 50%</Typography>
            <Typography sx={{ ...caption, mt: 1 }}>Present for {data.attendance.attended} of {data.attendance.total} recent lessons.</Typography>
          </Paper>
          <Paper elevation={0} sx={panel}>
            <Typography component="h3" sx={caption}>Growing confidence</Typography>
            <Box component="svg" viewBox="0 0 320 114" role="img" aria-label={`Amira’s scores over four checks: ${data.scores.join(', ')} percent.`} sx={{ display: 'block', width: '100%', height: 92, mt: 0.5 }}>
              {[50, 75].map((value) => <line key={value} x1="20" x2="300" y1={120 - value} y2={120 - value} stroke="var(--sd-text-muted)" strokeOpacity="0.12" />)}
              <polyline points={data.scores.map((value, index) => `${28 + index * 88},${120 - value}`).join(' ')} fill="none" stroke="var(--sd-chart)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {data.scores.map((value, index) => (
                <g key={index}>
                  <circle cx={28 + index * 88} cy={120 - value} r="4" fill="var(--sd-chart)" />
                  <text x={28 + index * 88} y={108 - value} textAnchor="middle" fill="var(--sd-text)" fontSize="11">{value}%</text>
                  <text x={28 + index * 88} y="102" textAnchor="middle" fill="var(--sd-text-muted)" fontSize="10">Check {index + 1}</text>
                </g>
              ))}
            </Box>
          </Paper>
        </Box>
        <Paper elevation={0} sx={{ ...panel, mt: 1.25 }}>
          <Typography component="h3" sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>Example skill checks</Typography>
          <Stack spacing={1.5}>
            {data.skills.map((skill) => (
              <Box key={skill.label}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}><Typography sx={caption}>{skill.label}</Typography><Typography sx={caption}>{skill.value}%</Typography></Stack>
                <LinearProgress aria-label={skill.label} variant="determinate" value={skill.value} sx={{ height: 5, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'var(--sd-chart)' } }} />
              </Box>
            ))}
          </Stack>
        </Paper>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2, mb: 0.5 }}>
          {[['What’s going well', data.strength], ['Next small step', data.nextStep]].map(([title, note]) => (
            <Box key={title} sx={{ borderLeft: '2px solid var(--sd-chart)', pl: 1.5 }}>
              <Typography component="h3" sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>{title}</Typography>
              <Typography sx={caption}>{note}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
