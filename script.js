      (function () {
        var reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        var lenis = null;
        if (!reduce && typeof Lenis !== "undefined") {
          lenis = new Lenis({ duration: 1.15, smoothWheel: true });
          function raf(t) {
            lenis.raf(t);
            requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);
        }
        function scrollToEl(el) {
          if (!el) return;
          if (lenis) {
            lenis.scrollTo(el, { offset: -70 });
          } else {
            el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
          }
        }

        /* Nav solid state */
        // var nav = document.getElementById("nav");
        // function onScroll() {
        //   if (window.scrollY > window.innerHeight * 0.72)
        //     nav.classList.add("solid");
        //   else nav.classList.remove("solid");
        // }
        // window.addEventListener("scroll", onScroll, { passive: true });
        // onScroll();

        /* Menu */
        var menu = document.getElementById("menu"),
          burger = document.getElementById("burger");
        function openMenu() {
          menu.classList.add("open");
          burger.setAttribute("aria-expanded", "true");
          if (lenis) lenis.stop();
          document.body.style.overflow = "hidden";
          if (window.gsap && !reduce) {
            gsap.fromTo(
              "#menu nav a",
              { y: 44, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.06,
                delay: 0.25,
                ease: "power3.out",
              },
            );
          }
        }
        function closeMenu() {
          menu.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
          if (lenis) lenis.start();
          document.body.style.overflow = "";
        }
        burger.addEventListener("click", openMenu);
        document
          .getElementById("menuClose")
          .addEventListener("click", closeMenu);
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") {
            closeMenu();
            closeBook();
          }
        });

        /* Same-page anchor links */
        document.querySelectorAll("[data-scroll]").forEach(function (a) {
          a.addEventListener("click", function (e) {
            var href = a.getAttribute("href");
            if (href && href.charAt(0) === "#") {
              e.preventDefault();
              closeMenu();
              setTimeout(
                function () {
                  scrollToEl(document.querySelector(href));
                },
                menu.classList.contains("open") ? 300 : 0,
              );
              scrollToEl(document.querySelector(href));
            }
          });
        });
        /* Cross-page anchors arriving from the contact page */
        if (location.hash && location.hash.length > 1) {
          var t = document.querySelector(location.hash);
          if (t) {
            setTimeout(function () {
              scrollToEl(t);
            }, 350);
          }
        }

        /* Hero intro + reveals (GSAP, no scroll plugin — IntersectionObserver triggers) */
        if (window.gsap && !reduce) {
          gsap.fromTo(
            ".hero-line > span",
            { yPercent: 115 },
            {
              yPercent: 0,
              duration: 1.15,
              stagger: 0.12,
              ease: "power4.out",
              delay: 0.15,
            },
          );
          gsap.fromTo(
            ".hero-fade",
            { y: 26, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.12,
              ease: "power3.out",
              delay: 0.7,
            },
          );
          var io = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (en) {
                if (en.isIntersecting) {
                  gsap.fromTo(
                    en.target,
                    { y: 36, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
                  );
                  io.unobserve(en.target);
                }
              });
            },
            { threshold: 0.12 },
          );
          document.querySelectorAll(".reveal").forEach(function (el) {
            io.observe(el);
          });
        }

        /* Gallery VIEW ALL */
        var grid = document.getElementById("galleryGrid"),
          vBtn = document.getElementById("viewAllBtn");
        vBtn.addEventListener("click", function () {
          var open = grid.classList.toggle("gallery-expanded");
          vBtn.textContent = open ? "View Less −" : "View All +";
          vBtn.setAttribute("aria-expanded", open ? "true" : "false");
        });
        /* Clicking a card books that style */
        document.querySelectorAll(".gcard").forEach(function (card) {
          card.style.cursor = "pointer";
          card.addEventListener("click", function () {
            openBook();
          });
        });

        /* Accordions */
        document.querySelectorAll(".acc-head").forEach(function (head) {
          head.addEventListener("click", function () {
            var item = head.closest(".acc-item"),
              wasOpen = item.classList.contains("open");
            document.querySelectorAll(".acc-item.open").forEach(function (i) {
              i.classList.remove("open");
              i.querySelector(".acc-head").setAttribute(
                "aria-expanded",
                "false",
              );
            });
            if (!wasOpen) {
              item.classList.add("open");
              head.setAttribute("aria-expanded", "true");
            }
          });
        });
        /* Open the first location by default */
        var first = document.querySelector(".acc-item");
        if (first) {
          first.classList.add("open");
          first
            .querySelector(".acc-head")
            .setAttribute("aria-expanded", "true");
        }

        /* Booking modal */
        var modal = document.getElementById("bookingModal"),
          form = document.getElementById("bookForm"),
          done = document.getElementById("bookDone");
        function openBook(loc) {
          modal.classList.add("open");
          if (lenis) lenis.stop();
          document.body.style.overflow = "hidden";
          if (loc) {
            var sel = document.getElementById("bLoc");
            for (var i = 0; i < sel.options.length; i++) {
              if (sel.options[i].text === loc) sel.selectedIndex = i;
            }
          }
          form.classList.remove("hidden");
          done.classList.add("hidden");
        }
        function closeBook() {
          if (!modal.classList.contains("open")) return;
          modal.classList.remove("open");
          if (lenis) lenis.start();
          document.body.style.overflow = "";
        }
        document.querySelectorAll("[data-book]").forEach(function (b) {
          b.addEventListener("click", function () {
            closeMenu();
            openBook(b.getAttribute("data-loc"));
          });
        });
        document.querySelectorAll("[data-close-book]").forEach(function (b) {
          b.addEventListener("click", closeBook);
        });

        function fieldErr(id, bad) {
          var f = document.getElementById(id),
            m = document.querySelector('[data-err="' + id + '"]');
          if (f) f.classList.toggle("err", bad);
          if (m) m.classList.toggle("show", bad);
          return !bad;
        }
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var ok = true,
            d = document.getElementById("bDate");
          var dateBad = !d.value;
          if (!dateBad) {
            var day = new Date(d.value + "T12:00:00").getDay();
            if (day === 0 || day === 1) dateBad = true;
          }
          ok = fieldErr("bDate", dateBad) && ok;
          ok =
            fieldErr(
              "bName",
              document.getElementById("bName").value.trim().length < 2,
            ) && ok;
          ok =
            fieldErr(
              "bPhone",
              document.getElementById("bPhone").value.replace(/\D/g, "")
                .length < 10,
            ) && ok;
          if (!ok) return;
          var loc = document.getElementById("bLoc").value,
            svc = document.getElementById("bSvc").value,
            time = document.getElementById("bTime").value;
          var nice = new Date(d.value + "T12:00:00").toLocaleDateString(
            "en-CA",
            { weekday: "long", month: "long", day: "numeric", year: "numeric" },
          );
          document.getElementById("bookSummary").textContent =
            svc +
            " at " +
            loc +
            " — " +
            nice +
            " at " +
            time +
            ". A confirmation text goes to your phone when the studio confirms (demo).";
          document.getElementById("bookRef").textContent =
            "CRISP-" + Math.random().toString(36).slice(2, 7).toUpperCase();
          form.classList.add("hidden");
          done.classList.remove("hidden");
          if (window.gsap && !reduce) {
            gsap.fromTo(
              done,
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
            );
          }
        });
      })();