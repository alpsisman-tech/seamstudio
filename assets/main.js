/* ============================================================
   SEAM STUDIO — interaction + animation engine
   Vanilla JS, no dependencies. Reduced-motion safe.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    fillYear();
    initNav();
    initMobileNav();
    initReveals();
    initCountUps();
    initVentureShowcase();
    initPipeline();
    initFaq();
    initContactForm();
    initHeroThreads();
  });

  /* ---------- year ---------- */
  function fillYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- sticky nav shadow ---------- */
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile nav drawer ---------- */
  function initMobileNav() {
    var toggle = document.getElementById('menuToggle');
    var drawer = document.getElementById('mobileNav');
    if (!toggle || !drawer) return;
    var open = function () {
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    var close = function () {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', function () {
      drawer.classList.contains('open') ? close() : open();
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- scroll reveals ---------- */
  function initReveals() {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (ent) {
        if (ent.isIntersecting) {
          ent.target.classList.add('in');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up stats ---------- */
  function initCountUps() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = (el.getAttribute('data-decimals') | 0);
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }
      var dur = 1500, start = null;
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var v = target * ease(p);
        el.textContent = prefix + (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      nums.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (ent) {
        if (ent.isIntersecting) { run(ent.target); io.unobserve(ent.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- ventures showcase (list + auto-advancing stage) ---------- */
  function initVentureShowcase() {
    var root = document.querySelector('[data-vshow]');
    if (!root) return;
    var rows = Array.prototype.slice.call(root.querySelectorAll('.vrow'));
    var stages = Array.prototype.slice.call(root.querySelectorAll('.vstage'));
    if (!rows.length || !stages.length) return;

    var DURATION = 5200;
    var active = 0;
    var timer = null;

    var setActive = function (i, restartCss) {
      active = i;
      rows.forEach(function (r, idx) {
        r.classList.toggle('is-active', idx === i);
        var fill = r.querySelector('.vrow-bar-fill');
        if (fill) {
          // restart the progress-bar animation
          fill.style.animation = 'none';
          void fill.offsetWidth;
          if (idx === i && !reduceMotion) {
            fill.style.animation = 'vbar ' + DURATION + 'ms linear forwards';
          } else {
            fill.style.animation = '';
          }
        }
      });
      stages.forEach(function (s, idx) {
        var on = idx === i;
        s.classList.toggle('is-active', on);
        if (on && restartCss) restartStageAnims(s);
      });
    };

    // re-trigger the CSS keyframe demos inside a stage when it becomes visible
    var restartStageAnims = function (stage) {
      if (reduceMotion) return;
      var animated = stage.querySelectorAll('.mini-scan,.mini-box,.qln,.qprice,.qapprove,.mchip,.mmeta,.mreply,.mgate');
      animated.forEach(function (el) {
        var prev = el.style.animation;
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = prev || '';
      });
    };

    var next = function () { setActive((active + 1) % rows.length, true); };

    var startTimer = function () {
      if (reduceMotion) return;
      stopTimer();
      timer = window.setInterval(next, DURATION);
    };
    var stopTimer = function () {
      if (timer) { window.clearInterval(timer); timer = null; }
    };

    rows.forEach(function (r, idx) {
      r.addEventListener('click', function () {
        setActive(idx, true);
        startTimer();
      });
    });

    // pause when tab hidden / on hover of the stage
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stopTimer() : startTimer();
    });

    // kick off when scrolled into view
    if (!('IntersectionObserver' in window) || reduceMotion) {
      setActive(0, true);
      startTimer();
      return;
    }
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (ent) {
        if (ent.isIntersecting && !started) {
          started = true;
          setActive(0, true);
          startTimer();
        }
      });
    }, { threshold: 0.35 });
    io.observe(root);
  }

  /* ---------- process pipeline thread ---------- */
  function initPipeline() {
    var pipe = document.querySelector('.pipeline');
    if (!pipe) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      pipe.classList.add('in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (ent) {
        if (ent.isIntersecting) { pipe.classList.add('in'); io.unobserve(ent.target); }
      });
    }, { threshold: 0.3 });
    io.observe(pipe);
  }

  /* ---------- FAQ accordion ---------- */
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
          var a = f.querySelector('.a');
          var b = f.querySelector('.q');
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

  /* ---------- contact form → FormSubmit AJAX (no backend) ---------- */
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
      // honeypot
      var hp = form.querySelector('input[name="_honey"]');
      if (hp && hp.value) return;

      var btn = form.querySelector('button[type="submit"]');
      var origLabel = btn ? btn.textContent : 'Send';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      // destination assembled at runtime (base64) so it never appears in plain text
      var dest;
      try { dest = window.atob('YWxwLnNpc21hbkBnbWFpbC5jb20='); } catch (err) { dest = ''; }
      var endpoint = 'https://formsubmit.co/ajax/' + dest;

      var fd = new FormData(form);
      fd.append('_subject', 'New Seam Studio enquiry');
      fd.append('_template', 'table');
      fd.append('_captcha', 'false');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd
      }).then(function (res) {
        return res.json().catch(function () { return {}; });
      }).then(function (j) {
        var ok = j && (j.success === 'true' || j.success === true);
        if (ok) {
          setStatus("Thanks — your message is on its way. We'll reply within 1–2 business days.", true);
          form.reset();
        } else {
          setStatus('Message received. If you don\'t hear back within a day, email ' + (dest || 'us') + ' directly.', true);
          form.reset();
        }
      }).catch(function () {
        setStatus('Network hiccup — please email ' + (dest || 'us') + ' directly and we\'ll pick it up.', false);
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = origLabel; }
      });
    });
  }

  /* ---------- hero woven-threads canvas ---------- */
  function initHeroThreads() {
    var canvas = document.getElementById('threads');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var colors = ['#9BE45E', '#5B8CFF', '#F6A54A'];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var threads = [];

    var resize = function () {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildThreads();
    };

    var buildThreads = function () {
      threads = [];
      var count = w < 640 ? 7 : 12;
      for (var i = 0; i < count; i++) {
        var t = i / (count - 1);
        threads.push({
          baseY: h * (0.14 + t * 0.72),
          amp: 16 + Math.random() * 30,
          freq: 0.7 + Math.random() * 0.9,
          speed: 0.14 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
          color: colors[i % colors.length],
          width: 1 + Math.random() * 1.4,
          alpha: 0.16 + Math.random() * 0.22
        });
      }
    };

    var time = 0;
    var draw = function () {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < threads.length; i++) {
        var t = threads[i];
        ctx.beginPath();
        for (var x = -20; x <= w + 20; x += 8) {
          var nx = x / w;
          var y = t.baseY
            + Math.sin(nx * Math.PI * 2 * t.freq + time * t.speed + t.phase) * t.amp
            + Math.sin(nx * Math.PI * 6 + time * t.speed * 0.5) * (t.amp * 0.16);
          x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = t.color;
        ctx.globalAlpha = t.alpha;
        ctx.lineWidth = t.width;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      time += 1;
      raf = requestAnimationFrame(draw);
    };

    var raf = null;
    resize();
    window.addEventListener('resize', debounce(resize, 150));

    if (reduceMotion) {
      // draw a single static frame
      draw();
      cancelAnimationFrame(raf);
      return;
    }
    // pause when hero scrolled out of view for performance
    if ('IntersectionObserver' in window) {
      var vis = new IntersectionObserver(function (entries) {
        entries.forEach(function (ent) {
          if (ent.isIntersecting) {
            if (!raf) raf = requestAnimationFrame(draw);
          } else {
            if (raf) { cancelAnimationFrame(raf); raf = null; }
          }
        });
      }, { threshold: 0.01 });
      vis.observe(canvas);
    } else {
      raf = requestAnimationFrame(draw);
    }
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }
})();
