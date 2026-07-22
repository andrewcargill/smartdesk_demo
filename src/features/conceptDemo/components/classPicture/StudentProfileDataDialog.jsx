import { useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

const darkText = '#17151a';
const palePurple = '#fbf5fd';

function DataSection({ section }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: '16px',
        border: '1px solid rgba(23, 21, 26, 0.09)',
        bgcolor: '#fff',
      }}
    >
      <Typography component="h3" sx={{ color: darkText, fontWeight: 850 }}>
        {section.title}
      </Typography>
      {!!section.description && (
        <Typography sx={{ mt: 0.45, color: 'text.secondary', lineHeight: 1.5, fontSize: 13.6 }}>
          {section.description}
        </Typography>
      )}
      <Stack spacing={1} sx={{ mt: 1 }}>
        {(section.items || []).map((item) => (
          <Box key={item.id || item.label}>
            <Typography sx={{ color: darkText, fontWeight: 780, lineHeight: 1.35 }}>
              {item.label}
            </Typography>
            {!!item.detail && (
              <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13.4, lineHeight: 1.45 }}>
                {item.detail}
              </Typography>
            )}
            {!!item.meta && (
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.8, lineHeight: 1.4 }}>
                {item.meta}
              </Typography>
            )}
          </Box>
        ))}
        {!section.items?.length && (
          <Typography sx={{ color: 'text.secondary', fontSize: 13.5 }}>
            No saved data for this section yet.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function StudentProfileDataDialog({
  open,
  student,
  subtitle,
  summary,
  groups = [],
  groupDefinitions = [],
  dataSections = [],
  onClose,
}) {
  const titleRef = useRef(null);

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => titleRef.current?.focus?.());
    }
  }, [open]);

  if (!student) {
    return null;
  }

  function getGroupTypeLabel(typeId) {
    return groupDefinitions.find((definition) => definition.id === typeId)?.label || 'Focus';
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '24px' },
          bgcolor: '#fff',
          boxShadow: '0 28px 80px rgba(23, 21, 26, 0.16)',
        },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
        <IconButton aria-label={`Close ${student.displayName} profile and data`} onClick={onClose} sx={{ position: 'absolute', top: 14, right: 14 }}>
          <CloseIcon />
        </IconButton>

        <Typography ref={titleRef} tabIndex={-1} variant="h2" sx={{ color: darkText, fontSize: { xs: 30, sm: 38 }, lineHeight: 1.08, pr: 5, outline: 'none' }}>
          {student.displayName}
        </Typography>
        {!!subtitle && (
          <Typography sx={{ mt: 0.8, color: 'text.secondary', fontWeight: 650 }}>
            {subtitle}
          </Typography>
        )}

        <Stack spacing={2.2} sx={{ mt: 2.5 }}>
          {!!summary && (
            <Paper
              elevation={0}
              sx={{ p: 1.7, borderRadius: '18px', border: '1px solid rgba(156, 40, 175, 0.14)', bgcolor: palePurple }}
            >
              <Typography component="h3" sx={{ color: darkText, fontWeight: 850 }}>Profile</Typography>
              <Typography sx={{ mt: 0.55, color: 'text.secondary', lineHeight: 1.55 }}>
                {summary}
              </Typography>
            </Paper>
          )}

          <Box>
            <Typography component="h3" sx={{ color: darkText, fontWeight: 850 }}>
              Current focus
            </Typography>
            <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              {groups.map((group) => (
                <Chip
                  key={group.id}
                  label={`${group.label} · ${getGroupTypeLabel(group.typeId)}`}
                  sx={{ bgcolor: '#fff', border: '1px solid rgba(23, 21, 26, 0.09)', fontWeight: 700 }}
                />
              ))}
              {!groups.length && (
                <Typography sx={{ color: 'text.secondary', fontSize: 13.6 }}>
                  No focus assigned.
                </Typography>
              )}
            </Stack>
          </Box>

          {!!dataSections.length && <Divider />}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.4 }}>
            {dataSections.map((section) => (
              <DataSection key={section.id || section.title} section={section} />
            ))}
          </Box>
        </Stack>
      </Box>
    </Dialog>
  );
}
