import { useState } from 'react';
import { contactInfo, socialLinks, formEndpoint } from '../data/content';
import LazyScene3D from './LazyScene3D';
import './Contact.css';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch(formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          message: formState.message,
          _subject: 'New inquiry from Acumen Engineering Website',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormState({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

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
                  <p>{contactInfo.address}</p>
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
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </div>
              </div>
              <div className="contact__detail glass-card">
                <span className="contact__detail-icon">🌐</span>
                <div>
                  <h4>Website</h4>
                  <a href={`https://${contactInfo.website}`} target="_blank" rel="noopener noreferrer">
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

            <div className="contact__social fade-up">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact__social-link"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
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
            </div>
          </div>

          <div className="contact__form-area slide-right">
            <div className="contact__visual">
              <LazyScene3D variant="office" />
            </div>
            <form className="contact__form glass-card" onSubmit={handleSubmit}>
              <h3>Send Us a Message</h3>
              <div className="contact__form-row">
                <div className="contact__field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="contact__field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                  />
                </div>
              </div>
              <div className="contact__field">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="contact__field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us about your project..."
                />
              </div>
              <button type="submit" className="btn btn-primary contact__submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'success' && (
                <p className="contact__status contact__status--success">
                  Thank you! We'll get back to you shortly.
                </p>
              )}
              {status === 'error' && (
                <p className="contact__status contact__status--error">
                  Something went wrong. Please email us at {contactInfo.email}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
