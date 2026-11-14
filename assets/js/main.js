/* =========================================================
   Kelvis Antônio — interações
   ========================================================= */
(function () {
  'use strict';

  var WHATSAPP = '5582994359080';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* ---------- Pronto: dispara animações do hero ---------- */
  function ready() {
    requestAnimationFrame(function () { body.classList.add('is-ready'); });
  }
  // A cortina de abertura dura ~1,6s; o hero entra logo depois
  if (reduceMotion) { ready(); }
  else { setTimeout(ready, 1350); }

  /* ---------- Header ---------- */
  var header = document.getElementById('header');
  var lastY = window.scrollY;
  var waFloat = document.querySelector('.wa-float');

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    // Esconde o header ao rolar para baixo e mostra ao subir
    if (!body.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > 600 && y > lastY + 4);
      if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    waFloat.classList.toggle('is-visible', y > window.innerHeight * 0.7);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
    body.classList.toggle('is-locked', open);
    if (open) header.classList.remove('is-hidden');
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Reveal ao rolar ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Parallax suave (hero e CTA) ---------- */
  var heroMedia = document.querySelector('.hero__media');
  var ctaMedia = document.querySelector('.cta__media');
  var cta = document.querySelector('.cta');
  var ticking = false;

  function parallax() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    if (y < vh * 1.2) heroMedia.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
    var r = cta.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) {
      var p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      ctaMedia.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  if (!reduceMotion) {
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ---------- Link ativo no menu ---------- */
  var navLinks = document.querySelectorAll('.nav__link');
  var sections = ['inicio', 'sobre', 'areas', 'avaliacoes', 'contato']
    .map(function (id) { return document.getElementById(id); });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- Modais ---------- */
  var lastFocus = null;
  var openModalEl = null;

  function focusables(el) {
    return Array.prototype.filter.call(
      el.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null; }
    );
  }

  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    lastFocus = document.activeElement;
    openModalEl = modal;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    var panel = modal.querySelector('.modal__panel');
    panel.scrollTop = 0;
    setTimeout(function () {
      var close = modal.querySelector('.modal__close');
      if (close) close.focus();
    }, 50);
  }

  function closeModal() {
    if (!openModalEl) return;
    openModalEl.classList.remove('is-open');
    openModalEl.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    openModalEl = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-modal]');
    if (opener) { openModal(opener.dataset.openModal); return; }
    var closer = e.target.closest('[data-close-modal]');
    if (closer && openModalEl) {
      // links internos dentro do modal: fecha e segue a âncora
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!openModalEl) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
      return;
    }
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var f = focusables(openModalEl);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Formulário → WhatsApp ---------- */
  var form = document.getElementById('contact-form');
  var status = form.querySelector('.form__status');
  var tel = document.getElementById('f-tel');

  // máscara simples de telefone
  tel.addEventListener('input', function () {
    var d = tel.value.replace(/\D/g, '').slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    tel.value = out;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['f-nome', 'f-tel', 'f-msg'].forEach(function (id) {
      var input = document.getElementById(id);
      var valid = input.value.trim().length > (id === 'f-tel' ? 9 : 1);
      input.parentElement.classList.toggle('is-invalid', !valid);
      if (!valid && ok) { input.focus(); ok = false; }
    });
    var email = document.getElementById('f-email');
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.parentElement.classList.add('is-invalid');
      if (ok) email.focus();
      ok = false;
    } else {
      email.parentElement.classList.remove('is-invalid');
    }
    if (!ok) { status.textContent = 'Por favor, preencha os campos destacados.'; return; }

    var data = new FormData(form);
    var lines = [
      'Olá, Dr. Kelvis! Vim pelo site e gostaria de atendimento.',
      '',
      '*Nome:* ' + data.get('nome'),
      '*Telefone:* ' + data.get('telefone')
    ];
    if (data.get('email')) lines.push('*E-mail:* ' + data.get('email'));
    lines.push('*Assunto:* ' + data.get('tipo'));
    lines.push('', '*Minha situação:*', data.get('mensagem'));

    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
    status.textContent = 'Abrindo o WhatsApp para concluir o envio…';
    window.open(url, '_blank', 'noopener');
  });

  form.querySelectorAll('input, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      el.parentElement.classList.remove('is-invalid');
      status.textContent = '';
    });
  });

  /* ---------- Ano no rodapé ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
