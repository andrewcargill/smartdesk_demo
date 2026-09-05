import { useState } from 'react';
import { Box, Button, ButtonBase, IconButton, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import TeachingMaterial from '../TeachingMaterial.jsx';
import { getMaterialChapter, mathsTeachingMaterial } from '../teachingMaterialData.js';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { blocksForWeek, canMoveBlock, currentPlanningWeek, initialPlanningBlocks, movePlanningBlock, planningLanes, planningWeeks } from './planningData.js';

const small = { fontSize: 12, color: 'text.secondary' };

export default function PlanningOverview() {
  const [blocks, setBlocks] = useState(() => initialPlanningBlocks.map((block) => ({ ...block })));
  const [week, setWeek] = useState(currentPlanningWeek);
  const [view, setView] = useState('overview');
  const [selectedId, setSelectedId] = useState('algebra');
  const [notice, setNotice] = useState('');
  const [chapterFilter, setChapterFilter] = useState('all');
  const selected = blocks.find((block) => block.id === selectedId);
  const visibleWeeks = view === 'overview' ? planningWeeks.map((_, index) => index) : [week];
  const filteredBlocks = blocks.filter((block) => chapterFilter === 'all' || block.chapterId === chapterFilter);
  const weekBlocks = blocksForWeek(filteredBlocks, week);
  const columns = `112px repeat(${visibleWeeks.length}, minmax(110px, 1fr))`;

  function chooseWeek(nextWeek) {
    setWeek(nextWeek);
    setSelectedId(null);
    setNotice('');
  }

  function updateSelected(field, value) {
    setBlocks((current) => current.map((block) => block.id === selectedId ? { ...block, [field]: value } : block));
    setNotice('Updated in this mockup only.');
  }

  function moveSelected(direction) {
    if (!selected || !canMoveBlock(blocks, selected.id, direction)) return;
    setBlocks((current) => movePlanningBlock(current, selected.id, direction));
    setWeek(selected.start + direction);
    setNotice(`Moved to ${planningWeeks[selected.start + direction].toLowerCase()}.`);
  }

  return (
    <Box component="section" aria-labelledby="planning-title" sx={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', overflow: 'hidden' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box>
          <Typography id="planning-title" component="h2" sx={{ fontSize: 18, fontWeight: 550 }}>Planning · 8A maths</Typography>
          <Typography sx={{ ...small, fontSize: 10, mt: 0.3 }}>Six-week overview · mock plan</Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
          <ToggleButtonGroup exclusive size="small" value={view} onChange={(_, value) => value && setView(value)} aria-label="Planning view" sx={{ mr: 1, '& .MuiToggleButton-root': { px: 1.5, py: 0.4, fontSize: 11 } }}>
            <ToggleButton value="overview">Overview</ToggleButton><ToggleButton value="week">Week</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Previous week"><span><IconButton size="small" aria-label="Previous week" disabled={week === 0} onClick={() => chooseWeek(week - 1)}><ChevronLeftRoundedIcon /></IconButton></span></Tooltip>
          <Typography sx={{ ...small, minWidth: 46, textAlign: 'center' }}>{planningWeeks[week]}</Typography>
          <Tooltip title="Next week"><span><IconButton size="small" aria-label="Next week" disabled={week === planningWeeks.length - 1} onClick={() => chooseWeek(week + 1)}><ChevronRightRoundedIcon /></IconButton></span></Tooltip>
          <Button size="small" onClick={() => chooseWeek(currentPlanningWeek)}>Now</Button>
        </Stack>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px' }, alignContent: 'start' }}>
        <Box sx={{ minWidth: 0, p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ mb: 1.5 }}><TeachingMaterial /></Box>
          <Stack direction="row" spacing={0.75} role="group" aria-label="Filter planning by textbook chapter" sx={{ flexWrap: 'wrap', rowGap: 0.75, mb: 1.5 }}>
            {[{ id: 'all', label: 'All chapters' }, ...mathsTeachingMaterial.chapters].map((chapter) => (
              <Button key={chapter.id} size="small" variant={chapterFilter === chapter.id ? 'contained' : 'outlined'} aria-pressed={chapterFilter === chapter.id} onClick={() => { setChapterFilter(chapter.id); setSelectedId(null); setNotice(''); const first = blocks.find((block) => block.chapterId === chapter.id); if (first) setWeek(first.start); }} sx={{ fontSize: 10, borderRadius: 2 }}>{chapter.label}{chapter.title ? ` · ${chapter.title}` : ''}</Button>
            ))}
          </Stack>
          <Box role="region" aria-label="Interactive planning timeline" tabIndex={0} sx={{ overflowX: 'auto', pb: 1, '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: -2 } }}>
            <Box sx={{ minWidth: view === 'overview' ? 820 : 280 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: columns, mb: 1 }}>
                <Box />
                {visibleWeeks.map((index) => (
                  <ButtonBase key={index} onClick={() => chooseWeek(index)} aria-pressed={week === index} sx={{ flexDirection: 'column', py: 1, borderRadius: 2, color: week === index ? 'text.primary' : 'text.secondary', bgcolor: week === index ? 'var(--sd-primary-soft)' : 'transparent', '&:focus-visible': { outline: '2px solid var(--sd-focus)' } }}>
                    <Typography sx={{ fontSize: 12, fontWeight: week === index ? 700 : 500 }}>{planningWeeks[index]}</Typography>
                    <Typography sx={{ fontSize: 9, minHeight: 14, color: 'text.secondary' }}>{index === currentPlanningWeek ? 'NOW' : index < currentPlanningWeek ? 'Past' : 'Ahead'}</Typography>
                  </ButtonBase>
                ))}
              </Box>
              {planningLanes.map((lane) => (
                <Box key={lane} sx={{ display: 'grid', gridTemplateColumns: columns, gridTemplateRows: '100px', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, alignSelf: 'center', gridColumn: 1, gridRow: 1 }}>{lane}</Typography>
                  {visibleWeeks.map((index, column) => <Box key={index} aria-hidden="true" sx={{ gridColumn: column + 2, gridRow: 1, borderLeft: '1px solid', borderColor: 'divider', bgcolor: index === week ? 'rgba(var(--sd-primary-rgb), 0.035)' : 'transparent' }} />)}
                  {filteredBlocks.filter((block) => block.lane === lane && (view === 'overview' || weekBlocks.includes(block))).map((block) => (
                    <ButtonBase
                      key={block.id}
                      onClick={() => { setSelectedId(block.id); setWeek(view === 'week' ? week : block.start); setNotice(''); }}
                      aria-pressed={selectedId === block.id}
                      aria-label={`${block.title}, ${lane}, ${planningWeeks[block.start]}${block.duration > 1 ? ` to ${planningWeeks[block.start + block.duration - 1]}` : ''}, ${block.status}`}
                      sx={{ gridColumn: view === 'week' ? 2 : `${block.start + 2} / span ${block.duration}`, gridRow: 1, zIndex: 1, alignSelf: 'center', height: 72, m: 0.5, px: 1.2, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'left', borderRadius: 2, border: '1px solid', borderColor: selectedId === block.id ? 'var(--sd-focus)' : 'divider', bgcolor: selectedId === block.id ? 'var(--sd-primary-soft)' : 'background.paper', '&:hover': { borderColor: 'var(--sd-focus)' }, '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: 1 } }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}>{block.title || 'Untitled activity'}</Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.5 }}>{getMaterialChapter(block.chapterId)?.label} · {block.status}</Typography>
                    </ButtonBase>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
          <Typography sx={{ ...small, mt: 1.5 }}>Select a week for an overview, or an activity to shape the plan.</Typography>
        </Box>

        <Box component="aside" aria-label="Planning details" sx={{ p: 2.5, borderLeft: { lg: '1px solid' }, borderTop: { xs: '1px solid', lg: 'none' }, borderColor: 'divider', bgcolor: 'var(--sd-surface-muted)' }}>
          {selected ? (
            <Stack spacing={2}>
              <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600 }}>Activity details</Typography>
              <TextField select label="Textbook chapter (mock)" size="small" value={selected.chapterId} onChange={(event) => { updateSelected('chapterId', event.target.value); setChapterFilter('all'); }} fullWidth>
                {mathsTeachingMaterial.chapters.map((chapter) => <MenuItem key={chapter.id} value={chapter.id}>{chapter.label} · {chapter.title}</MenuItem>)}
              </TextField>
              <Typography sx={small}>{getMaterialChapter(selected.chapterId)?.practice}</Typography>
              <TextField label="Activity" size="small" value={selected.title} onChange={(event) => updateSelected('title', event.target.value)} inputProps={{ maxLength: 80 }} fullWidth />
              <TextField select label="Status" size="small" value={selected.status} onChange={(event) => updateSelected('status', event.target.value)} fullWidth>
                {['Planned', 'In progress', 'Complete'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
              </TextField>
              <TextField label="Learning focus" multiline minRows={3} maxRows={5} value={selected.notes} onChange={(event) => updateSelected('notes', event.target.value)} inputProps={{ maxLength: 500 }} size="small" fullWidth />
              <Box>
                <Typography sx={{ ...small, mb: 0.75 }}>{planningWeeks[selected.start]} · {selected.duration} {selected.duration === 1 ? 'week' : 'weeks'}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" disabled={!canMoveBlock(blocks, selected.id, -1)} onClick={() => moveSelected(-1)}>Earlier</Button>
                  <Button size="small" variant="outlined" disabled={!canMoveBlock(blocks, selected.id, 1)} onClick={() => moveSelected(1)}>Later</Button>
                </Stack>
                <Typography sx={{ ...small, fontSize: 10, mt: 0.75 }}>Moves stay within the timeline and avoid overlaps.</Typography>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600 }}>{planningWeeks[week]} at a glance</Typography>
              <Typography sx={small}>{weekBlocks.length} planned activities</Typography>
              {weekBlocks.map((block) => <Button key={block.id} onClick={() => setSelectedId(block.id)} sx={{ justifyContent: 'flex-start', textAlign: 'left' }}>{block.title || 'Untitled activity'}</Button>)}
              {!weekBlocks.length && <Typography sx={small}>A little room to plan.</Typography>}
            </Stack>
          )}
          <Typography role="status" sx={{ ...small, fontSize: 10, minHeight: 16, mt: 2 }}>{notice || 'Edits stay in this preview and reset when you leave it.'}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
