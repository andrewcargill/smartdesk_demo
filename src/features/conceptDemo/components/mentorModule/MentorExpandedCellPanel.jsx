import { Box, Paper, Stack } from '@mui/material';
import MentorCheckInsView from './MentorCheckInsView.jsx';
import MentorFollowUpView, { NextFollowUpCard } from './MentorFollowUpView.jsx';
import MentorStudentOverviewView from './MentorStudentOverviewView.jsx';
import MentorSubjectsView from './MentorSubjectsView.jsx';
import MentorSupportView, { MentorSupportActions } from './MentorSupportView.jsx';
import MentorTimelineView from './MentorTimelineView.jsx';

export default function MentorExpandedCellPanel({
  student,
  picture,
  activeCell,
  subjectConfigs,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedSubjectConfig,
  selectedSubjectFacts,
  onSupportUpdate,
  onTeachingInfoChange,
  onAddCheckIn,
  onAddSubjectCheckIn,
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
          {showActions && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <MentorSupportActions picture={picture} setSnackbarMessage={setSnackbarMessage} />
            </Box>
          )}

          {activeCell === 'timeline' && (
            <MentorTimelineView
              student={student}
              picture={picture}
              subjectConfigs={subjectConfigs}
            />
          )}

          {activeCell === 'student' && (
            <MentorStudentOverviewView
              picture={picture}
              subjectConfigs={subjectConfigs}
              selectedSubjectId={selectedSubjectId}
              setSelectedSubjectId={setSelectedSubjectId}
              selectedSubjectConfig={selectedSubjectConfig}
              selectedSubjectFacts={selectedSubjectFacts}
              onSupportUpdate={onSupportUpdate}
              onTeachingInfoChange={onTeachingInfoChange}
              onAddCheckIn={onAddCheckIn}
              onAddSubjectCheckIn={onAddSubjectCheckIn}
            />
          )}

          {activeCell === 'support' && (
            <MentorSupportView picture={picture} onSupportUpdate={onSupportUpdate} onTeachingInfoChange={onTeachingInfoChange} />
          )}

          {activeCell === 'checkIns' && <MentorCheckInsView picture={picture} onAddCheckIn={onAddCheckIn} />}

          {activeCell === 'subjects' && (
            <MentorSubjectsView
              picture={picture}
              subjectConfigs={subjectConfigs}
              selectedSubjectId={selectedSubjectId}
              setSelectedSubjectId={setSelectedSubjectId}
              selectedSubjectConfig={selectedSubjectConfig}
              selectedSubjectFacts={selectedSubjectFacts}
              onAddSubjectCheckIn={onAddSubjectCheckIn}
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
