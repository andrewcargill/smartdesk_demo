# SmartDesk appearance

`AppThemeProvider` owns one MUI theme for the app and all demo portals. The home header, demo menu, and subject/mentor workspace toggle share that state. An explicit choice is saved as `smartdesk-color-mode`; without a saved choice the app follows system appearance. Storage failures fall back to in-memory switching.

Dark mode uses charcoal surfaces, white text, and the original `#9c28af` brand purple for filled actions. It does not replace the brand with a pink or lavender primary palette. Muted violet is reserved for focus and chart marks that need contrast. Warning/error/success colours retain their semantic meaning.

For new UI:

- Prefer MUI palette tokens for ordinary surfaces and typography.
- Use `--sd-primary` for brand fills, paired with `--sd-on-primary` text.
- Use `--sd-accent-text` for foreground accents; it is white in dark mode.
- Use `--sd-focus` for focus outlines and `--sd-chart` for chart marks.
- Use the `*-rgb` channels for translucent borders, backgrounds, and gradients.
- Use `--sd-shadow-rgb` for shadows/backdrops and the wallpaper tokens for image overlays.
- Do not use low-opacity brand purple for readable labels on charcoal.

`npm run test:theme` checks palette contrast, initial preference resolution, server rendering, translations, and token coverage through active imports. It does not replace browser checks of switching, persistence after reload, hover/focus/disabled states, open dialogs, charts, background images, and mobile layout.
