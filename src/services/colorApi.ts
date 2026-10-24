/**
 * Service for fetching random harmonious colors via The Color API
 * with automatic fallback and contrast calculation.
 */

export interface ColorPalette {
  hex: string;
  name: string;
  rgb: string;
  contrastText: string;
  lightBackground: string;
  surface: string;
  border: string;
}

// Fallback high-contrast curated developer palettes
const FALLBACK_PALETTES: ColorPalette[] = [
  { hex: '#6366F1', name: 'Indigo Core', rgb: '99, 102, 241', contrastText: '#ffffff', lightBackground: '#f5f7ff', surface: '#eef2ff', border: '#c7d2fe' },
  { hex: '#0EA5E9', name: 'Electric Sky', rgb: '14, 165, 233', contrastText: '#ffffff', lightBackground: '#f0f9ff', surface: '#e0f2fe', border: '#bae6fd' },
  { hex: '#10B981', name: 'Emerald Sync', rgb: '16, 185, 129', contrastText: '#ffffff', lightBackground: '#ecfdf5', surface: '#d1fae5', border: '#a7f3d0' },
  { hex: '#8B5CF6', name: 'Deep Violet', rgb: '139, 92, 246', contrastText: '#ffffff', lightBackground: '#f5f3ff', surface: '#ede9fe', border: '#ddd6fe' },
  { hex: '#F59E0B', name: 'Amber Glow', rgb: '245, 158, 11', contrastText: '#ffffff', lightBackground: '#fffbeb', surface: '#fef3c7', border: '#fde68a' },
  { hex: '#EC4899', name: 'Neon Rose', rgb: '236, 72, 153', contrastText: '#ffffff', lightBackground: '#fdf2f8', surface: '#fce7f3', border: '#fbcfe8' },
  { hex: '#14B8A6', name: 'Teal Matrix', rgb: '20, 184, 166', contrastText: '#ffffff', lightBackground: '#f0fdfa', surface: '#ccfbf1', border: '#99f6e4' }
];

function getRelativeLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export async function fetchRandomColorTheme(): Promise<ColorPalette> {
  try {
    // Generate a random vibrant hex (avoiding overly dark or invisible pastels)
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`https://www.thecolorapi.com/id?hex=${randomHex}&format=json`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`The Color API responded with ${response.status}`);
    }

    const data = await response.json();
    const r = data.rgb?.r ?? 99;
    const g = data.rgb?.g ?? 102;
    const b = data.rgb?.b ?? 241;
    const hex = data.hex?.value ?? `#${randomHex}`;
    const name = data.name?.value ?? 'Custom Accent';

    // Contrast text calculation according to WCAG standards
    const luminance = getRelativeLuminance(r, g, b);
    const contrastText = luminance > 0.45 ? '#0f172a' : '#ffffff';

    return {
      hex,
      name,
      rgb: `${r}, ${g}, ${b}`,
      contrastText,
      lightBackground: `rgba(${r}, ${g}, ${b}, 0.06)`,
      surface: `rgba(${r}, ${g}, ${b}, 0.12)`,
      border: `rgba(${r}, ${g}, ${b}, 0.28)`
    };
  } catch (err) {
    console.warn('The Color API unavailable, applying local curated palette fallback:', err);
    // Pick random from curated fallback
    const fallback = FALLBACK_PALETTES[Math.floor(Math.random() * FALLBACK_PALETTES.length)];
    return fallback;
  }
}
