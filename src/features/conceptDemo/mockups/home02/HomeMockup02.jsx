import NavigationResponse from './NavigationResponse.jsx';
import chatResponses from './chatResponses.json';
import RelaxSuggestions from '../relax/RelaxSuggestions.jsx';
import TeacherSummary from '../summary/TeacherSummary.jsx';
import { useEffect, useRef, useState } from 'react';
import { Box, Button, ButtonBase, FormControlLabel, IconButton, InputBase, Paper, Stack, Switch, Tooltip, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import MicNoneRoundedIcon from '@mui/icons-material/MicNoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeToggle from '../../../../components/ColorModeToggle.jsx';
import DynamicGradientBackground from '../../media/DynamicGradientBackground/DynamicGradientBackground.jsx';
import { useConceptDemoLanguage } from '../../ConceptDemoLanguageContext.jsx';
import MathsSummary from '../home01/MathsSummary.jsx';
import { getMockReportRequest } from '../home01/mathsSummaryData.js';
import AmiraMathsReport from '../home01/AmiraMathsReport.jsx';
import PlanningOverview from '../home01/planning/PlanningOverview.jsx';

export default function HomeMockup02({ onBack, onOpenMathsModule, onOpenMentor, navigation }) {
  const { t, language } = useConceptDemoLanguage();
  const headingRef = useRef(null);
  const inputRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [navigationVisible, setNavigationVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const historyRef = useRef(null);
  const [voicePreview, setVoicePreview] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const summaryOpen = activeReport !== null;
  useEffect(() => {
    const log = historyRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [history]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);

  function submitDraft(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    if (/^thanks[.!]*$/i.test(text)) {
      resetConversation();
      return;
    }
    let nextReply;
    const requestedReport = /\b(nav|navigation)\b/i.test(text) ? 'navigation' : getMockReportRequest(text);
    if (requestedReport) {
      setActiveReport(requestedReport);
      nextReply = chatResponses[requestedReport];
    } else {
      nextReply = summaryOpen
        ? `I’m keeping ${activeReport === 'navigation' ? 'your workspace navigation' : activeReport === 'relax' ? 'your relax suggestions' : activeReport === 'summary' ? 'your daily summary' : activeReport === 'planning' ? 'the planning overview' : activeReport === 'amira' ? 'Amira’s report' : 'the class summary'} here. Try “nav”, “relax”, “summary”, “planning”, “Amira” or “8a maths” to switch views.`
        : 'Try “relax” for a break, “summary” for your day, “planning” for a timeline, “8a maths” for the class, or “Amira” for her maths report.';
    }
    setHistory(current => [...current, { user: text, assistant: nextReply }]);
    setDraft('');
    setVoicePreview(false);
    inputRef.current?.focus();
  }

  function resetConversation() {
    setActiveReport(null);
    setHistory([]);
    setDraft('');
    setVoicePreview(false);
    window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    window.scrollTo(0, 0);
  }

  return (
    <Box sx={{ position: 'relative', isolation: 'isolate', minHeight: summaryOpen ? 0 : '100svh', height: summaryOpen ? '100dvh' : 'auto', overflow: summaryOpen ? 'hidden' : 'visible', display: 'flex', flexDirection: 'column', color: 'text.primary' }}>
      <DynamicGradientBackground />
      <Box component="main" sx={{
        position: 'relative', zIndex: 1, flex: 1, minHeight: 0,
        overflow: summaryOpen ? 'hidden' : 'visible',
        display: summaryOpen ? 'grid' : 'flex', flexDirection: 'column',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(260px, 1fr) minmax(0, 2fr)' },
        gridTemplateRows: { xs: 'auto minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
        gap: summaryOpen ? { xs: 1.5, md: 3 } : 0,
        px: { xs: 2.5, sm: 3, lg: 4 }, pt: summaryOpen ? 2 : 0, pb: summaryOpen ? 1 : 0,
      }}>
        <Box component="section" aria-label={summaryOpen ? 'Chat or voice input' : undefined} aria-labelledby={summaryOpen ? undefined : 'home-mockup-02-chat-title'} sx={{
          display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0,
          justifyContent: 'flex-start',
          maxHeight: summaryOpen ? { xs: navigationVisible ? '48dvh' : '32dvh', md: 'none' } : 'none',
          overflowY: summaryOpen ? 'hidden' : 'visible', width: '100%',
          maxWidth: summaryOpen ? 'none' : 600, mx: 'auto',
          pr: summaryOpen ? { xs: 0, md: 3 } : 0,
          borderRight: summaryOpen ? { xs: 'none', md: '1px solid' } : 'none', borderColor: 'divider',
          pt: summaryOpen ? 0 : { xs: 8, sm: 'clamp(64px, 13vh, 150px)' }, pb: summaryOpen ? 0 : 8,
        }}>
          <Typography ref={headingRef} tabIndex={-1} id="home-mockup-02-chat-title" component="h1" sx={{ display: summaryOpen ? { xs: 'none', md: 'block' } : 'block', textAlign: summaryOpen ? 'left' : 'center', fontSize: summaryOpen ? 13 : { xs: 34, sm: 44 }, fontWeight: 450, letterSpacing: '-0.04em', lineHeight: 1.2, mb: summaryOpen ? 1.25 : 4, outline: 'none', transition: 'font-size 550ms ease, margin 550ms ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
            {summaryOpen ? "Chat / talk" : "How are you?"}
          </Typography>

          {history.length > 0 && (
            <Box ref={historyRef} role="log" aria-label="Chat history" aria-live="polite" aria-relevant="additions" tabIndex={0} sx={{
              flex: summaryOpen ? '1 1 auto' : '0 1 auto', minHeight: 0,
              maxHeight: summaryOpen ? 'none' : '40dvh', overflowY: 'auto',
              overscrollBehavior: 'contain', scrollbarWidth: 'thin', mb: 2, pr: 0.75,
              '&:focus-visible': { outline: '2px solid var(--sd-focus)', outlineOffset: -2, borderRadius: 2 },
            }}>
              <Stack spacing={2.5} sx={{ py: 0.5 }}>
                {history.map((turn, index) => (
                  <Stack key={index} spacing={1.25}>
                    <Box sx={{ alignSelf: 'flex-end', maxWidth: '90%' }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary', textAlign: 'right', mb: 0.5 }}>You</Typography>
                      <Paper elevation={0} sx={{ px: 1.75, py: 1.25, borderRadius: '16px 16px 4px 16px', bgcolor: 'var(--sd-primary-soft)' }}>
                        <Typography sx={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{turn.user}</Typography>
                      </Paper>
                    </Box>
                    <Box sx={{ alignSelf: 'flex-start', maxWidth: '95%' }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary', mb: 0.5 }}>SmartDesk · mock reply</Typography>
                      <Typography sx={{ fontSize: 14, lineHeight: 1.7, overflowWrap: 'anywhere' }}>{turn.assistant}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          <Paper component="form" onSubmit={submitDraft} elevation={0} sx={{ display: summaryOpen ? { xs: 'flex', md: 'block' } : 'block', flexWrap: 'wrap', flexShrink: 0, alignItems: 'center', gap: 1, borderRadius: summaryOpen ? '18px' : '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', px: { xs: 2, sm: 2.5 }, pt: summaryOpen ? { xs: 0.6, md: 2 } : 2, pb: summaryOpen ? { xs: 0.6, md: 1.2 } : 1.2, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.025)', '&:focus-within': { borderColor: 'var(--sd-focus)' } }}>
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
                placeholder={activeReport === 'navigation' ? 'Try summary, planning or relax…' : activeReport === 'relax' ? 'Ask more, or try summary or planning…' : activeReport === 'summary' ? 'Ask more, or try planning, 8a maths or Amira…' : activeReport === 'planning' ? "Try 8a maths or Amira to switch views…" : activeReport === 'amira' ? "Ask about Amira, or type 8a maths…" : summaryOpen ? "Try Amira, or ask about 8A maths…" : "What's on your mind?"}
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: summaryOpen ? { xs: 0, md: 1.5 } : 0.8, flexShrink: 0, width: '100%', gap: 0.5 }}>
              <ButtonBase onClick={() => setVoicePreview((current) => !current)} aria-pressed={voicePreview} aria-label={voicePreview ? 'Back to text' : 'Or just talk'} sx={{ gap: 0.7, px: 1, py: 1, borderRadius: 2, color: 'text.secondary', fontSize: 12, '&:hover': { bgcolor: 'action.hover' }, '&:focus-visible': { outline: '2px solid var(--sd-focus)' } }}>
                {voicePreview ? <CloseRoundedIcon sx={{ fontSize: 18 }} /> : <MicNoneRoundedIcon sx={{ fontSize: 18 }} />}
                {!summaryOpen && (voicePreview ? 'Back to text' : 'Or just talk')}
              </ButtonBase>
              {!voicePreview && (
                <IconButton type="submit" disabled={!draft.trim()} aria-label="Preview message" sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.hover', color: 'action.disabled' } }}>
                  <ArrowUpwardRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              <FormControlLabel
                className="mockup-nav-toggle"
                labelPlacement="end"
                label="Nav"
                control={<Switch size="small" checked={navigationVisible} onChange={(event) => setNavigationVisible(event.target.checked)} inputProps={{ 'aria-controls': 'mockup-02-navigation' }} sx={{
                  '& .MuiSwitch-switchBase': { color: 'var(--sd-text-muted)' },
                  '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--sd-text)' },
                  '& .MuiSwitch-track, & .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'var(--sd-text-muted)', opacity: 0.3 },
                  '& .MuiSwitch-switchBase:hover, & .MuiSwitch-switchBase.Mui-checked:hover': { bgcolor: 'action.hover' },
                }} />}
                sx={{ m: 0, ml: 'auto', gap: 0.5, opacity: 0, transition: 'opacity 180ms ease', '&:hover, &:focus-within': { opacity: 1 }, '@media (hover: none)': { opacity: 1 }, '@media (prefers-reduced-motion: reduce)': { transition: 'none' }, '& .MuiFormControlLabel-label': { fontSize: 11, color: 'text.secondary' } }}
              />
            </Stack>
          </Paper>
          {navigationVisible && <Box id="mockup-02-navigation" component="nav" aria-label={language === 'sv' ? 'Moduler' : 'Modules'} sx={{
            flexShrink: 0, maxHeight: summaryOpen ? { xs: '14dvh', md: '30dvh' } : 'none',
            overflowY: 'auto', scrollbarWidth: 'thin', mt: 1, pt: 1.5,
            borderTop: '1px solid', borderColor: 'divider',
          }}>{navigation}</Box>}
        </Box>
        {summaryOpen && <Box aria-label="Response" role="region" sx={{
          display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden',
          '& > section': { maxWidth: 'none' },
        }}>
        {activeReport === 'navigation' && <NavigationResponse navigation={navigation} onReset={resetConversation} />}
        {activeReport === 'relax' && <RelaxSuggestions onReset={resetConversation} />}
        {activeReport === 'summary' && <TeacherSummary onOpenMentor={onOpenMentor} onReset={resetConversation} />}
        {activeReport === 'class' && <MathsSummary />}
        {activeReport === 'amira' && <AmiraMathsReport />}
        {activeReport === 'planning' && <PlanningOverview />}
        {summaryOpen && !['summary', 'relax', 'navigation'].includes(activeReport) && (
          <Stack direction="row" justifyContent="center" spacing={1.5} role="group" aria-label="Report actions" sx={{ width: '100%', maxWidth: 820, mx: 'auto', flexShrink: 0, pt: 1.5, pb: 1 }}>
            <Button size="small" variant="contained" onClick={onOpenMathsModule} endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: 2.5, px: 2 }}>Open module</Button>
            <Button size="small" onClick={resetConversation} color="inherit" sx={{ borderRadius: 2.5, px: 2 }}>Thanks</Button>
          </Stack>
        )}
        </Box>}
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
