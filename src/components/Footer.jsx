import { navLinks, contactInfo, companyDescription } from '../data/content';
import BrandLogo from './BrandLogo';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <BrandLogo variant="stacked" className="footer__logo" />
            <p className="footer__desc">{companyDescription}</p>
          </div>

          <div className="footer__links">
            <h4>Quick Links</h4>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__contact">
            <h4>Contact</h4>
            <p>{contactInfo.address}</p>
            <p>
              <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}>{contactInfo.phone}</a>
            </p>
            {contactInfo.emails.map((email) => (
              <p key={email}>
                <a href={`mailto:${email}`}>{email}</a>
              </p>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {year} Acumen Engineering Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
