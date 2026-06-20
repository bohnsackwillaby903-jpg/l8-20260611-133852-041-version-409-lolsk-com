(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (slides.length === 0) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var root = document.querySelector('[data-filter-root]');
    if (!root) {
      return;
    }

    var input = root.querySelector('[data-filter-input]');
    var year = root.querySelector('[data-filter-year]');
    var region = root.querySelector('[data-filter-region]');
    var type = root.querySelector('[data-filter-type]');
    var category = root.querySelector('[data-filter-category]');
    var count = root.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.filter-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function matches(card, key, value) {
      if (!value) {
        return true;
      }
      return normalize(card.getAttribute('data-' + key)) === normalize(value);
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var ok = true;
        ok = ok && (!keyword || text.indexOf(keyword) !== -1);
        ok = ok && matches(card, 'year', year && year.value);
        ok = ok && matches(card, 'region', region && region.value);
        ok = ok && matches(card, 'type', type && type.value);
        ok = ok && matches(card, 'category', category && category.value);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [input, year, region, type, category].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    apply();
  }

  function initImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('[data-fallback-image]'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.remove();
      });
    });
  }

  function initShareButtons() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-share-button]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var title = button.getAttribute('data-share-title') || document.title;
        var url = window.location.href;
        if (navigator.share) {
          navigator.share({ title: title, url: url }).catch(function () {});
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = '链接已复制';
            window.setTimeout(function () {
              button.textContent = '分享影片';
            }, 1800);
          });
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initImageFallbacks();
    initShareButtons();
  });
})();
