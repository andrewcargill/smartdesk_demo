import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CalculateIcon from '@mui/icons-material/Calculate';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

const routes = [
  { id: 'rich-data-intro', label: 'SmartDesk Rich Data', icon: <WorkspacesIcon />, purple: true },
  { id: 'examples', label: 'SmartDesk Grading Assistant', icon: <ArticleIcon />, purple: true },
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
        <Typography variant="h1" sx={{ maxWidth: 720, color: '#9c28af', fontSize: { xs: 46, sm: 64, md: 92 }, lineHeight: 0.95 }}>
          SmartDesk Learning Lab
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 620, mt: 2.5, fontSize: 20, lineHeight: 1.6 }}>
          ongoing explorations and experiments
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
              <Box sx={{ color: route.purple ? '#9c28af' : 'inherit', display: 'inline-flex' }}>
                {route.icon}
              </Box>
              <Box component="span" sx={{ color: route.purple ? '#9c28af' : 'inherit' }}>
                {route.label}
              </Box>
            </Paper>
          </ButtonBase>
        ))}
      </Stack>
    </Box>
  );
}
