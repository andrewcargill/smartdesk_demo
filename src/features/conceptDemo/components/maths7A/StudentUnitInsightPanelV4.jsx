import { useEffect, useMemo, useState } from 'react';
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import {
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

function getObservationTimestamp(item) {
  if (!item?.date) {
    return null;
  }

  const time = new Date(`${item.date}T12:00:00`).getTime();
  return Number.isFinite(time) ? time : null;
}

function sortObservationsChronologically(items) {
  return [...(items || [])].sort((first, second) => {
    const firstTime = getObservationTimestamp(first);
    const secondTime = getObservationTimestamp(second);

    if (firstTime !== null && secondTime !== null) return firstTime - secondTime;
    if (firstTime !== null) return -1;
    if (secondTime !== null) return 1;
    return String(first.id || '').localeCompare(String(second.id || ''));
  });
}

function getObservationNote(item) {
  return item?.observationText || item?.note || item?.label || '';
}

function getLevelMap(levels) {
  return new Map((levels || []).map((level) => [level.id, level]));
}

function getFocusDisplayKey(focus) {
  return String(focus?.label || focus?.id || '');
}

function normaliseObservationFocuses({ configuredFocuses = [], observations = [], levels = [] }) {
  const levelById = getLevelMap(levels);
  const configuredFocusById = new Map();
  const configuredFocusGroupsByLabel = new Map();

  configuredFocuses.forEach((focus) => {
    if (!focus?.id) return;
    configuredFocusById.set(focus.id, focus);
    const displayKey = getFocusDisplayKey(focus);
    const group = configuredFocusGroupsByLabel.get(displayKey) || {
      focusId: `configured:${focus.id}`,
      focusIds: [],
      focusLabel: focus.label || focus.id,
      observations: [],
      count: 0,
      isOther: false,
    };
    group.focusIds.push(focus.id);
    group.focusId = `configured:${group.focusIds.join('|')}`;
    configuredFocusGroupsByLabel.set(displayKey, group);
  });

  const groupedFocuses = [...configuredFocusGroupsByLabel.values()];
  const groupByFocusId = new Map();
  groupedFocuses.forEach((group) => {
    group.focusIds.forEach((focusId) => {
      groupByFocusId.set(focusId, group);
    });
  });

  const otherFocus = {
    focusId: 'other-observations',
    focusIds: [],
    focusLabel: 'Other observations',
    observations: [],
    count: 0,
    isOther: true,
  };

  (observations || []).forEach((item) => {
    const configuredFocus = item?.capturePointId ? configuredFocusById.get(item.capturePointId) : null;
    const group = configuredFocus ? groupByFocusId.get(configuredFocus.id) : otherFocus;
    const level = item?.levelId ? levelById.get(item.levelId) : null;

    group.observations.push({
      ...item,
      id: item.id,
      date: item.date || '',
      levelId: item.levelId || '',
      levelLabel: level?.label || '',
      levelOrder: level?.order || null,
      note: getObservationNote(item),
      timestamp: getObservationTimestamp(item),
    });
  });

  const configuredOptions = groupedFocuses
    .map((group) => ({
      ...group,
      observations: sortObservationsChronologically(group.observations),
      count: group.observations.length,
    }))
    .sort((first, second) => {
      const firstHasObservations = first.count > 0 ? 1 : 0;
      const secondHasObservations = second.count > 0 ? 1 : 0;
      return secondHasObservations - firstHasObservations || second.count - first.count || first.focusLabel.localeCompare(second.focusLabel);
    });

  const representedConfiguredOptions = configuredOptions.filter((option) => option.count > 0);
  const unrepresentedConfiguredOptions = configuredOptions.filter((option) => option.count === 0);
  const options = otherFocus.observations.length
    ? [
      ...representedConfiguredOptions,
      {
        ...otherFocus,
        observations: sortObservationsChronologically(otherFocus.observations),
        count: otherFocus.observations.length,
      },
      ...unrepresentedConfiguredOptions,
    ]
    : configuredOptions;

  return {
    options,
    configuredFocusCount: configuredOptions.length,
    representedConfiguredFocusCount: representedConfiguredOptions.length,
    otherObservationCount: otherFocus.observations.length,
  };
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

function ObservationFocusSelector({ options, activeId, onActiveIdChange }) {
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
        const isActive = option.focusId === activeId;
        const hasObservation = option.count > 0;

        return (
          <ButtonBase
            key={option.focusId}
            onMouseEnter={() => onActiveIdChange(option.focusId)}
            onFocus={() => onActiveIdChange(option.focusId)}
            onClick={() => onActiveIdChange(option.focusId)}
            title={`${option.focusLabel}${hasObservation ? ` · ${option.count} observation${option.count === 1 ? '' : 's'}` : ' · no observation yet'}`}
            sx={{
              width: '100%',
              p: 0.72,
              borderRadius: '10px',
              justifyContent: 'flex-start',
              textAlign: 'left',
              bgcolor: isActive ? 'rgba(156, 40, 175, 0.055)' : 'transparent',
              boxShadow: isActive ? `inset 0 0 0 1px rgba(156, 40, 175, 0.24)` : 'inset 0 0 0 1px transparent',
              transition: 'background-color 140ms ease, box-shadow 140ms ease',
              '&:focus-visible': {
                boxShadow: `inset 0 0 0 1px rgba(156, 40, 175, 0.34), 0 0 0 3px rgba(156, 40, 175, 0.12)`,
              },
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
                {option.focusLabel}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 11.4, fontWeight: 800, flexShrink: 0 }}>
                {option.count}
              </Typography>
            </Stack>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

function getObservationRecordKey(item, index) {
  return item.id || `${item.date || 'no-date'}-${item.levelId || 'no-level'}-${index}`;
}

function ObservationRecordsList({ observations }) {
  return (
    <Stack spacing={0.55}>
      {observations.map((item, index) => (
        <Box key={getObservationRecordKey(item, index)} sx={{ p: 0.75, borderRadius: '9px', bgcolor: 'rgba(23, 21, 26, 0.025)', border: '1px solid rgba(23, 21, 26, 0.07)' }}>
          <Typography sx={{ color: darkText, fontSize: 12.1, fontWeight: 800 }}>
            {formatDemoDate(item.date)}{item.levelLabel ? ` · ${item.levelLabel}` : ''}
          </Typography>
          {!!item.note && (
            <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 11.8, lineHeight: 1.35 }}>
              {item.note}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}

function LatestObservationBlock({ observation }) {
  if (!observation) {
    return null;
  }

  return (
    <Box sx={{ p: 0.85, borderRadius: '10px', bgcolor: 'rgba(23, 21, 26, 0.025)', border: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 760 }}>Latest observation</Typography>
      <Typography sx={{ mt: 0.25, color: darkText, fontSize: 12.4, fontWeight: 850 }}>
        {formatDemoDate(observation.date)}{observation.levelLabel ? ` · ${observation.levelLabel}` : ''}
      </Typography>
      {!!observation.note && (
        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.8, lineHeight: 1.35 }}>
          {observation.note}
        </Typography>
      )}
    </Box>
  );
}

function ObservationLevelChart({ observations, levels }) {
  const [activePointId, setActivePointId] = useState('');
  const graphLeft = 16;
  const graphRight = 98;
  const graphTop = 9;
  const graphBottom = 43;
  const levelCount = levels.length;
  const minDate = Math.min(...observations.map((item) => item.timestamp));
  const maxDate = Math.max(...observations.map((item) => item.timestamp));
  const points = observations.map((item, index) => {
    const levelPosition = (item.levelOrder - 1) / Math.max(levelCount - 1, 1);
    const x = minDate === maxDate
      ? (graphLeft + graphRight) / 2
      : graphLeft + ((item.timestamp - minDate) / (maxDate - minDate)) * (graphRight - graphLeft);

    return {
      item,
      x,
      y: graphBottom - levelPosition * (graphBottom - graphTop),
      pointId: getObservationRecordKey(item, index),
    };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const activePoint = points.find((point) => point.pointId === activePointId) || points[points.length - 1] || null;

  return (
    <Stack spacing={0.65}>
      <Box
        component="svg"
        role="img"
        aria-label="Teacher-recorded levels over time"
        viewBox="0 0 100 54"
        sx={{
          width: '100%',
          height: 150,
          display: 'block',
          overflow: 'visible',
          '& circle': { transition: 'r 140ms ease, fill 140ms ease' },
          '& circle:hover': { r: 4.9, fill: darkText },
        }}
      >
        {levels.map((level) => {
          const levelPosition = (level.order - 1) / Math.max(levelCount - 1, 1);
          const y = graphBottom - levelPosition * (graphBottom - graphTop);

          return (
            <g key={level.id}>
              <line x1={graphLeft} y1={y} x2={graphRight} y2={y} stroke="rgba(23, 21, 26, 0.055)" strokeWidth="1" />
              <text x="2" y={y + 1.8} fill="rgba(23, 21, 26, 0.52)" fontSize="4.15" fontWeight="700">
                {level.label}
              </text>
            </g>
          );
        })}
        <line x1={graphLeft} y1={graphTop} x2={graphLeft} y2={graphBottom} stroke="rgba(23, 21, 26, 0.12)" strokeWidth="1.1" />
        <line x1={graphLeft} y1={graphBottom} x2={graphRight} y2={graphBottom} stroke="rgba(23, 21, 26, 0.12)" strokeWidth="1.1" />
        {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(23, 21, 26, 0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
        {points.map((point) => (
          <g
            key={point.pointId}
            role="button"
            tabIndex={0}
            aria-label={`${formatDemoDate(point.item.date)} ${point.item.levelLabel}${point.item.note ? ` ${point.item.note}` : ''}`}
            onMouseEnter={() => setActivePointId(point.pointId)}
            onFocus={() => setActivePointId(point.pointId)}
            onClick={() => setActivePointId(point.pointId)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActivePointId(point.pointId);
              }
            }}
          >
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgba(23, 21, 26, 0.78)"
              stroke="#fff"
              strokeWidth="1.6"
            >
              <title>{`${formatDemoDate(point.item.date)} · ${point.item.levelLabel}${point.item.note ? ` · ${point.item.note}` : ''}`}</title>
            </circle>
          </g>
        ))}
      </Box>

      {points.length === 1 && (
        <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
          One recorded point - no trend is shown.
        </Typography>
      )}

      {!!activePoint && (
        <Box sx={{ p: 0.75, borderRadius: '9px', bgcolor: 'rgba(23, 21, 26, 0.025)', border: '1px solid rgba(23, 21, 26, 0.07)' }}>
          <Typography sx={{ color: darkText, fontSize: 12.1, fontWeight: 820 }}>
            {formatDemoDate(activePoint.item.date)} · {activePoint.item.levelLabel}
          </Typography>
          {!!activePoint.item.note && (
            <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 11.8, lineHeight: 1.35 }}>
              {activePoint.item.note}
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );
}

function SelectedObservationFocusPanel({ focus, levels }) {
  if (!focus) {
    return (
      <Paper elevation={0} sx={{ p: 1.1, borderRadius: '12px', border: '1px solid rgba(23, 21, 26, 0.07)', bgcolor: '#fff' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
          No observation focus selected.
        </Typography>
      </Paper>
    );
  }

  const validLevelObservations = focus.isOther
    ? []
    : focus.observations.filter((item) => item.levelOrder !== null && item.timestamp !== null);
  const latestObservation = focus.observations[focus.observations.length - 1] || null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1, sm: 1.15 },
        borderRadius: '12px',
        border: '1px solid rgba(23, 21, 26, 0.07)',
        bgcolor: '#fff',
      }}
    >
      <Stack spacing={0.9}>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
          <Typography noWrap title={focus.focusLabel} sx={{ color: darkText, fontSize: 13.2, fontWeight: 900 }}>
            {focus.focusLabel}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 740 }}>
            {focus.count} observation{focus.count === 1 ? '' : 's'}
          </Typography>
        </Stack>
        <Typography sx={{ mt: -0.55, color: 'text.secondary', fontSize: 12.2 }}>
          Teacher-recorded levels over time
        </Typography>

        {focus.count === 0 ? (
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '11px', border: '1px dashed rgba(23, 21, 26, 0.14)', bgcolor: 'rgba(23, 21, 26, 0.015)' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>
              No observations recorded for this focus in this unit.
            </Typography>
          </Paper>
        ) : focus.isOther ? (
          <ObservationRecordsList observations={focus.observations} />
        ) : validLevelObservations.length ? (
          <ObservationLevelChart observations={validLevelObservations} levels={levels} />
        ) : (
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '11px', border: '1px dashed rgba(23, 21, 26, 0.14)', bgcolor: 'rgba(23, 21, 26, 0.015)' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>
              No recorded levels for this focus in this unit.
            </Typography>
          </Paper>
        )}

        <LatestObservationBlock observation={latestObservation} />
        {focus.isOther && focus.count > 1 && (
          <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
            Other observations are shown as records rather than a shared level timeline.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function StudentUnitInsightPanelV4({ student, summary }) {
  const assessments = getSortedAssessments(summary);
  const assessmentStats = getAssessmentStats(assessments);
  const observationCount = (summary.observations || []).length;
  const observationFocusModel = useMemo(() => normaliseObservationFocuses({
    configuredFocuses: summary.capturePoints || [],
    observations: summary.observations || [],
    levels: mathsCaptureLevels,
  }), [summary]);
  const observationFocusOptions = observationFocusModel.options;
  const firstObservedFocusId = observationFocusOptions.find((option) => option.count > 0)?.focusId || observationFocusOptions[0]?.focusId || '';
  const [activeObservationFocusId, setActiveObservationFocusId] = useState(firstObservedFocusId);
  useEffect(() => {
    setActiveObservationFocusId(firstObservedFocusId);
  }, [firstObservedFocusId, summary.unit.id]);
  const activeObservationFocus = observationFocusOptions.find((option) => option.focusId === activeObservationFocusId)
    || observationFocusOptions.find((option) => option.count > 0)
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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 300px) minmax(0, 1fr)' }, gap: 1.4, alignItems: 'start' }}>
                <Paper elevation={0} sx={{ p: 1, borderRadius: '12px', border: '1px solid rgba(23, 21, 26, 0.07)', bgcolor: '#fff' }}>
                  <Stack spacing={0.85}>
                    <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>Observation focus</Typography>
                    <ObservationFocusSelector
                      options={observationFocusOptions}
                      activeId={activeObservationFocus?.focusId || ''}
                      onActiveIdChange={setActiveObservationFocusId}
                    />
                    <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                      {observationFocusModel.representedConfiguredFocusCount}/{observationFocusModel.configuredFocusCount} configured focus{observationFocusModel.configuredFocusCount === 1 ? '' : 'es'} represented
                      {!!observationFocusModel.otherObservationCount && ` · ${observationFocusModel.otherObservationCount} other observation${observationFocusModel.otherObservationCount === 1 ? '' : 's'}`}
                    </Typography>
                  </Stack>
                </Paper>
                <SelectedObservationFocusPanel focus={activeObservationFocus} levels={mathsCaptureLevels} />
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
