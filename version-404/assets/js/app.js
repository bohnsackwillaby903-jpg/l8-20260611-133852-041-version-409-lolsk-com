(function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            var isOpen = mobileMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var target = Number(dot.getAttribute('data-target-slide') || 0);
            showSlide(target);
            if (timer) {
                window.clearInterval(timer);
                startCarousel();
            }
        });
    });

    startCarousel();

    var searchInput = document.getElementById('movieSearch');
    var categoryFilter = document.getElementById('categoryFilter');
    var yearFilter = document.getElementById('yearFilter');
    var movieList = document.getElementById('movieList');
    var emptyState = document.getElementById('emptyState');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyQueryFromAddress() {
        if (!searchInput) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }
    }

    function filterMovies() {
        if (!movieList) {
            return;
        }

        var query = normalize(searchInput ? searchInput.value : '');
        var category = normalize(categoryFilter ? categoryFilter.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');
        var cards = Array.prototype.slice.call(movieList.querySelectorAll('[data-card="movie"]'));
        var visibleCount = 0;

        cards.forEach(function (card) {
            var title = normalize(card.getAttribute('data-title'));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var content = normalize(card.textContent);
            var queryMatched = !query || title.indexOf(query) >= 0 || content.indexOf(query) >= 0;
            var categoryMatched = !category || cardCategory === category;
            var yearMatched = !year || cardYear === year;
            var isVisible = queryMatched && categoryMatched && yearMatched;

            card.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visibleCount === 0);
        }
    }

    applyQueryFromAddress();

    [searchInput, categoryFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterMovies);
            control.addEventListener('change', filterMovies);
        }
    });

    filterMovies();

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var trigger = document.getElementById('play-trigger');
        var hlsInstance = null;
        var isLoaded = false;

        if (!video || !streamUrl) {
            return;
        }

        function hideTrigger() {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        }

        function loadStream() {
            if (isLoaded) {
                return Promise.resolve();
            }

            isLoaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                });
            }

            video.src = streamUrl;
            return Promise.resolve();
        }

        function playVideo() {
            hideTrigger();
            loadStream().then(function () {
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            });
        }

        if (trigger) {
            trigger.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', hideTrigger);

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
