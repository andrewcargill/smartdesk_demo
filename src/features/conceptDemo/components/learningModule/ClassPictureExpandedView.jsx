import NotesIcon from '@mui/icons-material/Notes';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import SquareIcon from '@mui/icons-material/Square';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

const purple = '#9c28af';
const darkText = '#17151a';
const mutedText = 'rgba(23, 21, 26, 0.62)';

function getTimelineLocale(language) {
  return language === 'sv' ? 'sv-SE' : 'en-GB';
}

function formatMonth(date, language) {
  return new Intl.DateTimeFormat(getTimelineLocale(language), { month: 'long' }).format(new Date(`${date}T12:00:00`));
}

function formatShortDate(date, language) {
  return new Intl.DateTimeFormat(getTimelineLocale(language), { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function toDateValue(date) {
  return new Date(`${date}T12:00:00`).getTime();
}

function getDateRange(items) {
  const dates = items.map((item) => item.date).filter(Boolean).sort();

  if (!dates.length) {
    const today = new Date().toISOString().slice(0, 10);
    return { start: today, end: today };
  }

  return { start: dates[0], end: dates[dates.length - 1] };
}

function getPosition(date, range) {
  const start = toDateValue(range.start);
  const end = toDateValue(range.end);
  const current = toDateValue(date);
  const span = Math.max(end - start, 1);

  return Math.max(0, Math.min(100, ((current - start) / span) * 100));
}

function getObservationY(value) {
  if (value === '+') return 8;
  if (value === '-') return 44;
  return 26;
}

function getMonthMarkers(range) {
  const markers = [];
  const cursor = new Date(`${range.start}T12:00:00`);
  const end = new Date(`${range.end}T12:00:00`);
  cursor.setDate(1);

  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10);
    markers.push(date);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (!markers.includes(range.start)) {
    markers.unshift(range.start);
  }

  return [...new Set(markers)].sort();
}

function getLocalizedValue(value, language) {
  if (value && typeof value === 'object') {
    return value[language] || value.en || Object.values(value)[0] || '';
  }

  return value || '';
}

function getAssessmentEvents(evidenceItems, studentId) {
  return (evidenceItems || [])
    .filter((item) => item.type === 'assessment')
    .flatMap((assessment) => (assessment.results || [])
      .filter((result) => result.studentId === studentId)
      .map((result) => ({
        id: `${assessment.id}-${studentId}`,
        date: assessment.date,
        title: assessment.title,
        teachingUnitId: assessment.teachingUnitId,
        percentage: result.percentage,
        absent: result.absent,
      })));
}

function buildTimelineData({
  student,
  evidenceItems,
  learningObservations,
  teachingUnits,
  rowNote,
  cellNotes,
  unitNotes,
  learningObservationAreas,
  language,
}) {
  const studentId = student?.id;
  const unitById = new Map((teachingUnits || []).map((unit) => [unit.id, unit]));
  const observations = (evidenceItems || [])
    .filter((item) => item.type !== 'assessment' && item.studentId === studentId && item.date)
    .map((item) => ({
      ...item,
      unitTitle: getLocalizedValue(unitById.get(item.teachingUnitId)?.title || unitById.get(item.teachingUnitId)?.label, language),
    }));
  const assessments = getAssessmentEvents(evidenceItems, studentId).filter((item) => item.date);
  const learningEvents = (learningObservations || [])
    .filter((item) => item.studentId === studentId && item.date)
    .flatMap((observation) => (learningObservationAreas || [])
      .filter((area) => observation[area.id])
      .map((area) => ({
        id: `${observation.id}-${area.id}`,
        areaId: area.id,
        date: observation.date,
        title: area.label,
        value: observation[area.id],
        comment: getLocalizedValue(observation.comment, language),
      })));

  const units = (teachingUnits || [])
    .map((unit) => {
      const unitDates = [
        ...observations.filter((item) => item.teachingUnitId === unit.id).map((item) => item.date),
        ...assessments.filter((item) => item.teachingUnitId === unit.id).map((item) => item.date),
      ].filter(Boolean).sort();

      if (!unitDates.length) {
        return null;
      }

      return {
        id: unit.id,
        title: getLocalizedValue(unit.title || unit.label, language),
        startDate: unitDates[0],
        endDate: unitDates[unitDates.length - 1],
      };
    })
    .filter(Boolean);

  const teachingResponses = [
    rowNote ? { id: `${studentId}-row-note`, date: observations[0]?.date || learningEvents[0]?.date || assessments[0]?.date, text: rowNote } : null,
    ...Object.entries(cellNotes || {})
      .filter(([key, value]) => key.startsWith(`${studentId}:`) && value)
      .map(([key, value]) => {
        const unitId = key.split(':')[1];
        const unitDate = observations.find((item) => item.teachingUnitId === unitId)?.date
          || assessments.find((item) => item.teachingUnitId === unitId)?.date;
        return {
          id: key,
          date: unitDate,
          text: value,
        };
      }),
    ...Object.entries(unitNotes || {})
      .filter(([, value]) => value)
      .map(([unitId, value]) => ({
        id: `${studentId}-${unitId}-unit-note`,
        date: observations.find((item) => item.teachingUnitId === unitId)?.date
          || assessments.find((item) => item.teachingUnitId === unitId)?.date,
        text: value,
      })),
  ].filter((item) => item?.date);

  const range = getDateRange([
    ...observations,
    ...assessments,
    ...learningEvents,
    ...units.map((unit) => ({ date: unit.startDate })),
    ...units.map((unit) => ({ date: unit.endDate })),
    ...teachingResponses,
  ]);

  return {
    range,
    units,
    learningEvents: learningEvents.sort((first, second) => first.date.localeCompare(second.date)),
    observations: observations.sort((first, second) => first.date.localeCompare(second.date)),
    assessments: assessments.sort((first, second) => first.date.localeCompare(second.date)),
    teachingResponses: teachingResponses.sort((first, second) => first.date.localeCompare(second.date)),
  };
}

function TimelineIcon({ type }) {
  if (type === 'assessment') {
    return <SquareIcon sx={{ color: purple, fontSize: 13, transform: 'rotate(45deg)' }} />;
  }

  if (type === 'response') {
    return <NotesIcon sx={{ color: 'rgba(23, 21, 26, 0.58)', fontSize: 14 }} />;
  }

  return <RadioButtonCheckedIcon sx={{ color: purple, fontSize: 13 }} />;
}

function TimelineItem({ item, range, type, children }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${getPosition(item.date, range)}%`,
        top: 0,
        width: 150,
        maxWidth: 150,
        transform: 'translateX(-6px)',
      }}
    >
      <Stack direction="row" spacing={0.45} alignItems="flex-start">
        <Box sx={{ pt: 0.2, flexShrink: 0 }}>
          <TimelineIcon type={type} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          {children}
        </Box>
      </Stack>
    </Box>
  );
}

function TimelineRow({ label, children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '132px minmax(0, 1fr)',
        gap: 1.2,
        minHeight: 70,
        py: 0.9,
        borderTop: '1px solid rgba(23, 21, 26, 0.07)',
      }}
    >
      <Typography sx={{ color: mutedText, fontSize: 12.2, fontWeight: 850, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Box sx={{ position: 'relative', minHeight: 52 }}>
        {children}
      </Box>
    </Box>
  );
}

function EmptyRow() {
  return <Box sx={{ width: 24, height: 2, mt: 1, borderRadius: 999, bgcolor: 'rgba(23, 21, 26, 0.16)' }} />;
}

function LearningObservationGraph({ events, areas, range, language }) {
  if (!events.length) {
    return <EmptyRow />;
  }

  return (
    <Stack spacing={1.1}>
      {(areas || []).map((area) => {
        const points = events
          .filter((event) => event.areaId === area.id)
          .sort((first, second) => first.date.localeCompare(second.date))
          .map((event) => ({
            id: event.id,
            date: event.date,
            title: event.title,
            value: event.value,
            comment: event.comment,
            x: getPosition(event.date, range),
            y: getObservationY(event.value),
          }));
        const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

        return (
          <Box
            key={area.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '112px minmax(0, 1fr)',
              gap: 1.1,
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 850, lineHeight: 1.15 }}>
              {area.label}
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 44,
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 100 52"
                preserveAspectRatio="none"
                role="img"
                aria-label={area.label}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  overflow: 'visible',
                }}
              >
                <line
                  x1="0"
                  x2="100"
                  y1="26"
                  y2="26"
                  stroke="rgba(23, 21, 26, 0.22)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                {points.length > 1 ? (
                  <path
                    d={path}
                    fill="none"
                    stroke={purple}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
              </Box>
              {points.map((point) => (
                <Tooltip
                  key={point.id}
                  arrow
                  placement="top"
                  title={(
                    <Stack spacing={0.3}>
                      <Typography sx={{ color: '#fff', fontSize: 11.8, fontWeight: 850, lineHeight: 1.2 }}>
                        {point.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.2 }}>
                        {formatShortDate(point.date, language)} · {point.value}
                      </Typography>
                      {point.comment ? (
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11.2, lineHeight: 1.25 }}>
                          {point.comment}
                        </Typography>
                      ) : null}
                    </Stack>
                  )}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: `${(point.y / 52) * 100}%`,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      border: `2px solid ${purple}`,
                      bgcolor: '#fff',
                      transform: 'translate(-50%, -50%)',
                      boxSizing: 'border-box',
                      cursor: 'default',
                      transition: 'width 120ms ease, height 120ms ease, box-shadow 120ms ease',
                      '&:hover': {
                        width: 11,
                        height: 11,
                        boxShadow: '0 0 0 4px rgba(156, 40, 175, 0.13)',
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

export default function ClassPictureExpandedView({
  student,
  evidenceItems,
  learningObservations,
  teachingUnits,
  rowNote,
  cellNotes,
  unitNotes,
  learningObservationAreas,
  language,
}) {
  const timeline = buildTimelineData({
    student,
    evidenceItems,
    learningObservations,
    teachingUnits,
    rowNote,
    cellNotes,
    unitNotes,
    learningObservationAreas,
    language,
  });
  const monthMarkers = getMonthMarkers(timeline.range);

  return (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid rgba(23, 21, 26, 0.08)',
        bgcolor: '#fff',
        overflowX: 'auto',
      }}
    >
      <Box sx={{ minWidth: 780 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '132px minmax(0, 1fr)', gap: 1.2, pb: 0.75 }}>
          <Box />
          <Box sx={{ position: 'relative', height: 28 }}>
            {monthMarkers.map((date) => (
              <Typography
                key={date}
                sx={{
                  position: 'absolute',
                  left: `${getPosition(date, timeline.range)}%`,
                  transform: 'translateX(-1px)',
                  color: mutedText,
                  fontSize: 12,
                  fontWeight: 850,
                  textTransform: 'capitalize',
                }}
              >
                {formatMonth(date, language)}
              </Typography>
            ))}
          </Box>
        </Box>

        <TimelineRow label="Class content">
          <Box sx={{ position: 'absolute', top: 13, left: 0, right: 0, height: 2, bgcolor: 'rgba(23, 21, 26, 0.12)' }} />
          {timeline.units.length ? timeline.units.map((unit) => {
            const left = getPosition(unit.startDate, timeline.range);
            const right = getPosition(unit.endDate, timeline.range);
            return (
              <Box
                key={unit.id}
                sx={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: `${Math.max(right - left, 8)}%`,
                  top: 4,
                }}
              >
                <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 850, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {unit.title}
                </Typography>
                <Box sx={{ mt: 0.45, height: 3, borderRadius: 999, bgcolor: 'rgba(156, 40, 175, 0.5)' }} />
              </Box>
            );
          }) : <EmptyRow />}
        </TimelineRow>

        <TimelineRow label="Learning observations">
          <LearningObservationGraph
            events={timeline.learningEvents}
            areas={learningObservationAreas}
            range={timeline.range}
            language={language}
          />
        </TimelineRow>

        <TimelineRow label="Unit observations">
          {timeline.observations.length ? timeline.observations.map((item) => (
            <TimelineItem key={item.id} item={item} range={timeline.range}>
              <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 800, lineHeight: 1.25 }}>
                {getLocalizedValue(item.note, language)}
              </Typography>
              <Typography sx={{ mt: 0.15, color: mutedText, fontSize: 11.4 }}>
                {formatShortDate(item.date, language)}
              </Typography>
            </TimelineItem>
          )) : <EmptyRow />}
        </TimelineRow>

        <TimelineRow label="Assessments">
          {timeline.assessments.length ? timeline.assessments.map((item) => (
            <TimelineItem key={item.id} item={item} range={timeline.range} type="assessment">
              <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 850, lineHeight: 1.2 }}>
                {getLocalizedValue(item.title, language)}
              </Typography>
              <Typography sx={{ mt: 0.15, color: mutedText, fontSize: 11.5 }}>
                {item.absent ? 'Absent' : `${item.percentage}%`}
              </Typography>
            </TimelineItem>
          )) : <EmptyRow />}
        </TimelineRow>

        <TimelineRow label="Teaching response">
          {timeline.teachingResponses.length ? timeline.teachingResponses.map((item) => (
            <TimelineItem key={item.id} item={item} range={timeline.range} type="response">
              <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 780, lineHeight: 1.25 }}>
                {item.text}
              </Typography>
            </TimelineItem>
          )) : <EmptyRow />}
        </TimelineRow>
      </Box>
    </Box>
  );
}
