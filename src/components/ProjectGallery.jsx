import { useState, useEffect, useCallback, useRef } from 'react';
import { galleryImages } from '../data/gallery';
import './ProjectGallery.css';

export default function ProjectGallery() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const total = galleryImages.length;

  const goTo = useCallback(
    (index) => {
      if (total === 0) return;
      setCurrent((index + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [isPaused, goNext, total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  if (total === 0) return null;

  const slide = galleryImages[current];

  return (
    <section id="gallery" className="section project-gallery">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-tag">Project Gallery</span>
          <h2 className="section-title">Our Work in Action</h2>
          <p className="section-subtitle">
            Explore structural detailing, BIM models, and engineering deliverables from our
            completed projects around the world.
          </p>
        </div>

        <div
          className="gallery-slider fade-up"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="gallery-slider__frame glass-card">
            {galleryImages.map((image, index) => (
              <figure
                key={image.id}
                className={`gallery-slider__slide ${index === current ? 'gallery-slider__slide--active' : ''}`}
                aria-hidden={index !== current}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={index <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </figure>
            ))}

            <button
              type="button"
              className="gallery-slider__nav gallery-slider__nav--prev"
              onClick={goPrev}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-slider__nav gallery-slider__nav--next"
              onClick={goNext}
              aria-label="Next photo"
            >
              ›
            </button>

            <div className="gallery-slider__counter">
              {current + 1} / {total}
            </div>
          </div>

          <div className="gallery-slider__dots" role="tablist" aria-label="Gallery slides">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={index === current}
                aria-label={`Go to photo ${index + 1}`}
                className={`gallery-slider__dot ${index === current ? 'gallery-slider__dot--active' : ''}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>

          <p className="gallery-slider__caption">{slide.alt}</p>
        </div>
      </div>
    </section>
  );
}
