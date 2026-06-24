import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { technologies } from '../data/content';
import './Technologies.css';

export default function Technologies() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const items = track.children;
    const totalWidth = track.scrollWidth / 2;

    const tween = gsap.to(track, {
      x: -totalWidth,
      duration: 25,
      ease: 'none',
      repeat: -1,
    });

    const handleEnter = () => tween.pause();
    const handleLeave = () => tween.play();

    track.addEventListener('mouseenter', handleEnter);
    track.addEventListener('mouseleave', handleLeave);

    return () => {
      tween.kill();
      track.removeEventListener('mouseenter', handleEnter);
      track.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const doubled = [...technologies, ...technologies];

  return (
    <section id="technologies" className="section technologies">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-tag">Technologies</span>
          <h2 className="section-title">Tools & Software Expertise</h2>
          <p className="section-subtitle">
            We leverage industry-leading software platforms to deliver accurate,
            coordinated, and fabrication-ready engineering documentation.
          </p>
        </div>
      </div>

      <div className="technologies__slider fade-up">
        <div className="technologies__track" ref={trackRef}>
          {doubled.map((tech, i) => (
            <div key={`${tech.name}-${i}`} className="tech-logo glass-card">
              <span className="tech-logo__abbr">{tech.abbr}</span>
              <span className="tech-logo__name">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="technologies__grid fade-up">
          {technologies.map((tech) => (
            <div key={tech.name} className="tech-badge">
              <span>{tech.abbr}</span>
              {tech.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
