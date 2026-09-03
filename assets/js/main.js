document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('progressBar');
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ---------- Header scroll state (solid bg + hide on scroll down) ---------- */
  const header = document.getElementById('siteHeader');
  let lastScroll = 0;

  function updateHeader() {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', y > 60);
      if (y > lastScroll && y > 200) {
        header.classList.add('hide-header');
      } else {
        header.classList.remove('hide-header');
      }
    }
    lastScroll = y;
  }

  /* ---------- Back to top button ---------- */
  const backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 700);
  }
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        updateHeader();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  });
  updateProgress(); updateHeader(); updateBackToTop();

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById('burgerBtn');
  const mainNav = document.getElementById('mainNav');
  const overlay = document.getElementById('mobileOverlay');

  function closeNav() {
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }
  function toggleNav() {
    const willOpen = !mainNav.classList.contains('is-open');
    burger.classList.toggle('is-open', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
    mainNav.classList.toggle('is-open', willOpen);
    overlay.classList.toggle('is-active', willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', toggleNav);
  if (overlay) overlay.addEventListener('click', closeNav);
  document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach(el => {
    const delay = el.getAttribute('data-delay');
    if (delay) el.style.setProperty('--delay', delay + 'ms');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Hero slideshow ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let currentSlide = 0;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('is-active');
    dots[currentSlide]?.classList.remove('is-active');
    currentSlide = index;
    slides[currentSlide].classList.add('is-active');
    dots[currentSlide]?.classList.add('is-active');
  }

  if (slides.length > 1) {
    let heroTimer = setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 6000);

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        clearInterval(heroTimer);
        goToSlide(parseInt(dot.dataset.slide, 10));
        heroTimer = setInterval(() => goToSlide((currentSlide + 1) % slides.length), 6000);
      });
    });
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1500;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => counterObserver.observe(el));

  /* ---------- Structure diagram hotspots ---------- */
  const hotspots = document.querySelectorAll('.hotspot');
  const hotspotCard = document.getElementById('hotspotCard');
  const hotspotTitle = document.getElementById('hotspotTitle');
  const hotspotDesc = document.getElementById('hotspotDesc');

  hotspots.forEach(spot => {
    const show = () => {
      hotspotTitle.textContent = spot.dataset.tip;
      hotspotDesc.textContent = spot.dataset.desc;
      hotspotCard.classList.add('is-visible');
    };
    spot.addEventListener('mouseenter', show);
    spot.addEventListener('focus', show);
    spot.addEventListener('click', show);
  });
  const diagramWrap = document.querySelector('.diagram-wrap');
  if (diagramWrap) {
    diagramWrap.addEventListener('mouseleave', () => hotspotCard.classList.remove('is-visible'));
  }

  /* ---------- Lightbox gallery ---------- */
  const lbItems = Array.from(document.querySelectorAll('.lb-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let lbIndex = 0;

  function openLightbox(index) {
    lbIndex = index;
    const item = lbItems[lbIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img').alt;
    lightboxCaption.textContent = item.dataset.caption || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function showRelative(delta) {
    lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
    openLightbox(lbIndex);
  }

  lbItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showRelative(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showRelative(1));
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });

  /* ---------- Contact form -> mailto ---------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const name = data.get('name') || '';
      const company = data.get('company') || '';
      const email = data.get('email') || '';
      const phone = data.get('phone') || '';
      const type = data.get('type') || '';
      const message = data.get('message') || '';

      const subject = `Demande de devis FIT CUBE — ${name}`;
      const body =
`Nom : ${name}
Société : ${company}
Email : ${email}
Téléphone : ${phone}
Type de projet : ${type}

Message :
${message}`;

      const mailtoLink = `mailto:ayoub@bfitclub.ma?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;

      if (formNote) {
        formNote.textContent = 'Votre messagerie s\'est ouverte avec votre demande pré-remplie. Il ne reste plus qu\'à l\'envoyer !';
        formNote.style.color = '#f5a800';
      }
    });
  }

});
