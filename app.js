const motion = matchMedia('(prefers-reduced-motion: reduce)');
const benefitsSection = document.querySelector('.benefits');
const benefits = [...document.querySelectorAll('.benefit-list li')];
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('open', open);
});
menu.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !motion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealElements.forEach(element => observer.observe(element));
  document.documentElement.classList.add('js-motion');
}

let ticking = false;
function updateBenefits() {
  ticking = false;
  const range = benefitsSection.offsetHeight - innerHeight;
  const progress = Math.max(0, Math.min(1, -benefitsSection.getBoundingClientRect().top / Math.max(1, range)));
  benefits.forEach((item, index) => item.classList.toggle('visible', motion.matches || progress >= (index + 1) / (benefits.length + 1)));
}
function queueUpdate() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateBenefits);
  }
}
addEventListener('scroll', queueUpdate, { passive: true });
addEventListener('resize', queueUpdate);
motion.addEventListener('change', () => {
  if (motion.matches) document.querySelectorAll('.reveal').forEach(element => element.classList.add('in-view'));
  queueUpdate();
});
updateBenefits();
