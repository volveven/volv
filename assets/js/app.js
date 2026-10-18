/* volvevent. – Seiten-JavaScript (alle Seiten).
   Keine Cookies, kein Local Storage, keine Anfragen an Dritte beim Laden der Seite.
   Formulare werden erst beim Absenden an Web3Forms übertragen. */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* Mobile Navigation ---------------------------------------------------- */
  var toggle = $(".nav__toggle");
  var panel = document.getElementById("nav-panel");
  var mq = window.matchMedia("(max-width: 1179px)");

  function setOpen(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    var label = toggle.querySelector(".nav__label");
    if (label) label.textContent = open ? "Schließen" : "Menü";
    panel.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (open) {
      var first = panel.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }
  }
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
      // Fokus im geöffneten Menü halten
      if (e.key === "Tab" && toggle.getAttribute("aria-expanded") === "true" && mq.matches) {
        var items = [toggle].concat($$("a", panel));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    var onChange = function () { if (!mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* Aktiven Eintrag der mobilen Schnellnavigation sichtbar machen --------- */
  var cur = $(".subnav a[aria-current]");
  if (cur && cur.parentElement && cur.offsetLeft > cur.parentElement.clientWidth * 0.6) {
    cur.parentElement.scrollLeft = cur.offsetLeft - 20;
  }

  /* E-Mail-Adresse zusammensetzen (leichter Schutz vor Adress-Sammlern) ---- */
  $$("[data-mail]").forEach(function (el) {
    var addr = el.getAttribute("data-u") + "@" + el.getAttribute("data-d");
    if (el.tagName === "A") {
      el.href = "mailto:" + addr;
      if (!el.hasAttribute("data-keep-text")) el.textContent = addr;
    } else {
      var a = document.createElement("a");
      a.href = "mailto:" + addr;
      a.textContent = addr;
      el.replaceWith(a);
    }
  });

  /* Hinweis nach erfolgreichem Formularversand (Web3Forms-Weiterleitung) -- */
  var notice = document.getElementById("form-success");
  if (notice && /[?&]success=true\b/.test(window.location.search)) {
    notice.hidden = false;
    notice.focus();
    var close = $(".notice__close", notice);
    if (close) close.addEventListener("click", function () { notice.hidden = true; });
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }

  /* Formulare: Honeypot, Mindest-Ausfüllzeit, Bestätigung per Schieberegler */
  $$("form[data-protect]").forEach(function (form) {
    var started = Date.now();
    var verify = $(".verify", form);
    var thumb = verify && $(".verify__thumb", verify);
    var track = verify && $(".verify__track", verify);
    var fill = verify && $(".verify__fill", verify);
    var text = verify && $(".verify__text", verify);
    var status = $(".form__status", form);
    var submit = $("button[type=submit]", form);
    var done = false;

    function setStatus(msg, isError) {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle("is-error", !!isError);
    }
    function complete() {
      done = true;
      verify.classList.add("is-done");
      thumb.setAttribute("aria-checked", "true");
      thumb.setAttribute("aria-label", "Bestätigt");
      if (fill) fill.style.width = "100%";
      if (text) text.textContent = "Bestätigt";
      if (submit) submit.disabled = false;
      setStatus("");
    }
    if (verify && thumb && track) {
      if (submit) submit.disabled = true;
      var dragging = false, startX = 0, max = 0;
      var setPos = function (x) {
        x = Math.max(0, Math.min(max, x));
        thumb.style.left = x + "px";
        if (fill) fill.style.width = (x + thumb.offsetWidth / 2) + "px";
        return x;
      };
      thumb.addEventListener("pointerdown", function (e) {
        if (done) return;
        dragging = true;
        startX = e.clientX - thumb.offsetLeft;
        max = track.clientWidth - thumb.offsetWidth;
        thumb.setPointerCapture(e.pointerId);
      });
      thumb.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var x = setPos(e.clientX - startX);
        if (x >= max - 2) { dragging = false; complete(); }
      });
      var end = function () {
        if (!dragging) return;
        dragging = false;
        if (!done) setPos(0);
      };
      thumb.addEventListener("pointerup", end);
      thumb.addEventListener("pointercancel", end);
      // Tastatur: Leertaste/Enter oder Pfeil nach rechts bestätigt
      thumb.addEventListener("keydown", function (e) {
        if (done) return;
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "End") {
          e.preventDefault();
          complete();
        }
      });
      thumb.addEventListener("click", function (e) {
        // Klick ohne Ziehen (z. B. Screenreader-Aktivierung): Bestätigung per Tastatur/Klick zulassen,
        // wenn das Element per Tastatur fokussiert wurde.
        if (!done && e.detail === 0) complete();
      });
    }

    form.addEventListener("submit", function (e) {
      var hp = $("input[name=botcheck]", form);
      if (hp && hp.checked) { e.preventDefault(); return; }
      if (Date.now() - started < 3000) {
        e.preventDefault();
        setStatus("Bitte prüfen Sie Ihre Angaben und senden Sie das Formular erneut.", true);
        return;
      }
      if (verify && !done) {
        e.preventDefault();
        setStatus("Bitte bestätigen Sie zuerst über den Schieberegler, dass Sie kein Bot sind.", true);
        if (thumb) thumb.focus();
        return;
      }
      var subj = $("input[name=subject]", form);
      var name = $("[data-subject-name]", form);
      if (subj && name && name.value.trim()) {
        subj.value = subj.getAttribute("data-base") + " von " + name.value.trim();
      }
      if (submit) { submit.disabled = true; submit.textContent = "Wird gesendet …"; }
    });
  });

  /* Termin: Leistung/Paket aus der URL vorbelegen (?service=…&paket=…) ------ */
  var svc = document.getElementById("termin-dienstleistung");
  if (svc) {
    var params = new URLSearchParams(window.location.search);
    var map = {
      netzwerk: "Enterprise Netzwerkarchitektur",
      server: "Server & Virtualisierung",
      security: "Cybersecurity & Zero-Trust",
      admin: "IT-Systemadministration",
      web: "High-End Webdesign & E-Commerce",
      dev: "App & SaaS Entwicklung"
    };
    var s = params.get("service");
    if (s && map[s]) svc.value = map[s];
    var paket = params.get("paket");
    var pakete = { starter: "Starter Business", corporate: "Corporate Enterprise", custom: "Custom SaaS & Shop" };
    var pf = document.getElementById("termin-paket");
    if (pf && paket && pakete[paket]) {
      pf.value = pakete[paket];
      var pi = document.getElementById("termin-paket-info");
      if (pi) { pi.hidden = false; pi.querySelector("strong").textContent = pakete[paket]; }
    }
  }

  /* Projekte: Filter ------------------------------------------------------- */
  var filterBar = document.querySelector("[data-filter-group]");
  if (filterBar) {
    var targetSel = filterBar.getAttribute("data-filter-group");
    var items = $$(targetSel);
    var live = document.getElementById(filterBar.getAttribute("data-filter-status"));
    $$(".filter", filterBar).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        $$(".filter", filterBar).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        var n = 0;
        items.forEach(function (el) {
          var cats = (el.getAttribute("data-cats") || "").split("|");
          var show = f === "all" || cats.indexOf(f) !== -1;
          el.hidden = !show;
          if (show) n++;
        });
        if (live) live.textContent = n + (n === 1 ? " Eintrag" : " Einträge") + " angezeigt";
      });
    });
  }

  /* Blog: Artikel im Dialog lesen (ohne JS: Sprungmarke zeigt den Artikel) - */
  var reader = document.getElementById("reader");
  if (reader && typeof reader.showModal === "function") {
    var readerBody = $(".reader__inner", reader);
    var lastFocus = null;
    var openPost = function (id, push) {
      var post = document.getElementById(id);
      if (!post || !post.classList.contains("post")) return false;
      lastFocus = document.activeElement;
      readerBody.innerHTML = "";
      var clone = post.cloneNode(true);
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
      var h = clone.querySelector(".post__title");
      if (h) { h.id = "reader-title"; h.setAttribute("tabindex", "-1"); }
      readerBody.appendChild(clone);
      reader.showModal();
      reader.scrollTop = 0;
      if (h) h.focus();
      if (push && window.history.pushState) window.history.pushState(null, "", "#" + id);
      return true;
    };
    var closePost = function () { if (reader.open) reader.close(); };
    reader.addEventListener("close", function () {
      if (window.location.hash && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    reader.addEventListener("click", function (e) {
      if (e.target === reader) { closePost(); return; }
      var c = e.target.closest("[data-close]");
      if (c) { e.preventDefault(); closePost(); }
    });
    $$("a[data-open]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (openPost(a.getAttribute("data-open"), true)) e.preventDefault();
      });
    });
    var openFromHash = function () {
      var id = window.location.hash.slice(1);
      if (id) openPost(id, false); else closePost();
    };
    window.addEventListener("popstate", openFromHash);
    if (window.location.hash) openFromHash();
  }

  /* Security-Audit: Risiko-Score berechnen --------------------------------- */
  var auditBtn = document.getElementById("audit-calc-btn");
  if (auditBtn) {
    auditBtn.addEventListener("click", function () {
      var score = 100, details = [];
      var val = function (n) { var el = document.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : null; };
      var mfa = val("audit-mfa");
      if (mfa === "none") { score -= 25; details.push("Keine flächendeckende Multi-Faktor-Authentifizierung – häufigstes Einfallstor."); }
      else if (mfa === "partial") { score -= 12; details.push("MFA nur für Administratoren – kompromittierte Mitarbeiterkonten bleiben ein Risiko."); }
      var vlan = val("audit-vlan");
      if (vlan === "flat") { score -= 20; details.push("Flaches Netzwerk ohne VLAN-Segmentierung – Schadsoftware kann sich ungehindert ausbreiten."); }
      else if (vlan === "basic") { score -= 8; details.push("VLANs vorhanden, aber unzureichende Firewall-Regeln zwischen den Zonen."); }
      var backup = val("audit-backup");
      if (backup === "online") { score -= 25; details.push("Backups nicht unveränderbar bzw. nicht vom Netz getrennt – Gefahr der Mitverschlüsselung."); }
      else if (backup === "untested") { score -= 12; details.push("Wiederherstellung wird nicht regelmäßig getestet."); }
      var edr = val("audit-edr");
      if (edr === "standard") { score -= 15; details.push("Signaturbasierter Virenschutz statt verhaltensbasierter Erkennung (EDR/XDR)."); }
      var nis2 = val("audit-nis2");
      if (nis2 === "unprepared") { score -= 10; details.push("NIS2-Anforderungen bisher nicht bewertet – mögliches Haftungsrisiko für die Geschäftsführung."); }
      if (score < 0) score = 0;

      var box = document.getElementById("audit-result");
      document.getElementById("audit-score-num").textContent = score + " / 100";
      var label = score >= 85 ? "Gut abgesichert" : score >= 60 ? "Erhöhtes Risiko – Handlungsbedarf vorhanden" : "Kritisch – akute Angriffsfläche";
      document.getElementById("audit-score-label").textContent = label;
      var bar = document.getElementById("audit-score-bar");
      if (bar) bar.style.transform = "scaleX(" + (score / 100) + ")";
      var list = document.getElementById("audit-deductions");
      list.innerHTML = "";
      if (!details.length) details.push("Keine gravierenden strukturellen Mängel erkannt. Empfehlung: regelmäßige Penetrationstests.");
      details.forEach(function (d) { var li = document.createElement("li"); li.textContent = d; list.appendChild(li); });
      box.hidden = false;
      var h = box.querySelector("h2");
      if (h) h.focus({ preventScroll: true });
      box.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  }

  /* Architektur: Topologie-Simulator --------------------------------------- */
  var sim = document.getElementById("topo-svg");
  if (sim) {
    var el = function (id) { return document.getElementById(id); };
    var setMode = function (mode) {
      $$("#topo-controls .filter").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === mode ? "true" : "false"); });
      var w1 = el("line-wan1"), w2 = el("line-wan2"), lc = el("line-clients"), nc = el("node-clients");
      [w1, w2, lc].forEach(function (l) { l.classList.remove("is-down", "is-standby", "is-active", "is-blocked"); });
      nc.classList.remove("is-blocked");
      var st = el("sim-status-text");
      if (mode === "normal") {
        w1.classList.add("is-active"); w2.classList.add("is-standby");
        el("status-wan1").textContent = "ONLINE (1 Gbit/s)";
        el("status-wan2").textContent = "STANDBY / CARP";
        el("sub-clients").textContent = "EDR überwacht // OK";
        st.textContent = "[STATUS] Normalbetrieb: WAN 1 aktiv, CARP synchronisiert, alle Zonen isoliert.";
      } else if (mode === "failover") {
        w1.classList.add("is-down"); w2.classList.add("is-active");
        el("status-wan1").textContent = "OFFLINE (Störung)";
        el("status-wan2").textContent = "AKTIV (Failover)";
        el("sub-clients").textContent = "EDR überwacht // OK";
        st.textContent = "[FAILOVER] WAN 1 ausgefallen. Die Backup-Leitung übernimmt automatisch.";
      } else if (mode === "isolate") {
        w1.classList.add("is-active"); w2.classList.add("is-standby");
        lc.classList.add("is-blocked"); nc.classList.add("is-blocked");
        el("status-wan1").textContent = "ONLINE (1 Gbit/s)";
        el("status-wan2").textContent = "STANDBY / CARP";
        el("sub-clients").textContent = "QUARANTÄNE // BLOCKIERT";
        st.textContent = "[ISOLATION] Verdächtige Aktivität auf einem Client: Die Firewall sperrt den Zugriff auf Server und Backup. Keine laterale Ausbreitung.";
      }
    };
    $$("#topo-controls .filter").forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
    });
    setMode("normal");
  }

  /* Architektur: Demo-Terminal --------------------------------------------- */
  var tIn = document.getElementById("terminal-input");
  var tBody = document.getElementById("terminal-body");
  var tForm = document.getElementById("terminal-form");
  if (tIn && tBody && tForm) {
    var commands = {
      help: "Verfügbare Befehle:\n  status      Status der Demo-Umgebung\n  audit       Schnellanalyse (Beispiel)\n  ping        Ping-Beispiel (DE-CIX Frankfurt)\n  whoami      Informationen zu volvevent.\n  services    Leistungsübersicht\n  webdesign   Webdesign-Pakete und Aktion\n  contact     Direktkontakt\n  clear       Ausgabe leeren",
      status: "[OK] Core Gateway: ONLINE (Uptime 99.99%)\n[OK] Firewall Cluster: ACTIVE/STANDBY (pfSense CARP Sync)\n[OK] Proxmox VE Nodes: 3/3 Healthy (Ceph Quorum OK)\n[OK] Zero-Trust Enforcer: VERIFIED\n[OK] SSL/TLS: A+ Grade (HSTS & Strict SNI Enforced)",
      audit: "Starte Security-Scan (Beispielausgabe) …\n[+] TLS 1.3 Cipher Suite: TLS_AES_256_GCM_SHA384 (sicher)\n[+] HTTP Security Header: CSP, X-Frame, HSTS aktiv\n[+] Vulnerabilities detected: 0\n[!] NIS2: Selbstcheck unter security-audit.html",
      ping: "PING de-cix-fra.volvevent.net (80.81.192.1): 56 data bytes\n64 bytes: icmp_seq=1 ttl=58 time=4.12 ms\n64 bytes: icmp_seq=2 ttl=58 time=4.08 ms\n64 bytes: icmp_seq=3 ttl=58 time=4.15 ms\n--- Ping-Statistik ---\n3 Pakete übertragen, 3 empfangen, 0 % Paketverlust, Avg: 4.11 ms",
      whoami: "volvevent. | IT-Architektur und Softwareentwicklung\nInhaber: Muhammet Hasan Gürcan (7+ Jahre Systemadministration & DevOps)\nStandort: Bäckerstr. 8a, 84030 Ergolding",
      services: "1. Enterprise Netzwerkarchitektur (Cisco, Aruba, VLAN-Segmentierung)\n2. Server & Virtualisierung (Proxmox VE, VMware, Hyper-V)\n3. Cybersecurity & Zero-Trust (Hardware-Firewalls, IDS/IPS, NIS2)\n4. Webdesign & E-Commerce (individueller Code, Core Web Vitals)\n5. App & SaaS Entwicklung (native Apps, sichere APIs)\n6. IT-Systemadministration (Wartung, Monitoring, Support)",
      webdesign: "Webdesign & Webentwicklung:\n- Individueller Code ohne Page-Builder\n- Aktion: 15 % Rabatt auf alle Pakete bis 30.10.2026\n- Details: webdesign.html",
      contact: "Telefon: +49 172 7045269\nWhatsApp: https://wa.me/491727045269\nE-Mail: kontakt@volvevent.de\nBüro: Bäckerstr. 8a, 84030 Ergolding"
    };
    var print = function (text, type) {
      var line = document.createElement("div");
      line.className = "terminal__line terminal__line--" + (type || "out");
      line.textContent = text;
      tBody.appendChild(line);
      tBody.scrollTop = tBody.scrollHeight;
    };
    var run = function (raw) {
      var v = raw.trim().toLowerCase();
      if (!v) return;
      print("admin@volvevent:~$ " + v, "cmd");
      if (v === "clear") { tBody.innerHTML = ""; return; }
      if (commands[v]) print(commands[v], "out");
      else print("Befehl '" + v + "' nicht gefunden. 'help' zeigt alle Befehle.", "warn");
    };
    tForm.addEventListener("submit", function (e) { e.preventDefault(); run(tIn.value); tIn.value = ""; });
    $$("[data-cmd]").forEach(function (b) {
      b.addEventListener("click", function () { run(b.getAttribute("data-cmd")); });
    });
  }
})();
