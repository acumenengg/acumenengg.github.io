import { useEffect, useRef } from 'react';
import HeroVisualVideo from './HeroVisualVideo';
import BrandLogo from './BrandLogo';
import { stats } from '../data/content';
import StatCounter from './StatCounter';
import './Hero.css';

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    heroRef.current?.classList.add('hero--ready');
  }, []);

  return (
    <section id="home" className="hero" ref={heroRef}>
      <div className="hero__bg" />

      <div className="container hero__grid">
        <div className="hero__content">
          <div className="hero__brand-logo">
            <BrandLogo variant="stacked" className="hero__logo-img" />
          </div>
          <h1 className="hero__title">
            Building Better Tomorrow with{' '}
            <span className="hero__highlight">Insight, Precision & Delivery</span>
          </h1>
          <p className="hero__subtitle">
            Acumen Engineering Services is your trusted engineering partner, delivering
            high-quality Rebar Detailing &amp; Bar Bending Schedules (BBS), Rebar Optimization,
            Offcut Utilization, Rebar Wastage Control Techniques, Rebar/Steel Reconciliation
            Reports, Quantity Estimation, Structural Steel Detailing, Precast Detailing, BIM
            Solutions, CAD Drawing - Drafting &amp; Detailing Services. We combine advanced technology with industry expertise to provide accurate,
            efficient, and cost-effective solutions that keep your projects on schedule and within
            budget.
          </p>
          <div className="hero__actions btn-row">
            <a href="#services" className="btn btn-primary">
              Our Services
            </a>
            <a href="#contact" className="btn btn-outline">
              Contact Us
            </a>
          </div>
        </div>

        <div className="hero__visual">
          <HeroVisualVideo />
        </div>
      </div>

      <div className="hero__stats container">
        <div className="hero__stats-grid stagger-children">
          {stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Scroll down">
        <span className="hero__scroll-text">Scroll</span>
        <span className="hero__scroll-line" />
      </a>
    </section>
  );
}
