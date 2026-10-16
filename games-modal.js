/* One shared controller for every Game Developer portfolio modal.
   Add a dialog with data-game-modal, matching aria-controls trigger,
   media buttons with data-game-media / data-video-src, and a close button.
   No game-specific JavaScript files are needed. */
(() => {
  const dialogs = document.querySelectorAll('dialog[data-game-modal]');
  if (!dialogs.length) return;

  dialogs.forEach(dialog => {
    if (typeof dialog.showModal !== 'function') return;

    const triggers = document.querySelectorAll(`[aria-controls="${dialog.id}"]`);
    const closeButton = dialog.querySelector('[data-game-close]');
    const stage = dialog.querySelector('.cookie-media-stage');
    const cover = stage?.querySelector('img');
    const player = stage?.querySelector('video');
    const options = [...dialog.querySelectorAll('[data-game-media]')];
    if (!triggers.length || !closeButton || !cover || !player || !options.length) return;

    function stopVideo() {
      player.pause();
      if (player.hasAttribute('src')) {
        player.removeAttribute('src');
        player.load();
      }
    }

    function showMedia(option) {
      if (!option) return;
      const key = option.dataset.gameMedia;
      stopVideo();
      const isCover = key === 'cover';
      cover.hidden = !isCover;
      player.hidden = isCover;
      options.forEach(item => {
        const selected = item === option;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      if (!isCover) {
        const videoSrc = option.dataset.videoSrc;
        if (!videoSrc) return;
        player.src = videoSrc;
        player.controls = true;
        player.playsInline = true;
        player.load();
        const result = player.play();
        // If autoplay is denied, visible native controls let visitors press Play.
        if (result && typeof result.catch === 'function') result.catch(() => {});
      }
    }

    function reset() {
      stopVideo();
      showMedia(options.find(item => item.dataset.gameMedia === 'cover'));
    }

    triggers.forEach(trigger => trigger.addEventListener('click', () => {
      if (!dialog.open) dialog.showModal();
      showMedia(options.find(item => item.dataset.gameMedia === 'cover'));
    }));
    options.forEach(option => option.addEventListener('click', () => showMedia(option)));
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    // Also runs for Escape, stopping hidden video playback.
    dialog.addEventListener('close', reset);
  });
})();
