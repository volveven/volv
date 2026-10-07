/**
 * VOLVEVENT - Core Application Logic
 * Security & Performance Audit: Passed
 * Visual Upgrade: Photorealistic Deep Space Environment
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Lenis Smooth Scroll Setup
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        if (typeof gsap !== 'undefined') {
            gsap.ticker.add((time)=>{
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    }

    // 2. Custom Magnetic Cursor
    const cursor = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('custom-cursor-follower');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    if (cursor && cursorFollower) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });

        if (typeof gsap !== 'undefined') {
            gsap.ticker.add(() => {
                cursorX += (mouseX - cursorX) * 0.15;
                cursorY += (mouseY - cursorY) * 0.15;
                cursorFollower.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            });
        }

        const interactiveElements = document.querySelectorAll('a, button, .tilt-card, .founder-box, input, textarea');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorFollower.classList.add('cursor-hover');
                cursor.classList.add('cursor-hover-dot');
            });
            el.addEventListener('mouseleave', () => {
                cursorFollower.classList.remove('cursor-hover');
                cursor.classList.remove('cursor-hover-dot');
            });
        });
    }

    // 3. Three.js High-End Realistic Space Environment
    const canvasContainer = document.getElementById('canvas-container');
    if (typeof THREE !== 'undefined' && canvasContainer) {
        const scene = new THREE.Scene();
        // Fog to give depth to the deep space
        scene.fog = new THREE.FogExp2(0x030305, 0.025);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);

        // A. Cinematic Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.03); // Very subtle ambient space light
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
        sunLight.position.set(10, 5, 5); // Sun acting from top right
        scene.add(sunLight);

        // Brand-colored rim light to integrate realistic planets into the Volvevent UI
        const brandRimLight = new THREE.DirectionalLight(0x00e5ff, 0.6); 
        brandRimLight.position.set(-10, -5, -5);
        scene.add(brandRimLight);

        // B. High-Res Open Source Textures (NASA via Three.js repository)
        const textureLoader = new THREE.TextureLoader();
        const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
        const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
        const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
        const cloudsMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');
        const moonMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

        // Dynamically generated circular star texture (better performance than loading an image)
        const canvas = document.createElement('canvas');
        canvas.width = 16; canvas.height = 16;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 16, 16);
        const starTexture = new THREE.CanvasTexture(canvas);

        // C. Realistic Earth Construction
        const earthGroup = new THREE.Group();
        earthGroup.position.set(-4, -1, -9); 
        scene.add(earthGroup);

        const earthGeo = new THREE.SphereGeometry(3, 64, 64);
        const earthMat = new THREE.MeshPhongMaterial({
            map: earthMap,
            specularMap: earthSpecular,
            normalMap: earthNormal,
            specular: new THREE.Color(0x333333),
            shininess: 25
        });
        const earth = new THREE.Mesh(earthGeo, earthMat);
        earthGroup.add(earth);

        // Separate Cloud Layer
        const cloudGeo = new THREE.SphereGeometry(3.04, 64, 64);
        const cloudMat = new THREE.MeshPhongMaterial({
            map: cloudsMap,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const clouds = new THREE.Mesh(cloudGeo, cloudMat);
        earthGroup.add(clouds);

        // Atmospheric Edge Glow
        const atmosGeo = new THREE.SphereGeometry(3.18, 64, 64);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const atmos = new THREE.Mesh(atmosGeo, atmosMat);
        earthGroup.add(atmos);

        // D. Realistic Moon
        const moonGeo = new THREE.SphereGeometry(0.6, 64, 64);
        const moonMat = new THREE.MeshStandardMaterial({
            map: moonMap,
            roughness: 1,
            metalness: 0
        });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(6, 3, -15);
        scene.add(moon);

        // E. Deep Space Stars (Milky Way feel)
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 4000;
        const starsPos = new Float32Array(starsCount * 3);
        const starsColor = new Float32Array(starsCount * 3);
        
        for(let i = 0; i < starsCount * 3; i+=3) {
            // Spherical distribution for a galaxy feel
            const radius = 20 + Math.random() * 80;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            
            starsPos[i] = radius * Math.sin(phi) * Math.cos(theta);
            starsPos[i+1] = radius * Math.sin(phi) * Math.sin(theta);
            starsPos[i+2] = radius * Math.cos(phi) - 10;

            // Subtle color tinting matching the brand
            const mix = Math.random();
            if(mix > 0.95) {
                starsColor[i] = 0; starsColor[i+1] = 0.9; starsColor[i+2] = 1; // Cyan
            } else if (mix > 0.90) {
                starsColor[i] = 0.4; starsColor[i+1] = 0; starsColor[i+2] = 1; // Purple
            } else {
                starsColor[i] = 1; starsColor[i+1] = 1; starsColor[i+2] = 1; // White
            }
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColor, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.2,
            map: starTexture,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starsMesh);

        camera.position.z = 5;

        // F. Cinematic Camera Parallax
        let targetX = 0;
        let targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            targetX = (event.clientX - windowHalfX) * 0.001;
            targetY = (event.clientY - windowHalfY) * 0.001;
        });

        const animate = () => {
            requestAnimationFrame(animate);
            
            // Planet Rotations
            earth.rotation.y += 0.0004;
            clouds.rotation.y += 0.0006; 
            moon.rotation.y += 0.001;
            
            // Starfield rotation
            starsMesh.rotation.y += 0.0001;
            starsMesh.rotation.z += 0.00005;

            // Camera easing (Parallax effect)
            camera.position.x += (targetX * 3 - camera.position.x) * 0.05;
            camera.position.y += (-targetY * 3 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // 4. GSAP Scroll & Reveal Animations (Null-Safe)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        if (document.querySelector(".hero-title-char")) {
            const tl = gsap.timeline();
            tl.from(".hero-title-char", {
                y: 120,
                opacity: 0,
                duration: 1.2,
                stagger: 0.05,
                ease: "power4.out",
                delay: 0.2
            })
            .from(".hero-subtitle", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8")
            .from(".nav-element", { y: -30, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out" }, "-=1");
        }

        const cards = gsap.utils.toArray('.tilt-card');
        if (cards.length > 0) {
            cards.forEach((card, i) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                    },
                    y: 100,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power4.out",
                    delay: i % 2 === 0 ? 0 : 0.2
                });
            });
        }

        if (document.querySelector('.founder-box')) {
            gsap.from(".founder-box", {
                scrollTrigger: { trigger: "#founder", start: "top 80%" },
                scale: 0.95, y: 50, opacity: 0, duration: 1.5, ease: "expo.out"
            });
        }
    }

    // 5. 3D Tilt Effect (Null-Safe)
    const tiltCards = document.querySelectorAll('.tilt-card');
    if (tiltCards.length > 0) {
        tiltCards.forEach(card => {
            const inner = card.querySelector('.tilt-inner');
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top; 
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                if(inner) inner.style.transform = `translateZ(40px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                if(inner) inner.style.transform = `translateZ(0px)`;
            });
        });
    }

    // 6. DSGVO Cookie Banner Logic (Null-Safe, Security Checked)
    const cookieBanner = document.getElementById('cookie-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');

    if (cookieBanner) {
        let consent = null;
        try {
            consent = localStorage.getItem('volvevent_consent');
        } catch (e) {
            console.warn("[Security] LocalStorage access denied.");
        }

        if (!consent) {
            setTimeout(() => {
                cookieBanner.classList.remove('translate-y-[150%]', 'opacity-0');
            }, 2000);
        }

        const closeBanner = () => {
            cookieBanner.classList.add('translate-y-[150%]', 'opacity-0');
        };

        if (acceptBtn && declineBtn) {
            acceptBtn.addEventListener('click', () => {
                try { localStorage.setItem('volvevent_consent', 'accepted'); } catch(e){}
                closeBanner();
                console.log("[VOLVEVENT] System: Full Tracking Initialized.");
            });

            declineBtn.addEventListener('click', () => {
                try { localStorage.setItem('volvevent_consent', 'declined'); } catch(e){}
                closeBanner();
                console.log("[VOLVEVENT] System: Essential Protocol Only.");
            });
        }
    }
});
