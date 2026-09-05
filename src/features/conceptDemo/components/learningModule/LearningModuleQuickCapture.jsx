import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Box,
  Button,
  ButtonBase,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
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

function getLevelMark(level) {
  return ['○', '◔', '◑', '●'][Math.max(0, (level.order || 1) - 1)] || level.label;
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

export default function LearningModuleQuickCapture({
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
  const [recentActionId, setRecentActionId] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [learnObservationSelections, setLearnObservationSelections] = useState({});
  const [learnObservationNotes, setLearnObservationNotes] = useState({});
  const [visibleLearnObservationNoteFields, setVisibleLearnObservationNoteFields] = useState({});
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
  const captureFocusById = useMemo(() => new Map(captureFocuses.map((unit) => [unit.id, unit])), [captureFocuses]);
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
    setRecentActionId('');
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
    if (!recentActionId) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setRecentActionId(''), 520);
    return () => window.clearTimeout(timeout);
  }, [recentActionId]);

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
    setRecentActionId(`${capturePoint.id}-${level.id}`);
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
    setRecentActionId('');
  }

  function chooseDirectCurriculum() {
    setCaptureMode('direct');
    const directUnit = captureFocuses.find((unit) => unit.id === activeLesson?.teachingUnitId)
      || captureFocuses.find((unit) => unit.id === activeUnitId)
      || captureFocuses[0];

    if (directUnit) {
      chooseUnit(directUnit);
    } else {
      setRecentActionId('');
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
    setRecentActionId('');
  }

  function getCapturePointCurriculumMapping(capturePoint) {
    const unit = captureFocusById.get(capturePoint.teachingUnitId || activeUnit?.id);
    const skill = skillById.get(capturePoint.skillId || capturePoint.observationDimensionId || capturePoint.id);

    return {
      areaLabel: unit?.label || activeUnit?.label || '',
      pointLabel: skill?.label || skill?.title || capturePoint.label || '',
    };
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

  const learnObservationsPanel = (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 0.95, sm: 1.1 },
        borderRadius: '12px',
        border: '1px solid rgba(var(--sd-primary-rgb), 0.14)',
        bgcolor: 'rgba(var(--sd-primary-rgb), 0.025)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)',
      }}
    >
      <Stack spacing={{ xs: 0.8, sm: 0.95 }}>
        <Typography sx={{ color: darkText, fontSize: { xs: 15.5, sm: 17 }, lineHeight: 1.18, fontWeight: 850 }}>
          Learning observations
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(132px, 150px) repeat(3, 36px) minmax(128px, 1fr)',
                sm: 'minmax(160px, 180px) repeat(3, 38px) minmax(180px, 1fr)',
              },
              columnGap: { xs: 0.25, sm: 0.3 },
              rowGap: 0.35,
              minWidth: { xs: 384, sm: 0 },
              alignItems: 'center',
            }}
          >
            <Box />
            {learningObservationChoices.map((choice) => (
              <Typography key={choice.id} aria-label={choice.id} sx={{ color: 'text.secondary', fontSize: 12.2, fontWeight: 760, textAlign: 'center', lineHeight: 1.2 }}>
                {choice.label}
              </Typography>
            ))}
            <Box />
            {learningObservationItems.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'contents',
                  '&:hover .learnObservationRowCell': { bgcolor: 'rgba(var(--sd-primary-rgb), 0.045)' },
                  '&:hover .learnObservationRowCell:first-of-type': { borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' },
                  '&:hover .learnObservationRowCell:last-child': { borderTopRightRadius: '8px', borderBottomRightRadius: '8px' },
                }}
              >
                <Typography className="learnObservationRowCell" sx={{ color: darkText, fontSize: 13.4, fontWeight: 850, lineHeight: 1.2, py: 0.25, transition: 'background-color 140ms ease' }}>
                  {item.label}
                </Typography>
                {learningObservationChoices.map((choice) => {
                  const isSelected = learnObservationSelections[item.id] === choice.id;
                  return (
                    <Box key={choice.id} className="learnObservationRowCell" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0, py: 0.2, transition: 'background-color 140ms ease' }}>
                      <Button
                        type="button"
                        variant="outlined"
                        aria-label={`${item.label}: ${choice.id}`}
                        aria-pressed={isSelected}
                        onClick={() => chooseLearningObservation(item.id, choice.id)}
                        sx={{
                          width: 32,
                          height: 32,
                          maxWidth: 32,
                          minHeight: 32,
                          minWidth: 32,
                          px: 0,
                          borderRadius: '999px',
                          borderColor: isSelected ? selectedPurple : 'rgba(var(--sd-text-rgb), 0.14)',
                          bgcolor: isSelected ? selectedPurple : 'var(--sd-surface)',
                          color: isSelected ? 'var(--sd-on-primary)' : 'text.secondary',
                          fontSize: 14,
                          fontWeight: isSelected ? 850 : 760,
                          lineHeight: 1,
                          textTransform: 'none',
                          transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                          '&:hover': {
                            borderColor: isSelected ? selectedPurple : darkText,
                            bgcolor: isSelected ? selectedPurple : 'var(--sd-surface)',
                            color: isSelected ? 'var(--sd-on-primary)' : darkText,
                          },
                          '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                        }}
                      />
                    </Box>
                  );
                })}
                <Box className="learnObservationRowCell" sx={{ minWidth: 0, py: 0.2, transition: 'background-color 140ms ease' }}>
                  {visibleLearnObservationNoteFields[item.id] ? (
                    <Box
                      component="input"
                      value={learnObservationNotes[item.id] || ''}
                      maxLength={100}
                      aria-label={`${item.label} note`}
                      onChange={(event) => updateLearnObservationNote(item.id, event.target.value)}
                      onBlur={() => hideLearnObservationNoteField(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          hideLearnObservationNoteField(item.id);
                          event.currentTarget.blur();
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault();
                          setVisibleLearnObservationNoteFields((currentFields) => ({
                            ...currentFields,
                            [item.id]: false,
                          }));
                          event.currentTarget.blur();
                        }
                      }}
                      ref={(input) => {
                        learnObservationNoteInputRefs.current[item.id] = input;
                      }}
                      sx={{
                        width: '100%',
                        height: 30,
                        px: 0.65,
                        border: `1px solid ${purple}`,
                        borderRadius: '8px',
                        color: darkText,
                        bgcolor: 'var(--sd-surface)',
                        font: 'inherit',
                        fontSize: 12.5,
                        fontWeight: 760,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <ButtonBase
                      type="button"
                      aria-label={learnObservationNotes[item.id] ? `Edit ${item.label} note` : `Add ${item.label} note`}
                      onClick={() => showLearnObservationNoteField(item.id)}
                      sx={{
                        width: '100%',
                        minWidth: 0,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        borderRadius: '8px',
                        '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          minHeight: 28,
                          px: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '8px',
                          bgcolor: 'rgba(var(--sd-primary-rgb), 0.055)',
                          transition: 'background-color 140ms ease',
                          '.MuiButtonBase-root:hover &': { bgcolor: 'rgba(var(--sd-primary-rgb), 0.13)' },
                        }}
                      >
                        <Typography sx={{ color: learnObservationNotes[item.id] ? 'var(--sd-text-muted)' : 'var(--sd-text-muted)', fontSize: 12.2, fontWeight: learnObservationNotes[item.id] ? 720 : 640, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {learnObservationNotes[item.id] || t('learningModule.classPicture.optionalShortNote')}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Stack>
    </Paper>
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
            justifyContent: 'flex-start',
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
                                        width: 30,
                                        height: 30,
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

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: '190px minmax(0, 1fr)',
          lg: '190px minmax(420px, 1fr) minmax(260px, 320px)',
        },
        gap: { xs: 1.15, md: 1.6 },
        alignItems: 'start',
        minWidth: 0,
      }}
    >
      <Paper
        elevation={0}
        aria-label="Students"
        sx={{
          p: { xs: 0.75, md: 1 },
          pb: { xs: 1.25, md: 1.75 },
          borderRadius: '14px',
          border: '1px solid rgba(var(--sd-text-rgb), 0.12)',
          bgcolor: 'var(--sd-surface)',
          maxHeight: { xs: 96, md: 700 },
          minHeight: { xs: 96, md: 560 },
          overflow: { xs: 'hidden', md: 'auto' },
          minWidth: 0,
        }}
      >
        <Box sx={{ px: 0.35, pb: { xs: 1.15, md: 1.35 } }}>
          <Typography sx={{ color: darkText, fontSize: { xs: 17.5, sm: 19.5 }, lineHeight: 1.15, fontWeight: 880 }}>
            Students
          </Typography>
          <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.2, lineHeight: 1.15, fontWeight: 650 }}>
            {t('learningModule.quickCapture.selectStudentBelow')}
          </Typography>
        </Box>
        <Stack
          spacing={0.7}
          sx={{
            display: { xs: 'grid', md: 'flex' },
            gridAutoFlow: { xs: 'column', md: 'row' },
            gridAutoColumns: { xs: 'minmax(132px, 1fr)', md: 'auto' },
            overflowX: { xs: 'auto', md: 'visible' },
            overflowY: 'hidden',
            pb: { xs: 0.4, md: 0 },
            '&::after': {
              content: '""',
              display: 'block',
              flex: { md: '0 0 18px' },
              width: { xs: 18, md: 'auto' },
              height: { xs: 'auto', md: 18 },
            },
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
                  border: isSelected ? `1px solid ${purple}` : '1px solid rgba(var(--sd-text-rgb), 0.12)',
                  bgcolor: isSelected ? purple : 'var(--sd-surface)',
                  color: isSelected ? 'var(--sd-on-primary)' : darkText,
                  fontWeight: isSelected ? 860 : 720,
                  '&:hover': { bgcolor: isSelected ? purple : 'var(--sd-surface)', borderColor: isSelected ? purple : darkText },
                  '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                }}
              >
                <Stack direction="row" spacing={0.65} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
                  <Typography sx={{ flex: '1 1 auto', minWidth: 0, fontSize: 15, fontWeight: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                        border: isSelected ? '1px solid rgba(var(--sd-surface-rgb), 0.72)' : '1px solid rgba(var(--sd-text-rgb), 0.16)',
                        color: isSelected ? 'var(--sd-on-primary)' : darkText,
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

      <Stack spacing={{ xs: 0.8, sm: 0.95 }} sx={{ minWidth: 0 }}>
        <Panel sx={{ p: { xs: 0.95, sm: 1.2, md: 1.35 }, borderRadius: '14px', border: '1px solid rgba(var(--sd-text-rgb), 0.12)' }}>
          <Stack spacing={{ xs: 0.8, sm: 0.95 }}>
            <Box>
              <Typography sx={{ color: darkText, fontSize: { xs: 17.5, sm: 19.5 }, lineHeight: 1.15, fontWeight: 880 }}>
                {captureMode === 'activity' && activeLearningContext
                  ? getLocalizedValue(activeLearningContext.label, language)
                  : activeUnit.label}
              </Typography>
              <Typography sx={{ mt: 0.15, color: 'text.secondary', fontSize: 12.6, fontWeight: 650 }}>
                {captureMode === 'activity' ? activeUnit.label : activeTopic.label}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: learningContexts.length && captureMode === 'activity'
                    ? 'minmax(140px, 0.7fr) minmax(180px, 1fr) auto'
                    : learningContexts.length
                      ? 'minmax(150px, 0.75fr) minmax(220px, 1.25fr) auto'
                      : 'minmax(220px, 1fr) auto',
                },
                gap: 0.75,
                alignItems: 'center',
              }}
            >
              {!!learningContexts.length && (
                <FormControl size="small" fullWidth>
                  <InputLabel id="capture-route-label">Route</InputLabel>
                  <Select
                    labelId="capture-route-label"
                    value={captureMode}
                    label="Route"
                    onChange={(event) => {
                      const nextMode = event.target.value;
                      if (nextMode === 'activity' && (activeLearningContext || learningContexts[0])) {
                        chooseLearningContext(activeLearningContext || learningContexts[0]);
                      } else {
                        chooseDirectCurriculum();
                      }
                    }}
                    sx={{
                      borderRadius: '10px',
                      bgcolor: 'var(--sd-surface)',
                      fontSize: 13,
                      fontWeight: 760,
                    }}
                  >
                    <MenuItem value="activity">Activity</MenuItem>
                    <MenuItem value="direct">Direct curriculum</MenuItem>
                  </Select>
                </FormControl>
              )}

              {!!learningContexts.length && captureMode === 'activity' && (
                <FormControl size="small" fullWidth>
                  <InputLabel id="capture-activity-label">Activity</InputLabel>
                  <Select
                    labelId="capture-activity-label"
                    value={activeLearningContext?.id || ''}
                    label="Activity"
                    onChange={(event) => {
                      const context = learningContexts.find((item) => item.id === event.target.value);
                      if (context) {
                        chooseLearningContext(context);
                      }
                    }}
                    sx={{
                      borderRadius: '10px',
                      bgcolor: 'var(--sd-surface)',
                      fontSize: 13,
                      fontWeight: 760,
                    }}
                  >
                    {learningContexts.map((context) => (
                      <MenuItem key={context.id} value={context.id}>
                        {getLocalizedValue(context.label, language)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {captureMode !== 'activity' && (
                <FormControl size="small" fullWidth>
                  <InputLabel id="capture-focus-label">Teaching unit</InputLabel>
                  <Select
                    labelId="capture-focus-label"
                    value={activeUnit?.id || ''}
                    label="Teaching unit"
                    onChange={(event) => {
                      const unit = captureFocuses.find((item) => item.id === event.target.value);
                      if (unit) {
                        chooseUnit(unit);
                      }
                    }}
                    sx={{
                      borderRadius: '10px',
                      bgcolor: 'var(--sd-surface)',
                      fontSize: 13,
                      fontWeight: 760,
                    }}
                  >
                    {selectableCaptureFocuses.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                type="button"
                onClick={() => onRestartLessonSequence?.()}
                startIcon={<RestartAltIcon fontSize="small" />}
                sx={{
                  minHeight: 40,
                  justifySelf: { xs: 'stretch', md: 'end' },
                  borderRadius: '10px',
                  border: '1px solid rgba(var(--sd-text-rgb), 0.14)',
                  color: 'text.secondary',
                  fontSize: 12.4,
                  fontWeight: 760,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: 'var(--sd-accent-text)', bgcolor: 'var(--sd-surface)', borderColor: purple },
                  '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                }}
              >
                Restart
              </Button>
            </Box>

            <Typography sx={{ color: darkText, fontSize: { xs: 15.5, sm: 17 }, lineHeight: 1.18, fontWeight: 850 }}>
              Unit Observations
            </Typography>

            <Paper elevation={0} sx={{ p: { xs: 0.7, sm: 0.85 }, borderRadius: '10px', border: '1px solid transparent', bgcolor: 'var(--sd-surface)', overflowX: 'auto' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(180px, 220px) minmax(158px, 190px) repeat(4, 36px)',
                    sm: 'minmax(230px, 1fr) minmax(210px, 0.85fr) repeat(4, 38px)',
                  },
                  columnGap: { xs: 0.25, sm: 0.3 },
                  rowGap: 0.35,
                  minWidth: { xs: 526, sm: 592 },
                  alignItems: 'center',
                }}
              >
                <Box />
                <Box />
                {levels.map((level) => (
                  <Typography key={level.id} aria-label={level.label} sx={{ color: 'text.secondary', fontSize: 12.2, fontWeight: 760, textAlign: 'center', lineHeight: 1.2 }}>
                    {getLevelMark(level)}
                  </Typography>
                ))}
                {activeCapturePoints.map((capturePoint) => {
                  const mapping = getCapturePointCurriculumMapping(capturePoint);

                  return (
                    <Box
                      key={capturePoint.id}
                      sx={{
                        display: 'contents',
                        '&:hover .unitObservationRowCell, &:focus-within .unitObservationRowCell': { bgcolor: 'rgba(var(--sd-primary-rgb), 0.045)' },
                        '&:hover .unitObservationMeta, &:focus-within .unitObservationMeta': { opacity: 1 },
                        '&:hover .unitObservationRowCell:first-of-type, &:focus-within .unitObservationRowCell:first-of-type': { borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' },
                        '&:hover .unitObservationRowCell:last-child, &:focus-within .unitObservationRowCell:last-child': { borderTopRightRadius: '8px', borderBottomRightRadius: '8px' },
                      }}
                    >
                      <Typography className="unitObservationRowCell" sx={{ color: darkText, fontSize: 13.4, fontWeight: 850, lineHeight: 1.2, py: 0.45, transition: 'background-color 140ms ease' }}>
                        {capturePoint.label}
                      </Typography>
                      <Box
                        className="unitObservationRowCell unitObservationMeta"
                        sx={{
                          minWidth: 0,
                          py: 0.35,
                          opacity: 0,
                          transition: 'opacity 140ms ease, background-color 140ms ease',
                        }}
                      >
                        <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 11.6, fontWeight: 850, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {mapping.areaLabel}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: 11.2, fontWeight: 720, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {mapping.pointLabel}
                        </Typography>
                      </Box>
                      {levels.map((level) => {
                        const isRecentAction = recentActionId === `${capturePoint.id}-${level.id}`;
                        const isCurrentLevel = currentLevelByCapturePointId[capturePoint.id] === level.id;
                        const isActive = isRecentAction || isCurrentLevel;
                        const hasCurrentLevel = Boolean(currentLevelByCapturePointId[capturePoint.id]);
                        const mainLabel = hasCurrentLevel ? `Update ${capturePoint.label} to ${level.label}` : `Add ${capturePoint.label} as ${level.label}`;

                        return (
                          <Box key={level.id} className="unitObservationRowCell" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0, py: 0.2, transition: 'background-color 140ms ease' }}>
                            <Button
                              type="button"
                              variant="outlined"
                              aria-label={mainLabel}
                              aria-pressed={isActive}
                              onClick={() => captureLevel(capturePoint, level, hasCurrentLevel ? 'update' : 'new')}
                              sx={{
                                width: 32,
                                height: 32,
                                maxWidth: 32,
                                minHeight: 32,
                                minWidth: 32,
                                px: 0,
                                borderRadius: '999px',
                                borderColor: isActive ? selectedPurple : 'rgba(var(--sd-text-rgb), 0.14)',
                                bgcolor: isActive ? selectedPurple : 'var(--sd-surface)',
                                color: isActive ? 'var(--sd-on-primary)' : 'text.secondary',
                                fontSize: 14,
                                fontWeight: isActive ? 850 : 760,
                                lineHeight: 1,
                                textTransform: 'none',
                                transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                                '&:hover': {
                                  borderColor: isActive ? selectedPurple : darkText,
                                  bgcolor: isActive ? selectedPurple : 'var(--sd-surface)',
                                  color: isActive ? 'var(--sd-on-primary)' : darkText,
                                },
                                '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
            {learnObservationsPanel}
          </Stack>
        </Panel>
        {capturedObservationsPanel}
        <Box aria-live="polite" sx={{ minHeight: 16 }}>
          {!!confirmation && (
            <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 760 }}>
              {confirmation}
            </Typography>
          )}
        </Box>
      </Stack>
      <Box sx={{ minWidth: 0, gridColumn: { xs: 'auto', md: '2 / 3', lg: 'auto' } }}>
        {observationSummaryPanel}
      </Box>
    </Box>
  );
}
