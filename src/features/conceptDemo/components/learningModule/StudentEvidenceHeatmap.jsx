import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material';

const purple = '#9c28af';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';

function getLocalizedValue(value, language = 'en') {
  if (value && typeof value === 'object') {
    return value[language] || value.en || Object.values(value)[0] || '';
  }

  return value || '';
}

function formatDate(date, language = 'en') {
  if (!date) return '';
  return new Intl.DateTimeFormat(language === 'sv' ? 'sv-SE' : 'en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getWeekStart(date) {
  const value = new Date(`${date}T12:00:00`);
  if (!Number.isFinite(value.getTime())) return null;
  const day = value.getDay() || 7;
  value.setDate(value.getDate() - day + 1);
  return value;
}

function getWeekKey(date) {
  return getWeekStart(date)?.toISOString().slice(0, 10) || '';
}

function getWeekRangeLabel(week, language) {
  const end = new Date(`${week}T12:00:00`);
  end.setDate(end.getDate() + 6);
  return `${formatDate(week, language)} - ${formatDate(end.toISOString().slice(0, 10), language)}`;
}

function getWeeks(items) {
  const dates = (items || []).map((item) => item.date).filter(Boolean).sort();
  const firstDate = dates[0] || '2026-01-01';
  const lastDate = dates[dates.length - 1] || '2026-05-31';
  const start = getWeekStart(firstDate);
  const end = getWeekStart(lastDate);
  const weeks = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 7)) {
    weeks.push(date.toISOString().slice(0, 10));
  }

  return weeks;
}

function getWeekDayLabel(week, language) {
  return new Intl.DateTimeFormat(language === 'sv' ? 'sv-SE' : 'en-GB', { day: 'numeric' }).format(new Date(`${week}T12:00:00`));
}

function getWeekMonthLabel(week, language) {
  return new Intl.DateTimeFormat(language === 'sv' ? 'sv-SE' : 'en-GB', { month: 'short' }).format(new Date(`${week}T12:00:00`));
}

function getLevelOrder(levels, levelId) {
  return (levels || []).find((level) => level.id === levelId)?.order || 1;
}

function normalizeLearningSignal(value) {
  if (value === '+') return 3;
  if (value === '0') return 2;
  if (value === '-') return 1;
  return 0;
}

function getTone(value, count) {
  if (!count) {
    return {
      label: 'No evidence',
      bgcolor: 'rgba(23, 21, 26, 0.025)',
      borderColor: 'rgba(23, 21, 26, 0.07)',
      color: 'text.secondary',
    };
  }

  if (value >= 3.35) {
    return {
      label: 'Strong evidence',
      bgcolor: purple,
      borderColor: 'rgba(88, 18, 102, 0.28)',
      color: '#fff',
    };
  }

  if (value >= 2.4) {
    return {
      label: 'Developing evidence',
      bgcolor: 'rgba(156, 40, 175, 0.28)',
      borderColor: 'rgba(156, 40, 175, 0.2)',
      color: purple,
    };
  }

  return {
    label: 'Early evidence',
    bgcolor: 'rgba(156, 40, 175, 0.1)',
    borderColor: 'rgba(156, 40, 175, 0.14)',
    color: purple,
  };
}

function getHeatmapTitle(language) {
  return language === 'sv' ? 'Observations- och bedömningsvärmekarta' : 'Observation and assessment heatmap';
}

function buildRows({
  student,
  evidenceItems,
  learningObservations,
  learningObservationAreas,
  curriculumAreas,
  teachingUnits,
  skills,
  levels,
  language,
}) {
  const studentId = student?.id;
  const skillById = new Map((skills || []).map((skill) => [skill.id, skill]));
  const areaById = new Map((curriculumAreas || []).map((area) => [area.id, area]));
  const unitById = new Map((teachingUnits || []).map((unit) => [unit.id, unit]));
  const skillAreaIds = new Map();
  (teachingUnits || []).forEach((unit) => {
    const areaIds = unit.curriculumAreaIds || [unit.curriculumAreaId].filter(Boolean);
    (unit.skillIds || []).forEach((skillId) => {
      if (!skillAreaIds.has(skillId)) {
        skillAreaIds.set(skillId, areaIds);
      }
    });
    (unit.observationDimensions || []).forEach((dimension) => {
      if (!skillAreaIds.has(dimension.id)) {
        skillAreaIds.set(dimension.id, areaIds);
      }
    });
  });
  const evidenceRowsById = new Map();

  (evidenceItems || [])
    .filter((item) => item.type !== 'assessment' && item.studentId === studentId && item.date)
    .forEach((item) => {
      const skillId = item.skillId || item.capturePointId || 'other-evidence';
      const skill = skillById.get(skillId);
      const row = evidenceRowsById.get(skillId) || {
        id: `skill-${skillId}`,
        label: getLocalizedValue(skill?.label || skill?.title, language) || skillId,
        type: 'Curriculum evidence',
        areaIds: skillAreaIds.get(skillId) || [],
        events: [],
      };

      row.events.push({
        id: item.id,
        date: item.date,
        value: getLevelOrder(levels, item.levelId),
        label: getLocalizedValue(item.comment, language) || getLocalizedValue(item.contextLabel, language) || row.label,
      });
      evidenceRowsById.set(skillId, row);
    });

  const learningRows = (learningObservationAreas || [])
    .map((area) => {
      const events = (learningObservations || [])
        .filter((item) => item.studentId === studentId && item.date && item[area.id])
        .map((item) => ({
          id: `${item.id}-${area.id}`,
          date: item.date,
          value: normalizeLearningSignal(item[area.id]),
          label: getLocalizedValue(item.comment, language) || area.label,
        }));

      return events.length ? {
        id: `learning-${area.id}`,
        label: area.label,
        type: 'Learning observations',
        events,
      } : null;
    })
    .filter(Boolean);

  const assessmentRowsByArea = new Map();
  const uncategorizedAssessmentEvents = [];
  (evidenceItems || [])
    .filter((item) => item.type === 'assessment' && item.date)
    .forEach((assessment) => {
      const unit = unitById.get(assessment.teachingUnitId);
      const areaIds = unit?.curriculumAreaIds || [unit?.curriculumAreaId].filter(Boolean);
      const areaId = areaIds.find((id) => areaById.has(id)) || '';
      const events = (assessment.results || [])
      .filter((result) => result.studentId === studentId)
      .map((result) => ({
        id: `${assessment.id}-${studentId}`,
        date: assessment.date,
        value: Number.isFinite(Number(result.percentage)) ? Math.max(1, Math.min(4, Number(result.percentage) / 25)) : (result.passed ? 3 : 1),
        label: `${getLocalizedValue(assessment.title, language) || assessment.assessmentTitle || 'Assessment'}${Number.isFinite(Number(result.percentage)) ? ` · ${result.percentage}%` : ''}`,
      }));

      if (!events.length) {
        return;
      }

      if (!areaId) {
        uncategorizedAssessmentEvents.push(...events);
        return;
      }

      const row = assessmentRowsByArea.get(areaId) || {
        id: `assessment-${areaId}`,
        label: 'Assessments',
        type: 'Assessment evidence',
        areaIds: [areaId],
        events: [],
      };
      row.events.push(...events);
      assessmentRowsByArea.set(areaId, row);
    });
  const evidenceRowsByArea = new Map();
  const uncategorizedRows = [];
  [...evidenceRowsById.values()].forEach((row) => {
    const areaId = row.areaIds.find((id) => areaById.has(id));
    if (!areaId) {
      uncategorizedRows.push(row);
      return;
    }

    evidenceRowsByArea.set(areaId, [...(evidenceRowsByArea.get(areaId) || []), row]);
  });
  const uncategorizedAssessmentRows = uncategorizedAssessmentEvents.length ? [{
    id: 'assessment-uncategorized',
    label: 'Assessments',
    type: 'Assessment evidence',
    events: uncategorizedAssessmentEvents,
  }] : [];
  const groupedEvidenceRows = [
    ...(curriculumAreas || []).flatMap((area) => {
      const rows = [
        ...(evidenceRowsByArea.get(area.id) || []).sort((first, second) => first.label.localeCompare(second.label)),
        ...(assessmentRowsByArea.get(area.id) ? [assessmentRowsByArea.get(area.id)] : []),
      ];
      return rows.length ? [
        {
          id: `area-${area.id}`,
          label: getLocalizedValue(area.title || area.label, language) || area.id,
          type: 'Curriculum area',
          section: true,
          events: [],
        },
        ...rows,
      ] : [];
    }),
    ...uncategorizedRows.sort((first, second) => first.label.localeCompare(second.label)),
    ...uncategorizedAssessmentRows,
  ];
  const groupedLearningRows = learningRows.length ? [
    {
      id: 'section-learning-observations',
      label: 'Learning observations',
      type: 'Learning observations',
      section: true,
      events: [],
    },
    ...learningRows,
  ] : [];

  return [
    ...groupedLearningRows,
    ...groupedEvidenceRows,
  ];
}

function HeatmapCell({ row, week, language }) {
  const events = row.events.filter((event) => getWeekKey(event.date) === week);
  const averageValue = events.length ? events.reduce((total, event) => total + event.value, 0) / events.length : 0;
  const tone = getTone(averageValue, events.length);

  return (
    <Tooltip
      arrow
      placement="top"
      title={(
        <Box>
          <Typography sx={{ color: 'inherit', fontSize: 11.5, fontWeight: 850 }}>
            {row.label} · {getWeekRangeLabel(week, language)} · {tone.label}
          </Typography>
          {events.length ? events.map((event) => (
            <Typography key={event.id} sx={{ mt: 0.25, color: 'inherit', fontSize: 11.1, lineHeight: 1.3 }}>
              {formatDate(event.date, language)} · {event.label}
            </Typography>
          )) : (
            <Typography sx={{ mt: 0.25, color: 'inherit', fontSize: 11.1, lineHeight: 1.3 }}>
              No evidence recorded.
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
          borderStyle: row.type === 'Assessment evidence' ? 'dashed' : 'solid',
          borderColor: tone.borderColor,
          bgcolor: tone.bgcolor,
          color: tone.color,
          display: 'grid',
          placeItems: 'center',
          fontSize: 10.7,
          fontWeight: 900,
        }}
      >
        {events.length > 1 ? events.length : ''}
      </Box>
    </Tooltip>
  );
}

export default function StudentEvidenceHeatmap({
  student,
  evidenceItems,
  learningObservations,
  learningObservationAreas,
  skills,
  levels,
  curriculumAreas = [],
  teachingUnits = [],
  language = 'en',
}) {
  const rows = buildRows({
    student,
    evidenceItems,
    learningObservations,
    learningObservationAreas,
    curriculumAreas,
    teachingUnits,
    skills,
    levels,
    language,
  });
  const weeks = getWeeks(rows.flatMap((row) => row.events));

  return (
    <Paper elevation={0} sx={{ m: { xs: 1, sm: 1.25 }, p: 1.1, borderRadius: '8px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' }, gap: 0.8, alignItems: 'center' }}>
          <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getHeatmapTitle(language)}
          </Typography>
          <Stack direction="row" spacing={0.8} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} flexWrap="wrap" useFlexGap>
            {[
              { label: 'Early', bgcolor: 'rgba(156, 40, 175, 0.1)', borderColor: 'rgba(156, 40, 175, 0.14)' },
              { label: 'Developing', bgcolor: 'rgba(156, 40, 175, 0.28)', borderColor: 'rgba(156, 40, 175, 0.2)' },
              { label: 'Strong', bgcolor: purple, borderColor: 'rgba(88, 18, 102, 0.28)' },
            ].map((item) => (
              <Stack key={item.label} direction="row" spacing={0.4} alignItems="center">
                <Box sx={{ width: 18, height: 18, borderRadius: '5px', bgcolor: item.bgcolor, border: '1px solid', borderColor: item.borderColor }} />
                <Typography sx={{ color: 'text.secondary', fontSize: 11.3, fontWeight: 760 }}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {rows.length ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Box
              sx={{
                minWidth: Math.max(620, 132 + (weeks.length * 31)),
                display: 'grid',
                gridTemplateColumns: `132px repeat(${weeks.length}, minmax(28px, 1fr))`,
                gap: 0.35,
              }}
            >
              <Box />
              {weeks.map((week, index) => {
                const previousWeek = weeks[index - 1];
                const showMonth = !previousWeek || getWeekMonthLabel(previousWeek, language) !== getWeekMonthLabel(week, language);
                return (
                  <Box key={week} sx={{ textAlign: 'center', minWidth: 0 }}>
                    <Typography sx={{ height: 15, color: showMonth ? purple : 'transparent', fontSize: 11, fontWeight: 920, lineHeight: 1.05 }}>
                      {showMonth ? getWeekMonthLabel(week, language) : '-'}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 860, lineHeight: 1.1 }}>
                      {getWeekDayLabel(week, language)}
                    </Typography>
                  </Box>
                );
              })}
              {rows.map((row) => {
                if (row.section) {
                  return (
                    <Box
                      key={row.id}
                      sx={{
                        gridColumn: '1 / -1',
                        mt: 0.25,
                        px: 0.7,
                        py: 0.45,
                        borderRadius: '8px',
                        bgcolor: 'rgba(156, 40, 175, 0.055)',
                        border: '1px solid rgba(156, 40, 175, 0.11)',
                      }}
                    >
                      <Typography sx={{ color: darkText, fontSize: 12.2, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.label}
                      </Typography>
                    </Box>
                  );
                }

                return (
                  <Box key={row.id} sx={{ display: 'contents' }}>
                    <Box sx={{ minHeight: 34, px: 0.65, display: 'flex', alignItems: 'center', borderRadius: '8px 0 0 8px', border: '1px solid', borderRight: 0, borderStyle: row.type === 'Assessment evidence' ? 'dashed' : 'solid', borderColor: row.type === 'Assessment evidence' ? 'rgba(156, 40, 175, 0.18)' : 'rgba(23, 21, 26, 0.08)', bgcolor: row.type === 'Learning observations' ? 'rgba(156, 40, 175, 0.045)' : row.type === 'Assessment evidence' ? '#fff' : 'rgba(23, 21, 26, 0.022)' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: row.type === 'Learning observations' ? darkText : row.type === 'Assessment evidence' ? purple : 'text.secondary', fontSize: 11.8, fontWeight: row.type === 'Assessment evidence' ? 880 : 830, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.label}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: 9.8, fontWeight: 720, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.type}
                        </Typography>
                      </Box>
                    </Box>
                    {weeks.map((week) => (
                      <HeatmapCell key={`${row.id}-${week}`} row={row} week={week} language={language} />
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: '8px', border: '1px dashed rgba(23, 21, 26, 0.14)', bgcolor: 'rgba(23, 21, 26, 0.015)' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No evidence yet.</Typography>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
