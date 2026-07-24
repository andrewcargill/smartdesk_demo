import { useEffect, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Chip,
  Dialog,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  getMathsCaptureLevelById,
  getMathsCapturePointsForTopic,
  mathsCaptureLevels,
} from '../../data/mathsCaptureConfig.js';
import {
  getEvidenceForStudent,
  sortEvidenceByDate,
} from '../../utils/maths7APictureUtils.js';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';

function formatDemoDate(date) {
  if (!date) {
    return 'No saved date';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getAssessmentPercentage(item) {
  const percentage = item?.percentage !== undefined && item?.percentage !== null
    ? Number(item.percentage)
    : item?.valueType === 'percentage'
      ? Number(item.value)
      : null;

  return Number.isFinite(percentage) ? percentage : null;
}

function getJudgementKey(studentId, teachingUnitId) {
  return `${studentId}:${teachingUnitId}`;
}

function getUnitEvidenceItems(evidence, unit) {
  return (evidence || []).filter((item) => (
    item.teachingUnitId === unit.id
    || (unit.evidenceTopicIds || []).includes(item.evidenceTopicId)
  ));
}

function getCapturePointsForUnit(unit) {
  return (unit.evidenceTopicIds || []).flatMap((topicId) => getMathsCapturePointsForTopic({
    teachingUnitId: unit.id,
    evidenceTopicId: topicId,
  }));
}

function buildTeachingUnitEvidenceSummary(unit, evidence, judgement) {
  const items = getUnitEvidenceItems(evidence, unit);
  const observations = items.filter((item) => item.type !== 'assessment');
  const assessments = items.filter((item) => item.type === 'assessment');
  const capturePoints = getCapturePointsForUnit(unit);
  const observedCapturePointIds = new Set(observations.map((item) => item.capturePointId).filter(Boolean));
  const unstructuredObservations = observations.filter((item) => !item.capturePointId);
  const dates = [...new Set(items.map((item) => item.date).filter(Boolean))].sort();

  return {
    unit,
    items,
    observations,
    assessments,
    capturePoints,
    observedCapturePointIds,
    observedCapturePointCount: capturePoints.filter((point) => observedCapturePointIds.has(point.id)).length,
    unstructuredObservationCount: unstructuredObservations.length,
    lessonCount: dates.length,
    earliestDate: dates[0] || null,
    latestDate: dates[dates.length - 1] || null,
    judgement,
  };
}

function buildCapturePointSequences(summary) {
  const observationsByCapturePoint = new Map();
  summary.observations
    .filter((item) => item.capturePointId && item.levelId)
    .forEach((item) => {
      if (!observationsByCapturePoint.has(item.capturePointId)) {
        observationsByCapturePoint.set(item.capturePointId, []);
      }
      observationsByCapturePoint.get(item.capturePointId).push(item);
    });

  return summary.capturePoints.map((capturePoint) => {
    const observations = sortEvidenceByDate(observationsByCapturePoint.get(capturePoint.id) || [], 'asc');
    return {
      capturePoint,
      observations,
    };
  });
}

function getRepeatedSequenceGroups(summary) {
  return buildCapturePointSequences(summary).filter((sequence) => sequence.observations.length >= 2);
}

function getEvidenceDateGroups(items) {
  const groupsByDate = new Map();

  sortEvidenceByDate(items || [], 'asc').forEach((item) => {
    if (!item.date) return;
    const existingGroup = groupsByDate.get(item.date) || {
      date: item.date,
      observations: 0,
      assessments: 0,
      labels: [],
    };

    if (item.type === 'assessment') {
      existingGroup.assessments += 1;
    } else {
      existingGroup.observations += 1;
    }

    existingGroup.labels.push(item.assessmentTitle || item.observationText || item.label || 'Evidence');
    groupsByDate.set(item.date, existingGroup);
  });

  return [...groupsByDate.values()].map((group) => ({
    ...group,
    count: group.observations + group.assessments,
  }));
}

function EvidenceTimelineTile({ title, items }) {
  const dateGroups = getEvidenceDateGroups(items);
  const maxCount = Math.max(...dateGroups.map((group) => group.count), 1);
  const points = dateGroups.map((group, index) => ({
    ...group,
    x: dateGroups.length === 1 ? 50 : 8 + (index / (dateGroups.length - 1)) * 84,
    y: 54 - (group.count / maxCount) * 38,
  }));
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const firstDate = dateGroups[0]?.date || null;
  const latestDate = dateGroups[dateGroups.length - 1]?.date || null;

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: 126 }}>
      <Stack spacing={0.8}>
        <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
          <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>{title}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>{dateGroups.length} date{dateGroups.length === 1 ? '' : 's'}</Typography>
        </Stack>
        <Box
          component="svg"
          role="img"
          aria-label={title}
          viewBox="0 0 100 64"
          sx={{
            width: '100%',
            height: 66,
            display: 'block',
            overflow: 'visible',
            '& circle': { transition: 'r 140ms ease, fill 140ms ease' },
            '& circle:hover': { r: 4.8, fill: purple },
          }}
        >
          <line x1="8" y1="54" x2="92" y2="54" stroke="rgba(23, 21, 26, 0.12)" strokeWidth="1.5" />
          <line x1="8" y1="16" x2="92" y2="16" stroke="rgba(23, 21, 26, 0.05)" strokeWidth="1" />
          {points.length > 1 && <polyline points={linePoints} fill="none" stroke={purple} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
          {points.length === 1 && <line x1="22" y1={points[0].y} x2="78" y2={points[0].y} stroke={purple} strokeWidth="2.6" strokeLinecap="round" />}
          {points.map((point) => (
            <circle key={point.date} cx={point.x} cy={point.y} r="3.7" fill={darkText} stroke="#fff" strokeWidth="1.5">
              <title>{`${formatDemoDate(point.date)} · ${point.count} item${point.count === 1 ? '' : 's'} · ${point.labels.slice(0, 2).join(' · ')}`}</title>
            </circle>
          ))}
          {!points.length && (
            <>
              <line x1="22" y1="35" x2="78" y2="35" stroke="rgba(23, 21, 26, 0.18)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="50" cy="35" r="3.5" fill="rgba(23, 21, 26, 0.22)" />
            </>
          )}
        </Box>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
          {latestDate ? `${formatDemoDate(firstDate)} to ${formatDemoDate(latestDate)}` : 'No dated evidence yet'}
        </Typography>
      </Stack>
    </Paper>
  );
}

function AssessmentResultTile({ assessments, title = 'Assessment line' }) {
  const sortedAssessments = sortEvidenceByDate(assessments || [], 'asc')
    .filter((item) => getAssessmentPercentage(item) !== null);
  const points = sortedAssessments.map((item, index) => ({
    item,
    x: sortedAssessments.length === 1 ? 50 : 8 + (index / (sortedAssessments.length - 1)) * 84,
    y: 54 - (getAssessmentPercentage(item) / 100) * 38,
  }));
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: 126 }}>
      <Stack spacing={0.8}>
        <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
          <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>{title}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 11.5, fontWeight: 720 }}>{sortedAssessments.length} result{sortedAssessments.length === 1 ? '' : 's'}</Typography>
        </Stack>
        <Box
          component="svg"
          role="img"
          aria-label={title}
          viewBox="0 0 100 64"
          sx={{
            width: '100%',
            height: 66,
            display: 'block',
            overflow: 'visible',
            '& circle': { transition: 'r 140ms ease, fill 140ms ease' },
            '& circle:hover': { r: 4.8, fill: purple },
          }}
        >
          {[25, 50, 75].map((tick) => {
            const y = 54 - (tick / 100) * 38;
            return <line key={tick} x1="8" y1={y} x2="92" y2={y} stroke="rgba(23, 21, 26, 0.055)" strokeWidth="1" />;
          })}
          <line x1="8" y1="54" x2="92" y2="54" stroke="rgba(23, 21, 26, 0.12)" strokeWidth="1.5" />
          {points.length > 1 && <polyline points={linePoints} fill="none" stroke={purple} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
          {points.length === 1 && <line x1="22" y1={points[0].y} x2="78" y2={points[0].y} stroke={purple} strokeWidth="2.6" strokeLinecap="round" />}
          {points.map((point) => (
            <circle key={point.item.id} cx={point.x} cy={point.y} r="3.7" fill={darkText} stroke="#fff" strokeWidth="1.5">
              <title>{`${formatDemoDate(point.item.date)} · ${point.item.assessmentTitle || point.item.label || 'Assessment'} · ${getAssessmentPercentage(point.item)}%`}</title>
            </circle>
          ))}
          {!points.length && (
            <>
              <line x1="22" y1="35" x2="78" y2="35" stroke="rgba(23, 21, 26, 0.18)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="50" cy="35" r="3.5" fill="rgba(23, 21, 26, 0.22)" />
            </>
          )}
        </Box>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
          {sortedAssessments.length
            ? `${getAssessmentPercentage(sortedAssessments[0])}% to ${getAssessmentPercentage(sortedAssessments[sortedAssessments.length - 1])}%`
            : 'No assessment result yet'}
        </Typography>
      </Stack>
    </Paper>
  );
}

function EvidenceTypeTile({ observations, assessments }) {
  const total = observations + assessments;
  const assessmentShare = total ? Math.round((assessments / total) * 100) : 0;
  const observationShare = total ? 100 - assessmentShare : 0;

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: 126 }}>
      <Stack direction="row" spacing={1.1} alignItems="center" sx={{ height: '100%' }}>
        <Box
          title={total ? `${assessments} assessment, ${observations} observation` : 'No evidence yet'}
          sx={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            flexShrink: 0,
            bgcolor: total ? 'transparent' : 'rgba(23, 21, 26, 0.08)',
            background: total
              ? `conic-gradient(${purple} 0 ${assessmentShare}%, ${darkText} ${assessmentShare}% 100%)`
              : undefined,
            border: '6px solid #fff',
            boxShadow: '0 0 0 1px rgba(23, 21, 26, 0.1)',
            transition: 'transform 140ms ease',
            '&:hover': { transform: 'scale(1.04)' },
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>Evidence type</Typography>
          <Stack spacing={0.45} sx={{ mt: 0.75 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
              <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, bgcolor: purple, mr: 0.6 }} />
              Assessment · {assessmentShare}%
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
              <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, bgcolor: darkText, mr: 0.6 }} />
              Observation · {observationShare}%
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

function ObservationFocusTile({ summary }) {
  const sequences = buildCapturePointSequences(summary);
  const observationsByCapturePoint = new Map();
  summary.observations
    .filter((item) => item.capturePointId)
    .forEach((item) => {
      if (!observationsByCapturePoint.has(item.capturePointId)) {
        observationsByCapturePoint.set(item.capturePointId, []);
      }
      observationsByCapturePoint.get(item.capturePointId).push(item);
    });
  const unstructuredObservationCount = summary.unstructuredObservationCount || 0;

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff', minHeight: 126 }}>
      <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 880 }}>Observation focus</Typography>
      <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
        {sequences.map((sequence) => {
          const pointObservations = sortEvidenceByDate(observationsByCapturePoint.get(sequence.capturePoint.id) || [], 'desc');
          const latestObservation = pointObservations[0] || null;
          const level = latestObservation?.levelId ? getMathsCaptureLevelById(latestObservation.levelId) : null;
          return (
            <Box
              key={sequence.capturePoint.id}
              title={`${sequence.capturePoint.label}${latestObservation ? ` · ${level?.label || 'Observed'} · ${formatDemoDate(latestObservation.date)}` : ' · no observation yet'}`}
              sx={{
                width: 13,
                height: 13,
                borderRadius: '50%',
                bgcolor: latestObservation ? purple : '#fff',
                border: latestObservation ? `1px solid ${purple}` : '1px solid rgba(23, 21, 26, 0.22)',
                transition: 'transform 140ms ease, box-shadow 140ms ease',
                '&:hover': { transform: 'scale(1.22)', boxShadow: '0 0 0 3px rgba(156, 40, 175, 0.13)' },
              }}
            />
          );
        })}
        {!sequences.length && <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>No observation focuses configured.</Typography>}
      </Stack>
      <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 11.8 }}>
        {summary.observedCapturePointCount}/{summary.capturePoints.length} observation focuses seen
        {!!unstructuredObservationCount && ` · ${unstructuredObservationCount} other observation${unstructuredObservationCount === 1 ? '' : 's'}`}
      </Typography>
    </Paper>
  );
}

export default function StudentUnitInsightPanel({
  student,
  teachingUnits,
  evidence,
  judgements,
  onSaveJudgement,
  focusUnitId = '',
}) {
  const studentEvidence = useMemo(() => getEvidenceForStudent(evidence, student.id), [evidence, student.id]);
  const unitSummaries = useMemo(() => teachingUnits.map((unit) => buildTeachingUnitEvidenceSummary(
    unit,
    studentEvidence,
    judgements[getJudgementKey(student.id, unit.id)] || null,
  )), [judgements, student.id, studentEvidence, teachingUnits]);
  const focusedUnit = focusUnitId ? unitSummaries.find((summary) => summary.unit.id === focusUnitId) : null;
  const selectedSummary = focusedUnit || unitSummaries.find((summary) => summary.items.length) || unitSummaries[0] || null;
  const [detailOpen, setDetailOpen] = useState(false);
  const [draftLevelId, setDraftLevelId] = useState('not-set');
  const [draftNote, setDraftNote] = useState('');

  useEffect(() => {
    const judgement = selectedSummary?.judgement || null;
    setDraftLevelId(judgement?.levelId || 'not-set');
    setDraftNote(judgement?.note || '');
  }, [selectedSummary?.unit.id, selectedSummary?.judgement]);

  if (!selectedSummary) {
    return null;
  }

  const selectedSequences = buildCapturePointSequences(selectedSummary);
  const repeatedSequences = getRepeatedSequenceGroups(selectedSummary);
  const changedRepeatedSequences = repeatedSequences.filter((sequence) => sequence.observations[0].levelId !== sequence.observations[sequence.observations.length - 1].levelId);
  const latestUnitEvidence = selectedSummary.latestDate ? sortEvidenceByDate(selectedSummary.items, 'desc').slice(0, 3) : [];
  const detailOtherObservations = selectedSummary.observations.filter((item) => !item.capturePointId);
  const detailStructuredObservationIds = new Set(selectedSummary.observations.filter((item) => item.capturePointId).map((item) => item.id));
  const detailStructuredObservations = selectedSummary.observations.filter((item) => detailStructuredObservationIds.has(item.id));
  const judgementLevel = selectedSummary.judgement?.levelId ? getMathsCaptureLevelById(selectedSummary.judgement.levelId) : null;

  function saveJudgement() {
    onSaveJudgement({
      studentId: student.id,
      teachingUnitId: selectedSummary.unit.id,
      levelId: draftLevelId === 'not-set' ? null : draftLevelId,
      note: draftNote.trim(),
    });
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: '#fbfafc', borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
      <Paper elevation={0} id={`student-insight-v3-${student.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: '1px solid rgba(23, 21, 26, 0.1)', bgcolor: '#fff' }}>
        <Stack spacing={1.35}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Box>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>
                {selectedSummary.unit.label || selectedSummary.unit.title}
              </Typography>
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.8 }}>
                {`${selectedSummary.items.length} evidence item${selectedSummary.items.length === 1 ? '' : 's'} in this unit · Latest evidence: ${selectedSummary.latestDate ? formatDemoDate(selectedSummary.latestDate) : 'None'}`}
              </Typography>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 760 }}>
              {`${selectedSummary.observations.length} observation${selectedSummary.observations.length === 1 ? '' : 's'} · ${selectedSummary.assessments.length} assessment${selectedSummary.assessments.length === 1 ? '' : 's'}`}
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'minmax(0, 1.1fr) minmax(0, 1.1fr) minmax(190px, 0.75fr) minmax(210px, 0.9fr)' }, gap: 1 }}>
            <EvidenceTimelineTile title="Unit timeline" items={selectedSummary.items} />
            <AssessmentResultTile assessments={selectedSummary.assessments} title="Unit result line" />
            <EvidenceTypeTile observations={selectedSummary.observations.length} assessments={selectedSummary.assessments.length} />
            <ObservationFocusTile summary={selectedSummary} />
          </Box>

          <Paper elevation={0} sx={{ p: 1.25, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)', bgcolor: '#fff' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', md: 'center' }}>
              <Box sx={{ flex: '1 1 260px', minWidth: 0 }}>
                <Typography component="h3" sx={{ color: darkText, fontSize: 16, fontWeight: 900 }}>{selectedSummary.unit.label || selectedSummary.unit.title}</Typography>
                <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 12.8 }}>
                  {selectedSummary.observations.length} observation{selectedSummary.observations.length === 1 ? '' : 's'} · {selectedSummary.assessments.length} assessment{selectedSummary.assessments.length === 1 ? '' : 's'} · {selectedSummary.observedCapturePointCount}/{selectedSummary.capturePoints.length} observation focuses seen{selectedSummary.unstructuredObservationCount ? ` · ${selectedSummary.unstructuredObservationCount} other observation${selectedSummary.unstructuredObservationCount === 1 ? '' : 's'}` : ''}
                </Typography>
                <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.5 }}>
                  Anna’s working judgement: {judgementLevel?.label || 'Not set'}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Typography sx={{ color: darkText, fontSize: 12.8, fontWeight: 850 }}>Pattern in this unit</Typography>
                {repeatedSequences.length ? (
                  <Stack spacing={0.5} sx={{ mt: 0.55 }}>
                    {repeatedSequences.slice(0, 3).map((sequence) => {
                      const first = sequence.observations[0];
                      const latest = sequence.observations[sequence.observations.length - 1];
                      const firstLevel = getMathsCaptureLevelById(first.levelId);
                      const latestLevel = getMathsCaptureLevelById(latest.levelId);
                      return (
                        <Typography key={sequence.capturePoint.id} sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                          {sequence.capturePoint.label}: {firstLevel?.label || first.levelId} to {latestLevel?.label || latest.levelId} · {formatDemoDate(first.date)}-{formatDemoDate(latest.date)}
                        </Typography>
                      );
                    })}
                    {repeatedSequences.length > 3 && <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>{repeatedSequences.length - 3} more repeated observation focus{repeatedSequences.length - 3 === 1 ? '' : 'es'}</Typography>}
                  </Stack>
                ) : (
                  <Typography sx={{ mt: 0.55, color: 'text.secondary', fontSize: 12.5 }}>No observation focus has been seen more than once yet.</Typography>
                )}
              </Box>
              <Button variant="outlined" onClick={() => setDetailOpen(true)} sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', md: 'center' }, color: darkText, borderColor: 'rgba(23, 21, 26, 0.16)', textTransform: 'none', fontWeight: 820 }}>
                View evidence
              </Button>
            </Stack>
            {!!changedRepeatedSequences.length && (
              <Box sx={{ mt: 1, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                {changedRepeatedSequences.slice(0, 3).map((sequence) => (
                  <Chip key={sequence.capturePoint.id} label={`${sequence.capturePoint.label} changed`} size="small" sx={{ bgcolor: palePurple, color: darkText, fontWeight: 760 }} />
                ))}
              </Box>
            )}
            {!!latestUnitEvidence.length && (
              <Stack spacing={0.35} sx={{ mt: 1, pt: 0.8, borderTop: '1px solid rgba(23, 21, 26, 0.07)' }}>
                {latestUnitEvidence.map((item) => (
                  <Typography key={item.id} sx={{ color: 'text.secondary', fontSize: 12.3 }}>
                    {formatDemoDate(item.date)} · {item.assessmentTitle || item.observationText || item.label}
                  </Typography>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Paper>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#fff' }}>
          <Stack spacing={1.4}>
            <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography component="h2" sx={{ color: darkText, fontSize: 18, fontWeight: 900 }}>{selectedSummary.unit.label || selectedSummary.unit.title}</Typography>
                <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.8 }}>Evidence detail · V3</Typography>
              </Box>
              <IconButton aria-label="Close evidence detail" onClick={() => setDetailOpen(false)} sx={{ color: 'text.secondary' }}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
              <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Structured observations</Typography>
              <Stack spacing={0.65} sx={{ mt: 0.8 }}>
                {selectedSequences.filter((sequence) => sequence.observations.length).map((sequence) => (
                  <Box key={sequence.capturePoint.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                    <Typography sx={{ color: darkText, fontSize: 12.9, fontWeight: 820 }}>{sequence.capturePoint.label}</Typography>
                    {sequence.observations.map((item) => {
                      const level = getMathsCaptureLevelById(item.levelId);
                      return (
                        <Typography key={item.id} sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.3 }}>
                          {formatDemoDate(item.date)} · {level?.label || item.levelId}{item.observationText ? ` · ${item.observationText}` : ''}
                        </Typography>
                      );
                    })}
                  </Box>
                ))}
                {!detailStructuredObservations.length && <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No structured observations recorded for this teaching unit.</Typography>}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
              <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Assessments</Typography>
              <Stack spacing={0.65} sx={{ mt: 0.8 }}>
                {selectedSummary.assessments.map((item) => (
                  <Box key={item.id} sx={{ borderTop: '1px solid rgba(23, 21, 26, 0.07)', pt: 0.65 }}>
                    <Typography sx={{ color: darkText, fontSize: 12.9, fontWeight: 820 }}>{item.assessmentTitle || item.label}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12.3 }}>{formatDemoDate(item.date)}{getAssessmentPercentage(item) !== null ? ` · ${getAssessmentPercentage(item)}%` : ''}</Typography>
                    {item.note && <Typography sx={{ color: 'text.secondary', fontSize: 12.2 }}>{item.note}</Typography>}
                  </Box>
                ))}
                {!selectedSummary.assessments.length && <Typography sx={{ color: 'text.secondary', fontSize: 12.4 }}>No assessments recorded for this teaching unit.</Typography>}
              </Stack>
            </Paper>

            {!!detailOtherObservations.length && (
              <Paper elevation={0} sx={{ p: 1.2, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
                <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Other teacher observations</Typography>
                <Stack spacing={0.45} sx={{ mt: 0.8 }}>
                  {detailOtherObservations.map((item) => (
                    <Typography key={item.id} sx={{ color: 'text.secondary', fontSize: 12.3 }}>
                      {formatDemoDate(item.date)} · {item.observationText || item.label}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            )}

            <Paper elevation={0} sx={{ p: 1.2, borderRadius: '14px', border: '1px solid rgba(23, 21, 26, 0.08)' }}>
              <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880 }}>Anna’s working judgement</Typography>
              <Stack spacing={0.9} sx={{ mt: 0.9 }}>
                <FormControl size="small">
                  <InputLabel id={`teacher-judgement-v3-${student.id}-${selectedSummary.unit.id}`}>Teacher judgement</InputLabel>
                  <Select
                    labelId={`teacher-judgement-v3-${student.id}-${selectedSummary.unit.id}`}
                    label="Teacher judgement"
                    value={draftLevelId}
                    onChange={(event) => setDraftLevelId(event.target.value)}
                  >
                    <MenuItem value="not-set">Not set</MenuItem>
                    {mathsCaptureLevels.map((level) => <MenuItem key={level.id} value={level.id}>{level.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  label="Teacher note"
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                  size="small"
                  multiline
                  minRows={2}
                />
                <Stack direction="row" spacing={0.8}>
                  <Button variant="contained" onClick={saveJudgement} sx={{ bgcolor: purple, textTransform: 'none', fontWeight: 820, '&:hover': { bgcolor: purple } }}>Save</Button>
                  <Button onClick={() => setDetailOpen(false)} sx={{ color: darkText, textTransform: 'none', fontWeight: 760 }}>Close</Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
