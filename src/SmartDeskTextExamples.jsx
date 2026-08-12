import { useMemo, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, ButtonBase, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { smartDeskTextExamples } from './data/smartDeskTextExamples.js';

const darkText = '#17151a';
const purple = '#9c28af';
const purpleText = '#842194';
const softBorder = '1px solid rgba(23, 21, 26, 0.09)';

export default function SmartDeskTextExamples() {
  const [selectedExampleId, setSelectedExampleId] = useState(smartDeskTextExamples[0]?.id || '');
  const [copyStatus, setCopyStatus] = useState('');
  const selectedExample = useMemo(
    () => smartDeskTextExamples.find((example) => example.id === selectedExampleId) || smartDeskTextExamples[0],
    [selectedExampleId],
  );

  async function copySelectedText() {
    if (!selectedExample?.text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedExample.text);
      setCopyStatus('Copied');
      window.setTimeout(() => setCopyStatus(''), 1600);
    } catch {
      setCopyStatus('Copy failed');
      window.setTimeout(() => setCopyStatus(''), 1800);
    }
  }

  return (
    <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
      <Stack spacing={2.2}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.6, md: 2.15 },
            borderRadius: '14px',
            border: softBorder,
            bgcolor: '#fff',
            boxShadow: '0 18px 42px rgba(23, 21, 26, 0.045)',
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' }, gap: 1.6, alignItems: 'center' }}>
            <Box>
              <Typography component="h1" sx={{ color: purple, fontSize: { xs: 31, md: 43 }, fontWeight: 900, lineHeight: 1.04 }}>
                SmartDesk Grading Assistant
              </Typography>
              <Typography sx={{ mt: 0.8, color: 'text.secondary', fontSize: { xs: 14.5, md: 15.5 }, lineHeight: 1.55, maxWidth: 780 }}>
                Our first product, due for launch in autumn 2026 to the Swedish market, helps teachers grade students written work using a custom AI engine aligned with Lgr22. No student text or assessment data is stored or exposed.
              </Typography>
            </Box>
            <Button
              href="https://smartdesk.se/"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              endIcon={<OpenInNewIcon fontSize="small" />}
              sx={{
                justifySelf: { xs: 'start', md: 'end' },
                color: purple,
                borderColor: 'rgba(156, 40, 175, 0.28)',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 850,
                px: 1.4,
                '&:hover': { borderColor: purple, bgcolor: 'rgba(156, 40, 175, 0.045)' },
              }}
            >
              smartdesk.se
            </Button>
          </Box>
        </Paper>

        {selectedExample && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: '14px',
              border: softBorder,
              bgcolor: '#fff',
              overflow: 'hidden',
              boxShadow: '0 18px 42px rgba(23, 21, 26, 0.04)',
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '330px minmax(0, 1fr)' } }}>
              <Box
                sx={{
                  p: { xs: 1.5, md: 1.8 },
                  bgcolor: 'rgba(23, 21, 26, 0.018)',
                  borderRight: { xs: 0, lg: '1px solid rgba(23, 21, 26, 0.08)' },
                  borderBottom: { xs: '1px solid rgba(23, 21, 26, 0.08)', lg: 0 },
                }}
              >
                <Stack spacing={1.35}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="smartdesk-text-example-label">Text example</InputLabel>
                    <Select
                      labelId="smartdesk-text-example-label"
                      label="Text example"
                      value={selectedExampleId}
                      onChange={(event) => setSelectedExampleId(event.target.value)}
                      sx={{ borderRadius: '10px', bgcolor: '#fff', fontWeight: 760 }}
                    >
                      {smartDeskTextExamples.map((example) => (
                        <MenuItem key={example.id} value={example.id}>
                          {example.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#fff', border: softBorder }}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 850 }}>
                      Selected sample
                    </Typography>
                    <Stack direction="row" spacing={0.55} flexWrap="wrap" useFlexGap sx={{ mt: 0.85 }}>
                      <Chip label={selectedExample.subject} size="small" sx={{ height: 23, bgcolor: 'rgba(156, 40, 175, 0.08)', color: purpleText, fontSize: 11.4, fontWeight: 850 }} />
                      <Chip label={selectedExample.level} size="small" sx={{ height: 23, bgcolor: 'rgba(23, 21, 26, 0.045)', color: 'text.secondary', fontSize: 11.4, fontWeight: 780 }} />
                    </Stack>
                    <Typography sx={{ mt: 1.1, color: darkText, fontSize: 13.5, lineHeight: 1.45, fontWeight: 760 }}>
                      {selectedExample.assignment}
                    </Typography>
                    <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 12.2, fontWeight: 760 }}>
                      {selectedExample.wordCount}
                    </Typography>
                  </Box>

                  <Button
                    type="button"
                    onClick={copySelectedText}
                    variant="contained"
                    startIcon={<ContentCopyIcon fontSize="small" />}
                    sx={{
                      alignSelf: 'stretch',
                      bgcolor: purple,
                      borderRadius: '8px',
                      boxShadow: 'none',
                      textTransform: 'none',
                      fontWeight: 900,
                      '&:hover': { bgcolor: purpleText, boxShadow: 'none' },
                    }}
                  >
                    {copyStatus || 'Copy response'}
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                <Stack spacing={1.35}>
                  <Box>
                    <Typography component="h2" sx={{ color: darkText, fontSize: { xs: 24, md: 31 }, fontWeight: 900, lineHeight: 1.08 }}>
                      {selectedExample.title}
                    </Typography>
                  </Box>

                  <ButtonBase
                    type="button"
                    onClick={copySelectedText}
                    aria-label="Copy selected example text"
                    sx={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      borderRadius: '12px',
                      '&:focus-visible': { outline: '2px solid #9c28af', outlineOffset: 2 },
                    }}
                  >
                    <Box
                      sx={{
                        p: { xs: 1.35, md: 1.8 },
                        borderRadius: '12px',
                        bgcolor: '#fff',
                        border: '1px solid rgba(23, 21, 26, 0.1)',
                        transition: 'border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease',
                        '&:hover': {
                          borderColor: 'rgba(156, 40, 175, 0.34)',
                          bgcolor: 'rgba(156, 40, 175, 0.016)',
                          boxShadow: '0 10px 24px rgba(23, 21, 26, 0.035)',
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                        <Stack direction="row" spacing={0.55} alignItems="center">
                          <ContentCopyIcon sx={{ color: 'text.secondary', fontSize: 15 }} />
                          <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 850 }}>
                            Student response
                          </Typography>
                        </Stack>
                        {!!copyStatus && (
                          <Typography sx={{ color: purpleText, fontSize: 11.8, fontWeight: 900 }}>
                            {copyStatus}
                          </Typography>
                        )}
                      </Stack>
                      {selectedExample.text.split('\n\n').map((paragraph) => (
                        <Typography key={paragraph} sx={{ color: darkText, fontSize: { xs: 14.8, md: 15.5 }, lineHeight: 1.72, mb: 1.25, '&:last-of-type': { mb: 0 } }}>
                          {paragraph}
                        </Typography>
                      ))}
                    </Box>
                  </ButtonBase>

                  <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(156, 40, 175, 0.055)', border: '1px solid rgba(156, 40, 175, 0.14)' }}>
                    <Typography sx={{ color: purpleText, fontSize: 12.2, fontWeight: 900 }}>
                      Useful demo characteristics
                    </Typography>
                    <Typography sx={{ mt: 0.35, color: darkText, fontSize: 13.4, lineHeight: 1.45 }}>
                      {selectedExample.demoCharacteristics}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
