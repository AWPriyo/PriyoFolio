(function () {
    'use strict';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function $(id) { return document.getElementById(id); }

    /* footer year */
    $('year').textContent = new Date().getFullYear();

    /* navbar, progress bar, back to top */
    var navbar = $('navbar'), progress = $('progress'), toTop = $('toTop');
    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        navbar.classList.toggle('scrolled', y > 30);
        toTop.classList.toggle('show', y > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* page background color dots */
    var root = document.documentElement;
    var particleColor = '';
    var dotsBtns = Array.prototype.slice.call(document.querySelectorAll('.theme-dot'));
    var themeColors = { blue: '#03061a', red: '#1a0307', green: '#02160d', purple: '#0b0320', pink: '#1c0312', black: '#030303' };
    function setTheme(name, save) {
        if (!themeColors[name]) name = 'blue';
        root.setAttribute('data-theme', name);
        particleColor = window.getComputedStyle(root).getPropertyValue('--theme-accent-rgb').trim();
        dotsBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.theme === name)); });
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', themeColors[name]);
        if (save) { try { localStorage.setItem('priyo-theme', name); } catch (e) {} }
    }
    var saved = 'blue';
    try { saved = localStorage.getItem('priyo-theme') || 'blue'; } catch (e) {}
    setTheme(saved, false);
    dotsBtns.forEach(function (b) { b.addEventListener('click', function () { setTheme(b.dataset.theme, true); }); });

    /* mobile menu */
    var toggle = $('menuToggle'), menu = $('menu');
    function setMenu(open) {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
    }
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.querySelectorAll('.nav-dropdown-toggle').forEach(function (button) {
        button.addEventListener('click', function () {
            var dropdown = button.closest('.nav-dropdown');
            document.querySelectorAll('.nav-dropdown.open').forEach(function (item) {
                if (item !== dropdown) {
                    item.classList.remove('open');
                    item.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
                }
            });
            var open = !dropdown.classList.contains('open');
            dropdown.classList.toggle('open', open);
            button.setAttribute('aria-expanded', String(open));
        });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    /* hero photo slideshow */
    var heroSlides = Array.prototype.slice.call(document.querySelectorAll('#heroPhoto .slide'));
    if (heroSlides.length > 1) {
        var activeSlide = 0;
        window.setInterval(function () {
            heroSlides[activeSlide].classList.remove('active');
            heroSlides[activeSlide].setAttribute('aria-hidden', 'true');
            activeSlide = (activeSlide + 1) % heroSlides.length;
            heroSlides[activeSlide].classList.add('active');
            heroSlides[activeSlide].removeAttribute('aria-hidden');
        }, 2000);
    }

    /* active link on scroll (skips links whose section is not on the page) */
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (en.isIntersecting) {
                links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
                document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
                    var sublinks = Array.prototype.slice.call(dropdown.querySelectorAll('.nav-sublink'));
                    var active = sublinks.some(function (link) { return link.getAttribute('href') === '#' + en.target.id; });
                    dropdown.querySelector('.nav-dropdown-toggle').classList.toggle('active', active);
                });
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
        var s = document.querySelector(a.getAttribute('href'));
        if (s) spy.observe(s);
    });

    /* reveal + counters + skill bars */
    function animateCount(el) {
        var target = parseInt(el.dataset.count, 10), start = null, dur = 1200;
        if (reduceMotion) { el.textContent = target; return; }
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    function animateBar(i) {
        var level = parseInt(i.dataset.level, 10);
        var pct = i.closest('.skill').querySelector('.pct');
        i.style.width = level + '%';
        if (reduceMotion) { pct.textContent = level + '%'; return; }
        var start = null, dur = 1400;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            pct.textContent = Math.round(level * (1 - Math.pow(1 - p, 3))) + '%';
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var el = en.target;
            el.classList.add('in');
            el.querySelectorAll('[data-count]').forEach(animateCount);
            el.querySelectorAll('[data-level]').forEach(animateBar);
            revealer.unobserve(el);
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealer.observe(el); });

    /* contact cards: staggered entrance */
    document.querySelectorAll('.contact .c-item').forEach(function (c, i) { c.style.transitionDelay = (i * 60) + 'ms'; });

    /* expertise cards and skill tags: staggered entrance */
    document.querySelectorAll('.expertise-card').forEach(function (card, cardIndex) {
        card.style.transitionDelay = (cardIndex * 70) + 'ms';
        card.querySelectorAll('.tech-pill').forEach(function (item, itemIndex) {
            item.style.opacity = '0';
            item.style.transform = 'translateY(12px)';
            item.style.transition = 'opacity 0.45s ease ' + ((cardIndex * 70) + (itemIndex * 55)) + 'ms, transform 0.45s ease ' + ((cardIndex * 70) + (itemIndex * 55)) + 'ms, background 0.25s ease, border-color 0.25s ease';
        });
    });
    var expertise = document.querySelector('.expertise-grid');
    if (expertise) {
        var expertiseObserver = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            expertise.querySelectorAll('.tech-pill').forEach(function (item) {
                item.style.opacity = '1';
                item.style.transform = '';
            });
            expertiseObserver.unobserve(expertise);
        }, { threshold: 0.12 });
        expertiseObserver.observe(expertise);
    }

    /* profile photo: gentle 3D tilt that follows the pointer */
    var tilt = $('tilt');
    if (tilt && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
        tilt.addEventListener('pointermove', function (e) {
            var r = tilt.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
            tilt.style.transform = 'perspective(800px) rotateY(' + (x * 12) + 'deg) rotateX(' + (-y * 12) + 'deg)';
        });
        tilt.addEventListener('pointerleave', function () { tilt.style.transform = ''; });
    }

    /* lightbox (works if the Gallery section is enabled) */
    var shots = Array.prototype.slice.call(document.querySelectorAll('.shot img'));
    var lb = $('lightbox'), lbImg = $('lbImg');
    var current = 0, lastFocus = null;
    function show(i) {
        current = (i + shots.length) % shots.length;
        lbImg.src = shots[current].src;
        lbImg.alt = shots[current].alt;
    }
    function openLb(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('lbClose').focus(); }
    function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    document.querySelectorAll('.shot').forEach(function (b, i) { b.addEventListener('click', function () { openLb(i); }); });
    $('lbClose').addEventListener('click', closeLb);
    $('lbPrev').addEventListener('click', function () { show(current - 1); });
    $('lbNext').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
        if (lb.hidden) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });

    /* theme-colored particle network background */
    var hero = $('home'), canvas = $('bg'), ctx = canvas.getContext('2d');
    var dots = [], w = 0, h = 0, mouse = { x: -999, y: -999 }, running = true, frameId = 0;
    function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth; h = window.innerHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = Math.max(60, Math.min(150, Math.round(w * h / 8000)));
        dots = [];
        for (var i = 0; i < n; i++) dots.push({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 2.4, vy: (Math.random() - 0.5) * 2.4
        });
    }
    function draw() {
        frameId = 0;
        if (!running) return;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < dots.length; i++) {
            var d = dots[i];
            d.x += d.vx; d.y += d.vy;
            if (d.x < 0 || d.x > w) d.vx *= -1;
            if (d.y < 0 || d.y > h) d.vy *= -1;
            var mx = d.x - mouse.x, my = d.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
            if (md < 110 && md > 0) { d.x += mx / md * 1.4; d.y += my / md * 1.4; }
            ctx.beginPath(); ctx.arc(d.x, d.y, 2.8, 0, 6.283);
            ctx.fillStyle = 'rgba(' + particleColor + ',1)'; ctx.fill();
            for (var j = i + 1; j < dots.length; j++) {
                var o = dots[j], dx = d.x - o.x, dy = d.y - o.y, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    ctx.strokeStyle = 'rgba(' + particleColor + ',' + (0.55 * (1 - dist / 140)) + ')';
                    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y); ctx.stroke();
                }
            }
        }
        if (!document.hidden) frameId = requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) {
        mouse.x = e.clientX; mouse.y = e.clientY;
    });
    window.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    document.addEventListener('visibilitychange', function () {
        running = !document.hidden;
        if (!running && frameId) {
            cancelAnimationFrame(frameId);
            frameId = 0;
        } else if (running) draw();
    });
    draw();
})();