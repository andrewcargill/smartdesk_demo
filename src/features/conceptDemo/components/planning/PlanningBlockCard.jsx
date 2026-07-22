import { useState } from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const darkText = '#17151a';

const blockTypeLabels = {
  holiday: 'Holiday',
  teaching: 'Teaching',
  revisit: 'Revisit',
  assessment: 'Assessment',
  consolidation: 'Consolidation',
};

const statusLabels = {
  planned: 'Planned',
  current: 'Current',
  completed: 'Completed',
};

function formatPlanningDate(date) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function formatDateRange(block) {
  if (block.startDate && block.endDate && block.startDate !== block.endDate) {
    return `${formatPlanningDate(block.startDate)}-${formatPlanningDate(block.endDate)}`;
  }

  return formatPlanningDate(block.startDate || block.endDate) || 'Dates to be set';
}

export default function PlanningBlockCard({
  block,
  curriculumAreas,
  draggable = false,
  onDragStart,
  onEdit,
  onRename,
  onMove,
  onAdjustDuration,
  onDuplicate,
  onStatusChange,
  onDelete,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(block.title);
  const areaLabels = (block.curriculumAreaIds || [])
    .map((areaId) => curriculumAreas.find((area) => area.id === areaId)?.label || areaId)
    .filter(Boolean);
  const visibleAreaLabels = areaLabels.slice(0, 2);
  const hiddenAreaCount = Math.max(0, areaLabels.length - visibleAreaLabels.length);
  const adaptationCount = Array.isArray(block.groupAdaptations) ? block.groupAdaptations.length : 0;
  const menuOpen = Boolean(menuAnchor);

  function closeMenu() {
    setMenuAnchor(null);
  }

  function saveRename() {
    const trimmedTitle = draftTitle.trim();
    if (trimmedTitle && trimmedTitle !== block.title) {
      onRename(block, trimmedTitle);
    }
    setRenaming(false);
  }

  function runMenuAction(action) {
    closeMenu();
    action();
  }

  const isHoliday = block.blockType === 'holiday';

  return (
    <Paper
      elevation={0}
      component="article"
      draggable={draggable}
      onDragStart={(event) => onDragStart?.(event, block)}
      sx={{
        p: 1.45,
        borderRadius: '16px',
        border: isHoliday ? '1px solid rgba(23, 21, 26, 0.16)' : '1px solid rgba(23, 21, 26, 0.1)',
        bgcolor: isHoliday ? '#fbfafc' : '#fff',
        backgroundImage: isHoliday ? 'repeating-linear-gradient(135deg, transparent 0, transparent 7px, rgba(23, 21, 26, 0.05) 7px, rgba(23, 21, 26, 0.05) 10px)' : 'none',
        cursor: draggable ? 'grab' : 'default',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {renaming ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.7}>
                <TextField
                  label="Planning block title"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  size="small"
                  fullWidth
                  autoFocus
                />
                <Button onClick={saveRename} sx={{ color: darkText }}>Save</Button>
              </Stack>
            ) : (
              <Button
                onClick={() => {
                  setDraftTitle(block.title);
                  setRenaming(true);
                }}
                sx={{ color: darkText, p: 0, minWidth: 0, textAlign: 'left', justifyContent: 'flex-start', textTransform: 'none' }}
              >
                <Typography component="h4" sx={{ color: darkText, fontSize: 16.5, fontWeight: 860, lineHeight: 1.25 }}>
                  {block.title}
                </Typography>
              </Button>
            )}
            <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.8, fontWeight: 700 }}>
              {formatDateRange(block)}
            </Typography>
          </Box>
          <IconButton
            aria-label={`Planning actions for ${block.title}`}
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            sx={{ color: 'text.secondary', mt: -0.55, mr: -0.55 }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 760 }}>
          {blockTypeLabels[block.blockType] || block.blockType} · {statusLabels[block.status] || block.status}
        </Typography>

        {!!visibleAreaLabels.length && (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.6, lineHeight: 1.45 }}>
            {visibleAreaLabels.join(' · ')}{hiddenAreaCount ? ` · +${hiddenAreaCount} more` : ''}
          </Typography>
        )}
        {!!adaptationCount && (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.6, lineHeight: 1.45 }}>
            Focus adaptations · {adaptationCount}
          </Typography>
        )}
      </Stack>

      <Menu anchorEl={menuAnchor} open={menuOpen} onClose={closeMenu}>
        <MenuItem onClick={() => runMenuAction(() => onEdit(block))}>Edit</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onMove(block))}>Move to...</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onAdjustDuration(block))}>Adjust duration</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onDuplicate(block))}>Duplicate</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onStatusChange(block, 'planned'))}>Change status: Planned</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onStatusChange(block, 'current'))}>Change status: Current</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onStatusChange(block, 'completed'))}>Change status: Completed</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onDelete(block))}>Delete</MenuItem>
      </Menu>
    </Paper>
  );
}
