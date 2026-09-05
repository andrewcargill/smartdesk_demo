import { Box, Stack, Typography } from '@mui/material';
import mathsbookThumbnail from '../../../../media/mathsbook_thumb.png';
import { getMaterialChapter, mathsTeachingMaterial as material } from './teachingMaterialData.js';

export default function TeachingMaterial({ chapterId }) {
  const chapter = getMaterialChapter(chapterId);
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box component="img" src={mathsbookThumbnail} alt="Cover of Favorit matematik 8" sx={{ width: 48, height: 64, objectFit: 'contain', borderRadius: 1, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', mb: 0.25 }}>Teaching material · 8A maths</Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{material.title}</Typography>
        {chapter && <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.4 }}>{chapter.label} · {chapter.title}</Typography>}
        <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.4 }}>{material.chapterMapNote}</Typography>
      </Box>
    </Stack>
  );
}
