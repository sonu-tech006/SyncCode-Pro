import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorPalette, fetchRandomColorTheme } from '../services/colorApi';

interface ThemeContextType {
  themeMode: 'white' | 'dark' | 'random';
  accentPalette: ColorPalette;
  editorTheme: 'vs-dark' | 'light' | 'monokai';
  fontSize: number;
  wordWrap: 'on' | 'off';
  setThemeMode: (mode: 'white' | 'dark' | 'random') => void;
  cycleRandomTheme: () => Promise<void>;
  setEditorTheme: (theme: 'vs-dark' | 'light' | 'monokai') => void;
  setFontSize: (size: number) => void;
  setWordWrap: (wrap: 'on' | 'off') => void;
}

const DEFAULT_PALETTE: ColorPalette = {
  hex: '#6366F1',
  name: 'Indigo Pulse',
  rgb: '99, 102, 241',
  contrastText: '#ffffff',
  lightBackground: 'rgba(99, 102, 241, 0.08)',
  surface: 'rgba(99, 102, 241, 0.15)',
  border: 'rgba(99, 102, 241, 0.3)'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<'white' | 'dark' | 'random'>(() => {
    return (localStorage.getItem('synccode_theme_mode') as 'white' | 'dark' | 'random') || 'dark';
  });

  const [accentPalette, setAccentPalette] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem('synccode_accent_palette');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PALETTE;
      }
    }
    return DEFAULT_PALETTE;
  });

  const [editorTheme, setEditorThemeState] = useState<'vs-dark' | 'light' | 'monokai'>(() => {
    const saved = localStorage.getItem('synccode_editor_theme');
    if (saved) return saved as any;
    return (localStorage.getItem('synccode_theme_mode') === 'white') ? 'light' : 'vs-dark';
  });

  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('synccode_font_size');
    return saved ? parseInt(saved, 10) : 14;
  });

  const [wordWrap, setWordWrapState] = useState<'on' | 'off'>(() => {
    return (localStorage.getItem('synccode_word_wrap') as 'on' | 'off') || 'on';
  });

  // Apply CSS variables and theme classes to root document and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.style.setProperty('--synccode-accent', accentPalette.hex);
    root.style.setProperty('--synccode-accent-rgb', accentPalette.rgb);
    root.style.setProperty('--synccode-contrast', accentPalette.contrastText);
    root.style.setProperty('--synccode-surface', accentPalette.surface);
    root.style.setProperty('--synccode-border', accentPalette.border);

    // Remove existing theme classes
    root.classList.remove('synccode-white-theme', 'synccode-dark-theme', 'synccode-random-theme');
    body.classList.remove('synccode-white-theme', 'synccode-dark-theme', 'synccode-random-theme');

    if (themeMode === 'white') {
      root.classList.add('synccode-white-theme');
      body.classList.add('synccode-white-theme');
      body.style.backgroundColor = '#f8fafc';
      body.style.color = '#0f172a';
    } else if (themeMode === 'random') {
      root.classList.add('synccode-random-theme');
      body.classList.add('synccode-random-theme');
      body.style.backgroundColor = '#0b0f19';
      body.style.color = '#f8fafc';
    } else {
      root.classList.add('synccode-dark-theme');
      body.classList.add('synccode-dark-theme');
      body.style.backgroundColor = '#030712';
      body.style.color = '#f8fafc';
    }
  }, [themeMode, accentPalette]);

  const setThemeMode = (mode: 'white' | 'dark' | 'random') => {
    setThemeModeState(mode);
    localStorage.setItem('synccode_theme_mode', mode);

    if (mode === 'white') {
      setEditorThemeState('light');
      localStorage.setItem('synccode_editor_theme', 'light');
    } else if (mode === 'dark') {
      setEditorThemeState('vs-dark');
      localStorage.setItem('synccode_editor_theme', 'vs-dark');
    } else if (mode === 'random') {
      cycleRandomTheme();
    }
  };

  const cycleRandomTheme = async () => {
    const newPalette = await fetchRandomColorTheme();
    setAccentPalette(newPalette);
    localStorage.setItem('synccode_accent_palette', JSON.stringify(newPalette));
  };

  const setEditorTheme = (theme: 'vs-dark' | 'light' | 'monokai') => {
    setEditorThemeState(theme);
    localStorage.setItem('synccode_editor_theme', theme);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem('synccode_font_size', size.toString());
  };

  const setWordWrap = (wrap: 'on' | 'off') => {
    setWordWrapState(wrap);
    localStorage.setItem('synccode_word_wrap', wrap);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        accentPalette,
        editorTheme,
        fontSize,
        wordWrap,
        setThemeMode,
        cycleRandomTheme,
        setEditorTheme,
        setFontSize,
        setWordWrap,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
