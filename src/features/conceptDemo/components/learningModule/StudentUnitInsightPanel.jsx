import { useEffect, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, ButtonBase, IconButton, Paper, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import AssessmentPieChart, { getAssessmentPieHoverText } from './AssessmentPieChart.jsx';

const purple = 'var(--sd-primary)';
const darkText = 'var(--sd-text)';

function fallbackT(key, values = {}) {
  const fallbacks = {
    'learningModule.classPicture.noSavedDate': 'No saved date',
    'learningModule.classPicture.assessmentFallback': 'Assessment',
    'learningModule.classPicture.studentAbsentAssessment': 'Student marked as absent in assessment',
    'learningModule.classPicture.scorePassMax': 'Score: {{score}} · Pass: {{pass}} · Max: {{max}}',
    'learningModule.classPicture.notPassed': 'Not passed',
    'learningModule.classPicture.otherObservations': 'Other observations',
    'learningModule.classPicture.noObservationFocuses': 'No observation focuses configured.',
    'learningModule.classPicture.observationFocusTitle_one': '{{label}} · {{count}} observation',
    'learningModule.classPicture.observationFocusTitle_other': '{{label}} · {{count}} observations',
    'learningModule.classPicture.observationFocusNoObservation': '{{label}} · no observation yet',
    'learningModule.classPicture.teacherRecordedLevelsOverTime': 'Teacher-recorded levels over time',
    'learningModule.classPicture.noObservationFocusSelected': 'No observation focus selected.',
    'learningModule.classPicture.noObservationsForFocus': 'No observations recorded for this focus in this unit.',
    'learningModule.classPicture.noLevelsForFocus': 'No recorded levels for this focus in this unit.',
    'learningModule.classPicture.oneRecordedPoint': 'One recorded point - no trend is shown.',
    'learningModule.classPicture.otherObservationsRecordHint': 'Other observations are shown as records rather than a shared level timeline.',
    'learningModule.classPicture.closeUnitView': 'Close {{unit}} view',
    'learningModule.classPicture.assessments': 'Assessments',
    'learningModule.classPicture.purplePercentage': 'Purple · percentage',
    'learningModule.classPicture.absent': 'Absent',
    'learningModule.classPicture.latest': 'Latest',
    'learningModule.classPicture.highest': 'Highest',
    'learningModule.classPicture.average': 'Average',
    'learningModule.classPicture.change': 'Change',
    'learningModule.classPicture.points': '{{count}} pts',
    'learningModule.classPicture.observations': 'Observations',
    'learningModule.classPicture.focusTrendOverTime': 'Focus trend over time',
    'learningModule.classPicture.observationFocus': 'Observation focus',
    'learningModule.classPicture.focusSummary': 'Focus summary',
    'learningModule.classPicture.latestLevel': 'Latest: {{level}}',
    'learningModule.classPicture.lastObserved': 'Last: {{date}}',
    'learningModule.classPicture.recorded': 'Recorded',
    'learningModule.classPicture.noObservationYet': 'No observation yet',
    'learningModule.classPicture.observationMeta': '{{focuses}} focuses represented · {{observations}} observations total · Last observed {{date}}',
    'learningModule.classPicture.noObservedDate': 'not yet',
    'learningModule.classPicture.configuredFocusRepresented_one': '{{represented}}/{{total}} configured focus represented',
    'learningModule.classPicture.configuredFocusRepresented_other': '{{represented}}/{{total}} configured focuses represented',
    'learningModule.classPicture.otherObservationSummary_one': '{{count}} other observation',
    'learningModule.classPicture.otherObservationSummary_other': '{{count}} other observations',
  };
  const template = fallbacks[key] || key;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => (values[name] == null ? match : String(values[name])));
}

function getLearningModuleLocale(language) {
  return language === 'sv' ? 'sv-SE' : 'en-GB';
}

function getCountLabel(t, baseKey, count, values = {}) {
  return t(`${baseKey}_${count === 1 ? 'one' : 'other'}`, { count, ...values });
}

function formatDemoDate(date, language = 'en', t = fallbackT) {
  if (!date) {
    return t('learningModule.classPicture.noSavedDate');
  }

  return new Intl.DateTimeFormat(getLearningModuleLocale(language), { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getAssessmentPercentage(item) {
  const percentage = item?.percentage !== undefined && item?.percentage !== null
    ? Number(item.percentage)
    : item?.valueType === 'percentage'
      ? Number(item.value)
      : null;

  return Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : null;
}

function getAssessmentTitle(item, t = fallbackT) {
  return item.title || item.assessmentTitle || item.label || t('learningModule.classPicture.assessmentFallback');
}

function getSortedAssessments(summary) {
  return [...(summary.assessments || [])]
    .map((item) => ({
      ...item,
      percentage: getAssessmentPercentage(item),
    }))
    .filter((item) => item.absent || item.percentage !== null)
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

function getLatestObservation(items) {
  const sorted = sortObservationsChronologically(items);
  return sorted[sorted.length - 1] || null;
}

function getObservationTrendSymbol(items) {
  const validItems = sortObservationsChronologically(items)
    .filter((item) => item.levelOrder !== null && item.levelOrder !== undefined && item.timestamp !== null);

  if (validItems.length < 2) {
    return '→';
  }

  const firstTimestamp = validItems[0].timestamp;
  const lastTimestamp = validItems[validItems.length - 1].timestamp;
  const points = validItems.map((item, index) => ({
    x: firstTimestamp === lastTimestamp
      ? index
      : (item.timestamp - firstTimestamp) / (lastTimestamp - firstTimestamp),
    y: Number(item.levelOrder),
  }));
  const averageX = points.reduce((total, point) => total + point.x, 0) / points.length;
  const averageY = points.reduce((total, point) => total + point.y, 0) / points.length;
  const varianceX = points.reduce((total, point) => total + ((point.x - averageX) ** 2), 0);
  const covariance = points.reduce((total, point) => total + ((point.x - averageX) * (point.y - averageY)), 0);
  const slope = varianceX ? covariance / varianceX : 0;

  if (slope >= 0.35) return '↗';
  if (slope <= -0.35) return '↘';
  return '→';
}

function getObservationNote(item) {
  return item?.observationText || item?.note || item?.label || '';
}

function getLocalizedValue(value, language = 'en') {
  if (value && typeof value === 'object') {
    return value[language] || value.en || Object.values(value)[0] || '';
  }

  return value || '';
}

function getLevelMap(levels) {
  return new Map((levels || []).map((level) => [level.id, level]));
}

function normaliseObservationFocuses({ configuredFocuses = [], observations = [], levels = [], learningContexts = [], language = 'en', t = fallbackT }) {
  const levelById = getLevelMap(levels);
  const configuredFocusById = new Map();
  const activityCapturePointById = new Map(
    (learningContexts || []).flatMap((context) => (context.capturePoints || []).map((capturePoint) => [
      capturePoint.id,
      {
        ...capturePoint,
        contextLabel: getLocalizedValue(context.label, language),
        label: getLocalizedValue(capturePoint.label, language),
      },
    ])),
  );

  configuredFocuses.forEach((focus) => {
    if (focus?.id) {
      configuredFocusById.set(focus.id, {
        focusId: `configured:${focus.id}`,
        focusIds: [focus.id],
        focusLabel: focus.label || focus.title || focus.id,
        observations: [],
        count: 0,
        isOther: false,
      });
    }
  });

  const otherFocus = {
    focusId: 'other-observations',
    focusIds: [],
    focusLabel: t('learningModule.classPicture.otherObservations'),
    observations: [],
    count: 0,
    isOther: true,
  };

  (observations || []).forEach((item) => {
    const configuredFocus = configuredFocusById.get(item?.skillId || item?.capturePointId);
    const group = configuredFocus || otherFocus;
    const level = item?.levelId ? levelById.get(item.levelId) : null;
    const recordKey = item.id || `${item.date || 'no-date'}-${item.levelId || 'no-level'}-${group.observations.length}`;
    const activityCapturePoint = item?.capturePointId ? activityCapturePointById.get(item.capturePointId) : null;
    const activityLabel = getLocalizedValue(item?.contextLabel, language) || activityCapturePoint?.contextLabel || '';
    const activityCaptureLabel = activityCapturePoint?.label || '';

    group.observations.push({
      ...item,
      id: item.id,
      recordKey,
      date: item.date || '',
      levelId: item.levelId || '',
      levelLabel: level?.label || '',
      levelOrder: level?.order || null,
      note: getObservationNote(item),
      activityLabel,
      activityCaptureLabel,
      timestamp: getObservationTimestamp(item),
    });
  });

  const configuredOptions = [...configuredFocusById.values()]
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

function getAssessmentStats(assessments) {
  const scoredAssessments = assessments.filter((item) => !item.absent);

  if (!scoredAssessments.length) {
    return { highest: null, latest: null, average: null, movement: null };
  }

  const highest = scoredAssessments.reduce((best, item) => (item.percentage > best.percentage ? item : best), scoredAssessments[0]);
  const latest = scoredAssessments[scoredAssessments.length - 1];
  const average = Math.round(scoredAssessments.reduce((total, item) => total + item.percentage, 0) / scoredAssessments.length);
  const movement = scoredAssessments.length > 1 ? latest.percentage - scoredAssessments[0].percentage : null;

  return { highest, latest, average, movement };
}

function ObservationFocusSelector({ options, activeId, onActiveIdChange, t = fallbackT }) {
  if (!options.length) {
    return (
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
        {t('learningModule.classPicture.noObservationFocuses')}
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
            title={hasObservation
              ? getCountLabel(t, 'learningModule.classPicture.observationFocusTitle', option.count, { label: option.focusLabel })
              : t('learningModule.classPicture.observationFocusNoObservation', { label: option.focusLabel })}
            sx={{
              width: '100%',
              p: 0.72,
              borderRadius: '10px',
              justifyContent: 'flex-start',
              textAlign: 'left',
              bgcolor: isActive ? 'rgba(var(--sd-primary-rgb), 0.055)' : 'transparent',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.24)' : 'inset 0 0 0 1px transparent',
              transition: 'background-color 140ms ease, box-shadow 140ms ease',
              '&:focus-visible': { boxShadow: 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.34), 0 0 0 3px rgba(var(--sd-primary-rgb), 0.12)' },
              '&:hover': { bgcolor: isActive ? 'rgba(var(--sd-primary-rgb), 0.07)' : 'rgba(var(--sd-text-rgb), 0.035)' },
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: hasObservation ? darkText : 'var(--sd-surface)',
                  border: isActive
                    ? `2px solid ${purple}`
                    : hasObservation
                      ? '1px solid rgba(var(--sd-text-rgb), 0.72)'
                      : '1px solid rgba(var(--sd-text-rgb), 0.22)',
                  boxShadow: isActive ? '0 0 0 3px rgba(var(--sd-primary-rgb), 0.1)' : 'none',
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

function ObservationFocusSummaryList({ options, activeId, onActiveIdChange, language = 'en', t = fallbackT }) {
  if (!options.length) {
    return (
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
        {t('learningModule.classPicture.noObservationFocuses')}
      </Typography>
    );
  }

  return (
    <Stack spacing={0.75}>
      {options.map((option) => {
        const isActive = option.focusId === activeId;
        const latestObservation = getLatestObservation(option.observations);
        const latestLevel = latestObservation?.levelLabel || (option.count ? t('learningModule.classPicture.recorded') : '');
        const trendSymbol = option.count ? getObservationTrendSymbol(option.observations) : '→';
        const title = option.count
          ? `${option.focusLabel} · ${option.count} obs · ${t('learningModule.classPicture.latestLevel', { level: latestLevel })} · ${t('learningModule.classPicture.lastObserved', { date: formatDemoDate(latestObservation?.date, language, t) })}`
          : t('learningModule.classPicture.observationFocusNoObservation', { label: option.focusLabel });

        return (
          <ButtonBase
            key={option.focusId}
            onMouseEnter={() => onActiveIdChange(option.focusId)}
            onFocus={() => onActiveIdChange(option.focusId)}
            onClick={() => onActiveIdChange(option.focusId)}
            title={title}
            sx={{
              width: '100%',
              p: 0.85,
              borderRadius: '10px',
              justifyContent: 'flex-start',
              textAlign: 'left',
              bgcolor: isActive ? 'rgba(var(--sd-primary-rgb), 0.06)' : 'transparent',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.24)' : 'inset 0 0 0 1px rgba(23, 21, 26, 0.07)',
              transition: 'background-color 140ms ease, box-shadow 140ms ease',
              '&:focus-visible': { boxShadow: 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.34), 0 0 0 3px rgba(var(--sd-primary-rgb), 0.12)' },
              '&:hover': { bgcolor: isActive ? 'rgba(var(--sd-primary-rgb), 0.08)' : 'rgba(var(--sd-text-rgb), 0.035)' },
            }}
          >
            <Stack spacing={0.35} sx={{ width: '100%', minWidth: 0 }}>
              <Typography noWrap sx={{ color: option.count ? darkText : 'text.secondary', fontSize: 12.7, fontWeight: isActive ? 900 : 830, minWidth: 0 }}>
                {option.focusLabel}
              </Typography>
              {option.count ? (
                <>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 760, lineHeight: 1.25 }}>
                    {option.count} obs · {t('learningModule.classPicture.latestLevel', { level: latestLevel })} · {trendSymbol}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.4, lineHeight: 1.2 }}>
                    {t('learningModule.classPicture.lastObserved', { date: formatDemoDate(latestObservation?.date, language, t) })}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: 'text.secondary', fontSize: 11.5, lineHeight: 1.25 }}>
                  {t('learningModule.classPicture.noObservationYet')}
                </Typography>
              )}
            </Stack>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

function getObservationRecordKey(item, index = 0) {
  return item.recordKey || item.id || `${item.date || 'no-date'}-${item.levelId || 'no-level'}-${index}`;
}

function ObservationRecordsList({ observations, activeRecordId, onActiveRecordChange, language = 'en', t = fallbackT }) {
  return (
    <Stack spacing={0}>
      {observations.map((item, index) => {
        const recordKey = getObservationRecordKey(item, index);
        const isActive = activeRecordId === recordKey;
        const hasActivityContext = Boolean(item.activityLabel || item.activityCaptureLabel);

        return (
          <Box
            key={recordKey}
            role="button"
            tabIndex={0}
            onMouseEnter={() => onActiveRecordChange(recordKey)}
            onFocus={() => onActiveRecordChange(recordKey)}
            onClick={() => onActiveRecordChange(recordKey)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActiveRecordChange(recordKey);
              }
            }}
            sx={{
              display: 'grid',
              gridTemplateColumns: '72px minmax(72px, 0.42fr) minmax(0, 1fr)',
              gap: 0.75,
              alignItems: 'start',
              py: 0.58,
              px: 0.45,
              borderRadius: '8px',
              borderTop: index === 0 ? '1px solid rgba(var(--sd-text-rgb), 0.07)' : 'none',
              borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.07)',
              bgcolor: isActive ? 'rgba(var(--sd-primary-rgb), 0.06)' : 'transparent',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.18)' : 'none',
              cursor: 'pointer',
              transition: 'background-color 140ms ease, box-shadow 140ms ease',
              '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 },
            }}
          >
            <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 760 }}>
              {formatDemoDate(item.date, language, t)}
            </Typography>
            <Typography sx={{ color: darkText, fontSize: 11.8, fontWeight: 820 }}>
              {item.levelLabel || ''}
            </Typography>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              {hasActivityContext && (
                <Box sx={{ minWidth: 0 }}>
                  {!!item.activityLabel && (
                    <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 11.2, fontWeight: 860, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.activityLabel}
                    </Typography>
                  )}
                  {!!item.activityCaptureLabel && (
                    <Typography sx={{ color: darkText, fontSize: 11.8, fontWeight: 820, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.activityCaptureLabel}
                    </Typography>
                  )}
                </Box>
              )}
              {!!item.note && (
                <Typography sx={{ color: 'text.secondary', fontSize: 11.8, lineHeight: 1.35 }}>
                  {item.note}
                </Typography>
              )}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

function ObservationLevelChartGraphic({ observations, levels, activeRecordId, onActiveRecordChange, language = 'en', t = fallbackT }) {
  const graphLeft = 28;
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

  return (
    <Box component="svg" role="img" aria-label={t('learningModule.classPicture.teacherRecordedLevelsOverTime')} viewBox="0 0 100 54" sx={{ width: '100%', height: { xs: 165, lg: 220 }, display: 'block', overflow: 'visible', '& circle': { transition: 'r 140ms ease, fill 140ms ease' }, '& circle:hover': { r: 2.7, fill: purple } }}>
      {levels.map((level) => {
        const levelPosition = (level.order - 1) / Math.max(levelCount - 1, 1);
        const y = graphBottom - levelPosition * (graphBottom - graphTop);

        return (
          <g key={level.id}>
            <line x1={graphLeft} y1={y} x2={graphRight} y2={y} stroke="rgba(var(--sd-text-rgb), 0.055)" strokeWidth="1" />
            <text x={graphLeft - 3} y={y + 1.8} textAnchor="end" fill={darkText} fontSize="3.2" fontWeight="700">
              {level.label}
            </text>
          </g>
        );
      })}
      <line x1={graphLeft} y1={graphTop} x2={graphLeft} y2={graphBottom} stroke="rgba(var(--sd-text-rgb), 0.12)" strokeWidth="1.1" />
      <line x1={graphLeft} y1={graphBottom} x2={graphRight} y2={graphBottom} stroke="rgba(var(--sd-text-rgb), 0.12)" strokeWidth="1.1" />
      {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(var(--sd-primary-rgb), 0.32)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((point) => {
        const isActive = activeRecordId === point.pointId;

        return (
          <g
            key={point.pointId}
            role="button"
            tabIndex={0}
            aria-label={`${formatDemoDate(point.item.date, language, t)} ${point.item.levelLabel}${point.item.note ? ` ${point.item.note}` : ''}`}
            onMouseEnter={() => onActiveRecordChange(point.pointId)}
            onFocus={() => onActiveRecordChange(point.pointId)}
            onClick={() => onActiveRecordChange(point.pointId)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActiveRecordChange(point.pointId);
              }
            }}
          >
            <circle cx={point.x} cy={point.y} r={isActive ? '2.1' : '1.8'} fill={purple} stroke={isActive ? 'rgba(var(--sd-primary-rgb), 0.22)' : 'var(--sd-surface)'} strokeWidth={isActive ? '1.6' : '0.9'}>
              <title>{`${formatDemoDate(point.item.date, language, t)} · ${point.item.levelLabel}${point.item.note ? ` · ${point.item.note}` : ''}`}</title>
            </circle>
          </g>
        );
      })}
    </Box>
  );
}

function SelectedObservationFocusDetails({ focus, validLevelObservations, activeRecordId, onActiveRecordChange, language = 'en', t = fallbackT }) {
  if (!focus) {
    return (
      <Paper elevation={0} sx={{ p: 1.1, borderRadius: '12px', border: '1px solid rgba(var(--sd-text-rgb), 0.07)', bgcolor: 'var(--sd-surface)' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
          {t('learningModule.classPicture.noObservationFocusSelected')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.15 }, borderRadius: '12px', border: '1px solid rgba(var(--sd-text-rgb), 0.07)', bgcolor: 'var(--sd-surface)' }}>
      <Stack spacing={0.9}>
        <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>
          {t('learningModule.classPicture.teacherRecordedLevelsOverTime')}
        </Typography>

        {focus.count === 0 ? (
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '11px', border: '1px dashed rgba(var(--sd-text-rgb), 0.14)', bgcolor: 'rgba(var(--sd-text-rgb), 0.015)' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>
              {t('learningModule.classPicture.noObservationsForFocus')}
            </Typography>
          </Paper>
        ) : focus.isOther ? (
          <ObservationRecordsList observations={focus.observations} activeRecordId={activeRecordId} onActiveRecordChange={onActiveRecordChange} language={language} t={t} />
        ) : validLevelObservations.length ? (
          <ObservationRecordsList observations={focus.observations} activeRecordId={activeRecordId} onActiveRecordChange={onActiveRecordChange} language={language} t={t} />
        ) : (
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '11px', border: '1px dashed rgba(var(--sd-text-rgb), 0.14)', bgcolor: 'rgba(var(--sd-text-rgb), 0.015)' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>
              {t('learningModule.classPicture.noLevelsForFocus')}
            </Typography>
          </Paper>
        )}

        {validLevelObservations.length === 1 && (
          <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
            {t('learningModule.classPicture.oneRecordedPoint')}
          </Typography>
        )}
        {focus.isOther && focus.count > 1 && (
          <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
            {t('learningModule.classPicture.otherObservationsRecordHint')}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function StudentUnitInsightPanel({
  student,
  summary,
  unit,
  configuredFocuses = [],
  learningContexts = [],
  levels = [],
  onClose,
  onEditAssessment,
  language = 'en',
  t = fallbackT,
}) {
  const panelUnit = summary?.unit || unit || {};
  const assessments = getSortedAssessments(summary || {});
  const assessmentStats = getAssessmentStats(assessments);
  const unitObservations = useMemo(() => (
    (summary?.observations || []).filter((item) => !panelUnit.id || item.teachingUnitId === panelUnit.id)
  ), [panelUnit.id, summary?.observations]);
  const configuredFocusesForUnit = useMemo(() => {
    if (panelUnit.observationDimensions?.length) {
      return panelUnit.observationDimensions;
    }

    const unitSkillIds = new Set(panelUnit.skillIds || panelUnit.defaultAbilityIds || panelUnit.abilityIds || []);

    if (!unitSkillIds.size) {
      return configuredFocuses;
    }

    return configuredFocuses.filter((focus) => unitSkillIds.has(focus.id));
  }, [configuredFocuses, panelUnit.abilityIds, panelUnit.defaultAbilityIds, panelUnit.observationDimensions, panelUnit.skillIds]);
  const observationFocusModel = useMemo(() => normaliseObservationFocuses({
    configuredFocuses: configuredFocusesForUnit,
    observations: unitObservations,
    levels,
    learningContexts,
    language,
    t,
  }), [configuredFocusesForUnit, language, learningContexts, levels, t, unitObservations]);
  const observationFocusOptions = observationFocusModel.options;
  const firstObservedFocusId = observationFocusOptions.find((option) => option.count > 0)?.focusId || observationFocusOptions[0]?.focusId || '';
  const [activeObservationFocusId, setActiveObservationFocusId] = useState(firstObservedFocusId);
  const [activeObservationRecordId, setActiveObservationRecordId] = useState('');
  const [unitLayoutVersion, setUnitLayoutVersion] = useState('v1');
  const unitLayoutV2 = unitLayoutVersion === 'v2';

  useEffect(() => {
    setActiveObservationFocusId(firstObservedFocusId);
  }, [firstObservedFocusId, panelUnit.id]);

  const activeObservationFocus = observationFocusOptions.find((option) => option.focusId === activeObservationFocusId)
    || observationFocusOptions.find((option) => option.count > 0)
    || observationFocusOptions[0]
    || null;
  const validLevelObservations = activeObservationFocus && !activeObservationFocus.isOther
    ? activeObservationFocus.observations.filter((item) => item.levelOrder !== null && item.timestamp !== null)
    : [];
  const observationSummaryLatest = getLatestObservation(observationFocusOptions.flatMap((option) => option.observations || []));
  const observationSummaryText = t('learningModule.classPicture.observationMeta', {
    focuses: observationFocusModel.representedConfiguredFocusCount,
    observations: observationFocusOptions.reduce((total, option) => total + option.count, 0),
    date: observationSummaryLatest?.date
      ? formatDemoDate(observationSummaryLatest.date, language, t)
      : t('learningModule.classPicture.noObservedDate'),
  });

  useEffect(() => {
    setActiveObservationRecordId('');
  }, [activeObservationFocus?.focusId]);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: 'var(--sd-surface-muted)', borderTop: '1px solid rgba(var(--sd-text-rgb), 0.07)' }}>
      <Paper elevation={0} id={`student-unit-insight-${student.id}-${panelUnit.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: `6px solid ${purple}`, bgcolor: 'var(--sd-surface)' }}>
        <Stack
          spacing={1.35}
          sx={{
            '& .LearningModuleUnitAssessmentPanel': {
              order: unitLayoutV2 ? 3 : 2,
            },
            '& .LearningModuleUnitObservationPanel': {
              order: unitLayoutV2 ? 2 : 3,
            },
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'start', gap: 0.8 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>
                {panelUnit.label || panelUnit.title}
              </Typography>
              <Typography aria-hidden="true" sx={{ mt: 0.2, fontSize: 12.8, lineHeight: 1.43, visibility: 'hidden' }}>
                &nbsp;
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.7} alignItems="center" justifyContent="flex-end" sx={{ justifySelf: 'end' }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={unitLayoutVersion}
                onChange={(_, nextVersion) => {
                  if (nextVersion) {
                    setUnitLayoutVersion(nextVersion);
                  }
                }}
                aria-label="Unit expanded view layout"
                sx={{
                  p: 0.2,
                  borderRadius: '999px',
                  bgcolor: 'rgba(var(--sd-text-rgb), 0.045)',
                  '& .MuiToggleButtonGroup-grouped': {
                    minWidth: 34,
                    height: 28,
                    px: 0.9,
                    border: 0,
                    borderRadius: '999px !important',
                    color: 'text.secondary',
                    fontSize: 11.5,
                    fontWeight: 850,
                    '&.Mui-selected': {
                      color: 'var(--sd-accent-text)',
                      bgcolor: 'var(--sd-surface)',
                      boxShadow: '0 4px 12px rgba(23, 21, 26, 0.08)',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'var(--sd-surface)',
                    },
                  },
                }}
              >
                <ToggleButton value="v1" aria-label="Unit expanded view V1">V1</ToggleButton>
                <ToggleButton value="v2" aria-label="Unit expanded view V2">V2</ToggleButton>
              </ToggleButtonGroup>
              <IconButton
                type="button"
                aria-label={t('learningModule.classPicture.closeUnitView', { unit: panelUnit.label || panelUnit.title })}
                onClick={onClose}
                size="small"
                sx={{
                  color: 'var(--sd-text-muted)',
                  bgcolor: 'var(--sd-surface)',
                  border: '1px solid rgba(var(--sd-text-rgb), 0.1)',
                  '&:hover': { color: 'var(--sd-accent-text)', borderColor: 'rgba(var(--sd-primary-rgb), 0.28)', bgcolor: 'rgba(var(--sd-primary-rgb), 0.045)' },
                  '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                }}
              >
                <CloseIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Stack>
          </Box>

          <Paper className="LearningModuleUnitAssessmentPanel" elevation={0} sx={{ p: unitLayoutV2 ? 1.15 : 1.35, borderRadius: '14px', border: `1px solid ${unitLayoutV2 ? 'rgba(var(--sd-primary-rgb), 0.28)' : purple}`, bgcolor: 'var(--sd-surface)' }}>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 900 }}>{t('learningModule.classPicture.assessments')}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>{t('learningModule.classPicture.purplePercentage')}</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)' }, gap: 1.4, alignItems: 'start' }}>
                <Stack direction="row" spacing={1.4} flexWrap="wrap" useFlexGap alignItems="flex-start">
                  {assessments.length ? assessments.map((assessment) => (
                    <Stack key={assessment.id || assessment.date} spacing={0.65} sx={{ width: 126 }}>
                      <AssessmentPieChart assessment={assessment} onEditAssessment={onEditAssessment} t={t} />
                      <Tooltip title={getAssessmentPieHoverText(assessment, t)} arrow>
                        <Stack direction="row" spacing={0.35} alignItems="center">
                          <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 850, lineHeight: 1.2, minWidth: 0 }}>
                            {getAssessmentTitle(assessment, t)}
                          </Typography>
                        </Stack>
                      </Tooltip>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.7 }}>
                        {assessment.absent ? t('learningModule.classPicture.absent') : `${assessment.percentage}%`} · {formatDemoDate(assessment.date, language, t)}
                      </Typography>
                    </Stack>
                  )) : (
                    <Box sx={{ width: 86, height: 86, borderRadius: '50%', bgcolor: 'rgba(var(--sd-primary-rgb), 0.1)', boxShadow: 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.18)' }} />
                  )}
                </Stack>
                <Box
                  sx={{
                    gridColumn: { xs: 'auto', lg: '1 / -1' },
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
                    gap: 1,
                    p: 0.9,
                    borderRadius: '10px',
                    border: '1px solid rgba(var(--sd-primary-rgb), 0.16)',
                    bgcolor: 'rgba(var(--sd-primary-rgb), 0.035)',
                  }}
                >
                  {[
                    assessmentStats.latest ? [t('learningModule.classPicture.latest'), `${assessmentStats.latest.percentage}% · ${getAssessmentTitle(assessmentStats.latest, t)}`] : null,
                    assessmentStats.highest ? [t('learningModule.classPicture.highest'), `${assessmentStats.highest.percentage}% · ${getAssessmentTitle(assessmentStats.highest, t)}`] : null,
                    assessmentStats.average !== null ? [t('learningModule.classPicture.average'), `${assessmentStats.average}%`] : null,
                    assessmentStats.movement !== null ? [t('learningModule.classPicture.change'), t('learningModule.classPicture.points', { count: `${assessmentStats.movement > 0 ? '+' : ''}${assessmentStats.movement}` })] : null,
                  ].filter(Boolean).map(([label, value]) => (
                    <Box key={label} sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 740 }}>{label}</Typography>
                      <Typography noWrap title={value} sx={{ mt: 0.2, color: darkText, fontSize: 12.8, fontWeight: 850 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Stack>
          </Paper>

          <Paper className="LearningModuleUnitObservationPanel" elevation={0} sx={{ p: unitLayoutV2 ? 1.55 : 1.35, borderRadius: '14px', border: `1px solid ${purple}`, bgcolor: unitLayoutV2 ? 'rgba(var(--sd-primary-rgb), 0.025)' : 'var(--sd-surface)' }}>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 900 }}>{t('learningModule.classPicture.observations')}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>{t('learningModule.classPicture.focusTrendOverTime')}</Typography>
              </Stack>
              {unitLayoutV2 && (
                <Typography sx={{ mt: -0.55, color: 'text.secondary', fontSize: 12.1, fontWeight: 740 }}>
                  {observationSummaryText}
                </Typography>
              )}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 300px) minmax(0, 1fr) minmax(0, 1fr)' }, gap: 1.4, alignItems: 'start' }}>
                <Paper elevation={0} sx={{ p: 1, borderRadius: '12px', border: '1px solid rgba(var(--sd-text-rgb), 0.07)', bgcolor: 'var(--sd-surface)' }}>
                  <Stack spacing={0.85}>
                    <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>
                      {unitLayoutV2 ? t('learningModule.classPicture.focusSummary') : t('learningModule.classPicture.observationFocus')}
                    </Typography>
                    {unitLayoutV2 ? (
                      <ObservationFocusSummaryList options={observationFocusOptions} activeId={activeObservationFocus?.focusId || ''} onActiveIdChange={setActiveObservationFocusId} language={language} t={t} />
                    ) : (
                      <>
                        <ObservationFocusSelector options={observationFocusOptions} activeId={activeObservationFocus?.focusId || ''} onActiveIdChange={setActiveObservationFocusId} t={t} />
                        <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                          {getCountLabel(t, 'learningModule.classPicture.configuredFocusRepresented', observationFocusModel.configuredFocusCount, {
                            represented: observationFocusModel.representedConfiguredFocusCount,
                            total: observationFocusModel.configuredFocusCount,
                          })}
                          {!!observationFocusModel.otherObservationCount && ` · ${getCountLabel(t, 'learningModule.classPicture.otherObservationSummary', observationFocusModel.otherObservationCount)}`}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Paper>
                <SelectedObservationFocusDetails focus={activeObservationFocus} validLevelObservations={validLevelObservations} activeRecordId={activeObservationRecordId} onActiveRecordChange={setActiveObservationRecordId} language={language} t={t} />
                {!!validLevelObservations.length && (
                  <ObservationLevelChartGraphic observations={validLevelObservations} levels={levels} activeRecordId={activeObservationRecordId} onActiveRecordChange={setActiveObservationRecordId} language={language} t={t} />
                )}
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}
