import { Stack, Typography } from '@mui/material';

const darkText = '#17151a';

export default function AssessmentViewTemplateV2() {
  return (
    <Stack spacing={1.4}>
      <Typography sx={{ color: darkText, fontSize: 15, lineHeight: 1.25, fontWeight: 880 }}>
        Assessment workspace V2
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 13.2, lineHeight: 1.45, maxWidth: 620 }}>
        Placeholder content for the second assessment page template.
      </Typography>
    </Stack>
  );
}
