// CSS variables also work in gradients, SVG fills, and portalled dialogs.
// MUI owns their values; components never maintain a separate colour mode.
export function getSurfaceVariables(theme) {
  const dark = theme.palette.mode === 'dark';
  const colors = {
    shadow: '#000000',
    'wallpaper-start': dark ? 'rgba(18, 18, 20, 0.88)' : 'rgba(255, 255, 255, 0.55)',
    'wallpaper-end': dark ? 'rgba(18, 18, 20, 0.94)' : 'rgba(255, 255, 255, 0.68)',
    surface: theme.palette.background.paper,
    'surface-muted': dark ? '#29282d' : '#fbfafc',
    primary: theme.palette.primary.main,
    'accent-text': dark ? theme.palette.text.primary : theme.palette.primary.main,
    focus: dark ? '#a463c5' : theme.palette.primary.main,
    chart: dark ? '#a463c5' : theme.palette.primary.main,
    'primary-hover': '#842194',
    'primary-selected': '#9c28af',
    'primary-soft': dark ? '#2c243e' : '#fbf5fd',
    'on-primary': theme.palette.primary.contrastText,
    text: dark ? theme.palette.text.primary : '#17151a',
    'text-muted': theme.palette.text.secondary,
    warning: dark ? theme.palette.warning.main : '#9a5b00',
    'warning-soft': dark ? '#382f20' : '#fff8e8',
    error: dark ? theme.palette.error.main : '#b42318',
    success: dark ? '#86d6a3' : '#2f7d50',
  };

  return Object.fromEntries(Object.entries(colors).flatMap(([name, color]) => {
    const rgb = color.startsWith('#')
      ? color.slice(1).match(/.{2}/g).map((part) => parseInt(part, 16)).join(', ')
      : null;
    return [
      [`--sd-${name}`, color],
      ...(rgb ? [[`--sd-${name}-rgb`, rgb]] : []),
    ];
  }));
}
