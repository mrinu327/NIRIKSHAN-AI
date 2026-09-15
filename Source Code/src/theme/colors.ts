/**
 * Design System - Color Palette
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * NIRIKSHAN NATURAL PALETTE:
 * PARCHMENT   - Primary light background, large neutral surfaces
 * SAND        - Secondary surfaces, cards, sections, inputs
 * SAGE        - Soft accent, selected/secondary indicator states
 * OLIVE       - Primary brand/action color, primary buttons, active navigation
 * OLIVEWOOD   - Deeper supporting accent, stronger headings/navigation emphasis
 * BARK        - Dark text, strong contrast, grounding dark elements
 *
 * Restrained semantic colors: Terracotta Rust, Warm Ochre, Forest Fern.
 */

export const colors = {
  // Core Natural Palette Tokens
  palette: {
    parchment: '#F7F5F0',
    parchmentSubtle: '#FAF9F5',
    parchmentDark: '#EFECE4',
    sand: '#ECE7DE',
    sandLight: '#F3EFE8',
    sandBorder: '#DCD6C8',
    sage: '#7E8F7A',
    sageLight: '#EFF3EE',
    sageBorder: '#C2D1C0',
    olive: '#4D6331',
    oliveDark: '#3E4F26',
    oliveLight: '#EDF2E8',
    olivewood: '#283618',
    olivewoodDark: '#202D13',
    bark: '#1F1B16',
    barkSecondary: '#524C42',
    barkMuted: '#7D7567',
  },

  // Brand / Authority Hierarchy
  brand: {
    navyDark: '#202D13',      // Olivewood Deep (dark grounding surface)
    navy: '#283618',          // Olivewood (authoritative header & top bar)
    navyLight: '#354522',     // Olivewood Slate
    primary: '#4D6331',       // Olive (primary interactive action color)
    primaryHover: '#3E4F26',  // Deep Olive (hover / active press)
    primaryLight: '#EDF2E8',  // Soft Olive/Sage tint for active tags
    accent: '#7E8F7A',        // Sage (soft accent & secondary indicators)
  },

  // Restrained Semantic Status Colors
  status: {
    normal: '#2D6A4F',        // Forest Fern (Compliant, Passed, Verified)
    normalLight: '#EFF7F1',   // Soft fern tint
    normalBorder: '#B7DDC2',

    warning: '#B87320',       // Warm Ochre (Action required, Review pending)
    warningLight: '#FCF6EC',  // Soft ochre tint
    warningBorder: '#F1D6A7',

    highPriority: '#9E3B2B',  // Terracotta Rust (Critical, Surprise, Discrepancy)
    highPriorityLight: '#FBF0EE', // Soft rust tint
    highPriorityBorder: '#E8BBB3',

    info: '#4A6052',          // Slate Olive (Assigned, Scheduled, Processing)
    infoLight: '#EEF4F0',     // Soft slate tint
    infoBorder: '#C6DAD0',

    offline: '#7D7567',       // Slate Bark (Inactive, Neutral telemetry)
    offlineLight: '#F4F2EC',  // Soft bark tint
    offlineBorder: '#DDD8CC',
  },

  // Priority Colors
  priority: {
    high: '#9E3B2B',          // Terracotta Rust
    medium: '#B87320',        // Warm Ochre
    low: '#4A6052',           // Slate Olive
    normal: '#2D6A4F',        // Forest Fern
  },

  // Neutral Grayscale & Surfaces (Parchment & Sand)
  neutral: {
    background: '#F7F5F0',    // Parchment (primary light background)
    surface: '#F3EFE8',       // Sand Light (elevated card surface)
    surfaceElevated: '#FAF9F5', // Soft Parchment (floating modal cards)
    surfaceSubtle: '#ECE7DE', // Sand (containers, inputs, chips)
    border: '#DCD6C8',        // Sand Border (card & element boundaries)
    borderStrong: '#C2BAA8',  // Deep Sand Border (input active borders)
    divider: '#E4DEC8',       // Sand Divider (horizontal separators)
  },

  // Text Typography Colors (Bark)
  text: {
    primary: '#1F1B16',       // Deep Bark (high-contrast, grounding primary)
    secondary: '#524C42',     // Medium Bark (readable body & metadata)
    muted: '#7D7567',         // Slate Bark (subordinate captions & notes)
    disabled: '#A8A092',      // Disabled text
    inverse: '#FAF9F5',       // Soft Parchment White (text on dark surfaces)
    brand: '#4D6331',         // Olive (brand links & active indicators)
  },

  // Common UI states & Selective Glassmorphism
  ui: {
    backdrop: 'rgba(31, 27, 22, 0.65)',
    glassBg: 'rgba(243, 239, 232, 0.86)',
    glassBorder: 'rgba(220, 214, 200, 0.75)',
    shadow: '#1F1B16',
  },
} as const;

export type ColorTheme = typeof colors;
