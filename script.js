/* ============================================================
   FLUIQ — Interacciones
   ============================================================ */
(function () {
  "use strict";

  // JS activo: quitar clase no-js para habilitar estilos dependientes de JS
  document.documentElement.classList.remove('no-js');

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Anti-bot: tiempo de carga y rate-limiting ---
  var pageLoadTime = Date.now();
  var lastSubmitTime = 0;
  var SUBMIT_COOLDOWN_MS = 30000;

  // --- Backend ---
  var LEAD_ENDPOINT = "/api/lead";
  // Respuestas del quiz del modal (tamaño + punto de fricción)
  var modalAnswers = { tamano: "", dolor: "" };

  /* ---------- Header sticky + barra de progreso ---------- */
  var header = document.getElementById("header");
  var scrollbar = document.getElementById("scrollbar");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (y > 30) header.classList.add("is-stuck");
    else header.classList.remove("is-stuck");

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (y / docH) * 100 : 0;
    scrollbar.style.width = pct + "%";

    updateTimelineFill();
    checkReveals();
    checkCounters();
    updateSpy();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMobile() {
    navToggle.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    var open = navToggle.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMobile);
  });

  /* ---------- Scrollspy / Reveal / Contadores (scroll-based, robusto) ----------
     Se evita IntersectionObserver porque no dispara de forma confiable en
     algunos entornos de render/captura. Un único loop de scroll lo maneja todo. */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link[data-spy]"));
  var spyTargets = spyLinks.map(function (l) {
    return document.getElementById(l.getAttribute("data-spy"));
  });

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function checkReveals() {
    var vh = window.innerHeight;
    for (var i = 0; i < reveals.length; i++) {
      var el = reveals[i];
      if (el.classList.contains("in")) continue;
      var top = el.getBoundingClientRect().top;
      if (top < vh * 0.9) el.classList.add("in");
    }
  }

  function animateCount(el) {
    if (el.__counted) return;
    el.__counted = true;
    var to = parseFloat(el.getAttribute("data-to"));
    if (prefersReduced) { el.textContent = to; return; }
    var dur = 1400, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = to;
    }
    requestAnimationFrame(tick);
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll(".count"));
  function checkCounters() {
    var vh = window.innerHeight;
    counters.forEach(function (c) {
      var top = c.getBoundingClientRect().top;
      if (top < vh * 0.85 && top > -vh) animateCount(c);
    });
  }

  function updateSpy() {
    var best = null, bestDist = Infinity;
    var anchor = window.innerHeight * 0.35;
    spyTargets.forEach(function (t, i) {
      if (!t) return;
      var r = t.getBoundingClientRect();
      if (r.top <= anchor && r.bottom >= anchor) { best = i; bestDist = 0; }
      else {
        var d = Math.min(Math.abs(r.top - anchor), Math.abs(r.bottom - anchor));
        if (r.top <= anchor && d < bestDist) { bestDist = d; best = i; }
      }
    });
    spyLinks.forEach(function (l, i) { l.classList.toggle("is-active", i === best); });
  }

  /* ---------- Timeline fill (método) ---------- */
  var timeline = document.getElementById("timeline");
  var timelineFill = document.getElementById("timelineFill");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  function updateTimelineFill() {
    if (!timeline || !timelineFill) return;
    var rect = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    var startPoint = vh * 0.55;
    var total = rect.height - 36;
    var progressed = startPoint - rect.top;
    var h = Math.max(0, Math.min(progressed, total));
    timelineFill.style.height = h + "px";

    // activar nodos a medida que el fill los alcanza
    steps.forEach(function (s) {
      var nodeMid = s.offsetTop + 32;
      s.classList.toggle("is-on", h >= nodeMid - 8);
    });
  }

  /* ============================================================
     Circuito del hero (SVG generado) — evoca el isotipo
     Solo se renderiza en viewport >= 721px para no desperdiciar
     CPU/GPU en mobile donde el SVG está oculto con CSS.
     ============================================================ */
  (function buildCircuit() {
    var svg = document.getElementById("circuit");
    if (!svg) return;
    // No construir ni animar el SVG en mobile (CSS lo oculta de todas formas)
    if (window.innerWidth <= 720) return;
    var SVGNS = "http://www.w3.org/2000/svg";
    var gT = svg.querySelector("#traces");
    var gN = svg.querySelector("#nodes");
    var gP = svg.querySelector("#pulses");

    // Núcleo (chip) centrado, trazas que salen como en una placa.
    var cx = 240, cy = 240;

    // Definición de trazas: cada una es un camino ortogonal desde el chip a un nodo.
    var traces = [
      { d: "M300 200 H360 V120 H410", end: [410, 120], lit: true },
      { d: "M300 220 H388 V200 H430", end: [430, 200], lit: false },
      { d: "M300 260 H360 V330 H402", end: [402, 330], lit: true },
      { d: "M300 280 H348 V400 H392", end: [392, 400], lit: false },
      { d: "M180 200 H120 V110 H78", end: [78, 110], lit: false },
      { d: "M180 220 H92 V190 H58", end: [58, 190], lit: true },
      { d: "M180 260 H120 V340 H84", end: [84, 340], lit: false },
      { d: "M180 285 H140 V410 H96", end: [96, 410], lit: true },
      { d: "M240 180 V90", end: [240, 90], lit: false },
      { d: "M240 300 V392", end: [240, 392], lit: true }
    ];

    traces.forEach(function (t) {
      var p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", t.d);
      p.setAttribute("class", "trace" + (t.lit ? " trace--lit" : ""));
      // draw-in
      var len = p.getTotalLength ? 600 : 600;
      gT.appendChild(p);
      if (!prefersReduced && p.getTotalLength) {
        var L = p.getTotalLength();
        p.style.strokeDasharray = L;
        p.style.strokeDashoffset = L;
        p.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.22,.61,.36,1)";
      }
    });

    // Nodos terminales
    traces.forEach(function (t, i) {
      var ex = t.end[0], ey = t.end[1];
      if (i % 3 === 0) {
        var ring = document.createElementNS(SVGNS, "circle");
        ring.setAttribute("cx", ex); ring.setAttribute("cy", ey);
        ring.setAttribute("r", "11");
        ring.setAttribute("class", "node node--ring");
        gN.appendChild(ring);
      }
      var c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", ex); c.setAttribute("cy", ey);
      c.setAttribute("r", t.lit ? "6" : "5");
      c.setAttribute("class", "node" + (t.lit ? " node--core" : ""));
      gN.appendChild(c);
    });

    // Chip central
    var chip = document.createElementNS(SVGNS, "rect");
    chip.setAttribute("x", cx - 60); chip.setAttribute("y", cy - 60);
    chip.setAttribute("width", 120); chip.setAttribute("height", 120);
    chip.setAttribute("rx", 14);
    chip.setAttribute("class", "chip");
    gN.appendChild(chip);

    var core = document.createElementNS(SVGNS, "rect");
    core.setAttribute("x", cx - 22); core.setAttribute("y", cy - 22);
    core.setAttribute("width", 44); core.setAttribute("height", 44);
    core.setAttribute("rx", 8);
    core.setAttribute("class", "chip-core");
    gN.appendChild(core);

    // pequeñas patas del chip (detalle PCB)
    [-40, -14, 14, 40].forEach(function (off) {
      ["top", "bottom", "left", "right"].forEach(function (side) {
        var pin = document.createElementNS(SVGNS, "line");
        if (side === "top") { pin.setAttribute("x1", cx + off); pin.setAttribute("y1", cy - 60); pin.setAttribute("x2", cx + off); pin.setAttribute("y2", cy - 70); }
        if (side === "bottom") { pin.setAttribute("x1", cx + off); pin.setAttribute("y1", cy + 60); pin.setAttribute("x2", cx + off); pin.setAttribute("y2", cy + 70); }
        if (side === "left") { pin.setAttribute("x1", cx - 60); pin.setAttribute("y1", cy + off); pin.setAttribute("x2", cx - 70); pin.setAttribute("y2", cy + off); }
        if (side === "right") { pin.setAttribute("x1", cx + 60); pin.setAttribute("y1", cy + off); pin.setAttribute("x2", cx + 70); pin.setAttribute("y2", cy + off); }
        pin.setAttribute("stroke", "rgba(255,255,255,0.3)");
        pin.setAttribute("stroke-width", "1.4");
        gN.appendChild(pin);
      });
    });

    // dispara draw-in
    if (!prefersReduced) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          gT.querySelectorAll(".trace").forEach(function (p, i) {
            p.style.transitionDelay = (i * 0.08) + "s";
            p.style.strokeDashoffset = "0";
          });
        });
      });

      // pulsos viajando por las trazas iluminadas
      var litPaths = traces.map(function (t, i) { return t.lit ? gT.children[i] : null; }).filter(Boolean);
      litPaths.forEach(function (path, idx) {
        var pulse = document.createElementNS(SVGNS, "circle");
        pulse.setAttribute("r", "3.2");
        pulse.setAttribute("class", "pulse");
        gP.appendChild(pulse);
        var L = path.getTotalLength ? path.getTotalLength() : 0;
        var speed = 0.00018 + Math.random() * 0.00008;
        var offset = Math.random();
        function move(ts) {
          // Pausar cuando la pestaña está en segundo plano
          if (document.hidden) { requestAnimationFrame(move); return; }
          var t = ((ts * speed) + offset) % 1;
          if (L) {
            var pt = path.getPointAtLength(t * L);
            pulse.setAttribute("cx", pt.x);
            pulse.setAttribute("cy", pt.y);
            pulse.setAttribute("opacity", 0.3 + 0.7 * Math.sin(t * Math.PI));
          }
          requestAnimationFrame(move);
        }
        requestAnimationFrame(move);
      });
    }
  })();

  /* ============================================================
     Modal multi-paso "Hablemos"
     ============================================================ */
  var modal = document.getElementById("modal");
  var modalSteps = Array.prototype.slice.call(modal.querySelectorAll(".modal__step"));
  var progressBars = Array.prototype.slice.call(document.querySelectorAll("#modalProgress i"));
  var currentStep = 0;
  var lastFocused = null;

  function showStep(n) {
    currentStep = n;
    modalSteps.forEach(function (s) {
      s.classList.toggle("is-active", parseInt(s.getAttribute("data-step"), 10) === n);
    });
    progressBars.forEach(function (b, i) { b.classList.toggle("done", i <= Math.min(n, 2)); });
  }

  var modalCard = modal.querySelector('.modal__card');

  function openModal() {
    lastFocused = document.activeElement;
    showStep(0);
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeMobile();
    // Enfocar primer elemento interactivo al abrir
    setTimeout(function () {
      var first = modalCard.querySelector('button:not([disabled]), input, textarea');
      if (first) first.focus();
    }, 60);
  }
  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll("[data-modal-open]").forEach(function (b) {
    b.addEventListener("click", openModal);
  });
  document.querySelectorAll("[data-modal-close]").forEach(function (b) {
    b.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) { closeModal(); return; }

    // Focus trap: mantener el foco dentro del modal mientras está abierto
    if (e.key === "Tab" && modal.classList.contains("is-open")) {
      var focusable = Array.prototype.slice.call(
        modalCard.querySelectorAll('button:not([disabled]), input:not([tabindex="-1"]), textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return el.offsetParent !== null; });
      if (focusable.length < 2) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  modal.querySelectorAll("[data-next]").forEach(function (b) {
    b.addEventListener("click", function () {
      // registrar la respuesta elegida para enviarla al backend
      var key = b.getAttribute("data-answer");
      if (key && modalAnswers.hasOwnProperty(key)) {
        modalAnswers[key] = (b.textContent || "").trim();
      }
      // marcar selección visual
      var siblings = b.parentElement.querySelectorAll(".opt");
      siblings.forEach(function (s) { s.classList.remove("is-selected"); });
      b.classList.add("is-selected");
      if (currentStep < 2) showStep(currentStep + 1);
    });
  });
  modal.querySelectorAll("[data-back]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  });

  /* ---------- Validación de formularios ---------- */
  function validateField(field) {
    var input = field.querySelector("input, textarea");
    if (!input || !input.hasAttribute("required")) return true;
    var val = input.value.trim();
    var ok = val.length > 0;
    if (input.type === "email") {
      // Validación RFC 5321 simplificada (más estricta que la anterior)
      ok = val.length >= 6 && /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val);
    }
    field.classList.toggle("is-invalid", !ok);
    return ok;
  }

  function setFormError(form, msg) {
    var box = form.querySelector(".form__error");
    if (!box) {
      box = document.createElement("div");
      box.className = "form__error";
      box.setAttribute("role", "alert");
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.parentNode.insertBefore(box, submitBtn);
      else form.appendChild(box);
    }
    box.textContent = msg || "";
    box.classList.toggle("is-shown", !!msg);
  }

  function sendLead(payload) {
    return fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().then(function (body) {
        return { ok: res.ok && body && body.ok, status: res.status, body: body || {} };
      }).catch(function () {
        return { ok: res.ok, status: res.status, body: {} };
      });
    });
  }

  function wireForm(form, onSuccess) {
    if (!form) return;
    var submitBtn = form.querySelector('button[type="submit"]');
    var btnLabel = submitBtn ? submitBtn.innerHTML : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setFormError(form, "");

      // 1. Honeypot: campo trampa completado = bot, descartar en silencio
      var honeypot = form.querySelector("[data-hp]");
      if (honeypot && honeypot.value.trim() !== "") return;

      // 2. Velocidad de llenado: < 1.5 s desde carga de página = probable bot
      if (Date.now() - pageLoadTime < 1500) return;

      // 3. Rate-limiting: evitar envíos repetidos en menos de 30 s
      var now = Date.now();
      if (now - lastSubmitTime < SUBMIT_COOLDOWN_MS) {
        setFormError(form, "Recién enviaste un mensaje. Esperá unos segundos.");
        return;
      }

      var fields = Array.prototype.slice.call(form.querySelectorAll(".field"));
      var valid = true;
      fields.forEach(function (f) { if (!validateField(f)) valid = false; });
      if (!valid) {
        var firstBad = form.querySelector(".field.is-invalid input, .field.is-invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }

      // Recolectar datos
      function val(name) {
        var el = form.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : "";
      }
      var payload = {
        nombre: val("nombre"),
        email: val("email"),
        consultora: val("consultora"),
        mensaje: val("mensaje"),
        tamano: modalAnswers.tamano,
        dolor: modalAnswers.dolor,
        origen: form.id === "modalForm" ? "modal" : "seccion",
        website: honeypot ? honeypot.value : "",
        elapsedMs: Date.now() - pageLoadTime
      };

      // Estado de carga
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "Enviando…"; }

      sendLead(payload).then(function (result) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = btnLabel; }
        if (result.ok) {
          lastSubmitTime = Date.now();
          onSuccess();
        } else if (result.status === 429) {
          setFormError(form, "Demasiados envíos. Probá de nuevo en un minuto.");
        } else if (result.status === 422) {
          setFormError(form, "Revisá los datos ingresados.");
        } else {
          setFormError(form, "No pudimos enviar tu mensaje. Escribinos por WhatsApp y lo resolvemos.");
        }
      }).catch(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = btnLabel; }
        setFormError(form, "Hubo un problema de conexión. Probá de nuevo o escribinos por WhatsApp.");
      });
    });

    // limpiar error al escribir
    form.querySelectorAll("input, textarea").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var field = inp.closest(".field");
        if (field && field.classList.contains("is-invalid")) validateField(field);
      });
    });
  }

  // Form de sección
  wireForm(document.getElementById("leadForm"), function () {
    document.getElementById("formFields").style.display = "none";
    document.getElementById("formSuccess").classList.add("is-shown");
  });

  // Form del modal
  wireForm(document.getElementById("modalForm"), function () {
    showStep(3);
    progressBars.forEach(function (b) { b.classList.add("done"); });
  });

  // init
  function settle() {
    onScroll();
    checkReveals();
    updateTimelineFill();
  }
  settle();
  requestAnimationFrame(settle);
  setTimeout(settle, 120);
  setTimeout(settle, 400);
  window.addEventListener("load", settle);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  window.addEventListener("resize", function () {
    updateTimelineFill();
    checkReveals();
  }, { passive: true });
})();
