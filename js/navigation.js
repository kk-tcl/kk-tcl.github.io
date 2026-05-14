/**
 * Navigation — scroll-aware state, mobile menu, smooth scroll
 */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.nav__menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav__close');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  // Scroll-aware nav background
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, { passive: true });

  // Active section detection
  const sections = ['hero', 'gallery', 'about', 'contact'];
  const navLinks = document.querySelectorAll('.nav__link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;

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

/**
 * Smooth scroll for nav links
 */
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
