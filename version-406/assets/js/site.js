(function () {
  const menuButton = document.querySelector('[data-mobile-menu]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    const dotsWrap = hero.querySelector('[data-hero-dots]');
    let current = 0;
    let timer = null;

    const dots = slides.map(function (_, index) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-dot';
      dot.setAttribute('aria-label', '切换到第' + (index + 1) + '屏');
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function show(index) {
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

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  const filterForms = Array.from(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (panel) {
    const scope = panel.parentElement || document;
    const search = panel.querySelector('[data-filter-search]');
    const year = panel.querySelector('[data-filter-year]');
    const region = panel.querySelector('[data-filter-region]');
    const type = panel.querySelector('[data-filter-type]');
    const count = panel.querySelector('[data-filter-count]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));

    function apply() {
      const q = (search && search.value ? search.value : '').trim().toLowerCase();
      const y = year && year.value ? year.value : '';
      const r = region && region.value ? region.value : '';
      const t = type && type.value ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.textContent
        ].join(' ').toLowerCase();
        const okSearch = !q || text.indexOf(q) !== -1;
        const okYear = !y || card.dataset.year === y;
        const okRegion = !r || card.dataset.region === r;
        const okType = !t || card.dataset.type === t;
        const ok = okSearch && okYear && okRegion && okType;
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [search, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery && search) {
      search.value = initialQuery;
    }

    apply();
  });
})();
