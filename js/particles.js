/**
 * tsparticles — minimal space dust background, performance-tuned
 */
function initParticles() {
  if (typeof tsParticles === 'undefined') return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  tsParticles.load("particles-bg", {
    particles: {
      number: { value: isMobile ? 15 : 35 },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.03, max: 0.18 },
        animation: { enable: true, speed: 0.2, sync: false }
      },
      size: {
        value: { min: 0.5, max: 1.8 },
      },
      move: {
        enable: true,
        speed: { min: 0.08, max: 0.3 },
        direction: "none",
        random: true,
        straight: false,
        outModes: "out"
      }
    },
    interactivity: {
      events: {
        onHover: { enable: false }
      }
    },
    background: { color: "transparent" },
    detectRetina: false
  });
}
