import { Box, Paper, Stack, Typography } from '@mui/material';
import { darkText } from './mentorModuleShared.jsx';
import MentorCheckInsView from './MentorCheckInsView.jsx';
import MentorFollowUpView, { NextFollowUpCard } from './MentorFollowUpView.jsx';
import MentorStudentOverviewView from './MentorStudentOverviewView.jsx';
import MentorSubjectsView from './MentorSubjectsView.jsx';
import MentorSupportView, { MentorSupportActions } from './MentorSupportView.jsx';

function getPanelTitle(activeCell) {
  if (activeCell === 'student') return 'Student overview';
  if (activeCell === 'support') return 'Support information';
  if (activeCell === 'checkIns') return 'Check-ins';
  if (activeCell === 'subjects') return 'Subject signals';
  return 'Follow-up';
}

export default function MentorExpandedCellPanel({
  student,
  picture,
  activeCell,
  subjectConfigs,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedSubjectConfig,
  selectedSubjectFacts,
  onStatusChange,
  onTeachingInfoChange,
  setSnackbarMessage,
}) {
  const nextFollowUp = picture.followUps.find((item) => !item.completed);
  const showActions = activeCell === 'student' || activeCell === 'support';

  return (
    <Box sx={{ px: { xs: 0, md: 1 }, pb: 1.1 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1, md: 1.2 },
          borderRadius: '8px',
          border: '1px solid rgba(156, 40, 175, 0.18)',
          bgcolor: 'rgba(156, 40, 175, 0.025)',
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.8} alignItems="baseline" justifyContent="space-between" flexWrap="wrap" useFlexGap>
            <Box>
              <Typography sx={{ color: darkText, fontSize: 16, fontWeight: 930 }}>
                {student.displayName}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 11.7, fontWeight: 760 }}>
                {getPanelTitle(activeCell)}
              </Typography>
            </Box>
            {showActions && <MentorSupportActions picture={picture} setSnackbarMessage={setSnackbarMessage} />}
          </Stack>

          {activeCell === 'student' && (
            <MentorStudentOverviewView
              picture={picture}
              subjectConfigs={subjectConfigs}
              selectedSubjectId={selectedSubjectId}
              setSelectedSubjectId={setSelectedSubjectId}
              selectedSubjectConfig={selectedSubjectConfig}
              selectedSubjectFacts={selectedSubjectFacts}
              onStatusChange={onStatusChange}
              onTeachingInfoChange={onTeachingInfoChange}
            />
          )}

          {activeCell === 'support' && (
            <MentorSupportView picture={picture} onStatusChange={onStatusChange} onTeachingInfoChange={onTeachingInfoChange} />
          )}

          {activeCell === 'checkIns' && <MentorCheckInsView picture={picture} />}

          {activeCell === 'subjects' && (
            <MentorSubjectsView
              picture={picture}
              subjectConfigs={subjectConfigs}
              selectedSubjectId={selectedSubjectId}
              setSelectedSubjectId={setSelectedSubjectId}
              selectedSubjectConfig={selectedSubjectConfig}
              selectedSubjectFacts={selectedSubjectFacts}
            />
          )}

          {activeCell === 'followUp' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.55fr) minmax(0, 1fr)' }, gap: 1, alignItems: 'start' }}>
              <NextFollowUpCard nextFollowUp={nextFollowUp} />
              <MentorFollowUpView picture={picture} />
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
