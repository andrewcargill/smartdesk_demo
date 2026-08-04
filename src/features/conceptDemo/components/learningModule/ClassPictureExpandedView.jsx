import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotesIcon from '@mui/icons-material/Notes';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import SquareIcon from '@mui/icons-material/Square';
import { Box, ButtonBase, Stack, Tooltip, Typography } from '@mui/material';
import AssessmentPieChart from './AssessmentPieChart.jsx';

const purple = '#9c28af';
const darkText = '#17151a';
const mutedText = 'rgba(23, 21, 26, 0.62)';
const timelineFallbackTranslations = {
  'learningModule.classPicture.timelineOverview': 'Overview',
  'learningModule.classPicture.timelineClassContext': 'Class context',
  'learningModule.classPicture.timelineCurriculumAreas': 'Curriculum areas',
  'learningModule.classPicture.timelineLearningObservations': 'Learning observations',
  'learningModule.classPicture.timelineLessonCapture': 'Lesson capture',
  'learningModule.classPicture.timelineAssessments': 'Assessments',
  'learningModule.classPicture.timelineEvidence': 'Evidence',
  'learningModule.classPicture.timelineTeachingResponse': 'Teaching response',
  'learningModule.classPicture.timelineOpenActivityContext': 'Open {{activity}} linked observations',
};
const levelReferenceMarks = [
  { order: 4, mark: '●', tint: 'rgba(156, 40, 175, 0.13)', color: 'rgba(156, 40, 175, 0.58)' },
  { order: 3, mark: '◑', tint: 'rgba(156, 40, 175, 0.095)', color: 'rgba(156, 40, 175, 0.48)' },
  { order: 2, mark: '◔', tint: 'rgba(156, 40, 175, 0.065)', color: 'rgba(156, 40, 175, 0.38)' },
  { order: 1, mark: '○', tint: 'rgba(156, 40, 175, 0.035)', color: 'rgba(156, 40, 175, 0.3)' },
];

function fallbackT(key, values = {}) {
  const template = timelineFallbackTranslations[key] || key;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => (values[name] == null ? match : String(values[name])));
}

function getTimelineLocale(language) {
  return language === 'sv' ? 'sv-SE' : 'en-GB';
}

function formatMonth(date, language) {
  return new Intl.DateTimeFormat(getTimelineLocale(language), { month: 'long' }).format(new Date(`${date}T12:00:00`));
}

function formatShortDate(date, language) {
  return new Intl.DateTimeFormat(getTimelineLocale(language), { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function toDateValue(date) {
  return new Date(`${date}T12:00:00`).getTime();
}

function getDateRange(items) {
  const dates = items.map((item) => item.date).filter(Boolean).sort();

  if (!dates.length) {
    const today = new Date().toISOString().slice(0, 10);
    return { start: today, end: today };
  }

  return { start: dates[0], end: dates[dates.length - 1] };
}

function getPosition(date, range) {
  const start = toDateValue(range.start);
  const end = toDateValue(range.end);
  const current = toDateValue(date);
  const span = Math.max(end - start, 1);

  return Math.max(0, Math.min(100, ((current - start) / span) * 100));
}

function getDateFromPosition(position, range) {
  const start = toDateValue(range.start);
  const end = toDateValue(range.end);
  const span = Math.max(end - start, 1);
  const time = start + (Math.max(0, Math.min(100, position)) / 100) * span;

  return new Date(time).toISOString().slice(0, 10);
}

function isDateInRange(date, range) {
  return Boolean(date) && date >= range.start && date <= range.end;
}

function isSpanInRange(startDate, endDate, range) {
  return Boolean(startDate && endDate) && startDate <= range.end && endDate >= range.start;
}

function getMonthRange(date) {
  const start = new Date(`${date}T12:00:00`);
  const end = new Date(`${date}T12:00:00`);
  start.setDate(1);
  end.setMonth(end.getMonth() + 1, 0);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function getObservationY(value) {
  if (value === '+') return 8;
  if (value === '-') return 44;
  return 26;
}

function getLevelY(levelOrder) {
  return Math.max(8, Math.min(44, 56 - ((levelOrder || 1) * 12)));
}

function getLevelMark(level) {
  return ['○', '◔', '◑', '●'][Math.max(0, (level?.order || 1) - 1)] || level?.label || '○';
}

function getMonthMarkers(range) {
  const markers = [];
  const cursor = new Date(`${range.start}T12:00:00`);
  const end = new Date(`${range.end}T12:00:00`);
  cursor.setDate(1);

  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10);
    markers.push(date);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (!markers.includes(range.start)) {
    markers.unshift(range.start);
  }

  return [...new Set(markers)].sort();
}

function getLocalizedValue(value, language) {
  if (value && typeof value === 'object') {
    return value[language] || value.en || Object.values(value)[0] || '';
  }

  return value || '';
}

function getAssessmentEvents(evidenceItems, studentId) {
  return (evidenceItems || [])
    .filter((item) => item.type === 'assessment')
    .flatMap((assessment) => (assessment.results || [])
      .filter((result) => result.studentId === studentId)
      .map((result) => ({
        id: `${assessment.id}-${studentId}`,
        date: assessment.date,
        title: assessment.title,
        teachingUnitId: assessment.teachingUnitId,
        max: assessment.max,
        maxScore: assessment.maxScore,
        pass: assessment.pass,
        passScore: assessment.passScore,
        score: result.score,
        actualValue: result.actualValue,
        rawResult: result.rawResult,
        percentage: result.percentage,
        absent: result.absent,
        warning: result.warning,
        passed: result.passed,
      })));
}

function buildTimelineData({
  student,
  evidenceItems,
  learningObservations,
  teachingUnits,
  rowNote,
  cellNotes,
  unitNotes,
  learningObservationAreas,
  skills,
  levels,
  learningContexts = [],
  language,
  t = fallbackT,
}) {
  const studentId = student?.id;
  const unitById = new Map((teachingUnits || []).map((unit) => [unit.id, unit]));
  const skillById = new Map((skills || []).map((skill) => [skill.id, skill]));
  const levelById = new Map((levels || []).map((level) => [level.id, level]));
  const activityCapturePointById = new Map(
    (learningContexts || []).flatMap((context) => (context.capturePoints || []).map((capturePoint) => [
      capturePoint.id,
      {
        ...capturePoint,
        activityLabel: getLocalizedValue(context.label, language),
        captureLabel: getLocalizedValue(capturePoint.label, language),
      },
    ])),
  );
  const observations = (evidenceItems || [])
    .filter((item) => item.type !== 'assessment' && item.studentId === studentId && item.date)
    .map((item) => {
      const skill = skillById.get(item.skillId || item.capturePointId);
      const level = levelById.get(item.levelId);
      const activityCapturePoint = item.capturePointId ? activityCapturePointById.get(item.capturePointId) : null;
      const skillLabel = getLocalizedValue(skill?.label || skill?.title, language) || item.skillId || item.capturePointId || '';
      const activityLabel = getLocalizedValue(item.contextLabel, language) || activityCapturePoint?.activityLabel || '';
      const activityCaptureLabel = activityCapturePoint?.captureLabel || '';

      return {
        ...item,
        unitTitle: getLocalizedValue(unitById.get(item.teachingUnitId)?.title || unitById.get(item.teachingUnitId)?.label, language),
        skillLabel,
        activityLabel,
        activityCaptureLabel,
        timelineLabel: activityCaptureLabel || skillLabel,
        levelLabel: getLocalizedValue(level?.label, language) || item.levelId || '',
        levelMark: getLevelMark(level),
        levelOrder: level?.order || 1,
      };
    });
  const assessments = getAssessmentEvents(evidenceItems, studentId).filter((item) => item.date);
  const learningEvents = (learningObservations || [])
    .filter((item) => item.studentId === studentId && item.date)
    .flatMap((observation) => (learningObservationAreas || [])
      .filter((area) => observation[area.id])
      .map((area) => ({
        id: `${observation.id}-${area.id}`,
        areaId: area.id,
        date: observation.date,
        title: area.label,
        value: observation[area.id],
        comment: getLocalizedValue(observation.comment, language),
      })));

  const units = (teachingUnits || [])
    .map((unit) => {
      const unitDates = [
        ...observations.filter((item) => item.teachingUnitId === unit.id).map((item) => item.date),
        ...assessments.filter((item) => item.teachingUnitId === unit.id).map((item) => item.date),
      ].filter(Boolean).sort();

      if (!unitDates.length) {
        return null;
      }

      return {
        id: unit.id,
        title: getLocalizedValue(unit.title || unit.label, language),
        startDate: unitDates[0],
        endDate: unitDates[unitDates.length - 1],
      };
    })
    .filter(Boolean);

  const teachingResponses = [
    rowNote ? { id: `${studentId}-row-note`, date: observations[0]?.date || learningEvents[0]?.date || assessments[0]?.date, text: rowNote } : null,
    ...Object.entries(cellNotes || {})
      .filter(([key, value]) => key.startsWith(`${studentId}:`) && value)
      .map(([key, value]) => {
        const unitId = key.split(':')[1];
        const unitDate = observations.find((item) => item.teachingUnitId === unitId)?.date
          || assessments.find((item) => item.teachingUnitId === unitId)?.date;
        return {
          id: key,
          date: unitDate,
          text: value,
        };
      }),
    ...Object.entries(unitNotes || {})
      .filter(([, value]) => value)
      .map(([unitId, value]) => ({
        id: `${studentId}-${unitId}-unit-note`,
        date: observations.find((item) => item.teachingUnitId === unitId)?.date
          || assessments.find((item) => item.teachingUnitId === unitId)?.date,
        text: value,
      })),
  ].filter((item) => item?.date);

  const range = getDateRange([
    ...observations,
    ...assessments,
    ...learningEvents,
    ...units.map((unit) => ({ date: unit.startDate })),
    ...units.map((unit) => ({ date: unit.endDate })),
    ...teachingResponses,
  ]);

  return {
    range,
    units,
    learningEvents: learningEvents.sort((first, second) => first.date.localeCompare(second.date)),
    observations: observations.sort((first, second) => first.date.localeCompare(second.date)),
    assessments: assessments.sort((first, second) => first.date.localeCompare(second.date)),
    teachingResponses: teachingResponses.sort((first, second) => first.date.localeCompare(second.date)),
  };
}

function getObservationClusters(observations) {
  const clustersByKey = new Map();

  (observations || []).forEach((observation) => {
    const key = `${observation.teachingUnitId || 'unit'}:${observation.date}`;
    const cluster = clustersByKey.get(key) || {
      id: key,
      date: observation.date,
      teachingUnitId: observation.teachingUnitId,
      unitTitle: observation.unitTitle,
      items: [],
    };

    cluster.items.push(observation);
    clustersByKey.set(key, cluster);
  });

  return [...clustersByKey.values()]
    .map((cluster) => ({
      ...cluster,
      items: cluster.items.sort((first, second) => (
        (first.timelineLabel || first.skillLabel || '').localeCompare(second.timelineLabel || second.skillLabel || '')
        || (first.id || '').localeCompare(second.id || '')
      )),
      activityTitle: [...new Set(cluster.items.map((item) => item.activityLabel).filter(Boolean))][0] || '',
    }))
    .sort((first, second) => first.date.localeCompare(second.date));
}

function getActivityContextClusters(observations) {
  const clustersByKey = new Map();

  (observations || [])
    .filter((observation) => observation.activityLabel && observation.date)
    .forEach((observation) => {
      const key = observation.activityLabel;
      const cluster = clustersByKey.get(key) || {
        id: key,
        date: observation.date,
        startDate: observation.date,
        endDate: observation.date,
        activityLabel: observation.activityLabel,
        items: [],
      };

      cluster.items.push(observation);
      cluster.startDate = observation.date < cluster.startDate ? observation.date : cluster.startDate;
      cluster.endDate = observation.date > cluster.endDate ? observation.date : cluster.endDate;
      clustersByKey.set(key, cluster);
    });

  return [...clustersByKey.values()]
    .map((cluster) => ({
      ...cluster,
      date: cluster.startDate,
      unitTitles: [...new Set(cluster.items.map((item) => item.unitTitle).filter(Boolean))],
      captureLabels: [...new Set(cluster.items.map((item) => item.activityCaptureLabel || item.skillLabel).filter(Boolean))],
    }))
    .sort((first, second) => first.startDate.localeCompare(second.startDate) || first.activityLabel.localeCompare(second.activityLabel));
}

function getMedianObservation(items) {
  const sortedItems = [...(items || [])].sort((first, second) => (first.levelOrder || 1) - (second.levelOrder || 1));
  return sortedItems[Math.floor(sortedItems.length / 2)] || sortedItems[0] || null;
}

function getUnitCaptureTracks(clusters) {
  const tracksByUnit = new Map();

  (clusters || []).forEach((cluster) => {
    const summaryItem = getMedianObservation(cluster.items);

    if (!summaryItem) {
      return;
    }

    const key = cluster.teachingUnitId || cluster.unitTitle || 'unit';
    const track = tracksByUnit.get(key) || {
      id: key,
      title: cluster.unitTitle,
      points: [],
    };

    track.points.push({
      id: cluster.id,
      date: cluster.date,
      unitTitle: cluster.unitTitle,
      items: cluster.items,
      levelOrder: summaryItem.levelOrder,
      levelMark: summaryItem.levelMark,
      levelLabel: summaryItem.levelLabel,
    });
    tracksByUnit.set(key, track);
  });

  return [...tracksByUnit.values()]
    .map((track) => ({
      ...track,
      points: track.points.sort((first, second) => first.date.localeCompare(second.date)),
    }))
    .sort((first, second) => first.title.localeCompare(second.title));
}

function getCaptureUnitOptions(clusters, teachingUnits, language) {
  const unitIdsWithObservations = new Set((clusters || []).map((cluster) => cluster.teachingUnitId).filter(Boolean));

  return (teachingUnits || [])
    .filter((unit) => unitIdsWithObservations.has(unit.id))
    .map((unit) => ({
      id: unit.id,
      title: getLocalizedValue(unit.title || unit.label, language),
    }));
}

function getCapturePointTracks(clusters, selectedUnitIds) {
  const selectedUnitIdSet = new Set(selectedUnitIds || []);
  const tracksByKey = new Map();

  (clusters || [])
    .filter((cluster) => selectedUnitIdSet.has(cluster.teachingUnitId))
    .forEach((cluster) => {
      cluster.items.forEach((item) => {
        const key = `${cluster.teachingUnitId || 'unit'}:${item.skillId || item.capturePointId || item.skillLabel}`;
        const track = tracksByKey.get(key) || {
          id: key,
          unitTitle: cluster.unitTitle,
          skillLabel: item.timelineLabel || item.skillLabel,
          curriculumSkillLabel: item.skillLabel,
          activityLabel: item.activityLabel,
          points: [],
        };

        track.points.push({
          id: item.id,
          date: item.date,
          unitTitle: cluster.unitTitle,
          skillLabel: item.timelineLabel || item.skillLabel,
          curriculumSkillLabel: item.skillLabel,
          activityLabel: item.activityLabel,
          activityCaptureLabel: item.activityCaptureLabel,
          levelOrder: item.levelOrder,
          levelMark: item.levelMark,
          levelLabel: item.levelLabel,
          item,
        });
        tracksByKey.set(key, track);
      });
    });

  return [...tracksByKey.values()]
    .map((track) => ({
      ...track,
      points: track.points.sort((first, second) => first.date.localeCompare(second.date)),
    }))
    .sort((first, second) => (
      first.unitTitle.localeCompare(second.unitTitle)
      || first.skillLabel.localeCompare(second.skillLabel)
    ));
}

function getUnitCaptureTrackGroups(clusters, selectedUnitIds) {
  const groupsByUnit = new Map();

  getCapturePointTracks(clusters, selectedUnitIds).forEach((track) => {
    const group = groupsByUnit.get(track.unitTitle) || {
      id: track.unitTitle,
      title: track.unitTitle,
      tracks: [],
    };

    group.tracks.push(track);
    groupsByUnit.set(track.unitTitle, group);
  });

  return [...groupsByUnit.values()].sort((first, second) => first.title.localeCompare(second.title));
}

function layoutObservationClusters(clusters) {
  const countsByDate = new Map();

  return (clusters || []).map((cluster) => {
    const lane = countsByDate.get(cluster.date) || 0;
    countsByDate.set(cluster.date, lane + 1);

    return {
      ...cluster,
      lane,
    };
  });
}

function layoutUnitSpans(units) {
  const laneEndDates = [];

  return [...(units || [])]
    .sort((first, second) => (
      first.startDate.localeCompare(second.startDate)
      || first.endDate.localeCompare(second.endDate)
      || first.title.localeCompare(second.title)
    ))
    .map((unit) => {
      const lane = laneEndDates.findIndex((endDate) => endDate < unit.startDate);
      const assignedLane = lane === -1 ? laneEndDates.length : lane;
      laneEndDates[assignedLane] = unit.endDate;

      return {
        ...unit,
        lane: assignedLane,
      };
    });
}

function TimelineIcon({ type }) {
  if (type === 'assessment') {
    return <SquareIcon sx={{ color: purple, fontSize: 13, transform: 'rotate(45deg)' }} />;
  }

  if (type === 'response') {
    return <NotesIcon sx={{ color: 'rgba(23, 21, 26, 0.58)', fontSize: 14 }} />;
  }

  return <RadioButtonCheckedIcon sx={{ color: purple, fontSize: 13 }} />;
}

function TimelineItem({ item, range, type, children }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${getPosition(item.date, range)}%`,
        top: 0,
        width: 150,
        maxWidth: 150,
        transform: 'translateX(-6px)',
      }}
    >
      <Stack direction="row" spacing={0.45} alignItems="flex-start">
        <Box sx={{ pt: 0.2, flexShrink: 0 }}>
          <TimelineIcon type={type} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          {children}
        </Box>
      </Stack>
    </Box>
  );
}

function AssessmentTimelineItem({ item, range, language }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${getPosition(item.date, range)}%`,
        top: 0,
        width: 120,
        maxWidth: 120,
        transform: 'translateX(-17px)',
      }}
    >
      <Stack spacing={0.45} alignItems="flex-start">
        <AssessmentPieChart assessment={item} size={34} />
        <Typography sx={{ color: darkText, fontSize: 11.8, fontWeight: 850, lineHeight: 1.15, maxWidth: 106 }}>
          {getLocalizedValue(item.title, language)}
        </Typography>
        <Typography sx={{ color: mutedText, fontSize: 11.1, lineHeight: 1.1 }}>
          {formatShortDate(item.date, language)}
        </Typography>
      </Stack>
    </Box>
  );
}

function LessonCaptureCluster({ cluster, range, language, zoomed, onZoom }) {
  const sortedByLevel = [...cluster.items].sort((first, second) => (first.levelOrder || 1) - (second.levelOrder || 1));
  const summaryItem = sortedByLevel[Math.floor(sortedByLevel.length / 2)] || cluster.items[0];
  const visibleMarks = zoomed ? cluster.items.slice(0, 6) : [summaryItem].filter(Boolean);
  const hiddenCount = Math.max(0, cluster.items.length - visibleMarks.length);
  const displayTitle = cluster.activityTitle || cluster.unitTitle;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${getPosition(cluster.date, range)}%`,
        top: cluster.lane * (zoomed ? 48 : 36),
        width: 132,
        maxWidth: 132,
        transform: 'translateX(-8px)',
      }}
    >
      <Tooltip
        arrow
        placement="top"
        title={(
          <Stack spacing={0.45}>
            <Typography sx={{ color: '#fff', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
              {displayTitle || formatShortDate(cluster.date, language)}
            </Typography>
            {cluster.activityTitle ? (
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                {cluster.unitTitle}
              </Typography>
            ) : null}
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
              {formatShortDate(cluster.date, language)}
            </Typography>
            <Stack spacing={0.15}>
              {cluster.items.map((item) => (
                <Box key={item.id}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 11.2, fontWeight: item.activityCaptureLabel ? 820 : 650, lineHeight: 1.25 }}>
                    {item.levelMark} {item.timelineLabel || item.skillLabel}
                  </Typography>
                  {item.activityCaptureLabel && item.skillLabel ? (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.66)', fontSize: 10.6, lineHeight: 1.2 }}>
                      {item.skillLabel}
                    </Typography>
                  ) : null}
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      >
        <ButtonBase
          type="button"
          onClick={() => onZoom?.(cluster.date)}
          sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0.35,
            cursor: zoomed ? 'default' : 'zoom-in',
            textAlign: 'left',
            borderRadius: '7px',
            '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
          }}
        >
          <Typography sx={{ color: darkText, fontSize: 11.8, fontWeight: 850, lineHeight: 1.15, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayTitle}
          </Typography>
          <Stack direction="row" spacing={0.22} alignItems="center" flexWrap="wrap" useFlexGap sx={{ maxWidth: 112 }}>
            {visibleMarks.map((item) => (
              <Typography
                key={item.id}
                component="span"
                aria-label={`${item.skillLabel}: ${item.levelLabel}`}
                sx={{
                  color: purple,
                  fontSize: 16,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {item.levelMark}
              </Typography>
            ))}
            {!!hiddenCount && (
              <Typography component="span" sx={{ color: mutedText, fontSize: 10.8, fontWeight: 850, lineHeight: 1 }}>
                {zoomed ? `+${hiddenCount}` : `x${cluster.items.length}`}
              </Typography>
            )}
          </Stack>
        </ButtonBase>
      </Tooltip>
    </Box>
  );
}

function TimelineRow({ label, minHeight = 70, children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '132px minmax(0, 1fr)',
        gap: 1.2,
        minHeight,
        py: 0.9,
        borderTop: '1px solid rgba(23, 21, 26, 0.07)',
      }}
    >
      {typeof label === 'string' ? (
        <Typography sx={{ color: mutedText, fontSize: 12.2, fontWeight: 850, lineHeight: 1.2 }}>
          {label}
        </Typography>
      ) : label}
      <Box sx={{ position: 'relative', minHeight: 52 }}>
        {children}
      </Box>
    </Box>
  );
}

function EmptyRow() {
  return <Box sx={{ width: 24, height: 2, mt: 1, borderRadius: 999, bgcolor: 'rgba(23, 21, 26, 0.16)' }} />;
}

function SelectClassContentPrompt() {
  return (
    <Box sx={{ py: 0.8 }}>
      <Typography sx={{ color: 'rgba(23, 21, 26, 0.42)', fontSize: 12.2, fontWeight: 760 }}>
        Select class content above to show related evidence.
      </Typography>
    </Box>
  );
}

function LearningObservationGraph({ events, areas, range, language }) {
  if (!events.length) {
    return <EmptyRow />;
  }

  return (
    <Stack spacing={1.1}>
      {(areas || []).map((area) => {
        const points = events
          .filter((event) => event.areaId === area.id)
          .sort((first, second) => first.date.localeCompare(second.date))
          .map((event) => ({
            id: event.id,
            date: event.date,
            title: event.title,
            value: event.value,
            comment: event.comment,
            x: getPosition(event.date, range),
            y: getObservationY(event.value),
          }));
        const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

        return (
          <Box
            key={area.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '112px minmax(0, 1fr)',
              gap: 1.1,
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 850, lineHeight: 1.15 }}>
              {area.label}
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 44,
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 100 52"
                preserveAspectRatio="none"
                role="img"
                aria-label={area.label}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  overflow: 'visible',
                }}
              >
                <line
                  x1="0"
                  x2="100"
                  y1="26"
                  y2="26"
                  stroke="rgba(23, 21, 26, 0.22)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                {points.length > 1 ? (
                  <path
                    d={path}
                    fill="none"
                    stroke={purple}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
              </Box>
              {points.map((point) => (
                <Tooltip
                  key={point.id}
                  arrow
                  placement="top"
                  title={(
                    <Stack spacing={0.3}>
                      <Typography sx={{ color: '#fff', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
                        {point.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                        {formatShortDate(point.date, language)} · {point.value}
                      </Typography>
                      {point.comment ? (
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.25 }}>
                          {point.comment}
                        </Typography>
                      ) : null}
                    </Stack>
                  )}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: `${(point.y / 52) * 100}%`,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      border: `2px solid ${purple}`,
                      bgcolor: '#fff',
                      transform: 'translate(-50%, -50%)',
                      boxSizing: 'border-box',
                      cursor: 'default',
                      transition: 'width 120ms ease, height 120ms ease, box-shadow 120ms ease',
                      '&:hover': {
                        width: 11,
                        height: 11,
                        boxShadow: '0 0 0 4px rgba(156, 40, 175, 0.13)',
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

function UnitCaptureTrendGraph({ clusters, range, language, selectedUnitIds }) {
  const groups = getUnitCaptureTrackGroups(clusters, selectedUnitIds);

  if (!groups.length) {
    return <EmptyRow />;
  }

  return (
    <Stack spacing={1}>
      {groups.map((group) => (
        <Box
          key={group.id}
          sx={{
            p: 1,
            borderRadius: '9px',
            border: '1px solid rgba(156, 40, 175, 0.14)',
            bgcolor: 'rgba(156, 40, 175, 0.025)',
          }}
        >
          <Typography sx={{ color: purple, fontSize: 11.8, fontWeight: 900, lineHeight: 1.15 }}>
            {group.title}
          </Typography>
          <Stack spacing={0.85} sx={{ mt: 0.75 }}>
            {group.tracks.map((track) => {
              const points = track.points.map((point) => ({
                ...point,
                x: getPosition(point.date, range),
                y: getLevelY(point.levelOrder),
              }));
              const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

              return (
                <Box
                  key={track.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '112px minmax(0, 1fr)',
                    gap: 1.1,
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ color: darkText, fontSize: 12.1, fontWeight: 850, lineHeight: 1.12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.skillLabel}
                  </Typography>
                  <Box sx={{ position: 'relative', width: '100%', height: 54 }}>
                    {levelReferenceMarks.map((level) => (
                      <Box
                        key={level.order}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${(getLevelY(level.order) / 52) * 100}%`,
                          height: 10,
                          transform: 'translateY(-50%)',
                          borderRadius: '999px',
                          bgcolor: level.tint,
                        }}
                      >
                        <Typography
                          component="span"
                          aria-hidden="true"
                          sx={{
                            position: 'absolute',
                            left: -18,
                            top: '50%',
                            color: level.color,
                            fontSize: 10.5,
                            fontWeight: 850,
                            lineHeight: 1,
                            transform: 'translateY(-50%)',
                          }}
                        >
                          {level.mark}
                        </Typography>
                      </Box>
                    ))}
                    <Box
                      component="svg"
                      viewBox="0 0 100 52"
                      preserveAspectRatio="none"
                      role="img"
                      aria-label={`${track.unitTitle}: ${track.skillLabel}`}
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        overflow: 'visible',
                      }}
                    >
                      {points.length > 1 ? (
                        <path
                          d={path}
                          fill="none"
                          stroke={purple}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      ) : null}
                    </Box>
                    {points.map((point) => (
                      <Tooltip
                        key={point.id}
                        arrow
                        placement="top"
                        title={(
                          <Stack spacing={0.45}>
                            <Typography sx={{ color: '#fff', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
                              {point.activityLabel || point.unitTitle}
                            </Typography>
                            {point.activityLabel ? (
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                                {point.unitTitle}
                              </Typography>
                            ) : null}
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                              {formatShortDate(point.date, language)}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: 11.2, lineHeight: 1.25 }}>
                              {point.levelMark} {point.skillLabel}
                            </Typography>
                            {point.activityCaptureLabel && point.curriculumSkillLabel ? (
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.66)', fontSize: 10.6, lineHeight: 1.2 }}>
                                {point.curriculumSkillLabel}
                              </Typography>
                            ) : null}
                          </Stack>
                        )}
                      >
                        <Typography
                          component="span"
                          aria-label={`${point.unitTitle}, ${point.skillLabel}: ${point.levelLabel}`}
                    sx={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: `${(point.y / 52) * 100}%`,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      border: `2px solid ${purple}`,
                      bgcolor: '#fff',
                      transform: 'translate(-50%, -50%)',
                      boxSizing: 'border-box',
                      cursor: 'default',
                      transition: 'width 120ms ease, height 120ms ease, box-shadow 120ms ease',
                      '&:hover': {
                        width: 11,
                        height: 11,
                        boxShadow: '0 0 0 4px rgba(156, 40, 175, 0.12)',
                      },
                    }}
                  />
                </Tooltip>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export default function ClassPictureExpandedView({
  student,
  evidenceItems,
  learningObservations,
  teachingUnits,
  rowNote,
  cellNotes,
  unitNotes,
  learningObservationAreas,
  skills,
  levels,
  learningContexts = [],
  language,
  t = fallbackT,
}) {
  const [selectedMonthDate, setSelectedMonthDate] = useState('');
  const [lessonCaptureExpanded, setLessonCaptureExpanded] = useState(false);
  const [selectedCaptureUnitIds, setSelectedCaptureUnitIds] = useState([]);
  const [hoverCursor, setHoverCursor] = useState(null);
  const timeline = buildTimelineData({
    student,
    evidenceItems,
    learningObservations,
    teachingUnits,
    rowNote,
    cellNotes,
    unitNotes,
    learningObservationAreas,
    skills,
    levels,
    learningContexts,
    language,
  });
  const monthMarkers = getMonthMarkers(timeline.range);
  const visibleRange = selectedMonthDate ? getMonthRange(selectedMonthDate) : timeline.range;
  const visibleUnits = layoutUnitSpans(timeline.units.filter((unit) => isSpanInRange(unit.startDate, unit.endDate, visibleRange)));
  const visibleLearningEvents = timeline.learningEvents.filter((item) => isDateInRange(item.date, visibleRange));
  const unitFilterActive = Boolean(selectedCaptureUnitIds.length);
  const visibleObservationClustersForRange = layoutObservationClusters(
    getObservationClusters(timeline.observations).filter((cluster) => isDateInRange(cluster.date, visibleRange)),
  );
  const visibleObservationClusters = unitFilterActive
    ? visibleObservationClustersForRange.filter((cluster) => selectedCaptureUnitIds.includes(cluster.teachingUnitId))
    : visibleObservationClustersForRange;
  const visibleActivityContextClusters = layoutObservationClusters(
    getActivityContextClusters(timeline.observations).filter((cluster) => isDateInRange(cluster.date, visibleRange)),
  );
  const captureUnitOptions = getCaptureUnitOptions(visibleObservationClustersForRange, teachingUnits, language);
  const allCaptureUnitIds = captureUnitOptions.map((unit) => unit.id);
  const visibleSelectedCaptureUnitIds = selectedCaptureUnitIds.filter((unitId) => allCaptureUnitIds.includes(unitId));
  const effectiveSelectedCaptureUnitIds = visibleSelectedCaptureUnitIds;
  const visibleAssessments = timeline.assessments.filter((item) => (
    isDateInRange(item.date, visibleRange)
    && (!unitFilterActive || selectedCaptureUnitIds.includes(item.teachingUnitId))
  ));
  const visibleTeachingResponses = timeline.teachingResponses.filter((item) => isDateInRange(item.date, visibleRange));
  const zoomed = Boolean(selectedMonthDate);
  const activityContextLaneCount = Math.max(1, ...visibleActivityContextClusters.map((cluster) => cluster.lane + 1));
  const activityContextRowHeight = Math.max(48, 26 + (activityContextLaneCount * 30));
  const classContentLaneCount = Math.max(1, ...visibleUnits.map((unit) => unit.lane + 1));
  const classContentRowHeight = Math.max(70, 34 + (classContentLaneCount * 34));
  const lessonCaptureLaneCount = Math.max(1, ...visibleObservationClusters.map((cluster) => cluster.lane + 1));
  const lessonCaptureTrackCount = Math.max(1, getCapturePointTracks(visibleObservationClusters, effectiveSelectedCaptureUnitIds).length);
  const lessonCaptureRowHeight = lessonCaptureExpanded
    ? Math.max(132, 72 + (lessonCaptureTrackCount * 55))
    : Math.max(70, 34 + (lessonCaptureLaneCount * (zoomed ? 48 : 36)));

  function toggleContentUnitFilter(unitId) {
    setLessonCaptureExpanded(true);
    setSelectedCaptureUnitIds((currentIds) => (
      currentIds.includes(unitId)
        ? currentIds.filter((id) => id !== unitId)
        : [...currentIds, unitId]
    ));
  }

  function openActivityContext(cluster) {
    const linkedUnitIds = [...new Set((cluster.items || []).map((item) => item.teachingUnitId).filter(Boolean))];

    if (!linkedUnitIds.length) {
      return;
    }

    setSelectedCaptureUnitIds((currentIds) => {
      const allLinkedUnitsSelected = linkedUnitIds.every((unitId) => currentIds.includes(unitId)) && currentIds.length === linkedUnitIds.length;

      if (allLinkedUnitsSelected) {
        setLessonCaptureExpanded(false);
        return [];
      }

      setLessonCaptureExpanded(true);
      return linkedUnitIds;
    });
  }

  function updateHoverCursor(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.width ? ((event.clientX - rect.left) / rect.width) * 100 : 0;
    const position = Math.max(0, Math.min(100, x));

    setHoverCursor({
      position,
      date: getDateFromPosition(position, visibleRange),
    });
  }

  return (
    <Box
      onMouseLeave={() => setHoverCursor(null)}
      sx={{
        m: { xs: 1, sm: 1.25 },
        p: { xs: 1.25, sm: 1.55 },
        borderTop: '1px solid rgba(23, 21, 26, 0.08)',
        border: `4px solid ${purple}`,
        borderRadius: '18px',
        bgcolor: '#fff',
        overflowX: 'auto',
      }}
    >
      <Box sx={{ minWidth: 780 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '132px minmax(0, 1fr)', gap: 1.2, pb: 0.75 }}>
          <Box>
            {zoomed ? (
              <ButtonBase
                type="button"
                onClick={() => setSelectedMonthDate('')}
                sx={{
                  px: 0.65,
                  py: 0.35,
                  borderRadius: '7px',
                  color: purple,
                  bgcolor: 'rgba(156, 40, 175, 0.06)',
                  '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                }}
              >
                <Typography sx={{ fontSize: 11.5, fontWeight: 880, lineHeight: 1 }}>
                  {t('learningModule.classPicture.timelineOverview')}
                </Typography>
              </ButtonBase>
            ) : null}
          </Box>
          <Box
            onMouseMove={updateHoverCursor}
            sx={{ position: 'relative', height: 28 }}
          >
            {(zoomed ? getMonthMarkers(visibleRange) : monthMarkers).map((date) => (
              <ButtonBase
                key={date}
                type="button"
                onClick={() => setSelectedMonthDate((currentDate) => (currentDate === date ? '' : date))}
                sx={{
                  position: 'absolute',
                  left: `${getPosition(date, visibleRange)}%`,
                  transform: 'translateX(-1px)',
                  borderRadius: '7px',
                  px: 0.3,
                  py: 0.15,
                  color: zoomed ? purple : mutedText,
                  '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 850, textTransform: 'capitalize', lineHeight: 1.2 }}>
                  {formatMonth(date, language)}
                </Typography>
              </ButtonBase>
            ))}
            {hoverCursor ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${hoverCursor.position}%`,
                  top: 18,
                  px: 0.55,
                  py: 0.25,
                  borderRadius: '999px',
                  bgcolor: purple,
                  color: '#fff',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                  zIndex: 8,
                  boxShadow: '0 6px 16px rgba(156, 40, 175, 0.16)',
                }}
              >
                <Typography sx={{ color: 'inherit', fontSize: 10.8, fontWeight: 900, lineHeight: 1 }}>
                  {formatShortDate(hoverCursor.date, language)}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {hoverCursor ? (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                gridTemplateColumns: '132px minmax(0, 1fr)',
                gap: 1.2,
                pointerEvents: 'none',
                zIndex: 6,
              }}
            >
              <Box />
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${hoverCursor.position}%`,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    borderRadius: '999px',
                    bgcolor: 'rgba(156, 40, 175, 0.42)',
                    transform: 'translateX(-50%)',
                  }}
                />
              </Box>
            </Box>
          ) : null}

          {visibleActivityContextClusters.length ? (
            <TimelineRow label={t('learningModule.classPicture.timelineClassContext')} minHeight={activityContextRowHeight}>
              {visibleActivityContextClusters.map((cluster) => (
                (() => {
                  const clippedStart = cluster.startDate < visibleRange.start ? visibleRange.start : cluster.startDate;
                  const clippedEnd = cluster.endDate > visibleRange.end ? visibleRange.end : cluster.endDate;
                  const left = getPosition(clippedStart, visibleRange);
                  const right = getPosition(clippedEnd, visibleRange);
                  const width = Math.max(right - left, 9);

                  return (
                    <Box
                      key={cluster.id}
                      sx={{
                        position: 'absolute',
                        left: `${left}%`,
                        top: cluster.lane * 30,
                        width: `${width}%`,
                        minWidth: 86,
                        maxWidth: 220,
                      }}
                    >
                      <Tooltip
                        arrow
                        placement="top"
                        title={(
                          <Stack spacing={0.35}>
                            <Typography sx={{ color: '#fff', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
                              {cluster.activityLabel}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                              {formatShortDate(cluster.startDate, language)} - {formatShortDate(cluster.endDate, language)}
                            </Typography>
                            {!!cluster.unitTitles.length && (
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: 10.8, lineHeight: 1.2 }}>
                                {cluster.unitTitles.join(' / ')}
                              </Typography>
                            )}
                            {cluster.captureLabels.slice(0, 5).map((label) => (
                              <Typography key={label} sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 10.9, lineHeight: 1.2 }}>
                                {label}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      >
                        <ButtonBase
                          type="button"
                          onClick={() => openActivityContext(cluster)}
                          aria-label={t('learningModule.classPicture.timelineOpenActivityContext', { activity: cluster.activityLabel })}
                          sx={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            px: 0.65,
                            py: 0.4,
                            borderRadius: '7px',
                            bgcolor: 'rgba(156, 40, 175, 0.1)',
                            border: '1px solid rgba(156, 40, 175, 0.2)',
                            boxShadow: '0 5px 14px rgba(156, 40, 175, 0.08)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
                            '&:hover': {
                              bgcolor: 'rgba(156, 40, 175, 0.15)',
                              borderColor: 'rgba(156, 40, 175, 0.38)',
                              boxShadow: '0 7px 18px rgba(156, 40, 175, 0.12)',
                            },
                            '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                          }}
                        >
                          <Typography sx={{ color: purple, fontSize: 11.6, fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cluster.activityLabel}
                          </Typography>
                        </ButtonBase>
                      </Tooltip>
                    </Box>
                  );
                })()
              ))}
            </TimelineRow>
          ) : null}

          <TimelineRow label={t('learningModule.classPicture.timelineCurriculumAreas')} minHeight={classContentRowHeight}>
            {visibleUnits.length ? visibleUnits.map((unit) => {
              const clippedStart = unit.startDate < visibleRange.start ? visibleRange.start : unit.startDate;
              const clippedEnd = unit.endDate > visibleRange.end ? visibleRange.end : unit.endDate;
              const left = getPosition(clippedStart, visibleRange);
              const right = getPosition(clippedEnd, visibleRange);
              const unitSelected = selectedCaptureUnitIds.includes(unit.id);
              return (
                <ButtonBase
                  key={unit.id}
                  type="button"
                  aria-pressed={unitSelected}
                  onClick={() => toggleContentUnitFilter(unit.id)}
                  sx={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${Math.max(right - left, 8)}%`,
                    top: unit.lane * 34,
                    display: 'block',
                    minHeight: 25,
                    px: 0.65,
                    py: 0.45,
                    borderRadius: '7px',
                    textAlign: 'left',
                    bgcolor: unitSelected ? 'rgba(156, 40, 175, 0.13)' : 'rgba(156, 40, 175, 0.06)',
                    border: unitSelected ? `1px solid ${purple}` : '1px solid rgba(156, 40, 175, 0.12)',
                    opacity: unitFilterActive && !unitSelected ? 0.36 : 1,
                    transition: 'opacity 140ms ease, background-color 140ms ease, border-color 140ms ease',
                    '&:hover': {
                      opacity: 1,
                      bgcolor: unitSelected ? 'rgba(156, 40, 175, 0.16)' : 'rgba(156, 40, 175, 0.09)',
                    },
                    '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                  }}
                >
                  <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 850, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {unit.title}
                  </Typography>
                </ButtonBase>
              );
            }) : <EmptyRow />}
          </TimelineRow>

          <TimelineRow label={t('learningModule.classPicture.timelineLearningObservations')}>
            <LearningObservationGraph
              events={visibleLearningEvents}
              areas={learningObservationAreas}
              range={visibleRange}
              language={language}
            />
          </TimelineRow>

          {unitFilterActive ? (
            <>
              <TimelineRow
                label={(
                  <ButtonBase
                    type="button"
                    onClick={() => setLessonCaptureExpanded((isExpanded) => !isExpanded)}
                    aria-expanded={lessonCaptureExpanded}
                    sx={{
                      justifyContent: 'flex-start',
                      gap: 0.3,
                      color: mutedText,
                      borderRadius: '7px',
                      textAlign: 'left',
                      '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                    }}
                  >
                    <KeyboardArrowDownIcon sx={{ fontSize: 16, transform: lessonCaptureExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 140ms ease' }} />
                    <Typography sx={{ color: 'inherit', fontSize: 12.2, fontWeight: 850, lineHeight: 1.2 }}>
                      {t('learningModule.classPicture.timelineLessonCapture')}
                    </Typography>
                  </ButtonBase>
                )}
                minHeight={lessonCaptureRowHeight}
              >
                {lessonCaptureExpanded ? (
                  <UnitCaptureTrendGraph
                    clusters={visibleObservationClusters}
                    range={visibleRange}
                    language={language}
                    selectedUnitIds={effectiveSelectedCaptureUnitIds}
                  />
                ) : visibleObservationClusters.length ? visibleObservationClusters.map((cluster) => (
                    <LessonCaptureCluster
                      key={cluster.id}
                      cluster={cluster}
                      range={visibleRange}
                      language={language}
                      zoomed={zoomed}
                      onZoom={setSelectedMonthDate}
                    />
                  )) : <EmptyRow />}
              </TimelineRow>

              <TimelineRow label={t('learningModule.classPicture.timelineAssessments')}>
                {visibleAssessments.length ? visibleAssessments.map((item) => (
                  <AssessmentTimelineItem key={item.id} item={item} range={visibleRange} language={language} />
                )) : <EmptyRow />}
              </TimelineRow>
            </>
          ) : (
            <TimelineRow label={t('learningModule.classPicture.timelineEvidence')}>
              <SelectClassContentPrompt />
            </TimelineRow>
          )}

          <TimelineRow label={t('learningModule.classPicture.timelineTeachingResponse')}>
            {visibleTeachingResponses.length ? visibleTeachingResponses.map((item) => (
              <TimelineItem key={item.id} item={item} range={visibleRange} type="response">
                <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 780, lineHeight: 1.25 }}>
                  {item.text}
                </Typography>
              </TimelineItem>
            )) : <EmptyRow />}
          </TimelineRow>
        </Box>
      </Box>
    </Box>
  );
}
