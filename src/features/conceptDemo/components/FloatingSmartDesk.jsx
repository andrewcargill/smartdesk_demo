import { useEffect, useMemo, useRef, useState } from 'react';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import SendIcon from '@mui/icons-material/Send';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useConceptDemoLanguage } from '../ConceptDemoLanguageContext.jsx';
import { smartDeskDemoResponses } from '../data/smartDeskDemoResponses.js';
import { resolveLocalizedValue } from '../i18n/conceptDemoTranslations.js';

const purple = '#9c28af';
const darkPurple = '#842194';
const palePurple = '#fbf5fd';
const warningAmber = '#9a5b00';
const warningPale = '#fff8e8';
const darkText = '#18151a';
const border = 'rgba(24, 21, 26, 0.1)';
const expandedWidth = 260;
const collapsedWidth = expandedWidth;
const homePosition = { x: 1317, y: 22 };
const purpleCrosshairCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 25 25'%3E%3Cpath d='M12.5 2v21M2 12.5h21' stroke='%239c28af' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='12.5' cy='12.5' r='3.2' fill='none' stroke='%239c28af' stroke-width='1.5'/%3E%3C/svg%3E") 12 12, crosshair`;

function getDefaultPosition() {
  return homePosition;
}

function clampPosition(position, expanded) {
  if (typeof window === 'undefined') {
    return position;
  }

  const width = expanded ? expandedWidth : collapsedWidth;
  const height = expanded ? Math.min(300, window.innerHeight - 24) : 56;

  return {
    x: Math.min(Math.max(12, position.x), Math.max(12, window.innerWidth - width - 12)),
    y: Math.min(Math.max(12, position.y), Math.max(12, window.innerHeight - height - 12)),
  };
}

function formatContextValue(value) {
  if (value == null || value === '') {
    return null;
  }

  if (typeof value === 'object') {
    return value.title || value.label || value.name || null;
  }

  return String(value);
}

function getLocalizedSubjectTitle(subjectId, fallbackTitle, t) {
  const translatedTitle = t(`subjects.${subjectId}`);
  return translatedTitle === `subjects.${subjectId}` ? fallbackTitle : translatedTitle;
}

function localizeMessagePayload(payload, language) {
  if (!payload) {
    return payload;
  }

  return {
    ...payload,
    text: resolveLocalizedValue(payload.text, language),
    followUpText: resolveLocalizedValue(payload.followUpText, language),
    actions: payload.actions?.map((action) => ({
      ...action,
      label: resolveLocalizedValue(action.label, language),
    })) || [],
  };
}

function localizePrompt(prompt, language) {
  return {
    ...prompt,
    label: resolveLocalizedValue(prompt.label, language),
    userText: resolveLocalizedValue(prompt.userText, language),
    response: localizeMessagePayload(prompt.response, language),
  };
}

function getLocalizedContextLabel(context, t) {
  if (context?.screen === 'Home') {
    return t('floatingSmartDesk.contextHome');
  }

  return formatContextValue(context?.screen) || t('floatingSmartDesk.thisContext');
}

function getLocalizedWelcomeText(context, fallbackText, language, t) {
  if (!context?.nextEvent) {
    return resolveLocalizedValue(fallbackText, language);
  }

  return t('floatingSmartDesk.contextWelcome', {
    teacherName: context.teacherName || 'Anna',
    title: getLocalizedSubjectTitle(context.nextEvent.subjectId, context.nextEvent.title, t),
    className: context.nextEvent.className,
    start: context.nextEvent.start,
  });
}

function getPointerPoint(event) {
  const point = event.changedTouches?.[0] || event.touches?.[0] || event;

  return {
    x: point.clientX,
    y: point.clientY,
  };
}

function getHotspotCapture(element, t) {
  const hotspotElement = element?.closest?.('[data-smartdesk-hotspot]');
  const hotspotId = hotspotElement?.dataset?.smartdeskHotspot;
  const subjectTitle = hotspotElement?.dataset?.smartdeskSubjectTitle || hotspotElement?.dataset?.smartdeskSubjectId || 'this subject';

  if (hotspotId === 'mathematics-bubble') {
    return {
      text: 'You have 4 maths classes. You have a test coming up for 8A that is not prepared.',
      followUpText: '',
    };
  }

  if (hotspotId === 'elias-student-row') {
    if (hotspotElement?.dataset?.smartdeskSubjectId === 'physical-education') {
      return {
        text: t('floatingSmartDesk.eliasTargetPhysicalEducationText', { subjectTitle }),
        followUpText: t('floatingSmartDesk.eliasTargetPhysicalEducationFollowUp'),
      };
    }

    return {
      text: t('floatingSmartDesk.eliasTargetSubjectText', { subjectTitle }),
      followUpText: t('floatingSmartDesk.eliasTargetSubjectFollowUp'),
    };
  }

  return null;
}

function describeCapturedElement(element, t) {
  const hotspotCapture = getHotspotCapture(element, t);

  if (hotspotCapture) {
    return hotspotCapture;
  }

  if (!element) {
    return {
      text: t('floatingSmartDesk.noCaptureText'),
      followUpText: t('floatingSmartDesk.noCaptureFollowUp'),
    };
  }

  const smartDeskElement = element.closest?.('[data-smartdesk-hotspot], [data-smartdesk-id], [data-smartdesk-type], [data-smartdesk-label]') || element;
  const tagName = smartDeskElement.tagName?.toLowerCase() || 'element';
  const role = smartDeskElement.getAttribute?.('role');
  const dataType = smartDeskElement.dataset?.smartdeskType;
  const dataId = smartDeskElement.dataset?.smartdeskId;
  const dataLabel = smartDeskElement.dataset?.smartdeskLabel;
  const ariaLabel = smartDeskElement.getAttribute?.('aria-label');
  const title = smartDeskElement.getAttribute?.('title');
  const textContent = smartDeskElement.textContent?.replace(/\s+/g, ' ').trim();
  const label = dataLabel || ariaLabel || title || textContent || smartDeskElement.id || tagName;
  const type = dataType || role || tagName;
  const details = [
    dataId ? `id: ${dataId}` : null,
    tagName ? `tag: ${tagName}` : null,
    role ? `role: ${role}` : null,
  ].filter(Boolean).join(' · ');

  return {
    text: t('floatingSmartDesk.capturedText', { type, label: label.slice(0, 90) }),
    followUpText: details || t('floatingSmartDesk.noStructuredIdentifier'),
  };
}

function makeAssistantMessage(response, id = `assistant-${Date.now()}`) {
  return {
    id,
    role: 'assistant',
    type: response.type,
    text: response.text,
    followUpText: response.followUpText,
    actions: response.actions || [],
  };
}

function containsDirectStudentName(input) {
  return /\beli(?:as|sa)\b/i.test(input);
}

function redactDirectStudentNames(input) {
  return input.replace(/\beli(?:as|sa)\b/gi, '[student name]');
}

function matchPrompt(input, prompts) {
  const value = input.toLowerCase();

  if (value.includes('maths') || value.includes('mathematics') || value.includes('matematik')) {
    return prompts.find((prompt) => prompt.id === 'prepare-maths-7a');
  }

  if (value.includes('today') || value.includes('idag')) {
    return prompts.find((prompt) => prompt.id === 'today-overview');
  }

  if (
    value.includes('follow-up')
    || value.includes('follow up')
    || value.includes('followups')
    || value.includes('uppfolj')
    || value.includes('uppfölj')
  ) {
    return prompts.find((prompt) => prompt.id === 'show-follow-ups');
  }

  if (value.includes('week') || value.includes('vecka') || value.includes('veckan')) {
    return prompts.find((prompt) => prompt.id === 'week-overview');
  }

  return null;
}

function FloatingMessage({ message, t }) {
  const user = message.role === 'user';
  const warning = message.type === 'student-name-warning';

  return (
    <Box sx={{ display: 'flex', justifyContent: user ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          minWidth: 0,
          maxWidth: '92%',
          borderRadius: user ? '15px 15px 5px 15px' : '15px 15px 15px 5px',
          bgcolor: warning ? warningPale : user ? palePurple : '#fff',
          border: warning
            ? '1px solid rgba(154, 91, 0, 0.18)'
            : user ? '1px solid rgba(156, 40, 175, 0.13)' : `1px solid ${border}`,
          px: 1.15,
          py: 0.9,
          boxShadow: user ? 'none' : '0 7px 18px rgba(24, 21, 26, 0.04)',
          overflowWrap: 'anywhere',
        }}
      >
        {message.type === 'capture' && (
          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.55 }}>
            <AdsClickIcon sx={{ color: purple, fontSize: 14 }} />
            <Typography sx={{ color: purple, fontSize: 10.8, fontWeight: 850, lineHeight: 1 }}>
              {t('floatingSmartDesk.capturedContext')}
            </Typography>
          </Stack>
        )}
        {warning && (
          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.55 }}>
            <WarningAmberIcon sx={{ color: warningAmber, fontSize: 14 }} />
            <Typography sx={{ color: warningAmber, fontSize: 10.8, fontWeight: 850, lineHeight: 1 }}>
              {t('floatingSmartDesk.studentNameWarningTitle')}
            </Typography>
          </Stack>
        )}
        <Typography sx={{ color: darkText, fontSize: 12.1, lineHeight: 1.42 }}>
          {message.text}
        </Typography>
        {message.followUpText && (
          <Typography sx={{ mt: 0.55, color: 'text.secondary', fontSize: 11.8, lineHeight: 1.38 }}>
            {message.followUpText}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function FloatingVoiceState({ t }) {
  return (
    <Box
      aria-live="polite"
      sx={{
        borderRadius: '14px',
        border: '1px solid rgba(156, 40, 175, 0.16)',
        bgcolor: palePurple,
        px: 1,
        py: 0.8,
      }}
    >
      <Stack direction="row" spacing={0.85} alignItems="center">
        <MicIcon sx={{ color: purple, fontSize: 16 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 4,
                height: 12 + index * 3,
                borderRadius: 999,
                bgcolor: purple,
                opacity: 0.35 + index * 0.18,
                animation: 'floatingSmartDeskWave 900ms ease-in-out infinite',
                animationDelay: `${index * 120}ms`,
                '@keyframes floatingSmartDeskWave': {
                  '0%, 100%': { transform: 'scaleY(0.62)' },
                  '50%': { transform: 'scaleY(1)' },
                },
              }}
            />
          ))}
        </Box>
        <Typography sx={{ color: darkText, fontSize: 11.7, fontWeight: 750 }}>
          {t('floatingSmartDesk.listening')}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function FloatingSmartDesk({ context }) {
  const { language, t } = useConceptDemoLanguage();
  const responseSet = smartDeskDemoResponses.home;
  const prompts = useMemo(
    () => responseSet.suggestedPrompts.map((prompt) => localizePrompt(prompt, language)),
    [language, responseSet.suggestedPrompts],
  );
  const voiceDemo = useMemo(() => ({
    ...responseSet.voiceDemo,
    transcript: resolveLocalizedValue(responseSet.voiceDemo.transcript, language),
  }), [language, responseSet.voiceDemo]);
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState(() => getDefaultPosition());
  const [returningHome, setReturningHome] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [selectingContext, setSelectingContext] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const rootRef = useRef(null);
  const dragRef = useRef(null);
  const contextSelectionRef = useRef(null);
  const contextIconPointerStartedRef = useRef(false);
  const suppressContextIconClickRef = useRef(false);
  const suppressHeaderClickRef = useRef(false);
  const timersRef = useRef([]);
  const endRef = useRef(null);

  const welcomeMessage = {
    ...responseSet.welcome,
    text: getLocalizedWelcomeText(context, responseSet.welcome.text, language, t),
  };

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function resetConversation() {
    clearTimers();
    setMessages([welcomeMessage]);
    setInput('');
    setThinking(false);
    setListening(false);
    setSelectingContext(false);
    setSuggestionsVisible(true);
  }

  function queueTimer(callback, delay) {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
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

  function submitText(value = input) {
    const text = value.trim();

    if (!text) {
      return;
    }

    const includesStudentName = containsDirectStudentName(text);
    const matchedPrompt = matchPrompt(text, prompts);
    setInput('');
    setSuggestionsVisible(false);

    if (includesStudentName) {
      setThinking(false);
      setMessages((current) => [
        ...current,
        {
          id: `user-text-${Date.now()}`,
          role: 'user',
          text: redactDirectStudentNames(text),
        },
        makeAssistantMessage({
          type: 'student-name-warning',
          text: t('floatingSmartDesk.studentNameWarningText'),
          followUpText: t('floatingSmartDesk.studentNameWarningFollowUp'),
        }, `student-name-warning-${Date.now()}`),
      ]);
      return;
    }

    setMessages((current) => [...current, { id: `user-text-${Date.now()}`, role: 'user', text }]);
    setThinking(true);
    queueTimer(() => {
      if (matchedPrompt) {
        addResponseForPrompt(matchedPrompt);
        return;
      }

      setMessages((current) => [...current, makeAssistantMessage(
        localizeMessagePayload(responseSet.fallback, language),
        `fallback-${Date.now()}`,
      )]);
      setThinking(false);
    }, 680);
  }

  function startVoiceDemo() {
    clearTimers();
    setSuggestionsVisible(false);
    setListening(true);
    setThinking(false);

    queueTimer(() => {
      const voicePrompt = matchPrompt(voiceDemo.transcript, prompts)
        || prompts.find((prompt) => prompt.id === voiceDemo.responsePromptId);
      setListening(false);
      setMessages((current) => [
        ...current,
        {
          id: `voice-transcript-${Date.now()}`,
          role: 'user',
          text: voiceDemo.transcript,
        },
      ]);
      setThinking(true);
      queueTimer(() => {
        if (voicePrompt) {
          addResponseForPrompt(voicePrompt);
          return;
        }

        setMessages((current) => [...current, makeAssistantMessage(
          localizeMessagePayload(responseSet.fallback, language),
          `voice-fallback-${Date.now()}`,
        )]);
        setThinking(false);
      }, 820);
    }, 1600);
  }

  function startContextSelection(event) {
    clearTimers();
    setExpanded(true);
    setThinking(false);
    setListening(false);
    setSelectingContext(true);
    setSuggestionsVisible(false);

    const point = event ? getPointerPoint(event) : null;
    contextSelectionRef.current = point
      ? {
        startX: point.x,
        startY: point.y,
        moved: false,
      }
      : null;
  }

  function finishContextSelection(event) {
    const point = getPointerPoint(event);
    const capturedElement = document.elementFromPoint(point.x, point.y);
    const capture = describeCapturedElement(capturedElement, t);

    contextSelectionRef.current = null;
    setSelectingContext(false);
    setMessages((current) => [
      ...current,
      {
        id: `capture-${Date.now()}`,
        role: 'assistant',
        type: 'capture',
        text: capture.text,
        followUpText: capture.followUpText,
      },
    ]);
  }

  function cancelContextSelection() {
    contextSelectionRef.current = null;
    setSelectingContext(false);
  }

  function startDrag(event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    event.preventDefault?.();
    setReturningHome(false);
    const point = event.touches?.[0] || event;
    dragRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
  }

  function cancelDragInteraction(event) {
    dragRef.current = null;
    suppressHeaderClickRef.current = false;
    event.stopPropagation?.();
  }

  function logPosition(label, currentPosition, homePosition = getDefaultPosition()) {
    if (typeof console === 'undefined') {
      return;
    }

    console.log(`[FloatingSmartDesk] ${label}`, {
      current: {
        x: Math.round(currentPosition.x),
        y: Math.round(currentPosition.y),
      },
      home: {
        x: Math.round(homePosition.x),
        y: Math.round(homePosition.y),
      },
    });
  }

  function returnHome() {
    const homePosition = clampPosition(getDefaultPosition(), false);
    logPosition('return home', position, homePosition);
    setReturningHome(true);
    setExpanded(false);
    resetConversation();
    setPosition(homePosition);
  }

  useEffect(() => {
    resetConversation();

    return clearTimers;
  }, [welcomeMessage.text]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, thinking, listening, suggestionsVisible]);

  useEffect(() => {
    if (!selectingContext || typeof window === 'undefined') {
      return undefined;
    }

    const previousCursor = document.body.style.cursor;
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .smartdesk-selecting-context,
      .smartdesk-selecting-context * {
        cursor: ${purpleCrosshairCursor} !important;
      }
    `;
    document.head.appendChild(styleElement);
    document.body.classList.add('smartdesk-selecting-context');
    document.body.style.cursor = purpleCrosshairCursor;

    function handleMove(event) {
      if (!contextSelectionRef.current) {
        return;
      }

      const point = getPointerPoint(event);
      const deltaX = point.x - contextSelectionRef.current.startX;
      const deltaY = point.y - contextSelectionRef.current.startY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        contextSelectionRef.current.moved = true;
      }
    }

    function handleRelease(event) {
      if (!contextSelectionRef.current?.moved) {
        return;
      }

      suppressContextIconClickRef.current = true;
      finishContextSelection(event);
      window.setTimeout(() => {
        suppressContextIconClickRef.current = false;
      }, 0);
    }

    function handleClick(event) {
      if (suppressContextIconClickRef.current || rootRef.current?.contains(event.target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      finishContextSelection(event);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        cancelContextSelection();
      }
    }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('touchend', handleRelease);
    window.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('smartdesk-selecting-context');
      document.body.style.cursor = previousCursor;
      styleElement.remove();
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchend', handleRelease);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectingContext]);

  useEffect(() => {
    function handleMove(event) {
      if (!dragRef.current) {
        return;
      }

      const point = event.touches?.[0] || event;
      const deltaX = point.clientX - dragRef.current.startX;
      const deltaY = point.clientY - dragRef.current.startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragRef.current.moved = true;
      }
      dragRef.current.lastDeltaX = deltaX;
      dragRef.current.lastDeltaY = deltaY;

      setPosition(clampPosition({
        x: dragRef.current.originX + deltaX,
        y: dragRef.current.originY + deltaY,
      }, expanded));
    }

    function handleEnd() {
      if (dragRef.current?.moved) {
        const currentPosition = clampPosition({
          x: dragRef.current.originX + (dragRef.current.lastDeltaX || 0),
          y: dragRef.current.originY + (dragRef.current.lastDeltaY || 0),
        }, expanded);
        logPosition('drag end', currentPosition);
        suppressHeaderClickRef.current = true;
        window.setTimeout(() => {
          suppressHeaderClickRef.current = false;
        }, 0);
      }

      dragRef.current = null;
    }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [expanded]);

  useEffect(() => {
    function handleResize() {
      setPosition((currentPosition) => clampPosition(currentPosition, expanded));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expanded]);

  return (
    <Paper
      ref={rootRef}
      elevation={0}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1700,
        width: expanded ? expandedWidth : collapsedWidth,
        maxWidth: expanded ? `min(${expandedWidth}px, calc(100vw - 24px))` : collapsedWidth,
        borderRadius: expanded ? '16px' : '14px',
        overflow: 'hidden',
        bgcolor: expanded ? '#fff' : purple,
        color: expanded ? darkText : '#fff',
        border: expanded ? `1px solid ${border}` : 0,
        boxShadow: expanded
          ? '0 22px 64px rgba(24, 21, 26, 0.16)'
          : '0 16px 34px rgba(156, 40, 175, 0.2)',
        transition: [
          returningHome
            ? 'left 1800ms cubic-bezier(0.22, 1, 0.36, 1), top 1800ms cubic-bezier(0.22, 1, 0.36, 1)'
            : null,
          'border-radius 260ms ease',
          'background-color 260ms ease',
          'box-shadow 260ms ease',
          'border-color 260ms ease',
        ].filter(Boolean).join(', '),
        pointerEvents: selectingContext ? 'none' : 'auto',
      }}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'left' || event.propertyName === 'top') {
          setReturningHome(false);
        }
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        onClick={() => {
          if (suppressHeaderClickRef.current) {
            suppressHeaderClickRef.current = false;
            return;
          }

          setExpanded(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setExpanded(true);
          }
        }}
        sx={{
          width: '100%',
          display: 'block',
          cursor: expanded ? 'grab' : 'pointer',
          bgcolor: expanded ? purple : 'transparent',
          color: '#fff',
          userSelect: 'none',
          touchAction: 'none',
          '&:hover': {
            bgcolor: expanded ? darkPurple : darkPurple,
          },
          '&:focus-visible': {
            outline: `2px solid ${purple}`,
            outlineOffset: 2,
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            minHeight: 46,
            display: 'grid',
            gridTemplateColumns: '18px minmax(0, 1fr) 24px 26px 26px',
            alignItems: 'center',
            columnGap: 1,
            px: 1.3,
            py: 0.8,
            boxSizing: 'border-box',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 18 }} />
          <Typography
            sx={{
              minWidth: 0,
              textAlign: 'left',
              fontSize: 12.5,
              fontWeight: 850,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {t('floatingSmartDesk.askSmartDesk')}
          </Typography>
          <IconButton
            aria-label={t('floatingSmartDesk.selectContext')}
            size="small"
            onMouseDown={(event) => {
              event.stopPropagation();
              contextIconPointerStartedRef.current = true;
              startContextSelection(event);
            }}
            onTouchStart={(event) => {
              event.stopPropagation();
              contextIconPointerStartedRef.current = true;
              startContextSelection(event);
            }}
            onClick={(event) => {
              event.stopPropagation();

              if (suppressContextIconClickRef.current) {
                suppressContextIconClickRef.current = false;
                contextIconPointerStartedRef.current = false;
                return;
              }

              if (contextIconPointerStartedRef.current) {
                contextIconPointerStartedRef.current = false;
                return;
              }

              if (selectingContext) {
                cancelContextSelection();
                return;
              }

              startContextSelection(event);
            }}
            sx={{
              width: 24,
              height: 24,
              minWidth: 24,
              alignSelf: 'center',
              justifySelf: 'center',
              color: '#fff',
              bgcolor: selectingContext ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              p: 0,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.14)',
              },
            }}
          >
            <AdsClickIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton
            aria-label={t('floatingSmartDesk.microphone')}
            size="small"
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(true);
              startVoiceDemo();
            }}
            sx={{
              width: 26,
              height: 26,
              minWidth: 26,
              alignSelf: 'center',
              justifySelf: 'center',
              color: '#fff',
              bgcolor: 'rgba(255, 255, 255, 0.13)',
              p: 0,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <MicIcon sx={{ fontSize: 18, opacity: expanded ? 0.75 : 0.9 }} />
          </IconButton>
          <IconButton
            aria-label={expanded ? t('floatingSmartDesk.minimize') : t('floatingSmartDesk.expand')}
            size="small"
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              if (expanded) {
                returnHome();
                return;
              }

              setReturningHome(false);
              setExpanded(true);
            }}
            sx={{
              width: 26,
              height: 26,
              minWidth: 26,
              alignSelf: 'center',
              justifySelf: 'center',
              color: '#fff',
              p: 0,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.14)',
              },
            }}
          >
            {expanded ? <CloseIcon sx={{ fontSize: 17 }} /> : <OpenInFullIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      </Box>

      <Box
        onMouseDownCapture={cancelDragInteraction}
        onTouchStartCapture={cancelDragInteraction}
        onClickCapture={(event) => event.stopPropagation()}
        sx={{
          width: '100%',
          minWidth: 0,
          maxHeight: expanded ? 380 : 0,
          opacity: expanded ? 1 : 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
          transition: 'max-height 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: 'minmax(0, 1fr) auto',
            height: 334,
            minHeight: 0,
          }}
        >
          <Stack
            spacing={0.85}
            sx={{
              minWidth: 0,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              px: 1.15,
              py: 1.15,
              bgcolor: 'rgba(251, 245, 253, 0.32)',
            }}
          >
            {messages.map((message) => (
              <FloatingMessage key={message.id} message={message} t={t} />
            ))}

            {suggestionsVisible && (
              <Stack spacing={0.55}>
                {prompts.slice(0, 3).map((prompt) => (
                  <Button
                    key={prompt.id}
                    size="small"
                    variant="outlined"
                    onClick={() => submitPrompt(prompt)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderRadius: '12px',
                      px: 1,
                      py: 0.65,
                      color: darkText,
                      borderColor: 'rgba(24, 21, 26, 0.11)',
                      bgcolor: '#fff',
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                      fontSize: 11.4,
                      lineHeight: 1.25,
                      '&:hover': { bgcolor: palePurple, borderColor: 'rgba(156, 40, 175, 0.24)' },
                    }}
                  >
                    {prompt.label}
                  </Button>
                ))}
              </Stack>
            )}

            {listening && <FloatingVoiceState t={t} />}

            {selectingContext && (
              <Box
                aria-live="polite"
                sx={{
                  borderRadius: '14px',
                  border: '1px solid rgba(156, 40, 175, 0.16)',
                  bgcolor: palePurple,
                  px: 1,
                  py: 0.8,
                }}
              >
                <Typography sx={{ color: darkText, fontSize: 11.7, fontWeight: 750 }}>
                  {t('floatingSmartDesk.releaseToCapture')}
                </Typography>
              </Box>
            )}

            {thinking && (
              <Stack direction="row" spacing={0.75} alignItems="center" aria-live="polite" sx={{ color: 'text.secondary', px: 0.4 }}>
                <CircularProgress size={13} sx={{ color: purple }} />
                <Typography sx={{ fontSize: 11.5 }}>{t('floatingSmartDesk.looking')}</Typography>
              </Stack>
            )}
            <Box ref={endRef} />
          </Stack>

          <Box
            onMouseDownCapture={cancelDragInteraction}
            onTouchStartCapture={cancelDragInteraction}
            onClickCapture={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            sx={{ borderTop: `1px solid ${border}`, px: 0.85, py: 0.8, bgcolor: '#fff' }}
          >
            <Stack direction="row" spacing={0.6} alignItems="flex-end" sx={{ minWidth: 0 }}>
              <TextField
                label={t('floatingSmartDesk.ask')}
                placeholder={t('floatingSmartDesk.askPlaceholder', { context: getLocalizedContextLabel(context, t) })}
                value={input}
                onMouseDownCapture={cancelDragInteraction}
                onTouchStartCapture={cancelDragInteraction}
                onClickCapture={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(keyboardEvent) => {
                  keyboardEvent.stopPropagation();
                  if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
                    keyboardEvent.preventDefault();
                    submitText(keyboardEvent.currentTarget.value);
                  }
                }}
                fullWidth
                size="small"
                sx={{
                  minWidth: 0,
                  '& .MuiInputBase-input': {
                    fontSize: 12,
                    py: 0.85,
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: 12,
                  },
                }}
              />
              <IconButton
                aria-label={t('floatingSmartDesk.sendMessage')}
                disabled={!input.trim()}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  submitText();
                }}
                sx={{ color: purple, width: 34, height: 34, mb: 0.1 }}
              >
                <SendIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
