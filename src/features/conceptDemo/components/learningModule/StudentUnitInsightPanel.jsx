import { useEffect, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { Box, ButtonBase, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';

const purple = '#9c28af';
const darkText = '#17151a';

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
    .filter((item) => item.percentage !== null)
    .sort((first, second) => (first.date || '').localeCompare(second.date || ''));
}

function getAssessmentPassPercentage(assessment) {
  const maxScore = Number(assessment.maxScore ?? assessment.max);
  const passScore = Number(assessment.passScore ?? assessment.pass);

  return Number.isFinite(maxScore) && maxScore > 0 && Number.isFinite(passScore)
    ? Math.max(0, Math.min(100, (passScore / maxScore) * 100))
    : null;
}

function isAssessmentNotPassed(assessment) {
  const passPercentage = getAssessmentPassPercentage(assessment);

  return !assessment.absent && (
    Boolean(assessment.warning)
    || assessment.passed === false
    || (passPercentage !== null && Number(assessment.percentage) < passPercentage)
  );
}

function formatAssessmentHoverValue(value, fallback = '-') {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Number.isInteger(numberValue) ? String(numberValue) : String(numberValue);
}

function getAssessmentPieHoverText(assessment, t = fallbackT) {
  if (assessment.absent) {
    return t('learningModule.classPicture.studentAbsentAssessment');
  }

  const score = assessment.actualValue ?? assessment.rawResult ?? assessment.score ?? assessment.percentage;
  const passScore = assessment.passScore ?? assessment.pass;
  const maxScore = assessment.maxScore ?? assessment.max;
  const text = t('learningModule.classPicture.scorePassMax', {
    score: formatAssessmentHoverValue(score),
    pass: formatAssessmentHoverValue(passScore),
    max: formatAssessmentHoverValue(maxScore),
  });

  return isAssessmentNotPassed(assessment) ? `${t('learningModule.classPicture.notPassed')} - ${text}` : text;
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

function normaliseObservationFocuses({ configuredFocuses = [], observations = [], levels = [], t = fallbackT }) {
  const levelById = getLevelMap(levels);
  const configuredFocusById = new Map();

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

    group.observations.push({
      ...item,
      id: item.id,
      recordKey,
      date: item.date || '',
      levelId: item.levelId || '',
      levelLabel: level?.label || '',
      levelOrder: level?.order || null,
      note: getObservationNote(item),
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

function AssessmentPie({ assessment, size = 86, t = fallbackT }) {
  const passPercentage = getAssessmentPassPercentage(assessment);
  const passRadians = passPercentage !== null ? (passPercentage / 100) * Math.PI * 2 : null;
  const hoverText = getAssessmentPieHoverText(assessment, t);
  const passMarker = passRadians !== null
    ? (() => {
      const radial = { x: Math.sin(passRadians), y: -Math.cos(passRadians) };
      const tangent = { x: Math.cos(passRadians), y: Math.sin(passRadians) };
      const tip = { x: 50 + radial.x * 38, y: 50 + radial.y * 38 };
      const base = { x: 50 + radial.x * 49, y: 50 + radial.y * 49 };
      const halfWidth = 6.1;
      const leftBase = { x: base.x + tangent.x * halfWidth, y: base.y + tangent.y * halfWidth };
      const rightBase = { x: base.x - tangent.x * halfWidth, y: base.y - tangent.y * halfWidth };

      return {
        tip,
        leftBase,
        rightBase,
        points: [`${tip.x},${tip.y}`, `${leftBase.x},${leftBase.y}`, `${rightBase.x},${rightBase.y}`].join(' '),
      };
    })()
    : null;

  return (
    <Tooltip title={hoverText} arrow>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: purple,
          background: `conic-gradient(${purple} 0 ${assessment.percentage}%, rgba(156, 40, 175, 0.12) ${assessment.percentage}% 100%)`,
          boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.28)',
          transition: 'transform 140ms ease, box-shadow 140ms ease',
          '&:hover': {
            transform: 'scale(1.04)',
            boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.45), 0 10px 24px rgba(156, 40, 175, 0.13)',
          },
        }}
      >
        {passMarker && (
          <Box component="svg" aria-hidden="true" viewBox="0 0 100 100" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
            <polygon points={passMarker.points} fill="#fff" />
            <line x1={passMarker.tip.x} y1={passMarker.tip.y} x2={passMarker.leftBase.x} y2={passMarker.leftBase.y} stroke="rgba(156, 40, 175, 0.28)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1={passMarker.tip.x} y1={passMarker.tip.y} x2={passMarker.rightBase.x} y2={passMarker.rightBase.y} stroke="rgba(156, 40, 175, 0.28)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1={passMarker.leftBase.x} y1={passMarker.leftBase.y} x2={passMarker.rightBase.x} y2={passMarker.rightBase.y} stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </Box>
        )}
        {assessment.absent && <PersonOffOutlinedIcon sx={{ position: 'relative', zIndex: 2, fontSize: Math.round(size * 0.38) }} />}
      </Box>
    </Tooltip>
  );
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
              bgcolor: isActive ? 'rgba(156, 40, 175, 0.055)' : 'transparent',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(156, 40, 175, 0.24)' : 'inset 0 0 0 1px transparent',
              transition: 'background-color 140ms ease, box-shadow 140ms ease',
              '&:focus-visible': { boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.34), 0 0 0 3px rgba(156, 40, 175, 0.12)' },
              '&:hover': { bgcolor: isActive ? 'rgba(156, 40, 175, 0.07)' : 'rgba(23, 21, 26, 0.035)' },
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

function getObservationRecordKey(item, index = 0) {
  return item.recordKey || item.id || `${item.date || 'no-date'}-${item.levelId || 'no-level'}-${index}`;
}

function ObservationRecordsList({ observations, activeRecordId, onActiveRecordChange, language = 'en', t = fallbackT }) {
  return (
    <Stack spacing={0}>
      {observations.map((item, index) => {
        const recordKey = getObservationRecordKey(item, index);
        const isActive = activeRecordId === recordKey;

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
              borderTop: index === 0 ? '1px solid rgba(23, 21, 26, 0.07)' : 'none',
              borderBottom: '1px solid rgba(23, 21, 26, 0.07)',
              bgcolor: isActive ? 'rgba(156, 40, 175, 0.06)' : 'transparent',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(156, 40, 175, 0.18)' : 'none',
              cursor: 'pointer',
              transition: 'background-color 140ms ease, box-shadow 140ms ease',
              '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
            }}
          >
            <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 760 }}>
              {formatDemoDate(item.date, language, t)}
            </Typography>
            <Typography sx={{ color: darkText, fontSize: 11.8, fontWeight: 820 }}>
              {item.levelLabel || ''}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 11.8, lineHeight: 1.35 }}>
              {item.note || ''}
            </Typography>
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
            <line x1={graphLeft} y1={y} x2={graphRight} y2={y} stroke="rgba(23, 21, 26, 0.055)" strokeWidth="1" />
            <text x={graphLeft - 3} y={y + 1.8} textAnchor="end" fill={darkText} fontSize="3.2" fontWeight="700">
              {level.label}
            </text>
          </g>
        );
      })}
      <line x1={graphLeft} y1={graphTop} x2={graphLeft} y2={graphBottom} stroke="rgba(23, 21, 26, 0.12)" strokeWidth="1.1" />
      <line x1={graphLeft} y1={graphBottom} x2={graphRight} y2={graphBottom} stroke="rgba(23, 21, 26, 0.12)" strokeWidth="1.1" />
      {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(156, 40, 175, 0.32)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />}
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
            <circle cx={point.x} cy={point.y} r={isActive ? '2.1' : '1.8'} fill={purple} stroke={isActive ? 'rgba(156, 40, 175, 0.22)' : '#fff'} strokeWidth={isActive ? '1.6' : '0.9'}>
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
      <Paper elevation={0} sx={{ p: 1.1, borderRadius: '12px', border: '1px solid rgba(23, 21, 26, 0.07)', bgcolor: '#fff' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
          {t('learningModule.classPicture.noObservationFocusSelected')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.15 }, borderRadius: '12px', border: '1px solid rgba(23, 21, 26, 0.07)', bgcolor: '#fff' }}>
      <Stack spacing={0.9}>
        <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>
          {t('learningModule.classPicture.teacherRecordedLevelsOverTime')}
        </Typography>

        {focus.count === 0 ? (
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '11px', border: '1px dashed rgba(23, 21, 26, 0.14)', bgcolor: 'rgba(23, 21, 26, 0.015)' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>
              {t('learningModule.classPicture.noObservationsForFocus')}
            </Typography>
          </Paper>
        ) : focus.isOther ? (
          <ObservationRecordsList observations={focus.observations} activeRecordId={activeRecordId} onActiveRecordChange={onActiveRecordChange} language={language} t={t} />
        ) : validLevelObservations.length ? (
          <ObservationRecordsList observations={focus.observations} activeRecordId={activeRecordId} onActiveRecordChange={onActiveRecordChange} language={language} t={t} />
        ) : (
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '11px', border: '1px dashed rgba(23, 21, 26, 0.14)', bgcolor: 'rgba(23, 21, 26, 0.015)' }}>
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
  levels = [],
  onClose,
  language = 'en',
  t = fallbackT,
}) {
  const panelUnit = summary?.unit || unit || {};
  const assessments = getSortedAssessments(summary || {});
  const assessmentStats = getAssessmentStats(assessments);
  const observationFocusModel = useMemo(() => normaliseObservationFocuses({
    configuredFocuses,
    observations: summary?.observations || [],
    levels,
    t,
  }), [configuredFocuses, levels, summary, t]);
  const observationFocusOptions = observationFocusModel.options;
  const firstObservedFocusId = observationFocusOptions.find((option) => option.count > 0)?.focusId || observationFocusOptions[0]?.focusId || '';
  const [activeObservationFocusId, setActiveObservationFocusId] = useState(firstObservedFocusId);
  const [activeObservationRecordId, setActiveObservationRecordId] = useState('');

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

  useEffect(() => {
    setActiveObservationRecordId('');
  }, [activeObservationFocus?.focusId]);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-unit-insight-${student.id}-${panelUnit.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: `6px solid ${purple}`, bgcolor: '#fff' }}>
        <Stack spacing={1.35}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'start', gap: 0.8 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>
                {panelUnit.label || panelUnit.title}
              </Typography>
              <Typography aria-hidden="true" sx={{ mt: 0.2, fontSize: 12.8, lineHeight: 1.43, visibility: 'hidden' }}>
                &nbsp;
              </Typography>
            </Box>
            <IconButton
              type="button"
              aria-label={t('learningModule.classPicture.closeUnitView', { unit: panelUnit.label || panelUnit.title })}
              onClick={onClose}
              size="small"
              sx={{
                justifySelf: 'end',
                color: 'rgba(23, 21, 26, 0.54)',
                bgcolor: '#fff',
                border: '1px solid rgba(23, 21, 26, 0.1)',
                '&:hover': { color: purple, borderColor: 'rgba(156, 40, 175, 0.28)', bgcolor: 'rgba(156, 40, 175, 0.045)' },
                '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
              }}
            >
              <CloseIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Box>

          <Paper elevation={0} sx={{ p: 1.35, borderRadius: '14px', border: `1px solid ${purple}`, bgcolor: '#fff' }}>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 900 }}>{t('learningModule.classPicture.assessments')}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>{t('learningModule.classPicture.purplePercentage')}</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)' }, gap: 1.4, alignItems: 'start' }}>
                <Stack direction="row" spacing={1.4} flexWrap="wrap" useFlexGap alignItems="flex-start">
                  {assessments.length ? assessments.map((assessment) => (
                    <Stack key={assessment.id || assessment.date} spacing={0.65} sx={{ width: 126 }}>
                      <AssessmentPie assessment={assessment} t={t} />
                      <Tooltip title={getAssessmentPieHoverText(assessment, t)} arrow>
                        <Stack direction="row" spacing={0.35} alignItems="center">
                          {isAssessmentNotPassed(assessment) && (
                            <ErrorOutlineIcon sx={{ color: '#d32f2f', fontSize: 14, flexShrink: 0 }} />
                          )}
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
                    <Box sx={{ width: 86, height: 86, borderRadius: '50%', bgcolor: 'rgba(156, 40, 175, 0.1)', boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.18)' }} />
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
                    border: '1px solid rgba(156, 40, 175, 0.16)',
                    bgcolor: 'rgba(156, 40, 175, 0.035)',
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

          <Paper elevation={0} sx={{ p: 1.35, borderRadius: '14px', border: `1px solid ${purple}`, bgcolor: '#fff' }}>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 900 }}>{t('learningModule.classPicture.observations')}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>{t('learningModule.classPicture.focusTrendOverTime')}</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 300px) minmax(0, 1fr) minmax(0, 1fr)' }, gap: 1.4, alignItems: 'start' }}>
                <Paper elevation={0} sx={{ p: 1, borderRadius: '12px', border: '1px solid rgba(23, 21, 26, 0.07)', bgcolor: '#fff' }}>
                  <Stack spacing={0.85}>
                    <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>{t('learningModule.classPicture.observationFocus')}</Typography>
                    <ObservationFocusSelector options={observationFocusOptions} activeId={activeObservationFocus?.focusId || ''} onActiveIdChange={setActiveObservationFocusId} t={t} />
                    <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                      {getCountLabel(t, 'learningModule.classPicture.configuredFocusRepresented', observationFocusModel.configuredFocusCount, {
                        represented: observationFocusModel.representedConfiguredFocusCount,
                        total: observationFocusModel.configuredFocusCount,
                      })}
                      {!!observationFocusModel.otherObservationCount && ` · ${getCountLabel(t, 'learningModule.classPicture.otherObservationSummary', observationFocusModel.otherObservationCount)}`}
                    </Typography>
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
