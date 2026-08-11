import { useMemo, useState } from 'react';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { class8AStudents } from '../data/classes/class8AStudents.js';
import { buildSubject8AConfig } from './learningModule/data/subject8AConfigFactory.js';

const purple = '#9c28af';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';

const mentorStorageKey = 'smartdesk_demo_mentor_8a_picture';
const subjectIds = ['english', 'mathematics', 'swedish', 'physical-education', 'music'];

const statusOptions = {
  green: { label: 'Green', color: '#2f7d50', bg: 'rgba(47, 125, 80, 0.1)', border: 'rgba(47, 125, 80, 0.24)' },
  orange: { label: 'Orange', color: '#b85c00', bg: 'rgba(184, 92, 0, 0.11)', border: 'rgba(184, 92, 0, 0.26)' },
  red: { label: 'Red', color: '#b42318', bg: 'rgba(180, 35, 24, 0.1)', border: 'rgba(180, 35, 24, 0.24)' },
};

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

function getLocalizedValue(value) {
  if (value && typeof value === 'object') {
    return value.en || Object.values(value)[0] || '';
  }

  return value || '';
}

function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getWeekOrDate(item) {
  return item.week || formatDate(item.date);
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

function getStatusMeta(status) {
  return statusOptions[status] || statusOptions.green;
}

function StatusDot({ status, size = 12, title = '' }) {
  const meta = getStatusMeta(status);
  return (
    <Box
      component="span"
      title={title || meta.label}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: meta.color,
        boxShadow: `0 0 0 3px ${meta.bg}`,
        flexShrink: 0,
      }}
    />
  );
}

function StatusControl({ label, value, onChange }) {
  return (
    <Box>
      <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 780, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={0.45} sx={{ mt: 0.55 }}>
        {Object.entries(statusOptions).map(([status, meta]) => {
          const selected = value === status;
          return (
            <ButtonBase
              key={status}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(status)}
              sx={{
                minWidth: 34,
                height: 28,
                px: 0.7,
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selected ? meta.border : 'rgba(23, 21, 26, 0.11)',
                bgcolor: selected ? meta.bg : '#fff',
                color: selected ? meta.color : 'text.secondary',
                fontSize: 11.3,
                fontWeight: 850,
                '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
              }}
            >
              {meta.label}
            </ButtonBase>
          );
        })}
      </Stack>
    </Box>
  );
}

function CheckInTimeline({ checkIns }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const start = new Date('2026-01-01T12:00:00').getTime();
  const end = new Date('2026-05-31T12:00:00').getTime();

  return (
    <Box sx={{ position: 'relative', height: 76, px: 0.4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${months.length}, 1fr)`, color: 'text.secondary', fontSize: 11.2, fontWeight: 760 }}>
        {months.map((month) => <Box key={month}>{month}</Box>)}
      </Box>
      <Box sx={{ position: 'absolute', left: 4, right: 4, top: 45, height: 1 }}>
        <Box sx={{ width: '100%', borderTop: '1px solid rgba(23, 21, 26, 0.16)' }} />
      </Box>
      {(checkIns || []).map((checkIn) => {
        const time = new Date(`${checkIn.date}T12:00:00`).getTime();
        const left = Math.max(2, Math.min(98, ((time - start) / (end - start)) * 100));
        return (
          <Box
            key={checkIn.id}
            title={`${formatDate(checkIn.date)} · Check-in${checkIn.comment ? ` · ${checkIn.comment}` : ''}`}
            sx={{
              position: 'absolute',
              left: `${left}%`,
              top: 34,
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: `2px solid ${purple}`,
              bgcolor: '#fff',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 0 3px rgba(156, 40, 175, 0.08)',
            }}
          />
        );
      })}
    </Box>
  );
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

function StudentOverviewRow({ student, picture, subjectConfigs, selected, onSelect }) {
  const latestCheckIn = [...(picture.checkIns || [])].sort((first, second) => second.date.localeCompare(first.date))[0];
  const nextFollowUp = (picture.followUps || []).find((item) => !item.completed);

  return (
    <ButtonBase
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(student.id)}
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(150px, 0.95fr) 78px 78px minmax(120px, 0.8fr) minmax(132px, 0.8fr) minmax(98px, 0.58fr)',
        },
        gap: { xs: 0.6, md: 1 },
        alignItems: 'center',
        textAlign: 'left',
        p: 0.95,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: selected ? 'rgba(156, 40, 175, 0.32)' : 'rgba(23, 21, 26, 0.08)',
        bgcolor: selected ? 'rgba(156, 40, 175, 0.045)' : '#fff',
        '&:hover': { bgcolor: selected ? 'rgba(156, 40, 175, 0.06)' : 'rgba(23, 21, 26, 0.025)' },
        '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: darkText, fontSize: 13.4, fontWeight: 880, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {student.displayName}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 700 }}>
          8A
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.6} alignItems="center">
        <StatusDot status={picture.mentorStatus} />
        <Typography sx={{ color: 'text.secondary', fontSize: 12.1, fontWeight: 760 }}>{getStatusMeta(picture.mentorStatus).label}</Typography>
      </Stack>
      <Stack direction="row" spacing={0.6} alignItems="center">
        <StatusDot status={picture.supportStatus} />
        <Typography sx={{ color: 'text.secondary', fontSize: 12.1, fontWeight: 760 }}>{getStatusMeta(picture.supportStatus).label}</Typography>
      </Stack>
      <Stack direction="row" spacing={0.38} alignItems="center">
        {(picture.checkIns || []).slice(-3).map((checkIn) => (
          <Box key={checkIn.id} title={`${formatDate(checkIn.date)} · Check-in`} sx={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid rgba(156, 40, 175, 0.72)', bgcolor: '#fff' }} />
        ))}
        <Typography sx={{ pl: 0.25, color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>
          {latestCheckIn ? formatDate(latestCheckIn.date) : 'None'}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.65} alignItems="center">
        {subjectIds.map((subjectId) => (
          <StatusDot
            key={subjectId}
            size={10}
            status={picture.subjectStatuses[subjectId]}
            title={`${getLocalizedValue(subjectConfigs[subjectId]?.subjectTitle)}: ${getStatusMeta(picture.subjectStatuses[subjectId]).label}`}
          />
        ))}
      </Stack>
      <Typography sx={{ color: nextFollowUp ? darkText : 'text.secondary', fontSize: 12.2, fontWeight: nextFollowUp ? 820 : 680, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {nextFollowUp ? getWeekOrDate(nextFollowUp) : '-'}
      </Typography>
    </ButtonBase>
  );
}

function SubjectDetail({ subjectId, config, status, facts }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="space-between">
          <Typography sx={{ color: darkText, fontSize: 13.3, fontWeight: 900 }}>
            {getLocalizedValue(config.subjectTitle)}
          </Typography>
          <Chip
            size="small"
            label={getStatusMeta(status).label}
            sx={{ height: 22, bgcolor: getStatusMeta(status).bg, color: getStatusMeta(status).color, border: `1px solid ${getStatusMeta(status).border}`, fontSize: 11.2, fontWeight: 850 }}
          />
        </Stack>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 780 }}>Recent observations</Typography>
          {(facts.observations || []).slice(0, 2).map((item) => (
            <Typography key={item.id} sx={{ mt: 0.25, color: darkText, fontSize: 12.1, lineHeight: 1.25 }}>
              {formatDate(item.date)} · {getLocalizedValue(item.contextLabel) || item.evidenceTopicId || item.skillId}
            </Typography>
          ))}
          {!facts.observations.length && <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1 }}>No recent observations</Typography>}
        </Box>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 780 }}>Recent assessment</Typography>
          {facts.assessments[0] ? (
            <Typography sx={{ mt: 0.25, color: darkText, fontSize: 12.1, lineHeight: 1.25 }}>
              {facts.assessments[0].title}{Number.isFinite(Number(facts.assessments[0].percentage)) ? ` · ${facts.assessments[0].percentage}%` : ''}
            </Typography>
          ) : (
            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1 }}>No recent assessment</Typography>
          )}
        </Box>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 780 }}>Current activity</Typography>
          <Typography sx={{ mt: 0.25, color: darkText, fontSize: 12.1, lineHeight: 1.25 }}>
            {getLocalizedValue(facts.currentActivity?.title) || getLocalizedValue(config.lessons?.current?.focus) || subjectId}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function MentorModule() {
  const [overrides, setOverrides] = useState(() => readStoredMentorPicture());
  const [selectedStudentId, setSelectedStudentId] = useState(class8AStudents[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState('english');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const subjectConfigs = useMemo(() => subjectIds.reduce((configs, subjectId) => {
    configs[subjectId] = buildSubject8AConfig({ subjectId });
    return configs;
  }, {}), []);
  const students = class8AStudents;
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
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

  function updateSelectedStatus(field, status) {
    const nextOverrides = {
      ...overrides,
      [selectedStudent.id]: {
        ...(overrides[selectedStudent.id] || {}),
        [field]: status,
      },
    };
    setOverrides(nextOverrides);
    writeStoredMentorPicture(nextOverrides);
    setSnackbarMessage('Mentor picture updated.');
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

          <Box sx={{ mt: 1.35, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.35fr) minmax(380px, 0.75fr)' }, gap: 1.25, alignItems: 'start' }}>
            <Paper elevation={0} sx={{ p: 1.15, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff', minWidth: 0 }}>
              <Stack direction="row" spacing={0.8} alignItems="baseline" justifyContent="space-between" sx={{ px: 0.2, pb: 0.8 }}>
                <Typography sx={{ color: darkText, fontSize: 16, fontWeight: 900 }}>
                  Mentor overview
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 720 }}>
                  Teacher-set signals
                </Typography>
              </Stack>
              <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'minmax(150px, 0.95fr) 78px 78px minmax(120px, 0.8fr) minmax(132px, 0.8fr) minmax(98px, 0.58fr)', gap: 1, px: 0.95, pb: 0.45 }}>
                {['Student', 'Status', 'Support', 'Recent check-ins', 'Subjects', 'Follow-up'].map((label) => (
                  <Typography key={label} sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 860 }}>{label}</Typography>
                ))}
              </Box>
              <Stack spacing={0.35}>
                {students.map((student) => (
                  <StudentOverviewRow
                    key={student.id}
                    student={student}
                    picture={pictures[student.id]}
                    subjectConfigs={subjectConfigs}
                    selected={student.id === selectedStudent.id}
                    onSelect={setSelectedStudentId}
                  />
                ))}
              </Stack>
            </Paper>

            <Stack spacing={0} sx={{ minWidth: 0, bgcolor: '#fff' }}>
              <Paper elevation={0} sx={{ p: 1.25, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap justifyContent="flex-start">
                    <Button size="small" startIcon={<FolderOpenIcon />} variant="outlined" onClick={() => setSnackbarMessage('Demo only - open the student Drive folder.')} sx={{ color: purple, borderColor: 'rgba(156, 40, 175, 0.24)', borderRadius: '8px', textTransform: 'none' }}>
                      Open Drive folder
                    </Button>
                    <Button size="small" endIcon={<OpenInNewIcon />} variant="outlined" onClick={() => setSnackbarMessage('Demo only - open Prorenata for official records.')} sx={{ color: selectedPicture.prorenata ? purple : 'text.secondary', borderColor: 'rgba(23, 21, 26, 0.14)', borderRadius: '8px', textTransform: 'none' }}>
                      Open Prorenata
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 0.8 }}>
                    <Box sx={{ p: 0.85, borderRadius: '8px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: 'rgba(23, 21, 26, 0.02)' }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 780 }}>Prorenata</Typography>
                      <Typography sx={{ mt: 0.45, color: selectedPicture.prorenata ? purple : 'text.secondary', fontSize: 12.6, fontWeight: 850, lineHeight: 1.25 }}>
                        {selectedPicture.prorenata ? selectedPicture.prorenata.status : 'No ongoing process indicated'}
                      </Typography>
                      {selectedPicture.prorenata?.updated && (
                        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.7, lineHeight: 1.25 }}>
                          Updated {formatDate(selectedPicture.prorenata.updated)}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ p: 0.85, borderRadius: '8px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: 'rgba(23, 21, 26, 0.02)' }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 780 }}>Next follow-up</Typography>
                      {selectedPicture.followUps.find((item) => !item.completed) ? (
                        <>
                          <Typography sx={{ mt: 0.45, color: darkText, fontSize: 12.6, fontWeight: 850, lineHeight: 1.25 }}>
                            {selectedPicture.followUps.find((item) => !item.completed).label}
                          </Typography>
                          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.7, lineHeight: 1.25 }}>
                            {getWeekOrDate(selectedPicture.followUps.find((item) => !item.completed))}
                          </Typography>
                        </>
                      ) : (
                        <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 12.6, fontWeight: 760, lineHeight: 1.25 }}>
                          None planned
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ mt: 1.25, p: 1.25, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Check-ins</Typography>
                <CheckInTimeline checkIns={selectedPicture.checkIns} />
              </Paper>

              <Paper elevation={0} sx={{ mt: 1.25, p: 1.25, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Subjects</Typography>
                <Stack direction="row" spacing={0.55} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                  {subjectIds.map((subjectId) => {
                    const config = subjectConfigs[subjectId];
                    const status = selectedPicture.subjectStatuses[subjectId];
                    const selected = selectedSubjectId === subjectId;
                    return (
                      <ButtonBase
                        key={subjectId}
                        type="button"
                        onClick={() => setSelectedSubjectId(subjectId)}
                        sx={{
                          px: 0.75,
                          py: 0.55,
                          borderRadius: '999px',
                          border: '1px solid',
                          borderColor: selected ? getStatusMeta(status).border : 'rgba(23, 21, 26, 0.12)',
                          bgcolor: selected ? getStatusMeta(status).bg : '#fff',
                          color: selected ? getStatusMeta(status).color : darkText,
                          '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                        }}
                      >
                        <Stack direction="row" spacing={0.45} alignItems="center">
                          <StatusDot status={status} size={9} />
                          <Typography sx={{ color: 'inherit', fontSize: 12.1, fontWeight: 850 }}>{getLocalizedValue(config.subjectTitle)}</Typography>
                        </Stack>
                      </ButtonBase>
                    );
                  })}
                </Stack>
                <Box sx={{ mt: 0.9 }}>
                  <SubjectDetail
                    subjectId={selectedSubjectId}
                    config={selectedSubjectConfig}
                    status={selectedPicture.subjectStatuses[selectedSubjectId]}
                    facts={selectedSubjectFacts}
                  />
                </Box>
              </Paper>

              <Box sx={{ mt: 1.25, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: 1 }}>
                <Paper elevation={0} sx={{ p: 1.25, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
                  <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Shared teaching information</Typography>
                  {selectedPicture.teachingInfo.length ? (
                    <Stack component="ul" spacing={0.55} sx={{ m: 0, mt: 0.8, p: 0, listStyle: 'none' }}>
                      {selectedPicture.teachingInfo.map((item) => (
                        <Box key={item.id} component="li" sx={{ p: 0.75, borderRadius: '8px', bgcolor: 'rgba(23, 21, 26, 0.025)', border: '1px solid rgba(23, 21, 26, 0.07)' }}>
                          <Typography sx={{ color: darkText, fontSize: 12.5, fontWeight: 820, lineHeight: 1.25 }}>{item.text}</Typography>
                          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.4 }}>Review {formatDate(item.reviewDate)}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ mt: 0.8, color: 'text.secondary', fontSize: 12.5 }}>No shared teaching information.</Typography>
                  )}
                </Paper>

                <Paper elevation={0} sx={{ p: 1.25, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
                  <Stack direction="row" spacing={0.55} alignItems="center">
                    <EventAvailableIcon sx={{ color: purple, fontSize: 18 }} />
                    <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Upcoming</Typography>
                  </Stack>
                  {selectedPicture.followUps.length ? (
                    <Stack component="ul" spacing={0.55} sx={{ m: 0, mt: 0.8, p: 0, listStyle: 'none' }}>
                      {selectedPicture.followUps.map((item) => (
                        <Box key={item.id} component="li" sx={{ display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr)', gap: 0.65, py: 0.55, borderBottom: '1px solid rgba(23, 21, 26, 0.07)' }}>
                          <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 780 }}>{getWeekOrDate(item)}</Typography>
                          <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 820 }}>{item.label}{item.completed ? ' · Completed' : ''}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ mt: 0.8, color: 'text.secondary', fontSize: 12.5 }}>No upcoming follow-up.</Typography>
                  )}
                </Paper>
              </Box>
            </Stack>
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
