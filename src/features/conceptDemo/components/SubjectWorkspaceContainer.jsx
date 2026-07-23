import { useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';

const purple = '#9c28af';
const border = 'rgba(23, 21, 26, 0.1)';

const modes = [
  {
    id: 'plan',
    icon: <AutoStoriesRoundedIcon fontSize="small" />,
    ariaLabel: 'Plan mode: planning term and lesson sequence',
    tooltipTitle: 'Plan',
    tooltipDetail: 'Plan the term and lesson sequence.',
  },
  {
    id: 'class-picture',
    icon: <GroupsRoundedIcon fontSize="small" />,
    ariaLabel: 'Class picture mode: viewing class and student progress',
    tooltipTitle: 'Class picture',
    tooltipDetail: 'View the class and student progress.',
  },
  {
    id: 'now',
    icon: <RateReviewRoundedIcon fontSize="small" />,
    ariaLabel: 'Now mode: recording quick observations',
    tooltipTitle: 'Now',
    tooltipDetail: 'Record quick observations and notes.',
  },
];

export default function SubjectWorkspaceContainer({
  title,
  subtitle,
  contextLine,
  activeMode,
  onModeChange,
  onBack,
  menuItems = [],
  children,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);

  function closeMenu() {
    setMenuAnchor(null);
  }

  function handleMenuItemClick(item) {
    closeMenu();
    item.onClick?.();
  }

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#fff', color: '#17151a' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 4,
          bgcolor: 'rgba(255, 255, 255, 0.96)',
          borderBottom: `1px solid ${border}`,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <Box sx={{ px: { xs: 1.5, md: 3 }, py: { xs: 1, sm: 1.15 } }}>
          <Stack direction="row" spacing={1.15} alignItems="center">
            <Tooltip title="Back to home">
              <IconButton
                data-focused-workspace-initial-focus
                aria-label="Back to home"
                onClick={onBack}
                sx={{
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  color: '#17151a',
                  border: '1px solid rgba(23, 21, 26, 0.12)',
                  bgcolor: '#fff',
                  '&:hover': { bgcolor: '#f8f6f9', borderColor: 'rgba(23, 21, 26, 0.18)' },
                }}
              >
                <ArrowBackRoundedIcon />
              </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: '#17151a', fontSize: { xs: 18, sm: 21 }, lineHeight: 1.15, fontWeight: 880 }}>
                {title}
              </Typography>
              {(subtitle || contextLine) && (
                <Typography
                  sx={{
                    mt: 0.25,
                    color: 'text.secondary',
                    fontSize: { xs: 13, sm: 14 },
                    fontWeight: 650,
                    lineHeight: 1.35,
                  }}
                >
                  {[subtitle, contextLine].filter(Boolean).join(' · ')}
                </Typography>
              )}
            </Box>

            {!!menuItems.length && (
              <>
                <Tooltip title="More options">
                  <IconButton
                    aria-label="More subject options"
                    aria-controls={menuOpen ? 'subject-workspace-menu' : undefined}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen ? 'true' : undefined}
                    onClick={(event) => setMenuAnchor(event.currentTarget)}
                    sx={{ flexShrink: 0, color: 'text.secondary' }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="subject-workspace-menu"
                  anchorEl={menuAnchor}
                  open={menuOpen}
                  onClose={closeMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {menuItems.map((item) => (
                    <MenuItem key={item.id || item.label} onClick={() => handleMenuItemClick(item)}>
                      {item.icon && (
                        <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                          {item.icon}
                        </ListItemIcon>
                      )}
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Stack>

          <Tabs
            value={activeMode}
            onChange={(_, nextMode) => onModeChange(nextMode)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Subject workspace modes"
            sx={{
              mt: 1,
              maxWidth: 620,
              minHeight: 44,
              border: '1px solid rgba(23, 21, 26, 0.1)',
              borderRadius: '999px',
              p: 0.4,
              bgcolor: '#fff',
              '& .MuiTab-root': {
                minHeight: 36,
                minWidth: 54,
                px: 2,
                borderRadius: '999px',
                color: 'rgba(156, 40, 175, 0.4)',
                textTransform: 'none',
                fontWeight: 800,
                border: '1px solid transparent',
                transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
              },
              '& .Mui-selected': {
                color: purple,
                bgcolor: '#f7ecfb',
                borderColor: 'rgba(156, 40, 175, 0.34)',
                boxShadow: '0 4px 12px rgba(156, 40, 175, 0.16)',
                transform: 'translateY(-1px)',
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            {modes.map((mode) => (
              <Tooltip
                key={mode.id}
                title={(
                  <Box>
                    <Typography sx={{ fontSize: 12.8, fontWeight: 850, lineHeight: 1.2 }}>{mode.tooltipTitle}</Typography>
                    <Typography sx={{ mt: 0.35, fontSize: 12.2, lineHeight: 1.35, color: 'rgba(23, 21, 26, 0.74)' }}>{mode.tooltipDetail}</Typography>
                  </Box>
                )}
                arrow
                placement="bottom"
                enterDelay={560}
                leaveDelay={80}
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'rgba(255, 255, 255, 0.98)',
                      color: '#17151a',
                      border: '1px solid rgba(23, 21, 26, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 26px rgba(23, 21, 26, 0.12)',
                      px: 1.2,
                      py: 0.9,
                      maxWidth: 240,
                    },
                  },
                  arrow: {
                    sx: {
                      color: 'rgba(255, 255, 255, 0.98)',
                      '&:before': {
                        border: '1px solid rgba(23, 21, 26, 0.1)',
                      },
                    },
                  },
                }}
              >
                <Tab
                  value={mode.id}
                  icon={mode.icon}
                  aria-label={mode.ariaLabel}
                  sx={{
                    color: activeMode === mode.id ? `${purple} !important` : 'rgba(156, 40, 175, 0.4)',
                  }}
                />
              </Tooltip>
            ))}
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ pl: { xs: 2, md: 6 }, pr: { xs: 2.5, md: 6 }, py: { xs: 2, md: 2.5 } }}>
        <Box sx={{ width: '100%', minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
