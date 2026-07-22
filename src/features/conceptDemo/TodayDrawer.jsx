import { useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TodayIcon from '@mui/icons-material/Today';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import {
  getCurrentGapIndex,
  getEventTemporalState,
  getTodayEventDisplay,
  getTodaySummary,
  sortEventsByStart,
} from './utils/todayScheduleUtils.js';
import { useConceptDemoDrawers } from './ConceptDemoDrawerContext.jsx';

const purple = '#9c28af';
const purpleTint = '#fbf6fc';
const darkText = '#18151a';
const mutedText = '#736d76';
const border = 'rgba(24, 21, 26, 0.08)';
const todayDrawerWidth = {
  xs: 'min(390px, calc(100vw - 18px))',
  sm: 410,
};
const todayEnterTransition = '820ms cubic-bezier(0.22, 1, 0.36, 1)';
const todayExitTransition = '640ms cubic-bezier(0.4, 0, 1, 1)';

function TodayAttachedTab({ open, onOpen, onClose }) {
  return (
    <Button
      aria-label={open ? 'Close today drawer' : 'Open today drawer'}
      onClick={() => (open ? onClose?.() : onOpen?.())}
      sx={{
        position: 'fixed',
        left: open ? todayDrawerWidth : 0,
        top: { xs: 'auto', md: '34%' },
        bottom: { xs: 78, md: 'auto' },
        transform: { md: 'translateY(-34%)' },
        zIndex: 1401,
        width: { xs: 96, md: 46 },
        minWidth: 0,
        maxWidth: { xs: 96, md: 46 },
        height: { xs: 42, md: 116 },
        borderRadius: '0 12px 12px 0',
        bgcolor: '#fff',
        color: darkText,
        border: '1px solid rgba(24, 21, 26, 0.14)',
        borderLeft: open ? `1px solid ${border}` : 0,
        boxShadow: '0 16px 34px rgba(24, 21, 26, 0.1)',
        px: { xs: 1.15, md: 0.7 },
        py: { xs: 0.9, md: 1.2 },
        transition: open
          ? `left ${todayEnterTransition}`
          : `left ${todayExitTransition}`,
        '&:hover': {
          bgcolor: purpleTint,
          borderColor: 'rgba(156, 40, 175, 0.24)',
        },
      }}
    >
      <Stack direction={{ xs: 'row', md: 'column' }} spacing={0.75} alignItems="center">
        <TodayIcon sx={{ fontSize: 18 }} />
        <Typography
          component="span"
          sx={{
            color: 'inherit',
            fontSize: 13.5,
            fontWeight: 850,
            lineHeight: 1,
            writingMode: { md: 'vertical-rl' },
            transform: { md: 'rotate(180deg)' },
          }}
        >
          Today
        </Typography>
      </Stack>
    </Button>
  );
}

function StatusDot({ state }) {
  if (state === 'earlier') {
    return (
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: '#fff',
          border: `1px solid ${border}`,
          color: mutedText,
          flexShrink: 0,
        }}
      />
    );
  }

  if (state === 'current') {
    return (
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: purple,
          boxShadow: '0 0 0 5px rgba(156, 40, 175, 0.10)',
          flexShrink: 0,
        }}
      />
    );
  }

  if (state === 'next') {
    return (
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: '#fff',
          border: `2px solid ${purple}`,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: 'rgba(24, 21, 26, 0.16)',
        flexShrink: 0,
      }}
    />
  );
}

function HereMarker() {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{ py: 1, px: 0.75 }}
    >
      <Box
        sx={{
          width: 28,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: purple,
          }}
        />
      </Box>

      <Typography
        sx={{
          color: purple,
          fontSize: 12.5,
          fontWeight: 750,
          letterSpacing: 0.1,
        }}
      >
        You are here
      </Typography>

      <Box
        sx={{
          height: 1,
          flex: 1,
          bgcolor: 'rgba(156, 40, 175, 0.18)',
        }}
      />
    </Stack>
  );
}

function TimelineEvent({ event, state, onOpenEvent }) {
  const isEarlier = state === 'earlier';
  const isCurrent = state === 'current';
  const isNext = state === 'next';
  const display = getTodayEventDisplay(event);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onOpenEvent?.(event)}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          onOpenEvent?.(event);
        }
      }}
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '28px minmax(0, 1fr) auto',
        columnGap: 1.5,
        alignItems: 'center',
        minHeight: 86,
        px: 2,
        py: 1.65,
        borderRadius: '20px',
        border: isCurrent
          ? '1px solid rgba(156, 40, 175, 0.22)'
          : `1px solid ${border}`,
        bgcolor: isCurrent
          ? purpleTint
          : isNext
            ? '#fff'
            : 'rgba(255, 255, 255, 0.96)',
        opacity: isEarlier ? 0.62 : 1,
        cursor: 'pointer',
        transition:
          'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 10px 30px rgba(24, 21, 26, 0.07)',
          borderColor: isCurrent
            ? 'rgba(156, 40, 175, 0.34)'
            : 'rgba(24, 21, 26, 0.13)',
          '& .event-more-button': {
            opacity: 1,
          },
        },
        '&:focus-visible': {
          outline: `3px solid rgba(156, 40, 175, 0.18)`,
          outlineOffset: 2,
        },
      }}
    >
      <Box sx={{ display: 'grid', placeItems: 'center' }}>
        <StatusDot state={state} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography
            sx={{
              color: isCurrent ? purple : mutedText,
              fontSize: 12.5,
              fontWeight: 750,
              letterSpacing: 0.15,
            }}
          >
            {event.start}–{event.end}
          </Typography>

          {isCurrent && (
            <Chip
              label="Now"
              size="small"
              sx={{
                height: 21,
                bgcolor: purple,
                color: '#fff',
                fontSize: 11,
                fontWeight: 750,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          )}

          {isNext && (
            <Typography
              component="span"
              sx={{
                color: purple,
                fontSize: 11.5,
                fontWeight: 750,
              }}
            >
              Next
            </Typography>
          )}
        </Stack>

        <Typography
          sx={{
            mt: 0.35,
            color: darkText,
            fontSize: 16.5,
            lineHeight: 1.25,
            fontWeight: isCurrent || isNext ? 760 : 680,
          }}
        >
          {display.title}
        </Typography>

        {!!display.meta && (
          <Typography
            sx={{
              mt: 0.35,
              color: mutedText,
              fontSize: 13.5,
              lineHeight: 1.35,
            }}
          >
            {display.meta}
          </Typography>
        )}

        {!!event.markers?.length && (
          <Stack
            direction="row"
            spacing={0.65}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1 }}
          >
            {event.markers.map((marker) => (
              <Chip
                key={marker}
                label={marker}
                size="small"
                sx={{
                  height: 22,
                  bgcolor: '#fff',
                  border: `1px solid ${border}`,
                  color: mutedText,
                  fontSize: 11.5,
                  fontWeight: 650,
                }}
              />
            ))}
          </Stack>
        )}
      </Box>

      <IconButton
        className="event-more-button"
        aria-label={`Open ${event.title}`}
        size="small"
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          onOpenEvent?.(event);
        }}
        sx={{
          opacity: { xs: 1, sm: 0 },
          color: mutedText,
          transition: 'opacity 150ms ease',
          alignSelf: 'center',
        }}
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>

      {isCurrent && (
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            left: -1,
            top: 18,
            bottom: 18,
            width: 3,
            borderRadius: '0 4px 4px 0',
            bgcolor: purple,
          }}
        />
      )}
    </Box>
  );
}

export default function TodayDrawer({
  open,
  onOpen,
  onClose,
  currentTime,
  dateLabel,
  events,
  onOpenEvent,
}) {
  const { openWeek, closeToday } = useConceptDemoDrawers();
  const sortedEvents = sortEventsByStart(events);
  const gapIndex = getCurrentGapIndex(sortedEvents, currentTime);
  const summary = getTodaySummary(sortedEvents, currentTime);

  function handleViewWeek() {
    closeToday();
    openWeek();
  }

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      <TodayAttachedTab open={open} onOpen={onOpen} onClose={onClose} />
      <Box
        aria-hidden={!open}
        onClick={onClose}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1390,
          bgcolor: 'rgba(24, 21, 26, 0.32)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: open
            ? `opacity ${todayEnterTransition}`
            : `opacity ${todayExitTransition}`,
        }}
      />
      <Box
        role="dialog"
        aria-modal={open}
        aria-label="Today"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1400,
          inlineSize: todayDrawerWidth,
          minInlineSize: todayDrawerWidth,
          maxInlineSize: todayDrawerWidth,
          blockSize: '100dvh',
          bgcolor: '#fff',
          borderRight: `1px solid ${border}`,
          boxShadow: '16px 0 50px rgba(24, 21, 26, 0.12)',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: open
            ? `transform ${todayEnterTransition}`
            : `transform ${todayExitTransition}`,
        }}
      >
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          px: { xs: 2, sm: 2.75 },
          pt: 2.5,
          pb: 4,
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                color: darkText,
                fontSize: 13,
                fontWeight: 750,
                letterSpacing: 0.25,
              }}
            >
              Today
            </Typography>

            <Typography
              sx={{
                mt: 0.3,
                color: darkText,
                fontSize: 25,
                lineHeight: 1.15,
                fontWeight: 780,
              }}
            >
              {dateLabel}
            </Typography>
          </Box>

       
        </Stack>

        <Box
          sx={{
            mt: 2.5,
            px: 2,
            py: 1.75,
            borderRadius: '18px',
            bgcolor: purpleTint,
          }}
        >
          <Typography
            sx={{
              color: purple,
              fontSize: 12.5,
              fontWeight: 780,
            }}
          >
            {currentTime}
          </Typography>

          <Typography
            sx={{
              mt: 0.45,
              color: darkText,
              fontSize: 14.5,
              lineHeight: 1.55,
              fontWeight: 560,
            }}
          >
            {summary}
          </Typography>

          <Button
            size="small"
            variant="text"
            onClick={handleViewWeek}
            sx={{
              mt: 1,
              ml: -0.75,
              color: purple,
              fontWeight: 750,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(156, 40, 175, 0.07)',
              },
            }}
          >
            View week
          </Button>
        </Box>

        <Stack spacing={1.15} sx={{ mt: 2.5 }}>
          {sortedEvents.map((event, index) => (
            <Box key={event.id}>
              <TimelineEvent
                event={event}
                state={getEventTemporalState(event, currentTime, sortedEvents)}
                onOpenEvent={onOpenEvent}
              />

              {gapIndex === index && <HereMarker />}
            </Box>
          ))}
        </Stack>
      </Box>
      </Box>
    </>
  );
}
