import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupsIcon from '@mui/icons-material/Groups';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimerIcon from '@mui/icons-material/Timer';
import {
  activityProgressByStudent,
  activityTemplates,
  createMockProgressReport,
  evidenceTags,
  initialObservations,
  levels,
  passThreshold,
  progressByStudent,
  quickNotes,
  students,
  termAreas,
  termProgress,
} from '../config/peAssessmentData.js';

const levelScores = {
  Emerging: 25,
  Developing: 50,
  Secure: 75,
  Advanced: 100,
};

const statusStyles = {
  'pass-met': {
    borderColor: '#d9a8e2',
    color: '#6f1d7d',
    bgcolor: '#f8eafd',
  },
  'pass-close': {
    borderColor: '#e2cb7d',
    color: '#6a5011',
    bgcolor: '#fff5cc',
  },
  'pass-support': {
    borderColor: '#e0b3ad',
    color: '#842d22',
    bgcolor: '#fff0ee',
  },
};

function StatusCell({ status, score, compact = false }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.25,
        minWidth: compact ? 72 : 86,
        p: 1,
        border: 1,
        borderRadius: 2,
        textAlign: compact ? 'center' : 'left',
        ...statusStyles[status.className],
      }}
    >
      <Typography component="strong" fontSize={compact ? 16 : 18} fontWeight={850}>
        {score}
      </Typography>
      <Typography component="small" fontSize={12} fontWeight={850}>
        {status.label}
      </Typography>
    </Box>
  );
}

function ProgressBar({ value }) {
  return (
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        height: 10,
        borderRadius: 999,
        bgcolor: '#efe4f3',
        '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 999 },
      }}
    />
  );
}

const segmentedControlSx = {
  bgcolor: 'background.paper',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 1,
  width: '100%',
  '& .MuiToggleButtonGroup-grouped': {
    border: 1,
    borderColor: 'divider',
    borderRadius: '8px !important',
    margin: '0 !important',
  },
  '& .MuiToggleButton-root': {
    minWidth: 0,
    whiteSpace: 'normal',
    lineHeight: 1.2,
  },
};

const viewToggleSx = {
  ...segmentedControlSx,
  '& .MuiToggleButton-root': {
    ...segmentedControlSx['& .MuiToggleButton-root'],
    flex: '1 1 180px',
  },
};

const activityToggleSx = {
  ...segmentedControlSx,
  '& .MuiToggleButton-root': {
    ...segmentedControlSx['& .MuiToggleButton-root'],
    flex: '1 1 132px',
  },
};

const levelToggleSx = {
  ...segmentedControlSx,
  '& .MuiToggleButton-root': {
    ...segmentedControlSx['& .MuiToggleButton-root'],
    flex: '1 1 calc(50% - 8px)',
    px: 1,
  },
};

const mockTimelineDates = ['10.10.22', '17.10.22', '07.11.22', '21.11.22', '05.12.22'];

const timelineColors = ['#7c2d92', '#0f766e', '#b45309', '#2563eb', '#be123c'];

function getTimelineScore(finalScore, dateIndex, activityIndex, skillIndex) {
  const stepsRemaining = mockTimelineDates.length - dateIndex - 1;
  const earlyOffset = stepsRemaining * 5 + ((activityIndex + skillIndex) % 3) * 2;

  return Math.max(25, Math.min(100, finalScore - earlyOffset));
}

function buildMockTimelineRows(detailRows) {
  return detailRows.flatMap((row, activityIndex) =>
    Object.entries(row.scores).flatMap(([skill, finalScore], skillIndex) =>
      mockTimelineDates.map((date, dateIndex) => ({
        id: `${row.activity}-${skill}-${date}`,
        activity: row.activity,
        date,
        skill,
        score: getTimelineScore(finalScore, dateIndex, activityIndex, skillIndex),
      }))
    )
  );
}

function buildActivityTimeline(detailRows) {
  return detailRows.map((row, activityIndex) => {
    const entries = Object.entries(row.scores);
    const points = mockTimelineDates.map((date, dateIndex) => {
      const total = entries.reduce(
        (sum, [, finalScore], skillIndex) => sum + getTimelineScore(finalScore, dateIndex, activityIndex, skillIndex),
        0
      );

      return {
        date,
        score: Math.round(total / entries.length),
      };
    });

    return {
      activity: row.activity,
      color: timelineColors[activityIndex % timelineColors.length],
      points,
    };
  });
}

function TimelineGraph({ timelines }) {
  const width = 520;
  const height = 220;
  const chartPadding = 34;
  const chartWidth = width - chartPadding * 2;
  const chartHeight = height - chartPadding * 2;

  function pointToCoordinates(point, index) {
    return {
      x: chartPadding + (index / (mockTimelineDates.length - 1)) * chartWidth,
      y: chartPadding + ((100 - point.score) / 75) * chartHeight,
    };
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Mock graph of assessment data points over time"
        sx={{ display: 'block', minWidth: 520, width: '100%', height: 260 }}
      >
        {[25, 50, 75, 100].map((score) => {
          const y = chartPadding + ((100 - score) / 75) * chartHeight;

          return (
            <g key={score}>
              <line x1={chartPadding} x2={width - chartPadding} y1={y} y2={y} stroke="#eaddec" strokeWidth="1" />
              <text x="8" y={y + 4} fill="#6b5b70" fontSize="11" fontWeight="700">
                {score}
              </text>
            </g>
          );
        })}

        {mockTimelineDates.map((date, index) => {
          const x = chartPadding + (index / (mockTimelineDates.length - 1)) * chartWidth;

          return (
            <text key={date} x={x} y={height - 8} fill="#6b5b70" fontSize="11" fontWeight="700" textAnchor="middle">
              {date}
            </text>
          );
        })}

        {timelines.map((timeline) => {
          const coordinates = timeline.points.map(pointToCoordinates);
          const linePoints = coordinates.map((point) => `${point.x},${point.y}`).join(' ');

          return (
            <g key={timeline.activity}>
              <polyline points={linePoints} fill="none" stroke={timeline.color} strokeWidth="3" strokeLinecap="round" />
              {coordinates.map((point, index) => (
                <circle
                  key={`${timeline.activity}-${mockTimelineDates[index]}`}
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  fill="#fff"
                  stroke={timeline.color}
                  strokeWidth="3"
                />
              ))}
            </g>
          );
        })}
      </Box>
    </Box>
  );
}

export default function PETeacherAssessment() {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0].id);
  const [selectedActivity, setSelectedActivity] = useState('Swimming');
  const [peView, setPeView] = useState('capture');
  const [detailStudentId, setDetailStudentId] = useState(null);
  const [detailView, setDetailView] = useState('drilldown');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [observationDrafts, setObservationDrafts] = useState({});
  const [observations, setObservations] = useState(initialObservations);

  const selectedStudent = students.find((student) => student.id === selectedStudentId);
  const detailStudent = students.find((student) => student.id === detailStudentId);
  const skills = activityTemplates[selectedActivity];
  const selectedStudentObservations = observations.filter((entry) => entry.studentId === selectedStudentId);
  const selectedTermScores = termProgress[selectedStudentId];

  const dashboardStats = useMemo(() => {
    const strongEvidence = new Set(
      observations.filter((entry) => entry.tag === 'Strong evidence').map((entry) => entry.studentId)
    );
    const needsSupport = new Set(
      observations.filter((entry) => entry.tag === 'Needs support').map((entry) => entry.studentId)
    );
    const coveredActivities = new Set(observations.map((entry) => entry.activity));

    return {
      total: observations.length,
      strongEvidence: strongEvidence.size,
      needsSupport: needsSupport.size,
      coveredActivities: coveredActivities.size,
    };
  }, [observations]);

  function getDraft(skill) {
    return (
      observationDrafts[skill] || {
        level: 'Developing',
        note: quickNotes[0],
        tag: 'Observed',
      }
    );
  }

  function updateDraft(skill, field, value) {
    setObservationDrafts((current) => ({
      ...current,
      [skill]: {
        ...getDraft(skill),
        [field]: value,
      },
    }));
  }

  function saveObservation(skill) {
    const draft = getDraft(skill);
    const savedObservation = {
      id: Date.now(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      activity: selectedActivity,
      skill,
      level: draft.level,
      note: draft.note,
      tag: draft.tag,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setObservations((current) => [savedObservation, ...current]);
  }

  function getPassStatus(score) {
    if (score >= passThreshold) {
      return { label: 'Pass met', className: 'pass-met' };
    }

    if (score >= passThreshold - 8) {
      return { label: 'Close', className: 'pass-close' };
    }

    return { label: 'Support', className: 'pass-support' };
  }

  const classAreaSummary = termAreas.map((area) => {
    const metCount = students.filter((student) => termProgress[student.id][area] >= passThreshold).length;

    return {
      area,
      metCount,
      percentage: Math.round((metCount / students.length) * 100),
    };
  });

  const detailRows = detailStudent
    ? Object.entries(activityProgressByStudent[detailStudent.id]).map(([activity, scores]) => {
        const values = Object.values(scores);
        const average = Math.round(values.reduce((sum, score) => sum + score, 0) / values.length);
        const strongest = Object.entries(scores).reduce((best, current) => (current[1] > best[1] ? current : best));
        const weakest = Object.entries(scores).reduce((lowest, current) => (current[1] < lowest[1] ? current : lowest));

        return { activity, scores, average, strongest, weakest };
      })
    : [];
  const timelineRows = buildMockTimelineRows(detailRows);
  const activityTimelines = buildActivityTimeline(detailRows);
  const latestTimelineRows = [...timelineRows].reverse().slice(0, 14);

  function openStudentDetails(studentId) {
    setSelectedStudentId(studentId);
    setDetailStudentId(studentId);
    setDetailView('drilldown');
    setGeneratedReport(null);
  }

  function closeStudentDetails() {
    setDetailStudentId(null);
    setDetailView('drilldown');
    setGeneratedReport(null);
  }

  function generateStudentReport() {
    if (!detailStudent) {
      return;
    }

    setGeneratedReport(
      createMockProgressReport(
        detailStudent,
        termProgress[detailStudent.id],
        activityProgressByStudent[detailStudent.id]
      )
    );
  }

  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)', lg: '230px minmax(0, 1fr) 310px' },
        gap: 2.25,
        alignItems: 'start',
      }}
    >
      <Paper
        component="aside"
        variant="outlined"
        aria-label="Class list"
        sx={{ p: 2.5, position: { md: 'sticky' }, top: 92, maxHeight: { md: 'calc(100vh - 120px)' }, overflow: 'auto' }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <GroupsIcon color="primary" />
          <Box>
            <Typography variant="overline" color="primary" fontWeight={850}>
              Class list
            </Typography>
            <Typography variant="h2" fontSize={24}>
              Year 8A
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1.5} sx={{ mt: 2.25 }}>
          {students.map((student) => (
            <Button
              key={student.id}
              variant={student.id === selectedStudentId ? 'contained' : 'outlined'}
              onClick={() => setSelectedStudentId(student.id)}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.25 }}
            >
              <Box>
                <Typography fontWeight={850}>{student.name}</Typography>
                <Typography variant="caption" color={student.id === selectedStudentId ? 'inherit' : 'text.secondary'}>
                  {student.group}
                </Typography>
              </Box>
            </Button>
          ))}
        </Stack>
      </Paper>

      <Stack spacing={1.5}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={peView}
          onChange={(_, nextView) => nextView && setPeView(nextView)}
          aria-label="PE module view"
          sx={viewToggleSx}
        >
          <ToggleButton value="capture">
            <PlaylistAddCheckIcon sx={{ mr: 1 }} />
            Lesson capture
          </ToggleButton>
          <ToggleButton value="overview">
            <GridViewIcon sx={{ mr: 1 }} />
            Term overview
          </ToggleButton>
        </ToggleButtonGroup>

        {peView === 'capture' && (
          <Paper variant="outlined" sx={{ p: 2.75 }}>
            <Stack spacing={2.25}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={850}>
                    Current lesson
                  </Typography>
                  <Typography variant="h2" fontSize={24}>
                    Activity Assessment
                  </Typography>
                </Box>
                <Chip icon={<TimerIcon />} label="Live capture" variant="outlined" />
              </Stack>

              <ToggleButtonGroup
                value={selectedActivity}
                exclusive
                onChange={(_, activity) => activity && setSelectedActivity(activity)}
                aria-label="Activity selector"
                sx={activityToggleSx}
              >
                {Object.keys(activityTemplates).map((activity) => (
                  <ToggleButton key={activity} value={activity}>
                    {activity}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                {skills.map((skill) => {
                  const draft = getDraft(skill);

                  return (
                    <Paper key={skill} variant="outlined" sx={{ p: 1.75, bgcolor: '#fdf9fe' }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} justifyContent="space-between">
                          <Typography fontWeight={900}>{skill}</Typography>
                          {/* <Typography color="text.secondary">{selectedStudent.name}</Typography> */}
                        </Stack>

                        <ToggleButtonGroup
                          value={draft.level}
                          exclusive
                          onChange={(_, level) => level && updateDraft(skill, 'level', level)}
                          aria-label={`${skill} level`}
                          sx={levelToggleSx}
                        >
                          {levels.map((level) => (
                            <ToggleButton key={level} value={level} size="small">
                              {level}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>

                        <FormControl size="small" fullWidth>
                          <InputLabel id={`${skill}-tag-label`}>Evidence tag</InputLabel>
                          <Select
                            labelId={`${skill}-tag-label`}
                            label="Evidence tag"
                            value={draft.tag}
                            onChange={(event) => updateDraft(skill, 'tag', event.target.value)}
                          >
                            {evidenceTags.map((tag) => (
                              <MenuItem key={tag} value={tag}>
                                {tag}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* <Stack direction="column" flexWrap="wrap" gap={2} aria-label={`${skill} quick notes`}>
                          {quickNotes.map((note) => (
                            <Chip
                              size="small"
                              key={note}
                              label={note}
                              color={draft.note === note ? 'primary' : 'default'}
                              variant={draft.note === note ? 'filled' : 'outlined'}
                              onClick={() => updateDraft(skill, 'note', note)}
                            />
                          ))}
                        </Stack> */}

                        <Button
                          variant="contained"
                          startIcon={<PlaylistAddCheckIcon />}
                          onClick={() => saveObservation(skill)}
                          sx={{ whiteSpace: 'normal' }}
                        >
                          Save observation
                        </Button>
                      </Stack>
                    </Paper>
                  );
                })}
              </Box>
            </Stack>
          </Paper>
        )}

        {peView === 'overview' && (
          <Paper variant="outlined" sx={{ p: 2.75 }}>
            <Stack spacing={2.25}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={850}>
                    Term overview
                  </Typography>
                  <Typography variant="h2" fontSize={24}>
                    Pass-Level Evidence Matrix
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" aria-label="Pass status key">
                  {[
                    ['Pass', 'pass-met'],
                    ['Close', 'pass-close'],
                    ['Support', 'pass-support'],
                  ].map(([label, className]) => (
                    <Chip key={label} label={label} size="small" variant="outlined" sx={statusStyles[className]} />
                  ))}
                </Stack>
              </Stack>

              <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 820 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                    {termAreas.map((area) => (
                      <TableCell key={area}>
                        {area}
                      </TableCell>
                    ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} selected={student.id === selectedStudentId}>
                      <TableCell component="th" scope="row">
                        <Button onClick={() => openStudentDetails(student.id)}>{student.name}</Button>
                      </TableCell>
                      {termAreas.map((area) => {
                        const score = termProgress[student.id][area];
                        const status = getPassStatus(score);

                        return (
                          <TableCell key={area}>
                            <StatusCell status={status} score={score} />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.25 }}>
              {classAreaSummary.map((item) => (
                <Paper key={item.area} variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                  <Typography fontWeight={850}>{item.area}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                      {item.metCount}/{students.length} passed
                  </Typography>
                  <ProgressBar value={item.percentage} />
                </Paper>
              ))}
              </Box>
            </Stack>
          </Paper>
        )}

        {peView === 'capture' && (
          <Paper variant="outlined" sx={{ p: 2.75 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
              <PlaylistAddCheckIcon color="primary" />
              <Typography variant="h2" fontSize={24}>
                Lesson Evidence Log
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
            {observations.map((entry) => (
              <Paper key={entry.id} variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                <Stack direction="row" spacing={1.5} justifyContent="space-between">
                  <Typography fontWeight={850}>{entry.studentName}</Typography>
                  <Typography color="text.secondary">{entry.timestamp}</Typography>
                </Stack>
                <Typography color="text.primary">
                  {entry.activity} / {entry.skill} / {entry.level}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.tag}: {entry.note}
                </Typography>
              </Paper>
            ))}
            </Stack>
          </Paper>
        )}
      </Stack>

      <Stack component="aside" spacing={1.5} sx={{ gridColumn: { md: '1 / -1', lg: 'auto' } }}>
        <Paper variant="outlined" sx={{ p: 2.75 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
            <AssessmentIcon color="primary" />
            <Box>
              <Typography variant="overline" color="primary" fontWeight={850}>
                Student progress
              </Typography>
              <Typography variant="h2" fontSize={24}>
                {selectedStudent.name}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.5}>
            {(peView === 'overview'
              ? termAreas.map((area) => ({ area, level: selectedTermScores[area] }))
              : progressByStudent[selectedStudentId]
            ).map((item) => {
              const latest = selectedStudentObservations.find((entry) => entry.skill === item.area);
              const score = latest ? levelScores[latest.level] : item.level;
              const status = peView === 'overview' ? getPassStatus(score) : null;

              return (
                <Box key={item.area}>
                  <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography>{item.area}</Typography>
                    <Typography fontWeight={850}>{peView === 'overview' ? status.label : latest?.level || `${item.level}%`}</Typography>
                  </Stack>
                  <ProgressBar value={score} />
                </Box>
              );
            })}
          </Stack>

          <Stack spacing={1.25} sx={{ mt: 2.25 }}>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fbf5fd' }}>
              <MilitaryTechIcon color="primary" />
              <Typography fontWeight={850}>Strength</Typography>
              <Typography color="text.secondary" lineHeight={1.45}>
                {peView === 'overview'
                  ? 'Pass-level evidence is strongest in team games and safety.'
                  : 'Most secure evidence is in communication and teamwork.'}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fbf5fd' }}>
              <FitnessCenterIcon color="primary" />
              <Typography fontWeight={850}>Needs support</Typography>
              <Typography color="text.secondary" lineHeight={1.45}>
                {peView === 'overview'
                  ? 'Use the amber and red cells to plan next term evidence collection.'
                  : 'Collect one more technique observation before grading.'}
              </Typography>
            </Paper>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.75, borderTop: 5, borderTopColor: 'primary.main' }}>
          <Typography variant="overline" color="primary" fontWeight={850}>
            Teacher dashboard
          </Typography>
          <Typography variant="h2" fontSize={24} sx={{ mb: 2 }}>
            Today
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25 }}>
            {[
              [dashboardStats.total, 'observations'],
              [dashboardStats.strongEvidence, 'strong evidence'],
              [dashboardStats.needsSupport, 'need support'],
              [dashboardStats.coveredActivities, 'activities covered'],
            ].map(([value, label]) => (
              <Paper key={label} variant="outlined" sx={{ p: 1.5, minHeight: 82, bgcolor: '#fdf9fe' }}>
                <Typography component="strong" fontSize={28} fontWeight={850}>
                  {value}
                </Typography>
                <Typography color="text.secondary">{label}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Stack>

      <Dialog open={Boolean(detailStudent)} onClose={closeStudentDetails} fullWidth maxWidth="md">
        {detailStudent && (
          <>
            <DialogTitle id="student-detail-title" sx={{ pr: 7 }}>
              <Typography variant="overline" color="primary" fontWeight={850}>
                Activity drill-down
              </Typography>
              <Typography variant="h2" fontSize={24}>
                {detailStudent.name}
              </Typography>
              <IconButton onClick={closeStudentDetails} aria-label="Close details" sx={{ position: 'absolute', top: 12, right: 12 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>

            {generatedReport && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fbf5fd', borderColor: '#d9a8e2' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                  <Box>
                    <Typography variant="overline" color="primary" fontWeight={850}>
                      Mock AI report
                    </Typography>
                    <Typography variant="h3" fontSize={20}>
                      {generatedReport.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">{generatedReport.generatedAt}</Typography>
                </Stack>
                <Typography sx={{ my: 1.75 }} lineHeight={1.55}>
                  {generatedReport.summary}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.75 }}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Typography fontWeight={850}>Strengths</Typography>
                    <Box component="ul" sx={{ pl: 2.25, color: 'text.secondary' }}>
                      {generatedReport.strengths.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </Box>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Typography fontWeight={850}>Suggested next steps</Typography>
                    <Box component="ul" sx={{ pl: 2.25, color: 'text.secondary' }}>
                      {generatedReport.nextSteps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </Box>
                  </Paper>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {generatedReport.teacherNote}
                </Typography>
              </Paper>
            )}

            {detailView === 'drilldown' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                {detailRows.map((row) => {
                  const averageStatus = getPassStatus(row.average);

                  return (
                    <Paper key={row.activity} variant="outlined" sx={{ p: 1.75, bgcolor: '#fdf9fe' }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography fontWeight={850}>{row.activity}</Typography>
                            <Typography color="text.secondary" lineHeight={1.35}>
                            Strongest: {row.strongest[0]} / support: {row.weakest[0]}
                            </Typography>
                          </Box>
                          <StatusCell status={averageStatus} score={row.average} compact />
                        </Stack>

                        <Stack divider={<Divider />} spacing={0.75}>
                        {Object.entries(row.scores).map(([skill, score]) => {
                          const status = getPassStatus(score);

                          return (
                            <Stack key={skill} direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                              <span>{skill}</span>
                              <Chip label={score} size="small" sx={{ minWidth: 42, fontWeight: 850, ...statusStyles[status.className] }} />
                            </Stack>
                          );
                        })}
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Box>
            )}

            {detailView === 'timeline' && (
              <Stack spacing={1.5}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fdf9fe' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                    <Box>
                      <Typography variant="overline" color="primary" fontWeight={850}>
                        Mock graph
                      </Typography>
                      <Typography variant="h3" fontSize={20}>
                        Data points over time
                      </Typography>
                    </Box>
                    <Chip icon={<ShowChartIcon />} label={`${timelineRows.length} data points`} variant="outlined" />
                  </Stack>
                  <TimelineGraph timelines={activityTimelines} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {activityTimelines.map((timeline) => (
                      <Chip
                        key={timeline.activity}
                        label={timeline.activity}
                        size="small"
                        sx={{ borderColor: timeline.color, color: timeline.color, fontWeight: 850 }}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Paper>

                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320 }}>
                  <Table stickyHeader size="small" aria-label="Mock dated assessment data points">
                    <TableHead>
                      <TableRow>
                        <TableCell>Activity</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Skill</TableCell>
                        <TableCell align="right">Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {latestTimelineRows.map((row) => {
                        const status = getPassStatus(row.score);

                        return (
                          <TableRow key={row.id}>
                            <TableCell>{row.activity}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.skill}</TableCell>
                            <TableCell align="right">
                              <Chip label={row.score} size="small" sx={{ minWidth: 42, fontWeight: 850, ...statusStyles[status.className] }} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<ShowChartIcon />}
                onClick={() => setDetailView((current) => (current === 'timeline' ? 'drilldown' : 'timeline'))}
              >
                {detailView === 'timeline' ? 'View drill-down' : 'View data over time'}
              </Button>
              <Button variant="contained" onClick={generateStudentReport}>
                Generate report
              </Button>
              <Button onClick={closeStudentDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
