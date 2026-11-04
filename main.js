/* (주)에너픽 — page behaviour. ES5 for broad browser support. */
(function () {
  'use strict';
  var doc = document;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); }
  var passive = false;
  try { window.addEventListener('t', null, Object.defineProperty({}, 'passive', { get: function () { passive = { passive: true }; } })); } catch (e) {}

  /* header shadow + to-top */
  var header = $('#siteHeader'), toTop = $('#toTop');
  function onScroll() {
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', y > 8);
    toTop.classList.toggle('is-on', y > 600);
    spy();
  }
  on(toTop, 'click', function () { window.scrollTo(0, 0); });

  /* mobile menu */
  var toggle = $('#navToggle'), menu = $('#navMenu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }
  on(toggle, 'click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { on(a, 'click', function () { setMenu(false); }); });
  on(doc, 'keydown', function (e) { if ((e.key === 'Escape' || e.keyCode === 27) && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });
  on(window, 'resize', function () { if (window.innerWidth > 960) setMenu(false); });


  /* in-page links: always scroll to the section, even when the hash is unchanged */
  $$('a[href^="#"]').forEach(function (a) {
    on(a, 'click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = doc.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      setMenu(false);
      var mt = parseFloat(window.getComputedStyle(t).scrollMarginTop) || 0;
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + (window.pageYOffset || doc.documentElement.scrollTop) - header.offsetHeight - mt;
      try { window.scrollTo({ top: y, behavior: 'smooth' }); } catch (err) { window.scrollTo(0, y); }
      if (window.history && history.replaceState) history.replaceState(null, '', id);
    });
  });
  /* scroll-spy */
  var links = $$('.nav-menu a[href^="#"]:not(.btn)');
  var ctas = $$('.nav a.btn-primary[href="#contact"]');
  var targets = links.map(function (a) { return $(a.getAttribute('href')); });
  var contactEl = $('#contact');
  function spy() {
    var line = header.offsetHeight + 80, idx = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) idx = i; });
    var atContact = contactEl && (contactEl.getBoundingClientRect().top <= line ||
      window.innerHeight + (window.pageYOffset || 0) >= doc.documentElement.scrollHeight - 4);
    if (atContact) idx = -1;
    links.forEach(function (a, i) {
      a.classList.toggle('is-active', i === idx);
      if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    ctas.forEach(function (b) {
      b.classList.toggle('is-active', !!atContact);
      if (atContact) b.setAttribute('aria-current', 'location'); else b.removeAttribute('aria-current');
    });
  }
  on(window, 'scroll', onScroll, passive);
  onScroll();

  /* reveal on scroll */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* module tabs (WAI-ARIA tabs pattern) */
  var tabs = $$('[role="tab"]');
  function select(tab) {
    tabs.forEach(function (t) {
      var sel = t === tab;
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
      t.setAttribute('tabindex', sel ? '0' : '-1');
      var p = doc.getElementById(t.getAttribute('aria-controls'));
      if (sel) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });
  }
  tabs.forEach(function (t, i) {
    on(t, 'click', function () { select(t); });
    on(t, 'keydown', function (e) {
      var k = e.key || e.keyCode, n = null;
      if (k === 'ArrowRight' || k === 39) n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowLeft' || k === 37) n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); select(n); n.focus(); }
    });
  });

  /* inverter capacity filter */
  var kwBtns = $$('.kw-btn'), chips = $$('#invTable .chip');
  kwBtns.forEach(function (b) {
    on(b, 'click', function () {
      var min = +b.getAttribute('data-min'), max = +b.getAttribute('data-max'), all = max === 9999 && min === 0;
      kwBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      chips.forEach(function (c) {
        var kw = +c.getAttribute('data-kw'), hit = kw >= min && kw <= max;
        c.classList.toggle('is-hit', !all && hit);
        c.classList.toggle('is-dim', !all && !hit);
      });
      $$('#invTable tbody tr').forEach(function (r) {
        r.classList.toggle('is-hidden', !all && !$('.chip.is-hit', r));
      });
    });
  });

  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();
