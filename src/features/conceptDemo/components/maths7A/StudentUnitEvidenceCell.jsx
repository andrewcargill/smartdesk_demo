import { Box, Stack } from '@mui/material';

const purple = '#9c28af';

function getAssessmentPercentage(item) {
  const percentage = item?.percentage !== undefined && item?.percentage !== null
    ? Number(item.percentage)
    : item?.valueType === 'percentage'
      ? Number(item.value)
      : null;

  return Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : null;
}

export default function StudentUnitEvidenceCell({ summary }) {
  const assessments = (summary.assessments || [])
    .map((item) => ({
      ...item,
      percentage: getAssessmentPercentage(item),
    }))
    .filter((item) => item.percentage !== null)
    .sort((first, second) => (first.date || '').localeCompare(second.date || ''))
    .slice(-4);
  const observationCount = (summary.observations || []).length;
  const hasEvidence = (summary.items || []).length > 0;
  const density = Math.min(observationCount / 6, 1);

  if (!hasEvidence) {
    return (
      <Box sx={{ minHeight: 33, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: 22, height: 2, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.2)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 33, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.55 }}>
      <Stack direction="row" spacing={0.35} alignItems="center" sx={{ minHeight: 20 }}>
        {assessments.length ? assessments.map((item) => (
          <Box
            key={item.id || item.date}
            title={`${item.percentage}%`}
            sx={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              flexShrink: 0,
              background: `conic-gradient(${purple} 0 ${item.percentage}%, rgba(156, 40, 175, 0.13) ${item.percentage}% 100%)`,
              boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.28)',
            }}
          />
        )) : (
          <Box sx={{ width: 24, height: 6, borderRadius: '999px', bgcolor: 'rgba(156, 40, 175, 0.13)' }} />
        )}
      </Stack>
      <Box
        title={`${observationCount} observation${observationCount === 1 ? '' : 's'}`}
        sx={{
          height: 6,
          borderRadius: '999px',
          bgcolor: 'rgba(23, 21, 26, 0.08)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {!!observationCount && (
          <Box
            sx={{
              width: `${Math.max(density * 100, 18)}%`,
              height: '100%',
              borderRadius: '999px',
              bgcolor: 'rgba(23, 21, 26, 0.42)',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
