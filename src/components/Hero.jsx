import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import LazyScene3D from './LazyScene3D';
import BrandLogo from './BrandLogo';
import { stats } from '../data/content';
import StatCounter from './StatCounter';
import './Hero.css';

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero__brand-logo', { y: 30, opacity: 0, duration: 0.8, delay: 0.2 });
      gsap.from('.hero__title', { y: 50, opacity: 0, duration: 1, delay: 0.4 });
      gsap.from('.hero__subtitle', { y: 40, opacity: 0, duration: 0.8, delay: 0.6 });
      gsap.from('.hero__actions', { y: 30, opacity: 0, duration: 0.8, delay: 0.8 });
      gsap.from('.hero__visual', { x: 60, opacity: 0, duration: 1.2, delay: 0.5, ease: 'power3.out' });
      gsap.from('.hero__scroll', { opacity: 0, duration: 1, delay: 1.5 });
    }, heroRef);

    return () => ctx.revert();
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
            Engineering solutions that combine innovation, accuracy and reliability.
            From BIM modeling to steel detailing — we deliver excellence at every scale.
          </p>
          <div className="hero__actions">
            <a href="#services" className="btn btn-primary">
              Our Services
            </a>
            <a href="#contact" className="btn btn-outline">
              Contact Us
            </a>
          </div>
        </div>
        <div className="hero__visual">
          <LazyScene3D variant="building" />
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
