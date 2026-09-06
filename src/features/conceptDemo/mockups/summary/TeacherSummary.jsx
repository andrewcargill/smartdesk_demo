import { useState } from 'react';
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';

const small = { fontSize: 12, color: 'text.secondary' };
const lessons = [
  { time: '09:00', name: '8B · Patterns', done: true },
  { time: '10:15', name: '7A · Fractions', done: true },
  { time: '13:00', name: '8A · Equations', done: false },
  { time: '14:15', name: '8C · Graphs', done: false },
];
function Card({ title, children, sx }) {
  return <Paper elevation={0} sx={{ p: 1.75, border: '1px solid', borderColor: 'divider', borderRadius: 3, ...sx }}><Typography component="h3" sx={{ fontSize: 13, fontWeight: 650, mb: 1.25 }}>{title}</Typography>{children}</Paper>;
}
function Check({ label }) {
  return <CheckCircleOutlineRoundedIcon aria-label={label} role="img" sx={{ fontSize: 18, color: 'var(--sd-accent-text)' }} />;
}

export default function TeacherSummary({ onOpenMentor, onReset }) {
  const [lessonOpen, setLessonOpen] = useState(false);
  return <>
    <Box component="section" aria-labelledby="teacher-summary-title" sx={{ width: '100%', maxWidth: 1000, mx: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden', bgcolor: 'var(--sd-surface-muted)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap' }}>
        <Typography id="teacher-summary-title" component="h2" sx={{ fontSize: 19, fontWeight: 550 }}>Your day, at a glance</Typography>
        <Typography sx={small}>Mock summary · Wednesday, 11:30 · fictional data</Typography>
      </Stack>
      <Box tabIndex={0} role="region" aria-label="Teacher summary details" sx={{ overflowY: 'auto', minHeight: 0, flex: 1, p: 1.5, pt: 0, scrollbarWidth: 'thin', '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: -2 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.25 }}>
          <Card title="Teacher level · Mostly on track">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                <CircularProgress variant="determinate" value={100} size={70} sx={{ color: 'action.hover' }} />
                <CircularProgress variant="determinate" value={80} size={70} aria-label="Mock readiness estimate: 80 percent" sx={{ position: 'absolute', left: 0, color: 'var(--sd-chart)' }} />
                <Typography sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 19 }}>80%</Typography>
              </Box>
              <Box><Typography sx={{ fontSize: 14 }}>Teaching ready. Two loose ends.</Typography><Typography sx={{ ...small, mt: 0.5 }}>Mock AI estimate from plans and deadlines.</Typography><Typography sx={small}>Readiness signal · not a wellbeing assessment</Typography></Box>
            </Stack>
          </Card>
          <Card title="Urgent · next 3 days">
            <Stack spacing={1}>{[['Send Maja’s support update', 'Tomorrow'], ['Finish 8A feedback', 'Friday']].map(([task, due]) => <Stack key={task} direction="row" spacing={1} alignItems="center"><NotificationsNoneRoundedIcon sx={{ fontSize: 18, color: 'var(--sd-warning)' }} /><Typography sx={{ fontSize: 13, flex: 1 }}>{task}</Typography><Chip size="small" label={due} variant="outlined" sx={{ fontSize: 11 }} /></Stack>)}</Stack>
          </Card>
          <Card title="Today · 2 taught / 2 coming">
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75 }}>
              {lessons.map((lesson) => <Box key={lesson.time} sx={{ borderTop: '3px solid', borderColor: lesson.done ? 'var(--sd-chart)' : 'divider', pt: 1 }}>
                <Typography sx={small}>{lesson.time}</Typography><Typography sx={{ fontSize: 12, my: 0.5 }}>{lesson.name}</Typography><Typography sx={{ ...small, fontSize: 10 }}>{lesson.done ? '✓ Taught' : 'Upcoming'}</Typography>
              </Box>)}
            </Box>
          </Card>
          <Card title="Meetings">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {[['Last two', ['Mon · Year team', 'Tue · Maja check-in']], ['Next two', ['Thu 09:00 · Maths team', 'Fri 14:00 · Parent meeting']]].map(([title, entries]) => <Box key={title}><Typography sx={{ ...small, mb: 0.5 }}>{title}</Typography>{entries.map(entry => <Typography key={entry} sx={{ fontSize: 12, py: 0.4 }}>{entry}</Typography>)}</Box>)}
            </Box>
          </Card>
          <Card title="Teaching · rest of this week">
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& th, & td': { py: 0.65, fontSize: 12, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' }, '& th': { color: 'text.secondary', fontWeight: 400 } }}>
              <thead><tr><th>Lesson</th><th>Content</th><th>Planned</th></tr></thead><tbody>
                {['Wed · 8A Equations', 'Wed · 8C Graphs', 'Thu · 8A Practice', 'Fri · 8A Check-in'].map(name => <tr key={name}><td>{name}</td><td><Check label="Content known" /></td><td><Check label="Lesson planned" /></td></tr>)}
              </tbody>
            </Box>
          </Card>
          <Card title="Mentor · 2 students monitored">
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'action.hover', display: 'grid', placeItems: 'center', fontSize: 12 }}>ML</Box><Box sx={{ flex: 1 }}><Typography sx={{ fontSize: 13 }}>Maja Lind</Typography><Typography sx={small}>Maths teacher: missed two assignments</Typography></Box><Chip size="small" label="1 new alert" variant="outlined" sx={{ color: 'var(--sd-warning)', fontSize: 10 }} /></Stack>
              <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'action.hover', display: 'grid', placeItems: 'center', fontSize: 12 }}>OB</Box><Box sx={{ flex: 1 }}><Typography sx={{ fontSize: 13 }}>Oscar Berg</Typography><Typography sx={small}>Attendance improving · check-in Friday</Typography></Box><Check label="On track" /></Stack>
            </Stack>
          </Card>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5, pt: 1.5 }}><MailOutlineRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} /><Typography sx={small}>Email · nothing important waiting</Typography></Stack>
      </Box>
      <Stack direction="row" justifyContent="center" spacing={1} sx={{ p: 1.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 0.5 }}>
        <Button variant="contained" size="small" onClick={onOpenMentor}>Open mentor</Button>
        <Button variant="outlined" size="small" onClick={() => setLessonOpen(true)}>Open next lesson</Button>
        <Button color="inherit" size="small" onClick={onReset}>Thanks</Button>
      </Stack>
    </Box>
    <Dialog open={lessonOpen} onClose={() => setLessonOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>8A maths · Equations</DialogTitle>
      <DialogContent><Stack spacing={2}><Typography sx={small}>Mock lesson · today 13:00–13:50</Typography><Typography>Use inverse operations to solve equations with brackets.</Typography><Typography sx={small}>Favorit matematik 8 · illustrative algebra chapter</Typography>{[['5 min', 'Recall: two-step equations'], ['10 min', 'Model an equation with brackets'], ['25 min', 'Paired practice and teacher check-ins'], ['10 min', 'Exit ticket: solve and explain']].map(([time, task]) => <Stack key={task} direction="row" spacing={1}><ScheduleRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} /><Typography sx={{ ...small, minWidth: 45 }}>{time}</Typography><Typography sx={{ fontSize: 13 }}>{task}</Typography></Stack>)}</Stack></DialogContent>
      <DialogActions><Button onClick={() => setLessonOpen(false)}>Back to summary</Button></DialogActions>
    </Dialog>
  </>;
}
