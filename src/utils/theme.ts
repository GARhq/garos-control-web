export interface GarosPreferences {
  theme: 'dark' | 'light' | 'cyberpunk' | 'slate';
  accentColor: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose';
  telemetryInterval: number; // in seconds
  soundAlerts: boolean;
  thermalWarningSound: boolean;
  loginNotifications: boolean;
  language: 'pt-BR' | 'en-US';
}

export const defaultPreferences: GarosPreferences = {
  theme: 'dark',
  accentColor: 'cyan',
  telemetryInterval: 5,
  soundAlerts: true,
  thermalWarningSound: true,
  loginNotifications: true,
  language: 'pt-BR',
};

export function getSavedPreferences(): GarosPreferences {
  const saved = localStorage.getItem('garos_user_preferences');
  if (saved) {
    try {
      return { ...defaultPreferences, ...JSON.parse(saved) };
    } catch (e) {
      return defaultPreferences;
    }
  }
  return defaultPreferences;
}

export function applyTheme(prefs?: GarosPreferences) {
  const current = prefs || getSavedPreferences();
  const root = document.documentElement;

  // Remove previous theme & accent classes
  root.classList.remove(
    'theme-dark', 'theme-light', 'theme-cyberpunk', 'theme-slate',
    'accent-cyan', 'accent-emerald', 'accent-amber', 'accent-purple', 'accent-rose'
  );

  // Add theme class
  if (current.theme) {
    root.classList.add(`theme-${current.theme}`);
  }

  // Add accent class
  if (current.accentColor) {
    root.classList.add(`accent-${current.accentColor}`);
  }

  // Set attributes for additional CSS selectors
  root.setAttribute('data-theme', current.theme || 'dark');
  root.setAttribute('data-accent', current.accentColor || 'cyan');
}
