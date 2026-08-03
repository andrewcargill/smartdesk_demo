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
import { useConceptDemoLanguage } from '../../../ConceptDemoLanguageContext.jsx';

const darkText = '#17151a';

function getPlanningLocale(language) {
  return language === 'sv' ? 'sv-SE' : 'en-GB';
}

function formatPlanningDate(date, language) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(getPlanningLocale(language), { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function formatDateRange(block, language, t) {
  if (block.startDate && block.endDate && block.startDate !== block.endDate) {
    return `${formatPlanningDate(block.startDate, language)}-${formatPlanningDate(block.endDate, language)}`;
  }

  return formatPlanningDate(block.startDate || block.endDate, language) || t('learningModule.planView.card.datesToBeSet');
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
  const { language, t } = useConceptDemoLanguage();
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
  const blockTypeLabel = t(`learningModule.planView.blockTypes.${block.blockType}`) || block.blockType;
  const statusLabel = t(`learningModule.planView.statuses.${block.status}`) || block.status;

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
                  label={t('learningModule.planView.card.titleLabel')}
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  size="small"
                  fullWidth
                  autoFocus
                />
                <Button onClick={saveRename} sx={{ color: darkText }}>{t('learningModule.planView.card.save')}</Button>
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
              {formatDateRange(block, language, t)}
            </Typography>
          </Box>
          <IconButton
            aria-label={t('learningModule.planView.card.planningActions', { title: block.title })}
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            sx={{ color: 'text.secondary', mt: -0.55, mr: -0.55 }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 760 }}>
          {blockTypeLabel} · {statusLabel}
        </Typography>

        {!!visibleAreaLabels.length && (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.6, lineHeight: 1.45 }}>
            {visibleAreaLabels.join(' · ')}{hiddenAreaCount ? ` · ${t('learningModule.planView.card.moreAreas', { count: hiddenAreaCount })}` : ''}
          </Typography>
        )}
        {!!adaptationCount && (
          <Typography sx={{ color: 'text.secondary', fontSize: 12.6, lineHeight: 1.45 }}>
            {t('learningModule.planView.card.focusAdaptations', { count: adaptationCount })}
          </Typography>
        )}
      </Stack>

      <Menu anchorEl={menuAnchor} open={menuOpen} onClose={closeMenu}>
        <MenuItem onClick={() => runMenuAction(() => onEdit(block))}>{t('learningModule.planView.menu.edit')}</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onMove(block))}>{t('learningModule.planView.menu.moveTo')}</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onAdjustDuration(block))}>{t('learningModule.planView.menu.adjustDuration')}</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onDuplicate(block))}>{t('learningModule.planView.menu.duplicate')}</MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onStatusChange(block, 'planned'))}>
          {t('learningModule.planView.menu.changeStatus', { status: t('learningModule.planView.statuses.planned') })}
        </MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onStatusChange(block, 'current'))}>
          {t('learningModule.planView.menu.changeStatus', { status: t('learningModule.planView.statuses.current') })}
        </MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onStatusChange(block, 'completed'))}>
          {t('learningModule.planView.menu.changeStatus', { status: t('learningModule.planView.statuses.completed') })}
        </MenuItem>
        <MenuItem onClick={() => runMenuAction(() => onDelete(block))}>{t('learningModule.planView.menu.delete')}</MenuItem>
      </Menu>
    </Paper>
  );
}
