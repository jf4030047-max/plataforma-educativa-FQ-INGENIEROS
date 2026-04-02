const hamburger = document.getElementById('hamburger');
const navbarInner = document.querySelector('.top-bar-inner');

if (hamburger && navbarInner) {
  hamburger.addEventListener('click', () => {
    navbarInner.classList.toggle('mobile-open');
  });
}
