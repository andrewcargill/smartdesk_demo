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
import ArticleIcon from '@mui/icons-material/Article';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import Home from './components/Home.jsx';
import MathsModule from './components/MathsModule.jsx';
import MusicTeacherAssessment from './components/MusicTeacherAssessment.jsx';
import PETeacherAssessment from './components/PETeacherAssessment.jsx';
import StudentEssayHelper from './components/StudentEssayHelper.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import HomeScreen from './features/conceptDemo/HomeScreen.jsx';
import PhoneKeeperDemo from './features/phoneKeeper/PhoneKeeperDemo.jsx';
import RichDataIntro from './features/richDataIntro/RichDataIntro.jsx';
import SmartDeskTextExamples from './SmartDeskTextExamples.jsx';

const views = new Set(['home', 'student', 'teacher', 'maths', 'music', 'pe', 'rich-data-intro', 'concept-demo', 'examples', 'phone-keeper']);

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
  const initialView = typeof window === 'undefined'
    ? 'home'
    : window.location.hash.replace('#', '') || window.location.pathname.split('/').filter(Boolean).at(-1) || '';
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

  if (view === 'examples') {
    return <SmartDeskTextExamples />;
  }

  if (view === 'phone-keeper') {
    return <PhoneKeeperDemo />;
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
              SmartDesk AB
            </Typography>
          </Button>
          <Stack component="nav" direction="row" spacing={1} aria-label="Primary" sx={{ flexWrap: 'wrap' }}>
            <Button
              variant={view === 'rich-data-intro' || view === 'concept-demo' ? 'contained' : 'text'}
              color={view === 'rich-data-intro' || view === 'concept-demo' ? 'primary' : 'inherit'}
              startIcon={<WorkspacesIcon />}
              onClick={() => navigate('rich-data-intro')}
            >
              Rich Data
            </Button>
            <Button
              variant={view === 'examples' ? 'contained' : 'text'}
              color={view === 'examples' ? 'primary' : 'inherit'}
              startIcon={<ArticleIcon />}
              onClick={() => navigate('examples')}
            >
              Grading Assistant
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
        {view === 'rich-data-intro' && <RichDataIntro onOpenDemo={() => navigate('concept-demo')} />}
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
