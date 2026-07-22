import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';
import InsightsIcon from '@mui/icons-material/Insights';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import RuleIcon from '@mui/icons-material/Rule';

const summaryCards = [
  { label: 'Topics covered', value: '3 / 5', helper: 'Fractions, percentages, geometry', icon: <CalculateIcon color="primary" /> },
  { label: 'Students needing support', value: '4', helper: 'Based on recent class evidence', icon: <GroupsIcon color="primary" /> },
  { label: 'Curriculum evidence', value: '68%', helper: 'Mapped against current goals', icon: <RuleIcon color="primary" /> },
  { label: 'Suggested next action', value: 'Fractions revision', helper: 'Short cycle before algebra', icon: <PlaylistAddCheckIcon color="primary" /> },
];

const supportStudents = [
  {
    name: 'Lina Andersson',
    concern: 'Fractions gap',
    evidence: '48% test score, struggles with denominators',
    support: 'Small group revision',
  },
  {
    name: 'Max Berg',
    concern: 'Low confidence',
    evidence: 'Good results but low self-rating',
    support: 'Pair work / confidence check',
  },
  {
    name: 'Amir Khan',
    concern: 'Missing evidence',
    evidence: 'Absent during geometry task',
    support: 'Catch-up task',
  },
  {
    name: 'Ella Svensson',
    concern: 'Reasoning evidence',
    evidence: 'Correct answers, limited written explanation',
    support: 'Sentence stems for mathematical reasoning',
  },
];

const misconceptions = [
  'Confusing numerator and denominator',
  'Difficulty finding equivalent fractions',
  'Can calculate answers but struggles to explain reasoning',
];

const inputTemplates = [
  {
    id: 'checkpoint',
    label: 'Checkpoint score',
    helper: 'Fast score capture after a quiz or exit ticket',
    defaultEvidence: '48% checkpoint score; errors with equivalent fractions',
    creates: ['Student support flag', 'Topic average update', 'Curriculum evidence'],
  },
  {
    id: 'misconception',
    label: 'Misconception note',
    helper: 'Record a pattern noticed during class discussion',
    defaultEvidence: 'Several students confused numerator and denominator in visual models',
    creates: ['Common misconception', 'Revision suggestion', 'Planning note'],
  },
  {
    id: 'reasoning',
    label: 'Reasoning evidence',
    helper: 'Capture whether students can explain the maths',
    defaultEvidence: 'Correct geometry answers, but limited explanation of angle facts',
    creates: ['Curriculum gap', 'Reasoning evidence', 'Next lesson prompt'],
  },
  {
    id: 'catchup',
    label: 'Catch-up required',
    helper: 'Mark missing evidence without writing a long admin note',
    defaultEvidence: 'Absent during geometry task; needs short catch-up evidence',
    creates: ['Missing evidence flag', 'Catch-up task', 'Teacher reminder'],
  },
];

const topics = ['Fractions', 'Percentages', 'Geometry', 'Algebra basics', 'Statistics'];
const confidenceOptions = ['Low', 'Medium', 'Good'];
const engagementOptions = ['Low', 'Mixed', 'Good', 'High'];
const behaviourOptions = ['Settled', 'Chatty', 'Off task', 'Focused', 'Needs follow-up'];
const classIssueOptions = ['None', 'Pace too fast', 'Misconception', 'Low confidence', 'Homework gap', 'Absences'];
const classNoteShortcuts = [
  'High participation',
  'Low confidence today',
  'Several off-task moments',
  'Misconception recurring',
  'Group work helped',
];

const recentClassNotes = [
  {
    date: 'Today',
    engagement: 'Good',
    behaviour: 'Settled',
    issue: 'Misconception',
    note: 'Most students engaged with fraction diagrams; denominator language still needs reinforcement.',
  },
  {
    date: 'Tue',
    engagement: 'Mixed',
    behaviour: 'Chatty',
    issue: 'Low confidence',
    note: 'Confidence dipped during independent reasoning. Pair rehearsal improved explanation quality.',
  },
];

const classPatternTimeline = [
  {
    week: '24/01/26',
    topic: 'Fractions',
    engagement: 68,
    behaviour: 74,
    confidence: 52,
    progress: 58,
    issue: 'Low confidence',
    note: 'Students could start fraction tasks, but needed frequent reassurance before explaining methods.',
  },
  {
    week: '31/01/26',
    topic: 'Fractions',
    engagement: 76,
    behaviour: 80,
    confidence: 61,
    progress: 64,
    issue: 'Misconception',
    note: 'Equivalent fractions improved after visual models; denominator language still caused errors.',
  },
  {
    week: '07/02/26',
    topic: 'Percentages',
    engagement: 82,
    behaviour: 86,
    confidence: 72,
    progress: 74,
    issue: 'Pace too fast',
    note: 'Strong participation, but several students rushed percentage increase questions.',
  },
  {
    week: '14/02/26',
    topic: 'Geometry',
    engagement: 79,
    behaviour: 88,
    confidence: 70,
    progress: 81,
    issue: 'Reasoning evidence',
    note: 'Scores were strong, but written reasoning needed sentence stems and paired rehearsal.',
  },
  {
    week: '21/02/26',
    topic: 'Fractions revision',
    engagement: 84,
    behaviour: 86,
    confidence: 76,
    progress: 72,
    issue: 'None',
    note: 'Short revision group helped confidence; class discussion was more precise with denominator logic.',
  },
];

const classStudentProfiles = [
  {
    name: 'Lina Andersson',
    status: 'Targeted support',
    average: 56,
    confidence: 48,
    evidence: 62,
    focus: 'Equivalent fractions and denominator logic',
    nextStep: 'Small group revision',
    topicScores: [
      ['Fractions', 48],
      ['Percentages', 64],
      ['Geometry', 72],
      ['Algebra basics', 0],
      ['Statistics', 0],
    ],
    signals: ['48% fractions checkpoint', 'Needs denominator prompt', 'Good participation in paired work'],
  },
  {
    name: 'Max Berg',
    status: 'Confidence check',
    average: 78,
    confidence: 42,
    evidence: 74,
    focus: 'Low self-rating despite secure scores',
    nextStep: 'Pair work / confidence check',
    topicScores: [
      ['Fractions', 72],
      ['Percentages', 80],
      ['Geometry', 84],
      ['Algebra basics', 0],
      ['Statistics', 0],
    ],
    signals: ['Strong percentage method', 'Rates confidence low', 'Avoids explaining at board'],
  },
  {
    name: 'Amir Khan',
    status: 'Missing evidence',
    average: 66,
    confidence: 60,
    evidence: 38,
    focus: 'Absent during geometry evidence task',
    nextStep: 'Catch-up task',
    topicScores: [
      ['Fractions', 66],
      ['Percentages', 70],
      ['Geometry', 0],
      ['Algebra basics', 0],
      ['Statistics', 0],
    ],
    signals: ['No geometry sample', 'Secure fractions classwork', 'Needs catch-up evidence'],
  },
  {
    name: 'Ella Svensson',
    status: 'Reasoning support',
    average: 74,
    confidence: 68,
    evidence: 58,
    focus: 'Answers are correct, reasoning is thin',
    nextStep: 'Use explanation sentence stems',
    topicScores: [
      ['Fractions', 70],
      ['Percentages', 76],
      ['Geometry', 82],
      ['Algebra basics', 0],
      ['Statistics', 0],
    ],
    signals: ['Accurate angle answers', 'Limited written explanation', 'Responds well to sentence stems'],
  },
  {
    name: 'Noah Patel',
    status: 'On track',
    average: 82,
    confidence: 76,
    evidence: 80,
    focus: 'Extend problem-solving explanation',
    nextStep: 'Challenge task',
    topicScores: [
      ['Fractions', 78],
      ['Percentages', 84],
      ['Geometry', 86],
      ['Algebra basics', 0],
      ['Statistics', 0],
    ],
    signals: ['Strong geometry score', 'Explains strategy clearly', 'Ready for extension'],
  },
  {
    name: 'Maya Johnson',
    status: 'On track',
    average: 88,
    confidence: 82,
    evidence: 84,
    focus: 'Maintain challenge and reasoning depth',
    nextStep: 'Peer explanation role',
    topicScores: [
      ['Fractions', 86],
      ['Percentages', 90],
      ['Geometry', 88],
      ['Algebra basics', 0],
      ['Statistics', 0],
    ],
    signals: ['High confidence', 'Strong written evidence', 'Can support peer discussion'],
  },
];

const statusStyles = {
  Completed: { bgcolor: '#f8eafd', color: '#6f1d7d', borderColor: '#d9a8e2' },
  'In progress': { bgcolor: '#fff5cc', color: '#6a5011', borderColor: '#e2cb7d' },
  'Not started': { bgcolor: '#eef1f3', color: '#52606d', borderColor: '#cfd8dc' },
  'Targeted support': { bgcolor: '#fff0ee', color: '#842d22', borderColor: '#e0b3ad' },
  'Confidence check': { bgcolor: '#eef3ff', color: '#284c7d', borderColor: '#bacbf1' },
  'Reasoning support': { bgcolor: '#fff5cc', color: '#6a5011', borderColor: '#e2cb7d' },
  'On track': { bgcolor: '#f8eafd', color: '#6f1d7d', borderColor: '#d9a8e2' },
  Good: { bgcolor: '#f8eafd', color: '#6f1d7d', borderColor: '#d9a8e2' },
  Medium: { bgcolor: '#eef3ff', color: '#284c7d', borderColor: '#bacbf1' },
  Partial: { bgcolor: '#fff5cc', color: '#6a5011', borderColor: '#e2cb7d' },
  Limited: { bgcolor: '#fff0ee', color: '#842d22', borderColor: '#e0b3ad' },
  Missing: { bgcolor: '#eef1f3', color: '#52606d', borderColor: '#cfd8dc' },
  'N/A': { bgcolor: '#fbf7fc', color: '#566474', borderColor: '#ead8ef' },
  'secure-evidence': { bgcolor: '#f8eafd', color: '#6f1d7d', borderColor: '#d9a8e2' },
  'some-evidence': { bgcolor: '#fff5cc', color: '#6a5011', borderColor: '#e2cb7d' },
  'support-needed': { bgcolor: '#fff0ee', color: '#842d22', borderColor: '#e0b3ad' },
  'not-covered': { bgcolor: '#eef1f3', color: '#52606d', borderColor: '#cfd8dc' },
};

const assistantPrompts = [
  'What should I do next?',
  'Who needs support in fractions?',
  'What evidence is missing?',
  'Summarise this student',
];

function SummaryCard({ card }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, minHeight: 132, bgcolor: '#fdf9fe' }}>
      <Stack spacing={1} height="100%">
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
          <Typography color="text.secondary" fontWeight={850}>
            {card.label}
          </Typography>
          {card.icon}
        </Stack>
        <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 34 }, lineHeight: 1.1 }}>
          {card.value}
        </Typography>
        <Typography color="text.secondary">{card.helper}</Typography>
      </Stack>
    </Paper>
  );
}

function Panel({ title, icon, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          {icon}
          <Typography variant="h2" sx={{ fontSize: 22 }}>
            {title}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

function EvidenceCell({ score }) {
  let label = 'No evidence';
  let className = 'not-covered';

  if (score >= 70) {
    label = 'Secure';
    className = 'secure-evidence';
  } else if (score >= 55) {
    label = 'Close';
    className = 'some-evidence';
  } else if (score > 0) {
    label = 'Support';
    className = 'support-needed';
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.25,
        minWidth: 82,
        p: 1,
        border: 1,
        borderRadius: 2,
        ...statusStyles[className],
      }}
    >
      <Typography component="strong" fontSize={18} fontWeight={850}>
        {score > 0 ? score : '—'}
      </Typography>
      <Typography component="small" fontSize={12} fontWeight={850}>
        {label}
      </Typography>
    </Box>
  );
}

function ProgressBar({ label, value, color = 'primary.main' }) {
  return (
    <Box>
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
        <Typography fontWeight={850}>{label}</Typography>
        <Typography color="text.secondary" fontWeight={850}>
          {value === 0 ? 'No evidence' : `${value}%`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 10,
          borderRadius: 999,
          mt: 0.75,
          bgcolor: '#efe4f3',
          '& .MuiLinearProgress-bar': { bgcolor: value === 0 ? '#d8c9de' : color, borderRadius: 999 },
        }}
      />
    </Box>
  );
}

export default function MathsModule() {
  const [view, setView] = useState('input');
  const [overviewTab, setOverviewTab] = useState('evidence');
  const [student, setStudent] = useState('Lina Andersson');
  const [detailStudentName, setDetailStudentName] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState(assistantPrompts[0]);
  const [templateId, setTemplateId] = useState('checkpoint');
  const [topic, setTopic] = useState('Fractions');
  const [score, setScore] = useState('48');
  const [confidence, setConfidence] = useState('Medium');
  const [classEngagement, setClassEngagement] = useState('Good');
  const [classBehaviour, setClassBehaviour] = useState('Settled');
  const [classIssue, setClassIssue] = useState('Misconception');
  const [classNote, setClassNote] = useState('Most students engaged with fraction diagrams; denominator language still needs reinforcement.');
  const selectedTemplate = inputTemplates.find((template) => template.id === templateId);
  const [evidence, setEvidence] = useState(selectedTemplate.defaultEvidence);
  const selectedCaptureProfile = classStudentProfiles.find((profile) => profile.name === student);
  const selectedProfile = classStudentProfiles.find((profile) => profile.name === detailStudentName);
  const topicSummary = topics.map((topicName) => {
    const scores = classStudentProfiles.map((profile) => profile.topicScores.find(([name]) => name === topicName)?.[1] || 0);
    const evidenceCount = scores.filter((value) => value > 0).length;
    const average = evidenceCount
      ? Math.round(scores.filter((value) => value > 0).reduce((sum, value) => sum + value, 0) / evidenceCount)
      : 0;

    return {
      topicName,
      average,
      evidenceCount,
      coverage: Math.round((evidenceCount / classStudentProfiles.length) * 100),
    };
  });

  function chooseTemplate(nextTemplateId) {
    const nextTemplate = inputTemplates.find((template) => template.id === nextTemplateId);
    setTemplateId(nextTemplateId);
    setEvidence(nextTemplate.defaultEvidence);
  }

  function getAssistantResponse() {
    if (assistantPrompt === 'Who needs support in fractions?') {
      return 'Lina Andersson is the clearest priority for fractions, with 48% evidence and a denominator logic concern. Amir Khan is close enough to benefit from the same short revision task. Max Berg is secure in score terms, but confidence should be checked.';
    }

    if (assistantPrompt === 'What evidence is missing?') {
      return 'Algebra basics and Statistics have no class evidence yet. Geometry evidence is mixed: several students have scores, but reasoning evidence is still thin, especially for Amir Khan and Ella Svensson.';
    }

    if (assistantPrompt === 'Summarise this student') {
      return `${selectedCaptureProfile.name} is currently marked as ${selectedCaptureProfile.status.toLowerCase()}. The main focus is ${selectedCaptureProfile.focus}. Suggested next move: ${selectedCaptureProfile.nextStep}.`;
    }

    return 'Run a short fractions revision cycle before moving into algebra. Focus the first group on equivalent fractions and denominator logic, then collect one quick reasoning note from geometry to strengthen curriculum evidence.';
  }

  return (
    <Box component="section">
      <Button
        aria-label="Open SmartDesk assistant"
        onClick={() => setAssistantOpen(true)}
        sx={{
          position: 'fixed',
          right: 0,
          top: { xs: 'auto', md: '32%' },
          bottom: { xs: 18, md: 'auto' },
          transform: { md: 'translateY(-32%)' },
          zIndex: (theme) => theme.zIndex.drawer - 1,
          borderRadius: '8px 0 0 8px',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          boxShadow: 3,
          width: { xs: 'auto', md: 46 },
          minWidth: 0,
          height: { xs: 44, md: 148 },
          px: { xs: 1.5, md: 0.75 },
          py: { xs: 1, md: 1.25 },
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <Stack direction={{ xs: 'row', md: 'column' }} spacing={0.75} alignItems="center">
          <AutoAwesomeIcon fontSize="small" />
          <Typography
            component="span"
            fontWeight={850}
            sx={{ writingMode: { md: 'vertical-rl' }, transform: { md: 'rotate(180deg)' }, lineHeight: 1 }}
          >
            SmartDesk
          </Typography>
        </Stack>
      </Button>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Paper
          component="aside"
          variant="outlined"
          aria-label="Maths class list"
          sx={{ p: 2.5, position: { md: 'sticky' }, top: 92, maxHeight: { md: 'calc(100vh - 120px)' }, overflow: 'auto' }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <GroupsIcon color="primary" />
            <Box>
              {/* <Typography variant="overline" color="primary" fontWeight={850}>
                Class list
              </Typography> */}
      
              <Typography variant="h2" sx={{ fontSize: 24 }}>
                Class 8B
              </Typography>
            </Box>
          </Stack>
          <Stack spacing={1.5} sx={{ mt: 2.25 }}>
            {classStudentProfiles.map((profile) => (
              <Button
                key={profile.name}
                variant={profile.name === student ? 'contained' : 'outlined'}
                onClick={() => setStudent(profile.name)}
                sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.25 }}
              >
                <Box>
                  <Typography fontWeight={850}>{profile.name}</Typography>
                  <Typography variant="caption" color={profile.name === student ? 'inherit' : 'text.secondary'}>
                    {profile.status}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Stack>
        </Paper>

      <Stack spacing={2} sx={{ minWidth: 0 }}>
        <ToggleButtonGroup
          exclusive
          value={view}
          onChange={(_, nextView) => nextView && setView(nextView)}
          aria-label="Maths module view"
          sx={{
            bgcolor: 'background.paper',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: 1,
              borderColor: 'divider',
              borderRadius: '8px !important',
              margin: '0 !important',
            },
            '& .MuiToggleButton-root': {
              flex: '1 1 220px',
              py: 1.5,
              whiteSpace: 'normal',
              fontSize: 16,
              borderColor: 'primary.main',
              color: 'primary.main',
              bgcolor: 'background.paper',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderColor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            },
          }}
        >
             
          <ToggleButton value="input">
            
            <PlaylistAddCheckIcon sx={{ mr: 1 }} />
            Teacher input
          </ToggleButton>
          <ToggleButton value="overview">
            <InsightsIcon sx={{ mr: 1 }} />
            Term overview
          </ToggleButton>
       
        </ToggleButtonGroup>

        {view === 'input' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)' }, gap: 2, alignItems: 'start' }}>
            <Stack spacing={2}>
              <Panel title="Choose an input template" icon={<PlaylistAddCheckIcon color="primary" />}>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                    <Box>
                      <Typography color="text.secondary" fontWeight={850}>
                        Capturing evidence for
                      </Typography>
                      <Typography fontWeight={850}>{student}</Typography>
                    </Box>
                    <Chip size="small" label={selectedCaptureProfile.status} variant="outlined" sx={statusStyles[selectedCaptureProfile.status]} />
                  </Stack>
                </Paper>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                  {inputTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outlined"
                      onClick={() => chooseTemplate(template.id)}
                      sx={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        p: 1.75,
                        textAlign: 'left',
                        borderLeft: 5,
                        borderLeftColor: template.id === templateId ? 'primary.main' : 'divider',
                        borderColor: template.id === templateId ? '#d9a8e2' : 'divider',
                        bgcolor: template.id === templateId ? '#fbf5fd' : 'background.paper',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          borderLeftColor: 'primary.main',
                          bgcolor: '#fbf5fd',
                        },
                      }}
                    >
                      <Box>
                        <Typography fontWeight={850}>{template.label}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {template.helper}
                        </Typography>
                      </Box>
                    </Button>
                  ))}
                </Box>

                <Divider />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
                  <FormControl fullWidth>
                    <InputLabel id="maths-topic-label">Topic</InputLabel>
                    <Select labelId="maths-topic-label" label="Topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
                      {topics.map((name) => (
                        <MenuItem key={name} value={name}>{name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField label="Score / result" value={score} onChange={(event) => setScore(event.target.value)} helperText="Mock input, no save action" />
                  <FormControl fullWidth>
                    <InputLabel id="maths-confidence-label">Confidence</InputLabel>
                    <Select labelId="maths-confidence-label" label="Confidence" value={confidence} onChange={(event) => setConfidence(event.target.value)}>
                      {confidenceOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <TextField
                  multiline
                  minRows={4}
                  label="Evidence / teacher comment"
                  value={evidence}
                  onChange={(event) => setEvidence(event.target.value)}
                  fullWidth
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1 }}>
                  {[
                    'Struggles with denominators',
                    'Needs explanation prompt',
                    'Good calculation accuracy',
                    'Missing class evidence',
                  ].map((note) => (
                    <Chip
                      key={note}
                      label={note}
                      variant="outlined"
                      onClick={() => setEvidence(note)}
                      sx={{ maxWidth: '100%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                    />
                  ))}
                </Box>
              </Panel>

              <Panel title="Class-level note" icon={<GroupsIcon color="primary" />}>
                <Typography color="text.secondary">
                  Capture the lesson climate once, then use it later to spot patterns across the term.
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
                  <FormControl fullWidth>
                    <InputLabel id="class-engagement-label">Engagement</InputLabel>
                    <Select
                      labelId="class-engagement-label"
                      label="Engagement"
                      value={classEngagement}
                      onChange={(event) => setClassEngagement(event.target.value)}
                    >
                      {engagementOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="class-behaviour-label">Behaviour</InputLabel>
                    <Select
                      labelId="class-behaviour-label"
                      label="Behaviour"
                      value={classBehaviour}
                      onChange={(event) => setClassBehaviour(event.target.value)}
                    >
                      {behaviourOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="class-issue-label">Issue / barrier</InputLabel>
                    <Select
                      labelId="class-issue-label"
                      label="Issue / barrier"
                      value={classIssue}
                      onChange={(event) => setClassIssue(event.target.value)}
                    >
                      {classIssueOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <TextField
                  multiline
                  minRows={3}
                  label="Whole-class note"
                  value={classNote}
                  onChange={(event) => setClassNote(event.target.value)}
                  fullWidth
                />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {classNoteShortcuts.map((note) => (
                    <Chip key={note} label={note} variant="outlined" onClick={() => setClassNote(note)} />
                  ))}
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                  <Typography color="text.secondary">
                    {classEngagement} engagement · {classBehaviour} behaviour · {classIssue}
                  </Typography>
                  <Button variant="outlined" startIcon={<PlaylistAddCheckIcon />}>
                    Add class note
                  </Button>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography fontWeight={850}>Recent class signals</Typography>
                  {recentClassNotes.map((note) => (
                    <Paper key={`${note.date}-${note.issue}`} variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                      <Stack spacing={0.75}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={note.date} color="primary" />
                          <Chip size="small" label={note.engagement} variant="outlined" />
                          <Chip size="small" label={note.behaviour} variant="outlined" />
                          <Chip size="small" label={note.issue} variant="outlined" />
                        </Stack>
                        <Typography color="text.secondary">{note.note}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Panel>
            </Stack>

            <Stack spacing={2}>
              <Panel title="What this one input creates" icon={<AutoAwesomeIcon color="primary" />}>
                <Paper variant="outlined" sx={{ p: 1.75, bgcolor: '#fdf9fe' }}>
                  <Typography color="text.secondary" fontWeight={850} sx={{ mb: 0.75 }}>
                    Captured data point
                  </Typography>
                  <Typography>
                    <strong>{student}</strong> · {topic} · {score}{score === 'N/A' ? '' : '%'} · {confidence} confidence
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {evidence}
                  </Typography>
                </Paper>
                <Stack spacing={1}>
                  {selectedTemplate.creates.map((output) => (
                    <Paper key={output} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography fontWeight={850}>{output}</Typography>
                    </Paper>
                  ))}
                </Stack>
                <Divider />
                <Paper variant="outlined" sx={{ p: 1.75, bgcolor: '#fbf5fd', borderColor: '#ead8ef' }}>
                  <Typography color="text.secondary" fontWeight={850} sx={{ mb: 0.75 }}>
                    Class note signal
                  </Typography>
                  <Typography>
                    {classEngagement} engagement · {classBehaviour} behaviour · {classIssue}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Over time this could help SmartDesk connect progress dips with engagement, behaviour, absence, or confidence patterns.
                  </Typography>
                </Paper>
              </Panel>

              <Panel title="Template preview" icon={<RuleIcon color="primary" />}>
                <Typography color="text.secondary">
                  The teacher adds one small classroom signal. SmartDesk can turn it into a support flag, curriculum
                  evidence, and a suggested next step without asking the teacher to write the same thing three times.
                </Typography>
                <Button variant="contained" startIcon={<PlaylistAddCheckIcon />}>
                  Add mock data point
                </Button>
              </Panel>
            </Stack>
          </Box>
        )}

        {view === 'overview' && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
              {summaryCards.map((card) => (
                <SummaryCard key={card.label} card={card} />
              ))}
            </Box>

            <ToggleButtonGroup
              exclusive
              value={overviewTab}
              onChange={(_, nextTab) => nextTab && setOverviewTab(nextTab)}
              aria-label="Term overview detail"
              sx={{
                bgcolor: 'background.paper',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: '8px !important',
                  margin: '0 !important',
                },
                '& .MuiToggleButton-root': {
                  flex: '1 1 220px',
                  py: 1.25,
                  whiteSpace: 'normal',
                  color: 'primary.main',
                  bgcolor: 'background.paper',
                  '&.Mui-selected': {
                    bgcolor: '#fbf5fd',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    borderLeft: 5,
                    borderLeftColor: 'primary.main',
                  },
                },
              }}
            >
              <ToggleButton value="evidence">
                <CalculateIcon sx={{ mr: 1 }} />
                Evidence matrix
              </ToggleButton>
              <ToggleButton value="class-patterns">
                <GroupsIcon sx={{ mr: 1 }} />
                Class patterns
              </ToggleButton>
            </ToggleButtonGroup>

            {overviewTab === 'evidence' && (
              <>
            <Panel title="Term evidence matrix" icon={<CalculateIcon color="primary" />}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                <Typography color="text.secondary">
                  Click a student to open their graphical evidence view.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[
                    ['Secure', 'secure-evidence'],
                    ['Close', 'some-evidence'],
                    ['Support', 'support-needed'],
                    ['No evidence', 'not-covered'],
                  ].map(([label, className]) => (
                    <Chip key={label} label={label} size="small" variant="outlined" sx={statusStyles[className]} />
                  ))}
                </Stack>
              </Stack>

              <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 920 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      {topics.map((topicName) => (
                        <TableCell key={topicName}>{topicName}</TableCell>
                      ))}
                      <TableCell>Next step</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classStudentProfiles.map((profile) => (
                      <TableRow key={profile.name}>
                        <TableCell component="th" scope="row">
                          <Button
                            onClick={() => {
                              setStudent(profile.name);
                              setDetailStudentName(profile.name);
                            }}
                            sx={{ textAlign: 'left' }}
                          >
                            {profile.name}
                          </Button>
                        </TableCell>
                        {topics.map((topicName) => {
                          const score = profile.topicScores.find(([name]) => name === topicName)?.[1] || 0;

                          return (
                            <TableCell key={topicName}>
                              <EvidenceCell score={score} />
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <Typography color="text.secondary">{profile.nextStep}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' }, gap: 1.25 }}>
                {topicSummary.map((item) => (
                  <Paper key={item.topicName} variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                    <Typography fontWeight={850}>{item.topicName}</Typography>
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                      {item.evidenceCount}/{classStudentProfiles.length} students with evidence
                    </Typography>
                    <ProgressBar label={`${item.average || 0}% average`} value={item.coverage} />
                  </Paper>
                ))}
              </Box>
            </Panel>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)' }, gap: 2, alignItems: 'start' }}>
              <Panel title="Students needing attention" icon={<GroupsIcon color="primary" />}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                  {supportStudents.map((student) => (
                    <Paper key={student.name} variant="outlined" sx={{ p: 1.75, bgcolor: '#fdf9fe' }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={850}>{student.name}</Typography>
                          <Chip size="small" label={student.concern} variant="outlined" color="primary" />
                        </Stack>
                        <Typography color="text.secondary">{student.evidence}</Typography>
                        <Typography>
                          Suggested support: <strong>{student.support}</strong>
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              </Panel>

              <Stack spacing={2}>
                <Panel title="Common misconceptions" icon={<InsightsIcon color="primary" />}>
                  <Stack spacing={1.25}>
                    {misconceptions.map((item) => (
                      <Paper key={item} variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                        <Typography>{item}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Panel>

                <Panel title="Mock SmartDesk insight" icon={<AutoAwesomeIcon color="primary" />}>
                  <Typography color="text.secondary">
                    Fractions may need a short revision cycle before algebra. Geometry scores look stronger, but
                    evidence for mathematical reasoning is still limited.
                  </Typography>
                </Panel>
              </Stack>
            </Box>
              </>
            )}

            {overviewTab === 'class-patterns' && (
              <>
                <Panel title="Class behaviour and learning patterns" icon={<GroupsIcon color="primary" />}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ md: 'center' }}>
                    <Typography color="text.secondary">
                      Mocked from class-level notes captured during lessons. This helps connect progress with engagement,
                      behaviour, confidence, and classroom conditions over time.
                    </Typography>
                    <Chip label="5 class notes" color="primary" />
                  </Stack>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
                    {[
                      { label: 'Engagement trend', value: 'Rising', helper: '68% to 84% across five weeks' },
                      { label: 'Most common barrier', value: 'Confidence', helper: 'Appears before reasoning tasks' },
                      { label: 'Best learning climate', value: 'Week 5', helper: 'Revision group + clearer discussion' },
                    ].map((card) => (
                      <Paper key={card.label} variant="outlined" sx={{ p: 1.75, bgcolor: '#fdf9fe' }}>
                        <Typography color="text.secondary" fontWeight={850}>{card.label}</Typography>
                        <Typography variant="h3" sx={{ fontSize: 24, mt: 0.75 }}>{card.value}</Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.75 }}>{card.helper}</Typography>
                      </Paper>
                    ))}
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table sx={{ minWidth: 980 }} size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Point in term</TableCell>
                          <TableCell>Topic focus</TableCell>
                          <TableCell>Engagement</TableCell>
                          <TableCell>Behaviour</TableCell>
                          <TableCell>Confidence</TableCell>
                          <TableCell>Progress signal</TableCell>
                          <TableCell>Main note</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classPatternTimeline.map((entry) => (
                          <TableRow key={entry.week}>
                            <TableCell component="th" scope="row">
                              <Typography fontWeight={850}>{entry.week}</Typography>
                              <Chip size="small" label={entry.issue} variant="outlined" sx={{ mt: 0.75 }} />
                            </TableCell>
                            <TableCell>{entry.topic}</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>
                              <ProgressBar label="Engagement" value={entry.engagement} />
                            </TableCell>
                            <TableCell sx={{ minWidth: 150 }}>
                              <ProgressBar label="Behaviour" value={entry.behaviour} />
                            </TableCell>
                            <TableCell sx={{ minWidth: 150 }}>
                              <ProgressBar label="Confidence" value={entry.confidence} color={entry.confidence < 65 ? 'warning.main' : 'primary.main'} />
                            </TableCell>
                            <TableCell sx={{ minWidth: 150 }}>
                              <ProgressBar label="Progress" value={entry.progress} color={entry.progress < 65 ? 'warning.main' : 'primary.main'} />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 280 }}>
                              <Typography color="text.secondary">{entry.note}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Panel>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(320px, 0.85fr)' }, gap: 2, alignItems: 'start' }}>
                  <Panel title="Patterns SmartDesk might surface" icon={<AutoAwesomeIcon color="primary" />}>
                    <Stack spacing={1.25}>
                      {[
                        'Confidence drops when tasks move from calculation into written explanation.',
                        'Behaviour is strongest when students rehearse reasoning with a partner before writing.',
                        'Fraction revision appears to improve both engagement and denominator accuracy.',
                      ].map((item) => (
                        <Paper key={item} variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
                          <Typography>{item}</Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Panel>

                  <Panel title="Teacher moves" icon={<PlaylistAddCheckIcon color="primary" />}>
                    <Typography color="text.secondary">
                      These are mock actions only, but show how class notes could become planning prompts instead of
                      extra admin.
                    </Typography>
                    <Stack spacing={1}>
                      {['Plan confidence check-in', 'Revisit reasoning routines', 'Compare with evidence matrix', 'Add class note'].map((action) => (
                        <Button key={action} variant="outlined" sx={{ justifyContent: 'flex-start' }}>
                          {action}
                        </Button>
                      ))}
                    </Stack>
                  </Panel>
                </Box>
              </>
            )}
          </>
        )}
      </Stack>
      </Box>

      <Dialog open={Boolean(selectedProfile)} onClose={() => setDetailStudentName(null)} fullWidth maxWidth="md">
        {selectedProfile && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={850}>
                    Student graph view
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: 28 }}>
                    {selectedProfile.name}
                  </Typography>
                </Box>
                <IconButton aria-label="Close student view" onClick={() => setDetailStudentName(null)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
                  <SummaryCard card={{ label: 'Average score', value: `${selectedProfile.average}%`, helper: selectedProfile.focus, icon: <CalculateIcon color="primary" /> }} />
                  <SummaryCard card={{ label: 'Confidence', value: `${selectedProfile.confidence}%`, helper: selectedProfile.status, icon: <GroupsIcon color="primary" /> }} />
                  <SummaryCard card={{ label: 'Evidence', value: `${selectedProfile.evidence}%`, helper: selectedProfile.nextStep, icon: <RuleIcon color="primary" /> }} />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)' }, gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h3" sx={{ fontSize: 20, mb: 1.5 }}>
                      Topic evidence
                    </Typography>
                    <Stack spacing={1.5}>
                      {selectedProfile.topicScores.map(([topicName, topicScore]) => (
                        <ProgressBar key={topicName} label={topicName} value={topicScore} color={topicScore < 55 ? 'error.main' : topicScore < 70 ? 'warning.main' : 'primary.main'} />
                      ))}
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h3" sx={{ fontSize: 20, mb: 1.5 }}>
                      Recent signals
                    </Typography>
                    <Stack spacing={1}>
                      {selectedProfile.signals.map((signal) => (
                        <Paper key={signal} variant="outlined" sx={{ p: 1.25, bgcolor: '#fdf9fe' }}>
                          <Typography>{signal}</Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Paper>
                </Box>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fdf9fe', borderColor: '#ead8ef' }}>
                  <Typography fontWeight={850}>Suggested teacher move</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    {selectedProfile.nextStep}. Use a template on the Teacher input page to add the next small data
                    point without writing a full report.
                  </Typography>
                </Paper>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setView('input');
                  setDetailStudentName(null);
                }}
              >
                Use input template
              </Button>
              <Button variant="contained" onClick={() => setDetailStudentName(null)}>
                Done
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Drawer anchor="right" open={assistantOpen} onClose={() => setAssistantOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 2.5 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="overline" color="primary" fontWeight={850}>
                  Mock assistant drawer
                </Typography>
                <Typography variant="h2" sx={{ fontSize: 26 }}>
                  Ask SmartDesk
                </Typography>
              </Box>
              <IconButton aria-label="Close SmartDesk drawer" onClick={() => setAssistantOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
              <Typography color="text.secondary" fontWeight={850}>
                Current context
              </Typography>
              <Typography>{view === 'overview' ? 'Term overview' : 'Teacher input'} · Class 8B</Typography>
              <Typography color="text.secondary">
                Selected student: {student}
              </Typography>
            </Paper>

            <Stack spacing={1}>
              <Typography fontWeight={850}>Suggested prompts</Typography>
              {assistantPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant={assistantPrompt === prompt ? 'contained' : 'outlined'}
                  onClick={() => setAssistantPrompt(prompt)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {prompt}
                </Button>
              ))}
            </Stack>

            <Paper variant="outlined" sx={{ p: 2, borderColor: '#ead8ef' }}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AutoAwesomeIcon color="primary" />
                  <Typography fontWeight={850}>{assistantPrompt}</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {getAssistantResponse()}
                </Typography>
              </Stack>
            </Paper>

            <Stack spacing={1}>
              <Typography fontWeight={850}>Possible actions</Typography>
              {['Create revision group', 'Draft parent summary', 'Open evidence gaps', 'Add note for selected student'].map((action) => (
                <Button key={action} variant="outlined" sx={{ justifyContent: 'flex-start' }}>
                  {action}
                </Button>
              ))}
            </Stack>

            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fdf9fe' }}>
              <Typography variant="caption" color="text.secondary">
                Prototype only: this drawer uses hardcoded responses and local mock data. No AI service is connected.
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
