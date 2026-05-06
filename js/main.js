/* ════════════════════════════════════════════════
   AURAMED — main.js
   Menu · FAQ Accordion · Form Validation · Scroll · Cookies · Reveal
════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── DOM READY ─── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initNav();
    initFAQ();
    initForms();
    initScrollTop();
    initCookieBanner();
    initReveal();
    setActiveNavLink();
  }

  /* ════════════════════════════════════════════
     1. NAVIGATION — Hamburger + mobile menu
  ════════════════════════════════════════════ */
  function initNav() {
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('nav-mobile');
    const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    if (!hamburger || !mobileMenu) return;

    function openMenu() {
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });

    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Trap focus in mobile menu
    mobileMenu.addEventListener('keydown', (e) => {
      if (!mobileMenu.classList.contains('open')) return;
      const focusable = mobileMenu.querySelectorAll('a, button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ─── Active link highlight ─── */
  function setActiveNavLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ════════════════════════════════════════════
     2. FAQ ACCORDION
  ════════════════════════════════════════════ */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const answer  = item.querySelector('.faq-answer');
      if (!trigger || !answer) return;

      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', answer.id || generateId(answer, 'faq'));

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all others
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            const t = other.querySelector('.faq-trigger');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger.click(); }
      });
    });
  }

  function generateId(el, prefix) {
    if (!el.id) el.id = prefix + '-' + Math.random().toString(36).slice(2, 7);
    return el.id;
  }

  /* ════════════════════════════════════════════
     3. FORM VALIDATION
  ════════════════════════════════════════════ */
  function initForms() {
    document.querySelectorAll('form[data-validate]').forEach(form => {
      setupForm(form);
    });
  }

  function setupForm(form) {
    const fields = form.querySelectorAll('[data-rules]');
    const submitBtn = form.querySelector('[type="submit"]');

    // Real-time validation on blur
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      fields.forEach(field => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Success state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      // Simulate async send
      setTimeout(() => {
        showFormSuccess(form);
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.label || 'Enviar';
        form.reset();
        fields.forEach(f => { f.classList.remove('is-valid', 'is-invalid'); });
      }, 1200);
    });
  }

  function validateField(field) {
    const rules   = (field.dataset.rules || '').split('|');
    const label   = field.dataset.label || field.name || 'Este campo';
    const errorEl = document.getElementById(field.id + '-error');
    let errorMsg  = '';

    for (const rule of rules) {
      const [name, param] = rule.split(':');
      const value = field.type === 'checkbox' ? field.checked : field.value.trim();

      if (name === 'required') {
        if (!value || value === '') { errorMsg = `${label} es obligatorio.`; break; }
      }
      if (name === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { errorMsg = 'Introduce un email válido.'; break; }
      }
      if (name === 'minlength') {
        if (value.length < Number(param)) { errorMsg = `${label} debe tener al menos ${param} caracteres.`; break; }
      }
      if (name === 'maxlength') {
        if (value.length > Number(param)) { errorMsg = `${label} no puede superar ${param} caracteres.`; break; }
      }
      if (name === 'phone') {
        if (!/^[\d\s\+\-\(\)]{6,20}$/.test(value) && value !== '') { errorMsg = 'Introduce un teléfono válido.'; break; }
      }
      if (name === 'checked') {
        if (!field.checked) { errorMsg = `Debes aceptar ${label}.`; break; }
      }
    }

    const isValid = !errorMsg;
    field.classList.toggle('is-invalid', !isValid);
    field.classList.toggle('is-valid',    isValid && field.value !== '');
    field.setAttribute('aria-invalid', String(!isValid));

    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.setAttribute('role', errorMsg ? 'alert' : '');
    }

    return isValid;
  }

  function showFormSuccess(form) {
    const existing = form.querySelector('.form-success-msg');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'alert alert-success form-success-msg';
    msg.style.marginTop = '16px';
    msg.innerHTML = '<span class="alert-icon">✓</span> <span>¡Mensaje enviado! Te responderemos en menos de 24 horas.</span>';
    form.after(msg);

    setTimeout(() => msg.remove(), 6000);
  }

  /* ════════════════════════════════════════════
     4. SCROLL TO TOP
  ════════════════════════════════════════════ */
  function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ════════════════════════════════════════════
     5. COOKIE BANNER
  ════════════════════════════════════════════ */
  function initCookieBanner() {
    const banner  = document.getElementById('cookie-banner');
    const accept  = document.getElementById('cookie-accept');
    const decline = document.getElementById('cookie-decline');
    if (!banner) return;

    if (localStorage.getItem('auramed-cookies')) {
      banner.classList.add('hidden');
      return;
    }

    if (accept)  accept.addEventListener('click',  () => { localStorage.setItem('auramed-cookies', 'accepted');  banner.classList.add('hidden'); });
    if (decline) decline.addEventListener('click', () => { localStorage.setItem('auramed-cookies', 'declined'); banner.classList.add('hidden'); });
  }

  /* ════════════════════════════════════════════
     6. SCROLL REVEAL
  ════════════════════════════════════════════ */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

})();
