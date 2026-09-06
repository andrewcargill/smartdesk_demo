import { useEffect, useMemo, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { class8AStudents } from '../data/classes/class8AStudents.js';
import { useConceptDemoLanguage } from '../ConceptDemoLanguageContext.jsx';
import { buildSubject8AConfig } from './learningModule/data/subject8AConfigFactory.js';
import { getStudentMentorPicture, readStoredMentorPicture, writeStoredMentorPicture, subscribeMentorPicture } from './mentorModule/utils/mentorPictureStorage.js';
import { CheckInStatusIcon } from './mentorModule/mentorCheckInStatus.jsx';
import MentorExpandedCellPanel from './mentorModule/MentorExpandedCellPanel.jsx';
import SubjectWorkspaceContainer from './SubjectWorkspaceContainer.jsx';
import {
  darkText,
  formatDate,
  getLocalizedValue,
  getWeekOrDate,
  purple,
  StatusDot,
  subjectIds,
} from './mentorModule/mentorModuleShared.jsx';

const mentorTableColumns = '24px minmax(190px, 1.15fr) 104px minmax(180px, 0.9fr) minmax(170px, 0.95fr) minmax(128px, 0.65fr)';
const mentorTableHeaderKeys = ['', 'student', 'support', 'recentCheckIns', 'subjects', 'followUp'];
const mentorStatusLabelKeys = {
  green: 'green',
  orange: 'orange',
  red: 'red',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}


function getSubjectFacts(config, studentId, t) {
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
        title: getLocalizedValue(assessment.title) || assessment.assessmentTitle || t('mentorModule.fallbacks.assessment'),
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

function getLocalizedStatusLabel(status, t) {
  return t(`mentorModule.status.${mentorStatusLabelKeys[status] || 'green'}`);
}

function getLocalizedCheckInStatusLabel(status, t) {
  return t(`mentorModule.checkInStatus.${status || 'neutral'}`);
}

function StudentOverviewRow({ student, picture, subjectConfigs, selectedCell, onSelectCell, t }) {
  const latestCheckIn = [...(picture.checkIns || [])].sort((first, second) => second.date.localeCompare(first.date))[0];
  const nextFollowUp = (picture.followUps || []).find((item) => !item.completed);
  const selected = Boolean(selectedCell);
  const getCellButtonSx = (cellId) => {
    const active = selectedCell === cellId;
    return {
      minHeight: 38,
      height: '100%',
      justifyContent: 'flex-start',
      textAlign: 'left',
      borderRadius: 0,
      px: 0.8,
      py: 0.55,
      borderLeft: '1px solid rgba(var(--sd-text-rgb), 0.055)',
      bgcolor: active ? 'rgba(var(--sd-primary-rgb), 0.095)' : 'transparent',
      boxShadow: active ? 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.22)' : 'none',
      transition: 'background-color 140ms ease, box-shadow 140ms ease',
      '&:hover': {
        bgcolor: active ? 'rgba(var(--sd-primary-rgb), 0.12)' : 'rgba(var(--sd-primary-rgb), 0.045)',
        boxShadow: 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.16)',
      },
      '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: -2 },
    };
  };
  const rowCellSx = {
    borderTop: selected ? '1px solid rgba(var(--sd-primary-rgb), 0.34)' : '1px solid rgba(var(--sd-text-rgb), 0.08)',
    borderBottom: selected ? '1px solid rgba(var(--sd-primary-rgb), 0.18)' : '1px solid transparent',
    bgcolor: selected ? 'rgba(var(--sd-primary-rgb), 0.035)' : 'var(--sd-surface)',
    transition: 'background-color 140ms ease, border-color 140ms ease',
  };
  const timelineActive = selectedCell === 'timeline';

  return (
    <Box
      role="row"
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: mentorTableColumns,
        },
        alignItems: 'stretch',
        textAlign: 'left',
        bgcolor: 'var(--sd-surface)',
        '&:hover .MentorModuleRowCell': {
          borderTopColor: 'rgba(var(--sd-primary-rgb), 0.34)',
          borderBottomColor: 'rgba(var(--sd-primary-rgb), 0.18)',
          bgcolor: 'rgba(var(--sd-primary-rgb), 0.045)',
        },
      }}
    >
      <ButtonBase
        role="cell"
        className="MentorModuleRowCell"
        type="button"
        aria-label={t(timelineActive ? 'mentorModule.table.collapseTimeline' : 'mentorModule.table.expandTimeline', { student: student.displayName })}
        aria-expanded={timelineActive}
        aria-pressed={timelineActive}
        onClick={() => onSelectCell(student.id, 'timeline')}
        sx={{
          ...rowCellSx,
          display: { xs: 'none', md: 'inline-flex' },
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: 38,
          color: timelineActive ? 'var(--sd-accent-text)' : 'text.secondary',
          bgcolor: timelineActive ? 'rgba(var(--sd-primary-rgb), 0.095)' : rowCellSx.bgcolor,
          boxShadow: timelineActive ? 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.22)' : 'none',
          '&:hover': { bgcolor: timelineActive ? 'rgba(var(--sd-primary-rgb), 0.12)' : 'rgba(var(--sd-primary-rgb), 0.045)' },
          '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: -2 },
        }}
      >
        <KeyboardArrowDownIcon sx={{ color: 'inherit', fontSize: 18, transform: timelineActive ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms ease' }} />
      </ButtonBase>
      <Box
        role="rowheader"
        className="MentorModuleRowCell"
        sx={{
          ...rowCellSx,
          minWidth: 0,
          px: 1,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: darkText, fontSize: selected ? 17 : 13, fontWeight: selected ? 900 : 820, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'font-size 140ms ease, font-weight 140ms ease' }}>
            {student.displayName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.3, fontWeight: 700 }}>
            8A
          </Typography>
        </Box>
      </Box>
      <ButtonBase role="cell" className="MentorModuleRowCell" type="button" aria-pressed={selectedCell === 'support'} onClick={() => onSelectCell(student.id, 'support')} sx={{ ...rowCellSx, ...getCellButtonSx('support') }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <StatusDot status={picture.supportStatus} size={10} />
          <Typography sx={{ color: selectedCell === 'support' ? darkText : 'text.secondary', fontSize: 11.8, fontWeight: selectedCell === 'support' ? 850 : 750 }}>{getLocalizedStatusLabel(picture.supportStatus, t)}</Typography>
        </Stack>
      </ButtonBase>
      <ButtonBase role="cell" className="MentorModuleRowCell" type="button" aria-pressed={selectedCell === 'checkIns'} onClick={() => onSelectCell(student.id, 'checkIns')} sx={{ ...rowCellSx, ...getCellButtonSx('checkIns') }}>
        <Stack direction="row" spacing={0.35} alignItems="center">
          {(picture.checkIns || []).slice(-3).map((checkIn) => (
            <CheckInStatusIcon key={checkIn.id} status={checkIn.status} size={14} title={`${formatDate(checkIn.date)} · ${getLocalizedCheckInStatusLabel(checkIn.status, t)}`} />
          ))}
          <Typography sx={{ pl: 0.25, color: selectedCell === 'checkIns' ? darkText : 'text.secondary', fontSize: 11.5, fontWeight: selectedCell === 'checkIns' ? 840 : 720 }}>
            {latestCheckIn ? formatDate(latestCheckIn.date) : t('mentorModule.table.none')}
          </Typography>
        </Stack>
      </ButtonBase>
      <ButtonBase role="cell" className="MentorModuleRowCell" type="button" aria-pressed={selectedCell === 'subjects'} onClick={() => onSelectCell(student.id, 'subjects')} sx={{ ...rowCellSx, ...getCellButtonSx('subjects') }}>
        <Stack direction="row" spacing={0.55} alignItems="center">
          {subjectIds.map((subjectId) => (
            <StatusDot
              key={subjectId}
              size={10}
              status={picture.subjectStatuses[subjectId]}
              title={`${getLocalizedValue(subjectConfigs[subjectId]?.subjectTitle)}: ${getLocalizedStatusLabel(picture.subjectStatuses[subjectId], t)}`}
            />
          ))}
        </Stack>
      </ButtonBase>
      <ButtonBase role="cell" className="MentorModuleRowCell" type="button" aria-pressed={selectedCell === 'followUp'} onClick={() => onSelectCell(student.id, 'followUp')} sx={{ ...rowCellSx, ...getCellButtonSx('followUp') }}>
        <Typography sx={{ color: nextFollowUp ? darkText : 'text.secondary', fontSize: 11.8, fontWeight: selectedCell === 'followUp' ? 880 : nextFollowUp ? 820 : 680, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {nextFollowUp ? getWeekOrDate(nextFollowUp) : '-'}
        </Typography>
      </ButtonBase>
    </Box>
  );
}

function MentorTableHeader({ t }) {
  return (
    <Box
      role="row"
      sx={{
        display: { xs: 'none', md: 'grid' },
        gridTemplateColumns: mentorTableColumns,
        bgcolor: 'var(--sd-surface)',
        borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.12)',
      }}
    >
      {mentorTableHeaderKeys.map((key, index) => {
        const label = key ? t(`mentorModule.table.headers.${key}`) : '';
        return (
          <Typography
            key={label || 'expand'}
            role="columnheader"
            sx={{
              color: 'text.secondary',
              fontSize: 11.5,
              fontWeight: 860,
              px: index === 0 ? 0.6 : 1,
              py: 0.85,
              borderLeft: index > 1 ? '1px solid rgba(var(--sd-text-rgb), 0.055)' : 0,
            }}
          >
            {label}
          </Typography>
        );
      })}
    </Box>
  );
}

function MentorTableShell({ children }) {
  return (
    <Box sx={{ overflowX: { xs: 'visible', md: 'auto' }, pb: 0.5 }}>
      <Paper
        role="table"
        elevation={0}
        sx={{
          minWidth: { xs: 0, md: 860 },
          borderRadius: '10px',
          border: '1px solid rgba(var(--sd-text-rgb), 0.16)',
          bgcolor: 'var(--sd-surface)',
          boxShadow: '0 10px 28px rgba(23, 21, 26, 0.045)',
          overflow: 'hidden',
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}

export default function MentorModule({ onBack }) {
  const { t } = useConceptDemoLanguage();
  const [overrides, setOverrides] = useState(() => readStoredMentorPicture());
  useEffect(() => subscribeMentorPicture(() => setOverrides(readStoredMentorPicture())), []);
  const [expandedCell, setExpandedCell] = useState({ studentId: '', cellId: '' });
  const [selectedSubjectId, setSelectedSubjectId] = useState('english');
  const [activeFilter, setActiveFilter] = useState('');
  const [privateMode, setPrivateMode] = useState(false);
  const [privateSelectedStudentId, setPrivateSelectedStudentId] = useState('');
  const [privacyPromptOpen, setPrivacyPromptOpen] = useState(true);
  const [privacyChoice, setPrivacyChoice] = useState('');
  const [pendingPrivateStudentId, setPendingPrivateStudentId] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const subjectConfigs = useMemo(() => subjectIds.reduce((configs, subjectId) => {
    configs[subjectId] = buildSubject8AConfig({ subjectId });
    return configs;
  }, {}), []);
  const students = class8AStudents;
  const selectedStudent = students.find((student) => student.id === expandedCell.studentId) || students[0];
  const privateSelectedStudent = privateSelectedStudentId ? students.find((student) => student.id === privateSelectedStudentId) || null : null;
  const selectedPicture = getStudentMentorPicture(selectedStudent?.id, overrides);
  const selectedSubjectConfig = subjectConfigs[selectedSubjectId] || subjectConfigs.english;
  const selectedSubjectFacts = getSubjectFacts(selectedSubjectConfig, selectedStudent?.id, t);
  const pictures = useMemo(() => students.reduce((items, student) => {
    items[student.id] = getStudentMentorPicture(student.id, overrides);
    return items;
  }, {}), [overrides, students]);
  const redMentorCount = students.filter((student) => pictures[student.id].supportStatus === 'red').length;
  const activeSupportCount = students.filter((student) => pictures[student.id].supportStatus === 'orange').length;
  const upcomingFollowUpCount = students.reduce((total, student) => total + (pictures[student.id].followUps || []).filter((item) => !item.completed).length, 0);
  const summaryFilters = [
    {
      id: 'redMentor',
      label: t('mentorModule.filters.redMentorStatus'),
      value: redMentorCount,
      matches: (student) => pictures[student.id].supportStatus === 'red',
    },
    {
      id: 'activeSupport',
      label: t('mentorModule.filters.activeSupport'),
      value: activeSupportCount,
      matches: (student) => pictures[student.id].supportStatus === 'orange',
    },
    {
      id: 'upcomingFollowUps',
      label: t('mentorModule.filters.upcomingFollowUps'),
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
    setSnackbarMessage(t('mentorModule.snackbar.supportStatusUpdated'));
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
    const saved = writeStoredMentorPicture(nextOverrides);
    setSnackbarMessage(saved ? t('mentorModule.snackbar.teacherMessageUpdated') : 'Message shared for this session only; browser storage is unavailable.');
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
    setSnackbarMessage(t('mentorModule.snackbar.checkInAdded'));
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
    setSnackbarMessage(t('mentorModule.snackbar.subjectCheckInAdded'));
  }

  function handlePrivacyChoice(nextChoice) {
    setPrivacyChoice(nextChoice);

    if (nextChoice === 'standard') {
      setPrivateMode(false);
      setPrivateSelectedStudentId('');
      setPendingPrivateStudentId('');
      setExpandedCell({ studentId: '', cellId: '' });
      setPrivacyPromptOpen(false);
      return;
    }

    setPrivateMode(true);
    setPrivateSelectedStudentId('');
    setExpandedCell({ studentId: '', cellId: '' });
  }

  function handlePrivateSelectionSubmit() {
    if (!pendingPrivateStudentId) return;

    setPrivateSelectedStudentId(pendingPrivateStudentId);
    setExpandedCell({ studentId: pendingPrivateStudentId, cellId: '' });
    setPrivacyPromptOpen(false);
  }

  return (
    <>
      <Dialog
        open={privacyPromptOpen}
        onClose={() => setPrivacyPromptOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: 'calc(100% - 55px)', sm: 460 },
            maxWidth: 460,
            borderRadius: 3,
            bgcolor: 'var(--sd-surface)',
            p: 1,
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(20, 18, 25, 0.52)',
              backdropFilter: 'blur(2px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ color: darkText, fontWeight: 900, pb: 1, textAlign: 'center' }}>
          {t('mentorModule.privacyModal.title')}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(var(--sd-text-rgb), 0.08)', textAlign: 'center' }}>
          {privacyChoice !== 'private' ? (
            <Stack spacing={1.5} alignItems="center">
              <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.5 }}>
                {t('mentorModule.privacyModal.description')}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  width: '100%',
                  gap: 1,
                  alignItems: 'stretch',
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => handlePrivacyChoice('private')}
                  sx={{ bgcolor: purple, '&:hover': { bgcolor: 'var(--sd-primary-hover)' }, borderRadius: '10px', px: 2.4, py: 1, textTransform: 'none' }}
                >
                  {t('mentorModule.privacyModal.privateMode')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handlePrivacyChoice('standard')}
                  sx={{ borderRadius: '10px', px: 2.4, py: 1, borderColor: 'rgba(var(--sd-text-rgb), 0.2)', color: darkText, textTransform: 'none' }}
                >
                  {t('mentorModule.privacyModal.standardView')}
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={1.5} alignItems="center">
              <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.5 }}>
                {t('mentorModule.privacyModal.selectStudentDescription')}
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="mentor-private-prompt-select-label">{t('mentorModule.privacyModal.studentLabel')}</InputLabel>
                <Select
                  labelId="mentor-private-prompt-select-label"
                  value={pendingPrivateStudentId}
                  label={t('mentorModule.privacyModal.studentLabel')}
                  onChange={(event) => setPendingPrivateStudentId(event.target.value)}
                  sx={{ bgcolor: 'var(--sd-surface)', borderRadius: '8px' }}
                >
                  <MenuItem value="">
                    <em>{t('mentorModule.privacyModal.selectStudentPlaceholder')}</em>
                  </MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', px: 3, pb: 2, pt: 1.5 }}>
          {privacyChoice === 'private' ? (
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ width: '100%' }}>
              <Button
                onClick={() => {
                  setPrivacyChoice('');
                  setPendingPrivateStudentId('');
                }}
                sx={{ color: 'text.secondary' }}
              >
                {t('common.back')}
              </Button>
              <Button
                variant="contained"
                onClick={handlePrivateSelectionSubmit}
                disabled={!pendingPrivateStudentId}
                sx={{ bgcolor: purple, '&:hover': { bgcolor: 'var(--sd-primary-hover)' }, borderRadius: '10px' }}
              >
                {t('mentorModule.privacyModal.loadSelectedStudent')}
              </Button>
            </Stack>
          ) : null}
        </DialogActions>
      </Dialog>

      <SubjectWorkspaceContainer
        title={t('mentorModule.header.title')}
        subtitle={t('mentorModule.header.subtitle')}
        onBack={onBack}
        titleMeta={(
          <ButtonBase
            type="button"
            onClick={() => {
              setPrivateMode((current) => {
                const next = !current;
                if (next) {
                  setPrivateSelectedStudentId('');
                  setExpandedCell({ studentId: '', cellId: '' });
                }
                return next;
              });
            }}
            aria-pressed={privateMode}
            sx={{
              px: 1.05,
              py: 0.55,
              borderRadius: '999px',
              border: '1px solid',
              borderColor: privateMode ? 'rgba(var(--sd-primary-rgb), 0.26)' : 'rgba(var(--sd-text-rgb), 0.12)',
              bgcolor: privateMode ? 'rgba(var(--sd-primary-rgb), 0.06)' : 'var(--sd-surface)',
              color: privateMode ? 'var(--sd-accent-text)' : 'text.secondary',
              fontSize: 11.6,
              fontWeight: 900,
            }}
          >
            {t(privateMode ? 'mentorModule.privateMode.on' : 'mentorModule.privateMode.off')}
          </ButtonBase>
        )}
      >
        <Box sx={{ maxWidth: 1360, mx: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
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
                  p: 1.35,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selected ? purple : 'rgba(var(--sd-text-rgb), 0.16)',
                  bgcolor: selected ? purple : 'var(--sd-surface)',
                  textAlign: 'left',
                  boxShadow: selected ? '0 10px 24px rgba(var(--sd-primary-rgb), 0.18)' : '0 4px 14px rgba(23, 21, 26, 0.055)',
                  transition: 'background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease',
                  '&:hover': {
                    borderColor: selected ? purple : 'rgba(var(--sd-primary-rgb), 0.38)',
                    bgcolor: selected ? 'var(--sd-primary-hover)' : 'rgba(var(--sd-primary-rgb), 0.035)',
                    boxShadow: selected ? '0 12px 28px rgba(var(--sd-primary-rgb), 0.22)' : '0 8px 20px rgba(23, 21, 26, 0.08)',
                    transform: 'translateY(-1px)',
                  },
                  '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                }}
              >
                <Typography sx={{ color: selected ? 'var(--sd-on-primary)' : darkText, fontSize: 24, fontWeight: 950, lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ mt: 0.45, color: selected ? 'rgba(var(--sd-surface-rgb), 0.86)' : darkText, fontSize: 12.5, fontWeight: 900 }}>{label}</Typography>
              </Paper>
              );
            })}
          </Box>

          {privateMode ? (
            <Box sx={{ mt: 1.25, display: 'grid', gap: 1.25 }}>
              <Box sx={{ maxWidth: 420 }}>
                <FormControl fullWidth>
                  <InputLabel id="mentor-private-student-select-label">{t('mentorModule.privacyModal.studentLabel')}</InputLabel>
                  <Select
                    labelId="mentor-private-student-select-label"
                    value={privateSelectedStudentId}
                    label={t('mentorModule.privacyModal.studentLabel')}
                    onChange={(event) => {
                      const nextStudentId = event.target.value;
                      setPrivateSelectedStudentId(nextStudentId);
                      setExpandedCell({ studentId: nextStudentId, cellId: '' });
                    }}
                    sx={{ bgcolor: 'var(--sd-surface)', borderRadius: '8px' }}
                  >
                    <MenuItem value="">
                      <em>{t('mentorModule.privacyModal.selectStudentPlaceholder')}</em>
                    </MenuItem>
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {privateSelectedStudent && (
                <MentorTableShell>
                  <MentorTableHeader t={t} />
                  <Box>
                    <StudentOverviewRow
                      student={privateSelectedStudent}
                      picture={pictures[privateSelectedStudent.id]}
                      subjectConfigs={subjectConfigs}
                      selectedCell={expandedCell.studentId === privateSelectedStudent.id ? expandedCell.cellId : ''}
                      onSelectCell={(studentId, cellId) => toggleExpandedCell(studentId, cellId)}
                      t={t}
                    />
                    <Collapse in={expandedCell.studentId === privateSelectedStudent.id && Boolean(expandedCell.cellId)} timeout={180} unmountOnExit>
                      <MentorExpandedCellPanel
                        student={privateSelectedStudent}
                        picture={pictures[privateSelectedStudent.id]}
                        activeCell={expandedCell.studentId === privateSelectedStudent.id ? expandedCell.cellId : ''}
                        subjectConfigs={subjectConfigs}
                        selectedSubjectId={selectedSubjectId}
                        setSelectedSubjectId={setSelectedSubjectId}
                        selectedSubjectConfig={selectedSubjectConfig}
                        selectedSubjectFacts={selectedSubjectFacts}
                        onSupportUpdate={(status, comment) => updateSupportStatus(privateSelectedStudent.id, status, comment)}
                        onTeachingInfoChange={(teachingInfo) => updateTeachingInfo(privateSelectedStudent.id, teachingInfo)}
                        onAddCheckIn={(status, comment) => addCheckIn(privateSelectedStudent.id, status, comment)}
                        onAddSubjectCheckIn={(subjectId, status, comment) => addSubjectCheckIn(privateSelectedStudent.id, subjectId, status, comment)}
                        setSnackbarMessage={setSnackbarMessage}
                      />
                    </Collapse>
                  </Box>
                </MentorTableShell>
              )}
            </Box>
          ) : (
            <Box sx={{ mt: 1.25 }}>
              {currentFilter && (
                <Typography sx={{ mb: 0.65, color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>
                  {t('mentorModule.table.filteredSummary', { count: filteredStudents.length, filter: currentFilter.label.toLowerCase() })}
                </Typography>
              )}
              <MentorTableShell>
                <MentorTableHeader t={t} />
                <Box>
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
                          t={t}
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
                </Box>
              </MentorTableShell>
            </Box>
          )}
        </Box>
      </SubjectWorkspaceContainer>

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
