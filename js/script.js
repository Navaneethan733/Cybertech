
document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('cyber-preloader');
  if(preloader) {
    let pct = 0;
    const pctEl = preloader.querySelector('.loader-pct');
    const barEl = preloader.querySelector('.loader-bar');
    document.body.style.overflow = 'hidden';
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 15) + 5;
      if(pct > 100) pct = 100;
      if(pctEl) pctEl.textContent = pct + '%';
      if(barEl) barEl.style.width = pct + '%';
      if(pct === 100) {
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add('loaded');
          document.body.style.overflow = '';
        }, 400);
      }
    }, 60);
  }
});



(function () {
  'use strict';

  
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);


  
  function initScrollProgress() {
    const bar = $('.creative-scroll-progress');
    if (!bar) return;
    const update = () => {
      const d   = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      bar.style.width = (max > 0 ? (d.scrollTop / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  
  function initStickyHeader() {
    const dup = $('.header-duplicate');
    if (!dup) return;
    const update = () => dup.classList.toggle('sticky', window.scrollY > 80);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  
  function initSmartHeader() {
    const header = $('.header-area.header-absolute');
    if (!header) return;
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      if (y > lastY && y > 200) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      lastY = y;
    }, { passive: true });
  }

  
  function initProgressBars() {
    const bars = $$('.tj-progress-bar[data-percent]');
    if (!bars.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        const pct = parseInt(bar.dataset.percent, 10) || 0;
        bar.style.width = '0%';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          bar.style.width = pct + '%';
        }));
        obs.unobserve(bar);
      });
    }, { threshold: 0.4 });

    bars.forEach(b => obs.observe(b));
  }

  
  function initCounters() {
    const counters = $$('[data-count], .counter-number, .tj-counter');
    if (!counters.length) return;

    function animateCount(el) {
      const target   = parseInt(el.dataset.count || el.textContent, 10);
      if (isNaN(target)) return;
      const suffix   = el.dataset.suffix || el.textContent.replace(/\d/g, '').trim();
      const duration = 1800;
      const start    = performance.now();
      function step(now) {
        const t    = clamp((now - start) / duration, 0, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
  }

  
  function initParticles() {
    const section = $('.tj-banner-section-2');
    if (!section) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;opacity:0.28;';
    section.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, pts = [];
    const N = 60;

    const resize = () => {
      W = canvas.width  = section.offsetWidth;
      H = canvas.height = section.offsetHeight;
    };

    
    const mkPt = () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - .5) * .4,
      vy:    (Math.random() - .5) * .4,
      r:     Math.random() * 1.6 + .5,
      alpha: Math.random() * 0.35 + 0.15,
    });

    let mx = -9999, my = -9999;
    section.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    section.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

    resize();
    pts = Array.from({ length: N }, mkPt);
    window.addEventListener('resize', () => { resize(); pts = Array.from({ length: N }, mkPt); });

    (function draw() {
      ctx.clearRect(0, 0, W, H);

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const dx = p.x - mx, dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 110 && d > 0) { p.x += (dx / d) * 1.15; p.y += (dy / d) * 1.15; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(13,148,136,${p.alpha})`;
        ctx.fill();
      });

      
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx   = pts[i].x - pts[j].x;
          const dy   = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(13,148,136,${(0.18 * (1 - dist / 95)).toFixed(3)})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    })();
  }

  
  function initActiveCard() {
    const cards = $$('.choose-box.style-2');
    if (!cards.length) return;
    if (cards[2]) cards[2].classList.add('active-card');

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        cards.forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');
      });
      card.addEventListener('mouseleave', () => {
        cards.forEach(c => c.classList.remove('active-card'));
        if (cards[2]) cards[2].classList.add('active-card');
      });
    });
  }

  
  function initMagneticButtons() {
    $$('.tj-primary-btn,.project-btn,.team-link,.slider-prev,.slider-next').forEach(btn => {
      let req;
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.22;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.22;
        cancelAnimationFrame(req);
        req = requestAnimationFrame(() => { btn.style.transform = `translate(${dx}px,${dy}px)`; });
      });
      btn.addEventListener('mouseleave', () => {
        cancelAnimationFrame(req);
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        btn.style.transform  = '';
        btn.addEventListener('transitionend', () => { btn.style.transition = ''; }, { once: true });
      });
    });
  }

  
  function initBackToTop() {
    const btn = $('#tj-back-to-top');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      const vis = window.scrollY > 300;
      btn.style.opacity       = vis ? '1'       : '0';
      btn.style.transform     = vis ? 'scale(1)' : 'scale(0.7)';
      btn.style.pointerEvents = vis ? 'all'      : 'none';
    }, { passive: true });
  }

  
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id     = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    $$('.tj-scroll-btn[data-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = $(btn.dataset.target);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  
  function initMobileMenu() {
    const bars     = $$('.menu_bar, .mobile_menu_bar');
    const closes   = $$('.hamburger_close_btn');
    const overlays = $$('.body-overlay');

    function openMenu() {
      $$('.hamburger-area, .hamburger_wrapper').forEach(el => el.classList.add('open'));
      overlays.forEach(o => o.classList.add('active'));
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      $$('.hamburger-area, .hamburger_wrapper').forEach(el => el.classList.remove('open'));
      overlays.forEach(o => o.classList.remove('active'));
      document.body.style.overflow = '';
    }

    bars.forEach(b => b.addEventListener('click', openMenu));
    closes.forEach(c => c.addEventListener('click', closeMenu));
    overlays.forEach(o => o.addEventListener('click', closeMenu));
  }

  
  function initOffcanvas() {
    $$('[data-offcanvas-toggle]').forEach(t => {
      t.addEventListener('click', () => {
        const target = $(t.dataset.offcanvasToggle);
        if (target) target.classList.toggle('open');
      });
    });
  }

  
  function initSearch() {
    const searchBtns = $$('.header-search .search');
    const closeBtns  = $$('.search_close_btn');
    const popups     = $$('.search_popup');
    const overlays   = $$('.search-popup-overlay');

    function openSearch() {
      popups.forEach(p => p.classList.add('open'));
      overlays.forEach(o => o.classList.add('active'));
      const input = $('.search-form-input');
      if (input) setTimeout(() => input.focus(), 200);
    }
    function closeSearch() {
      popups.forEach(p => p.classList.remove('open'));
      overlays.forEach(o => o.classList.remove('active'));
    }

    searchBtns.forEach(b => b.addEventListener('click', openSearch));
    closeBtns.forEach(b  => b.addEventListener('click', closeSearch));
    overlays.forEach(o   => o.addEventListener('click', closeSearch));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
  }

  
  function initRevealAnimations() {
    if (window.WOW) return;
    const items = $$('.wow');
    if (!items.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseFloat(el.dataset.wowDelay || '0') * 1000;
        const anim  = el.classList.contains('fadeInLeft')  ? 'fadeInLeft'  :
                      el.classList.contains('fadeInRight') ? 'fadeInRight' :
                      el.classList.contains('fadeIn')      ? 'fadeIn'      : 'fadeInUp';
        setTimeout(() => {
          el.style.opacity   = '';
          el.style.transform = '';
          el.style.animation = `${anim} 0.7s cubic-bezier(0.16,1,0.3,1) both`;
        }, delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => {
      el.style.opacity   = '0';
      el.style.transform = el.classList.contains('fadeInLeft')  ? 'translateX(-30px)' :
                           el.classList.contains('fadeInRight') ? 'translateX(30px)'  : 'translateY(24px)';
      obs.observe(el);
    });
  }

  
  function initSwipers() {
    if (typeof Swiper === 'undefined') return;

    
    const clientEl = $('.client-slider-2');
    if (clientEl) {
      new Swiper(clientEl, {
        slidesPerView: 'auto',
        spaceBetween: 48,
        loop: true,
        speed: 5000,
        autoplay: { delay: 0, disableOnInteraction: false },
        freeMode: true,
        grabCursor: true,
        allowTouchMove: true,
        breakpoints: {
          320:  { slidesPerView: 2 },
          576:  { slidesPerView: 3 },
          768:  { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        },
      });
    }

    
    const projEl   = $('.project-slider-2');
    const projPrev = $('.tj-project-section-3 .slider-prev');
    const projNext = $('.tj-project-section-3 .slider-next');
    if (projEl) {
      const sw = new Swiper(projEl, {
        slidesPerView: 1.2,
        spaceBetween: 20,
        centeredSlides: false,
        loop: true,
        grabCursor: true,
        speed: 800,
        autoplay: { delay: 4000, disableOnInteraction: false },
        pagination: {
          el: projEl.closest('.project-wrapper')?.querySelector('.swiper-pagination-area'),
          clickable: true,
        },
        breakpoints: {
          576:  { slidesPerView: 1.5,  spaceBetween: 24 },
          768:  { slidesPerView: 2.2,  spaceBetween: 28 },
          1024: { slidesPerView: 3,    spaceBetween: 32 },
          1440: { slidesPerView: 3.5,  spaceBetween: 36 },
        },
      });
      if (projPrev) projPrev.addEventListener('click', () => sw.slidePrev());
      if (projNext) projNext.addEventListener('click', () => sw.slideNext());
    }

    
    const thumbEl = $('.client-thumb');
    const mainEl  = $('.testimonial-slider-3');
    const tPrev   = $('.testimonial-navigation .slider-prev');
    const tNext   = $('.testimonial-navigation .slider-next');
    if (thumbEl && mainEl) {
      const thumbSw = new Swiper(thumbEl, {
        slidesPerView: 2,
        spaceBetween: 10,
        loop: true,
        watchSlidesProgress: true,
        breakpoints: {
          480:  { slidesPerView: 3 },
          768:  { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        },
      });
      const mainSw = new Swiper(mainEl, {
        speed: 800,
        loop: true,
        grabCursor: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        effect: 'fade',
        fadeEffect: { crossFade: true },
        thumbs: { swiper: thumbSw },
        pagination: {
          el: mainEl.querySelector('.swiper-pagination-area'),
          clickable: true,
        },
      });
      if (tPrev) tPrev.addEventListener('click', () => mainSw.slidePrev());
      if (tNext) tNext.addEventListener('click', () => mainSw.slideNext());
    }

    
    const marqueeEl = $('.marquee-slider');
    if (marqueeEl) {
      new Swiper(marqueeEl, {
        slidesPerView: 'auto',
        spaceBetween: 0,
        loop: true,
        speed: 6000,
        autoplay: { delay: 0, disableOnInteraction: false },
        freeMode: true,
        grabCursor: true,
      });
    }
  }

  
  function initTeamSwitcher() {
    const teamItems = $$('.team-item');
    const bigImg    = $('#team-img');
    if (!teamItems.length || !bigImg) return;

    teamItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const src = item.querySelector('.team-img img')?.src;
        if (!src) return;

        bigImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        bigImg.style.opacity    = '0';
        bigImg.style.transform  = 'scale(1.03)';

        setTimeout(() => {
          const img = bigImg.querySelector('img');
          if (img) img.src = src;
          bigImg.style.opacity   = '1';
          bigImg.style.transform = 'scale(1)';
        }, 200);

        teamItems.forEach(t => t.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  
  function initAccordion() {
    $$('.faq-title').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCollapsed = btn.classList.contains('collapsed');
        const parent = btn.closest('#faqOne, .tj-faq');
        if (!parent) return;

        parent.querySelectorAll('.faq-title:not(.collapsed)').forEach(b => {
          b.classList.add('collapsed');
          b.setAttribute('aria-expanded', 'false');
          const c = document.getElementById(b.dataset.bsTarget?.slice(1) || '');
          if (c) c.classList.remove('show');
        });

        if (isCollapsed) {
          btn.classList.remove('collapsed');
          btn.setAttribute('aria-expanded', 'true');
          const id = btn.dataset.bsTarget?.slice(1) || btn.getAttribute('data-bs-target')?.slice(1);
          const c  = id ? document.getElementById(id) : null;
          if (c) c.classList.add('show');
        }
      });
    });
  }

  
  function initServiceReveal() {
    $$('.service-item.style-3').forEach(item => {
      item.addEventListener('mouseenter', () => { item.style.zIndex = '2'; });
      item.addEventListener('mouseleave', () => { item.style.zIndex = ''; });
    });
  }

  
  function initNeonHover() {
    $$('.service-item.style-3, .choose-box.style-2:not(.active-card)').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;
        el.style.setProperty('--glow-x', x + '%');
        el.style.setProperty('--glow-y', y + '%');
        el.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.2) 0%, var(--c-accent) 80%)`;
      });
      el.addEventListener('mouseleave', () => { el.style.background = ''; });
    });
  }

  
  function initParallax() {
    const shapes = $$('.bg-shape-1, .bg-shape-2, .bg-shape-3');
    if (!shapes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      shapes.forEach((s, i) => {
        s.style.transform = `translateY(${y * (i % 2 === 0 ? 0.07 : -0.05)}px)`;
      });
    }, { passive: true });
  }

  
  function initScramble() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $$('.sec-title.title-anim, .banner-title .title-anim').forEach(el => {
      let done = false;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting || done) return;
          done = true;
          const orig = el.textContent.trim();
          let iter   = 0;
          const id   = setInterval(() => {
            el.textContent = orig.split('').map((c, idx) =>
              idx < iter ? c : c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
            ).join('');
            if (iter >= orig.length) { el.textContent = orig; clearInterval(id); }
            iter += 0.5;
          }, 35);
          obs.unobserve(el);
        });
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }

  
  function initTypedHeadline() {
    $$('h1 .title-anim, .banner-title .title-anim').forEach(el => {

    const original = el.textContent.trim();
    const chars    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let iteration  = 0;
    const interval = setInterval(() => {
      el.textContent = original.split('').map((letter, idx) => {
        if (idx < iteration) return letter;
        return letter === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iteration >= original.length) clearInterval(interval);
      iteration += 1 / 2.5;
    }, 40);
    });
  }

  
  function initTypingBar() {
    const el = $('.topbar-text');
    if (!el) return;

    const messages = [
      'Recognized for Excellence in Cyber Defense',
      '15-Minute Incident Response — Guaranteed',
      'Zero-Trust. Zero-Compromise.',
      'Protecting 500+ Global Enterprises',
    ];
    let msgIdx = 0, charIdx = 0, deleting = false;

    const origLink = el.querySelector('a');
    let link;
    if (origLink) {
      link = origLink.cloneNode(true);
      el.innerHTML = '';
      el.appendChild(link);
    }
    const span = document.createElement('span');
    el.insertBefore(span, link || null);

    function type() {
      const current = messages[msgIdx];
      if (!deleting) {
        span.textContent = current.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) { deleting = true; setTimeout(type, 2400); return; }
        setTimeout(type, 55);
      } else {
        span.textContent = current.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          msgIdx = (msgIdx + 1) % messages.length;
          setTimeout(type, 500);
          return;
        }
        setTimeout(type, 28);
      }
    }
    setTimeout(type, 1200);
  }

  
  function initTerminalEffect() {
    $$('.banner-content-2 .sub-title').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const original = el.textContent;
        const chars    = '01ABCDEF#$%';
        let i = 0;
        const id = setInterval(() => {
          el.textContent = original.split('').map((c, idx) => {
            if (c === ' ' || idx < i) return c;
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
          i += 0.5;
          if (i >= original.length) { el.textContent = original; clearInterval(id); }
        }, 35);
      });
    });
  }

  
  function initSubscribeForm() {
    $$('.subscribe-form form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const btn   = form.querySelector('button[type="submit"]');
        if (!input || !input.value) return;
        const orig = btn.innerHTML;
        btn.innerHTML        = '✓';
        btn.style.background = '#00e57e';
        input.value          = '';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 3000);
      });
    });
  }

  
  function initGlitchHeadings() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.dataset.text = el.textContent;
        let runs = 0;
        const id = setInterval(() => {
          if (runs++ > 5) { clearInterval(id); el.classList.remove('glitch'); return; }
          el.classList.toggle('glitch');
        }, 150);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    $$('.sec-title').forEach(t => obs.observe(t));
  }

  
  function injectDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .search_popup{position:fixed;inset:0;display:none;align-items:center;z-index:9990}
      .search_popup.open{display:flex;animation:fadeIn .25s ease}
      .search-popup-overlay{position:fixed;inset:0;z-index:9989;display:none}
      .search-popup-overlay.active{display:block}
      .tj-offcanvas-area .hamburger_wrapper{transition:transform .42s cubic-bezier(0.16,1,0.3,1)}
      .hamburger_wrapper:not(.open){transform:translateX(105%)}
      .hamburger_wrapper.open{transform:translateX(0)}
      .body-overlay{display:none}
      .body-overlay.active{display:block;position:fixed;inset:0;z-index:498}
      .tj-faq .collapse{display:none}
      .tj-faq .collapse.show{display:block;animation:fadeIn .3s ease}
    `;
    document.head.appendChild(style);
  }

  
  function init() {
    injectDynamicStyles();
    initScrollProgress();
    initStickyHeader();
    initSmartHeader();
    initProgressBars();
    initCounters();
    initParticles();
    initActiveCard();
    initMagneticButtons();
    initBackToTop();
    initSmoothScroll();
    initMobileMenu();
    initOffcanvas();
    initSearch();
    initRevealAnimations();
    initSwipers();
    initTeamSwitcher();
    initAccordion();
    initServiceReveal();
    initNeonHover();
    initParallax();
    initTerminalEffect();
    initSubscribeForm();
    initGlitchHeadings();
    
    setTimeout(() => {
      initTypedHeadline();
      initTypingBar();
      initScramble();
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();