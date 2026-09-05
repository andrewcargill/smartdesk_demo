import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';

// Two independent, smooth oscillations trace a continuous figure eight.
// The vertical cycle runs twice per horizontal cycle, with a quarter-cycle offset.
const floatAcross = keyframes`
  0%, 100% { translate: -5% 0; }
  50% { translate: 5% 0; }
`;

const floatVertically = keyframes`
  0%, 100% { transform: translateY(-3%) rotate(-3deg); }
  50% { transform: translateY(3%) rotate(3deg); }
`;

const palettes = {
  light: {
    base: '#f6f5f8',
    purple: 'rgba(103, 48, 146, 0.12)',
    violet: 'rgba(91, 57, 143, 0.085)',
    glow: 'rgba(255, 255, 255, 0.72)',
  },
  dark: {
    base: '#17161a',
    purple: 'rgba(89, 33, 127, 0.28)',
    violet: 'rgba(65, 39, 94, 0.2)',
    glow: 'rgba(255, 255, 255, 0.025)',
  },
};

// Decorative layers crossfade with the MUI mode; they never intercept input.
// Keep the containing surface positioned and its content above this layer.
export default function DynamicGradientBackground() {
  return (
    <Box
      aria-hidden="true"
      sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {Object.entries(palettes).map(([mode, palette]) => (
        <Box
          key={mode}
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            bgcolor: palette.base,
            opacity: theme.palette.mode === mode ? 1 : 0,
            transition: 'opacity 1200ms ease',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              inset: '-20%',
              filter: 'blur(clamp(24px, 4vw, 64px))',
              animation: `${floatAcross} 72s ease-in-out infinite, ${floatVertically} 36s ease-in-out -9s infinite`,
              animationPlayState: theme.palette.mode === mode ? 'running' : 'paused',
            },
            '&::before': {
              backgroundImage: `radial-gradient(ellipse 65% 48% at 18% 38%, ${palette.purple} 0%, transparent 78%), radial-gradient(ellipse 60% 52% at 82% 62%, ${palette.violet} 0%, transparent 80%)`,
            },
            '&::after': {
              backgroundImage: `radial-gradient(ellipse 52% 68% at 48% 45%, ${palette.glow} 0%, transparent 76%), radial-gradient(ellipse 70% 38% at 52% 82%, ${palette.violet} 0%, transparent 82%)`,
              animationDuration: '96s, 48s',
              animationDelay: '-24s, -12s',
              animationDirection: 'reverse, normal',
            },
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              '&::before, &::after': { animation: 'none' },
            },
          })}
        />
      ))}
    </Box>
  );
}
