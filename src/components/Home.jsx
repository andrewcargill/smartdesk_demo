import { useState } from 'react';
import { Box, Button, ButtonBase, Collapse, Paper, Stack, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CalculateIcon from '@mui/icons-material/Calculate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

const primaryRoutes = [
  { id: 'rich-data-intro', label: 'SmartDesk Rich Data', icon: <WorkspacesIcon />, purple: true },
  { id: 'examples', label: 'SmartDesk Grading Assistant', icon: <ArticleIcon />, purple: true },
];

const secondaryRoutes = [
  { id: 'phone-keeper', label: 'Phone Keeper', icon: <PhoneIphoneIcon /> },
  { id: 'student', label: 'Student Essay Helper', icon: <MenuBookIcon /> },
  { id: 'teacher', label: 'Teacher Dashboard', icon: <SchoolIcon /> },
  { id: 'maths', label: 'Maths Module', icon: <CalculateIcon /> },
  { id: 'music', label: 'Music Assessment Module', icon: <MusicNoteIcon /> },
  { id: 'pe', label: 'PE Assessment Module', icon: <FitnessCenterIcon /> },
];

export default function Home({ onNavigate }) {
  const [otherOpen, setOtherOpen] = useState(false);

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
        <Typography variant="h1" sx={{ maxWidth: 720, color: 'var(--sd-accent-text)', fontSize: { xs: 46, sm: 64, md: 92 }, lineHeight: 0.95 }}>
          SmartDesk Learning Lab
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 620, mt: 2.5, fontSize: 20, lineHeight: 1.6 }}>
          ongoing explorations and experiments
        </Typography>
      </Box>

      <Stack spacing={1.5} aria-label="Choose a view">
        {primaryRoutes.map((route) => (
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
                '&:hover': { borderColor: 'primary.main', bgcolor: 'var(--sd-primary-soft)' },
              }}
            >
              <Box sx={{ color: 'var(--sd-on-primary)', bgcolor: 'primary.main', display: 'inline-flex', p: 1, borderRadius: 1.5 }}>
                {route.icon}
              </Box>
              <Box component="span" sx={{ color: route.purple ? 'var(--sd-accent-text)' : 'inherit' }}>
                {route.label}
              </Box>
            </Paper>
          </ButtonBase>
        ))}

        <Box>
          <Button
            type="button"
            onClick={() => setOtherOpen((current) => !current)}
            endIcon={(
              <ExpandMoreIcon
                sx={{
                  transform: otherOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 160ms ease',
                }}
              />
            )}
            sx={{
              mt: 0.5,
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 820,
              px: 0.5,
              '&:hover': { bgcolor: 'rgba(var(--sd-text-rgb), 0.04)' },
            }}
          >
            Other prototypes
          </Button>

          <Collapse in={otherOpen} timeout={180} unmountOnExit>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {secondaryRoutes.map((route) => (
                <ButtonBase key={route.id} onClick={() => onNavigate(route.id)} sx={{ display: 'block', textAlign: 'left', borderRadius: 2 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      minHeight: 68,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      color: 'text.secondary',
                      fontWeight: 780,
                      fontSize: 15,
                      bgcolor: 'rgba(var(--sd-surface-rgb), 0.72)',
                      transition: 'border-color 160ms ease, background-color 160ms ease, color 160ms ease',
                      '&:hover': { borderColor: 'rgba(var(--sd-primary-rgb), 0.32)', bgcolor: 'var(--sd-primary-soft)', color: 'var(--sd-text)' },
                    }}
                  >
                    <Box sx={{ display: 'inline-flex' }}>
                      {route.icon}
                    </Box>
                    <Box component="span">
                      {route.label}
                    </Box>
                  </Paper>
                </ButtonBase>
              ))}
            </Stack>
          </Collapse>
        </Box>
      </Stack>
    </Box>
  );
}
