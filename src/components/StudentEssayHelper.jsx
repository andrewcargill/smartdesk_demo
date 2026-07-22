import { Alert, Box, Button, List, ListItem, Paper, Stack, TextField, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import QuizIcon from '@mui/icons-material/Quiz';
import ShieldIcon from '@mui/icons-material/Shield';
import { getMockAiResponse } from '../config/aiPolicy.js';

const actions = [
  { action: 'understand', label: 'Help me understand the task', icon: <QuizIcon /> },
  { action: 'plan', label: 'Help me plan', icon: <ListAltIcon /> },
  { action: 'questions', label: 'Ask me guiding questions', icon: <HelpOutlineIcon /> },
  { action: 'blocked-test', label: 'Write the essay for me', icon: <ShieldIcon />, danger: true },
];

export default function StudentEssayHelper({
  assignment,
  setAssignment,
  idea,
  setIdea,
  currentResponse,
  onInteraction,
}) {
  function handleAction(action, label) {
    const response = getMockAiResponse(action, assignment, idea);
    onInteraction({
      label,
      input: action === 'blocked-test' ? 'Write the essay for me' : assignment || 'No assignment entered',
      ...response,
    });
  }

  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)' },
        gap: 2.5,
        alignItems: 'start',
      }}
    >
      <Paper variant="outlined" sx={{ p: 2.75 }}>
        <Stack spacing={2.25}>
          <Box>
            <Typography variant="overline" color="primary" fontWeight={850}>
              Student side
            </Typography>
            <Typography variant="h2" fontSize={24}>
              Essay Helper
            </Typography>
          </Box>

          <TextField
            label="Assignment question"
            value={assignment}
            onChange={(event) => setAssignment(event.target.value)}
            placeholder="Paste or type the essay question here."
            minRows={4}
            multiline
            fullWidth
          />

          <TextField
            label="My current idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="Write a rough thought, possible argument, or point of confusion."
            minRows={4}
            multiline
            fullWidth
          />

          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {actions.map((item) => (
              <Button
                key={item.action}
                variant="outlined"
                color={item.danger ? 'error' : 'primary'}
                startIcon={item.icon}
                onClick={() => handleAction(item.action, item.label)}
                sx={{ justifyContent: 'flex-start', minHeight: 54, bgcolor: item.danger ? '#fff7f5' : 'background.paper' }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          minHeight: 330,
          p: 2.75,
          borderTop: 5,
          borderTopColor: currentResponse?.blocked ? 'error.main' : 'primary.main',
          bgcolor: currentResponse?.blocked ? '#fffafa' : 'background.paper',
        }}
      >
        <Typography variant="overline" color="primary" fontWeight={850}>
          Mock AI response
        </Typography>
        <Typography variant="h2" fontSize={24} sx={{ mb: 1.5 }}>
          {currentResponse?.stage || 'Ready when you are'}
        </Typography>
        <Typography color="text.secondary" lineHeight={1.6}>
          {currentResponse?.message ||
            'Enter an assignment and your own early idea, then choose the kind of support you want.'}
        </Typography>
        {currentResponse?.blocked && <Alert severity="warning" sx={{ mt: 2 }}>This request is blocked by teacher policy.</Alert>}
        {currentResponse?.template && (
          <List sx={{ display: 'grid', gap: 1.25, mt: 2.25, p: 0 }}>
            {currentResponse.template.map((item) => (
              <ListItem key={item} sx={{ border: 1, borderColor: '#d9a8e2', borderStyle: 'dashed', borderRadius: 2, bgcolor: '#fbf5fd' }}>
                {item}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
