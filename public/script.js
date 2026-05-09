window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 60) {
    nav.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
document.querySelectorAll('input[type="date"]')[0].min = today;
document.querySelectorAll('input[type="date"]')[0].value = today;
document.querySelectorAll('input[type="date"]')[1].min = tomorrow;
document.querySelectorAll('input[type="date"]')[1].value = tomorrow;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.room-card, .highlight-card, .review-card, .offer-card, .amenity-item, .nearby-list li').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
