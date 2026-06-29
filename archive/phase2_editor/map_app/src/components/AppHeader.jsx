import { Moon, Sun } from 'lucide-react';

export function AppHeader({ theme, onThemeToggle }) {
  return (
    <header className="app-header">
      <div>
        <span className="eyebrow">SPR 4862</span>
        <h1>INDOT Solar Suitability Map</h1>
      </div>
      <div className="header-actions">
        <button className="theme-toggle" onClick={onThemeToggle} title="Toggle theme" type="button">
          {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
