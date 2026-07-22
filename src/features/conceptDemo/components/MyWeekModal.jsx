import { useEffect, useId, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import {
  Box,
  Button,
  ClickAwayListener,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  IconButton,
  MenuItem,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { annaDiaryEvents } from '../data/annaDiaryEvents.js';
import { annaReminders } from '../data/annaReminders.js';
import { annaSchedule, annaWorkingPattern } from '../data/annaSchedule.js';
import { useTeacherDiaryItems } from '../hooks/useTeacherDiaryItems.js';
import {
  getCurrentDay,
  getCurrentWeekContext,
} from '../utils/weekDataUtils.js';
import {
  ADD_MODE_RESET_DELAY_MS,
  getSharedWeekTimetableLayout,
} from '../utils/weekViewUtils.js';
import {
  getDiaryItemsByType,
  TEACHER_DIARY_ITEM_TYPES,
  TEACHER_DIARY_NOTE_MAX_LENGTH,
  TEACHER_DIARY_TITLE_MAX_LENGTH,
} from '../utils/teacherDiaryItems.js';
import WeekDayColumn from './WeekDayColumn.jsx';

const purple = '#9c28af';
const darkText = '#17151a';
const teacherDiarySeedItems = [...annaDiaryEvents, ...annaReminders];

const linkedContextOptions = [
  { id: 'none', label: 'No link', context: null },
  {
    id: 'maths-7a',
    label: 'Maths 7A',
    context: {
      moduleId: 'mathematics',
      subjectId: 'mathematics',
      classId: '7a',
    },
  },
  {
    id: 'mentor',
    label: 'Mentor',
    context: {
      moduleId: 'mentor',
      classId: '7a',
    },
  },
  {
    id: 'notebook',
    label: 'Notebook',
    context: {
      moduleId: 'notebook',
    },
  },
];

function shiftIsoDate(date, days) {
  const nextDate = new Date(`${date}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function addMinutes(time, minutesToAdd) {
  const [hours, minutes] = String(time || '14:00').split(':').map(Number);
  const totalMinutes = (Number.isFinite(hours) ? hours : 14) * 60 + (Number.isFinite(minutes) ? minutes : 0) + minutesToAdd;
  const nextHours = Math.floor(totalMinutes / 60);
  const nextMinutes = totalMinutes % 60;
  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

function isEndAfterStart(startTime, endTime) {
  return Boolean(startTime && endTime && endTime > startTime);
}

function timeRangeOverlapsItem({ startTime, endTime, item, draftId }) {
  if (item.id === draftId || item.originalId === draftId) {
    return false;
  }

  return Boolean(
    item.start
    && item.end
    && startTime < item.end
    && endTime > item.start
  );
}

function getLinkedContextOptionId(linkedContexts = []) {
  const context = linkedContexts[0];
  if (!context) {
    return 'none';
  }

  return linkedContextOptions.find((option) => {
    if (!option.context) {
      return false;
    }

    return Object.entries(option.context).every(([key, value]) => context[key] === value);
  })?.id || 'none';
}

function getContextLabel(linkedContexts = []) {
  const optionId = getLinkedContextOptionId(linkedContexts);
  return linkedContextOptions.find((option) => option.id === optionId)?.label || '';
}

function createDraft({ date, item }) {
  return {
    id: item?.id || null,
    type: item?.diaryItemType || item?.type || TEACHER_DIARY_ITEM_TYPES.reminder,
    title: item?.title || '',
    note: item?.note || '',
    date: item?.date || item?.occurrenceDate || date,
    startTime: item?.startTime || item?.start || '14:00',
    endTime: item?.endTime || item?.end || addMinutes(item?.startTime || item?.start || '14:00', 30),
    contextId: getLinkedContextOptionId(item?.linkedContexts),
  };
}

function buildLinkedContexts(contextId) {
  const option = linkedContextOptions.find((item) => item.id === contextId);
  return option?.context ? [{ ...option.context }] : [];
}

function getAvailableTimeSuggestions(day) {
  return (day?.events || [])
    .filter((event) => event.start && event.end && ['flexible-work', 'soft'].includes(event.availability))
    .slice(0, 3)
    .map((event) => ({
      id: event.id,
      startTime: event.start,
      endTime: event.end,
      label: event.availability === 'flexible-work' ? 'Planning / flexible work' : 'Lunch / soft time',
    }));
}

function getDraftPlacementSummary(days, draft) {
  const day = (days || []).find((item) => item.date === draft.date);
  const dateLabel = day ? `${day.label} ${day.dateLabel}` : draft.date;

  if (draft.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent && draft.startTime) {
    return `${dateLabel} · ${draft.startTime}-${draft.endTime || addMinutes(draft.startTime, 30)}`;
  }

  return dateLabel;
}

function QuickDiaryItemDialog({
  open,
  mode,
  sourceTrigger,
  detailsExpanded,
  draft,
  errors,
  days,
  suggestions,
  rangeNotice,
  onToggleDetails,
  onChange,
  onApplySuggestion,
  onCancel,
  onSubmit,
}) {
  const detailsId = useId();
  const diaryEvent = draft.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent;
  const compactTimelineCreate = mode === 'create' && sourceTrigger === 'timeline';
  const showSecondaryFields = !compactTimelineCreate || detailsExpanded;
  const placementSummary = getDraftPlacementSummary(days, draft);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            border: '1px solid rgba(23, 21, 26, 0.1)',
            boxShadow: '0 22px 70px rgba(23, 21, 26, 0.18)',
          },
        },
      }}
    >
      <DialogTitle sx={{ color: darkText, fontSize: 18, fontWeight: 850 }}>
        {mode === 'edit' ? 'Edit item' : 'Add to week'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.35} sx={{ pt: 0.5 }}>
          <TextField
            label="What do you need to remember?"
            value={draft.title}
            onChange={(event) => onChange({ title: event.target.value.slice(0, TEACHER_DIARY_TITLE_MAX_LENGTH) })}
            error={Boolean(errors.title)}
            helperText={errors.title || `${draft.title.length}/${TEACHER_DIARY_TITLE_MAX_LENGTH}`}
            inputProps={{ maxLength: TEACHER_DIARY_TITLE_MAX_LENGTH, 'aria-describedby': errors.title ? 'diary-title-error' : undefined }}
            FormHelperTextProps={{ id: errors.title ? 'diary-title-error' : undefined }}
            autoFocus
            fullWidth
          />
          <TextField
            select
            label="Related to"
            value={draft.contextId}
            onChange={(event) => onChange({ contextId: event.target.value })}
            fullWidth
          >
            {linkedContextOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
            ))}
          </TextField>
          {compactTimelineCreate && (
            <>
              <Typography
                onClick={() => onToggleDetails?.()}
                sx={{
                  color: 'text.secondary',
                  fontSize: 12.3,
                  lineHeight: 1.35,
                  cursor: 'pointer',
                }}
              >
                {placementSummary}
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={onToggleDetails}
                aria-expanded={detailsExpanded ? 'true' : 'false'}
                aria-controls={detailsId}
                sx={{
                  alignSelf: 'flex-start',
                  minHeight: 28,
                  px: 0.75,
                  borderRadius: '9px',
                  color: 'text.secondary',
                  fontWeight: 780,
                  '& .MuiSvgIcon-root': {
                    fontSize: 17,
                    transform: detailsExpanded ? 'rotate(90deg)' : 'none',
                    transition: 'transform 160ms ease',
                  },
                }}
              >
                <KeyboardArrowRightIcon />
                {detailsExpanded ? 'Fewer details' : 'More details'}
              </Button>
            </>
          )}
          <Collapse id={detailsId} in={showSecondaryFields} timeout={160} unmountOnExit>
            <Stack spacing={1.35} sx={{ pt: compactTimelineCreate ? 0.25 : 0 }}>
              <TextField
                select
                label="Type"
                value={draft.type}
                onChange={(event) => onChange({ type: event.target.value })}
                fullWidth
              >
                <MenuItem value={TEACHER_DIARY_ITEM_TYPES.reminder}>Reminder</MenuItem>
                <MenuItem value={TEACHER_DIARY_ITEM_TYPES.diaryEvent}>Diary event</MenuItem>
              </TextField>
              <TextField
                select
                label="Day"
                value={draft.date}
                onChange={(event) => onChange({ date: event.target.value })}
                error={Boolean(errors.date)}
                helperText={errors.date || ''}
                fullWidth
              >
                {days.map((day) => (
                  <MenuItem key={day.date} value={day.date}>{day.label} · {day.dateLabel}</MenuItem>
                ))}
              </TextField>
              {diaryEvent && (
                <>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label="Start time"
                      type="time"
                      value={draft.startTime}
                      onChange={(event) => onChange({ startTime: event.target.value })}
                      error={Boolean(errors.startTime)}
                      helperText={errors.startTime || ''}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Optional end time"
                      type="time"
                      value={draft.endTime}
                      onChange={(event) => onChange({ endTime: event.target.value })}
                      error={Boolean(errors.endTime)}
                      helperText={errors.endTime || ''}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                  {!!suggestions.length && (
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" aria-label="Time suggestions">
                      {suggestions.map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          size="small"
                          variant="outlined"
                          onClick={() => onApplySuggestion(suggestion)}
                          sx={{ borderRadius: 999, color: purple, borderColor: 'rgba(156, 40, 175, 0.22)', fontWeight: 760 }}
                        >
                          {suggestion.label} · {suggestion.startTime}
                        </Button>
                      ))}
                    </Stack>
                  )}
                  {!!rangeNotice && (
                    <Typography sx={{ color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35 }}>
                      {rangeNotice}
                    </Typography>
                  )}
                </>
              )}
              <TextField
                label="Note"
                value={draft.note}
                onChange={(event) => onChange({ note: event.target.value.slice(0, TEACHER_DIARY_NOTE_MAX_LENGTH) })}
                helperText={`${draft.note.length}/${TEACHER_DIARY_NOTE_MAX_LENGTH}`}
                inputProps={{ maxLength: TEACHER_DIARY_NOTE_MAX_LENGTH }}
                multiline
                minRows={2}
                fullWidth
              />
            </Stack>
          </Collapse>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.25 }}>
        <Button onClick={onCancel} sx={{ color: 'text.secondary', fontWeight: 760 }}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} sx={{ bgcolor: purple, '&:hover': { bgcolor: '#852196' } }}>
          {mode === 'edit' ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ReminderDetailPanel({ reminder, id, onMouseEnter, onMouseLeave, onEditItem, onDeleteItem }) {
  const contextLabel = getContextLabel(reminder.linkedContexts);

  return (
    <Paper
      id={id}
      elevation={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        width: 226,
        maxWidth: 'min(226px, calc(100vw - 32px))',
        p: 1.35,
        borderRadius: '14px',
        border: '1px solid rgba(23, 21, 26, 0.1)',
        bgcolor: 'rgba(255, 255, 255, 0.96)',
        boxShadow: '0 18px 42px rgba(23, 21, 26, 0.14)',
        backdropFilter: 'blur(18px) saturate(1.08)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.08)',
      }}
    >
      <Typography sx={{ color: darkText, fontSize: 14.5, lineHeight: 1.25, fontWeight: 840 }}>
        {reminder.title}
      </Typography>
      <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.4, fontWeight: 720 }}>
        {reminder.date}
      </Typography>
      {!!contextLabel && (
        <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35 }}>
          {contextLabel}
        </Typography>
      )}
      {!!reminder.note && (
        <Box sx={{ mt: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 780 }}>
            Note
          </Typography>
          <Typography sx={{ mt: 0.25, color: darkText, fontSize: 13.1, lineHeight: 1.38 }}>
            {reminder.note}
          </Typography>
        </Box>
      )}
      <Stack direction="row" spacing={0.75} sx={{ mt: 1.1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onEditItem(reminder)}
          aria-label={`Edit reminder ${reminder.title}`}
          sx={{
            minHeight: 28,
            px: 1,
            borderRadius: '9px',
            color: purple,
            borderColor: 'rgba(156, 40, 175, 0.24)',
            fontWeight: 760,
          }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={() => {
            if (window.confirm('Delete this reminder?')) {
              onDeleteItem(reminder);
            }
          }}
          aria-label={`Delete reminder ${reminder.title}`}
          sx={{ minHeight: 28, px: 1, borderRadius: '9px', color: 'text.secondary', fontWeight: 760 }}
        >
          Delete
        </Button>
      </Stack>
    </Paper>
  );
}

function ReminderCard({ reminder, onEditItem, onDeleteItem }) {
  const detailId = useId();
  const expandButtonRef = useRef(null);
  const closeTimerRef = useRef(null);
  const buttonHoveredRef = useRef(false);
  const panelHoveredRef = useRef(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const contextLabel = getContextLabel(reminder.linkedContexts);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
  }, []);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openDetails() {
    clearCloseTimer();
    setDetailOpen(true);
  }

  function closeDetails() {
    clearCloseTimer();
    buttonHoveredRef.current = false;
    panelHoveredRef.current = false;
    setDetailOpen(false);
  }

  function scheduleCloseDetails() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      if (!buttonHoveredRef.current && !panelHoveredRef.current) {
        setDetailOpen(false);
      }
    }, 110);
  }

  return (
    <ClickAwayListener onClickAway={closeDetails}>
      <Box sx={{ position: 'relative', flex: { sm: '1 1 220px' }, minWidth: 0 }}>
        <Paper
          elevation={0}
          tabIndex={0}
          aria-label={[reminder.title, reminder.date, contextLabel].filter(Boolean).join(', ')}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              scheduleCloseDetails();
            }
          }}
          sx={{
            position: 'relative',
            minWidth: 0,
            p: 1.1,
            pr: 3.7,
            borderRadius: '12px',
            border: '1px solid rgba(23, 21, 26, 0.08)',
            bgcolor: 'rgba(255, 255, 255, 0.58)',
            overflow: 'hidden',
            transition: 'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
            '&:hover': {
              bgcolor: '#fff',
              borderColor: 'rgba(156, 40, 175, 0.28)',
              boxShadow: '0 8px 18px rgba(23, 21, 26, 0.045)',
              transform: 'translateY(-1px)',
            },
            '&:focus-visible': {
              outline: '3px solid rgba(156, 40, 175, 0.2)',
              outlineOffset: 2,
            },
            '&:hover .WeekItemExpandButton, &:focus-within .WeekItemExpandButton': {
              opacity: 1,
              pointerEvents: 'auto',
            },
          }}
        >
          <Typography sx={{ color: darkText, fontSize: 13.5, lineHeight: 1.25, fontWeight: 820, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {reminder.title}
          </Typography>
          <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[reminder.date, contextLabel].filter(Boolean).join(' · ')}
          </Typography>
          <IconButton
            ref={expandButtonRef}
            className="WeekItemExpandButton"
            aria-label={`Show details for reminder ${reminder.title}`}
            aria-describedby={detailOpen ? detailId : undefined}
            aria-expanded={detailOpen ? 'true' : 'false'}
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              setDetailOpen((currentOpen) => !currentOpen);
            }}
            onMouseEnter={() => {
              buttonHoveredRef.current = true;
              openDetails();
            }}
            onMouseLeave={() => {
              buttonHoveredRef.current = false;
              scheduleCloseDetails();
            }}
            onFocus={openDetails}
            onBlur={scheduleCloseDetails}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              color: 'text.secondary',
              bgcolor: 'rgba(255, 255, 255, 0.78)',
              border: '1px solid rgba(23, 21, 26, 0.08)',
              opacity: detailOpen ? 1 : 0,
              pointerEvents: detailOpen ? 'auto' : 'none',
              transition: 'opacity 160ms ease, background-color 160ms ease, border-color 160ms ease',
              '&:hover': {
                bgcolor: '#fff',
                borderColor: 'rgba(23, 21, 26, 0.14)',
              },
              '&:focus-visible': {
                outline: '2px solid rgba(156, 40, 175, 0.24)',
                outlineOffset: 1,
              },
              '& .MuiSvgIcon-root': {
                fontSize: 14,
              },
            }}
          >
            <OpenInFullIcon />
          </IconButton>
        </Paper>

        <Popper
          open={detailOpen}
          anchorEl={expandButtonRef.current}
          placement="right-start"
          modifiers={[
            { name: 'offset', options: { offset: [0, 8] } },
            { name: 'preventOverflow', options: { padding: 12 } },
          ]}
          sx={{ zIndex: 1400 }}
        >
          <ReminderDetailPanel
            id={detailId}
            reminder={reminder}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onMouseEnter={() => {
              panelHoveredRef.current = true;
              openDetails();
            }}
            onMouseLeave={() => {
              panelHoveredRef.current = false;
              scheduleCloseDetails();
            }}
          />
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

function WeekReminderStrip({ reminders, onEditItem, onDeleteItem }) {
  if (!reminders.length) {
    return null;
  }

  return (
    <Box sx={{ mt: 1.2 }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 780 }}>
        Things you chose to keep in view
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.85} useFlexGap flexWrap="wrap" sx={{ mt: 0.65 }}>
        {reminders.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
          />
        ))}
      </Stack>
    </Box>
  );
}

function WeekPositionStrip({ days, currentDayId, selectedDayId, onSelectDay }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'flex', sm: 'none' }, overflowX: 'auto', pb: 0.25 }}>
      {days.map((day) => {
        const current = day.id === currentDayId;
        const selected = day.id === selectedDayId;

        return (
          <Button
            key={day.id}
            variant="outlined"
            onClick={() => onSelectDay(day.id)}
            sx={{
              flex: '0 0 auto',
              minWidth: 76,
              minHeight: 34,
              justifyContent: 'center',
              borderRadius: 999,
              bgcolor: current ? '#fbf5fd' : '#fff',
              color: current || selected ? purple : darkText,
              borderColor: current || selected ? 'rgba(156, 40, 175, 0.34)' : 'rgba(23, 21, 26, 0.11)',
              '&:hover': {
                bgcolor: '#fbf5fd',
                borderColor: 'rgba(156, 40, 175, 0.36)',
              },
            }}
          >
            {day.shortLabel}
          </Button>
        );
      })}
    </Stack>
  );
}

export default function MyWeekModal({ open, onClose, onOpenClass }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const addButtonRef = useRef(null);
  const dialogReturnRef = useRef(null);
  const addModeResetTimerRef = useRef(null);
  const currentWeekContext = getCurrentWeekContext(annaSchedule);
  const [selectedDayId, setSelectedDayId] = useState(currentWeekContext.currentDayId);
  const [activeRelation, setActiveRelation] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [quickDialogMode, setQuickDialogMode] = useState('create');
  const [quickDialogSourceTrigger, setQuickDialogSourceTrigger] = useState('header');
  const [quickDialogDetailsExpanded, setQuickDialogDetailsExpanded] = useState(true);
  const [draft, setDraft] = useState(() => createDraft({ date: currentWeekContext.date }));
  const [draftErrors, setDraftErrors] = useState({});
  const [addInteractionMode, setAddInteractionMode] = useState('idle');
  const [previewResetKey, setPreviewResetKey] = useState(0);
  const {
    diaryItems,
    createDiaryItem,
    updateDiaryItem,
    deleteDiaryItem,
  } = useTeacherDiaryItems({
    teacherId: 'anna',
    initialItems: teacherDiarySeedItems,
  });
  const diaryEvents = useMemo(() => getDiaryItemsByType(diaryItems, TEACHER_DIARY_ITEM_TYPES.diaryEvent), [diaryItems]);
  const reminders = useMemo(() => getDiaryItemsByType(diaryItems, TEACHER_DIARY_ITEM_TYPES.reminder), [diaryItems]);
  const visibleWeekStart = shiftIsoDate(currentWeekContext.weekStart, weekOffset * 7);
  const weekContext = useMemo(() => getCurrentWeekContext(annaSchedule, {
    weekStart: visibleWeekStart,
    diaryEvents,
    reminders,
  }), [diaryEvents, reminders, visibleWeekStart]);
  const currentDay = getCurrentDay(currentWeekContext.days, currentWeekContext.currentDayId);
  const weekDays = weekContext.days;

  const selectedDay = weekDays.find((day) => day.id === selectedDayId) || weekDays[0];
  const visibleDays = mobile ? [selectedDay] : weekDays;
  const visibleWeekNumber = currentWeekContext.weekNumber + weekOffset;
  const weekReminders = weekDays.flatMap((day) => day.reminders || []);
  const selectedDraftDay = weekDays.find((day) => day.date === draft.date) || selectedDay;
  const timeSuggestions = draft.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent
    ? getAvailableTimeSuggestions(selectedDraftDay)
    : [];
  const draftEndTime = draft.endTime || addMinutes(draft.startTime, 30);
  const draftRangeOverlaps = draft.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent
    && draft.startTime
    && draftEndTime
    && (selectedDraftDay?.events || []).some((item) => timeRangeOverlapsItem({
      startTime: draft.startTime,
      endTime: draftEndTime,
      item,
      draftId: draft.id,
    }));
  const sharedTimetable = useMemo(() => getSharedWeekTimetableLayout({
    workingPattern: annaWorkingPattern,
    weekDays,
  }), [weekDays]);

  useEffect(() => () => {
    clearAddModeResetTimer();
  }, []);

  useEffect(() => {
    resetAddInteractionMode();
  }, [visibleWeekStart]);

  function clearAddModeResetTimer() {
    if (addModeResetTimerRef.current) {
      window.clearTimeout(addModeResetTimerRef.current);
      addModeResetTimerRef.current = null;
    }
  }

  function refreshAddModeResetTimer() {
    clearAddModeResetTimer();
    addModeResetTimerRef.current = window.setTimeout(() => {
      setAddInteractionMode('idle');
      setPreviewResetKey((currentKey) => currentKey + 1);
      addModeResetTimerRef.current = null;
    }, ADD_MODE_RESET_DELAY_MS);
  }

  function markAddInteractionActive() {
    setAddInteractionMode('armed');
    refreshAddModeResetTimer();
  }

  function resetAddInteractionMode() {
    clearAddModeResetTimer();
    setAddInteractionMode('idle');
    setPreviewResetKey((currentKey) => currentKey + 1);
  }

  function getDefaultDate() {
    if (weekOffset === 0 && weekDays.some((day) => day.date === currentWeekContext.date)) {
      return currentWeekContext.date;
    }

    return selectedDay?.date || weekDays[0]?.date || visibleWeekStart;
  }

  function openQuickAdd({
    type = TEACHER_DIARY_ITEM_TYPES.reminder,
    date = getDefaultDate(),
    startTime = '14:00',
    endTime,
    linkedContext = 'none',
    sourceTrigger = 'header',
  } = {}) {
    setPreviewResetKey((currentKey) => currentKey + 1);
    setQuickDialogMode('create');
    setQuickDialogSourceTrigger(sourceTrigger);
    setQuickDialogDetailsExpanded(sourceTrigger !== 'timeline');
    setDraft({
      id: null,
      type,
      title: '',
      note: '',
      date,
      startTime,
      endTime: endTime || addMinutes(startTime, 30),
      contextId: linkedContext,
    });
    setDraftErrors({});
    setQuickDialogOpen(true);
  }

  function openCreateDialog() {
    dialogReturnRef.current = addButtonRef.current;
    openQuickAdd({ sourceTrigger: 'header' });
  }

  function handleTimelineQuickAdd({ date, startTime, endTime }) {
    dialogReturnRef.current = document.activeElement;
    markAddInteractionActive();
    openQuickAdd({
      type: TEACHER_DIARY_ITEM_TYPES.diaryEvent,
      date,
      startTime,
      endTime,
      linkedContext: 'none',
      sourceTrigger: 'timeline',
    });
  }

  function openEditDialog(item) {
    dialogReturnRef.current = document.activeElement;
    setQuickDialogMode('edit');
    setQuickDialogSourceTrigger('edit');
    setQuickDialogDetailsExpanded(true);
    setDraft(createDraft({ date: item.date || getDefaultDate(), item }));
    setDraftErrors({});
    setQuickDialogOpen(true);
  }

  function closeQuickDialog() {
    setQuickDialogOpen(false);
    refreshAddModeResetTimer();
    window.requestAnimationFrame(() => {
      if (dialogReturnRef.current && typeof dialogReturnRef.current.focus === 'function') {
        dialogReturnRef.current.focus();
        return;
      }

      addButtonRef.current?.focus();
    });
  }

  function validateDraft() {
    const nextErrors = {};
    const title = draft.title.trim();

    if (!title) {
      nextErrors.title = 'Add a title.';
    }

    if (!draft.date) {
      nextErrors.date = 'Choose a day.';
    }

    if (draft.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent) {
      if (!draft.startTime) {
        nextErrors.startTime = 'Choose a start time.';
      }

      const endTime = draft.endTime || addMinutes(draft.startTime, 30);
      if (draft.startTime && !isEndAfterStart(draft.startTime, endTime)) {
        nextErrors.endTime = 'End time must be after start time.';
      }
    }

    setDraftErrors(nextErrors);
    if (
      !quickDialogDetailsExpanded
      && (nextErrors.date || nextErrors.startTime || nextErrors.endTime)
    ) {
      setQuickDialogDetailsExpanded(true);
    }
    return !Object.keys(nextErrors).length;
  }

  function buildItemInput() {
    const title = draft.title.trim().slice(0, TEACHER_DIARY_TITLE_MAX_LENGTH);
    const note = draft.note.trim().slice(0, TEACHER_DIARY_NOTE_MAX_LENGTH);
    const linkedContexts = buildLinkedContexts(draft.contextId);

    if (draft.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent) {
      return {
        type: TEACHER_DIARY_ITEM_TYPES.diaryEvent,
        title,
        note,
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime || addMinutes(draft.startTime, 30),
        availability: 'busy',
        linkedContexts,
      };
    }

    return {
      type: TEACHER_DIARY_ITEM_TYPES.reminder,
      title,
      note,
      date: draft.date,
      startTime: null,
      endTime: null,
      availability: null,
      linkedContexts,
    };
  }

  function submitQuickDialog() {
    if (!validateDraft()) {
      return;
    }

    const itemInput = buildItemInput();
    if (quickDialogMode === 'edit' && draft.id) {
      updateDiaryItem(draft.id, itemInput);
    } else {
      createDiaryItem(itemInput);
    }

    closeQuickDialog();
  }

  function handleDeleteItem(item) {
    deleteDiaryItem(item.id);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Grow}
      transitionDuration={{ enter: 320, exit: 240 }}
      maxWidth={false}
      fullScreen={mobile}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 'calc(100vw - 48px)' },
            maxWidth: 1150,
            maxHeight: { xs: '100%', sm: '88vh' },
            borderRadius: { xs: 0, sm: '26px' },
            bgcolor: { xs: 'rgba(255, 255, 255, 0.97)', sm: 'rgba(255, 255, 255, 0.72)' },
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(251, 245, 253, 0.38))',
            border: '1px solid rgba(255, 255, 255, 0.72)',
            boxShadow: '0 28px 90px rgba(23, 21, 26, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.68)',
            backdropFilter: 'blur(26px) saturate(1.16)',
            WebkitBackdropFilter: 'blur(26px) saturate(1.16)',
            overflow: 'hidden',
          },
        },
        backdrop: {
          sx: {
            bgcolor: 'rgba(23, 21, 26, 0.14)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxHeight: { xs: '100%', sm: '88vh' },
          overflowY: 'auto',
          p: { xs: 2, sm: 3, md: 3.5 },
          px: { xs: 2, sm: 6.2, md: 6.8 },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
          },
          '& > *': {
            position: 'relative',
            zIndex: 1,
          },
        }}
      >
        <IconButton
          aria-label="Close My week"
          onClick={onClose}
          sx={{ position: 'absolute', top: { xs: 12, sm: 18 }, right: { xs: 12, sm: 18 }, zIndex: 2 }}
        >
          <CloseIcon />
        </IconButton>

        <IconButton
          aria-label="Show previous week"
          size="small"
          disabled={weekOffset <= -1}
          onClick={() => setWeekOffset((current) => Math.max(-1, current - 1))}
          sx={{
            position: 'absolute',
            left: { xs: 8, sm: 14 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            color: 'text.secondary',
            bgcolor: 'rgba(255, 255, 255, 0.74)',
            border: '1px solid rgba(23, 21, 26, 0.08)',
            boxShadow: '0 10px 28px rgba(23, 21, 26, 0.08)',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        <IconButton
          aria-label="Show next week"
          size="small"
          disabled={weekOffset >= 1}
          onClick={() => setWeekOffset((current) => Math.min(1, current + 1))}
          sx={{
            position: 'absolute',
            right: { xs: 8, sm: 14 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            color: 'text.secondary',
            bgcolor: 'rgba(255, 255, 255, 0.74)',
            border: '1px solid rgba(23, 21, 26, 0.08)',
            boxShadow: '0 10px 28px rgba(23, 21, 26, 0.08)',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ pr: { xs: 5, sm: 0 } }}
        >
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 13, fontWeight: 780 }}>
            Week {visibleWeekNumber}
          </Typography>
          <Button
            ref={addButtonRef}
            size="small"
            variant="outlined"
            onClick={openCreateDialog}
            aria-label="Add diary item or reminder to this week"
            sx={{
              minHeight: 28,
              px: 1.15,
              borderRadius: '10px',
              color: purple,
              borderColor: 'rgba(156, 40, 175, 0.24)',
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 800,
              '&:hover': { bgcolor: '#fff', borderColor: 'rgba(156, 40, 175, 0.36)' },
            }}
          >
            + Add
          </Button>
        </Stack>

        <Box sx={{ mt: { xs: 2, sm: 0 } }}>
          <WeekPositionStrip
            days={weekContext.days}
            currentDayId={weekOffset === 0 ? currentWeekContext.currentDayId : ''}
            selectedDayId={selectedDayId}
            onSelectDay={setSelectedDayId}
          />
        </Box>

        <Box
          sx={{
            mt: { xs: 1.5, sm: 2.35 },
            maxHeight: { xs: 'calc(100vh - 126px)', sm: 'calc(88vh - 118px)' },
            overflowY: 'auto',
            overflowX: { xs: 'hidden', sm: 'auto', lg: 'hidden' },
            scrollbarGutter: 'stable',
            pb: 0.5,
          }}
        >
          <Box
            sx={{
              display: { xs: 'block', sm: 'flex', lg: 'grid' },
              gridTemplateColumns: { lg: 'repeat(5, minmax(0, 1fr))' },
              gap: 1.1,
              minWidth: { sm: 'max-content', lg: 0 },
            }}
          >
            {visibleDays.map((day) => (
              <Box key={day.id} sx={{ flex: { sm: '0 0 224px', md: '0 0 232px', lg: 'initial' }, minWidth: 0 }}>
                <WeekDayColumn
                  day={day}
                  events={day.events}
                  sharedTimetable={sharedTimetable}
                  current={weekOffset === 0 && day.id === currentDay.id}
                  currentTime={weekOffset === 0 && day.id === currentDay.id ? currentWeekContext.currentTime : null}
                  activeRelation={activeRelation}
                  onRelationFocus={setActiveRelation}
                  onOpenClass={onOpenClass}
                  onEditItem={openEditDialog}
                  onDeleteItem={handleDeleteItem}
                  workingDay={annaWorkingPattern.days[day.id]}
                  onTimelineQuickAdd={handleTimelineQuickAdd}
                  addInteractionMode={addInteractionMode}
                  onAddPreviewShown={markAddInteractionActive}
                  previewResetKey={previewResetKey}
                />
              </Box>
            ))}
          </Box>
          <WeekReminderStrip
            reminders={weekReminders}
            onEditItem={openEditDialog}
            onDeleteItem={handleDeleteItem}
          />
        </Box>

      </Box>
      <QuickDiaryItemDialog
        open={quickDialogOpen}
        mode={quickDialogMode}
        sourceTrigger={quickDialogSourceTrigger}
        detailsExpanded={quickDialogDetailsExpanded}
        draft={draft}
        errors={draftErrors}
        days={weekDays}
        suggestions={timeSuggestions}
        rangeNotice={draftRangeOverlaps ? 'This time overlaps another item.' : ''}
        onToggleDetails={() => setQuickDialogDetailsExpanded((currentValue) => !currentValue)}
        onChange={(updates) => {
          setDraft((currentDraft) => {
            const nextDraft = { ...currentDraft, ...updates };
            if (updates.type === TEACHER_DIARY_ITEM_TYPES.diaryEvent && currentDraft.type !== TEACHER_DIARY_ITEM_TYPES.diaryEvent) {
              nextDraft.startTime = currentDraft.startTime || '14:00';
              nextDraft.endTime = currentDraft.endTime || addMinutes(nextDraft.startTime, 30);
            }
            return nextDraft;
          });
          setDraftErrors({});
        }}
        onApplySuggestion={(suggestion) => {
          setDraft((currentDraft) => ({
            ...currentDraft,
            startTime: suggestion.startTime,
            endTime: suggestion.endTime,
          }));
          setDraftErrors({});
        }}
        onCancel={closeQuickDialog}
        onSubmit={submitQuickDialog}
      />
    </Dialog>
  );
}
