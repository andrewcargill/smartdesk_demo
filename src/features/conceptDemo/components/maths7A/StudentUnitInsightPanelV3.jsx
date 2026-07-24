import { Box, Paper, Stack, Typography } from '@mui/material';

const purple = '#9c28af';
const darkText = '#17151a';

function formatDemoDate(date) {
  if (!date) {
    return 'No saved date';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getAssessmentPercentage(item) {
  const percentage = item?.percentage !== undefined && item?.percentage !== null
    ? Number(item.percentage)
    : item?.valueType === 'percentage'
      ? Number(item.value)
      : null;

  return Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : null;
}

function getAssessmentTitle(item) {
  return item.assessmentTitle || item.label || 'Assessment';
}

function getSortedAssessments(summary) {
  return [...(summary.assessments || [])]
    .map((item) => ({
      ...item,
      percentage: getAssessmentPercentage(item),
    }))
    .filter((item) => item.percentage !== null)
    .sort((first, second) => (first.date || '').localeCompare(second.date || ''));
}

function getObservationDateGroups(summary) {
  const groupsByDate = new Map();

  [...(summary.observations || [])]
    .sort((first, second) => (first.date || '').localeCompare(second.date || ''))
    .forEach((item) => {
      if (!item.date) return;
      const group = groupsByDate.get(item.date) || { date: item.date, items: [] };
      group.items.push(item);
      groupsByDate.set(item.date, group);
    });

  return [...groupsByDate.values()];
}

function AssessmentPie({ assessment, size = 86 }) {
  return (
    <Box
      title={`${getAssessmentTitle(assessment)} · ${assessment.percentage}% · ${formatDemoDate(assessment.date)}`}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `conic-gradient(${purple} 0 ${assessment.percentage}%, rgba(156, 40, 175, 0.12) ${assessment.percentage}% 100%)`,
        boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.28)',
        transition: 'transform 140ms ease, box-shadow 140ms ease',
        '&:hover': {
          transform: 'scale(1.04)',
          boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.45), 0 10px 24px rgba(156, 40, 175, 0.13)',
        },
      }}
    />
  );
}

function ObservationDensityGraph({ summary }) {
  const observationGroups = getObservationDateGroups(summary);
  const maxCount = Math.max(...observationGroups.map((group) => group.items.length), 1);

  return (
    <Stack direction="row" spacing={0.7} alignItems="flex-end" sx={{ minHeight: 104 }}>
      {observationGroups.length ? observationGroups.map((group) => (
        <Box
          key={group.date}
          title={`${formatDemoDate(group.date)} · ${group.items.length} observation${group.items.length === 1 ? '' : 's'}`}
          sx={{
            flex: '1 1 0',
            minWidth: 18,
            height: `${Math.max((group.items.length / maxCount) * 100, 16)}%`,
            borderRadius: '7px 7px 2px 2px',
            bgcolor: 'rgba(23, 21, 26, 0.52)',
            transition: 'background-color 140ms ease, transform 140ms ease',
            '&:hover': {
              bgcolor: darkText,
              transform: 'translateY(-2px)',
            },
          }}
        />
      )) : (
        <Box sx={{ width: 78, height: 6, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.16)' }} />
      )}
    </Stack>
  );
}

function getAssessmentStats(assessments) {
  if (!assessments.length) {
    return {
      highest: null,
      latest: null,
      average: null,
      movement: null,
    };
  }

  const highest = assessments.reduce((best, item) => (item.percentage > best.percentage ? item : best), assessments[0]);
  const latest = assessments[assessments.length - 1];
  const average = Math.round(assessments.reduce((total, item) => total + item.percentage, 0) / assessments.length);
  const movement = assessments.length > 1 ? latest.percentage - assessments[0].percentage : null;

  return {
    highest,
    latest,
    average,
    movement,
  };
}

export default function StudentUnitInsightPanelV3({ student, summary }) {
  const assessments = getSortedAssessments(summary);
  const assessmentStats = getAssessmentStats(assessments);
  const observationGroups = getObservationDateGroups(summary);
  const observationCount = (summary.observations || []).length;
  const latestObservation = [...(summary.observations || [])].sort((first, second) => (second.date || '').localeCompare(first.date || ''))[0] || null;
  const latestEvidence = [...(summary.items || [])]
    .sort((first, second) => (second.date || '').localeCompare(first.date || ''))
    .slice(0, 4);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-unit-insight-v3-${student.id}-${summary.unit.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: '1px solid rgba(23, 21, 26, 0.1)', bgcolor: '#fff' }}>
        <Stack spacing={1.35}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Box>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>
                {student.displayName} · {summary.unit.label || summary.unit.title}
              </Typography>
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.8 }}>
                {summary.items.length} evidence item{summary.items.length === 1 ? '' : 's'} in this unit · Latest evidence: {summary.latestDate ? formatDemoDate(summary.latestDate) : 'None'}
              </Typography>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 760 }}>
              {summary.assessments.length} assessment{summary.assessments.length === 1 ? '' : 's'} · {observationCount} observation{observationCount === 1 ? '' : 's'}
            </Typography>
          </Stack>

          <Paper elevation={0} sx={{ p: 1.35, borderRadius: '14px', border: '1px solid rgba(156, 40, 175, 0.16)', bgcolor: '#fff' }}>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 900 }}>Assessments</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>Purple · percentage</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)' }, gap: 1.4, alignItems: 'start' }}>
                <Stack direction="row" spacing={1.4} flexWrap="wrap" useFlexGap alignItems="flex-start">
                  {assessments.length ? assessments.map((assessment) => (
                    <Stack key={assessment.id || assessment.date} spacing={0.65} sx={{ width: 126 }}>
                      <AssessmentPie assessment={assessment} />
                      <Typography title={getAssessmentTitle(assessment)} sx={{ color: darkText, fontSize: 12.4, fontWeight: 850, lineHeight: 1.2 }}>
                        {getAssessmentTitle(assessment)}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.7 }}>
                        {assessment.percentage}% · {formatDemoDate(assessment.date)}
                      </Typography>
                    </Stack>
                  )) : (
                    <Box sx={{ width: 86, height: 86, borderRadius: '50%', bgcolor: 'rgba(156, 40, 175, 0.1)', boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.18)' }} />
                  )}
                </Stack>
                <Stack spacing={0.8}>
                  {[
                    assessmentStats.latest ? ['Latest', `${assessmentStats.latest.percentage}% · ${getAssessmentTitle(assessmentStats.latest)}`] : null,
                    assessmentStats.highest ? ['Highest', `${assessmentStats.highest.percentage}% · ${getAssessmentTitle(assessmentStats.highest)}`] : null,
                    assessmentStats.average !== null ? ['Average', `${assessmentStats.average}%`] : null,
                    assessmentStats.movement !== null ? ['First to latest', `${assessmentStats.movement > 0 ? '+' : ''}${assessmentStats.movement} pts`] : null,
                  ].filter(Boolean).map(([label, value]) => (
                    <Box key={label} sx={{ p: 0.85, borderRadius: '10px', bgcolor: 'rgba(156, 40, 175, 0.045)', border: '1px solid rgba(156, 40, 175, 0.1)' }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 740 }}>{label}</Typography>
                      <Typography sx={{ mt: 0.2, color: darkText, fontSize: 12.8, fontWeight: 850 }}>{value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.35, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 900 }}>Observations</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>Black · density</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.25fr) minmax(260px, 0.75fr)' }, gap: 1.4, alignItems: 'stretch' }}>
                <ObservationDensityGraph summary={summary} />
                <Stack spacing={0.8}>
                  <Box sx={{ p: 0.85, borderRadius: '10px', bgcolor: 'rgba(23, 21, 26, 0.035)', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 740 }}>Total observations</Typography>
                    <Typography sx={{ mt: 0.2, color: darkText, fontSize: 12.8, fontWeight: 850 }}>{observationCount}</Typography>
                  </Box>
                  <Box sx={{ p: 0.85, borderRadius: '10px', bgcolor: 'rgba(23, 21, 26, 0.035)', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 740 }}>Dates represented</Typography>
                    <Typography sx={{ mt: 0.2, color: darkText, fontSize: 12.8, fontWeight: 850 }}>{observationGroups.length}</Typography>
                  </Box>
                  <Box sx={{ p: 0.85, borderRadius: '10px', bgcolor: 'rgba(23, 21, 26, 0.035)', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 740 }}>Observation focuses</Typography>
                    <Typography sx={{ mt: 0.2, color: darkText, fontSize: 12.8, fontWeight: 850 }}>{summary.observedCapturePointCount}/{summary.capturePoints.length}</Typography>
                  </Box>
                  {latestObservation && (
                    <Box sx={{ p: 0.85, borderRadius: '10px', bgcolor: 'rgba(23, 21, 26, 0.035)', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 740 }}>Latest observation</Typography>
                      <Typography sx={{ mt: 0.2, color: darkText, fontSize: 12.8, fontWeight: 850 }}>{formatDemoDate(latestObservation.date)}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
            <Typography sx={{ color: darkText, fontSize: 13.4, fontWeight: 900 }}>Latest evidence</Typography>
            <Stack spacing={0.45} sx={{ mt: 0.8 }}>
              {latestEvidence.map((item) => (
                <Typography key={item.id} title={item.note || item.observationText || item.assessmentTitle || item.label} sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                  {formatDemoDate(item.date)} · {item.assessmentTitle || item.observationText || item.label}
                </Typography>
              ))}
              {!latestEvidence.length && <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>No saved evidence in this unit yet.</Typography>}
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}
