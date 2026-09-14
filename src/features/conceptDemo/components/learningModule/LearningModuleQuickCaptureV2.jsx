import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Autocomplete,
  Box,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  ButtonBase,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  addLearningModuleLearningObservation,
  addLearningModuleObservation,
  flattenLearningObservationRecords,
  removeLearningModuleObservation,
  updateLearningModuleLearningObservation,
  updateLearningModuleObservation,
} from './utils/learningModuleEvidenceStorage.js';
import { useConceptDemoLanguage } from '../../ConceptDemoLanguageContext.jsx';

const purple = 'var(--sd-primary)';
const selectedPurple = 'var(--sd-primary-selected)';
const darkText = 'var(--sd-text)';

const learningObservationChoices = [
  { id: '-', label: '−' },
  { id: '0', label: '○' },
  { id: '+', label: '+' },
];

function formatDemoLessonDate(date) {
  if (!date) {
    return 'No saved lesson date';
  }

  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`));
}

function formatShortLessonDate(date) {
  if (!date) {
    return 'No date';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function LevelIcon({ level }) {
  const order = Math.min(4, Math.max(1, level.order || 1));

  return (
    <Box component="svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false" sx={{ width: 16, height: 16, flexShrink: 0 }}>
      {order === 2 && <path d="M10 10V3A7 7 0 0 1 17 10Z" fill="currentColor" />}
      {order === 3 && <path d="M10 3A7 7 0 0 1 10 17Z" fill="currentColor" />}
      <circle cx="10" cy="10" r="7" fill={order === 4 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
    </Box>
  );
}

function Panel({ children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '22px',
        border: '1px solid rgba(var(--sd-text-rgb), 0.1)',
        bgcolor: 'var(--sd-surface)',
        ...sx,
      }}
    >
      <Stack spacing={1.6}>
        {children}
      </Stack>
    </Paper>
  );
}

function getLearningObservationItems(t) {
  return [
    { id: 'focus', label: t('learningModule.evidenceLabels.focus') },
    { id: 'participation', label: t('learningModule.evidenceLabels.participation') },
    { id: 'independence', label: t('learningModule.evidenceLabels.independence') },
  ];
}

function getLocalizedValue(value, language = 'en') {
  if (value && typeof value === 'object') {
    return value[language] || value.en || Object.values(value)[0] || '';
  }

  return value || '';
}

function buildCaptureFocuses(teachingUnits, skills, activeLesson, t) {
  const skillById = new Map((skills || []).map((skill) => [skill.id, skill]));

  return (teachingUnits || [])
    .map((unit) => {
      const unitSkills = (unit.skillIds || [])
        .map((skillId) => skillById.get(skillId))
        .filter(Boolean);

      return {
        ...unit,
        label: unit.label || unit.title || unit.id,
        topics: [{
          id: `${unit.id}-observations`,
          label: unit.id === activeLesson?.teachingUnitId && activeLesson?.focus
            ? activeLesson.focus
            : t('learningModule.evidenceLabels.unitObservations'),
          capturePoints: unitSkills.map((skill) => ({
            ...skill,
            label: skill.label || skill.title || skill.id,
          })),
        }],
      };
    })
    .filter((unit) => unit.topics[0].capturePoints.length);
}

export default function LearningModuleQuickCaptureV2({
  moduleId,
  students,
  teachingUnits,
  skills,
  levels,
  learningContexts = [],
  subjectId = '',
  evidenceItems = [],
  selectedStudentId,
  localEvidencePayload,
  learningObservations = [],
  localLearningObservationPayload,
  activeLesson,
  onRestartLessonSequence,
  onLocalEvidencePayloadChange,
  onLocalLearningObservationPayloadChange,
  onStudentChange,
}) {
  const { language, t } = useConceptDemoLanguage();
  const learningObservationItems = useMemo(() => getLearningObservationItems(t), [t]);
  const captureFocuses = useMemo(
    () => buildCaptureFocuses(teachingUnits, skills, activeLesson, t),
    [activeLesson, skills, t, teachingUnits],
  );
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const initialUnitId = activeLesson?.teachingUnitId || captureFocuses[0]?.id || '';
  const [activeUnitId, setActiveUnitId] = useState(initialUnitId);
  const [activeTopicId, setActiveTopicId] = useState('');
  const [captureMode, setCaptureMode] = useState(learningContexts.length ? 'activity' : 'direct');
  const [activeLearningContextId, setActiveLearningContextId] = useState(learningContexts[0]?.id || '');
  const [confirmation, setConfirmation] = useState('');
  const [learnObservationSelections, setLearnObservationSelections] = useState({});
  const [learnObservationNotes, setLearnObservationNotes] = useState({});
  const [visibleLearnObservationNoteFields, setVisibleLearnObservationNoteFields] = useState({});
  const [setupOpen, setSetupOpen] = useState(false);
  const [hiddenPointsByContext, setHiddenPointsByContext] = useState({});
  const [studentDetailsOpen, setStudentDetailsOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [capturedObservationsOpen, setCapturedObservationsOpen] = useState(false);
  const learnObservationNoteInputRefs = useRef({});
  const activeUnit = captureFocuses.find((unit) => unit.id === activeUnitId) || captureFocuses[0];
  const activeTopic = activeUnit?.topics.find((topic) => topic.id === activeTopicId) || activeUnit?.topics[0];
  const activeLearningContext = learningContexts.find((context) => context.id === activeLearningContextId) || learningContexts[0] || null;
  const activeLearningContextAreaIds = useMemo(() => new Set(
    (activeLearningContext?.capturePoints || []).flatMap((point) => point.curriculumAreaIds || []),
  ), [activeLearningContext]);
  const activityCaptureFocuses = useMemo(() => (
    activeLearningContext
      ? captureFocuses.filter((unit) => activeLearningContextAreaIds.has(unit.id))
      : captureFocuses
  ), [activeLearningContext, activeLearningContextAreaIds, captureFocuses]);
  const selectableCaptureFocuses = useMemo(() => (
    captureMode === 'activity'
      ? activityCaptureFocuses
      : captureFocuses
  ), [activityCaptureFocuses, captureFocuses, captureMode]);
  const activeActivityCapturePoints = activeLearningContext
    ? (activeLearningContext.capturePoints || [])
      .map((point) => ({
        ...point,
        label: getLocalizedValue(point.label, language),
        skillId: point.observationDimensionId,
        capturePointId: point.id,
        teachingUnitId: point.curriculumAreaIds?.[0] || activeUnit?.id,
        evidenceTopicId: `${point.curriculumAreaIds?.[0] || activeUnit?.id}-observations`,
      }))
    : [];
  const activeCapturePoints = captureMode === 'activity'
    ? activeActivityCapturePoints
    : activeTopic?.capturePoints || [];
  const skillById = useMemo(() => new Map((skills || []).map((skill) => [skill.id, skill])), [skills]);
  const levelById = useMemo(() => new Map((levels || []).map((level) => [level.id, level])), [levels]);
  const unitById = useMemo(() => new Map((teachingUnits || []).map((unit) => [unit.id, unit])), [teachingUnits]);
  const learningContextCapturePointById = useMemo(() => new Map(
    (learningContexts || []).flatMap((context) => (context.capturePoints || []).map((point) => [
      point.id,
      {
        ...point,
        label: getLocalizedValue(point.label, language),
      },
    ])),
  ), [language, learningContexts]);
  const localObservations = localEvidencePayload?.observations || [];
  const seededObservations = useMemo(() => (evidenceItems || []).filter((item) => item.type !== 'assessment'), [evidenceItems]);

  useEffect(() => {
    if (!selectableCaptureFocuses.length || selectableCaptureFocuses.some((unit) => unit.id === activeUnitId)) {
      return;
    }

    const nextUnit = selectableCaptureFocuses[0];
    setActiveUnitId(nextUnit.id);
    setActiveTopicId(nextUnit.topics[0]?.id || '');
  }, [activeUnitId, selectableCaptureFocuses]);

  const visibleLocalObservations = useMemo(
    () => localObservations.filter((capture) => !activeLesson?.date || capture.date <= activeLesson.date),
    [activeLesson?.date, localObservations],
  );
  const captureCountsByStudentId = useMemo(() => visibleLocalObservations.reduce((counts, capture) => {
    counts[capture.studentId] = (counts[capture.studentId] || 0) + 1;
    return counts;
  }, {}), [visibleLocalObservations]);
  const selectedStudentCaptures = useMemo(
    () => visibleLocalObservations.filter((capture) => capture.studentId === selectedStudent?.id),
    [selectedStudent?.id, visibleLocalObservations],
  );
  const visibleStudentObservationSummaryItems = useMemo(() => [
    ...seededObservations,
    ...visibleLocalObservations,
  ]
    .filter((observation) => observation.studentId === selectedStudent?.id && (!activeLesson?.date || observation.date <= activeLesson.date))
    .sort((first, second) => (
      (second.updatedAt || second.createdAt || second.date || '').localeCompare(first.updatedAt || first.createdAt || first.date || '')
    )), [activeLesson?.date, seededObservations, selectedStudent?.id, visibleLocalObservations]);
  const currentMonthObservationSummaryItems = useMemo(() => {
    const activeMonth = activeLesson?.date?.slice(0, 7) || '';
    return visibleStudentObservationSummaryItems.filter((observation) => observation.date?.slice(0, 7) === activeMonth);
  }, [activeLesson?.date, visibleStudentObservationSummaryItems]);
  const visibleLearningObservations = useMemo(() => [
    ...flattenLearningObservationRecords(learningObservations),
    ...(localLearningObservationPayload?.observations || []),
  ].filter((observation) => !activeLesson?.date || observation.date <= activeLesson.date), [
    activeLesson?.date,
    learningObservations,
    localLearningObservationPayload,
  ]);
  const selectedStudentLearningObservations = useMemo(
    () => visibleLearningObservations.filter((observation) => observation.studentId === selectedStudent?.id),
    [selectedStudent?.id, visibleLearningObservations],
  );
  const currentLearningObservationByAreaId = useMemo(() => learningObservationItems.reduce((observationsByArea, area) => {
    const matchingObservations = selectedStudentLearningObservations
      .filter((observation) => observation.areaId === area.id && observation.date === activeLesson?.date)
      .sort((first, second) => (
        (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
      ));

    if (matchingObservations[0]) {
      observationsByArea[area.id] = matchingObservations[0];
    }

    return observationsByArea;
  }, {}), [activeLesson?.date, selectedStudentLearningObservations]);
  const selectedCaptureSections = useMemo(() => captureFocuses
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
    }, new Map()), [captureFocuses, selectedStudentCaptures]);
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
  const currentLevelByCapturePointId = useMemo(() => activeCapturePoints.reduce((levelsByCapturePoint, capturePoint) => {
    const matchingCaptures = selectedStudentCaptures
      .filter((capture) => (
        capture.teachingUnitId === (capturePoint.teachingUnitId || activeUnit?.id)
        && capture.evidenceTopicId === (capturePoint.evidenceTopicId || activeTopic?.id)
        && (capture.capturePointId || capture.skillId) === (capturePoint.capturePointId || capturePoint.id)
        && capture.date === activeLesson?.date
        && (captureMode !== 'activity' || capture.contextId === activeLearningContext?.id)
      ))
      .sort((first, second) => (
        (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
      ));

    if (matchingCaptures[0]) {
      levelsByCapturePoint[capturePoint.id] = matchingCaptures[0].levelId;
    }

    return levelsByCapturePoint;
  }, {}), [activeCapturePoints, activeLearningContext?.id, activeLesson?.date, activeTopic?.id, activeUnit?.id, captureMode, selectedStudentCaptures]);

  useEffect(() => {
    if (!captureFocuses.some((unit) => unit.id === activeUnitId)) {
      setActiveUnitId(initialUnitId);
      setActiveTopicId('');
    }
  }, [activeUnitId, captureFocuses, initialUnitId]);

  useEffect(() => {
    if (!activeTopicId && activeUnit?.topics[0]?.id) {
      setActiveTopicId(activeUnit.topics[0].id);
    }
  }, [activeTopicId, activeUnit]);

  useEffect(() => {
    if (!confirmation) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setConfirmation(''), 1800);
    return () => window.clearTimeout(timeout);
  }, [confirmation]);

  useEffect(() => {
    const visibleNoteFieldId = Object.entries(visibleLearnObservationNoteFields)
      .find(([, isVisible]) => isVisible)?.[0];

    if (visibleNoteFieldId) {
      window.requestAnimationFrame(() => {
        learnObservationNoteInputRefs.current[visibleNoteFieldId]?.focus();
      });
    }
  }, [visibleLearnObservationNoteFields]);

  useEffect(() => {
    setLearnObservationSelections(learningObservationItems.reduce((selections, item) => {
      const observation = currentLearningObservationByAreaId[item.id];
      if (observation?.choiceId) {
        selections[item.id] = observation.choiceId;
      }
      return selections;
    }, {}));
    setLearnObservationNotes(learningObservationItems.reduce((notes, item) => {
      const observation = currentLearningObservationByAreaId[item.id];
      if (observation?.note) {
        notes[item.id] = observation.note;
      }
      return notes;
    }, {}));
    setVisibleLearnObservationNoteFields({});
  }, [currentLearningObservationByAreaId]);

  function captureLevel(capturePoint, level, mode = 'update') {
    const latestLocalObservation = selectedStudentCaptures
      .filter((capture) => (
        capture.teachingUnitId === (capturePoint.teachingUnitId || activeUnit.id)
        && capture.evidenceTopicId === (capturePoint.evidenceTopicId || activeTopic.id)
        && (capture.capturePointId || capture.skillId) === (capturePoint.capturePointId || capturePoint.id)
        && capture.date === activeLesson.date
        && (captureMode !== 'activity' || capture.contextId === activeLearningContext?.id)
      ))
      .sort((first, second) => (
        (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
      ))[0] || null;
    const shouldUpdate = mode === 'update' && latestLocalObservation;
    const observationInput = {
      studentId: selectedStudent.id,
      date: activeLesson.date,
      teachingUnitId: capturePoint.teachingUnitId || activeUnit.id,
      evidenceTopicId: capturePoint.evidenceTopicId || activeTopic.id,
      skillId: capturePoint.skillId || capturePoint.observationDimensionId || capturePoint.id,
      capturePointId: capturePoint.capturePointId || capturePoint.id,
      levelId: level.id,
      ...(captureMode === 'activity' && activeLearningContext ? {
        contextId: activeLearningContext.id,
        contextLabel: activeLearningContext.label,
      } : {}),
    };
    const outcome = shouldUpdate
      ? updateLearningModuleObservation(moduleId, localEvidencePayload, latestLocalObservation.id, { levelId: level.id })
      : addLearningModuleObservation(moduleId, localEvidencePayload, observationInput);

    onLocalEvidencePayloadChange(outcome.payload);
    setConfirmation(outcome.persisted
      ? `Observation ${shouldUpdate ? 'updated' : 'added'} for ${selectedStudent.displayName}.`
      : `Observation ${shouldUpdate ? 'updated' : 'added'} for this session but could not be saved locally.`);
  }

  function removeCapture(captureId) {
    const outcome = removeLearningModuleObservation(moduleId, localEvidencePayload, captureId);

    onLocalEvidencePayloadChange(outcome.payload);
    setConfirmation(outcome.persisted
      ? `Observation removed for ${selectedStudent.displayName}.`
      : 'Observation removed for this session but could not be saved locally.');
  }

  function chooseUnit(unit) {
    setActiveUnitId(unit.id);
    setActiveTopicId(unit.topics[0]?.id || '');
  }

  function chooseDirectCurriculum() {
    setCaptureMode('direct');
    const directUnit = captureFocuses.find((unit) => unit.id === activeLesson?.teachingUnitId)
      || captureFocuses.find((unit) => unit.id === activeUnitId)
      || captureFocuses[0];

    if (directUnit) {
      chooseUnit(directUnit);
    }
  }

  function chooseLearningContext(context) {
    setActiveLearningContextId(context.id);
    setCaptureMode('activity');
    const primaryUnit = captureFocuses.find((unit) => unit.id === context.primaryCurriculumAreaId)
      || captureFocuses.find((unit) => (context.possibleCurriculumAreaIds || []).includes(unit.id));

    if (primaryUnit) {
      setActiveUnitId(primaryUnit.id);
      setActiveTopicId(primaryUnit.topics[0]?.id || '');
    }
  }

  function chooseLearningObservation(itemId, choiceId) {
    const latestLocalObservation = (localLearningObservationPayload?.observations || [])
      .filter((observation) => (
        observation.studentId === selectedStudent.id
        && observation.date === activeLesson.date
        && observation.areaId === itemId
      ))
      .sort((first, second) => (
        (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
      ))[0] || null;
    const note = learnObservationNotes[itemId] || currentLearningObservationByAreaId[itemId]?.note || '';
    const outcome = latestLocalObservation
      ? updateLearningModuleLearningObservation(moduleId, localLearningObservationPayload, latestLocalObservation.id, { choiceId, note })
      : addLearningModuleLearningObservation(moduleId, localLearningObservationPayload, {
        studentId: selectedStudent.id,
        date: activeLesson.date,
        areaId: itemId,
        choiceId,
        note,
      });

    onLocalLearningObservationPayloadChange(outcome.payload);
    setLearnObservationSelections((currentSelections) => ({
      ...currentSelections,
      [itemId]: choiceId,
    }));
    setConfirmation(outcome.persisted
      ? `Learning observation updated for ${selectedStudent.displayName}.`
      : 'Learning observation updated for this session but could not be saved locally.');
  }

  function updateLearnObservationNote(itemId, value) {
    setLearnObservationNotes((currentNotes) => ({
      ...currentNotes,
      [itemId]: value.slice(0, 100),
    }));
  }

  function hideLearnObservationNoteField(itemId) {
    const note = learnObservationNotes[itemId] || '';
    const currentObservation = currentLearningObservationByAreaId[itemId];
    const latestLocalObservation = (localLearningObservationPayload?.observations || [])
      .filter((observation) => (
        observation.studentId === selectedStudent.id
        && observation.date === activeLesson.date
        && observation.areaId === itemId
      ))
      .sort((first, second) => (
        (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
      ))[0] || null;

    if (note || currentObservation?.choiceId || learnObservationSelections[itemId]) {
      const outcome = latestLocalObservation
        ? updateLearningModuleLearningObservation(moduleId, localLearningObservationPayload, latestLocalObservation.id, { note })
        : addLearningModuleLearningObservation(moduleId, localLearningObservationPayload, {
          studentId: selectedStudent.id,
          date: activeLesson.date,
          areaId: itemId,
          choiceId: currentObservation?.choiceId || learnObservationSelections[itemId] || '',
          note,
        });

      onLocalLearningObservationPayloadChange(outcome.payload);
      setConfirmation(outcome.persisted
        ? `Note saved for ${selectedStudent.displayName}.`
        : 'Note kept for this session but could not be saved locally.');
    }

    setVisibleLearnObservationNoteFields((currentFields) => ({
      ...currentFields,
      [itemId]: false,
    }));
  }

  function showLearnObservationNoteField(itemId) {
    setVisibleLearnObservationNoteFields((currentFields) => ({
      ...currentFields,
      [itemId]: true,
    }));
  }

  if (!selectedStudent || !activeUnit || !activeTopic || !activeLesson) {
    return null;
  }

  const ratingButtonSx = (selected) => ({
    minWidth: 0, minHeight: 48, px: 0.5, py: 0.75, borderRadius: '10px',
    textTransform: 'none', lineHeight: 1.2, fontSize: 12, fontWeight: 700,
    border: '1px solid', borderColor: selected ? purple : 'rgba(var(--sd-text-rgb), 0.16)',
    bgcolor: selected ? purple : 'var(--sd-surface)',
    color: selected ? 'var(--sd-on-primary)' : darkText,
    '&:hover': { bgcolor: selected ? purple : 'rgba(var(--sd-primary-rgb), 0.08)', borderColor: purple },
    '&:focus-visible': { outline: '3px solid var(--sd-focus)', outlineOffset: 2 },
  });

  const learnObservationsPanel = (
    <Panel sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: '16px' }}>
      <Typography component="h3" sx={{ color: darkText, fontSize: 16, fontWeight: 800 }}>
        Learning observations
      </Typography>
      <Stack spacing={1.25}>
        {learningObservationItems.map((item) => (
          <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.75, alignItems: 'center' }}>
            <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 700, overflowWrap: 'anywhere' }}>{item.label}</Typography>
            <Stack direction="row" spacing={0.5}>
              {learningObservationChoices.map((choice) => (
                <Button key={choice.id} aria-label={`${item.label}: ${choice.id}`}
                  aria-pressed={learnObservationSelections[item.id] === choice.id}
                  onClick={() => chooseLearningObservation(item.id, choice.id)}
                  sx={{ ...ratingButtonSx(learnObservationSelections[item.id] === choice.id), width: 44, minHeight: 44, fontSize: 20 }}>
                  {choice.label}
                </Button>
              ))}
            </Stack>
            <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
              {visibleLearnObservationNoteFields[item.id] ? (
                <TextField fullWidth size="small" label={`${item.label} note`} value={learnObservationNotes[item.id] || ''}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                  inputRef={(input) => { learnObservationNoteInputRefs.current[item.id] = input; }}
                  onChange={(event) => updateLearnObservationNote(item.id, event.target.value)}
                  onBlur={() => hideLearnObservationNoteField(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === 'Escape') {
                      event.preventDefault();
                      event.target.blur();
                    }
                  }}
                  sx={{ '& input': { fontSize: 16 } }} />
              ) : (
                <Button onClick={() => showLearnObservationNoteField(item.id)}
                  aria-label={`${learnObservationNotes[item.id] ? 'Edit' : 'Add'} ${item.label} note`}
                  sx={{ minHeight: 44, px: 0, textTransform: 'none', color: 'text.secondary', fontSize: 12, justifyContent: 'flex-start', textAlign: 'left', overflowWrap: 'anywhere' }}>
                  {learnObservationNotes[item.id] || '+ Add a note'}
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Panel>
  );

  const capturedObservationsPanel = (
    <Paper
      elevation={0}
      aria-live="polite"
      sx={{
        p: { xs: 0.75, sm: 0.85 },
        borderRadius: '10px',
        border: '1px solid rgba(var(--sd-text-rgb), 0.12)',
        bgcolor: 'var(--sd-surface)',
      }}
    >
      <Stack spacing={capturedObservationsOpen ? 0.55 : 0}>
        <ButtonBase
          type="button"
          aria-expanded={capturedObservationsOpen}
          onClick={() => setCapturedObservationsOpen((isOpen) => !isOpen)}
          sx={{
            minHeight: 48,
            justifyContent: 'space-between',
            textAlign: 'left',
            borderRadius: '8px',
            color: darkText,
            '&:hover': { color: 'var(--sd-accent-text)', bgcolor: 'var(--sd-surface)' },
            '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
          }}
        >
          <Typography sx={{ color: 'inherit', fontSize: 13.2, fontWeight: 850 }}>
            {`Captured for ${selectedStudent.displayName}`}
          </Typography>
          <ExpandMoreIcon sx={{ transform: capturedObservationsOpen ? 'rotate(180deg)' : 'none' }} />
        </ButtonBase>
        {capturedObservationsOpen && selectedCaptureDateSections.length ? (
          <Stack spacing={0.85}>
            {selectedCaptureDateSections.map(({ date, unitSections }) => (
              <Box key={date} component="section" aria-labelledby={`learning-now-capture-date-${date}`}>
                <Typography id={`learning-now-capture-date-${date}`} component="h3" sx={{ color: darkText, fontSize: 12.6, fontWeight: 880 }}>
                  {formatDemoLessonDate(date)}
                </Typography>
                <Stack spacing={0.65} sx={{ mt: 0.35 }}>
                  {unitSections.map(({ unit, topicSections }) => (
                    <Box key={unit.id} component="section" aria-labelledby={`learning-now-capture-unit-${date}-${unit.id}`}>
                      <Typography id={`learning-now-capture-unit-${date}-${unit.id}`} component="h4" sx={{ color: 'text.secondary', fontSize: 11.9, fontWeight: 820 }}>
                        {unit.label}
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 0.3, pl: { xs: 0, sm: 0.75 } }}>
                        {topicSections.map(({ topic, captures }) => (
                          <Box key={topic.id} component="section" aria-labelledby={`learning-now-capture-topic-${date}-${unit.id}-${topic.id}`}>
                            <Typography id={`learning-now-capture-topic-${date}-${unit.id}-${topic.id}`} component="h5" sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 760 }}>
                              {topic.label}
                            </Typography>
                            <Box component="ul" sx={{ m: 0, mt: 0.25, p: 0, listStyle: 'none', display: 'grid', gap: 0.35 }}>
                              {captures.map((capture) => {
                                const capturePoint = learningContextCapturePointById.get(capture.capturePointId)
                                  || activeCapturePoints.find((point) => point.id === (capture.capturePointId || capture.skillId))
                                  || skills.find((skill) => skill.id === (capture.skillId || capture.capturePointId));
                                const captureLevel = levels.find((level) => level.id === capture.levelId);
                                const capturePointLabel = capturePoint?.label || capturePoint?.title || capture.skillId || 'Observation';
                                const levelLabel = captureLevel?.label || capture.levelId || 'Level';

                                return (
                                  <Box
                                    key={capture.id}
                                    component="li"
                                    sx={{
                                      display: 'grid',
                                      gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'minmax(0, 1fr) auto auto' },
                                      gap: { xs: 0.4, sm: 0.75 },
                                      alignItems: 'center',
                                      py: 0.4,
                                      px: 0.55,
                                      borderRadius: '8px',
                                      border: '1px solid rgba(var(--sd-text-rgb), 0.08)',
                                    }}
                                  >
                                    <Typography sx={{ color: darkText, fontSize: 12.5, fontWeight: 760, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {capturePointLabel}
                                    </Typography>
                                    <Typography sx={{ color: darkText, fontSize: 12, fontWeight: 850, justifySelf: { xs: 'start', sm: 'end' }, gridColumn: { xs: '1 / 2', sm: 'auto' } }}>
                                      {levelLabel}
                                    </Typography>
                                    <IconButton
                                      aria-label={`Remove ${capturePointLabel}, ${levelLabel}, for ${selectedStudent.displayName}`}
                                      onClick={() => removeCapture(capture.id)}
                                      size="small"
                                      sx={{
                                        width: 44,
                                        height: 44,
                                        color: 'text.secondary',
                                        justifySelf: 'end',
                                        gridColumn: { xs: '2 / 3', sm: 'auto' },
                                        gridRow: { xs: '1 / span 2', sm: 'auto' },
                                        '&:hover': { color: darkText, bgcolor: 'var(--sd-surface)' },
                                        '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 },
                                      }}
                                    >
                                      <CloseIcon sx={{ fontSize: 15 }} />
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
        ) : capturedObservationsOpen ? (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.6, lineHeight: 1.45 }}>
            {`No observations captured for ${selectedStudent.firstName || selectedStudent.displayName} yet.`}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );

  const latestSummaryObservation = visibleStudentObservationSummaryItems[0] || null;
  const recentMonthSummaryObservations = currentMonthObservationSummaryItems.slice(0, 4);
  const observationSummaryPanel = (
    <Paper
      elevation={0}
      aria-label={`Observation summary for ${selectedStudent.displayName}`}
      sx={{
        p: { xs: 1, md: 1.15 },
        borderRadius: '14px',
        border: '1px solid rgba(var(--sd-text-rgb), 0.12)',
        bgcolor: 'var(--sd-surface)',
        minWidth: 0,
      }}
    >
      <Stack spacing={1}>
        <Box>
          <Typography sx={{ color: darkText, fontSize: { xs: 16, sm: 17.5 }, lineHeight: 1.15, fontWeight: 880 }}>
            Observation summary
          </Typography>
          <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.2, lineHeight: 1.25, fontWeight: 650 }}>
            {selectedStudent.displayName}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.65 }}>
          <Box sx={{ p: 0.75, borderRadius: '9px', bgcolor: 'rgba(var(--sd-primary-rgb), 0.055)', border: '1px solid rgba(var(--sd-primary-rgb), 0.12)', minWidth: 0 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11.3, fontWeight: 760, lineHeight: 1.15 }}>
              This month
            </Typography>
            <Typography sx={{ mt: 0.2, color: darkText, fontSize: 19, fontWeight: 900, lineHeight: 1 }}>
              {currentMonthObservationSummaryItems.length}
            </Typography>
          </Box>
          <Box sx={{ p: 0.75, borderRadius: '9px', bgcolor: 'rgba(var(--sd-text-rgb), 0.035)', border: '1px solid rgba(var(--sd-text-rgb), 0.08)', minWidth: 0 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11.3, fontWeight: 760, lineHeight: 1.15 }}>
              Total seen
            </Typography>
            <Typography sx={{ mt: 0.2, color: darkText, fontSize: 19, fontWeight: 900, lineHeight: 1 }}>
              {visibleStudentObservationSummaryItems.length}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 0.85, borderRadius: '10px', border: '1px solid rgba(var(--sd-text-rgb), 0.08)', bgcolor: 'rgba(var(--sd-text-rgb), 0.018)', minWidth: 0 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 790, lineHeight: 1.2 }}>
            Last observation
          </Typography>
          {latestSummaryObservation ? (() => {
            const capturePoint = learningContextCapturePointById.get(latestSummaryObservation.capturePointId)
              || skillById.get(latestSummaryObservation.skillId || latestSummaryObservation.capturePointId);
            const level = levelById.get(latestSummaryObservation.levelId);
            const unit = unitById.get(latestSummaryObservation.teachingUnitId);
            const pointLabel = getLocalizedValue(capturePoint?.label || capturePoint?.title, language) || latestSummaryObservation.skillId || 'Observation';
            const levelLabel = getLocalizedValue(level?.label, language) || latestSummaryObservation.levelId || '';
            const unitLabel = getLocalizedValue(latestSummaryObservation.contextLabel, language)
              || getLocalizedValue(unit?.label || unit?.title, language)
              || '';

            return (
              <Stack spacing={0.25} sx={{ mt: 0.45, minWidth: 0 }}>
                <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860, lineHeight: 1.22 }}>
                  {pointLabel}
                </Typography>
                <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 12.1, fontWeight: 850, lineHeight: 1.2 }}>
                  {levelLabel}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 11.7, lineHeight: 1.25 }}>
                  {formatShortLessonDate(latestSummaryObservation.date)}{unitLabel ? ` · ${unitLabel}` : ''}
                </Typography>
              </Stack>
            );
          })() : (
            <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 12.4, lineHeight: 1.35 }}>
              No observations yet.
            </Typography>
          )}
        </Box>

        <Box>
          <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860, lineHeight: 1.2 }}>
            Recent this month
          </Typography>
          {recentMonthSummaryObservations.length ? (
            <Stack component="ul" spacing={0.55} sx={{ m: 0, mt: 0.65, p: 0, listStyle: 'none' }}>
              {recentMonthSummaryObservations.map((observation) => {
                const capturePoint = learningContextCapturePointById.get(observation.capturePointId)
                  || skillById.get(observation.skillId || observation.capturePointId);
                const level = levelById.get(observation.levelId);
                const pointLabel = getLocalizedValue(capturePoint?.label || capturePoint?.title, language) || observation.skillId || 'Observation';
                const levelLabel = getLocalizedValue(level?.label, language) || observation.levelId || '';

                return (
                  <Box key={observation.id || `${observation.date}-${observation.skillId}-${observation.levelId}`} component="li" sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.65, alignItems: 'baseline', py: 0.45, borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.07)' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: darkText, fontSize: 12.3, fontWeight: 800, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pointLabel}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.4, lineHeight: 1.2 }}>
                        {formatShortLessonDate(observation.date)}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 11.8, fontWeight: 880, whiteSpace: 'nowrap' }}>
                      {levelLabel}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Typography sx={{ mt: 0.55, color: 'text.secondary', fontSize: 12.4, lineHeight: 1.35 }}>
              No observations this month.
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );

  // Share the teacher's focus across students, but keep each lesson/activity independent.
  const visibilityKey = JSON.stringify([moduleId, activeLesson.date, captureMode,
    captureMode === 'activity' ? activeLearningContext?.id : activeUnit.id]);
  const hiddenPointIds = hiddenPointsByContext[visibilityKey] || [];
  const visibleCapturePoints = activeCapturePoints.filter((point) => !hiddenPointIds.includes(point.id));

  const studentIndex = students.findIndex((student) => student.id === selectedStudent.id);
  const filteredStudents = students.filter((student) => student.displayName.toLocaleLowerCase().includes(studentSearch.toLocaleLowerCase()));
  const contextLabel = captureMode === 'activity' && activeLearningContext
    ? getLocalizedValue(activeLearningContext.label, language) : activeUnit.label;

  return (
    <Box data-testid="quick-capture-v2" sx={{
      minWidth: 0, color: darkText,
      display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '210px minmax(0, 1fr)' },
      gap: 2, alignItems: 'start',
    }}>
      <Paper elevation={0} sx={{ display: { xs: 'none', lg: 'block' }, p: 1.5, borderRadius: '16px',
        border: '1px solid rgba(var(--sd-text-rgb), 0.1)', bgcolor: 'var(--sd-surface)', position: 'sticky', top: 16 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 800, mb: 1.5 }}>Students · {students.length}</Typography>
        <TextField fullWidth size="small" label="Find a student" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} />
        <Stack spacing={0.5} sx={{ mt: 1.5, maxHeight: '65vh', overflowY: 'auto', p: 0.5 }}>
          {filteredStudents.map((student) => (
            <ButtonBase key={student.id} onClick={() => onStudentChange(student.id)} aria-pressed={student.id === selectedStudent.id}
              sx={{ minHeight: 48, px: 1.25, borderRadius: '10px', justifyContent: 'space-between', gap: 1, textAlign: 'left',
                bgcolor: student.id === selectedStudent.id ? purple : 'transparent', color: student.id === selectedStudent.id ? 'var(--sd-on-primary)' : darkText,
                '&:focus-visible': { outline: '2px solid var(--sd-focus)' } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{student.displayName}</Typography>
              {!!captureCountsByStudentId[student.id] && <Typography sx={{ fontSize: 12 }}>{captureCountsByStudentId[student.id]}</Typography>}
            </ButtonBase>
          ))}
          {!filteredStudents.length && <Typography sx={{ p: 1, fontSize: 13 }}>No students found.</Typography>}
        </Stack>
      </Paper>

      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Paper elevation={0} sx={{ display: { xs: 'block', lg: 'none' }, position: 'sticky', top: 0, zIndex: 5, p: { xs: 0.25, sm: 1.75 },
          borderRadius: { xs: '8px', sm: '16px' }, bgcolor: 'var(--sd-surface)',
          border: { xs: '1px solid transparent', sm: '1px solid rgba(var(--sd-primary-rgb), 0.2)' },
          boxShadow: { xs: 'none', sm: '0 4px 16px rgba(0,0,0,0.05)' } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr) 44px', gap: { xs: 0.25, sm: 1 }, alignItems: 'center' }}>
            <IconButton aria-label="Previous student" disabled={studentIndex <= 0} onClick={() => onStudentChange(students[studentIndex - 1].id)} sx={{ width: 44, height: 44, border: '1px solid rgba(var(--sd-text-rgb), 0.15)' }}><ArrowBackIcon fontSize="small" /></IconButton>
            <Autocomplete options={students} value={selectedStudent} disableClearable
              getOptionLabel={(student) => student.displayName} isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, student) => { if (student) onStudentChange(student.id); }}
              renderInput={(params) => <TextField {...params} label="Student" size="small"
                slotProps={{ ...params.slotProps, input: { ...params.slotProps.input, startAdornment: (
                  <IconButton size="small" aria-label={`Student details for ${selectedStudent.displayName}`} aria-haspopup="dialog"
                    onClick={() => { setCapturedObservationsOpen(true); setStudentDetailsOpen(true); }}
                    sx={{ width: 44, height: 44, ml: -0.5, flexShrink: 0 }}>
                    <HistoryIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                ) } }} sx={{
                  '& input': { fontSize: 16, fontWeight: { xs: 500, sm: 750 } },
                  '& .MuiOutlinedInput-root': { py: { xs: 0, sm: 0.5 } },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: { xs: 'rgba(var(--sd-text-rgb), 0.08)', sm: undefined } },
                  '& .MuiInputLabel-root': { color: 'text.secondary' },
                }} />} />
            <IconButton aria-label="Next student" disabled={studentIndex >= students.length - 1} onClick={() => onStudentChange(students[studentIndex + 1].id)} sx={{ width: 44, height: 44, border: '1px solid rgba(var(--sd-text-rgb), 0.15)' }}><ArrowForwardIcon fontSize="small" /></IconButton>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ px: { xs: 1, sm: 1.5 }, py: { xs: 0, sm: 1.5 }, borderRadius: { xs: '8px', sm: '16px' }, bgcolor: 'var(--sd-surface)', border: { xs: '1px solid transparent', sm: '1px solid rgba(var(--sd-text-rgb), 0.1)' } }}>
          <ButtonBase onClick={() => setSetupOpen((open) => !open)} aria-expanded={setupOpen} aria-controls="capture-v2-setup" aria-label={t('learningModule.quickCapture.captureSettings', { title: contextLabel })}
            sx={{ width: '100%', minHeight: { xs: 44, sm: 48 }, justifyContent: 'space-between', textAlign: 'left', gap: 1, borderRadius: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: { xs: 500, sm: 800 }, color: { xs: 'text.secondary', sm: darkText } }}>{t(`learningModule.quickCapture.${captureMode === 'activity' ? 'activity' : 'curriculum'}`)}: {contextLabel}</Typography>
            </Box>
            <SettingsOutlinedIcon sx={{ fontSize: { xs: 18, sm: 22 }, color: 'rgba(var(--sd-text-rgb), 0.4)', flexShrink: 0 }} />
          </ButtonBase>
          <Collapse in={setupOpen} id="capture-v2-setup">
            <Stack spacing={1.5} sx={{ pt: 2 }}>
              {!!learningContexts.length && (
                <FormControl>
                  <FormLabel id="capture-v2-route-label" sx={{ fontSize: 12, color: 'text.secondary', '&.Mui-focused': { color: 'text.secondary' } }}>{t('learningModule.quickCapture.captureBy')}</FormLabel>
                  <RadioGroup row aria-labelledby="capture-v2-route-label" value={captureMode}
                    onChange={(_, mode) => {
                      if (mode === 'activity') chooseLearningContext(activeLearningContext || learningContexts[0]);
                      else chooseDirectCurriculum();
                    }} sx={{ columnGap: 2, flexWrap: 'wrap' }}>
                    {[['activity', t('learningModule.quickCapture.activity')], ['direct', t('learningModule.quickCapture.curriculum')]].map(([value, label]) => (
                      <FormControlLabel key={value} value={value} label={label}
                        sx={{ m: 0, minHeight: 44, '& .MuiFormControlLabel-label': { fontSize: 13, fontWeight: captureMode === value ? 600 : 400, color: 'text.secondary' } }}
                        control={<Radio size="small" sx={{ p: 1, pl: 0, color: 'rgba(var(--sd-text-rgb), 0.3)', '&.Mui-checked': { color: 'text.secondary' }, '& .MuiSvgIcon-root': { fontSize: 18 } }} />}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
              <FormControl fullWidth size="small">
                <InputLabel id="capture-v2-context-label">{t(`learningModule.quickCapture.${captureMode === 'activity' ? 'activity' : 'teachingUnit'}`)}</InputLabel>
                <Select labelId="capture-v2-context-label" label={t(`learningModule.quickCapture.${captureMode === 'activity' ? 'activity' : 'teachingUnit'}`)}
                  value={captureMode === 'activity' ? activeLearningContext?.id || '' : activeUnit.id}
                  onChange={(event) => {
                    if (captureMode === 'activity') chooseLearningContext(learningContexts.find((item) => item.id === event.target.value));
                    else chooseUnit(captureFocuses.find((item) => item.id === event.target.value));
                  }}>
                  {(captureMode === 'activity' ? learningContexts : selectableCaptureFocuses).map((item) => <MenuItem key={item.id} value={item.id}>{getLocalizedValue(item.label, language)}</MenuItem>)}
                </Select>
              </FormControl>
              <Button startIcon={<RestartAltIcon />} onClick={() => onRestartLessonSequence?.()} sx={{ alignSelf: 'flex-start', minHeight: 44, textTransform: 'none', color: 'text.secondary' }}>Restart</Button>
            </Stack>
          </Collapse>
        </Paper>

        {(setupOpen || visibleCapturePoints.length > 0 || !activeCapturePoints.length) && <Panel sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: '16px' }}>
          <Stack spacing={0}>
            {(setupOpen ? activeCapturePoints : visibleCapturePoints).map((point) => {
              const currentLevel = currentLevelByCapturePointId[point.id];
              const isHidden = hiddenPointIds.includes(point.id);
              return (
                <Box key={point.id} sx={{ py: 1.5, borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.08)', '&:last-child': { borderBottom: 0 },
                  display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(280px, 1.1fr)' }, gap: 1.25, alignItems: 'center' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography id={`capture-v2-point-${point.id}`} sx={{ fontSize: 14, fontWeight: 750, lineHeight: 1.4, color: isHidden ? 'text.secondary' : darkText }}>{point.label}</Typography>
                    {setupOpen && <Switch size="small" checked={!isHidden}
                      slotProps={{ input: { 'aria-label': `Show ${point.label}` } }}
                      sx={{ flexShrink: 0, my: 0.5 }}
                      onChange={(_, show) => setHiddenPointsByContext((current) => ({
                        ...current,
                        [visibilityKey]: show
                          ? (current[visibilityKey] || []).filter((id) => id !== point.id)
                          : [...new Set([...(current[visibilityKey] || []), point.id])],
                      }))} />}
                  </Stack>
                  <ToggleButtonGroup
                    disabled={isHidden}
                    exclusive
                    fullWidth
                    value={currentLevel || null}
                    aria-labelledby={`capture-v2-point-${point.id}`}
                    onChange={(_, levelId) => {
                      if (!levelId) return;
                      const level = levels.find((item) => item.id === levelId);
                      if (level) captureLevel(point, level, currentLevel ? 'update' : 'new');
                    }}
                    sx={{
                      borderRadius: '10px',
                      bgcolor: 'rgba(var(--sd-text-rgb), 0.025)',
                      '& .MuiToggleButton-root': {
                        flex: 1, minWidth: 0, minHeight: 48, py: 1,
                        borderColor: 'rgba(var(--sd-text-rgb), 0.16)', color: darkText,
                        '&.Mui-selected, &.Mui-selected:hover': { bgcolor: purple, color: 'var(--sd-on-primary)' },
                        '&:focus-visible': { outline: '3px solid var(--sd-focus)', outlineOffset: 2, zIndex: 1 },
                      },
                    }}
                  >
                    {levels.map((level) => (
                      <Tooltip key={level.id} title={level.label}>
                        <ToggleButton value={level.id} aria-label={`${point.label}: ${level.label}`}>
                          <LevelIcon level={level} />
                        </ToggleButton>
                      </Tooltip>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              );
            })}
            {!activeCapturePoints.length && <Typography sx={{ py: 2, fontSize: 14 }}>No capture points for this activity. Choose another activity above.</Typography>}
          </Stack>
        </Panel>}
        {learnObservationsPanel}
        <Dialog open={studentDetailsOpen} onClose={() => setStudentDetailsOpen(false)} fullWidth maxWidth="sm" aria-labelledby="capture-student-details-title">
          <DialogTitle id="capture-student-details-title">{selectedStudent.displayName}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {observationSummaryPanel}
              {capturedObservationsPanel}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStudentDetailsOpen(false)} sx={{ minHeight: 44, textTransform: 'none' }}>Back to capture</Button>
          </DialogActions>
        </Dialog>
        <Box role="status" aria-live="polite" aria-atomic="true" sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1400, width: 'max-content', maxWidth: 'calc(100vw - 32px)', pointerEvents: 'none' }}>
          {confirmation && <Paper elevation={4} sx={{ px: 2, py: 1.25, bgcolor: purple, color: 'var(--sd-on-primary)', borderRadius: '12px' }}><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{confirmation}</Typography></Paper>}
        </Box>
      </Stack>
    </Box>
  );
}
