document.addEventListener('DOMContentLoaded', () => {

    /* --- 0. Formular Erfolgs-Check (Web3Forms Redirect) --- */
    if (window.location.search.includes('success=true')) {
        alert("Erfolg! Ihre verschlüsselte Nachricht / Terminbuchung wurde erfolgreich an uns übermittelt.");
        // URL bereinigen, ohne die Seite neu zu laden
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    /* --- 0.5 Mobile Navigation (Injected for all HTML files) --- */
    const navLeiste = document.getElementById('navigationsleiste');
    const menueListe = document.querySelector('.menue-liste');
    if (navLeiste && menueListe) {
        const burgerKnopf = document.createElement('div');
        burgerKnopf.className = 'mobile-menue-knopf interaktives-element';
        burgerKnopf.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
        navLeiste.insertBefore(burgerKnopf, menueListe);
        
        burgerKnopf.addEventListener('click', () => {
            menueListe.classList.toggle('offen');
        });
        
        // Menü schließen wenn auf mobilen Link geklickt wird
        document.querySelectorAll('.menue-link:not([style*="cursor:none"])').forEach(link => {
            link.addEventListener('click', () => {
                if(window.innerWidth <= 768) menueListe.classList.remove('offen');
            });
        });
    }

    /* --- 1. Smart Navigation (Hide on scroll down, show on scroll up) --- */
    const navigationsleiste = document.getElementById('navigationsleiste');
    if (navigationsleiste) {
        let letzeScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        window.addEventListener('scroll', () => {
            const aktuelleScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            if (aktuelleScrollPosition > 50) {
                if (aktuelleScrollPosition > letzeScrollPosition) {
                    navigationsleiste.classList.add('versteckt');
                } else {
                    navigationsleiste.classList.remove('versteckt');
                }
            } else {
                navigationsleiste.classList.remove('versteckt');
            }
            letzeScrollPosition = aktuelleScrollPosition <= 0 ? 0 : aktuelleScrollPosition;
        });
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

    /* --- 5. Scroll Reveal Animationen --- */
    const erscheinendeElemente = document.querySelectorAll('.erscheinen-element');
    const scrollBeobachter = new IntersectionObserver((eintraege) => {
        eintraege.forEach(eintrag => {
            if(eintrag.isIntersecting) {
                eintrag.target.classList.add('sichtbar');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    erscheinendeElemente.forEach(element => scrollBeobachter.observe(element));

});
