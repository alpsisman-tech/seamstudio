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
