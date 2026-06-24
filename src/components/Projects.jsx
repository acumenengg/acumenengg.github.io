import { useState } from 'react';
import { projects } from '../data/content';
import './Projects.css';

export default function Projects() {
  const [showAll, setShowAll] = useState(false);
  const visibleProjects = showAll ? projects : projects.slice(0, 4);

  return (
    <section id="projects" className="section projects">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-tag">Our Projects</span>
          <h2 className="section-title">Proven Track Record</h2>
          <p className="section-subtitle">
            A portfolio of successfully delivered projects across commercial, industrial,
            and infrastructure sectors worldwide.
          </p>
        </div>

        <div className="projects__grid stagger-children">
          {visibleProjects.map((project) => (
            <article key={project.name} className="project-card">
              <div className="project-card__inner">
                <div className="project-card__front glass-card">
                  <div className="project-card__type">{project.type}</div>
                  <h3>{project.name}</h3>
                  <p className="project-card__location">{project.location}</p>
                  <div className="project-card__hover-hint">Hover for details →</div>
                </div>
                <div className="project-card__back glass-card">
                  <h3>{project.name}</h3>
                  <p className="project-card__scope">{project.scope}</p>
                  <div className="project-card__metrics">
                    <div>
                      <span className="project-card__metric-label">Manhours</span>
                      <span className="project-card__metric-value">{project.manhours}</span>
                    </div>
                    <div>
                      <span className="project-card__metric-label">Tonnage</span>
                      <span className="project-card__metric-value">{project.tonnage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="projects__cta fade-up">
          <button
            className="btn btn-outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'View All Projects'}
          </button>
        </div>
      </div>
    </section>
  );
}
