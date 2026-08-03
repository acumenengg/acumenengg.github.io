import confetti from 'canvas-confetti';

const CRACKER_COLORS = ['#FF8C00', '#FFB347', '#FFD700', '#FF6A00', '#FFF4E0', '#4DA6FF'];

function burst(originX, originY, angle, spread = 65) {
  confetti({
    particleCount: 42,
    angle,
    spread,
    startVelocity: 52,
    decay: 0.9,
    gravity: 1.05,
    ticks: 220,
    origin: { x: originX, y: originY },
    colors: CRACKER_COLORS,
    scalar: 1.05,
    zIndex: 9999,
    disableForReducedMotion: true,
  });
}

function sparkRing(x, y) {
  confetti({
    particleCount: 28,
    spread: 360,
    startVelocity: 28,
    origin: { x, y },
    colors: CRACKER_COLORS,
    ticks: 160,
    gravity: 0.85,
    scalar: 0.85,
    zIndex: 9999,
    disableForReducedMotion: true,
  });
}

/** Full-screen cracker burst (page open). */
export function playCrackerBurst() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  burst(0.12, 0.82, 58, 72);
  burst(0.88, 0.82, 122, 72);

  window.setTimeout(() => {
    burst(0.28, 0.75, 75, 58);
    burst(0.72, 0.75, 105, 58);
  }, 180);

  window.setTimeout(() => {
    sparkRing(0.5, 0.55);
    confetti({
      particleCount: 90,
      spread: 100,
      startVelocity: 48,
      origin: { x: 0.5, y: 0.5 },
      colors: CRACKER_COLORS,
      ticks: 240,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
  }, 360);

  window.setTimeout(() => {
    burst(0.5, 0.68, 90, 80);
  }, 520);
}

/** Shorter burst for form success (centered lower on screen). */
export function playFormSuccessCrackers() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  burst(0.2, 0.72, 62, 68);
  burst(0.8, 0.72, 118, 68);

  window.setTimeout(() => {
    sparkRing(0.5, 0.62);
    confetti({
      particleCount: 70,
      spread: 85,
      startVelocity: 44,
      origin: { x: 0.5, y: 0.58 },
      colors: CRACKER_COLORS,
      ticks: 200,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
  }, 120);

  window.setTimeout(() => {
    burst(0.5, 0.65, 90, 75);
  }, 280);
}
