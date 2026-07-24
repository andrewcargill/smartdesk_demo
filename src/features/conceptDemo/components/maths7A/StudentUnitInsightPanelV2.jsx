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

function AssessmentPie({ assessment, size = 54 }) {
  return (
    <Box
      title={`${assessment.assessmentTitle || assessment.label || 'Assessment'} · ${assessment.percentage}% · ${formatDemoDate(assessment.date)}`}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `conic-gradient(${purple} 0 ${assessment.percentage}%, rgba(156, 40, 175, 0.12) ${assessment.percentage}% 100%)`,
        boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.28)',
        transition: 'transform 140ms ease, box-shadow 140ms ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.42), 0 8px 18px rgba(156, 40, 175, 0.12)',
        },
      }}
    />
  );
}

function ObservationDensityStrip({ summary }) {
  const observationGroups = getObservationDateGroups(summary);
  const maxCount = Math.max(...observationGroups.map((group) => group.items.length), 1);

  return (
    <Stack direction="row" spacing={0.55} alignItems="flex-end" sx={{ minHeight: 48 }}>
      {observationGroups.length ? observationGroups.map((group) => (
        <Box
          key={group.date}
          title={`${formatDemoDate(group.date)} · ${group.items.length} observation${group.items.length === 1 ? '' : 's'}`}
          sx={{
            flex: '1 1 0',
            minWidth: 12,
            height: `${Math.max((group.items.length / maxCount) * 100, 18)}%`,
            borderRadius: '5px 5px 2px 2px',
            bgcolor: 'rgba(23, 21, 26, 0.52)',
            transition: 'background-color 140ms ease, transform 140ms ease',
            '&:hover': {
              bgcolor: darkText,
              transform: 'translateY(-1px)',
            },
          }}
        />
      )) : (
        <Box sx={{ width: 52, height: 5, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.16)' }} />
      )}
    </Stack>
  );
}

export default function StudentUnitInsightPanelV2({ student, summary }) {
  const assessments = getSortedAssessments(summary);
  const observationCount = (summary.observations || []).length;
  const latestEvidence = [...(summary.items || [])]
    .sort((first, second) => (second.date || '').localeCompare(first.date || ''))
    .slice(0, 4);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-unit-insight-v2-${student.id}-${summary.unit.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: '1px solid rgba(23, 21, 26, 0.1)', bgcolor: '#fff' }}>
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

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(260px, 0.85fr)' }, gap: 1 }}>
            <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(156, 40, 175, 0.16)', bgcolor: '#fff' }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                  <Typography sx={{ color: darkText, fontSize: 13.4, fontWeight: 900 }}>Assessments</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>Purple · percentage</Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                  {assessments.length ? assessments.map((assessment) => (
                    <Stack key={assessment.id || assessment.date} spacing={0.55} alignItems="center">
                      <AssessmentPie assessment={assessment} />
                      <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 820 }}>{assessment.percentage}%</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.4 }}>{formatDemoDate(assessment.date)}</Typography>
                    </Stack>
                  )) : (
                    <Box sx={{ width: 54, height: 54, borderRadius: '50%', bgcolor: 'rgba(156, 40, 175, 0.1)', boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.18)' }} />
                  )}
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                  <Typography sx={{ color: darkText, fontSize: 13.4, fontWeight: 900 }}>Observations</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>Black · density</Typography>
                </Stack>
                <ObservationDensityStrip summary={summary} />
                <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>
                  {observationCount} observation{observationCount === 1 ? '' : 's'} · {summary.observedCapturePointCount}/{summary.capturePoints.length} observation focuses seen{summary.unstructuredObservationCount ? ` · ${summary.unstructuredObservationCount} other observation${summary.unstructuredObservationCount === 1 ? '' : 's'}` : ''}
                </Typography>
              </Stack>
            </Paper>
          </Box>

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
