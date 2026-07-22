import { useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { annaMentorStudents } from '../data/annaMentorStudents.js';
import {
  countActiveFollowUps,
  formatMentorDate,
  getMergedMentorStudents,
  getMentorFollowUps,
  getStudentById,
  mentorStorageKey,
  sortStudentsByWorkflowState,
  workflowStatusLabels,
} from '../utils/mentorUtils.js';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';

const followUpTypes = [
  'Student check-in',
  'Parent conversation',
  'Team discussion',
  'Review later',
];

function readOverrides() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(mentorStorageKey);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function StudentRow({ student, selected, onSelect }) {
  return (
    <Paper
      component="button"
      type="button"
      elevation={0}
      aria-pressed={selected}
      onClick={() => onSelect(student.id)}
      sx={{
        appearance: 'none',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        p: 1.5,
        borderRadius: '17px',
        border: '1px solid',
        borderColor: selected ? 'rgba(156, 40, 175, 0.34)' : border,
        bgcolor: selected ? palePurple : '#fff',
        boxShadow: selected ? 'inset 0 0 0 1px rgba(156, 40, 175, 0.12)' : 'none',
        transition: 'border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          borderColor: 'rgba(156, 40, 175, 0.24)',
          bgcolor: selected ? palePurple : 'rgba(251, 245, 253, 0.42)',
        },
        '&:focus-visible': {
          outline: `3px solid rgba(156, 40, 175, 0.18)`,
          outlineOffset: 2,
        },
      }}
    >
      <Stack spacing={0.45}>
        <Typography sx={{ color: darkText, fontSize: 15.5, fontWeight: 820 }}>
          {student.displayName}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13.2, lineHeight: 1.35 }}>
          {student.workflowStatusLabel}
        </Typography>
        {student.nextFollowUp && (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.6, lineHeight: 1.35 }}>
            {student.nextFollowUp.label} - {formatMentorDate(student.nextFollowUp.date)}
          </Typography>
        )}
        {student.externalRecord?.exists && (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35 }}>
            Documentation in Prorenata
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function DetailSection({ title, children }) {
  if (!children) {
    return null;
  }

  return (
    <Box>
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 780 }}>
        {title}
      </Typography>
      <Box sx={{ mt: 0.55 }}>{children}</Box>
    </Box>
  );
}

export default function MentorModal({ open, onClose }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [overrides, setOverrides] = useState(() => readOverrides());
  const [selectedStudentId, setSelectedStudentId] = useState('oskar-p');
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [followUpType, setFollowUpType] = useState('Student check-in');
  const [followUpDate, setFollowUpDate] = useState('2026-05-22');
  const [followUpLabel, setFollowUpLabel] = useState('');
  const [reminderDraft, setReminderDraft] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const students = useMemo(() => (
    sortStudentsByWorkflowState(getMergedMentorStudents(annaMentorStudents, overrides))
  ), [overrides]);
  const selectedStudent = getStudentById(students, selectedStudentId);
  const activeFollowUpCount = countActiveFollowUps(students);
  const plannedFollowUps = getMentorFollowUps(students);

  function persistOverrides(nextOverrides) {
    setOverrides(nextOverrides);
    window.localStorage.setItem(mentorStorageKey, JSON.stringify(nextOverrides));
  }

  function updateSelectedStudent(update) {
    persistOverrides({
      ...overrides,
      [selectedStudent.id]: {
        ...(overrides[selectedStudent.id] || {}),
        ...update,
        updatedAt: '2026-05-18',
      },
    });
  }

  function handleAddFollowUp() {
    const label = followUpLabel.trim() || followUpType;
    updateSelectedStudent({
      workflowStatus: 'follow-up-in-view',
      workflowStatusLabel: workflowStatusLabels['follow-up-in-view'],
      nextFollowUp: {
        date: followUpDate,
        type: followUpType.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        label,
      },
    });
    setFollowUpOpen(false);
    setFollowUpLabel('');
    setSnackbarMessage("Follow-up added to Anna's mentor view.");
  }

  function handleSaveReminder() {
    updateSelectedStudent({
      teacherReminder: reminderDraft.trim() || null,
    });
    setReminderOpen(false);
    setSnackbarMessage("Reminder saved to Anna's mentor view.");
  }

  function handleMarkNoCurrentFollowUp() {
    updateSelectedStudent({
      workflowStatus: 'no-current-follow-up',
      workflowStatusLabel: workflowStatusLabels['no-current-follow-up'],
      nextFollowUp: null,
    });
    setFollowUpOpen(false);
    setSnackbarMessage('No current follow-up is now shown.');
  }

  function handleResetDemo() {
    window.localStorage.removeItem(mentorStorageKey);
    setOverrides({});
    setSelectedStudentId('oskar-p');
    setFollowUpOpen(false);
    setReminderOpen(false);
    setSnackbarMessage('Mentor demo reset.');
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={mobile}
        maxWidth={false}
        aria-labelledby="mentor-modal-title"
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 'calc(100vw - 48px)' },
              maxWidth: 980,
              maxHeight: { xs: '100%', sm: '84vh' },
              borderRadius: { xs: 0, sm: '24px' },
              bgcolor: '#fff',
              boxShadow: '0 28px 82px rgba(23, 21, 26, 0.16)',
              overflow: 'hidden',
            },
          },
          backdrop: {
            sx: { bgcolor: 'rgba(23, 21, 26, 0.22)' },
          },
        }}
      >
        <Box sx={{ maxHeight: { xs: '100%', sm: '84vh' }, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography id="mentor-modal-title" variant="h2" sx={{ color: darkText, fontSize: { xs: 30, sm: 38 }, lineHeight: 1.08 }}>
                Mentor - 7A
              </Typography>
              <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 15.5, fontWeight: 680 }}>
                9 students
              </Typography>
              <Typography sx={{ mt: 1, maxWidth: 660, color: 'text.secondary', fontSize: 14.8, lineHeight: 1.55 }}>
                Keep track of conversations and follow-ups. Sensitive documentation stays in approved school systems.
              </Typography>
            </Box>
            <IconButton aria-label="Close Mentor" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: '20px',
              border: '1px solid rgba(156, 40, 175, 0.13)',
              bgcolor: palePurple,
            }}
          >
            <Typography sx={{ color: darkText, fontSize: 17, fontWeight: 850 }}>
              SmartDesk noticed
            </Typography>
            <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: 14.5, lineHeight: 1.55 }}>
              You have {activeFollowUpCount} mentor follow-ups currently in view.
            </Typography>
            <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 14.5, lineHeight: 1.55 }}>
              {plannedFollowUps.length
                ? 'Thursday includes a planned parent conversation, and Friday may contain space for a short check-in.'
                : 'The week may contain space for a short check-in if you choose to add one.'}
            </Typography>
          </Paper>

          <Box
            sx={{
              mt: 2.4,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 0.78fr) minmax(0, 1.22fr)' },
              gap: 1.5,
              alignItems: 'start',
            }}
          >
            <Stack spacing={0.9}>
              {students.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  selected={student.id === selectedStudent.id}
                  onSelect={setSelectedStudentId}
                />
              ))}
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.35 },
                borderRadius: '22px',
                border: `1px solid ${border}`,
                bgcolor: '#fff',
              }}
            >
              <Typography sx={{ color: darkText, fontSize: 25, fontWeight: 880, lineHeight: 1.15 }}>
                {selectedStudent.displayName}
              </Typography>
              <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 14.5 }}>
                Mentor - 7A
              </Typography>

              <Stack spacing={2} sx={{ mt: 2.2 }}>
                <DetailSection title="Current follow-up state">
                  <Chip
                    label={selectedStudent.workflowStatusLabel}
                    sx={{
                      bgcolor: palePurple,
                      color: purple,
                      fontWeight: 780,
                    }}
                  />
                </DetailSection>

                {selectedStudent.lastCheckInDate && (
                  <DetailSection title="Last mentor check-in">
                    <Typography sx={{ color: darkText, fontSize: 15.5 }}>
                      {formatMentorDate(selectedStudent.lastCheckInDate)}
                    </Typography>
                  </DetailSection>
                )}

                {selectedStudent.nextFollowUp && (
                  <DetailSection title="Next chosen follow-up">
                    <Typography sx={{ color: darkText, fontSize: 15.5, fontWeight: 720 }}>
                      {selectedStudent.nextFollowUp.label}
                    </Typography>
                    <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 14 }}>
                      {formatMentorDate(selectedStudent.nextFollowUp.date)}
                    </Typography>
                  </DetailSection>
                )}

                {selectedStudent.teacherReminder && (
                  <DetailSection title="Teacher reminder">
                    <Typography sx={{ color: darkText, fontSize: 15.2, lineHeight: 1.55 }}>
                      {selectedStudent.teacherReminder}
                    </Typography>
                  </DetailSection>
                )}

                {selectedStudent.externalRecord?.exists && (
                  <DetailSection title="Formal documentation">
                    <Typography sx={{ color: darkText, fontSize: 15.2, lineHeight: 1.55 }}>
                      Formal documentation exists in Prorenata.
                    </Typography>
                    <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 14.2, lineHeight: 1.5 }}>
                      Open the approved school system to view or update sensitive information.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSnackbarMessage('Demo only - formal documentation would open in the approved school system.')}
                      sx={{ mt: 1, color: purple, borderColor: 'rgba(156, 40, 175, 0.24)' }}
                    >
                      Open Prorenata
                    </Button>
                  </DetailSection>
                )}
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.9} flexWrap="wrap" useFlexGap sx={{ mt: 2.4 }}>
                <Button variant="outlined" onClick={() => setFollowUpOpen((current) => !current)} sx={{ color: purple, borderColor: 'rgba(156, 40, 175, 0.24)' }}>
                  Add follow-up
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setReminderDraft(selectedStudent.teacherReminder || '');
                    setReminderOpen((current) => !current);
                  }}
                  sx={{ color: purple, borderColor: 'rgba(156, 40, 175, 0.24)' }}
                >
                  Add reminder
                </Button>
                <Button variant="text" onClick={handleMarkNoCurrentFollowUp} sx={{ color: 'text.secondary' }}>
                  Mark as no current follow-up
                </Button>
              </Stack>

              {followUpOpen && (
                <Paper elevation={0} sx={{ mt: 1.5, p: 1.5, borderRadius: '18px', border: `1px solid ${border}`, bgcolor: palePurple }}>
                  <Stack spacing={1.1}>
                    <TextField select label="Follow-up type" value={followUpType} onChange={(event) => setFollowUpType(event.target.value)} size="small">
                      {followUpTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </TextField>
                    <TextField label="Date" type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} size="small" InputLabelProps={{ shrink: true }} />
                    <TextField label="Optional short label" value={followUpLabel} onChange={(event) => setFollowUpLabel(event.target.value)} size="small" placeholder="Keep the wording broad..." />
                    <Button variant="contained" onClick={handleAddFollowUp} sx={{ alignSelf: 'flex-start', bgcolor: purple, '&:hover': { bgcolor: '#842194' } }}>
                      Save follow-up
                    </Button>
                  </Stack>
                </Paper>
              )}

              {reminderOpen && (
                <Paper elevation={0} sx={{ mt: 1.5, p: 1.5, borderRadius: '18px', border: `1px solid ${border}`, bgcolor: palePurple }}>
                  <Stack spacing={1.1}>
                    <TextField
                      label="Private workflow reminder"
                      helperText="Do not add personal or sensitive student information here."
                      value={reminderDraft}
                      onChange={(event) => setReminderDraft(event.target.value)}
                      placeholder="Remember what you want to do next..."
                      size="small"
                      fullWidth
                    />
                    <Button variant="contained" onClick={handleSaveReminder} sx={{ alignSelf: 'flex-start', bgcolor: purple, '&:hover': { bgcolor: '#842194' } }}>
                      Save reminder
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Paper>
          </Box>

          <Paper elevation={0} sx={{ mt: 2, p: 1.6, borderRadius: '18px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 13.6, lineHeight: 1.5 }}>
              SmartDesk stores workflow reminders only. Personal and sensitive student information belongs in Prorenata or another approved school system.
            </Typography>
          </Paper>

          <Button size="small" variant="text" onClick={handleResetDemo} sx={{ mt: 1.25, color: 'text.secondary' }}>
            Reset Mentor demo
          </Button>
        </Box>
      </Dialog>

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
