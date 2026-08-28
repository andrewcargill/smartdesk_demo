import { Box, Paper, Stack } from '@mui/material';
import MentorCheckInsView from './MentorCheckInsView.jsx';
import MentorFollowUpView, { NextFollowUpCard } from './MentorFollowUpView.jsx';
import MentorStudentOverviewView from './MentorStudentOverviewView.jsx';
import MentorSubjectsView from './MentorSubjectsView.jsx';
import MentorSupportView from './MentorSupportView.jsx';
import MentorTimelineHeatmapView from './MentorTimelineHeatmapView.jsx';

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

  return (
    <Box sx={{ px: { xs: 0, md: 1 }, py: { xs: 0.9, md: 1.05 }, borderTop: '1px solid rgba(156, 40, 175, 0.16)', bgcolor: 'rgba(156, 40, 175, 0.018)' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1, md: 1.2 },
          borderRadius: '10px',
          border: '1px solid rgba(23, 21, 26, 0.1)',
          bgcolor: '#fff',
          boxShadow: '0 8px 22px rgba(23, 21, 26, 0.045)',
        }}
      >
        <Stack spacing={1}>
          {activeCell === 'timeline' && (
            <MentorTimelineHeatmapView
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
              setSnackbarMessage={setSnackbarMessage}
            />
          )}

          {activeCell === 'support' && (
            <MentorSupportView
              picture={picture}
              onSupportUpdate={onSupportUpdate}
              onTeachingInfoChange={onTeachingInfoChange}
              setSnackbarMessage={setSnackbarMessage}
            />
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
