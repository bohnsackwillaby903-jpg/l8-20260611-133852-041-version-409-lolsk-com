(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initPlayer(root) {
    var video = root.querySelector('video[data-video-src]');
    var playButton = root.querySelector('[data-play-toggle]');
    var status = root.querySelector('[data-player-status]');
    var hls = null;
    var loaded = false;

    if (!video) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function loadStream() {
      if (loaded) {
        return Promise.resolve();
      }

      var source = video.getAttribute('data-video-src');
      if (!source) {
        setStatus('没有可用播放源');
        return Promise.reject(new Error('missing video source'));
      }

      loaded = true;
      setStatus('正在初始化播放源…');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频加载失败，请稍后重试');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪');
        return Promise.resolve();
      }

      setStatus('当前浏览器不支持 HLS 播放');
      return Promise.reject(new Error('hls is not supported'));
    }

    function play() {
      loadStream().then(function () {
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {
            setStatus('点击播放器即可继续播放');
          });
        }
      });
    }

    if (playButton) {
      playButton.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      root.classList.add('is-playing');
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      root.classList.remove('is-playing');
      setStatus('已暂停');
    });

    video.addEventListener('ended', function () {
      root.classList.remove('is-playing');
      setStatus('播放结束');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]')).forEach(initPlayer);
  });
})();
