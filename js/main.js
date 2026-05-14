/**
 * main.js — Orchestrator: init sequence, loading state, error fallback
 */
(function () {
  const loader = document.getElementById('loader');

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('loader--hidden');
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 600);
  }

  function init() {
    // 1. Navigation (immediate)
    if (typeof initNavigation === 'function') initNavigation();

    // 3. Particles (non-blocking)
    if (typeof initParticles === 'function') initParticles();

    // 4. Scroll + Lenis (must run before ScrollTrigger usage)
    if (typeof initScroll === 'function') initScroll();

    // 5. Lightbox
    if (typeof initLightbox === 'function') initLightbox();

    // 6. Three.js scene (async, heaviest)
    // The ES module self-initializes and exposes window.__threeReady
    // We poll for it, then hide the loader
    let pollCount = 0;
    const maxPolls = 100; // 10 seconds at 100ms intervals

    function checkThreeReady() {
      pollCount++;
      if (window.__threeReady) {
        hideLoader();
        return;
      }
      if (window.__threeError) {
        console.warn('WebGL unavailable — running in flat mode');
        hideLoader();
        return;
      }
      if (pollCount >= maxPolls) {
        console.warn('Three.js timed out — running in flat mode');
        hideLoader();
        return;
      }
      setTimeout(checkThreeReady, 100);
    }

    // Give Three.js a moment to start loading before polling
    setTimeout(checkThreeReady, 200);

    // Wire explore button
    const exploreBtn = document.getElementById('hero-explore');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        if (window.__flyThrough) {
          window.__flyThrough();
        }
        // Scroll to gallery after a short delay
        setTimeout(() => {
          const lenis = window.__lenis;
          const gallery = document.getElementById('gallery');
          if (lenis && gallery) {
            lenis.scrollTo(gallery, { offset: 0, duration: 1.5 });
          } else if (gallery) {
            gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 600);
      });
    }

    // Contact form
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('.btn');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.textContent = 'Sent!';
          submitBtn.style.background = '#fff';
          submitBtn.style.color = '#000';
          form.reset();

          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
          }, 2500);
        }, 1000);
      });
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
