import { useEffect, useMemo, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import HistoryIcon from '@mui/icons-material/History';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import { Box, Button, ButtonBase, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import AssessmentResultsEntryModal from '../AssessmentResultsEntryModal.jsx';
import {
  LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT,
  getLearningModuleAssessmentResultsStorageKey,
  readLearningModuleAssessmentResults,
} from '../utils/assessmentResultsStorage.js';

const purple = '#9c28af';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';

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
  { id: 'reading-check', title: 'Reading response check', meta: 'Question set · marking notes', thumbnail: 'reading' },
  { id: 'speaking-task', title: 'Speaking discussion task', meta: 'Practical task · rubric', thumbnail: 'speaking' },
  { id: 'writing-draft', title: 'Writing accuracy draft', meta: 'Generated draft · not saved', thumbnail: 'writing' },
];

const smartDeskLibraryItems = [
  { id: 'sd-reading', title: 'Reading checkpoint', meta: 'SmartDesk template · Reviewed', thumbnail: 'reading' },
  { id: 'sd-listening', title: 'Listening comprehension task', meta: 'Community shared · editable', thumbnail: 'listening' },
  { id: 'sd-writing', title: 'Writing structure quiz', meta: 'Teacher used · answer key', thumbnail: 'writing' },
];

function formatDemoDate(date) {
  if (!date) return 'No date';

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getAssessmentItems(evidenceItems) {
  return (evidenceItems || []).filter((item) => item?.type === 'assessment');
}

function normalizeStoredAssessmentAsEvidence(record) {
  return {
    ...record,
    type: 'assessment',
    results: record.results || record.studentResults || [],
  };
}

function buildAssessmentCard(assessment, students, teachingUnits) {
  const studentResults = Array.isArray(assessment.results) ? assessment.results : assessment.studentResults || [];
  const absentCount = studentResults.filter((result) => result.absent).length;
  const enteredCount = studentResults.filter((result) => (
    result.absent
    || result.score !== undefined
    || result.rawResult
    || (result.actualValue !== undefined && result.actualValue !== null)
  )).length;
  const warningCount = studentResults.filter((result) => result.warning || result.passed === false).length;
  const teachingUnit = teachingUnits.find((unit) => unit.id === assessment.teachingUnitId);

  return {
    id: assessment.id,
    title: assessment.title || assessment.assessmentTitle || assessment.label || 'Assessment',
    reason: teachingUnit?.title || teachingUnit?.label || 'Assessment record',
    detail: `${enteredCount}/${students.length} students recorded`,
    action: 'Continue',
    date: assessment.date,
    stats: [
      { id: 'entered', icon: 'complete', value: `${enteredCount}/${students.length}`, label: 'recorded' },
      { id: 'absent', icon: 'absent', value: String(absentCount), label: 'absent' },
      { id: 'warning', icon: 'review', value: String(warningCount), label: 'warnings' },
    ],
    source: assessment,
    localRecord: assessment.studentResults ? assessment : null,
  };
}

function buildArchiveRecords(assessments, students) {
  return [...assessments]
    .sort((first, second) => (second.date || '').localeCompare(first.date || ''))
    .slice(0, 4)
    .map((assessment) => {
      const resultCount = Array.isArray(assessment.results)
        ? assessment.results.length
        : Array.isArray(assessment.studentResults) ? assessment.studentResults.length : 0;

      return {
        id: assessment.id,
        title: assessment.title || assessment.assessmentTitle || assessment.label || 'Assessment',
        date: assessment.date,
        resultCount,
        totalCount: students.length,
      };
    });
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

function DocumentThumbnail({ variant = 'reading' }) {
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
      {variant === 'speaking' ? (
        <Box sx={{ display: 'flex', gap: 0.35, alignItems: 'end', height: 22 }}>
          {[10, 16, 8].map((height, index) => (
            <Box key={height + index} sx={{ width: 7, height, borderRadius: '999px', bgcolor: index === 1 ? purple : 'rgba(23, 21, 26, 0.18)' }} />
          ))}
        </Box>
      ) : variant === 'writing' ? (
        <Stack spacing={0.35}>
          {['topic', 'reason', 'example'].map((line) => (
            <Typography key={line} sx={{ color: 'rgba(23, 21, 26, 0.66)', fontSize: 6.2, fontWeight: 800, lineHeight: 1 }}>
              {line}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Stack spacing={0.35}>
          <Box sx={{ height: 4, borderRadius: '999px', bgcolor: purple, width: '80%' }} />
          <Box sx={{ height: 4, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.14)', width: '96%' }} />
          <Box sx={{ height: 4, borderRadius: '999px', bgcolor: 'rgba(23, 21, 26, 0.14)', width: '66%' }} />
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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.55 }}>
          {(item.stats || []).map((stat) => (
            <Stack key={stat.id} direction="row" spacing={0.55} alignItems="center" sx={{ minWidth: 0, px: 0.75, py: 0.55, borderRadius: '9px', bgcolor: 'rgba(23, 21, 26, 0.035)' }}>
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

export default function AssessmentScreen({ moduleConfig }) {
  const students = moduleConfig?.classData?.students || [];
  const teachingUnits = moduleConfig?.curriculum?.teachingUnits || [];
  const moduleId = moduleConfig?.id || 'learning-module';
  const demoDate = moduleConfig?.lessons?.current?.date || new Date().toISOString().slice(0, 10);
  const [storedAssessments, setStoredAssessments] = useState(() => readLearningModuleAssessmentResults(moduleId).assessments);
  const assessments = useMemo(() => [
    ...storedAssessments.map(normalizeStoredAssessmentAsEvidence),
    ...getAssessmentItems(moduleConfig?.evidence?.items),
  ], [moduleConfig, storedAssessments]);
  const continueAssessments = useMemo(
    () => assessments.map((assessment) => buildAssessmentCard(assessment, students, teachingUnits)),
    [assessments, students, teachingUnits],
  );
  const archiveRecords = useMemo(() => buildArchiveRecords(assessments, students), [assessments, students]);
  const [activeRoute, setActiveRoute] = useState('continue');
  const [selectedOngoingId, setSelectedOngoingId] = useState('');
  const [selectedStartId, setSelectedStartId] = useState('');
  const [selectedFindId, setSelectedFindId] = useState('my-cloud');
  const [resultsModalState, setResultsModalState] = useState({
    open: false,
    assessment: null,
    storedAssessment: null,
  });
  const [savedAssessmentNotice, setSavedAssessmentNotice] = useState(null);
  const selectedOngoing = continueAssessments.find((item) => item.id === selectedOngoingId);
  const selectedStart = startOptions.find((item) => item.id === selectedStartId);

  useEffect(() => {
    function refreshStoredAssessments() {
      setStoredAssessments(readLearningModuleAssessmentResults(moduleId).assessments);
    }

    function handleStorageChange(event) {
      if (event.key === getLearningModuleAssessmentResultsStorageKey(moduleId)) {
        refreshStoredAssessments();
      }
    }

    function handleCustomStorageChange(event) {
      if (!event.detail?.moduleId || event.detail.moduleId === moduleId) {
        refreshStoredAssessments();
      }
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT, handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT, handleCustomStorageChange);
    };
  }, [moduleId]);

  function closeReveal() {
    setActiveRoute('continue');
    setSelectedOngoingId('');
    setSelectedStartId('');
  }

  function handleOngoingAssessmentClick(item) {
    if (item.localRecord) {
      setActiveRoute('continue');
      setSelectedOngoingId(item.id);
      setSelectedStartId('enter-results');
      setSavedAssessmentNotice(null);
      setResultsModalState({
        open: true,
        assessment: { id: 'enter-results', title: 'Enter results' },
        storedAssessment: item.localRecord,
      });
      return;
    }

    setActiveRoute('continue');
    setSelectedOngoingId(item.id);
    setSelectedStartId('');
  }

  function handleStartOptionClick(option) {
    setSelectedStartId(option.id);
    setSelectedOngoingId('');
    if (option.id === 'enter-results') {
      setSavedAssessmentNotice(null);
      setResultsModalState({
        open: true,
        assessment: option,
        storedAssessment: null,
      });
    }
  }

  function closeResultsModal() {
    setResultsModalState((previous) => ({
      ...previous,
      open: false,
    }));
  }

  function handleAssessmentResultsSaved(saveResult) {
    setStoredAssessments(saveResult.payload.assessments);
    setActiveRoute('continue');
    setSelectedOngoingId(saveResult.record.id);
    setSavedAssessmentNotice({
      title: saveResult.record.title,
      teachingUnitTitle: saveResult.record.teachingUnitTitle,
      persisted: saveResult.persisted,
    });
  }

  return (
    <Stack spacing={1.45}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
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
                  <OngoingItem key={item.id} item={item} selected={selectedOngoingId === item.id} onClick={() => handleOngoingAssessmentClick(item)} />
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
              {archiveRecords.map((record) => (
                <Box key={record.id} sx={{ p: 0.9, borderRadius: '11px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                  <Typography sx={{ color: darkText, fontSize: 12.9, fontWeight: 840 }}>{record.title}</Typography>
                  <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.9 }}>
                    {formatDemoDate(record.date)} · {record.resultCount}/{record.totalCount} results saved
                  </Typography>
                </Box>
              ))}
              <QuietButton>View assessment history</QuietButton>
            </Stack>
          )}
        </Stack>
      </Paper>
      <AssessmentResultsEntryModal
        assessment={resultsModalState.assessment}
        storedAssessment={resultsModalState.storedAssessment}
        demoDate={demoDate}
        moduleId={moduleId}
        students={students}
        teachingUnits={teachingUnits}
        open={resultsModalState.open}
        onClose={closeResultsModal}
        onSaved={handleAssessmentResultsSaved}
      />
    </Stack>
  );
}
