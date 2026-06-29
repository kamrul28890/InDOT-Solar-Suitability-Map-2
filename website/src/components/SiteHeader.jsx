import { Map, Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { siteContent } from '../config/siteContent';

export function SiteHeader({ theme, onThemeToggle }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-wordmark">
          <span className="site-wordmark__marks">
            <a href={siteContent.brand.links.purdue} rel="noreferrer" target="_blank" title="Purdue University">
              <img className="site-wordmark__logo site-wordmark__logo--purdue" src={siteContent.brand.purdueLogo} alt="Purdue University" />
            </a>
            <a href={siteContent.brand.links.indot} rel="noreferrer" target="_blank" title="Indiana Department of Transportation">
              <img className="site-wordmark__logo site-wordmark__logo--indot" src={siteContent.brand.indotLogo} alt="Indiana Department of Transportation seal" />
            </a>
          </span>
          <NavLink className="site-wordmark__text" to="/">
            <span className="site-wordmark__eyebrow">{siteContent.brand.eyebrow}</span>
            <span className="site-wordmark__title">{siteContent.brand.title}</span>
          </NavLink>
        </div>
        <nav className="site-nav" aria-label="Primary navigation">
          {siteContent.nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              {item.label}
            </NavLink>
          ))}
          <NavLink className="site-nav__cta" to="/map">
            <Map size={17} aria-hidden="true" />
            Open Map
          </NavLink>
          <button onClick={onThemeToggle} type="button" aria-label="Toggle color theme">
            {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
