import { useEffect, useMemo, useRef, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { smartDeskDemoResponses } from '../data/smartDeskDemoResponses.js';
import { resolveLocalizedValue } from '../i18n/conceptDemoTranslations.js';
import { getContextWelcome } from '../utils/smartDeskContextUtils.js';

const purple = 'var(--sd-primary)';
const palePurple = 'var(--sd-primary-soft)';
const darkText = 'var(--sd-text)';
const border = 'rgba(var(--sd-text-rgb), 0.1)';
const smartDeskDrawerWidth = {
  xs: 'min(380px, calc(100vw - 20px))',
  sm: 420,
  md: 460,
  lg: 500,
  xl: 520,
};
const drawerEnterTransition = '980ms cubic-bezier(0.22, 1, 0.36, 1)';
const drawerExitTransition = '680ms cubic-bezier(0.4, 0, 1, 1)';
const drawerLanguage = 'en';

function localizeMessagePayload(payload) {
  if (!payload) {
    return payload;
  }

  return {
    ...payload,
    text: resolveLocalizedValue(payload.text, drawerLanguage),
    followUpText: resolveLocalizedValue(payload.followUpText, drawerLanguage),
    actions: payload.actions?.map((action) => ({
      ...action,
      label: resolveLocalizedValue(action.label, drawerLanguage),
    })) || [],
  };
}

function localizePrompt(prompt) {
  return {
    ...prompt,
    label: resolveLocalizedValue(prompt.label, drawerLanguage),
    userText: resolveLocalizedValue(prompt.userText, drawerLanguage),
    response: localizeMessagePayload(prompt.response),
  };
}

function makeAssistantMessage(response, id = `assistant-${Date.now()}`) {
  return {
    id,
    role: 'assistant',
    text: response.text,
    followUpText: response.followUpText,
    actions: response.actions || [],
  };
}

function matchPrompt(input, prompts) {
  const value = input.toLowerCase();

  if (value.includes('maths') || value.includes('mathematics')) {
    return prompts.find((prompt) => prompt.id === 'prepare-maths-7a');
  }

  if (value.includes('today')) {
    return prompts.find((prompt) => prompt.id === 'today-overview');
  }

  if (value.includes('follow-up') || value.includes('follow up') || value.includes('followups')) {
    return prompts.find((prompt) => prompt.id === 'show-follow-ups');
  }

  if (value.includes('week')) {
    return prompts.find((prompt) => prompt.id === 'week-overview');
  }

  return null;
}

function SmartDeskMessage({ message, onAction }) {
  const user = message.role === 'user';

  return (
    <Box sx={{ display: 'flex', justifyContent: user ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          minWidth: 0,
          maxWidth: '86%',
          borderRadius: user ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
          bgcolor: user ? palePurple : 'var(--sd-surface)',
          border: user ? '1px solid rgba(var(--sd-primary-rgb), 0.13)' : `1px solid ${border}`,
          px: 1.75,
          py: 1.35,
          boxShadow: user ? 'none' : '0 8px 24px rgba(24, 21, 26, 0.04)',
          overflowWrap: 'anywhere',
        }}
      >
        <Typography sx={{ color: darkText, fontSize: 14.5, lineHeight: 1.55 }}>
          {message.text}
        </Typography>
        {message.followUpText && (
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 14.2, lineHeight: 1.5 }}>
            {message.followUpText}
          </Typography>
        )}
        {!!message.actions?.length && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.2 }}>
            {message.actions.map((action) => (
              <Button
                key={action.id}
                size="small"
                variant="outlined"
                onClick={() => onAction?.(action.action)}
                sx={{
                  borderRadius: 999,
                  color: 'var(--sd-accent-text)',
                  borderColor: 'rgba(var(--sd-primary-rgb), 0.22)',
                  bgcolor: 'var(--sd-surface)',
                  maxWidth: '100%',
                  whiteSpace: 'normal',
                  '&:hover': { bgcolor: palePurple, borderColor: 'rgba(var(--sd-primary-rgb), 0.34)' },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function VoiceState({ onCancel }) {
  return (
    <Box
      aria-live="polite"
      sx={{
        borderRadius: '22px',
        border: '1px solid rgba(var(--sd-primary-rgb), 0.16)',
        bgcolor: palePurple,
        p: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 22 + index * 5,
                borderRadius: 999,
                bgcolor: purple,
                opacity: 0.35 + index * 0.18,
                animation: 'smartdeskWave 900ms ease-in-out infinite',
                animationDelay: `${index * 120}ms`,
                '@keyframes smartdeskWave': {
                  '0%, 100%': { transform: 'scaleY(0.62)' },
                  '50%': { transform: 'scaleY(1)' },
                },
              }}
            />
          ))}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: darkText, fontWeight: 850 }}>Listening...</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.8 }}>Demo voice interaction</Typography>
        </Box>
        <Button size="small" variant="text" onClick={onCancel} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}

function SmartDeskAttachedTab({ open, onOpen, onClose }) {
  return (
    <Button
      aria-label={open ? 'Close SmartDesk' : 'Open SmartDesk'}
      onClick={() => (open ? onClose?.() : onOpen?.())}
      sx={{
        position: 'fixed',
        right: open ? smartDeskDrawerWidth : 0,
        top: { xs: 'auto', md: '34%' },
        bottom: { xs: 78, md: 'auto' },
        transform: { md: 'translateY(-34%)' },
        zIndex: 1401,
        width: { xs: 112, md: 46 },
        minWidth: 0,
        maxWidth: { xs: 112, md: 46 },
        height: { xs: 42, md: 142 },
        borderRadius: { xs: '12px 0 0 12px', md: '12px 0 0 12px' },
        bgcolor: purple,
        color: 'var(--sd-on-primary)',
        boxShadow: '0 16px 34px rgba(var(--sd-primary-rgb), 0.18)',
        px: { xs: 1.35, md: 0.7 },
        py: { xs: 0.9, md: 1.2 },
        transition: open
          ? `right ${drawerEnterTransition}`
          : `right ${drawerExitTransition}`,
        '&:hover': {
          bgcolor: 'var(--sd-primary-hover)',
        },
      }}
    >
      <Stack direction={{ xs: 'row', md: 'column' }} spacing={0.75} alignItems="center">
        <AutoAwesomeIcon sx={{ fontSize: 18 }} />
        <Typography
          component="span"
          sx={{
            color: 'inherit',
            fontSize: 13.5,
            fontWeight: 850,
            lineHeight: 1,
            writingMode: { md: 'vertical-rl' },
            transform: { md: 'rotate(180deg)' },
          }}
        >
          SmartDesk
        </Typography>
      </Stack>
    </Button>
  );
}

export default function SmartDeskDrawer({
  open,
  onOpen,
  onClose,
  initialMode = 'text',
  context,
  onAction,
}) {
  const responseSet = smartDeskDemoResponses.home;
  const prompts = useMemo(
    () => responseSet.suggestedPrompts.map(localizePrompt),
    [responseSet.suggestedPrompts],
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const timersRef = useRef([]);
  const endRef = useRef(null);

  const welcomeMessage = useMemo(() => ({
    ...responseSet.welcome,
    text: getContextWelcome(context, resolveLocalizedValue(responseSet.welcome.text, drawerLanguage)),
  }), [context, responseSet.welcome]);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function queueTimer(callback, delay) {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  }

  function resetConversation(mode = 'text') {
    clearTimers();
    setMessages([welcomeMessage]);
    setInput('');
    setThinking(false);
    setListening(false);
    setSuggestionsVisible(true);

    if (mode === 'voice') {
      startVoiceDemo();
    }
  }

  function addResponseForPrompt(prompt) {
    setMessages((current) => [...current, makeAssistantMessage(prompt.response, `assistant-${prompt.id}-${Date.now()}`)]);
    setThinking(false);
  }

  function submitPrompt(prompt) {
    setSuggestionsVisible(false);
    setMessages((current) => [...current, { id: `user-${prompt.id}-${Date.now()}`, role: 'user', text: prompt.userText }]);
    setThinking(true);
    queueTimer(() => addResponseForPrompt(prompt), 720);
  }

  function submitText() {
    const text = input.trim();

    if (!text) {
      return;
    }

    const matchedPrompt = matchPrompt(text, prompts);
    setInput('');
    setSuggestionsVisible(false);
    setMessages((current) => [...current, { id: `user-text-${Date.now()}`, role: 'user', text }]);
    setThinking(true);
    queueTimer(() => {
      if (matchedPrompt) {
        addResponseForPrompt(matchedPrompt);
      } else {
        setMessages((current) => [...current, makeAssistantMessage(localizeMessagePayload(responseSet.fallback), `fallback-${Date.now()}`)]);
        setThinking(false);
      }
    }, 680);
  }

  function startVoiceDemo() {
    clearTimers();
    setSuggestionsVisible(false);
    setListening(true);
    setThinking(false);

    queueTimer(() => {
      const voicePrompt = prompts.find((prompt) => prompt.id === responseSet.voiceDemo.responsePromptId);
      setListening(false);
      setMessages((current) => [
        ...current,
        {
          id: `voice-transcript-${Date.now()}`,
          role: 'user',
          text: resolveLocalizedValue(responseSet.voiceDemo.transcript, drawerLanguage),
        },
      ]);
      setThinking(true);
      queueTimer(() => voicePrompt && addResponseForPrompt(voicePrompt), 820);
    }, 1800);
  }

  function cancelVoiceDemo() {
    clearTimers();
    setListening(false);
    setThinking(false);
  }

  function handleAction(actionName) {
    onAction?.(actionName);
  }

  useEffect(() => {
    if (open) {
      resetConversation(initialMode);
    } else {
      clearTimers();
    }

    return clearTimers;
  }, [open, initialMode, welcomeMessage]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, thinking, listening]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      <SmartDeskAttachedTab open={open} onOpen={onOpen} onClose={onClose} />
      <Box
        aria-hidden={!open}
        onClick={onClose}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1390,
          bgcolor: 'rgba(var(--sd-text-rgb), 0.42)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: open
            ? `opacity ${drawerEnterTransition}`
            : `opacity ${drawerExitTransition}`,
        }}
      />
      <Box
        role="dialog"
        aria-modal={open}
        aria-label="Ask SmartDesk"
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 1400,
          inlineSize: smartDeskDrawerWidth,
          minInlineSize: smartDeskDrawerWidth,
          maxInlineSize: smartDeskDrawerWidth,
          blockSize: '100dvh',
          bgcolor: 'var(--sd-surface)',
          borderLeft: `1px solid ${border}`,
          boxShadow: '-18px 0 54px rgba(24, 21, 26, 0.12)',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: open
            ? `transform ${drawerEnterTransition}`
            : `transform ${drawerExitTransition}`,
        }}
      >
        <Box sx={{ width: '100%', minWidth: 0, height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', overflowX: 'hidden' }}>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${border}` }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <IconButton
              aria-label="Start demo voice interaction"
              onClick={startVoiceDemo}
              sx={{
                width: 42,
                height: 42,
                color: 'var(--sd-accent-text)',
                border: '1px solid rgba(var(--sd-primary-rgb), 0.18)',
                bgcolor: 'var(--sd-surface)',
                '&:hover': { bgcolor: palePurple },
              }}
            >
              <MicIcon />
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: darkText, fontSize: 22, fontWeight: 850 }}>
                Ask SmartDesk
              </Typography>
              <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13.5 }}>
                {context?.dayLabel || 'Today'} · {context?.currentTime || '--:--'} · {context?.screen || 'Home'}
              </Typography>
            </Box>
            <IconButton aria-label="Close SmartDesk" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={1.4} sx={{ minWidth: 0, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', px: 2.5, py: 2.25 }}>
          {messages.map((message) => (
            <SmartDeskMessage key={message.id} message={message} onAction={handleAction} />
          ))}

          {suggestionsVisible && (
            <Stack spacing={0.85} sx={{ mt: 0.5 }}>
              {prompts.map((prompt) => (
                <Button
                  key={prompt.id}
                  variant="outlined"
                  onClick={() => submitPrompt(prompt)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderRadius: '16px',
                    px: 1.5,
                    py: 1.15,
                    color: darkText,
                    borderColor: 'rgba(var(--sd-text-rgb), 0.11)',
                    bgcolor: 'var(--sd-surface)',
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                    '&:hover': { bgcolor: palePurple, borderColor: 'rgba(var(--sd-primary-rgb), 0.24)' },
                  }}
                >
                  {prompt.label}
                </Button>
              ))}
            </Stack>
          )}

          {listening && <VoiceState onCancel={cancelVoiceDemo} />}

          {thinking && (
            <Stack direction="row" spacing={1} alignItems="center" aria-live="polite" sx={{ color: 'text.secondary', px: 0.5 }}>
              <CircularProgress size={16} sx={{ color: 'var(--sd-accent-text)' }} />
              <Typography sx={{ fontSize: 13.5 }}>SmartDesk is looking at your workspace...</Typography>
            </Stack>
          )}
          <Box ref={endRef} />
        </Stack>

        <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${border}`, bgcolor: 'rgba(var(--sd-surface-rgb), 0.96)' }}>
          <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ minWidth: 0 }}>
            <IconButton
              aria-label="Start demo voice interaction"
              onClick={startVoiceDemo}
              sx={{ color: 'var(--sd-accent-text)', border: '1px solid rgba(var(--sd-primary-rgb), 0.16)', mb: 0.2 }}
            >
              <MicIcon />
            </IconButton>
            <TextField
              label="Ask SmartDesk"
              placeholder="Ask about your day, classes or notes..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(keyboardEvent) => {
                if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
                  keyboardEvent.preventDefault();
                  submitText();
                }
              }}
              fullWidth
              size="small"
              sx={{ minWidth: 0 }}
            />
            <IconButton aria-label="Send message" disabled={!input.trim()} onClick={submitText} sx={{ color: 'var(--sd-accent-text)', mb: 0.2 }}>
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
        </Box>
      </Box>
    </>
  );
}
