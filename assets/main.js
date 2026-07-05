/* ============================================================
   SEAM STUDIO — interaction engine (vanilla JS, no deps)
   Quiet, precise, reduced-motion safe.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    fillYear();
    initNav();
    initMobileNav();
    initReveals();
    initFaq();
    initContactForm();
  });

  function fillYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* sticky-nav hairline */
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* mobile drawer */
  function initMobileNav() {
    var toggle = document.getElementById('menuToggle');
    var drawer = document.getElementById('mobileNav');
    if (!toggle || !drawer) return;
    var open = function () { drawer.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
    var close = function () { drawer.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
    toggle.addEventListener('click', function () { drawer.classList.contains('open') ? close() : open(); });
    drawer.addEventListener('click', function (e) { if (e.target.tagName === 'A') close(); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* scroll reveals — covers .rv (fade/rise) and .rise (clip line-reveal).
     Scroll-driven on purpose: reliable everywhere, never leaves content
     stuck hidden the way an IntersectionObserver's initial callback can. */
  function initReveals() {
    var pending = Array.prototype.slice.call(document.querySelectorAll('.rv, .rise'));
    if (!pending.length) return;
    if (reduceMotion) {
      pending.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var check = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter(function (el) {
        // reveal once the element's top has risen past 90% of the viewport —
        // this also covers anything already scrolled above the fold
        if (el.getBoundingClientRect().top < vh * 0.9) { el.classList.add('in'); return false; }
        return true;
      });
      if (!pending.length) teardown();
    };
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { check(); ticking = false; });
    };
    var teardown = function () {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', check);
    check();                 // reveal whatever is above the fold now
    setTimeout(check, 300);  // re-check once layout / fonts settle
  }

  /* FAQ accordion */
  function initFaq() {
    var faqs = document.querySelectorAll('.faq');
    if (!faqs.length) return;
    faqs.forEach(function (faq) {
      var btn = faq.querySelector('.q');
      var ans = faq.querySelector('.a');
      if (!btn || !ans) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var isOpen = faq.classList.contains('open');
        faqs.forEach(function (f) {
          f.classList.remove('open');
          var a = f.querySelector('.a'); var b = f.querySelector('.q');
          if (a) a.style.maxHeight = null;
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          faq.classList.add('open');
          ans.style.maxHeight = ans.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* contact form → FormSubmit AJAX, no backend */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = form.querySelector('.form-status');
    var setStatus = function (msg, good) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status show ' + (good ? 'good' : 'bad');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('input[name="_honey"]');
      if (hp && hp.value) return;

      var btn = form.querySelector('button[type="submit"]');
      var origLabel = btn ? btn.textContent : 'Send';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      var dest;
      try { dest = window.atob('YWxwLnNpc21hbkBnbWFpbC5jb20='); } catch (err) { dest = ''; }
      var endpoint = 'https://formsubmit.co/ajax/' + dest;

      var fd = new FormData(form);
      fd.append('_subject', 'New Seam Studio enquiry');
      fd.append('_template', 'table');
      fd.append('_captcha', 'false');

      fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd })
        .then(function (res) { return res.json().catch(function () { return {}; }); })
        .then(function (j) {
          var ok = j && (j.success === 'true' || j.success === true);
          if (ok) {
            setStatus('Thank you — your note has been sent. We reply within one to two business days.', true);
            form.reset();
          } else {
            setStatus('Received. If you don\'t hear back within a day or two, email ' + (dest || 'us') + ' directly.', true);
            form.reset();
          }
        })
        .catch(function () {
          setStatus('Network hiccup — please email ' + (dest || 'us') + ' directly and we\'ll pick it up.', false);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = origLabel; }
        });
    });
  }
})();
