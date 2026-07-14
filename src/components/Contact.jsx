import { contactInfo, siteUrl } from '../data/content';
import ContactForm from './ContactForm';
import './Contact.css';

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-tag">Contact Us</span>
          <h2 className="section-title">Let's Build Together</h2>
          <p className="section-subtitle">
            Ready to start your next project? Reach out and our team will respond within 24 hours.
          </p>
        </div>

        <div className="contact__grid">
          <div className="contact__info slide-left">
            <div className="contact__details">
              <div className="contact__detail glass-card">
                <span className="contact__detail-icon">📍</span>
                <div>
                  <h4>Address</h4>
                  <a
                    href={contactInfo.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contactInfo.address}
                  </a>
                </div>
              </div>
              <div className="contact__detail glass-card">
                <span className="contact__detail-icon">📞</span>
                <div>
                  <h4>Phone</h4>
                  <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}>{contactInfo.phone}</a>
                </div>
              </div>
              <div className="contact__detail glass-card">
                <span className="contact__detail-icon">✉</span>
                <div>
                  <h4>Email</h4>
                  <div className="contact__emails">
                    {contactInfo.emails.map((email) => (
                      <a key={email} href={`mailto:${email}`}>
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="contact__detail glass-card">
                <span className="contact__detail-icon">🌐</span>
                <div>
                  <h4>Website</h4>
                  <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                    {contactInfo.website}
                  </a>
                </div>
              </div>
              <div className="contact__detail glass-card">
                <span className="contact__detail-icon">🕐</span>
                <div>
                  <h4>Working Hours</h4>
                  <p>{contactInfo.hours}</p>
                </div>
              </div>
            </div>

            <div className="contact__map fade-up">
              <iframe
                title="Acumen Engineering Services Location"
                src={contactInfo.mapEmbed}
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                className="contact__map-link"
                href={contactInfo.mapLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

          <div className="contact__form-area slide-right">
            <div className="contact__form glass-card">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
