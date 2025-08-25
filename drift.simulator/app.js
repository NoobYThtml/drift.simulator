/* =========================================================
   Astra Studio — Interactive behaviors
   ========================================================= */

// Helper: $ and $$ selectors
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

// Year in footer
$('#year').textContent = new Date().getFullYear();

// Mobile nav toggle
const header = $('[data-header]');
const nav = $('#site-nav');
const navToggle = $('.nav-toggle');

function closeNav() {
  nav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
$$('a[data-navlink]').forEach(link => link.addEventListener('click', closeNav));

// Scroll spy (highlight current section)
const navLinks = $$('a[data-navlink]');
const sections = navLinks.map(a => $(a.getAttribute('href')));
const spyObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  },
  { threshold: 0.6 }
);
sections.forEach(s => spyObserver.observe(s));

// Theme toggle (persisted)
const themeToggle = $('[data-theme-toggle]');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const storedTheme = localStorage.getItem('theme');
const applyTheme = t => document.documentElement.setAttribute('data-theme', t);
applyTheme(storedTheme || (prefersLight ? 'light' : 'dark'));

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

// Scroll reveal animations
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting)),
  { threshold: 0.14 }
);
$$('[data-animate]').forEach(el => revealObserver.observe(el));

// Portfolio filtering
const chips = $$('.chip');
const projects = $$('.project');
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
    chip.classList.add('is-active'); chip.setAttribute('aria-pressed', 'true');

    const cat = chip.dataset.filter;
    projects.forEach(card => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.style.display = show ? '' : 'none';
    });
  });
});

// Testimonial slider (no deps)
const slider = $('[data-slider]');
if (slider) {
  const slides = $$('.slide', slider);
  const prev = $('.prev', slider);
  const next = $('.next', slider);
  let index = 0;

  const update = dir => {
    slides[index].classList.remove('is-active');
    index = (index + dir + slides.length) % slides.length;
    slides[index].classList.add('is-active');
  };
  prev.addEventListener('click', () => update(-1));
  next.addEventListener('click', () => update(1));

  // Auto-advance
  let timer = setInterval(() => update(1), 5000);
  slider.addEventListener('pointerenter', () => clearInterval(timer));
  slider.addEventListener('pointerleave', () => (timer = setInterval(() => update(1), 5000)));

  // Keyboard
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') update(-1);
    if (e.key === 'ArrowRight') update(1);
  });
}

// Blog cards (mock data)
const BLOG_POSTS = [
  {
    title: "Ship faster with a performance budget",
    date: "2025-06-03",
    img: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=1200&auto=format&fit=crop",
    excerpt: "A practical approach to keeping sites fast as scope grows.",
    tags: ["Performance","Process"]
  },
  {
    title: "Design tokens that scale",
    date: "2025-04-19",
    img: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop",
    excerpt: "How to set up a resilient token system across platforms.",
    tags: ["Design System"]
  },
  {
    title: "Accessibility QA checklist",
    date: "2025-02-10",
    img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Our go‑to checks for inclusive interfaces.",
    tags: ["A11y"]
  }
];

// Render blog
const blogGrid = $('#blog-grid');
if (blogGrid) {
  blogGrid.innerHTML = BLOG_POSTS.map(p => `
    <article class="post">
      <img src="${p.img}" alt="">
      <div class="post-body">
        <h3>${p.title}</h3>
        <p class="meta">${new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} • ${p.tags.join(' · ')}</p>
        <p>${p.excerpt}</p>
        <a class="card-link" href="#">Read more →</a>
      </div>
    </article>
  `).join('');
}

// Contact form validation (client-side)
const form = $('#contact-form');
const output = $('#form-output');

function setError(input, msg = '') {
  const row = input.closest('.form-row');
  const small = $('.error', row);
  small.textContent = msg;
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (form) {
  form.addEventListener('input', e => {
    const t = e.target;
    if (t.name === 'email') setError(t, validateEmail(t.value) ? '' : 'Enter a valid email');
    if (t.name === 'name') setError(t, t.value.trim().length >= 2 ? '' : 'Please enter your name');
    if (t.name === 'message') setError(t, t.value.trim().length >= 20 ? '' : 'Minimum 20 characters');
    if (t.name === 'budget') setError(t, t.value ? '' : 'Select a budget');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    // Basic validation
    setError($('#name'), data.name?.trim().length >= 2 ? '' : 'Please enter your name');
    setError($('#email'), validateEmail(data.email) ? '' : 'Enter a valid email');
    setError($('#budget'), data.budget ? '' : 'Select a budget');
    setError($('#message'), data.message?.trim().length >= 20 ? '' : 'Minimum 20 characters');

    const hasError = $$('.error').some(el => el.textContent.length > 0);
    if (hasError) { output.textContent = 'Please fix the errors above.'; output.style.color = 'var(--danger)'; return; }

    // Simulated submit (replace with your endpoint)
    try {
      await new Promise(res => setTimeout(res, 600));
      output.textContent = 'Thanks! Your message was sent successfully. We’ll be in touch shortly.';
      output.style.color = 'var(--success)';
      form.reset();
    } catch {
      output.textContent = 'Oops! Something went wrong. Please try again.';
      output.style.color = 'var(--danger)';
    }
  });
}

// Reduce motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-animate]').forEach(el => el.style.animation = 'none');
}
