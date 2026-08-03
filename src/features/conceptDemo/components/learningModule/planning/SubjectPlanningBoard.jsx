import { useEffect, useMemo, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Tooltip from '@mui/material/Tooltip';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  filterTeachingUnits,
  filterPlanningTemplates,
  getBlockWeekSpan,
  getBlockTermWeekSpan,
  getBlocksForMonth,
  getMonthSpansForWeeks,
  getRepresentedAbilityIds,
  getRepresentedCurriculumAreaIds,
  getTermDateRange,
  getTeachingUnitUsageCount,
  getTemplateUsageCount,
  getWeekRangeForMonth,
  getWeekRangeForDateRange,
  moveBlockToPeriod,
  moveBlockToWeek,
} from '../../../utils/subjectPlanningUtils.js';
import { useConceptDemoLanguage } from '../../../ConceptDemoLanguageContext.jsx';
import PlanningBlockCard from './PlanningBlockCard.jsx';
import PlanningBlockDialog from './PlanningBlockDialog.jsx';

const darkText = '#17151a';
const purple = '#9c28af';

const fallbackBlockTypeLabels = {
  holiday: 'Holiday',
  teaching: 'Teaching',
  revisit: 'Revisit',
  assessment: 'Assessment',
  consolidation: 'Consolidation',
};

const fallbackStatusLabels = {
  planned: 'Planned',
  current: 'Current',
  completed: 'Completed',
};

const quickAddTemplateIds = new Set(['blank-block', 'revision-consolidation', 'assessment-point', 'problem-solving-reasoning']);

function sortPeriods(periods) {
  return [...(periods || [])].sort((first, second) => (first.order || 0) - (second.order || 0));
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getPlanningLocale(language) {
  return language === 'sv' ? 'sv-SE' : 'en-GB';
}

function getMonthLabel(year, month, language = 'en') {
  return new Intl.DateTimeFormat(getPlanningLocale(language), { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1, 12));
}

function getCompactDateLabel(date, language = 'en') {
  return new Intl.DateTimeFormat(getPlanningLocale(language), { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function sortReferenceItems(items) {
  return [...(items || [])].sort((first, second) => (first.order || 0) - (second.order || 0) || first.label.localeCompare(second.label));
}

function getCurriculumReferenceSections(curriculumAreas, abilities, typeLabels, fallbackTypeLabels = {}) {
  return [
    {
      id: 'content',
      label: typeLabels?.content || fallbackTypeLabels.content || 'Content',
      areas: sortReferenceItems(curriculumAreas),
    },
    {
      id: 'ability',
      label: typeLabels?.ability || fallbackTypeLabels.ability || 'Abilities',
      areas: sortReferenceItems(abilities),
    },
  ].filter((section) => section.areas.length);
}

function createTemplateFromTeachingUnit(unit) {
  return {
    ...unit,
    id: unit.id,
    teachingUnitId: unit.id,
    sourceTemplateId: unit.id,
    templateId: '',
    abilityIds: unit.defaultAbilityIds || unit.abilityIds || [],
    blockType: unit.blockType || 'teaching',
  };
}

function getTemplateContentSummary(template, curriculumAreas) {
  const linkedAreaIds = new Set(template?.curriculumAreaIds || []);
  const contentLabels = (curriculumAreas || [])
    .filter((area) => linkedAreaIds.has(area.id))
    .map((area) => area.label);

  return contentLabels.join(', ');
}

function getTemplateInPlanLabel(template, planningBlocks, t) {
  const usageCount = template.teachingUnitId
    ? getTeachingUnitUsageCount({ teachingUnitId: template.teachingUnitId, planningBlocks })
    : getTemplateUsageCount({ template, planningBlocks });
  if (!usageCount) {
    return '';
  }

  return usageCount > 1
    ? t('learningModule.planView.inPlanWithBlocks', { count: usageCount })
    : t('learningModule.planView.inPlan');
}

function getTemplateAriaLabel(template, inPlanLabel, t) {
  return inPlanLabel
    ? t('learningModule.planView.addTemplateInPlanAria', { title: template.title, inPlanLabel })
    : t('learningModule.planView.addTemplateAria', { title: template.title });
}

function isActivationKey(event) {
  return event.key === 'Enter' || event.key === ' ';
}

function getPeriodForDate(periods, date) {
  return periods.find((period) => period.startDate <= date && period.endDate >= date) || periods[0];
}

function createBlockFromTemplatePayload({ template, period, weekStart, blockType }) {
  const resolvedBlockType = template.blockType === 'holiday' ? 'holiday' : (blockType || template.blockType || 'teaching');
  const baseDate = weekStart || period?.startDate || toIso(new Date());
  const startDate = baseDate;
  const durationDays = typeof template.durationDays === 'number'
    ? template.durationDays
    : resolvedBlockType === 'assessment'
      ? 0
      : resolvedBlockType === 'holiday'
        ? 6
        : 13;
  const endDate = toIso(addDays(new Date(`${baseDate}T12:00:00`), durationDays));

  return {
    title: template.title,
    description: template.description || '',
    teachingUnitId: template.teachingUnitId || '',
    sourceTemplateId: template.sourceTemplateId || template.id || '',
    templateId: template.templateId || '',
    periodId: period?.id || '',
    startDate,
    endDate,
    status: 'planned',
    curriculumAreaIds: template.curriculumAreaIds || [],
    evidenceTopicIds: template.evidenceTopicIds || [],
    abilityIds: template.abilityIds || template.defaultAbilityIds || [],
    blockType: resolvedBlockType,
    assessmentAnchor: null,
    quickCaptureOptions: template.quickCaptureOptions || [],
    groupAdaptations: [],
    notes: null,
  };
}

function getBlockDurationDays(block) {
  if (!block.startDate && !block.endDate) {
    return 6;
  }

  const start = new Date(`${block.startDate || block.endDate}T12:00:00`);
  const end = new Date(`${block.endDate || block.startDate}T12:00:00`);
  return Math.max(0, Math.round((end - start) / 86400000));
}

function getPeriodForWeek(periods, weekStart) {
  return periods.find((period) => period.startDate <= weekStart && period.endDate >= weekStart) || periods[0];
}

function getInitialMonthIndex(periods, referenceDate) {
  const index = periods.findIndex((period) => period.startDate <= referenceDate && period.endDate >= referenceDate);
  return index === -1 ? 0 : index;
}

function getCurrentTermMarker(weeks, referenceDate, language = 'en') {
  if (!referenceDate) {
    return null;
  }

  const weekIndex = weeks.findIndex((week) => week.startDate <= referenceDate && week.endDate >= referenceDate);
  if (weekIndex === -1) {
    return null;
  }

  const week = weeks[weekIndex];
  const start = new Date(`${week.startDate}T12:00:00`);
  const current = new Date(`${referenceDate}T12:00:00`);
  const dayOffset = Math.max(0, Math.min(6, Math.round((current - start) / 86400000)));

  return {
    weekIndex,
    leftPercent: (dayOffset / 6) * 100,
    label: getCompactDateLabel(referenceDate, language),
  };
}

function createLaneRows(blocksForLane, weeks) {
  const rows = [];

  blocksForLane.forEach((block) => {
    const span = getBlockTermWeekSpan(block, weeks);
    if (!span) {
      return;
    }

    const endIndex = span.startIndex + span.span - 1;
    const rowIndex = rows.findIndex((row) => row.every((placed) => endIndex < placed.startIndex || span.startIndex > placed.endIndex));
    const placement = { block, startIndex: span.startIndex, endIndex, span };

    if (rowIndex === -1) {
      rows.push([placement]);
    } else {
      rows[rowIndex].push(placement);
    }
  });

  return rows;
}

function TermTimelineBlock({
  block,
  span,
  timelineSpan,
  onDragStart,
  onDragEnd,
  onResizeDrop,
  onEdit,
  onMove,
  onAdjustDuration,
  onDuplicate,
  onStatusChange,
  onDelete,
  onResizeStart,
}) {
  const { t } = useConceptDemoLanguage();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const adaptationCount = Array.isArray(block.groupAdaptations) ? block.groupAdaptations.length : 0;
  const isHoliday = block.blockType === 'holiday';
  const blockTypeLabel = t(`learningModule.planView.blockTypes.${block.blockType}`) || fallbackBlockTypeLabels[block.blockType] || block.blockType;
  const statusLabel = t(`learningModule.planView.statuses.${block.status}`) || fallbackStatusLabels[block.status] || block.status;

  function closeMenu() {
    setMenuAnchor(null);
  }

  function runMenuAction(action) {
    closeMenu();
    action();
  }

  return (
    <Paper
      elevation={0}
      draggable
      onDragStart={(event) => onDragStart(event, block)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onResizeDrop(event, block, timelineSpan)}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onEdit(block);
      }}
      aria-label={`${block.title}, ${blockTypeLabel}, ${statusLabel}`}
      sx={{
        gridColumn: `${span.startIndex + 1} / span ${span.span}`,
        p: 0.9,
        minHeight: 58,
        borderRadius: '12px',
        border: isHoliday ? '1px solid rgba(23, 21, 26, 0.16)' : '1px solid rgba(23, 21, 26, 0.12)',
        bgcolor: isHoliday ? '#fbfafc' : '#fff',
        backgroundImage: isHoliday ? 'repeating-linear-gradient(135deg, transparent 0, transparent 7px, rgba(23, 21, 26, 0.05) 7px, rgba(23, 21, 26, 0.05) 10px)' : 'none',
        cursor: 'grab',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        draggable
        onDragStart={(event) => {
          event.stopPropagation();
          onResizeStart(event, block, 'start');
        }}
        role="button"
        aria-label={t('learningModule.planView.durationDialog.startDate')}
        tabIndex={0}
        onDragEnd={onDragEnd}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 10,
          cursor: 'ew-resize',
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 3,
            top: 14,
            bottom: 14,
            width: 2,
            borderRadius: 999,
            bgcolor: 'rgba(23, 21, 26, 0.18)',
          },
          '&:hover': { bgcolor: 'rgba(156, 40, 175, 0.12)' },
          '&:focus-visible': { outline: '2px solid rgba(156, 40, 175, 0.38)', outlineOffset: 1 },
        }}
      />
      <Box
        draggable
        onDragStart={(event) => {
          event.stopPropagation();
          onResizeStart(event, block, 'end');
        }}
        role="button"
        aria-label={t('learningModule.planView.durationDialog.endDate')}
        tabIndex={0}
        onDragEnd={onDragEnd}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 10,
          cursor: 'ew-resize',
          borderTopRightRadius: '12px',
          borderBottomRightRadius: '12px',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: 3,
            top: 14,
            bottom: 14,
            width: 2,
            borderRadius: 999,
            bgcolor: 'rgba(23, 21, 26, 0.18)',
          },
          '&:hover': { bgcolor: 'rgba(156, 40, 175, 0.12)' },
          '&:focus-visible': { outline: '2px solid rgba(156, 40, 175, 0.38)', outlineOffset: 1 },
        }}
      />
      <Stack spacing={0.35}>
        <Stack direction="row" spacing={0.7} alignItems="flex-start" justifyContent="space-between">
          <Tooltip title={block.title}>
            <Typography noWrap sx={{ color: darkText, fontSize: 13.2, fontWeight: 850, minWidth: 0 }}>
              {block.title}
            </Typography>
          </Tooltip>
          <IconButton
            aria-label={t('learningModule.planView.card.planningActions', { title: block.title })}
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            onDoubleClick={(event) => event.stopPropagation()}
            sx={{ color: 'text.secondary', mt: -0.6, mr: -0.6, p: 0.35 }}
          >
            <MoreHorizIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Stack>
        <Typography noWrap sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 700 }}>
          {statusLabel}{adaptationCount ? ` · ${t('learningModule.planView.card.focusAdaptations', { count: adaptationCount })}` : ''}
        </Typography>
      </Stack>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
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

function CurriculumReferencePanel({
  sections,
  representedCurriculumAreaIds,
  representedAbilityIds,
  sx,
}) {
  const { t } = useConceptDemoLanguage();

  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.09)', bgcolor: '#fbfafc', width: { xs: '100%', lg: 560, xl: 640 }, maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', ...sx }}>
      <Stack spacing={0.75} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography sx={{ color: darkText, fontSize: 12.5, fontWeight: 860 }}>{t('learningModule.planView.curriculumReference')}</Typography>
        </Stack>
        {sections.map((section) => {
          const representedIds = section.id === 'ability' ? representedAbilityIds : representedCurriculumAreaIds;
          const representedSectionCount = section.areas.filter((area) => representedIds.has(area.id)).length;
          return (
            <Box key={section.id}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 0.4 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 10.8, fontWeight: 820, textTransform: 'uppercase' }}>
                  {section.label}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 10.8, fontWeight: 760 }}>
                  {t('learningModule.planView.representedCount', { represented: representedSectionCount, total: section.areas.length })}
                </Typography>
              </Stack>
            <Stack direction="row" spacing={0.45} flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
              {section.areas.map((area) => {
                const isRepresented = representedIds.has(area.id);
                return (
                  <Tooltip key={area.id} title={isRepresented ? t('learningModule.planView.representedTooltip', { label: area.label }) : t('learningModule.planView.notRepresentedTooltip', { label: area.label })}>
                    <Box
                      aria-label={isRepresented ? t('learningModule.planView.representedAria', { label: area.label }) : t('learningModule.planView.notRepresentedAria', { label: area.label })}
                      sx={{
                        px: 0.7,
                        py: 0.35,
                        maxWidth: '100%',
                        minWidth: 0,
                        flex: '0 1 auto',
                        borderRadius: '8px',
                        border: isRepresented ? '1px solid rgba(156, 40, 175, 0.36)' : '1px solid rgba(23, 21, 26, 0.12)',
                        bgcolor: isRepresented ? 'rgba(156, 40, 175, 0.1)' : '#fff',
                        backgroundImage: isRepresented ? 'none' : 'repeating-linear-gradient(135deg, transparent 0, transparent 5px, rgba(23, 21, 26, 0.045) 5px, rgba(23, 21, 26, 0.045) 7px)',
                      }}
                    >
                      <Typography noWrap sx={{ color: isRepresented ? purple : 'text.secondary', fontSize: 11.2, fontWeight: isRepresented ? 850 : 720, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {area.label}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default function SubjectPlanningBoard({
  periods,
  blocks,
  curriculumAreas,
  abilities = [],
  curriculumAreaTypeLabels,
  templates = [],
  teachingUnits = [],
  planningTools = [],
  referenceDate,
  workingGroups = [],
  groupDefinitions = [],
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onResetPlanning,
  onResetCurriculumNotes,
}) {
  const { language, t } = useConceptDemoLanguage();
  const [view, setView] = useState('term');
  const [dialogMode, setDialogMode] = useState('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryPlacement, setLibraryPlacement] = useState(null);
  const [curriculumCheckOpen, setCurriculumCheckOpen] = useState(false);
  const [libraryContentFilter, setLibraryContentFilter] = useState('');
  const [libraryAbilityFilters, setLibraryAbilityFilters] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [deleteBlock, setDeleteBlock] = useState(null);
  const [moveBlock, setMoveBlock] = useState(null);
  const [durationBlock, setDurationBlock] = useState(null);
  const [durationDraft, setDurationDraft] = useState({ startDate: '', endDate: '' });
  const [draggedBlockId, setDraggedBlockId] = useState('');
  const [resizeDrag, setResizeDrag] = useState(null);
  const termScrollRef = useRef(null);
  const sortedPeriods = useMemo(() => sortPeriods(periods), [periods]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => getInitialMonthIndex(sortPeriods(periods), referenceDate));
  const selectedPeriod = sortedPeriods[selectedMonthIndex] || sortedPeriods[0];
  const selectedMonthDate = selectedPeriod ? new Date(`${selectedPeriod.startDate}T12:00:00`) : new Date();
  const selectedYear = selectedMonthDate.getFullYear();
  const selectedMonth = selectedMonthDate.getMonth() + 1;
  const weeks = useMemo(() => getWeekRangeForMonth(selectedYear, selectedMonth), [selectedMonth, selectedYear]);
  const termRange = useMemo(() => getTermDateRange(sortedPeriods), [sortedPeriods]);
  const termWeeks = useMemo(
    () => (termRange.startDate && termRange.endDate ? getWeekRangeForDateRange(termRange.startDate, termRange.endDate) : []),
    [termRange],
  );
  const termMonthSpans = useMemo(() => getMonthSpansForWeeks(termWeeks), [termWeeks]);
  const currentTermMarker = useMemo(() => getCurrentTermMarker(termWeeks, referenceDate, language), [language, referenceDate, termWeeks]);
  const representedCurriculumAreaIds = useMemo(
    () => getRepresentedCurriculumAreaIds({ planningBlocks: blocks, curriculumAreas }),
    [blocks, curriculumAreas],
  );
  const representedAbilityIds = useMemo(
    () => getRepresentedAbilityIds({ planningBlocks: blocks, abilities }),
    [abilities, blocks],
  );
  const curriculumReferenceSections = useMemo(
    () => getCurriculumReferenceSections(curriculumAreas, abilities, curriculumAreaTypeLabels, {
      content: t('learningModule.planView.content'),
      ability: t('learningModule.planView.abilities'),
    }),
    [abilities, curriculumAreas, curriculumAreaTypeLabels, t],
  );
  const contentFilterAreas = useMemo(
    () => sortReferenceItems(curriculumAreas),
    [curriculumAreas],
  );
  const abilityFilterAreas = useMemo(
    () => sortReferenceItems(abilities),
    [abilities],
  );
  const quickAddTemplates = useMemo(
    () => (planningTools.length ? planningTools : templates.filter((template) => quickAddTemplateIds.has(template.id))),
    [planningTools, templates],
  );
  const teachingTemplates = useMemo(
    () => (teachingUnits.length
      ? teachingUnits.map(createTemplateFromTeachingUnit)
      : templates.filter((template) => !quickAddTemplateIds.has(template.id))),
    [teachingUnits, templates],
  );
  const matchingTemplates = useMemo(
    () => {
      if (teachingUnits.length) {
        return filterTeachingUnits({
          teachingUnits,
          selectedCurriculumAreaId: libraryContentFilter,
          selectedAbilityIds: libraryAbilityFilters,
        }).map(createTemplateFromTeachingUnit);
      }

      return filterPlanningTemplates({
        templates: teachingTemplates,
        contentAreaId: libraryContentFilter,
        abilityIds: libraryAbilityFilters,
        curriculumAreas,
      });
    },
    [curriculumAreas, libraryAbilityFilters, libraryContentFilter, teachingTemplates, teachingUnits],
  );
  const representedContentCount = representedCurriculumAreaIds.size;
  const representedAbilityCount = representedAbilityIds.size;
  const blockTypeOrder = ['holiday', 'teaching', 'revisit', 'assessment', 'consolidation'];
  const blockTypeLabels = useMemo(() => Object.fromEntries(blockTypeOrder.map((blockType) => [
    blockType,
    t(`learningModule.planView.blockTypes.${blockType}`) || fallbackBlockTypeLabels[blockType],
  ])), [t]);
  const quickAddDescriptions = useMemo(() => Object.fromEntries([...quickAddTemplateIds].map((templateId) => [
    templateId,
    t(`learningModule.planView.quickAddDescriptions.${templateId}`),
  ])), [t]);
  const unscheduledBlocks = blocks.filter((block) => !block.startDate && !block.endDate);

  useEffect(() => {
    if (view !== 'term' || !currentTermMarker) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const container = termScrollRef.current;
      const marker = container?.querySelector('[data-demo-date-marker="true"]');
      if (!container || !marker) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      const markerCenter = markerRect.left - containerRect.left + container.scrollLeft + markerRect.width / 2;
      const nextLeft = Math.max(0, markerCenter - container.clientWidth * 0.45);
      container.scrollTo({ left: nextLeft, behavior: 'auto' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentTermMarker, view]);

  useEffect(() => {
    if (libraryOpen) {
      setLibraryContentFilter('');
      setLibraryAbilityFilters([]);
    }
  }, [libraryOpen]);

  function openEditDialog(block) {
    setDialogMode('edit');
    setSelectedBlock(block);
    setDialogOpen(true);
  }

  function updateBlock(block, updates) {
    onUpdateBlock(block.id, updates);
  }

  function moveToPeriod(block, period) {
    const moved = moveBlockToPeriod(block, period);
    onUpdateBlock(block.id, {
      periodId: moved.periodId,
      startDate: moved.startDate,
      endDate: moved.endDate,
    });
  }

  function moveToWeek(block, weekStart) {
    const moved = moveBlockToWeek(block, weekStart);
    const period = getPeriodForDate(sortedPeriods, moved.startDate);
    onUpdateBlock(block.id, {
      periodId: period.id,
      startDate: moved.startDate,
      endDate: moved.endDate,
    });
  }

  function moveToTermWeek(block, weekStart, blockType = block.blockType) {
    const start = new Date(`${weekStart}T12:00:00`);
    const end = addDays(start, getBlockDurationDays(block));
    const period = getPeriodForWeek(sortedPeriods, weekStart);
    onUpdateBlock(block.id, {
      periodId: period.id,
      startDate: toIso(start),
      endDate: toIso(end),
      blockType,
    });
  }

  function handleDragStart(event, block) {
    setDraggedBlockId(block.id);
    setResizeDrag(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', block.id);
  }

  function handleResizeStart(event, block, edge) {
    setDraggedBlockId(block.id);
    setResizeDrag({ blockId: block.id, edge });
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', block.id);
    event.dataTransfer.setData('application/x-smartdesk-resize-edge', edge);
  }

  function handleDragEnd() {
    setDraggedBlockId('');
    setResizeDrag(null);
  }

  function handleWeekDrop(event, week) {
    event.preventDefault();
    const blockId = event.dataTransfer.getData('text/plain') || draggedBlockId;
    const block = blocks.find((item) => item.id === blockId);
    if (block) {
      moveToWeek(block, week.startDate);
    }
    setDraggedBlockId('');
    setResizeDrag(null);
  }

  function handleTermWeekDrop(event, week, blockType) {
    event.preventDefault();
    const blockId = event.dataTransfer.getData('text/plain') || draggedBlockId;
    const block = blocks.find((item) => item.id === blockId);
    if (block) {
      const fallbackResizeEdge = resizeDrag?.blockId === block.id ? resizeDrag.edge : '';
      const resizeEdge = event.dataTransfer.getData('application/x-smartdesk-resize-edge') || fallbackResizeEdge;
      if (resizeEdge === 'start') {
        const nextStartDate = week.startDate;
        const currentEndDate = block.endDate || block.startDate || nextStartDate;
        const nextEndDate = nextStartDate > currentEndDate ? nextStartDate : currentEndDate;
        const period = getPeriodForWeek(sortedPeriods, nextStartDate);
        onUpdateBlock(block.id, {
          periodId: period.id,
          startDate: nextStartDate,
          endDate: nextEndDate,
          blockType,
        });
      } else if (resizeEdge === 'end') {
        const nextEndDate = week.endDate;
        const currentStartDate = block.startDate || block.endDate || week.startDate;
        const nextStartDate = nextEndDate < currentStartDate ? week.startDate : currentStartDate;
        const period = getPeriodForWeek(sortedPeriods, nextStartDate);
        onUpdateBlock(block.id, {
          periodId: period.id,
          startDate: nextStartDate,
          endDate: nextEndDate,
          blockType,
        });
      } else {
        moveToTermWeek(block, week.startDate, blockType);
      }
    }
    setDraggedBlockId('');
    setResizeDrag(null);
  }

  function handleTermBlockResizeDrop(event, dropBlock, span) {
    event.preventDefault();
    const blockId = event.dataTransfer.getData('text/plain') || draggedBlockId;
    const block = blocks.find((item) => item.id === blockId);
    const fallbackResizeEdge = resizeDrag?.blockId === blockId ? resizeDrag.edge : '';
    const resizeEdge = event.dataTransfer.getData('application/x-smartdesk-resize-edge') || fallbackResizeEdge;

    if (!block || block.id !== dropBlock.id || !resizeEdge || !span) {
      setDraggedBlockId('');
      setResizeDrag(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const weekWidth = rect.width / Math.max(1, span.span);
    const localX = Math.min(Math.max(event.clientX - rect.left, 0), Math.max(0, rect.width - 1));
    const weekOffset = Math.floor(localX / weekWidth);
    const weekIndex = Math.min(termWeeks.length - 1, span.startIndex + weekOffset);
    const week = termWeeks[weekIndex];

    if (!week) {
      setDraggedBlockId('');
      setResizeDrag(null);
      return;
    }

    if (resizeEdge === 'start') {
      const nextStartDate = week.startDate;
      const currentEndDate = block.endDate || block.startDate || nextStartDate;
      const nextEndDate = nextStartDate > currentEndDate ? nextStartDate : currentEndDate;
      const period = getPeriodForWeek(sortedPeriods, nextStartDate);
      onUpdateBlock(block.id, {
        periodId: period.id,
        startDate: nextStartDate,
        endDate: nextEndDate,
        blockType: block.blockType,
      });
    }

    if (resizeEdge === 'end') {
      const nextEndDate = week.endDate;
      const currentStartDate = block.startDate || block.endDate || week.startDate;
      const nextStartDate = nextEndDate < currentStartDate ? week.startDate : currentStartDate;
      const period = getPeriodForWeek(sortedPeriods, nextStartDate);
      onUpdateBlock(block.id, {
        periodId: period.id,
        startDate: nextStartDate,
        endDate: nextEndDate,
        blockType: block.blockType,
      });
    }

    setDraggedBlockId('');
    setResizeDrag(null);
  }

  function openDurationDialog(block) {
    setDurationBlock(block);
    setDurationDraft({ startDate: block.startDate || '', endDate: block.endDate || '' });
  }

  function saveDuration() {
    if (durationBlock) {
      const period = getPeriodForDate(sortedPeriods, durationDraft.startDate || durationBlock.startDate);
      onUpdateBlock(durationBlock.id, {
        periodId: period.id,
        startDate: durationDraft.startDate,
        endDate: durationDraft.endDate,
      });
    }
    setDurationBlock(null);
  }

  function addTemplate(template, options = {}) {
    const placement = options.placement || libraryPlacement;
    const period = placement?.period || options.period || selectedPeriod || sortedPeriods[0];
    onCreateBlock(createBlockFromTemplatePayload({
      template,
      period,
      weekStart: placement?.weekStart || options.weekStart,
      blockType: placement?.blockType,
    }));
    setLibraryOpen(false);
    setLibraryPlacement(null);
  }

  function openLibraryAtTermWeek(week, blockType) {
    setLibraryPlacement({
      period: getPeriodForWeek(sortedPeriods, week.startDate),
      weekStart: week.startDate,
      weekLabel: week.label,
      blockType,
    });
    setLibraryOpen(true);
  }

  function openLibraryAtMonthWeek(week) {
    setLibraryPlacement({
      period: getPeriodForWeek(sortedPeriods, week.startDate) || selectedPeriod,
      weekStart: week.startDate,
      weekLabel: week.label,
    });
    setLibraryOpen(true);
  }

  function openLibraryWithoutPlacement() {
    setLibraryPlacement(null);
    setLibraryOpen(true);
  }

  function toggleAbilityFilter(abilityId) {
    setLibraryAbilityFilters((currentFilters) => (
      currentFilters.includes(abilityId)
        ? currentFilters.filter((id) => id !== abilityId)
        : [...currentFilters, abilityId]
    ));
  }

  function clearLibraryFilters() {
    setLibraryContentFilter('');
    setLibraryAbilityFilters([]);
  }

  const cardActions = {
    draggable: true,
    onDragStart: handleDragStart,
    onEdit: openEditDialog,
    onRename: (block, nextTitle) => updateBlock(block, { title: nextTitle }),
    onMove: (block) => setMoveBlock(block),
    onAdjustDuration: openDurationDialog,
    onDuplicate: (block) => onDuplicateBlock(block.id),
    onStatusChange: (block, status) => updateBlock(block, { status }),
    onDelete: (block) => setDeleteBlock(block),
  };

  return (
    <Stack spacing={1.4}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'auto auto' }, gap: 1.2, alignItems: 'start', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={0.8} alignItems="flex-start" sx={{ justifySelf: { xs: 'stretch', lg: 'start' } }}>
          <ToggleButtonGroup
            exclusive
            value={view}
            onChange={(_, nextView) => nextView && setView(nextView)}
            aria-label={t('learningModule.planView.viewsLabel')}
            sx={{
              flexWrap: 'wrap',
              gap: 0.8,
              '& .MuiToggleButtonGroup-grouped': {
                borderRadius: '999px !important',
                border: '1px solid rgba(23, 21, 26, 0.12) !important',
                px: 1.8,
                py: 0.75,
                textTransform: 'none',
                fontWeight: 760,
              },
              '& .Mui-selected': {
                bgcolor: 'rgba(156, 40, 175, 0.08) !important',
                color: `${purple} !important`,
                borderColor: 'rgba(156, 40, 175, 0.28) !important',
              },
              '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
                ml: 0.6,
              },
            }}
          >
            <ToggleButton value="term">{t('learningModule.planView.termOverview')}</ToggleButton>
            <ToggleButton value="month">{t('learningModule.planView.monthView')}</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ justifySelf: { xs: 'stretch', lg: 'end' }, alignSelf: 'start' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon fontSize="small" />}
            onClick={openLibraryWithoutPlacement}
            sx={{
              bgcolor: purple,
              borderRadius: '999px',
              px: 1.8,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 780,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#842194',
                boxShadow: 'none',
              },
            }}
          >
            {t('learningModule.planView.addBlock')}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCurriculumCheckOpen(true)}
            sx={{
              color: 'text.secondary',
              borderColor: 'rgba(23, 21, 26, 0.12)',
              borderRadius: '999px',
              px: 1.8,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 760,
              '&:hover': {
                bgcolor: 'rgba(156, 40, 175, 0.08)',
                color: purple,
                borderColor: 'rgba(156, 40, 175, 0.28)',
              },
            }}
          >
            {t('learningModule.planView.curriculumCheck')}
          </Button>
          <Tooltip title={t('learningModule.planView.resetPlanning')}>
            <IconButton
              aria-label={t('learningModule.planView.resetPlanningAria')}
              onClick={() => {
                onResetPlanning?.();
                onResetCurriculumNotes?.();
              }}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {view === 'term' && (
        <Stack spacing={1.2}>
          <Box ref={termScrollRef} sx={{ overflowX: 'auto', pb: 0.5 }}>
            <Box sx={{ minWidth: 980 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: `140px repeat(${termWeeks.length}, minmax(78px, 1fr))`, gap: 0.65, alignItems: 'stretch' }}>
                <Box sx={{ position: 'sticky', left: 0, zIndex: 5, bgcolor: '#fff' }} />
                {termMonthSpans.map((span) => (
                  <Typography
                    key={`${span.label}-${span.startIndex}`}
                    sx={{
                      gridColumn: `${span.startIndex + 2} / span ${span.span}`,
                      color: darkText,
                      fontSize: 14,
                      fontWeight: 850,
                      pb: 0.3,
                    }}
                  >
                    {span.label}
                  </Typography>
                ))}
                <Box sx={{ position: 'sticky', left: 0, zIndex: 5, bgcolor: '#fff' }} />
                {termWeeks.map((week, weekIndex) => {
                  const isCurrentWeek = currentTermMarker?.weekIndex === weekIndex;
                  return (
                    <Box key={week.id} sx={{ position: 'relative', minHeight: 34 }}>
                      <Typography sx={{ color: isCurrentWeek ? purple : 'text.secondary', fontSize: 12.2, fontWeight: isCurrentWeek ? 860 : 760 }}>
                        {week.label}
                      </Typography>
                      {isCurrentWeek && (
                        <Tooltip title={t('learningModule.planView.demoDate', { date: currentTermMarker.label })}>
                          <Box
                            data-demo-date-marker="true"
                            sx={{
                              position: 'absolute',
                              left: `${currentTermMarker.leftPercent}%`,
                              top: 18,
                              transform: 'translateX(-50%)',
                              px: 0.6,
                              py: 0.18,
                              borderRadius: '999px',
                              border: '1px solid rgba(156, 40, 175, 0.34)',
                              bgcolor: '#fff',
                              color: purple,
                              fontSize: 10.5,
                              fontWeight: 860,
                              lineHeight: 1.25,
                              whiteSpace: 'nowrap',
                              boxShadow: '0 4px 10px rgba(23, 21, 26, 0.08)',
                            }}
                          >
                            {currentTermMarker.label}
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  );
                })}

                {blockTypeOrder.map((blockType) => {
                  const laneBlocks = blocks.filter((block) => block.blockType === blockType && (block.startDate || block.endDate));
                  const laneRows = createLaneRows(laneBlocks, termWeeks);

                  return (
                    <Box key={blockType} sx={{ display: 'contents' }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1,
                          borderRadius: '14px',
                          border: '1px solid rgba(23, 21, 26, 0.08)',
                          bgcolor: '#fbfafc',
                          position: 'sticky',
                          left: 0,
                          zIndex: 6,
                          boxShadow: '8px 0 12px -12px rgba(23, 21, 26, 0.45)',
                        }}
                      >
                        <Typography sx={{ color: darkText, fontSize: 13.5, fontWeight: 850 }}>
                          {blockTypeLabels[blockType]}
                        </Typography>
                      </Paper>
                      <Box
                        sx={{
                          gridColumn: `2 / span ${termWeeks.length}`,
                          display: 'grid',
                          gridTemplateColumns: `repeat(${termWeeks.length}, minmax(78px, 1fr))`,
                          gap: 0.65,
                          p: 0.8,
                          minHeight: Math.max(86, laneRows.length * 70 + 18),
                          borderRadius: '16px',
                          border: '1px solid rgba(23, 21, 26, 0.09)',
                          bgcolor: draggedBlockId ? '#f7f4f8' : '#fff',
                        }}
                      >
                        {termWeeks.map((week) => (
                          <Box
                            key={`${blockType}-${week.id}`}
                            role="button"
                            tabIndex={0}
                            aria-label={t('learningModule.planView.addTypedBlockInWeek', { blockType: blockTypeLabels[blockType] || blockType, week: week.label })}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleTermWeekDrop(event, week, blockType)}
                            onClick={(event) => {
                              event.stopPropagation();
                              openLibraryAtTermWeek(week, blockType);
                            }}
                            onDoubleClick={(event) => {
                              event.stopPropagation();
                              openLibraryAtTermWeek(week, blockType);
                            }}
                            onKeyDown={(event) => {
                              if (!isActivationKey(event)) {
                                return;
                              }
                              event.preventDefault();
                              openLibraryAtTermWeek(week, blockType);
                            }}
                            sx={{
                              gridColumn: termWeeks.indexOf(week) + 1,
                              gridRow: `1 / span ${Math.max(1, laneRows.length)}`,
                              borderLeft: '1px solid rgba(23, 21, 26, 0.05)',
                              minHeight: '100%',
                              cursor: 'copy',
                              borderRadius: '10px',
                              outline: 'none',
                              transition: 'background-color 140ms ease, box-shadow 140ms ease',
                              '&:hover, &:focus-visible': {
                                bgcolor: 'rgba(156, 40, 175, 0.06)',
                                boxShadow: 'inset 0 0 0 1px rgba(156, 40, 175, 0.18)',
                              },
                            }}
                          />
                        ))}
                        {currentTermMarker && (
                          <Box
                            aria-hidden="true"
                            sx={{
                              gridColumn: currentTermMarker.weekIndex + 1,
                              gridRow: `1 / span ${Math.max(1, laneRows.length)}`,
                              position: 'relative',
                              minHeight: '100%',
                              pointerEvents: 'none',
                              zIndex: 2,
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: `${currentTermMarker.leftPercent}%`,
                                top: -4,
                                bottom: -4,
                                width: 2,
                                transform: 'translateX(-50%)',
                                borderRadius: 999,
                                bgcolor: purple,
                                opacity: 0.7,
                              }}
                            />
                          </Box>
                        )}
                        {laneRows.map((row, rowIndex) => row.map((placement) => (
                          <Box key={placement.block.id} sx={{ gridColumn: `${placement.span.startIndex + 1} / span ${placement.span.span}`, gridRow: rowIndex + 1, minWidth: 0, zIndex: 1 }}>
                            <TermTimelineBlock
                              block={placement.block}
                              span={{ startIndex: 0, span: 1 }}
                              timelineSpan={placement.span}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              onResizeDrop={handleTermBlockResizeDrop}
                              onEdit={openEditDialog}
                              onMove={(block) => setMoveBlock(block)}
                              onAdjustDuration={openDurationDialog}
                              onDuplicate={(block) => onDuplicateBlock(block.id)}
                              onStatusChange={(block, status) => updateBlock(block, { status })}
                              onDelete={(block) => setDeleteBlock(block)}
                              onResizeStart={handleResizeStart}
                            />
                          </Box>
                        )))}
                        {!laneRows.length && (
                          <Typography sx={{ gridColumn: `1 / span ${termWeeks.length}`, color: 'text.secondary', fontSize: 13, alignSelf: 'center' }}>
                            {t('learningModule.planView.dropIntoLane')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {!!unscheduledBlocks.length && (
                <Paper elevation={0} sx={{ mt: 1.2, p: 1.2, borderRadius: '16px', border: '1px dashed rgba(23, 21, 26, 0.16)', bgcolor: '#fbfafc' }}>
                  <Typography sx={{ color: darkText, fontWeight: 850 }}>{t('learningModule.planView.unscheduled')}</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {unscheduledBlocks.map((block) => (
                      <PlanningBlockCard key={block.id} block={block} curriculumAreas={curriculumAreas} {...cardActions} />
                    ))}
                  </Stack>
                </Paper>
              )}
            </Box>
          </Box>
        </Stack>
      )}

      {view === 'month' && (
        <Stack spacing={1.4}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Button disabled={selectedMonthIndex === 0} onClick={() => setSelectedMonthIndex((current) => Math.max(0, current - 1))} sx={{ color: 'text.secondary' }}>
              {t('learningModule.planView.previousMonth')}
            </Button>
            <Typography component="h3" sx={{ color: darkText, fontSize: 18, fontWeight: 860 }}>
              {getMonthLabel(selectedYear, selectedMonth, language)}
            </Typography>
            <Button disabled={selectedMonthIndex >= sortedPeriods.length - 1} onClick={() => setSelectedMonthIndex((current) => Math.min(sortedPeriods.length - 1, current + 1))} sx={{ color: 'text.secondary' }}>
              {t('learningModule.planView.nextMonth')}
            </Button>
          </Stack>
          <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
            <Box sx={{ minWidth: 780, display: 'grid', gridTemplateColumns: `repeat(${weeks.length}, minmax(130px, 1fr))`, gap: 1 }}>
              {weeks.map((week) => (
                <Paper
                  key={week.id}
                  elevation={0}
                  role="button"
                  tabIndex={0}
                  aria-label={t('learningModule.planView.addBlockInWeek', { week: week.label })}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleWeekDrop(event, week)}
                  onClick={(event) => {
                    event.stopPropagation();
                    openLibraryAtMonthWeek(week);
                  }}
                  onKeyDown={(event) => {
                    if (!isActivationKey(event)) {
                      return;
                    }
                    event.preventDefault();
                    openLibraryAtMonthWeek(week);
                  }}
                  sx={{
                    p: 1,
                    borderRadius: '14px',
                    border: '1px solid rgba(23, 21, 26, 0.1)',
                    bgcolor: draggedBlockId ? '#f7f4f8' : '#fbfafc',
                    cursor: 'copy',
                    outline: 'none',
                    transition: 'background-color 140ms ease, border-color 140ms ease',
                    '&:hover, &:focus-visible': {
                      bgcolor: 'rgba(156, 40, 175, 0.06)',
                      borderColor: 'rgba(156, 40, 175, 0.24)',
                    },
                  }}
                >
                  <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 820 }}>{week.label}</Typography>
                </Paper>
              ))}
              {getBlocksForMonth(blocks, selectedYear, selectedMonth).map((block) => {
                const span = getBlockWeekSpan(block, weeks);
                return (
                  <Box key={block.id} sx={{ gridColumn: `${span.startIndex + 1} / span ${span.span}` }}>
                    <PlanningBlockCard block={block} curriculumAreas={curriculumAreas} {...cardActions} />
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Stack>
      )}

      <Dialog open={curriculumCheckOpen} onClose={() => setCurriculumCheckOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('learningModule.planView.curriculumReference')}</DialogTitle>
        <DialogContent>
          <CurriculumReferencePanel
            sections={curriculumReferenceSections}
            representedCurriculumAreaIds={representedCurriculumAreaIds}
            representedAbilityIds={representedAbilityIds}
            sx={{ width: '100%', maxWidth: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCurriculumCheckOpen(false)} sx={{ color: 'text.secondary' }}>{t('learningModule.planView.close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={libraryOpen}
        onClose={() => { setLibraryOpen(false); setLibraryPlacement(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: { xs: '100%', sm: 'min(780px, calc(100vh - 64px))' },
            maxHeight: { xs: '100%', sm: 'calc(100vh - 64px)' },
            borderRadius: { xs: 0, sm: '24px' },
          },
        }}
      >
        <DialogTitle>{t('learningModule.planView.addFromLibrary')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {libraryPlacement && (
            <Typography sx={{ mb: 1.2, color: 'text.secondary', fontSize: 13.5, fontWeight: 700 }}>
              {libraryPlacement.blockType
                ? t('learningModule.planView.newTypedBlockPlacement', {
                  week: libraryPlacement.weekLabel,
                  blockType: blockTypeLabels[libraryPlacement.blockType] || libraryPlacement.blockType,
                })
                : t('learningModule.planView.newBlockPlacement', { week: libraryPlacement.weekLabel })}
            </Typography>
          )}
          <Stack spacing={1.35}>
            <Box>
              <Typography sx={{ mb: 0.65, color: darkText, fontSize: 12.4, fontWeight: 880 }}>{t('learningModule.planView.quickAdd')}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 0.7 }}>
                {quickAddTemplates.map((template) => (
                  <Button
                    key={template.id}
                    onClick={() => addTemplate(template)}
                    aria-label={`${t('learningModule.planView.addTemplateAria', { title: template.title })} ${quickAddDescriptions[template.id] || ''}`.trim()}
                    sx={{ alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left', color: darkText, border: '1px solid rgba(23, 21, 26, 0.1)', borderRadius: '14px', px: 1, py: 0.9, minHeight: 76 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: darkText, fontSize: 12.5, fontWeight: 860, lineHeight: 1.25 }}>{template.title}</Typography>
                      <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.5, fontWeight: 650, lineHeight: 1.25 }}>
                        {quickAddDescriptions[template.id]}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.08)', pt: 1.15 }}>
              <Typography sx={{ mb: 0.55, color: darkText, fontSize: 12.4, fontWeight: 880 }}>{t('learningModule.planView.content')}</Typography>
              <Box sx={{ display: 'flex', gap: 0.55, overflowX: 'auto', pb: 0.2 }}>
                <Button
                  aria-pressed={!libraryContentFilter}
                  onClick={() => setLibraryContentFilter('')}
                  sx={{
                    flexShrink: 0,
                    color: !libraryContentFilter ? purple : 'text.secondary',
                    border: !libraryContentFilter ? '1px solid rgba(156, 40, 175, 0.32)' : '1px solid rgba(23, 21, 26, 0.1)',
                    bgcolor: !libraryContentFilter ? 'rgba(156, 40, 175, 0.08)' : '#fff',
                    borderRadius: '999px',
                    px: 1.15,
                    py: 0.45,
                    fontSize: 12,
                    fontWeight: 820,
                  }}
                >
                  {t('learningModule.planView.all')}
                </Button>
                {contentFilterAreas.map((area) => {
                  const isSelected = libraryContentFilter === area.id;
                  return (
                    <Button
                      key={area.id}
                      aria-pressed={isSelected}
                      onClick={() => setLibraryContentFilter(area.id)}
                      sx={{
                        flexShrink: 0,
                        color: isSelected ? purple : 'text.secondary',
                        border: isSelected ? '1px solid rgba(156, 40, 175, 0.32)' : '1px solid rgba(23, 21, 26, 0.1)',
                        bgcolor: isSelected ? 'rgba(156, 40, 175, 0.08)' : '#fff',
                        borderRadius: '999px',
                        px: 1.15,
                        py: 0.45,
                        fontSize: 12,
                        fontWeight: 820,
                      }}
                    >
                      {area.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography sx={{ mb: 0.55, color: darkText, fontSize: 12.4, fontWeight: 880 }}>{t('learningModule.planView.abilities')}</Typography>
              <Box sx={{ display: 'flex', gap: 0.55, overflowX: 'auto', pb: 0.2 }}>
                {abilityFilterAreas.map((area) => {
                  const isSelected = libraryAbilityFilters.includes(area.id);
                  return (
                    <Button
                      key={area.id}
                      aria-pressed={isSelected}
                      onClick={() => toggleAbilityFilter(area.id)}
                      sx={{
                        flexShrink: 0,
                        color: isSelected ? purple : 'text.secondary',
                        border: isSelected ? '1px solid rgba(156, 40, 175, 0.32)' : '1px solid rgba(23, 21, 26, 0.1)',
                        bgcolor: isSelected ? 'rgba(156, 40, 175, 0.08)' : '#fff',
                        borderRadius: '999px',
                        px: 1.15,
                        py: 0.45,
                        fontSize: 12,
                        fontWeight: 820,
                      }}
                    >
                      {area.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.08)', pt: 1.15 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 0.65 }}>
                <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 880 }}>{t('learningModule.planView.matchingTemplates')}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 11.4, fontWeight: 720 }}>
                  {t('learningModule.planView.representedSummary', { contentCount: representedContentCount, abilityCount: representedAbilityCount })}
                </Typography>
              </Stack>
              {matchingTemplates.length ? (
                <Stack spacing={0.8}>
                  {matchingTemplates.map((template) => {
                    const inPlanLabel = getTemplateInPlanLabel(template, blocks, t);
                    const contentSummary = getTemplateContentSummary(template, curriculumAreas);
                    return (
                      <Button
                        key={template.id}
                        onClick={() => addTemplate(template)}
                        aria-label={getTemplateAriaLabel(template, inPlanLabel, t)}
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', color: darkText, border: '1px solid rgba(23, 21, 26, 0.1)', borderRadius: '14px', p: 1.05 }}
                      >
                        <Box sx={{ width: '100%', minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between" sx={{ minWidth: 0 }}>
                            <Typography sx={{ minWidth: 0, fontWeight: 850 }}>{template.title}</Typography>
                            {inPlanLabel && (
                              <Typography component="span" sx={{ flexShrink: 0, color: 'text.secondary', fontSize: 11.2, fontWeight: 820 }}>
                                {inPlanLabel}
                              </Typography>
                            )}
                          </Stack>
                          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {template.description || blockTypeLabels[template.blockType] || template.blockType}
                          </Typography>
                          {contentSummary && (
                            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.8, fontWeight: 720 }}>
                              {contentSummary}
                            </Typography>
                          )}
                        </Box>
                      </Button>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ border: '1px solid rgba(23, 21, 26, 0.1)', borderRadius: '14px', p: 1.2, bgcolor: '#fbfafc' }}>
                  <Typography sx={{ color: darkText, fontSize: 13, fontWeight: 850 }}>{t('learningModule.planView.noMatchingTemplates')}</Typography>
                  <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.4 }}>{t('learningModule.planView.noMatchingTemplatesHint')}</Typography>
                  <Button onClick={clearLibraryFilters} sx={{ mt: 0.6, color: purple, fontSize: 12, fontWeight: 850 }}>
                    {t('learningModule.planView.clearFilters')}
                  </Button>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setLibraryOpen(false); setLibraryPlacement(null); }} sx={{ color: 'text.secondary' }}>{t('learningModule.planView.close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(moveBlock)} onClose={() => setMoveBlock(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('learningModule.planView.moveDialog.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Typography sx={{ color: darkText, fontWeight: 850 }}>{t('learningModule.planView.moveDialog.lane')}</Typography>
            {blockTypeOrder.map((blockType) => (
              <Button key={blockType} onClick={() => { updateBlock(moveBlock, { blockType }); setMoveBlock(null); }} sx={{ justifyContent: 'flex-start', color: darkText }}>
                {blockTypeLabels[blockType]}
              </Button>
            ))}
            <Typography sx={{ color: darkText, fontWeight: 850, pt: 1 }}>{t('learningModule.planView.moveDialog.period')}</Typography>
            {sortedPeriods.map((period) => (
              <Button key={period.id} onClick={() => { moveToPeriod(moveBlock, period); setMoveBlock(null); }} sx={{ justifyContent: 'flex-start', color: darkText }}>
                {period.label}
              </Button>
            ))}
            <Typography sx={{ color: darkText, fontWeight: 850, pt: 1 }}>{t('learningModule.planView.moveDialog.week')}</Typography>
            {weeks.map((week) => (
              <Button key={week.id} onClick={() => { moveToWeek(moveBlock, week.startDate); setMoveBlock(null); }} sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}>
                {t('learningModule.planView.moveDialog.weekInMonth', { week: week.label, month: getMonthLabel(selectedYear, selectedMonth, language) })}
              </Button>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(durationBlock)} onClose={() => setDurationBlock(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('learningModule.planView.durationDialog.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2} sx={{ pt: 1 }}>
            <TextField label={t('learningModule.planView.durationDialog.startDate')} type="date" value={durationDraft.startDate} onChange={(event) => setDurationDraft((current) => ({ ...current, startDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField label={t('learningModule.planView.durationDialog.endDate')} type="date" value={durationDraft.endDate} onChange={(event) => setDurationDraft((current) => ({ ...current, endDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDurationBlock(null)} sx={{ color: 'text.secondary' }}>{t('learningModule.planView.durationDialog.cancel')}</Button>
          <Button variant="contained" onClick={saveDuration} sx={{ bgcolor: purple, '&:hover': { bgcolor: '#842194' } }}>{t('learningModule.planView.durationDialog.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteBlock)} onClose={() => setDeleteBlock(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('learningModule.planView.deleteDialog.title')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
            {t('learningModule.planView.deleteDialog.body')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteBlock(null)} sx={{ color: 'text.secondary' }}>{t('learningModule.planView.deleteDialog.keep')}</Button>
          <Button variant="contained" color="inherit" onClick={() => { onDeleteBlock(deleteBlock.id); setDeleteBlock(null); }}>{t('learningModule.planView.deleteDialog.delete')}</Button>
        </DialogActions>
      </Dialog>

      <PlanningBlockDialog
        open={dialogOpen}
        mode={dialogMode}
        block={selectedBlock}
        periods={sortedPeriods}
        curriculumAreas={curriculumAreas}
        abilities={abilities}
        curriculumAreaTypeLabels={curriculumAreaTypeLabels}
        referenceDate={referenceDate}
        workingGroups={workingGroups}
        groupDefinitions={groupDefinitions}
        onClose={() => setDialogOpen(false)}
        onCreateBlock={onCreateBlock}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={(blockId) => setDeleteBlock(blocks.find((block) => block.id === blockId))}
      />
    </Stack>
  );
}
