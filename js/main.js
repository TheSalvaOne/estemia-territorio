/* =============================================================================
   ESTEMIA · main.js
   Convención: kebab-case · BEM state classes (is-open, is-visible, is-active)
   Módulos: Nav · FAQ · Forms · ScrollTop · Cookies · Reveal · Counter
   ============================================================================= */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initFAQ();
    initForms();
    initScrollTop();
    initCookieBanner();
    initReveal();
    setActiveNavLink();
    initCounters();
  });

  /* ==================================================================
     1. NAVEGACIÓN
     ================================================================== */
  function initNav() {
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('nav-mobile');

    if (!hamburger || !mobileMenu) return;

    const mobileLinks = mobileMenu.querySelectorAll('a');

    function openMenu() {
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });

    // Focus trap en menú móvil
    mobileMenu.addEventListener('keydown', e => {
      if (!mobileMenu.classList.contains('is-open')) return;
      const focusable = mobileMenu.querySelectorAll('a, button');
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Enlace activo en nav
     ------------------------------------------------------------------ */
  function setActiveNavLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
      const href = (link.getAttribute('href') || '').split('/').pop();
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('is-active');
      }
    });
  }

  /* ==================================================================
     2. FAQ ACORDEÓN
     ================================================================== */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const answer  = item.querySelector('.faq-answer');
      if (!trigger || !answer) return;

      // Asigna id si no tiene
      if (!answer.id) answer.id = 'faq-' + Math.random().toString(36).slice(2, 7);

      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', answer.id);

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Cierra todos los demás
        items.forEach(other => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            const t = other.querySelector('.faq-trigger');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });

      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger.click(); }
      });
    });
  }

  /* ==================================================================
     3. VALIDACIÓN DE FORMULARIOS
     ================================================================== */
  function initForms() {
    document.querySelectorAll('form[data-validate]').forEach(form => {
      setupForm(form);
    });
  }

  function setupForm(form) {
    const fields    = form.querySelectorAll('[data-rules]');
    const submitBtn = form.querySelector('[type="submit"]');

    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let isValid = true;

      fields.forEach(field => {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simula envío
      if (submitBtn) {
        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span>';

        setTimeout(() => {
          showFormSuccess(form);
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          form.reset();
          fields.forEach(f => f.classList.remove('is-valid', 'is-invalid'));
        }, 1300);
      }
    });
  }

  function validateField(field) {
    const rules  = (field.dataset.rules || '').split('|').filter(Boolean);
    const label  = field.dataset.label || 'Este campo';
    const errorEl = document.getElementById(field.id + '-error');
    let errorMsg  = '';

    for (const rule of rules) {
      const [name, param] = rule.split(':');
      const value = field.type === 'checkbox' ? field.checked : field.value.trim();

      if (name === 'required') {
        if (!value && value !== false) { errorMsg = `${label} es obligatorio.`; break; }
      }
      if (name === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
          errorMsg = 'Introduce un email válido.'; break;
        }
      }
      if (name === 'minlength') {
        if (field.value.trim().length < Number(param)) {
          errorMsg = `${label} debe tener al menos ${param} caracteres.`; break;
        }
      }
      if (name === 'maxlength') {
        if (field.value.trim().length > Number(param)) {
          errorMsg = `${label} no puede superar ${param} caracteres.`; break;
        }
      }
      if (name === 'phone') {
        if (field.value.trim() && !/^[\d\s\+\-\(\)]{6,20}$/.test(field.value.trim())) {
          errorMsg = 'Introduce un teléfono válido.'; break;
        }
      }
      if (name === 'checked') {
        if (!field.checked) { errorMsg = `Debes aceptar este campo.`; break; }
      }
    }

    const valid = !errorMsg;
    field.classList.toggle('is-invalid', !valid);
    field.classList.toggle('is-valid',    valid && field.value !== '');
    field.setAttribute('aria-invalid', String(!valid));

    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.setAttribute('role', errorMsg ? 'alert' : '');
    }

    return valid;
  }

  function showFormSuccess(form) {
    // Elimina mensaje previo
    const existing = form.parentElement.querySelector('.form-success-msg');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'alert alert--success form-success-msg mt-2';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.innerHTML =
      '<i class="bi bi-check-circle-fill alert__icon"></i>' +
      '<span>¡Mensaje enviado correctamente! Te responderemos en menos de 24 horas.</span>';

    form.insertAdjacentElement('afterend', msg);
    setTimeout(() => { if (msg.parentElement) msg.remove(); }, 7000);
  }

  /* ==================================================================
     4. SCROLL TO TOP
     ================================================================== */
  function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==================================================================
     5. COOKIE BANNER
     ================================================================== */
  function initCookieBanner() {
    const banner  = document.getElementById('cookie-banner');
    const accept  = document.getElementById('cookie-accept');
    const decline = document.getElementById('cookie-decline');
    if (!banner) return;

    if (localStorage.getItem('estemia-cookies')) {
      banner.classList.add('is-hidden');
      return;
    }

    const hide = (pref) => {
      localStorage.setItem('estemia-cookies', pref);
      banner.classList.add('is-hidden');
    };

    if (accept)  accept.addEventListener('click',  () => hide('accepted'));
    if (decline) decline.addEventListener('click', () => hide('declined'));
  }

  /* ==================================================================
     6. SCROLL REVEAL
     ================================================================== */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .reveal--right, .reveal--left, .reveal--scale')
        .forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal--right, .reveal--left, .reveal--scale')
      .forEach(el => observer.observe(el));
  }

  /* ==================================================================
     7. CONTADORES ANIMADOS (stats)
     ================================================================== */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const prefix   = el.dataset.prefix  || '';
    const suffix   = el.dataset.suffix  || '';
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

})();
