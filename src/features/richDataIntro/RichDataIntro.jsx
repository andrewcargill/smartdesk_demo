import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import RichDataSlide from './RichDataSlide.jsx';
import { richDataSlides } from './richDataSlides.js';

const darkText = '#17151a';
const purple = '#9c28af';

export default function RichDataIntro({ onOpenDemo }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = richDataSlides[activeIndex];
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === richDataSlides.length - 1;

  function goPrevious() {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

  function goNext() {
    setActiveIndex((current) => Math.min(current + 1, richDataSlides.length - 1));
  }

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid rgba(23, 21, 26, 0.1)',
          borderRadius: '16px',
          bgcolor: '#fff',
          overflow: 'hidden',
          boxShadow: '0 18px 42px rgba(23, 21, 26, 0.045)',
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px' } }}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              <RichDataSlide slide={activeSlide} index={activeIndex} total={richDataSlides.length} />
              {isLastSlide && (
                <Button
                  type="button"
                  onClick={onOpenDemo}
                  variant="contained"
                  endIcon={<PlayArrowIcon />}
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: purple,
                    borderRadius: '8px',
                    boxShadow: 'none',
                    textTransform: 'none',
                    fontWeight: 900,
                    px: 1.6,
                    '&:hover': { bgcolor: '#842194', boxShadow: 'none' },
                  }}
                >
                  Open demo homescreen
                </Button>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              bgcolor: 'rgba(23, 21, 26, 0.018)',
              borderTop: { xs: '1px solid rgba(23, 21, 26, 0.08)', lg: 0 },
              borderLeft: { xs: 0, lg: '1px solid rgba(23, 21, 26, 0.08)' },
              display: 'grid',
              alignContent: 'space-between',
              gap: 2,
            }}
          >
            <Stack spacing={1.2}>
              <Typography sx={{ color: purple, fontSize: 13, fontWeight: 900 }}>
                Intro slides
              </Typography>
              <Stack spacing={0.75}>
                {richDataSlides.map((slide, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <Button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        minHeight: 42,
                        borderRadius: '8px',
                        color: isActive ? purple : darkText,
                        bgcolor: isActive ? 'rgba(156, 40, 175, 0.08)' : 'transparent',
                        textTransform: 'none',
                        fontSize: 13,
                        fontWeight: isActive ? 900 : 760,
                        '&:hover': { bgcolor: isActive ? 'rgba(156, 40, 175, 0.11)' : 'rgba(23, 21, 26, 0.045)' },
                      }}
                    >
                      <Box component="span" sx={{ display: 'block', width: '100%', lineHeight: 1.25 }}>
                        {index + 1}. {slide.title}
                      </Box>
                    </Button>
                  );
                })}
              </Stack>
            </Stack>

            <Stack spacing={1.2}>
              <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="space-between">
                <IconButton
                  aria-label="Previous slide"
                  onClick={goPrevious}
                  disabled={isFirstSlide}
                  sx={{ border: '1px solid rgba(23, 21, 26, 0.1)', borderRadius: '8px' }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box sx={{ display: 'flex', gap: 0.55 }}>
                  {richDataSlides.map((slide, index) => (
                    <Box
                      key={slide.id}
                      aria-hidden="true"
                      sx={{
                        width: index === activeIndex ? 18 : 7,
                        height: 7,
                        borderRadius: 999,
                        bgcolor: index === activeIndex ? purple : 'rgba(23, 21, 26, 0.18)',
                        transition: 'width 140ms ease, background-color 140ms ease',
                      }}
                    />
                  ))}
                </Box>
                <IconButton
                  aria-label="Next slide"
                  onClick={goNext}
                  disabled={isLastSlide}
                  sx={{ border: '1px solid rgba(23, 21, 26, 0.1)', borderRadius: '8px' }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
