import { useState } from 'react';
import { contactForm } from '../data/content';
import { submitGoogleForm } from '../lib/submitGoogleForm';

const INITIAL = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status === 'error') {
      setStatus('idle');
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (!fullName || !email || !phone || !message) {
      setStatus('error');
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setError('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');

    try {
      await submitGoogleForm(contactForm.actionUrl, {
        [contactForm.fields.fullName]: fullName,
        [contactForm.fields.email]: email,
        [contactForm.fields.phone]: phone,
        [contactForm.fields.message]: message,
      });

      setForm(INITIAL);
      setStatus('success');
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again or contact us directly.');
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <h3 className="contact-form__title">Send Us a Message</h3>
      <p className="contact-form__hint">Fields marked with * are required.</p>

      <div className="contact__form-row">
        <div className="contact__field">
          <label htmlFor="contact-fullName">Full Name *</label>
          <input
            id="contact-fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="contact__field">
          <label htmlFor="contact-email">Email Address *</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="contact__field">
        <label htmlFor="contact-phone">Phone *</label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="contact__field contact__field--message">
        <label htmlFor="contact-message">Message *</label>
        <textarea
          id="contact-message"
          name="message"
          rows={3}
          value={form.message}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary contact__submit"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Sending…' : 'Submit'}
      </button>

      {status === 'success' && (
        <p className="contact__status contact__status--success" role="status">
          Thank you! Your message has been sent. We will respond within 24 hours.
        </p>
      )}

      {status === 'error' && error && (
        <p className="contact__status contact__status--error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
