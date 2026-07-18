(function () {
  'use strict';
  try { var __rv = function(){ var n = document.querySelectorAll('.rv:not(.in),.reveal:not(.in),.stagger:not(.in)'); for (var i=0;i<n.length;i++) n[i].classList.add('in'); }; setTimeout(__rv, 1400); window.addEventListener('load', function(){ setTimeout(__rv, 250); }); } catch(e){}


  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ── mobile menu ─────────────────────────────────────────────────────────── */
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.focus();
      }
    });
  }

  /* ── footer year ─────────────────────────────────────────────────────────── */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── nav scroll state (translucent → hairline + shadow) ──────────────────── */
  var nav = document.querySelector('header.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', function () { raf(onScroll); }, { passive: true });
  }

  /* ── toast helper ────────────────────────────────────────────────────────── */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<i></i>' + msg;
    raf(function () { toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ── count-up (numbers + progress ring), reduced-motion safe ─────────────── */
  function countUp(el) {
    if (reduce || el._counted) return; el._counted = true;
    var raw = el.textContent.trim();
    var m = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m) return;
    var pre = m[1], numStr = m[2], post = m[3];
    var hasComma = numStr.indexOf(',') > -1;
    var dec = (numStr.split('.')[1] || '').length;
    var target = parseFloat(numStr.replace(/,/g, ''));
    if (!isFinite(target)) return;
    var t0 = performance.now(), dur = 1100;
    function fmt(v) {
      var s = dec ? v.toFixed(dec) : Math.round(v).toString();
      if (hasComma) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      return pre + s + post;
    }
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 4); // ease-out-quart
      el.textContent = fmt(target * e);
      if (p < 1) raf(step); else el.textContent = pre + numStr + post;
    }
    raf(step);
  }
  function animateRing(card) {
    if (card._ring) return; card._ring = true;
    var arc = card.querySelector('.ring svg circle:last-of-type');
    if (!arc) return;
    var len = 301.6;
    if (reduce) { arc.style.strokeDashoffset = '0'; return; }
    if (arc.animate) arc.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: 1300, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
  }

  /* ── scroll reveals with per-group stagger ───────────────────────────────── */
  var items = document.querySelectorAll('.rv');
  // assign a stagger index among sibling .rv within the same parent
  var seen = new Map();
  items.forEach(function (el) {
    var p = el.parentNode, n = seen.get(p) || 0;
    if (el.previousElementSibling) el.style.setProperty('--rv-i', String(Math.min(n, 6)));
    seen.set(p, n + 1);
  });
  function fireExtras(el) {
    el.querySelectorAll('.stat .n').forEach(countUp);
    if (el.classList.contains('n')) countUp(el);
    if (el.querySelector('.ring')) animateRing(el);
    if (el.classList.contains('ccard') && el.querySelector('.ring')) animateRing(el);
  }
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); fireExtras(el); });
    document.querySelectorAll('.stat .n').forEach(function (n) { n.textContent = n.textContent; });
    document.querySelectorAll('.ccard').forEach(animateRing);
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); fireExtras(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ── pointer-reactive light on dark smoke panels (fine pointer only) ──────── */
  if (fine && !reduce) {
    document.querySelectorAll('.panel.smoke').forEach(function (panel) {
      var pending = false, mx = 50, my = 30;
      panel.addEventListener('pointermove', function (e) {
        var r = panel.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width) * 100;
        my = ((e.clientY - r.top) / r.height) * 100;
        if (!pending) { pending = true; raf(function () {
          panel.style.setProperty('--mx', mx.toFixed(1) + '%');
          panel.style.setProperty('--my', my.toFixed(1) + '%');
          pending = false;
        }); }
      });
      panel.addEventListener('pointerleave', function () {
        panel.style.setProperty('--mx', '50%'); panel.style.setProperty('--my', '30%');
      });
    });
  }

  /* ── magnetic tilt on project tiles + hero card (fine pointer only) ───────── */
  if (fine && !reduce) {
    function tilt(el, max, lift) {
      el.classList.add('tilt');
      var pending = false, rx = 0, ry = 0, sc = 1;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        ry = px * max; rx = -py * max; sc = 1.012;
        if (!pending) { pending = true; raf(function () {
          el.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(' + (-lift) + 'px) scale(' + sc + ')';
          pending = false;
        }); }
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    }
    document.querySelectorAll('.proj .img').forEach(function (el) { tilt(el, 4, 2); });
    document.querySelectorAll('.herocard').forEach(function (el) { tilt(el, 5, 0); });
  }

  /* ── copy-to-clipboard on the big email link ─────────────────────────────── */
  document.querySelectorAll('.bigmail').forEach(function (link) {
    var email = (link.getAttribute('href') || '').replace('mailto:', '').trim();
    if (!email) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copybtn';
    btn.setAttribute('aria-label', 'Copy email address');
    btn.title = 'Copy email';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.7"/></svg>';
    if (link.parentNode) link.parentNode.insertBefore(btn, link.nextSibling);
    btn.addEventListener('click', function () {
      var done = function () {
        btn.classList.add('copied');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        toast('Email copied — ' + email);
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.7"/></svg>';
        }, 1900);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () { toast('Copy failed — ' + email); });
      } else {
        var ta = document.createElement('textarea'); ta.value = email; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast(email); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ── smooth FAQ (Web Animations; native fallback under reduced-motion) ───── */
  if (!reduce) {
    document.querySelectorAll('details.faq').forEach(function (d) {
      var summary = d.querySelector('summary'), ans = d.querySelector('.ans');
      if (!summary || !ans || !ans.animate) return;
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        ans.style.overflow = 'hidden';
        if (d.open) {
          var h = ans.offsetHeight;
          var a = ans.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
            { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
          a.onfinish = function () { d.open = false; ans.style.overflow = ''; ans.style.height = ''; };
        } else {
          d.open = true;
          var target = ans.offsetHeight;
          var b = ans.animate([{ height: '0px', opacity: 0 }, { height: target + 'px', opacity: 1 }],
            { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' });
          b.onfinish = function () { ans.style.overflow = ''; };
        }
      });
    });
  }

  /* ── forms: inline status + AJAX submit to Netlify, real loading/ok/err ──── */
  function encode(data) {
    return Object.keys(data).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
  }
  document.querySelectorAll('form[data-netlify]').forEach(function (form) {
    var isNewsletter = (form.getAttribute('name') === 'newsletter');
    var btn = form.querySelector('button[type="submit"], .pill');
    var btnText = btn ? btn.textContent : '';
    var status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
      form.appendChild(status);
    }
    form.addEventListener('submit', function (e) {
      if (!window.fetch) return; // let native POST happen
      e.preventDefault();
      status.className = 'form-status'; status.textContent = '';
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data['form-name'] = form.getAttribute('name') || 'contact';
      if (btn) { btn.setAttribute('data-loading', ''); btn.textContent = isNewsletter ? 'Subscribing…' : 'Sending…'; }
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(data)
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        var action = form.getAttribute('action');
        if (!isNewsletter && action && /thanks\.html/.test(action)) { window.location.href = action; return; }
        form.reset();
        status.className = 'form-status ok';
        status.textContent = isNewsletter ? 'You’re on the list — thank you.' : 'Message sent — we reply within two working days.';
        if (btn) { btn.removeAttribute('data-loading'); btn.textContent = isNewsletter ? 'Subscribed ✓' : 'Sent ✓'; }
        toast(isNewsletter ? 'Subscribed — thank you' : 'Message sent');
        setTimeout(function () { if (btn) btn.textContent = btnText; }, 3000);
      }).catch(function () {
        status.className = 'form-status err';
        status.textContent = 'Something went wrong — email alp.sisman@gmail.com and we’ll pick it up.';
        if (btn) { btn.removeAttribute('data-loading'); btn.textContent = btnText; }
      });
    });
  });
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
