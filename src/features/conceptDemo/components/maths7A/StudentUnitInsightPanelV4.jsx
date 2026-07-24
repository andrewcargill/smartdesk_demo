import { useMemo, useState } from 'react';
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import {
  getMathsCaptureLevelById,
  mathsCaptureLevels,
} from '../../data/mathsCaptureConfig.js';

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

function getObservationFocusOptions(summary) {
  const observationsByCapturePoint = new Map();

  (summary.observations || [])
    .filter((item) => item.capturePointId)
    .forEach((item) => {
      const group = observationsByCapturePoint.get(item.capturePointId) || [];
      group.push(item);
      observationsByCapturePoint.set(item.capturePointId, group);
    });

  const options = (summary.capturePoints || []).map((capturePoint) => ({
    id: capturePoint.id,
    label: capturePoint.label,
    observations: [...(observationsByCapturePoint.get(capturePoint.id) || [])]
      .sort((first, second) => (first.date || '').localeCompare(second.date || '')),
  }));

  const otherObservations = [...(summary.observations || [])]
    .filter((item) => !item.capturePointId)
    .sort((first, second) => (first.date || '').localeCompare(second.date || ''));

  if (otherObservations.length) {
    options.push({
      id: 'other-observations',
      label: 'Other observations',
      observations: otherObservations,
    });
  }

  return options;
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

function ObservationFocusStack({ options, activeId, onActiveIdChange }) {
  if (!options.length) {
    return (
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
        No observation focuses configured.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.45}>
      {options.map((option) => {
        const isActive = option.id === activeId;
        const hasObservation = option.observations.length > 0;

        return (
          <ButtonBase
            key={option.id}
            onMouseEnter={() => onActiveIdChange(option.id)}
            onFocus={() => onActiveIdChange(option.id)}
            onClick={() => onActiveIdChange(option.id)}
            title={`${option.label}${hasObservation ? ` · ${option.observations.length} observation${option.observations.length === 1 ? '' : 's'}` : ' · no observation yet'}`}
            sx={{
              width: '100%',
              p: 0.65,
              borderRadius: '10px',
              justifyContent: 'flex-start',
              textAlign: 'left',
              bgcolor: isActive ? 'rgba(156, 40, 175, 0.055)' : 'transparent',
              boxShadow: isActive ? `inset 0 0 0 1px rgba(156, 40, 175, 0.24)` : 'inset 0 0 0 1px transparent',
              transition: 'background-color 140ms ease, box-shadow 140ms ease',
              '&:hover': {
                bgcolor: isActive ? 'rgba(156, 40, 175, 0.07)' : 'rgba(23, 21, 26, 0.035)',
              },
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: hasObservation ? darkText : '#fff',
                  border: isActive
                    ? `2px solid ${purple}`
                    : hasObservation
                      ? '1px solid rgba(23, 21, 26, 0.72)'
                      : '1px solid rgba(23, 21, 26, 0.22)',
                  boxShadow: isActive ? '0 0 0 3px rgba(156, 40, 175, 0.1)' : 'none',
                }}
              />
              <Typography noWrap sx={{ color: hasObservation ? darkText : 'text.secondary', fontSize: 12.4, fontWeight: isActive ? 850 : 720, minWidth: 0, flex: 1 }}>
                {option.label}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 11.4, fontWeight: 800, flexShrink: 0 }}>
                {option.observations.length}
              </Typography>
            </Stack>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

function getObservationPointLabel(item) {
  const level = item.levelId ? getMathsCaptureLevelById(item.levelId) : null;
  return level?.label || item.label || item.observationText || 'Observed';
}

function getObservationLevelOrder(item) {
  const level = item.levelId ? getMathsCaptureLevelById(item.levelId) : null;
  return level?.order || null;
}

function getObservationTimestamp(item) {
  if (!item?.date) {
    return null;
  }

  const time = new Date(`${item.date}T12:00:00`).getTime();
  return Number.isFinite(time) ? time : null;
}

function ObservationLevelGraph({ focus }) {
  const [activePointId, setActivePointId] = useState('');
  const observations = focus?.observations || [];
  const graphLeft = 16;
  const graphRight = 98;
  const graphTop = 10;
  const graphBottom = 41;
  const levelCount = mathsCaptureLevels.length;

  const timelinePoints = observations.map((item, index) => ({
    item,
    index,
    timestamp: getObservationTimestamp(item),
  }));
  const datedPoints = timelinePoints.filter((point) => point.timestamp !== null);
  const minDate = datedPoints.length ? Math.min(...datedPoints.map((point) => point.timestamp)) : null;
  const maxDate = datedPoints.length ? Math.max(...datedPoints.map((point) => point.timestamp)) : null;

  const points = timelinePoints.map((entry, index) => {
    const { item } = entry;
    const levelOrder = getObservationLevelOrder(item);
    const levelPosition = levelOrder
      ? (levelOrder - 1) / Math.max(levelCount - 1, 1)
      : 0.5;
    let x = (graphLeft + graphRight) / 2;

    if (entry.timestamp !== null && minDate !== null && maxDate !== null) {
      x = minDate === maxDate
        ? (graphLeft + graphRight) / 2
        : graphLeft + ((entry.timestamp - minDate) / (maxDate - minDate)) * (graphRight - graphLeft);
    } else if (observations.length > 1) {
      x = graphLeft + (index / (observations.length - 1)) * (graphRight - graphLeft);
    }

    return {
      item,
      x,
      y: graphBottom - levelPosition * (graphBottom - graphTop),
      hasLevel: !!levelOrder,
      levelLabel: getObservationPointLabel(item),
      pointId: item.id || `${item.date || 'no-date'}-${index}`,
    };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const gradientId = `observationTrendFill-${String(focus?.id || 'focus').replace(/[^a-z0-9_-]/gi, '-')}`;
  const areaPath = points.length > 1
    ? `M ${points[0].x} ${graphBottom} L ${linePoints} L ${points[points.length - 1].x} ${graphBottom} Z`
    : '';
  const activePoint = points.find((point) => point.pointId === activePointId) || points[points.length - 1] || null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 0.95, sm: 1.05 },
        borderRadius: '12px',
        border: '1px solid rgba(156, 40, 175, 0.14)',
        bgcolor: '#fefbff',
        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.74)',
      }}
    >
      <Stack spacing={0.45}>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
          <Typography noWrap title={focus?.label || 'Observation focus'} sx={{ color: darkText, fontSize: 13.2, fontWeight: 900 }}>
            {focus?.label || 'Observation focus'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 740 }}>
            {observations.length} observation{observations.length === 1 ? '' : 's'}
          </Typography>
        </Stack>

        <Box
          component="svg"
          role="img"
          aria-label={`${focus?.label || 'Observation focus'} over time`}
          viewBox="0 0 100 48"
          sx={{
            width: '100%',
            height: 108,
            display: 'block',
            overflow: 'visible',
            '& circle': { transition: 'r 140ms ease, fill 140ms ease' },
            '& circle:hover': { r: 4.8, fill: purple },
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(156, 40, 175, 0.18)" />
              <stop offset="100%" stopColor="rgba(156, 40, 175, 0.02)" />
            </linearGradient>
          </defs>
          {mathsCaptureLevels.map((level) => {
            const levelPosition = (level.order - 1) / Math.max(levelCount - 1, 1);
            const y = graphBottom - levelPosition * (graphBottom - graphTop);

            return (
              <g key={level.id}>
                <line x1={graphLeft} y1={y} x2={graphRight} y2={y} stroke="rgba(156, 40, 175, 0.11)" strokeWidth="1" strokeDasharray="1.2 1.4" />
                <text x="2" y={y + 1.8} fill="rgba(23, 21, 26, 0.56)" fontSize="4.2" fontWeight="700">
                  {level.label}
                </text>
              </g>
            );
          })}
          <line x1={graphLeft} y1={graphTop} x2={graphLeft} y2={graphBottom} stroke="rgba(156, 40, 175, 0.16)" strokeWidth="1.1" />
          <line x1={graphLeft} y1={graphBottom} x2={graphRight} y2={graphBottom} stroke="rgba(156, 40, 175, 0.16)" strokeWidth="1.1" />
          {points.length > 1 && <path d={areaPath} fill={`url(#${gradientId})`} />}
          {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(156, 40, 175, 0.72)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />}
          {points.length === 1 && <line x1={points[0].x - 8} y1={points[0].y} x2={points[0].x + 8} y2={points[0].y} stroke="rgba(156, 40, 175, 0.68)" strokeWidth="2.1" strokeLinecap="round" />}
          {points.map((point, index) => (
            <circle
              key={point.pointId}
              cx={point.x}
              cy={point.y}
              r={point.hasLevel ? 3.6 : 3}
              fill={point.hasLevel ? 'rgba(156, 40, 175, 0.86)' : 'rgba(156, 40, 175, 0.42)'}
              stroke="#fff"
              strokeWidth="1.4"
              onMouseEnter={() => setActivePointId(point.pointId)}
              onFocus={() => setActivePointId(point.pointId)}
            >
              <title>{`${formatDemoDate(point.item.date)} · ${getObservationPointLabel(point.item)}${point.item.observationText ? ` · ${point.item.observationText}` : ''}`}</title>
            </circle>
          ))}
          {!points.length && (
            <>
              <line x1="35" y1="34" x2="80" y2="34" stroke="rgba(23, 21, 26, 0.14)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="58" cy="34" r="3.2" fill="rgba(23, 21, 26, 0.18)" />
            </>
          )}
        </Box>

        {!!activePoint && (
          <Box sx={{ px: 0.75, py: 0.5, borderRadius: '8px', bgcolor: 'rgba(156, 40, 175, 0.05)', border: '1px solid rgba(156, 40, 175, 0.12)' }}>
            <Typography sx={{ color: darkText, fontSize: 11.9, fontWeight: 780 }}>
              {formatDemoDate(activePoint.item.date)} · {activePoint.levelLabel}
            </Typography>
            {!!activePoint.item.observationText && (
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 11.5, lineHeight: 1.35 }}>
                {activePoint.item.observationText}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={0.55} flexWrap="wrap" useFlexGap>
          {observations.slice(-3).map((item, index) => (
            <Box
              key={`${item.id || item.date}-${index}`}
              title={item.observationText || item.label || getObservationPointLabel(item)}
              sx={{
                px: 0.7,
                py: 0.32,
                borderRadius: '999px',
                bgcolor: 'rgba(156, 40, 175, 0.06)',
                border: '1px solid rgba(156, 40, 175, 0.12)',
              }}
            >
              <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 740 }}>
                {formatDemoDate(item.date)} · {getObservationPointLabel(item)}
              </Typography>
            </Box>
          ))}
          {!observations.length && (
            <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>
              No observations recorded for this focus yet.
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

function ObservationFocusTimelineGrid({ options, activeFocusId, onActiveFocusChange }) {
  const focusesWithData = (options || []).filter((option) => option.observations.length > 0);
  const levelCount = mathsCaptureLevels.length;

  if (!focusesWithData.length) {
    return (
      <Paper elevation={0} sx={{ p: 1, borderRadius: '10px', border: '1px dashed rgba(156, 40, 175, 0.2)', bgcolor: '#fff' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>
          No focus has timeline data yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={0.55}>
      {focusesWithData.map((focus) => {
        const points = focus.observations.map((item, index) => {
          const levelOrder = getObservationLevelOrder(item);
          const levelPosition = levelOrder
            ? (levelOrder - 1) / Math.max(levelCount - 1, 1)
            : 0.5;

          return {
            x: focus.observations.length === 1 ? 50 : 6 + (index / (focus.observations.length - 1)) * 88,
            y: 22 - levelPosition * 16,
            label: getObservationPointLabel(item),
            date: item.date,
          };
        });
        const isActive = focus.id === activeFocusId;
        const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

        return (
          <ButtonBase
            key={focus.id}
            onMouseEnter={() => onActiveFocusChange(focus.id)}
            onFocus={() => onActiveFocusChange(focus.id)}
            onClick={() => onActiveFocusChange(focus.id)}
            sx={{
              width: '100%',
              p: 0.7,
              borderRadius: '10px',
              justifyContent: 'space-between',
              textAlign: 'left',
              bgcolor: isActive ? 'rgba(156, 40, 175, 0.06)' : '#fff',
              border: isActive ? '1px solid rgba(156, 40, 175, 0.26)' : '1px solid rgba(23, 21, 26, 0.08)',
              transition: 'background-color 140ms ease, border-color 140ms ease',
            }}
          >
            <Stack spacing={0.1} sx={{ minWidth: 0, mr: 0.9, flex: '1 1 auto' }}>
              <Typography noWrap sx={{ color: darkText, fontSize: 12.1, fontWeight: 820 }}>
                {focus.label}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 11.2 }}>
                {focus.observations.length} observation{focus.observations.length === 1 ? '' : 's'}
              </Typography>
            </Stack>
            <Box component="svg" viewBox="0 0 100 26" sx={{ width: 132, height: 28, flexShrink: 0 }}>
              <line x1="6" y1="22" x2="94" y2="22" stroke="rgba(156, 40, 175, 0.14)" strokeWidth="1" />
              {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(156, 40, 175, 0.62)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />}
              {points.map((point, index) => (
                <circle key={`${focus.id}-${index}`} cx={point.x} cy={point.y} r="2.2" fill="rgba(156, 40, 175, 0.82)">
                  <title>{`${formatDemoDate(point.date)} · ${point.label}`}</title>
                </circle>
              ))}
            </Box>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

export default function StudentUnitInsightPanelV4({ student, summary }) {
  const assessments = getSortedAssessments(summary);
  const assessmentStats = getAssessmentStats(assessments);
  const observationGroups = getObservationDateGroups(summary);
  const observationCount = (summary.observations || []).length;
  const observationFocusOptions = useMemo(() => getObservationFocusOptions(summary), [summary]);
  const firstObservedFocusId = observationFocusOptions.find((option) => option.observations.length)?.id || observationFocusOptions[0]?.id || '';
  const [activeObservationFocusId, setActiveObservationFocusId] = useState(firstObservedFocusId);
  const activeObservationFocus = observationFocusOptions.find((option) => option.id === activeObservationFocusId)
    || observationFocusOptions.find((option) => option.observations.length)
    || observationFocusOptions[0]
    || null;
  const latestEvidence = [...(summary.items || [])]
    .sort((first, second) => (second.date || '').localeCompare(first.date || ''))
    .slice(0, 4);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-unit-insight-v4-${student.id}-${summary.unit.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: '1px solid rgba(23, 21, 26, 0.1)', bgcolor: '#fff' }}>
        <Stack spacing={1.35}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Box>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>
                {summary.unit.label || summary.unit.title}
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
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>Focus trend over time</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(220px, 0.42fr) minmax(0, 1.58fr)' }, gap: 1.4, alignItems: 'stretch' }}>
                <Paper elevation={0} sx={{ p: 1, borderRadius: '12px', border: '1px solid rgba(23, 21, 26, 0.07)', bgcolor: '#fff' }}>
                  <Stack spacing={0.85}>
                    <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>Observation focus</Typography>
                    <ObservationFocusStack
                      options={observationFocusOptions}
                      activeId={activeObservationFocus?.id || ''}
                      onActiveIdChange={setActiveObservationFocusId}
                    />
                    <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                      {summary.observedCapturePointCount}/{summary.capturePoints.length} focuses seen
                      {!!summary.unstructuredObservationCount && ` · ${summary.unstructuredObservationCount} other observation${summary.unstructuredObservationCount === 1 ? '' : 's'}`}
                    </Typography>
                  </Stack>
                </Paper>
                <Stack spacing={0.85}>
                  <ObservationLevelGraph focus={activeObservationFocus} />
                  <Paper elevation={0} sx={{ p: 0.85, borderRadius: '11px', border: '1px solid rgba(23, 21, 26, 0.07)', bgcolor: '#fff' }}>
                    <Stack spacing={0.65}>
                      <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 820 }}>
                        Focus timelines with data
                      </Typography>
                      <ObservationFocusTimelineGrid
                        options={observationFocusOptions}
                        activeFocusId={activeObservationFocus?.id || ''}
                        onActiveFocusChange={setActiveObservationFocusId}
                      />
                    </Stack>
                  </Paper>
                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                    {[
                      ['Total', observationCount],
                      ['Dates', observationGroups.length],
                      ['Focuses', `${summary.observedCapturePointCount}/${summary.capturePoints.length}`],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ minWidth: 86, flex: '1 1 86px', p: 0.8, borderRadius: '10px', bgcolor: 'rgba(23, 21, 26, 0.035)', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                        <Typography sx={{ color: 'text.secondary', fontSize: 11.4, fontWeight: 740 }}>{label}</Typography>
                        <Typography sx={{ mt: 0.2, color: darkText, fontSize: 12.7, fontWeight: 850 }}>{value}</Typography>
                      </Box>
                    ))}
                  </Stack>
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
