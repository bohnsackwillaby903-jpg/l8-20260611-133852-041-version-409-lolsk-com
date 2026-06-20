(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-play]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var loaded = false;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        loaded = true;
      }
    }

    function start() {
      attachStream();

      if (cover) {
        cover.hidden = true;
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (cover) {
            cover.hidden = false;
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.hidden = true;
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), setupPlayer);
  });
})();
