import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Tooltip from '@mui/material/Tooltip';
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  Divider,
  Dialog,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { annaSchedule } from '../data/annaSchedule.js';
import { annaTasks } from '../data/annaTasks.js';
import { maths7AClassData } from '../data/Maths7AClassData.js';
import { maths7AEvidence } from '../data/Maths7AEvidence.js';
import { maths7APlanningBlocks, maths7APlanningPeriods } from '../data/maths7APlanning.js';
import { maths7AStudents } from '../data/Maths7AStudents.js';
import { classGroupDefinitions } from '../data/classGroupDefinitions.js';
import {
  getEvidenceTopicById,
  getTeachingUnitById,
  getTeachingUnitForPlanningBlock,
  mathsAbilities,
  mathsCurriculumAreas,
  mathsEvidenceTopics,
  mathsQuickAddTemplates,
  mathsTeachingUnits,
  normalizeMathsPlanningBlock,
} from '../data/mathsCurriculum.js';
import { useClassWorkingGroups } from '../hooks/useClassWorkingGroups.js';
import { usePlanningCurriculumNotes } from '../hooks/usePlanningCurriculumNotes.js';
import { useSubjectPlanning } from '../hooks/useSubjectPlanning.js';
import {
  getEvidenceForStudent,
  getMergedMathsEvidence,
  getStudentAssessments,
  getStudentEvidenceByContent,
  getStudentEvidenceSummary,
  getStudentObservations,
  getStudentPictureSummary,
  getStudentTopicCell,
  getStudentVisiblePatterns,
  sortEvidenceByDate,
} from '../utils/maths7APictureUtils.js';
import { getGroupsForStudent } from '../utils/classGroupUtils.js';
import { getCurrentWeekContext } from '../utils/weekDataUtils.js';
import { GroupDialog } from './classPicture/ClassWorkingGroups.jsx';
import StudentProfileDataDialog from './classPicture/StudentProfileDataDialog.jsx';
import SubjectPlanningBoard from './planning/SubjectPlanningBoard.jsx';
import SubjectWorkspaceContainer from './SubjectWorkspaceContainer.jsx';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';
const evidenceStorageKey = 'smartdesk_demo_maths7a_evidence';
const planningStorageKey = 'smartdesk_demo_maths7a_plan';

const classPicture = {
  summary: 'The available information suggests that Mathematics 7A is currently more secure with calculation than written problem-solving. Verbal modelling and paired explanation have produced several useful observations. The picture for algebra and statistics is still limited.',
  examples: ['Written problems have been more difficult than calculations for several students.', 'Verbal modelling appeared to help.'],
  noticed: 'Several students appear more secure with calculation than written problem-solving.',
  suggestion: 'You may want to include one short language-focused example today.',
};

function readJsonStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function findLinkedTasks(tasks, student) {
  return tasks.filter((task) => (
    task.studentId === student.id
    || task.moduleId === 'maths'
    || task.moduleId === 'mathematics'
    || task.preferredWindowEventId === 'mon-maths-7a'
  ));
}

function readHistoricalResult(student) {
  return student.previousResults?.find((result) => result.subjectId === 'mathematics') || null;
}

function getTopicLabel(topicId) {
  return getEvidenceTopicById(topicId)?.title || getTeachingUnitById(topicId)?.title || topicId;
}

function formatDemoDate(date) {
  if (!date) {
    return 'No saved date';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getMondayMathsLesson() {
  return getCurrentWeekContext(annaSchedule).days
    .find((day) => day.id === annaSchedule.currentContext.currentDayId)
    ?.events.find((event) => event.originalId === 'mon-maths-7a');
}

function getCurrentPlanningUnitTitle(block) {
  const teachingUnit = getTeachingUnitForPlanningBlock(block);
  if (!block && !teachingUnit) {
    return 'Mathematics 7A';
  }

  if (block?.title && block.title !== teachingUnit?.title) {
    return block.title;
  }

  return teachingUnit?.title || block?.title || 'Mathematics 7A';
}

function Panel({ title, children, sx }) {
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
        {title && <Typography sx={{ color: darkText, fontSize: 20, fontWeight: 850 }}>{title}</Typography>}
        {children}
      </Stack>
    </Paper>
  );
}

function EvidenceCard({ item }) {
  const topic = item.topicId ? getTopicLabel(item.topicId) : null;
  const helper = [
    item.type === 'assessment' ? 'Assessment anchor' : 'Observation',
    topic,
    item.value ? `${item.value}${item.valueType === 'percentage' ? '%' : ''}` : null,
  ].filter(Boolean);

  return (
    <Paper elevation={0} sx={{ p: 1.45, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.09)', bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontWeight: 800, lineHeight: 1.3 }}>{item.label}</Typography>
      <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 13.2 }}>{helper.join(' - ')}</Typography>
      {item.note && (
        <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 13.5, lineHeight: 1.45 }}>{item.note}</Typography>
      )}
    </Paper>
  );
}

function StudentPictureDialog({ student, evidence, tasks, open, onClose, onCapture }) {
  if (!student) {
    return null;
  }

  const historicalResult = readHistoricalResult(student);
  const picture = getStudentPictureSummary(student, evidence);
  const topics = picture.topics.map(getTopicLabel);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '24px' },
          bgcolor: '#fff',
          boxShadow: '0 28px 80px rgba(23, 21, 26, 0.16)',
        },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
        <IconButton aria-label={`Close ${student.displayName} picture`} onClick={onClose} sx={{ position: 'absolute', top: 14, right: 14 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h2" sx={{ color: darkText, fontSize: { xs: 31, sm: 40 }, lineHeight: 1.05, pr: 5 }}>
          {student.displayName}
        </Typography>
        <Typography sx={{ mt: 0.8, color: 'text.secondary', fontWeight: 650 }}>Mathematics - 7A</Typography>

        <Box sx={{ mt: 2.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.86fr 1.14fr' }, gap: 2 }}>
          <Stack spacing={2}>
            <Panel title="Earlier reference" sx={{ bgcolor: palePurple, borderColor: 'rgba(156, 40, 175, 0.16)' }}>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
                Year 6 final grade: <Box component="span" sx={{ color: darkText, fontWeight: 850 }}>{historicalResult?.grade || 'Not shown'}</Box>
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13.8, lineHeight: 1.5 }}>
                This is a reference point only.
              </Typography>
            </Panel>

            <Panel title="SmartDesk summary">
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {picture.summary}
              </Typography>
              {picture.averageAssessment !== null && (
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
                  Average of saved assessment anchors: <Box component="span" sx={{ color: darkText, fontWeight: 850 }}>{picture.averageAssessment}%</Box>
                </Typography>
              )}
              <Typography sx={{ color: darkText, fontWeight: 800 }}>You could consider...</Typography>
              <Stack spacing={0.75}>
                {['View recent evidence', 'View related topic', 'Capture something if it feels useful'].map((item) => (
                  <Typography key={item} sx={{ color: 'text.secondary', fontSize: 14.5 }}>- {item}</Typography>
                ))}
              </Stack>
              <Button variant="outlined" onClick={onCapture} sx={{ alignSelf: 'flex-start', color: darkText, borderColor: 'rgba(23, 21, 26, 0.16)' }}>
                Capture something
              </Button>
            </Panel>
          </Stack>

          <Stack spacing={2}>
            <Panel title="Current picture is still developing">
              <Stack spacing={1}>{evidence.map((item) => <EvidenceCard key={item.id} item={item} />)}</Stack>
            </Panel>

            <Panel title="Linked follow-up">
              {tasks.length ? tasks.map((task) => (
                <Paper key={task.id} elevation={0} sx={{ p: 1.35, borderRadius: '15px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                  <Typography sx={{ color: darkText, fontWeight: 800 }}>{task.title}</Typography>
                  <Typography sx={{ mt: 0.4, color: 'text.secondary', fontSize: 13.2 }}>
                    {[task.classId?.toUpperCase(), task.date].filter(Boolean).join(' - ')}
                  </Typography>
                </Paper>
              )) : (
                <Typography sx={{ color: 'text.secondary' }}>No linked items selected for this view.</Typography>
              )}
            </Panel>

            {!!topics.length && (
              <Panel title="Recent topics">
                <Typography sx={{ color: 'text.secondary' }}>{topics.join(' - ')}</Typography>
              </Panel>
            )}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}

function QuickCapture({ students, onSave, selectedStudentId, onStudentChange }) {
  const [mode, setMode] = useState('observation');
  const [templateId, setTemplateId] = useState(maths7AClassData.quickCaptureTemplates[0]?.id || '');
  const [topicId, setTopicId] = useState(maths7AClassData.currentTopicId);
  const [note, setNote] = useState('');
  const [assessmentType, setAssessmentType] = useState(maths7AClassData.assessmentTypes[0]?.id || '');
  const [result, setResult] = useState('');

  function save() {
    const template = maths7AClassData.quickCaptureTemplates.find((item) => item.id === templateId);
    const selectedStudent = students.find((student) => student.id === selectedStudentId);
    const evidenceTopic = getEvidenceTopicById(topicId);
    const linkedUnitIds = evidenceTopic?.teachingUnitIds || [];
    const teachingUnitId = linkedUnitIds.length === 1 ? linkedUnitIds[0] : '';
    const entry = {
      id: `demo-${Date.now()}`,
      type: mode === 'assessment' ? 'assessment' : 'observation',
      assessmentType: mode === 'assessment' ? assessmentType : undefined,
      studentId: selectedStudentId,
      classId: maths7AClassData.classId,
      subjectId: maths7AClassData.subjectId,
      evidenceTopicId: evidenceTopic?.id || topicId,
      teachingUnitId,
      date: annaSchedule.currentContext.date,
      value: mode === 'assessment' && result ? Number(result) : undefined,
      valueType: mode === 'assessment' && result ? 'percentage' : undefined,
      signal: mode === 'observation' ? template?.id : undefined,
      label: mode === 'assessment' ? `${selectedStudent?.firstName || 'Student'} assessment result` : template?.label,
      note: note || null,
      source: 'teacher-demo',
    };

    onSave(entry);
    setNote('');
    setResult('');
  }

  return (
    <Panel title="Capture something">
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>What felt worth keeping?</Typography>
      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_, nextMode) => nextMode && setMode(nextMode)}
        aria-label="Capture mode"
        sx={{ flexWrap: 'wrap', gap: 1, '& .MuiToggleButtonGroup-grouped': { borderRadius: '999px !important', border: '1px solid rgba(23, 21, 26, 0.14) !important' } }}
      >
        <ToggleButton value="observation">Observation</ToggleButton>
        <ToggleButton value="assessment">Add assessment result</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.4 }}>
        <FormControl fullWidth>
          <InputLabel id="maths7a-student-label">Select student</InputLabel>
          <Select labelId="maths7a-student-label" label="Select student" value={selectedStudentId} onChange={(event) => onStudentChange(event.target.value)}>
            {students.map((student) => <MenuItem key={student.id} value={student.id}>{student.displayName}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="maths7a-topic-label">Optional topic</InputLabel>
          <Select labelId="maths7a-topic-label" label="Optional topic" value={topicId} onChange={(event) => setTopicId(event.target.value)}>
            {maths7AClassData.topics.map((topic) => <MenuItem key={topic.id} value={topic.id}>{topic.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {mode === 'observation' ? (
        <FormControl fullWidth>
          <InputLabel id="maths7a-template-label">Select what felt worth keeping</InputLabel>
          <Select labelId="maths7a-template-label" label="Select what felt worth keeping" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
            {maths7AClassData.quickCaptureTemplates.map((template) => <MenuItem key={template.id} value={template.id}>{template.label}</MenuItem>)}
          </Select>
        </FormControl>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 160px' }, gap: 1.4 }}>
          <FormControl fullWidth>
            <InputLabel id="maths7a-assessment-type-label">Assessment type</InputLabel>
            <Select labelId="maths7a-assessment-type-label" label="Assessment type" value={assessmentType} onChange={(event) => setAssessmentType(event.target.value)}>
              {maths7AClassData.assessmentTypes.map((type) => <MenuItem key={type.id} value={type.id}>{type.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Result" value={result} onChange={(event) => setResult(event.target.value)} inputProps={{ inputMode: 'numeric' }} />
        </Box>
      )}

      <TextField label="Optional note" value={note} onChange={(event) => setNote(event.target.value)} multiline minRows={3} fullWidth />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Button variant="contained" onClick={save} sx={{ bgcolor: purple, '&:hover': { bgcolor: '#842194' } }}>Save</Button>
        <Button variant="text" onClick={() => { setNote(''); setResult(''); }} sx={{ color: 'text.secondary' }}>Clear draft</Button>
      </Stack>
    </Panel>
  );
}

function QuietStatement() {
  return (
    <Typography sx={{ color: 'text.secondary', fontSize: 13.5, lineHeight: 1.5 }}>
      This reflects only the information Anna chose to save.
    </Typography>
  );
}

function buildMathsStudentProfileSections({ student, evidence, tasks }) {
  const historicalResult = readHistoricalResult(student);

  return [
    {
      id: 'earlier-reference',
      title: 'Earlier reference',
      description: 'Saved school data that Anna can use as context only.',
      items: historicalResult ? [
        {
          id: historicalResult.id,
          label: `${historicalResult.schoolYear} ${historicalResult.term}`,
          detail: `Final grade: ${historicalResult.grade}`,
          meta: historicalResult.date,
        },
      ] : [],
    },
    {
      id: 'saved-evidence',
      title: 'Saved evidence',
      description: 'Moments Anna chose to keep for this subject.',
      items: evidence.slice(0, 6).map((item) => {
        const topic = item.topicId ? getTopicLabel(item.topicId) : null;
        const detail = [
          item.type === 'assessment' ? 'Assessment anchor' : 'Observation',
          topic,
          item.value ? `${item.value}${item.valueType === 'percentage' ? '%' : ''}` : null,
        ].filter(Boolean).join(' - ');

        return {
          id: item.id,
          label: item.label,
          detail: item.note || detail,
          meta: [detail, item.date].filter(Boolean).join(' - '),
        };
      }),
    },
    {
      id: 'linked-follow-up',
      title: 'Linked follow-up',
      description: 'Tasks or notes currently connected to this student or class context.',
      items: tasks.slice(0, 4).map((task) => ({
        id: task.id,
        label: task.title,
        detail: task.description || task.note || '',
        meta: [task.classId?.toUpperCase(), task.date].filter(Boolean).join(' - '),
      })),
    },
  ];
}

function AssessmentResultsChart({ assessments, evidenceTopics }) {
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const width = 520;
  const height = 190;
  const padding = { top: 18, right: 22, bottom: 30, left: 34 };
  const topicById = new Map(evidenceTopics.map((topic) => [topic.id, topic]));
  const sortedAssessments = sortEvidenceByDate(assessments, 'asc');
  const dates = sortedAssessments.map((item) => new Date(`${item.date}T12:00:00`).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const xFor = (item) => {
    if (sortedAssessments.length <= 1 || minDate === maxDate) {
      return width / 2;
    }
    const value = new Date(`${item.date}T12:00:00`).getTime();
    return padding.left + ((value - minDate) / (maxDate - minDate)) * (width - padding.left - padding.right);
  };
  const yFor = (item) => padding.top + (1 - (Number(item.value) || 0) / 100) * (height - padding.top - padding.bottom);
  const points = sortedAssessments.map((item) => `${xFor(item)},${yFor(item)}`).join(' ');
  const activeAssessment = sortedAssessments.find((item) => item.id === activeAssessmentId) || null;
  const activeTooltip = activeAssessment ? {
    x: Math.min(Math.max(xFor(activeAssessment) - 76, padding.left), width - padding.right - 152),
    y: Math.max(yFor(activeAssessment) - 52, 6),
  } : null;

  return (
    <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Assessment results</Typography>
      {sortedAssessments.length ? (
        <>
          <Box
            component="svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${sortedAssessments.length} saved assessment result${sortedAssessments.length === 1 ? '' : 's'} from ${formatDemoDate(sortedAssessments[0].date)} to ${formatDemoDate(sortedAssessments[sortedAssessments.length - 1].date)}.`}
            sx={{ mt: 0.8, width: '100%', height: 190, overflow: 'visible' }}
          >
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(23, 21, 26, 0.18)" />
            <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(23, 21, 26, 0.18)" />
            {[0, 50, 100].map((tick) => {
              const y = padding.top + (1 - tick / 100) * (height - padding.top - padding.bottom);
              return (
                <g key={tick}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(23, 21, 26, 0.055)" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="rgba(23, 21, 26, 0.54)" fontSize="11">{tick}</text>
                </g>
              );
            })}
            {sortedAssessments.length > 1 && <polyline points={points} fill="none" stroke={purple} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
            {sortedAssessments.map((item) => {
              const topic = topicById.get(item.evidenceTopicId || item.topicId);
              const unit = getTeachingUnitById(item.teachingUnitId);
              return (
                <g key={item.id}>
                  <circle
                    cx={xFor(item)}
                    cy={yFor(item)}
                    r="6"
                    fill="#fff"
                    stroke={purple}
                    strokeWidth="2.2"
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${item.label}, ${item.value}%, ${formatDemoDate(item.date)}, ${topic?.label || item.topicId}, ${unit?.title || 'teaching unit not shown'}.`}
                    onMouseEnter={() => setActiveAssessmentId(item.id)}
                    onMouseLeave={() => setActiveAssessmentId(null)}
                    onFocus={() => setActiveAssessmentId(item.id)}
                    onBlur={() => setActiveAssessmentId(null)}
                    style={{ cursor: 'default', outline: 'none' }}
                  >
                    <title>{`${formatDemoDate(item.date)} · ${item.label} · ${topic?.label || item.topicId} · ${unit?.title || ''} · ${item.value}%`}</title>
                  </circle>
                  <text x={xFor(item)} y={height - 9} textAnchor="middle" fill="rgba(23, 21, 26, 0.58)" fontSize="10.5">{formatDemoDate(item.date)}</text>
                </g>
              );
            })}
            {activeAssessment && activeTooltip && (
              <g pointerEvents="none">
                <rect x={activeTooltip.x} y={activeTooltip.y} width="152" height="40" rx="8" fill="#fff" stroke="rgba(23, 21, 26, 0.16)" />
                <text x={activeTooltip.x + 10} y={activeTooltip.y + 16} fill={darkText} fontSize="11.5" fontWeight="700">
                  {activeAssessment.label.length > 24 ? `${activeAssessment.label.slice(0, 24)}...` : activeAssessment.label}
                </text>
                <text x={activeTooltip.x + 10} y={activeTooltip.y + 31} fill="rgba(23, 21, 26, 0.62)" fontSize="11">
                  {activeAssessment.value}% result
                </text>
              </g>
            )}
          </Box>
          {sortedAssessments.length === 1 && (
            <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>One saved result is available. More results are needed before a same-area comparison is possible.</Typography>
          )}
          <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>Results relate to different areas of mathematics.</Typography>
          <Box component="ul" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {sortedAssessments.map((item) => {
              const topic = topicById.get(item.evidenceTopicId || item.topicId);
              const unit = getTeachingUnitById(item.teachingUnitId);
              return <li key={item.id}>{formatDemoDate(item.date)}. {item.label}. {topic?.label || item.topicId}. {unit?.title || 'Teaching unit not shown'}. {item.value}%.</li>;
            })}
          </Box>
        </>
      ) : (
        <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 13 }}>No saved assessment results yet.</Typography>
      )}
    </Paper>
  );
}

function StudentInsightPanel({ student, teachingUnits, evidenceTopics, evidence, onOpenStudent }) {
  const assessments = getStudentAssessments(evidence, student.id);
  const observations = getStudentObservations(evidence, student.id);
  const summary = getStudentEvidenceSummary(evidence, student.id, teachingUnits);
  const contentRows = getStudentEvidenceByContent(evidence, student.id, teachingUnits);
  const patterns = getStudentVisiblePatterns(evidence, student.id, teachingUnits);
  const topicById = new Map(evidenceTopics.map((topic) => [topic.id, topic]));

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-insight-${student.id}`} sx={{ p: { xs: 1.25, sm: 1.6 }, borderRadius: '18px', border: '1px solid rgba(156, 40, 175, 0.14)', bgcolor: '#fff' }}>
        <Stack spacing={1.35}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
              {[
                `${summary.savedItemCount} saved item${summary.savedItemCount === 1 ? '' : 's'}`,
                `${summary.assessmentCount} assessment${summary.assessmentCount === 1 ? '' : 's'}`,
                `${summary.observationCount} observation${summary.observationCount === 1 ? '' : 's'}`,
                `${summary.contentAreaCount} content area${summary.contentAreaCount === 1 ? '' : 's'}`,
              ].map((item) => <Chip key={item} label={item} size="small" sx={{ bgcolor: palePurple, color: darkText, fontWeight: 760 }} />)}
            </Stack>
            <Button onClick={() => onOpenStudent(student.id)} sx={{ color: purple, fontWeight: 850 }}>Open full profile</Button>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.08fr) minmax(280px, 0.92fr)' }, gap: 1.25, alignItems: 'start' }}>
            <Stack spacing={1.25}>
              <AssessmentResultsChart assessments={assessments} evidenceTopics={evidenceTopics} />
              <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Saved observation timeline</Typography>
                {observations.length ? (
                  <Stack spacing={0.9} sx={{ mt: 0.85 }}>
                    {observations.slice(0, 7).map((item) => {
                      const topic = topicById.get(item.evidenceTopicId || item.topicId);
                      const unit = getTeachingUnitById(item.teachingUnitId);
                      return (
                        <Box key={item.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.75 }}>
                          <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 760 }}>{formatDemoDate(item.date)} · {unit?.title || 'Teaching unit'} · {topic?.label || item.topicId}</Typography>
                          <Typography sx={{ mt: 0.2, color: darkText, fontSize: 13.2, fontWeight: 780 }}>{item.label}</Typography>
                          {item.note && <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.6, lineHeight: 1.4 }}>{item.note}</Typography>}
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 13 }}>No saved observations yet.</Typography>
                )}
              </Paper>
            </Stack>

            <Stack spacing={1.25}>
              <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Evidence by teaching unit</Typography>
                <Stack spacing={0.75} sx={{ mt: 0.85 }}>
                  {contentRows.map((entry) => (
                    <Box key={entry.topic.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                      <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 820 }}>{entry.topic.label}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 12.1 }}>
                        Topics: {(entry.topic.evidenceTopicIds || []).map((id) => getEvidenceTopicById(id)?.title || id).join(', ') || 'None linked'}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                        {entry.assessments.length ? `${entry.assessments.length} assessment${entry.assessments.length === 1 ? '' : 's'}` : 'No assessments'} · {entry.observations.length ? `${entry.observations.length} observation${entry.observations.length === 1 ? '' : 's'}` : 'No observations'}
                      </Typography>
                      <Typography sx={{ mt: 0.15, color: 'text.secondary', fontSize: 12.2 }}>
                        {entry.latestItem ? `Latest: ${entry.latestItem.label}` : 'No saved information'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
              <Paper elevation={0} sx={{ p: 1.3, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 860 }}>Visible in the saved information</Typography>
                <Stack component="ul" spacing={0.65} sx={{ mt: 0.8, pl: 2.2, color: 'text.secondary' }}>
                  {patterns.map((pattern) => <Typography component="li" key={pattern} sx={{ fontSize: 12.8, lineHeight: 1.45 }}>{pattern}</Typography>)}
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

function getStudentCountLabel(count) {
  return `${count} ${count === 1 ? 'student' : 'students'}`;
}

function sortGroupsForDisplay(groups) {
  return [...(groups || [])].sort((first, second) => (
    (first.order || 0) - (second.order || 0)
    || (first.createdAt || '').localeCompare(second.createdAt || '')
    || first.label.localeCompare(second.label)
  ));
}

function getStudentsInGroupOrder(group, students) {
  const studentById = new Map((students || []).map((student) => [student.id, student]));
  return (group?.studentIds || []).map((studentId) => studentById.get(studentId)).filter(Boolean);
}

function getUngroupedStudentsForType(students, groups, typeId) {
  const groupedStudentIds = new Set((groups || [])
    .filter((group) => group.typeId === typeId && group.status !== 'archived')
    .flatMap((group) => group.studentIds || []));

  return (students || []).filter((student) => !groupedStudentIds.has(student.id));
}

function EvidenceMap({
  students,
  teachingUnits,
  evidenceTopics,
  evidence,
  workingGroups,
  groupDefinitions,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveStudentToGroup,
  onMoveStudentToUngrouped,
  onResetGroups,
  onOpenStudent,
}) {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [activeGroupingSetId, setActiveGroupingSetId] = useState('none');
  const [collapsedGroupIds, setCollapsedGroupIds] = useState([]);
  const [draggedStudentId, setDraggedStudentId] = useState('');
  const [dragTargetId, setDragTargetId] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupDialogMode, setGroupDialogMode] = useState('create');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [moveAnnouncement, setMoveAnnouncement] = useState('');
  const activeGroupingSet = groupDefinitions.find((definition) => definition.id === activeGroupingSetId) || null;
  const activeGroups = useMemo(
    () => sortGroupsForDisplay((workingGroups || []).filter((group) => group.status !== 'archived' && group.typeId === activeGroupingSetId)),
    [activeGroupingSetId, workingGroups],
  );
  const groupedViewActive = activeGroupingSetId !== 'none';
  const notGroupedStudents = useMemo(
    () => (groupedViewActive ? getUngroupedStudentsForType(students, workingGroups, activeGroupingSetId) : []),
    [activeGroupingSetId, groupedViewActive, students, workingGroups],
  );

  function toggleStudent(studentId) {
    setExpandedStudentId((currentId) => (currentId === studentId ? null : studentId));
  }

  function toggleGroup(groupId) {
    setCollapsedGroupIds((currentIds) => (
      currentIds.includes(groupId)
        ? currentIds.filter((id) => id !== groupId)
        : [...currentIds, groupId]
    ));
  }

  function openCreateGroupDialog() {
    setGroupDialogMode('create');
    setSelectedGroup(null);
    setGroupDialogOpen(true);
  }

  function openEditGroupDialog(group) {
    setGroupDialogMode('edit');
    setSelectedGroup(group);
    setGroupDialogOpen(true);
  }

  function handleCreateGroup(groupInput) {
    onCreateGroup({
      ...groupInput,
      typeId: groupedViewActive ? activeGroupingSetId : groupInput.typeId,
    });
  }

  function announceMove(studentId, groupLabel) {
    const student = students.find((item) => item.id === studentId);
    setMoveAnnouncement(`${student?.displayName || 'Student'} moved to ${groupLabel}.`);
  }

  function moveStudent(studentId, groupId, index) {
    if (!groupedViewActive) {
      return;
    }

    if (groupId) {
      const group = activeGroups.find((item) => item.id === groupId);
      onMoveStudentToGroup(groupId, studentId, index);
      announceMove(studentId, group?.label || 'focus');
    } else {
      onMoveStudentToUngrouped(activeGroupingSetId, studentId);
      announceMove(studentId, 'Unassigned');
    }
  }

  function handleDragStart(event, studentId) {
    setDraggedStudentId(studentId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', studentId);
    event.stopPropagation();
  }

  function handleDrop(event, groupId, index) {
    event.preventDefault();
    const studentId = event.dataTransfer.getData('text/plain') || draggedStudentId;
    if (studentId) {
      moveStudent(studentId, groupId, index);
    }
    setDraggedStudentId('');
    setDragTargetId('');
  }

  function allowDrop(event, targetId) {
    event.preventDefault();
    setDragTargetId(targetId);
  }

  function endDrag() {
    setDraggedStudentId('');
    setDragTargetId('');
  }

  function renderStudentRow(student, groupId = '', rowIndex) {
    const isExpanded = expandedStudentId === student.id;

    return (
      <Box key={`${groupId || 'flat'}-${student.id}`} role="rowgroup" sx={{ display: 'contents' }}>
        <Box
          role="row"
          onDragOver={groupedViewActive ? (event) => allowDrop(event, `${groupId || 'not-grouped'}-${student.id}`) : undefined}
          onDrop={groupedViewActive ? (event) => handleDrop(event, groupId, rowIndex) : undefined}
          sx={{ display: 'contents' }}
        >
          <Box
            role="rowheader"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.45,
              p: 1,
              borderTop: '1px solid rgba(23, 21, 26, 0.08)',
              bgcolor: draggedStudentId === student.id ? 'rgba(156, 40, 175, 0.08)' : '#fff',
              minWidth: 0,
            }}
          >
            {groupedViewActive && (
              <ButtonBase
                draggable
                onDragStart={(event) => handleDragStart(event, student.id)}
                onDragEnd={endDrag}
                onClick={(event) => event.stopPropagation()}
                aria-label={`Move ${student.displayName}`}
                sx={{
                  width: 24,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: '8px',
                  color: 'text.secondary',
                  cursor: 'grab',
                  '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
                }}
              >
                <DragIndicatorIcon sx={{ fontSize: 17 }} />
              </ButtonBase>
            )}
            <ButtonBase
              onClick={() => toggleStudent(student.id)}
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
              <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 820, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.displayName}</Typography>
            </ButtonBase>
          </Box>
          {teachingUnits.map((unit) => {
            const cell = getStudentTopicCell(student.id, unit.id, evidence);
            return (
              <Box
                key={`${student.id}-${unit.id}`}
                role="cell"
                aria-label={`${student.displayName}, ${unit.title || unit.label}: ${cell.detail}`}
                sx={{
                  p: 1,
                  borderTop: '1px solid rgba(23, 21, 26, 0.08)',
                  borderLeft: '1px solid rgba(23, 21, 26, 0.055)',
                  textAlign: 'left',
                  bgcolor: draggedStudentId === student.id
                    ? 'rgba(156, 40, 175, 0.08)'
                    : cell.count
                      ? '#fff'
                      : '#fff',
                }}
              >
                <Typography sx={{ color: cell.count ? darkText : 'rgba(23, 21, 26, 0.46)', fontSize: 12.2, lineHeight: 1.35, fontWeight: cell.count ? 760 : 520 }}>
                  {cell.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
        {isExpanded && (
          <Box role="row" sx={{ display: 'contents' }}>
            <Box role="cell" sx={{ gridColumn: `1 / span ${teachingUnits.length + 1}`, minWidth: 0 }}>
              <StudentInsightPanel student={student} teachingUnits={teachingUnits} evidenceTopics={evidenceTopics} evidence={evidence} onOpenStudent={onOpenStudent} />
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  function renderGroupSection(group) {
    const groupStudents = getStudentsInGroupOrder(group, students);
    const isCollapsed = collapsedGroupIds.includes(group.id);
    const isDragTarget = dragTargetId === group.id;

    return (
      <Box key={group.id} role="rowgroup" sx={{ display: 'contents' }}>
        <Box
          role="row"
          onDragOver={(event) => allowDrop(event, group.id)}
          onDrop={(event) => handleDrop(event, group.id)}
          sx={{ display: 'contents' }}
        >
          <Box
            role="cell"
            onDoubleClick={(event) => {
              event.stopPropagation();
              openEditGroupDialog(group);
            }}
            aria-label={`${group.label}. Double click to edit focus.`}
            sx={{
              gridColumn: `1 / span ${teachingUnits.length + 1}`,
              p: 0.85,
              borderTop: '1px solid rgba(23, 21, 26, 0.12)',
              bgcolor: isDragTarget ? 'rgba(156, 40, 175, 0.12)' : '#fff',
              cursor: 'default',
            }}
          >
            <ButtonBase
              onClick={() => toggleGroup(group.id)}
              onDoubleClick={(event) => {
                event.stopPropagation();
                openEditGroupDialog(group);
              }}
              aria-expanded={!isCollapsed}
              sx={{ minWidth: 0, gap: 0.55, borderRadius: '8px', textAlign: 'left', '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 } }}
            >
              <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }} />
              <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860 }}>
                {group.label}
              </Typography>
            </ButtonBase>
          </Box>
        </Box>
        {!isCollapsed && groupStudents.map((student, index) => renderStudentRow(student, group.id, index))}
      </Box>
    );
  }

  function renderNotGroupedSection() {
    const isCollapsed = collapsedGroupIds.includes('not-grouped');
    const isDragTarget = dragTargetId === 'not-grouped';

    return (
      <Box key="not-grouped" role="rowgroup" sx={{ display: 'contents' }}>
        <Box
          role="row"
          onDragOver={(event) => allowDrop(event, 'not-grouped')}
          onDrop={(event) => handleDrop(event, '')}
          sx={{ display: 'contents' }}
        >
          <Tooltip
            arrow
            enterDelay={2000}
            enterNextDelay={2000}
            title={(
              <Box sx={{ px: 0.25, py: 0.15 }}>
                <Typography sx={{ color: '#fff', fontSize: 12.4, fontWeight: 820, lineHeight: 1.35 }}>
                  Double click to create a focus
                </Typography>
              </Box>
            )}
          >
            <Box
              role="cell"
              onDoubleClick={(event) => {
                event.stopPropagation();
                openCreateGroupDialog();
              }}
              aria-label="Unassigned students. Double click to create a focus."
              sx={{
                gridColumn: `1 / span ${teachingUnits.length + 1}`,
                p: 0.85,
                borderTop: '1px solid rgba(23, 21, 26, 0.12)',
                bgcolor: isDragTarget ? 'rgba(156, 40, 175, 0.12)' : '#fff',
                cursor: 'default',
              }}
            >
              <ButtonBase
                onClick={() => toggleGroup('not-grouped')}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  openCreateGroupDialog();
                }}
                aria-expanded={!isCollapsed}
                sx={{ gap: 0.55, borderRadius: '8px', textAlign: 'left', '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 } }}
              >
                <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }} />
                <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860 }}>
                  Unassigned
                </Typography>
              </ButtonBase>
            </Box>
          </Tooltip>
        </Box>
        {!isCollapsed && notGroupedStudents.map((student, index) => renderStudentRow(student, '', index))}
      </Box>
    );
  }

  return (
    <Panel sx={{ p: 0, border: 'none', borderRadius: 0, bgcolor: 'transparent' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'auto' }, gap: 1.2, alignItems: 'start', justifyContent: 'end', mb: 1 }}>
        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ justifySelf: { xs: 'stretch', lg: 'end' }, alignSelf: 'start' }}>
          <Select
            value={activeGroupingSetId}
            onChange={(event) => {
              setActiveGroupingSetId(event.target.value);
              setCollapsedGroupIds([]);
            }}
            size="small"
            inputProps={{ 'aria-label': 'Focus' }}
            sx={{
              minWidth: { xs: 180, sm: 220 },
              borderRadius: '999px',
              color: groupedViewActive ? purple : 'text.secondary',
              fontSize: 13,
              fontWeight: 760,
              '& .MuiSelect-select': {
                py: 0.75,
                pl: 1.8,
                pr: 4,
              },
              '& fieldset': {
                borderColor: groupedViewActive ? 'rgba(156, 40, 175, 0.28)' : 'rgba(23, 21, 26, 0.12)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(156, 40, 175, 0.28) !important',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(156, 40, 175, 0.38) !important',
              },
            }}
          >
            <MenuItem value="none">Class list</MenuItem>
            {groupDefinitions.map((definition) => (
              <MenuItem key={definition.id} value={definition.id}>{definition.label}</MenuItem>
            ))}
          </Select>
          <Tooltip title="Reset focus">
            <IconButton aria-label="Reset focus to the seeded Maths 7A view" onClick={onResetGroups} size="small" sx={{ color: 'text.secondary' }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box aria-live="polite" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {moveAnnouncement}
      </Box>
      <Box sx={{ overflowX: { xs: 'auto', lg: 'visible' }, pb: 0.5 }}>
        <Box
          role="table"
          aria-label={groupedViewActive ? `Maths 7A evidence map focused by ${activeGroupingSet?.label}` : 'Maths 7A evidence map'}
          sx={{
            minWidth: { xs: 760, lg: 0 },
            display: 'grid',
            gridTemplateColumns: `170px repeat(${teachingUnits.length}, minmax(112px, 1fr))`,
            border: '1px solid rgba(23, 21, 26, 0.12)',
            borderRadius: '14px',
            overflow: 'hidden',
            bgcolor: '#fff',
          }}
        >
          <Box role="columnheader" sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid rgba(23, 21, 26, 0.12)' }} />
          {teachingUnits.map((unit) => (
            <Typography
              key={unit.id}
              role="columnheader"
              sx={{
                p: 1,
                bgcolor: '#fff',
                color: darkText,
                fontSize: 12.5,
                fontWeight: 820,
                borderBottom: '1px solid rgba(23, 21, 26, 0.12)',
                borderLeft: '1px solid rgba(23, 21, 26, 0.055)',
              }}
            >
              {unit.title || unit.label}
            </Typography>
          ))}
          {groupedViewActive
            ? (
              <>
                {activeGroups.map(renderGroupSection)}
                {renderNotGroupedSection()}
              </>
            )
            : students.map((student, index) => renderStudentRow(student, '', index))}
        </Box>
      </Box>
      <QuietStatement />
      <GroupDialog
        open={groupDialogOpen}
        mode={groupDialogMode}
        group={selectedGroup}
        students={students}
        groupDefinitions={groupDefinitions}
        initialTypeId={groupedViewActive ? activeGroupingSetId : ''}
        onClose={() => setGroupDialogOpen(false)}
        onCreateGroup={handleCreateGroup}
        onUpdateGroup={onUpdateGroup}
        onDeleteGroup={onDeleteGroup}
        onAddStudent={onMoveStudentToGroup}
        onRemoveStudent={(groupId, studentId) => {
          const group = activeGroups.find((item) => item.id === groupId);
          onMoveStudentToUngrouped(group?.typeId || activeGroupingSetId, studentId);
        }}
      />
    </Panel>
  );
}

function SelectedStudentPicture({ summary, evidence, tasks, onOpenDetail, onCapture }) {
  const historicalResult = readHistoricalResult(summary.student);

  return (
    <Panel title={summary.student.displayName}>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{summary.summary}</Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
        Earlier reference · Year 6 final grade: <Box component="span" sx={{ color: darkText, fontWeight: 850 }}>{historicalResult?.grade || 'Not shown'}</Box>
      </Typography>
      {summary.averageAssessment !== null && (
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
          Average of saved assessment anchors: <Box component="span" sx={{ color: darkText, fontWeight: 850 }}>{summary.averageAssessment}%</Box>
        </Typography>
      )}
      {!!summary.topics.length && (
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>Topics with information: {summary.topics.map(getTopicLabel).join(' · ')}</Typography>
      )}
      <Divider />
      <Stack spacing={1}>
        {evidence.slice(0, 4).map((item) => <EvidenceCard key={item.id} item={item} />)}
        {!evidence.length && <Typography sx={{ color: 'text.secondary' }}>No saved information for this student yet.</Typography>}
      </Stack>
      {!!tasks.length && (
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.5 }}>Linked follow-up: {tasks.map((task) => task.title).join(' · ')}</Typography>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" onClick={onOpenDetail} sx={{ color: darkText, borderColor: 'rgba(23, 21, 26, 0.16)' }}>View recent evidence</Button>
        <Button variant="text" onClick={onCapture} sx={{ color: purple }}>Capture something</Button>
      </Stack>
    </Panel>
  );
}

function ClassPictureStudents({
  studentSummaries,
  teachingUnits,
  evidenceTopics,
  evidence,
  workingGroups,
  groupDefinitions,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveStudentToGroup,
  onMoveStudentToUngrouped,
  onResetGroups,
  onOpenStudentProfile,
}) {
  return (
    <Stack spacing={2.25} sx={{ minWidth: 0 }}>
      <EvidenceMap
        students={studentSummaries.map((summary) => summary.student)}
        teachingUnits={teachingUnits}
        evidenceTopics={evidenceTopics}
        evidence={evidence}
        workingGroups={workingGroups}
        groupDefinitions={groupDefinitions}
        onCreateGroup={onCreateGroup}
        onUpdateGroup={onUpdateGroup}
        onDeleteGroup={onDeleteGroup}
        onMoveStudentToGroup={onMoveStudentToGroup}
        onMoveStudentToUngrouped={onMoveStudentToUngrouped}
        onResetGroups={onResetGroups}
        onOpenStudent={onOpenStudentProfile}
      />
    </Stack>
  );
}

export default function Maths7AModule({ onBackToWeek, onClose }) {
  const [activeMode, setActiveMode] = useState('plan');
  const [selectedStudentId, setSelectedStudentId] = useState(maths7AStudents[0]?.id || '');
  const [localEvidence, setLocalEvidence] = useState([]);
  const [confirmation, setConfirmation] = useState('');
  const [studentPictureOpen, setStudentPictureOpen] = useState(false);
  const [studentProfileOpen, setStudentProfileOpen] = useState(false);
  const [profileStudentId, setProfileStudentId] = useState(maths7AStudents[0]?.id || '');
  const {
    groups: workingGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    moveStudentToGroup,
    moveStudentToUngrouped,
    resetGroups,
  } = useClassWorkingGroups({
    subjectId: 'mathematics',
    classId: '7a',
  });
  const {
    blocks: planningBlocks,
    createBlock: createPlanningBlock,
    updateBlock: updatePlanningBlock,
    deleteBlock: deletePlanningBlock,
    duplicateBlock: duplicatePlanningBlock,
    resetPlanning,
  } = useSubjectPlanning({
    subjectId: 'mathematics',
    classId: '7a',
    initialBlocks: maths7APlanningBlocks,
  });
  const {
    notes: planningCurriculumNotes,
    setAreaNote: setPlanningCurriculumNote,
    resetNotes: resetPlanningCurriculumNotes,
  } = usePlanningCurriculumNotes({
    subjectId: 'mathematics',
    classId: '7a',
    initialNotes: [],
  });
  const capturePanelRef = useRef(null);
  const mathsLesson = getMondayMathsLesson();
  const allEvidence = useMemo(() => getMergedMathsEvidence(maths7AEvidence, localEvidence), [localEvidence]);
  const selectedStudent = maths7AStudents.find((student) => student.id === selectedStudentId) || maths7AStudents[0];
  const selectedEvidence = getEvidenceForStudent(allEvidence, selectedStudent.id);
  const linkedTasks = findLinkedTasks(annaTasks, selectedStudent);
  const profileStudent = maths7AStudents.find((student) => student.id === profileStudentId) || null;
  const profileEvidence = profileStudent ? getEvidenceForStudent(allEvidence, profileStudent.id) : [];
  const profileTasks = profileStudent ? findLinkedTasks(annaTasks, profileStudent) : [];
  const profileGroups = profileStudent ? getGroupsForStudent(workingGroups, profileStudent.id) : [];
  const profileSummary = profileStudent ? getStudentPictureSummary(profileStudent, allEvidence) : null;
  const profileDataSections = profileStudent ? buildMathsStudentProfileSections({
    student: profileStudent,
    evidence: profileEvidence,
    tasks: profileTasks,
  }) : [];
  const studentSummaries = useMemo(
    () => maths7AStudents.map((student) => getStudentPictureSummary(student, allEvidence)),
    [allEvidence],
  );
  const normalizedPlanningBlocks = useMemo(
    () => planningBlocks.map(normalizeMathsPlanningBlock),
    [planningBlocks],
  );
  const evidenceMapTeachingUnits = useMemo(() => {
    const firstPlanIndexByUnitId = new Map();
    normalizedPlanningBlocks.forEach((block, index) => {
      const unit = getTeachingUnitForPlanningBlock(block);
      if (unit && !firstPlanIndexByUnitId.has(unit.id)) {
        firstPlanIndexByUnitId.set(unit.id, index);
      }
    });

    return mathsTeachingUnits
      .filter((unit) => unit.blockType === 'teaching' && unit.curriculumAreaIds.length)
      .sort((first, second) => {
        const firstIndex = firstPlanIndexByUnitId.has(first.id) ? firstPlanIndexByUnitId.get(first.id) : 1000 + first.order;
        const secondIndex = firstPlanIndexByUnitId.has(second.id) ? firstPlanIndexByUnitId.get(second.id) : 1000 + second.order;
        return firstIndex - secondIndex;
      });
  }, [normalizedPlanningBlocks]);
  const currentPlanningBlock = useMemo(
    () => normalizedPlanningBlocks.find((block) => block.status === 'current') || normalizedPlanningBlocks[0] || null,
    [normalizedPlanningBlocks],
  );
  const currentPlanningUnitTitle = getCurrentPlanningUnitTitle(currentPlanningBlock);
  const selectedStudentSummary = studentSummaries.find((summary) => summary.student.id === selectedStudent.id) || studentSummaries[0];

  useEffect(() => {
    setLocalEvidence(readJsonStorage(evidenceStorageKey, []));
  }, []);

  function saveEvidence(entry) {
    const nextLocalEvidence = sortEvidenceByDate([entry, ...localEvidence]);
    setLocalEvidence(nextLocalEvidence);
    writeJsonStorage(evidenceStorageKey, nextLocalEvidence);
    setConfirmation(`Saved to ${selectedStudent.firstName}'s maths picture.`);
  }

  function resetDemo() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(evidenceStorageKey);
      window.localStorage.removeItem(planningStorageKey);
    }
    setLocalEvidence([]);
    resetGroups();
    resetPlanning();
    resetPlanningCurriculumNotes();
    setConfirmation('Maths 7A demo evidence, planning and focus reset.');
  }

  function focusCapturePanel() {
    setActiveMode('now');
    capturePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    capturePanelRef.current?.focus({ preventScroll: true });
  }

  function openStudentProfile(studentId) {
    setProfileStudentId(studentId);
    setStudentProfileOpen(true);
  }

  function captureForStudent(studentId = selectedStudent.id) {
    setSelectedStudentId(studentId);
    setStudentPictureOpen(false);
    setActiveMode('now');
    window.requestAnimationFrame(() => {
      capturePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      capturePanelRef.current?.focus({ preventScroll: true });
    });
  }

  const nowMode = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.12fr) minmax(300px, 0.88fr)' }, gap: { xs: 2, md: 3 }, alignItems: 'start' }}>
      <Stack spacing={2.25} sx={{ minWidth: 0 }}>
        <Panel title="Today's lesson">
          <Typography sx={{ color: darkText, fontSize: 20, fontWeight: 850 }}>
            {currentPlanningUnitTitle}
          </Typography>
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Add something only when it feels useful to keep.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={focusCapturePanel} sx={{ bgcolor: purple, '&:hover': { bgcolor: '#842194' } }}>Capture something</Button>
            <Button variant="outlined" onClick={() => setActiveMode('class-picture')} sx={{ color: darkText, borderColor: 'rgba(23, 21, 26, 0.16)' }}>Open class picture</Button>
          </Stack>
        </Panel>

        <Panel title="Recent things Anna chose to save">
          <Stack spacing={1}>{allEvidence.slice(0, 4).map((item) => <EvidenceCard key={item.id} item={item} />)}</Stack>
        </Panel>

        <Box ref={capturePanelRef} tabIndex={-1} sx={{ scrollMarginTop: 120 }}>
          <QuickCapture students={maths7AStudents} selectedStudentId={selectedStudentId} onStudentChange={setSelectedStudentId} onSave={saveEvidence} />
        </Box>

        {!!confirmation && (
          <Paper elevation={0} aria-live="polite" sx={{ p: 1.4, borderRadius: '15px', border: '1px solid rgba(156, 40, 175, 0.18)', bgcolor: palePurple, color: darkText }}>
            <Typography sx={{ fontWeight: 750 }}>{confirmation}</Typography>
          </Paper>
        )}
      </Stack>

      <Stack spacing={2.25}>
        <Panel title="SmartDesk noticed" sx={{ bgcolor: '#fdf9fe', borderColor: 'rgba(156, 40, 175, 0.14)' }}>
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{classPicture.noticed}</Typography>
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{classPicture.suggestion}</Typography>
        </Panel>

        <Panel title="Leo's developing picture">
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            The available information suggests Leo may understand calculations more securely than written questions indicate.
          </Typography>
          <Button variant="outlined" onClick={() => { setSelectedStudentId('leo-andersson'); setStudentPictureOpen(true); }} sx={{ alignSelf: 'flex-start', color: darkText, borderColor: 'rgba(23, 21, 26, 0.16)' }}>
            Open Leo
          </Button>
        </Panel>

        <Panel title="Linked follow-up">
          {linkedTasks.length ? linkedTasks.slice(0, 2).map((task) => (
            <Paper key={task.id} elevation={0} sx={{ p: 1.4, borderRadius: '15px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
              <Typography sx={{ color: darkText, fontWeight: 800 }}>{task.title}</Typography>
              <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 13.5 }}>
                {[task.classId?.toUpperCase(), task.date].filter(Boolean).join(' - ')}
              </Typography>
            </Paper>
          )) : (
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.55 }}>No maths follow-up is currently being kept in view.</Typography>
          )}
        </Panel>

        <Panel title="Recent class picture">
          <Stack spacing={1}>
            {classPicture.examples.map((example) => (
              <Typography key={example} sx={{ color: 'text.secondary', lineHeight: 1.55 }}>{example}</Typography>
            ))}
          </Stack>
        </Panel>
      </Stack>
    </Box>
  );

  const planMode = (
    <SubjectPlanningBoard
      title="Planning"
      description="A broad view of what Anna intends to cover, revisit or assess."
      periods={maths7APlanningPeriods}
      blocks={normalizedPlanningBlocks}
      curriculumAreas={mathsCurriculumAreas}
      abilities={mathsAbilities}
      teachingUnits={mathsTeachingUnits}
      planningTools={mathsQuickAddTemplates}
      curriculumNotes={planningCurriculumNotes}
      curriculumAreaTypeLabels={{
        content: 'Content',
        ability: 'Abilities',
      }}
      referenceDate={annaSchedule.currentContext.date}
      workingGroups={workingGroups}
      groupDefinitions={classGroupDefinitions}
      onCreateBlock={createPlanningBlock}
      onUpdateBlock={updatePlanningBlock}
      onDeleteBlock={deletePlanningBlock}
      onDuplicateBlock={duplicatePlanningBlock}
      onResetPlanning={resetPlanning}
      onSetCurriculumNote={setPlanningCurriculumNote}
      onResetCurriculumNotes={resetPlanningCurriculumNotes}
    />
  );

  const classPictureMode = (
    <ClassPictureStudents
      studentSummaries={studentSummaries}
      teachingUnits={evidenceMapTeachingUnits}
      evidenceTopics={mathsEvidenceTopics}
      evidence={allEvidence}
      workingGroups={workingGroups}
      groupDefinitions={classGroupDefinitions}
      onCreateGroup={createGroup}
      onUpdateGroup={updateGroup}
      onDeleteGroup={deleteGroup}
      onMoveStudentToGroup={moveStudentToGroup}
      onMoveStudentToUngrouped={moveStudentToUngrouped}
      onResetGroups={resetGroups}
      onOpenStudentProfile={(studentId) => {
        setSelectedStudentId(studentId);
        openStudentProfile(studentId);
      }}
    />
  );

  return (
    <SubjectWorkspaceContainer
      title="Mathematics · 7A"
      subtitle={currentPlanningUnitTitle}
      contextLine={`Monday ${mathsLesson?.start || '08:40'}-${mathsLesson?.end || '09:30'}`}
      activeMode={activeMode}
      onModeChange={setActiveMode}
      onBack={onClose || onBackToWeek}
      menuItems={[{ id: 'reset-maths-7a-demo', label: 'Reset Maths 7A demo', onClick: resetDemo }]}
    >
      {activeMode === 'now' && nowMode}
      {activeMode === 'plan' && planMode}
      {activeMode === 'class-picture' && classPictureMode}

      <StudentPictureDialog
        student={selectedStudent}
        evidence={selectedEvidence}
        tasks={linkedTasks}
        open={studentPictureOpen}
        onClose={() => setStudentPictureOpen(false)}
        onCapture={() => captureForStudent(selectedStudent.id)}
      />
      <StudentProfileDataDialog
        open={studentProfileOpen}
        student={profileStudent}
        subtitle="Mathematics - 7A"
        summary={profileSummary?.summary}
        groups={profileGroups}
        groupDefinitions={classGroupDefinitions}
        dataSections={profileDataSections}
        onClose={() => setStudentProfileOpen(false)}
      />
    </SubjectWorkspaceContainer>
  );
}
