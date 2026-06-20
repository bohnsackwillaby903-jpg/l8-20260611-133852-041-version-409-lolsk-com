
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilter(panel) {
    var root = panel.closest('main') || document;
    var input = panel.querySelector('[data-filter-input]');
    var reset = panel.querySelector('[data-filter-reset]');
    var status = panel.querySelector('[data-filter-status]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var selectedYear = '';
    var selectedChannel = '';

    function textOf(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-channel'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var matchesKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
        var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchesChannel = !selectedChannel || card.getAttribute('data-channel') === selectedChannel;
        var shouldShow = matchesKeyword && matchesYear && matchesChannel;

        card.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible ? '当前匹配 ' + visible + ' 部影片' : '未匹配到影片';
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query) {
        input.value = query;
      }

      input.addEventListener('input', applyFilter);
    }

    Array.prototype.slice.call(panel.querySelectorAll('[data-year-chip]')).forEach(function (button) {
      button.addEventListener('click', function () {
        selectedYear = button.classList.contains('is-active') ? '' : button.getAttribute('data-year-chip');

        Array.prototype.slice.call(panel.querySelectorAll('[data-year-chip]')).forEach(function (item) {
          item.classList.remove('is-active');
        });

        if (selectedYear) {
          button.classList.add('is-active');
        }

        applyFilter();
      });
    });

    Array.prototype.slice.call(panel.querySelectorAll('[data-channel-chip]')).forEach(function (button) {
      button.addEventListener('click', function () {
        selectedChannel = button.getAttribute('data-channel-chip') || '';

        Array.prototype.slice.call(panel.querySelectorAll('[data-channel-chip]')).forEach(function (item) {
          item.classList.remove('is-active');
        });

        button.classList.add('is-active');
        applyFilter();
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        selectedYear = '';
        selectedChannel = '';

        if (input) {
          input.value = '';
        }

        Array.prototype.slice.call(panel.querySelectorAll('.is-active')).forEach(function (item) {
          item.classList.remove('is-active');
        });

        applyFilter();
      });
    }

    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilter);
})();
