(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function restartSlider() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            restartSlider();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            restartSlider();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            restartSlider();
        });
    });

    showSlide(0);
    restartSlider();

    const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const filters = Array.from(document.querySelectorAll("[data-filter-value]"));
    let activeFilter = "all";

    function cardText(card) {
        return [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
        ].join(" ").toLowerCase();
    }

    function applyFilter() {
        const query = searchInputs.map(function (input) {
            return input.value.trim().toLowerCase();
        }).find(Boolean) || "";

        cards.forEach(function (card) {
            const haystack = cardText(card);
            const byText = !query || haystack.indexOf(query) !== -1;
            const byChip = activeFilter === "all" || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
            card.hidden = !(byText && byChip);
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener("input", applyFilter);
    });

    filters.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.dataset.filterValue || "all";
            filters.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            applyFilter();
        });
    });
})();
