import { useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
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
import { useConceptDemoLanguage } from '../ConceptDemoLanguageContext.jsx';

const purple = '#9c28af';
const border = 'rgba(23, 21, 26, 0.1)';

const modes = [
  {
    id: 'class-picture',
    icon: <GroupsRoundedIcon fontSize="small" />,
    translationKey: 'classPicture',
  },
  {
    id: 'now',
    icon: <RateReviewRoundedIcon fontSize="small" />,
    translationKey: 'now',
  },
  {
    id: 'assessment',
    icon: <FactCheckRoundedIcon fontSize="small" />,
    translationKey: 'assessment',
  },
  {
    id: 'plan',
    icon: <AutoStoriesRoundedIcon fontSize="small" />,
    translationKey: 'plan',
  },
];

export default function SubjectWorkspaceContainer({
  title,
  subtitle,
  contextLine,
  activeMode,
  onModeChange,
  onBack,
  titleMeta = null,
  headerActions = null,
  menuItems = [],
  children,
}) {
  const { t } = useConceptDemoLanguage();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const showModeNavigation = Boolean(activeMode && onModeChange);

  function closeMenu() {
    setMenuAnchor(null);
  }

  function handleMenuItemClick(item) {
    if (item.disabled) {
      return;
    }

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
            <Tooltip title={t('learningModule.workspace.backToHome')}>
              <IconButton
                data-focused-workspace-initial-focus
                aria-label={t('learningModule.workspace.backToHome')}
                onClick={onBack}
                sx={{
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  color: '#17151a',
                  border: '1px solid transparent',
                  bgcolor: 'transparent',
                  '&:hover': { bgcolor: 'rgba(23, 21, 26, 0.05)' },
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
              {titleMeta && (
                <Box sx={{ mt: 0.7 }}>
                  {titleMeta}
                </Box>
              )}
            </Box>

            {headerActions && (
              <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
                {headerActions}
              </Box>
            )}

            {!!menuItems.length && (
              <>
                <Tooltip title={t('learningModule.workspace.moreOptions')}>
                  <IconButton
                    aria-label={t('learningModule.workspace.moreSubjectOptions')}
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
                    <MenuItem key={item.id || item.label} disabled={item.disabled} onClick={() => handleMenuItemClick(item)}>
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

          {showModeNavigation && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ mt: 1, width: '100%' }}
            >
              <Tabs
                value={activeMode}
                onChange={(_, nextMode) => onModeChange(nextMode)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label={t('learningModule.workspace.modesLabel')}
                sx={{
                  maxWidth: 620,
                  flexShrink: 0,
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
                    transition: 'color 180ms ease',
                  },
                  '& .Mui-selected': {
                    color: purple,
                    bgcolor: 'transparent',
                    borderColor: 'transparent',
                    boxShadow: 'none',
                    transform: 'none',
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                {modes.map((mode) => (
                  <Tab
                    key={mode.id}
                    value={mode.id}
                    icon={(
                      <Tooltip
                        title={(
                          <Box>
                            <Typography sx={{ fontSize: 12.8, fontWeight: 850, lineHeight: 1.2 }}>
                              {t(`learningModule.modes.${mode.translationKey}.tooltipTitle`)}
                            </Typography>
                            <Typography sx={{ mt: 0.35, fontSize: 12.2, lineHeight: 1.35, color: 'rgba(23, 21, 26, 0.74)' }}>
                              {t(`learningModule.modes.${mode.translationKey}.tooltipDetail`)}
                            </Typography>
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
                        <Box component="span" sx={{ display: 'inline-flex' }}>
                          {mode.icon}
                        </Box>
                      </Tooltip>
                    )}
                    aria-label={t(`learningModule.modes.${mode.translationKey}.ariaLabel`)}
                    sx={{
                      color: activeMode === mode.id ? `${purple} !important` : 'rgba(156, 40, 175, 0.4)',
                    }}
                  />
                ))}
              </Tabs>
            </Stack>
          )}
          {headerActions && (
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'flex-end', mt: 1 }}>
              {headerActions}
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ pl: { xs: 2, md: 6 }, pr: { xs: 3.5, md: 8 }, py: { xs: 2, md: 2.5 } }}>
        <Box sx={{ width: '100%', minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
