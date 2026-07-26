import { useEffect, useMemo, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotesIcon from '@mui/icons-material/Notes';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Tooltip from '@mui/material/Tooltip';
import {
  Box,
  Button,
  ButtonGroup,
  ButtonBase,
  Chip,
  Divider,
  Dialog,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { annaTasks } from '../data/annaTasks.js';
import { maths7AEvidence } from '../data/Maths7AEvidence.js';
import {
  getMathsCaptureFocuses,
  getMathsCaptureLevelById,
  getMathsCapturePointById,
  getMathsCapturePointsForTopic,
  mathsCaptureLevels,
} from '../data/mathsCaptureConfig.js';
import {
  buildMaths7ADemoLessonSequence,
  MATHS_7A_LESSON_INDEX_STORAGE_KEY,
  readMaths7ALessonIndex,
  resetMaths7ALessonIndex,
  writeMaths7ALessonIndex,
} from '../data/maths7ADemoLessons.js';
import {
  MATHS_7A_EVIDENCE_STORAGE_KEY,
  readMaths7ALocalEvidence,
  resetMaths7ALocalEvidence,
} from '../data/maths7AEvidenceStorage.js';
import {
  maths7ALearningObservations,
} from '../data/maths7ALearningObservations.js';
import {
  getMergedMaths7ALearningObservations,
  MATHS_7A_LEARNING_OBSERVATIONS_STORAGE_KEY,
  readMaths7ALocalLearningObservations,
  resetMaths7ALocalLearningObservations,
} from '../data/maths7ALearningObservationStorage.js';
import {
  getMaths7AAssessmentResultsAsEvidence,
  MATHS_7A_ASSESSMENT_RESULTS_STORAGE_EVENT,
  MATHS_7A_ASSESSMENT_RESULTS_STORAGE_KEY,
  readMaths7AAssessmentResults,
  resetMaths7AAssessmentResults,
} from '../data/maths7AAssessmentResultStorage.js';
import { maths7APlanningBlocks, maths7APlanningPeriods } from '../data/maths7APlanning.js';
import { maths7AStudents } from '../data/Maths7AStudents.js';
import { classGroupDefinitions } from '../data/classGroupDefinitions.js';
import {
  getEvidenceTopicById,
  getTeachingUnitById,
  getTeachingUnitForPlanningBlock,
  mathsAbilities,
  mathsCurriculumAreas,
  mathsEvidenceTopics,
  mathsQuickAddTemplates,
  mathsTeachingUnits,
  normalizeMathsPlanningBlock,
} from '../data/mathsCurriculum.js';
import { useClassWorkingGroups } from '../hooks/useClassWorkingGroups.js';
import { usePlanningCurriculumNotes } from '../hooks/usePlanningCurriculumNotes.js';
import { useSubjectPlanning } from '../hooks/useSubjectPlanning.js';
import {
  getEvidenceForStudent,
  getMergedMathsEvidence,
  getStudentPictureSummary,
  sortEvidenceByDate,
} from '../utils/maths7APictureUtils.js';
import { getGroupsForStudent } from '../utils/classGroupUtils.js';
import { GroupDialog } from './classPicture/ClassWorkingGroups.jsx';
import AssessmentView from './maths7A/AssessmentView.jsx';
import AssessmentResultsEntryModal from './maths7A/AssessmentResultsEntryModal.jsx';
import QuickCapture from './maths7A/QuickCapture.jsx';
import QuickCaptureV2 from './maths7A/QuickCaptureV2.jsx';
import StudentUnitEvidenceCell from './maths7A/StudentUnitEvidenceCell.jsx';
import StudentGlobalInsightPanelV1 from './maths7A/StudentGlobalInsightPanelV1.jsx';
import StudentGlobalInsightPanelV2 from './maths7A/StudentGlobalInsightPanelV2.jsx';
import StudentUnitInsightPanelV1 from './maths7A/StudentUnitInsightPanelV1.jsx';
import StudentUnitInsightPanelV2 from './maths7A/StudentUnitInsightPanelV2.jsx';
import StudentProfileDataDialog from './classPicture/StudentProfileDataDialog.jsx';
import SubjectPlanningBoard from './planning/SubjectPlanningBoard.jsx';
import SubjectWorkspaceContainer from './SubjectWorkspaceContainer.jsx';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';
const absentOrange = '#b85c00';
const assessmentRed = '#b71c1c';
const planningStorageKey = 'smartdesk_demo_maths7a_plan';
const maths7ACellNotesStorageKey = 'smartdesk_demo_maths7a_cell_notes';
const maths7AUnitNotesStorageKey = 'smartdesk_demo_maths7a_unit_notes';
const maths7ARowNotesStorageKey = 'smartdesk_demo_maths7a_row_notes';

const classPicture = {
  summary: 'The available information suggests that Mathematics 7A is currently more secure with calculation than written problem-solving. Verbal modelling and paired explanation have produced several useful observations. The picture for algebra and statistics is still limited.',
  examples: ['Written problems have been more difficult than calculations for several students.', 'Verbal modelling appeared to help.'],
  noticed: 'Several students appear more secure with calculation than written problem-solving.',
  suggestion: 'You may want to include one short language-focused example today.',
};

const nowCaptureFocuses = getMathsCaptureFocuses({
  teachingUnits: mathsTeachingUnits,
  evidenceTopics: mathsEvidenceTopics,
});

const defaultNowStudentId = maths7AStudents.find((student) => student.id === 'leo-andersson')?.id || maths7AStudents[0]?.id || '';

function getStudentUnitCellNoteKey(studentId, unitId) {
  return `${studentId}:${unitId}`;
}

function normalizeCellNoteValue(value) {
  const firstWord = String(value || '').trim().split(/\s+/)[0] || '';
  return firstWord.slice(0, 16);
}

function normalizeRowNoteValue(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

function readMaths7ACellNotes() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const value = window.localStorage.getItem(maths7ACellNotesStorageKey);
    const parsed = value ? JSON.parse(value) : {};

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce((notes, [key, noteValue]) => {
      const note = normalizeCellNoteValue(noteValue);
      if (note) {
        notes[key] = note;
      }
      return notes;
    }, {});
  } catch {
    return {};
  }
}

function readMaths7AUnitNotes() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const value = window.localStorage.getItem(maths7AUnitNotesStorageKey);
    const parsed = value ? JSON.parse(value) : {};

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce((notes, [key, noteValue]) => {
      const note = normalizeCellNoteValue(noteValue);
      if (note) {
        notes[key] = note;
      }
      return notes;
    }, {});
  } catch {
    return {};
  }
}

function readMaths7ARowNotes() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const value = window.localStorage.getItem(maths7ARowNotesStorageKey);
    const parsed = value ? JSON.parse(value) : {};

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce((notes, [key, noteValue]) => {
      const note = normalizeRowNoteValue(noteValue);
      if (note) {
        notes[key] = note;
      }
      return notes;
    }, {});
  } catch {
    return {};
  }
}

function writeMaths7ACellNotes(notes) {
  const safeNotes = Object.entries(notes || {}).reduce((nextNotes, [key, value]) => {
    const note = normalizeCellNoteValue(value);
    if (note) {
      nextNotes[key] = note;
    }
    return nextNotes;
  }, {});

  if (typeof window !== 'undefined') {
    try {
      if (Object.keys(safeNotes).length) {
        window.localStorage.setItem(maths7ACellNotesStorageKey, JSON.stringify(safeNotes));
      } else {
        window.localStorage.removeItem(maths7ACellNotesStorageKey);
      }
    } catch {
      return safeNotes;
    }
  }

  return safeNotes;
}

function writeMaths7AUnitNotes(notes) {
  const safeNotes = Object.entries(notes || {}).reduce((nextNotes, [key, value]) => {
    const note = normalizeCellNoteValue(value);
    if (note) {
      nextNotes[key] = note;
    }
    return nextNotes;
  }, {});

  if (typeof window !== 'undefined') {
    try {
      if (Object.keys(safeNotes).length) {
        window.localStorage.setItem(maths7AUnitNotesStorageKey, JSON.stringify(safeNotes));
      } else {
        window.localStorage.removeItem(maths7AUnitNotesStorageKey);
      }
    } catch {
      return safeNotes;
    }
  }

  return safeNotes;
}

function writeMaths7ARowNotes(notes) {
  const safeNotes = Object.entries(notes || {}).reduce((nextNotes, [key, value]) => {
    const note = normalizeRowNoteValue(value);
    if (note) {
      nextNotes[key] = note;
    }
    return nextNotes;
  }, {});

  if (typeof window !== 'undefined') {
    try {
      if (Object.keys(safeNotes).length) {
        window.localStorage.setItem(maths7ARowNotesStorageKey, JSON.stringify(safeNotes));
      } else {
        window.localStorage.removeItem(maths7ARowNotesStorageKey);
      }
    } catch {
      return safeNotes;
    }
  }

  return safeNotes;
}

function resetMaths7ACellNotes() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(maths7ACellNotesStorageKey);
    } catch {
      return {};
    }
  }

  return {};
}

function resetMaths7ARowNotes() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(maths7ARowNotesStorageKey);
    } catch {
      return {};
    }
  }

  return {};
}

function resetMaths7AUnitNotes() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(maths7AUnitNotesStorageKey);
    } catch {
      return {};
    }
  }

  return {};
}

function findLinkedTasks(tasks, student) {
  return tasks.filter((task) => (
    task.studentId === student.id
    || task.moduleId === 'maths'
    || task.moduleId === 'mathematics'
    || task.preferredWindowEventId === 'mon-maths-7a'
  ));
}

function readHistoricalResult(student) {
  return student.previousResults?.find((result) => result.subjectId === 'mathematics') || null;
}

function getTopicLabel(topicId) {
  return getEvidenceTopicById(topicId)?.title || getTeachingUnitById(topicId)?.title || topicId;
}

function formatDemoDate(date) {
  if (!date) {
    return 'No saved date';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function formatDemoLessonDate(date) {
  if (!date) {
    return 'No saved lesson date';
  }

  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`));
}

function getCaptureLevelValue(levelId) {
  return mathsCaptureLevels.find((level) => level.id === levelId)?.order || 0;
}

function buildCaptureProgressSeries(observations) {
  const structuredObservations = observations
    .filter((item) => item.capturePointId && item.levelId && getMathsCapturePointById(item.capturePointId) && getMathsCaptureLevelById(item.levelId))
    .sort((first, second) => first.date.localeCompare(second.date));
  const seriesByCapturePoint = structuredObservations.reduce((groups, item) => {
    if (!groups.has(item.capturePointId)) {
      groups.set(item.capturePointId, []);
    }
    groups.get(item.capturePointId).push(item);
    return groups;
  }, new Map());

  return [...seriesByCapturePoint.entries()]
    .map(([capturePointId, items]) => {
      const capturePoint = getMathsCapturePointById(capturePointId);
      const firstValue = getCaptureLevelValue(items[0]?.levelId);
      const latestValue = getCaptureLevelValue(items[items.length - 1]?.levelId);

      return {
        capturePoint,
        items,
        change: latestValue - firstValue,
        latestValue,
        hasLocalObservation: items.some((item) => item.source === 'observed' || item.id?.startsWith('local-observation-')),
      };
    })
    .sort((first, second) => (
      Number(second.hasLocalObservation) - Number(first.hasLocalObservation)
      || Number(second.items.length >= 2) - Number(first.items.length >= 2)
      || second.items.length - first.items.length
      || second.latestValue - first.latestValue
      || first.capturePoint.label.localeCompare(second.capturePoint.label)
    ));
}

function getCurrentPlanningUnitTitle(block) {
  const teachingUnit = getTeachingUnitForPlanningBlock(block);
  if (!block && !teachingUnit) {
    return 'Mathematics 7A';
  }

  if (block?.title && block.title !== teachingUnit?.title) {
    return block.title;
  }

  return teachingUnit?.title || block?.title || 'Mathematics 7A';
}

function Panel({ title, children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '22px',
        border: '1px solid rgba(23, 21, 26, 0.1)',
        bgcolor: '#fff',
        ...sx,
      }}
    >
      <Stack spacing={1.6}>
        {title && <Typography sx={{ color: darkText, fontSize: 20, fontWeight: 850 }}>{title}</Typography>}
        {children}
      </Stack>
    </Paper>
  );
}

function EvidenceCard({ item }) {
  const topic = item.evidenceTopicId ? getTopicLabel(item.evidenceTopicId) : null;
  const helper = [
    item.type === 'assessment' ? 'Assessment anchor' : 'Observation',
    topic,
    item.percentage !== null ? `${item.percentage}%` : null,
  ].filter(Boolean);

  return (
    <Paper elevation={0} sx={{ p: 1.45, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.09)', bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontWeight: 800, lineHeight: 1.3 }}>{item.assessmentTitle || item.observationText || item.label}</Typography>
      <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 13.2 }}>{helper.join(' - ')}</Typography>
      {item.observationText && item.observationText !== item.label && (
        <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 13.5, lineHeight: 1.45 }}>{item.observationText}</Typography>
      )}
    </Paper>
  );
}

function StudentPictureDialog({ student, evidence, tasks, open, onClose, onCapture }) {
  if (!student) {
    return null;
  }

  const historicalResult = readHistoricalResult(student);
  const picture = getStudentPictureSummary(student, evidence);
  const topics = picture.topics.map(getTopicLabel);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '24px' },
          bgcolor: '#fff',
          boxShadow: '0 28px 80px rgba(23, 21, 26, 0.16)',
        },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
        <IconButton aria-label={`Close ${student.displayName} picture`} onClick={onClose} sx={{ position: 'absolute', top: 14, right: 14 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h2" sx={{ color: darkText, fontSize: { xs: 31, sm: 40 }, lineHeight: 1.05, pr: 5 }}>
          {student.displayName}
        </Typography>
        <Typography sx={{ mt: 0.8, color: 'text.secondary', fontWeight: 650 }}>Mathematics - 7A</Typography>

        <Box sx={{ mt: 2.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.86fr 1.14fr' }, gap: 2 }}>
          <Stack spacing={2}>
            <Panel title="Earlier reference" sx={{ bgcolor: palePurple, borderColor: 'rgba(156, 40, 175, 0.16)' }}>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
                Year 6 final grade: <Box component="span" sx={{ color: darkText, fontWeight: 850 }}>{historicalResult?.grade || 'Not shown'}</Box>
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13.8, lineHeight: 1.5 }}>
                This is a reference point only.
              </Typography>
            </Panel>

            <Panel title="SmartDesk summary">
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {picture.summary}
              </Typography>
              {picture.averageAssessment !== null && (
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
                  Average of saved assessment anchors: <Box component="span" sx={{ color: darkText, fontWeight: 850 }}>{picture.averageAssessment}%</Box>
                </Typography>
              )}
              <Typography sx={{ color: darkText, fontWeight: 800 }}>You could consider...</Typography>
              <Stack spacing={0.75}>
                {['View recent evidence', 'View related topic', 'Capture something if it feels useful'].map((item) => (
                  <Typography key={item} sx={{ color: 'text.secondary', fontSize: 14.5 }}>- {item}</Typography>
                ))}
              </Stack>
              <Button variant="outlined" onClick={onCapture} sx={{ alignSelf: 'flex-start', color: darkText, borderColor: 'rgba(23, 21, 26, 0.16)' }}>
                Capture something
              </Button>
            </Panel>
          </Stack>

          <Stack spacing={2}>
            <Panel title="Current picture is still developing">
              <Stack spacing={1}>{evidence.map((item) => <EvidenceCard key={item.id} item={item} />)}</Stack>
            </Panel>

            <Panel title="Linked follow-up">
              {tasks.length ? tasks.map((task) => (
                <Paper key={task.id} elevation={0} sx={{ p: 1.35, borderRadius: '15px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                  <Typography sx={{ color: darkText, fontWeight: 800 }}>{task.title}</Typography>
                  <Typography sx={{ mt: 0.4, color: 'text.secondary', fontSize: 13.2 }}>
                    {[task.classId?.toUpperCase(), task.date].filter(Boolean).join(' - ')}
                  </Typography>
                </Paper>
              )) : (
                <Typography sx={{ color: 'text.secondary' }}>No linked items selected for this view.</Typography>
              )}
            </Panel>

            {!!topics.length && (
              <Panel title="Recent topics">
                <Typography sx={{ color: 'text.secondary' }}>{topics.join(' - ')}</Typography>
              </Panel>
            )}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}

function QuietStatement() {
  return (
    <Typography sx={{ color: 'text.secondary', fontSize: 13.5, lineHeight: 1.5 }}>
      This reflects only the information Anna chose to save.
    </Typography>
  );
}

function buildMathsStudentProfileSections({ student, evidence, tasks }) {
  const historicalResult = readHistoricalResult(student);

  return [
    {
      id: 'earlier-reference',
      title: 'Earlier reference',
      description: 'Saved school data that Anna can use as context only.',
      items: historicalResult ? [
        {
          id: historicalResult.id,
          label: `${historicalResult.schoolYear} ${historicalResult.term}`,
          detail: `Final grade: ${historicalResult.grade}`,
          meta: historicalResult.date,
        },
      ] : [],
    },
    {
      id: 'saved-evidence',
      title: 'Saved evidence',
      description: 'Moments Anna chose to keep for this subject.',
      items: evidence.slice(0, 6).map((item) => {
        const topic = item.evidenceTopicId ? getTopicLabel(item.evidenceTopicId) : null;
        const detail = [
          item.type === 'assessment' ? 'Assessment anchor' : 'Observation',
          topic,
          item.percentage !== null ? `${item.percentage}%` : null,
        ].filter(Boolean).join(' - ');

        return {
          id: item.id,
          label: item.assessmentTitle || item.observationText || item.label,
          detail: item.observationText || detail,
          meta: [detail, item.date].filter(Boolean).join(' - '),
        };
      }),
    },
    {
      id: 'linked-follow-up',
      title: 'Linked follow-up',
      description: 'Tasks or notes currently connected to this student or class context.',
      items: tasks.slice(0, 4).map((task) => ({
        id: task.id,
        label: task.title,
        detail: task.description || task.note || '',
        meta: [task.classId?.toUpperCase(), task.date].filter(Boolean).join(' - '),
      })),
    },
  ];
}

function getUnitEvidenceItems(evidence, unit) {
  return (evidence || []).filter((item) => (
    item.teachingUnitId === unit.id
    || (unit.evidenceTopicIds || []).includes(item.evidenceTopicId)
  ));
}

function getCapturePointsForUnit(unit) {
  return (unit.evidenceTopicIds || []).flatMap((topicId) => getMathsCapturePointsForTopic({
    teachingUnitId: unit.id,
    evidenceTopicId: topicId,
  }));
}

function buildTeachingUnitEvidenceSummary(unit, evidence, judgement) {
  const items = getUnitEvidenceItems(evidence, unit);
  const observations = items.filter((item) => item.type !== 'assessment');
  const assessments = items.filter((item) => item.type === 'assessment');
  const capturePoints = getCapturePointsForUnit(unit);
  const observedCapturePointIds = new Set(observations.map((item) => item.capturePointId).filter(Boolean));
  const unstructuredObservations = observations.filter((item) => !item.capturePointId);
  const dates = [...new Set(items.map((item) => item.date).filter(Boolean))].sort();

  return {
    unit,
    items,
    observations,
    assessments,
    capturePoints,
    observedCapturePointIds,
    observedCapturePointCount: capturePoints.filter((point) => observedCapturePointIds.has(point.id)).length,
    unstructuredObservationCount: unstructuredObservations.length,
    lessonCount: dates.length,
    earliestDate: dates[0] || null,
    latestDate: dates[dates.length - 1] || null,
    judgement,
  };
}

function buildCapturePointSequences(summary) {
  const observationsByCapturePoint = new Map();
  summary.observations
    .filter((item) => item.capturePointId && item.levelId)
    .forEach((item) => {
      if (!observationsByCapturePoint.has(item.capturePointId)) {
        observationsByCapturePoint.set(item.capturePointId, []);
      }
      observationsByCapturePoint.get(item.capturePointId).push(item);
    });

  return summary.capturePoints.map((capturePoint) => {
    const observations = sortEvidenceByDate(observationsByCapturePoint.get(capturePoint.id) || [], 'asc');
    return {
      capturePoint,
      observations,
    };
  });
}

function getJudgementKey(studentId, teachingUnitId) {
  return `${studentId}:${teachingUnitId}`;
}

function getRepeatedSequenceGroups(summary) {
  return buildCapturePointSequences(summary).filter((sequence) => sequence.observations.length >= 2);
}

function getAssessmentPercentage(item) {
  const percentage = item?.percentage !== undefined && item?.percentage !== null
    ? Number(item.percentage)
    : item?.valueType === 'percentage'
      ? Number(item.value)
      : null;

  return Number.isFinite(percentage) ? percentage : null;
}

function getEvidenceDateGroups(items) {
  const groupsByDate = new Map();

  sortEvidenceByDate(items || [], 'asc').forEach((item) => {
    if (!item.date) return;
    const existingGroup = groupsByDate.get(item.date) || {
      date: item.date,
      observations: 0,
      assessments: 0,
      labels: [],
    };

    if (item.type === 'assessment') {
      existingGroup.assessments += 1;
    } else {
      existingGroup.observations += 1;
    }

    existingGroup.labels.push(item.assessmentTitle || item.observationText || item.label || 'Evidence');
    groupsByDate.set(item.date, existingGroup);
  });

  return [...groupsByDate.values()].map((group) => ({
    ...group,
    count: group.observations + group.assessments,
  }));
}

function EvidenceTimelineTile({ title, items }) {
  const dateGroups = getEvidenceDateGroups(items);
  const maxCount = Math.max(...dateGroups.map((group) => group.count), 1);
  const points = dateGroups.map((group, index) => ({
    ...group,
    x: dateGroups.length === 1 ? 50 : 8 + (index / (dateGroups.length - 1)) * 84,
    y: 54 - (group.count / maxCount) * 38,
  }));
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const firstDate = dateGroups[0]?.date || null;
  const latestDate = dateGroups[dateGroups.length - 1]?.date || null;

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: 126 }}>
      <Stack spacing={0.8}>
        <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
          <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>{title}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>{dateGroups.length} date{dateGroups.length === 1 ? '' : 's'}</Typography>
        </Stack>
        <Box
          component="svg"
          role="img"
          aria-label={title}
          viewBox="0 0 100 64"
          sx={{
            width: '100%',
            height: 66,
            display: 'block',
            overflow: 'visible',
            '& circle': { transition: 'r 140ms ease, fill 140ms ease' },
            '& circle:hover': { r: 4.8, fill: purple },
          }}
        >
          <line x1="8" y1="54" x2="92" y2="54" stroke="rgba(23, 21, 26, 0.12)" strokeWidth="1.5" />
          <line x1="8" y1="16" x2="92" y2="16" stroke="rgba(23, 21, 26, 0.05)" strokeWidth="1" />
          {points.length > 1 && <polyline points={linePoints} fill="none" stroke={purple} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
          {points.length === 1 && <line x1="22" y1={points[0].y} x2="78" y2={points[0].y} stroke={purple} strokeWidth="2.6" strokeLinecap="round" />}
          {points.map((point) => (
            <circle key={point.date} cx={point.x} cy={point.y} r="3.7" fill={darkText} stroke="#fff" strokeWidth="1.5">
              <title>{`${formatDemoDate(point.date)} · ${point.count} item${point.count === 1 ? '' : 's'} · ${point.labels.slice(0, 2).join(' · ')}`}</title>
            </circle>
          ))}
          {!points.length && (
            <>
              <line x1="22" y1="35" x2="78" y2="35" stroke="rgba(23, 21, 26, 0.18)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="50" cy="35" r="3.5" fill="rgba(23, 21, 26, 0.22)" />
            </>
          )}
        </Box>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
          {latestDate ? `${formatDemoDate(firstDate)} to ${formatDemoDate(latestDate)}` : 'No dated evidence yet'}
        </Typography>
      </Stack>
    </Paper>
  );
}

function AssessmentResultTile({ assessments, title = 'Assessment line' }) {
  const sortedAssessments = sortEvidenceByDate(assessments || [], 'asc')
    .filter((item) => getAssessmentPercentage(item) !== null);
  const points = sortedAssessments.map((item, index) => ({
    item,
    x: sortedAssessments.length === 1 ? 50 : 8 + (index / (sortedAssessments.length - 1)) * 84,
    y: 54 - (getAssessmentPercentage(item) / 100) * 38,
  }));
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: 126 }}>
      <Stack spacing={0.8}>
        <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
          <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>{title}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>{sortedAssessments.length} result{sortedAssessments.length === 1 ? '' : 's'}</Typography>
        </Stack>
        <Box
          component="svg"
          role="img"
          aria-label={title}
          viewBox="0 0 100 64"
          sx={{
            width: '100%',
            height: 66,
            display: 'block',
            overflow: 'visible',
            '& circle': { transition: 'r 140ms ease, fill 140ms ease' },
            '& circle:hover': { r: 4.8, fill: purple },
          }}
        >
          {[25, 50, 75].map((tick) => {
            const y = 54 - (tick / 100) * 38;
            return <line key={tick} x1="8" y1={y} x2="92" y2={y} stroke="rgba(23, 21, 26, 0.055)" strokeWidth="1" />;
          })}
          <line x1="8" y1="54" x2="92" y2="54" stroke="rgba(23, 21, 26, 0.12)" strokeWidth="1.5" />
          {points.length > 1 && <polyline points={linePoints} fill="none" stroke={purple} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
          {points.length === 1 && <line x1="22" y1={points[0].y} x2="78" y2={points[0].y} stroke={purple} strokeWidth="2.6" strokeLinecap="round" />}
          {points.map((point) => (
            <circle key={point.item.id} cx={point.x} cy={point.y} r="3.7" fill={darkText} stroke="#fff" strokeWidth="1.5">
              <title>{`${formatDemoDate(point.item.date)} · ${point.item.assessmentTitle || point.item.label || 'Assessment'} · ${getAssessmentPercentage(point.item)}%`}</title>
            </circle>
          ))}
          {!points.length && (
            <>
              <line x1="22" y1="35" x2="78" y2="35" stroke="rgba(23, 21, 26, 0.18)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="50" cy="35" r="3.5" fill="rgba(23, 21, 26, 0.22)" />
            </>
          )}
        </Box>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
          {sortedAssessments.length
            ? `${getAssessmentPercentage(sortedAssessments[0])}% to ${getAssessmentPercentage(sortedAssessments[sortedAssessments.length - 1])}%`
            : 'No assessment result yet'}
        </Typography>
      </Stack>
    </Paper>
  );
}

function EvidenceTypeTile({ observations, assessments }) {
  const total = observations + assessments;
  const assessmentShare = total ? Math.round((assessments / total) * 100) : 0;
  const observationShare = total ? 100 - assessmentShare : 0;

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: 126 }}>
      <Stack direction="row" spacing={1.1} alignItems="center" sx={{ height: '100%' }}>
        <Box
          title={total ? `${assessments} assessment, ${observations} observation` : 'No evidence yet'}
          sx={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            flexShrink: 0,
            bgcolor: total ? 'transparent' : 'rgba(23, 21, 26, 0.08)',
            background: total
              ? `conic-gradient(${purple} 0 ${assessmentShare}%, ${darkText} ${assessmentShare}% 100%)`
              : undefined,
            border: '6px solid #fff',
            boxShadow: '0 0 0 1px rgba(23, 21, 26, 0.1)',
            transition: 'transform 140ms ease',
            '&:hover': { transform: 'scale(1.04)' },
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>Evidence type</Typography>
          <Stack spacing={0.45} sx={{ mt: 0.75 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
              <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, bgcolor: purple, mr: 0.6 }} />
              Assessment · {assessmentShare}%
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
              <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, bgcolor: darkText, mr: 0.6 }} />
              Observation · {observationShare}%
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

function UnitEvidenceBarsTile({ summaries }) {
  const rows = [...summaries]
    .filter((summary) => summary.items.length)
    .sort((first, second) => second.items.length - first.items.length)
    .slice(0, 5);
  const maxItems = Math.max(...rows.map((summary) => summary.items.length), 1);

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: 126 }}>
      <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>Evidence by unit</Typography>
      <Stack spacing={0.7} sx={{ mt: 0.9 }}>
        {rows.map((summary) => {
          const width = Math.max((summary.items.length / maxItems) * 100, 12);
          return (
            <Box key={summary.unit.id} title={`${summary.unit.label || summary.unit.title} · ${summary.items.length} item${summary.items.length === 1 ? '' : 's'}`}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Typography noWrap sx={{ width: 92, color: 'text.secondary', fontSize: 11.7 }}>{summary.unit.label || summary.unit.title}</Typography>
                <Box sx={{ flex: 1, height: 7, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.08)', overflow: 'hidden' }}>
                  <Box sx={{ width: `${width}%`, height: '100%', bgcolor: purple }} />
                </Box>
              </Stack>
            </Box>
          );
        })}
        {!rows.length && <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>No unit evidence yet.</Typography>}
      </Stack>
    </Paper>
  );
}

function getStudentCountLabel(count) {
  return `${count} ${count === 1 ? 'student' : 'students'}`;
}

function sortGroupsForDisplay(groups) {
  return [...(groups || [])].sort((first, second) => (
    (first.order || 0) - (second.order || 0)
    || (first.createdAt || '').localeCompare(second.createdAt || '')
    || first.label.localeCompare(second.label)
  ));
}

function getStudentsInGroupOrder(group, students) {
  const studentById = new Map((students || []).map((student) => [student.id, student]));
  return (group?.studentIds || []).map((studentId) => studentById.get(studentId)).filter(Boolean);
}

function getUngroupedStudentsForType(students, groups, typeId) {
  const groupedStudentIds = new Set((groups || [])
    .filter((group) => group.typeId === typeId && group.status !== 'archived')
    .flatMap((group) => group.studentIds || []));

  return (students || []).filter((student) => !groupedStudentIds.has(student.id));
}

function buildAssessmentAlertByStudentId(assessmentResultsPayload) {
  const alertByStudentId = new Map();

  (assessmentResultsPayload?.assessments || []).forEach((assessment) => {
    (assessment.studentResults || []).forEach((result) => {
      if (!result?.studentId || (!result.absent && !result.warning)) {
        return;
      }

      const currentAlert = alertByStudentId.get(result.studentId) || {
        absentCount: 0,
        warningCount: 0,
        titles: new Set(),
      };

      if (result.absent) currentAlert.absentCount += 1;
      if (result.warning) currentAlert.warningCount += 1;
      currentAlert.titles.add(assessment.title);
      alertByStudentId.set(result.studentId, currentAlert);
    });
  });

  return alertByStudentId;
}

function getAssessmentAlertLabel(alert) {
  if (!alert) {
    return '';
  }

  const parts = [];
  if (alert.warningCount) parts.push(`${alert.warningCount} not passed`);
  if (alert.absentCount) parts.push(`${alert.absentCount} absent`);
  const titles = [...alert.titles].filter(Boolean).slice(0, 2).join(', ');

  return `Assessment alert: ${parts.join(', ')}${titles ? ` · ${titles}` : ''}`;
}

function getStudentUnitAssessmentKey(studentId, teachingUnitId) {
  return `${studentId}:${teachingUnitId}`;
}

function buildAssessmentIssueByStudentUnitKey(assessmentResultsPayload) {
  const issueByStudentUnitKey = new Map();

  (assessmentResultsPayload?.assessments || []).forEach((assessment) => {
    if (!assessment.teachingUnitId) {
      return;
    }

    (assessment.studentResults || []).forEach((result) => {
      if (!result?.studentId) {
        return;
      }

      const isIncomplete = Boolean(result.absent) || !String(result.rawResult || '').trim();
      const isNotPassed = Boolean(result.warning);

      if (!isIncomplete && !isNotPassed) {
        return;
      }

      const key = getStudentUnitAssessmentKey(result.studentId, assessment.teachingUnitId);
      const currentIssue = issueByStudentUnitKey.get(key) || {
        incompleteCount: 0,
        notPassedCount: 0,
        titles: new Set(),
      };

      if (isIncomplete) currentIssue.incompleteCount += 1;
      if (isNotPassed) currentIssue.notPassedCount += 1;
      currentIssue.titles.add(assessment.title);
      issueByStudentUnitKey.set(key, currentIssue);
    });
  });

  return issueByStudentUnitKey;
}

function getStudentUnitAssessmentIssueLabel(issue) {
  if (!issue) {
    return '';
  }

  const parts = [];
  if (issue.incompleteCount) parts.push(`${issue.incompleteCount} incomplete`);
  if (issue.notPassedCount) parts.push(`${issue.notPassedCount} not passed`);
  const titles = [...issue.titles].filter(Boolean).slice(0, 2).join(', ');

  return `Assessment issue: ${parts.join(', ')}${titles ? ` · ${titles}` : ''}`;
}

function EvidenceMap({
  students,
  teachingUnits,
  evidence,
  assessmentResultsPayload,
  learningObservations = [],
  cellNotes = {},
  unitNotes = {},
  rowNotes = {},
  onSaveCellNote,
  onSaveUnitNote,
  onSaveRowNote,
  onEditAssessmentResult,
  workingGroups,
  groupDefinitions,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveStudentToGroup,
  onMoveStudentToUngrouped,
  onResetGroups,
}) {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [expandedUnitId, setExpandedUnitId] = useState('');
  const [teacherWorkingJudgements, setTeacherWorkingJudgements] = useState({});
  const [activeGroupingSetId, setActiveGroupingSetId] = useState('none');
  const [collapsedGroupIds, setCollapsedGroupIds] = useState([]);
  const [draggedStudentId, setDraggedStudentId] = useState('');
  const [dragTargetId, setDragTargetId] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupDialogMode, setGroupDialogMode] = useState('create');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [moveAnnouncement, setMoveAnnouncement] = useState('');
  const [editingCellKey, setEditingCellKey] = useState('');
  const [draftCellNote, setDraftCellNote] = useState('');
  const [editingUnitId, setEditingUnitId] = useState('');
  const [draftUnitNote, setDraftUnitNote] = useState('');
  const [editingRowNoteStudentId, setEditingRowNoteStudentId] = useState('');
  const [draftRowNote, setDraftRowNote] = useState('');
  const [rowNotesVisible, setRowNotesVisible] = useState(true);
  const [unitInsightVersion, setUnitInsightVersion] = useState('v1');
  const [hoveredStudentId, setHoveredStudentId] = useState('');
  const [hoveredRowNoteStudentId, setHoveredRowNoteStudentId] = useState('');
  const activeGroupingSet = groupDefinitions.find((definition) => definition.id === activeGroupingSetId) || null;
  const activeGroups = useMemo(
    () => sortGroupsForDisplay((workingGroups || []).filter((group) => group.status !== 'archived' && group.typeId === activeGroupingSetId)),
    [activeGroupingSetId, workingGroups],
  );
  const groupedViewActive = activeGroupingSetId !== 'none';
  const notGroupedStudents = useMemo(
    () => (groupedViewActive ? getUngroupedStudentsForType(students, workingGroups, activeGroupingSetId) : []),
    [activeGroupingSetId, groupedViewActive, students, workingGroups],
  );
  const assessmentAlertByStudentId = useMemo(
    () => buildAssessmentAlertByStudentId(assessmentResultsPayload),
    [assessmentResultsPayload],
  );
  const assessmentIssueByStudentUnitKey = useMemo(
    () => buildAssessmentIssueByStudentUnitKey(assessmentResultsPayload),
    [assessmentResultsPayload],
  );
  const studentUnitEvidenceModel = useMemo(() => {
    const summariesByStudentId = new Map();
    let maxLessonCount = 1;

    students.forEach((student) => {
      const studentEvidence = getEvidenceForStudent(evidence, student.id);
      const summariesByUnitId = new Map();

      teachingUnits.forEach((unit) => {
        const summary = buildTeachingUnitEvidenceSummary(
          unit,
          studentEvidence,
          teacherWorkingJudgements[getJudgementKey(student.id, unit.id)] || null,
        );
        maxLessonCount = Math.max(maxLessonCount, summary.lessonCount);
        summariesByUnitId.set(unit.id, summary);
      });

      summariesByStudentId.set(student.id, summariesByUnitId);
    });

    return {
      maxLessonCount,
      summariesByStudentId,
    };
  }, [evidence, students, teacherWorkingJudgements, teachingUnits]);

  function toggleStudent(studentId, unitId = '') {
    if (expandedStudentId === studentId && expandedUnitId === unitId) {
      setExpandedStudentId(null);
      setExpandedUnitId('');
    } else {
      setExpandedStudentId(studentId);
      setExpandedUnitId(unitId);
    }
  }

  function saveTeacherWorkingJudgement(judgement) {
    const key = getJudgementKey(judgement.studentId, judgement.teachingUnitId);
    const now = new Date().toISOString();
    setTeacherWorkingJudgements((currentJudgements) => ({
      ...currentJudgements,
      [key]: {
        studentId: judgement.studentId,
        teachingUnitId: judgement.teachingUnitId,
        levelId: judgement.levelId,
        note: judgement.note || '',
        setBy: 'Anna',
        effectiveDate: new Date().toISOString().slice(0, 10),
        setAt: currentJudgements[key]?.setAt || now,
        updatedAt: now,
      },
    }));
  }

  function toggleGroup(groupId) {
    setCollapsedGroupIds((currentIds) => (
      currentIds.includes(groupId)
        ? currentIds.filter((id) => id !== groupId)
        : [...currentIds, groupId]
    ));
  }

  function openCreateGroupDialog() {
    setGroupDialogMode('create');
    setSelectedGroup(null);
    setGroupDialogOpen(true);
  }

  function openEditGroupDialog(group) {
    setGroupDialogMode('edit');
    setSelectedGroup(group);
    setGroupDialogOpen(true);
  }

  function handleCreateGroup(groupInput) {
    onCreateGroup({
      ...groupInput,
      typeId: groupedViewActive ? activeGroupingSetId : groupInput.typeId,
    });
  }

  function announceMove(studentId, groupLabel) {
    const student = students.find((item) => item.id === studentId);
    setMoveAnnouncement(`${student?.displayName || 'Student'} moved to ${groupLabel}.`);
  }

  function moveStudent(studentId, groupId, index) {
    if (!groupedViewActive) {
      return;
    }

    if (groupId) {
      const group = activeGroups.find((item) => item.id === groupId);
      onMoveStudentToGroup(groupId, studentId, index);
      announceMove(studentId, group?.label || 'focus');
    } else {
      onMoveStudentToUngrouped(activeGroupingSetId, studentId);
      announceMove(studentId, 'Unassigned');
    }
  }

  function handleDragStart(event, studentId) {
    setDraggedStudentId(studentId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', studentId);
    event.stopPropagation();
  }

  function handleDrop(event, groupId, index) {
    event.preventDefault();
    const studentId = event.dataTransfer.getData('text/plain') || draggedStudentId;
    if (studentId) {
      moveStudent(studentId, groupId, index);
    }
    setDraggedStudentId('');
    setDragTargetId('');
  }

  function allowDrop(event, targetId) {
    event.preventDefault();
    setDragTargetId(targetId);
  }

  function endDrag() {
    setDraggedStudentId('');
    setDragTargetId('');
  }

  function startEditingCell(studentId, unitId) {
    const key = getStudentUnitCellNoteKey(studentId, unitId);
    setEditingCellKey(key);
    setDraftCellNote(cellNotes[key] || unitNotes[unitId] || '');
  }

  function saveEditingCell() {
    if (!editingCellKey) {
      return;
    }

    const [studentId, unitId] = editingCellKey.split(':');
    onSaveCellNote?.(studentId, unitId, draftCellNote);
    setEditingCellKey('');
    setDraftCellNote('');
  }

  function cancelEditingCell() {
    setEditingCellKey('');
    setDraftCellNote('');
  }

  function startEditingUnit(unitId) {
    setEditingUnitId(unitId);
    setDraftUnitNote(unitNotes[unitId] || '');
  }

  function saveEditingUnit() {
    if (!editingUnitId) {
      return;
    }

    onSaveUnitNote?.(editingUnitId, draftUnitNote);
    setEditingUnitId('');
    setDraftUnitNote('');
  }

  function cancelEditingUnit() {
    setEditingUnitId('');
    setDraftUnitNote('');
  }

  function startEditingRowNote(studentId) {
    setEditingRowNoteStudentId(studentId);
    setDraftRowNote(rowNotes[studentId] || '');
  }

  function saveEditingRowNote() {
    if (!editingRowNoteStudentId) {
      return;
    }

    onSaveRowNote?.(editingRowNoteStudentId, draftRowNote);
    setEditingRowNoteStudentId('');
    setDraftRowNote('');
  }

  function cancelEditingRowNote() {
    setEditingRowNoteStudentId('');
    setDraftRowNote('');
  }

  function renderStudentRow(student, groupId = '', rowIndex) {
    const isExpanded = expandedStudentId === student.id;
    const isHovered = hoveredStudentId === student.id;
    const isRowNoteHovered = hoveredRowNoteStudentId === student.id;
    const rowNote = rowNotes[student.id] || '';
    const isEditingRowNote = editingRowNoteStudentId === student.id;
    const assessmentAlert = assessmentAlertByStudentId.get(student.id);
    const assessmentAlertLabel = getAssessmentAlertLabel(assessmentAlert);
    const assessmentAlertColor = assessmentAlert?.absentCount ? absentOrange : purple;
    const summariesByUnitId = studentUnitEvidenceModel.summariesByStudentId.get(student.id) || new Map();
    const expandedUnit = expandedUnitId ? teachingUnits.find((unit) => unit.id === expandedUnitId) : null;
    const expandedUnitSummary = expandedUnitId
      ? summariesByUnitId.get(expandedUnitId) || (expandedUnit ? buildTeachingUnitEvidenceSummary(expandedUnit, [], null) : null)
      : null;
    const studentLearningObservations = sortEvidenceByDate(
      learningObservations.filter((observation) => observation.studentId === student.id),
      'desc',
    );

    return (
      <Box key={`${groupId || 'flat'}-${student.id}`} role="rowgroup" sx={{ display: 'contents' }}>
        <Box
          role="row"
          onMouseEnter={() => setHoveredStudentId(student.id)}
          onMouseLeave={() => setHoveredStudentId('')}
          onDragOver={groupedViewActive ? (event) => allowDrop(event, `${groupId || 'not-grouped'}-${student.id}`) : undefined}
          onDrop={groupedViewActive ? (event) => handleDrop(event, groupId, rowIndex) : undefined}
          sx={{ display: 'contents' }}
        >
          <Box
            role="rowheader"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.45,
              p: 1,
              borderTop: isHovered ? `1px solid rgba(156, 40, 175, 0.34)` : '1px solid rgba(23, 21, 26, 0.08)',
              borderBottom: isHovered ? `1px solid rgba(156, 40, 175, 0.22)` : '1px solid transparent',
              bgcolor: draggedStudentId === student.id ? 'rgba(156, 40, 175, 0.08)' : isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
              minWidth: 0,
              transition: 'background-color 140ms ease, border-color 140ms ease',
            }}
          >
            {groupedViewActive && (
              <ButtonBase
                draggable
                onDragStart={(event) => handleDragStart(event, student.id)}
                onDragEnd={endDrag}
                onClick={(event) => event.stopPropagation()}
                aria-label={`Move ${student.displayName}`}
                sx={{
                  width: 24,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: '8px',
                  color: 'text.secondary',
                  cursor: 'grab',
                  '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
                }}
              >
                <DragIndicatorIcon sx={{ fontSize: 17 }} />
              </ButtonBase>
            )}
            <ButtonBase
              onClick={() => toggleStudent(student.id, '')}
              aria-expanded={isExpanded}
              aria-controls={`student-insight-${student.id}`}
              sx={{
                flex: '1 1 auto',
                minWidth: 0,
                justifyContent: 'flex-start',
                gap: 0.45,
                textAlign: 'left',
                borderRadius: '8px',
                '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
              }}
            >
              <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms ease' }} />
              <Typography sx={{ color: darkText, fontSize: isExpanded ? 18 : 13, fontWeight: isExpanded ? 920 : 820, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'font-size 140ms ease, font-weight 140ms ease' }}>{student.displayName}</Typography>
            </ButtonBase>
          </Box>
          <Box
            role="cell"
            aria-label={assessmentAlertLabel || `${student.displayName} assessment status`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              p: 0.45,
              minWidth: 0,
              borderTop: isHovered ? `1px solid rgba(156, 40, 175, 0.34)` : '1px solid rgba(23, 21, 26, 0.08)',
              borderBottom: isHovered ? `1px solid rgba(156, 40, 175, 0.22)` : '1px solid transparent',
              bgcolor: draggedStudentId === student.id ? 'rgba(156, 40, 175, 0.08)' : isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
              transition: 'background-color 140ms ease, border-color 140ms ease',
            }}
          >
            {assessmentAlert && (
              <Tooltip title={assessmentAlertLabel} arrow>
                {assessmentAlert.absentCount ? (
                  <PersonOffOutlinedIcon
                    aria-label={assessmentAlertLabel}
                    sx={{
                      color: assessmentAlertColor,
                      fontSize: isExpanded ? 18 : 15,
                      flexShrink: 0,
                      opacity: 0.88,
                    }}
                  />
                ) : (
                  <ErrorOutlineIcon
                    aria-label={assessmentAlertLabel}
                    sx={{
                      color: assessmentAlertColor,
                      fontSize: isExpanded ? 18 : 15,
                      flexShrink: 0,
                      opacity: 0.88,
                    }}
                  />
                )}
              </Tooltip>
            )}
          </Box>
          <Box
            role="cell"
            aria-label={rowNotesVisible ? `${student.displayName} quick note${rowNote ? `: ${rowNote}` : ''}` : `${student.displayName} quick note hidden`}
            onClick={rowNotesVisible ? () => startEditingRowNote(student.id) : undefined}
            onMouseEnter={() => setHoveredRowNoteStudentId(student.id)}
            onMouseLeave={() => setHoveredRowNoteStudentId('')}
            sx={{
              p: 0.85,
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              borderTop: isHovered ? `1px solid rgba(156, 40, 175, 0.34)` : '1px solid rgba(23, 21, 26, 0.08)',
              borderBottom: isHovered ? `1px solid rgba(156, 40, 175, 0.22)` : '1px solid transparent',
              bgcolor: draggedStudentId === student.id ? 'rgba(156, 40, 175, 0.08)' : isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
              cursor: rowNotesVisible ? 'pointer' : 'default',
              transition: 'background-color 140ms ease, border-color 140ms ease',
            }}
          >
            {rowNotesVisible && isEditingRowNote ? (
              <Box
                component="input"
                autoFocus
                aria-label={`Quick note for ${student.displayName}`}
                value={draftRowNote}
                maxLength={60}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setDraftRowNote(event.target.value.replace(/\s+/g, ' '))}
                onBlur={saveEditingRowNote}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    saveEditingRowNote();
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    cancelEditingRowNote();
                  }
                }}
                sx={{
                  width: '100%',
                  height: 30,
                  px: 0.65,
                  border: `1px solid ${purple}`,
                  borderRadius: '8px',
                  color: darkText,
                  bgcolor: '#fff',
                  font: 'inherit',
                  fontSize: 12.5,
                  fontWeight: 760,
                  outline: 'none',
                }}
              />
            ) : rowNotesVisible ? (
              <Box
                sx={{
                  width: '100%',
                  minHeight: 28,
                  px: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '8px',
                  bgcolor: isRowNoteHovered ? 'rgba(156, 40, 175, 0.075)' : 'transparent',
                  transition: 'background-color 140ms ease',
                }}
              >
                <Typography sx={{ color: rowNote ? 'rgba(23, 21, 26, 0.58)' : 'rgba(23, 21, 26, 0.28)', fontSize: 12.2, fontWeight: rowNote ? 720 : 640, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {rowNote || ''}
                </Typography>
              </Box>
            ) : null}
          </Box>
          {teachingUnits.map((unit) => {
            const noteKey = getStudentUnitCellNoteKey(student.id, unit.id);
            const savedNote = cellNotes[noteKey] || unitNotes[unit.id] || '';
            const isEditingCell = editingCellKey === noteKey;
            const assessmentIssue = assessmentIssueByStudentUnitKey.get(getStudentUnitAssessmentKey(student.id, unit.id));
            const assessmentIssueLabel = getStudentUnitAssessmentIssueLabel(assessmentIssue);
            const summary = summariesByUnitId.get(unit.id) || buildTeachingUnitEvidenceSummary(unit, [], null);
            const repeatedCount = getRepeatedSequenceGroups(summary).length;
            const visualDetail = summary.items.length
              ? `${summary.lessonCount} lesson${summary.lessonCount === 1 ? '' : 's'} with evidence, ${summary.assessments.length} assessment${summary.assessments.length === 1 ? '' : 's'}, ${summary.observedCapturePointCount} of ${summary.capturePoints.length} observation focuses seen${repeatedCount ? `, ${repeatedCount} repeated observation focus${repeatedCount === 1 ? '' : 'es'}` : ''}${summary.judgement?.levelId ? ', Anna judgement added' : ''}`
              : 'No evidence recorded';
            const cellDetail = savedNote
              ? `Manual note ${savedNote}${assessmentIssue ? `. ${assessmentIssueLabel}` : ''}`
              : `${visualDetail}${assessmentIssue ? `. ${assessmentIssueLabel}` : ''}`;
            return (
              <Box
                key={`${student.id}-${unit.id}`}
                role="cell"
                title={assessmentIssueLabel || undefined}
                aria-label={`${student.displayName}, ${unit.title || unit.label}: ${cellDetail}`}
                onClick={() => startEditingCell(student.id, unit.id)}
                sx={{
                  p: 1,
                  borderTop: isHovered ? `1px solid rgba(156, 40, 175, 0.34)` : '1px solid rgba(23, 21, 26, 0.08)',
                  borderBottom: isHovered ? `1px solid rgba(156, 40, 175, 0.22)` : '1px solid transparent',
                  borderLeft: '1px solid rgba(23, 21, 26, 0.055)',
                  textAlign: 'left',
                  position: 'relative',
                  outline: assessmentIssue ? `1.5px dashed ${assessmentRed}` : 'none',
                  outlineOffset: assessmentIssue ? '-4px' : 0,
                  bgcolor: draggedStudentId === student.id ? 'rgba(156, 40, 175, 0.08)' : isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
                  cursor: 'pointer',
                  transition: 'background-color 140ms ease, border-color 140ms ease, outline-color 140ms ease',
                  '&:hover .StudentUnitExpandButton, &:focus-within .StudentUnitExpandButton': {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                    pointerEvents: 'auto',
                    transitionDelay: '650ms',
                  },
                }}
              >
                {!isEditingCell && (
                  <IconButton
                    className="StudentUnitExpandButton"
                    aria-label={isExpanded && expandedUnitId === unit.id ? `Hide ${unit.title || unit.label} view for ${student.displayName}` : `Open ${unit.title || unit.label} view for ${student.displayName}`}
                    aria-expanded={isExpanded && expandedUnitId === unit.id}
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleStudent(student.id, unit.id);
                      event.currentTarget.blur();
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      zIndex: 1,
                      width: 22,
                      height: 22,
                      opacity: 0,
                      pointerEvents: 'none',
                      transform: 'translateY(1px) scale(0.96)',
                      transition: 'opacity 140ms ease, transform 140ms ease, background-color 140ms ease, color 140ms ease',
                      transitionDelay: '0ms',
                      color: purple,
                      bgcolor: '#fff',
                      border: '1px solid rgba(156, 40, 175, 0.18)',
                      boxShadow: '0 4px 10px rgba(23, 21, 26, 0.08)',
                      '&:hover': {
                        bgcolor: purple,
                        color: '#fff',
                      },
                      '&:focus-visible': {
                        opacity: 1,
                        pointerEvents: 'auto',
                        outline: `2px solid ${purple}`,
                        outlineOffset: 1,
                      },
                    }}
                  >
                    <OpenInFullIcon sx={{ fontSize: 12.5 }} />
                  </IconButton>
                )}
                {isEditingCell ? (
                  <Box
                    component="input"
                    autoFocus
                    aria-label={`One word note for ${student.displayName}, ${unit.title || unit.label}`}
                    value={draftCellNote}
                    maxLength={16}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setDraftCellNote(event.target.value.replace(/\s+/g, ' '))}
                    onBlur={saveEditingCell}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        saveEditingCell();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelEditingCell();
                      }
                    }}
                    sx={{
                      width: '100%',
                      height: 33,
                      px: 0.55,
                      border: `1px solid ${purple}`,
                      borderRadius: '8px',
                      color: darkText,
                      bgcolor: '#fff',
                      font: 'inherit',
                      fontSize: 13,
                      fontWeight: 860,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                ) : savedNote ? (
                  <Box sx={{ minHeight: 33, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: purple, fontSize: 13.4, fontWeight: 900, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {savedNote}
                    </Typography>
                  </Box>
                ) : (
                  <StudentUnitEvidenceCell summary={summary} maxLessonCount={studentUnitEvidenceModel.maxLessonCount} />
                )}
              </Box>
            );
          })}
        </Box>
        {isExpanded && (
          <Box role="row" sx={{ display: 'contents' }}>
            <Box role="cell" sx={{ gridColumn: `1 / span ${teachingUnits.length + 3}`, minWidth: 0 }}>
              {expandedUnitId && expandedUnitSummary && unitInsightVersion === 'v2' ? (
                <StudentUnitInsightPanelV2
                  key={`${student.id}-${expandedUnitId}-v2`}
                  student={student}
                  summary={expandedUnitSummary}
                  onEditAssessment={onEditAssessmentResult}
                />
              ) : expandedUnitId && expandedUnitSummary ? (
                <StudentUnitInsightPanelV1
                  key={`${student.id}-${expandedUnitId}-v1`}
                  student={student}
                  summary={expandedUnitSummary}
                  assessmentResultsPayload={assessmentResultsPayload}
                  onEditAssessment={onEditAssessmentResult}
                />
              ) : unitInsightVersion === 'v2' ? (
                <StudentGlobalInsightPanelV2
                  key={`${student.id}-global-v2`}
                  student={student}
                  evidence={evidence}
                  rowNote={rowNote}
                  learningObservations={studentLearningObservations}
                />
              ) : (
                <StudentGlobalInsightPanelV1
                  key={`${student.id}-global-v1`}
                  student={student}
                  evidence={evidence}
                  rowNote={rowNote}
                  learningObservations={studentLearningObservations}
                />
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  function renderGroupSection(group) {
    const groupStudents = getStudentsInGroupOrder(group, students);
    const isCollapsed = collapsedGroupIds.includes(group.id);
    const isDragTarget = dragTargetId === group.id;

    return (
      <Box key={group.id} role="rowgroup" sx={{ display: 'contents' }}>
        <Box
          role="row"
          onDragOver={(event) => allowDrop(event, group.id)}
          onDrop={(event) => handleDrop(event, group.id)}
          sx={{ display: 'contents' }}
        >
          <Box
            role="cell"
            onDoubleClick={(event) => {
              event.stopPropagation();
              openEditGroupDialog(group);
            }}
            aria-label={`${group.label}. Double click to edit focus.`}
            sx={{
              gridColumn: `1 / span ${teachingUnits.length + 3}`,
              p: 0.85,
              borderTop: '1px solid rgba(23, 21, 26, 0.12)',
              bgcolor: isDragTarget ? 'rgba(156, 40, 175, 0.12)' : '#fff',
              cursor: 'default',
            }}
          >
            <ButtonBase
              onClick={() => toggleGroup(group.id)}
              onDoubleClick={(event) => {
                event.stopPropagation();
                openEditGroupDialog(group);
              }}
              aria-expanded={!isCollapsed}
              sx={{ minWidth: 0, gap: 0.55, borderRadius: '8px', textAlign: 'left', '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 } }}
            >
              <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }} />
              <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860 }}>
                {group.label}
              </Typography>
            </ButtonBase>
          </Box>
        </Box>
        {!isCollapsed && groupStudents.map((student, index) => renderStudentRow(student, group.id, index))}
      </Box>
    );
  }

  function renderNotGroupedSection() {
    const isCollapsed = collapsedGroupIds.includes('not-grouped');
    const isDragTarget = dragTargetId === 'not-grouped';

    return (
      <Box key="not-grouped" role="rowgroup" sx={{ display: 'contents' }}>
        <Box
          role="row"
          onDragOver={(event) => allowDrop(event, 'not-grouped')}
          onDrop={(event) => handleDrop(event, '')}
          sx={{ display: 'contents' }}
        >
          <Tooltip
            arrow
            enterDelay={2000}
            enterNextDelay={2000}
            title={(
              <Box sx={{ px: 0.25, py: 0.15 }}>
                <Typography sx={{ color: '#fff', fontSize: 12.4, fontWeight: 820, lineHeight: 1.35 }}>
                  Double click to create a focus
                </Typography>
              </Box>
            )}
          >
            <Box
              role="cell"
              onDoubleClick={(event) => {
                event.stopPropagation();
                openCreateGroupDialog();
              }}
              aria-label="Unassigned students. Double click to create a focus."
              sx={{
                gridColumn: `1 / span ${teachingUnits.length + 3}`,
                p: 0.85,
                borderTop: '1px solid rgba(23, 21, 26, 0.12)',
                bgcolor: isDragTarget ? 'rgba(156, 40, 175, 0.12)' : '#fff',
                cursor: 'default',
              }}
            >
              <ButtonBase
                onClick={() => toggleGroup('not-grouped')}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  openCreateGroupDialog();
                }}
                aria-expanded={!isCollapsed}
                sx={{ gap: 0.55, borderRadius: '8px', textAlign: 'left', '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 } }}
              >
                <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }} />
                <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860 }}>
                  Unassigned
                </Typography>
              </ButtonBase>
            </Box>
          </Tooltip>
        </Box>
        {!isCollapsed && notGroupedStudents.map((student, index) => renderStudentRow(student, '', index))}
      </Box>
    );
  }

  return (
    <Panel sx={{ p: 0, border: 'none', borderRadius: 0, bgcolor: 'transparent' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'auto' }, gap: 1.2, alignItems: 'start', justifyContent: 'end', mb: 1 }}>
        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ justifySelf: { xs: 'stretch', lg: 'end' }, alignSelf: 'start' }}>
          <ButtonGroup
            variant="outlined"
            size="small"
            aria-label="Unit insight version"
            sx={{
              borderRadius: '999px',
              overflow: 'hidden',
              '& .MuiButtonGroup-grouped': {
                borderColor: 'rgba(23, 21, 26, 0.12)',
                color: 'text.secondary',
                textTransform: 'none',
                fontSize: 12.2,
                fontWeight: 780,
                minWidth: 34,
                px: 0.9,
                '&:hover': {
                  borderColor: 'rgba(156, 40, 175, 0.34)',
                  bgcolor: 'rgba(156, 40, 175, 0.04)',
                },
              },
            }}
          >
            {['v1', 'v2'].map((version) => {
              const isSelected = unitInsightVersion === version;

              return (
                <Button
                  key={version}
                  onClick={() => setUnitInsightVersion(version)}
                  aria-pressed={isSelected}
                  sx={{
                    color: isSelected ? purple : 'text.secondary',
                    bgcolor: isSelected ? 'rgba(156, 40, 175, 0.06)' : '#fff',
                    borderColor: isSelected ? 'rgba(156, 40, 175, 0.34)' : 'rgba(23, 21, 26, 0.12)',
                    '&:hover': {
                      bgcolor: isSelected ? 'rgba(156, 40, 175, 0.08)' : 'rgba(156, 40, 175, 0.04)',
                    },
                  }}
                >
                  {version.toUpperCase()}
                </Button>
              );
            })}
          </ButtonGroup>
          <Select
            value={activeGroupingSetId}
            onChange={(event) => {
              setActiveGroupingSetId(event.target.value);
              setCollapsedGroupIds([]);
            }}
            size="small"
            inputProps={{ 'aria-label': 'Focus' }}
            sx={{
              minWidth: { xs: 180, sm: 220 },
              borderRadius: '999px',
              color: groupedViewActive ? purple : 'text.secondary',
              fontSize: 13,
              fontWeight: 760,
              '& .MuiSelect-select': {
                py: 0.75,
                pl: 1.8,
                pr: 4,
              },
              '& fieldset': {
                borderColor: groupedViewActive ? 'rgba(156, 40, 175, 0.28)' : 'rgba(23, 21, 26, 0.12)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(156, 40, 175, 0.28) !important',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(156, 40, 175, 0.38) !important',
              },
            }}
          >
            <MenuItem value="none">Class list</MenuItem>
            {groupDefinitions.map((definition) => (
              <MenuItem key={definition.id} value={definition.id}>{definition.label}</MenuItem>
            ))}
          </Select>
          <Tooltip title="Reset focus">
            <IconButton aria-label="Reset focus to the seeded Maths 7A view" onClick={onResetGroups} size="small" sx={{ color: 'text.secondary' }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box aria-live="polite" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {moveAnnouncement}
      </Box>
      <Box sx={{ overflowX: { xs: 'auto', lg: 'visible' }, pb: 0.5 }}>
        <Box
          role="table"
          aria-label={groupedViewActive ? `Maths 7A evidence map focused by ${activeGroupingSet?.label}` : 'Maths 7A evidence map'}
          sx={{
            minWidth: { xs: 760, lg: 0 },
            display: 'grid',
            gridTemplateColumns: `minmax(105px, max-content) 164px minmax(90px, 1fr) repeat(${teachingUnits.length}, 100px)`,
            border: '1px solid rgba(23, 21, 26, 0.12)',
            borderRadius: '14px',
            overflow: 'hidden',
            bgcolor: '#fff',
          }}
        >
          <Box role="columnheader" sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid rgba(23, 21, 26, 0.12)' }} />
          <Box role="columnheader" aria-label="Assessment alerts" sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid rgba(23, 21, 26, 0.12)' }} />
          <Box
            role="columnheader"
            aria-label="Quick notes"
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.45,
              justifyContent: 'flex-start',
              bgcolor: '#fff',
              borderBottom: '1px solid rgba(23, 21, 26, 0.12)',
            }}
          >
            <IconButton
              aria-label={rowNotesVisible ? 'Hide quick notes' : 'Show quick notes'}
              aria-pressed={!rowNotesVisible}
              size="small"
              onClick={() => {
                setRowNotesVisible((currentValue) => !currentValue);
                cancelEditingRowNote();
              }}
              sx={{
                width: 28,
                height: 28,
                color: rowNotesVisible ? 'rgba(156, 40, 175, 0.52)' : 'rgba(23, 21, 26, 0.3)',
                bgcolor: 'transparent',
                border: '1px solid transparent',
                '&:hover, &:focus-visible': {
                  bgcolor: rowNotesVisible ? 'rgba(156, 40, 175, 0.09)' : 'rgba(23, 21, 26, 0.07)',
                  borderColor: rowNotesVisible ? 'rgba(156, 40, 175, 0.12)' : 'rgba(23, 21, 26, 0.08)',
                },
              }}
            >
              <NotesIcon sx={{ fontSize: 16, opacity: rowNotesVisible ? 1 : 0.48 }} />
            </IconButton>
            {!rowNotesVisible && (
              <Typography sx={{ color: 'rgba(23, 21, 26, 0.3)', fontSize: 11.5, fontWeight: 760, lineHeight: 1 }}>
                Hidden
              </Typography>
            )}
          </Box>
          {teachingUnits.map((unit) => {
            const isEditingUnit = editingUnitId === unit.id;

            return (
              <Box
                key={unit.id}
                role="columnheader"
                aria-label={unit.title || unit.label}
                onClick={() => startEditingUnit(unit.id)}
                sx={{
                  p: 1,
                  bgcolor: '#fff',
                  color: darkText,
                  borderBottom: '1px solid rgba(23, 21, 26, 0.12)',
                  borderLeft: '1px solid rgba(23, 21, 26, 0.055)',
                  cursor: 'pointer',
                  minWidth: 0,
                }}
              >
                {isEditingUnit ? (
                  <Box
                    component="input"
                    autoFocus
                    aria-label={`One word note for ${unit.title || unit.label}`}
                    value={draftUnitNote}
                    maxLength={16}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setDraftUnitNote(event.target.value.replace(/\s+/g, ' '))}
                    onBlur={saveEditingUnit}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        saveEditingUnit();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelEditingUnit();
                      }
                    }}
                    sx={{
                      width: '100%',
                      height: 30,
                      px: 0.55,
                      border: `1px solid ${purple}`,
                      borderRadius: '8px',
                      color: darkText,
                      bgcolor: '#fff',
                      font: 'inherit',
                      fontSize: 12.4,
                      fontWeight: 860,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <Typography sx={{ color: darkText, fontSize: 12.5, fontWeight: 820, lineHeight: 1.2 }}>
                    {unit.title || unit.label}
                  </Typography>
                )}
              </Box>
            );
          })}
          {groupedViewActive
            ? (
              <>
                {activeGroups.map(renderGroupSection)}
                {renderNotGroupedSection()}
              </>
            )
            : students.map((student, index) => renderStudentRow(student, '', index))}
        </Box>
      </Box>
      <QuietStatement />
      <GroupDialog
        open={groupDialogOpen}
        mode={groupDialogMode}
        group={selectedGroup}
        students={students}
        groupDefinitions={groupDefinitions}
        initialTypeId={groupedViewActive ? activeGroupingSetId : ''}
        onClose={() => setGroupDialogOpen(false)}
        onCreateGroup={handleCreateGroup}
        onUpdateGroup={onUpdateGroup}
        onDeleteGroup={onDeleteGroup}
        onAddStudent={onMoveStudentToGroup}
        onRemoveStudent={(groupId, studentId) => {
          const group = activeGroups.find((item) => item.id === groupId);
          onMoveStudentToUngrouped(group?.typeId || activeGroupingSetId, studentId);
        }}
      />
    </Panel>
  );
}

function SelectedStudentPicture({ summary, evidence, tasks, onOpenDetail, onCapture }) {
  const historicalResult = readHistoricalResult(summary.student);

  return (
    <Panel title={summary.student.displayName}>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{summary.summary}</Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
        Earlier reference · Year 6 final grade: <Box component="span" sx={{ color: darkText, fontWeight: 850 }}>{historicalResult?.grade || 'Not shown'}</Box>
      </Typography>
      {summary.averageAssessment !== null && (
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
          Average of saved assessment anchors: <Box component="span" sx={{ color: darkText, fontWeight: 850 }}>{summary.averageAssessment}%</Box>
        </Typography>
      )}
      {!!summary.topics.length && (
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>Topics with information: {summary.topics.map(getTopicLabel).join(' · ')}</Typography>
      )}
      <Divider />
      <Stack spacing={1}>
        {evidence.slice(0, 4).map((item) => <EvidenceCard key={item.id} item={item} />)}
        {!evidence.length && <Typography sx={{ color: 'text.secondary' }}>No saved information for this student yet.</Typography>}
      </Stack>
      {!!tasks.length && (
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.5 }}>Linked follow-up: {tasks.map((task) => task.title).join(' · ')}</Typography>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" onClick={onOpenDetail} sx={{ color: darkText, borderColor: 'rgba(23, 21, 26, 0.16)' }}>View recent evidence</Button>
        <Button variant="text" onClick={onCapture} sx={{ color: purple }}>Capture something</Button>
      </Stack>
    </Panel>
  );
}

function ClassPictureStudents({
  studentSummaries,
  teachingUnits,
  evidence,
  assessmentResultsPayload,
  learningObservations,
  cellNotes,
  unitNotes,
  rowNotes,
  onSaveCellNote,
  onSaveUnitNote,
  onSaveRowNote,
  onEditAssessmentResult,
  workingGroups,
  groupDefinitions,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveStudentToGroup,
  onMoveStudentToUngrouped,
  onResetGroups,
}) {
  return (
    <Stack spacing={2.25} sx={{ minWidth: 0 }}>
      <EvidenceMap
        students={studentSummaries.map((summary) => summary.student)}
        teachingUnits={teachingUnits}
        evidence={evidence}
        assessmentResultsPayload={assessmentResultsPayload}
        learningObservations={learningObservations}
        cellNotes={cellNotes}
        unitNotes={unitNotes}
        rowNotes={rowNotes}
        onSaveCellNote={onSaveCellNote}
        onSaveUnitNote={onSaveUnitNote}
        onSaveRowNote={onSaveRowNote}
        onEditAssessmentResult={onEditAssessmentResult}
        workingGroups={workingGroups}
        groupDefinitions={groupDefinitions}
        onCreateGroup={onCreateGroup}
        onUpdateGroup={onUpdateGroup}
        onDeleteGroup={onDeleteGroup}
        onMoveStudentToGroup={onMoveStudentToGroup}
        onMoveStudentToUngrouped={onMoveStudentToUngrouped}
        onResetGroups={onResetGroups}
      />
    </Stack>
  );
}

export default function Maths7AModule({ onBackToWeek, onClose }) {
  const [activeMode, setActiveMode] = useState('class-picture');
  const [nowCaptureVersion, setNowCaptureVersion] = useState('original');
  const [selectedStudentId, setSelectedStudentId] = useState(defaultNowStudentId);
  const [localEvidencePayload, setLocalEvidencePayload] = useState(() => readMaths7ALocalEvidence());
  const [localAssessmentResultsPayload, setLocalAssessmentResultsPayload] = useState(() => readMaths7AAssessmentResults());
  const [localLearningObservationPayload, setLocalLearningObservationPayload] = useState(() => readMaths7ALocalLearningObservations());
  const [assessmentResultsEditModal, setAssessmentResultsEditModal] = useState({
    open: false,
    storedAssessment: null,
  });
  const [cellNotes, setCellNotes] = useState(() => readMaths7ACellNotes());
  const [unitNotes, setUnitNotes] = useState(() => readMaths7AUnitNotes());
  const [rowNotes, setRowNotes] = useState(() => readMaths7ARowNotes());
  const [activeLessonIndex, setActiveLessonIndex] = useState(() => readMaths7ALessonIndex());
  const [lessonAnnouncement, setLessonAnnouncement] = useState('');
  const [studentPictureOpen, setStudentPictureOpen] = useState(false);
  const [studentProfileOpen, setStudentProfileOpen] = useState(false);
  const [profileStudentId, setProfileStudentId] = useState(maths7AStudents[0]?.id || '');
  const {
    groups: workingGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    moveStudentToGroup,
    moveStudentToUngrouped,
    resetGroups,
  } = useClassWorkingGroups({
    subjectId: 'mathematics',
    classId: '7a',
  });
  const {
    blocks: planningBlocks,
    createBlock: createPlanningBlock,
    updateBlock: updatePlanningBlock,
    deleteBlock: deletePlanningBlock,
    duplicateBlock: duplicatePlanningBlock,
    resetPlanning,
  } = useSubjectPlanning({
    subjectId: 'mathematics',
    classId: '7a',
    initialBlocks: maths7APlanningBlocks,
  });
  const {
    notes: planningCurriculumNotes,
    setAreaNote: setPlanningCurriculumNote,
    resetNotes: resetPlanningCurriculumNotes,
  } = usePlanningCurriculumNotes({
    subjectId: 'mathematics',
    classId: '7a',
    initialNotes: [],
  });
  const capturePanelRef = useRef(null);
  const demoLessons = useMemo(() => buildMaths7ADemoLessonSequence(), []);
  const activeLesson = demoLessons[activeLessonIndex] || demoLessons[0];
  const canAdvanceLesson = activeLessonIndex < demoLessons.length - 1;
  const assessmentResultEvidence = useMemo(
    () => getMaths7AAssessmentResultsAsEvidence(localAssessmentResultsPayload, { visibleDate: activeLesson.date }),
    [activeLesson.date, localAssessmentResultsPayload],
  );
  const allEvidence = useMemo(
    () => getMergedMathsEvidence([...maths7AEvidence, ...assessmentResultEvidence], localEvidencePayload),
    [assessmentResultEvidence, localEvidencePayload],
  );
  const visibleEvidence = useMemo(() => allEvidence.filter((item) => item.date <= activeLesson.date), [activeLesson.date, allEvidence]);
  const allLearningObservations = useMemo(
    () => getMergedMaths7ALearningObservations(maths7ALearningObservations, localLearningObservationPayload),
    [localLearningObservationPayload],
  );
  const visibleLearningObservations = useMemo(
    () => allLearningObservations.filter((observation) => observation.date <= activeLesson.date),
    [activeLesson.date, allLearningObservations],
  );
  const selectedStudent = maths7AStudents.find((student) => student.id === selectedStudentId) || maths7AStudents[0];
  const selectedEvidence = getEvidenceForStudent(visibleEvidence, selectedStudent.id);
  const linkedTasks = findLinkedTasks(annaTasks, selectedStudent);
  const profileStudent = maths7AStudents.find((student) => student.id === profileStudentId) || null;
  const profileEvidence = profileStudent ? getEvidenceForStudent(visibleEvidence, profileStudent.id) : [];
  const profileTasks = profileStudent ? findLinkedTasks(annaTasks, profileStudent) : [];
  const profileGroups = profileStudent ? getGroupsForStudent(workingGroups, profileStudent.id) : [];
  const profileSummary = profileStudent ? getStudentPictureSummary(profileStudent, visibleEvidence) : null;
  const profileDataSections = profileStudent ? buildMathsStudentProfileSections({
    student: profileStudent,
    evidence: profileEvidence,
    tasks: profileTasks,
  }) : [];
  const studentSummaries = useMemo(
    () => maths7AStudents.map((student) => getStudentPictureSummary(student, visibleEvidence)),
    [visibleEvidence],
  );
  const normalizedPlanningBlocks = useMemo(
    () => planningBlocks.map(normalizeMathsPlanningBlock),
    [planningBlocks],
  );
  const evidenceMapTeachingUnits = useMemo(() => {
    const firstPlanIndexByUnitId = new Map();
    normalizedPlanningBlocks.forEach((block, index) => {
      const unit = getTeachingUnitForPlanningBlock(block);
      if (unit && !firstPlanIndexByUnitId.has(unit.id)) {
        firstPlanIndexByUnitId.set(unit.id, index);
      }
    });

    return mathsTeachingUnits
      .filter((unit) => unit.blockType === 'teaching' && unit.curriculumAreaIds.length)
      .sort((first, second) => {
        const firstIndex = firstPlanIndexByUnitId.has(first.id) ? firstPlanIndexByUnitId.get(first.id) : 1000 + first.order;
        const secondIndex = firstPlanIndexByUnitId.has(second.id) ? firstPlanIndexByUnitId.get(second.id) : 1000 + second.order;
        return firstIndex - secondIndex;
      });
  }, [normalizedPlanningBlocks]);
  const currentPlanningBlock = useMemo(
    () => normalizedPlanningBlocks.find((block) => block.status === 'current') || normalizedPlanningBlocks[0] || null,
    [normalizedPlanningBlocks],
  );
  const currentPlanningUnitTitle = getCurrentPlanningUnitTitle(currentPlanningBlock);
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key === MATHS_7A_EVIDENCE_STORAGE_KEY) {
        setLocalEvidencePayload(readMaths7ALocalEvidence());
      }
      if (event.key === MATHS_7A_LEARNING_OBSERVATIONS_STORAGE_KEY) {
        setLocalLearningObservationPayload(readMaths7ALocalLearningObservations());
      }
      if (event.key === MATHS_7A_ASSESSMENT_RESULTS_STORAGE_KEY) {
        setLocalAssessmentResultsPayload(readMaths7AAssessmentResults());
      }
      if (event.key === MATHS_7A_LESSON_INDEX_STORAGE_KEY) {
        setActiveLessonIndex(readMaths7ALessonIndex());
      }
      if (event.key === maths7ACellNotesStorageKey) {
        setCellNotes(readMaths7ACellNotes());
      }
      if (event.key === maths7AUnitNotesStorageKey) {
        setUnitNotes(readMaths7AUnitNotes());
      }
      if (event.key === maths7ARowNotesStorageKey) {
        setRowNotes(readMaths7ARowNotes());
      }
    }

    function handleAssessmentResultsChange() {
      setLocalAssessmentResultsPayload(readMaths7AAssessmentResults());
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(MATHS_7A_ASSESSMENT_RESULTS_STORAGE_EVENT, handleAssessmentResultsChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(MATHS_7A_ASSESSMENT_RESULTS_STORAGE_EVENT, handleAssessmentResultsChange);
    };
  }, []);

  function resetDemo() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(planningStorageKey);
    }
    setLocalEvidencePayload(resetMaths7ALocalEvidence().payload);
    setLocalAssessmentResultsPayload(resetMaths7AAssessmentResults());
    setLocalLearningObservationPayload(resetMaths7ALocalLearningObservations().payload);
    setCellNotes(resetMaths7ACellNotes());
    setUnitNotes(resetMaths7AUnitNotes());
    setRowNotes(resetMaths7ARowNotes());
    setActiveLessonIndex(resetMaths7ALessonIndex());
    setLessonAnnouncement('');
    resetGroups();
    resetPlanning();
    resetPlanningCurriculumNotes();
  }

  function advanceLesson() {
    if (!canAdvanceLesson) {
      return;
    }

    const nextIndex = writeMaths7ALessonIndex(activeLessonIndex + 1);
    const nextLesson = demoLessons[nextIndex] || activeLesson;
    setActiveLessonIndex(nextIndex);
    setLessonAnnouncement(`Moved to Maths 7A on ${formatDemoLessonDate(nextLesson.date)}, ${nextLesson.startTime}.`);
  }

  function restartLessonSequence() {
    setActiveLessonIndex(resetMaths7ALessonIndex());
    setLessonAnnouncement('Lesson sequence restarted.');
  }

  function openAssessmentResultEdit(assessmentEvidence) {
    const assessmentResultId = assessmentEvidence?.assessmentResultId
      || (typeof assessmentEvidence?.id === 'string' ? assessmentEvidence.id.split(':')[0] : '');
    const storedAssessment = localAssessmentResultsPayload.assessments.find((assessment) => assessment.id === assessmentResultId);

    if (!storedAssessment) {
      return;
    }

    setAssessmentResultsEditModal({
      open: true,
      storedAssessment,
    });
  }

  function closeAssessmentResultEdit() {
    setAssessmentResultsEditModal((previous) => ({
      ...previous,
      open: false,
    }));
  }

  function handleAssessmentResultEditSaved(saveResult) {
    setLocalAssessmentResultsPayload(saveResult.payload);
  }

  function openStudentProfile(studentId) {
    setProfileStudentId(studentId);
    setStudentProfileOpen(true);
  }

  function saveCellNote(studentId, unitId, value) {
    const key = getStudentUnitCellNoteKey(studentId, unitId);
    setCellNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeCellNoteValue(value);

      if (note) {
        nextNotes[key] = note;
      } else {
        delete nextNotes[key];
      }

      return writeMaths7ACellNotes(nextNotes);
    });
  }

  function saveUnitNote(unitId, value) {
    setUnitNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeCellNoteValue(value);

      if (note) {
        nextNotes[unitId] = note;
      } else {
        delete nextNotes[unitId];
      }

      return writeMaths7AUnitNotes(nextNotes);
    });
  }

  function saveRowNote(studentId, value) {
    setRowNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeRowNoteValue(value);

      if (note) {
        nextNotes[studentId] = note;
      } else {
        delete nextNotes[studentId];
      }

      return writeMaths7ARowNotes(nextNotes);
    });
  }

  function captureForStudent(studentId = selectedStudent.id) {
    setSelectedStudentId(studentId);
    setStudentPictureOpen(false);
    setActiveMode('now');
    window.requestAnimationFrame(() => {
      capturePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      capturePanelRef.current?.focus({ preventScroll: true });
    });
  }

  const nowMode = (
    <Box ref={capturePanelRef} tabIndex={-1} sx={{ scrollMarginTop: 120 }}>
      <Box aria-live="polite" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {lessonAnnouncement}
      </Box>
      <Stack spacing={1.2}>
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            alignItems: 'center',
            width: '100%',
            gap: 1,
          }}
        >
          <Typography sx={{ color: darkText, fontSize: { xs: 20, sm: 23 }, lineHeight: 1.15, fontWeight: 880 }}>
            Lesson capture
          </Typography>
          <ButtonGroup
            variant="outlined"
            size="small"
            aria-label="Now capture version"
            sx={{
              justifySelf: 'end',
              '& .MuiButtonGroup-grouped': {
                borderColor: 'rgba(23, 21, 26, 0.14)',
                color: darkText,
                fontSize: 12.4,
                fontWeight: 780,
                textTransform: 'none',
                '&:hover': { borderColor: purple, bgcolor: '#fff' },
                '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
              },
            }}
          >
            <Button
              type="button"
              aria-pressed={nowCaptureVersion === 'original'}
              onClick={() => setNowCaptureVersion('original')}
              sx={{
                bgcolor: nowCaptureVersion === 'original' ? purple : '#fff',
                color: nowCaptureVersion === 'original' ? '#fff !important' : darkText,
                borderColor: nowCaptureVersion === 'original' ? `${purple} !important` : undefined,
                '&:hover': { bgcolor: nowCaptureVersion === 'original' ? purple : '#fff' },
              }}
            >
              Original
            </Button>
            <Button
              type="button"
              aria-pressed={nowCaptureVersion === 'v2'}
              onClick={() => setNowCaptureVersion('v2')}
              sx={{
                bgcolor: nowCaptureVersion === 'v2' ? purple : '#fff',
                color: nowCaptureVersion === 'v2' ? '#fff !important' : darkText,
                borderColor: nowCaptureVersion === 'v2' ? `${purple} !important` : undefined,
                '&:hover': { bgcolor: nowCaptureVersion === 'v2' ? purple : '#fff' },
              }}
            >
              V2
            </Button>
          </ButtonGroup>
        </Stack>
        {nowCaptureVersion === 'v2' ? (
          <QuickCaptureV2
            students={maths7AStudents}
            selectedStudentId={selectedStudentId}
            localEvidencePayload={localEvidencePayload}
            learningObservations={maths7ALearningObservations}
            localLearningObservationPayload={localLearningObservationPayload}
            activeLesson={activeLesson}
            captureFocuses={nowCaptureFocuses}
            onRestartLessonSequence={restartLessonSequence}
            onLocalEvidencePayloadChange={setLocalEvidencePayload}
            onLocalLearningObservationPayloadChange={setLocalLearningObservationPayload}
            onStudentChange={setSelectedStudentId}
          />
        ) : (
          <QuickCapture
            students={maths7AStudents}
            selectedStudentId={selectedStudentId}
            localEvidencePayload={localEvidencePayload}
            learningObservations={maths7ALearningObservations}
            localLearningObservationPayload={localLearningObservationPayload}
            activeLesson={activeLesson}
            captureFocuses={nowCaptureFocuses}
            onRestartLessonSequence={restartLessonSequence}
            onLocalEvidencePayloadChange={setLocalEvidencePayload}
            onLocalLearningObservationPayloadChange={setLocalLearningObservationPayload}
            onStudentChange={setSelectedStudentId}
          />
        )}
      </Stack>
    </Box>
  );

  const planMode = (
    <SubjectPlanningBoard
      title="Planning"
      description="A broad view of what Anna intends to cover, revisit or assess."
      periods={maths7APlanningPeriods}
      blocks={normalizedPlanningBlocks}
      curriculumAreas={mathsCurriculumAreas}
      abilities={mathsAbilities}
      teachingUnits={mathsTeachingUnits}
      planningTools={mathsQuickAddTemplates}
      curriculumNotes={planningCurriculumNotes}
      curriculumAreaTypeLabels={{
        content: 'Content',
        ability: 'Abilities',
      }}
      referenceDate={activeLesson.date}
      workingGroups={workingGroups}
      groupDefinitions={classGroupDefinitions}
      onCreateBlock={createPlanningBlock}
      onUpdateBlock={updatePlanningBlock}
      onDeleteBlock={deletePlanningBlock}
      onDuplicateBlock={duplicatePlanningBlock}
      onResetPlanning={resetPlanning}
      onSetCurriculumNote={setPlanningCurriculumNote}
      onResetCurriculumNotes={resetPlanningCurriculumNotes}
    />
  );

  const classPictureMode = (
    <ClassPictureStudents
      studentSummaries={studentSummaries}
      teachingUnits={evidenceMapTeachingUnits}
      evidence={visibleEvidence}
      assessmentResultsPayload={localAssessmentResultsPayload}
      learningObservations={visibleLearningObservations}
      cellNotes={cellNotes}
      unitNotes={unitNotes}
      rowNotes={rowNotes}
      onSaveCellNote={saveCellNote}
      onSaveUnitNote={saveUnitNote}
      onSaveRowNote={saveRowNote}
      onEditAssessmentResult={openAssessmentResultEdit}
      workingGroups={workingGroups}
      groupDefinitions={classGroupDefinitions}
      onCreateGroup={createGroup}
      onUpdateGroup={updateGroup}
      onDeleteGroup={deleteGroup}
      onMoveStudentToGroup={moveStudentToGroup}
      onMoveStudentToUngrouped={moveStudentToUngrouped}
      onResetGroups={resetGroups}
    />
  );

  const assessmentMode = (
    <AssessmentView />
  );

  return (
    <SubjectWorkspaceContainer
      title="Mathematics · 7A"
      subtitle={currentPlanningUnitTitle}
      contextLine={`${formatDemoLessonDate(activeLesson.date)} · ${activeLesson.startTime}-${activeLesson.endTime}`}
      activeMode={activeMode}
      onModeChange={setActiveMode}
      onBack={onClose || onBackToWeek}
      menuItems={[
        {
          id: 'next-maths-7a-lesson',
          label: canAdvanceLesson ? 'Next lesson' : 'Final demo lesson',
          icon: <SkipNextIcon fontSize="small" />,
          disabled: !canAdvanceLesson,
          onClick: advanceLesson,
        },
        {
          id: 'reset-maths-7a-demo',
          label: 'Reset demo',
          icon: <RestartAltIcon fontSize="small" />,
          onClick: resetDemo,
        },
      ]}
    >
      {activeMode === 'now' && nowMode}
      {activeMode === 'plan' && planMode}
      {activeMode === 'class-picture' && classPictureMode}
      {activeMode === 'assessment' && assessmentMode}

      <StudentPictureDialog
        student={selectedStudent}
        evidence={selectedEvidence}
        tasks={linkedTasks}
        open={studentPictureOpen}
        onClose={() => setStudentPictureOpen(false)}
        onCapture={() => captureForStudent(selectedStudent.id)}
      />
      <StudentProfileDataDialog
        open={studentProfileOpen}
        student={profileStudent}
        subtitle="Mathematics - 7A"
        summary={profileSummary?.summary}
        groups={profileGroups}
        groupDefinitions={classGroupDefinitions}
        dataSections={profileDataSections}
        onClose={() => setStudentProfileOpen(false)}
      />
      <AssessmentResultsEntryModal
        open={assessmentResultsEditModal.open}
        assessment={{ id: 'enter-results', title: 'Edit test results' }}
        storedAssessment={assessmentResultsEditModal.storedAssessment}
        isResultsEntry
        onClose={closeAssessmentResultEdit}
        onSaved={handleAssessmentResultEditSaved}
      />
    </SubjectWorkspaceContainer>
  );
}
