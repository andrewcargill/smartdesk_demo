import { useState } from 'react';
import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';

export default function MockupNavigation({ modules, onOpenSubjectClass, onOpenMentor, onOpenNotebook, onOpenWeek, weekLabel, spacious = false }) {
  const [subjectId, setSubjectId] = useState(null);
  const selected = modules.find(module => module.id === subjectId);
  function open(module) {
    if (module.id === 'mentor') onOpenMentor();
    else if (module.id === 'notebook') onOpenNotebook();
    else setSubjectId(current => current === module.id ? null : module.id);
  }
  return <Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: spacious ? 'repeat(auto-fit, minmax(130px, 1fr))' : 'repeat(auto-fit, minmax(82px, 1fr))', gap: spacious ? 3 : 1.25, p: 0.5 }}>
      {modules.map(module => <ButtonBase key={module.id} onClick={() => open(module)} aria-expanded={module.type === 'subject' ? subjectId === module.id : undefined} sx={{ width: '100%', maxWidth: spacious ? 168 : 104, aspectRatio: '1', justifySelf: 'center', borderRadius: '50%', border: '1px solid', borderColor: subjectId === module.id ? 'var(--sd-focus)' : 'divider', bgcolor: subjectId === module.id ? 'var(--sd-primary-soft)' : 'background.paper', p: 1, '&:hover': { bgcolor: 'var(--sd-primary-soft)' }, '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: 2 } }}>
        <Typography sx={{ fontSize: spacious ? 16 : 12, fontWeight: 600, overflowWrap: 'anywhere' }}>{module.label}</Typography>
      </ButtonBase>)}
    </Box>
    {selected?.classes?.length > 0 && <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
      {selected.classes.map(className => <Button key={className} size="small" variant="outlined" disabled={className !== '8A'} onClick={() => onOpenSubjectClass(selected.id, className)} aria-label={`${selected.label} ${className}`} sx={{ borderRadius: 6 }}>{className}</Button>)}
    </Stack>}
    <Box sx={{ textAlign: 'center', mt: 1 }}><Button size="small" color="inherit" onClick={onOpenWeek}>{weekLabel}</Button></Box>
  </Box>;
}
