import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SendIcon from '@mui/icons-material/Send';
import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { border, darkText, formatDate, purple, StatusControl } from './mentorModuleShared.jsx';

export function MentorSupportActions({ picture, setSnackbarMessage }) {
  return (
    <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap justifyContent="flex-start">
      <Button size="small" startIcon={<FolderOpenIcon />} variant="outlined" onClick={() => setSnackbarMessage('Demo only - open the student Drive folder.')} sx={{ color: purple, borderColor: 'rgba(156, 40, 175, 0.24)', borderRadius: '8px', textTransform: 'none' }}>
        Open Drive folder
      </Button>
      <Button size="small" endIcon={<OpenInNewIcon />} variant="outlined" onClick={() => setSnackbarMessage('Demo only - open Prorenata for official records.')} sx={{ color: picture.prorenata ? purple : 'text.secondary', borderColor: 'rgba(23, 21, 26, 0.14)', borderRadius: '8px', textTransform: 'none' }}>
        Open Prorenata
      </Button>
    </Stack>
  );
}

export function ProrenataCard({ picture }) {
  return (
    <Box sx={{ p: 0.85, borderRadius: '8px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 780 }}>Prorenata</Typography>
      <Typography sx={{ mt: 0.45, color: picture.prorenata ? purple : 'text.secondary', fontSize: 12.6, fontWeight: 850, lineHeight: 1.25 }}>
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

function formatReviewDate(reviewDate) {
  return reviewDate ? `Review ${formatDate(reviewDate)}` : 'No review date';
}

export function SharedTeachingInfoView({ picture, onTeachingInfoChange }) {
  const [draftMessage, setDraftMessage] = useState('');
  const [draftReviewDate, setDraftReviewDate] = useState('');
  const { current, past } = useMemo(() => splitTeachingMessages(picture.teachingInfo), [picture.teachingInfo]);

  function createMessage() {
    const text = draftMessage.trim();
    if (!text || !onTeachingInfoChange) return;

    const nextMessage = {
      id: `teaching-info-${Date.now()}`,
      text,
      reviewDate: draftReviewDate,
      status: 'current',
    };
    const archivedMessages = (picture.teachingInfo || []).map((item) => ({ ...item, status: 'past' }));
    onTeachingInfoChange([nextMessage, ...archivedMessages]);
    setDraftMessage('');
  }

  function archiveCurrentMessage() {
    if (!current || !onTeachingInfoChange) return;

    onTeachingInfoChange((picture.teachingInfo || []).map((item) => (
      item.id === current.id ? { ...item, status: 'past' } : item
    )));
  }

  return (
    <Paper elevation={0} sx={{ p: 1.15, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={1}>
        <Box>
          <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Message to teachers</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1, lineHeight: 1.35 }}>
            Keep one calm current message visible. Older messages stay in the history below.
          </Typography>
        </Box>

        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(156, 40, 175, 0.035)', border: '1px solid rgba(156, 40, 175, 0.12)' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 820 }}>Current</Typography>
          {current ? (
            <Stack spacing={0.8} sx={{ mt: 0.45 }}>
              <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 850, lineHeight: 1.35 }}>{current.text}</Typography>
              <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
                <Typography sx={{ color: 'text.secondary', fontSize: 11.5 }}>{formatReviewDate(current.reviewDate)}</Typography>
                <Button size="small" startIcon={<DeleteOutlineIcon />} onClick={archiveCurrentMessage} sx={{ color: 'text.secondary', borderRadius: '8px', textTransform: 'none', fontWeight: 820 }}>
                  Remove current
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 12.4, lineHeight: 1.35 }}>No current message shared.</Typography>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 150px auto' }, gap: 0.75, alignItems: 'start' }}>
          <TextField
            label="New message"
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            multiline
            minRows={2}
            size="small"
          />
          <TextField
            label="Review"
            type="date"
            value={draftReviewDate}
            onChange={(event) => setDraftReviewDate(event.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" startIcon={<SendIcon />} onClick={createMessage} disabled={!draftMessage.trim()} sx={{ minHeight: 40, borderRadius: '8px', bgcolor: purple }}>
            Share
          </Button>
        </Box>

        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 820 }}>Past messages</Typography>
          {past.length ? (
            <Stack component="ul" spacing={0.45} sx={{ m: 0, mt: 0.55, p: 0, listStyle: 'none' }}>
              {past.map((item) => (
                <Box key={item.id} component="li" sx={{ p: 0.7, borderRadius: '8px', bgcolor: 'rgba(23, 21, 26, 0.018)', border: '1px solid rgba(23, 21, 26, 0.06)' }}>
                  <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 760, lineHeight: 1.3 }}>{item.text}</Typography>
                  <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 11.2 }}>{formatReviewDate(item.reviewDate)}</Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 12.2 }}>No past messages yet.</Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export function SupportSummaryView({ picture, onStatusChange }) {
  return (
    <Paper elevation={0} sx={{ p: 1.15, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={1}>
        <StatusControl label="Support status" value={picture.supportStatus} onChange={(status) => onStatusChange('supportStatus', status)} />
        <ProrenataCard picture={picture} />
      </Stack>
    </Paper>
  );
}

export default function MentorSupportView({ picture, onStatusChange, onTeachingInfoChange }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(240px, 0.62fr) minmax(0, 1.38fr)' }, gap: 1, alignItems: 'start' }}>
      <SupportSummaryView picture={picture} onStatusChange={onStatusChange} />
      <SharedTeachingInfoView picture={picture} onTeachingInfoChange={onTeachingInfoChange} />
    </Box>
  );
}
