/* ==========================================================
   ProMetal — UI upgrade layer (behaviour)
   Preloader, scroll progress, active menu, reveal-on-scroll,
   counters, category ticker, product card tilt and entrance,
   live opening status, quick-contact button, FR/EN texts.
   ========================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Texts for the new elements (FR / EN) ---------- */
  var I18N = {
    fr: {
      heroCall: "Appeler",
      badgeRing: "ACIER • INOX • ALUMINIUM • DEPUIS 1990 • ",
      since: "depuis",
      statFounded: "Année de création",
      statYears: "Années d'expérience",
      statFamilies: "Familles de produits",
      statDays: "Jours ouverts par semaine",
      tick_Fer_Marchands: "Fer marchands",
      tick_Poutrelles: "Poutrelles",
      tick_Toles: "Tôles",
      tick_Inox: "Inox",
      tick_Aluminium: "Aluminium",
      tick_Tubes: "Tubes",
      tick_Panneaux_Sandwich: "Panneaux sandwich",
      tick_Caillebotis: "Caillebotis",
      tick_Lames_Rideaux: "Lames de rideaux",
      tick_Ressort: "Ressorts à lame",
      today: "Aujourd'hui",
      open: "Ouvert maintenant",
      closed: "Fermé",
      lunch: "Pause déjeuner",
      closesAt: "ferme à {t}",
      reopensAt: "réouverture à {t}",
      opensAt: "ouvre à {t}",
      opensTomorrow: "ouvre demain à {t}",
      opensDay: "ouvre {d} à {t}",
      days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
      fabLabel: "Contact rapide",
      fabCall: "Appeler un commercial",
      fabMap: "Itinéraire vers le dépôt",
      fabAll: "Tous nos contacts",
      fabHint: "Un devis ? Parlons-en",
      top: "Haut de page",
      footerAddr: "Zone Industrielle Mégrine Saint Gobain, Ben Arous",
      rights: "Tous droits réservés."
    },
    en: {
      heroCall: "Call",
      badgeRing: "STEEL • STAINLESS • ALUMINIUM • SINCE 1990 • ",
      since: "since",
      statFounded: "Year founded",
      statYears: "Years of experience",
      statFamilies: "Product families",
      statDays: "Days open a week",
      tick_Fer_Marchands: "Merchant bars",
      tick_Poutrelles: "Beams",
      tick_Toles: "Steel sheets",
      tick_Inox: "Stainless steel",
      tick_Aluminium: "Aluminium",
      tick_Tubes: "Tubes",
      tick_Panneaux_Sandwich: "Sandwich panels",
      tick_Caillebotis: "Gratings",
      tick_Lames_Rideaux: "Shutter slats",
      tick_Ressort: "Leaf springs",
      today: "Today",
      open: "Open now",
      closed: "Closed",
      lunch: "Lunch break",
      closesAt: "closes at {t}",
      reopensAt: "reopens at {t}",
      opensAt: "opens at {t}",
      opensTomorrow: "opens tomorrow at {t}",
      opensDay: "opens {d} at {t}",
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      fabLabel: "Quick contact",
      fabCall: "Call a sales rep",
      fabMap: "Directions to the depot",
      fabAll: "All our contacts",
      fabHint: "Need a quote? Let's talk",
      top: "Back to top",
      footerAddr: "Mégrine Saint Gobain Industrial Zone, Ben Arous",
      rights: "All rights reserved."
    }
  };

  function lang() {
    return html.lang === "en" ? "en" : "fr";
  }

  function t(key) {
    var d = I18N[lang()];
    return d[key] !== undefined ? d[key] : I18N.fr[key];
  }

  function applyTexts() {
    document.querySelectorAll("[data-pm-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-pm-i18n"));
      if (typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll("[data-pm-i18n-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-pm-i18n-label")));
    });
    document.querySelectorAll(".pm-day").forEach(function (el) {
      el.setAttribute("data-today", t("today"));
    });
    updateStatus();
  }

  /* ---------- Category ticker ---------- */
  var TICKS = ["Fer_Marchands", "Poutrelles", "Toles", "Inox", "Aluminium", "Tubes",
    "Panneaux_Sandwich", "Caillebotis", "Lames_Rideaux", "Ressort"];

  function buildTicker() {
    document.querySelectorAll(".pm-ticker__track").forEach(function (track) {
      var items = TICKS.concat(TICKS).map(function (k) {
        return '<span class="pm-tick" data-pm-i18n="tick_' + k + '"></span>' +
          '<span class="pm-tick__sep" aria-hidden="true">✦</span>';
      }).join("");
      track.innerHTML = '<div class="pm-ticker__set">' + items + "</div>" +
        '<div class="pm-ticker__set" aria-hidden="true">' + items + "</div>";
    });
  }

  /* ---------- Live opening status (Tunisia = UTC+1, no DST) ---------- */
  // minutes since midnight: [open, close]
  var HOURS = {
    0: [],
    1: [[480, 780], [840, 1020]],
    2: [[480, 780], [840, 1020]],
    3: [[480, 780], [840, 1020]],
    4: [[480, 780], [840, 1020]],
    5: [[480, 750], [840, 1020]],
    6: [[480, 780]]
  };

  function tunisNow() {
    var d = new Date(Date.now() + 60 * 60 * 1000);
    return { day: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }

  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    if (lang() === "fr") return (h < 10 ? "0" : "") + h + "h" + (m < 10 ? "0" : "") + m;
    var ap = h >= 12 ? "pm" : "am", h12 = h % 12 || 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + " " + ap;
  }

  function updateStatus() {
    var box = document.getElementById("pm-status");
    if (!box) return;
    var now = tunisNow(), slots = HOURS[now.day], state = "closed", detail = "";

    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      if (now.min >= s[0] && now.min < s[1]) {
        state = "open";
        detail = t("closesAt").replace("{t}", fmt(s[1]));
        break;
      }
      if (now.min < s[0]) {
        if (i === 0) {
          detail = t("opensAt").replace("{t}", fmt(s[0]));
        } else {
          state = "break";
          detail = t("reopensAt").replace("{t}", fmt(s[0]));
        }
        break;
      }
    }

    if (state === "closed" && !detail) {
      for (var k = 1; k <= 7; k++) {
        var nd = (now.day + k) % 7;
        if (HOURS[nd].length) {
          var at = fmt(HOURS[nd][0][0]);
          detail = k === 1 ? t("opensTomorrow").replace("{t}", at)
            : t("opensDay").replace("{d}", t("days")[nd]).replace("{t}", at);
          break;
        }
      }
    }

    box.className = "pm-status is-" + state;
    box.querySelector(".pm-status__text").innerHTML =
      "<b>" + t(state === "open" ? "open" : state === "break" ? "lunch" : "closed") + "</b> · " + detail;

    document.querySelectorAll(".pm-day").forEach(function (el) {
      var days = el.getAttribute("data-days").split(",").map(Number);
      el.classList.toggle("pm-today", days.indexOf(now.day) !== -1);
    });
  }

  /* ---------- Reveal on scroll + counters ---------- */
  function markReveal(selector, step) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.setAttribute("data-pm-reveal", "");
      if (step) el.style.setProperty("--d", (i * step).toFixed(2) + "s");
    });
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-pm-count"), 10);
    if (isNaN(target) || reduceMotion) return;
    var start = null, dur = 1600;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
    }
    el.textContent = "0";
    requestAnimationFrame(frame);
  }

  function setupReveal() {
    document.querySelectorAll(".sec-title").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (el, i) {
        el.setAttribute("data-pm-reveal", "");
        el.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
      });
    });
    markReveal(".pm-stat", 0.1);
    markReveal(".about-video", 0);
    markReveal(".menu-tab-wp", 0);
    markReveal(".book-table-info .row > [class*='col-']", 0.12);
    markReveal(".book-table-img-slider", 0);
    markReveal(".footer-info, .footer-flex-box > div", 0.1);

    var targets = document.querySelectorAll("[data-pm-reveal]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      targets.forEach(function (el) { el.classList.add("pm-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("pm-in");
        e.target.querySelectorAll("[data-pm-count]").forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Product cards: entrance + tilt ---------- */
  function setupCards() {
    var grid = document.getElementById("menu-dish");
    if (!grid) return;
    var seen = false;

    function prepare() {
      var cards = grid.querySelectorAll(".dish-box-wp:not(.pm-enter):not(.pm-wait)");
      if (!cards.length) return;
      cards.forEach(function (c, i) {
        c.style.setProperty("--i", i);
        c.classList.add(seen ? "pm-enter" : "pm-wait");
      });
    }

    new MutationObserver(prepare).observe(grid, { childList: true });
    prepare();

    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        seen = true;
        grid.querySelectorAll(".dish-box-wp.pm-wait").forEach(function (c) {
          c.classList.remove("pm-wait");
          c.classList.add("pm-enter");
        });
        io.disconnect();
      }, { threshold: 0.05 });
      io.observe(grid);
    } else {
      seen = true;
      grid.querySelectorAll(".pm-wait").forEach(function (c) { c.classList.remove("pm-wait"); });
    }

    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    grid.addEventListener("pointermove", function (e) {
      var box = e.target.closest && e.target.closest(".dish-box");
      if (!box) return;
      var r = box.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      box.style.setProperty("--ry", ((px - 0.5) * 10).toFixed(2) + "deg");
      box.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg");
      box.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      box.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      box.classList.add("pm-tilting");
    });

    grid.addEventListener("pointerout", function (e) {
      var box = e.target.closest && e.target.closest(".dish-box");
      if (!box || box.contains(e.relatedTarget)) return;
      ["--rx", "--ry", "--gx", "--gy"].forEach(function (p) { box.style.removeProperty(p); });
      box.classList.remove("pm-tilting");
    });
  }

  /* ---------- Scroll progress + active menu link ---------- */
  function setupScrollUI() {
    var bar = document.querySelector(".pm-progress");
    var topBtn = document.getElementById("pm-top");
    var content = document.getElementById("js-scroll-content");
    var spy = ["#home", "#about", "#menu", "#contact", "#gallery"].map(function (id) {
      return {
        el: document.querySelector(id),
        link: document.querySelector('.header-menu a[href="' + id + '"]')
      };
    }).filter(function (s) { return s.el && s.link; });

    var running = false, lastScroll = 0, current = null;

    function tick() {
      var desktop = window.innerWidth >= 992 && window.scroller;
      var y = desktop ? window.scroller.y : window.pageYOffset;
      var max = (content ? content.offsetHeight : document.body.scrollHeight) - window.innerHeight;
      var p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
      if (bar) bar.style.setProperty("--p", p.toFixed(4));
      if (topBtn) topBtn.classList.toggle("is-shown", y > window.innerHeight * 0.9);

      var line = window.innerHeight * 0.35, active = spy[0];
      spy.forEach(function (s) {
        if (s.el.getBoundingClientRect().top <= line) active = s;
      });
      if (active !== current) {
        spy.forEach(function (s) { s.link.classList.toggle("pm-current", s === active); });
        current = active;
      }

      if (performance.now() - lastScroll < 1400) requestAnimationFrame(tick);
      else running = false;
    }

    function kick() {
      lastScroll = performance.now();
      if (!running) { running = true; requestAnimationFrame(tick); }
    }

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();

    if (topBtn) {
      topBtn.addEventListener("click", function () {
        if (window.gsap && gsap.plugins && window.ScrollToPlugin) gsap.to(window, { scrollTo: 0, duration: 1 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ---------- Quick-contact button ---------- */
  function setupFab() {
    var fab = document.getElementById("pm-fab");
    if (!fab) return;
    var btn = document.getElementById("pm-fab-btn");
    var hint = fab.querySelector(".pm-fab__hint");

    function setOpen(open) {
      fab.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && hint) hint.classList.remove("is-shown");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!fab.classList.contains("is-open"));
    });

    document.addEventListener("click", function (e) {
      if (!fab.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    fab.querySelectorAll("[data-pm-goto]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        setOpen(false);
        var navLink = document.querySelector('.header-menu a[href="' + a.getAttribute("data-pm-goto") + '"]');
        if (navLink) navLink.click();
      });
    });

    // one gentle nudge per visit
    if (hint) {
      setTimeout(function () {
        if (fab.classList.contains("is-open")) return;
        hint.classList.add("is-shown");
        setTimeout(function () { hint.classList.remove("is-shown"); }, 5000);
      }, 7000);
    }
  }

  /* ---------- Boot ---------- */
  buildTicker();
  var year = document.getElementById("pm-year");
  if (year) year.textContent = new Date().getFullYear();

  new MutationObserver(applyTexts).observe(html, { attributes: true, attributeFilter: ["lang"] });
  applyTexts();

  setupReveal();
  setupCards();
  setupScrollUI();
  setupFab();
  setInterval(updateStatus, 60 * 1000);

  // keep the smooth scroller's page height equal to the real content height
  // (products, images and fonts arrive after the first measurement)
  function remeasure() {
    if (typeof window.onResize === "function") window.onResize();
  }

  var scrollContent = document.getElementById("js-scroll-content");
  if (scrollContent && "ResizeObserver" in window) {
    var lastH = 0;
    new ResizeObserver(function () {
      var h = scrollContent.offsetHeight;
      if (Math.abs(h - lastH) > 1) { lastH = h; remeasure(); }
    }).observe(scrollContent);
  }

  function ready() {
    html.classList.add("pm-loaded", "pm-ready");
    remeasure();
    setTimeout(remeasure, 800);
  }

  if (document.readyState === "complete") setTimeout(ready, 250);
  else window.addEventListener("load", function () { setTimeout(ready, 250); });
})();
