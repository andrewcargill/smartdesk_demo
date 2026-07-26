import { useState } from 'react';
import { Box, Button, ButtonGroup, Paper, Stack, Typography } from '@mui/material';
import AssessmentViewTemplateV1 from './AssessmentViewTemplateV1.jsx';
import AssessmentViewTemplateV2 from './AssessmentViewTemplateV2.jsx';

const purple = '#9c28af';
const darkText = '#17151a';

export default function AssessmentView({ demoDate }) {
  const [assessmentViewVersion, setAssessmentViewVersion] = useState('v1');

  return (
    <Stack spacing={1.2}>
      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          width: '100%',
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" sx={{ color: darkText, fontSize: { xs: 20, sm: 23 }, lineHeight: 1.15, fontWeight: 880 }}>
            Assessment
          </Typography>
        </Box>
        <ButtonGroup
          variant="outlined"
          size="small"
          aria-label="Assessment view version"
          sx={{
            justifySelf: 'end',
            '& .MuiButtonGroup-grouped': {
              borderColor: 'rgba(23, 21, 26, 0.14)',
              color: darkText,
              fontSize: 12.4,
              fontWeight: 780,
              textTransform: 'none',
              '&:hover': { borderColor: purple, bgcolor: '#fff' },
              '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
            },
          }}
        >
          {['v1', 'v2'].map((version) => {
            const isSelected = assessmentViewVersion === version;

            return (
              <Button
                key={version}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setAssessmentViewVersion(version)}
                sx={{
                  bgcolor: isSelected ? purple : '#fff',
                  color: isSelected ? '#fff !important' : darkText,
                  borderColor: isSelected ? `${purple} !important` : undefined,
                  '&:hover': { bgcolor: isSelected ? purple : '#fff' },
                }}
              >
                {version.toUpperCase()}
              </Button>
            );
          })}
        </ButtonGroup>
      </Stack>

      <Paper
        component="main"
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.25 },
          borderRadius: '14px',
          border: '1px solid rgba(23, 21, 26, 0.1)',
          bgcolor: '#fff',
          minHeight: { xs: 320, sm: 420 },
        }}
      >
        {assessmentViewVersion === 'v2' ? <AssessmentViewTemplateV2 /> : <AssessmentViewTemplateV1 demoDate={demoDate} />}
      </Paper>
    </Stack>
  );
}
