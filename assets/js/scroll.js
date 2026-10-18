/* volvevent. – Scrollytelling der Startseite (nur index.html).
   Benötigt die lokal eingebundenen Bibliotheken GSAP + ScrollTrigger (assets/vendor/)
   und optional Lenis. Bei „Bewegung reduzieren“, ohne JavaScript oder ohne diese
   Bibliotheken bleibt die Seite vollständig statisch (Standbild statt Bildsequenz). */
(function () {
  "use strict";

  var root = document.documentElement;
  if (!root.classList.contains("st")) return;          // reduzierte Bewegung → statisch
  if (!window.gsap || !window.ScrollTrigger) {          // Bibliotheken fehlen → statisch
    root.classList.remove("st");
    return;
  }
  window.__stReady = true;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var q = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* Smooth Scroll (Lenis v1) – eine einzige Schleife über gsap.ticker ---- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1, anchors: true, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    // Während das mobile Menü oder ein Dialog geöffnet ist, nicht scrollen
    new MutationObserver(function () {
      if (document.body.classList.contains("nav-open")) lenis.stop();
      else lenis.start();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  /* Scroll-Fortschritt -------------------------------------------------- */
  gsap.to(".scroll-progress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.2 }
  });

  /* Bildsequenz auf Canvas (Bilder unverändert aus images/…) ------------ */
  function Sequence(section) {
    var base = section.getAttribute("data-seq");
    var count = parseInt(section.getAttribute("data-frames"), 10) || 1;
    var canvas = section.querySelector(".seq__canvas");
    var ctx = canvas.getContext("2d");
    var frames = new Array(count);
    var current = 0, drawn = -1, started = false;
    var src = function (i) { var n = String(i + 1); while (n.length < 4) n = "0" + n; return base + n + ".jpg"; };

    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; drawn = -1; }
    }
    function nearest(i) {
      for (var d = 0; d < count; d++) {
        if (frames[i - d] && frames[i - d].ok) return i - d;
        if (frames[i + d] && frames[i + d].ok) return i + d;
      }
      return -1;
    }
    function draw() {
      var k = nearest(current);
      if (k < 0 || k === drawn) return;
      var img = frames[k].img;
      var cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
      var s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawn = k;
    }
    function load(i) {
      if (frames[i]) return;
      var img = new Image();
      var f = frames[i] = { img: img, ok: false };
      img.decoding = "async";
      img.onload = function () { f.ok = true; if (Math.abs(i - current) < Math.abs((drawn < 0 ? 1e9 : drawn) - current) || drawn < 0) { drawn = -1; draw(); } };
      img.src = src(i);
    }
    function start() {
      if (started) return;
      started = true;
      // grob → fein: erst jedes 8., dann jedes 4., 2. und schließlich jedes Bild
      [8, 4, 2, 1].forEach(function (step) { for (var i = 0; i < count; i += step) load(i); });
    }
    size();
    window.addEventListener("resize", function () { size(); draw(); });
    return {
      start: start,
      set: function (p) { current = Math.max(0, Math.min(count - 1, Math.round(p * (count - 1)))); draw(); }
    };
  }

  function setupSequence(section, opts) {
    var phases = q(".seq__phase", section);
    var n = phases.length;
    section.style.setProperty("--phases", String(opts.height || n));
    section.classList.add("is-live");
    var seq = Sequence(section);
    var count = section.querySelector(".seq__count");
    var fill = section.querySelector(".seq__fill");
    var vertical = function () { return window.matchMedia("(min-width: 701px)").matches; };

    // Bilder laden, sobald der Abschnitt in die Nähe kommt
    ScrollTrigger.create({ trigger: section, start: "top bottom+=150%", once: true, onEnter: seq.start });

    var active = -1;
    function show(i) {
      if (i === active) return;
      var prev = active;
      active = i;
      if (count) count.textContent = (i + 1 < 10 ? "0" : "") + (i + 1);
      phases.forEach(function (ph, k) {
        if (opts.keepFirst && k === 0) return;
        if (k === i) {
          gsap.killTweensOf(ph);
          gsap.fromTo(ph, { autoAlpha: 0, y: k > prev ? 28 : -28 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out", overwrite: true });
        } else if (k === prev) {
          gsap.to(ph, { autoAlpha: 0, y: k < i ? -28 : 28, duration: 0.35, ease: "power2.in", overwrite: true });
        } else {
          gsap.set(ph, { autoAlpha: 0 });
        }
      });
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top top+=" + (opts.offset ? opts.offset() : 0),
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        var p = self.progress;
        seq.set(p);
        if (fill) gsap.set(fill, vertical() ? { scaleY: p, scaleX: 1 } : { scaleX: p, scaleY: 1 });
        var i = Math.min(n - 1, Math.floor(p * n * 0.999));
        if (opts.onProgress) opts.onProgress(p, n);
        show(i);
      }
    });
    show(0);
    return seq;
  }

  var headerTotal = function () {
    var h = document.querySelector(".site-header");
    return h ? h.getBoundingClientRect().height : 0;
  };

  /* 1) Hero-Sequenz: Rechenzentrum ------------------------------------- */
  var hero = document.getElementById("start");
  if (hero) {
    var intro = hero.querySelector(".seq__phase--intro");
    var heroSeq = setupSequence(hero, {
      offset: headerTotal,
      keepFirst: true,
      onProgress: function (p, n) {
        // Einstieg beim Herausscrollen leicht verkleinern und ausblenden
        var t = Math.min(1, p * n);              // 0…1 innerhalb der ersten Phase
        gsap.set(intro, {
          scale: 1 - 0.06 * t, opacity: 1 - t, y: -40 * t,
          visibility: t >= 1 ? "hidden" : "visible", transformOrigin: "left bottom"
        });
      }
    });
    heroSeq.start(); // Hero direkt laden
    // Überschrift zeilenweise hinter einer Maske einblenden
    gsap.set(".hero__title .line__inner", { yPercent: 110, y: 0 });
    gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 })
      .to(intro.querySelector(".eyebrow"), { opacity: 1, duration: 0.6 })
      .to(".hero__title .line__inner", { yPercent: 0, duration: 1.1, stagger: 0.14 }, "-=0.35")
      .to(".hero__lead", { opacity: 1, duration: 0.8 }, "-=0.6")
      .to(".hero__actions", { opacity: 1, duration: 0.6 }, "-=0.5");
  }

  /* 2) Leistungen: Desktop gepinnt mit Zähler, mobil gestaffelt -------- */
  var mm = gsap.matchMedia();
  var services = document.getElementById("leistungen");
  var items = services ? q(".service", services) : [];
  var index = services ? q(".steps-index li", services) : [];

  mm.add("(min-width: 900px)", function () {
    if (!services || items.length < 2) return;
    services.classList.add("is-stepped");
    var reel = services.querySelector(".steps__reel");
    var fillBar = services.querySelector(".steps__fill");
    var n = items.length;
    var mark = function (i) { index.forEach(function (li, k) { li.classList.toggle("is-current", k === i); }); };

    gsap.set(items, { autoAlpha: 0, y: 30 });
    gsap.set(items[0], { autoAlpha: 1, y: 0 });
    gsap.set(reel, { yPercent: 0 });
    gsap.set(fillBar, { scaleX: 1 / n });
    mark(0);

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: services,
        start: function () { return "top top+=" + headerTotal(); },
        end: function () { return "+=" + Math.round((n - 1) * window.innerHeight * 0.8); },
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) { mark(Math.min(n - 1, Math.round(self.progress * (n - 1)))); }
      }
    });
    tl.to({}, { duration: 0.4 });
    for (var i = 1; i < n; i++) {
      var label = "step" + i;
      tl.addLabel(label)
        .to(items[i - 1], { autoAlpha: 0, y: -30, duration: 0.5, ease: "power2.in" }, label)
        .fromTo(items[i], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, label + "+=0.3")
        .to(reel, { yPercent: -100 * i / n, duration: 0.6, ease: "power2.inOut" }, label + "+=0.1")
        .to(fillBar, { scaleX: (i + 1) / n, duration: 0.6, ease: "power2.inOut" }, label + "+=0.1")
        .to({}, { duration: 0.5 });
    }
    // Klick im Index springt zum jeweiligen Schritt
    index.forEach(function (li, k) {
      var a = li.querySelector("a");
      if (!a) return;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var st = tl.scrollTrigger;
        var y = st.start + (st.end - st.start) * (k / (n - 1));
        if (lenis) lenis.scrollTo(y + 2); else window.scrollTo(0, y + 2);
        var link = items[k].querySelector("a");
        if (link) setTimeout(function () { link.focus({ preventScroll: true }); }, 700);
      });
    });
    return function () {
      services.classList.remove("is-stepped");
      gsap.set(items, { clearProps: "all" });
    };
  });

  mm.add("(max-width: 899px)", function () {
    items.forEach(function (el) {
      gsap.set(el, { autoAlpha: 0, y: 20 });
      gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
  });

  /* 3) Linien zeichnen, Listen gestaffelt einblenden -------------------- */
  q(".draw").forEach(function (el) {
    gsap.fromTo(el, { "--draw": 0 }, {
      "--draw": 1, duration: 1.2, ease: "power2.inOut",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });
  q("[data-stagger]").forEach(function (list) {
    var kids = list.children;
    gsap.set(kids, { autoAlpha: 0, y: 18 });
    gsap.to(kids, {
      autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08,
      scrollTrigger: { trigger: list, start: "top 86%", once: true }
    });
  });
  q("main .section .eyebrow, main .section .section__title").forEach(function (el) {
    if (el.closest("#leistungen") || el.closest("#kontakt")) return;
    gsap.set(el, { autoAlpha: 0, y: 16 });
    gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });

  /* 4) Sequenz 2: Cloud-Architektur ------------------------------------ */
  var cloud = document.getElementById("cloud");
  if (cloud) setupSequence(cloud, { offset: headerTotal });

  /* 5) Kontakt: Hintergrund von Weiß zu Schwarz ------------------------- */
  var contact = document.getElementById("kontakt");
  if (contact) {
    gsap.fromTo(contact, { backgroundColor: "#ffffff" }, {
      backgroundColor: "#000000", ease: "none",
      scrollTrigger: { trigger: contact, start: "top 90%", end: "top 45%", scrub: true }
    });
    var parts = q(".eyebrow, .contact__title, .contact__text, .contact__grid, .contact__actions", contact);
    gsap.set(parts, { autoAlpha: 0, y: 24 });
    gsap.to(parts, {
      autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.1,
      scrollTrigger: { trigger: contact, start: "top 45%", once: true }
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
