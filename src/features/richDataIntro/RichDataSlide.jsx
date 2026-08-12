import { Box, Stack, Typography } from '@mui/material';

const darkText = '#17151a';
const purple = '#9c28af';

export default function RichDataSlide({ slide, index, total }) {
  const eyebrow = slide.eyebrow?.startsWith('Slide ') ? `Slide ${index + 1}` : slide.eyebrow;

  return (
    <Box
      sx={{
        minHeight: { xs: 520, md: 640 },
        display: 'grid',
        alignContent: 'space-between',
        gap: 3,
      }}
    >
      <Stack spacing={1.5}>
        {!!eyebrow && (
          <Typography sx={{ color: purple, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0 }}>
            {eyebrow} of {total}
          </Typography>
        )}
        <Typography component="h1" sx={{ color: darkText, fontSize: { xs: 36, md: 56 }, fontWeight: 900, lineHeight: 1.02 }}>
          {slide.title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: { xs: 16, md: 18 }, lineHeight: 1.58, maxWidth: 760 }}>
          {slide.body}
        </Typography>
      </Stack>

      {slide.image && (
        <Box
          component="img"
          src={slide.image}
          alt={slide.imageAlt || ''}
          sx={{
            width: '100%',
            height: { xs: 300, sm: 380, md: 460 },
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(23, 21, 26, 0.09)',
            display: 'block',
          }}
        />
      )}

      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
        {slide.points.map((point) => (
          <Box
            component="li"
            key={point}
            sx={{
              display: 'grid',
              gridTemplateColumns: '18px minmax(0, 1fr)',
              gap: 1,
              alignItems: 'start',
              color: darkText,
              fontSize: { xs: 14.5, md: 15.5 },
              lineHeight: 1.45,
              fontWeight: 720,
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: purple,
                mt: 0.8,
              }}
            />
            <Box>{point}</Box>
          </Box>
        ))}
      </Box>

      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 800 }}>
        {index + 1} / {total}
      </Typography>
    </Box>
  );
}
