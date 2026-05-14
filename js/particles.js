/**
 * tsparticles — subtle space dust background
 */
function initParticles() {
  if (typeof tsParticles === 'undefined') return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  tsParticles.load("particles-bg", {
    particles: {
      number: { value: isMobile ? 30 : 60 },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.03, max: 0.2 },
        animation: { enable: true, speed: 0.3, sync: false }
      },
      size: {
        value: { min: 0.5, max: 2 },
        animation: { enable: true, speed: 0.8, sync: false }
      },
      move: {
        enable: true,
        speed: { min: 0.1, max: 0.4 },
        direction: "none",
        random: true,
        straight: false,
        outModes: "out"
      }
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" }
      },
      modes: {
        repulse: { distance: 60, duration: 0.4 }
      }
    },
    background: { color: "transparent" },
    detectRetina: true
  });
}
