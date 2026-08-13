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

const mentorSeed = {
  'elias-nilsson': {
    mentorStatus: 'green',
    supportStatus: 'orange',
    prorenata: { status: 'Ongoing', updated: '2026-05-14' },
    checkIns: [
      { id: 'elias-check-1', date: '2026-01-22', comment: 'Settled start to term.' },
      { id: 'elias-check-2', date: '2026-02-12', comment: '' },
      { id: 'elias-check-3', date: '2026-03-12', comment: 'Review routines next month.' },
      { id: 'elias-check-4', date: '2026-04-16', comment: '' },
      { id: 'elias-check-5', date: '2026-05-14', comment: 'Follow up next week.' },
    ],
    subjectStatuses: { english: 'green', mathematics: 'orange', swedish: 'green', 'physical-education': 'green', music: 'orange' },
    teachingInfo: [
      { id: 'elias-teach-1', text: 'Written instructions recommended', reviewDate: '2026-05-31' },
      { id: 'elias-teach-2', text: 'Short movement breaks okay', reviewDate: '2026-05-31' },
      { id: 'elias-teach-3', text: 'Monitor during week 21', reviewDate: '2026-05-24' },
    ],
    followUps: [
      { id: 'elias-follow-1', date: '2026-05-21', label: 'Mentor meeting', completed: false },
      { id: 'elias-follow-2', date: '2026-05-24', label: 'Call home', completed: false },
    ],
  },
  'freya-wilson': {
    mentorStatus: 'orange',
    supportStatus: 'orange',
    prorenata: null,
    checkIns: [
      { id: 'freya-check-1', date: '2026-01-29', comment: '' },
      { id: 'freya-check-2', date: '2026-03-05', comment: '' },
      { id: 'freya-check-3', date: '2026-04-23', comment: 'Agree light follow-up.' },
    ],
    subjectStatuses: { english: 'orange', mathematics: 'green', swedish: 'green', 'physical-education': 'green', music: 'green' },
    teachingInfo: [
      { id: 'freya-teach-1', text: 'Prefer written + verbal instructions', reviewDate: '2026-06-07' },
    ],
    followUps: [{ id: 'freya-follow-1', week: 'Week 21', label: 'General follow-up', completed: false }],
  },
  'omar-hassan': {
    mentorStatus: 'green',
    supportStatus: 'green',
    prorenata: null,
    checkIns: [
      { id: 'omar-check-1', date: '2026-02-05', comment: '' },
      { id: 'omar-check-2', date: '2026-04-09', comment: '' },
      { id: 'omar-check-3', date: '2026-05-07', comment: '' },
    ],
    subjectStatuses: { english: 'green', mathematics: 'green', swedish: 'green', 'physical-education': 'green', music: 'green' },
    teachingInfo: [{ id: 'omar-teach-1', text: 'Check understanding before independent work', reviewDate: '2026-06-14' }],
    followUps: [],
  },
  'noor-ahmed': {
    mentorStatus: 'red',
    supportStatus: 'orange',
    prorenata: { status: 'Ongoing', updated: '2026-05-10' },
    checkIns: [
      { id: 'noor-check-1', date: '2026-01-18', comment: '' },
      { id: 'noor-check-2', date: '2026-02-26', comment: '' },
      { id: 'noor-check-3', date: '2026-04-30', comment: 'Team meeting planned.' },
    ],
    subjectStatuses: { english: 'orange', mathematics: 'orange', swedish: 'green', 'physical-education': 'green', music: 'green' },
    teachingInfo: [
      { id: 'noor-teach-1', text: 'Monitor participation over the next week', reviewDate: '2026-05-24' },
      { id: 'noor-teach-2', text: 'Seat near clear board sightline', reviewDate: '2026-05-31' },
    ],
    followUps: [{ id: 'noor-follow-1', date: '2026-05-22', label: 'Teaching team meeting', completed: false }],
  },
};

const fallbackMentorPicture = {
  mentorStatus: 'green',
  supportStatus: 'green',
  prorenata: null,
  checkIns: [
    { id: 'check-1', date: '2026-02-12', comment: '' },
    { id: 'check-2', date: '2026-04-16', comment: '' },
  ],
  subjectStatuses: { english: 'green', mathematics: 'green', swedish: 'green', 'physical-education': 'green', music: 'green' },
  teachingInfo: [],
  followUps: [],
};

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
        aria-label={`${selected ? 'Collapse' : 'Expand'} ${student.displayName}`}
        aria-expanded={selected}
        onClick={() => onSelectCell(student.id, selectedCell || 'student')}
        sx={{ display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center', justifyContent: 'center', width: 24, height: 28, borderRadius: '8px', '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 } }}
      >
        <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: selected ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms ease' }} />
      </ButtonBase>
      <ButtonBase
        type="button"
        aria-pressed={selectedCell === 'student'}
        onClick={() => onSelectCell(student.id, 'student')}
        sx={{ ...cellButtonSx, minWidth: 0 }}
      >
        <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: darkText, fontSize: selected ? 18 : 13, fontWeight: selected ? 920 : 820, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'font-size 140ms ease, font-weight 140ms ease' }}>
          {student.displayName}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 700 }}>
          8A
        </Typography>
        </Box>
      </ButtonBase>
      <ButtonBase type="button" aria-pressed={selectedCell === 'support'} onClick={() => onSelectCell(student.id, 'support')} sx={cellButtonSx}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <StatusDot status={picture.supportStatus} size={10} />
          <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 750 }}>{getStatusMeta(picture.supportStatus).label}</Typography>
        </Stack>
      </ButtonBase>
      <ButtonBase type="button" aria-pressed={selectedCell === 'checkIns'} onClick={() => onSelectCell(student.id, 'checkIns')} sx={cellButtonSx}>
        <Stack direction="row" spacing={0.35} alignItems="center">
          {(picture.checkIns || []).slice(-3).map((checkIn) => (
            <Box key={checkIn.id} title={`${formatDate(checkIn.date)} · Check-in`} sx={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid rgba(156, 40, 175, 0.72)', bgcolor: '#fff' }} />
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

  function toggleExpandedCell(studentId, cellId) {
    setExpandedCell((current) => (
      current.studentId === studentId && current.cellId === cellId
        ? { studentId: '', cellId: '' }
        : { studentId, cellId }
    ));
  }

  function updateStudentStatus(studentId, field, status) {
    const nextOverrides = {
      ...overrides,
      [studentId]: {
        ...(overrides[studentId] || {}),
        [field]: status,
      },
    };
    setOverrides(nextOverrides);
    writeStoredMentorPicture(nextOverrides);
    setSnackbarMessage('Mentor picture updated.');
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
            {[
              ['Red mentor status', redMentorCount],
              ['Active support', activeSupportCount],
              ['Upcoming follow-ups', upcomingFollowUpCount],
            ].map(([label, value]) => (
              <Paper key={label} elevation={0} sx={{ p: 1.25, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.3, fontWeight: 760 }}>{label}</Typography>
              </Paper>
            ))}
          </Box>

          <Box sx={{ mt: 1.25 }}>
            <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff', minWidth: 0 }}>
              <Stack direction="row" spacing={0.8} alignItems="baseline" justifyContent="space-between" sx={{ px: 0.2, pb: 0.7 }}>
                <Typography sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>
                  Mentor overview
                </Typography>
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
                {students.map((student) => {
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
                          onStatusChange={(field, status) => updateStudentStatus(student.id, field, status)}
                          onTeachingInfoChange={(teachingInfo) => updateTeachingInfo(student.id, teachingInfo)}
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
