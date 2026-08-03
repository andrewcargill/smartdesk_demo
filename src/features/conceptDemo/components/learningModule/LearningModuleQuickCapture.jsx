import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Box,
  Button,
  ButtonBase,
  Divider,
  IconButton,
  Paper,
  Popover,
  Stack,
  TextField,
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

const purple = '#9c28af';
const selectedPurple = '#b45ac2';
const darkText = '#17151a';

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
        border: '1px solid rgba(23, 21, 26, 0.1)',
        bgcolor: '#fff',
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
  const { t } = useConceptDemoLanguage();
  const learningObservationItems = useMemo(() => getLearningObservationItems(t), [t]);
  const captureFocuses = useMemo(
    () => buildCaptureFocuses(teachingUnits, skills, activeLesson, t),
    [activeLesson, skills, t, teachingUnits],
  );
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const initialUnitId = activeLesson?.teachingUnitId || captureFocuses[0]?.id || '';
  const [activeUnitId, setActiveUnitId] = useState(initialUnitId);
  const [activeTopicId, setActiveTopicId] = useState('');
  const [contextAnchorEl, setContextAnchorEl] = useState(null);
  const [recentActionId, setRecentActionId] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [learnObservationSelections, setLearnObservationSelections] = useState({});
  const [learnObservationNotes, setLearnObservationNotes] = useState({});
  const [visibleLearnObservationNoteFields, setVisibleLearnObservationNoteFields] = useState({});
  const [capturedObservationsOpen, setCapturedObservationsOpen] = useState(false);
  const learnObservationNoteInputRefs = useRef({});
  const activeUnit = captureFocuses.find((unit) => unit.id === activeUnitId) || captureFocuses[0];
  const activeTopic = activeUnit?.topics.find((topic) => topic.id === activeTopicId) || activeUnit?.topics[0];
  const activeCapturePoints = activeTopic?.capturePoints || [];
  const contextPanelOpen = Boolean(contextAnchorEl);
  const localObservations = localEvidencePayload?.observations || [];
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
        capture.teachingUnitId === activeUnit?.id
        && capture.evidenceTopicId === activeTopic?.id
        && (capture.skillId || capture.capturePointId) === capturePoint.id
        && capture.date === activeLesson?.date
      ))
      .sort((first, second) => (
        (second.updatedAt || second.createdAt || second.date).localeCompare(first.updatedAt || first.createdAt || first.date)
      ));

    if (matchingCaptures[0]) {
      levelsByCapturePoint[capturePoint.id] = matchingCaptures[0].levelId;
    }

    return levelsByCapturePoint;
  }, {}), [activeCapturePoints, activeLesson?.date, activeTopic?.id, activeUnit?.id, selectedStudentCaptures]);

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
        capture.teachingUnitId === activeUnit.id
        && capture.evidenceTopicId === activeTopic.id
        && (capture.skillId || capture.capturePointId) === capturePoint.id
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
      skillId: capturePoint.id,
      capturePointId: capturePoint.id,
      levelId: level.id,
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
        p: { xs: 0.75, sm: 0.85 },
        borderRadius: '10px',
        border: '1px solid transparent',
        bgcolor: '#fff',
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
                  '&:hover .learnObservationRowCell': { bgcolor: 'rgba(156, 40, 175, 0.045)' },
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
                          borderColor: isSelected ? selectedPurple : 'rgba(23, 21, 26, 0.14)',
                          bgcolor: isSelected ? selectedPurple : '#fff',
                          color: isSelected ? '#fff' : 'text.secondary',
                          fontSize: 14,
                          fontWeight: isSelected ? 850 : 760,
                          lineHeight: 1,
                          textTransform: 'none',
                          transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                          '&:hover': {
                            borderColor: isSelected ? selectedPurple : darkText,
                            bgcolor: isSelected ? selectedPurple : '#fff',
                            color: isSelected ? '#fff' : darkText,
                          },
                          '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                        }}
                      />
                    </Box>
                  );
                })}
                <Box className="learnObservationRowCell" sx={{ minWidth: 0, py: 0.2, transition: 'background-color 140ms ease' }}>
                  <TextField
                    value={learnObservationNotes[item.id] || ''}
                    onChange={(event) => updateLearnObservationNote(item.id, event.target.value)}
                    onBlur={() => hideLearnObservationNoteField(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        hideLearnObservationNoteField(item.id);
                        event.currentTarget.blur();
                      }
                    }}
                    placeholder="Optional short note"
                    size="small"
                    fullWidth
                    inputRef={(input) => {
                      learnObservationNoteInputRefs.current[item.id] = input;
                    }}
                    inputProps={{ maxLength: 100, 'aria-label': `${item.label} note` }}
                    sx={{
                      display: visibleLearnObservationNoteFields[item.id] ? 'block' : 'none',
                      '& .MuiInputBase-root': { minHeight: 32, borderRadius: '999px', fontSize: 12.4, bgcolor: '#fff' },
                      '& .MuiInputBase-input': { py: 0.55, px: 1.2 },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(23, 21, 26, 0.14)' },
                      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(23, 21, 26, 0.28)' },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: purple, borderWidth: 1 },
                    }}
                  />
                  {!visibleLearnObservationNoteFields[item.id] && !!learnObservationNotes[item.id] && (
                    <ButtonBase
                      type="button"
                      aria-label={`Edit ${item.label} note`}
                      onClick={() => showLearnObservationNoteField(item.id)}
                      sx={{
                        justifySelf: 'start',
                        minWidth: 0,
                        maxWidth: '100%',
                        textAlign: 'left',
                        borderRadius: '6px',
                        '&:hover': { color: purple },
                        '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                      }}
                    >
                      <Typography sx={{ color: 'text.secondary', fontSize: 12.4, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {learnObservationNotes[item.id]}
                      </Typography>
                    </ButtonBase>
                  )}
                  {!visibleLearnObservationNoteFields[item.id] && !learnObservationNotes[item.id] && (
                    <IconButton
                      type="button"
                      aria-label={`Add ${item.label} note`}
                      onClick={() => showLearnObservationNoteField(item.id)}
                      sx={{
                        justifySelf: 'start',
                        width: 32,
                        height: 32,
                        color: 'text.secondary',
                        '&:hover': { bgcolor: '#fff', color: purple },
                        '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                      }}
                    >
                      <NoteAddIcon sx={{ fontSize: 17 }} />
                    </IconButton>
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
        border: '1px solid rgba(23, 21, 26, 0.12)',
        bgcolor: '#fff',
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
            '&:hover': { color: purple, bgcolor: '#fff' },
            '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
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
                                const capturePoint = activeCapturePoints.find((point) => point.id === (capture.skillId || capture.capturePointId))
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
                                      border: '1px solid rgba(23, 21, 26, 0.08)',
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
                                        '&:hover': { color: darkText, bgcolor: '#fff' },
                                        '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
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
        aria-label="Students"
        sx={{
          p: { xs: 0.75, md: 1 },
          pb: { xs: 1.25, md: 1.75 },
          borderRadius: '14px',
          border: '1px solid rgba(23, 21, 26, 0.12)',
          bgcolor: '#fff',
          maxHeight: { xs: 96, md: 700 },
          minHeight: { xs: 96, md: 560 },
          overflow: { xs: 'hidden', md: 'auto' },
          minWidth: 0,
        }}
      >
        <Typography sx={{ px: 0.35, pb: { xs: 5.75, md: 6.75 }, color: darkText, fontSize: { xs: 17.5, sm: 19.5 }, lineHeight: 1.15, fontWeight: 880 }}>
          Students
        </Typography>
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
                  border: isSelected ? `1px solid ${purple}` : '1px solid rgba(23, 21, 26, 0.12)',
                  bgcolor: isSelected ? purple : '#fff',
                  color: isSelected ? '#fff' : darkText,
                  fontWeight: isSelected ? 860 : 720,
                  '&:hover': { bgcolor: isSelected ? purple : '#fff', borderColor: isSelected ? purple : darkText },
                  '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
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

      <Stack spacing={{ xs: 0.8, sm: 0.95 }} sx={{ minWidth: 0 }}>
        <Panel sx={{ p: { xs: 0.95, sm: 1.2, md: 1.35 }, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.12)' }}>
          <Stack spacing={{ xs: 0.8, sm: 0.95 }}>
            <Box>
              <Stack direction="row" spacing={0.65} alignItems="center">
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
                    fontSize: { xs: 17.5, sm: 19.5 },
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
              <Typography sx={{ mt: 0.15, color: 'text.secondary', fontSize: 12.6, fontWeight: 650 }}>
                {activeTopic.label}
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
                  mt: 0.55,
                  width: { xs: 'calc(100vw - 32px)', sm: 380 },
                  maxWidth: 'calc(100vw - 32px)',
                  p: 0,
                  borderRadius: '14px',
                  border: '1px solid rgba(23, 21, 26, 0.14)',
                  boxShadow: '0 18px 45px rgba(23, 21, 26, 0.14)',
                },
              }}
            >
              <Box sx={{ p: { xs: 1.55, sm: 1.75 } }}>
                <Stack spacing={1.2} role="dialog" aria-label="Capture focus">
                  <Typography sx={{ color: darkText, fontSize: 14.2, fontWeight: 880 }}>
                    Capture focus
                  </Typography>
                  <Box>
                    <Typography sx={{ mb: 0.55, color: 'text.secondary', fontSize: 12.2, fontWeight: 760 }}>
                      Teaching unit
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.45 }}>
                      {captureFocuses.map((unit) => {
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
                              borderColor: isActive ? selectedPurple : 'rgba(23, 21, 26, 0.14)',
                              bgcolor: isActive ? selectedPurple : '#fff',
                              color: isActive ? '#fff' : 'text.secondary',
                              fontSize: 12.4,
                              fontWeight: isActive ? 850 : 720,
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: isActive ? selectedPurple : '#fff',
                                borderColor: isActive ? selectedPurple : darkText,
                                color: isActive ? '#fff' : darkText,
                              },
                              '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                            }}
                          >
                            {unit.label}
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>
                  <Divider />
                  <Button
                    type="button"
                    onClick={() => {
                      onRestartLessonSequence?.();
                      closeContextPanel();
                    }}
                    startIcon={<RestartAltIcon fontSize="small" />}
                    sx={{
                      alignSelf: 'flex-start',
                      color: 'text.secondary',
                      fontSize: 12.4,
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

            <Typography sx={{ color: darkText, fontSize: { xs: 15.5, sm: 17 }, lineHeight: 1.18, fontWeight: 850 }}>
              Unit Observations
            </Typography>

            <Paper elevation={0} sx={{ p: { xs: 0.7, sm: 0.85 }, borderRadius: '10px', border: '1px solid transparent', bgcolor: '#fff', overflowX: 'auto' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(132px, 150px) repeat(4, 36px)',
                    sm: 'minmax(160px, 180px) repeat(4, 38px)',
                  },
                  columnGap: { xs: 0.25, sm: 0.3 },
                  rowGap: 0.35,
                  minWidth: { xs: 292, sm: 0 },
                  alignItems: 'center',
                }}
              >
                <Box />
                {levels.map((level) => (
                  <Typography key={level.id} aria-label={level.label} sx={{ color: 'text.secondary', fontSize: 12.2, fontWeight: 760, textAlign: 'center', lineHeight: 1.2 }}>
                    {getLevelMark(level)}
                  </Typography>
                ))}
                {activeCapturePoints.map((capturePoint) => (
                  <Box
                    key={capturePoint.id}
                    sx={{
                      display: 'contents',
                      '&:hover .unitObservationRowCell': { bgcolor: 'rgba(156, 40, 175, 0.045)' },
                      '&:hover .unitObservationRowCell:first-of-type': { borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' },
                      '&:hover .unitObservationRowCell:last-child': { borderTopRightRadius: '8px', borderBottomRightRadius: '8px' },
                    }}
                  >
                    <Typography className="unitObservationRowCell" sx={{ color: darkText, fontSize: 13.4, fontWeight: 850, lineHeight: 1.2, py: 0.45, transition: 'background-color 140ms ease' }}>
                      {capturePoint.label}
                    </Typography>
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
                              borderColor: isActive ? selectedPurple : 'rgba(23, 21, 26, 0.14)',
                              bgcolor: isActive ? selectedPurple : '#fff',
                              color: isActive ? '#fff' : 'text.secondary',
                              fontSize: 14,
                              fontWeight: isActive ? 850 : 760,
                              lineHeight: 1,
                              textTransform: 'none',
                              transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                              '&:hover': {
                                borderColor: isActive ? selectedPurple : darkText,
                                bgcolor: isActive ? selectedPurple : '#fff',
                                color: isActive ? '#fff' : darkText,
                              },
                              '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                ))}
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
    </Box>
  );
}
