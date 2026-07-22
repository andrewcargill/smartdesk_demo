import { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalculateIcon from '@mui/icons-material/Calculate';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SchoolIcon from '@mui/icons-material/School';
import Home from './components/Home.jsx';
import MathsModule from './components/MathsModule.jsx';
import MusicTeacherAssessment from './components/MusicTeacherAssessment.jsx';
import PETeacherAssessment from './components/PETeacherAssessment.jsx';
import StudentEssayHelper from './components/StudentEssayHelper.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import HomeScreen from './features/conceptDemo/HomeScreen.jsx';

const views = new Set(['home', 'student', 'teacher', 'maths', 'music', 'pe', 'concept-demo']);

const starterLog = [
  {
    id: 1,
    label: 'Help me understand the task',
    stage: 'Understanding',
    blocked: false,
    message: 'Student asked for assignment clarification.',
  },
  {
    id: 2,
    label: 'Help me plan',
    stage: 'Planning',
    blocked: false,
    message: 'Student requested a blank planning frame.',
  },
  {
    id: 3,
    label: 'Write the essay for me',
    stage: 'Blocked Request',
    blocked: true,
    message: "I can't write this for you, but I can help you think it through. Let's start with your main idea.",
  },
];

export default function App() {
  const initialView = typeof window === 'undefined' ? 'home' : window.location.hash.replace('#', '');
  const [view, setView] = useState(views.has(initialView) ? initialView : 'home');
  const [assignment, setAssignment] = useState('');
  const [idea, setIdea] = useState('');
  const [currentResponse, setCurrentResponse] = useState(null);
  const [interactions, setInteractions] = useState(starterLog);

  const latestStage = useMemo(() => interactions[0]?.stage || 'Understanding', [interactions]);

  function handleInteraction(entry) {
    const loggedEntry = {
      id: Date.now(),
      ...entry,
    };
    setCurrentResponse(entry);
    setInteractions((current) => [loggedEntry, ...current]);
  }

  function navigate(nextView) {
    setView(nextView);
    if (typeof window !== 'undefined') {
      window.location.hash = nextView === 'home' ? '' : nextView;
    }
  }

  if (view === 'concept-demo') {
    return <HomeScreen />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(246, 248, 244, 0.94)', backdropFilter: 'blur(12px)' }}
      >
        <Toolbar sx={{ gap: 2, justifyContent: 'space-between', flexWrap: 'wrap', py: 1 }}>
          <Button color="inherit" startIcon={<HomeIcon />} onClick={() => navigate('home')} aria-label="Go to home">
            <Typography component="span" fontWeight={850}>
              Learning Helper
            </Typography>
          </Button>
          <Stack component="nav" direction="row" spacing={1} aria-label="Primary" sx={{ flexWrap: 'wrap' }}>
            <Button
              variant={view === 'student' ? 'contained' : 'text'}
              color={view === 'student' ? 'primary' : 'inherit'}
              startIcon={<MenuBookIcon />}
              onClick={() => navigate('student')}
            >
              Student
            </Button>
            <Button
              variant={view === 'teacher' ? 'contained' : 'text'}
              color={view === 'teacher' ? 'primary' : 'inherit'}
              startIcon={<SchoolIcon />}
              onClick={() => navigate('teacher')}
            >
              Teacher
            </Button>
            <Button
              variant={view === 'maths' ? 'contained' : 'text'}
              color={view === 'maths' ? 'primary' : 'inherit'}
              startIcon={<CalculateIcon />}
              onClick={() => navigate('maths')}
            >
              Maths
            </Button>
            <Button
              variant={view === 'music' ? 'contained' : 'text'}
              color={view === 'music' ? 'primary' : 'inherit'}
              startIcon={<MusicNoteIcon />}
              onClick={() => navigate('music')}
            >
              Music
            </Button>
            <Button
              variant={view === 'pe' ? 'contained' : 'text'}
              color={view === 'pe' ? 'primary' : 'inherit'}
              startIcon={<FitnessCenterIcon />}
              onClick={() => navigate('pe')}
            >
              PE
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth={false} sx={{ width: '100%', py: { xs: 3, md: 4 }, px: { xs: 2, md: 3 } }}>
        {view !== 'home' && (
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('home')} sx={{ mb: 2.5 }}>
            Home
          </Button>
        )}

        {view === 'home' && <Home onNavigate={navigate} />}
        {view === 'student' && (
          <StudentEssayHelper
            assignment={assignment}
            setAssignment={setAssignment}
            idea={idea}
            setIdea={setIdea}
            currentResponse={currentResponse}
            onInteraction={handleInteraction}
          />
        )}
        {view === 'teacher' && <TeacherDashboard latestStage={latestStage} interactions={interactions} />}
        {view === 'maths' && <MathsModule />}
        {view === 'music' && <MusicTeacherAssessment />}
        {view === 'pe' && <PETeacherAssessment />}
      </Container>
    </Box>
  );
}
