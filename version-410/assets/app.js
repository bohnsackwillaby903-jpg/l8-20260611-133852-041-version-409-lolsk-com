(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var localSearch = document.querySelector('[data-local-search]');
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = { type: 'all', value: 'all' };

  function getCardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-tags') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || ''
    ].join(' ').toLowerCase();
  }

  function cardMatchesFilter(card) {
    if (activeFilter.value === 'all') {
      return true;
    }
    var value = activeFilter.value.toLowerCase();
    if (activeFilter.type === 'type') {
      return (card.getAttribute('data-type') || '').toLowerCase().indexOf(value) !== -1;
    }
    if (activeFilter.type === 'region') {
      return (card.getAttribute('data-region') || '').toLowerCase().indexOf(value) !== -1;
    }
    if (activeFilter.type === 'year') {
      return (card.getAttribute('data-year') || '').toLowerCase().indexOf(value) !== -1;
    }
    return getCardText(card).indexOf(value) !== -1;
  }

  function applyCardSearch(query) {
    if (!cards.length) {
      return;
    }
    var normalized = (query || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var matchedText = !normalized || getCardText(card).indexOf(normalized) !== -1;
      var matchedFilter = cardMatchesFilter(card);
      var matched = matchedText && matchedFilter;
      card.setAttribute('data-hidden', matched ? 'false' : 'true');
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  function currentQuery() {
    if (localSearch) {
      return localSearch.value;
    }
    var firstInput = searchInputs[0];
    return firstInput ? firstInput.value : '';
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (item) {
        item.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      activeFilter = {
        type: chip.getAttribute('data-filter-type') || 'all',
        value: chip.getAttribute('data-filter-value') || 'all'
      };
      applyCardSearch(currentQuery());
    });
  });

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      if (cards.length) {
        applyCardSearch(input.value);
      }
    });
  });

  if (localSearch) {
    localSearch.addEventListener('input', function () {
      applyCardSearch(localSearch.value);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('[data-search-input], input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (cards.length) {
        event.preventDefault();
        applyCardSearch(query);
      } else if (!query) {
        event.preventDefault();
      }
    });
  });

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q');
  if (queryFromUrl) {
    searchInputs.forEach(function (input) {
      input.value = queryFromUrl;
    });
    if (localSearch) {
      localSearch.value = queryFromUrl;
    }
    applyCardSearch(queryFromUrl);
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play-cover]');
    var playButton = player.querySelector('[data-play-button]');
    var message = player.querySelector('[data-player-message]');
    var started = false;
    var playerInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function beginPlay() {
      if (!video || started) {
        return;
      }
      var stream = video.getAttribute('data-stream') || '';
      started = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      if (window.Hls && window.Hls.isSupported()) {
        playerInstance = new window.Hls({ maxBufferLength: 30 });
        playerInstance.loadSource(stream);
        playerInstance.attachMedia(video);
        playerInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setMessage('点击视频继续播放');
          });
        });
        playerInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage('播放服务暂时繁忙，请稍后重试');
          }
        });
      } else {
        video.src = stream;
        video.play().catch(function () {
          setMessage('点击视频继续播放');
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        beginPlay();
      });
    }

    if (cover) {
      cover.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
      if (!started) {
        beginPlay();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (playerInstance) {
        playerInstance.destroy();
      }
    });
  }
})();
