import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import { border, darkText, getLocalizedValue, getStatusMeta, purple, StatusDot, SubjectDetail, subjectIds } from './mentorModuleShared.jsx';

export default function MentorSubjectsView({
  picture,
  subjectConfigs,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedSubjectConfig,
  selectedSubjectFacts,
}) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Subjects</Typography>
      <Stack direction="row" spacing={0.55} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
        {subjectIds.map((subjectId) => {
          const config = subjectConfigs[subjectId];
          const status = picture.subjectStatuses[subjectId];
          const selected = selectedSubjectId === subjectId;
          return (
            <ButtonBase
              key={subjectId}
              type="button"
              onClick={() => setSelectedSubjectId(subjectId)}
              sx={{
                px: 0.75,
                py: 0.55,
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selected ? getStatusMeta(status).border : 'rgba(23, 21, 26, 0.12)',
                bgcolor: selected ? getStatusMeta(status).bg : '#fff',
                color: selected ? getStatusMeta(status).color : darkText,
                '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
              }}
            >
              <Stack direction="row" spacing={0.45} alignItems="center">
                <StatusDot status={status} size={9} />
                <Typography sx={{ color: 'inherit', fontSize: 12.1, fontWeight: 850 }}>{getLocalizedValue(config.subjectTitle)}</Typography>
              </Stack>
            </ButtonBase>
          );
        })}
      </Stack>
      <Box sx={{ mt: 0.9 }}>
        <SubjectDetail
          subjectId={selectedSubjectId}
          config={selectedSubjectConfig}
          status={picture.subjectStatuses[selectedSubjectId]}
          facts={selectedSubjectFacts}
        />
      </Box>
    </Paper>
  );
}
