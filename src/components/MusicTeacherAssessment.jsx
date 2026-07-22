import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
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
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupsIcon from '@mui/icons-material/Groups';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TimerIcon from '@mui/icons-material/Timer';
import {
  initialMusicObservations,
  musicActivityProgressByStudent,
  musicActivityTemplates,
  musicAreas,
  musicEvidenceTags,
  musicLevels,
  musicQuickNotes,
  musicStudents,
  musicTermProgress,
} from '../config/musicAssessmentData.js';

const levelScores = {
  Emerging: 25,
  Developing: 50,
  Secure: 75,
  Advanced: 100,
};

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
    flex: '1 1 172px',
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

function ProgressBar({ value, color = 'primary.main' }) {
  return (
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        height: 10,
        borderRadius: 999,
        bgcolor: '#efe4f3',
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 999 },
      }}
    />
  );
}

function MetricCard({ label, value, helper, icon }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, bgcolor: '#fdf9fe', minHeight: 118 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
          <Typography color="text.secondary" fontWeight={850}>
            {label}
          </Typography>
          {icon}
        </Stack>
        <Typography variant="h2" sx={{ fontSize: 30 }}>
          {value}
        </Typography>
        <Typography color="text.secondary">{helper}</Typography>
      </Stack>
    </Paper>
  );
}

export default function MusicTeacherAssessment() {
  const [selectedStudentId, setSelectedStudentId] = useState(musicStudents[0].id);
  const [selectedActivity, setSelectedActivity] = useState('Singing');
  const [musicView, setMusicView] = useState('capture');
  const [observationDrafts, setObservationDrafts] = useState({});
  const [observations, setObservations] = useState(initialMusicObservations);

  const selectedStudent = musicStudents.find((student) => student.id === selectedStudentId);
  const skills = musicActivityTemplates[selectedActivity];
  const selectedStudentObservations = observations.filter((entry) => entry.studentId === selectedStudentId);
  const selectedActivityScores = musicActivityProgressByStudent[selectedStudentId][selectedActivity];
  const selectedTermScores = musicTermProgress[selectedStudentId];

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

  const classAreaSummary = musicAreas.map((area) => {
    const values = musicStudents.map((student) => musicTermProgress[student.id][area]);
    const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

    return { area, average };
  });

  function getDraft(skill) {
    return (
      observationDrafts[skill] || {
        level: 'Developing',
        note: musicQuickNotes[0],
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

  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)', xl: '230px minmax(0, 1fr) 320px' },
        gap: 2.25,
        alignItems: 'start',
      }}
    >
      <Paper
        component="aside"
        variant="outlined"
        aria-label="Music class list"
        sx={{ p: 2.5, position: { md: 'sticky' }, top: 92, maxHeight: { md: 'calc(100vh - 120px)' }, overflow: 'auto' }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <GroupsIcon color="primary" />
          <Box>
            <Typography variant="overline" color="primary" fontWeight={850}>
              Music class
            </Typography>
            <Typography variant="h2" sx={{ fontSize: 24 }}>
              Year 8B
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1.5} sx={{ mt: 2.25 }}>
          {musicStudents.map((student) => (
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

      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={musicView}
          onChange={(_, nextView) => nextView && setMusicView(nextView)}
          aria-label="Music module view"
          sx={viewToggleSx}
        >
          <ToggleButton value="capture">
            <PlaylistAddCheckIcon sx={{ mr: 1 }} />
            Lesson capture
          </ToggleButton>
          <ToggleButton value="overview">
            <GridViewIcon sx={{ mr: 1 }} />
            Dashboard
          </ToggleButton>
        </ToggleButtonGroup>

        {musicView === 'capture' && (
          <Paper variant="outlined" sx={{ p: 2.75 }}>
            <Stack spacing={2.25}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={850}>
                    Current music lesson
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: 24 }}>
                    Evidence Capture
                  </Typography>
                </Box>
                <Chip icon={<TimerIcon />} label="Fast observation mode" variant="outlined" />
              </Stack>

              <ToggleButtonGroup
                value={selectedActivity}
                exclusive
                onChange={(_, activity) => activity && setSelectedActivity(activity)}
                aria-label="Music activity selector"
                sx={activityToggleSx}
              >
                {Object.keys(musicActivityTemplates).map((activity) => (
                  <ToggleButton key={activity} value={activity}>
                    {activity}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                {skills.map((skill) => {
                  const draft = getDraft(skill);

                  return (
                    <Paper key={skill} variant="outlined" sx={{ p: 1.75, bgcolor: '#fdf9fe' }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={850}>{skill}</Typography>
                          <Chip size="small" label={selectedStudent.name} />
                        </Stack>

                        <ToggleButtonGroup
                          value={draft.level}
                          exclusive
                          onChange={(_, level) => level && updateDraft(skill, 'level', level)}
                          aria-label={`${skill} level`}
                          sx={levelToggleSx}
                        >
                          {musicLevels.map((level) => (
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
                            {musicEvidenceTags.map((tag) => (
                              <MenuItem key={tag} value={tag}>
                                {tag}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {musicQuickNotes.map((note) => (
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

                        <Button variant="contained" startIcon={<PlaylistAddCheckIcon />} onClick={() => saveObservation(skill)}>
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

        {musicView === 'overview' && (
          <Stack spacing={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
              <MetricCard label="Evidence points" value={dashboardStats.total} helper="Across recent lessons" icon={<PlaylistAddCheckIcon color="primary" />} />
              <MetricCard label="Activities covered" value={`${dashboardStats.coveredActivities}/6`} helper="Templates with evidence" icon={<MusicNoteIcon color="primary" />} />
              <MetricCard label="Strong evidence" value={dashboardStats.strongEvidence} helper="Students with secure signals" icon={<LibraryMusicIcon color="primary" />} />
              <MetricCard label="Needs support" value={dashboardStats.needsSupport} helper="Students to revisit" icon={<GroupsIcon color="primary" />} />
            </Box>

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="overline" color="primary" fontWeight={850}>
                Teacher dashboard summary
              </Typography>
              <Typography variant="h2" sx={{ fontSize: 24, mb: 2 }}>
                Music Curriculum Evidence
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
                {classAreaSummary.map((item) => (
                  <Paper key={item.area} variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                    <Stack direction="row" spacing={1} justifyContent="space-between">
                      <Typography fontWeight={850}>{item.area}</Typography>
                      <Typography color="text.secondary" fontWeight={850}>
                        {item.average}%
                      </Typography>
                    </Stack>
                    <ProgressBar value={item.average} />
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Stack>
        )}

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
            <AudiotrackIcon color="primary" />
            <Box>
              <Typography variant="overline" color="primary" fontWeight={850}>
                Lesson evidence log
              </Typography>
              <Typography variant="h2" sx={{ fontSize: 22 }}>
                Recent music observations
              </Typography>
            </Box>
          </Stack>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Skill</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Tag</TableCell>
                  <TableCell>Quick note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {observations.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.timestamp}</TableCell>
                    <TableCell>{entry.studentName}</TableCell>
                    <TableCell>{entry.activity}</TableCell>
                    <TableCell>{entry.skill}</TableCell>
                    <TableCell>
                      <Chip size="small" label={entry.level} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={entry.tag} color={entry.tag === 'Needs support' ? 'warning' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell>{entry.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <Stack spacing={1.5} sx={{ minWidth: 0, gridColumn: { md: '2', xl: 'auto' }, position: { xl: 'sticky' }, top: 92 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <MusicNoteIcon color="primary" />
              <Box>
                <Typography variant="overline" color="primary" fontWeight={850}>
                  Selected student
                </Typography>
                <Typography variant="h2" sx={{ fontSize: 24 }}>
                  {selectedStudent.name}
                </Typography>
              </Box>
            </Stack>
            {Object.entries(selectedActivityScores).map(([skill, value]) => (
              <Box key={skill}>
                <Stack direction="row" spacing={1} justifyContent="space-between">
                  <Typography fontWeight={850}>{skill}</Typography>
                  <Typography color="text.secondary" fontWeight={850}>
                    {value}%
                  </Typography>
                </Stack>
                <ProgressBar value={value} color={value < 60 ? 'warning.main' : 'primary.main'} />
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="overline" color="primary" fontWeight={850}>
            Progress summary
          </Typography>
          <Typography variant="h2" sx={{ fontSize: 22, mb: 1.5 }}>
            Over time
          </Typography>
          <Stack spacing={1.5}>
            {Object.entries(selectedTermScores).map(([area, value]) => (
              <Box key={area}>
                <Stack direction="row" spacing={1} justifyContent="space-between">
                  <Typography>{area}</Typography>
                  <Typography color="text.secondary">{value}%</Typography>
                </Stack>
                <ProgressBar value={value} color={value < 60 ? 'warning.main' : 'primary.main'} />
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="overline" color="primary" fontWeight={850}>
            Student evidence
          </Typography>
          <Typography variant="h2" sx={{ fontSize: 22, mb: 1.5 }}>
            Current log
          </Typography>
          <Stack spacing={1}>
            {selectedStudentObservations.length === 0 && (
              <Typography color="text.secondary">No saved observations for this student yet.</Typography>
            )}
            {selectedStudentObservations.map((entry) => (
              <Paper key={entry.id} variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                <Typography fontWeight={850}>{entry.skill}</Typography>
                <Typography color="text.secondary">
                  {entry.activity} · {entry.level} · {entry.tag}
                </Typography>
                <Typography>{entry.note}</Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
