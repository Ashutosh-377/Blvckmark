document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.getElementById('menu-icon');
  const overlayMenu = document.getElementById('overlay-menu');
  const closeOverlay = document.getElementById('close');

  const openCartBtn = document.getElementById('openCart');
  const closeCartBtn = document.getElementById('closeCart');
  const cartSlide = document.getElementById('cartSlide');

  // Toggle overlay menu
  menuIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    overlayMenu.classList.toggle('active');
    cartSlide.classList.remove('show'); // Close cart if open
  });

  closeOverlay.addEventListener('click', () => {
    overlayMenu.classList.remove('active');
  });

  // Close overlay on link click
  document.querySelectorAll('.overlay-menu a').forEach(link => {
    link.addEventListener('click', () => {
      overlayMenu.classList.remove('active');
    });
  });

  // Toggle cart slide
  openCartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cartSlide.classList.add('show');
    overlayMenu.classList.remove('active'); // Close menu if open
  });

  closeCartBtn.addEventListener('click', () => {
    cartSlide.classList.remove('show');
  });

  // Hide cart if clicking outside
  window.addEventListener('click', (e) => {
    if (!cartSlide.contains(e.target) && !openCartBtn.contains(e.target)) {
      cartSlide.classList.remove('show');
    }
  });
});
