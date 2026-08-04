import { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PolicyIcon from '@mui/icons-material/Policy';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';

const mentorStorageKey = 'smartdesk_demo_mentor_module_workflow';

const baseStudents = [
  {
    id: 'oskar-p',
    displayName: 'Oskar P.',
    className: '7A',
    state: 'needs-help',
    stateLabel: 'Needs help',
    lastCheckIn: '2026-05-18',
    nextAction: { label: 'Guardian contact', date: '2026-05-21' },
    prorenata: true,
  },
  {
    id: 'elias-t',
    displayName: 'Elias T.',
    className: '7A',
    state: 'check-in',
    stateLabel: 'Check-in planned',
    lastCheckIn: '2026-05-04',
    nextAction: { label: 'Student check-in', date: '2026-05-22' },
    prorenata: false,
  },
  {
    id: 'sara-n',
    displayName: 'Sara N.',
    className: '7A',
    state: 'waiting',
    stateLabel: 'Waiting for response',
    lastCheckIn: '2026-05-12',
    nextAction: { label: 'Review response', date: '2026-05-23' },
    prorenata: true,
  },
  {
    id: 'ella-s',
    displayName: 'Ella S.',
    className: '7A',
    state: 'check-in',
    stateLabel: 'Check-in planned',
    lastCheckIn: '2026-05-08',
    nextAction: { label: 'Short mentor check-in', date: '2026-05-21' },
    prorenata: false,
  },
  {
    id: 'noah-p',
    displayName: 'Noah P.',
    className: '7A',
    state: 'team',
    stateLabel: 'Discuss with team',
    lastCheckIn: '2026-05-13',
    nextAction: { label: 'Team discussion', date: '2026-05-22' },
    prorenata: true,
  },
  {
    id: 'maja-l',
    displayName: 'Maja L.',
    className: '7A',
    state: 'clear',
    stateLabel: 'No current follow-up',
    lastCheckIn: '2026-05-11',
    nextAction: null,
    prorenata: false,
  },
];

const stateOptions = [
  { id: 'needs-help', label: 'Needs help' },
  { id: 'check-in', label: 'Check-in planned' },
  { id: 'waiting', label: 'Waiting for response' },
  { id: 'team', label: 'Discuss with team' },
  { id: 'clear', label: 'No current follow-up' },
];

const policyPrompts = [
  {
    id: 'homework',
    question: 'A student repeatedly misses homework. What should I do?',
    answer: 'Start with a neutral check-in and agree one next step. If the pattern continues or wider concern appears, follow school escalation routines and document formal support in Prorenata.',
  },
  {
    id: 'meeting',
    question: 'How should I prepare for a mentor meeting?',
    answer: 'Review attendance, agreed actions, and upcoming deadlines. Keep the meeting record focused on actions, dates, and responsibilities. Avoid sensitive detail in SmartDesk.',
  },
  {
    id: 'escalation',
    question: 'When should I use Prorenata?',
    answer: 'Use Prorenata for formal welfare, safeguarding, medical, student health, or sensitive support documentation. SmartDesk should only hold reminders that a follow-up or handoff is needed.',
  },
];

function readStoredWorkflow() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const value = window.localStorage.getItem(mentorStorageKey);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function formatDate(date) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function mergeStudents(overrides) {
  const stateOrder = ['needs-help', 'check-in', 'waiting', 'team', 'clear'];

  return baseStudents
    .map((student) => ({
      ...student,
      ...(overrides[student.id] || {}),
    }))
    .sort((first, second) => {
      const stateDifference = stateOrder.indexOf(first.state) - stateOrder.indexOf(second.state);
      return stateDifference || first.displayName.localeCompare(second.displayName);
    });
}

function saveStoredWorkflow(workflow) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(mentorStorageKey, JSON.stringify(workflow));
}

function StatTile({ icon, label, value }) {
  return (
    <Paper elevation={0} sx={{ p: 1.35, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ color: purple, display: 'grid', placeItems: 'center' }}>{icon}</Box>
        <Box>
          <Typography sx={{ color: darkText, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.3, fontWeight: 760 }}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function StudentWorkflowRow({ student, selected, onSelect }) {
  return (
    <ButtonBase
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(student.id)}
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'minmax(120px, 0.9fr) minmax(140px, 0.9fr) minmax(120px, 0.8fr) minmax(110px, 0.7fr)' },
        gap: { xs: 0.45, sm: 1 },
        alignItems: { xs: 'start', sm: 'center' },
        textAlign: 'left',
        px: 1.1,
        py: 0.85,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: selected ? 'rgba(156, 40, 175, 0.38)' : 'transparent',
        bgcolor: selected ? palePurple : '#fff',
        '&:hover': { bgcolor: selected ? palePurple : 'rgba(251, 245, 253, 0.55)' },
        '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 1 },
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: student.state === 'clear' ? 'rgba(23, 21, 26, 0.22)' : purple, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: darkText, fontSize: 13.3, fontWeight: 850, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student.displayName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 720 }}>
            {student.className}
          </Typography>
        </Box>
      </Stack>
      <Typography sx={{ color: darkText, fontSize: 12.7, fontWeight: 780, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {student.stateLabel}
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 12.4, fontWeight: 700 }}>
        {formatDate(student.lastCheckIn)}
      </Typography>
      <Typography sx={{ color: student.prorenata ? purple : 'text.secondary', fontSize: 12.3, fontWeight: 800 }}>
        {student.prorenata ? 'Prorenata' : 'SmartDesk'}
      </Typography>
    </ButtonBase>
  );
}

export default function MentorModule({ onBack }) {
  const [overrides, setOverrides] = useState(() => readStoredWorkflow());
  const students = useMemo(() => mergeStudents(overrides), [overrides]);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'oskar-p');
  const [selectedPromptId, setSelectedPromptId] = useState('escalation');
  const [draftState, setDraftState] = useState('needs-help');
  const [draftDate, setDraftDate] = useState('2026-05-26');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const selectedPrompt = policyPrompts.find((prompt) => prompt.id === selectedPromptId) || policyPrompts[0];
  const needsActionCount = students.filter((student) => student.state !== 'clear').length;
  const prorenataCount = students.filter((student) => student.prorenata).length;
  const plannedThisWeekCount = students.filter((student) => student.nextAction).length;

  function updateStudentWorkflow() {
    const selectedState = stateOptions.find((option) => option.id === draftState) || stateOptions[0];
    const nextOverrides = {
      ...overrides,
      [selectedStudent.id]: {
        state: selectedState.id,
        stateLabel: selectedState.label,
        nextAction: selectedState.id === 'clear'
          ? null
          : { label: selectedState.label, date: draftDate },
      },
    };

    setOverrides(nextOverrides);
    saveStoredWorkflow(nextOverrides);
    setSnackbarMessage('Mentor workflow updated.');
  }

  function resetDemo() {
    const nextOverrides = {};
    setOverrides(nextOverrides);
    saveStoredWorkflow(nextOverrides);
    setSelectedStudentId('oskar-p');
    setSnackbarMessage('Mentor workflow reset.');
  }

  return (
    <>
      <Box sx={{ minHeight: '100%', bgcolor: '#f8f7f9', px: { xs: 1.5, sm: 2.5, md: 4 }, py: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
            <Box>
              <Typography variant="h1" sx={{ color: darkText, fontSize: { xs: 30, md: 38 }, lineHeight: 1.05 }}>
                Mentor
              </Typography>
              <Typography sx={{ mt: 0.65, color: 'text.secondary', fontSize: 14.5, fontWeight: 680, maxWidth: 720 }}>
                Follow-up rhythm, meetings, and neutral workflow signals. Sensitive student information stays in Prorenata.
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Button variant="outlined" onClick={resetDemo} sx={{ color: 'text.secondary', borderColor: 'rgba(23, 21, 26, 0.14)', borderRadius: '8px', textTransform: 'none' }}>
                Reset demo
              </Button>
              <Button variant="contained" onClick={onBack} sx={{ bgcolor: purple, borderRadius: '8px', textTransform: 'none', '&:hover': { bgcolor: '#842194' } }}>
                Back home
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
            <StatTile icon={<TaskAltIcon fontSize="small" />} label="Needs follow-up" value={needsActionCount} />
            <StatTile icon={<EventAvailableIcon fontSize="small" />} label="Planned this week" value={plannedThisWeekCount} />
            <StatTile icon={<PolicyIcon fontSize="small" />} label="Refer to Prorenata" value={prorenataCount} />
          </Box>

          <Box sx={{ mt: 1.4, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.45fr) minmax(330px, 0.75fr)' }, gap: 1.25, alignItems: 'start' }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ px: 0.2, pb: 0.8 }}>
                <GroupsIcon sx={{ color: purple, fontSize: 19 }} />
                <Typography sx={{ color: darkText, fontSize: 15.5, fontWeight: 880 }}>
                  Mentor overview
                </Typography>
              </Stack>
              <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: 'minmax(120px, 0.9fr) minmax(140px, 0.9fr) minmax(120px, 0.8fr) minmax(110px, 0.7fr)', gap: 1, px: 1.1, pb: 0.5 }}>
                {['Student', 'Workflow', 'Last check-in', 'Storage'].map((label) => (
                  <Typography key={label} sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 860 }}>
                    {label}
                  </Typography>
                ))}
              </Box>
              <Stack spacing={0.25}>
                {students.map((student) => (
                  <StudentWorkflowRow
                    key={student.id}
                    student={student}
                    selected={student.id === selectedStudent?.id}
                    onSelect={(studentId) => {
                      const nextStudent = students.find((item) => item.id === studentId);
                      setSelectedStudentId(studentId);
                      setDraftState(nextStudent?.state || 'needs-help');
                      setDraftDate(nextStudent?.nextAction?.date || '2026-05-26');
                    }}
                  />
                ))}
              </Stack>
            </Paper>

            <Stack spacing={1.25}>
              <Paper elevation={0} sx={{ p: 1.4, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 16.5, fontWeight: 900 }}>
                  {selectedStudent?.displayName}
                </Typography>
                <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.8, fontWeight: 720 }}>
                  {selectedStudent?.className} mentor workflow
                </Typography>

                <Stack spacing={1} sx={{ mt: 1.3 }}>
                  <TextField select size="small" label="Workflow signal" value={draftState} onChange={(event) => setDraftState(event.target.value)}>
                    {stateOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField size="small" type="date" label="Follow-up date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} InputLabelProps={{ shrink: true }} />
                  <Button startIcon={<AddIcon />} variant="contained" onClick={updateStudentWorkflow} sx={{ alignSelf: 'flex-start', bgcolor: purple, borderRadius: '8px', textTransform: 'none', '&:hover': { bgcolor: '#842194' } }}>
                    Save workflow
                  </Button>
                </Stack>

                <Divider sx={{ my: 1.4 }} />

                <Stack spacing={0.7}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 780 }}>
                      Next action
                    </Typography>
                    {selectedStudent?.nextAction ? (
                      <Typography sx={{ color: darkText, fontSize: 12.5, fontWeight: 850 }}>
                        {formatDate(selectedStudent.nextAction.date)}
                      </Typography>
                    ) : null}
                  </Stack>
                  <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 830 }}>
                    {selectedStudent?.nextAction?.label || 'No current follow-up'}
                  </Typography>
                  {selectedStudent?.prorenata ? (
                    <Button endIcon={<OpenInNewIcon />} size="small" variant="outlined" onClick={() => setSnackbarMessage('Demo only - open the approved school system for sensitive records.')} sx={{ alignSelf: 'flex-start', color: purple, borderColor: 'rgba(156, 40, 175, 0.24)', borderRadius: '8px', textTransform: 'none' }}>
                      Open Prorenata
                    </Button>
                  ) : (
                    <Chip
                      icon={<CheckCircleOutlineIcon />}
                      label="Workflow only"
                      size="small"
                      sx={{ alignSelf: 'flex-start', bgcolor: palePurple, color: purple, fontWeight: 800 }}
                    />
                  )}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.4, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <ChatBubbleOutlineIcon sx={{ color: purple, fontSize: 19 }} />
                  <Typography sx={{ color: darkText, fontSize: 16, fontWeight: 900 }}>
                    Policy guidance
                  </Typography>
                </Stack>
                <Typography sx={{ mt: 0.55, color: 'text.secondary', fontSize: 12.8, lineHeight: 1.45 }}>
                  General discussion only. Do not enter student names, diagnoses, welfare detail, or sensitive records here.
                </Typography>
                <Stack spacing={0.55} sx={{ mt: 1.1 }}>
                  {policyPrompts.map((prompt) => (
                    <ButtonBase
                      key={prompt.id}
                      type="button"
                      onClick={() => setSelectedPromptId(prompt.id)}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        px: 0.85,
                        py: 0.65,
                        borderRadius: '8px',
                        bgcolor: selectedPromptId === prompt.id ? palePurple : '#fff',
                        color: selectedPromptId === prompt.id ? purple : darkText,
                        border: '1px solid',
                        borderColor: selectedPromptId === prompt.id ? 'rgba(156, 40, 175, 0.22)' : border,
                      }}
                    >
                      <Typography sx={{ color: 'inherit', fontSize: 12.7, fontWeight: 820, lineHeight: 1.25 }}>
                        {prompt.question}
                      </Typography>
                    </ButtonBase>
                  ))}
                </Stack>
                <Box sx={{ mt: 1, p: 1, borderRadius: '8px', bgcolor: palePurple, border: '1px solid rgba(156, 40, 175, 0.12)' }}>
                  <Typography sx={{ color: purple, fontSize: 12.3, fontWeight: 900 }}>
                    SmartDesk guidance
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: darkText, fontSize: 13.2, lineHeight: 1.5 }}>
                    {selectedPrompt.answer}
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          </Box>

          <Paper elevation={0} sx={{ mt: 1.25, p: 1.25, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.9, lineHeight: 1.45 }}>
              SmartDesk keeps broad workflow signals only. Formal notes, safeguarding, student health, medical, or personal information should be handled in Prorenata.
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={2600}
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
