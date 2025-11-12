// Theme Manager - Handles light/dark theme switching

class ThemeManager {
  constructor() {
    this.THEME_KEY = 'app-theme';
    this.currentTheme = this.getStoredTheme() || 'dark';
    this.init();
  }

  init() {
    // Apply theme on load
    this.applyTheme(this.currentTheme);
    
    // Listen for system theme changes if auto mode
    if (this.currentTheme === 'auto') {
      this.watchSystemTheme();
    }
  }

  getStoredTheme() {
    try {
      return localStorage.getItem(this.THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }

  applyTheme(theme) {
    // Remove existing theme
    document.documentElement.removeAttribute('data-theme');
    
    // Apply new theme
    if (theme === 'light' || theme === 'dark' || theme === 'auto') {
      document.documentElement.setAttribute('data-theme', theme);
      this.currentTheme = theme;
      this.setStoredTheme(theme);
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: this.getEffectiveTheme() } 
    }));
  }

  getEffectiveTheme() {
    if (this.currentTheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  setTheme(theme) {
    this.applyTheme(theme);
    
    // Watch system theme if auto
    if (theme === 'auto') {
      this.watchSystemTheme();
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e) => {
      if (this.currentTheme === 'auto') {
        // Trigger re-render
        window.dispatchEvent(new CustomEvent('themechange', { 
          detail: { theme: e.matches ? 'dark' : 'light' } 
        }));
      }
    };

    // Remove old listener if exists
    if (this.mediaQueryListener) {
      mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }

    // Add new listener
    this.mediaQueryListener = handler;
    mediaQuery.addEventListener('change', handler);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

// Create global instance
window.themeManager = new ThemeManager();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
