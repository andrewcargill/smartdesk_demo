import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { teacherSettings } from '../config/aiPolicy.js';

const settingLabels = {
  allowTaskExplanation: 'Allow task explanation',
  allowPlanningHelp: 'Allow planning help',
  allowGuidingQuestions: 'Allow guiding questions',
  allowDraftRewriting: 'Allow draft rewriting',
  allowFullAnswers: 'Allow full answers',
};

export default function TeacherDashboard({ latestStage, interactions }) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 0.8fr) minmax(320px, 1fr)' },
        gap: 2.5,
        alignItems: 'start',
      }}
    >
      <Paper variant="outlined" sx={{ p: 2.75 }}>
        <Typography variant="overline" color="primary" fontWeight={850}>
          Teacher side
        </Typography>
        <Typography variant="h2" fontSize={24} sx={{ mb: 2 }}>
          Classroom Snapshot
        </Typography>
        <Stack spacing={1.75}>
          {[
            ['Student', 'Maya Johnson'],
            ['Assignment', 'English essay planning task'],
            ['Stage', latestStage],
          ].map(([term, detail]) => (
            <Box key={term}>
              <Typography variant="caption" color="text.secondary" fontWeight={850} textTransform="uppercase">
                {term}
              </Typography>
              <Typography fontWeight={850}>{detail}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.75 }}>
        <Typography variant="h2" fontSize={24} sx={{ mb: 1 }}>
          Teacher Settings
        </Typography>
        <List disablePadding>
          {Object.entries(teacherSettings).map(([key, value]) => (
            <ListItem key={key} disableGutters secondaryAction={
              <Chip
                icon={value ? <CheckIcon /> : <CloseIcon />}
                label={String(value)}
                color={value ? 'success' : 'error'}
                variant="outlined"
              />
            }>
              <ListItemText primary={settingLabels[key]} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.75, gridColumn: '1 / -1' }}>
        <Typography variant="h2" fontSize={24} sx={{ mb: 2 }}>
          Interaction Log
        </Typography>
        <Stack spacing={1.5}>
          {interactions.map((entry) => (
            <Paper key={entry.id} variant="outlined" sx={{ p: 1.75, bgcolor: entry.blocked ? '#fff7f5' : '#fdf9fe', borderColor: entry.blocked ? '#e0b3ad' : 'divider' }}>
              <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center">
                <Typography fontWeight={850}>{entry.stage}</Typography>
                <Divider orientation="vertical" flexItem />
                <Typography color="text.secondary">{entry.label}</Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {entry.message}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
