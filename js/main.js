(() => {
  document.documentElement.classList.add('js');
  const WA = '5582994359080';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: translucent material once content scrolls under it
  const header = document.querySelector('[data-header]');
  const waFloat = document.querySelector('[data-wa-float]');
  const hero = document.querySelector('.hero');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (waFloat && hero) waFloat.classList.toggle('is-visible', y > hero.offsetHeight * 0.7);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const menuBtn = document.querySelector('[data-menu-btn]');
  const menu = document.querySelector('[data-menu]');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.sr').textContent = open ? 'Fechar menu' : 'Abrir menu';
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', () => setMenu(false));

  // Areas accordion (one open at a time; state lives on aria-expanded)
  const areas = [...document.querySelectorAll('[data-area]')];
  const sync = (area) => {
    const open = area.querySelector('.area-btn').getAttribute('aria-expanded') === 'true';
    area.classList.toggle('is-open', open);
    area.querySelector('.area-panel').inert = !open;
  };
  areas.forEach((area) => {
    sync(area);
    area.querySelector('.area-btn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      areas.forEach((a) => { a.querySelector('.area-btn').setAttribute('aria-expanded', 'false'); sync(a); });
      btn.setAttribute('aria-expanded', String(willOpen));
      sync(area);
    });
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // Form → WhatsApp
  const form = document.querySelector('[data-form]');
  if (form) {
    const nome = form.elements.nome;
    const err = document.getElementById('f-nome-err');
    const showErr = (on) => { err.hidden = !on; nome.setAttribute('aria-invalid', String(on)); };
    nome.addEventListener('input', () => { if (nome.value.trim()) showErr(false); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = nome.value.trim();
      if (!n) { showErr(true); nome.focus(); return; }
      const area = form.elements.area.value;
      const msg = form.elements.mensagem.value.trim();
      let text = `Olá, Dr. Kelvis. Meu nome é ${n}. Vim pelo site e gostaria de atendimento sobre: ${area}.`;
      if (msg) text += `\n\n${msg}`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });
  }

  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
