import { useMemo, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Alert,
  Box,
  ButtonBase,
  Collapse,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { class8AStudents } from '../data/classes/class8AStudents.js';
import { buildSubject8AConfig } from './learningModule/data/subject8AConfigFactory.js';
import { fallbackMentorPicture, mentorSeed } from './mentorModule/data/mentor8AData.js';
import { CheckInStatusIcon, getCheckInStatusMeta } from './mentorModule/mentorCheckInStatus.jsx';
import MentorExpandedCellPanel from './mentorModule/MentorExpandedCellPanel.jsx';
import {
  border,
  darkText,
  formatDate,
  getLocalizedValue,
  getStatusMeta,
  getWeekOrDate,
  purple,
  StatusDot,
  subjectIds,
} from './mentorModule/mentorModuleShared.jsx';

const mentorStorageKey = 'smartdesk_demo_mentor_8a_picture';

function readStoredMentorPicture() {
  if (typeof window === 'undefined') return {};

  try {
    const value = window.localStorage.getItem(mentorStorageKey);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function writeStoredMentorPicture(value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(mentorStorageKey, JSON.stringify(value));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getStudentMentorPicture(studentId, overrides = {}) {
  return {
    ...fallbackMentorPicture,
    ...(mentorSeed[studentId] || {}),
    ...(overrides[studentId] || {}),
    subjectStatuses: {
      ...fallbackMentorPicture.subjectStatuses,
      ...(mentorSeed[studentId]?.subjectStatuses || {}),
      ...(overrides[studentId]?.subjectStatuses || {}),
    },
    subjectCheckIns: {
      ...fallbackMentorPicture.subjectCheckIns,
      ...(mentorSeed[studentId]?.subjectCheckIns || {}),
      ...(overrides[studentId]?.subjectCheckIns || {}),
    },
  };
}

function getSubjectFacts(config, studentId) {
  const observations = (config.evidence?.items || [])
    .filter((item) => item.type !== 'assessment' && item.studentId === studentId && item.date)
    .sort((first, second) => (second.date || '').localeCompare(first.date || ''));
  const assessments = (config.evidence?.items || [])
    .filter((item) => item.type === 'assessment' && item.date)
    .flatMap((assessment) => (assessment.results || [])
      .filter((result) => result.studentId === studentId)
      .map((result) => ({
        ...result,
        id: `${assessment.id}-${studentId}`,
        date: assessment.date,
        title: getLocalizedValue(assessment.title) || assessment.assessmentTitle || 'Assessment',
      })))
    .sort((first, second) => (second.date || '').localeCompare(first.date || ''));
  const currentActivity = (config.planning?.blocks || []).find((block) => block.status === 'current')
    || (config.planning?.blocks || [])[0]
    || null;

  return {
    observations,
    assessments,
    currentActivity,
  };
}

function StudentOverviewRow({ student, picture, subjectConfigs, selectedCell, onSelectCell }) {
  const latestCheckIn = [...(picture.checkIns || [])].sort((first, second) => second.date.localeCompare(first.date))[0];
  const nextFollowUp = (picture.followUps || []).find((item) => !item.completed);
  const selected = Boolean(selectedCell);
  const cellButtonSx = {
    minHeight: 34,
    justifyContent: 'flex-start',
    textAlign: 'left',
    borderRadius: '8px',
    px: 0.45,
    py: 0.35,
    '&:hover': { bgcolor: 'rgba(156, 40, 175, 0.045)' },
    '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '24px minmax(190px, 1.15fr) 104px minmax(180px, 0.9fr) minmax(170px, 0.95fr) minmax(128px, 0.65fr)',
        },
        gap: { xs: 0.6, md: 0.85 },
        alignItems: 'center',
        textAlign: 'left',
        px: 1,
        py: 0.85,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: selected ? 'rgba(156, 40, 175, 0.32)' : 'rgba(23, 21, 26, 0.08)',
        bgcolor: selected ? 'rgba(156, 40, 175, 0.045)' : '#fff',
        '&:hover': { bgcolor: selected ? 'rgba(156, 40, 175, 0.06)' : 'rgba(23, 21, 26, 0.025)' },
      }}
    >
      <ButtonBase
        type="button"
        aria-label={`${selectedCell === 'timeline' ? 'Collapse' : 'Expand'} ${student.displayName} timeline`}
        aria-expanded={selectedCell === 'timeline'}
        aria-pressed={selectedCell === 'timeline'}
        onClick={() => onSelectCell(student.id, 'timeline')}
        sx={{ display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center', justifyContent: 'center', width: 24, height: 28, borderRadius: '8px', '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 } }}
      >
        <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: selectedCell === 'timeline' ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms ease' }} />
      </ButtonBase>
      <Box sx={{ minWidth: 0, px: 0.45, py: 0.35 }}>
        <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: darkText, fontSize: selected ? 18 : 13, fontWeight: selected ? 920 : 820, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'font-size 140ms ease, font-weight 140ms ease' }}>
          {student.displayName}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 700 }}>
          8A
        </Typography>
        </Box>
      </Box>
      <ButtonBase type="button" aria-pressed={selectedCell === 'support'} onClick={() => onSelectCell(student.id, 'support')} sx={cellButtonSx}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <StatusDot status={picture.supportStatus} size={10} />
          <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 750 }}>{getStatusMeta(picture.supportStatus).label}</Typography>
        </Stack>
      </ButtonBase>
      <ButtonBase type="button" aria-pressed={selectedCell === 'checkIns'} onClick={() => onSelectCell(student.id, 'checkIns')} sx={cellButtonSx}>
        <Stack direction="row" spacing={0.35} alignItems="center">
          {(picture.checkIns || []).slice(-3).map((checkIn) => (
            <CheckInStatusIcon key={checkIn.id} status={checkIn.status} size={14} title={`${formatDate(checkIn.date)} · ${getCheckInStatusMeta(checkIn.status).label}`} />
          ))}
          <Typography sx={{ pl: 0.25, color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>
            {latestCheckIn ? formatDate(latestCheckIn.date) : 'None'}
          </Typography>
        </Stack>
      </ButtonBase>
      <ButtonBase type="button" aria-pressed={selectedCell === 'subjects'} onClick={() => onSelectCell(student.id, 'subjects')} sx={cellButtonSx}>
        <Stack direction="row" spacing={0.55} alignItems="center">
          {subjectIds.map((subjectId) => (
            <StatusDot
              key={subjectId}
              size={10}
              status={picture.subjectStatuses[subjectId]}
              title={`${getLocalizedValue(subjectConfigs[subjectId]?.subjectTitle)}: ${getStatusMeta(picture.subjectStatuses[subjectId]).label}`}
            />
          ))}
        </Stack>
      </ButtonBase>
      <ButtonBase type="button" aria-pressed={selectedCell === 'followUp'} onClick={() => onSelectCell(student.id, 'followUp')} sx={cellButtonSx}>
        <Typography sx={{ color: nextFollowUp ? darkText : 'text.secondary', fontSize: 11.8, fontWeight: nextFollowUp ? 820 : 680, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {nextFollowUp ? getWeekOrDate(nextFollowUp) : '-'}
        </Typography>
      </ButtonBase>
    </Box>
  );
}

export default function MentorModule() {
  const [overrides, setOverrides] = useState(() => readStoredMentorPicture());
  const [expandedCell, setExpandedCell] = useState({ studentId: '', cellId: '' });
  const [selectedSubjectId, setSelectedSubjectId] = useState('english');
  const [activeFilter, setActiveFilter] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const subjectConfigs = useMemo(() => subjectIds.reduce((configs, subjectId) => {
    configs[subjectId] = buildSubject8AConfig({ subjectId });
    return configs;
  }, {}), []);
  const students = class8AStudents;
  const selectedStudent = students.find((student) => student.id === expandedCell.studentId) || students[0];
  const selectedPicture = getStudentMentorPicture(selectedStudent?.id, overrides);
  const selectedSubjectConfig = subjectConfigs[selectedSubjectId] || subjectConfigs.english;
  const selectedSubjectFacts = getSubjectFacts(selectedSubjectConfig, selectedStudent?.id);
  const pictures = useMemo(() => students.reduce((items, student) => {
    items[student.id] = getStudentMentorPicture(student.id, overrides);
    return items;
  }, {}), [overrides, students]);
  const redMentorCount = students.filter((student) => pictures[student.id].mentorStatus === 'red').length;
  const activeSupportCount = students.filter((student) => pictures[student.id].supportStatus !== 'green').length;
  const upcomingFollowUpCount = students.reduce((total, student) => total + (pictures[student.id].followUps || []).filter((item) => !item.completed).length, 0);
  const summaryFilters = [
    {
      id: 'redMentor',
      label: 'Red mentor status',
      value: redMentorCount,
      matches: (student) => pictures[student.id].mentorStatus === 'red',
    },
    {
      id: 'activeSupport',
      label: 'Active support',
      value: activeSupportCount,
      matches: (student) => pictures[student.id].supportStatus !== 'green',
    },
    {
      id: 'upcomingFollowUps',
      label: 'Upcoming follow-ups',
      value: upcomingFollowUpCount,
      matches: (student) => (pictures[student.id].followUps || []).some((item) => !item.completed),
    },
  ];
  const currentFilter = summaryFilters.find((filter) => filter.id === activeFilter);
  const filteredStudents = currentFilter ? students.filter(currentFilter.matches) : students;

  function toggleExpandedCell(studentId, cellId) {
    setExpandedCell((current) => (
      current.studentId === studentId && current.cellId === cellId
        ? { studentId: '', cellId: '' }
        : { studentId, cellId }
    ));
  }

  function updateSupportStatus(studentId, status, comment) {
    const picture = getStudentMentorPicture(studentId, overrides);
    const historyItem = {
      id: `support-history-${Date.now()}`,
      status,
      comment,
      date: todayIso(),
    };
    const nextOverrides = {
      ...overrides,
      [studentId]: {
        ...(overrides[studentId] || {}),
        supportStatus: status,
        supportHistory: [historyItem, ...(picture.supportHistory || [])],
      },
    };
    setOverrides(nextOverrides);
    writeStoredMentorPicture(nextOverrides);
    setSnackbarMessage('Support status updated.');
  }

  function updateTeachingInfo(studentId, teachingInfo) {
    const nextOverrides = {
      ...overrides,
      [studentId]: {
        ...(overrides[studentId] || {}),
        teachingInfo,
      },
    };
    setOverrides(nextOverrides);
    writeStoredMentorPicture(nextOverrides);
    setSnackbarMessage('Teacher message updated.');
  }

  function addCheckIn(studentId, status, comment = '') {
    const picture = getStudentMentorPicture(studentId, overrides);
    const nextCheckIn = {
      id: `check-in-${Date.now()}`,
      date: todayIso(),
      status,
      comment,
    };
    const nextOverrides = {
      ...overrides,
      [studentId]: {
        ...(overrides[studentId] || {}),
        checkIns: [...(picture.checkIns || []), nextCheckIn],
      },
    };
    setOverrides(nextOverrides);
    writeStoredMentorPicture(nextOverrides);
    setSnackbarMessage('Check-in added.');
  }

  function addSubjectCheckIn(studentId, subjectId, status, comment = '') {
    const picture = getStudentMentorPicture(studentId, overrides);
    const subjectCheckIns = picture.subjectCheckIns || {};
    const nextCheckIn = {
      id: `subject-check-in-${Date.now()}`,
      date: todayIso(),
      status,
      comment,
    };
    const nextOverrides = {
      ...overrides,
      [studentId]: {
        ...(overrides[studentId] || {}),
        subjectCheckIns: {
          ...subjectCheckIns,
          ...(overrides[studentId]?.subjectCheckIns || {}),
          [subjectId]: [...(subjectCheckIns[subjectId] || []), nextCheckIn],
        },
      },
    };
    setOverrides(nextOverrides);
    writeStoredMentorPicture(nextOverrides);
    setSnackbarMessage('Subject check-in added.');
  }

  return (
    <>
      <Box sx={{ minHeight: '100%', bgcolor: '#f8f7f9', px: { xs: 1.5, sm: 2.5, md: 4 }, py: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{ maxWidth: 1360, mx: 'auto' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.4} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
            <Box>
              <Typography variant="h1" sx={{ color: darkText, fontSize: { xs: 30, md: 38 }, lineHeight: 1.05 }}>
                Mentor - 8A
              </Typography>
              <Typography sx={{ mt: 0.65, color: 'text.secondary', fontSize: 14.5, fontWeight: 680, maxWidth: 760 }}>
                A calm working picture for check-ins, practical teaching information, subject signals, and external handoff.
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
            {summaryFilters.map(({ id, label, value }) => {
              const selected = activeFilter === id;
              return (
              <Paper
                key={id}
                component={ButtonBase}
                type="button"
                elevation={0}
                onClick={() => setActiveFilter((current) => (current === id ? '' : id))}
                aria-pressed={selected}
                sx={{
                  display: 'block',
                  width: '100%',
                  p: 1.25,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selected ? 'rgba(156, 40, 175, 0.36)' : border,
                  bgcolor: selected ? 'rgba(156, 40, 175, 0.045)' : '#fff',
                  textAlign: 'left',
                  '&:hover': { bgcolor: selected ? 'rgba(156, 40, 175, 0.065)' : 'rgba(23, 21, 26, 0.025)' },
                  '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                }}
              >
                <Typography sx={{ color: darkText, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ mt: 0.35, color: selected ? purple : 'text.secondary', fontSize: 12.3, fontWeight: 800 }}>{label}</Typography>
              </Paper>
              );
            })}
          </Box>

          <Box sx={{ mt: 1.25 }}>
            <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff', minWidth: 0 }}>
              <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="space-between" sx={{ px: 0.2, pb: 0.7 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>
                    Mentor overview
                  </Typography>
                  {currentFilter && (
                    <Typography sx={{ mt: 0.15, color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>
                      Showing {filteredStudents.length} students with {currentFilter.label.toLowerCase()}
                    </Typography>
                  )}
                </Box>
                <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>
                  Teacher-set signals
                </Typography>
              </Stack>
              <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '24px minmax(190px, 1.15fr) 104px minmax(180px, 0.9fr) minmax(170px, 0.95fr) minmax(128px, 0.65fr)', gap: 0.85, px: 1, pb: 0.45 }}>
                {['', 'Student', 'Support', 'Recent check-ins', 'Subjects', 'Follow-up'].map((label) => (
                  <Typography key={label} sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 860 }}>{label}</Typography>
                ))}
              </Box>
              <Stack spacing={0.35}>
                {filteredStudents.map((student) => {
                  const activeCellId = student.id === expandedCell.studentId ? expandedCell.cellId : '';
                  const isSelected = Boolean(activeCellId);
                  return (
                    <Box key={student.id}>
                      <StudentOverviewRow
                        student={student}
                        picture={pictures[student.id]}
                        subjectConfigs={subjectConfigs}
                        selectedCell={activeCellId}
                        onSelectCell={toggleExpandedCell}
                      />
                      <Collapse in={isSelected} timeout={180} unmountOnExit>
                        <MentorExpandedCellPanel
                          student={student}
                          picture={selectedPicture}
                          activeCell={activeCellId}
                          subjectConfigs={subjectConfigs}
                          selectedSubjectId={selectedSubjectId}
                          setSelectedSubjectId={setSelectedSubjectId}
                          selectedSubjectConfig={selectedSubjectConfig}
                          selectedSubjectFacts={selectedSubjectFacts}
                          onSupportUpdate={(status, comment) => updateSupportStatus(student.id, status, comment)}
                          onTeachingInfoChange={(teachingInfo) => updateTeachingInfo(student.id, teachingInfo)}
                          onAddCheckIn={(status, comment) => addCheckIn(student.id, status, comment)}
                          onAddSubjectCheckIn={(subjectId, status, comment) => addSubjectCheckIn(student.id, subjectId, status, comment)}
                          setSnackbarMessage={setSnackbarMessage}
                        />
                      </Collapse>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={2400}
        onClose={() => setSnackbarMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" sx={{ bgcolor: purple }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
