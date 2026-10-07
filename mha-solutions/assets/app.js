// assets/app.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. GSAP Scrollytelling Setup
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Animations
        gsap.from(".hero-badge", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" });
        gsap.from(".hero-title", { y: 30, opacity: 0, duration: 1, delay: 0.2, ease: "power3.out" });
        gsap.from(".hero-desc", { y: 30, opacity: 0, duration: 1, delay: 0.4, ease: "power3.out" });
        gsap.from(".hero-cta", { y: 30, opacity: 0, duration: 1, delay: 0.6, ease: "power3.out" });

        // Services Stagger Animation
        const serviceCards = gsap.utils.toArray('.service-card');
        if(serviceCards.length > 0) {
            serviceCards.forEach((card, i) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: "power3.out"
                });
            });
        }

        // About Section
        if(document.querySelector('.about-content')) {
            gsap.from(".about-content", {
                scrollTrigger: { trigger: "#about", start: "top 80%" },
                y: 40, opacity: 0, duration: 1, ease: "power2.out"
            });
        }
    }

    // 2. Cookie Consent Logic (GDPR Compliant)
    const cookieBanner = document.getElementById('cookie-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');

    // Funktionales Laden von Tracking-Scripts nur bei Consent
    const loadAnalytics = () => {
        console.log("[SYSTEM] Analytics & Tracking Scripts loaded (User Consent given).");
        // Hier können GTM, Meta Pixel etc. injiziert werden
    };

    if (cookieBanner) {
        const consentStatus = localStorage.getItem('mha_cookie_consent');

        if (!consentStatus) {
            // Show banner with slight delay
            setTimeout(() => {
                cookieBanner.classList.remove('translate-y-full');
            }, 1200);
        } else if (consentStatus === 'accepted') {
            loadAnalytics();
        }

        const closeBanner = () => {
            cookieBanner.classList.add('translate-y-full');
        };

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('mha_cookie_consent', 'accepted');
            closeBanner();
            loadAnalytics();
        });

        declineBtn.addEventListener('click', () => {
            localStorage.setItem('mha_cookie_consent', 'declined');
            closeBanner();
            console.log("[SYSTEM] Essential cookies only. Tracking blocked.");
        });
    }
});
