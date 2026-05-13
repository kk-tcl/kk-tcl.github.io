/**
 * Personal Website — Main JavaScript
 * Handles: tsParticles, GSAP animations, navigation, scroll effects, form handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initPageTransitions();
  initParticles();
  initHeroAnimation();
  initWorkFilters();
  initContactForm();
  initCounters();
});

/* ============================================
   Navigation
   ============================================ */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.nav__menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav__close');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Highlight current page link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });

  // Mobile menu
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.add('mobile-nav--open');
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      mobileNav.classList.remove('mobile-nav--open');
    });
  }
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('mobile-nav--open');
    });
  });
}

/* ============================================
   Scroll Animations (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (animatedElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

/* ============================================
   Page Transitions
   ============================================ */
function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Entrance: reveal page
  gsap.to(overlay, {
    scaleY: 0,
    duration: 0.8,
    ease: 'power4.inOut',
    transformOrigin: 'bottom',
    delay: 0.1
  });

  // Exit: clicking internal links
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // Skip if external or same page
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      e.preventDefault();
      gsap.to(overlay, {
        scaleY: 1,
        duration: 0.5,
        ease: 'power4.inOut',
        transformOrigin: 'top',
        onComplete: () => {
          window.location.href = href;
        }
      });
    });
  });
}

/* ============================================
   tsParticles Background
   ============================================ */
function initParticles() {
  const container = document.getElementById('particles-js');
  if (!container || typeof tsParticles === 'undefined') return;

  tsParticles.load('particles-js', {
    fullScreen: false,
    fpsLimit: 60,
    particles: {
      number: {
        value: 50,
        density: { enable: true, area: 800 }
      },
      color: { value: '#00e5ff' },
      shape: { type: 'circle' },
      opacity: {
        value: 0.15,
        random: true,
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.05
        }
      },
      size: {
        value: 2,
        random: true
      },
      links: {
        enable: true,
        distance: 150,
        color: '#00e5ff',
        opacity: 0.08,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'bounce' }
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab'
        }
      },
      modes: {
        grab: {
          distance: 180,
          links: { opacity: 0.3, color: '#00e5ff' }
        }
      }
    },
    detectRetina: true
  });
}

/* ============================================
   Hero Entrance Animation (GSAP)
   ============================================ */
function initHeroAnimation() {
  const hero = document.querySelector('.hero__content');
  if (!hero || typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero__greeting', { opacity: 1, y: 0, duration: 0.6 })
    .to('.hero__name', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
    .to('.hero__title', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero__description', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    .to('.hero__cta', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    .to('.hero__scroll', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
}

/* ============================================
   Works Filter
   ============================================ */
function initWorkFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const category = btn.dataset.filter;

      // Filter cards
      workCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
          // Stagger reveal
          gsap.fromTo(card,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
          );
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ============================================
   Contact Form
   ============================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;

    // Simulate submission
    submitBtn.textContent = '发送中...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = '✓ 发送成功！';
      submitBtn.style.background = 'var(--accent-green)';
      submitBtn.style.color = 'var(--bg-primary)';
      form.reset();

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
      }, 2500);
    }, 1200);
  });
}

/* ============================================
   Counter Animation
   ============================================ */
function initCounters() {
  const counters = document.querySelectorAll('.stat-item__number[data-count]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out curve
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          el.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}
