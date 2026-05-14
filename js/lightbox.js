/**
 * Project detail overlay — dark full-viewport lightbox
 */
function initLightbox() {
  const overlay = document.getElementById('project-overlay');
  if (!overlay) return;

  const overlayPlaceholder = document.getElementById('overlay-placeholder');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayMeta = document.getElementById('overlay-meta');
  const overlayDesc = document.getElementById('overlay-desc');
  const closeBtn = document.getElementById('overlay-close');

  function openOverlay(data) {
    if (overlayPlaceholder) overlayPlaceholder.textContent = data.placeholder || '';
    if (overlayTitle) overlayTitle.textContent = data.title || '';
    if (overlayMeta) overlayMeta.textContent = data.meta || '';
    if (overlayDesc) overlayDesc.textContent = data.desc || '';

    overlay.classList.add('project-overlay--open');
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    overlay.classList.remove('project-overlay--open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('project-overlay--open')) {
      closeOverlay();
    }
  });

  // Wire up gallery project-item clicks
  document.querySelectorAll('.project-item').forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.project-item__title');
      const meta = item.querySelector('.project-item__meta');
      const placeholder = item.querySelector('.project-item__preview-placeholder');

      openOverlay({
        placeholder: placeholder ? placeholder.textContent : '',
        title: title ? title.textContent : '',
        meta: meta ? meta.textContent : '',
        desc: 'This is a placeholder description for this artwork. Replace with your own detailed project description including design concept, inspiration, and creative process.'
      });
    });
  });

  // Expose for 3D card clicks
  window.__openProjectOverlay = openOverlay;
}
