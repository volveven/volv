document.addEventListener('DOMContentLoaded', () => {

    /* --- 0. Formular Erfolgs-Check (Web3Forms Redirect) --- */
    if (window.location.search.includes('success=true')) {
        alert("Erfolg! Ihre verschlüsselte Nachricht / Terminbuchung wurde erfolgreich an uns übermittelt.");
        // URL bereinigen, ohne die Seite neu zu laden
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    /* --- 0.5 Mobile Navigation (Robust for all devices including Android) --- */
    const navLeiste = document.getElementById('navigationsleiste');
    const menueListe = document.querySelector('.menue-liste');
    let mobileToggle = document.getElementById('mobile-menue-toggle') || document.querySelector('.mobile-menue-knopf');

    // Fallback falls der Button noch nicht im HTML ist
    if (navLeiste && menueListe && !mobileToggle) {
        mobileToggle = document.createElement('button');
        mobileToggle.id = 'mobile-menue-toggle';
        mobileToggle.className = 'mobile-menue-knopf interaktives-element';
        mobileToggle.setAttribute('aria-label', 'Menü öffnen');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = '<span class="burger-bar"></span><span class="burger-bar"></span><span class="burger-bar"></span>';
        
        const actionWrapper = document.createElement('div');
        actionWrapper.className = 'nav-mobile-actions';
        const mobileCta = document.createElement('a');
        mobileCta.href = 'termin.html';
        mobileCta.className = 'nav-mobile-cta interaktives-element';
        mobileCta.textContent = 'Termin';
        actionWrapper.appendChild(mobileCta);
        actionWrapper.appendChild(mobileToggle);
        
        menueListe.parentNode.insertBefore(actionWrapper, menueListe);
    }

    if (mobileToggle && menueListe) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menueListe.classList.toggle('offen');
            mobileToggle.classList.toggle('offen', isOpen);
            mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Menü schließen wenn ein Menülink angeklickt wird
        menueListe.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menueListe.classList.remove('offen');
                mobileToggle.classList.remove('offen');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Menü mit Escape schließen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menueListe.classList.contains('offen')) {
                menueListe.classList.remove('offen');
                mobileToggle.classList.remove('offen');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    /* --- 1. Smart Navigation (Nur auf Desktop aktiv - Auf Android & Mobilgeräten BLEIBT DIE LEISTE IMMER SICHTBAR) --- */
    const navigationsleiste = document.getElementById('navigationsleiste');
    if (navigationsleiste) {
        let letzeScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        window.addEventListener('scroll', () => {
            // Auf allen Smartphones & Tablets (Android, iOS) niemals ausblenden!
            if (window.innerWidth <= 1080) {
                navigationsleiste.classList.remove('versteckt');
                return;
            }

            const aktuelleScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            if (aktuelleScrollPosition > 80) {
                if (aktuelleScrollPosition > letzeScrollPosition) {
                    navigationsleiste.classList.add('versteckt');
                } else {
                    navigationsleiste.classList.remove('versteckt');
                }
            } else {
                navigationsleiste.classList.remove('versteckt');
            }
            letzeScrollPosition = aktuelleScrollPosition <= 0 ? 0 : aktuelleScrollPosition;
        }, { passive: true });
    }

    /* --- 2. Custom Präzisions-Cursor (Robust & Desktop-aktiviert) --- */
    const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (isDesktopPointer) {
        let mausAussen = document.getElementById('maus-zeiger-aussen');
        let mausInnen = document.getElementById('maus-zeiger-innen');

        if (!mausAussen) {
            mausAussen = document.createElement('div');
            mausAussen.id = 'maus-zeiger-aussen';
            mausAussen.className = 'maus-zeiger-aussen';
            document.body.appendChild(mausAussen);
        } else {
            mausAussen.className = 'maus-zeiger-aussen';
        }

        if (!mausInnen) {
            mausInnen = document.createElement('div');
            mausInnen.id = 'maus-zeiger-innen';
            mausInnen.className = 'maus-zeiger-innen';
            document.body.appendChild(mausInnen);
        } else {
            mausInnen.className = 'maus-zeiger-innen';
        }

        // Native Cursor nur verbergen, weil Custom Cursor erfolgreich instanziiert wurde
        document.documentElement.classList.add('custom-cursor-aktiv');

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let isVisible = false;

        window.addEventListener('mousemove', (ereignis) => {
            mouseX = ereignis.clientX;
            mouseY = ereignis.clientY;
            if (!isVisible) {
                isVisible = true;
                mausAussen.style.opacity = '1';
                mausInnen.style.opacity = '1';
                ringX = mouseX;
                ringY = mouseY;
            }
            mausInnen.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        }, { passive: true });

        const animateCursorRing = () => {
            if (isVisible) {
                ringX += (mouseX - ringX) * 0.22;
                ringY += (mouseY - ringY) * 0.22;
                mausAussen.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animateCursorRing);
        };
        requestAnimationFrame(animateCursorRing);

        document.addEventListener('mousedown', () => {
            mausAussen.classList.add('klick-aktiv');
        });
        document.addEventListener('mouseup', () => {
            mausAussen.classList.remove('klick-aktiv');
        });

        document.addEventListener('mouseleave', () => {
            isVisible = false;
            mausAussen.style.opacity = '0';
            mausInnen.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            isVisible = true;
            mausAussen.style.opacity = '1';
            mausInnen.style.opacity = '1';
        });

        // Event-Delegation für alle interaktiven Elemente (funktioniert auch für dynamische Artikel/Modals)
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, input, select, textarea, label, .interaktives-element, [role="button"], .artikel-karte, .guide-article, .forum-card')) {
                mausAussen.classList.add('hover-aktiv');
                mausInnen.classList.add('hover-aktiv');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('a, button, input, select, textarea, label, .interaktives-element, [role="button"], .artikel-karte, .guide-article, .forum-card')) {
                mausAussen.classList.remove('hover-aktiv');
                mausInnen.classList.remove('hover-aktiv');
            }
        });
    }

    /* --- 3. Terminbuchungs-Modul (9-18 Uhr, 1h Takt) --- */
    const kalenderRaster = document.getElementById('buchungs-kalender');
    const datumInput = document.getElementById('ausgewaehltes-datum');
    const uhrzeitContainer = document.getElementById('uhrzeiten-container');
    const uhrzeitInput = document.getElementById('ausgewaehlte-uhrzeit');
    const uhrzeitRaster = document.getElementById('uhrzeiten-raster');

    if (kalenderRaster) {
        for(let i = 0; i < 3; i++) {
            const leer = document.createElement('div');
            kalenderRaster.appendChild(leer);
        }

        for(let tag = 1; tag <= 31; tag++) {
            const tagElement = document.createElement('div');
            tagElement.className = 'kalender-tag interaktives-element';
            tagElement.textContent = tag;
            
            const wochentag = (tag + 2) % 7; 
            
            if(wochentag === 5 || wochentag === 6) {
                tagElement.classList.add('inaktiv');
                tagElement.classList.remove('interaktives-element');
            } else {
                tagElement.addEventListener('click', () => {
                    document.querySelectorAll('.kalender-tag').forEach(el => el.classList.remove('ausgewaehlt'));
                    tagElement.classList.add('ausgewaehlt');
                    datumInput.value = `${tag}. Oktober 2026`;
                    
                    uhrzeitContainer.style.display = 'block';
                    document.querySelectorAll('.uhrzeit-slot').forEach(el => el.classList.remove('ausgewaehlt'));
                    uhrzeitInput.value = "";
                });
            }
            kalenderRaster.appendChild(tagElement);
        }
        
        if(uhrzeitRaster) {
            const zeitslots = [
                "09:00", "10:00", "11:00", 
                "12:00", "13:00", "14:00", 
                "15:00", "16:00", "17:00", "18:00"
            ];
            zeitslots.forEach(zeit => {
                const slot = document.createElement('div');
                slot.className = 'uhrzeit-slot interaktives-element';
                slot.textContent = zeit;
                slot.addEventListener('click', () => {
                    document.querySelectorAll('.uhrzeit-slot').forEach(el => el.classList.remove('ausgewaehlt'));
                    slot.classList.add('ausgewaehlt');
                    uhrzeitInput.value = zeit;
                });
                uhrzeitRaster.appendChild(slot);
            });
        }
    }

    /* --- 4. Enterprise Security Slider (Bot-Schutz) --- */
    const setupSlider = (containerId, thumbId, trackId, textId) => {
        const container = document.getElementById(containerId);
        const thumb = document.getElementById(thumbId);
        const track = document.getElementById(trackId);
        const textElement = document.getElementById(textId);
        if(!container || !thumb) return { isVerified: () => false, reset: () => {} };

        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        let verifiziert = false;
        const maxSlide = container.clientWidth - thumb.clientWidth - 8; // 8px padding

        const onMove = (e) => {
            if (!isDragging || verifiziert) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            currentX = clientX - startX;
            if (currentX < 0) currentX = 0;
            if (currentX >= maxSlide) {
                currentX = maxSlide;
                verifiziert = true;
                container.classList.add('verifiziert');
                textElement.innerHTML = 'Verifiziert <svg viewBox="0 0 24 24" width="16" height="16" style="margin-left:5px" fill="none"><path d="M5 13l4 4L19 7" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                isDragging = false;
            }
            thumb.style.left = `calc(4px + ${currentX}px)`;
            track.style.width = `calc(4px + ${currentX}px + 20px)`;
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            if (!verifiziert) {
                thumb.style.left = '4px';
                track.style.width = '0';
                currentX = 0;
            }
        };

        thumb.addEventListener('mousedown', (e) => { isDragging = true; startX = e.clientX - currentX; });
        thumb.addEventListener('touchstart', (e) => { isDragging = true; startX = e.touches[0].clientX - currentX; }, {passive: true});
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, {passive: true});
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);

        return {
            isVerified: () => verifiziert,
            reset: () => {
                verifiziert = false;
                container.classList.remove('verifiziert');
                thumb.style.left = '4px';
                track.style.width = '0';
                currentX = 0;
                textElement.innerHTML = 'Sitzung verifizieren <span style="font-family: monospace; opacity: 0.6; margin-left: 8px;">[Slide]</span>';
            }
        };
    };

    const loadTime = Date.now();
    const indexSlider = setupSlider('slide-captcha', 'slide-thumb', 'slide-track', 'slide-text');
    const kontaktSlider = setupSlider('slide-captcha-kontakt', 'slide-thumb-kontakt', 'slide-track-kontakt', 'slide-text-kontakt');
    const terminSlider = setupSlider('slide-captcha-termin', 'slide-thumb-termin', 'slide-track-termin', 'slide-text-termin');

    const formular = document.getElementById('buchungs-formular');
    const formularStatus = document.getElementById('formular-status');
    const absendenKnopf = document.getElementById('absenden-knopf');

    if(formular) {
        const sanitiereEingabe = (text) => {
            const element = document.createElement('div');
            element.innerText = text;
            return element.innerHTML;
        };

        formular.addEventListener('submit', (ereignis) => {
            ereignis.preventDefault();
            
            if(!datumInput.value || !uhrzeitInput.value) {
                formularStatus.textContent = "Bitte wählen Sie Datum und exakte Uhrzeit aus.";
                formularStatus.style.color = "#ff453a"; 
                return;
            }

            // Honeypot Check (Bot Falle)
            const honeypot = document.getElementById('sec-honeypot');
            if (honeypot && honeypot.value !== "") {
                return; // Silent fail für Bots
            }

            // Timestamp Check (zu schnell = Bot)
            if (Date.now() - loadTime < 3000) {
                formularStatus.textContent = "Verifizierung fehlgeschlagen (Time-Lock).";
                formularStatus.style.color = "#ff453a";
                return;
            }

            // Slider Check
            if (!indexSlider.isVerified()) {
                formularStatus.textContent = "Bitte ziehen Sie den Regler zur Verifizierung nach rechts.";
                formularStatus.style.color = "#ff453a";
                return;
            }

            const rohName = document.getElementById('eingabe-name').value;
            const saubererName = sanitiereEingabe(rohName);
            
            formularStatus.style.color = "var(--text-haupt)";
            formularStatus.textContent = "Verbindung wird hergestellt...";
            absendenKnopf.disabled = true;

            // Versteckte Felder befüllen
            document.getElementById('hidden-subject').value = "Neue Terminbuchung von " + saubererName;
            document.getElementById('ausgewaehltes-datum').value = datumInput.value;
            document.getElementById('ausgewaehlte-uhrzeit').value = uhrzeitInput.value;
            
            // Native Formular-Übermittlung (bypasses CORS/Adblockers)
            formular.submit();
        });
    }

    /* --- 4.5 Kontaktformular (Web3Forms) --- */
    const kontaktFormular = document.getElementById('kontakt-formular');
    const kontaktStatus = document.getElementById('kontakt-status');
    const kontaktKnopf = document.getElementById('kontakt-absenden');

    if(kontaktFormular) {
        kontaktFormular.addEventListener('submit', (ereignis) => {
            ereignis.preventDefault();
            
            // Honeypot Check (Bot Falle)
            const honeypot = document.getElementById('sec-honeypot-kontakt');
            if (honeypot && honeypot.value !== "") {
                return; // Silent fail für Bots
            }

            // Timestamp Check (zu schnell = Bot)
            if (Date.now() - loadTime < 3000) {
                kontaktStatus.textContent = "Verifizierung fehlgeschlagen (Time-Lock).";
                kontaktStatus.style.color = "#ff453a";
                return;
            }

            // Slider Check
            if (!kontaktSlider.isVerified()) {
                kontaktStatus.textContent = "Bitte ziehen Sie den Regler zur Verifizierung nach rechts.";
                kontaktStatus.style.color = "#ff453a";
                return;
            }
            
            kontaktStatus.style.color = "var(--text-haupt)";
            kontaktStatus.textContent = "Verbindung wird hergestellt...";
            kontaktKnopf.disabled = true;

            // Verstecktes Feld befüllen
            document.getElementById('kontakt-hidden-subject').value = "Kontaktanfrage von " + document.getElementById('kontakt-name').value;
            
            // Native Formular-Übermittlung (bypasses CORS/Adblockers)
            kontaktFormular.submit();
        });
    }

    /* --- 4.6 Termin-Formular (termin.html) --- */
    const terminFormular = document.getElementById('termin-formular') || document.getElementById('terminForm');
    const terminStatus = document.getElementById('termin-formular-status');
    const terminKnopf = document.getElementById('termin-absenden') || (terminFormular ? terminFormular.querySelector('.submit-btn') : null);

    if(terminFormular) {
        terminFormular.addEventListener('submit', (e) => {
            e.preventDefault();

            // Slider Check
            if (!terminSlider.isVerified()) {
                if(terminStatus) {
                    terminStatus.textContent = 'Bitte ziehen Sie den Regler zur Verifizierung nach rechts.';
                    terminStatus.style.color = '#ff453a';
                }
                return;
            }

            // Timestamp Check
            if (Date.now() - loadTime < 3000) {
                if(terminStatus) {
                    terminStatus.textContent = 'Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
                    terminStatus.style.color = '#ff453a';
                }
                return;
            }

            if(terminStatus) {
                terminStatus.textContent = 'Verbindung wird hergestellt...';
                terminStatus.style.color = 'var(--akzent-blau, #2997FF)';
            }
            if(terminKnopf) terminKnopf.disabled = true;

            // Subject dynamisch setzen
            const nameVal = document.getElementById('termin-name') ? document.getElementById('termin-name').value : '';
            const dienstVal = document.getElementById('termin-dienstleistung') ? document.getElementById('termin-dienstleistung').value : '';
            const hiddenSubj = document.getElementById('termin-hidden-subject');
            if(hiddenSubj) hiddenSubj.value = 'Terminanfrage: ' + dienstVal + ' von ' + nameVal;

            terminFormular.submit();
        });
    }

    /* --- 5. Scroll Reveal Animationen (Alle Seiten & Komponenten) --- */
    const animierbareElemente = document.querySelectorAll('.erscheinen-element, .reveal');
    if (animierbareElemente.length > 0) {
        const scrollBeobachter = new IntersectionObserver((eintraege) => {
            eintraege.forEach(eintrag => {
                if (eintrag.isIntersecting) {
                    eintrag.target.classList.add('sichtbar', 'active');
                }
            });
        }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

        animierbareElemente.forEach(element => scrollBeobachter.observe(element));

        // Ausfallsichere Sofort-Aktivierung für sichtbaren Bereich
        const sichereSichtbarkeit = () => {
            animierbareElemente.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight + 100) {
                    el.classList.add('sichtbar', 'active');
                }
            });
        };
        sichereSichtbarkeit();
        setTimeout(sichereSichtbarkeit, 300);
        setTimeout(sichereSichtbarkeit, 1000);
    }

    /* --- 6. Dynamic Bento / Spotlight Cursor Illumination --- */
    document.addEventListener('mousemove', (e) => {
        const spotCards = document.querySelectorAll('.spotlight-card, .bento-card, .pricing-card');
        if (spotCards.length > 0) {
            spotCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            });
        }
    }, { passive: true });

    /* --- 7. Interactive Live Terminal Engine --- */
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');
    if (terminalInput && terminalBody) {
        const commands = {
            'help': 'Verfügbare Befehle:\n  status      - Zeigt Live-Status aller Systeme\n  audit       - Führt Schnellanalyse der Infrastruktur durch\n  ping        - Simuliert Ping zu DE-CIX Frankfurt (Latenz)\n  whoami      - Zeigt Informationen zu volvevent. & Gründer\n  services    - Listet Kernarchitekturen auf\n  webdesign   - Details zu High-End Webdesign & 15% Rabatt\n  contact     - Zeigt Direktkontakt & WhatsApp an\n  clear       - Bereinigt den Terminal-Bildschirm',
            'status': '[OK] Core Gateway: ONLINE (Uptime 99.99%)\n[OK] Firewall Cluster: ACTIVE/STANDBY (pfSense CARP Sync)\n[OK] Proxmox VE Nodes: 3/3 Healthy (Ceph Quorum OK)\n[OK] Zero-Trust Enforcer: VERIFIED\n[OK] SSL/TLS: A+ Grade (HSTS & Strict SNI Enforced)',
            'audit': 'Starte automatisches Security-Scanning...\n[+] TLS 1.3 Cipher Suite: TLS_AES_256_GCM_SHA384 (Sicher)\n[+] HTTP Security Header: CSP, X-Frame, HSTS aktiv\n[+] Vulnerabilities detected: 0\n[!] NIS2-Compliance: Prüfe NIS2-Konformität auf security-audit.html',
            'ping': 'PING de-cix-fra.volvevent.net (80.81.192.1): 56 data bytes\n64 bytes: icmp_seq=1 ttl=58 time=4.12 ms\n64 bytes: icmp_seq=2 ttl=58 time=4.08 ms\n64 bytes: icmp_seq=3 ttl=58 time=4.15 ms\n--- Ping Statistik ---\n3 Pakete übertragen, 3 empfangen, 0% Paketverlust, Avg: 4.11 ms',
            'whoami': 'volvevent. | Enterprise IT-Architektur & High-End Softwareentwicklung\nInhaber: Muhammet Hasan Gürcan (7+ Jahre Sysadmin & Enterprise DevOps)\nStandort: Bäckerstr. 8a, 84030 Ergolding (Deutschland)\nFokus: Kompromisslose IT-Sicherheit, Performance & maßgeschneiderter Code',
            'services': '1. Enterprise Netzwerkarchitektur (Cisco, Aruba, VLAN-Segmentierung)\n2. Server & Virtualisierung (Proxmox VE, VMware, Hyper-V Clusters)\n3. Cybersecurity & Zero-Trust (Hardware-Firewalls, IDS/IPS, NIS2)\n4. High-End Webdesign & E-Commerce (100% Custom Code, Core Web Vitals)\n5. App & SaaS Entwicklung (Native Apps, sichere APIs)',
            'webdesign': 'High-End Webdesign & Performance Webentwicklung:\n- 100% PageSpeed, Ladezeiten < 0.8s, keine WordPress-Bloatware\n- Aktionsrabatt: 15% Rabatt auf alle Pakete bis zum 30.10.!\n- Mehr erfahren auf: webdesign.html',
            'contact': 'Telefon: +49 172 7045269\nWhatsApp: https://wa.me/491727045269\nE-Mail: kontakt@volvevent.de\nBüro: Bäckerstr. 8a, 84030 Ergolding',
            'clear': 'CLEAR'
        };

        const printLine = (text, type = 'output') => {
            if (text === 'CLEAR') {
                terminalBody.innerHTML = '';
                return;
            }
            const line = document.createElement('div');
            line.className = `terminal-line ${type}`;
            line.innerText = text;
            terminalBody.appendChild(line);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        };

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const rawVal = terminalInput.value.trim().toLowerCase();
                if (!rawVal) return;
                
                printLine(`admin@volvevent:~$ ${rawVal}`, 'highlight');
                terminalInput.value = '';

                if (commands[rawVal]) {
                    printLine(commands[rawVal], rawVal === 'status' || rawVal === 'audit' ? 'success' : 'output');
                } else {
                    printLine(`Befehl '${rawVal}' nicht gefunden. Tippen Sie 'help' für eine Befehlsübersicht.`, 'warning');
                }
            }
        });
    }

    /* --- 8. Interactive Security Audit Calculator --- */
    const auditCalculateBtn = document.getElementById('audit-calc-btn');
    if (auditCalculateBtn) {
        auditCalculateBtn.addEventListener('click', () => {
            let score = 100;
            const deductionDetails = [];

            // Identität
            const mfaVal = document.querySelector('input[name="audit-mfa"]:checked')?.value;
            if (mfaVal === 'none') { score -= 25; deductionDetails.push('Keine flächendeckende MFA (Kritisch: Einfallstor #1)'); }
            else if (mfaVal === 'partial') { score -= 12; deductionDetails.push('MFA nur für Admins (Gefahr durch kompromittierte Mitarbeiter-Accounts)'); }

            // Netzwerk
            const vlanVal = document.querySelector('input[name="audit-vlan"]:checked')?.value;
            if (vlanVal === 'flat') { score -= 20; deductionDetails.push('Flaches Netzwerk ohne VLAN-Segmentierung (Ransomware kann sich lateral frei ausbreiten)'); }
            else if (vlanVal === 'basic') { score -= 8; deductionDetails.push('VLANs vorhanden, aber unzureichende Firewall-Regeln zwischen Zonen'); }

            // Backup
            const backupVal = document.querySelector('input[name="audit-backup"]:checked')?.value;
            if (backupVal === 'online') { score -= 25; deductionDetails.push('Backups nicht unveränderbar (Immutable) / nicht Air-Gapped (Gefahr der Verschlüsselung)'); }
            else if (backupVal === 'untested') { score -= 12; deductionDetails.push('Wiederanlauf / Restore-Tests werden nicht quartalsweise geprüft'); }

            // Endpoint & EDR
            const edrVal = document.querySelector('input[name="audit-edr"]:checked')?.value;
            if (edrVal === 'standard') { score -= 15; deductionDetails.push('Klassischer Signatur-Virenschutz statt verhaltensbasiertem EDR/XDR'); }

            // Compliance
            const nis2Val = document.querySelector('input[name="audit-nis2"]:checked')?.value;
            if (nis2Val === 'unprepared') { score -= 10; deductionDetails.push('NIS2-Vorgaben bisher nicht evaluiert (Haftungsrisiko für Geschäftsführung)'); }

            if (score < 0) score = 0;

            const resultBox = document.getElementById('audit-result');
            const scoreNum = document.getElementById('audit-score-num');
            const scoreLabel = document.getElementById('audit-score-label');
            const auditDeductions = document.getElementById('audit-deductions');

            if (resultBox && scoreNum && scoreLabel) {
                resultBox.style.display = 'block';
                scoreNum.textContent = `${score}/100`;

                if (score >= 85) {
                    scoreNum.style.color = '#30d158';
                    scoreLabel.textContent = 'Hervorragend gehärtet (Enterprise-Standard)';
                    scoreLabel.style.color = '#30d158';
                } else if (score >= 60) {
                    scoreNum.style.color = '#ff9f0a';
                    scoreLabel.textContent = 'Erhöhtes Risiko (Handlungsbedarf vorhanden)';
                    scoreLabel.style.color = '#ff9f0a';
                } else {
                    scoreNum.style.color = '#ff453a';
                    scoreLabel.textContent = 'Kritischer Zustand (Akute Angriffsfläche!)';
                    scoreLabel.style.color = '#ff453a';
                }

                if (auditDeductions) {
                    auditDeductions.innerHTML = '';
                    if (deductionDetails.length === 0) {
                        auditDeductions.innerHTML = '<li style="color:#30d158;">Keine gravierenden strukturellen Mängel gefunden. Empfehlung: Regelmäßige Pentests.</li>';
                    } else {
                        deductionDetails.forEach(d => {
                            const li = document.createElement('li');
                            li.style.color = '#ff6961';
                            li.style.marginBottom = '6px';
                            li.textContent = `• ${d}`;
                            auditDeductions.appendChild(li);
                        });
                    }
                }

                resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    /* --- 6. SCROLLYTELLING & PRELOADER INITIALIZATION --- */
    initScrollytelling();

});

/**
 * Enterprise Datacenter Scrollytelling Engine
 * 120 Frames Lerp-Scrubbing, High-DPI Canvas, Progressive Preloader & Mobile Responsive
 */
function initScrollytelling() {
    const scrollySection = document.getElementById('scrollytelling-section');
    const canvas = document.getElementById('scrolly-canvas');
    if (!scrollySection || !canvas) return;

    const preloader = document.getElementById('scrolly-preloader');
    const preloaderBar = document.getElementById('preloader-bar-fill');
    const preloaderCounter = document.getElementById('preloader-counter');
    const preloaderFrames = document.getElementById('preloader-frames');
    const preloaderStatusTitle = document.getElementById('preloader-status-title');
    const preloaderStatusSub = document.getElementById('preloader-status-sub');
    const preloaderSkipBtn = document.getElementById('preloader-skip-btn');
    const frameIndicator = document.getElementById('scrolly-frame-indicator');
    const storyCards = document.querySelectorAll('.scrolly-card');
    const progressDots = document.querySelectorAll('.progress-dot');

    const TOTAL_FRAMES = 120;
    const images = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let lastDrawnFrame = 0;
    let targetFrame = 0;
    let currentFrame = 0;
    let isPreloaderDismissed = false;

    const ctx = canvas.getContext('2d', { alpha: false });

    // Mark body as preloader active
    if (preloader) {
        document.body.classList.add('preloader-active');
        // Show skip button after 2.2 seconds if user has slow connection
        setTimeout(() => {
            if (preloaderSkipBtn && !isPreloaderDismissed) {
                preloaderSkipBtn.style.display = 'inline-block';
            }
        }, 2200);
    }

    function dismissPreloader() {
        if (isPreloaderDismissed) return;
        isPreloaderDismissed = true;

        if (preloader) {
            if (preloaderStatusTitle) preloaderStatusTitle.textContent = "SYSTEM STATUS: BEREIT";
            if (preloaderStatusSub) preloaderStatusSub.textContent = "Datacenter visualisiert · 120 Frames synchronisiert";
            if (preloaderBar) {
                preloaderBar.style.width = '100%';
                preloaderBar.style.backgroundColor = '#30d158';
                preloaderBar.style.boxShadow = '0 0 20px rgba(48, 209, 88, 0.75)';
            }
            if (preloaderCounter) preloaderCounter.textContent = '100%';
            if (preloaderFrames) preloaderFrames.textContent = `${TOTAL_FRAMES} / ${TOTAL_FRAMES} Frames`;

            setTimeout(() => {
                preloader.classList.add('preloader-hidden');
                document.body.classList.remove('preloader-active');
                renderCurrentFrame();
                updateStories(0);
            }, 450);
        } else {
            renderCurrentFrame();
            updateStories(0);
        }
    }

    if (preloaderSkipBtn) {
        preloaderSkipBtn.addEventListener('click', dismissPreloader);
    }

    // Canvas resizing with high-DPI awareness
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        const w = Math.round(rect.width || window.innerWidth);
        const h = Math.round(rect.height || window.innerHeight);

        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
        }
        renderCurrentFrame();
    }
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('orientationchange', resizeCanvas, { passive: true });

    // Render frame with object-fit: cover logic
    function renderCurrentFrame() {
        const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrame)));
        let img = images[frameIdx];

        if (!img || !img.complete || img.naturalWidth === 0) {
            img = images[lastDrawnFrame];
            if (!img || !img.complete || img.naturalWidth === 0) return;
        } else {
            lastDrawnFrame = frameIdx;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.save();
        ctx.scale(dpr, dpr);

        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const imgRatio = imgW / imgH;
        const canvasRatio = w / h;

        let drawW, drawH, drawX, drawY;
        if (canvasRatio > imgRatio) {
            drawW = w;
            drawH = w / imgRatio;
            drawX = 0;
            drawY = (h - drawH) / 2;
        } else {
            drawH = h;
            drawW = h * imgRatio;
            drawX = (w - drawW) / 2;
            drawY = 0;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();

        if (frameIndicator) {
            frameIndicator.textContent = `FRAME ${String(frameIdx + 1).padStart(3, '0')} / ${TOTAL_FRAMES}`;
        }
    }

    // Story phase manager
    function updateStories(progress) {
        let activePhase = 1;
        if (progress >= 0.76) {
            activePhase = 4;
        } else if (progress >= 0.50) {
            activePhase = 3;
        } else if (progress >= 0.24) {
            activePhase = 2;
        } else {
            activePhase = 1;
        }

        storyCards.forEach(card => {
            const cardPhase = parseInt(card.getAttribute('data-phase'), 10);
            if (cardPhase === activePhase) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        progressDots.forEach(dot => {
            const dotStep = parseInt(dot.getAttribute('data-step'), 10);
            if (dotStep === activePhase) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Progress dot click to scroll
    progressDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const step = parseInt(dot.getAttribute('data-step'), 10);
            const totalScrollable = scrollySection.offsetHeight - window.innerHeight;
            let targetScrollRatio = 0.05;
            if (step === 2) targetScrollRatio = 0.35;
            if (step === 3) targetScrollRatio = 0.62;
            if (step === 4) targetScrollRatio = 0.90;

            const scrollyTop = scrollySection.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: scrollyTop + totalScrollable * targetScrollRatio,
                behavior: 'smooth'
            });
        });
    });

    // Scroll listener
    function onScroll() {
        const rect = scrollySection.getBoundingClientRect();
        const totalScrollable = scrollySection.offsetHeight - window.innerHeight;
        if (totalScrollable <= 0) return;

        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

        targetFrame = progress * (TOTAL_FRAMES - 1);
        updateStories(progress);
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Lerp render loop (60fps / 120fps smooth cinematic scrubbing)
    function animLoop() {
        const diff = targetFrame - currentFrame;
        if (Math.abs(diff) > 0.01) {
            currentFrame += diff * 0.18;
            renderCurrentFrame();
        } else if (Math.round(currentFrame) !== Math.round(targetFrame)) {
            currentFrame = targetFrame;
            renderCurrentFrame();
        }
        requestAnimationFrame(animLoop);
    }
    requestAnimationFrame(animLoop);

    // Initial canvas sizing
    resizeCanvas();

    // Start preloading images in parallel
    const startTime = Date.now();
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNum = String(i + 1).padStart(4, '0');
        img.src = `images/scrollytelling/frame_${frameNum}.jpg`;

        img.onload = () => {
            loadedCount++;
            images[i] = img;

            // Update preloader UI
            const pct = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
            if (preloaderBar) preloaderBar.style.width = `${pct}%`;
            if (preloaderCounter) preloaderCounter.textContent = `${pct}%`;
            if (preloaderFrames) preloaderFrames.textContent = `${loadedCount} / ${TOTAL_FRAMES} Frames`;

            // Render first frame immediately
            if (i === 0 && lastDrawnFrame === 0) {
                renderCurrentFrame();
            }

            // Once all frames are loaded
            if (loadedCount >= TOTAL_FRAMES) {
                const elapsed = Date.now() - startTime;
                const minDisplayTime = 1400; // Guarantee user enjoys the bootup visual
                const remaining = Math.max(0, minDisplayTime - elapsed);
                setTimeout(dismissPreloader, remaining);
            }
        };

        img.onerror = () => {
            loadedCount++;
            if (loadedCount >= TOTAL_FRAMES) {
                setTimeout(dismissPreloader, 400);
            }
        };
    }

    // Safety timeout: dismiss preloader after 4.5s even on slow network
    setTimeout(() => {
        if (!isPreloaderDismissed) {
            dismissPreloader();
        }
    }, 4500);
}

