import { useEffect, useId, useRef, useState } from 'react';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Button, ClickAwayListener, IconButton, Paper, Popper, Stack, Typography } from '@mui/material';
import {
  ADD_HOVER_MOVEMENT_TOLERANCE_PX,
  ARMED_ADD_HOVER_DELAY_MS,
  assignDayOverlapColumns,
  canQuickAddAtMinute,
  getItemStartMinutes,
  getTimeFromTimelinePointer,
  getTimedItemGeometry,
  getTimedItemContentDensity,
  getTimelinePlacementCapability,
  getWorkingDayGeometry,
  INITIAL_ADD_HOVER_DELAY_MS,
  minutesToTimeString,
  TIMELINE_ADD_SNAP_MINUTES,
  timeStringToMinutes,
} from '../utils/weekViewUtils.js';

const purple = '#9c28af';
const darkText = '#17151a';
const TIMELINE_TAP_MOVE_TOLERANCE = 7;
const DEFAULT_TIMELINE_ADD_DURATION_MINUTES = 30;
const MIN_TIMELINE_ADD_DURATION_MINUTES = 10;

const compactTitles = {
  Mathematics: 'Ma',
  English: 'En',
  'Physical Education': 'PE',
  'Mentor time': 'Mentor',
  'Planning time': 'Planning',
  'Planning and administration': 'Planning',
  'Preparation and documentation': 'Planning',
  'Follow-up and preparation': 'Follow-up',
  'Planning and student follow-up': 'Follow-up',
  'Weekly planning and SmartDesk review': 'Weekly review',
  'Department planning and preparation': 'Department planning',
  'Team meeting': 'Team meeting',
  'Break / follow-up': 'Break',
  Break: 'Break',
  Lunch: 'Lunch',
};

function getWeekItemVisualVariant(event) {
  if (event.availability === 'soft') {
    return 'soft';
  }

  if (event.source === 'smartdesk' && event.start && event.end) {
    return 'fixed';
  }

  if (event.availability === 'flexible-work') {
    return 'flexible';
  }

  return 'fixed';
}

function getEventStyles(variant) {
  if (variant === 'lesson') {
    return {
      borderColor: 'rgba(156, 40, 175, 0.38)',
      bgcolor: '#fff',
      borderStyle: 'solid',
      boxShadow: 'none',
    };
  }

  if (variant === 'soft') {
    return {
      borderColor: 'rgba(23, 21, 26, 0.035)',
      bgcolor: 'rgba(255, 255, 255, 0.22)',
      borderStyle: 'solid',
      boxShadow: 'none',
    };
  }

  if (variant === 'flexible') {
    return {
      borderColor: 'rgba(23, 21, 26, 0.08)',
      bgcolor: 'rgba(255, 255, 255, 0.48)',
      borderStyle: 'dashed',
      boxShadow: 'none',
    };
  }

  return {
    borderColor: 'rgba(23, 21, 26, 0.1)',
    bgcolor: '#fff',
    borderStyle: 'solid',
    boxShadow: 'none',
  };
}

function getDisplayTitle(event) {
  const compactTitle = compactTitles[event.title] || event.title;

  if (event.type === 'lesson' && event.className) {
    return `${event.className} · ${compactTitles[event.subject] || compactTitle}`;
  }

  if (event.type === 'mentor' && event.className) {
    return `${event.className} · Mentor`;
  }

  return compactTitle;
}

function getFullWeekItemTitle(event) {
  if (event.type === 'lesson' && event.className && event.subject) {
    return `${event.className} · ${event.subject}`;
  }

  if (event.type === 'mentor' && event.className) {
    return `${event.className} · Mentor time`;
  }

  return event.title || getDisplayTitle(event);
}

function formatContextLabel(context) {
  return [
    context.classId?.toUpperCase(),
    context.moduleId,
    context.planningBlockId,
    context.studentId,
  ].filter(Boolean).join(' · ');
}

function getWeekItemDetailRows(event) {
  const fullTitle = getFullWeekItemTitle(event);
  const contextLabels = (event.linkedContexts || []).map(formatContextLabel).filter(Boolean);

  return {
    fullTitle,
    date: event.date || event.occurrenceDate || '',
    timeRange: [event.start, event.end].filter(Boolean).join('-'),
    focus: event.subtitle || event.topic || '',
    note: event.note || '',
    location: event.location || '',
    typeLabel: event.type ? event.type.replace(/-/g, ' ') : '',
    contextLabels,
  };
}

function hasHiddenWeekItemDetails(event, contentDensity) {
  const visibleTitle = getDisplayTitle(event);
  const fullTitle = getFullWeekItemTitle(event);
  const subtitleHidden = contentDensity !== 'full' && Boolean(event.topic || event.subtitle);
  const timeHidden = ['minimal', 'tiny'].includes(contentDensity) && event.start && event.end;

  return Boolean(
    canManageTeacherDiaryItem(event)
    || subtitleHidden
    || event.note
    || event.location
    || event.linkedContexts?.length
    || fullTitle !== visibleTitle
    || timeHidden
  );
}

function getLessonKey(event) {
  if (event.type !== 'lesson' || !event.className || !event.subject) {
    return null;
  }

  return `${event.className}-${event.subject}`.toLowerCase();
}

function getEventRelation(event) {
  const lessonKey = getLessonKey(event);

  if (lessonKey) {
    return { kind: 'lesson', key: lessonKey };
  }

  if (['break', 'planning', 'follow-up', 'lunch', 'meeting', 'parent-contact'].includes(event.type)) {
    return { kind: 'event', key: event.type };
  }

  return null;
}

function canOpenClass(event) {
  return event.type === 'lesson' && event.className === '7A' && event.subject === 'Mathematics';
}

function canManageTeacherDiaryItem(event) {
  return event.source === 'smartdesk' && event.createdBy === 'teacher';
}

function getEventAccessibleLabel(event) {
  const details = getWeekItemDetailRows(event);
  return [
    details.timeRange,
    details.fullTitle,
    details.focus,
  ].filter(Boolean).join(', ');
}

function isInteractiveTimelineTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  const timedItem = target.closest('[data-week-timed-item="true"]');
  const timedItemCapability = timedItem?.getAttribute('data-week-placement-capability');

  return Boolean(
    target.closest('button, .MuiPopper-root')
    || (timedItem && timedItemCapability !== 'addable-container')
  );
}

function getSuggestedEndMinutes({ startMinutes, events, workingEndMinutes }) {
  const defaultEndMinutes = startMinutes + DEFAULT_TIMELINE_ADD_DURATION_MINUTES;
  const nextStartMinutes = (events || [])
    .map(getItemStartMinutes)
    .filter((minutes) => Number.isFinite(minutes) && minutes > startMinutes)
    .sort((first, second) => first - second)[0];

  if (Number.isFinite(nextStartMinutes)) {
    const gapMinutes = nextStartMinutes - startMinutes;
    if (gapMinutes >= MIN_TIMELINE_ADD_DURATION_MINUTES && gapMinutes < DEFAULT_TIMELINE_ADD_DURATION_MINUTES) {
      return Math.min(nextStartMinutes, workingEndMinutes);
    }
  }

  return Math.min(defaultEndMinutes, workingEndMinutes);
}

function EventDetailPanel({ event, id, onMouseEnter, onMouseLeave, onEditItem, onDeleteItem }) {
  const details = getWeekItemDetailRows(event);
  const manageable = canManageTeacherDiaryItem(event);
  const itemKind = event.diaryItemType === 'reminder' || event.type === 'reminder' ? 'reminder' : 'diary item';

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
        {details.fullTitle}
      </Typography>
      {!!details.date && (
        <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.4, fontWeight: 720 }}>
          {details.date}
        </Typography>
      )}
      {!!details.timeRange && (
        <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.4, fontWeight: 720 }}>
          {details.timeRange}
        </Typography>
      )}
      {!!details.focus && (
        <Typography sx={{ mt: 1, color: darkText, fontSize: 13.2, lineHeight: 1.38 }}>
          {details.focus}
        </Typography>
      )}
      {!!details.note && (
        <Box sx={{ mt: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 780 }}>
            {manageable ? 'Note' : 'Lesson note'}
          </Typography>
          <Typography sx={{ mt: 0.25, color: darkText, fontSize: 13.1, lineHeight: 1.38 }}>
            {details.note}
          </Typography>
        </Box>
      )}
      {(!!details.location || !!details.contextLabels.length || !!details.typeLabel) && (
        <Stack spacing={0.35} sx={{ mt: 1 }}>
          {!!details.location && (
            <Typography sx={{ color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35 }}>
              {details.location}
            </Typography>
          )}
          {details.contextLabels.map((label) => (
            <Typography key={label} sx={{ color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35 }}>
              {label}
            </Typography>
          ))}
          {!!details.typeLabel && (
            <Typography sx={{ color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35, textTransform: 'capitalize' }}>
              {details.typeLabel}
            </Typography>
          )}
        </Stack>
      )}
      {manageable && (
        <Stack direction="row" spacing={0.75} sx={{ mt: 1.1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onEditItem?.(event)}
            aria-label={`Edit ${details.fullTitle}`}
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
              if (window.confirm(`Delete this ${itemKind}?`)) {
                onDeleteItem?.(event);
              }
            }}
            aria-label={`Delete ${details.fullTitle}`}
            sx={{ minHeight: 28, px: 1, borderRadius: '9px', color: 'text.secondary', fontWeight: 760 }}
          >
            Delete
          </Button>
        </Stack>
      )}
    </Paper>
  );
}

function EventCard({ event, height, activeRelation, onRelationFocus, onOpenClass, onEditItem, onDeleteItem }) {
  const detailId = useId();
  const expandButtonRef = useRef(null);
  const closeTimerRef = useRef(null);
  const buttonHoveredRef = useRef(false);
  const panelHoveredRef = useRef(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const visualVariant = event.type === 'lesson' ? 'lesson' : getWeekItemVisualVariant(event);
  const placementCapability = getTimelinePlacementCapability(event);
  const styles = getEventStyles(visualVariant);
  const isSoft = visualVariant === 'soft';
  const isFlexible = visualVariant === 'flexible';
  const relation = getEventRelation(event);
  const highlighted = relation && relation.kind === activeRelation?.kind && relation.key === activeRelation?.key;
  const lessonHighlighted = highlighted && relation.kind === 'lesson';
  const borderHighlighted = highlighted && relation.kind !== 'lesson';
  const opensClass = canOpenClass(event);
  const contentDensity = getTimedItemContentDensity(height);
  const isFullDensity = contentDensity === 'full';
  const isCompactDensity = contentDensity === 'compact';
  const isMinimalDensity = contentDensity === 'minimal';
  const isTinyDensity = contentDensity === 'tiny';
  const titleOnly = isMinimalDensity || isTinyDensity;
  const showTime = isFullDensity || isCompactDensity;
  const hasHiddenDetails = hasHiddenWeekItemDetails(event, contentDensity);
  const softPurple = '#f5e6f8';
  const highlightedText = '#5f1b6b';
  const accessibleLabel = getEventAccessibleLabel(event);

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

  function handleCardClick() {
    onOpenClass?.(event);
  }

  function handleKeyDown(eventToHandle) {
    if (eventToHandle.key === 'Escape' && detailOpen) {
      eventToHandle.stopPropagation();
      closeDetails();
      expandButtonRef.current?.focus();
      return;
    }

    if (opensClass && (eventToHandle.key === 'Enter' || eventToHandle.key === ' ')) {
      eventToHandle.preventDefault();
      onOpenClass?.(event);
    }
  }

  function handleExpandClick(eventToHandle) {
    eventToHandle.stopPropagation();
    setDetailOpen((currentOpen) => {
      if (currentOpen) {
        buttonHoveredRef.current = false;
        panelHoveredRef.current = false;
      }

      return !currentOpen;
    });
  }

  return (
    <ClickAwayListener onClickAway={closeDetails}>
      <Box sx={{ position: 'relative', width: '100%', height }}>
        <Paper
          component="article"
          data-week-timed-item="true"
          data-week-placement-capability={placementCapability}
          role={opensClass ? 'button' : undefined}
          aria-label={opensClass ? `Open ${accessibleLabel}` : accessibleLabel}
          tabIndex={relation || opensClass ? 0 : undefined}
          onClick={opensClass ? handleCardClick : undefined}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => {
            onRelationFocus(relation);
          }}
          onMouseLeave={() => {
            onRelationFocus(null);
          }}
          onFocus={() => {
            onRelationFocus(relation);
          }}
          onBlur={(eventToHandle) => {
            onRelationFocus(null);
            if (!eventToHandle.currentTarget.contains(eventToHandle.relatedTarget)) {
              scheduleCloseDetails();
            }
          }}
          elevation={0}
          sx={{
            appearance: 'none',
            width: '100%',
            height,
            position: 'relative',
            textAlign: 'left',
            cursor: opensClass ? 'pointer' : 'default',
            px: isTinyDensity ? 0.7 : titleOnly ? 0.85 : 1.25,
            py: isTinyDensity ? 0.25 : titleOnly ? 0.45 : isCompactDensity ? 0.45 : 0.65,
            borderRadius: '15px',
            border: '1px solid',
            borderStyle: styles.borderStyle,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: titleOnly ? 'center' : 'flex-start',
            ...styles,
            bgcolor: lessonHighlighted ? softPurple : styles.bgcolor,
            borderColor: highlighted ? 'rgba(156, 40, 175, 0.34)' : styles.borderColor,
            boxShadow: borderHighlighted ? 'inset 0 0 0 1px rgba(156, 40, 175, 0.18)' : styles.boxShadow,
            color: lessonHighlighted ? highlightedText : 'inherit',
            transition: 'background-color 520ms ease, border-color 520ms ease, box-shadow 220ms ease, color 420ms ease, transform 180ms ease',
            '&:hover': {
              bgcolor: relation?.kind === 'lesson' ? '#efd7f4' : styles.bgcolor,
              borderColor: relation ? 'rgba(156, 40, 175, 0.42)' : styles.borderColor,
              color: relation?.kind === 'lesson' ? highlightedText : 'inherit',
              boxShadow: visualVariant === 'fixed' ? '0 8px 18px rgba(23, 21, 26, 0.045)' : 'none',
              transform: 'translateY(-1px)',
            },
            '&:focus-visible': {
              outline: `3px solid rgba(156, 40, 175, 0.2)`,
              outlineOffset: 2,
            },
            '&:hover .WeekItemExpandButton, &:focus-within .WeekItemExpandButton': {
              opacity: 1,
              pointerEvents: 'auto',
            },
          }}
        >
          {showTime && (
            <Typography sx={{ color: lessonHighlighted ? 'rgba(95, 27, 107, 0.72)' : 'text.secondary', fontSize: 12, lineHeight: 1.1, fontWeight: isSoft ? 640 : 700, transition: 'color 420ms ease' }}>
              {event.start}-{event.end}
            </Typography>
          )}

          <Typography sx={{
            mt: titleOnly ? 0 : isCompactDensity ? 0.25 : 0.3,
            color: lessonHighlighted ? highlightedText : darkText,
            fontSize: isTinyDensity ? 12.2 : titleOnly ? 12.4 : isCompactDensity ? 14.2 : isSoft ? 14.2 : 15.5,
            lineHeight: isTinyDensity ? 1 : titleOnly ? 1.05 : isCompactDensity ? 1.15 : 1.18,
            fontWeight: isSoft ? 720 : isFlexible ? 760 : 800,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 420ms ease',
          }}>
            {getDisplayTitle(event)}
          </Typography>

          {hasHiddenDetails && (
            <IconButton
              ref={expandButtonRef}
              className="WeekItemExpandButton"
              aria-label={`Show details for ${getFullWeekItemTitle(event)}`}
              aria-describedby={detailOpen ? detailId : undefined}
              aria-expanded={detailOpen ? 'true' : 'false'}
              size="small"
              onClick={handleExpandClick}
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
              onKeyDown={(eventToHandle) => {
                eventToHandle.stopPropagation();
                if (eventToHandle.key === 'Escape' && detailOpen) {
                  closeDetails();
                  expandButtonRef.current?.focus();
                }
              }}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
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
                  outline: `2px solid rgba(156, 40, 175, 0.24)`,
                  outlineOffset: 1,
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 14,
                },
              }}
            >
              <OpenInFullIcon />
            </IconButton>
          )}

        </Paper>

        {hasHiddenDetails && (
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
            <EventDetailPanel
              id={detailId}
              event={event}
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
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default function WeekDayColumn({
  day,
  events,
  sharedTimetable,
  current,
  currentTime,
  activeRelation,
  onRelationFocus,
  onOpenClass,
  onEditItem,
  onDeleteItem,
  workingDay,
  onTimelineQuickAdd,
  addInteractionMode,
  onAddPreviewShown,
  previewResetKey,
}) {
  const timelineRef = useRef(null);
  const pointerStartRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const hoverAnchorRef = useRef(null);
  const [addPreview, setAddPreview] = useState(null);
  const overlapAssignments = assignDayOverlapColumns(events);
  const currentMinutes = timeStringToMinutes(currentTime);
  const currentMarkerTop = sharedTimetable && Number.isFinite(currentMinutes)
    ? (currentMinutes - sharedTimetable.startMinutes) * sharedTimetable.pixelsPerMinute
    : null;
  const workingStartMinutes = timeStringToMinutes(workingDay?.startTime);
  const workingEndMinutes = timeStringToMinutes(workingDay?.endTime);
  const workingDayGeometry = sharedTimetable ? getWorkingDayGeometry({
    workingDay,
    sharedStartMinutes: sharedTimetable.startMinutes,
    pixelsPerMinute: sharedTimetable.pixelsPerMinute,
  }) : null;

  useEffect(() => () => {
    clearPendingAddHover();
  }, []);

  useEffect(() => {
    cancelAddHover();
  }, [previewResetKey]);

  function clearPendingAddHover() {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    hoverAnchorRef.current = null;
  }

  function cancelAddHover() {
    clearPendingAddHover();
    setAddPreview(null);
  }

  function getTimelineAddCandidate(pointerClientY) {
    if (
      !timelineRef.current
      || !sharedTimetable
      || !Number.isFinite(workingStartMinutes)
      || !Number.isFinite(workingEndMinutes)
      || workingEndMinutes <= workingStartMinutes
    ) {
      return null;
    }

    const startMinutes = getTimeFromTimelinePointer({
      pointerClientY,
      timelineRect: timelineRef.current.getBoundingClientRect(),
      scrollTop: timelineRef.current.scrollTop || 0,
      sharedStartMinutes: sharedTimetable.startMinutes,
      pixelsPerMinute: sharedTimetable.pixelsPerMinute,
      snapMinutes: TIMELINE_ADD_SNAP_MINUTES,
      minMinutes: workingStartMinutes,
      maxMinutes: workingEndMinutes,
    });

    if (!Number.isFinite(startMinutes) || startMinutes >= workingEndMinutes) {
      return null;
    }

    if (!canQuickAddAtMinute({ minute: startMinutes, timedItems: events })) {
      return null;
    }

    const endMinutes = getSuggestedEndMinutes({
      startMinutes,
      events,
      workingEndMinutes,
    });

    return {
      date: day.date,
      startMinutes,
      endMinutes,
      startTime: minutesToTimeString(startMinutes),
      endTime: minutesToTimeString(endMinutes),
      top: (startMinutes - sharedTimetable.startMinutes) * sharedTimetable.pixelsPerMinute,
    };
  }

  function showDelayedPreview(candidate) {
    setAddPreview(candidate);
    onAddPreviewShown?.();
  }

  function scheduleAddPreview({ candidate, clientX, clientY }) {
    const existingAnchor = hoverAnchorRef.current;
    const delayMs = addInteractionMode === 'armed'
      ? ARMED_ADD_HOVER_DELAY_MS
      : INITIAL_ADD_HOVER_DELAY_MS;

    if (
      existingAnchor
      && existingAnchor.candidate.startMinutes === candidate.startMinutes
      && existingAnchor.candidate.date === candidate.date
    ) {
      const moved = Math.hypot(clientX - existingAnchor.clientX, clientY - existingAnchor.clientY);
      if (moved <= ADD_HOVER_MOVEMENT_TOLERANCE_PX) {
        return;
      }
    }

    clearPendingAddHover();
    setAddPreview(null);
    hoverAnchorRef.current = {
      clientX,
      clientY,
      candidate,
    };
    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null;
      hoverAnchorRef.current = null;
      showDelayedPreview(candidate);
    }, delayMs);
  }

  function handleTimelinePointerMove(event) {
    if (event.pointerType === 'touch' || isInteractiveTimelineTarget(event.target)) {
      cancelAddHover();
      return;
    }

    const candidate = getTimelineAddCandidate(event.clientY);
    if (!candidate) {
      cancelAddHover();
      return;
    }

    if (addPreview?.date === candidate.date && addPreview?.startMinutes === candidate.startMinutes) {
      return;
    }

    scheduleAddPreview({
      candidate,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }

  function handleTimelinePointerDown(event) {
    if (isInteractiveTimelineTarget(event.target)) {
      pointerStartRef.current = null;
      cancelAddHover();
      return;
    }

    pointerStartRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }

  function handleTimelinePointerUp(event) {
    const pointerStart = pointerStartRef.current;
    pointerStartRef.current = null;

    if (!pointerStart || pointerStart.pointerId !== event.pointerId || isInteractiveTimelineTarget(event.target)) {
      return;
    }

    const moved = Math.hypot(event.clientX - pointerStart.clientX, event.clientY - pointerStart.clientY);
    if (moved > TIMELINE_TAP_MOVE_TOLERANCE) {
      return;
    }

    const candidate = getTimelineAddCandidate(event.clientY);
    if (!candidate) {
      return;
    }

    cancelAddHover();
    onTimelineQuickAdd?.({
      date: candidate.date,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
    });
  }

  return (
    <Box
      sx={{
        minWidth: { xs: '100%', md: 0 },
        borderTop: current ? `3px solid ${purple}` : '3px solid transparent',
        borderRadius: '18px',
        bgcolor: current ? 'rgba(251, 245, 253, 0.42)' : '#fff',
        p: 0.75,
      }}
    >
      <Box sx={{ px: 0.5, py: 0.65 }}>
        <Typography sx={{ color: current ? purple : darkText, fontSize: 16, fontWeight: 850 }}>
          {day.label}
        </Typography>
        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13 }}>
          {day.dateLabel}
        </Typography>
      </Box>

      <Box
        ref={timelineRef}
        onPointerMove={handleTimelinePointerMove}
        onPointerLeave={() => {
          cancelAddHover();
          pointerStartRef.current = null;
        }}
        onScroll={cancelAddHover}
        onPointerDown={handleTimelinePointerDown}
        onPointerUp={handleTimelinePointerUp}
        sx={{
          position: 'relative',
          height: sharedTimetable ? `calc(${sharedTimetable.naturalTimelineHeight}px + 5.6px)` : undefined,
          px: 0.15,
          py: 0.35,
          boxSizing: 'border-box',
          bgcolor: 'rgba(255, 255, 255, 0.24)',
          borderRadius: '14px',
        }}
      >
        {!!workingDayGeometry && (
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              top: `${workingDayGeometry.top}px`,
              left: 0,
              right: 0,
              height: `${workingDayGeometry.height}px`,
              borderRadius: '14px',
              bgcolor: 'rgba(156, 40, 175, 0.04)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
        {!!addPreview && (
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              top: `${addPreview.top}px`,
              left: 3,
              right: 3,
              zIndex: 80,
              display: 'flex',
              alignItems: 'center',
              gap: 0.55,
              pointerEvents: 'none',
              color: purple,
              opacity: 0.78,
            }}
          >
            <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(156, 40, 175, 0.22)' }} />
            <Typography sx={{ px: 0.6, py: 0.15, borderRadius: 999, bgcolor: 'rgba(255, 255, 255, 0.76)', border: '1px solid rgba(156, 40, 175, 0.12)', fontSize: 11.4, lineHeight: 1.3, fontWeight: 780 }}>
              + Add at {addPreview.startTime}
            </Typography>
          </Box>
        )}
        {events.map((event, index) => {
          const geometry = getTimedItemGeometry({
            item: event,
            range: sharedTimetable,
            pixelsPerMinute: sharedTimetable?.pixelsPerMinute || 0,
          });

          if (!geometry) {
            return null;
          }

          const assignment = overlapAssignments.get(event.id) || { overlapColumn: 0, overlapColumnCount: 1 };
          const columnGap = assignment.overlapColumnCount > 1 ? 4 : 0;
          const widthPercent = 100 / assignment.overlapColumnCount;
          const leftPercent = assignment.overlapColumn * widthPercent;

          return (
            <Box
              key={event.id}
              sx={{
                position: 'absolute',
                top: `${geometry.top}px`,
                left: `calc(${leftPercent}% + ${columnGap / 2}px)`,
                width: `calc(${widthPercent}% - ${columnGap}px)`,
                height: `${geometry.height}px`,
                zIndex: 1 + index,
              }}
            >
              <EventCard
                event={event}
                height={geometry.height}
                activeRelation={activeRelation}
                onRelationFocus={onRelationFocus}
                onOpenClass={onOpenClass}
                onEditItem={onEditItem}
                onDeleteItem={onDeleteItem}
              />
            </Box>
          );
        })}

        {current && currentMarkerTop !== null && currentMarkerTop >= 0 && currentMarkerTop <= (sharedTimetable?.totalHeight || 0) && (
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              top: `${currentMarkerTop}px`,
              left: 0.75,
              right: 0.75,
              display: 'flex',
              alignItems: 'center',
              gap: 0.7,
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: purple }} />
            <Box sx={{ width: 14, height: 1, bgcolor: 'rgba(156, 40, 175, 0.5)' }} />
            <Typography sx={{ color: purple, fontSize: 11.8, fontWeight: 750 }}>
              You are here
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
