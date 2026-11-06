import type { SettingsSchema } from '../../shared/settings.ts';

export const id = 'LiquidGlass';
export const pluginName = 'Liquid Glass';
export const description = 'Native macOS Liquid Glass under and over Slack. Needs a restart to turn on, and macOS 26 or later';
export const defaultEnabled = false;

export const settings = {
  opacity: {
    type: 'number',
    label: 'Glass opacity',
    description: 'How opaque the glass background is, from 0 (clear glass) to 1 (the element’s own solid color)',
    default: 0.15,
    min: 0,
    max: 1,
  },
  tint: {
    type: 'boolean',
    label: 'Tint the glass',
    description: 'Color the glass with the color each element normally has. Off makes it plain glass',
    default: true,
  },
  cursor: {
    type: 'boolean',
    label: 'Glass cursor',
    description: 'A glass pointer that follows the mouse and morphs into what you hover',
    default: true,
  },
  hideButtons: {
    type: 'boolean',
    label: 'Hide window buttons',
    description: 'Hide the close, minimize and zoom buttons. Cmd+W and Cmd+M still work',
    default: true,
  },
  everything: {
    type: 'boolean',
    label: 'Glass on every element',
    description: 'Make every element with a background glass, not only the main panes',
    default: true,
  },
  clear: {
    type: 'boolean',
    label: 'Clear glass style',
    description: 'Use the clearer, more transparent glass style',
    default: true,
  },
  panes: {
    type: 'boolean',
    label: 'Glass panes',
    description: 'Also make the big panes (sidebar, rail, main view, top bar) glass',
    default: false,
  },
  refract: {
    type: 'boolean',
    label: 'Glass over the page',
    description: 'Put small elements over the page so the glass bends the Slack content under it',
    default: false,
  },
  aboveSelectors: {
    type: 'text',
    label: 'Extra selectors over the page',
    description: 'Comma-separated CSS selectors to put over the page. Glass over text blurs the text',
    default: '',
  },
  merge: {
    type: 'number',
    label: 'Merge distance',
    description: 'Glass closer together than this many pixels flows into one piece',
    default: 24,
    min: 0,
    max: 120,
  },
  customShapes: {
    type: 'names',
    label: 'Custom shapes',
    description: 'CSS selector to SVG path, drawn in a 0 to 100 box and stretched to the element',
    default: {},
  },
} as const satisfies SettingsSchema;
