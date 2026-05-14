/**
 * 汤晨露 — Personal Art Portfolio
 * Single-page design with creative effects and smooth scrolling
 */
document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initNavigation();
  initSmoothScroll();
  initScrollAnimations();
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

  const hoverTargets = document.querySelectorAll('a, button, .work-card, .filter-btn');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
  });

  function animate() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animate);
  }

  cursorX = mouseX;
  cursorY = mouseY;
  animate();
}

/* ============================================
   Navigation — single-page scroll-aware
   ============================================ */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.nav__menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav__close');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  // Scroll-aware nav background
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, { passive: true });

  // Active section detection via scroll
  const sections = ['works', 'about', 'contact'];
  const navLinks = document.querySelectorAll('.nav__link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset + 120;

    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(link => {
          link.classList.remove('nav__link--active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('nav__link--active');
          }
        });
      }
    });
  }, { passive: true });

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
   Smooth Scroll — nav links & scroll-to
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('[data-scroll-to]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.scrollTo;
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
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
   Works Filter — with staggered transitions
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
          // Reset for animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          card.style.transition = 'opacity 0.5s cubic-bezier(0.65,0,0.35,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
          card.style.transitionDelay = (i * 0.06) + 's';

          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = '';
          });

          // Clean up inline transition after animation
          setTimeout(() => {
            card.style.transition = '';
            card.style.transitionDelay = '';
            card.style.opacity = '';
          }, 600 + i * 60);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px) scale(0.97)';
          card.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
          card.style.transitionDelay = '0s';

          setTimeout(() => {
            card.style.display = 'none';
            card.style.transition = '';
            card.style.transitionDelay = '';
            card.style.opacity = '';
            card.style.transform = '';
          }, 250);
        }
      });
    });
  });
}

/* ============================================
   Artwork Lightbox — warm themed
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
