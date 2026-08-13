import { Fragment, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, ButtonBase, Collapse, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { CheckInStatusIcon, getCheckInStatusMeta } from './mentorCheckInStatus.jsx';
import { border, darkText, formatDate, getLocalizedValue, purple, subjectIds } from './mentorModuleShared.jsx';

const signalRows = [
  { status: 'positive', top: 18 },
  { status: 'neutral', top: 44 },
  { status: 'negative', top: 70 },
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

const observationDimensions = [
  { id: 'focus', label: 'Focus' },
  { id: 'participation', label: 'Participation' },
  { id: 'independence', label: 'Independence' },
];

function buildTimelineGroups({ picture, subjectConfigs, studentId }) {
  const groups = [
    {
      id: 'mentor',
      label: 'Student check-in',
      rows: [
        {
          id: 'mentor-check-ins',
          label: '',
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
        label: '',
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

function getSectionLabel(group, row, index) {
  if (group.id === 'mentor') return '';
  const previousRow = group.rows[index - 1];
  if (previousRow?.source === row.source) return '';
  if (row.source === 'student') return 'Student check-in';
  if (row.source === 'teacher') return 'Teacher observations';
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

function TimelineGroup({ group, start, end, open, onToggle }) {
  const eventCount = group.rows.reduce((total, row) => total + row.events.length, 0);

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
          bgcolor: open ? 'rgba(156, 40, 175, 0.035)' : '#fff',
          '&:hover': { bgcolor: open ? 'rgba(156, 40, 175, 0.05)' : 'rgba(23, 21, 26, 0.026)' },
        }}
      >
        <Stack direction="row" spacing={0.65} alignItems="baseline" sx={{ minWidth: 0 }}>
          <Typography sx={{ color: open ? purple : darkText, fontSize: 12.7, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {group.label}
          </Typography>
          <Typography
            sx={{
              px: 0.65,
              py: 0.12,
              borderRadius: '999px',
              bgcolor: open ? 'rgba(156, 40, 175, 0.08)' : 'rgba(23, 21, 26, 0.045)',
              color: open ? purple : 'text.secondary',
              fontSize: 11.1,
              fontWeight: 820,
              whiteSpace: 'nowrap',
            }}
          >
            {eventCount} signals
          </Typography>
        </Stack>
        <KeyboardArrowDownIcon sx={{ color: open ? purple : 'text.secondary', fontSize: 18, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 140ms ease' }} />
      </ButtonBase>
      <Collapse in={open} timeout={160} unmountOnExit>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '92px minmax(0, 1fr)', md: '132px minmax(0, 1fr)' },
            columnGap: 0.9,
            px: 0.9,
            py: 0.35,
            borderTop: '1px solid rgba(23, 21, 26, 0.065)',
          }}
        >
          {group.rows.map((row, index) => {
            const sectionLabel = getSectionLabel(group, row, index);
            const rowSurface = getRowSurface(row);
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
                        color: row.source === 'student' ? purple : 'text.secondary',
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
                <Typography
                  sx={{
                    height: 88,
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
                  }}
                >
                  {row.label}
                </Typography>
                <Box
                  sx={{
                    minWidth: 0,
                    py: 0.2,
                    pr: 0.35,
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    border: '1px solid',
                    borderLeft: 0,
                    borderColor: rowSurface.borderColor,
                    bgcolor: rowSurface.bgcolor,
                  }}
                >
                  <TimelineRowGraph row={row} start={start} end={end} />
                </Box>
              </Fragment>
            );
          })}
        </Box>
      </Collapse>
    </Paper>
  );
}

function TimelineGraph({ groups }) {
  const [openGroups, setOpenGroups] = useState(() => (
    groups.reduce((items, group) => ({ ...items, [group.id]: group.id === 'mentor' }), {})
  ));
  const allRows = groups.flatMap((group) => group.rows);
  const allEvents = allRows.flatMap((row) => row.events).filter((event) => event.date);
  const timestamps = allEvents.map((event) => getEventTime(event.date)).filter((time) => time !== null);
  const minTime = timestamps.length ? Math.min(...timestamps) : new Date('2026-01-01T12:00:00').getTime();
  const maxTime = timestamps.length ? Math.max(...timestamps) : new Date('2026-05-31T12:00:00').getTime();
  const startDate = new Date(minTime);
  startDate.setDate(1);
  const endDate = new Date(maxTime);
  endDate.setMonth(endDate.getMonth() + 1, 0);
  const start = startDate.getTime();
  const end = endDate.getTime();
  const months = [];

  for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
    months.push(new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date));
  }

  function toggleGroup(groupId) {
    setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  return (
    <Stack spacing={0.55}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '92px minmax(0, 1fr)', md: '132px minmax(0, 1fr)' },
          columnGap: 0.9,
          px: 0.9,
          py: 0.35,
          borderRadius: '8px',
          bgcolor: 'rgba(23, 21, 26, 0.025)',
        }}
      >
        <Box />
        <Box sx={{ ml: '28px', mr: '4px', display: 'grid', gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))`, color: 'text.secondary', fontSize: 11.1, fontWeight: 820 }}>
          {months.map((month) => <Box key={month}>{month}</Box>)}
        </Box>
      </Box>
      {groups.map((group) => (
        <TimelineGroup key={group.id} group={group} start={start} end={end} open={openGroups[group.id]} onToggle={toggleGroup} />
      ))}
    </Stack>
  );
}

export default function MentorTimelineView({ picture, subjectConfigs, student }) {
  const groups = buildTimelineGroups({ picture, subjectConfigs, studentId: student.id });
  const eventCount = groups.reduce((total, group) => total + group.rows.reduce((rowTotal, row) => rowTotal + row.events.length, 0), 0);
  const learningObservationCount = groups.reduce((total, group) => total + group.rows.reduce((rowTotal, row) => rowTotal + row.events.filter((event) => event.type === 'learning-observation').length, 0), 0);

  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={1.05}>
        <Box>
          <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Timeline</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1, lineHeight: 1.35 }}>
            Mentor check-ins and {learningObservationCount} subject learning observation signals for {student.displayName}.
          </Typography>
        </Box>
        {eventCount ? (
          <TimelineGraph groups={groups} />
        ) : (
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '8px', border: '1px dashed rgba(23, 21, 26, 0.14)', bgcolor: 'rgba(23, 21, 26, 0.015)' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No timeline events yet.</Typography>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
