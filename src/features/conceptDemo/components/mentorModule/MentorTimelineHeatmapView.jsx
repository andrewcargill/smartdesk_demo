import { Fragment, useEffect, useState } from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, ButtonBase, Collapse, Paper, Portal, Stack, Tooltip, Typography } from '@mui/material';
import { CheckInStatusIcon, getCheckInStatusMeta } from './mentorCheckInStatus.jsx';
import { border, darkText, formatDate, getLocalizedValue, purple, subjectIds } from './mentorModuleShared.jsx';

const signalRows = [
  { status: 'positive', top: 18 },
  { status: 'neutral', top: 44 },
  { status: 'negative', top: 70 },
];

const observationDimensions = [
  { id: 'focus', label: 'Focus' },
  { id: 'participation', label: 'Participation' },
  { id: 'independence', label: 'Independence' },
];

function getEventTime(date) {
  const time = new Date(`${date}T12:00:00`).getTime();
  return Number.isFinite(time) ? time : null;
}

function normalizeSignal(status) {
  if (status === '+') return 'positive';
  if (status === '0') return 'neutral';
  if (status === '-') return 'negative';
  return status || 'neutral';
}

function getSignalY(status) {
  const row = signalRows.find((item) => item.status === normalizeSignal(status)) || signalRows[1];
  return row.top;
}

function getObservationNote(item) {
  return getLocalizedValue(item.comment) || item.observationText || item.note || '';
}

function getWeekStart(date) {
  const value = new Date(`${date}T12:00:00`);
  if (!Number.isFinite(value.getTime())) return null;
  const day = value.getDay() || 7;
  value.setDate(value.getDate() - day + 1);
  return value;
}

function getWeekKey(date) {
  const weekStart = getWeekStart(date);
  return weekStart ? weekStart.toISOString().slice(0, 10) : '';
}

function getWeekLabel(weekKey) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(new Date(`${weekKey}T12:00:00`));
}

function getWeekMonthLabel(weekKey) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(`${weekKey}T12:00:00`));
}

function getWeekRangeLabel(weekKey) {
  const start = new Date(`${weekKey}T12:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatDate(weekKey)} - ${formatDate(end.toISOString().slice(0, 10))}`;
}

function buildTimelineGroups({ picture, subjectConfigs, studentId }) {
  const groups = [
    {
      id: 'mentor',
      label: 'Student check-in',
      rows: [
        {
          id: 'mentor-check-ins',
          label: 'Check-ins',
          events: (picture.checkIns || []).map((checkIn) => ({
            id: checkIn.id,
            date: checkIn.date,
            type: 'mentor-check-in',
            status: normalizeSignal(checkIn.status),
            title: `Mentor check-in · ${getCheckInStatusMeta(checkIn.status).label}`,
            comment: checkIn.comment,
          })),
        },
      ],
    },
  ];

  subjectIds.forEach((subjectId) => {
    const config = subjectConfigs[subjectId];
    const subjectTitle = getLocalizedValue(config?.subjectTitle) || subjectId;
    const learningObservations = (config?.evidence?.learningObservations || [])
      .filter((item) => item.studentId === studentId && item.date);
    const fallbackLearningObservations = learningObservations.length ? [] : (config?.evidence?.items || [])
      .filter((item) => item.type !== 'assessment' && item.studentId === studentId && item.date && observationDimensions.some((dimension) => item[dimension.id]));
    const observations = [...learningObservations, ...fallbackLearningObservations];
    const subjectCheckInEvents = (picture.subjectCheckIns?.[subjectId] || [])
      .filter((checkIn) => checkIn.date)
      .map((checkIn) => ({
        id: checkIn.id,
        date: checkIn.date,
        type: 'subject-check-in',
        status: normalizeSignal(checkIn.status),
        title: `${subjectTitle} · Student check-in · ${getCheckInStatusMeta(normalizeSignal(checkIn.status)).label}`,
        comment: checkIn.comment,
      }))
      .sort((first, second) => (first.date || '').localeCompare(second.date || ''));

    const rows = [
      subjectCheckInEvents.length ? {
        id: `${subjectId}-student-check-ins`,
        label: 'Check-ins',
        source: 'student',
        events: subjectCheckInEvents,
      } : null,
      ...observationDimensions
      .map((dimension) => {
        const events = observations
        .filter((item) => item[dimension.id])
        .map((item) => ({
          id: `${item.id}-${dimension.id}`,
          date: item.date,
          type: 'learning-observation',
          status: normalizeSignal(item[dimension.id]),
          title: `${subjectTitle} · ${dimension.label} · ${getCheckInStatusMeta(normalizeSignal(item[dimension.id])).label}`,
          comment: getObservationNote(item),
        }))
        .sort((first, second) => (first.date || '').localeCompare(second.date || ''));

        return events.length ? {
          id: `${subjectId}-${dimension.id}`,
          label: dimension.label,
          source: 'teacher',
          events,
        } : null;
      }),
    ].filter(Boolean);

    if (rows.length) {
      groups.push({
        id: subjectId,
        label: subjectTitle,
        rows,
      });
    }
  });

  return groups;
}

function getWeeks(groups) {
  const dates = groups
    .flatMap((group) => group.rows)
    .flatMap((row) => row.events)
    .map((event) => getEventTime(event.date))
    .filter((time) => time !== null);
  const minTime = dates.length ? Math.min(...dates) : new Date('2026-01-01T12:00:00').getTime();
  const maxTime = dates.length ? Math.max(...dates) : new Date('2026-05-31T12:00:00').getTime();
  const startDate = getWeekStart(new Date(minTime).toISOString().slice(0, 10));
  const endDate = getWeekStart(new Date(maxTime).toISOString().slice(0, 10));
  const weeks = [];

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 7)) {
    weeks.push(date.toISOString().slice(0, 10));
  }

  return weeks;
}

function getSectionLabel(group, row, index) {
  if (group.id === 'mentor') return '';
  const previousRow = group.rows[index - 1];
  if (previousRow?.source === row.source) return '';
  if (row.source === 'student') return '';
  if (row.source === 'teacher') return '';
  return '';
}

function getRowSurface(row) {
  if (row.source === 'student') {
    return {
      bgcolor: 'rgba(156, 40, 175, 0.045)',
      borderColor: 'rgba(156, 40, 175, 0.11)',
    };
  }

  if (row.source === 'teacher') {
    return {
      bgcolor: 'rgba(23, 21, 26, 0.024)',
      borderColor: 'rgba(23, 21, 26, 0.065)',
    };
  }

  return {
    bgcolor: 'transparent',
    borderColor: 'transparent',
  };
}

function getCellTone(events) {
  if (!events.length) {
    return {
      label: 'No signal',
      bgcolor: 'rgba(23, 21, 26, 0.025)',
      color: 'text.secondary',
      borderColor: 'rgba(23, 21, 26, 0.07)',
    };
  }

  const score = events.reduce((total, event) => {
    if (event.status === 'negative') return total - 1;
    if (event.status === 'positive') return total + 1;
    return total;
  }, 0);
  const average = score / events.length;

  if (average < -0.25) {
    return {
      label: 'Negative',
      bgcolor: purple,
      color: '#fff',
      borderColor: 'rgba(88, 18, 102, 0.28)',
    };
  }

  if (average > 0.25) {
    return {
      label: 'Positive',
      bgcolor: '#fff',
      color: purple,
      borderColor: 'rgba(156, 40, 175, 0.22)',
    };
  }

  return {
    label: 'Neutral',
    bgcolor: 'rgba(156, 40, 175, 0.16)',
    color: purple,
    borderColor: 'rgba(156, 40, 175, 0.18)',
  };
}

function HeatmapCell({ events, week, showSignalArrows = false }) {
  const tone = getCellTone(events);
  const sortedEvents = [...events].sort((first, second) => (first.date || '').localeCompare(second.date || ''));
  const positiveCount = sortedEvents.filter((event) => event.status === 'positive').length;
  const negativeCount = sortedEvents.filter((event) => event.status === 'negative').length;

  return (
    <Tooltip
      arrow
      placement="top"
      title={(
        <Box>
          <Typography sx={{ color: 'inherit', fontSize: 11.5, fontWeight: 850 }}>
            {getWeekRangeLabel(week)} · {tone.label}
          </Typography>
          {sortedEvents.length ? sortedEvents.map((event) => (
            <Typography key={event.id} sx={{ mt: 0.25, color: 'inherit', fontSize: 11.1, lineHeight: 1.3 }}>
              {formatDate(event.date)} · {getCheckInStatusMeta(event.status).label}{event.comment ? ` · ${event.comment}` : ''}
            </Typography>
          )) : (
            <Typography sx={{ mt: 0.25, color: 'inherit', fontSize: 11.1, lineHeight: 1.3 }}>
              No check-ins or observations recorded.
            </Typography>
          )}
        </Box>
      )}
    >
      <Box
        sx={{
          minHeight: 34,
          borderRadius: '6px',
          border: '1px solid',
          borderColor: tone.borderColor,
          bgcolor: tone.bgcolor,
          color: tone.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          cursor: 'default',
          boxShadow: events.length && tone.label === 'Negative' ? 'inset 0 0 0 1px rgba(255,255,255,0.16)' : 'none',
        }}
      >
        {showSignalArrows && positiveCount > 0 && (
          <Stack direction="row" spacing={0.08} alignItems="center" sx={{ lineHeight: 1 }}>
            <ArrowUpwardIcon sx={{ fontSize: 12, color: 'inherit' }} />
            {positiveCount > 1 && (
              <Typography sx={{ color: 'inherit', fontSize: 9.8, fontWeight: 900, lineHeight: 1 }}>
                {positiveCount}
              </Typography>
            )}
          </Stack>
        )}
        {showSignalArrows && negativeCount > 0 && (
          <Stack direction="row" spacing={0.08} alignItems="center" sx={{ lineHeight: 1 }}>
            <ArrowDownwardIcon sx={{ fontSize: 12, color: 'inherit' }} />
            {negativeCount > 1 && (
              <Typography sx={{ color: 'inherit', fontSize: 9.8, fontWeight: 900, lineHeight: 1 }}>
                {negativeCount}
              </Typography>
            )}
          </Stack>
        )}
        {!showSignalArrows && events.length > 1 && positiveCount === 0 && negativeCount === 0 && (
          <Typography sx={{ color: 'inherit', fontSize: 10.7, fontWeight: 900, lineHeight: 1 }}>
            {events.length}
          </Typography>
        )}
        {showSignalArrows && events.length > 1 && positiveCount === 0 && negativeCount === 0 && (
          <Typography sx={{ color: 'inherit', fontSize: 10.7, fontWeight: 900, lineHeight: 1 }}>
            {events.length}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

function HeatmapRow({ row, weeks, showSignalArrows = false }) {
  const eventsByWeek = weeks.reduce((items, week) => ({ ...items, [week]: [] }), {});
  row.events.forEach((event) => {
    const week = getWeekKey(event.date);
    if (eventsByWeek[week]) {
      eventsByWeek[week].push(event);
    }
  });

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${weeks.length}, minmax(28px, 1fr))`, gap: 0.25 }}>
      {weeks.map((week) => (
        <HeatmapCell key={`${row.id}-${week}`} events={eventsByWeek[week]} week={week} showSignalArrows={showSignalArrows} />
      ))}
    </Box>
  );
}

function TimelinePoint({ event, left, top }) {
  return (
    <Tooltip
      arrow
      placement="top"
      title={(
        <Box>
          <Typography sx={{ color: 'inherit', fontSize: 11.5, fontWeight: 850 }}>
            {formatDate(event.date)}
          </Typography>
          {event.comment && (
            <Typography sx={{ mt: 0.25, color: 'inherit', fontSize: 11.2, lineHeight: 1.3 }}>
              {event.comment}
            </Typography>
          )}
        </Box>
      )}
    >
      <Box
        sx={{
          position: 'absolute',
          left: `calc(28px + ${left}%)`,
          top: top - 6,
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: purple,
          transform: 'translateX(-50%)',
          border: '2px solid #fff',
          boxShadow: '0 0 0 2px rgba(156, 40, 175, 0.14)',
          cursor: 'default',
          transition: 'transform 140ms ease, box-shadow 140ms ease',
          '&:hover': {
            transform: 'translateX(-50%) scale(1.18)',
            boxShadow: '0 0 0 4px rgba(156, 40, 175, 0.16)',
          },
        }}
      />
    </Tooltip>
  );
}

function TimelineRowGraph({ row, start, end }) {
  const sortedEvents = [...row.events].filter((event) => event.date).sort((first, second) => (first.date || '').localeCompare(second.date || ''));

  function getLeft(date) {
    const time = getEventTime(date);
    if (time === null || start === end) return 48;
    return Number((Math.max(2, Math.min(98, ((time - start) / (end - start)) * 100)) * 0.96).toFixed(2));
  }

  const points = sortedEvents.map((event) => ({
    event,
    left: getLeft(event.date),
    y: getSignalY(event.status),
  }));
  const linePoints = points.map((point) => `${point.left},${point.y}`).join(' ');

  return (
    <Box
      sx={{
        position: 'relative',
        height: 88,
        minWidth: 0,
      }}
    >
      {signalRows.map((rowItem) => (
        <Box key={rowItem.status}>
          <Box sx={{ position: 'absolute', left: 0, top: rowItem.top - 9, width: 20, height: 20, display: 'grid', placeItems: 'center' }}>
            <CheckInStatusIcon status={rowItem.status} size={16} />
          </Box>
        </Box>
      ))}
      <Box
        component="svg"
        aria-hidden="true"
        viewBox="0 0 100 88"
        preserveAspectRatio="none"
        sx={{ position: 'absolute', left: 28, right: 4, top: 0, height: 88, width: 'calc(100% - 32px)', overflow: 'visible', pointerEvents: 'none' }}
      >
        {signalRows.map((rowItem) => (
          <line key={rowItem.status} x1="0" y1={rowItem.top} x2="96" y2={rowItem.top} stroke="rgba(23, 21, 26, 0.055)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1="0" y1="12" x2="0" y2="76" stroke="rgba(23, 21, 26, 0.1)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
        {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(156, 40, 175, 0.34)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
      </Box>
      {points.map((point) => (
        <TimelinePoint
          key={`${row.id}-${point.event.id}`}
          event={point.event}
          left={point.left}
          top={point.y}
        />
      ))}
    </Box>
  );
}

function TeacherObservationToggle({ open, onToggle }) {
  return (
    <Stack direction="row" spacing={0.45} alignItems="center" flexWrap="wrap" useFlexGap>
      <ButtonBase
        type="button"
        aria-pressed={open}
        onClick={onToggle}
        sx={{
          minHeight: 28,
          px: 0.75,
          borderRadius: '999px',
          border: '1px solid',
          borderColor: open ? 'rgba(156, 40, 175, 0.24)' : 'rgba(23, 21, 26, 0.095)',
          bgcolor: open ? 'rgba(156, 40, 175, 0.06)' : '#fff',
          color: open ? darkText : 'text.secondary',
          fontSize: 11.4,
          fontWeight: open ? 880 : 780,
          '&:hover': { bgcolor: open ? 'rgba(156, 40, 175, 0.075)' : 'rgba(23, 21, 26, 0.026)' },
          '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
        }}
      >
        {open ? 'Hide teacher observations' : 'Show teacher observations'}
      </ButtonBase>
    </Stack>
  );
}

function EmptyRowMessage({ children }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: '1px dashed rgba(23, 21, 26, 0.12)', bgcolor: 'rgba(23, 21, 26, 0.018)' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12.1, fontWeight: 740 }}>
        {children}
      </Typography>
    </Paper>
  );
}

function canShowGraph(row) {
  return row.events.length > 0;
}

function TimelineRowsGrid({ group, rows, weeks, start, end, graphRows, onToggleRowGraph, borderTop = false }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '92px minmax(0, 1fr)', md: '132px minmax(0, 1fr)' },
        columnGap: 0.9,
        rowGap: 0.35,
        px: 0.9,
        py: 0.65,
        borderTop: borderTop ? '1px solid rgba(23, 21, 26, 0.065)' : 0,
        overflowX: 'auto',
      }}
    >
      {rows.map((row, index) => {
        const sectionLabel = getSectionLabel(group, row, index);
        const rowSurface = getRowSurface(row);
        const graphEnabled = Boolean(graphRows[row.id]);
        const canToggleGraph = canShowGraph(row);
        const RowLabelComponent = canToggleGraph ? ButtonBase : Typography;
        return (
          <Fragment key={row.id}>
            {sectionLabel && (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  mt: index ? 0.4 : 0,
                  pt: index ? 0.65 : 0.25,
                  borderTop: index ? '1px solid rgba(23, 21, 26, 0.075)' : 0,
                }}
              >
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: 11.2,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: 0,
                  }}
                >
                  {sectionLabel}
                </Typography>
              </Box>
            )}
            <RowLabelComponent
              type={canToggleGraph ? 'button' : undefined}
              component={canToggleGraph ? 'button' : 'div'}
              aria-label={canToggleGraph ? `${graphEnabled ? 'Show heatmap for' : 'Show graph for'} ${row.label}` : undefined}
              aria-pressed={canToggleGraph ? graphEnabled : undefined}
              onClick={canToggleGraph ? () => onToggleRowGraph(row.id) : undefined}
              sx={{
                width: '100%',
                minHeight: graphEnabled ? 88 : 34,
                color: row.source === 'student' ? darkText : 'text.secondary',
                fontSize: 11.9,
                fontWeight: row.source === 'student' ? 880 : 820,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                px: 0.65,
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
                border: '1px solid',
                borderRight: 0,
                borderColor: rowSurface.borderColor,
                bgcolor: rowSurface.bgcolor,
                textAlign: 'left',
                cursor: canToggleGraph ? 'pointer' : 'default',
                '&:hover': canToggleGraph ? { bgcolor: row.source === 'student' ? 'rgba(156, 40, 175, 0.07)' : 'rgba(23, 21, 26, 0.045)' } : undefined,
                '&:focus-visible': canToggleGraph ? { outline: `2px solid ${purple}`, outlineOffset: -2 } : undefined,
              }}
            >
              <Stack direction="row" spacing={0.4} alignItems="center" sx={{ minWidth: 0, width: '100%' }}>
                <Typography sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  {row.label}
                </Typography>
              </Stack>
            </RowLabelComponent>
            <Box
              sx={{
                minWidth: weeks.length * 31,
                py: 0.25,
                pr: 0.35,
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                border: '1px solid',
                borderLeft: 0,
                borderColor: rowSurface.borderColor,
                bgcolor: rowSurface.bgcolor,
              }}
            >
              {graphEnabled ? (
                <TimelineRowGraph row={row} start={start} end={end} />
              ) : (
                <HeatmapRow row={row} weeks={weeks} showSignalArrows={group.id === 'mentor'} />
              )}
            </Box>
          </Fragment>
        );
      })}
    </Box>
  );
}

function TimelineGroup({
  group,
  weeks,
  start,
  end,
  open,
  onToggle,
  showTeacherObservations,
  onToggleTeacherObservations,
  graphRows,
  onToggleRowGraph,
}) {
  const isSubjectGroup = group.id !== 'mentor';
  const studentRows = group.rows.filter((row) => row.source === 'student');
  const teacherRows = group.rows.filter((row) => row.source === 'teacher');

  if (!isSubjectGroup) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid rgba(23, 21, 26, 0.075)',
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        <TimelineRowsGrid
          group={group}
          rows={group.rows}
          weeks={weeks}
          start={start}
          end={end}
          graphRows={graphRows}
          onToggleRowGraph={onToggleRowGraph}
        />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: `1px solid ${open ? 'rgba(156, 40, 175, 0.16)' : 'rgba(23, 21, 26, 0.075)'}`,
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      <ButtonBase
        type="button"
        onClick={() => onToggle(group.id)}
        aria-expanded={open}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 0.9,
          py: 0.65,
          textAlign: 'left',
          bgcolor: '#fff',
          '&:hover': { bgcolor: 'rgba(23, 21, 26, 0.026)' },
        }}
      >
        <Stack direction="row" spacing={0.65} alignItems="baseline" sx={{ minWidth: 0 }}>
          <Typography sx={{ color: darkText, fontSize: 12.7, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {group.label}
          </Typography>
        </Stack>
        <KeyboardArrowDownIcon sx={{ color: open ? purple : 'text.secondary', fontSize: 18, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 140ms ease' }} />
      </ButtonBase>
      <Collapse in={open} timeout={160} unmountOnExit>
        <Box
          sx={{
            borderTop: '1px solid rgba(156, 40, 175, 0.12)',
            borderLeft: `3px solid ${purple}`,
            bgcolor: 'rgba(156, 40, 175, 0.026)',
          }}
        >
          {!studentRows.length && (
            <Box sx={{ px: 0.9, pt: 0.55 }}>
              <EmptyRowMessage>No student check-ins recorded for this subject.</EmptyRowMessage>
            </Box>
          )}
          {studentRows.length > 0 && (
            <TimelineRowsGrid
              group={group}
              rows={studentRows}
              weeks={weeks}
              start={start}
              end={end}
              graphRows={graphRows}
              onToggleRowGraph={onToggleRowGraph}
            />
          )}
          <Box sx={{ px: 0.9, pt: 0.15, pb: showTeacherObservations ? 0.25 : 0.65 }}>
            <Stack direction="row" spacing={0.7} alignItems="center" justifyContent="flex-end">
              <TeacherObservationToggle
                open={showTeacherObservations}
                onToggle={() => onToggleTeacherObservations(group.id)}
              />
            </Stack>
          </Box>
          {showTeacherObservations && !teacherRows.length && (
            <Box sx={{ px: 0.9, pt: 0.55 }}>
              <EmptyRowMessage>No teacher observations recorded for this subject.</EmptyRowMessage>
            </Box>
          )}
          {showTeacherObservations && teacherRows.length > 0 && (
            <TimelineRowsGrid
              group={group}
              rows={teacherRows}
              weeks={weeks}
              start={start}
              end={end}
              graphRows={graphRows}
              onToggleRowGraph={onToggleRowGraph}
            />
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

function HeatmapLegend() {
  const items = [
    { value: 'Positive', bgcolor: '#fff', borderColor: 'rgba(156, 40, 175, 0.22)' },
    { value: 'Neutral', bgcolor: 'rgba(156, 40, 175, 0.16)', borderColor: 'rgba(156, 40, 175, 0.18)' },
    { value: 'Negative', bgcolor: purple, borderColor: 'rgba(88, 18, 102, 0.28)' },
  ];

  return (
    <Stack direction="row" spacing={0.8} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
      {items.map((item) => (
        <Stack key={item.value} direction="row" spacing={0.4} alignItems="center">
          <Box sx={{ width: 18, height: 18, borderRadius: '5px', bgcolor: item.bgcolor, border: '1px solid', borderColor: item.borderColor }} />
          <Typography sx={{ color: 'text.secondary', fontSize: 11.3, fontWeight: 760 }}>
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function HeatmapGraph({ groups }) {
  const [openGroups, setOpenGroups] = useState(() => (
    groups.reduce((items, group) => ({ ...items, [group.id]: false }), {})
  ));
  const [teacherObservationGroups, setTeacherObservationGroups] = useState({});
  const [graphRows, setGraphRows] = useState({});
  const weeks = getWeeks(groups);
  const start = getEventTime(weeks[0]) || new Date('2026-01-01T12:00:00').getTime();
  const lastWeekStart = new Date(`${weeks[weeks.length - 1]}T12:00:00`);
  lastWeekStart.setDate(lastWeekStart.getDate() + 6);
  const end = lastWeekStart.getTime();

  function toggleGroup(groupId) {
    setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  function toggleTeacherObservations(groupId) {
    setTeacherObservationGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  function toggleRowGraph(rowId) {
    setGraphRows((current) => ({ ...current, [rowId]: !current[rowId] }));
  }

  return (
    <Stack spacing={0.55}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '92px minmax(0, 1fr)', md: '132px minmax(0, 1fr)' },
          columnGap: 0.9,
          px: 0.9,
          py: 0.45,
          borderRadius: '8px',
          bgcolor: 'rgba(23, 21, 26, 0.025)',
          overflowX: 'auto',
        }}
      >
        <Box />
        <Box sx={{ minWidth: weeks.length * 31, display: 'grid', gridTemplateColumns: `repeat(${weeks.length}, minmax(28px, 1fr))`, gap: 0.25, color: 'text.secondary' }}>
          {weeks.map((week, index) => {
            const previousWeek = weeks[index - 1];
            const showMonth = !previousWeek || getWeekMonthLabel(previousWeek) !== getWeekMonthLabel(week);
            return (
              <Box key={week} sx={{ textAlign: 'center', minWidth: 0 }}>
                <Typography sx={{ height: 15, color: showMonth ? purple : 'transparent', fontSize: 11, fontWeight: 920, lineHeight: 1.05 }}>
                  {showMonth ? getWeekMonthLabel(week) : '-'}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 860, lineHeight: 1.1 }}>
                  {getWeekLabel(week)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
      {groups.map((group) => (
        <TimelineGroup
          key={group.id}
          group={group}
          weeks={weeks}
          start={start}
          end={end}
          open={openGroups[group.id]}
          onToggle={toggleGroup}
          showTeacherObservations={Boolean(teacherObservationGroups[group.id])}
          onToggleTeacherObservations={toggleTeacherObservations}
          graphRows={graphRows}
          onToggleRowGraph={toggleRowGraph}
        />
      ))}
    </Stack>
  );
}

export default function MentorTimelineHeatmapView({ picture, subjectConfigs, student }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const groups = buildTimelineGroups({ picture, subjectConfigs, studentId: student.id });
  const eventCount = groups.reduce((total, group) => total + group.rows.reduce((rowTotal, row) => rowTotal + row.events.length, 0), 0);

  useEffect(() => {
    if (!isFullscreen || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <Portal disablePortal={!isFullscreen}>
      <Paper
        elevation={0}
        sx={{
          position: isFullscreen ? 'fixed' : 'relative',
          inset: isFullscreen ? { xs: 8, sm: 14 } : 'auto',
          zIndex: isFullscreen ? 1700 : 'auto',
          p: isFullscreen ? { xs: 1.2, sm: 1.45 } : 1,
          borderRadius: '8px',
          border: `1px solid ${isFullscreen ? 'rgba(156, 40, 175, 0.24)' : border}`,
          bgcolor: '#fff',
          boxShadow: isFullscreen ? '0 22px 70px rgba(23, 21, 26, 0.24)' : 'none',
          height: isFullscreen ? 'calc(100vh - 28px)' : 'auto',
          overflow: isFullscreen ? 'auto' : 'visible',
        }}
      >
        <Stack spacing={1.35}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' }, gap: 0.8, alignItems: 'center' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Student check-ins and subject observations</Typography>
            </Box>
            <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="flex-end" flexWrap="wrap" useFlexGap>
              <HeatmapLegend />
              <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Expand fullscreen'} arrow>
                <ButtonBase
                  type="button"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand fullscreen'}
                  aria-pressed={isFullscreen}
                  onClick={() => setIsFullscreen((current) => !current)}
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    border: '1px solid rgba(23, 21, 26, 0.095)',
                    color: isFullscreen ? purple : 'text.secondary',
                    bgcolor: isFullscreen ? 'rgba(156, 40, 175, 0.06)' : '#fff',
                    flexShrink: 0,
                    '&:hover': { bgcolor: isFullscreen ? 'rgba(156, 40, 175, 0.085)' : 'rgba(23, 21, 26, 0.026)' },
                    '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                  }}
                >
                  {isFullscreen ? <CloseFullscreenIcon sx={{ fontSize: 15 }} /> : <OpenInFullIcon sx={{ fontSize: 15 }} />}
                </ButtonBase>
              </Tooltip>
            </Stack>
          </Box>
          {eventCount ? (
            <HeatmapGraph groups={groups} />
          ) : (
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '8px', border: '1px dashed rgba(23, 21, 26, 0.14)', bgcolor: 'rgba(23, 21, 26, 0.015)' }}>
              <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No timeline events yet.</Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Portal>
  );
}
