import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import NotesIcon from '@mui/icons-material/Notes';
import {
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { annaNotebookNotes } from '../data/annaNotebook.js';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';
const notesStorageKey = 'smartdesk_demo_notebook_notes';
const hiddenStorageKey = 'smartdesk_demo_notebook_hidden_notes';
const voiceTranscript = 'Try a shorter written example with 7A before independent work.';

const linkOptions = [
  { value: 'unlinked', label: 'Keep unlinked', links: [] },
  {
    value: 'mathematics-7a',
    label: 'Mathematics 7A',
    links: [
      { type: 'class', id: '7a', label: '7A' },
      { type: 'subject', id: 'mathematics', label: 'Mathematics' },
    ],
  },
  {
    value: 'english-8b',
    label: 'English 8B',
    links: [
      { type: 'class', id: '8b', label: '8B' },
      { type: 'subject', id: 'english', label: 'English' },
    ],
  },
  {
    value: 'mentor-7a',
    label: 'Mentor 7A',
    links: [
      { type: 'class', id: '7a', label: '7A' },
      { type: 'mentor', id: 'mentor-7a', label: 'Mentor' },
    ],
  },
  {
    value: 'team-meeting',
    label: 'Team meeting',
    links: [{ type: 'meeting', id: 'team-meeting', label: 'Team meeting' }],
  },
];

function readJsonStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getNoteBody(note) {
  return note.type === 'voice' ? note.transcript : note.text;
}

function formatNoteDate(createdAt) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

function NoteCard({ note, onHide }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: '18px',
        border: `1px solid ${border}`,
        bgcolor: '#fff',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          size="small"
          icon={note.type === 'voice' ? <MicIcon /> : <NotesIcon />}
          label={note.type === 'voice' ? 'Voice' : 'Text'}
          sx={{
            height: 24,
            bgcolor: note.type === 'voice' ? palePurple : '#fff',
            color: note.type === 'voice' ? purple : 'text.secondary',
            border: `1px solid ${border}`,
            '& .MuiChip-icon': { color: 'inherit', fontSize: 15 },
          }}
        />
        <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
          {formatNoteDate(note.createdAt)}
        </Typography>
      </Stack>

      <Typography sx={{ mt: 1.1, color: darkText, fontSize: 15.5, lineHeight: 1.55, fontWeight: 620 }}>
        {getNoteBody(note)}
      </Typography>

      {!!note.links?.length && (
        <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mt: 1.15 }}>
          {note.links.map((link) => (
            <Chip
              key={`${note.id}-${link.type}-${link.id}`}
              label={link.label}
              size="small"
              sx={{
                height: 22,
                bgcolor: palePurple,
                color: purple,
                fontSize: 11.5,
                fontWeight: 720,
              }}
            />
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.1 }}>
        <Button size="small" variant="text" sx={{ color: 'text.secondary', px: 0.75 }}>
          Open
        </Button>
        <Button size="small" variant="text" sx={{ color: 'text.secondary', px: 0.75 }}>
          Link
        </Button>
        <Button size="small" variant="text" onClick={() => onHide(note.id)} sx={{ color: 'text.secondary', px: 0.75 }}>
          Hide
        </Button>
      </Stack>
    </Paper>
  );
}

export default function NotebookModal({ open, onClose }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const timerRef = useRef(null);
  const [localNotes, setLocalNotes] = useState([]);
  const [hiddenNoteIds, setHiddenNoteIds] = useState([]);
  const [draft, setDraft] = useState('');
  const [linkValue, setLinkValue] = useState('unlinked');
  const [savedMessage, setSavedMessage] = useState('');
  const [voiceState, setVoiceState] = useState('idle');
  const [voiceDraft, setVoiceDraft] = useState('');

  const selectedLink = linkOptions.find((option) => option.value === linkValue) || linkOptions[0];

  const visibleNotes = useMemo(() => (
    [...localNotes, ...annaNotebookNotes]
      .filter((note) => !hiddenNoteIds.includes(note.id))
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
  ), [localNotes, hiddenNoteIds]);

  function clearVoiceTimer() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function refreshNotesFromStorage() {
    setLocalNotes(readJsonStorage(notesStorageKey, []));
    setHiddenNoteIds(readJsonStorage(hiddenStorageKey, []));
  }

  function persistLocalNotes(nextNotes) {
    setLocalNotes(nextNotes);
    writeJsonStorage(notesStorageKey, nextNotes);
  }

  function persistHiddenNotes(nextIds) {
    setHiddenNoteIds(nextIds);
    writeJsonStorage(hiddenStorageKey, nextIds);
  }

  function makeNote({ type, text, transcript }) {
    return {
      id: `note-demo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      type,
      ...(type === 'voice' ? { transcript } : { text }),
      links: selectedLink.links,
      source: 'teacher',
    };
  }

  function handleSaveTextNote() {
    const text = draft.trim();

    if (!text) {
      return;
    }

    persistLocalNotes([makeNote({ type: 'text', text }), ...localNotes]);
    setDraft('');
    setSavedMessage('Saved to your notebook.');
  }

  function handleStartVoice() {
    clearVoiceTimer();
    setVoiceDraft('');
    setVoiceState('listening');
    setSavedMessage('');

    timerRef.current = window.setTimeout(() => {
      setVoiceDraft(voiceTranscript);
      setVoiceState('ready');
      timerRef.current = null;
    }, 1800);
  }

  function handleCancelVoice() {
    clearVoiceTimer();
    setVoiceDraft('');
    setVoiceState('idle');
  }

  function handleSaveVoiceNote() {
    if (!voiceDraft.trim()) {
      return;
    }

    persistLocalNotes([makeNote({ type: 'voice', transcript: voiceDraft }), ...localNotes]);
    setVoiceDraft('');
    setVoiceState('idle');
    setSavedMessage('Saved to your notebook.');
  }

  function handleHideNote(noteId) {
    if (!hiddenNoteIds.includes(noteId)) {
      persistHiddenNotes([...hiddenNoteIds, noteId]);
    }
  }

  function handleResetDemo() {
    window.localStorage.removeItem(notesStorageKey);
    window.localStorage.removeItem(hiddenStorageKey);
    setLocalNotes([]);
    setHiddenNoteIds([]);
    setDraft('');
    setLinkValue('unlinked');
    setSavedMessage('');
    handleCancelVoice();
  }

  useEffect(() => {
    if (open) {
      refreshNotesFromStorage();
    } else {
      clearVoiceTimer();
      setVoiceState('idle');
      setVoiceDraft('');
    }

    return clearVoiceTimer;
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={mobile}
      maxWidth={false}
      aria-labelledby="notebook-modal-title"
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 'calc(100vw - 48px)' },
            maxWidth: 820,
            maxHeight: { xs: '100%', sm: '82vh' },
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
      <Box sx={{ maxHeight: { xs: '100%', sm: '82vh' }, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography id="notebook-modal-title" variant="h2" sx={{ color: darkText, fontSize: { xs: 30, sm: 38 }, lineHeight: 1.08 }}>
              Notebook
            </Typography>
            <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 15.5 }}>
              Keep a thought before it disappears.
            </Typography>
          </Box>
          <IconButton aria-label="Close Notebook" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            mt: 2.5,
            p: { xs: 1.75, sm: 2.25 },
            borderRadius: '22px',
            border: `1px solid ${border}`,
            bgcolor: '#fff',
          }}
        >
          <Stack spacing={1.4}>
            <TextField
              label="Quick thought"
              placeholder="Write a quick thought..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <TextField
                select
                label="Link this note"
                value={linkValue}
                onChange={(event) => setLinkValue(event.target.value)}
                size="small"
                sx={{ minWidth: { sm: 210 } }}
              >
                {linkOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Typography sx={{ color: 'text.secondary', fontSize: 13.5, flex: 1 }}>
                You can organise it later.
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button variant="contained" disabled={!draft.trim()} onClick={handleSaveTextNote} sx={{ bgcolor: purple, '&:hover': { bgcolor: '#852196' } }}>
                Save note
              </Button>
              <Button variant="outlined" startIcon={<MicIcon />} onClick={handleStartVoice} sx={{ color: purple, borderColor: 'rgba(156, 40, 175, 0.24)' }}>
                Record voice note
              </Button>
              {!!savedMessage && (
                <Typography aria-live="polite" sx={{ color: 'text.secondary', fontSize: 13.5 }}>
                  {savedMessage}
                </Typography>
              )}
            </Stack>

            {voiceState !== 'idle' && (
              <Box
                aria-live="polite"
                sx={{
                  mt: 0.3,
                  p: 1.5,
                  borderRadius: '18px',
                  border: '1px solid rgba(156, 40, 175, 0.14)',
                  bgcolor: palePurple,
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center' }}>
                    <MicIcon
                      sx={{
                        color: purple,
                        fontSize: 18,
                        animation: voiceState === 'listening' ? 'notebookPulse 950ms ease-in-out infinite' : 'none',
                        '@keyframes notebookPulse': {
                          '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                          '50%': { transform: 'scale(1.18)', opacity: 1 },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: darkText, fontWeight: 820 }}>
                      {voiceState === 'listening' ? 'Listening...' : 'Voice note ready'}
                    </Typography>
                    <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.8 }}>
                      Demo voice interaction
                    </Typography>
                    {!!voiceDraft && (
                      <Typography sx={{ mt: 0.8, color: darkText, fontSize: 14.2, lineHeight: 1.45 }}>
                        {voiceDraft}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                {voiceState === 'ready' && (
                  <Stack direction="row" spacing={0.75} sx={{ mt: 1.1 }}>
                    <Button size="small" variant="contained" onClick={handleSaveVoiceNote} disabled={!voiceDraft.trim()} sx={{ bgcolor: purple, '&:hover': { bgcolor: '#852196' } }}>
                      Save voice note
                    </Button>
                    <Button size="small" variant="text" onClick={handleCancelVoice} sx={{ color: 'text.secondary' }}>
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            mt: 2,
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
            This note may relate to Mathematics 7A.
          </Typography>
          <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 14.5, lineHeight: 1.55 }}>
            You can keep it here or add it to the class later.
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            <Button size="small" variant="text" sx={{ color: purple }}>
              Keep here
            </Button>
            <Button size="small" variant="text" sx={{ color: purple }}>
              Add to Mathematics 7A
            </Button>
          </Stack>
        </Paper>

        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
          <Typography variant="h3" sx={{ color: darkText, fontSize: 22 }}>
            Recent notes
          </Typography>
          <Button size="small" variant="text" onClick={handleResetDemo} sx={{ color: 'text.secondary' }}>
            Reset Notebook demo
          </Button>
        </Stack>

        <Stack spacing={1.15} sx={{ mt: 1.25 }}>
          {visibleNotes.map((note) => (
            <NoteCard key={note.id} note={note} onHide={handleHideNote} />
          ))}
        </Stack>
      </Box>
    </Dialog>
  );
}
