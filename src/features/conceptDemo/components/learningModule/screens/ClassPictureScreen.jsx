import { useMemo, useState } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotesIcon from '@mui/icons-material/Notes';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { Box, ButtonBase, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import StudentUnitInsightPanel from '../StudentUnitInsightPanel.jsx';

const purple = '#9c28af';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';
const absentOrange = '#b85c00';

const learningObservationAreas = [
  { id: 'focus', label: 'Focus' },
  { id: 'participation', label: 'Participation' },
  { id: 'independence', label: 'Independence' },
];

const learningObservationChoices = [
  { id: '-', label: '-' },
  { id: '0', label: '0' },
  { id: '+', label: '+' },
];

function formatDemoDate(date) {
  if (!date) {
    return 'No saved date';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function sortByDate(items, direction = 'asc') {
  return [...(items || [])].sort((first, second) => {
    const comparison = (first.date || '').localeCompare(second.date || '');
    return direction === 'desc' ? -comparison : comparison;
  });
}

function getLatestDate(items) {
  return sortByDate(items, 'desc')[0]?.date || '';
}

function getAssessmentResultsForStudent(evidenceItems, studentId, teachingUnitId) {
  return (evidenceItems || [])
    .filter((item) => item.type === 'assessment' && (!teachingUnitId || item.teachingUnitId === teachingUnitId))
    .flatMap((assessment) => (assessment.results || [])
      .filter((result) => result.studentId === studentId)
      .map((result) => ({
        ...result,
        id: `${assessment.id}:${result.studentId}`,
        title: assessment.title,
        date: assessment.date,
        teachingUnitId: assessment.teachingUnitId,
        max: assessment.max,
        pass: assessment.pass,
      })));
}

function getObservationItemsForStudent(evidenceItems, studentId, teachingUnitId = '') {
  return (evidenceItems || []).filter((item) => (
    item.type !== 'assessment'
    && item.studentId === studentId
    && (!teachingUnitId || item.teachingUnitId === teachingUnitId)
  ));
}

function getStudentEvidenceItems(evidenceItems, studentId) {
  return [
    ...getObservationItemsForStudent(evidenceItems, studentId),
    ...getAssessmentResultsForStudent(evidenceItems, studentId),
  ];
}

function buildStudentUnitSummary(evidenceItems, studentId, teachingUnitId) {
  const observations = getObservationItemsForStudent(evidenceItems, studentId, teachingUnitId);
  const assessments = getAssessmentResultsForStudent(evidenceItems, studentId, teachingUnitId);

  return {
    unit: null,
    observations,
    assessments,
    items: [...observations, ...assessments],
  };
}

function buildAssessmentAlerts(evidenceItems, studentId) {
  return getAssessmentResultsForStudent(evidenceItems, studentId)
    .filter((result) => result.absent || result.warning || result.passed === false)
    .map((result) => ({
      ...result,
      type: result.absent ? 'absent' : 'not-passed',
      label: result.absent
        ? `${formatDemoDate(result.date)} · Absent · ${result.title}`
        : `${formatDemoDate(result.date)} · Not passed · ${result.title}`,
    }));
}

function EvidenceMarker({ summary }) {
  const assessments = (summary.assessments || [])
    .filter((assessment) => Number.isFinite(Number(assessment.percentage)))
    .sort((first, second) => (first.date || '').localeCompare(second.date || ''))
    .slice(-3);
  const observationCount = (summary.observations || []).length;
  const hasEvidence = Boolean(summary.items?.length);
  const density = Math.min(observationCount / 4, 1);

  if (!hasEvidence) {
    return (
      <Box sx={{ minHeight: 34, display: 'grid', placeItems: 'center' }}>
        <Box sx={{ width: 20, height: 2, borderRadius: 999, bgcolor: 'rgba(23, 21, 26, 0.18)' }} />
      </Box>
    );
  }

  return (
    <Stack spacing={0.55} justifyContent="center" sx={{ minHeight: 34 }}>
      <Stack direction="row" spacing={0.35} alignItems="center" sx={{ minHeight: 16 }}>
        {assessments.length ? assessments.map((assessment) => {
          const percentage = Math.max(0, Math.min(100, Number(assessment.percentage)));

          return (
            <Box
              key={assessment.id}
              title={`${assessment.title} · ${percentage}%`}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: `conic-gradient(${purple} 0 ${percentage}%, rgba(156, 40, 175, 0.13) ${percentage}% 100%)`,
                boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.28)',
              }}
            />
          );
        }) : (
          <Box sx={{ width: 24, height: 6, borderRadius: 999, bgcolor: 'rgba(156, 40, 175, 0.12)' }} />
        )}
      </Stack>
      <Box
        title={`${observationCount} observation${observationCount === 1 ? '' : 's'}`}
        sx={{
          height: 5,
          borderRadius: 999,
          bgcolor: 'rgba(23, 21, 26, 0.08)',
          overflow: 'hidden',
        }}
      >
        {!!observationCount && (
          <Box
            sx={{
              width: `${Math.max(density * 100, 18)}%`,
              height: '100%',
              borderRadius: 999,
              bgcolor: 'rgba(23, 21, 26, 0.42)',
            }}
          />
        )}
      </Box>
    </Stack>
  );
}

function getLearningObservationChoiceValue(choiceId) {
  if (choiceId === '+') {
    return 1;
  }
  if (choiceId === '-') {
    return -1;
  }
  return 0;
}

function LearningObservationTimelineGraph({ observations, activeObservationId, onActiveObservationChange }) {
  const sortedObservations = sortByDate(observations || [], 'asc');
  const pointEvents = sortedObservations.flatMap((observation) => (
    learningObservationAreas
      .filter((area) => observation[area.id])
      .map((area) => ({
        ...observation,
        id: `${observation.id}:${area.id}`,
        areaId: area.id,
        areaLabel: area.label,
        choiceId: observation[area.id],
        note: observation.comment || observation.note || '',
      }))
  ));
  const timestamps = pointEvents.map((observation) => new Date(`${observation.date}T12:00:00`).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const hasRange = Number.isFinite(minTime) && Number.isFinite(maxTime) && minTime !== maxTime;

  return (
    <Paper elevation={0} sx={{ p: 1.15, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: '100%' }}>
      <Stack spacing={0.8}>
        <Typography sx={{ color: darkText, fontSize: 13.6, fontWeight: 880 }}>Learning observation pattern</Typography>
        <Stack spacing={0.65}>
          {learningObservationAreas.map((area) => {
            const areaObservations = pointEvents.filter((observation) => observation.areaId === area.id);
            const points = areaObservations.map((observation) => {
              const timestamp = new Date(`${observation.date}T12:00:00`).getTime();
              const choiceValue = getLearningObservationChoiceValue(observation.choiceId);

              return {
                ...observation,
                x: hasRange ? 16 + ((timestamp - minTime) / (maxTime - minTime)) * 197 : 114,
                y: 36 - choiceValue * 14,
              };
            });
            const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

            return (
              <Box
                key={area.id}
                component="svg"
                role="img"
                aria-label={`${area.label} learning observations plotted over time`}
                viewBox="0 0 220 58"
                sx={{
                  width: '100%',
                  height: { xs: 92, sm: 108 },
                  display: 'block',
                  overflow: 'visible',
                  '& circle': { outline: 'none', transition: 'r 140ms ease, fill 140ms ease' },
                  '& circle:hover': { r: 4.4, fill: purple },
                }}
              >
                <text x="1" y="7" fill="rgba(23, 21, 26, 0.68)" fontSize="5.4" fontWeight="800">{area.label}</text>
                <text x="6" y="23.8" fill="rgba(23, 21, 26, 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">+</text>
                <text x="6" y="37.8" fill="rgba(23, 21, 26, 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">0</text>
                <text x="6" y="51.8" fill="rgba(23, 21, 26, 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">-</text>
                <line x1="16" y1="22" x2="213" y2="22" stroke="rgba(23, 21, 26, 0.05)" strokeWidth="1" />
                <line x1="16" y1="36" x2="213" y2="36" stroke="rgba(23, 21, 26, 0.1)" strokeWidth="1" />
                <line x1="16" y1="50" x2="213" y2="50" stroke="rgba(23, 21, 26, 0.05)" strokeWidth="1" />
                {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(156, 40, 175, 0.34)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />}
                {points.map((point) => {
                  const isActive = activeObservationId === point.id;

                  return (
                    <circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? '3.9' : '2.8'}
                      fill={purple}
                      stroke={isActive ? 'rgba(156, 40, 175, 0.28)' : '#fff'}
                      strokeWidth={isActive ? '2.4' : '1'}
                      tabIndex={0}
                      onMouseEnter={() => onActiveObservationChange?.(point)}
                      onFocus={() => onActiveObservationChange?.(point)}
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      <title>{`${formatDemoDate(point.date)} · ${area.label} · ${point.choiceId}${point.note ? ` · ${point.note}` : ''}`}</title>
                    </circle>
                  );
                })}
                {!points.length && (
                  <>
                    <line x1="24" y1="36" x2="86" y2="36" stroke="rgba(23, 21, 26, 0.16)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="55" cy="36" r="3" fill="rgba(23, 21, 26, 0.18)" />
                  </>
                )}
              </Box>
            );
          })}
        </Stack>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
          {pointEvents.length ? `${formatDemoDate(pointEvents[0].date)} to ${formatDemoDate(pointEvents[pointEvents.length - 1].date)}` : 'No learning observations yet'}
        </Typography>
      </Stack>
    </Paper>
  );
}

function LearningObservationHistoryPanel({ observations, activeObservation }) {
  const sortedObservations = sortByDate(observations || [], 'desc');
  const latestByAreaId = learningObservationAreas.reduce((itemsByArea, area) => {
    itemsByArea[area.id] = sortedObservations.find((observation) => observation[area.id]) || null;
    return itemsByArea;
  }, {});

  return (
    <Paper elevation={0} sx={{ p: 1.15, height: 310, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontSize: 13.6, fontWeight: 880 }}>Learning observations</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 0.8, mt: 0.9 }}>
        {learningObservationAreas.map((area) => {
          const latestObservation = latestByAreaId[area.id];
          const choice = latestObservation?.[area.id] || '';

          return (
            <Box key={area.id} sx={{ p: 1, minHeight: 68, borderRadius: '12px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
              <Typography sx={{ color: darkText, fontSize: 12.6, fontWeight: 850 }}>{area.label}</Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between" sx={{ mt: 0.45 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 650 }}>
                  {latestObservation ? formatDemoDate(latestObservation.date) : 'No entry yet'}
                </Typography>
                <Box
                  title={latestObservation ? `${area.label} · ${choice} · ${formatDemoDate(latestObservation.date)}` : `${area.label} · no observation`}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: latestObservation ? `1px solid ${purple}` : '1px solid rgba(23, 21, 26, 0.14)',
                    bgcolor: latestObservation ? purple : '#fff',
                    color: latestObservation ? '#fff' : 'rgba(23, 21, 26, 0.36)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 880,
                  }}
                >
                  {choice}
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          mt: 1,
          minHeight: 112,
          p: 1.25,
          borderRadius: '12px',
          border: '1px solid rgba(23, 21, 26, 0.07)',
          bgcolor: activeObservation ? 'rgba(156, 40, 175, 0.035)' : '#fff',
          transition: 'background-color 140ms ease',
        }}
      >
        {activeObservation ? (
          <Stack spacing={0.8}>
            <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880, lineHeight: 1.25 }}>
              {formatDemoDate(activeObservation.date)} · {activeObservation.areaLabel} · {activeObservation.choiceId}
            </Typography>
            <Box>
              <Typography sx={{ color: 'rgba(23, 21, 26, 0.42)', fontSize: 11.8, fontWeight: 840, lineHeight: 1.2 }}>
                Teacher comment
              </Typography>
              <Typography sx={{ mt: 0.35, pl: 0.9, color: 'text.secondary', fontSize: 13.4, lineHeight: 1.48, borderLeft: '3px solid rgba(156, 40, 175, 0.24)' }}>
                {activeObservation.note || 'No comment added.'}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography sx={{ color: 'rgba(23, 21, 26, 0.34)', fontSize: 13.2, lineHeight: 1.45 }}>
            Hover over a graph point to see the date and comment.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function StudentGlobalInsightPanel({ student, evidenceItems, rowNote, learningObservations, subjectTitle }) {
  const studentEvidence = getStudentEvidenceItems(evidenceItems, student.id);
  const previousResult = student.previousResults?.find((result) => result.subjectId === 'english') || student.previousResults?.[0] || null;
  const latestEvidenceDate = getLatestDate(studentEvidence);
  const [activeLearningObservation, setActiveLearningObservation] = useState(null);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-insight-global-${student.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: `4px solid ${purple}`, bgcolor: '#fff' }}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>Global student picture</Typography>
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.8 }}>
                Latest evidence: {latestEvidenceDate ? formatDemoDate(latestEvidenceDate) : 'None'}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2.15fr) minmax(220px, 0.85fr)' }, gap: 1.1, alignItems: 'stretch' }}>
            <LearningObservationTimelineGraph
              observations={learningObservations}
              activeObservationId={activeLearningObservation?.id || ''}
              onActiveObservationChange={setActiveLearningObservation}
            />
            <Stack spacing={1.1}>
              <LearningObservationHistoryPanel
                observations={learningObservations}
                activeObservation={activeLearningObservation}
              />
              <Paper elevation={0} sx={{ p: 0.95, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 880 }}>Known anchors</Typography>
                <Stack spacing={0.42} sx={{ mt: 0.65 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    Prior English · <Box component="span" sx={{ color: darkText, fontWeight: 800 }}>{previousResult?.grade || 'Not shown'}</Box>
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    Class · <Box component="span" sx={{ color: darkText, fontWeight: 800 }}>{subjectTitle} {String(student.classId || '').toUpperCase()}</Box>
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    Quick note · <Box component="span" sx={{ color: rowNote ? darkText : 'text.secondary', fontWeight: rowNote ? 800 : 650 }}>{rowNote || 'None added'}</Box>
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

function getStoredNotes(storageKey) {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredNotes(storageKey, notes) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(notes));
  }
  return notes;
}

function normalizeNote(value, maxLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function getStudentUnitCellNoteKey(studentId, unitId) {
  return `${studentId}:${unitId}`;
}

export default function ClassPictureScreen({ moduleConfig, screenConfig }) {
  const students = moduleConfig?.classData?.students || [];
  const teachingUnits = [...(moduleConfig?.curriculum?.teachingUnits || [])]
    .sort((first, second) => (first.order || 0) - (second.order || 0));
  const evidenceItems = moduleConfig?.evidence?.items || [];
  const learningObservations = moduleConfig?.evidence?.learningObservations || [];
  const skills = moduleConfig?.curriculum?.skills || [];
  const levels = moduleConfig?.curriculum?.observationLevels || [];
  const subjectTitle = moduleConfig?.subjectTitle || moduleConfig?.subjectId || 'Subject';
  const rowNotesStorageKey = `${moduleConfig?.id || 'learning-module'}-row-notes`;
  const cellNotesStorageKey = `${moduleConfig?.id || 'learning-module'}-cell-notes`;
  const unitNotesStorageKey = `${moduleConfig?.id || 'learning-module'}-unit-notes`;
  const [expandedStudentId, setExpandedStudentId] = useState('');
  const [expandedUnitId, setExpandedUnitId] = useState('');
  const [hoveredStudentId, setHoveredStudentId] = useState('');
  const [hoveredRowNoteStudentId, setHoveredRowNoteStudentId] = useState('');
  const [rowNotesVisible, setRowNotesVisible] = useState(true);
  const [rowNotes, setRowNotes] = useState(() => getStoredNotes(rowNotesStorageKey));
  const [cellNotes, setCellNotes] = useState(() => getStoredNotes(cellNotesStorageKey));
  const [unitNotes, setUnitNotes] = useState(() => getStoredNotes(unitNotesStorageKey));
  const [editingRowNoteStudentId, setEditingRowNoteStudentId] = useState('');
  const [draftRowNote, setDraftRowNote] = useState('');
  const [editingCellKey, setEditingCellKey] = useState('');
  const [draftCellNote, setDraftCellNote] = useState('');
  const [editingUnitId, setEditingUnitId] = useState('');
  const [draftUnitNote, setDraftUnitNote] = useState('');

  const summariesByStudentId = useMemo(() => {
    const summaries = new Map();
    students.forEach((student) => {
      const unitSummaries = new Map();
      teachingUnits.forEach((unit) => {
        unitSummaries.set(unit.id, {
          ...buildStudentUnitSummary(evidenceItems, student.id, unit.id),
          unit,
        });
      });
      summaries.set(student.id, unitSummaries);
    });
    return summaries;
  }, [evidenceItems, students, teachingUnits]);

  function toggleStudent(studentId, unitId = '') {
    if (expandedStudentId === studentId && expandedUnitId === unitId) {
      setExpandedStudentId('');
      setExpandedUnitId('');
    } else {
      setExpandedStudentId(studentId);
      setExpandedUnitId(unitId);
    }
  }

  function startEditingRowNote(studentId) {
    setEditingRowNoteStudentId(studentId);
    setDraftRowNote(rowNotes[studentId] || '');
  }

  function saveEditingRowNote() {
    if (!editingRowNoteStudentId) {
      return;
    }

    setRowNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeNote(draftRowNote, 60);

      if (note) {
        nextNotes[editingRowNoteStudentId] = note;
      } else {
        delete nextNotes[editingRowNoteStudentId];
      }

      return writeStoredNotes(rowNotesStorageKey, nextNotes);
    });
    setEditingRowNoteStudentId('');
    setDraftRowNote('');
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

    setCellNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeNote(draftCellNote, 16);

      if (note) {
        nextNotes[editingCellKey] = note;
      } else {
        delete nextNotes[editingCellKey];
      }

      return writeStoredNotes(cellNotesStorageKey, nextNotes);
    });
    setEditingCellKey('');
    setDraftCellNote('');
  }

  function cancelEditingCell() {
    setEditingCellKey('');
    setDraftCellNote('');
  }

  function cancelEditingRowNote() {
    setEditingRowNoteStudentId('');
    setDraftRowNote('');
  }

  function startEditingUnit(unitId) {
    setEditingUnitId(unitId);
    setDraftUnitNote(unitNotes[unitId] || '');
  }

  function saveEditingUnit() {
    if (!editingUnitId) {
      return;
    }

    setUnitNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeNote(draftUnitNote, 16);

      if (note) {
        nextNotes[editingUnitId] = note;
      } else {
        delete nextNotes[editingUnitId];
      }

      return writeStoredNotes(unitNotesStorageKey, nextNotes);
    });
    setEditingUnitId('');
    setDraftUnitNote('');
  }

  function cancelEditingUnit() {
    setEditingUnitId('');
    setDraftUnitNote('');
  }

  return (
    <Stack spacing={2.25} sx={{ minWidth: 0 }}>
      <Box sx={{ overflowX: { xs: 'auto', lg: 'visible' }, pb: 0.5 }}>
        <Box
          role="table"
          aria-label={`${moduleConfig?.title || 'Learning module'} class picture`}
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

          {students.map((student) => {
            const isExpanded = expandedStudentId === student.id;
            const isHovered = hoveredStudentId === student.id;
            const isRowNoteHovered = hoveredRowNoteStudentId === student.id;
            const rowNote = rowNotes[student.id] || '';
            const isEditingRowNote = editingRowNoteStudentId === student.id;
            const unitSummaries = summariesByStudentId.get(student.id) || new Map();
            const expandedUnit = expandedUnitId ? teachingUnits.find((unit) => unit.id === expandedUnitId) : null;
            const expandedUnitSummary = expandedUnitId
              ? unitSummaries.get(expandedUnitId) || {
                ...buildStudentUnitSummary([], student.id, expandedUnitId),
                unit: expandedUnit,
              }
              : null;
            const studentLearningObservations = sortByDate(
              learningObservations.filter((observation) => observation.studentId === student.id),
              'desc',
            );
            const alerts = buildAssessmentAlerts(evidenceItems, student.id);

            return (
              <Box key={student.id} role="rowgroup" sx={{ display: 'contents' }}>
                <Box
                  role="row"
                  onMouseEnter={() => setHoveredStudentId(student.id)}
                  onMouseLeave={() => setHoveredStudentId('')}
                  sx={{ display: 'contents' }}
                >
                  <Box
                    role="rowheader"
                    data-learning-module-row-cell="true"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.45,
                      p: 1,
                      borderTop: isHovered ? '1px solid rgba(156, 40, 175, 0.34)' : '1px solid rgba(23, 21, 26, 0.08)',
                      borderBottom: isHovered ? '1px solid rgba(156, 40, 175, 0.22)' : '1px solid transparent',
                      bgcolor: isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
                      minWidth: 0,
                      transition: 'background-color 140ms ease, border-color 140ms ease',
                    }}
                  >
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
                      <Typography sx={{ color: darkText, fontSize: isExpanded ? 18 : 13, fontWeight: isExpanded ? 920 : 820, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'font-size 140ms ease, font-weight 140ms ease' }}>
                        {student.displayName}
                      </Typography>
                    </ButtonBase>
                  </Box>

                  <Box
                    role="cell"
                    aria-label={`${student.displayName} assessment status`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 0.35,
                      flexWrap: 'wrap',
                      p: 0.45,
                      minWidth: 0,
                      borderTop: isHovered ? '1px solid rgba(156, 40, 175, 0.34)' : '1px solid rgba(23, 21, 26, 0.08)',
                      borderBottom: isHovered ? '1px solid rgba(156, 40, 175, 0.22)' : '1px solid transparent',
                      bgcolor: isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
                      transition: 'background-color 140ms ease, border-color 140ms ease',
                    }}
                  >
                    {alerts.map((alert) => (
                      <Tooltip key={alert.id} title={alert.label} arrow>
                        <Box
                          component="span"
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleStudent(student.id, alert.teachingUnitId)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleStudent(student.id, alert.teachingUnitId);
                            }
                          }}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                          }}
                        >
                          {alert.type === 'absent' ? (
                            <PersonOffOutlinedIcon aria-label={alert.label} sx={{ color: absentOrange, fontSize: isExpanded ? 18 : 15, flexShrink: 0, opacity: 0.88 }} />
                          ) : (
                            <ErrorOutlineIcon aria-label={alert.label} sx={{ color: purple, fontSize: isExpanded ? 18 : 15, flexShrink: 0, opacity: 0.88 }} />
                          )}
                        </Box>
                      </Tooltip>
                    ))}
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
                      borderTop: isHovered ? '1px solid rgba(156, 40, 175, 0.34)' : '1px solid rgba(23, 21, 26, 0.08)',
                      borderBottom: isHovered ? '1px solid rgba(156, 40, 175, 0.22)' : '1px solid transparent',
                      bgcolor: isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
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
                            {rowNote}
                          </Typography>
                        </Box>
                    ) : null}
                  </Box>

                  {teachingUnits.map((unit) => {
                    const summary = unitSummaries.get(unit.id) || buildStudentUnitSummary([], student.id, unit.id);
                    const noteKey = getStudentUnitCellNoteKey(student.id, unit.id);
                    const savedNote = cellNotes[noteKey] || unitNotes[unit.id] || '';
                    const isEditingCell = editingCellKey === noteKey;
                    const isActiveUnitCell = isExpanded && expandedUnitId === unit.id;
                    const cellDetail = savedNote
                      ? `Manual note ${savedNote}`
                      : summary.items.length
                        ? `${summary.observations.length} observation${summary.observations.length === 1 ? '' : 's'}, ${summary.assessments.length} assessment${summary.assessments.length === 1 ? '' : 's'}`
                        : 'No evidence recorded';

                    return (
                      <Box
                        key={`${student.id}:${unit.id}`}
                        role="cell"
                        aria-label={`${student.displayName}, ${unit.title || unit.label}: ${cellDetail}`}
                        onClick={() => toggleStudent(student.id, unit.id)}
                        sx={{
                          p: 1,
                          borderTop: isHovered ? '1px solid rgba(156, 40, 175, 0.34)' : '1px solid rgba(23, 21, 26, 0.08)',
                          borderBottom: isHovered ? '1px solid rgba(156, 40, 175, 0.22)' : '1px solid transparent',
                          borderLeft: '1px solid rgba(23, 21, 26, 0.055)',
                          textAlign: 'left',
                          position: 'relative',
                          bgcolor: isActiveUnitCell ? 'rgba(156, 40, 175, 0.095)' : isHovered ? 'rgba(156, 40, 175, 0.045)' : '#fff',
                          boxShadow: isActiveUnitCell ? 'inset 0 0 0 1px rgba(156, 40, 175, 0.22)' : 'none',
                          cursor: 'pointer',
                          transition: 'background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
                          '&:hover, &:focus-within': {
                            bgcolor: 'rgba(156, 40, 175, 0.085)',
                            boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.16)',
                          },
                          '&:hover .LearningModuleUnitNoteButton, &:focus-within .LearningModuleUnitNoteButton': {
                            opacity: 1,
                            transform: 'translateY(0) scale(1)',
                            pointerEvents: 'auto',
                            transitionDelay: '650ms',
                          },
                        }}
                      >
                        {!isEditingCell && (
                          <IconButton
                            className="LearningModuleUnitNoteButton"
                            aria-label={`Add note for ${student.displayName}, ${unit.title || unit.label}`}
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              startEditingCell(student.id, unit.id);
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
                              '&:hover': { bgcolor: purple, color: '#fff' },
                              '&:focus-visible': {
                                opacity: 1,
                                pointerEvents: 'auto',
                                outline: `2px solid ${purple}`,
                                outlineOffset: 1,
                              },
                            }}
                          >
                            <NotesIcon sx={{ fontSize: 12.5 }} />
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
                          <EvidenceMarker summary={summary} />
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {isExpanded && (
                  <Box role="row" sx={{ display: 'contents' }}>
                    <Box role="cell" sx={{ gridColumn: `1 / span ${teachingUnits.length + 3}`, minWidth: 0 }}>
                      {expandedUnitId && expandedUnitSummary ? (
                        <StudentUnitInsightPanel
                          student={student}
                          unit={expandedUnit}
                          summary={expandedUnitSummary}
                          configuredFocuses={(expandedUnit?.skillIds || [])
                            .map((skillId) => skills.find((skill) => skill.id === skillId))
                            .filter(Boolean)}
                          levels={levels}
                          onClose={() => {
                            setExpandedStudentId('');
                            setExpandedUnitId('');
                          }}
                        />
                      ) : (
                        <StudentGlobalInsightPanel
                          student={student}
                          evidenceItems={evidenceItems}
                          rowNote={rowNote}
                          learningObservations={studentLearningObservations}
                          subjectTitle={subjectTitle}
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Stack>
  );
}
