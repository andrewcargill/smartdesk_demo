import RelaxSuggestions from '../relax/RelaxSuggestions.jsx';
import TeacherSummary from '../summary/TeacherSummary.jsx';
import { useEffect, useRef, useState } from 'react';
import { Box, Button, ButtonBase, IconButton, InputBase, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import MicNoneRoundedIcon from '@mui/icons-material/MicNoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeToggle from '../../../../components/ColorModeToggle.jsx';
import DynamicGradientBackground from '../../media/DynamicGradientBackground/DynamicGradientBackground.jsx';
import { useConceptDemoLanguage } from '../../ConceptDemoLanguageContext.jsx';
import MathsSummary from './MathsSummary.jsx';
import { getMockReportRequest } from './mathsSummaryData.js';
import AmiraMathsReport from './AmiraMathsReport.jsx';
import PlanningOverview from './planning/PlanningOverview.jsx';

// Illustrative moments only; this view does not read or write live demo data.
const moments = [
  { label: 'A note', when: 'Yesterday', detail: 'A thought you saved.', past: true },
  { label: 'Last lesson', when: 'Earlier', detail: 'A moment to look back on.', past: true },
  { label: 'Now', when: '', detail: 'A little space to check in.', current: true },
  { label: 'Next lesson', when: 'Later', detail: 'Something coming up next.' },
  { label: 'A plan', when: 'Tomorrow', detail: 'An idea for another day.' },
];

export default function HomeMockup01({ onBack, onOpenMathsModule, onOpenMentor }) {
  const { t } = useConceptDemoLanguage();
  const headingRef = useRef(null);
  const inputRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const [voicePreview, setVoicePreview] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const summaryOpen = activeReport !== null;
  const [reply, setReply] = useState('');

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);

  function submitDraft(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    setMessage(text);
    const requestedReport = getMockReportRequest(text);
    if (requestedReport) {
      setActiveReport(requestedReport);
      setReply(requestedReport === 'relax'
        ? 'Here are a few ways to take a little space for yourself. All booking and contact actions are previews.'
        : requestedReport === 'summary'
        ? 'Here’s your day at a glance: teaching readiness, tasks and follow-ups.'
        : requestedReport === 'planning'
        ? 'Here’s a planning overview. Select a week or activity to explore and edit this mock plan.'
        : requestedReport === 'amira'
        ? 'Here’s Amira’s maths snapshot. Her reasoning is getting clearer.'
        : 'Here’s a quick look at 8A maths. Try “Amira” for her maths report.');
    } else {
      setReply(summaryOpen
        ? `I’m keeping ${activeReport === 'relax' ? 'your relax suggestions' : activeReport === 'summary' ? 'your daily summary' : activeReport === 'planning' ? 'the planning overview' : activeReport === 'amira' ? 'Amira’s report' : 'the class summary'} here. Try “relax”, “summary”, “planning”, “Amira” or “8a maths” to switch views.`
        : 'Try “relax” for a break, “summary” for your day, “planning” for a timeline, “8a maths” for the class, or “Amira” for her maths report.');
    }
    setDraft('');
    setVoicePreview(false);
    inputRef.current?.focus();
  }

  function resetConversation() {
    setActiveReport(null);
    setMessage('');
    setReply('');
    setDraft('');
    setVoicePreview(false);
    window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    window.scrollTo(0, 0);
  }

  return (
    <Box sx={{ position: 'relative', isolation: 'isolate', minHeight: summaryOpen ? 0 : '100svh', height: summaryOpen ? '100dvh' : 'auto', overflow: summaryOpen ? 'hidden' : 'visible', display: 'flex', flexDirection: 'column', color: 'text.primary' }}>
      <DynamicGradientBackground />
      <Box component="main" sx={{ position: 'relative', zIndex: 1, flex: 1, minHeight: 0, overflow: summaryOpen ? 'hidden' : 'visible', display: 'flex', flexDirection: 'column', px: { xs: 2.5, sm: 5 } }}>
        <Box component="section" aria-label="Past, now and future" hidden={summaryOpen} sx={{ display: summaryOpen ? 'none' : 'block', width: '100%', flexShrink: 0, maxWidth: summaryOpen ? 660 : 900, mx: 'auto', pt: summaryOpen ? 1 : { xs: 5, sm: 7 }, pb: summaryOpen ? 0 : 2, transition: 'max-width 550ms ease, padding 550ms ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', px: { xs: 1, sm: 3 }, mb: 0.5 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11 }}>Past</Typography>
            <Typography sx={{ textAlign: 'center', fontSize: 12, fontWeight: 650 }}>Now</Typography>
            <Typography sx={{ textAlign: 'right', color: 'text.secondary', fontSize: 11 }}>Future</Typography>
          </Box>
          <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
            <Box aria-hidden="true" sx={{ position: 'absolute', top: 21, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(var(--sd-text-rgb), 0.18) 20%, rgba(var(--sd-text-rgb), 0.18) 80%, transparent)' }} />
            {moments.map((moment) => (
              <Box key={moment.label} sx={{ textAlign: 'center', minWidth: 0 }}>
                <Tooltip title={moment.detail} arrow>
                  <Box
                    component="span"
                    tabIndex={0}
                    aria-label={[moment.when, moment.label, moment.detail].filter(Boolean).join('. ')}
                    sx={{ position: 'relative', mx: 'auto', width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: '50%', '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: 2 } }}
                  >
                    <Box sx={{ width: moment.current ? 13 : 7, height: moment.current ? 13 : 7, borderRadius: '50%', bgcolor: moment.current ? 'primary.main' : moment.past ? 'text.secondary' : 'background.paper', border: moment.current ? 'none' : '1px solid', borderColor: 'text.secondary', boxShadow: moment.current ? '0 0 0 6px rgba(var(--sd-primary-rgb), 0.09)' : 'none' }} />
                  </Box>
                </Tooltip>
                {!moment.current && (
                  <>
                    <Typography sx={{ fontSize: { xs: 10, sm: 12 }, lineHeight: 1.5, color: 'text.secondary' }}>{moment.label}</Typography>
                    <Typography sx={{ mt: summaryOpen ? 0 : 0.4, maxHeight: summaryOpen ? 0 : 20, opacity: summaryOpen ? 0 : 1, overflow: 'hidden', transition: 'max-height 550ms ease, opacity 350ms ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' }, fontSize: { xs: 9, sm: 10 }, color: 'text.secondary' }}>{moment.when}</Typography>
                  </>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="section" aria-label={summaryOpen ? 'Chat or voice input' : undefined} aria-labelledby={summaryOpen ? undefined : 'home-mockup-chat-title'} sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0, maxHeight: summaryOpen ? '44dvh' : 'none', overflowY: summaryOpen ? 'auto' : 'visible', width: '100%', maxWidth: summaryOpen ? 820 : 600, mx: 'auto', mt: summaryOpen ? 2 : 0, mb: summaryOpen ? 2 : 0, pt: summaryOpen ? 0 : { xs: 8, sm: 'clamp(64px, 13vh, 150px)' }, pb: summaryOpen ? 0 : 8, transition: 'padding 550ms ease, max-width 550ms ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
          <Typography ref={headingRef} tabIndex={-1} id="home-mockup-chat-title" component="h1" sx={{ display: summaryOpen ? 'none' : 'block', textAlign: 'center', fontSize: summaryOpen ? 13 : { xs: 34, sm: 44 }, fontWeight: 450, letterSpacing: '-0.04em', lineHeight: 1.2, mb: summaryOpen ? 1.25 : 4, outline: 'none', transition: 'font-size 550ms ease, margin 550ms ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
            {summaryOpen ? "Chat / talk" : "How are you?"}
          </Typography>

          {message && !summaryOpen && (
            <Box aria-live="polite" sx={{ mb: summaryOpen ? 1 : 2.5, alignSelf: 'flex-end', maxWidth: '85%' }}>
              <Paper elevation={0} sx={{ px: 2.2, py: summaryOpen ? 0.7 : 1.5, borderRadius: '20px 20px 4px 20px', bgcolor: 'var(--sd-primary-soft)' }}>
                <Typography sx={{ fontSize: summaryOpen ? 12 : 14, lineHeight: 1.5, maxHeight: summaryOpen ? 40 : 'none', overflowY: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message}</Typography>
              </Paper>
              {!summaryOpen && <Typography sx={{ mt: 0.6, textAlign: 'right', fontSize: 10, color: 'text.secondary' }}>Preview only</Typography>}
            </Box>
          )}

          {reply && (
            <Typography role="status" sx={summaryOpen
              ? { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }
              : { fontSize: 13, color: 'text.secondary', lineHeight: 1.5, mb: 1 }
            }>{reply}</Typography>
          )}

          <Paper component="form" onSubmit={submitDraft} elevation={0} sx={{ display: summaryOpen ? 'flex' : 'block', flexShrink: 0, alignItems: 'center', gap: 1, borderRadius: summaryOpen ? '18px' : '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', px: { xs: 2, sm: 2.5 }, pt: summaryOpen ? 0.6 : 2, pb: summaryOpen ? 0.6 : 1.2, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.025)', '&:focus-within': { borderColor: 'var(--sd-focus)' } }}>
            {voicePreview ? (
              <Stack role="status" spacing={1} alignItems="center" justifyContent="center" sx={{ minHeight: summaryOpen ? 40 : 68 }}>
                <Stack aria-hidden="true" direction="row" spacing={0.55} alignItems="center" sx={{ height: 26 }}>
                  {[8, 15, 23, 13, 26, 17, 10, 20, 12].map((height, index) => <Box key={index} sx={{ width: 3, height, borderRadius: 2, bgcolor: 'var(--sd-chart)' }} />)}
                </Stack>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Voice preview · microphone is off</Typography>
              </Stack>
            ) : (
              <InputBase
                inputRef={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={activeReport === 'relax' ? 'Ask more, or try summary or planning…' : activeReport === 'summary' ? 'Ask more, or try planning, 8a maths or Amira…' : activeReport === 'planning' ? "Try 8a maths or Amira to switch views…" : activeReport === 'amira' ? "Ask about Amira, or type 8a maths…" : summaryOpen ? "Try Amira, or ask about 8A maths…" : "What's on your mind?"}
                multiline
                minRows={summaryOpen ? 1 : 2}
                maxRows={summaryOpen ? 2 : 5}
                fullWidth
                inputProps={{ 'aria-label': 'Message', maxLength: 2000 }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submitDraft(event);
                }}
                sx={{ flex: 1, minWidth: 0, fontSize: summaryOpen ? 14 : 15, lineHeight: 1.7, color: 'text.primary', '& textarea::placeholder': { color: 'text.secondary', opacity: 1 } }}
              />
            )}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: summaryOpen ? 0 : 0.8, flexShrink: 0 }}>
              <ButtonBase onClick={() => setVoicePreview((current) => !current)} aria-pressed={voicePreview} aria-label={voicePreview ? 'Back to text' : 'Or just talk'} sx={{ gap: 0.7, px: 1, py: 1, borderRadius: 2, color: 'text.secondary', fontSize: 12, '&:hover': { bgcolor: 'action.hover' }, '&:focus-visible': { outline: '2px solid var(--sd-focus)' } }}>
                {voicePreview ? <CloseRoundedIcon sx={{ fontSize: 18 }} /> : <MicNoneRoundedIcon sx={{ fontSize: 18 }} />}
                {!summaryOpen && (voicePreview ? 'Back to text' : 'Or just talk')}
              </ButtonBase>
              {!voicePreview && (
                <IconButton type="submit" disabled={!draft.trim()} aria-label="Preview message" sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.hover', color: 'action.disabled' } }}>
                  <ArrowUpwardRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Stack>
          </Paper>
        </Box>
        {activeReport === 'relax' && <RelaxSuggestions onReset={resetConversation} />}
        {activeReport === 'summary' && <TeacherSummary onOpenMentor={onOpenMentor} onReset={resetConversation} />}
        {activeReport === 'class' && <MathsSummary />}
        {activeReport === 'amira' && <AmiraMathsReport />}
        {activeReport === 'planning' && <PlanningOverview />}
        {summaryOpen && !['summary', 'relax'].includes(activeReport) && (
          <Stack direction="row" justifyContent="center" spacing={1.5} role="group" aria-label="Report actions" sx={{ width: '100%', maxWidth: 820, mx: 'auto', flexShrink: 0, pt: 1.5, pb: 1 }}>
            <Button size="small" variant="contained" onClick={onOpenMathsModule} endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: 2.5, px: 2 }}>Open module</Button>
            <Button size="small" onClick={resetConversation} color="inherit" sx={{ borderRadius: 2.5, px: 2 }}>Thanks</Button>
          </Stack>
        )}
      </Box>

      <Stack component="nav" direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 4 }, pb: summaryOpen ? 0.5 : 2, flexShrink: 0, color: 'text.secondary' }}>
        <Tooltip title={t('home.backFromMockup')}>
          <IconButton onClick={onBack} aria-label={t('home.backFromMockup')} color="inherit"><ArrowBackRoundedIcon sx={{ fontSize: 20 }} /></IconButton>
        </Tooltip>
        <ColorModeToggle darkLabel={t('common.switchToDarkMode')} lightLabel={t('common.switchToLightMode')} />
      </Stack>
    </Box>
  );
}
