
(function () {
  function attachStream(video, streamUrl) {
    if (!video || !streamUrl || video.getAttribute('data-ready') === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.setAttribute('data-ready', 'true');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.setAttribute('data-ready', 'true');
      return;
    }

    video.src = streamUrl;
    video.setAttribute('data-ready', 'true');
  }

  function playVideo(frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('[data-play-button]');
    var streamUrl = frame.getAttribute('data-stream');

    attachStream(video, streamUrl);

    if (button) {
      button.classList.add('is-hidden');
    }

    if (video) {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-frame')).forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('[data-play-button]');

    if (button) {
      button.addEventListener('click', function () {
        playVideo(frame);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
    }
  });
})();
