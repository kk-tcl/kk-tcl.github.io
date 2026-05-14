/**
 * Lenis smooth scroll + GSAP ScrollTrigger animations
 */
function initScroll() {
  if (typeof Lenis === 'undefined') return;
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Lenis smooth scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Expose scroll value globally for Three.js scene
  window.__lenisScrollY = 0;
  lenis.on('scroll', ({ scroll }) => {
    window.__lenisScrollY = scroll;
  });

  // Integrate with GSAP ticker
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Scroll-triggered reveal animations
  const animateEls = document.querySelectorAll('[data-animate]');
  if (animateEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animateEls.forEach(el => observer.observe(el));
  }

  // Gallery filter functionality
  initGalleryFilters();

  // Handle anchor links with Lenis scrollTo
  document.querySelectorAll('[data-scroll-to]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.scrollTo;
      const target = document.getElementById(targetId);
      if (target) {
        lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      }
    });
  });

  // Store lenis instance globally
  window.__lenis = lenis;
}

function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const category = btn.dataset.filter;

      projectItems.forEach((item, i) => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = 'grid';
          item.style.opacity = '0';
          item.style.transform = 'translateY(16px)';
          item.style.transition = 'opacity 0.5s cubic-bezier(0.19,1,0.22,1), transform 0.5s cubic-bezier(0.19,1,0.22,1)';
          item.style.transitionDelay = (i * 0.05) + 's';

          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = '';
          });

          setTimeout(() => {
            item.style.transition = '';
            item.style.transitionDelay = '';
            item.style.opacity = '';
          }, 500 + i * 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(12px)';
          item.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';

          setTimeout(() => {
            item.style.display = 'none';
            item.style.transition = '';
            item.style.opacity = '';
            item.style.transform = '';
          }, 250);
        }
      });
    });
  });
}
