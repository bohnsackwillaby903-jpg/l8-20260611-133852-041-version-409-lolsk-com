import { H as Hls } from './hls-library.js';

function attachPlayer(shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');

    if (!video || !button) {
        return;
    }

    const stream = video.getAttribute('data-stream');
    let ready = false;
    let hls = null;

    function loadVideo() {
        if (ready) {
            return Promise.resolve();
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, resolve);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        hls = null;
                        video.src = stream;
                        resolve();
                    }
                });
            });
        }

        video.src = stream;
        return Promise.resolve();
    }

    function play() {
        button.classList.add('hidden');
        video.setAttribute('controls', 'controls');
        loadVideo()
            .then(function () {
                return video.play();
            })
            .catch(function () {
                button.classList.remove('hidden');
                button.querySelector('strong').textContent = '点击继续播放';
            });
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
}

document.querySelectorAll('[data-player]').forEach(attachPlayer);
