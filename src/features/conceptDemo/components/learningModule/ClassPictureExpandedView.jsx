import { useEffect, useState } from 'react';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotesIcon from '@mui/icons-material/Notes';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import SquareIcon from '@mui/icons-material/Square';
import { Box, ButtonBase, Portal, Stack, Tooltip, Typography } from '@mui/material';
import AssessmentPieChart from './AssessmentPieChart.jsx';
import {
  LEARNING_MODULE_TIMELINE_RESPONSES_STORAGE_EVENT,
  addLearningModuleTimelineResponse,
  readLearningModuleTimelineResponses,
  removeLearningModuleTimelineResponse,
  seedLearningModuleTimelineResponses,
  updateLearningModuleTimelineResponse,
} from './utils/learningModuleEvidenceStorage.js';

const purple = 'var(--sd-primary)';
const darkText = 'var(--sd-text)';
const mutedText = 'rgba(var(--sd-text-rgb), 0.62)';
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
  'learningModule.classPicture.timelineResponseLabel': 'Label',
  'learningModule.classPicture.timelineResponseComment': 'Comment',
  'learningModule.classPicture.timelineSaveResponse': 'Save',
  'learningModule.classPicture.timelineCancelResponse': 'Cancel',
  'learningModule.classPicture.timelineViewResponse': 'View',
  'learningModule.classPicture.timelineEditResponse': 'Edit',
  'learningModule.classPicture.timelineDeleteResponse': 'Delete',
  'learningModule.classPicture.timelineExpandFullscreen': 'Expand timeline',
  'learningModule.classPicture.timelineExitFullscreen': 'Exit fullscreen',
};
const levelReferenceMarks = [
  { order: 4, mark: '●', tint: 'rgba(var(--sd-primary-rgb), 0.13)', color: 'var(--sd-text-muted)' },
  { order: 3, mark: '◑', tint: 'rgba(var(--sd-primary-rgb), 0.095)', color: 'var(--sd-text-muted)' },
  { order: 2, mark: '◔', tint: 'rgba(var(--sd-primary-rgb), 0.065)', color: 'var(--sd-text-muted)' },
  { order: 1, mark: '○', tint: 'rgba(var(--sd-primary-rgb), 0.035)', color: 'var(--sd-text-muted)' },
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

function addDays(date, days) {
  const nextDate = new Date(`${date}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
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
        timelineLabel: skillLabel,
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
        (first.skillLabel || first.timelineLabel || '').localeCompare(second.skillLabel || second.timelineLabel || '')
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
      const key = observation.contextId || observation.activityLabel;
      const cluster = clustersByKey.get(key) || {
        id: key,
        contextId: observation.contextId || key,
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
          skillLabel: item.skillLabel || item.timelineLabel,
          curriculumSkillLabel: item.skillLabel,
          activityLabel: item.activityLabel,
          points: [],
        };

        track.points.push({
          id: item.id,
          date: item.date,
          unitTitle: cluster.unitTitle,
          skillLabel: item.skillLabel || item.timelineLabel,
          curriculumSkillLabel: item.skillLabel,
          activityLabel: item.activityLabel,
          activityCaptureLabel: item.activityCaptureLabel,
          contextId: item.contextId,
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

function layoutActivityContextSpans(clusters) {
  const laneEndDates = [];
  const visualClearanceDays = 8;

  return [...(clusters || [])]
    .sort((first, second) => (
      first.startDate.localeCompare(second.startDate)
      || first.endDate.localeCompare(second.endDate)
      || first.activityLabel.localeCompare(second.activityLabel)
    ))
    .map((cluster) => {
      const lane = laneEndDates.findIndex((endDate) => endDate < cluster.startDate);
      const assignedLane = lane === -1 ? laneEndDates.length : lane;
      laneEndDates[assignedLane] = addDays(cluster.endDate, visualClearanceDays);

      return {
        ...cluster,
        lane: assignedLane,
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

function groupTimelineItemsByPosition(items, range) {
  const proximityThreshold = 22;
  const groups = [];
  const getItemPriority = (item) => (item.type === 'timeline-comment' ? 0 : 1);
  const getItemUpdatedTime = (item) => item.updatedAt || item.createdAt || item.date || '';

  [...(items || [])]
    .sort((first, second) => (first.date || '').localeCompare(second.date || '') || String(first.id || '').localeCompare(String(second.id || '')))
    .forEach((item) => {
      const position = getPosition(item.date, range);
      const currentGroup = groups[groups.length - 1];

      if (currentGroup && position - currentGroup.endPosition <= proximityThreshold) {
        currentGroup.items.push(item);
        currentGroup.endPosition = Math.max(currentGroup.endPosition, position);
        currentGroup.date = currentGroup.items[0]?.date || item.date;
        return;
      }

      groups.push({
        id: `${item.date || 'no-date'}-${groups.length}`,
        date: item.date,
        startPosition: position,
        endPosition: position,
        items: [item],
      });
    });

  return groups.map((group) => ({
    ...group,
    items: group.items.sort((first, second) => (
      getItemPriority(first) - getItemPriority(second)
      || getItemUpdatedTime(second).localeCompare(getItemUpdatedTime(first))
      || (first.date || '').localeCompare(second.date || '')
      || String(first.id || '').localeCompare(String(second.id || ''))
    )),
  }));
}

function TimelineIcon({ type }) {
  if (type === 'assessment') {
    return <SquareIcon sx={{ color: 'var(--sd-accent-text)', fontSize: 13, transform: 'rotate(45deg)' }} />;
  }

  if (type === 'timeline-comment') {
    return <NotesIcon sx={{ color: 'var(--sd-accent-text)', fontSize: 14 }} />;
  }

  if (type === 'response') {
    return <NotesIcon sx={{ color: 'var(--sd-text-muted)', fontSize: 14 }} />;
  }

  return <RadioButtonCheckedIcon sx={{ color: 'var(--sd-accent-text)', fontSize: 13 }} />;
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
            <Typography sx={{ color: 'var(--sd-on-primary)', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
              {displayTitle || formatShortDate(cluster.date, language)}
            </Typography>
            {cluster.activityTitle ? (
              <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                {cluster.unitTitle}
              </Typography>
            ) : null}
            <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
              {formatShortDate(cluster.date, language)}
            </Typography>
            <Stack spacing={0.15}>
              {cluster.items.map((item) => (
                <Box key={item.id}>
                  <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.9)', fontSize: 11.2, fontWeight: item.activityCaptureLabel ? 820 : 650, lineHeight: 1.25 }}>
                    {item.levelMark} {item.timelineLabel || item.skillLabel}
                  </Typography>
                  {item.activityCaptureLabel && item.skillLabel ? (
                    <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.66)', fontSize: 10.6, lineHeight: 1.2 }}>
                      {item.activityCaptureLabel}
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
            '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
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
                  color: 'var(--sd-accent-text)',
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
        borderTop: '1px solid rgba(var(--sd-text-rgb), 0.07)',
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
  return <Box sx={{ width: 24, height: 2, mt: 1, borderRadius: 999, bgcolor: 'rgba(var(--sd-text-rgb), 0.16)' }} />;
}

function SelectClassContentPrompt() {
  return (
    <Box sx={{ py: 0.8 }}>
      <Typography sx={{ color: 'var(--sd-text-muted)', fontSize: 12.2, fontWeight: 760 }}>
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
              minWidth: 0,
            }}
          >
            <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 850, lineHeight: 1.15, mb: 0.35 }}>
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
                  stroke="rgba(var(--sd-text-rgb), 0.22)"
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
                      <Typography sx={{ color: 'var(--sd-on-primary)', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
                        {point.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                        {formatShortDate(point.date, language)} · {point.value}
                      </Typography>
                      {point.comment ? (
                        <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.82)', fontSize: 11.2, lineHeight: 1.25 }}>
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
                      bgcolor: 'var(--sd-surface)',
                      transform: 'translate(-50%, -50%)',
                      boxSizing: 'border-box',
                      cursor: 'default',
                      transition: 'width 120ms ease, height 120ms ease, box-shadow 120ms ease',
                      '&:hover': {
                        width: 11,
                        height: 11,
                        boxShadow: '0 0 0 4px rgba(var(--sd-primary-rgb), 0.13)',
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

function UnitCaptureTrendGraph({ clusters, range, language, selectedUnitIds, activeActivityContextId }) {
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
            border: '1px solid rgba(var(--sd-primary-rgb), 0.14)',
            bgcolor: 'rgba(var(--sd-primary-rgb), 0.025)',
          }}
        >
          <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 11.8, fontWeight: 900, lineHeight: 1.15 }}>
            {group.title}
          </Typography>
          <Stack spacing={0.85} sx={{ mt: 0.75 }}>
            {group.tracks.map((track) => {
              const points = track.points.map((point) => ({
                ...point,
                x: getPosition(point.date, range),
                y: getLevelY(point.levelOrder),
              }));
              const trackHasActiveActivity = !activeActivityContextId || points.some((point) => point.contextId === activeActivityContextId);
              const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

              return (
                <Box
                  key={track.id}
                  sx={{
                    minWidth: 0,
                    opacity: trackHasActiveActivity ? 1 : 0.36,
                    transition: 'opacity 140ms ease',
                  }}
                >
                  <Typography sx={{ color: darkText, fontSize: 12.1, fontWeight: 850, lineHeight: 1.12, mb: 0.35, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    {points.map((point) => {
                      const pointMatchesActiveActivity = Boolean(activeActivityContextId) && point.contextId === activeActivityContextId;
                      const pointMutedByActiveActivity = Boolean(activeActivityContextId) && !pointMatchesActiveActivity;

                      return (
                        <Tooltip
                          key={point.id}
                          arrow
                          placement="top"
                          title={(
                            <Stack spacing={0.45}>
                              <Typography sx={{ color: 'var(--sd-on-primary)', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
                                {point.activityLabel || point.unitTitle}
                              </Typography>
                              {point.activityLabel ? (
                                <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                                  {point.unitTitle}
                                </Typography>
                              ) : null}
                              <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                                {formatShortDate(point.date, language)}
                              </Typography>
                              <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.88)', fontSize: 11.2, lineHeight: 1.25 }}>
                                {point.levelMark} {point.skillLabel}
                              </Typography>
                              {point.activityCaptureLabel && point.curriculumSkillLabel ? (
                                <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.66)', fontSize: 10.6, lineHeight: 1.2 }}>
                                  {point.activityCaptureLabel}
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
                              width: pointMatchesActiveActivity ? 11 : 8,
                              height: pointMatchesActiveActivity ? 11 : 8,
                              borderRadius: '50%',
                              border: `2px solid ${pointMutedByActiveActivity ? 'rgba(var(--sd-text-rgb), 0.24)' : purple}`,
                              bgcolor: pointMatchesActiveActivity ? purple : 'var(--sd-surface)',
                              transform: 'translate(-50%, -50%)',
                              boxSizing: 'border-box',
                              cursor: 'default',
                              opacity: pointMutedByActiveActivity ? 0.34 : 1,
                              boxShadow: pointMatchesActiveActivity ? '0 0 0 4px rgba(var(--sd-primary-rgb), 0.14)' : 'none',
                              transition: 'width 120ms ease, height 120ms ease, box-shadow 120ms ease, opacity 120ms ease, border-color 120ms ease, background-color 120ms ease',
                              '&:hover': {
                                width: 12,
                                height: 12,
                                opacity: 1,
                                boxShadow: '0 0 0 4px rgba(var(--sd-primary-rgb), 0.12)',
                              },
                            }}
                          />
                        </Tooltip>
                      );
                    })}
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
  moduleId,
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
  seededTimelineResponses = [],
  timelineClassContextLabel = '',
  language,
  t = fallbackT,
}) {
  const [selectedMonthDate, setSelectedMonthDate] = useState('');
  const [curriculumAreasExpanded, setCurriculumAreasExpanded] = useState(false);
  const [learningObservationsExpanded, setLearningObservationsExpanded] = useState(true);
  const [lessonCaptureExpanded, setLessonCaptureExpanded] = useState(false);
  const [selectedCaptureUnitIds, setSelectedCaptureUnitIds] = useState([]);
  const [selectedActivityContextId, setSelectedActivityContextId] = useState('');
  const [hoverCursor, setHoverCursor] = useState(null);
  const [timelineResponsePayload, setTimelineResponsePayload] = useState(() => seedLearningModuleTimelineResponses(moduleId, seededTimelineResponses));
  const [responseDraft, setResponseDraft] = useState(null);
  const [activeResponseMenuId, setActiveResponseMenuId] = useState('');
  const [isTimelineFullscreen, setIsTimelineFullscreen] = useState(false);

  useEffect(() => {
    setTimelineResponsePayload(seedLearningModuleTimelineResponses(moduleId, seededTimelineResponses));
  }, [moduleId]);

  useEffect(() => {
    function handleTimelineResponsesStorage(event) {
      if (event?.detail?.moduleId && event.detail.moduleId !== moduleId) {
        return;
      }

      setTimelineResponsePayload(readLearningModuleTimelineResponses(moduleId));
    }

    window.addEventListener(LEARNING_MODULE_TIMELINE_RESPONSES_STORAGE_EVENT, handleTimelineResponsesStorage);
    window.addEventListener('storage', handleTimelineResponsesStorage);

    return () => {
      window.removeEventListener(LEARNING_MODULE_TIMELINE_RESPONSES_STORAGE_EVENT, handleTimelineResponsesStorage);
      window.removeEventListener('storage', handleTimelineResponsesStorage);
    };
  }, [moduleId]);

  useEffect(() => {
    if (!isTimelineFullscreen || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsTimelineFullscreen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTimelineFullscreen]);

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
  const studentTimelineResponses = (timelineResponsePayload.responses || []).filter((item) => item.studentId === student?.id);
  const timelineRange = getDateRange([
    { date: timeline.range.start },
    { date: timeline.range.end },
    ...studentTimelineResponses,
  ]);
  const monthMarkers = getMonthMarkers(timelineRange);
  const visibleRange = selectedMonthDate ? getMonthRange(selectedMonthDate) : timelineRange;
  const visibleUnits = layoutUnitSpans(timeline.units.filter((unit) => isSpanInRange(unit.startDate, unit.endDate, visibleRange)));
  const visibleLearningEvents = timeline.learningEvents.filter((item) => isDateInRange(item.date, visibleRange));
  const unitFilterActive = Boolean(selectedCaptureUnitIds.length);
  const visibleObservationClustersForRange = layoutObservationClusters(
    getObservationClusters(timeline.observations).filter((cluster) => isDateInRange(cluster.date, visibleRange)),
  );
  const visibleObservationClusters = unitFilterActive
    ? visibleObservationClustersForRange.filter((cluster) => selectedCaptureUnitIds.includes(cluster.teachingUnitId))
    : visibleObservationClustersForRange;
  const visibleActivityContextClusters = layoutActivityContextSpans(
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
  const visibleTeachingResponses = [
    ...timeline.teachingResponses,
    ...studentTimelineResponses,
  ]
    .filter((item) => isDateInRange(item.date, visibleRange))
    .sort((first, second) => (first.date || '').localeCompare(second.date || ''));
  const zoomed = Boolean(selectedMonthDate);
  const visibleTeachingResponseGroups = groupTimelineItemsByPosition(visibleTeachingResponses, visibleRange);
  const activityContextLaneCount = Math.max(1, ...visibleActivityContextClusters.map((cluster) => cluster.lane + 1));
  const activityContextRowHeight = Math.max(48, 26 + (activityContextLaneCount * 30));
  const classContentLaneCount = Math.max(1, ...visibleUnits.map((unit) => unit.lane + 1));
  const classContentRowHeight = curriculumAreasExpanded ? Math.max(70, 34 + (classContentLaneCount * 34)) : 40;
  const lessonCaptureLaneCount = Math.max(1, ...visibleObservationClusters.map((cluster) => cluster.lane + 1));
  const lessonCaptureTrackCount = Math.max(1, getCapturePointTracks(visibleObservationClusters, effectiveSelectedCaptureUnitIds).length);
  const lessonCaptureRowHeight = lessonCaptureExpanded
    ? Math.max(132, 72 + (lessonCaptureTrackCount * 55))
    : Math.max(70, 34 + (lessonCaptureLaneCount * (zoomed ? 48 : 36)));
  const teachingResponseStackCount = zoomed
    ? Math.max(1, ...visibleTeachingResponseGroups.map((group) => group.items.length))
    : 1;
  const teachingResponseRowHeight = Math.max(70, 34 + (teachingResponseStackCount * 34));

  function toggleContentUnitFilter(unitId) {
    setSelectedActivityContextId('');
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
      const activityContextId = cluster.contextId || cluster.id;
      const sameActivitySelected = selectedActivityContextId === activityContextId;
      const allLinkedUnitsSelected = linkedUnitIds.every((unitId) => currentIds.includes(unitId)) && currentIds.length === linkedUnitIds.length;

      if (sameActivitySelected && allLinkedUnitsSelected) {
        setSelectedActivityContextId('');
        setLessonCaptureExpanded(false);
        return [];
      }

      setSelectedActivityContextId(activityContextId);
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

  function openTimelineResponseDraft() {
    if (!hoverCursor?.date) {
      return;
    }

    setResponseDraft({
      id: '',
      mode: 'new',
      date: hoverCursor.date,
      position: hoverCursor.position,
      label: '',
      comment: '',
    });
  }

  function saveTimelineResponse(event) {
    event.preventDefault();
    const label = (responseDraft?.label || '').trim();
    const comment = (responseDraft?.comment || '').trim();

    if (!responseDraft?.date || (!label && !comment)) {
      setResponseDraft(null);
      return;
    }

    const outcome = responseDraft.id
      ? updateLearningModuleTimelineResponse(moduleId, timelineResponsePayload, responseDraft.id, { label, comment })
      : addLearningModuleTimelineResponse(moduleId, timelineResponsePayload, {
        studentId: student.id,
        date: responseDraft.date,
        label,
        comment,
      });

    setTimelineResponsePayload(outcome.payload);
    setResponseDraft(null);
  }

  function openExistingTimelineResponse(item, mode) {
    setResponseDraft({
      id: item.id,
      mode,
      date: item.date,
      position: getPosition(item.date, visibleRange),
      label: getLocalizedValue(item.label, language) || '',
      comment: getLocalizedValue(item.comment, language) || '',
    });
  }

  function deleteTimelineResponse(responseId) {
    const outcome = removeLearningModuleTimelineResponse(moduleId, timelineResponsePayload, responseId);
    setTimelineResponsePayload(outcome.payload);
    setResponseDraft((draft) => (draft?.id === responseId ? null : draft));
    setActiveResponseMenuId('');
  }

  return (
    <Portal disablePortal={!isTimelineFullscreen}>
    <Box
      onMouseLeave={() => setHoverCursor(null)}
      sx={{
        position: isTimelineFullscreen ? 'fixed' : 'relative',
        inset: isTimelineFullscreen ? { xs: 8, sm: 14 } : 'auto',
        zIndex: isTimelineFullscreen ? 1700 : 'auto',
        m: isTimelineFullscreen ? 0 : { xs: 1, sm: 1.25 },
        p: isTimelineFullscreen ? { xs: 1.1, sm: 1.35 } : { xs: 1.25, sm: 1.55 },
        borderTop: '1px solid rgba(var(--sd-text-rgb), 0.08)',
        border: `4px solid ${purple}`,
        borderRadius: isTimelineFullscreen ? '14px' : '18px',
        bgcolor: 'var(--sd-surface)',
        maxHeight: isTimelineFullscreen ? 'none' : { xs: '72vh', sm: 'min(720px, 72vh)' },
        height: isTimelineFullscreen ? 'auto' : 'auto',
        overflow: 'auto',
        boxShadow: isTimelineFullscreen
          ? '0 28px 80px rgba(var(--sd-shadow-rgb), 0.24)'
          : 'none',
      }}
    >
      <Box sx={{ minWidth: 780 }}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 18,
            bgcolor: 'var(--sd-surface)',
            borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.09)',
            boxShadow: '0 8px 18px rgba(23, 21, 26, 0.04)',
          }}
        >
        <Box sx={{ display: 'grid', gridTemplateColumns: '132px minmax(0, 1fr)', gap: 1.2, pb: 0.75 }}>
          <Box>
            <Stack direction="row" spacing={0.45} alignItems="center">
              <Tooltip title={isTimelineFullscreen ? t('learningModule.classPicture.timelineExitFullscreen') : t('learningModule.classPicture.timelineExpandFullscreen')}>
                <ButtonBase
                  type="button"
                  aria-label={isTimelineFullscreen ? t('learningModule.classPicture.timelineExitFullscreen') : t('learningModule.classPicture.timelineExpandFullscreen')}
                  aria-pressed={isTimelineFullscreen}
                  onClick={() => setIsTimelineFullscreen((currentValue) => !currentValue)}
                  sx={{
                    width: 25,
                    height: 25,
                    borderRadius: '7px',
                    color: 'var(--sd-accent-text)',
                    bgcolor: 'rgba(var(--sd-primary-rgb), 0.06)',
                    '&:hover': { bgcolor: 'rgba(var(--sd-primary-rgb), 0.1)' },
                    '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                  }}
                >
                  {isTimelineFullscreen ? <CloseFullscreenIcon sx={{ fontSize: 15 }} /> : <OpenInFullIcon sx={{ fontSize: 14 }} />}
                </ButtonBase>
              </Tooltip>
              {zoomed ? (
                <ButtonBase
                  type="button"
                  onClick={() => setSelectedMonthDate('')}
                  sx={{
                    px: 0.65,
                    py: 0.35,
                    borderRadius: '7px',
                    color: 'var(--sd-accent-text)',
                    bgcolor: 'rgba(var(--sd-primary-rgb), 0.06)',
                    '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                  }}
                >
                  <Typography sx={{ fontSize: 11.5, fontWeight: 880, lineHeight: 1 }}>
                    {t('learningModule.classPicture.timelineOverview')}
                  </Typography>
                </ButtonBase>
              ) : null}
            </Stack>
          </Box>
          <Box
            onMouseMove={updateHoverCursor}
            onClick={openTimelineResponseDraft}
            sx={{ position: 'relative', height: 28, cursor: 'crosshair' }}
          >
            {(zoomed ? getMonthMarkers(visibleRange) : monthMarkers).map((date) => (
              <ButtonBase
                key={date}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedMonthDate((currentDate) => (currentDate === date ? '' : date));
                }}
                sx={{
                  position: 'absolute',
                  left: `${getPosition(date, visibleRange)}%`,
                  transform: 'translateX(-1px)',
                  borderRadius: '7px',
                  px: 0.3,
                  py: 0.15,
                  color: zoomed ? 'var(--sd-accent-text)' : mutedText,
                  '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
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
                  color: 'var(--sd-on-primary)',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                  zIndex: 8,
                  boxShadow: '0 6px 16px rgba(var(--sd-primary-rgb), 0.16)',
                }}
              >
                <Typography sx={{ color: 'inherit', fontSize: 10.8, fontWeight: 900, lineHeight: 1 }}>
                  {formatShortDate(hoverCursor.date, language)}
                </Typography>
              </Box>
            ) : null}
            {responseDraft ? (
              <Box
                component="form"
                onClick={(event) => event.stopPropagation()}
                onSubmit={saveTimelineResponse}
                sx={{
                  position: 'absolute',
                  left: `${responseDraft.position}%`,
                  top: 34,
                  width: 238,
                  p: 0.85,
                  borderRadius: '10px',
                  bgcolor: 'var(--sd-surface)',
                  border: `1px solid ${purple}`,
                  boxShadow: '0 14px 34px rgba(23, 21, 26, 0.16)',
                  transform: 'translateX(-50%)',
                  zIndex: 30,
                }}
              >
                <Stack spacing={0.55}>
	                  <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 11.4, fontWeight: 900, lineHeight: 1 }}>
	                    {formatShortDate(responseDraft.date, language)}
	                  </Typography>
                  {responseDraft.mode === 'view' ? (
                    <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: 'rgba(var(--sd-primary-rgb), 0.055)', border: '1px solid rgba(var(--sd-primary-rgb), 0.14)' }}>
                      {!!responseDraft.label && (
                        <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 12.2, fontWeight: 900, lineHeight: 1.2 }}>
                          {responseDraft.label}
                        </Typography>
                      )}
                      {!!responseDraft.comment && (
                        <Typography sx={{ mt: responseDraft.label ? 0.35 : 0, color: darkText, fontSize: 12.2, lineHeight: 1.35 }}>
                          {responseDraft.comment}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <>
                      <Box
                        component="input"
                        value={responseDraft.label}
                        placeholder={t('learningModule.classPicture.timelineResponseLabel')}
                        onChange={(event) => setResponseDraft((draft) => ({ ...draft, label: event.target.value }))}
                        sx={{
                          width: '100%',
                          boxSizing: 'border-box',
                          px: 0.75,
                          py: 0.55,
                          borderRadius: '7px',
                          border: '1px solid rgba(var(--sd-text-rgb), 0.14)',
                          color: darkText,
                          font: 'inherit',
                          fontSize: 12.2,
                          fontWeight: 760,
                          outline: 'none',
                          '&:focus': { borderColor: purple, boxShadow: '0 0 0 2px rgba(var(--sd-primary-rgb), 0.1)' },
                        }}
                      />
                      <Box
                        component="textarea"
                        value={responseDraft.comment}
                        placeholder={t('learningModule.classPicture.timelineResponseComment')}
                        onChange={(event) => setResponseDraft((draft) => ({ ...draft, comment: event.target.value }))}
                        sx={{
                          width: '100%',
                          minHeight: 58,
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          px: 0.75,
                          py: 0.55,
                          borderRadius: '7px',
                          border: '1px solid rgba(var(--sd-text-rgb), 0.14)',
                          color: darkText,
                          font: 'inherit',
                          fontSize: 12.2,
                          lineHeight: 1.35,
                          outline: 'none',
                          '&:focus': { borderColor: purple, boxShadow: '0 0 0 2px rgba(var(--sd-primary-rgb), 0.1)' },
                        }}
                      />
                    </>
                  )}
	                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <ButtonBase
                      type="button"
                      onClick={() => setResponseDraft(null)}
                      sx={{ px: 0.75, py: 0.45, borderRadius: '7px', color: mutedText, '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 } }}
                    >
                      <Typography sx={{ fontSize: 11.5, fontWeight: 820, lineHeight: 1 }}>
                        {t('learningModule.classPicture.timelineCancelResponse')}
                      </Typography>
                    </ButtonBase>
                    {responseDraft.mode === 'view' ? (
                      <ButtonBase
                        type="button"
                        onClick={() => setResponseDraft((draft) => ({ ...draft, mode: 'edit' }))}
                        sx={{ px: 0.85, py: 0.45, borderRadius: '7px', color: 'var(--sd-on-primary)', bgcolor: purple, '&:hover': { bgcolor: 'var(--sd-primary-hover)' }, '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 } }}
                      >
                        <Typography sx={{ color: 'inherit', fontSize: 11.5, fontWeight: 880, lineHeight: 1 }}>
                          {t('learningModule.classPicture.timelineEditResponse')}
                        </Typography>
                      </ButtonBase>
                    ) : (
                      <ButtonBase
                        type="submit"
                        sx={{ px: 0.85, py: 0.45, borderRadius: '7px', color: 'var(--sd-on-primary)', bgcolor: purple, '&:hover': { bgcolor: 'var(--sd-primary-hover)' }, '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 } }}
                      >
                        <Typography sx={{ color: 'inherit', fontSize: 11.5, fontWeight: 880, lineHeight: 1 }}>
                          {t('learningModule.classPicture.timelineSaveResponse')}
                        </Typography>
                      </ButtonBase>
                    )}
	                  </Stack>
                </Stack>
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
                    bgcolor: 'rgba(var(--sd-primary-rgb), 0.42)',
                    transform: 'translateX(-50%)',
                  }}
                />
              </Box>
            </Box>
          ) : null}

          {visibleActivityContextClusters.length ? (
            <TimelineRow label={timelineClassContextLabel || t('learningModule.classPicture.timelineClassContext')} minHeight={activityContextRowHeight}>
              {visibleActivityContextClusters.map((cluster) => (
                (() => {
                  const clippedStart = cluster.startDate < visibleRange.start ? visibleRange.start : cluster.startDate;
                  const clippedEnd = cluster.endDate > visibleRange.end ? visibleRange.end : cluster.endDate;
                  const left = getPosition(clippedStart, visibleRange);
                  const right = getPosition(clippedEnd, visibleRange);
                  const width = Math.max(right - left, 9);
                  const activitySelected = selectedActivityContextId === (cluster.contextId || cluster.id);

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
                            <Typography sx={{ color: 'var(--sd-on-primary)', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
                              {cluster.activityLabel}
                            </Typography>
                            <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                              {formatShortDate(cluster.startDate, language)} - {formatShortDate(cluster.endDate, language)}
                            </Typography>
                            {!!cluster.unitTitles.length && (
                              <Typography sx={{ color: 'rgba(var(--sd-surface-rgb), 0.72)', fontSize: 10.8, lineHeight: 1.2 }}>
                                {cluster.unitTitles.join(' / ')}
                              </Typography>
                            )}
                            {cluster.captureLabels.slice(0, 5).map((label) => (
                              <Typography key={label} sx={{ color: 'rgba(var(--sd-surface-rgb), 0.9)', fontSize: 10.9, lineHeight: 1.2 }}>
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
                            bgcolor: activitySelected ? purple : 'rgba(var(--sd-primary-rgb), 0.1)',
                            border: activitySelected ? `1px solid ${purple}` : '1px solid rgba(var(--sd-primary-rgb), 0.2)',
                            boxShadow: activitySelected ? '0 8px 20px rgba(var(--sd-primary-rgb), 0.24)' : '0 5px 14px rgba(var(--sd-primary-rgb), 0.08)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
                            '&:hover': {
                              bgcolor: activitySelected ? 'var(--sd-primary-hover)' : 'rgba(var(--sd-primary-rgb), 0.15)',
                              borderColor: 'rgba(var(--sd-primary-rgb), 0.38)',
                              boxShadow: '0 7px 18px rgba(var(--sd-primary-rgb), 0.12)',
                            },
                            '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                          }}
                        >
                          <Stack direction="row" spacing={0.45} alignItems="center" sx={{ minWidth: 0 }}>
                            {activitySelected ? (
                              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'var(--sd-surface)', flexShrink: 0 }} />
                            ) : null}
                            <Typography sx={{ color: activitySelected ? 'var(--sd-on-primary)' : 'var(--sd-accent-text)', fontSize: 11.6, fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cluster.activityLabel}
                            </Typography>
                          </Stack>
                        </ButtonBase>
                      </Tooltip>
                    </Box>
                  );
                })()
              ))}
            </TimelineRow>
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
                    bgcolor: 'rgba(var(--sd-primary-rgb), 0.42)',
                    transform: 'translateX(-50%)',
                  }}
                />
              </Box>
            </Box>
          ) : null}
          <TimelineRow
            label={(
              <ButtonBase
                type="button"
                onClick={() => setCurriculumAreasExpanded((isExpanded) => !isExpanded)}
                aria-expanded={curriculumAreasExpanded}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 0.3,
                  color: mutedText,
                  borderRadius: '7px',
                  textAlign: 'left',
                  '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                }}
              >
                <KeyboardArrowDownIcon sx={{ fontSize: 16, transform: curriculumAreasExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 140ms ease' }} />
                <Typography sx={{ color: 'inherit', fontSize: 12.2, fontWeight: 850, lineHeight: 1.2 }}>
                  {t('learningModule.classPicture.timelineCurriculumAreas')}
                </Typography>
              </ButtonBase>
            )}
            minHeight={classContentRowHeight}
          >
            {curriculumAreasExpanded && visibleUnits.length ? visibleUnits.map((unit) => {
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
                    bgcolor: unitSelected ? 'rgba(var(--sd-primary-rgb), 0.13)' : 'rgba(var(--sd-primary-rgb), 0.06)',
                    border: unitSelected ? `1px solid ${purple}` : '1px solid rgba(var(--sd-primary-rgb), 0.12)',
                    opacity: unitFilterActive && !unitSelected ? 0.36 : 1,
                    transition: 'opacity 140ms ease, background-color 140ms ease, border-color 140ms ease',
                    '&:hover': {
                      opacity: 1,
                      bgcolor: unitSelected ? 'rgba(var(--sd-primary-rgb), 0.16)' : 'rgba(var(--sd-primary-rgb), 0.09)',
                    },
                    '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                  }}
                >
                  <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 850, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {unit.title}
                  </Typography>
                </ButtonBase>
              );
            }) : curriculumAreasExpanded ? <EmptyRow /> : null}
          </TimelineRow>
          <TimelineRow
            label={(
              <ButtonBase
                type="button"
                onClick={() => setLearningObservationsExpanded((isExpanded) => !isExpanded)}
                aria-expanded={learningObservationsExpanded}
                sx={{
                  justifyContent: 'flex-start',
                  gap: 0.3,
                  color: mutedText,
                  borderRadius: '7px',
                  textAlign: 'left',
                  '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                }}
              >
                <KeyboardArrowDownIcon sx={{ fontSize: 16, transform: learningObservationsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 140ms ease' }} />
                <Typography sx={{ color: 'inherit', fontSize: 12.2, fontWeight: 850, lineHeight: 1.2 }}>
                  {t('learningModule.classPicture.timelineLearningObservations')}
                </Typography>
              </ButtonBase>
            )}
            minHeight={learningObservationsExpanded ? 70 : 40}
          >
            {learningObservationsExpanded ? (
              <LearningObservationGraph
                events={visibleLearningEvents}
                areas={learningObservationAreas}
                range={visibleRange}
                language={language}
              />
            ) : null}
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
                      '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
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
                    activeActivityContextId={selectedActivityContextId}
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

          <TimelineRow label={t('learningModule.classPicture.timelineTeachingResponse')} minHeight={teachingResponseRowHeight}>
            {visibleTeachingResponseGroups.length ? visibleTeachingResponseGroups.flatMap((group) => {
              const itemsToRender = zoomed ? group.items : group.items.slice(0, 1);
              const hiddenCount = zoomed ? 0 : Math.max(0, group.items.length - itemsToRender.length);

              return itemsToRender.map((item, itemIndex) => {
                const top = zoomed ? itemIndex * 34 : 0;
                const responseLabel = getLocalizedValue(item.label, language);
                const responseComment = getLocalizedValue(item.comment, language);
                const responseHeader = responseLabel || responseComment || item.text || '';

                return item.type === 'timeline-comment' ? (
                  <Box
                    key={item.id}
                    sx={{
                      position: 'absolute',
                      left: `${getPosition(item.date, visibleRange)}%`,
                      top,
                      width: 190,
                      maxWidth: 190,
                      transform: 'translateX(-6px)',
                    }}
                  >
                    <Stack direction="row" spacing={0.45} alignItems="flex-start">
                      <Box sx={{ position: 'relative', pt: 0.05, flexShrink: 0 }}>
                        <ButtonBase
                          type="button"
                          aria-label={responseHeader}
                          aria-expanded={activeResponseMenuId === item.id}
                          onClick={() => setActiveResponseMenuId((currentId) => (currentId === item.id ? '' : item.id))}
                          sx={{
                            width: 19,
                            height: 19,
                            borderRadius: '6px',
                            color: 'var(--sd-accent-text)',
                            '&:hover': { bgcolor: 'rgba(var(--sd-primary-rgb), 0.08)' },
                            '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 },
                          }}
                        >
                          <NotesIcon sx={{ color: 'inherit', fontSize: 14 }} />
                        </ButtonBase>
                        {!!hiddenCount && (
                          <ButtonBase
                            type="button"
                            onClick={() => setSelectedMonthDate(group.date)}
                            sx={{
                              position: 'absolute',
                              left: 11,
                              top: -8,
                              minWidth: 18,
                              height: 16,
                              px: 0.35,
                              borderRadius: '999px',
                              bgcolor: purple,
                              color: 'var(--sd-on-primary)',
                              boxShadow: '0 5px 12px rgba(var(--sd-primary-rgb), 0.16)',
                              '&:hover': { bgcolor: 'var(--sd-primary-hover)' },
                              '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 },
                            }}
                          >
                            <Typography sx={{ color: 'inherit', fontSize: 9.8, fontWeight: 900, lineHeight: 1 }}>
                              +{hiddenCount}
                            </Typography>
                          </ButtonBase>
                        )}
                        {activeResponseMenuId === item.id ? (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: -4,
                              top: 22,
                              zIndex: 25,
                              display: 'grid',
                              gap: 0.25,
                              p: 0.35,
                              borderRadius: '8px',
                              bgcolor: 'var(--sd-surface)',
                              border: '1px solid rgba(var(--sd-primary-rgb), 0.2)',
                              boxShadow: '0 10px 24px rgba(23, 21, 26, 0.14)',
                            }}
                          >
                            {[
                              [t('learningModule.classPicture.timelineViewResponse'), () => openExistingTimelineResponse(item, 'view')],
                              [t('learningModule.classPicture.timelineEditResponse'), () => openExistingTimelineResponse(item, 'edit')],
                              [t('learningModule.classPicture.timelineDeleteResponse'), () => deleteTimelineResponse(item.id)],
                            ].map(([label, action]) => (
                              <ButtonBase
                                key={label}
                                type="button"
                                onClick={() => {
                                  action();
                                  if (label !== t('learningModule.classPicture.timelineDeleteResponse')) {
                                    setActiveResponseMenuId('');
                                  }
                                }}
                                sx={{
                                  justifyContent: 'flex-start',
                                  px: 0.55,
                                  py: 0.4,
                                  borderRadius: '6px',
                                  color: label === t('learningModule.classPicture.timelineDeleteResponse') ? 'var(--sd-error)' : 'var(--sd-accent-text)',
                                  '&:hover': { bgcolor: 'rgba(var(--sd-primary-rgb), 0.07)' },
                                  '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 },
                                }}
                              >
                                <Typography sx={{ color: 'inherit', fontSize: 10.7, fontWeight: 850, lineHeight: 1, whiteSpace: 'nowrap' }}>
                                  {label}
                                </Typography>
                              </ButtonBase>
                            ))}
                          </Box>
                        ) : null}
                      </Box>
                      <Box
                        sx={{
                          width: 166,
                          p: 0.55,
                          borderRadius: '9px',
                          bgcolor: 'rgba(var(--sd-primary-rgb), 0.08)',
                          border: `1px solid rgba(var(--sd-primary-rgb), 0.28)`,
                          boxShadow: '0 8px 18px rgba(var(--sd-primary-rgb), 0.08)',
                        }}
                      >
                        <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 11.6, fontWeight: 900, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {responseHeader}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    key={item.id}
                    sx={{
                      position: 'absolute',
                      left: `${getPosition(item.date, visibleRange)}%`,
                      top,
                      width: 150,
                      maxWidth: 150,
                      transform: 'translateX(-6px)',
                    }}
                  >
                    <Stack direction="row" spacing={0.45} alignItems="flex-start">
                      <Box sx={{ position: 'relative', pt: 0.2, flexShrink: 0 }}>
                        <TimelineIcon type="response" />
                        {!!hiddenCount && (
                          <ButtonBase
                            type="button"
                            onClick={() => setSelectedMonthDate(group.date)}
                            sx={{
                              position: 'absolute',
                              left: 10,
                              top: -8,
                              minWidth: 18,
                              height: 16,
                              px: 0.35,
                              borderRadius: '999px',
                              bgcolor: purple,
                              color: 'var(--sd-on-primary)',
                              '&:hover': { bgcolor: 'var(--sd-primary-hover)' },
                              '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 },
                            }}
                          >
                            <Typography sx={{ color: 'inherit', fontSize: 9.8, fontWeight: 900, lineHeight: 1 }}>
                              +{hiddenCount}
                            </Typography>
                          </ButtonBase>
                        )}
                      </Box>
                      <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 780, lineHeight: 1.25 }}>
                        {item.text}
                      </Typography>
                    </Stack>
                  </Box>
                );
              });
            }) : <EmptyRow />}
          </TimelineRow>
        </Box>
      </Box>
    </Box>
    </Portal>
  );
}
