(function () {
  'use strict';

  /* mobile menu */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobilemenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') menu.classList.remove('open');
    });
  }

  /* footer year */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  /* scroll reveals */
  var items = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Framer-style lerp smooth scroll (desktop, motion-safe only) */
  var page = document.getElementById('page');
  if (page && !reduce && !coarse) {
    page.classList.add('smooth');
    var target = window.scrollY, current = target, raf;

    function setHeight() {
      document.body.style.height = page.getBoundingClientRect().height + 'px';
    }
    setHeight();
    window.addEventListener('resize', setHeight);
    window.addEventListener('load', setHeight);
    setTimeout(setHeight, 700);           /* after fonts settle */
    setInterval(setHeight, 2500);         /* accordion opens etc. */

    function loop() {
      target = window.scrollY;
      current += (target - current) * 0.082;
      if (Math.abs(target - current) < 0.05) current = target;
      page.style.transform = 'translate3d(0,' + (-current.toFixed(2)) + 'px,0)';
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }
})();


/* ── Cookie consent banner (self-hosted, no third-party) ─────────────────────
   Shows once on first visit; remembers Accept/Decline in localStorage and never
   asks again. Re-openable via any element with class .cookie-prefs. */
(function () {
  var KEY = 'seam-cookie-consent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function close(b) { b.classList.remove('is-open'); setTimeout(function () { if (b && b.parentNode) b.parentNode.removeChild(b); }, 320); }
  function build() {
    if (document.getElementById('cookie-consent')) return;
    var b = document.createElement('div');
    b.id = 'cookie-consent';
    b.className = 'cookie-consent';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookie notice');
    b.innerHTML =
      '<div class="cc-inner">' +
        '<p class="cc-text">We use cookies to run this site and understand traffic. See our <a href="cookies.html">Cookie Policy</a>.</p>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn cc-decline">Decline</button>' +
          '<button type="button" class="cc-btn cc-accept">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(b);
    requestAnimationFrame(function () { b.classList.add('is-open'); });
    b.querySelector('.cc-accept').addEventListener('click', function () { set('accepted'); close(b); });
    b.querySelector('.cc-decline').addEventListener('click', function () { set('declined'); close(b); });
  }
  function open() {
    var ex = document.getElementById('cookie-consent');
    if (ex) { ex.classList.add('is-open'); return; }
    build();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.cookie-prefs, .termly-display-preferences') : null;
    if (t) { e.preventDefault(); open(); }
  });
  if (!get()) {
    if (document.body) build();
    else document.addEventListener('DOMContentLoaded', build);
  }
})();
