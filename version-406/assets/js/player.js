import { H as Hls } from './hls.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach(function (player) {
  const video = player.querySelector('video');
  const button = player.querySelector('.player-trigger');
  const stream = player.getAttribute('data-stream');
  let started = false;
  let hls = null;

  function start() {
    if (!video || !stream || started) {
      return;
    }

    started = true;
    if (button) {
      button.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.controls = true;
    video.play().catch(function () {
      started = false;
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
});
