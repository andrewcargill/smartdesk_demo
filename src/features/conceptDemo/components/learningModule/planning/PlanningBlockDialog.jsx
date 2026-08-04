import { useEffect, useMemo, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useConceptDemoLanguage } from '../../../ConceptDemoLanguageContext.jsx';

const darkText = '#17151a';
const purple = '#9c28af';
const palePurple = '#fbf5fd';

const blockTypeOptionIds = ['teaching', 'revisit', 'assessment', 'consolidation'];
const statusOptionIds = ['planned', 'current', 'completed'];

function sortReferenceItems(items) {
  return [...(items || [])].sort((first, second) => (first.order || 0) - (second.order || 0) || first.label.localeCompare(second.label));
}

function getCurriculumReferenceSections(curriculumAreas, abilities, typeLabels, fallbackTypeLabels = {}) {
  return [
    {
      id: 'content',
      label: typeLabels.content || fallbackTypeLabels.content || 'Content',
      areas: sortReferenceItems(curriculumAreas),
    },
    {
      id: 'ability',
      label: typeLabels.ability || fallbackTypeLabels.ability || 'Abilities',
      areas: sortReferenceItems(abilities),
    },
  ].filter((section) => section.areas.length);
}

function slugify(value) {
  return String(value || 'moment')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createMomentId(label) {
  return `${slugify(label || 'moment')}-${Date.now().toString(36)}`;
}

function createAdaptationId() {
  return `adaptation-${Date.now().toString(36)}`;
}

function inferStatusFromDates(startDate, endDate, referenceDate) {
  const demoDate = referenceDate || new Date().toISOString().slice(0, 10);
  if (!startDate && !endDate) {
    return 'planned';
  }

  const start = startDate || endDate;
  const end = endDate || startDate;

  if (start <= demoDate && end >= demoDate) {
    return 'current';
  }

  if (end < demoDate) {
    return 'completed';
  }

  return 'planned';
}

function normaliseQuickCaptureOptions(options) {
  return (Array.isArray(options) ? options : [])
    .filter((option) => option && typeof option.label === 'string')
    .map((option) => ({
      id: option.id || createMomentId(option.label),
      label: option.label,
      ...(option.signal ? { signal: option.signal } : {}),
    }));
}

function normaliseGroupAdaptationsForForm(adaptations) {
  return (Array.isArray(adaptations) ? adaptations : [])
    .filter((adaptation) => adaptation && typeof adaptation.workingGroupId === 'string' && typeof adaptation.instruction === 'string')
    .map((adaptation) => ({
      id: adaptation.id || createAdaptationId(),
      workingGroupId: adaptation.workingGroupId,
      instruction: adaptation.instruction,
    }));
}

export default function PlanningBlockDialog({
  open,
  mode,
  block,
  periods,
  curriculumAreas,
  abilities = [],
  curriculumAreaTypeLabels = {},
  referenceDate,
  workingGroups = [],
  groupDefinitions = [],
  onClose,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
}) {
  const { t } = useConceptDemoLanguage();
  const titleRef = useRef(null);
  const [title, setTitle] = useState('');
  const [periodId, setPeriodId] = useState(periods[0]?.id || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [blockType, setBlockType] = useState('teaching');
  const [status, setStatus] = useState('planned');
  const [statusTouched, setStatusTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [curriculumAreaIds, setCurriculumAreaIds] = useState([]);
  const [abilityIds, setAbilityIds] = useState([]);
  const [quickCaptureOptions, setQuickCaptureOptions] = useState([]);
  const [groupAdaptations, setGroupAdaptations] = useState([]);
  const [notes, setNotes] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [showMomentError, setShowMomentError] = useState(false);
  const [adaptationError, setAdaptationError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const groupedCurriculumAreas = useMemo(
    () => getCurriculumReferenceSections(curriculumAreas, abilities, curriculumAreaTypeLabels, {
      content: t('learningModule.planView.content'),
      ability: t('learningModule.planView.abilities'),
    }),
    [abilities, curriculumAreas, curriculumAreaTypeLabels, t],
  );
  const activeWorkingGroups = useMemo(
    () => (workingGroups || []).filter((group) => group?.status !== 'archived'),
    [workingGroups],
  );
  const blockTypeOptions = useMemo(() => blockTypeOptionIds.map((id) => ({
    id,
    label: t(`learningModule.planView.blockTypes.${id}`),
  })), [t]);
  const statusOptions = useMemo(() => statusOptionIds.map((id) => ({
    id,
    label: t(`learningModule.planView.statuses.${id}`),
  })), [t]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(block?.title || '');
    setPeriodId(block?.periodId || periods[0]?.id || '');
    setStartDate(block?.startDate || '');
    setEndDate(block?.endDate || '');
    setBlockType(block?.blockType || 'teaching');
    setStatus(block?.status || inferStatusFromDates(block?.startDate || '', block?.endDate || '', referenceDate));
    setStatusTouched(mode === 'edit');
    setDescription(block?.description || '');
    setCurriculumAreaIds([...(block?.curriculumAreaIds || [])]);
    setAbilityIds([...(block?.abilityIds || [])]);
    setQuickCaptureOptions(normaliseQuickCaptureOptions(block?.quickCaptureOptions));
    setGroupAdaptations(normaliseGroupAdaptationsForForm(block?.groupAdaptations));
    setNotes(block?.notes || '');
    setMoreOpen(false);
    setShowNameError(false);
    setShowMomentError(false);
    setAdaptationError('');
    setShowDeleteConfirm(false);
    window.requestAnimationFrame(() => titleRef.current?.focus?.());
  }, [block, open, periods]);

  function toggleCurriculumArea(areaId) {
    setCurriculumAreaIds((currentIds) => (
      currentIds.includes(areaId)
        ? currentIds.filter((id) => id !== areaId)
        : [...currentIds, areaId]
    ));
  }

  function toggleAbility(abilityId) {
    setAbilityIds((currentIds) => (
      currentIds.includes(abilityId)
        ? currentIds.filter((id) => id !== abilityId)
        : [...currentIds, abilityId]
    ));
  }

  function addMoment() {
    setQuickCaptureOptions((currentOptions) => [
      ...currentOptions,
      {
        id: createMomentId('moment'),
        label: '',
      },
    ]);
    setMoreOpen(true);
  }

  function updateMoment(momentId, label) {
    setShowMomentError(false);
    setQuickCaptureOptions((currentOptions) => currentOptions.map((option) => (
      option.id === momentId ? { ...option, label } : option
    )));
  }

  function removeMoment(momentId) {
    setQuickCaptureOptions((currentOptions) => currentOptions.filter((option) => option.id !== momentId));
  }

  function addGroupAdaptation() {
    setGroupAdaptations((currentAdaptations) => [
      ...currentAdaptations,
      {
        id: createAdaptationId(),
        workingGroupId: '',
        instruction: '',
      },
    ]);
    setMoreOpen(true);
  }

  function updateGroupAdaptation(adaptationId, updates) {
    setAdaptationError('');
    setGroupAdaptations((currentAdaptations) => currentAdaptations.map((adaptation) => (
      adaptation.id === adaptationId ? { ...adaptation, ...updates } : adaptation
    )));
  }

  function removeGroupAdaptation(adaptationId) {
    setAdaptationError('');
    setGroupAdaptations((currentAdaptations) => currentAdaptations.filter((adaptation) => adaptation.id !== adaptationId));
  }

  function getWorkingGroupLabel(workingGroupId) {
    return activeWorkingGroups.find((group) => group.id === workingGroupId)?.label || t('learningModule.planView.editDialog.focusUnavailable');
  }

  function getWorkingGroupTypeLabel(typeId) {
    return groupDefinitions.find((definition) => definition.id === typeId)?.label || '';
  }

  function getSelectableGroupsForAdaptation(adaptation) {
    const hasCurrentGroup = activeWorkingGroups.some((group) => group.id === adaptation.workingGroupId);
    if (!adaptation.workingGroupId || hasCurrentGroup) {
      return activeWorkingGroups;
    }

    return [
      ...activeWorkingGroups,
      {
        id: adaptation.workingGroupId,
        label: t('learningModule.planView.editDialog.focusUnavailable'),
        typeId: '',
        status: 'unavailable',
      },
    ];
  }

  function validateGroupAdaptations() {
    const retainedAdaptations = groupAdaptations.filter((adaptation) => adaptation.workingGroupId || adaptation.instruction.trim());

    if (retainedAdaptations.some((adaptation) => !adaptation.workingGroupId || !adaptation.instruction.trim())) {
      return t('learningModule.planView.editDialog.adaptationIncomplete');
    }

    const groupIds = retainedAdaptations.map((adaptation) => adaptation.workingGroupId);
    if (new Set(groupIds).size !== groupIds.length) {
      return t('learningModule.planView.editDialog.adaptationDuplicate');
    }

    return '';
  }

  function buildPayload() {
    return {
      title: title.trim(),
      periodId,
      startDate,
      endDate,
      blockType,
      status: mode === 'create' && !statusTouched ? inferStatusFromDates(startDate, endDate, referenceDate) : status,
      description,
      curriculumAreaIds,
      abilityIds,
      assessmentAnchor: null,
      quickCaptureOptions: quickCaptureOptions.map((option) => ({
        ...option,
        id: option.id || createMomentId(option.label),
        label: option.label.trim(),
      })),
      groupAdaptations: groupAdaptations
        .filter((adaptation) => adaptation.workingGroupId || adaptation.instruction.trim())
        .map((adaptation) => ({
          id: adaptation.id || createAdaptationId(),
          workingGroupId: adaptation.workingGroupId,
          instruction: adaptation.instruction.trim(),
        })),
      notes,
    };
  }

  function saveBlock() {
    if (!title.trim()) {
      setShowNameError(true);
      return;
    }

    if (!periodId) {
      return;
    }

    if (quickCaptureOptions.some((option) => !option.label.trim())) {
      setMoreOpen(true);
      setShowMomentError(true);
      return;
    }

    const nextAdaptationError = validateGroupAdaptations();
    if (nextAdaptationError) {
      setMoreOpen(true);
      setAdaptationError(nextAdaptationError);
      return;
    }

    const payload = buildPayload();
    if (mode === 'edit' && block) {
      onUpdateBlock(block.id, payload);
    } else {
      onCreateBlock(payload);
    }

    onClose();
  }

  function deleteBlock() {
    if (!block) {
      return;
    }

    onDeleteBlock(block.id);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: '24px' } } }}
    >
      <DialogTitle ref={titleRef} tabIndex={-1} sx={{ outline: 'none', pr: 3 }}>
        {mode === 'edit' ? t('learningModule.planView.editDialog.editTitle') : t('learningModule.planView.editDialog.addTitle')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.6} sx={{ pt: 0.5 }}>
          <TextField
            autoFocus
            label={t('learningModule.planView.editDialog.title')}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setShowNameError(false);
            }}
            error={showNameError}
            helperText={showNameError ? t('learningModule.planView.editDialog.titleRequired') : ' '}
            fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.2 }}>
            <FormControl fullWidth>
              <InputLabel id="planning-period-label">{t('learningModule.planView.editDialog.period')}</InputLabel>
              <Select labelId="planning-period-label" label={t('learningModule.planView.editDialog.period')} value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
                {periods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>{period.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="planning-block-type-label">{t('learningModule.planView.editDialog.blockType')}</InputLabel>
              <Select labelId="planning-block-type-label" label={t('learningModule.planView.editDialog.blockType')} value={blockType} onChange={(event) => setBlockType(event.target.value)}>
                {blockTypeOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label={t('learningModule.planView.editDialog.startDate')} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label={t('learningModule.planView.editDialog.endDate')} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} InputLabelProps={{ shrink: true }} />
          </Box>

          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
              <Typography sx={{ color: darkText, fontWeight: 850 }}>{t('learningModule.planView.editDialog.linkedContent')}</Typography>
              <Chip label={t('learningModule.planView.editDialog.linkedSummary', { contentCount: curriculumAreaIds.length, abilityCount: abilityIds.length })} size="small" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, bgcolor: palePurple, color: purple, fontWeight: 760 }} />
            </Stack>
            <Paper elevation={0} sx={{ mt: 1, maxHeight: 230, overflowY: 'auto', border: '1px solid rgba(23, 21, 26, 0.1)', borderRadius: '16px', p: 1 }}>
              <Stack spacing={1.1}>
                {groupedCurriculumAreas.map((section) => (
                  <Box key={section.id}>
                    <Typography component="h3" sx={{ color: darkText, fontSize: 13.2, fontWeight: 850, mb: 0.35 }}>
                      {section.label}
                    </Typography>
                    {section.areas.map((area) => (
                      <FormControlLabel
                        key={area.id}
                        control={(
                          <Checkbox
                            checked={section.id === 'ability' ? abilityIds.includes(area.id) : curriculumAreaIds.includes(area.id)}
                            onChange={() => (section.id === 'ability' ? toggleAbility(area.id) : toggleCurriculumArea(area.id))}
                            inputProps={{ 'aria-label': area.label }}
                          />
                        )}
                        label={area.label}
                        sx={{ display: 'flex', mx: 0, px: 0.5, borderRadius: '10px', '&:hover': { bgcolor: '#fbfafc' } }}
                      />
                    ))}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>

          <Box>
            <Button
              aria-expanded={moreOpen}
              aria-controls="planning-more-options"
              onClick={() => setMoreOpen((current) => !current)}
              endIcon={<ExpandMoreIcon sx={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms ease' }} />}
              sx={{ color: darkText, px: 0.5, textTransform: 'none', fontWeight: 820 }}
            >
              {t('learningModule.planView.editDialog.moreOptions')}
            </Button>
            <Collapse in={moreOpen}>
              <Stack id="planning-more-options" spacing={1.4} sx={{ pt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="planning-status-label">{t('learningModule.planView.editDialog.status')}</InputLabel>
                  <Select
                    labelId="planning-status-label"
                    label={t('learningModule.planView.editDialog.status')}
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setStatusTouched(true);
                    }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField label={t('learningModule.planView.editDialog.optionalDescription')} value={description} onChange={(event) => setDescription(event.target.value)} multiline minRows={2} fullWidth />
                <TextField label={t('learningModule.planView.editDialog.optionalNotes')} value={notes} onChange={(event) => setNotes(event.target.value)} multiline minRows={2} fullWidth />

                <Paper elevation={0} sx={{ p: 1.25, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.09)', bgcolor: '#fff' }}>
                  <Stack spacing={1}>
                    <Box>
                      <Typography sx={{ color: darkText, fontWeight: 850 }}>{t('learningModule.planView.editDialog.quickCaptureMoments')}</Typography>
                      <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13.2, lineHeight: 1.45 }}>
                        {t('learningModule.planView.editDialog.quickCaptureHint')}
                      </Typography>
                    </Box>
                    {quickCaptureOptions.map((option, index) => (
                      <Box key={option.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' }, gap: 0.8, alignItems: 'center' }}>
                        <TextField
                          label={t('learningModule.planView.editDialog.momentLabel', { number: index + 1 })}
                          value={option.label}
                          onChange={(event) => updateMoment(option.id, event.target.value)}
                          error={showMomentError && !option.label.trim()}
                          size="small"
                          fullWidth
                        />
                        <Button onClick={() => removeMoment(option.id)} sx={{ color: 'text.secondary' }}>
                          {t('learningModule.planView.editDialog.remove')}
                        </Button>
                      </Box>
                    ))}
                    {showMomentError && (
                      <Typography sx={{ color: '#7a4250', fontSize: 13 }}>
                        {t('learningModule.planView.editDialog.momentRequired')}
                      </Typography>
                    )}
                    <Button startIcon={<AddIcon />} onClick={addMoment} sx={{ alignSelf: 'flex-start', color: purple }}>
                      {t('learningModule.planView.editDialog.addMoment')}
                    </Button>
                  </Stack>
                </Paper>

                <Paper elevation={0} sx={{ p: 1.25, borderRadius: '16px', border: '1px solid rgba(23, 21, 26, 0.09)', bgcolor: '#fff' }}>
                  <Stack spacing={1.1}>
                    <Box>
                      <Typography sx={{ color: darkText, fontWeight: 850 }}>{t('learningModule.planView.editDialog.focusAdaptations')}</Typography>
                      <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13.2, lineHeight: 1.45 }}>
                        {t('learningModule.planView.editDialog.focusAdaptationsHint')}
                      </Typography>
                    </Box>
                    {groupAdaptations.map((adaptation, index) => {
                      const selectedGroup = activeWorkingGroups.find((group) => group.id === adaptation.workingGroupId);
                      const selectedGroupLabel = selectedGroup?.label || getWorkingGroupLabel(adaptation.workingGroupId);

                      return (
                        <Paper key={adaptation.id} elevation={0} sx={{ p: 1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fbfafc' }}>
                          <Stack spacing={1}>
                            <FormControl fullWidth size="small">
                              <InputLabel id={`group-adaptation-${adaptation.id}-label`}>{t('learningModule.planView.editDialog.focus')}</InputLabel>
                              <Select
                                labelId={`group-adaptation-${adaptation.id}-label`}
                                label={t('learningModule.planView.editDialog.focus')}
                                value={adaptation.workingGroupId}
                                onChange={(event) => updateGroupAdaptation(adaptation.id, { workingGroupId: event.target.value })}
                              >
                                <MenuItem value="">
                                  <Typography sx={{ color: 'text.secondary' }}>{t('learningModule.planView.editDialog.selectFocus')}</Typography>
                                </MenuItem>
                                {getSelectableGroupsForAdaptation(adaptation).map((group) => (
                                  <MenuItem key={group.id} value={group.id}>
                                    <Box>
                                      <Typography sx={{ color: darkText, fontWeight: 760 }}>{group.label}</Typography>
                                      {!!getWorkingGroupTypeLabel(group.typeId) && (
                                        <Typography sx={{ color: 'text.secondary', fontSize: 12.3 }}>
                                          {getWorkingGroupTypeLabel(group.typeId)}
                                        </Typography>
                                      )}
                                      {group.status === 'unavailable' && (
                                        <Typography sx={{ color: 'text.secondary', fontSize: 12.3 }}>
                                          {t('learningModule.planView.editDialog.focusUnavailable')}
                                        </Typography>
                                      )}
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <TextField
                              label={t('learningModule.planView.editDialog.adaptationInstruction', { number: index + 1 })}
                              value={adaptation.instruction}
                              onChange={(event) => updateGroupAdaptation(adaptation.id, { instruction: event.target.value })}
                              multiline
                              minRows={2}
                              size="small"
                              fullWidth
                            />
                            <Button
                              onClick={() => removeGroupAdaptation(adaptation.id)}
                              aria-label={t('learningModule.planView.editDialog.removeAdaptation', { label: selectedGroupLabel })}
                              sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
                            >
                              {t('learningModule.planView.editDialog.remove')}
                            </Button>
                          </Stack>
                        </Paper>
                      );
                    })}
                    {!!adaptationError && (
                      <Typography sx={{ color: '#7a4250', fontSize: 13 }}>
                        {adaptationError}
                      </Typography>
                    )}
                    <Button startIcon={<AddIcon />} onClick={addGroupAdaptation} sx={{ alignSelf: 'flex-start', color: purple }}>
                      {t('learningModule.planView.editDialog.addFocusAdaptation')}
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Collapse>
          </Box>

          {mode === 'edit' && (
            <>
              <Divider />
              {!showDeleteConfirm ? (
                <Button startIcon={<DeleteOutlineIcon />} onClick={() => setShowDeleteConfirm(true)} sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}>
                  {t('learningModule.planView.editDialog.deleteBlock')}
                </Button>
              ) : (
                <Paper elevation={0} sx={{ p: 1.4, borderRadius: '15px', border: '1px solid rgba(23, 21, 26, 0.12)', bgcolor: '#fff' }}>
                  <Typography sx={{ color: darkText, fontWeight: 850 }}>{t('learningModule.planView.deleteDialog.title')}</Typography>
                  <Typography sx={{ mt: 0.35, color: 'text.secondary', lineHeight: 1.45 }}>
                    {t('learningModule.planView.deleteDialog.body')}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                    <Button variant="contained" color="inherit" onClick={deleteBlock}>{t('learningModule.planView.deleteDialog.delete')}</Button>
                    <Button onClick={() => setShowDeleteConfirm(false)} sx={{ color: 'text.secondary' }}>{t('learningModule.planView.deleteDialog.keep')}</Button>
                  </Stack>
                </Paper>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>{t('learningModule.planView.editDialog.cancel')}</Button>
        <Button variant="contained" onClick={saveBlock} sx={{ bgcolor: purple, '&:hover': { bgcolor: '#842194' } }}>
          {mode === 'edit' ? t('learningModule.planView.editDialog.saveBlock') : t('learningModule.planView.addBlock')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
