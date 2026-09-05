import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, ButtonBase, Collapse, Paper, Stack, TextField, Typography } from '@mui/material';
import { border, darkText, formatDate, getStatusMeta, purple, statusOptions } from './mentorModuleShared.jsx';

export function MentorSupportActions({ picture, setSnackbarMessage = () => {} }) {
  return (
    <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap justifyContent="flex-start">
      <Button size="small" startIcon={<FolderOpenIcon />} variant="outlined" onClick={() => setSnackbarMessage('Demo only - open the student Drive folder.')} sx={{ color: 'var(--sd-accent-text)', borderColor: 'rgba(var(--sd-primary-rgb), 0.24)', borderRadius: '8px', textTransform: 'none' }}>
        Open Drive folder
      </Button>
      <Button size="small" endIcon={<OpenInNewIcon />} variant="outlined" onClick={() => setSnackbarMessage('Demo only - open Prorenata for official records.')} sx={{ color: picture.prorenata ? 'var(--sd-accent-text)' : 'text.secondary', borderColor: 'rgba(var(--sd-text-rgb), 0.14)', borderRadius: '8px', textTransform: 'none' }}>
        Open Prorenata
      </Button>
    </Stack>
  );
}

export function ProrenataCard({ picture }) {
  return (
    <Box sx={{ p: 0.85, borderRadius: '8px', border: '1px solid rgba(var(--sd-text-rgb), 0.08)', bgcolor: 'var(--sd-surface)' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 780 }}>Prorenata</Typography>
      <Typography sx={{ mt: 0.45, color: picture.prorenata ? 'var(--sd-accent-text)' : 'text.secondary', fontSize: 12.6, fontWeight: 850, lineHeight: 1.25 }}>
        {picture.prorenata ? picture.prorenata.status : 'No ongoing process indicated'}
      </Typography>
      {picture.prorenata?.updated && (
        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.7, lineHeight: 1.25 }}>
          Updated {formatDate(picture.prorenata.updated)}
        </Typography>
      )}
    </Box>
  );
}

function splitTeachingMessages(teachingInfo = []) {
  const current = teachingInfo.find((item) => item.status === 'current')
    || teachingInfo.find((item) => item.status !== 'past')
    || null;
  const past = teachingInfo.filter((item) => item.id !== current?.id);
  return { current, past };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatUpdatedDate(item) {
  const date = item.updatedDate || item.createdDate || item.reviewDate;
  return date ? `Updated ${formatDate(date)}` : 'Updated today';
}

export function SharedTeachingInfoView({ picture, onTeachingInfoChange }) {
  const [draftMessage, setDraftMessage] = useState('');
  const [pastOpen, setPastOpen] = useState(false);
  const { current, past } = useMemo(() => splitTeachingMessages(picture.teachingInfo), [picture.teachingInfo]);

  function createMessage() {
    const text = draftMessage.trim();
    if (!text || !onTeachingInfoChange) return;

    const nextMessage = {
      id: `teaching-info-${Date.now()}`,
      text,
      updatedDate: todayIso(),
      status: 'current',
    };
    const archivedMessages = (picture.teachingInfo || []).map((item) => ({ ...item, status: 'past' }));
    onTeachingInfoChange([nextMessage, ...archivedMessages]);
    setDraftMessage('');
  }

  function archiveCurrentMessage() {
    if (!current || !onTeachingInfoChange) return;

    onTeachingInfoChange((picture.teachingInfo || []).map((item) => (
      item.id === current.id ? { ...item, status: 'past', archivedDate: todayIso() } : item
    )));
  }

  return (
    <Paper elevation={0} sx={{ p: 1.15, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: 'var(--sd-surface)' }}>
      <Stack spacing={1}>
        <Box>
          <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Message to teachers</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1, lineHeight: 1.35 }}>
            Share a message regarding this student directly with subject teachers.
          </Typography>
        </Box>

        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(var(--sd-primary-rgb), 0.035)', border: '1px solid rgba(var(--sd-primary-rgb), 0.12)' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 820 }}>Current</Typography>
          {current ? (
            <Stack spacing={0.8} sx={{ mt: 0.45 }}>
              <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 850, lineHeight: 1.35 }}>{current.text}</Typography>
              <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
                <Typography sx={{ color: 'text.secondary', fontSize: 11.5 }}>{formatUpdatedDate(current)}</Typography>
                <Button size="small" startIcon={<DeleteOutlineIcon />} onClick={archiveCurrentMessage} sx={{ color: 'text.secondary', borderRadius: '8px', textTransform: 'none', fontWeight: 820 }}>
                  Remove current
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 12.4, lineHeight: 1.35 }}>No current message shared.</Typography>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' }, gap: 0.75, alignItems: 'start' }}>
          <TextField
            label="New message"
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            multiline
            minRows={2}
            size="small"
          />
          <Button variant="contained" startIcon={<SendIcon />} onClick={createMessage} disabled={!draftMessage.trim()} sx={{ minHeight: 40, borderRadius: '8px', bgcolor: purple }}>
            Share
          </Button>
        </Box>

        <Box>
          <ButtonBase
            type="button"
            onClick={() => setPastOpen((open) => !open)}
            sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 820, borderRadius: '6px', justifyContent: 'flex-start', '&:hover': { color: 'var(--sd-accent-text)' } }}
          >
            {pastOpen ? 'Hide' : 'Show'} past messages ({past.length})
          </ButtonBase>
          <Collapse in={pastOpen} timeout={160} unmountOnExit>
            {past.length ? (
              <Stack component="ul" spacing={0.45} sx={{ m: 0, mt: 0.55, p: 0, listStyle: 'none' }}>
                {past.map((item) => (
                  <Box key={item.id} component="li" sx={{ p: 0.7, borderRadius: '8px', bgcolor: 'rgba(var(--sd-text-rgb), 0.018)', border: '1px solid rgba(var(--sd-text-rgb), 0.06)' }}>
                    <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 760, lineHeight: 1.3 }}>{item.text}</Typography>
                    <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 11.2 }}>{formatUpdatedDate(item)}</Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 12.2 }}>No past messages yet.</Typography>
            )}
          </Collapse>
        </Box>
      </Stack>
    </Paper>
  );
}

function SupportHistoryItem({ item }) {
  const meta = getStatusMeta(item.status);

  return (
    <Box component="li" sx={{ p: 0.72, borderRadius: '8px', bgcolor: 'rgba(var(--sd-text-rgb), 0.018)', border: '1px solid rgba(var(--sd-text-rgb), 0.06)' }}>
      <Stack direction="row" spacing={0.55} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
        <Typography sx={{ color: meta.color, fontSize: 11.6, fontWeight: 900 }}>{meta.label}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.2 }}>{formatDate(item.date)}</Typography>
      </Stack>
      {item.comment && (
        <Typography sx={{ mt: 0.25, color: darkText, fontSize: 12.1, fontWeight: 720, lineHeight: 1.3 }}>
          {item.comment}
        </Typography>
      )}
    </Box>
  );
}

function SupportStatusPicker({ currentStatus, pendingStatus, onSelect }) {
  return (
    <Box sx={{ mt: 0.75, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.35, p: 0.25, borderRadius: '8px', bgcolor: 'rgba(var(--sd-text-rgb), 0.045)', border: '1px solid rgba(var(--sd-text-rgb), 0.07)' }}>
      {Object.entries(statusOptions).map(([status, meta]) => {
        const isCurrent = currentStatus === status;
        const isPending = pendingStatus === status;
        return (
          <ButtonBase
            key={status}
            type="button"
            aria-pressed={isCurrent || isPending}
            onClick={() => onSelect(status)}
            sx={{
              minWidth: 0,
              height: 30,
              px: 0.5,
              borderRadius: '6px',
              border: '1px solid',
              borderColor: isPending ? meta.border : isCurrent ? 'rgba(var(--sd-text-rgb), 0.16)' : 'transparent',
              bgcolor: isPending ? meta.bg : isCurrent ? 'var(--sd-surface)' : 'transparent',
              color: isPending || isCurrent ? meta.color : 'text.secondary',
              boxShadow: isCurrent ? '0 1px 3px rgba(23, 21, 26, 0.08)' : 'none',
              transition: 'background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
              '&:hover': { bgcolor: isPending ? meta.bg : 'var(--sd-surface)' },
              '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
            }}
          >
            <Box component="span" sx={{ width: 7, height: 7, mr: 0.4, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
            <Typography sx={{ color: 'inherit', fontSize: 11.3, fontWeight: 900, lineHeight: 1 }}>
              {meta.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export function SupportSummaryView({ picture, onSupportUpdate }) {
  const [pendingStatus, setPendingStatus] = useState('');
  const [draftComment, setDraftComment] = useState('');
  const [commentTouched, setCommentTouched] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const supportHistory = picture.supportHistory || [];
  const commentRequired = Boolean(pendingStatus);
  const showCommentError = commentRequired && commentTouched && !draftComment.trim();

  useEffect(() => {
    setPendingStatus('');
    setDraftComment('');
    setCommentTouched(false);
  }, [picture.supportStatus]);

  function selectStatus(status) {
    if (status === picture.supportStatus) {
      setPendingStatus('');
      setDraftComment('');
      setCommentTouched(false);
      return;
    }

    setPendingStatus(status);
    setDraftComment('');
    setCommentTouched(false);
  }

  function saveSupportUpdate() {
    const comment = draftComment.trim();
    if (!pendingStatus || !comment || !onSupportUpdate) {
      setCommentTouched(true);
      return;
    }

    onSupportUpdate(pendingStatus, comment);
    setPendingStatus('');
    setDraftComment('');
    setCommentTouched(false);
  }

  function handleCommentKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    saveSupportUpdate();
  }

  return (
    <Paper elevation={0} sx={{ p: 1.15, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: 'var(--sd-surface)' }}>
      <Stack spacing={1}>
        <Box>
          <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Support status</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1, lineHeight: 1.35 }}>
            Highlight mentor students you are activily working with.
          </Typography>
          <SupportStatusPicker currentStatus={picture.supportStatus} pendingStatus={pendingStatus} onSelect={selectStatus} />
          {pendingStatus && (
          <Box sx={{ mt: 0.7 }}>
            <TextField
              label={`${getStatusMeta(pendingStatus).label} comment`}
              value={draftComment}
              onChange={(event) => {
                setDraftComment(event.target.value);
                setCommentTouched(true);
              }}
              onBlur={() => setCommentTouched(true)}
              onKeyDown={handleCommentKeyDown}
              multiline
              minRows={2}
              size="small"
              fullWidth
              required
              error={showCommentError}
              autoFocus
            />
          </Box>
          )}
        </Box>
        <Box>
          <ButtonBase
            type="button"
            onClick={() => setHistoryOpen((open) => !open)}
            sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 820, borderRadius: '6px', justifyContent: 'flex-start', '&:hover': { color: 'var(--sd-accent-text)' } }}
          >
            {historyOpen ? 'Hide' : 'Show'} status history ({supportHistory.length})
          </ButtonBase>
          <Collapse in={historyOpen} timeout={160} unmountOnExit>
            {supportHistory.length ? (
              <Stack component="ul" spacing={0.45} sx={{ m: 0, mt: 0.55, p: 0, listStyle: 'none' }}>
                {supportHistory.map((item) => <SupportHistoryItem key={item.id} item={item} />)}
              </Stack>
            ) : (
              <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 12.2 }}>No support updates yet.</Typography>
            )}
          </Collapse>
        </Box>
        <ProrenataCard picture={picture} />
      </Stack>
    </Paper>
  );
}

export default function MentorSupportView({ picture, onSupportUpdate, onTeachingInfoChange, setSnackbarMessage }) {
  return (
    <Stack spacing={1}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(240px, 0.62fr) minmax(0, 1.38fr)' }, gap: 1, alignItems: 'start' }}>
        <SupportSummaryView picture={picture} onSupportUpdate={onSupportUpdate} />
        <SharedTeachingInfoView picture={picture} onTeachingInfoChange={onTeachingInfoChange} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <MentorSupportActions picture={picture} setSnackbarMessage={setSnackbarMessage} />
      </Box>
    </Stack>
  );
}
