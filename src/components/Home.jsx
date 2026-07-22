import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

const routes = [
  { id: 'concept-demo', label: 'Anna SmartDesk Home', icon: <WorkspacesIcon /> },
  { id: 'student', label: 'Student Essay Helper', icon: <MenuBookIcon /> },
  { id: 'teacher', label: 'Teacher Dashboard', icon: <SchoolIcon /> },
  { id: 'maths', label: 'Maths Module', icon: <CalculateIcon /> },
  { id: 'music', label: 'Music Assessment Module', icon: <MusicNoteIcon /> },
  { id: 'pe', label: 'PE Assessment Module', icon: <FitnessCenterIcon /> },
];

export default function Home({ onNavigate }) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)' },
        gap: 4,
        alignItems: 'center',
        minHeight: { md: 'calc(100vh - 144px)' },
      }}
    >
      <Box>
        <Typography variant="overline" color="primary" fontWeight={850}>
          School support prototypes
        </Typography>
        <Typography variant="h1" sx={{ maxWidth: 720, fontSize: { xs: 46, sm: 64, md: 92 }, lineHeight: 0.95 }}>
          Learning Helper Lab
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 620, mt: 2.5, fontSize: 20, lineHeight: 1.6 }}>
          Explore small classroom tools for guided student support and teacher-owned evidence capture.
          Each prototype is mocked locally so the workflow can be tested before any backend or AI is added.
        </Typography>
      </Box>

      <Stack spacing={1.5} aria-label="Choose a view">
        {routes.map((route) => (
          <ButtonBase key={route.id} onClick={() => onNavigate(route.id)} sx={{ display: 'block', textAlign: 'left', borderRadius: 2 }}>
            <Paper
              variant="outlined"
              sx={{
                minHeight: 92,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                fontWeight: 850,
                fontSize: 18,
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': { borderColor: 'primary.main', bgcolor: '#fbf5fd' },
              }}
            >
              {route.icon}
              <span>{route.label}</span>
            </Paper>
          </ButtonBase>
        ))}
      </Stack>
    </Box>
  );
}
