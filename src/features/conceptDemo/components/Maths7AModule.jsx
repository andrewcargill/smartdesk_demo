import { useEffect, useMemo, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
  addMaths7ALocalObservation,
  MATHS_7A_EVIDENCE_STORAGE_KEY,
  readMaths7ALocalEvidence,
  removeMaths7ALocalObservation,
  resetMaths7ALocalEvidence,
  updateMaths7ALocalObservation,
} from '../data/maths7AEvidenceStorage.js';
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
  getLatestEvidenceDate,
  getMergedMathsEvidence,
  getStudentAssessments,
  getStudentEvidenceByContent,
  getStudentEvidenceSummary,
  getStudentObservations,
  getStudentPictureSummary,
  getStudentVisiblePatterns,
  sortEvidenceByDate,
} from '../utils/maths7APictureUtils.js';
import { getGroupsForStudent } from '../utils/classGroupUtils.js';
import { GroupDialog } from './classPicture/ClassWorkingGroups.jsx';
import StudentProfileDataDialog from './classPicture/StudentProfileDataDialog.jsx';
import SubjectPlanningBoard from './planning/SubjectPlanningBoard.jsx';
import SubjectWorkspaceContainer from './SubjectWorkspaceContainer.jsx';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';
const planningStorageKey = 'smartdesk_demo_maths7a_plan';
const maths7ACellNotesStorageKey = 'smartdesk_demo_maths7a_cell_notes';
const maths7AUnitNotesStorageKey = 'smartdesk_demo_maths7a_unit_notes';

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

function QuickCapture({
  students,
  selectedStudentId,
  localEvidencePayload,
  activeLesson,
  onRestartLessonSequence,
  onLocalEvidencePayloadChange,
  onStudentChange,
}) {
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const [activeUnitId, setActiveUnitId] = useState(nowCaptureFocuses[0].id);
  const [activeTopicId, setActiveTopicId] = useState(nowCaptureFocuses[0].topics[0].id);
  const [contextAnchorEl, setContextAnchorEl] = useState(null);
  const [recentActionId, setRecentActionId] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const activeUnit = nowCaptureFocuses.find((unit) => unit.id === activeUnitId) || nowCaptureFocuses[0];
  const activeTopic = activeUnit.topics.find((topic) => topic.id === activeTopicId) || activeUnit.topics[0];
  const activeCapturePoints = getMathsCapturePointsForTopic({
    teachingUnitId: activeUnit.id,
    evidenceTopicId: activeTopic.id,
  });
  const contextPanelOpen = Boolean(contextAnchorEl);
  const localObservations = localEvidencePayload?.observations || [];
  const visibleLocalObservations = useMemo(
    () => localObservations.filter((capture) => capture.date <= activeLesson.date),
    [activeLesson.date, localObservations],
  );
  const captureCountsByStudentId = useMemo(() => visibleLocalObservations.reduce((counts, capture) => {
    counts[capture.studentId] = (counts[capture.studentId] || 0) + 1;
    return counts;
  }, {}), [visibleLocalObservations]);
  const selectedStudentCaptures = useMemo(
    () => visibleLocalObservations.filter((capture) => capture.studentId === selectedStudent.id),
    [selectedStudent.id, visibleLocalObservations],
  );
  const selectedCaptureSections = useMemo(() => nowCaptureFocuses
    .reduce((dateSections, unit) => {
      unit.topics.forEach((topic) => {
        selectedStudentCaptures
          .filter((capture) => capture.teachingUnitId === unit.id && capture.evidenceTopicId === topic.id)
          .forEach((capture) => {
            const dateSection = dateSections.get(capture.date) || new Map();
            const unitSection = dateSection.get(unit.id) || { unit, topicSections: new Map() };
            const captures = unitSection.topicSections.get(topic.id) || { topic, captures: [] };
            captures.captures.push(capture);
            unitSection.topicSections.set(topic.id, captures);
            dateSection.set(unit.id, unitSection);
            dateSections.set(capture.date, dateSection);
          });
      });

      return dateSections;
    }, new Map()), [selectedStudentCaptures]);
  const selectedCaptureDateSections = useMemo(() => [...selectedCaptureSections.entries()]
    .sort(([firstDate], [secondDate]) => secondDate.localeCompare(firstDate))
    .map(([date, unitSections]) => ({
      date,
      unitSections: [...unitSections.values()].map((unitSection) => ({
        unit: unitSection.unit,
        topicSections: [...unitSection.topicSections.values()].map((topicSection) => ({
          topic: topicSection.topic,
          captures: topicSection.captures.sort((first, second) => (
            (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
          )),
        })),
      })),
    })), [selectedCaptureSections]);
  const currentLevelByCapturePointId = useMemo(() => activeCapturePoints.reduce((levels, capturePoint) => {
    const matchingCaptures = selectedStudentCaptures
      .filter((capture) => (
        capture.teachingUnitId === activeUnit.id
        && capture.evidenceTopicId === activeTopic.id
        && capture.capturePointId === capturePoint.id
        && capture.date === activeLesson.date
      ))
      .sort((first, second) => (
        (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
      ));

    if (matchingCaptures[0]) {
      levels[capturePoint.id] = matchingCaptures[0].levelId;
    }

    return levels;
  }, {}), [activeCapturePoints, activeLesson.date, activeTopic.id, activeUnit.id, selectedStudentCaptures]);

  useEffect(() => {
    if (!confirmation) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setConfirmation(''), 1800);
    return () => window.clearTimeout(timeout);
  }, [confirmation]);

  useEffect(() => {
    if (!recentActionId) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setRecentActionId(''), 520);
    return () => window.clearTimeout(timeout);
  }, [recentActionId]);

  function captureLevel(capturePoint, level, mode = 'update') {
    const latestLocalObservation = selectedStudentCaptures
      .filter((capture) => (
        capture.teachingUnitId === activeUnit.id
        && capture.evidenceTopicId === activeTopic.id
        && capture.capturePointId === capturePoint.id
        && capture.date === activeLesson.date
      ))
      .sort((first, second) => (
        (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
      ))[0] || null;
    const shouldUpdate = mode === 'update' && latestLocalObservation;
    const observationInput = {
      studentId: selectedStudent.id,
      date: activeLesson.date,
      teachingUnitId: activeUnit.id,
      evidenceTopicId: activeTopic.id,
      capturePointId: capturePoint.id,
      levelId: level.id,
    };
    const outcome = shouldUpdate
      ? updateMaths7ALocalObservation(localEvidencePayload, latestLocalObservation.id, { levelId: level.id })
      : addMaths7ALocalObservation(localEvidencePayload, observationInput);

    onLocalEvidencePayloadChange(outcome.payload);
    setRecentActionId(`${capturePoint.id}-${level.id}`);

    if (!outcome.persisted) {
      setConfirmation(`Observation ${shouldUpdate ? 'updated' : 'added'} for this session but could not be saved locally.`);
      return;
    }

    setConfirmation(`Observation ${shouldUpdate ? 'updated' : 'added'} for ${selectedStudent.displayName}.`);
  }

  function removeCapture(captureId) {
    const outcome = removeMaths7ALocalObservation(localEvidencePayload, captureId);

    onLocalEvidencePayloadChange(outcome.payload);

    if (!outcome.persisted) {
      setConfirmation('Observation removed for this session but could not be saved locally.');
      return;
    }

    setConfirmation(`Observation removed for ${selectedStudent.displayName}.`);
  }

  function openContextPanel(event) {
    setContextAnchorEl(event.currentTarget);
  }

  function closeContextPanel() {
    const trigger = contextAnchorEl;
    setContextAnchorEl(null);
    window.requestAnimationFrame(() => trigger?.focus?.());
  }

  function chooseUnit(unit) {
    setActiveUnitId(unit.id);
    setActiveTopicId(unit.topics[0]?.id || '');
    setRecentActionId('');
  }

  function chooseTopic(topicId) {
    setActiveTopicId(topicId);
    setRecentActionId('');
    closeContextPanel();
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '210px minmax(0, 1fr)' },
        gap: { xs: 1.15, md: 1.6 },
        alignItems: 'start',
        minWidth: 0,
      }}
    >
      <Paper
        elevation={0}
        aria-label="Maths 7A students"
        sx={{
          p: { xs: 0.75, md: 1 },
          borderRadius: '14px',
          border: '1px solid rgba(23, 21, 26, 0.14)',
          bgcolor: '#fff',
          maxHeight: { xs: 96, md: 560 },
          overflow: { xs: 'hidden', md: 'auto' },
          minWidth: 0,
        }}
      >
        <Stack
          spacing={0.7}
          sx={{
            display: { xs: 'grid', md: 'flex' },
            gridAutoFlow: { xs: 'column', md: 'row' },
            gridAutoColumns: { xs: 'minmax(132px, 1fr)', md: 'auto' },
            overflowX: { xs: 'auto', md: 'visible' },
            overflowY: 'hidden',
            pb: { xs: 0.4, md: 0 },
          }}
        >
          {students.map((student) => {
            const isSelected = student.id === selectedStudent.id;
            const captureCount = captureCountsByStudentId[student.id] || 0;
            return (
              <ButtonBase
                key={student.id}
                onClick={() => onStudentChange(student.id)}
                aria-pressed={isSelected}
                sx={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  px: 1.1,
                  py: 0.85,
                  borderRadius: '10px',
                  border: isSelected ? `1px solid ${purple}` : '1px solid rgba(23, 21, 26, 0.12)',
                  bgcolor: isSelected ? purple : '#fff',
                  color: isSelected ? '#fff' : darkText,
                  fontWeight: isSelected ? 860 : 720,
                  '&:hover': {
                    bgcolor: isSelected ? purple : '#fff',
                    borderColor: isSelected ? purple : darkText,
                  },
                  '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                }}
              >
                <Stack direction="row" spacing={0.65} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
                  <Typography sx={{ flex: '1 1 auto', minWidth: 0, fontSize: 13.5, fontWeight: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.displayName}
                  </Typography>
                  {!!captureCount && (
                    <Box
                      component="span"
                      aria-label={`${captureCount} local ${captureCount === 1 ? 'observation' : 'observations'}`}
                      sx={{
                        minWidth: 22,
                        height: 22,
                        px: 0.65,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '999px',
                        border: isSelected ? '1px solid rgba(255, 255, 255, 0.72)' : '1px solid rgba(23, 21, 26, 0.16)',
                        color: isSelected ? '#fff' : darkText,
                        fontSize: 11.5,
                        fontWeight: 850,
                        lineHeight: 1,
                      }}
                    >
                      {captureCount}
                    </Box>
                  )}
                </Stack>
              </ButtonBase>
            );
          })}
        </Stack>
      </Paper>

      <Panel sx={{ p: { xs: 1.25, sm: 1.75, md: 2 }, borderRadius: '14px' }}>
        <Stack spacing={{ xs: 1.15, sm: 1.4 }}>
          <Box>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 760 }}>
              Current lesson
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.2 }}>
              <Typography
                component="button"
                type="button"
                aria-label="Change lesson or capture focus"
                aria-haspopup="dialog"
                aria-expanded={contextPanelOpen ? 'true' : undefined}
                onClick={openContextPanel}
                sx={{
                  appearance: 'none',
                  p: 0,
                  m: 0,
                  border: 0,
                  bgcolor: 'transparent',
                  color: darkText,
                  font: 'inherit',
                  fontSize: { xs: 24, sm: 28 },
                  lineHeight: 1.15,
                  fontWeight: 880,
                  textAlign: 'left',
                  cursor: 'pointer',
                  '&:hover': { color: purple },
                  '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 3, borderRadius: '4px' },
                }}
              >
                {activeUnit.label}
              </Typography>
            </Stack>
            <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 13.5, fontWeight: 650 }}>
              {activeTopic.label}
            </Typography>
            <Typography sx={{ mt: 0.1, color: 'text.secondary', fontSize: 12.8, fontWeight: 650 }}>
              Mathematics 7A
            </Typography>
          </Box>

          <Popover
            open={contextPanelOpen}
            anchorEl={contextAnchorEl}
            onClose={closeContextPanel}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
              sx: {
                mt: 0.8,
                width: { xs: 'calc(100vw - 32px)', sm: 380 },
                maxWidth: 'calc(100vw - 32px)',
                p: 0,
                borderRadius: '14px',
                border: '1px solid rgba(23, 21, 26, 0.14)',
                boxShadow: '0 18px 45px rgba(23, 21, 26, 0.14)',
              },
            }}
          >
            <Box sx={{ p: { xs: 2.25, sm: 2.6 } }}>
              <Stack spacing={1.7} role="dialog" aria-label="Capture focus">
                <Typography sx={{ color: darkText, fontSize: 15, fontWeight: 880 }}>
                  Capture focus
                </Typography>
                <Box>
                  <Typography sx={{ mb: 0.75, color: 'text.secondary', fontSize: 12.4, fontWeight: 760 }}>
                    Teaching unit
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
                    {nowCaptureFocuses.map((unit) => {
                      const isActive = unit.id === activeUnit.id;
                      return (
                        <Button
                          key={unit.id}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => chooseUnit(unit)}
                          variant="outlined"
                          sx={{
                            borderRadius: '999px',
                            borderColor: isActive ? purple : 'rgba(23, 21, 26, 0.14)',
                            bgcolor: isActive ? purple : '#fff',
                            color: isActive ? '#fff' : darkText,
                            fontSize: 12.5,
                            fontWeight: isActive ? 850 : 720,
                            textTransform: 'none',
                            '&:hover': { bgcolor: isActive ? purple : '#fff', borderColor: isActive ? purple : darkText },
                            '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                          }}
                        >
                          {unit.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ mb: 0.75, color: 'text.secondary', fontSize: 12.4, fontWeight: 760 }}>
                    Topic
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
                    {activeUnit.topics.map((topic) => {
                      const isActive = topic.id === activeTopic.id;
                      return (
                        <Button
                          key={topic.id}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => chooseTopic(topic.id)}
                          variant="outlined"
                          sx={{
                            borderRadius: '999px',
                            borderColor: isActive ? purple : 'rgba(23, 21, 26, 0.14)',
                            bgcolor: isActive ? purple : '#fff',
                            color: isActive ? '#fff' : darkText,
                            fontSize: 12.5,
                            fontWeight: isActive ? 850 : 720,
                            textTransform: 'none',
                            '&:hover': { bgcolor: isActive ? purple : '#fff', borderColor: isActive ? purple : darkText },
                            '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                          }}
                        >
                          {topic.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
                <Divider />
                <Button
                  type="button"
                  onClick={() => {
                    onRestartLessonSequence();
                    closeContextPanel();
                  }}
                  startIcon={<RestartAltIcon fontSize="small" />}
                  sx={{
                    alignSelf: 'flex-start',
                    color: 'text.secondary',
                    fontSize: 12.6,
                    fontWeight: 760,
                    textTransform: 'none',
                    '&:hover': { color: purple, bgcolor: '#fff' },
                    '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                  }}
                >
                  Restart lesson sequence
                </Button>
              </Stack>
            </Box>
          </Popover>

          <Box aria-live="polite" sx={{ minHeight: 19 }}>
            {!!confirmation && (
              <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 760 }}>
                {confirmation}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 0.9, sm: 1.05 } }}>
            {activeCapturePoints.map((capturePoint) => (
              <Paper
                key={capturePoint.id}
                elevation={0}
                sx={{
                  p: { xs: 1, sm: 1.15 },
                  borderRadius: '12px',
                  border: '1px solid rgba(23, 21, 26, 0.14)',
                  bgcolor: '#fff',
                }}
              >
                <Stack spacing={1}>
                  <Typography sx={{ color: darkText, fontSize: 15.5, fontWeight: 850 }}>
                    {capturePoint.label}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.7 }}>
                    {mathsCaptureLevels.map((level) => {
                      const isRecentAction = recentActionId === `${capturePoint.id}-${level.id}`;
                      const isCurrentLevel = currentLevelByCapturePointId[capturePoint.id] === level.id;
                      const isActive = isRecentAction || isCurrentLevel;
                      const hasCurrentLevel = Boolean(currentLevelByCapturePointId[capturePoint.id]);
                      const mainLabel = hasCurrentLevel ? `Update ${capturePoint.label} to ${level.label}` : `Add ${capturePoint.label} as ${level.label}`;
                      if (!hasCurrentLevel) {
                        return (
                          <Button
                            key={level.id}
                            type="button"
                            aria-label={mainLabel}
                            aria-pressed={isRecentAction}
                            onClick={() => captureLevel(capturePoint, level, 'new')}
                            variant="outlined"
                            sx={{
                              minHeight: 38,
                              borderRadius: '999px',
                              borderColor: isRecentAction ? purple : 'rgba(23, 21, 26, 0.14)',
                              bgcolor: isRecentAction ? purple : '#fff',
                              color: isRecentAction ? '#fff' : darkText,
                              fontSize: 12.8,
                              fontWeight: isRecentAction ? 850 : 720,
                              textTransform: 'none',
                              transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                              '&:hover': {
                                borderColor: isRecentAction ? purple : darkText,
                                bgcolor: isRecentAction ? purple : '#fff',
                              },
                              '&:focus-visible': {
                                outline: `2px solid ${purple}`,
                                outlineOffset: 2,
                              },
                          }}
                        >
                            {level.label}
                          </Button>
                        );
                      }

                      return (
                        <ButtonGroup
                          key={level.id}
                          variant="outlined"
                          aria-label={`${level.label} capture actions`}
                          sx={{
                            width: '100%',
                            borderRadius: '999px',
                            '& .MuiButtonGroup-grouped': {
                              minWidth: 0,
                              borderColor: isActive ? purple : 'rgba(23, 21, 26, 0.14)',
                              textTransform: 'none',
                              '&:focus-visible': {
                                outline: `2px solid ${purple}`,
                                outlineOffset: 2,
                              },
                            },
                          }}
                        >
                          <Button
                            type="button"
                            aria-label={mainLabel}
                            aria-pressed={isActive}
                            onClick={() => captureLevel(capturePoint, level, 'update')}
                            sx={{
                              flex: '1 1 auto',
                              minHeight: 38,
                              borderTopLeftRadius: '999px',
                              borderBottomLeftRadius: '999px',
                              borderTopRightRadius: isActive ? '999px' : 0,
                              borderBottomRightRadius: isActive ? '999px' : 0,
                              borderColor: isActive ? purple : 'rgba(23, 21, 26, 0.14)',
                              bgcolor: isActive ? purple : '#fff',
                              color: isActive ? '#fff' : darkText,
                              fontSize: 12.8,
                              fontWeight: isActive ? 850 : 720,
                              transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                              '&:hover': {
                                borderColor: isActive ? purple : darkText,
                                bgcolor: isActive ? purple : '#fff',
                              },
                            }}
                          >
                            {level.label}
                          </Button>
                          {!isActive && (
                            <Button
                              type="button"
                              aria-label={`Add new ${capturePoint.label}, ${level.label}, for ${selectedStudent.displayName}`}
                              onClick={() => captureLevel(capturePoint, level, 'new')}
                              sx={{
                                flex: '0 0 48px',
                                minHeight: 38,
                                minWidth: 0,
                                borderTopRightRadius: '999px',
                                borderBottomRightRadius: '999px',
                                borderColor: 'rgba(23, 21, 26, 0.14)',
                                bgcolor: '#fff',
                                color: 'text.secondary',
                                px: 0,
                                '&:hover': {
                                  borderColor: darkText,
                                  bgcolor: '#fff',
                                  color: darkText,
                                },
                              }}
                            >
                              <AddIcon sx={{ fontSize: 18 }} />
                            </Button>
                          )}
                        </ButtonGroup>
                      );
                    })}
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>

          <Paper
            elevation={0}
            aria-live="polite"
            sx={{
              p: { xs: 1, sm: 1.1 },
              borderRadius: '12px',
              border: '1px solid rgba(23, 21, 26, 0.12)',
              bgcolor: '#fff',
            }}
          >
            <Stack spacing={0.75}>
              <Typography sx={{ color: darkText, fontSize: 14.2, fontWeight: 850 }}>
                {`Captured for ${selectedStudent.displayName}`}
              </Typography>
              {selectedCaptureDateSections.length ? (
                <Stack spacing={1.15}>
                  {selectedCaptureDateSections.map(({ date, unitSections }) => (
                    <Box key={date} component="section" aria-labelledby={`now-capture-date-${date}`}>
                      <Typography id={`now-capture-date-${date}`} component="h3" sx={{ color: darkText, fontSize: 13.4, fontWeight: 880 }}>
                        {formatDemoLessonDate(date)}
                      </Typography>
                      <Stack spacing={0.95} sx={{ mt: 0.55 }}>
                        {unitSections.map(({ unit, topicSections }) => (
                          <Box key={unit.id} component="section" aria-labelledby={`now-capture-unit-${date}-${unit.id}`}>
                            <Typography id={`now-capture-unit-${date}-${unit.id}`} component="h4" sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 820 }}>
                              {unit.label}
                            </Typography>
                            <Stack spacing={0.75} sx={{ mt: 0.5, pl: { xs: 0, sm: 1 } }}>
                              {topicSections.map(({ topic, captures }) => (
                                <Box key={topic.id} component="section" aria-labelledby={`now-capture-topic-${date}-${unit.id}-${topic.id}`}>
                                  <Typography id={`now-capture-topic-${date}-${unit.id}-${topic.id}`} component="h5" sx={{ color: 'text.secondary', fontSize: 12.1, fontWeight: 760 }}>
                                    {topic.label}
                                  </Typography>
                                  <Box component="ul" sx={{ m: 0, mt: 0.4, p: 0, listStyle: 'none', display: 'grid', gap: 0.45 }}>
                                    {captures.map((capture) => {
                                      const capturePoint = getMathsCapturePointById(capture.capturePointId);
                                      const captureLevel = getMathsCaptureLevelById(capture.levelId);
                                      const capturePointLabel = capturePoint?.label || capture.capturePointId || 'Observation';
                                      const levelLabel = captureLevel?.label || capture.levelId || 'Level';

                                      return (
                                        <Box
                                          key={capture.id}
                                          component="li"
                                          sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'minmax(0, 1fr) auto auto' },
                                            gap: { xs: 0.5, sm: 1 },
                                            alignItems: 'center',
                                            py: 0.55,
                                            px: 0.65,
                                            borderRadius: '10px',
                                            border: '1px solid rgba(23, 21, 26, 0.08)',
                                          }}
                                        >
                                          <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 760, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {capturePointLabel}
                                          </Typography>
                                          <Typography sx={{ color: darkText, fontSize: 12.6, fontWeight: 850, justifySelf: { xs: 'start', sm: 'end' }, gridColumn: { xs: '1 / 2', sm: 'auto' } }}>
                                            {levelLabel}
                                          </Typography>
                                          <IconButton
                                            aria-label={`Remove ${capturePointLabel}, ${levelLabel}, ${topic.label}, for ${selectedStudent.displayName}`}
                                            onClick={() => removeCapture(capture.id)}
                                            size="small"
                                            sx={{
                                              width: 34,
                                              height: 34,
                                              color: 'text.secondary',
                                              justifySelf: 'end',
                                              gridColumn: { xs: '2 / 3', sm: 'auto' },
                                              gridRow: { xs: '1 / span 2', sm: 'auto' },
                                              '&:hover': { color: darkText, bgcolor: '#fff' },
                                              '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
                                            }}
                                          >
                                            <CloseIcon sx={{ fontSize: 17 }} />
                                          </IconButton>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ color: 'text.secondary', fontSize: 13.2, lineHeight: 1.5 }}>
                  {`No observations captured for ${selectedStudent.firstName} yet.`}
                </Typography>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Panel>
    </Box>
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

function AssessmentResultsChart({ assessments, evidenceTopics }) {
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const width = 520;
  const height = 190;
  const padding = { top: 18, right: 22, bottom: 30, left: 34 };
  const topicById = new Map(evidenceTopics.map((topic) => [topic.id, topic]));
  const sortedAssessments = sortEvidenceByDate(assessments, 'asc');
  const dates = sortedAssessments.map((item) => new Date(`${item.date}T12:00:00`).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const xFor = (item) => {
    if (sortedAssessments.length <= 1 || minDate === maxDate) {
      return width / 2;
    }
    const value = new Date(`${item.date}T12:00:00`).getTime();
    return padding.left + ((value - minDate) / (maxDate - minDate)) * (width - padding.left - padding.right);
  };
  const yFor = (item) => padding.top + (1 - (Number(item.percentage) || 0) / 100) * (height - padding.top - padding.bottom);
  const points = sortedAssessments.map((item) => `${xFor(item)},${yFor(item)}`).join(' ');
  const activeAssessment = sortedAssessments.find((item) => item.id === activeAssessmentId) || null;
  const activeTooltip = activeAssessment ? {
    x: Math.min(Math.max(xFor(activeAssessment) - 76, padding.left), width - padding.right - 152),
    y: Math.max(yFor(activeAssessment) - 52, 6),
  } : null;

  return (
    <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Assessment results</Typography>
      {sortedAssessments.length ? (
        <>
          <Box
            component="svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${sortedAssessments.length} saved assessment result${sortedAssessments.length === 1 ? '' : 's'} from ${formatDemoDate(sortedAssessments[0].date)} to ${formatDemoDate(sortedAssessments[sortedAssessments.length - 1].date)}.`}
            sx={{ mt: 0.8, width: '100%', height: 190, overflow: 'visible' }}
          >
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(23, 21, 26, 0.18)" />
            <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(23, 21, 26, 0.18)" />
            {[0, 50, 100].map((tick) => {
              const y = padding.top + (1 - tick / 100) * (height - padding.top - padding.bottom);
              return (
                <g key={tick}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(23, 21, 26, 0.055)" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="rgba(23, 21, 26, 0.54)" fontSize="11">{tick}</text>
                </g>
              );
            })}
            {sortedAssessments.length > 1 && <polyline points={points} fill="none" stroke={purple} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
            {sortedAssessments.map((item) => {
              const topic = topicById.get(item.evidenceTopicId);
              const unit = getTeachingUnitById(item.teachingUnitId);
              const label = item.assessmentTitle || item.label;
              return (
                <g key={item.id}>
                  <circle
                    cx={xFor(item)}
                    cy={yFor(item)}
                    r="6"
                    fill="#fff"
                    stroke={purple}
                    strokeWidth="2.2"
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${label}, ${item.percentage}%, ${formatDemoDate(item.date)}, ${topic?.label || item.evidenceTopicId}, ${unit?.title || 'teaching unit not shown'}.`}
                    onMouseEnter={() => setActiveAssessmentId(item.id)}
                    onMouseLeave={() => setActiveAssessmentId(null)}
                    onFocus={() => setActiveAssessmentId(item.id)}
                    onBlur={() => setActiveAssessmentId(null)}
                    style={{ cursor: 'default', outline: 'none' }}
                  >
                    <title>{`${formatDemoDate(item.date)} · ${label} · ${topic?.label || item.evidenceTopicId} · ${unit?.title || ''} · ${item.percentage}%`}</title>
                  </circle>
                  <text x={xFor(item)} y={height - 9} textAnchor="middle" fill="rgba(23, 21, 26, 0.58)" fontSize="10.5">{formatDemoDate(item.date)}</text>
                </g>
              );
            })}
            {activeAssessment && activeTooltip && (
              <g pointerEvents="none">
                <rect x={activeTooltip.x} y={activeTooltip.y} width="152" height="40" rx="8" fill="#fff" stroke="rgba(23, 21, 26, 0.16)" />
                <text x={activeTooltip.x + 10} y={activeTooltip.y + 16} fill={darkText} fontSize="11.5" fontWeight="700">
                  {(activeAssessment.assessmentTitle || activeAssessment.label).length > 24 ? `${(activeAssessment.assessmentTitle || activeAssessment.label).slice(0, 24)}...` : activeAssessment.assessmentTitle || activeAssessment.label}
                </text>
                <text x={activeTooltip.x + 10} y={activeTooltip.y + 31} fill="rgba(23, 21, 26, 0.62)" fontSize="11">
                  {activeAssessment.percentage}% result
                </text>
              </g>
            )}
          </Box>
          {sortedAssessments.length === 1 && (
            <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>One saved result is available. More results are needed before a same-area comparison is possible.</Typography>
          )}
          <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>Results relate to different areas of mathematics.</Typography>
          <Box component="ul" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {sortedAssessments.map((item) => {
              const topic = topicById.get(item.evidenceTopicId);
              const unit = getTeachingUnitById(item.teachingUnitId);
              return <li key={item.id}>{formatDemoDate(item.date)}. {item.assessmentTitle || item.label}. {topic?.label || item.evidenceTopicId}. {unit?.title || 'Teaching unit not shown'}. {item.percentage}%.</li>;
            })}
          </Box>
        </>
      ) : (
        <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 13 }}>No saved assessment results yet.</Typography>
      )}
    </Paper>
  );
}

function CaptureProgressChart({ observations, evidenceTopics }) {
  const [activeObservationId, setActiveObservationId] = useState(null);
  const width = 520;
  const height = 210;
  const padding = { top: 24, right: 24, bottom: 34, left: 82 };
  const topicById = new Map(evidenceTopics.map((topic) => [topic.id, topic]));
  const progressSeries = buildCaptureProgressSeries(observations);
  const visibleSeries = progressSeries;
  const visibleItems = visibleSeries.flatMap((series) => series.items);
  const sortedVisibleItems = sortEvidenceByDate(visibleItems, 'asc');
  const dates = visibleItems.map((item) => new Date(`${item.date}T12:00:00`).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const levelValueById = new Map(mathsCaptureLevels.map((level) => [level.id, level.order]));
  const levelDistribution = mathsCaptureLevels.map((level) => ({
    ...level,
    count: visibleItems.filter((item) => item.levelId === level.id).length,
  }));
  const totalStructured = visibleItems.length;
  const lineColors = [purple, darkText, 'rgba(23, 21, 26, 0.56)', 'rgba(156, 40, 175, 0.58)'];
  const xFor = (item) => {
    if (visibleItems.length <= 1 || minDate === maxDate) {
      return padding.left + (width - padding.left - padding.right) / 2;
    }

    const value = new Date(`${item.date}T12:00:00`).getTime();
    return padding.left + ((value - minDate) / (maxDate - minDate)) * (width - padding.left - padding.right);
  };
  const yForLevel = (levelId) => {
    const value = levelValueById.get(levelId) || 1;
    return padding.top + (1 - (value - 1) / Math.max(mathsCaptureLevels.length - 1, 1)) * (height - padding.top - padding.bottom);
  };
  const activeObservation = visibleItems.find((item) => item.id === activeObservationId) || null;
  const activePoint = activeObservation ? getMathsCapturePointById(activeObservation.capturePointId) : null;
  const activeLevel = activeObservation ? getMathsCaptureLevelById(activeObservation.levelId) : null;
  const activeTooltip = activeObservation ? {
    x: Math.min(Math.max(xFor(activeObservation) - 78, padding.left), width - padding.right - 156),
    y: Math.max(yForLevel(activeObservation.levelId) - 54, 8),
  } : null;

  return (
    <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.7} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Capture progress</Typography>
        {!!totalStructured && (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.1 }}>
            {totalStructured} structured observation{totalStructured === 1 ? '' : 's'}
          </Typography>
        )}
      </Stack>
      {visibleSeries.length ? (
        <>
          <Box
            component="svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${totalStructured} structured capture observation${totalStructured === 1 ? '' : 's'} showing progress by capture level.`}
            sx={{ mt: 0.8, width: '100%', height: 210, overflow: 'visible' }}
          >
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(23, 21, 26, 0.18)" />
            <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(23, 21, 26, 0.18)" />
            {mathsCaptureLevels.map((level) => {
              const y = yForLevel(level.id);
              return (
                <g key={level.id}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(23, 21, 26, 0.055)" />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="rgba(23, 21, 26, 0.58)" fontSize="10.5">{level.label}</text>
                </g>
              );
            })}
            {visibleSeries.map((series, index) => {
              const points = series.items.map((item) => `${xFor(item)},${yForLevel(item.levelId)}`).join(' ');
              const color = lineColors[index % lineColors.length];

              return (
                <g key={series.capturePoint.id}>
                  {series.items.length > 1 && <polyline points={points} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
                  {series.items.map((item) => {
                    const topic = topicById.get(item.evidenceTopicId);
                    const level = getMathsCaptureLevelById(item.levelId);
                    return (
                      <circle
                        key={item.id}
                        cx={xFor(item)}
                        cy={yForLevel(item.levelId)}
                        r="5.7"
                        fill="#fff"
                        stroke={color}
                        strokeWidth="2.2"
                        tabIndex={0}
                        role="graphics-symbol"
                        aria-label={`${series.capturePoint.label}, ${level?.label || item.levelId}, ${formatDemoDate(item.date)}, ${topic?.label || item.evidenceTopicId}.`}
                        onMouseEnter={() => setActiveObservationId(item.id)}
                        onMouseLeave={() => setActiveObservationId(null)}
                        onFocus={() => setActiveObservationId(item.id)}
                        onBlur={() => setActiveObservationId(null)}
                        style={{ cursor: 'default', outline: 'none' }}
                      >
                        <title>{`${formatDemoDate(item.date)} · ${series.capturePoint.label} · ${level?.label || item.levelId} · ${topic?.label || item.evidenceTopicId}`}</title>
                      </circle>
                    );
                  })}
                </g>
              );
            })}
            {visibleItems.length > 0 && (
              <>
                <text x={padding.left} y={height - 10} textAnchor="start" fill="rgba(23, 21, 26, 0.58)" fontSize="10.5">{formatDemoDate(sortedVisibleItems[0].date)}</text>
                <text x={width - padding.right} y={height - 10} textAnchor="end" fill="rgba(23, 21, 26, 0.58)" fontSize="10.5">{formatDemoDate(sortedVisibleItems[sortedVisibleItems.length - 1].date)}</text>
              </>
            )}
            {activeObservation && activeTooltip && (
              <g pointerEvents="none">
                <rect x={activeTooltip.x} y={activeTooltip.y} width="156" height="44" rx="8" fill="#fff" stroke="rgba(23, 21, 26, 0.16)" />
                <text x={activeTooltip.x + 10} y={activeTooltip.y + 16} fill={darkText} fontSize="11.2" fontWeight="700">
                  {activePoint?.label || activeObservation.capturePointId}
                </text>
                <text x={activeTooltip.x + 10} y={activeTooltip.y + 32} fill="rgba(23, 21, 26, 0.62)" fontSize="11">
                  {activeLevel?.label || activeObservation.levelId} · {formatDemoDate(activeObservation.date)}
                </text>
              </g>
            )}
          </Box>
          <Stack spacing={0.7}>
            {visibleSeries.map((series, index) => {
              const firstLevel = getMathsCaptureLevelById(series.items[0]?.levelId);
              const latestLevel = getMathsCaptureLevelById(series.items[series.items.length - 1]?.levelId);
              const movement = series.change > 0 ? '+' : '';
              return (
                <Stack key={series.capturePoint.id} direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: lineColors[index % lineColors.length], flexShrink: 0 }} />
                  <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 780, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{series.capturePoint.label}</Typography>
                  <Typography sx={{ ml: 'auto', color: 'text.secondary', fontSize: 12.1, whiteSpace: 'nowrap' }}>
                    {firstLevel?.label || 'Level'} to {latestLevel?.label || 'Level'}{series.change ? ` (${movement}${series.change})` : ''}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
          <Stack spacing={0.55} sx={{ mt: 1 }}>
            {levelDistribution.filter((level) => level.count).map((level) => (
              <Stack key={level.id} direction="row" spacing={0.8} alignItems="center">
                <Typography sx={{ width: 76, color: 'text.secondary', fontSize: 11.8 }}>{level.label}</Typography>
                <Box sx={{ flex: '1 1 auto', height: 8, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.07)', overflow: 'hidden' }}>
                  <Box sx={{ width: `${(level.count / totalStructured) * 100}%`, height: '100%', bgcolor: level.id === 'advanced' || level.id === 'secure' ? purple : 'rgba(23, 21, 26, 0.42)' }} />
                </Box>
                <Typography sx={{ width: 18, textAlign: 'right', color: darkText, fontSize: 11.8, fontWeight: 780 }}>{level.count}</Typography>
              </Stack>
            ))}
          </Stack>
          <Box component="ul" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {visibleItems.map((item) => {
              const capturePoint = getMathsCapturePointById(item.capturePointId);
              const level = getMathsCaptureLevelById(item.levelId);
              const topic = topicById.get(item.evidenceTopicId);
              return <li key={item.id}>{formatDemoDate(item.date)}. {capturePoint?.label || item.capturePointId}. {level?.label || item.levelId}. {topic?.label || item.evidenceTopicId}.</li>;
            })}
          </Box>
        </>
      ) : (
        <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 13 }}>No structured capture observations yet.</Typography>
      )}
    </Paper>
  );
}

function ObservationContentGraph({ contentRows }) {
  const rows = contentRows
    .map((entry) => {
      const observations = entry.observations || [];
      const levelCounts = mathsCaptureLevels.reduce((counts, level) => ({
        ...counts,
        [level.id]: observations.filter((item) => item.levelId === level.id).length,
      }), {});
      const latestStructured = observations.find((item) => item.capturePointId && item.levelId) || null;
      const latestLevel = latestStructured ? getMathsCaptureLevelById(latestStructured.levelId) : null;

      return {
        unit: entry.topic,
        observations,
        count: observations.length,
        levelCounts,
        latestLevel,
      };
    })
    .filter((row) => row.count);
  const maxCount = Math.max(...rows.map((row) => row.count), 1);
  const levelColors = {
    emerging: 'rgba(23, 21, 26, 0.3)',
    developing: 'rgba(23, 21, 26, 0.52)',
    secure: purple,
    advanced: darkText,
  };

  return (
    <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Observation spread</Typography>
      {rows.length ? (
        <Stack spacing={0.9} sx={{ mt: 1 }}>
          {rows.map((row) => {
            const topicLabels = (row.unit.evidenceTopicIds || [])
              .map((id) => getEvidenceTopicById(id)?.title || id)
              .join(', ');

            return (
              <Box key={row.unit.id}>
                <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
                  <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 820, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.unit.label || row.unit.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 760, whiteSpace: 'nowrap' }}>
                    {row.count} observation{row.count === 1 ? '' : 's'}
                  </Typography>
                </Stack>
                <Box
                  role="img"
                  aria-label={`${row.unit.label || row.unit.title}: ${row.count} observation${row.count === 1 ? '' : 's'}${row.latestLevel ? `, latest structured level ${row.latestLevel.label}` : ''}.`}
                  sx={{
                    mt: 0.45,
                    height: 14,
                    display: 'flex',
                    width: `${Math.max((row.count / maxCount) * 100, 12)}%`,
                    minWidth: 72,
                    borderRadius: '999px',
                    overflow: 'hidden',
                    bgcolor: 'rgba(23, 21, 26, 0.07)',
                  }}
                >
                  {mathsCaptureLevels.map((level) => {
                    const count = row.levelCounts[level.id] || 0;
                    if (!count) return null;
                    return (
                      <Box
                        key={level.id}
                        title={`${level.label}: ${count}`}
                        sx={{
                          width: `${(count / row.count) * 100}%`,
                          minWidth: 7,
                          bgcolor: levelColors[level.id],
                        }}
                      />
                    );
                  })}
                  {observationsWithoutLevel(row.observations) > 0 && (
                    <Box
                      title={`Unlevelled observations: ${observationsWithoutLevel(row.observations)}`}
                      sx={{
                        flex: '1 1 auto',
                        minWidth: 7,
                        bgcolor: 'rgba(23, 21, 26, 0.14)',
                      }}
                    />
                  )}
                </Box>
                <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mt: 0.35 }}>
                  {row.latestLevel && (
                    <Chip
                      label={row.latestLevel.label}
                      size="small"
                      sx={{ height: 20, bgcolor: row.latestLevel.id === 'secure' || row.latestLevel.id === 'advanced' ? purple : '#fff', color: row.latestLevel.id === 'secure' || row.latestLevel.id === 'advanced' ? '#fff' : darkText, fontSize: 11, fontWeight: 780 }}
                    />
                  )}
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {topicLabels || 'No linked topics'}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.2 }}>
            {mathsCaptureLevels.map((level) => (
              <Stack key={level.id} direction="row" spacing={0.45} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: levelColors[level.id] }} />
                <Typography sx={{ color: 'text.secondary', fontSize: 11.4 }}>{level.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ) : (
        <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 13 }}>No saved observations yet.</Typography>
      )}
    </Paper>
  );
}

function observationsWithoutLevel(observations) {
  return (observations || []).filter((item) => !item.levelId).length;
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
  const dates = [...new Set(items.map((item) => item.date).filter(Boolean))].sort();

  return {
    unit,
    items,
    observations,
    assessments,
    capturePoints,
    observedCapturePointIds,
    observedCapturePointCount: capturePoints.filter((point) => observedCapturePointIds.has(point.id)).length,
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

function StudentInsightPanelV2({
  student,
  teachingUnits,
  evidence,
  judgements,
  onSaveJudgement,
}) {
  const unitSummaries = useMemo(() => teachingUnits.map((unit) => buildTeachingUnitEvidenceSummary(
    unit,
    evidence,
    judgements[getJudgementKey(student.id, unit.id)] || null,
  )), [evidence, judgements, student.id, teachingUnits]);
  const defaultUnit = unitSummaries.find((summary) => summary.items.length) || unitSummaries[0] || null;
  const [selectedUnitId, setSelectedUnitId] = useState(defaultUnit?.unit.id || '');
  const selectedSummary = unitSummaries.find((summary) => summary.unit.id === selectedUnitId) || defaultUnit;
  const [judgementEditorOpen, setJudgementEditorOpen] = useState(false);
  const [draftLevelId, setDraftLevelId] = useState('not-set');
  const [draftNote, setDraftNote] = useState('');

  useEffect(() => {
    if (!selectedSummary) return;
    setSelectedUnitId((currentId) => (
      unitSummaries.some((summary) => summary.unit.id === currentId)
        ? currentId
        : selectedSummary.unit.id
    ));
  }, [selectedSummary, unitSummaries]);

  useEffect(() => {
    const judgement = selectedSummary?.judgement || null;
    setDraftLevelId(judgement?.levelId || 'not-set');
    setDraftNote(judgement?.note || '');
    setJudgementEditorOpen(false);
  }, [selectedSummary?.unit.id, selectedSummary?.judgement]);

  if (!selectedSummary) {
    return null;
  }

  const studentEvidence = getEvidenceForStudent(evidence, student.id);
  const studentObservations = studentEvidence.filter((item) => item.type !== 'assessment');
  const studentAssessments = studentEvidence.filter((item) => item.type === 'assessment');
  const unitsWithEvidenceCount = unitSummaries.filter((summary) => summary.items.length).length;
  const latestEvidenceDate = getLatestEvidenceDate(studentEvidence);
  const sequences = buildCapturePointSequences(selectedSummary);
  const observedSequences = sequences.filter((sequence) => sequence.observations.length);
  const unobservedSequences = sequences.filter((sequence) => !sequence.observations.length);
  const repeatedSequences = observedSequences.filter((sequence) => sequence.observations.length >= 2);
  const changedSequences = repeatedSequences.filter((sequence) => sequence.observations[0].levelId !== sequence.observations[sequence.observations.length - 1].levelId);
  const unchangedSequences = repeatedSequences.filter((sequence) => sequence.observations[0].levelId === sequence.observations[sequence.observations.length - 1].levelId);
  const structuredObservationIds = new Set(selectedSummary.observations.filter((item) => item.capturePointId).map((item) => item.id));
  const otherObservations = selectedSummary.observations.filter((item) => !structuredObservationIds.has(item.id));
  const judgementLevel = selectedSummary.judgement?.levelId ? getMathsCaptureLevelById(selectedSummary.judgement.levelId) : null;

  function saveJudgement() {
    onSaveJudgement({
      studentId: student.id,
      teachingUnitId: selectedSummary.unit.id,
      levelId: draftLevelId === 'not-set' ? null : draftLevelId,
      note: draftNote.trim(),
    });
    setJudgementEditorOpen(false);
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-insight-v2-${student.id}`} sx={{ p: { xs: 1.25, sm: 1.6 }, borderRadius: '18px', border: '1px solid rgba(23, 21, 26, 0.1)', bgcolor: '#fff' }}>
        <Stack spacing={1.4}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography component="h2" sx={{ color: darkText, fontSize: 16.5, fontWeight: 900 }}>Evidence picture</Typography>
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.8 }}>Prototype V2 · factual evidence view</Typography>
            </Box>
            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
              {[
                `${studentEvidence.length} evidence item${studentEvidence.length === 1 ? '' : 's'}`,
                `${studentAssessments.length} assessment${studentAssessments.length === 1 ? '' : 's'}`,
                `${studentObservations.length} observation${studentObservations.length === 1 ? '' : 's'}`,
                `${unitsWithEvidenceCount} teaching unit${unitsWithEvidenceCount === 1 ? '' : 's'} with evidence`,
                `Latest evidence: ${latestEvidenceDate ? formatDemoDate(latestEvidenceDate) : 'None'}`,
              ].map((item) => <Chip key={item} label={item} size="small" sx={{ bgcolor: '#fff', border: '1px solid rgba(23, 21, 26, 0.12)', color: darkText, fontWeight: 760 }} />)}
            </Stack>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 0.78fr) minmax(0, 1.22fr)' }, gap: 1.25, alignItems: 'start' }}>
            <Stack spacing={0.75}>
              {unitSummaries.map((summary) => {
                const selected = summary.unit.id === selectedSummary.unit.id;
                const judgement = summary.judgement?.levelId ? getMathsCaptureLevelById(summary.judgement.levelId) : null;
                return (
                  <ButtonBase
                    key={summary.unit.id}
                    onClick={() => setSelectedUnitId(summary.unit.id)}
                    aria-pressed={selected}
                    sx={{
                      width: '100%',
                      p: 1,
                      display: 'block',
                      textAlign: 'left',
                      borderRadius: '12px',
                      border: selected ? `1px solid ${purple}` : '1px solid rgba(23, 21, 26, 0.1)',
                      bgcolor: selected ? palePurple : '#fff',
                      '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                    }}
                  >
                    <Typography sx={{ color: darkText, fontSize: 13.4, fontWeight: 880 }}>{summary.unit.label || summary.unit.title}</Typography>
                    <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.2 }}>
                      {summary.observations.length ? `${summary.observations.length} observation${summary.observations.length === 1 ? '' : 's'}` : 'No observations'} · {summary.assessments.length ? `${summary.assessments.length} assessment${summary.assessments.length === 1 ? '' : 's'}` : 'no assessments'} · {summary.observedCapturePointCount}/{summary.capturePoints.length} capture points
                    </Typography>
                    <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12 }}>
                      Evidence spans {summary.lessonCount || 0} lesson{summary.lessonCount === 1 ? '' : 's'} · Latest {summary.latestDate ? formatDemoDate(summary.latestDate) : 'none'}
                    </Typography>
                    <Typography sx={{ mt: 0.35, color: darkText, fontSize: 12, fontWeight: 760 }}>
                      Teacher judgement: {judgement?.label || 'Not set'}
                    </Typography>
                  </ButtonBase>
                );
              })}
            </Stack>

            <Stack spacing={1.15}>
              <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography component="h3" sx={{ color: darkText, fontSize: 16, fontWeight: 900 }}>{selectedSummary.unit.label || selectedSummary.unit.title}</Typography>
                <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                  {[
                    `${selectedSummary.observations.length} observation${selectedSummary.observations.length === 1 ? '' : 's'}`,
                    `${selectedSummary.assessments.length} assessment${selectedSummary.assessments.length === 1 ? '' : 's'}`,
                    `${selectedSummary.observedCapturePointCount} of ${selectedSummary.capturePoints.length} capture points observed`,
                    `Evidence across ${selectedSummary.lessonCount || 0} lesson${selectedSummary.lessonCount === 1 ? '' : 's'}`,
                    selectedSummary.earliestDate && selectedSummary.latestDate ? `${formatDemoDate(selectedSummary.earliestDate)}-${formatDemoDate(selectedSummary.latestDate)}` : 'No evidence dates',
                  ].map((item) => <Chip key={item} label={item} size="small" sx={{ bgcolor: '#fff', border: '1px solid rgba(23, 21, 26, 0.12)', color: darkText, fontWeight: 740 }} />)}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography component="h3" sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Capture-point coverage</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.1, mt: 0.8 }}>
                  <Box>
                    <Typography component="h4" sx={{ color: darkText, fontSize: 12.8, fontWeight: 850 }}>Observed</Typography>
                    <Stack spacing={0.45} sx={{ mt: 0.45 }}>
                      {observedSequences.length ? observedSequences.map((sequence) => (
                        <Typography key={sequence.capturePoint.id} sx={{ color: 'text.secondary', fontSize: 12.4 }}>
                          {sequence.capturePoint.label} · {sequence.observations.length} observation{sequence.observations.length === 1 ? '' : 's'}
                        </Typography>
                      )) : <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>None</Typography>}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography component="h4" sx={{ color: darkText, fontSize: 12.8, fontWeight: 850 }}>Not yet observed</Typography>
                    <Stack spacing={0.45} sx={{ mt: 0.45 }}>
                      {unobservedSequences.length ? unobservedSequences.map((sequence) => (
                        <Typography key={sequence.capturePoint.id} sx={{ color: 'text.secondary', fontSize: 12.4 }}>{sequence.capturePoint.label}</Typography>
                      )) : <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>None</Typography>}
                    </Stack>
                  </Box>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography component="h3" sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Changes in repeated observations</Typography>
                <Stack spacing={0.8} sx={{ mt: 0.75 }}>
                  {[
                    ['Changed', changedSequences],
                    ['No recorded change', unchangedSequences],
                  ].map(([label, sequencesForSection]) => (
                    <Box key={label}>
                      <Typography component="h4" sx={{ color: darkText, fontSize: 12.8, fontWeight: 850 }}>{label}</Typography>
                      <Stack spacing={0.45} sx={{ mt: 0.35 }}>
                        {sequencesForSection.length ? sequencesForSection.map((sequence) => {
                          const first = sequence.observations[0];
                          const latest = sequence.observations[sequence.observations.length - 1];
                          const firstLevel = getMathsCaptureLevelById(first.levelId);
                          const latestLevel = getMathsCaptureLevelById(latest.levelId);
                          return (
                            <Typography key={sequence.capturePoint.id} sx={{ color: 'text.secondary', fontSize: 12.4 }}>
                              {sequence.capturePoint.label}: recorded change {firstLevel?.label || first.levelId} to {latestLevel?.label || latest.levelId} · {formatDemoDate(first.date)}-{formatDemoDate(latest.date)}
                            </Typography>
                          );
                        }) : <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No capture point has been observed more than once yet.</Typography>}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography component="h3" sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Observation evidence</Typography>
                <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                  {observedSequences.length ? observedSequences.map((sequence) => (
                    <Box key={sequence.capturePoint.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                      <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 820 }}>{sequence.capturePoint.label}</Typography>
                      {sequence.observations.map((item) => {
                        const level = getMathsCaptureLevelById(item.levelId);
                        return (
                          <Typography key={item.id} sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.4 }}>
                            {formatDemoDate(item.date)} · {level?.label || item.levelId}{item.observationText ? ` · ${item.observationText}` : ''}
                          </Typography>
                        );
                      })}
                    </Box>
                  )) : <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No structured observations recorded for this teaching unit.</Typography>}
                  {!!otherObservations.length && (
                    <Box sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                      <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 820 }}>Other teacher observations</Typography>
                      {otherObservations.map((item) => (
                        <Typography key={item.id} sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.4 }}>
                          {item.observationText || item.label} · {formatDemoDate(item.date)}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography component="h3" sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Assessment evidence</Typography>
                <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                  {selectedSummary.assessments.length ? selectedSummary.assessments.map((item) => (
                    <Box key={item.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                      <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 820 }}>{item.assessmentTitle || item.label}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>{formatDemoDate(item.date)} · {item.percentage}%</Typography>
                      {item.note && <Typography sx={{ mt: 0.15, color: 'text.secondary', fontSize: 12.3 }}>{item.note}</Typography>}
                    </Box>
                  )) : <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No assessments recorded for this teaching unit.</Typography>}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                  <Box>
                    <Typography component="h3" sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Teacher working judgement</Typography>
                    <Typography sx={{ mt: 0.3, color: 'text.secondary', fontSize: 12.5 }}>
                      {judgementLevel ? `Teacher judgement · ${judgementLevel.label}` : 'Teacher judgement not set'}
                    </Typography>
                    {selectedSummary.judgement?.updatedAt && (
                      <Typography sx={{ mt: 0.15, color: 'text.secondary', fontSize: 12.1 }}>Set by Anna · {formatDemoDate(selectedSummary.judgement.effectiveDate || selectedSummary.judgement.updatedAt.slice(0, 10))}</Typography>
                    )}
                    {selectedSummary.judgement?.note && <Typography sx={{ mt: 0.35, color: darkText, fontSize: 12.6 }}>{selectedSummary.judgement.note}</Typography>}
                  </Box>
                  <Button variant="outlined" onClick={() => setJudgementEditorOpen(true)} sx={{ color: darkText, borderColor: 'rgba(23, 21, 26, 0.14)', textTransform: 'none', fontWeight: 780 }}>
                    Add judgement
                  </Button>
                </Stack>
                {judgementEditorOpen && (
                  <Stack spacing={0.9} sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(23, 21, 26, 0.08)' }}>
                    <FormControl size="small">
                      <InputLabel id={`teacher-judgement-level-${student.id}-${selectedSummary.unit.id}`}>Teacher judgement</InputLabel>
                      <Select
                        labelId={`teacher-judgement-level-${student.id}-${selectedSummary.unit.id}`}
                        label="Teacher judgement"
                        value={draftLevelId}
                        onChange={(event) => setDraftLevelId(event.target.value)}
                      >
                        <MenuItem value="not-set">Not set</MenuItem>
                        {mathsCaptureLevels.map((level) => <MenuItem key={level.id} value={level.id}>{level.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Teacher note"
                      value={draftNote}
                      onChange={(event) => setDraftNote(event.target.value)}
                      size="small"
                      multiline
                      minRows={2}
                    />
                    <Stack direction="row" spacing={0.8}>
                      <Button variant="contained" onClick={saveJudgement} sx={{ bgcolor: purple, textTransform: 'none', fontWeight: 820, '&:hover': { bgcolor: purple } }}>Save</Button>
                      <Button onClick={() => setJudgementEditorOpen(false)} sx={{ color: darkText, textTransform: 'none', fontWeight: 760 }}>Cancel</Button>
                    </Stack>
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

function getRepeatedSequenceGroups(summary) {
  return buildCapturePointSequences(summary).filter((sequence) => sequence.observations.length >= 2);
}

function StudentUnitEvidenceCell({ summary, maxLessonCount }) {
  const repeatedCount = getRepeatedSequenceGroups(summary).length;
  const hasEvidence = summary.items.length > 0;
  const barWidth = summary.lessonCount ? Math.max((summary.lessonCount / maxLessonCount) * 100, 18) : 0;
  const capturePointTotal = summary.capturePoints.length || 0;
  const capturePointCoverage = capturePointTotal
    ? Math.max((summary.observedCapturePointCount / capturePointTotal) * 100, summary.observedCapturePointCount ? 14 : 0)
    : 0;

  return (
    <Box sx={{ minHeight: 33, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.55 }}>
      <Box sx={{ height: 8, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.08)', overflow: 'hidden' }}>
        {!!summary.lessonCount && <Box sx={{ width: `${barWidth}%`, height: '100%', bgcolor: purple }} />}
      </Box>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minHeight: 12 }}>
        {hasEvidence ? (
          <>
            <Box
              title={`${summary.observedCapturePointCount} of ${capturePointTotal} capture points observed`}
              sx={{
                width: 24,
                height: 4,
                borderRadius: '999px',
                bgcolor: 'rgba(23, 21, 26, 0.09)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {!!capturePointCoverage && <Box sx={{ width: `${capturePointCoverage}%`, height: '100%', bgcolor: darkText }} />}
            </Box>
            {!!summary.assessments.length && <Box component="span" title="Assessment recorded" sx={{ width: 7, height: 7, bgcolor: darkText, flexShrink: 0 }} />}
            {!!repeatedCount && <Box component="span" title="Repeated capture point" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: purple, flexShrink: 0 }} />}
            {!!summary.judgement?.levelId && <Box component="span" title="Anna added a judgement" sx={{ width: 7, height: 7, border: `1.5px solid ${darkText}`, borderRadius: '2px', flexShrink: 0 }} />}
          </>
        ) : (
          <Box sx={{ width: 22, height: 2, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.2)' }} />
        )}
      </Stack>
    </Box>
  );
}

function StudentInsightPanelV3({
  student,
  teachingUnits,
  evidence,
  judgements,
  onSaveJudgement,
}) {
  const unitSummaries = useMemo(() => teachingUnits.map((unit) => buildTeachingUnitEvidenceSummary(
    unit,
    evidence,
    judgements[getJudgementKey(student.id, unit.id)] || null,
  )), [evidence, judgements, student.id, teachingUnits]);
  const defaultUnit = unitSummaries.find((summary) => summary.items.length) || unitSummaries[0] || null;
  const [selectedUnitId, setSelectedUnitId] = useState(defaultUnit?.unit.id || '');
  const selectedSummary = unitSummaries.find((summary) => summary.unit.id === selectedUnitId) || defaultUnit;
  const [detailOpen, setDetailOpen] = useState(false);
  const [draftLevelId, setDraftLevelId] = useState('not-set');
  const [draftNote, setDraftNote] = useState('');

  useEffect(() => {
    if (!defaultUnit) return;
    setSelectedUnitId((currentId) => (
      unitSummaries.some((summary) => summary.unit.id === currentId)
        ? currentId
        : defaultUnit.unit.id
    ));
  }, [defaultUnit, unitSummaries]);

  useEffect(() => {
    const judgement = selectedSummary?.judgement || null;
    setDraftLevelId(judgement?.levelId || 'not-set');
    setDraftNote(judgement?.note || '');
  }, [selectedSummary?.unit.id, selectedSummary?.judgement]);

  if (!selectedSummary) {
    return null;
  }

  const studentEvidence = getEvidenceForStudent(evidence, student.id);
  const studentAssessments = studentEvidence.filter((item) => item.type === 'assessment');
  const unitsWithEvidenceCount = unitSummaries.filter((summary) => summary.items.length).length;
  const latestEvidenceDate = getLatestEvidenceDate(studentEvidence);
  const maxLessonCount = Math.max(...unitSummaries.map((summary) => summary.lessonCount), 1);
  const selectedSequences = buildCapturePointSequences(selectedSummary);
  const observedSequences = selectedSequences.filter((sequence) => sequence.observations.length);
  const repeatedSequences = getRepeatedSequenceGroups(selectedSummary);
  const changedRepeatedSequences = repeatedSequences.filter((sequence) => sequence.observations[0].levelId !== sequence.observations[sequence.observations.length - 1].levelId);
  const latestUnitEvidence = selectedSummary.latestDate ? sortEvidenceByDate(selectedSummary.items, 'desc').slice(0, 3) : [];
  const detailOtherObservations = selectedSummary.observations.filter((item) => !item.capturePointId);
  const detailStructuredObservationIds = new Set(selectedSummary.observations.filter((item) => item.capturePointId).map((item) => item.id));
  const detailStructuredObservations = selectedSummary.observations.filter((item) => detailStructuredObservationIds.has(item.id));
  const judgementLevel = selectedSummary.judgement?.levelId ? getMathsCaptureLevelById(selectedSummary.judgement.levelId) : null;

  function saveJudgement() {
    onSaveJudgement({
      studentId: student.id,
      teachingUnitId: selectedSummary.unit.id,
      levelId: draftLevelId === 'not-set' ? null : draftLevelId,
      note: draftNote.trim(),
    });
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-insight-v3-${student.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: '1px solid rgba(23, 21, 26, 0.1)', bgcolor: '#fff' }}>
        <Stack spacing={1.35}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Box>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>{student.displayName}</Typography>
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.8 }}>
                Evidence across {unitsWithEvidenceCount} of {unitSummaries.length} teaching units · Latest evidence: {latestEvidenceDate ? formatDemoDate(latestEvidenceDate) : 'None'}
              </Typography>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 760 }}>
              {studentEvidence.length} evidence item{studentEvidence.length === 1 ? '' : 's'} · {studentAssessments.length} assessment{studentAssessments.length === 1 ? '' : 's'}
            </Typography>
          </Stack>

          <Box>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap role="list" aria-label="Visual curriculum journey">
              {unitSummaries.map((summary) => {
                const selected = summary.unit.id === selectedSummary.unit.id;
                const repeatedCount = getRepeatedSequenceGroups(summary).length;
                const judgement = summary.judgement?.levelId ? getMathsCaptureLevelById(summary.judgement.levelId) : null;
                const barWidth = summary.lessonCount ? Math.max((summary.lessonCount / maxLessonCount) * 100, 18) : 0;
                return (
                  <ButtonBase
                    key={summary.unit.id}
                    role="listitem"
                    onClick={() => setSelectedUnitId(summary.unit.id)}
                    aria-pressed={selected}
                    sx={{
                      flex: '1 1 150px',
                      minWidth: { xs: 142, sm: 160 },
                      maxWidth: { xs: '100%', md: 210 },
                      p: 1,
                      display: 'block',
                      textAlign: 'left',
                      borderRadius: '12px',
                      border: selected ? `1px solid ${purple}` : '1px solid rgba(23, 21, 26, 0.11)',
                      bgcolor: selected ? palePurple : '#fff',
                      '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                    }}
                  >
                    <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 860, minHeight: 34, lineHeight: 1.25 }}>
                      {summary.unit.label || summary.unit.title}
                    </Typography>
                    <Box sx={{ mt: 0.75, height: 8, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.08)', overflow: 'hidden' }}>
                      {!!summary.lessonCount && <Box sx={{ width: `${barWidth}%`, height: '100%', bgcolor: purple }} />}
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.65 }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 720 }}>
                        {summary.lessonCount ? `${summary.lessonCount} lesson${summary.lessonCount === 1 ? '' : 's'}` : 'No evidence yet'}
                      </Typography>
                      {!!summary.assessments.length && <Box component="span" title="Assessment recorded" sx={{ width: 7, height: 7, bgcolor: darkText }} />}
                      {!!repeatedCount && <Box component="span" title="Repeated capture point" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: purple }} />}
                      {!!judgement && <Box component="span" title="Anna added a judgement" sx={{ width: 7, height: 7, border: `1.5px solid ${darkText}`, borderRadius: '2px' }} />}
                    </Stack>
                  </ButtonBase>
                );
              })}
            </Stack>
            <Stack direction="row" spacing={1.1} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
              {[
                'Bar length = lessons with evidence',
                'Square = assessment',
                'Dot = repeated capture point',
                'Outlined square = Anna judgement',
              ].map((item) => <Typography key={item} sx={{ color: 'text.secondary', fontSize: 11.6 }}>{item}</Typography>)}
            </Stack>
          </Box>

          <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', md: 'center' }}>
              <Box sx={{ flex: '1 1 260px', minWidth: 0 }}>
                <Typography component="h3" sx={{ color: darkText, fontSize: 16, fontWeight: 900 }}>{selectedSummary.unit.label || selectedSummary.unit.title}</Typography>
                <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.8 }}>
                  {selectedSummary.observations.length} observation{selectedSummary.observations.length === 1 ? '' : 's'} · {selectedSummary.assessments.length} assessment{selectedSummary.assessments.length === 1 ? '' : 's'} · {selectedSummary.observedCapturePointCount}/{selectedSummary.capturePoints.length} capture points observed
                </Typography>
                <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.5 }}>
                  Anna’s working judgement: {judgementLevel?.label || 'Not set'}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 850 }}>Pattern in this unit</Typography>
                {repeatedSequences.length ? (
                  <Stack spacing={0.5} sx={{ mt: 0.55 }}>
                    {repeatedSequences.slice(0, 3).map((sequence) => {
                      const first = sequence.observations[0];
                      const latest = sequence.observations[sequence.observations.length - 1];
                      const firstLevel = getMathsCaptureLevelById(first.levelId);
                      const latestLevel = getMathsCaptureLevelById(latest.levelId);
                      return (
                        <Typography key={sequence.capturePoint.id} sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                          {sequence.capturePoint.label}: {firstLevel?.label || first.levelId} to {latestLevel?.label || latest.levelId} · {formatDemoDate(first.date)}-{formatDemoDate(latest.date)}
                        </Typography>
                      );
                    })}
                    {repeatedSequences.length > 3 && <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>{repeatedSequences.length - 3} more repeated capture point{repeatedSequences.length - 3 === 1 ? '' : 's'}</Typography>}
                  </Stack>
                ) : (
                  <Typography sx={{ mt: 0.55, color: 'text.secondary', fontSize: 12.5 }}>No capture point has been observed more than once yet.</Typography>
                )}
              </Box>
              <Button variant="outlined" onClick={() => setDetailOpen(true)} sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', md: 'center' }, color: darkText, borderColor: 'rgba(23, 21, 26, 0.16)', textTransform: 'none', fontWeight: 820 }}>
                View evidence
              </Button>
            </Stack>
            {!!changedRepeatedSequences.length && (
              <Box sx={{ mt: 1, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                {changedRepeatedSequences.slice(0, 3).map((sequence) => (
                  <Chip key={sequence.capturePoint.id} label={`${sequence.capturePoint.label} changed`} size="small" sx={{ bgcolor: palePurple, color: darkText, fontWeight: 760 }} />
                ))}
              </Box>
            )}
            {!!latestUnitEvidence.length && (
              <Stack spacing={0.35} sx={{ mt: 1, pt: 0.8, borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
                {latestUnitEvidence.map((item) => (
                  <Typography key={item.id} sx={{ color: 'text.secondary', fontSize: 12.3 }}>
                    {formatDemoDate(item.date)} · {item.assessmentTitle || item.observationText || item.label}
                  </Typography>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Paper>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#fff' }}>
          <Stack spacing={1.4}>
            <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography component="h2" sx={{ color: darkText, fontSize: 18, fontWeight: 900 }}>{selectedSummary.unit.label || selectedSummary.unit.title}</Typography>
                <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.8 }}>Evidence detail · V3</Typography>
              </Box>
              <IconButton aria-label="Close evidence detail" onClick={() => setDetailOpen(false)} sx={{ color: 'text.secondary' }}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
              <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Structured observations</Typography>
              <Stack spacing={0.65} sx={{ mt: 0.8 }}>
                {selectedSequences.filter((sequence) => sequence.observations.length).map((sequence) => (
                  <Box key={sequence.capturePoint.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                    <Typography sx={{ color: darkText, fontSize: 12.9, fontWeight: 820 }}>{sequence.capturePoint.label}</Typography>
                    {sequence.observations.map((item) => {
                      const level = getMathsCaptureLevelById(item.levelId);
                      return (
                        <Typography key={item.id} sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.3 }}>
                          {formatDemoDate(item.date)} · {level?.label || item.levelId}{item.observationText ? ` · ${item.observationText}` : ''}
                        </Typography>
                      );
                    })}
                  </Box>
                ))}
                {!detailStructuredObservations.length && <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No structured observations recorded for this teaching unit.</Typography>}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
              <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Assessments</Typography>
              <Stack spacing={0.65} sx={{ mt: 0.8 }}>
                {selectedSummary.assessments.map((item) => (
                  <Box key={item.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                    <Typography sx={{ color: darkText, fontSize: 12.9, fontWeight: 820 }}>{item.assessmentTitle || item.label}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12.3 }}>{formatDemoDate(item.date)} · {item.percentage}%</Typography>
                    {item.note && <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>{item.note}</Typography>}
                  </Box>
                ))}
                {!selectedSummary.assessments.length && <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No assessments recorded for this teaching unit.</Typography>}
              </Stack>
            </Paper>

            {!!detailOtherObservations.length && (
              <Paper elevation={0} sx={{ p: 1.2, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Other teacher observations</Typography>
                <Stack spacing={0.45} sx={{ mt: 0.8 }}>
                  {detailOtherObservations.map((item) => (
                    <Typography key={item.id} sx={{ color: 'text.secondary', fontSize: 12.3 }}>
                      {formatDemoDate(item.date)} · {item.observationText || item.label}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            )}

            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
              <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Anna’s working judgement</Typography>
              <Stack spacing={0.9} sx={{ mt: 0.9 }}>
                <FormControl size="small">
                  <InputLabel id={`teacher-judgement-v3-${student.id}-${selectedSummary.unit.id}`}>Teacher judgement</InputLabel>
                  <Select
                    labelId={`teacher-judgement-v3-${student.id}-${selectedSummary.unit.id}`}
                    label="Teacher judgement"
                    value={draftLevelId}
                    onChange={(event) => setDraftLevelId(event.target.value)}
                  >
                    <MenuItem value="not-set">Not set</MenuItem>
                    {mathsCaptureLevels.map((level) => <MenuItem key={level.id} value={level.id}>{level.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  label="Teacher note"
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                  size="small"
                  multiline
                  minRows={2}
                />
                <Stack direction="row" spacing={0.8}>
                  <Button variant="contained" onClick={saveJudgement} sx={{ bgcolor: purple, textTransform: 'none', fontWeight: 820, '&:hover': { bgcolor: purple } }}>Save</Button>
                  <Button onClick={() => setDetailOpen(false)} sx={{ color: darkText, textTransform: 'none', fontWeight: 760 }}>Close</Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}

function StudentInsightPanel({ student, teachingUnits, evidenceTopics, evidence, onOpenStudent }) {
  const assessments = getStudentAssessments(evidence, student.id);
  const observations = getStudentObservations(evidence, student.id);
  const summary = getStudentEvidenceSummary(evidence, student.id, teachingUnits);
  const contentRows = getStudentEvidenceByContent(evidence, student.id, teachingUnits);
  const patterns = getStudentVisiblePatterns(evidence, student.id, teachingUnits);
  const topicById = new Map(evidenceTopics.map((topic) => [topic.id, topic]));
  const [teachingUnitDetailsOpen, setTeachingUnitDetailsOpen] = useState(false);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-insight-${student.id}`} sx={{ p: { xs: 1.25, sm: 1.6 }, borderRadius: '18px', border: '1px solid rgba(156, 40, 175, 0.14)', bgcolor: '#fff' }}>
        <Stack spacing={1.35}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
              {[
                `${summary.savedItemCount} saved item${summary.savedItemCount === 1 ? '' : 's'}`,
                `${summary.assessmentCount} assessment${summary.assessmentCount === 1 ? '' : 's'}`,
                `${summary.observationCount} observation${summary.observationCount === 1 ? '' : 's'}`,
                `${summary.contentAreaCount} content area${summary.contentAreaCount === 1 ? '' : 's'}`,
              ].map((item) => <Chip key={item} label={item} size="small" sx={{ bgcolor: palePurple, color: darkText, fontWeight: 760 }} />)}
            </Stack>
            <Button onClick={() => onOpenStudent(student.id)} sx={{ color: purple, fontWeight: 850 }}>Open full profile</Button>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.08fr) minmax(280px, 0.92fr)' }, gap: 1.25, alignItems: 'start' }}>
            <Stack spacing={1.25}>
              <AssessmentResultsChart assessments={assessments} evidenceTopics={evidenceTopics} />
              <CaptureProgressChart observations={observations} evidenceTopics={evidenceTopics} />
              <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Saved observation timeline</Typography>
                {observations.length ? (
                  <Stack spacing={0.9} sx={{ mt: 0.85 }}>
                    {observations.slice(0, 7).map((item) => {
                      const topic = topicById.get(item.evidenceTopicId);
                      const unit = getTeachingUnitById(item.teachingUnitId);
                      return (
                        <Box key={item.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.75 }}>
                          <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 760 }}>{formatDemoDate(item.date)} · {unit?.title || 'Teaching unit'} · {topic?.label || item.evidenceTopicId}</Typography>
                          <Typography sx={{ mt: 0.2, color: darkText, fontSize: 13.2, fontWeight: 780 }}>{item.observationText || item.label}</Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 13 }}>No saved observations yet.</Typography>
                )}
              </Paper>
            </Stack>

            <Stack spacing={1.25}>
              <ObservationContentGraph contentRows={contentRows} />
              <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Visible in the saved information</Typography>
                <Stack component="ul" spacing={0.65} sx={{ mt: 0.8, pl: 2.2, color: 'text.secondary' }}>
                  {patterns.map((pattern) => <Typography component="li" key={pattern} sx={{ fontSize: 12.8, lineHeight: 1.45 }}>{pattern}</Typography>)}
                </Stack>
              </Paper>
              <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', overflow: 'hidden' }}>
                <ButtonBase
                  onClick={() => setTeachingUnitDetailsOpen((open) => !open)}
                  aria-expanded={teachingUnitDetailsOpen}
                  sx={{
                    width: '100%',
                    p: 1.3,
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    gap: 1,
                    '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: -2 },
                  }}
                >
                  <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Evidence by teaching unit</Typography>
                  <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 20, transform: teachingUnitDetailsOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms ease' }} />
                </ButtonBase>
                {teachingUnitDetailsOpen && (
                  <Stack spacing={0.75} sx={{ px: 1.3, pb: 1.3 }}>
                    {contentRows.map((entry) => (
                      <Box key={entry.topic.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                        <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 820 }}>{entry.topic.label}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: 12.1 }}>
                          Topics: {(entry.topic.evidenceTopicIds || []).map((id) => getEvidenceTopicById(id)?.title || id).join(', ') || 'None linked'}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                          {entry.assessments.length ? `${entry.assessments.length} assessment${entry.assessments.length === 1 ? '' : 's'}` : 'No assessments'} · {entry.observations.length ? `${entry.observations.length} observation${entry.observations.length === 1 ? '' : 's'}` : 'No observations'}
                        </Typography>
                        <Typography sx={{ mt: 0.15, color: 'text.secondary', fontSize: 12.2 }}>
                          {entry.latestItem ? `Latest: ${entry.latestItem.assessmentTitle || entry.latestItem.observationText || entry.latestItem.label}` : 'No saved information'}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
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

function EvidenceMap({
  students,
  teachingUnits,
  evidenceTopics,
  evidence,
  cellNotes = {},
  unitNotes = {},
  onSaveCellNote,
  onSaveUnitNote,
  workingGroups,
  groupDefinitions,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveStudentToGroup,
  onMoveStudentToUngrouped,
  onResetGroups,
  onOpenStudent,
}) {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [expandedStudentViewVersion, setExpandedStudentViewVersion] = useState('original');
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
  const [hoveredStudentId, setHoveredStudentId] = useState('');
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

  function toggleStudent(studentId) {
    setExpandedStudentId((currentId) => (currentId === studentId ? null : studentId));
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

  function renderStudentRow(student, groupId = '', rowIndex) {
    const isExpanded = expandedStudentId === student.id;
    const isHovered = hoveredStudentId === student.id;
    const summariesByUnitId = studentUnitEvidenceModel.summariesByStudentId.get(student.id) || new Map();

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
              onClick={() => toggleStudent(student.id)}
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
              <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 820, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.displayName}</Typography>
            </ButtonBase>
          </Box>
          {teachingUnits.map((unit) => {
            const noteKey = getStudentUnitCellNoteKey(student.id, unit.id);
            const savedNote = cellNotes[noteKey] || unitNotes[unit.id] || '';
            const isEditingCell = editingCellKey === noteKey;
            const summary = summariesByUnitId.get(unit.id) || buildTeachingUnitEvidenceSummary(unit, [], null);
            const repeatedCount = getRepeatedSequenceGroups(summary).length;
            const visualDetail = summary.items.length
              ? `${summary.lessonCount} lesson${summary.lessonCount === 1 ? '' : 's'} with evidence, ${summary.assessments.length} assessment${summary.assessments.length === 1 ? '' : 's'}, ${summary.observedCapturePointCount} of ${summary.capturePoints.length} capture points observed${repeatedCount ? `, ${repeatedCount} repeated capture point${repeatedCount === 1 ? '' : 's'}` : ''}${summary.judgement?.levelId ? ', Anna judgement added' : ''}`
              : 'No evidence recorded';
            const cellDetail = savedNote ? `Manual note ${savedNote}` : visualDetail;
            return (
              <Box
                key={`${student.id}-${unit.id}`}
                role="cell"
                aria-label={`${student.displayName}, ${unit.title || unit.label}: ${cellDetail}`}
                onClick={() => startEditingCell(student.id, unit.id)}
                sx={{
                  p: 1,
                  borderTop: isHovered ? `1px solid rgba(156, 40, 175, 0.34)` : '1px solid rgba(23, 21, 26, 0.08)',
                  borderBottom: isHovered ? `1px solid rgba(156, 40, 175, 0.22)` : '1px solid transparent',
                  borderLeft: '1px solid rgba(23, 21, 26, 0.055)',
                  textAlign: 'left',
                  bgcolor: draggedStudentId === student.id ? 'rgba(156, 40, 175, 0.08)' : isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
                  cursor: 'text',
                  transition: 'background-color 140ms ease, border-color 140ms ease',
                }}
              >
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
            <Box role="cell" sx={{ gridColumn: `1 / span ${teachingUnits.length + 1}`, minWidth: 0 }}>
              <Box sx={{ p: { xs: 1, sm: 1.25 }, pb: 0, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
                <ButtonGroup variant="outlined" size="small" aria-label="Expanded student view version">
                  {[
                    { id: 'original', label: 'Original' },
                    { id: 'v2', label: 'V2 evidence view' },
                    { id: 'v3', label: 'V3 visual view' },
                  ].map((option) => {
                    const selected = expandedStudentViewVersion === option.id;
                    return (
                      <Button
                        key={option.id}
                        onClick={() => setExpandedStudentViewVersion(option.id)}
                        aria-pressed={selected}
                        sx={{
                          borderColor: selected ? purple : 'rgba(23, 21, 26, 0.14)',
                          bgcolor: selected ? purple : '#fff',
                          color: selected ? '#fff' : darkText,
                          textTransform: 'none',
                          fontWeight: 780,
                          '&:hover': { bgcolor: selected ? purple : '#fff', borderColor: selected ? purple : darkText },
                        }}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </Box>
              {expandedStudentViewVersion === 'v3' ? (
                <StudentInsightPanelV3
                  student={student}
                  teachingUnits={teachingUnits}
                  evidence={evidence}
                  judgements={teacherWorkingJudgements}
                  onSaveJudgement={saveTeacherWorkingJudgement}
                />
              ) : expandedStudentViewVersion === 'v2' ? (
                <StudentInsightPanelV2
                  student={student}
                  teachingUnits={teachingUnits}
                  evidence={evidence}
                  judgements={teacherWorkingJudgements}
                  onSaveJudgement={saveTeacherWorkingJudgement}
                />
              ) : (
                <StudentInsightPanel student={student} teachingUnits={teachingUnits} evidenceTopics={evidenceTopics} evidence={evidence} onOpenStudent={onOpenStudent} />
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
              gridColumn: `1 / span ${teachingUnits.length + 1}`,
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
                gridColumn: `1 / span ${teachingUnits.length + 1}`,
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
            gridTemplateColumns: `minmax(280px, 1fr) repeat(${teachingUnits.length}, 100px)`,
            border: '1px solid rgba(23, 21, 26, 0.12)',
            borderRadius: '14px',
            overflow: 'hidden',
            bgcolor: '#fff',
          }}
        >
          <Box role="columnheader" sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid rgba(23, 21, 26, 0.12)' }} />
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
                  cursor: 'text',
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
  evidenceTopics,
  evidence,
  cellNotes,
  unitNotes,
  onSaveCellNote,
  onSaveUnitNote,
  workingGroups,
  groupDefinitions,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveStudentToGroup,
  onMoveStudentToUngrouped,
  onResetGroups,
  onOpenStudentProfile,
}) {
  return (
    <Stack spacing={2.25} sx={{ minWidth: 0 }}>
      <EvidenceMap
        students={studentSummaries.map((summary) => summary.student)}
        teachingUnits={teachingUnits}
        evidenceTopics={evidenceTopics}
        evidence={evidence}
        cellNotes={cellNotes}
        unitNotes={unitNotes}
        onSaveCellNote={onSaveCellNote}
        onSaveUnitNote={onSaveUnitNote}
        workingGroups={workingGroups}
        groupDefinitions={groupDefinitions}
        onCreateGroup={onCreateGroup}
        onUpdateGroup={onUpdateGroup}
        onDeleteGroup={onDeleteGroup}
        onMoveStudentToGroup={onMoveStudentToGroup}
        onMoveStudentToUngrouped={onMoveStudentToUngrouped}
        onResetGroups={onResetGroups}
        onOpenStudent={onOpenStudentProfile}
      />
    </Stack>
  );
}

export default function Maths7AModule({ onBackToWeek, onClose }) {
  const [activeMode, setActiveMode] = useState('plan');
  const [selectedStudentId, setSelectedStudentId] = useState(defaultNowStudentId);
  const [localEvidencePayload, setLocalEvidencePayload] = useState(() => readMaths7ALocalEvidence());
  const [cellNotes, setCellNotes] = useState(() => readMaths7ACellNotes());
  const [unitNotes, setUnitNotes] = useState(() => readMaths7AUnitNotes());
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
  const allEvidence = useMemo(() => getMergedMathsEvidence(maths7AEvidence, localEvidencePayload), [localEvidencePayload]);
  const visibleEvidence = useMemo(() => allEvidence.filter((item) => item.date <= activeLesson.date), [activeLesson.date, allEvidence]);
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
      if (event.key === MATHS_7A_LESSON_INDEX_STORAGE_KEY) {
        setActiveLessonIndex(readMaths7ALessonIndex());
      }
      if (event.key === maths7ACellNotesStorageKey) {
        setCellNotes(readMaths7ACellNotes());
      }
      if (event.key === maths7AUnitNotesStorageKey) {
        setUnitNotes(readMaths7AUnitNotes());
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  function resetDemo() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(planningStorageKey);
    }
    setLocalEvidencePayload(resetMaths7ALocalEvidence().payload);
    setCellNotes(resetMaths7ACellNotes());
    setUnitNotes(resetMaths7AUnitNotes());
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
      <QuickCapture
        students={maths7AStudents}
        selectedStudentId={selectedStudentId}
        localEvidencePayload={localEvidencePayload}
        activeLesson={activeLesson}
        onRestartLessonSequence={restartLessonSequence}
        onLocalEvidencePayloadChange={setLocalEvidencePayload}
        onStudentChange={setSelectedStudentId}
      />
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
      evidenceTopics={mathsEvidenceTopics}
      evidence={visibleEvidence}
      cellNotes={cellNotes}
      unitNotes={unitNotes}
      onSaveCellNote={saveCellNote}
      onSaveUnitNote={saveUnitNote}
      workingGroups={workingGroups}
      groupDefinitions={classGroupDefinitions}
      onCreateGroup={createGroup}
      onUpdateGroup={updateGroup}
      onDeleteGroup={deleteGroup}
      onMoveStudentToGroup={moveStudentToGroup}
      onMoveStudentToUngrouped={moveStudentToUngrouped}
      onResetGroups={resetGroups}
      onOpenStudentProfile={(studentId) => {
        setSelectedStudentId(studentId);
        openStudentProfile(studentId);
      }}
    />
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
    </SubjectWorkspaceContainer>
  );
}
