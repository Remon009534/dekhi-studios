AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 80,
  disable: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
});
window.addEventListener('load', () => AOS.refresh());
gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
  document.documentElement.classList.add('custom-cursor');

  const dotX  = gsap.quickTo('.cursor-dot',  'x', { duration: 0.05, ease: 'none' });
  const dotY  = gsap.quickTo('.cursor-dot',  'y', { duration: 0.05, ease: 'none' });
  const ringX = gsap.quickTo('.cursor-ring', 'x', { duration: 0.35, ease: 'power3' });
  const ringY = gsap.quickTo('.cursor-ring', 'y', { duration: 0.35, ease: 'power3' });

  const move = (e) => { dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY); };
  const over = (e) => gsap.to('.cursor-ring', {
    scale: e.target.closest('a, button, .work, label') ? 1.8 : 1,
    duration: 0.25,
  });

  window.addEventListener('mousemove', move);
  window.addEventListener('mouseover', over);

  return () => {                               // cleanup if the conditions stop matching
    document.documentElement.classList.remove('custom-cursor');
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseover', over);
  };
});
gsap.registerPlugin(ScrollTrigger);

const header = document.querySelector('header');

const hide = gsap.to(header, {
  y: () => -(header.offsetHeight + 20),
  duration: 0.35,
  ease: 'power2.out',
  paused: true,
});

ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    if (self.scroll() < 80) { hide.reverse(); return; }        // always show near the top
    self.direction === 1 ? hide.play() : hide.reverse();       // 1 = scrolling down
  },
});

header.addEventListener('focusin', () => hide.reverse());
const h1 = document.querySelector('.hero-section .center h1');
const text = h1.textContent.trim();

h1.setAttribute('aria-label', text);   // screen readers read the word, not separate letters
h1.dataset.t = text;                   // used by the Roll effect
h1.innerHTML =
  `<span class="track" data-t="${text}">` +
  [...text].map((c, i) =>
    `<span class="L" aria-hidden="true"><span class="in" data-c="${c}" style="--i:${i}">${c}</span></span>`
  ).join('') +
  '</span>';
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');

const setOpen = (open) => {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.textContent = open ? 'Close' : 'Menu';
};
toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
nav.addEventListener('click', (e) => e.target.closest('a, button') && setOpen(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
gsap.registerPlugin(ScrollTrigger);

const bar = document.querySelector('header .grid-container');
const sections = document.querySelectorAll(
  '.hero-section, .work-section, .service-section, .about-section, .contact-section, footer'
);

const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g)
    .map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const textOn = (hex) => (ratio(hex, '#171717') >= ratio(hex, '#F4EFE5') ? '#171717' : '#F4EFE5');

function apply(sec) {
  const cs = getComputedStyle(sec);
  const v = (name) => cs.getPropertyValue(name).trim();
  const bg = v('--bg'), fg = v('--fg'), btn = v('--btn');

  const btnBg = ratio(btn, fg) >= 2.5 ? btn : bg;          // keep the header button visible
  bar.style.setProperty('--hbg', fg);                      // inverted bar
  bar.style.setProperty('--hfg', bg);
  bar.style.setProperty('--hbtn', btnBg);
  bar.style.setProperty('--hbtn-text', textOn(btnBg));
}

sections.forEach((sec) =>
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 40px',
    end: 'bottom 40px',
    onToggle: (self) => self.isActive && apply(sec),
  })
);
apply(sections[0]);
window.addEventListener('load', () => ScrollTrigger.refresh());