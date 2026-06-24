import { useState } from 'react';
import { serviceCategories } from '../data/content';
import './Services.css';

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('steel');

  const category = serviceCategories.find((c) => c.id === activeCategory);

  return (
    <section id="services" className="section services">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-tag">Our Services</span>
          <h2 className="section-title">Comprehensive Engineering Solutions</h2>
          <p className="section-subtitle">
            From rebar detailing to full BIM coordination — we provide end-to-end
            structural engineering support tailored to your project needs.
          </p>
        </div>

        <div className="services__tabs fade-up">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              className={`services__tab ${activeCategory === cat.id ? 'services__tab--active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{ '--tab-color': cat.color }}
            >
              <span className="services__tab-icon">{cat.icon}</span>
              <span className="services__tab-label">{cat.title}</span>
            </button>
          ))}
        </div>

        <div className="services__panel fade-in" key={activeCategory}>
          <div className="services__panel-header">
            <div
              className="services__panel-icon"
              style={{ background: `${category.color}20`, color: category.color }}
            >
              {category.icon}
            </div>
            <div>
              <h3>{category.title}</h3>
              <p>Hover over each service to learn more</p>
            </div>
          </div>

          <div className="services__grid stagger-children">
            {category.services.map((service) => (
              <div key={service.name} className="service-item glass-card">
                <div className="service-item__front">
                  <span className="service-item__dot" style={{ background: category.color }} />
                  <h4>{service.name}</h4>
                </div>
                <div className="service-item__back">
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="services__illustrations fade-up">
          {serviceCategories.map((cat) => (
            <div
              key={cat.id}
              className={`services__illus-card glass-card ${activeCategory === cat.id ? 'services__illus-card--active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className="services__illus-icon" style={{ color: cat.color }}>
                {cat.icon}
              </div>
              <span>{cat.title.split('/')[0].trim()}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
