/**
 * 汤晨露 — Personal Art Portfolio
 * Creative effects, smooth transitions, custom cursor
 */
document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initNavigation();
  initScrollAnimations();
  initPageTransitions();
  initHeroAnimation();
  initWorkFilters();
  initLightbox();
  initContactForm();
});

/* ============================================
   Custom Cursor
   ============================================ */
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(max-width: 768px)').matches) {
    if (cursor) cursor.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hover states
  const hoverTargets = document.querySelectorAll('a, button, .work-card, .featured-card, .filter-btn');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
  });

  // Smooth follow with requestAnimationFrame
  function animate() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animate);
  }

  // Initialize position
  cursorX = mouseX;
  cursorY = mouseY;
  animate();
}

/* ============================================
   Navigation
   ============================================ */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.nav__menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav__close');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  // Scroll-aware nav
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, { passive: true });

  // Active page detection
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });

  // Mobile menu
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => mobileNav.classList.add('mobile-nav--open'));
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', () => mobileNav.classList.remove('mobile-nav--open'));
  }
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('mobile-nav--open'));
  });
}

/* ============================================
   Scroll Animations (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ============================================
   Page Transitions — Smooth fade-up reveal
   ============================================ */
function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay || typeof gsap === 'undefined') return;

  // Entrance: reveal the page with a warm curtain lift
  gsap.to(overlay, {
    scaleY: 0,
    duration: 0.7,
    ease: 'power3.inOut',
    transformOrigin: 'bottom',
    delay: 0.05
  });

  // Exit: cover page on internal link click
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (!href || href.startsWith('http') || href.startsWith('#') || href === currentPage) return;

      e.preventDefault();

      // Brief content fade before overlay covers
      gsap.to('body > *:not(.page-transition):not(.cursor):not(.mobile-nav)', {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      });

      gsap.to(overlay, {
        scaleY: 1,
        duration: 0.5,
        ease: 'power3.inOut',
        transformOrigin: 'top',
        delay: 0.15,
        onComplete: () => {
          window.location.href = href;
        }
      });
    });
  });
}

/* ============================================
   Hero Entrance Animation
   ============================================ */
function initHeroAnimation() {
  const hero = document.querySelector('.hero__content');
  if (!hero || typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero__greeting', { opacity: 1, y: 0, duration: 0.6 })
    .to('.hero__name', { opacity: 1, y: 0, duration: 0.8 }, '-=0.35')
    .to('.hero__title', { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
    .to('.hero__description', { opacity: 1, y: 0, duration: 0.6 }, '-=0.35')
    .to('.hero__cta', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    .to('.hero__scroll', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
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
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const category = btn.dataset.filter;

      workCards.forEach((card, i) => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(card,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, delay: i * 0.06, ease: 'power2.out' }
            );
          }
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ============================================
   Artwork Lightbox
   ============================================ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lightboxPlaceholder = document.getElementById('lightbox-placeholder');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => {
      const placeholder = card.querySelector('.work-card__image-placeholder');
      const title = card.querySelector('.work-card__title');
      const category = card.querySelector('.work-card__category');
      const desc = card.querySelector('.work-card__desc');

      if (placeholder) lightboxPlaceholder.textContent = placeholder.textContent;
      if (title) lightboxTitle.textContent = title.textContent;
      if (category) lightboxMeta.textContent = category.textContent;
      if (desc) lightboxDesc.textContent = desc.textContent;

      lightbox.classList.add('lightbox--open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('lightbox--open')) {
      closeLightbox();
    }
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

    submitBtn.textContent = '发送中...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = '✓ 发送成功！';
      submitBtn.style.background = 'var(--accent-green)';
      submitBtn.style.color = '#fff';
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
