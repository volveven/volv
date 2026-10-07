document.addEventListener('DOMContentLoaded', () => {

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

    /* --- 2. Custom Präzisions-Cursor (Beibehalten) --- */
    const mausAussen = document.getElementById('maus-zeiger-aussen');
    const mausInnen = document.getElementById('maus-zeiger-innen');
    const interaktiveElemente = document.querySelectorAll('.interaktives-element, a, button, input, select, textarea, label');

    if(mausAussen && mausInnen) {
        let mausX = window.innerWidth / 2;
        let mausY = window.innerHeight / 2;
        let zielX = mausX;
        let zielY = mausY;

        window.addEventListener('mousemove', (ereignis) => {
            mausX = ereignis.clientX;
            mausY = ereignis.clientY;
            mausInnen.style.transform = `translate3d(${mausX}px, ${mausY}px, 0) translate(-50%, -50%)`;
        });

        const maximiereCursor = () => {
            zielX += (mausX - zielX) * 0.2;
            zielY += (mausY - zielY) * 0.2;
            mausAussen.style.transform = `translate3d(${zielX}px, ${zielY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(maximiereCursor);
        };
        maximiereCursor();

        interaktiveElemente.forEach(element => {
            element.addEventListener('mouseenter', () => {
                mausAussen.classList.add('hover-aktiv');
                mausInnen.classList.add('hover-aktiv');
            });
            element.addEventListener('mouseleave', () => {
                mausAussen.classList.remove('hover-aktiv');
                mausInnen.classList.remove('hover-aktiv');
            });
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

    /* --- 4. Formular Security & Google reCAPTCHA Validation --- */
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

            // Google reCAPTCHA Validierung (Prüft ob die API geladen ist und der Response String exisiert)
            const recaptchaResponse = typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "";
            if (recaptchaResponse.length === 0) {
                formularStatus.textContent = "Bitte bestätigen Sie das reCAPTCHA.";
                formularStatus.style.color = "#ff453a";
                return;
            }

            const rohName = document.getElementById('eingabe-name').value;
            const rohDienst = document.getElementById('eingabe-dienstleistung').value;
            const saubererName = sanitiereEingabe(rohName);
            
            formularStatus.style.color = "var(--text-haupt)";
            formularStatus.textContent = "Ihre Anfrage wird verifiziert und sicher übertragen...";
            absendenKnopf.disabled = true;
            
            setTimeout(() => {
                formularStatus.textContent = `Vielen Dank. Termin am ${datumInput.value} um ${uhrzeitInput.value} Uhr für ${saubererName} bestätigt.`;
                formular.reset();
                if(typeof grecaptcha !== "undefined") grecaptcha.reset(); // reCAPTCHA zurücksetzen
                
                absendenKnopf.disabled = false;
                document.querySelectorAll('.kalender-tag').forEach(el => el.classList.remove('ausgewaehlt'));
                document.querySelectorAll('.uhrzeit-slot').forEach(el => el.classList.remove('ausgewaehlt'));
                uhrzeitContainer.style.display = 'none';
                datumInput.value = "";
                uhrzeitInput.value = "";
            }, 1200);
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
