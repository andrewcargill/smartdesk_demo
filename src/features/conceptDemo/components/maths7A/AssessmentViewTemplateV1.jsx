import { useEffect, useMemo, useState } from 'react';
import { Box, Button, ButtonBase, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HistoryIcon from '@mui/icons-material/History';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import { maths7AEvidence } from '../../data/Maths7AEvidence.js';
import { maths7AStudents } from '../../data/Maths7AStudents.js';
import {
  MATHS_7A_ASSESSMENT_RESULTS_STORAGE_EVENT,
  MATHS_7A_ASSESSMENT_RESULTS_STORAGE_KEY,
  readMaths7AAssessmentResults,
  upsertMaths7AAssessmentResult,
} from '../../data/maths7AAssessmentResultStorage.js';
import { mathsTeachingUnits, normalizeMathsEvidenceItem } from '../../data/mathsCurriculum.js';
import AssessmentResultsDialog from './AssessmentResultsDialog.jsx';

const purple = '#9c28af';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';

const ongoingAssessments = [
  {
    id: 'fractions-methods-exit-ticket',
    title: 'Fractions methods exit ticket',
    reason: '9 of 12 students complete',
    detail: '2 absent · 1 retest planned',
    action: 'Continue',
    stats: [
      { id: 'complete', icon: 'complete', value: '9/12', label: 'complete' },
      { id: 'absent', icon: 'absent', value: '2', label: 'absent' },
      { id: 'retest', icon: 'retest', value: '1', label: 'retest' },
    ],
  },
  {
    id: 'geometry-practical-task',
    title: 'Geometry practical task',
    reason: 'Assessment continuing across lessons',
    detail: '8 of 12 students observed',
    action: 'Open',
    stats: [
      { id: 'observed', icon: 'observed', value: '8/12', label: 'observed' },
      { id: 'continuing', icon: 'review', value: 'Across', label: 'lessons' },
    ],
  },
  {
    id: 'percentages-test',
    title: 'Percentages test',
    reason: '2 student files ready for review',
    detail: 'Anna can review or leave them for later',
    action: 'Review',
    stats: [
      { id: 'entered', icon: 'complete', value: '10', label: 'entered' },
      { id: 'review', icon: 'review', value: '2', label: 'to review' },
    ],
  },
];

const startOptions = [
  {
    id: 'enter-results',
    title: 'Enter results',
    detail: 'Record results from a printed test, Google Classroom or another external source. No upload or AI required.',
  },
  {
    id: 'create-assessment',
    title: 'Create assessment',
    detail: 'Generate ideas, questions, a test, answer key or marking guide. Edit, export, save or discard.',
  },
  {
    id: 'assess-work',
    title: 'Assess student work',
    detail: 'Select PDFs, images or documents from Anna’s cloud. AI suggestions are temporary and optional.',
  },
];

const privateLibraryItems = [
  { id: 'fractions-check', title: 'Fractions and percentages check', meta: 'Question set · answer key', thumbnail: 'fractions' },
  { id: 'geometry-task', title: 'Geometry diagrams task', meta: 'Practical task · rubric', thumbnail: 'geometry' },
  { id: 'algebra-quiz', title: 'Algebra quiz draft', meta: 'Generated draft · not saved', thumbnail: 'algebra' },
];

const smartDeskLibraryItems = [
  { id: 'sd-fractions', title: 'Fractions checkpoint', meta: 'SmartDesk template · Reviewed', thumbnail: 'fractions' },
  { id: 'sd-geometry', title: 'Geometry reasoning task', meta: 'Community shared · editable', thumbnail: 'geometry' },
  { id: 'sd-algebra', title: 'Algebra methods quiz', meta: 'Teacher used · answer key', thumbnail: 'algebra' },
];

function formatDemoDate(date) {
  if (!date) return 'No date';

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function buildRecentAssessmentRecords() {
  const grouped = new Map();

  maths7AEvidence
    .map(normalizeMathsEvidenceItem)
    .filter((item) => item?.type === 'assessment')
    .forEach((item) => {
      const title = item.assessmentTitle || item.label || 'Assessment';
      const key = [title, item.date, item.assessmentType || '', item.evidenceTopicId || ''].join('::');

      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          title,
          date: item.date,
          studentIds: new Set(),
        });
      }

      grouped.get(key).studentIds.add(item.studentId);
    });

  return [...grouped.values()]
    .map((record) => ({ ...record, resultCount: record.studentIds.size }))
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 3);
}

function buildStoredAssessmentContinueItem(record) {
  const studentResults = Array.isArray(record.studentResults) ? record.studentResults : [];
  const absentCount = studentResults.filter((result) => result.absent).length;
  const enteredCount = studentResults.filter((result) => result.rawResult || result.absent).length;
  const warningCount = studentResults.filter((result) => result.warning).length;

  return {
    id: record.id,
    title: record.title,
    reason: record.teachingUnitTitle || 'Stored demo test',
    detail: `${enteredCount}/${maths7AStudents.length} students recorded`,
    action: 'Continue',
    stats: [
      { id: 'entered', icon: 'complete', value: `${enteredCount}/${maths7AStudents.length}`, label: 'recorded' },
      { id: 'absent', icon: 'absent', value: String(absentCount), label: 'absent' },
      { id: 'warning', icon: 'review', value: String(warningCount), label: 'warnings' },
    ],
    localRecord: record,
  };
}

function SectionTitle({ title, detail }) {
  return (
    <Box>
      <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 900, lineHeight: 1.25 }}>{title}</Typography>
      {detail && <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.4, lineHeight: 1.4 }}>{detail}</Typography>}
    </Box>
  );
}

function QuietButton({ children, onClick }) {
  return (
    <Button
      type="button"
      size="small"
      variant="outlined"
      onClick={onClick}
      sx={{
        borderColor: 'rgba(23, 21, 26, 0.12)',
        color: darkText,
        borderRadius: '9px',
        textTransform: 'none',
        fontSize: 12.3,
        fontWeight: 760,
        '&:hover': { bgcolor: '#fff', borderColor: 'rgba(156, 40, 175, 0.28)' },
      }}
    >
      {children}
    </Button>
  );
}

function DocumentThumbnail({ variant = 'fractions' }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: 48,
        aspectRatio: '0.72',
        flexShrink: 0,
        borderRadius: '6px',
        border: '1px solid rgba(23, 21, 26, 0.14)',
        bgcolor: '#fff',
        p: 0.5,
        display: 'grid',
        gap: 0.35,
      }}
    >
      <Box sx={{ height: 4, width: '70%', borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.18)' }} />
      {variant === 'geometry' ? (
        <Box sx={{ position: 'relative', height: 22 }}>
          <Box sx={{ position: 'absolute', left: '18%', top: '18%', width: '56%', height: '56%', borderLeft: '1.5px solid rgba(23, 21, 26, 0.68)', borderBottom: '1.5px solid rgba(23, 21, 26, 0.68)', transform: 'skewX(-18deg)' }} />
          <Box sx={{ position: 'absolute', right: '16%', bottom: '14%', width: 9, height: 9, borderRadius: '50%', border: '1px solid rgba(156, 40, 175, 0.45)' }} />
        </Box>
      ) : variant === 'algebra' ? (
        <Stack spacing={0.35}>
          {['x + 4 =', '3y - 2', 'n / 5 ='].map((line) => (
            <Typography key={line} sx={{ color: 'rgba(23, 21, 26, 0.66)', fontSize: 6.2, fontWeight: 800, lineHeight: 1 }}>
              {line}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Stack spacing={0.35}>
          <Box sx={{ height: 6, borderRadius: '999px', background: `linear-gradient(90deg, ${purple} 0 50%, rgba(23, 21, 26, 0.1) 50% 100%)` }} />
          <Box sx={{ height: 6, borderRadius: '999px', background: `linear-gradient(90deg, ${purple} 0 33%, rgba(23, 21, 26, 0.1) 33% 100%)` }} />
          <Box sx={{ height: 6, borderRadius: '999px', background: `linear-gradient(90deg, ${purple} 0 75%, rgba(23, 21, 26, 0.1) 75% 100%)` }} />
        </Stack>
      )}
      <Box sx={{ height: 3, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.1)' }} />
      <Box sx={{ height: 3, width: '82%', borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.1)' }} />
    </Box>
  );
}

function getStatIcon(icon) {
  const sx = { color: 'rgba(23, 21, 26, 0.52)', fontSize: 16 };

  if (icon === 'complete') return <CheckCircleOutlineIcon sx={sx} />;
  if (icon === 'absent') return <PersonOffOutlinedIcon sx={sx} />;
  if (icon === 'retest') return <ReplayIcon sx={sx} />;
  if (icon === 'observed') return <VisibilityOutlinedIcon sx={sx} />;
  if (icon === 'review') return <RateReviewIcon sx={sx} />;

  return <CheckCircleOutlineIcon sx={sx} />;
}

function OngoingItem({ item, selected, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'block',
        width: '100%',
        minHeight: 188,
        p: 1.15,
        borderRadius: '12px',
        border: selected ? '1px solid rgba(156, 40, 175, 0.3)' : '1px solid rgba(23, 21, 26, 0.09)',
        bgcolor: selected ? 'rgba(156, 40, 175, 0.035)' : '#fff',
        textAlign: 'left',
        '&:hover': { bgcolor: 'rgba(156, 40, 175, 0.025)' },
        '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
      }}
    >
      <Stack spacing={1} sx={{ height: '100%' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: darkText, fontSize: 13.6, fontWeight: 880, lineHeight: 1.25 }}>{item.title}</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35 }}>{item.reason}</Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 0.55,
          }}
        >
          {(item.stats || []).map((stat) => (
            <Stack
              key={stat.id}
              direction="row"
              spacing={0.55}
              alignItems="center"
              sx={{
                minWidth: 0,
                px: 0.75,
                py: 0.55,
                borderRadius: '9px',
                bgcolor: 'rgba(23, 21, 26, 0.035)',
              }}
            >
              {getStatIcon(stat.icon)}
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: darkText, fontSize: 12.3, fontWeight: 870, lineHeight: 1.05 }}>{stat.value}</Typography>
                <Typography noWrap sx={{ color: 'text.secondary', fontSize: 10.8, fontWeight: 720, lineHeight: 1.15 }}>{stat.label}</Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Stack>
    </ButtonBase>
  );
}

function PreviewResource({ item }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.9, minWidth: 0, p: 0.9, borderRadius: '11px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
      <DocumentThumbnail variant={item.thumbnail} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: darkText, fontSize: 12.9, fontWeight: 840, lineHeight: 1.25 }}>{item.title}</Typography>
        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.9, lineHeight: 1.35 }}>{item.meta}</Typography>
      </Box>
    </Box>
  );
}

export default function AssessmentViewTemplateV1() {
  const recentRecords = useMemo(buildRecentAssessmentRecords, []);
  const [activeRoute, setActiveRoute] = useState('continue');
  const [selectedOngoingId, setSelectedOngoingId] = useState('');
  const [selectedStartId, setSelectedStartId] = useState('');
  const [selectedFindId, setSelectedFindId] = useState('my-cloud');
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [resultMode, setResultMode] = useState('number');
  const [maxScore, setMaxScore] = useState('100');
  const [passScore, setPassScore] = useState('50');
  const [draftAssessmentTitle, setDraftAssessmentTitle] = useState('');
  const [draftTeachingUnitId, setDraftTeachingUnitId] = useState('');
  const [draftResults, setDraftResults] = useState({});
  const [draftAbsentStudents, setDraftAbsentStudents] = useState({});
  const [savedAssessmentNotice, setSavedAssessmentNotice] = useState(null);
  const [storedAssessments, setStoredAssessments] = useState(() => readMaths7AAssessmentResults().assessments);
  const [editingStoredAssessmentId, setEditingStoredAssessmentId] = useState('');
  const storedContinueItems = useMemo(() => storedAssessments.map(buildStoredAssessmentContinueItem), [storedAssessments]);
  const continueAssessments = useMemo(() => [...storedContinueItems, ...ongoingAssessments], [storedContinueItems]);
  const selectedOngoing = continueAssessments.find((item) => item.id === selectedOngoingId);
  const selectedStart = startOptions.find((item) => item.id === selectedStartId);
  const resultsAssessment = ongoingAssessments[0];
  const isStartResultsEntry = selectedStartId === 'enter-results';
  const isResultsEntry = isStartResultsEntry || Boolean(editingStoredAssessmentId);
  const selectedTeachingUnit = mathsTeachingUnits.find((unit) => unit.id === draftTeachingUnitId);

  useEffect(() => {
    function refreshStoredAssessments() {
      setStoredAssessments(readMaths7AAssessmentResults().assessments);
    }

    function handleStorageChange(event) {
      if (event.key === MATHS_7A_ASSESSMENT_RESULTS_STORAGE_KEY) {
        refreshStoredAssessments();
      }
    }

    window.addEventListener(MATHS_7A_ASSESSMENT_RESULTS_STORAGE_EVENT, refreshStoredAssessments);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(MATHS_7A_ASSESSMENT_RESULTS_STORAGE_EVENT, refreshStoredAssessments);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  function closeReveal() {
    setActiveRoute('continue');
    setSelectedOngoingId('');
    setSelectedStartId('');
    setEditingStoredAssessmentId('');
  }

  function handleOngoingAssessmentClick(item) {
    if (item.localRecord) {
      handleStoredAssessmentClick(item.localRecord);
      return;
    }

    setSelectedOngoingId(item.id);
    setSelectedStartId('');
    setEditingStoredAssessmentId('');
    if (item.id === resultsAssessment.id) {
      setResultsDialogOpen(true);
    }
  }

  function handleStartOptionClick(option) {
    setSelectedStartId(option.id);
    setSelectedOngoingId('');
    setEditingStoredAssessmentId('');
    if (option.id === 'enter-results') {
      setDraftAssessmentTitle('');
      setDraftTeachingUnitId('');
      setSavedAssessmentNotice(null);
      setResultsDialogOpen(true);
    }
  }

  function handleStoredAssessmentClick(record) {
    setActiveRoute('continue');
    setSelectedOngoingId(record.id);
    setSelectedStartId('enter-results');
    setEditingStoredAssessmentId(record.id);
    setSavedAssessmentNotice(null);
    setDraftAssessmentTitle(record.title || '');
    setDraftTeachingUnitId(record.teachingUnitId || '');
    setResultMode(record.resultMode || 'number');
    setMaxScore(record.maxScore === null || record.maxScore === undefined ? '100' : String(record.maxScore));
    setPassScore(record.passScore === null || record.passScore === undefined ? '50' : String(record.passScore));
    setDraftResults((record.studentResults || []).reduce((results, result) => ({
      ...results,
      [result.studentId]: result.rawResult || '',
    }), {}));
    setDraftAbsentStudents((record.studentResults || []).reduce((absentStudents, result) => ({
      ...absentStudents,
      [result.studentId]: Boolean(result.absent),
    }), {}));
    setResultsDialogOpen(true);
  }

  function handleSaveAssessmentResults() {
    if (!isResultsEntry) {
      setResultsDialogOpen(false);
      return;
    }

    const numericMaxScore = Number(maxScore);
    const numericPassScore = Number(passScore);
    const hasValidMaxScore = Number.isFinite(numericMaxScore) && numericMaxScore > 0;
    const hasValidPassScore = Number.isFinite(numericPassScore);

    const existingRecord = storedAssessments.find((record) => record.id === editingStoredAssessmentId);
    const saveResult = upsertMaths7AAssessmentResult({
      id: editingStoredAssessmentId || undefined,
      assessmentId: existingRecord?.assessmentId || selectedStart?.id || 'enter-results',
      date: existingRecord?.date,
      createdAt: existingRecord?.createdAt,
      teachingUnitId: selectedTeachingUnit?.id || '',
      teachingUnitTitle: selectedTeachingUnit?.title || '',
      title: draftAssessmentTitle,
      resultMode,
      maxScore: hasValidMaxScore ? numericMaxScore : null,
      passScore: hasValidPassScore ? numericPassScore : null,
      studentResults: maths7AStudents.map((student) => {
        const rawResult = draftResults[student.id] || '';
        const absent = Boolean(draftAbsentStudents[student.id]);
        const numericResult = Number(rawResult);
        const hasNumericResult = resultMode === 'number' && rawResult !== '' && Number.isFinite(numericResult);
        const percentage = !absent && hasNumericResult && hasValidMaxScore
          ? Math.round((numericResult / numericMaxScore) * 100)
          : null;
        const warning = !absent && (
          (hasNumericResult && hasValidPassScore && numericResult < numericPassScore)
          || (resultMode === 'letter' && rawResult.toUpperCase() === 'F')
        );

        return {
          studentId: student.id,
          rawResult,
          percentage,
          absent,
          warning,
        };
      }),
    });

    setResultsDialogOpen(false);
    if (saveResult.record) {
      setStoredAssessments(saveResult.payload.assessments);
      setSavedAssessmentNotice({
        title: saveResult.record.title,
        teachingUnitTitle: saveResult.record.teachingUnitTitle,
        persisted: saveResult.persisted,
      });
    }
    setDraftAssessmentTitle('');
    setDraftTeachingUnitId('');
    setDraftResults({});
    setDraftAbsentStudents({});
    setEditingStoredAssessmentId('');
  }

  return (
    <Stack spacing={1.45}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          width: '100%',
        }}
      >
        <Tabs
          value={['continue', 'start', 'find'].includes(activeRoute) ? activeRoute : false}
          onChange={(_, nextRoute) => setActiveRoute(nextRoute)}
          aria-label="Assessment routes"
          variant="scrollable"
          sx={{
            width: 'auto',
            minHeight: 42,
            border: `1px solid ${border}`,
            borderRadius: '12px',
            p: 0.35,
            bgcolor: '#fff',
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 34,
              minWidth: 0,
              px: 1.2,
              borderRadius: '9px',
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 820,
              gap: 0.65,
              '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
            },
            '& .Mui-selected': {
              color: `${purple} !important`,
              bgcolor: 'rgba(156, 40, 175, 0.055)',
            },
          }}
        >
          <Tab value="continue" icon={<PlayArrowIcon fontSize="small" />} iconPosition="start" label="Continue" />
          <Tab value="start" icon={<AutoAwesomeIcon fontSize="small" />} iconPosition="start" label="Start" />
          <Tab value="find" icon={<SearchIcon fontSize="small" />} iconPosition="start" label="Discover" />
        </Tabs>

        <Tabs
          value={activeRoute === 'archive' ? 'archive' : false}
          onChange={(_, nextRoute) => setActiveRoute(nextRoute)}
          aria-label="Assessment archive"
          variant="scrollable"
          sx={{
            flexShrink: 0,
            width: 'auto',
            minHeight: 42,
            border: `1px solid ${border}`,
            borderRadius: '12px',
            p: 0.35,
            bgcolor: '#fff',
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 34,
              minWidth: 0,
              px: 1.2,
              borderRadius: '9px',
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 820,
              gap: 0.65,
              '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
            },
            '& .Mui-selected': {
              color: `${purple} !important`,
              bgcolor: 'rgba(156, 40, 175, 0.055)',
            },
          }}
        >
          <Tab value="archive" icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Archive" />
        </Tabs>
      </Box>

      {savedAssessmentNotice && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            px: 1,
            py: 0.85,
            borderRadius: '12px',
            border: '1px solid rgba(156, 40, 175, 0.22)',
            bgcolor: 'rgba(156, 40, 175, 0.045)',
            color: darkText,
          }}
        >
          <CheckCircleOutlineIcon sx={{ color: purple, fontSize: 18, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 860, lineHeight: 1.25 }}>
              Demo test stored
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 11.8, lineHeight: 1.35 }}>
              {savedAssessmentNotice.title}
              {savedAssessmentNotice.teachingUnitTitle ? ` · ${savedAssessmentNotice.teachingUnitTitle}` : ''}
              {!savedAssessmentNotice.persisted ? ' · session only' : ''}
            </Typography>
          </Box>
        </Box>
      )}

      <ButtonBase
        onClick={() => setActiveRoute('continue')}
        sx={{
          alignSelf: 'flex-start',
          borderRadius: '8px',
          color: 'text.secondary',
          textAlign: 'left',
          '&:hover': { color: purple },
          '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
        }}
      >
        <Typography sx={{ fontSize: 12.5, fontWeight: 720 }}>
          {continueAssessments.length} ongoing assessments
        </Typography>
      </ButtonBase>

      <Paper elevation={0} sx={{ p: { xs: 1.2, sm: 1.45 }, borderRadius: '16px', border: `1px solid ${border}`, bgcolor: '#fbfafc' }}>
          <Stack spacing={1.1}>
            {activeRoute !== 'continue' && (
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <SectionTitle
                  title={activeRoute === 'start' ? 'Start' : activeRoute === 'find' ? 'Discover' : 'Archive'}
                  detail={activeRoute === 'start'
                    ? 'Choose one optional route. This does not create a record automatically.'
                    : activeRoute === 'find'
                      ? 'Private cloud resources and SmartDesk resources stay separate.'
                      : 'Completed tests and saved assessment records.'}
                />
                <QuietButton onClick={closeReveal}>Reset</QuietButton>
              </Stack>
            )}

            {activeRoute === 'continue' && (
              <Stack spacing={0.8}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      lg: 'repeat(3, minmax(0, 1fr))',
                      xl: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 0.9,
                  }}
                >
                  {continueAssessments.map((item) => (
                    <OngoingItem
                      key={item.id}
                      item={item}
                      selected={selectedOngoingId === item.id}
                      onClick={() => handleOngoingAssessmentClick(item)}
                    />
                  ))}
                </Box>
                {selectedOngoing && (
                  <Typography sx={{ color: 'text.secondary', fontSize: 12.4, lineHeight: 1.45 }}>
                    Selected: {selectedOngoing.title}. Anna can continue, change direction, or leave this for later.
                  </Typography>
                )}
                <QuietButton>View all ongoing assessments</QuietButton>
              </Stack>
            )}

            {activeRoute === 'start' && (
              <Stack spacing={0.8}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 0.8 }}>
                  {startOptions.map((option) => (
                    <ButtonBase
                      key={option.id}
                      onClick={() => handleStartOptionClick(option)}
                      sx={{
                        display: 'block',
                        width: '100%',
                        p: 1,
                        borderRadius: '11px',
                        border: selectedStartId === option.id ? '1px solid rgba(156, 40, 175, 0.28)' : '1px solid rgba(23, 21, 26, 0.09)',
                        bgcolor: selectedStartId === option.id ? 'rgba(156, 40, 175, 0.035)' : '#fff',
                        textAlign: 'left',
                      }}
                    >
                      <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860 }}>{option.title}</Typography>
                      <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.1, lineHeight: 1.38 }}>{option.detail}</Typography>
                    </ButtonBase>
                  ))}
                </Box>
                {selectedStart && (
                  <Typography sx={{ color: 'text.secondary', fontSize: 12.4, lineHeight: 1.45 }}>
                    {selectedStart.title}: this would open a focused working view. Anna can edit, override, ignore or save when ready.
                  </Typography>
                )}
              </Stack>
            )}

            {activeRoute === 'find' && (
              <Stack spacing={1}>
                <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                  {[
                    ['my-cloud', 'My cloud library', <CloudOutlinedIcon key="cloud" fontSize="small" />],
                    ['smartdesk', 'SmartDesk library', <WorkspacesIcon key="smartdesk" fontSize="small" />],
                  ].map(([id, label, icon]) => {
                    const selected = selectedFindId === id;

                    return (
                      <Button
                        key={id}
                        type="button"
                        size="small"
                        startIcon={icon}
                        onClick={() => setSelectedFindId(id)}
                        sx={{
                          border: selected ? `1px solid ${purple}` : '1px solid rgba(23, 21, 26, 0.11)',
                          color: selected ? purple : darkText,
                          bgcolor: selected ? 'rgba(156, 40, 175, 0.045)' : '#fff',
                          borderRadius: '999px',
                          textTransform: 'none',
                          fontSize: 12.2,
                          fontWeight: 760,
                        }}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </Stack>

                {selectedFindId === 'my-cloud' && (
                  <Stack spacing={0.75}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>Anna’s private assessment materials in her connected cloud storage.</Typography>
                    {privateLibraryItems.slice(0, 3).map((item) => <PreviewResource key={item.id} item={item} />)}
                    <QuietButton>View library</QuietButton>
                  </Stack>
                )}

                {selectedFindId === 'smartdesk' && (
                  <Stack spacing={0.75}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>Optional SmartDesk templates and community-shared resources.</Typography>
                    {smartDeskLibraryItems.slice(0, 3).map((item) => <PreviewResource key={item.id} item={item} />)}
                    <QuietButton>Browse library</QuietButton>
                  </Stack>
                )}

              </Stack>
            )}

            {activeRoute === 'archive' && (
              <Stack spacing={0.75}>
                <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>
                  Completed tests and assessment records Anna previously chose to create or save.
                </Typography>
                {recentRecords.map((record) => (
                  <Box key={record.id} sx={{ p: 0.9, borderRadius: '11px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                    <Typography sx={{ color: darkText, fontSize: 12.9, fontWeight: 840 }}>{record.title}</Typography>
                    <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.9 }}>
                      {formatDemoDate(record.date)} · {record.resultCount}/{maths7AStudents.length} results saved
                    </Typography>
                  </Box>
                ))}
                <QuietButton>View assessment history</QuietButton>
              </Stack>
            )}
          </Stack>
        </Paper>
      <AssessmentResultsDialog
        assessment={editingStoredAssessmentId ? { title: 'Edit test results' } : selectedStartId === 'enter-results' ? selectedStart : resultsAssessment}
        open={resultsDialogOpen}
        resultMode={resultMode}
        maxScore={maxScore}
        passScore={passScore}
        testTitle={isResultsEntry ? draftAssessmentTitle : undefined}
        selectedTeachingUnitId={isResultsEntry ? draftTeachingUnitId : undefined}
        teachingUnits={isResultsEntry ? mathsTeachingUnits : undefined}
        results={draftResults}
        absentStudents={draftAbsentStudents}
        onClose={() => setResultsDialogOpen(false)}
        onResultModeChange={setResultMode}
        onMaxScoreChange={setMaxScore}
        onPassScoreChange={setPassScore}
        onTestTitleChange={isResultsEntry ? setDraftAssessmentTitle : undefined}
        onTeachingUnitChange={isResultsEntry ? setDraftTeachingUnitId : undefined}
        onSave={handleSaveAssessmentResults}
        requireTestTitle={isResultsEntry}
        onAbsentChange={(studentId, checked) => {
          setDraftAbsentStudents((previous) => ({
            ...previous,
            [studentId]: checked,
          }));
        }}
        onResultChange={(studentId, value) => {
          setDraftResults((previous) => ({
            ...previous,
            [studentId]: value,
          }));
        }}
      />
    </Stack>
  );
}
