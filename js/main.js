document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const setActiveLink = () => {
    let currentId = sections[0] ? sections[0].id : '';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };
  setActiveLink();
  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Animated stat counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && statNums.length) {
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => statIO.observe(el));
  }

  /* ---------- Lightbox gallery ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.querySelector('img').alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };
  const showRelative = (delta) => {
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.querySelector('img').alt;
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showRelative(-1));
  lightboxNext.addEventListener('click', () => showRelative(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const phonePattern = /^\+?\d[\d\s\-()]{6,18}\d$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setError = (group, message) => {
    group.classList.toggle('error', Boolean(message));
    const errorEl = group.querySelector('.error-msg');
    if (errorEl) errorEl.textContent = message || '';
  };

  const validateField = (input) => {
    const group = input.closest('.form-group');
    if (!group) return true;

    if (input.hasAttribute('required')) {
      if (input.type === 'checkbox' && !input.checked) {
        setError(group, 'Это поле обязательно для согласия.');
        return false;
      }
      if (input.type !== 'checkbox' && !input.value.trim()) {
        setError(group, 'Это поле обязательно для заполнения.');
        return false;
      }
    }

    if (input.id === 'phone' && input.value.trim() && !phonePattern.test(input.value.trim())) {
      setError(group, 'Введите корректный номер телефона. Например: +7 900 000-00-00');
      return false;
    }

    if (input.id === 'email' && input.value.trim() && !emailPattern.test(input.value.trim())) {
      setError(group, 'Введите корректный email.');
      return false;
    }

    setError(group, '');
    return true;
  };

  if (form) {
    const fields = form.querySelectorAll('input[required], input#phone, input#email, #agree');
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('error')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formSuccess.classList.remove('show');

      const requiredFields = form.querySelectorAll('#name, #phone, #agree');
      let allValid = true;
      requiredFields.forEach(field => {
        if (!validateField(field)) allValid = false;
      });

      const emailField = document.getElementById('email');
      if (emailField.value.trim() && !validateField(emailField)) allValid = false;

      if (!allValid) {
        const firstError = form.querySelector('.form-group.error input, .form-group.error select');
        if (firstError) firstError.focus();
        return;
      }

      /* Для этого статического сайта на GitHub Pages бэкенд не подключён.
         Чтобы получать заявки, подключите форму к сервису (например, Formspree). */
      formSuccess.classList.add('show');
      form.reset();
    });
  }
});
