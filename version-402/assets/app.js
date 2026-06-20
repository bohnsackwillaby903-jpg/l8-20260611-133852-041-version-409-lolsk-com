(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function() {
                var isOpen = mobileNav.classList.toggle("is-open");
                menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        var carousel = document.querySelector("[data-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            var previous = carousel.querySelector(".hero-prev");
            var next = carousel.querySelector(".hero-next");
            var activeIndex = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                activeIndex = (index + slides.length) % slides.length;
                slides.forEach(function(slide, itemIndex) {
                    slide.classList.toggle("is-active", itemIndex === activeIndex);
                });
                dots.forEach(function(dot, itemIndex) {
                    dot.classList.toggle("is-active", itemIndex === activeIndex);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function() {
                    showSlide(activeIndex + 1);
                }, 5200);
            }

            if (previous) {
                previous.addEventListener("click", function() {
                    showSlide(activeIndex - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function() {
                    showSlide(activeIndex + 1);
                    restart();
                });
            }

            dots.forEach(function(dot, index) {
                dot.addEventListener("click", function() {
                    showSlide(index);
                    restart();
                });
            });

            showSlide(0);
            restart();
        }

        var searchInput = document.getElementById("site-search");
        var typeFilter = document.getElementById("type-filter");
        var yearFilter = document.getElementById("year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year")
            ].join(" "));
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : "");
            var typeValue = normalize(typeFilter ? typeFilter.value : "");
            var yearValue = normalize(yearFilter ? yearFilter.value : "");

            cards.forEach(function(card) {
                var text = cardText(card);
                var typeMatched = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                var yearMatched = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                var queryMatched = !query || text.indexOf(query) !== -1;
                card.classList.toggle("is-hidden", !(typeMatched && yearMatched && queryMatched));
            });
        }

        [searchInput, typeFilter, yearFilter].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
}());
