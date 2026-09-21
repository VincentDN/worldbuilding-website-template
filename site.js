'use strict';

// Progressive enhancement: navigation and image links still work without JS.
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
menuToggle.hidden = false;
const mobile = window.matchMedia('(max-width: 720px)');
function closeMenu() {
  navLinks.hidden = mobile.matches;
  menuToggle.setAttribute('aria-expanded', 'false');
}
closeMenu();
mobile.addEventListener('change', closeMenu);
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  navLinks.hidden = !open;
});
navLinks.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

document.querySelector('.carousel-controls').hidden = false;
const track = document.querySelector('.faction-track');
document.querySelectorAll('[data-slide]').forEach(button => {
  button.addEventListener('click', () => track.scrollBy({
    left: Number(button.dataset.slide) * (track.firstElementChild.offsetWidth + parseFloat(getComputedStyle(track).gap)),
    behavior: 'instant'
  }));
});

const lightbox = document.getElementById('lightbox');
document.querySelectorAll('[data-gallery]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const preview = document.getElementById('lightbox-image');
    preview.src = link.href;
    preview.alt = link.querySelector('img').alt;
    document.getElementById('lightbox-caption').textContent = link.closest('figure').querySelector('figcaption').textContent;
    lightbox.showModal();
  });
});
document.getElementById('lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
