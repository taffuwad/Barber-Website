        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- 1. Configuration & Data ---
        
        // High-quality barber photography from Unsplash
        const images = [
            "https://images.unsplash.com/photo-1593702288056-792fabdba0c5?q=80&w=800&auto=format&fit=crop", // Barber styling
            "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop", // Low taper fade
            "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop", // Textured crop
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop", // Textured waves
            "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop", // Buzz cut
            "https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=800&auto=format&fit=crop", // Slick back
            "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=800&auto=format&fit=crop", // Beard trim
            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop", // Studio atmosphere
            "https://images.unsplash.com/photo-1512690459411-b9245aed614b?q=80&w=800&auto=format&fit=crop", // Straight razor
            "https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=800&auto=format&fit=crop", // Barber working
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop", // Client portrait
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop", // Beard styling
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop", // Classic haircut
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop", // Side profile
            "https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=800&auto=format&fit=crop", // Hair finishing
            "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop", // Barber tools
            "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=800&auto=format&fit=crop", // Mirror look
            "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop", // Back of head fade
            "https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=800&auto=format&fit=crop", // Cinematic portrait
            "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=800&auto=format&fit=crop"  // Editorial
        ];

        const CONFIG = {
            radius: 6.5,
            cardWidth: 1.6,
            cardHeight: 2.0, // 4:5 aspect ratio
            fov: 45
        };

        // --- 2. Three.js Setup ---

        const container = document.getElementById('webgl-container');
        const scene = new THREE.Scene();
        
        // Camera
        const camera = new THREE.PerspectiveCamera(CONFIG.fov, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 12; // Move camera back to fit the sphere

        // Renderer
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.enablePan = false;
        controls.enableZoom = false; // Keep sphere at a consistent size
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.rotateSpeed = 0.5;

        // --- 3. Sphere Construction ---

        const galleryGroup = new THREE.Group();
        scene.add(galleryGroup);

        const textureLoader = new THREE.TextureLoader();
        const geometry = new THREE.PlaneGeometry(CONFIG.cardWidth, CONFIG.cardHeight);
        let loadedCount = 0;

        // Fibonacci sphere algorithm for even distribution
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        images.forEach((url, i) => {
            // Load Texture
            textureLoader.load(url, (texture) => {
                // Optimize texture
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;

                // Create Material
                const material = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    side: THREE.DoubleSide, // Visible from both sides if tilted
                    transparent: true,
                    opacity: 0
                });

                // Create Mesh
                const card = new THREE.Mesh(geometry, material);

                // Calculate position on sphere
                const y = 1 - (i / (images.length - 1)) * 2; // y goes from 1 to -1
                const radiusAtY = Math.sqrt(1 - y * y);
                const theta = phi * i;

                const x = Math.cos(theta) * radiusAtY;
                const z = Math.sin(theta) * radiusAtY;

                // Set position
                card.position.set(x * CONFIG.radius, y * CONFIG.radius, z * CONFIG.radius);

                // Make card face outward (look at center and turn around)
                card.lookAt(0, 0, 0);
                card.rotateY(Math.PI); // Flip to face outward

                galleryGroup.add(card);

                // Animate opacity once loaded
                gsap.to(material, {
                    opacity: 1,
                    duration: 1.5,
                    ease: "power2.out",
                    delay: Math.random() * 0.5 // Slight random delay for organic feel
                });

                loadedCount++;
                if (loadedCount === images.length) {
                    initAnimations();
                }
            }, undefined, (err) => {
                console.error("Failed to load image:", url, err);
                // Fallback handling if an image fails
                loadedCount++;
                if (loadedCount === images.length) initAnimations();
            });
        });

        // Add subtle ambient light (though MeshBasicMaterial doesn't strictly need it, good practice if changing materials)
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // --- 4. Animation & Render Loop ---

        function animate() {
            requestAnimationFrame(animate);
            
            // Update controls (handles auto-rotation and damping)
            controls.update();
            
            // Render scene
            renderer.render(scene, camera);
        }
        
        animate();

        // --- 5. GSAP Entrance Animations ---

        function initAnimations() {
            // Hide Loader
            const loader = document.getElementById('loader');
            loader.classList.add('hidden');
            
            // Remove loader from DOM after transition
            setTimeout(() => loader.remove(), 800);

            // GSAP Timeline for UI
            const tl = gsap.timeline({
                defaults: { ease: "power3.out" }
            });

            // Initial state for sphere
            galleryGroup.scale.set(0.85, 0.85, 0.85);
            galleryGroup.rotation.y = -Math.PI / 4;

            tl.to(".gsap-reveal", {
                y: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.15,
                startAt: { y: 20, opacity: 0 }
            }, 0.2)
            .to(galleryGroup.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 2,
                ease: "power2.out"
            }, 0.5)
            .to(galleryGroup.rotation, {
                y: 0,
                duration: 2,
                ease: "power2.out"
            }, 0.5);
        }

        // --- 6. Resize Handling ---

        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            camera.aspect = width / height;
            
            // Adjust FOV/position on mobile to fit sphere
            if (width < 768) {
                camera.fov = 60; // Wider FOV for portrait screens
                CONFIG.radius = 5.5; // Shrink sphere slightly for mobile
            } else {
                camera.fov = CONFIG.fov;
                CONFIG.radius = 6.5;
            }

            camera.updateProjectionMatrix();
        });

        // Trigger initial resize to set correct mobile state
        window.dispatchEvent(new Event('resize'));






                /* ===== Reduced-motion preference ===== */
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* ===== Scroll helper (no Lenis on this page) ===== */
        function scrollToEl(el) {
          if (!el) return;
          el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        }

        /* ===== Scroll-lock ===== */
        function lock(on) {
          document.body.style.overflow = on ? 'hidden' : '';
        }

        /* ===== Menu open / close ===== */
        var menu      = document.getElementById('menu');
        var burger    = document.getElementById('burger');
        var menuClose = document.getElementById('menuClose');

        function openMenu() {
          if (!menu) return;
          menu.classList.add('open');
          if (burger) burger.setAttribute('aria-expanded', 'true');
          lock(true);
          if (window.gsap && !reduce) {
            gsap.fromTo(
              '#menu nav a',
              { y: 44, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, delay: 0.25, ease: 'power3.out' }
            );
          }
        }

        function closeMenu() {
          if (!menu) return;
          menu.classList.remove('open');
          if (burger) burger.setAttribute('aria-expanded', 'false');
          lock(false);
        }

        if (burger) {
          burger.addEventListener('click', function(e) {
            e.preventDefault();
            openMenu();
          });
        }

        if (menuClose) {
          menuClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
          });
        }

        document.querySelectorAll('[data-close-menu]').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
          });
        });

        if (menu) {
          menu.addEventListener('click', function(e) {
            if (e.target.closest('#menuClose') || e.target.closest('[data-close-menu]')) {
              e.preventDefault();
              e.stopPropagation();
              closeMenu();
            }
          });
        }

        /* ===== Booking modal ===== */
        var bookingModal = document.getElementById('bookingModal');
        var bookForm     = document.getElementById('bookForm');
        var bookDone     = document.getElementById('bookDone');

        function openBook() {
          if (!bookingModal) return;
          bookingModal.classList.add('open');
          lock(true);
          if (bookForm)  bookForm.classList.remove('hidden');
          if (bookDone)  bookDone.classList.add('hidden');
        }

        function closeBook() {
          if (!bookingModal) return;
          if (!bookingModal.classList.contains('open')) return;
          bookingModal.classList.remove('open');
          lock(false);
        }

        document.querySelectorAll('[data-book]').forEach(function (btn) {
          btn.addEventListener('click', function () { closeMenu(); openBook(); });
        });

        document.querySelectorAll('[data-close-book]').forEach(function (btn) {
          btn.addEventListener('click', closeBook);
        });

        /* Field-level validation helper */
        function fieldErr(id, bad) {
          var f = document.getElementById(id);
          var m = document.querySelector('[data-err="' + id + '"]');
          if (f) f.classList.toggle('err', bad);
          if (m) m.classList.toggle('show', bad);
          return !bad;
        }

        /* Booking form submit */
        if (bookForm) {
          bookForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var ok    = true;
            var bDate = document.getElementById('bDate');
            var dateBad = !bDate.value;
            if (!dateBad) {
              var day = new Date(bDate.value + 'T12:00:00').getDay();
              if (day === 0 || day === 1) dateBad = true;
            }
            ok = fieldErr('bDate',  dateBad) && ok;
            ok = fieldErr('bName',  document.getElementById('bName').value.trim().length < 2)  && ok;
            ok = fieldErr('bPhone', document.getElementById('bPhone').value.replace(/\D/g,'').length < 10) && ok;
            if (!ok) return;

            var nice = new Date(bDate.value + 'T12:00:00')
              .toLocaleDateString('en-CA', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
            document.getElementById('bookSummary').textContent =
              document.getElementById('bSvc').value + ' at ' +
              document.getElementById('bLoc').value + ' � ' + nice +
              ' at ' + document.getElementById('bTime').value + '. (Demo booking.)';
            document.getElementById('bookRef').textContent =
              'CRISP-' + Math.random().toString(36).slice(2,7).toUpperCase();

            bookForm.classList.add('hidden');
            bookDone.classList.remove('hidden');
          });
        }

        /* ===== Keyboard: Escape closes overlays ===== */
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { closeMenu(); closeBook(); }
        });

        /* ===== Same-page anchor links ===== */
        document.querySelectorAll('[data-scroll]').forEach(function (a) {
          a.addEventListener('click', function (e) {
            var href = a.getAttribute('href');
            if (href && href.charAt(0) === '#') {
              e.preventDefault();
              var wasOpen = menu.classList.contains('open');
              closeMenu();
              setTimeout(function () {
                scrollToEl(document.querySelector(href));
              }, wasOpen ? 300 : 0);
            }
          });
        });

        /* ===== Cross-page hash on load ===== */
        if (location.hash && location.hash.length > 1) {
          var target = document.querySelector(location.hash);
          if (target) setTimeout(function () { scrollToEl(target); }, 350);
        }



    // let ptoh = document.querySelector("#ptoh");

    // ptoh.addEventListener("click" , ()=>{
    //     window.location = "../index.html"
    // })