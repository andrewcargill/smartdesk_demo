import { useEffect, useRef, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

const purple = '#9c28af';
const border = 'rgba(23, 21, 26, 0.1)';
const enterDuration = 1200;
const exitDuration = 760;
const enterEasing = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const exitEasing = 'cubic-bezier(0.4, 0, 1, 1)';
const drawerWidth = 'calc(100vw - 28px)';

function WorkspaceSkeleton() {
  return (
    <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 2.5, md: 3.5 } }}>
      <Box sx={{ maxWidth: 1160, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
          <Stack spacing={2.2} sx={{ flex: 1.2, minWidth: 0 }}>
            <Skeleton variant="rounded" width={140} height={34} sx={{ borderRadius: 999 }} />
            <Skeleton variant="text" width="58%" height={64} />
            <Skeleton variant="text" width="34%" height={32} />
            <Skeleton variant="rounded" height={118} sx={{ borderRadius: '22px' }} />
            <Skeleton variant="rounded" height={210} sx={{ borderRadius: '22px' }} />
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: '22px' }} />
          </Stack>
          <Stack spacing={2.2} sx={{ flex: 0.8, minWidth: 280 }}>
            <Skeleton variant="rounded" height={148} sx={{ borderRadius: '22px' }} />
            <Skeleton variant="rounded" height={190} sx={{ borderRadius: '22px' }} />
            <Skeleton variant="rounded" height={148} sx={{ borderRadius: '22px' }} />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default function FocusedWorkspace({
  open,
  title,
  subtitle,
  onClose,
  returnFocusRef,
  showHeader = true,
  children,
}) {
  const backButtonRef = useRef(null);
  const wasOpenRef = useRef(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const focusTimer = window.setTimeout(() => {
        const target = showHeader ? backButtonRef.current : document.querySelector('[data-focused-workspace-initial-focus]');
        target?.focus?.();
      }, 80);
      wasOpenRef.current = true;
      return () => window.clearTimeout(focusTimer);
    }

    return undefined;
  }, [open, returnFocusRef, showHeader]);

  useEffect(() => {
    if (!open || showHeader || !contentVisible) {
      return;
    }

    document.querySelector('[data-focused-workspace-initial-focus]')?.focus?.();
  }, [contentVisible, open, showHeader]);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        setContentVisible(false);
        const returnFocusTimer = window.setTimeout(() => {
          returnFocusRef?.current?.focus?.();
        }, exitDuration);

        return () => window.clearTimeout(returnFocusTimer);
      }

      return undefined;
    }

    console.log('[FocusedWorkspace] open', {
      title,
      showHeader,
      enterDuration,
    });
    setContentVisible(false);

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      console.log('[FocusedWorkspace] content visible: reduced motion');
      setContentVisible(true);
    }

    const contentFallbackTimer = window.setTimeout(() => {
      console.log('[FocusedWorkspace] content visible: fallback timer');
      setContentVisible(true);
    }, enterDuration + 180);

    return () => window.clearTimeout(contentFallbackTimer);
  }, [open, returnFocusRef, showHeader, title]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: enterDuration, exit: exitDuration }}
      SlideProps={{
        easing: {
          enter: enterEasing,
          exit: exitEasing,
        },
      }}
      ModalProps={{ keepMounted: true, disableEnforceFocus: true }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(23, 21, 26, 0.22)',
        },
      }}
      PaperProps={{
        'aria-label': title,
        sx: {
          boxSizing: 'border-box',
          flexShrink: 0,
          bgcolor: '#fff',
          borderLeft: { xs: 0, sm: `1px solid ${border}` },
          borderTopLeftRadius: { xs: 0, sm: '26px' },
          borderBottomLeftRadius: { xs: 0, sm: '26px' },
          boxShadow: '-24px 0 80px rgba(23, 21, 26, 0.16)',
          overflow: 'hidden',
          transitionTimingFunction: `${enterEasing} !important`,
          '&.MuiDrawer-paperAnchorRight': {
            transitionTimingFunction: `${enterEasing} !important`,
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        },
        onTransitionEnd: (event) => {
          if (!open || contentVisible) {
            return;
          }

          console.log('[FocusedWorkspace] transition end', {
            propertyName: event.propertyName,
            elapsedTime: event.elapsedTime,
            targetClass: event.target?.className,
          });

          if (event.propertyName === 'transform') {
            console.log('[FocusedWorkspace] content visible: transform transition');
            setContentVisible(true);
          }
        },
      }}
      sx={{
        zIndex: 1300,
        '& .MuiDrawer-paper': {
          width: `${drawerWidth} !important`,
          minWidth: `${drawerWidth} !important`,
          maxWidth: `${drawerWidth} !important`,
          inlineSize: `${drawerWidth} !important`,
        },
        '& .MuiDrawer-paperAnchorRight': {
          width: `${drawerWidth} !important`,
          minWidth: `${drawerWidth} !important`,
          maxWidth: `${drawerWidth} !important`,
          inlineSize: `${drawerWidth} !important`,
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateRows: showHeader ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)',
          minWidth: 0,
        }}
      >
        {showHeader && (
          <Box
            component="header"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1.4, sm: 1.65 },
              bgcolor: 'rgba(255, 255, 255, 0.96)',
              borderBottom: `1px solid ${border}`,
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                ref={backButtonRef}
                startIcon={<ArrowBackIcon />}
                onClick={onClose}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              >
                Back to Anna's home
              </Button>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: '#17151a', fontSize: { xs: 18, sm: 22 }, fontWeight: 880, lineHeight: 1.15 }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13.5, fontWeight: 650 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <IconButton aria-label={`Close ${title}`} onClick={onClose} sx={{ color: purple }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>
        )}

        <Box sx={{ minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {contentVisible ? children : <WorkspaceSkeleton />}
        </Box>
      </Box>
    </Drawer>
  );
}
