import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useColorMode } from '../ColorModeContext.jsx';

export default function ColorModeToggle({ darkLabel = 'Switch to dark mode', lightLabel = 'Switch to light mode' }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const label = colorMode === 'light' ? darkLabel : lightLabel;
  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggleColorMode} aria-label={label}>
        {colorMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
