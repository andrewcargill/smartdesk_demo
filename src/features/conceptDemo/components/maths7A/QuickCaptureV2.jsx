import { useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Box,
  Button,
  ButtonBase,
  ButtonGroup,
  Divider,
  IconButton,
  Paper,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  getMathsCaptureLevelById,
  getMathsCapturePointById,
  getMathsCapturePointsForTopic,
  mathsCaptureLevels,
} from '../../data/mathsCaptureConfig.js';
import {
  addMaths7ALocalObservation,
  removeMaths7ALocalObservation,
  updateMaths7ALocalObservation,
} from '../../data/maths7AEvidenceStorage.js';

const purple = '#9c28af';
const darkText = '#17151a';
const learnObservationItems = [
  { id: 'focus', label: 'Focus' },
  { id: 'participation', label: 'Participation' },
  { id: 'independence', label: 'Independence' },
];
const learnObservationChoices = [
  { id: 'minus', label: '−' },
  { id: 'neutral', label: '○' },
  { id: 'plus', label: '+' },
];

function formatDemoLessonDate(date) {
  if (!date) {
    return 'No saved lesson date';
  }

  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`));
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

export default function QuickCaptureV2({
  students,
  selectedStudentId,
  localEvidencePayload,
  activeLesson,
  captureFocuses,
  onRestartLessonSequence,
  onLocalEvidencePayloadChange,
  onStudentChange,
}) {
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const [activeUnitId, setActiveUnitId] = useState(captureFocuses[0]?.id || '');
  const [activeTopicId, setActiveTopicId] = useState(captureFocuses[0]?.topics[0]?.id || '');
  const [contextAnchorEl, setContextAnchorEl] = useState(null);
  const [recentActionId, setRecentActionId] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [learnObservationSelections, setLearnObservationSelections] = useState({});
  const [learnObservationNotes, setLearnObservationNotes] = useState({});
  const [visibleLearnObservationNoteFields, setVisibleLearnObservationNoteFields] = useState({});
  const activeUnit = captureFocuses.find((unit) => unit.id === activeUnitId) || captureFocuses[0];
  const activeTopic = activeUnit?.topics.find((topic) => topic.id === activeTopicId) || activeUnit?.topics[0];
  const activeCapturePoints = activeUnit && activeTopic ? getMathsCapturePointsForTopic({
    teachingUnitId: activeUnit.id,
    evidenceTopicId: activeTopic.id,
  }) : [];
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
  }, {}), [activeCapturePoints, activeLesson.date, activeTopic?.id, activeUnit?.id, selectedStudentCaptures]);

  useEffect(() => {
    if (!captureFocuses.some((unit) => unit.id === activeUnitId)) {
      setActiveUnitId(captureFocuses[0]?.id || '');
      setActiveTopicId(captureFocuses[0]?.topics[0]?.id || '');
    }
  }, [activeUnitId, captureFocuses]);

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

  function chooseLearnObservation(itemId, choiceId) {
    setLearnObservationSelections((currentSelections) => ({
      ...currentSelections,
      [itemId]: choiceId,
    }));
  }

  function updateLearnObservationNote(itemId, value) {
    setLearnObservationNotes((currentNotes) => ({
      ...currentNotes,
      [itemId]: value.slice(0, 100),
    }));
  }

  function showLearnObservationNoteField(itemId) {
    setVisibleLearnObservationNoteFields((currentFields) => ({
      ...currentFields,
      [itemId]: true,
    }));
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
      <Stack spacing={0.55}>
        <Typography sx={{ color: darkText, fontSize: { xs: 17.5, sm: 19.5 }, lineHeight: 1.15, fontWeight: 880 }}>
          Learning observations
        </Typography>
        <Box sx={{ display: 'grid', gap: 0.45 }}>
          {learnObservationItems.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '120px auto minmax(260px, 1fr)' },
                gap: { xs: 0.45, sm: 0.55 },
                alignItems: 'center',
              }}
            >
              <Typography sx={{ color: darkText, fontSize: 13.4, fontWeight: 850, lineHeight: 1.2 }}>
                {item.label}
              </Typography>
              <ButtonGroup
                variant="outlined"
                size="small"
                aria-label={`${item.label} learn observation`}
                sx={{
                  justifySelf: { xs: 'stretch', sm: 'start' },
                  '& .MuiButtonGroup-grouped': {
                    minWidth: 34,
                    minHeight: 30,
                    borderColor: 'rgba(23, 21, 26, 0.14)',
                    color: darkText,
                    fontSize: 13,
                    fontWeight: 850,
                    textTransform: 'none',
                    '&:hover': { borderColor: purple, bgcolor: '#fff' },
                    '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                  },
                }}
              >
                {learnObservationChoices.map((choice) => {
                  const isSelected = learnObservationSelections[item.id] === choice.id;
                  return (
                    <Button
                      key={choice.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => chooseLearnObservation(item.id, choice.id)}
                      sx={{
                        flex: { xs: '1 1 0', sm: '0 0 36px' },
                        bgcolor: isSelected ? purple : '#fff',
                        color: isSelected ? '#fff !important' : darkText,
                        borderColor: isSelected ? `${purple} !important` : undefined,
                        '&:hover': { bgcolor: isSelected ? purple : '#fff' },
                      }}
                    >
                      {choice.label}
                    </Button>
                  );
                })}
              </ButtonGroup>
              <TextField
                value={learnObservationNotes[item.id] || ''}
                onChange={(event) => updateLearnObservationNote(item.id, event.target.value)}
                placeholder="Optional short note"
                size="small"
                fullWidth
                inputProps={{ maxLength: 100, 'aria-label': `${item.label} note` }}
                sx={{
                  display: visibleLearnObservationNoteFields[item.id] || learnObservationNotes[item.id] ? 'block' : 'none',
                  '& .MuiInputBase-root': {
                    minHeight: 30,
                    borderRadius: '999px',
                    fontSize: 12.4,
                    bgcolor: '#fff',
                  },
                  '& .MuiInputBase-input': {
                    py: 0.55,
                    px: 1.2,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(23, 21, 26, 0.14)',
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(23, 21, 26, 0.28)',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: purple,
                    borderWidth: 1,
                  },
                }}
              />
              {!visibleLearnObservationNoteFields[item.id] && !learnObservationNotes[item.id] && (
                <IconButton
                  type="button"
                  aria-label={`Add ${item.label} note`}
                  onClick={() => showLearnObservationNoteField(item.id)}
                  sx={{
                    width: 30,
                    height: 30,
                    justifySelf: 'start',
                    color: darkText,
                    '&:hover': { bgcolor: '#fff', color: purple },
                    '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                  }}
                >
                  <NoteAddIcon sx={{ fontSize: 17 }} />
                </IconButton>
              )}
            </Box>
          ))}
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
      <Stack spacing={0.55}>
        <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 850 }}>
          {`Captured for ${selectedStudent.displayName}`}
        </Typography>
        {selectedCaptureDateSections.length ? (
          <Stack spacing={0.85}>
            {selectedCaptureDateSections.map(({ date, unitSections }) => (
              <Box key={date} component="section" aria-labelledby={`now-capture-date-${date}`}>
                <Typography id={`now-capture-date-${date}`} component="h3" sx={{ color: darkText, fontSize: 12.6, fontWeight: 880 }}>
                  {formatDemoLessonDate(date)}
                </Typography>
                <Stack spacing={0.65} sx={{ mt: 0.35 }}>
                  {unitSections.map(({ unit, topicSections }) => (
                    <Box key={unit.id} component="section" aria-labelledby={`now-capture-unit-${date}-${unit.id}`}>
                      <Typography id={`now-capture-unit-${date}-${unit.id}`} component="h4" sx={{ color: 'text.secondary', fontSize: 11.9, fontWeight: 820 }}>
                        {unit.label}
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 0.3, pl: { xs: 0, sm: 0.75 } }}>
                        {topicSections.map(({ topic, captures }) => (
                          <Box key={topic.id} component="section" aria-labelledby={`now-capture-topic-${date}-${unit.id}-${topic.id}`}>
                            <Typography id={`now-capture-topic-${date}-${unit.id}-${topic.id}`} component="h5" sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 760 }}>
                              {topic.label}
                            </Typography>
                            <Box component="ul" sx={{ m: 0, mt: 0.25, p: 0, listStyle: 'none', display: 'grid', gap: 0.35 }}>
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
                                      aria-label={`Remove ${capturePointLabel}, ${levelLabel}, ${topic.label}, for ${selectedStudent.displayName}`}
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
        ) : (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.6, lineHeight: 1.45 }}>
            {`No observations captured for ${selectedStudent.firstName} yet.`}
          </Typography>
        )}
      </Stack>
    </Paper>
  );

  if (!selectedStudent || !activeUnit || !activeTopic) {
    return null;
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
          pb: { xs: 1.25, md: 1.75 },
          borderRadius: '14px',
          border: `2px solid ${purple}`,
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
                  '&:hover': {
                    bgcolor: isSelected ? purple : '#fff',
                    borderColor: isSelected ? purple : darkText,
                  },
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
        <Panel sx={{ p: { xs: 0.95, sm: 1.2, md: 1.35 }, borderRadius: '14px', border: `2px solid ${purple}` }}>
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
                  <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>
                    Capture focus
                  </Typography>
                  <Box>
                    <Typography sx={{ mb: 0.55, color: 'text.secondary', fontSize: 11.8, fontWeight: 760 }}>
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
                              borderColor: isActive ? purple : 'rgba(23, 21, 26, 0.14)',
                              bgcolor: isActive ? purple : '#fff',
                              color: isActive ? '#fff' : darkText,
                              fontSize: 11.8,
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
                    <Typography sx={{ mb: 0.55, color: 'text.secondary', fontSize: 11.8, fontWeight: 760 }}>
                      Topic
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.45 }}>
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
                              fontSize: 11.8,
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
                      fontSize: 12,
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

            <Box aria-live="polite" sx={{ minHeight: 16 }}>
              {!!confirmation && (
                <Typography sx={{ color: darkText, fontSize: 12.1, fontWeight: 760 }}>
                  {confirmation}
                </Typography>
              )}
            </Box>

            <Typography sx={{ color: darkText, fontSize: { xs: 17.5, sm: 19.5 }, lineHeight: 1.15, fontWeight: 880 }}>
              Unit Observations
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 0.6, sm: 0.7 } }}>
              {activeCapturePoints.map((capturePoint) => (
                <Paper
                  key={capturePoint.id}
                  elevation={0}
                  sx={{
                    p: { xs: 0.75, sm: 0.85 },
                    borderRadius: '10px',
                    border: '1px solid rgba(23, 21, 26, 0.14)',
                    bgcolor: '#fff',
                  }}
                >
                  <Stack spacing={0.65}>
                    <Typography sx={{ color: darkText, fontSize: 13.4, fontWeight: 850, lineHeight: 1.2 }}>
                      {capturePoint.label}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.45 }}>
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
                                minHeight: 32,
                                borderRadius: '999px',
                                borderColor: isRecentAction ? purple : 'rgba(23, 21, 26, 0.14)',
                                bgcolor: isRecentAction ? purple : '#fff',
                                color: isRecentAction ? '#fff' : darkText,
                                fontSize: 11.8,
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
                                minHeight: 32,
                                borderTopLeftRadius: '999px',
                                borderBottomLeftRadius: '999px',
                                borderTopRightRadius: isActive ? '999px' : 0,
                                borderBottomRightRadius: isActive ? '999px' : 0,
                                borderColor: isActive ? purple : 'rgba(23, 21, 26, 0.14)',
                                bgcolor: isActive ? purple : '#fff',
                                color: isActive ? '#fff' : darkText,
                                fontSize: 11.8,
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
                                  flex: '0 0 40px',
                                  minHeight: 32,
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
                              <AddIcon sx={{ fontSize: 16 }} />
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
            {learnObservationsPanel}
        </Stack>
        </Panel>
        {capturedObservationsPanel}
      </Stack>
    </Box>
  );
}
