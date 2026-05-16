const THEME_STORAGE_KEY = 'campusReadyTheme';

export const themes = {
  light: 'light-theme',
  dark: 'dark-theme',
};

export const getSavedTheme = () => {
  if (typeof window === 'undefined') {
    return themes.light;
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === themes.dark || stored === themes.light) {
    return stored;
  }

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? themes.dark
    : themes.light;
};

export const saveTheme = (theme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.remove(themes.light, themes.dark);
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme === themes.dark ? 'dark' : 'light';
};
