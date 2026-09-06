import categories from './relaxCategories.json';
import { useState } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import DirectionsWalkRoundedIcon from '@mui/icons-material/DirectionsWalkRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import VideoChatOutlinedIcon from '@mui/icons-material/VideoChatOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

const caption = { fontSize: 12, color: 'text.secondary', lineHeight: 1.6 };
const quietTimes = ['15:10', '15:40', '16:10'];
const extras = [
  { id: 'library', Icon: LocalLibraryOutlinedIcon, duration: '15 min', title: 'A little library time', detail: 'A quiet corner. A book unrelated to work.', action: 'Save a library break', confirmation: 'Library break saved in this preview.' },
  { id: 'friend', Icon: VideoChatOutlinedIcon, duration: '15 min', title: 'A familiar face', detail: 'Make room for an online catch-up with a friend.', action: 'Set aside time', confirmation: 'Catch-up time set aside in this preview.' },
  { id: 'pause', Icon: LocalCafeOutlinedIcon, duration: '5 min', title: 'Just a small pause', detail: 'Step away from the screen. Stretch. Enjoy a drink.', action: 'Choose this pause', confirmation: 'A small pause chosen. Take it at your own pace.' },
];
function Confirmation({ children }) {
  return <Stack role="status" direction="row" spacing={0.75} alignItems="center"><CheckCircleOutlineRoundedIcon sx={{ fontSize: 18, color: 'var(--sd-accent-text)' }} /><Typography sx={caption}>{children}</Typography></Stack>;
}
function Card({ children, sx }) {
  return <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 1.25, ...sx }}>{children}</Paper>;
}

export default function RelaxSuggestions({ onReset }) {
  const [chosen, setChosen] = useState({});
  const [categoryId, setCategoryId] = useState(null);
  const category = categories.find(item => item.id === categoryId);
  const categoryIcons = [DirectionsWalkRoundedIcon, SelfImprovementRoundedIcon, VideoChatOutlinedIcon, DirectionsWalkRoundedIcon, LocalLibraryOutlinedIcon];
  const [quietTimeIndex, setQuietTimeIndex] = useState(0);
  const quietTime = quietTimes[quietTimeIndex];
  const choose = (id) => setChosen(current => ({ ...current, [id]: true }));
  return <Box component="section" aria-labelledby="relax-title" sx={{ width: '100%', maxWidth: 1000, mx: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden', bgcolor: 'var(--sd-surface-muted)' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ px: 2.5, py: 1.5, gap: 1, flexWrap: 'wrap' }}>
      <Typography id="relax-title" component="h2" sx={{ fontSize: 20, fontWeight: 500 }}>A little room to breathe</Typography>
      <Typography sx={{ ...caption, fontSize: 10 }}>Mock suggestions · bookings and messages are simulated</Typography>
    </Stack>
    <Box role="region" aria-label="Relax suggestions" tabIndex={0} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin', p: 1.5, pt: 0, '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: -2 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 1.25 }}>
        <Card>
          <Stack direction="row" spacing={1} alignItems="center"><DirectionsWalkRoundedIcon sx={{ color: 'var(--sd-accent-text)' }} /><Typography component="h3" sx={{ fontSize: 16, flex: 1 }}>Walk & talk</Typography><Chip size="small" variant="outlined" label="20 min" /></Stack>
          <Box component="svg" viewBox="0 0 420 132" role="img" aria-label="Illustrative walking loop from school, through the park, past a pond, and back to school. Not a real map." sx={{ width: '100%', height: 132, bgcolor: 'action.hover', borderRadius: 3 }}>
            <path d="M0 45 Q110 12 215 60 T420 28 M0 108 Q95 72 230 104 T420 90" fill="none" stroke="var(--sd-text-muted)" strokeOpacity="0.12" strokeWidth="12" />
            <ellipse cx="300" cy="67" rx="42" ry="24" fill="var(--sd-primary-soft)" />
            <path d="M66 88 C80 30 162 24 220 38 S353 90 277 108 S110 118 66 88" fill="none" stroke="var(--sd-chart)" strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
            <circle cx="66" cy="88" r="6" fill="var(--sd-chart)" /><circle cx="182" cy="33" r="4" fill="var(--sd-chart)" />
            <text x="35" y="73" fill="var(--sd-text)" fontSize="12">School</text><text x="168" y="21" fill="var(--sd-text)" fontSize="12">Park</text><text x="284" y="71" fill="var(--sd-text)" fontSize="12">Pond</text>
          </Box>
          <Typography sx={{ ...caption, fontSize: 10 }}>Illustrative route · an easy loop back to school</Typography>
          <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: 'var(--sd-primary-soft)', flexShrink: 0 }}>E</Box><Typography sx={caption}>Elin also has planning time. Invite her along?</Typography></Stack>
          <Box sx={{ mt: 'auto' }}>{chosen.walk ? <Confirmation>Demo: walk added to calendar and invitation to Elin simulated.</Confirmation> : <Button size="small" variant="contained" onClick={() => choose('walk')}>Add walk & invite Elin</Button>}</Box>
        </Card>
        <Card>
          <Stack direction="row" spacing={1} alignItems="center"><SelfImprovementRoundedIcon sx={{ color: 'var(--sd-accent-text)' }} /><Typography component="h3" sx={{ fontSize: 16, flex: 1 }}>A quiet room</Typography><Chip size="small" variant="outlined" label="10 min" /></Stack>
          <Box sx={{ minHeight: 125, display: 'grid', placeItems: 'center', py: 1 }}><Box sx={{ width: 112, height: 112, borderRadius: '50%', border: '1px solid', borderColor: 'divider', boxShadow: '0 0 0 14px var(--sd-primary-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 26, fontWeight: 450 }} aria-live="polite">{quietTime}</Typography><Typography sx={caption}>Today</Typography></Box></Box>
          <Typography sx={{ ...caption, textAlign: 'center' }}>A door closed. A moment with no demands.</Typography>
          <Stack spacing={0.75} alignItems="center" sx={{ mt: 'auto' }}>{chosen.quiet ? <Confirmation>Demo: quiet room booked at {quietTime} and calendar entry simulated.</Confirmation> : <><Button size="small" variant="outlined" onClick={() => choose('quiet')}>Book room & add to calendar</Button><Button size="small" color="inherit" onClick={() => setQuietTimeIndex(index => (index + 1) % quietTimes.length)}>Suggest another time</Button></>}</Stack>
        </Card>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.25, mt: 1.25 }}>
        {extras.map(({ id, Icon, duration, title, detail, action, confirmation }) => <Card key={id}>
          <Stack direction="row" justifyContent="space-between" alignItems="center"><Icon sx={{ fontSize: 28, color: 'var(--sd-accent-text)' }} /><Typography sx={caption}>{duration}</Typography></Stack>
          <Typography component="h3" sx={{ fontSize: 14, fontWeight: 550 }}>{title}</Typography><Typography sx={caption}>{detail}</Typography>
          <Box sx={{ mt: 'auto' }}>{chosen[id] ? <Confirmation>{confirmation}</Confirmation> : <Button size="small" color="inherit" onClick={() => choose(id)} sx={{ px: 0 }}>{action}</Button>}</Box>
        </Card>)}
      </Box>
      <Box component="section" aria-labelledby="relax-more-title" sx={{ mt: 2.5, mb: 0.5 }}>
        <Typography id="relax-more-title" component="h3" sx={{ fontSize: 15, fontWeight: 550, mb: 1 }}>Explore more · what feels right?</Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1.5 }}>
          {categories.map((item, index) => {
            const Icon = categoryIcons[index];
            return <Button key={item.id} size="small" variant={categoryId === item.id ? 'contained' : 'outlined'} startIcon={<Icon />} aria-pressed={categoryId === item.id} aria-controls="relax-more-ideas" onClick={() => setCategoryId(item.id)} sx={{ borderRadius: 6 }}>{item.label}</Button>;
          })}
        </Stack>
        <Box id="relax-more-ideas">
          {category ? <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography role="status" sx={caption}>{category.intro} · 4 more ideas</Typography>
              <Button size="small" color="inherit" onClick={() => setCategoryId(null)}>Show less</Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
              {category.ideas.map((idea, index) => {
                const id = `${category.id}-${index}`;
                const Icon = categoryIcons[categories.indexOf(category)];
                return <Card key={id}>
                  <Stack direction="row" spacing={1} alignItems="center"><Icon sx={{ color: 'var(--sd-accent-text)' }} /><Typography component="h4" sx={{ fontSize: 14, fontWeight: 550, flex: 1 }}>{idea.title}</Typography><Chip size="small" variant="outlined" label={idea.duration} /></Stack>
                  <Typography sx={caption}>{idea.detail}</Typography>
                  <Box sx={{ mt: 'auto' }}>{chosen[id] ? <Confirmation>Saved in this preview · {idea.duration} for you.</Confirmation> : <Button size="small" color="inherit" onClick={() => choose(id)} sx={{ px: 0 }}>Save this idea</Button>}</Box>
                </Card>;
              })}
            </Box>
          </> : <Typography sx={caption}>20 more ways to take a break. Pick a category to explore.</Typography>}
        </Box>
      </Box>
    </Box>
    <Stack direction="row" justifyContent="center" sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}><Button color="inherit" size="small" onClick={onReset}>Thanks</Button></Stack>
  </Box>;
}
