(function () {
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                if (dotIndex === index) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    document.querySelectorAll('[data-movie-grid]').forEach(function (grid) {
        const scope = grid.closest('.page-section') || document;
        const search = scope.querySelector('[data-grid-search]');
        const region = scope.querySelector('[data-filter-region]');
        const type = scope.querySelector('[data-filter-type]');
        const category = scope.querySelector('[data-filter-category]');
        const empty = scope.querySelector('[data-empty-state]');
        const cards = Array.from(grid.querySelectorAll('.movie-card'));

        function valueOf(node) {
            return node ? node.value.trim().toLowerCase() : '';
        }

        function filterCards() {
            const keyword = valueOf(search);
            const regionValue = valueOf(region);
            const typeValue = valueOf(type);
            const categoryValue = valueOf(category);
            let shown = 0;

            cards.forEach(function (card) {
                const searchText = (card.getAttribute('data-search') || '').toLowerCase();
                const cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                const cardType = (card.getAttribute('data-type') || '').toLowerCase();
                const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                const matched = (!keyword || searchText.includes(keyword)) &&
                    (!regionValue || cardRegion === regionValue) &&
                    (!typeValue || cardType === typeValue) &&
                    (!categoryValue || cardCategory === categoryValue);

                card.hidden = !matched;

                if (matched) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', shown === 0);
            }
        }

        [search, region, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        filterCards();
    });
})();
