import { useState } from 'react';
import { Box, ButtonBase, Paper, Stack, TextField, Typography } from '@mui/material';
import { CheckInStatusIcon, checkInStatusOptions } from './mentorCheckInStatus.jsx';
import { border, darkText, formatDate, getLocalizedValue, getStatusMeta, purple, StatusDot, SubjectDetail, subjectIds } from './mentorModuleShared.jsx';

function getLatestCheckIn(checkIns = []) {
  return [...checkIns].sort((first, second) => (second.date || '').localeCompare(first.date || ''))[0] || null;
}

function SubjectCheckInComposer({ subjectId, subjectTitle, subjectCheckIns = [], onAddSubjectCheckIn }) {
  const [comment, setComment] = useState('');
  const latestSubjectCheckIn = getLatestCheckIn(subjectCheckIns);
  const hasComment = Boolean(comment.trim());

  function addSubjectCheckIn(status) {
    if (!hasComment) return;
    onAddSubjectCheckIn?.(subjectId, status, comment.trim());
    setComment('');
  }

  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={0.75}>
        <Box>
          <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 900 }}>Subject check-in</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12, lineHeight: 1.35 }}>
            Add a student note for {subjectTitle}.
          </Typography>
        </Box>
        {latestSubjectCheckIn && (
          <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: 'rgba(23, 21, 26, 0.025)', border: '1px solid rgba(23, 21, 26, 0.07)' }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CheckInStatusIcon status={latestSubjectCheckIn.status} size={16} />
              <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 800 }}>{formatDate(latestSubjectCheckIn.date)}</Typography>
            </Stack>
            {latestSubjectCheckIn.comment && (
              <Typography sx={{ mt: 0.35, color: darkText, fontSize: 12, fontWeight: 720, lineHeight: 1.35 }}>
                {latestSubjectCheckIn.comment}
              </Typography>
            )}
          </Box>
        )}
        <TextField
          label="Comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          multiline
          minRows={2}
          size="small"
          fullWidth
          required
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.45 }}>
          {Object.entries(checkInStatusOptions).map(([status, meta]) => (
            <ButtonBase
              key={status}
              type="button"
              disabled={!hasComment}
              onClick={() => addSubjectCheckIn(status)}
              sx={{
                height: 34,
                borderRadius: '8px',
                border: '1px solid rgba(23, 21, 26, 0.1)',
                bgcolor: '#fff',
                opacity: hasComment ? 1 : 0.46,
                '&:hover': { bgcolor: hasComment ? 'rgba(23, 21, 26, 0.035)' : '#fff' },
                '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
              }}
            >
              <Stack direction="row" spacing={0.4} alignItems="center">
                <CheckInStatusIcon status={status} size={17} />
                <Typography sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 900 }}>{meta.shortLabel}</Typography>
              </Stack>
            </ButtonBase>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function MentorSubjectsView({
  picture,
  subjectConfigs,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedSubjectConfig,
  selectedSubjectFacts,
  onAddSubjectCheckIn,
}) {
  const selectedSubjectTitle = getLocalizedValue(selectedSubjectConfig.subjectTitle);

  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={1}>
        <Box>
          <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Subjects</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1, lineHeight: 1.35 }}>
            Review subject status and capture student subject check-ins.
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(320px, 0.95fr) minmax(0, 1.05fr)' }, gap: 1, alignItems: 'start' }}>
          <Paper elevation={0} sx={{ p: 0.65, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff', overflow: 'hidden' }}>
            <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: 'minmax(130px, 1fr) 112px minmax(150px, 1.1fr)', gap: 0.65, px: 0.65, pb: 0.45 }}>
              {['Subject', 'Teacher status', 'Student status'].map((label) => (
                <Typography key={label} sx={{ color: 'text.secondary', fontSize: 11.3, fontWeight: 860 }}>
                  {label}
                </Typography>
              ))}
            </Box>
            <Stack spacing={0.25}>
              {subjectIds.map((subjectId) => {
                const config = subjectConfigs[subjectId];
                const status = picture.subjectStatuses[subjectId];
                const statusMeta = getStatusMeta(status);
                const latestSubjectCheckIn = getLatestCheckIn(picture.subjectCheckIns?.[subjectId] || []);
                const selected = selectedSubjectId === subjectId;
                return (
                  <ButtonBase
                    key={subjectId}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedSubjectId(subjectId)}
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'minmax(130px, 1fr) 112px minmax(150px, 1.1fr)' },
                      alignItems: 'center',
                      gap: { xs: 0.4, sm: 0.65 },
                      px: 0.65,
                      py: 0.62,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selected ? getStatusMeta(status).border : 'transparent',
                      bgcolor: selected ? getStatusMeta(status).bg : '#fff',
                      color: darkText,
                      textAlign: 'left',
                      '&:hover': { bgcolor: selected ? getStatusMeta(status).bg : 'rgba(23, 21, 26, 0.035)' },
                      '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                    }}
                  >
                    <Typography sx={{ color: darkText, fontSize: 12.5, fontWeight: 900, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getLocalizedValue(config.subjectTitle)}
                    </Typography>
                    <Stack direction="row" spacing={0.45} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' }, minWidth: 0 }}>
                      <StatusDot status={status} size={9} title={statusMeta.label} />
                      <Typography sx={{ color: 'text.secondary', fontSize: 11.4, fontWeight: 780 }}>{statusMeta.label}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.55} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' }, minWidth: 0 }}>
                      {latestSubjectCheckIn ? (
                        <>
                          <CheckInStatusIcon status={latestSubjectCheckIn.status} size={15} />
                          <Typography sx={{ color: 'text.secondary', fontSize: 11.4, fontWeight: 760, flexShrink: 0 }}>
                            {formatDate(latestSubjectCheckIn.date)}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: 11.4, fontWeight: 680, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {latestSubjectCheckIn.comment || 'Student subject update'}
                          </Typography>
                        </>
                      ) : (
                        <Typography sx={{ color: 'text.secondary', fontSize: 11.4, fontWeight: 680 }}>
                          No update
                        </Typography>
                      )}
                    </Stack>
                    <Box sx={{ display: { xs: 'grid', sm: 'none' }, gridTemplateColumns: '96px minmax(0, 1fr)', gap: 0.45, pt: 0.2 }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 10.8, fontWeight: 820 }}>Teacher</Typography>
                      <Stack direction="row" spacing={0.45} alignItems="center">
                        <StatusDot status={status} size={8} title={statusMeta.label} />
                        <Typography sx={{ color: 'text.secondary', fontSize: 11.2, fontWeight: 760 }}>{statusMeta.label}</Typography>
                      </Stack>
                      <Typography sx={{ color: 'text.secondary', fontSize: 10.8, fontWeight: 820 }}>Student</Typography>
                      <Stack direction="row" spacing={0.45} alignItems="center" sx={{ minWidth: 0 }}>
                        {latestSubjectCheckIn ? (
                          <>
                            <CheckInStatusIcon status={latestSubjectCheckIn.status} size={14} />
                            <Typography sx={{ color: 'text.secondary', fontSize: 11.2, fontWeight: 760, flexShrink: 0 }}>
                              {formatDate(latestSubjectCheckIn.date)}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: 11.2, fontWeight: 680, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {latestSubjectCheckIn.comment || 'Student subject update'}
                            </Typography>
                          </>
                        ) : (
                          <Typography sx={{ color: 'text.secondary', fontSize: 11.2, fontWeight: 680 }}>
                            No update
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </ButtonBase>
                );
              })}
            </Stack>
          </Paper>

          <Stack spacing={1}>
            <SubjectDetail
              subjectId={selectedSubjectId}
              config={selectedSubjectConfig}
              status={picture.subjectStatuses[selectedSubjectId]}
              facts={selectedSubjectFacts}
            />
            <SubjectCheckInComposer
              subjectId={selectedSubjectId}
              subjectTitle={selectedSubjectTitle}
              subjectCheckIns={picture.subjectCheckIns?.[selectedSubjectId] || []}
              onAddSubjectCheckIn={onAddSubjectCheckIn}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
