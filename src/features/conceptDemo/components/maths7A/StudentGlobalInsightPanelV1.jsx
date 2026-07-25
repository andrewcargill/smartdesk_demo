import { useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import {
  maths7ALearningObservationAreas,
  maths7ALearningObservationChoices,
} from '../../data/maths7ALearningObservations.js';
import {
  getEvidenceForStudent,
  getLatestEvidenceDate,
  sortEvidenceByDate,
} from '../../utils/maths7APictureUtils.js';

const purple = '#9c28af';
const darkText = '#17151a';

function formatDemoDate(date) {
  if (!date) {
    return 'No saved date';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function readHistoricalResult(student) {
  return student.previousResults?.find((result) => result.subjectId === 'mathematics') || null;
}

function LearningObservationHistoryPanel({ observations, activeObservation }) {
  const sortedObservations = sortEvidenceByDate(observations || [], 'desc');
  const choiceById = new Map(maths7ALearningObservationChoices.map((choice) => [choice.id, choice]));
  const activeArea = maths7ALearningObservationAreas.find((area) => area.id === activeObservation?.areaId);
  const activeChoice = choiceById.get(activeObservation?.choiceId);
  const latestByAreaId = maths7ALearningObservationAreas.reduce((itemsByArea, area) => {
    itemsByArea[area.id] = sortedObservations.find((observation) => observation.areaId === area.id) || null;
    return itemsByArea;
  }, {});

  return (
    <Paper elevation={0} sx={{ p: 1.15, height: 310, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
      <Typography sx={{ color: darkText, fontSize: 13.6, fontWeight: 880 }}>Learning observations</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 0.8, mt: 0.9 }}>
        {maths7ALearningObservationAreas.map((area) => {
          const latestObservation = latestByAreaId[area.id];
          const choice = choiceById.get(latestObservation?.choiceId);

          return (
            <Box key={area.id} sx={{ p: 1, minHeight: 68, borderRadius: '12px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
              <Typography sx={{ color: darkText, fontSize: 12.6, fontWeight: 850 }}>{area.label}</Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between" sx={{ mt: 0.45 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 650 }}>
                  {latestObservation ? formatDemoDate(latestObservation.date) : 'No entry yet'}
                </Typography>
                <Box
                  title={latestObservation ? `${area.label} · ${choice?.label || latestObservation.choiceId} · ${formatDemoDate(latestObservation.date)}` : `${area.label} · no observation`}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: latestObservation ? `1px solid ${purple}` : '1px solid rgba(23, 21, 26, 0.14)',
                    bgcolor: latestObservation ? purple : '#fff',
                    color: latestObservation ? '#fff' : 'rgba(23, 21, 26, 0.36)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 880,
                  }}
                >
                  {choice?.label || ''}
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          mt: 1,
          minHeight: 112,
          p: 1.25,
          borderRadius: '12px',
          border: '1px solid rgba(23, 21, 26, 0.07)',
          bgcolor: activeObservation ? 'rgba(156, 40, 175, 0.035)' : '#fff',
          transition: 'background-color 140ms ease',
        }}
      >
        {activeObservation ? (
          <Stack spacing={0.8}>
            <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880, lineHeight: 1.25 }}>
              {formatDemoDate(activeObservation.date)} · {activeArea?.label || activeObservation.areaId} · {activeChoice?.label || activeObservation.choiceId}
            </Typography>
            <Box>
              <Typography sx={{ color: 'rgba(23, 21, 26, 0.42)', fontSize: 11.8, fontWeight: 840, lineHeight: 1.2 }}>
                Teacher comment
              </Typography>
              <Typography sx={{ mt: 0.35, pl: 0.9, color: 'text.secondary', fontSize: 13.4, lineHeight: 1.48, borderLeft: '3px solid rgba(156, 40, 175, 0.24)' }}>
                {activeObservation.note || 'No comment added.'}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography sx={{ color: 'rgba(23, 21, 26, 0.34)', fontSize: 13.2, lineHeight: 1.45 }}>
            Hover over a graph point to see the date and comment.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function getLearningObservationChoiceValue(choiceId) {
  if (choiceId === 'plus') {
    return 1;
  }
  if (choiceId === 'minus') {
    return -1;
  }
  return 0;
}

function LearningObservationTimelineGraph({ observations, activeObservationId, onActiveObservationChange }) {
  const sortedObservations = sortEvidenceByDate(observations || [], 'asc');
  const timestamps = sortedObservations.map((observation) => new Date(`${observation.date}T12:00:00`).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const hasRange = Number.isFinite(minTime) && Number.isFinite(maxTime) && minTime !== maxTime;
  const choiceById = new Map(maths7ALearningObservationChoices.map((choice) => [choice.id, choice]));

  return (
    <Paper elevation={0} sx={{ p: 1.15, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: '100%' }}>
      <Stack spacing={0.8}>
        <Typography sx={{ color: darkText, fontSize: 13.6, fontWeight: 880 }}>Learning observation pattern</Typography>
        <Stack spacing={0.65}>
          {maths7ALearningObservationAreas.map((area) => {
            const areaObservations = sortedObservations.filter((observation) => observation.areaId === area.id);
            const points = areaObservations.map((observation) => {
              const timestamp = new Date(`${observation.date}T12:00:00`).getTime();
              const choiceValue = getLearningObservationChoiceValue(observation.choiceId);

              return {
                ...observation,
                x: hasRange ? 16 + ((timestamp - minTime) / (maxTime - minTime)) * 197 : 114,
                y: 36 - choiceValue * 14,
                choice: choiceById.get(observation.choiceId),
              };
            });
            const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

            return (
              <Box
                key={area.id}
                component="svg"
                role="img"
                aria-label={`${area.label} learning observations plotted over time`}
                viewBox="0 0 220 58"
                sx={{
                  width: '100%',
                  height: { xs: 92, sm: 108 },
                  display: 'block',
                  overflow: 'visible',
                  '& circle': { outline: 'none', transition: 'r 140ms ease, fill 140ms ease' },
                  '& circle:hover': { r: 4.4, fill: purple },
                }}
              >
                <text x="1" y="7" fill="rgba(23, 21, 26, 0.68)" fontSize="5.4" fontWeight="800">{area.label}</text>
                <text x="6" y="23.8" fill="rgba(23, 21, 26, 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">+</text>
                <text x="6" y="37.8" fill="rgba(23, 21, 26, 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">0</text>
                <text x="6" y="51.8" fill="rgba(23, 21, 26, 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">-</text>
                <line x1="16" y1="22" x2="213" y2="22" stroke="rgba(23, 21, 26, 0.05)" strokeWidth="1" />
                <line x1="16" y1="36" x2="213" y2="36" stroke="rgba(23, 21, 26, 0.1)" strokeWidth="1" />
                <line x1="16" y1="50" x2="213" y2="50" stroke="rgba(23, 21, 26, 0.05)" strokeWidth="1" />
                {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(156, 40, 175, 0.34)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />}
                {points.map((point) => {
                  const isActive = activeObservationId === point.id;

                  return (
                    <circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? '3.9' : '2.8'}
                      fill={purple}
                      stroke={isActive ? 'rgba(156, 40, 175, 0.28)' : '#fff'}
                      strokeWidth={isActive ? '2.4' : '1'}
                      tabIndex={0}
                      onMouseEnter={() => onActiveObservationChange?.({ ...point, areaLabel: area.label })}
                      onFocus={() => onActiveObservationChange?.({ ...point, areaLabel: area.label })}
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      <title>{`${formatDemoDate(point.date)} · ${area.label} · ${point.choice?.label || point.choiceId}${point.note ? ` · ${point.note}` : ''}`}</title>
                    </circle>
                  );
                })}
                {!points.length && (
                  <>
                    <line x1="24" y1="36" x2="86" y2="36" stroke="rgba(23, 21, 26, 0.16)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="55" cy="36" r="3" fill="rgba(23, 21, 26, 0.18)" />
                  </>
                )}
              </Box>
            );
          })}
        </Stack>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
          {sortedObservations.length ? `${formatDemoDate(sortedObservations[0].date)} to ${formatDemoDate(sortedObservations[sortedObservations.length - 1].date)}` : 'No learning observations yet'}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function StudentGlobalInsightPanelV1({ student, evidence, rowNote, learningObservations = [] }) {
  const studentEvidence = getEvidenceForStudent(evidence, student.id);
  const previousResult = readHistoricalResult(student);
  const latestEvidenceDate = getLatestEvidenceDate(studentEvidence);
  const subjectLabel = student.subjectId === 'mathematics' ? 'Mathematics' : student.subjectId;
  const [activeLearningObservation, setActiveLearningObservation] = useState(null);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-insight-global-v1-${student.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: `4px solid ${purple}`, bgcolor: '#fff' }}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>Global student picture</Typography>
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.8 }}>
                Latest evidence: {latestEvidenceDate ? formatDemoDate(latestEvidenceDate) : 'None'}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2.15fr) minmax(220px, 0.85fr)' }, gap: 1.1, alignItems: 'stretch' }}>
            <LearningObservationTimelineGraph
              observations={learningObservations}
              activeObservationId={activeLearningObservation?.id || ''}
              onActiveObservationChange={setActiveLearningObservation}
            />
            <Stack spacing={1.1}>
              <LearningObservationHistoryPanel
                observations={learningObservations}
                activeObservation={activeLearningObservation}
              />
              <Paper elevation={0} sx={{ p: 0.95, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
                <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 880 }}>Known anchors</Typography>
                <Stack spacing={0.42} sx={{ mt: 0.65 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    Year 6 maths · <Box component="span" sx={{ color: darkText, fontWeight: 800 }}>{previousResult?.grade || 'Not shown'}</Box>
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    Class · <Box component="span" sx={{ color: darkText, fontWeight: 800 }}>{subjectLabel} {String(student.classId || '').toUpperCase()}</Box>
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    Quick note · <Box component="span" sx={{ color: rowNote ? darkText : 'text.secondary', fontWeight: rowNote ? 800 : 650 }}>{rowNote || 'None added'}</Box>
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
