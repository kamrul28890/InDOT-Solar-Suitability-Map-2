import { Link } from 'react-router-dom';

import { siteContent } from '../config/siteContent';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <strong>{siteContent.brand.title}</strong>
          <p>{siteContent.footer.blurb}</p>
          <p>{siteContent.footer.copyright}</p>
        </div>
        <div className="site-footer__navs">
          <nav className="site-footer__links" aria-label="Footer resource links">
            <strong>Resources</strong>
            {siteContent.footer.resources.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
          <nav className="site-footer__links" aria-label="Footer legal links">
            <strong>Site</strong>
            {siteContent.footer.legal.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="site-footer__contact">
            <strong>Contact</strong>
            <a href={`mailto:${siteContent.contact.email}`}>Email S2-HUB Lab</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
